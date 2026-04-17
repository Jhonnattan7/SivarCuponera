# Esquema de Base de Datos

## Fuente de verdad

- Esquema consolidado: [../supabase-schema.sql](../supabase-schema.sql)
- Migraciones: [../database/migrations](../database/migrations)

## Entidades principales

- `categories`: rubros de empresas ofertantes.
- `companies`: empresas registradas por administracion.
- `profiles`: extension de `auth.users` con rol y datos de negocio.
- `offers`: ofertas comerciales por empresa.
- `coupons`: cupones comprados por clientes.

## Relaciones clave

- `companies.category_id -> categories.id`
- `profiles.company_id -> companies.id`
- `offers.company_id -> companies.id`
- `coupons.offer_id -> offers.id`
- `coupons.client_id -> profiles.id`
- `coupons.redeemed_by -> profiles.id`

## Vistas

- `companies_public`
- `active_offers`
- `offer_financials`

## Funciones de negocio

- `generate_coupon_code()`
- `purchase_coupon(p_offer_id UUID)`
- `expire_coupons()`
- `get_user_role()`
- `get_user_company_id()`

## Nota sobre diagramas

Para visualizacion ER, ver [./diagrams/diagramas-guia.md](./diagrams/diagramas-guia.md).
