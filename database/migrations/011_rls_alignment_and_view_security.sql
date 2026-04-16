-- ============================================================
-- LA CUPONERA — Alineacion RLS + Seguridad de Vistas v11
-- Objetivo:
-- 1) Alinear politicas de profiles con el esquema consolidado
-- 2) Habilitar lectura publica controlada de ofertas activas
-- 3) Forzar security_invoker en vistas publicas
-- ============================================================

-- ------------------------------------------------------------
-- PROFILES: politicas faltantes para flujo real de negocio
-- ------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_client_self_insert'
  ) THEN
    CREATE POLICY "profiles_client_self_insert"
      ON public.profiles FOR INSERT
      TO authenticated
      WITH CHECK (
        id = auth.uid()
        AND role = 'client'
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_company_admin_insert_employee'
  ) THEN
    CREATE POLICY "profiles_company_admin_insert_employee"
      ON public.profiles FOR INSERT
      TO authenticated
      WITH CHECK (
        public.get_user_role() = 'company_admin'
        AND role = 'company_employee'
        AND company_id = public.get_user_company_id()
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_company_admin_delete_employee'
  ) THEN
    CREATE POLICY "profiles_company_admin_delete_employee"
      ON public.profiles FOR DELETE
      TO authenticated
      USING (
        public.get_user_role() = 'company_admin'
        AND role = 'company_employee'
        AND company_id = public.get_user_company_id()
      );
  END IF;
END $$;

-- ------------------------------------------------------------
-- OFFERS: lectura publica minima para vistas con security_invoker
-- ------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'offers'
      AND policyname = 'offers_public_read_active'
  ) THEN
    CREATE POLICY "offers_public_read_active"
      ON public.offers FOR SELECT
      USING (
        status = 'approved'
        AND CURRENT_DATE BETWEEN start_date AND end_date
      );
  END IF;
END $$;

-- ------------------------------------------------------------
-- VISTAS: ejecutar como invoker para respetar RLS
-- ------------------------------------------------------------

ALTER VIEW IF EXISTS public.active_offers SET (security_invoker = true);
ALTER VIEW IF EXISTS public.offer_financials SET (security_invoker = true);
ALTER VIEW IF EXISTS public.companies_public SET (security_invoker = true);

-- ------------------------------------------------------------
-- FUNCIONES: search_path explicito por seguridad
-- ------------------------------------------------------------

ALTER FUNCTION public.get_user_role() SET search_path = public;
ALTER FUNCTION public.get_user_company_id() SET search_path = public;
ALTER FUNCTION public.generate_coupon_code() SET search_path = public;
ALTER FUNCTION public.purchase_coupon(UUID) SET search_path = public;
ALTER FUNCTION public.expire_coupons() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;
