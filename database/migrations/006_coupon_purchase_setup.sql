-- ============================================================
-- LA CUPONERA — Compra de Cupones con Email y Timestamp v6
-- Añade campos client_email y transaction_at a coupons
-- Actualiza la función purchase_coupon para capturar estos datos
-- ============================================================

-- Agregar columnas a la tabla coupons
ALTER TABLE public.coupons
ADD COLUMN client_email TEXT,
ADD COLUMN transaction_at TIMESTAMPTZ;

-- Recrear función purchase_coupon para capturar email y timestamp
DROP FUNCTION IF EXISTS public.purchase_coupon(UUID);

CREATE OR REPLACE FUNCTION public.purchase_coupon(p_offer_id UUID)
RETURNS TABLE(codigo TEXT, correo TEXT) AS $$
DECLARE
  v_offer       public.offers%ROWTYPE;
  v_sold        INTEGER;
  v_coupon_code TEXT;
  v_client_email TEXT;
BEGIN
  -- Obtener la oferta con lock
  SELECT * INTO v_offer
  FROM public.offers
  WHERE id = p_offer_id
    AND status = 'approved'
    AND CURRENT_DATE BETWEEN start_date AND end_date
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'La oferta no está disponible.';
  END IF;

  -- Verificar límite de cupones
  IF v_offer.coupon_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_sold
    FROM public.coupons
    WHERE offer_id = p_offer_id AND status != 'expired';

    IF v_sold >= v_offer.coupon_limit THEN
      RAISE EXCEPTION 'Los cupones de esta oferta se han agotado.';
    END IF;
  END IF;

  -- Obtener email del usuario autenticado
  SELECT email INTO v_client_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Insertar cupón con email y timestamp
  INSERT INTO public.coupons (offer_id, client_id, code, client_email, transaction_at)
  VALUES (p_offer_id, auth.uid(), '', v_client_email, NOW())
  RETURNING coupons.code INTO v_coupon_code;

  -- Retornar código y email
  RETURN QUERY SELECT v_coupon_code, v_client_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
