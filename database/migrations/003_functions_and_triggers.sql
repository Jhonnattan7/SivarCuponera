-- ============================================================
-- LA CUPONERA — Funciones y Triggers v3
-- Helper functions para RLS, generación de códigos y triggers
-- ============================================================

-- ============================================================
-- FUNCIONES HELPER PARA RLS
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================
-- FUNCIÓN: generar código de cupón único
-- Formato: company.code (6 chars) + 7 dígitos aleatorios.
-- Reintenta en loop hasta encontrar código no existente.
-- ============================================================

CREATE OR REPLACE FUNCTION public.generate_coupon_code()
RETURNS TRIGGER AS $$
DECLARE
  v_company_code TEXT;
  v_code         TEXT;
  v_exists       BOOLEAN;
BEGIN
  SELECT c.code INTO v_company_code
  FROM public.offers o
  JOIN public.companies c ON o.company_id = c.id
  WHERE o.id = NEW.offer_id;

  LOOP
    v_code := v_company_code || LPAD(FLOOR(RANDOM() * 10000000)::TEXT, 7, '0');
    SELECT EXISTS (
      SELECT 1 FROM public.coupons WHERE code = v_code
    ) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;

  NEW.code := v_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_set_coupon_code
  BEFORE INSERT ON public.coupons
  FOR EACH ROW
  WHEN (NEW.code IS NULL OR NEW.code = '')
  EXECUTE FUNCTION public.generate_coupon_code();


-- ============================================================
-- FUNCIÓN: comprar cupón de forma atómica
-- Verifica oferta activa y límite de cupones antes de insertar.
-- El frontend llama esta función vía RPC tras simular el pago.
-- Retorna el código del cupón generado.
-- ============================================================

CREATE OR REPLACE FUNCTION public.purchase_coupon(p_offer_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_offer       public.offers%ROWTYPE;
  v_sold        INTEGER;
  v_coupon_code TEXT;
BEGIN
  SELECT * INTO v_offer
  FROM public.offers
  WHERE id = p_offer_id
    AND status = 'approved'
    AND CURRENT_DATE BETWEEN start_date AND end_date
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'La oferta no está disponible.';
  END IF;

  IF v_offer.coupon_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_sold
    FROM public.coupons
    WHERE offer_id = p_offer_id AND status != 'expired';

    IF v_sold >= v_offer.coupon_limit THEN
      RAISE EXCEPTION 'Los cupones de esta oferta se han agotado.';
    END IF;
  END IF;

  INSERT INTO public.coupons (offer_id, client_id, code)
  VALUES (p_offer_id, auth.uid(), '')
  RETURNING code INTO v_coupon_code;

  RETURN v_coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- FUNCIÓN: marcar cupones vencidos
-- Llamar diariamente desde una Supabase Edge Function con schedule.
-- Retorna la cantidad de cupones marcados como expirados.
-- ============================================================

CREATE OR REPLACE FUNCTION public.expire_coupons()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.coupons
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'available'
    AND offer_id IN (
      SELECT id FROM public.offers
      WHERE coupon_expiry_date < CURRENT_DATE
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
