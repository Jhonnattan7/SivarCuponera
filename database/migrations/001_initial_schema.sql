-- ============================================================
-- LA CUPONERA — Esquema Inicial v1
-- Creación de tipos, tablas, índices y vistas base
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
-- TABLAS BASE
-- ============================================================

-- RUBROS: Gestionados por el admin de La Cuponera
CREATE TABLE public.categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- EMPRESAS OFERTANTES
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

-- PERFILES DE USUARIO: Extiende auth.users
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

-- OFERTAS
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

-- CUPONES
CREATE TABLE public.coupons (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id    UUID          NOT NULL REFERENCES public.offers(id) ON DELETE RESTRICT,
  client_id   UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  code        TEXT          NOT NULL UNIQUE,
  status      coupon_status NOT NULL DEFAULT 'available',
  redeemed_by UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_redeemed CHECK (
    status != 'redeemed'
    OR (redeemed_by IS NOT NULL AND redeemed_at IS NOT NULL)
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
