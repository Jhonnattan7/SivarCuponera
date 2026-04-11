-- ============================================================
-- LA CUPONERA — Esquema definitivo v4 PostgreSQL / Supabase
-- ============================================================

-- ============================================================
-- TIPOS ENUMERADOS
-- ============================================================

CREATE TYPE public.offer_status AS ENUM (
  'pending_approval',
  'approved',
  'rejected',
  'discarded'
);

CREATE TYPE public.coupon_status AS ENUM (
  'available',
  'redeemed',
  'expired'
);

CREATE TYPE public.user_role AS ENUM (
  'admin',
  'company_admin',
  'company_employee',
  'client'
);


-- ============================================================
-- RUBROS
-- Gestionados por el admin de La Cuponera (CRUD completo).
-- ============================================================

CREATE TABLE public.categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- EMPRESAS OFERTANTES
-- Registradas por el admin de La Cuponera.
-- El correo de la empresa es el que usa el company_admin
-- para iniciar sesión → coincide con auth.users.email.
-- ============================================================

CREATE TABLE public.companies (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT         NOT NULL,
  code           CHAR(6)      NOT NULL UNIQUE,
  address        TEXT         NOT NULL,
  contact_name   TEXT         NOT NULL,
  phone          TEXT         NOT NULL,
  email          TEXT         NOT NULL UNIQUE,
  category_id    UUID         NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  commission_pct NUMERIC(5,2) NOT NULL CHECK (commission_pct >= 0 AND commission_pct <= 100),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_company_code CHECK (code ~ '^[A-Za-z]{3}[0-9]{3}$')
);


-- ============================================================
-- PERFILES DE USUARIO
-- Extiende auth.users. Un perfil por cada usuario autenticado.
-- El email NO se almacena aquí. Se obtiene de auth.users
-- a través de la sesión activa en el frontend.
--
-- Campos por rol:
--   admin            → first_name, last_name
--   company_admin    → first_name, last_name, company_id
--   company_employee → first_name, last_name, company_id
--   client           → first_name, last_name, phone, address, dui
-- ============================================================

CREATE TABLE public.profiles (
  id         UUID       PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       user_role  NOT NULL,
  company_id UUID       REFERENCES public.companies(id) ON DELETE SET NULL,
  first_name TEXT       NOT NULL,
  last_name  TEXT       NOT NULL,
  phone      TEXT,
  address    TEXT,
  dui        TEXT       UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_client_dui CHECK (
    role != 'client' OR dui IS NOT NULL
  ),
  CONSTRAINT chk_client_phone CHECK (
    role != 'client' OR phone IS NOT NULL
  ),
  CONSTRAINT chk_client_address CHECK (
    role != 'client' OR address IS NOT NULL
  ),
  CONSTRAINT chk_company_users CHECK (
    role NOT IN ('company_admin', 'company_employee') OR company_id IS NOT NULL
  )
);


-- ============================================================
-- OFERTAS
-- ============================================================

CREATE TABLE public.offers (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID         NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  title              TEXT         NOT NULL,
  regular_price      NUMERIC(10,2) NOT NULL CHECK (regular_price > 0),
  offer_price        NUMERIC(10,2) NOT NULL CHECK (offer_price > 0),
  start_date         DATE         NOT NULL,
  end_date           DATE         NOT NULL,
  coupon_expiry_date DATE         NOT NULL,
  coupon_limit       INTEGER      CHECK (coupon_limit > 0),
  description        TEXT         NOT NULL,
  other_details      TEXT,
  status             offer_status NOT NULL DEFAULT 'pending_approval',
  rejection_reason   TEXT,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_offer_price      CHECK (offer_price < regular_price),
  CONSTRAINT chk_offer_dates      CHECK (end_date >= start_date),
  CONSTRAINT chk_coupon_expiry    CHECK (coupon_expiry_date >= end_date),
  CONSTRAINT chk_rejection_reason CHECK (
    status != 'rejected' OR rejection_reason IS NOT NULL
  )
);


-- ============================================================
-- CUPONES
-- ============================================================

CREATE TABLE public.coupons (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id    UUID          NOT NULL REFERENCES public.offers(id) ON DELETE RESTRICT,
  client_id   UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code        TEXT          NOT NULL UNIQUE,
  status      coupon_status NOT NULL DEFAULT 'available',
  redeemed_by UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_redeemed CHECK (
    status != 'redeemed'
    OR (redeemed_at IS NOT NULL)
  )
);


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_companies_category ON public.companies(category_id);
CREATE INDEX idx_profiles_role      ON public.profiles(role);
CREATE INDEX idx_profiles_company   ON public.profiles(company_id);
CREATE INDEX idx_offers_company     ON public.offers(company_id);
CREATE INDEX idx_offers_status      ON public.offers(status);
CREATE INDEX idx_offers_dates       ON public.offers(start_date, end_date);
CREATE INDEX idx_coupons_offer      ON public.coupons(offer_id);
CREATE INDEX idx_coupons_client     ON public.coupons(client_id);
CREATE INDEX idx_coupons_status     ON public.coupons(status);
CREATE INDEX idx_coupons_code       ON public.coupons(code);


-- ============================================================
-- VISTAS
-- ============================================================

-- Vista pública de empresas: solo expone nombre y rubro.
-- commission_pct, contact_name, phone y email NO son públicos.
CREATE VIEW public.companies_public AS
SELECT
  c.id,
  c.name,
  c.code,
  cat.name AS category_name
FROM public.companies c
JOIN public.categories cat ON c.category_id = cat.id;


