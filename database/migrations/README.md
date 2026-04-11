# Migraciones de Base de Datos - LA CUPONERA

Este directorio contiene todas las migraciones SQL para la base de datos de LA CUPONERA en Supabase, organizadas de forma secuencial.

## Estructura de Migraciones

Las migraciones se ejecutan en orden numérico. Cada archivo contiene una fase específica del esquema de la base de datos.

### 001_initial_schema.sql
**Descripción**: Esquema base con tipos, tablas e índices
- Define tipos enumerados: `offer_status`, `coupon_status`, `user_role`
- Crea tablas: `categories`, `companies`, `profiles`, `offers`, `coupons`
- Define constraints e índices de rendimiento
- **Ejecutar primero**: ✅ REQUERIDO

### 002_views.sql
**Descripción**: Vistas públicas para acceso de datos
- `companies_public`: Exposición pública de empresas (sin datos sensibles)
- `active_offers`: Ofertas vigentes con conteo de cupones disponibles
- `offer_financials`: Resumen financiero por oferta para dashboards
- **Dependencias**: Requiere `001_initial_schema.sql`

### 003_functions_and_triggers.sql
**Descripción**: Funciones helper, generación de códigos y triggers
- Funciones RLS: `get_user_role()`, `get_user_company_id()`
- `generate_coupon_code()`: Genera códigos únicos con formato compañía + 7 dígitos
- `purchase_coupon()`: RPC para compra atómica de cupones
- `expire_coupons()`: Marca cupones expirados (uso diario)
- Triggers: `update_updated_at()` en todas las tablas
- **Dependencias**: Requiere `001_initial_schema.sql`

### 004_row_level_security.sql
**Descripción**: Políticas de seguridad a nivel de fila (RLS)
- Activa RLS en todas las tablas
- Políticas para `categories`: lectura pública, admin CRU
- Políticas para `companies`: admin total, company_admin/employee acceso propio
- Políticas para `profiles`: cada usuario accede su perfil, admin total
- Políticas para `offers`: admin total, company_admin gestión propia
- Políticas para `coupons`: cliente ve propios, company_admin ve de sus ofertas, admin total
- **Dependencias**: Requiere `003_functions_and_triggers.sql`

### 005_add_image_support.sql
**Descripción**: Soporte de imágenes en ofertas
- Añade columna `IMG` a tabla `offers`
- Actualiza vista `active_offers` para incluir campo IMG
- **Dependencias**: Requiere `002_views.sql` y `001_initial_schema.sql`

### 006_coupon_purchase_setup.sql
**Descripción**: Captura de email y timestamp en compra de cupones
- Añade columnas `client_email` y `transaction_at` a tabla `coupons`
- Actualiza función `purchase_coupon()` para capturar email del usuario autenticado y timestamp
- **Dependencias**: Requiere `003_functions_and_triggers.sql`

### 007_add_product_name.sql
**Descripción**: Nombre del producto en cupones
- Añade columna `product_name` a tabla `coupons`
- Actualiza función `purchase_coupon()` para capturar el título de la oferta
- **Dependencias**: Requiere `006_coupon_purchase_setup.sql`

### 008_seed_test_data.sql
**Descripción**: Datos de prueba (4 empresas y 4 ofertas)
- Inserta 5 categorías: Comida y Bebida, Electrónica, Ropa, Salud, Entretenimiento
- Inserta 4 empresas: Starbucks, Walmart, RadioShack, Sportline
- Inserta 4 ofertas asociadas (estado: approved, vigentes 30+ días)
- **Dependencias**: Requiere `005_add_image_support.sql`
- **Nota**: Usar con cuidado - contiene datos transitorios de prueba

### 009_fix_client_coupon_visibility.sql
**Descripción**: Corrige visibilidad de cupones para cuentas cliente
- Agrega política `offers_client_coupon_related_select`
- Agrega política `companies_client_coupon_related_select`
- Permite resolver joins `coupons -> offers -> companies` solo para cupones propios
- **Dependencias**: Requiere `004_row_level_security.sql`

### 010_storage_offer_images_rls.sql
**Descripción**: Configuración de Storage para imágenes de ofertas
- Crea/actualiza bucket `offers-images` (público, 5 MB, MIME restringidos)
- Agrega políticas RLS en `storage.objects` para `company_admin`
- Restringe escritura por carpeta con prefijo `company_id/`
- **Dependencias**: Requiere `003_functions_and_triggers.sql` (usa `get_user_role()` y `get_user_company_id()`)

