# La Cuponera – Contexto del Proyecto (Desarrollo Web II)

## Descripción General

**La Cuponera** es una aplicación web para la venta de cupones de descuento por internet. El sistema gestiona el ciclo completo: registro de empresas ofertantes, publicación de ofertas, compra de cupones por parte de clientes y canje de los mismos en los establecimientos.

---

## Rúbrica de Evaluación Final (100%)

| # | Categoría | Criterio | % |
|---|-----------|----------|---|
| 1 | Funcionamiento | Registrar y gestionar empresas, empleados, rubros y ofertas | 10% |
| 2 | Funcionamiento | Flujo de aprobación de ofertas implementado correctamente | 10% |
| 3 | Funcionamiento | Ofertas activas (aprobadas, vigentes, disponibles) organizadas por rubro en interfaz pública | 10% |
| 4 | Funcionamiento | Registro de clientes en la plataforma | 5% |
| 5 | Funcionamiento | Clientes pueden comprar cupones con código único | 10% |
| 6 | Funcionamiento | Clientes ven sus cupones: disponibles, canjeados y vencidos | 5% |
| 7 | Funcionamiento | Administrador ve detalle de empresas y clientes registrados | 5% |
| 8 | Funcionamiento | Administrador de empresa gestiona las ofertas de su empresa | 5% |
| 9 | Funcionamiento | Empleados pueden canjear cupones correctamente | 5% |
| 10 | Interfaz | Interfaz clara, consistente y fácil de usar | 5% |
| 11 | Interfaz | Diseño visual adecuado (alineación, colores, tipografía) | 5% |
| 12 | Validación | Validación en formularios: cliente y servidor | 10% |
| 13 | Seguridad | Roles y control de acceso implementados correctamente | 10% |
| 14 | Despliegue | Sistema publicado en hosting funcional | 5% |
| 15 | Buenas prácticas | Estructura organizada de archivos y buenas prácticas de desarrollo | 5% |

---

## Flujo de Negocio

### 1. Registro de Oferta (Empresa Ofertante)
La empresa registra una oferta con los siguientes campos:
- Título de la oferta
- Precio regular
- Precio de la oferta
- Fecha de inicio de la oferta
- Fecha de fin de la oferta
- Fecha límite para usar el cupón
- Cantidad límite de cupones *(opcional)*
- Descripción de la oferta
- Otros detalles

**Estado inicial:** `En espera de aprobación`

### 2. Revisión de Oferta (Administrador de La Cuponera)
- **Aprobada** → estado: `Oferta aprobada`
- **Rechazada** → justificación requerida + estado: `Oferta rechazada`
  - La empresa puede editar y reenviar → vuelve a `En espera de aprobación`
  - O descartar → estado: `Oferta descartada`

### 3. Publicación
Si está aprobada, la oferta se publica en la interfaz pública durante el rango de fechas activo (y mientras haya cupones disponibles).

### 4. Compra de Cupón (Cliente)
- El cliente compra uno o varios cupones de ofertas activas.
- Se simula pago con tarjeta de crédito.
- Se envía correo de confirmación al cliente.
- Se genera un **código único** = `[código empresa (3 letras + 3 dígitos)] + [7 dígitos aleatorios]`.

### 5. Canje de Cupón (Empleado)
- El empleado ingresa el código del cupón.
- El sistema verifica: que exista, no haya sido canjeado, y que el DUI del comprador coincida.
- Si todo es correcto → cupón marcado como `canjeado`.

### Comisión
La Cuponera cobra una comisión por cada cupón vendido. El porcentaje se define al registrar la empresa.

---

## Roles y Accesos

### Administrador *(empleado de La Cuponera)*
- **Gestión de empresas ofertantes:** CRUD completo.
  - Campos: nombre, código (3 letras + 3 dígitos), dirección, contacto, teléfono, correo, rubro, % comisión.
  - Vista de ofertas por empresa categorizadas en: `en espera`, `aprobadas futuras`, `activas`, `pasadas`, `rechazadas`, `descartadas`.
  - Por oferta: datos generales, cupones vendidos, cupones disponibles, ingresos totales, cargo por servicio.
- **Gestión de rubros:** CRUD (restaurantes, talleres, salones de belleza, entretenimiento, etc.).
- **Gestión de clientes:** Ver datos personales + cupones (disponibles, canjeados, vencidos).

### Administrador de Empresa Ofertante
- Accede con el correo registrado de la empresa.
- **Gestión de ofertas:** Crear y ver ofertas (mismas categorías que el admin general).
- **Gestión de empleados:** CRUD. Campos: nombres, apellidos, correo electrónico.

### Cliente
- Se registra desde la interfaz pública.
- Campos: nombres, apellidos, teléfono, correo, dirección, número de DUI, contraseña.
- Debe verificar su cuenta antes de iniciar sesión.
- **Compra de cupones:** de ofertas activas, con simulación de pago.
- **Visualización de cupones:** disponibles, canjeados, vencidos.
- Para cupones disponibles: puede generar el PDF del cupón.

### Empleado *(de empresa ofertante)*
- Única función: **canjear cupones** ingresando el código y verificando los datos.

---

## Funcionalidades Transversales (todos los roles)
- Modificar contraseña propia.
- Mecanismo de recuperación de contraseña.

---

## Estados de una Oferta

```
En espera de aprobación
       ↓          ↓
  Aprobada     Rechazada
       ↓          ↓
  [Publicada]  Puede editarse → En espera de aprobación
               O descartarse  → Descartada
```

---

## Stack Tecnológico Requerido
- **Frontend:** React JS
- **Backend:** API REST (lenguaje libre) o solución BaaS (Firebase, Supabase, etc.)
- **Base de datos:** Relacional (si se usa API REST propia)
- **CSS Framework:** Bootstrap o Tailwind (permitido)
- **Hosting:** Publicación obligatoria en un hosting funcional

---

## Notas Importantes para el Desarrollo
- El código único del cupón se genera concatenando el **código de empresa** (3 letras + 3 dígitos) con un **número de 7 dígitos aleatorio**.
- La interfaz pública muestra ofertas **aprobadas, vigentes y con cupones disponibles**, organizadas **por rubro**.
- Los cupones PDF deben poder generarse para los cupones en estado disponible.
- Se deben implementar validaciones **tanto del lado del cliente como del servidor**.
- El control de acceso por roles debe estar correctamente implementado (criterio de seguridad = 10%).