-- Ofertas activas para la interfaz pública.
-- Aprobadas, vigentes hoy, con cupones disponibles.
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


-- Resumen financiero por oferta para dashboards.
-- Incluye display_category para clasificar en el frontend
-- sin lógica adicional.
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


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons     ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------

CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "categories_admin_insert"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "categories_admin_update"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.get_user_role() = 'admin');

CREATE POLICY "categories_admin_delete"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.get_user_role() = 'admin');


-- ------------------------------------------------------------
-- COMPANIES
-- Los datos sensibles (commission_pct, contact_name, phone,
-- email) solo son visibles para usuarios autenticados con rol
-- apropiado. El público accede a través de companies_public.
-- ------------------------------------------------------------

CREATE POLICY "companies_admin_all"
  ON public.companies FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "companies_own_read"
  ON public.companies FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() IN ('company_admin', 'company_employee')
    AND id = public.get_user_company_id()
  );


-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------

CREATE POLICY "profiles_own_read"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_admin_read"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'admin');

CREATE POLICY "profiles_company_admin_read_employees"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() = 'company_admin'
    AND role = 'company_employee'
    AND company_id = public.get_user_company_id()
  );

CREATE POLICY "profiles_own_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_admin_insert"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "profiles_company_admin_insert_employee"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role() = 'company_admin'
    AND role = 'company_employee'
    AND company_id = public.get_user_company_id()
  );

CREATE POLICY "profiles_client_self_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (
    id = auth.uid()
    AND role = 'client'
  );

CREATE POLICY "profiles_admin_delete"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.get_user_role() = 'admin');

CREATE POLICY "profiles_company_admin_delete_employee"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (
    public.get_user_role() = 'company_admin'
    AND role = 'company_employee'
    AND company_id = public.get_user_company_id()
  );


-- ------------------------------------------------------------
-- OFFERS
-- ------------------------------------------------------------

-- Público ve ofertas aprobadas y vigentes
CREATE POLICY "offers_public_read_active"
  ON public.offers FOR SELECT
  USING (
    status = 'approved'
    AND CURRENT_DATE BETWEEN start_date AND end_date
  );

-- Admin lee todas las ofertas
CREATE POLICY "offers_admin_read"
  ON public.offers FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'admin');

-- Admin aprueba o rechaza (puede cambiar status a cualquier valor)
CREATE POLICY "offers_admin_update"
  ON public.offers FOR UPDATE
  TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- company_admin lee todas las ofertas de su empresa
CREATE POLICY "offers_company_admin_read"
  ON public.offers FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() = 'company_admin'
    AND company_id = public.get_user_company_id()
  );

-- company_admin crea ofertas (siempre inician en pending_approval)
CREATE POLICY "offers_company_admin_insert"
  ON public.offers FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role() = 'company_admin'
    AND company_id = public.get_user_company_id()
    AND status = 'pending_approval'
  );

-- company_admin edita sus ofertas.
-- USING: solo puede editar ofertas que estén en estados editables.
-- WITH CHECK: solo puede dejar la oferta en pending_approval o discarded.
-- No puede aprobarse a sí mismo.
CREATE POLICY "offers_company_admin_update"
  ON public.offers FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role() = 'company_admin'
    AND company_id = public.get_user_company_id()
    AND status IN ('pending_approval', 'rejected', 'discarded')
  )
  WITH CHECK (
    public.get_user_role() = 'company_admin'
    AND company_id = public.get_user_company_id()
    AND status IN ('pending_approval', 'discarded')
  );

-- company_employee lee ofertas de su empresa (para canje)
CREATE POLICY "offers_company_employee_read"
  ON public.offers FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() = 'company_employee'
    AND company_id = public.get_user_company_id()
  );


-- ------------------------------------------------------------
-- COUPONS
-- La compra de cupones se realiza exclusivamente a través de
-- la función purchase_coupon() (SECURITY DEFINER).
-- No se permite INSERT directo.
-- ------------------------------------------------------------

-- Cliente lee sus propios cupones
CREATE POLICY "coupons_client_read_own"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() = 'client'
    AND client_id = auth.uid()
  );

-- Empleado lee cupones de su empresa para validar en canje
CREATE POLICY "coupons_employee_read"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() = 'company_employee'
    AND EXISTS (
      SELECT 1 FROM public.offers o
      WHERE o.id = offer_id
        AND o.company_id = public.get_user_company_id()
    )
  );

-- Empleado canjea cupones de su empresa
CREATE POLICY "coupons_employee_update_redeem"
  ON public.coupons FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role() = 'company_employee'
    AND status = 'available'
    AND EXISTS (
      SELECT 1 FROM public.offers o
      WHERE o.id = offer_id
        AND o.company_id = public.get_user_company_id()
    )
  )
  WITH CHECK (
    status = 'redeemed'
  );

-- Admin lee todos los cupones
CREATE POLICY "coupons_admin_read"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'admin');

-- Corregir las vistas
ALTER VIEW public.active_offers SET (security_invoker = true);
ALTER VIEW public.offer_financials SET (security_invoker = true);
ALTER VIEW public.companies_public SET (security_invoker = true);

-- Corregir las funciones
ALTER FUNCTION public.get_user_role() SET search_path = public;
ALTER FUNCTION public.get_user_company_id() SET search_path = public;
ALTER FUNCTION public.generate_coupon_code() SET search_path = public;
ALTER FUNCTION public.purchase_coupon(UUID) SET search_path = public;
ALTER FUNCTION public.expire_coupons() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;