## Orden de Ejecución Requerido

```
1. 001_initial_schema.sql
2. 002_views.sql
3. 003_functions_and_triggers.sql
4. 004_row_level_security.sql
5. 005_add_image_support.sql
6. 006_coupon_purchase_setup.sql
7. 007_add_product_name.sql
8. 008_seed_test_data.sql (OPCIONAL - solo para desarrollo/prueba)
9. 009_fix_client_coupon_visibility.sql
10. 010_storage_offer_images_rls.sql
```

## Cómo Aplicar las Migraciones

### Opción 1: Supabase Studio SQL Editor
1. Abre [Supabase Dashboard](https://supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Copia y pega el contenido de cada archivo en orden
5. Ejecuta cada migración

### Opción 2: Línea de Comandos (con Supabase CLI)
```bash
# Instalar CLI si no lo has hecho
npm install -g @supabase/cli

# Aplicar migraciones
supabase db push --dry-run  # Ver cambios propuestos
supabase db push             # Aplicar migraciones
```

### Opción 3: Desde psql (conexión directa PostgreSQL)
```bash
# Conexión directa a la BD Supabase
psql -h db.twicegsupabase.co -U postgres -d postgres < 001_initial_schema.sql
psql -h db.twicegsupabase.co -U postgres -d postgres < 002_views.sql
# ... etc
```

## Verificación Post-Migraciones

Después de ejecutar todas las migraciones, verifica:

```sql
-- Verifica que todas las tablas existan
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verifica vistas
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' 
ORDER BY viewname;

-- Verifica funciones
SELECT proname FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- Verifica RLS está activo
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```

## Rollback (Reversión)

Si necesitas revertir una migración específica:

1. **Eliminar políticas RLS**:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

2. **Eliminar vistas**:
```sql
DROP VIEW IF EXISTS view_name CASCADE;
```

3. **Eliminar funciones/triggers**:
```sql
DROP TRIGGER IF EXISTS trigger_name ON table_name;
DROP FUNCTION IF EXISTS function_name();
```

4. **Eliminar columnas**:
```sql
ALTER TABLE table_name DROP COLUMN column_name;
```

5. **Eliminar tablas** (último recurso):
```sql
DROP TABLE IF EXISTS table_name CASCADE;
```

## Notas Importantes

- ⚠️ **NO elimines `supabase-schema.sql` del root** - sirve como referencia principal
- 📝 Cada migración es **idempotente** donde sea posible (`ON CONFLICT`, `IF NOT EXISTS`)
- 🔐 Las políticas RLS son críticas para seguridad - revisa antes de desplegar a producción
- 🧪 `008_seed_test_data.sql` es **solo para desarrollo** - no usar en producción
- 📊 Monitorea performances en `offer_financials` si hay muchas ofertas/cupones

## Cambios Recientes

### v9 (Actual)
- Fix de visibilidad de cupones para usuarios cliente
- Políticas de lectura limitada para offers/companies relacionadas con cupones propios

### v10 (Actual)
- Configuración de bucket y políticas RLS para subida de imágenes de ofertas por empresa
- Control de acceso por rol y carpeta `company_id/`

### v8 (Actual)
- Migraciones organizadas en carpeta `database/migrations/`
- Separación de concerns: schema, views, functions, RLS, features, data
- Documentación completa de dependencias

### v7
- Añadida captura de `product_name` en cupones

### v6
- Añadida captura de `client_email` y `transaction_at`

### v5
- Soporte de imágenes con columna `IMG`

## Contribuciones

Cuando añadas nuevas migraciones:
1. Asigna número secuencial siguiente (ej: `009_feature_name.sql`)
2. Documenta dependencias en este README
3. Incluye comentarios de cabecera explicando el propósito
4. Usa `ON CONFLICT DO NOTHING` para idempotencia cuando sea posible
5. Sigue convención de nombres: `NNN_descripcion_clara.sql`

## Soporte

Para consultas sobre la estructura de la base de datos, revisa:
- [Documentación Supabase PostgreSQL](https://supabase.com/docs/guides/database)
- [Políticas RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions para Cron](https://supabase.com/docs/guides/functions)
