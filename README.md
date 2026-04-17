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

## Referencias de Documentacion

La documentacion tecnica extendida del proyecto esta organizada en [docs/technical-documentation.md](docs/technical-documentation.md).

Documentos principales:

- [Arquitectura](docs/architecture.md)
- [Esquema de Base de Datos](docs/database-schema.md)
- [Migraciones y Ejecucion](docs/migrations.md)
- [Flujo de Autenticacion y SMTP](docs/auth-flow.md)
- [Seguridad y RLS](docs/security-rls.md)
- [Edge Functions](docs/api-edge-functions.md)
- [Flujos por Rol](docs/user-flows.md)
- [Guia de Diagramas](docs/diagrams/diagramas-guia.md)

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
- `011_rls_alignment_and_view_security.sql`: alineación de políticas RLS y seguridad de vistas.

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

## Configuración SMTP para Demo (Supabase + Gmail)

Este proyecto puede enviar correos de autenticación (confirmación, recuperación y enlaces mágicos) directamente desde Supabase Auth sin backend propio adicional.

Pasos recomendados para demo académica:

1. Crea una cuenta Gmail exclusiva para el proyecto (ejemplo: lacuponera.demo@gmail.com).
2. Activa verificación en dos pasos en esa cuenta.
3. Genera una contraseña de aplicación en Google (App Password).
4. En Supabase Dashboard entra a Authentication > Email > SMTP Settings.
5. Configura estos valores:
	- Host: smtp.gmail.com
	- Port: 587
	- Username: correo Gmail de la demo
	- Password: App Password generada en Google
	- Sender name: Sivar Cuponera
	- Sender email: mismo correo Gmail de la demo
6. Guarda y ejecuta una prueba de correo desde Supabase.
7. En Authentication > URL Configuration, define correctamente:
	- Site URL (tu frontend)
	- Redirect URLs (incluye /reset-password y las URLs de despliegue)

Notas:

- Para demo, Gmail SMTP es suficiente.
- Para producción, se recomienda dominio propio y proveedor transaccional (Resend, SendGrid, Brevo, Postmark).
- No guardes secretos SMTP en el frontend ni en variables VITE_.

## Flujo de Usuarios Internos (Admin y Empleados)

Estado actual del repositorio:

- Ya funciona el registro de clientes desde frontend.
- La creación de usuarios internos aún usa signUp desde frontend (debe migrarse para seguridad de producción).

Flujo objetivo recomendado:

1. Admin invita a company_admin por correo (sin contraseña inicial).
2. Company_admin invita a empleados por correo (sin contraseña inicial).
3. Supabase envía enlace seguro de activación.
4. El usuario define su propia contraseña desde el enlace.
5. Se crea o activa su perfil con rol y empresa.

Importante:

- En frontend no se debe crear contraseña para usuarios internos.
- Las invitaciones internas deben hacerse con una operación privilegiada (Edge Function con service role), no con anon key.

## Qué cambiar para completar Fase 4

1. Reemplazar la creación interna por contraseña en:
	- src/services/authService.js (funciones createEmployee y createCompanyAdmin)
	- src/pages/company/EmployeesPage.jsx (eliminar campo contraseña)
	- src/pages/admin/CompanyAdminsPage.jsx (eliminar campo contraseña)
2. Crear una Edge Function de invitación interna con validación por rol:
	- admin puede invitar company_admin y company_employee
	- company_admin solo puede invitar company_employee de su misma company_id
3. Hacer que el frontend llame esa Edge Function en lugar de auth.signUp.
4. Mantener reset de contraseña con Supabase (ya soportado en este proyecto).

## Solución de problemas

Si no ves ofertas o el login falla, revisa lo siguiente:

1. Que `.env.local` tenga credenciales válidas.
2. Que las migraciones SQL se hayan ejecutado en Supabase.
3. Que existan perfiles y roles creados en la tabla `profiles`.
4. Que la oferta tenga estado válido y fechas activas.

## Equipo de Desarrollo

1. Alexander Martinez: configuración inicial de autenticación/login y estructura base en Supabase.
2. Napoleon Días: módulo de compra de cupones, validación de flujo de compra tipo real, integración de correo y apoyo en RLS/Edge Functions.
3. Marco Mazzini: módulo de administración de empresa consumiendo Backend as a Service con Supabase.
4. Jhonnatan Peñate: módulo de administración global, documentación técnica e integración de Supabase (RLS, Storage, SMTP y Edge Functions).
5. Jade Cárcamo: módulo de cliente (mis cupones) y canje de empleado, consumiendo servicios de Supabase desde frontend.

Nota: todo el equipo trabajó sobre un enfoque Backend as a Service con Supabase, integrando frontend por módulos y reglas de seguridad compartidas.

## Licencia

Este proyecto corresponde a un trabajo académico para la materia de Desarrollo Web ll.