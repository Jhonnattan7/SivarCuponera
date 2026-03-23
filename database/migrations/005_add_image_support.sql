-- ============================================================
-- LA CUPONERA — Soporte de Imágenes v5
-- Añade columna IMG a offers y actualiza la vista active_offers
-- =====================================================================

-- Agregar columna IMG a la tabla offers
ALTER TABLE public.offers
ADD COLUMN IMG TEXT;

-- Recrear vista active_offers para incluir IMG
DROP VIEW IF EXISTS public.active_offers CASCADE;

CREATE VIEW public.active_offers AS
WITH coupon_counts AS (
  SELECT offer_id, COUNT(*) AS sold
  FROM public.coupons
  WHERE status != 'expired'
  GROUP BY offer_id
)
SELECT
  o.id,
  o.company_id,
  o.title,
  o.regular_price,
  o.offer_price,
  o.start_date,
  o.end_date,
  o.coupon_expiry_date,
  o.coupon_limit,
  o.description,
  o.other_details,
  o.created_at,
  o.IMG,
  c.name                                     AS company_name,
  c.code                                     AS company_code,
  cat.name                                   AS category_name,
  COALESCE(cc.sold, 0)                       AS coupons_sold,
  CASE
    WHEN o.coupon_limit IS NULL THEN NULL
    ELSE o.coupon_limit - COALESCE(cc.sold, 0)
  END                                        AS coupons_available
FROM public.offers o
JOIN public.companies  c   ON o.company_id  = c.id
JOIN public.categories cat ON c.category_id = cat.id
LEFT JOIN coupon_counts cc ON cc.offer_id = o.id
WHERE
  o.status = 'approved'
  AND CURRENT_DATE BETWEEN o.start_date AND o.end_date
  AND (
    o.coupon_limit IS NULL
    OR COALESCE(cc.sold, 0) < o.coupon_limit
  );
