# Migraciones de Base de Datos

## Ubicacion

Las migraciones SQL del proyecto estan en:

- [database/migrations](../database/migrations)

## Orden recomendado

1. 001_initial_schema.sql
2. 002_views.sql
3. 003_functions_and_triggers.sql
4. 004_row_level_security.sql
5. 005_add_image_support.sql
6. 006_coupon_purchase_setup.sql
7. 007_add_product_name.sql
8. 008_seed_test_data.sql (opcional en desarrollo)
9. 010_storage_offer_images_rls.sql
10. 011_rls_alignment_and_view_security.sql

## Verificar si la 011 ya esta aplicada

Si no tienes historial de migraciones por CLI, valida por efectos en base de datos:

```sql
-- Politicas esperadas en profiles y offers
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'offers')
ORDER BY tablename, policyname;

-- Vistas con security_invoker
SELECT c.relname AS view_name, c.reloptions
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'v'
  AND c.relname IN ('active_offers', 'offer_financials', 'companies_public')
ORDER BY c.relname;
```

Si faltan estas configuraciones, aplica la 011.

## Aplicar solo la 011 desde Dashboard web

1. Abrir Supabase Dashboard.
2. Entrar a SQL Editor.
3. Copiar contenido de [database/migrations/011_rls_alignment_and_view_security.sql](../database/migrations/011_rls_alignment_and_view_security.sql).
4. Ejecutar Run.
5. Correr las consultas de verificacion anteriores.

## Aplicar migraciones con Supabase CLI

En este proyecto ya tienes CLI disponible via npx.

### 1) Login

```bash
npx supabase login
```

### 2) Link al proyecto

```bash
npx supabase link --project-ref TU_PROJECT_REF
```

### 3) Ver migraciones remotas/locales

```bash
npx supabase migration list --linked
```

### 4) Aplicar pendientes

```bash
npx supabase migration up
```

Nota: Si usaste SQL Editor manualmente desde el inicio, puede que no exista historial completo en tabla de migraciones CLI. En ese caso usa verificacion por objetos y politicas.
