-- ============================================================
-- LA CUPONERA — Nombre del Producto en Cupones v7
-- Añade columna product_name a coupons
-- Actualiza la función purchase_coupon para capturar el nombre del producto
-- ============================================================

-- Agregar columna product_name a la tabla coupons
ALTER TABLE public.coupons
ADD COLUMN product_name TEXT;

-- Recrear función purchase_coupon para capturar email, timestamp y product_name
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

  -- Insertar cupón con email, timestamp y product_name
  INSERT INTO public.coupons (offer_id, client_id, code, client_email, transaction_at, product_name)
  VALUES (p_offer_id, auth.uid(), '', v_client_email, NOW(), v_offer.title)
  RETURNING coupons.code INTO v_coupon_code;

  -- Retornar código y email
  RETURN QUERY SELECT v_coupon_code, v_client_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
