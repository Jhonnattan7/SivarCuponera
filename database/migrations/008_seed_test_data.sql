-- ============================================================
-- LA CUPONERA — Datos de Prueba: Empresas y Ofertas v8
-- Inserta 4 empresas de prueba y 4 ofertas correspondientes
-- ============================================================

-- CATEGORÍAS (si no existen)
INSERT INTO public.categories (name) VALUES ('Comida y Bebida')
ON CONFLICT (name) DO NOTHING;
INSERT INTO public.categories (name) VALUES ('Electrónica')
ON CONFLICT (name) DO NOTHING;
INSERT INTO public.categories (name) VALUES ('Ropa y Accesorios')
ON CONFLICT (name) DO NOTHING;
INSERT INTO public.categories (name) VALUES ('Salud y Belleza')
ON CONFLICT (name) DO NOTHING;
INSERT INTO public.categories (name) VALUES ('Entretenimiento')
ON CONFLICT (name) DO NOTHING;

-- EMPRESAS
INSERT INTO public.companies (name, code, address, contact_name, phone, email, category_id, commission_pct)
SELECT 'Starbucks', 'STB001', 'San Salvador', 'Juan García', '2222-2222', 'starbucks@cuponera.sv', id, 15
FROM public.categories WHERE name = 'Comida y Bebida'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.companies (name, code, address, contact_name, phone, email, category_id, commission_pct)
SELECT 'Walmart', 'WAL001', 'San Salvador', 'Carlos Martínez', '2444-4444', 'walmart@cuponera.sv', id, 12
FROM public.categories WHERE name = 'Comida y Bebida'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.companies (name, code, address, contact_name, phone, email, category_id, commission_pct)
SELECT 'RadioShack', 'RAD001', 'San Salvador', 'Ana Rodríguez', '2555-5555', 'radioshack@cuponera.sv', id, 18
FROM public.categories WHERE name = 'Electrónica'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.companies (name, code, address, contact_name, phone, email, category_id, commission_pct)
SELECT 'Sportline', 'SPO001', 'San Salvador', 'Pedro Pérez', '2666-6666', 'sportline@cuponera.sv', id, 16
FROM public.categories WHERE name = 'Ropa y Accesorios'
ON CONFLICT (code) DO NOTHING;


-- Oferta 1: Starbucks
INSERT INTO public.offers (
  company_id, title, regular_price, offer_price, start_date, end_date, coupon_expiry_date,
  coupon_limit, description, status, IMG
)
SELECT id, 'Café Premium Americano', 3.50, 2.50, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '45 days', 100,
  'Disfruta de nuestro café premium americano a precio especial', 'approved',
  'starbucks-cafe.jpg'
FROM public.companies WHERE code = 'STB001'
ON CONFLICT DO NOTHING;

-- Oferta 2: Walmart
INSERT INTO public.offers (
  company_id, title, regular_price, offer_price, start_date, end_date, coupon_expiry_date,
  coupon_limit, description, status, IMG
)
SELECT id, 'Compra en Abarrotes - 15% Descuento', 100.00, 85.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days',
  CURRENT_DATE + INTERVAL '75 days', 200,
  'Obtén 15% de descuento en tu compra de abarrotes', 'approved',
  'walmart-abarrotes.jpg'
FROM public.companies WHERE code = 'WAL001'
ON CONFLICT DO NOTHING;

-- Oferta 3: RadioShack
INSERT INTO public.offers (
  company_id, title, regular_price, offer_price, start_date, end_date, coupon_expiry_date,
  coupon_limit, description, status, IMG
)
SELECT id, 'Accesorios Electrónicos en Oferta', 250.00, 199.99, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '45 days', 75,
  'Descuentos especiales en accesorios y gadgets electrónicos', 'approved',
  'radioshack-gadgets.jpg'
FROM public.companies WHERE code = 'RAD001'
ON CONFLICT DO NOTHING;

-- Oferta 4: Sportline
INSERT INTO public.offers (
  company_id, title, regular_price, offer_price, start_date, end_date, coupon_expiry_date,
  coupon_limit, description, status, IMG
)
SELECT id, 'Ropa Deportiva - Liquidación', 120.00, 84.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days',
  CURRENT_DATE + INTERVAL '60 days', 100,
  'Liquidación de ropa deportiva con descuentos de hasta 30%', 'approved',
  'sportline-deportivo.jpg'
FROM public.companies WHERE code = 'SPO001'
ON CONFLICT DO NOTHING;
