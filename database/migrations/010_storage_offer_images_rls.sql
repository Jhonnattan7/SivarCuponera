-- ============================================================
-- LA CUPONERA — Storage RLS para imágenes de ofertas v10
-- Crea/ajusta bucket offers-images y políticas para company_admin.
-- ============================================================

-- 1) Bucket público para servir imágenes por URL pública.
-- Modo conservador: si ya existe, no se sobrescribe configuración ajena.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'offers-images',
  'offers-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2) Políticas RLS sobre storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'offers_images_public_read'
  ) THEN
    CREATE POLICY "offers_images_public_read"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'offers-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'offers_images_company_admin_insert'
  ) THEN
    CREATE POLICY "offers_images_company_admin_insert"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'offers-images'
        AND public.get_user_role() = 'company_admin'
        AND (storage.foldername(name))[1] = public.get_user_company_id()::text
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'offers_images_company_admin_update'
  ) THEN
    CREATE POLICY "offers_images_company_admin_update"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'offers-images'
        AND owner = auth.uid()
        AND public.get_user_role() = 'company_admin'
        AND (storage.foldername(name))[1] = public.get_user_company_id()::text
      )
      WITH CHECK (
        bucket_id = 'offers-images'
        AND owner = auth.uid()
        AND public.get_user_role() = 'company_admin'
        AND (storage.foldername(name))[1] = public.get_user_company_id()::text
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'offers_images_company_admin_delete'
  ) THEN
    CREATE POLICY "offers_images_company_admin_delete"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'offers-images'
        AND owner = auth.uid()
        AND public.get_user_role() = 'company_admin'
        AND (storage.foldername(name))[1] = public.get_user_company_id()::text
      );
  END IF;
END $$;
