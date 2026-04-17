# Edge Functions

## Objetivo

Mover operaciones sensibles fuera del frontend y ejecutarlas con permisos controlados.

## Registro de funciones

- Nombre: `create-internal-user`
- Uso: creacion de usuarios internos (`company_admin`, `company_employee`) de forma segura.

Si existe una segunda funcion del equipo, documentarla con este formato:

- Nombre: `NOMBRE_FUNCTION`
- Responsable: `INTEGRANTE`
- Uso: `DESCRIPCION_CORTA`
- Entrada: `JSON esperado`
- Salida: `JSON esperado`
- Dependencias: tablas, auth, secrets

Ejemplo de registro sugerido para documentar funciones de dos integrantes:

1. `create-internal-user` (usuarios internos)
2. `NOMBRE_DE_LA_FUNCION_DE_EQUIPO` (funcionalidad complementaria)

## Flujo esperado

1. Frontend envia solicitud con datos validados.
2. Edge Function valida rol/autorizacion del solicitante.
3. Edge Function crea usuario en Auth.
4. Edge Function inserta perfil en `profiles`.
5. Se dispara flujo de correo para activacion/reset.

## Contrato sugerido

### Request

```json
{
  "role": "company_employee",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "email": "correo@dominio.com",
  "companyId": "uuid"
}
```

### Response

```json
{
  "ok": true,
  "userId": "uuid",
  "email": "correo@dominio.com"
}
```

## Notas de seguridad

- No usar `service_role` en frontend.
- Validar que `company_admin` solo cree usuarios de su `company_id`.
- Registrar errores y respuestas de forma consistente.

## Despliegue y verificacion

1. Publicar funcion en Supabase Dashboard o CLI.
2. Configurar secrets requeridos por cada funcion.
3. Probar invocacion desde frontend con usuario autorizado.
4. Verificar rechazo para roles no autorizados.
