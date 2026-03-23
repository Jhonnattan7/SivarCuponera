-- ============================================================
-- LA CUPONERA — Row Level Security (RLS) v4
-- Políticas de acceso a nivel de fila
-- ============================================================

ALTER TABLE public.categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons     ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- CATEGORIES
-- ============================================================

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


-- ============================================================
-- COMPANIES
-- Los datos sensibles (commission_pct, contact_name, phone,
-- email) solo son visibles para usuarios autenticados con rol
-- apropiado. El público accede a través de companies_public.
-- ============================================================

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

CREATE POLICY "companies_own_update"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role() = 'company_admin'
    AND id = public.get_user_company_id()
  )
  WITH CHECK (
    public.get_user_role() = 'company_admin'
    AND id = public.get_user_company_id()
  );


-- ============================================================
-- PROFILES
-- ============================================================

CREATE POLICY "profiles_own_read"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_own_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');


-- ============================================================
-- OFFERS
-- ============================================================

CREATE POLICY "offers_admin_all"
  ON public.offers FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "offers_company_own_edit"
  ON public.offers FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role() = 'company_admin'
    AND company_id = public.get_user_company_id()
  )
  WITH CHECK (
    public.get_user_role() = 'company_admin'
    AND company_id = public.get_user_company_id()
  );

CREATE POLICY "offers_company_own_insert"
  ON public.offers FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role() = 'company_admin'
    AND company_id = public.get_user_company_id()
  );

CREATE POLICY "offers_company_own_select"
  ON public.offers FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() IN ('company_admin', 'company_employee')
    AND company_id = public.get_user_company_id()
  );


-- ============================================================
-- COUPONS
-- El cliente solo puede ver sus propios cupones.
-- El admin de la empresa puede ver todos los cupones de sus ofertas.
-- ============================================================

CREATE POLICY "coupons_client_own"
  ON public.coupons FOR ALL
  TO authenticated
  USING (
    public.get_user_role() = 'client'
    AND client_id = auth.uid()
  )
  WITH CHECK (
    public.get_user_role() = 'client'
    AND client_id = auth.uid()
  );

CREATE POLICY "coupons_company_admin_view"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (
    public.get_user_role() IN ('company_admin', 'company_employee')
    AND offer_id IN (
      SELECT id FROM public.offers
      WHERE company_id = public.get_user_company_id()
    )
  );

CREATE POLICY "coupons_admin_all"
  ON public.coupons FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');
