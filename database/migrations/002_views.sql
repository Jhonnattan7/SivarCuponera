-- ============================================================
-- LA CUPONERA — Vistas Públicas v2
-- Vistas para acceso público y dashboards
-- ============================================================

-- Vista pública de empresas: solo expone nombre y rubro
-- commission_pct, contact_name, phone y email NO son públicos
CREATE VIEW public.companies_public AS
SELECT
  c.id,
  c.name,
  c.code,
  cat.name AS category_name
FROM public.companies c
JOIN public.categories cat ON c.category_id = cat.id;


-- Ofertas activas para la interfaz pública
-- Aprobadas, vigentes hoy, con cupones disponibles
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


-- Resumen financiero por oferta para dashboards
-- Incluye display_category para clasificar en el frontend sin lógica adicional
CREATE VIEW public.offer_financials AS
WITH coupon_counts AS (
  SELECT offer_id, COUNT(*) AS sold
  FROM public.coupons
  GROUP BY offer_id
)
SELECT
  o.id                                                          AS offer_id,
  o.company_id,
  o.title,
  o.status,
  o.offer_price,
  o.regular_price,
  o.coupon_limit,
  o.start_date,
  o.end_date,
  o.coupon_expiry_date,
  o.description,
  o.other_details,
  o.rejection_reason,
  o.created_at,
  c.name                                                        AS company_name,
  c.commission_pct,
  cat.name                                                      AS category_name,
  COALESCE(cc.sold, 0)                                         AS coupons_sold,
  CASE
    WHEN o.coupon_limit IS NULL THEN NULL
    ELSE o.coupon_limit - COALESCE(cc.sold, 0)
  END                                                           AS coupons_available,
  COALESCE(cc.sold, 0) * o.offer_price                         AS total_revenue,
  COALESCE(cc.sold, 0) * o.offer_price * (c.commission_pct / 100) AS service_charge,
  CASE
    WHEN o.status = 'pending_approval'                           THEN 'pending_approval'
    WHEN o.status = 'rejected'                                   THEN 'rejected'
    WHEN o.status = 'discarded'                                  THEN 'discarded'
    WHEN o.status = 'approved' AND o.start_date > CURRENT_DATE  THEN 'approved_future'
    WHEN o.status = 'approved'
      AND CURRENT_DATE BETWEEN o.start_date AND o.end_date      THEN 'active'
    WHEN o.status = 'approved' AND o.end_date < CURRENT_DATE    THEN 'past'
  END                                                           AS display_category
FROM public.offers o
JOIN public.companies  c   ON o.company_id  = c.id
JOIN public.categories cat ON c.category_id = cat.id
LEFT JOIN coupon_counts cc ON cc.offer_id = o.id;
