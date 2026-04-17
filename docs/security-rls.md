# Seguridad y RLS

## Principio

El control de acceso principal se implementa con Row Level Security (RLS) en PostgreSQL/Supabase.

## Tablas con RLS

- `categories`
- `companies`
- `profiles`
- `offers`
- `coupons`

## Storage con RLS

El proyecto usa el bucket `offers-images` para imagenes de ofertas.

Controles documentados:

- Escritura restringida por rol interno autorizado.
- Ruta de objetos por prefijo de empresa (`company_id/...`).
- Limite de tamano configurado en bucket (5 MB).
- Tipos MIME permitidos para imagenes (JPG/PNG/WEBP).

Referencia de migracion:

- [../database/migrations/010_storage_offer_images_rls.sql](../database/migrations/010_storage_offer_images_rls.sql)

## Reglas generales

- Publico: solo datos y vistas permitidas.
- `admin`: gestion global.
- `company_admin`: alcance a su empresa.
- `company_employee`: lectura/canje segun empresa.
- `client`: acceso solo a datos propios.

## Politicas a validar

- Lectura publica controlada en ofertas aprobadas/activas.
- Insercion y modificacion de perfiles por rol permitido.
- Actualizacion de cupones solo por personal autorizado.
- Restricciones por `company_id` para roles internos.
- Acceso de storage limitado por carpeta de empresa y rol.

## Checklist de prueba

1. Usuario anonimo sin acceso a tablas internas.
2. `client` solo ve sus cupones.
3. `company_admin` no puede editar datos fuera de su empresa.
4. `company_employee` solo canjea cupones de su empresa.
5. `admin` puede gestionar recursos globales.
6. Usuario no autorizado no puede subir archivos a `offers-images`.
7. Subidas fuera de `company_id/` son rechazadas.

## Referencias

- [../supabase-schema.sql](../supabase-schema.sql)
- [../database/migrations](../database/migrations)
