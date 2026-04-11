# Sivar Cuponera

Aplicación web para publicar, administrar y comprar cupones de descuento. Está construida con React, Vite y Supabase, y usa roles para separar el acceso de clientes, administradores, empresas y personal interno.

## Resumen

La plataforma permite:

- Navegar ofertas públicas por rubro y por búsqueda.
- Comprar cupones desde un flujo de pago simulado.
- Ver el historial de cupones comprados por cliente.
- Administrar rubros, empresas, usuarios y ofertas desde el panel de administración.
- Gestionar ofertas y empleados desde el panel de empresa.
- Canjear cupones desde el rol de empleado.

## Tecnologías

- React 19
- Vite
- React Router
- Supabase Auth y PostgreSQL
- Tailwind CSS 4
- @supabase/supabase-js

## Requisitos

- Node.js 18 o superior
- Una cuenta y un proyecto activo en Supabase
- Variables de entorno configuradas en `.env.local`

## Instalación

1. Clona el repositorio.
2. Instala dependencias con `npm install`.
3. Crea o revisa el archivo `.env.local` en la raíz del proyecto con estas variables:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

4. En Supabase, ejecuta las migraciones SQL ubicadas en `database/migrations/` en orden numérico.
5. Inicia la aplicación con `npm run dev`.

Si prefieres una referencia rápida del esquema final, revisa `supabase-schema.sql`.

## Uso

El proyecto corre por defecto en `http://localhost:5173`.

Rutas principales:

- `/` sitio público con ofertas.
- `/login`, `/signup`, `/forgot-password` y `/reset-password` para autenticación.
- `/client/coupons` para ver cupones del cliente.
- `/pago-cupon` para completar la compra.
- `/admin/*` para el panel de administración.
- `/company/*` para el panel de empresa.
- `/empleado/canje` para canje de cupones.

## Roles

- `admin`: acceso al panel global, gestión de rubros, empresas, clientes, admins de empresa y revisión de ofertas.
- `company_admin`: acceso a su panel de empresa, ofertas y empleados.
- `company_employee`: acceso al canje de cupones.
- `client`: navegación pública, compra y visualización de cupones.

## Funcionalidades principales

- Home con hero, filtro por categorías y listado de ofertas.
- Cards de oferta con imagen, descuento, precio original y precio promocional.
- Compra de cupón con validación básica de tarjeta.
- Generación de código de cupón después de la compra.
- Panel de administrador con métricas financieras y revisión de ofertas pendientes.
- CRUD de categorías y empresas.
- Panel de empresa para gestionar ofertas y personal.

## Estructura del proyecto

```text
src/
├── components/
│   ├── common/
│   └── ui/
├── context/
├── pages/
│   ├── admin/
│   ├── client/
│   ├── company/
│   ├── employee/
│   └── public/
├── routes/
├── services/
└── utils/

database/
└── migrations/
```

## Base de datos

El proyecto usa Supabase como backend y organiza la lógica SQL en migraciones:

- `001_initial_schema.sql`: esquema base.
- `002_views.sql`: vistas para ofertas activas y métricas.
- `003_functions_and_triggers.sql`: funciones y triggers.
- `004_row_level_security.sql`: políticas RLS.
- `005_add_image_support.sql`: soporte para imágenes en ofertas.
- `006_coupon_purchase_setup.sql`: compra de cupones.
- `007_add_product_name.sql`: nombre de producto en cupones.
- `008_seed_test_data.sql`: datos de prueba.
- `010_storage_offer_images_rls.sql`: seguridad para storage.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Notas de configuración

- `src/services/supabaseClient.js` valida que existan `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- Si cambias el archivo `.env.local`, reinicia el servidor de desarrollo.
- Las ofertas públicas dependen de las vistas y políticas creadas en Supabase.

## Solución de problemas

Si no ves ofertas o el login falla, revisa lo siguiente:

1. Que `.env.local` tenga credenciales válidas.
2. Que las migraciones SQL se hayan ejecutado en Supabase.
3. Que existan perfiles y roles creados en la tabla `profiles`.
4. Que la oferta tenga estado válido y fechas activas.

## Equipo de Desarrollo

1. Alexander Martinez - Autenticación y Configuracon de Subapase
2. Napoleon Días - Frontend / Modulo Compra Cupon
3. Marco Mazzini - Frontend / Modulo Admin Empresa
4. Jhonnatan Peñate - Frontend / Modulo Administador Total y Documentación
5. Jade Cárcamo - Frontend / Modulo de Cliente Mis Cupones y Canje Empleado

## Licencia

Este proyecto corresponde a un trabajo académico para la materia de Desarrollo Web ll.