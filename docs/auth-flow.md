# Flujo de Autenticacion y SMTP

## Roles

- `admin`
- `company_admin`
- `company_employee`
- `client`

## Flujo base

1. Usuario inicia sesion en Supabase Auth.
2. Se valida sesion y se consulta rol en `profiles`.
3. El frontend redirige segun rol.
4. Acceso a datos se controla por RLS.

## Recuperacion de contrasena

1. Usuario solicita recuperacion.
2. Supabase envia correo via SMTP configurado.
3. Usuario abre enlace de `reset-password`.
4. Usuario define nueva contrasena.

## SMTP

Configurado en Supabase Dashboard:

- Host: `smtp.gmail.com`
- Puerto: `587`
- Usuario: correo del proyecto
- Password: App Password de Gmail
- Sender name: marca del proyecto
- Sender email: correo del proyecto

Flujo operativo:

1. Frontend invoca accion de Auth (ej. recuperacion).
2. Supabase Auth procesa el evento.
3. Supabase usa SMTP configurado para enviar correo.
4. El contenido sale desde la plantilla personalizada en Auth Email Templates.
5. El enlace de retorno usa URL de sitio + redirects configurados.

## Plantillas

Las plantillas de correo se personalizan desde Supabase Auth Email Templates.

Plantillas recomendadas a mantener sincronizadas:

- Reset Password
- Confirm Signup
- Invite User
- Magic Link

Nota: La personalizacion del correo no se codifica en React; se administra desde Dashboard.

## Variables de entorno

Tomar como guia [../.env.local.example](../.env.local.example).
