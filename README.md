# 🎟️ Sivar Cuponera

Sistema web de venta de cupones de descuento desarrollado con React + Vite + Supabase + Tailwind CSS.

## 📋 Descripción

Aplicación web que permite a clientes comprar cupones de descuento de empresas ofertantes. Los clientes pueden registrarse, buscar ofertas por rubro, comprar cupones y visualizar su historial de compras.

## 🚀 Tecnologías

- **Frontend**: React 19 + Vite
- **Backend**: Supabase (Backend as a Service)
- **Estilos**: Tailwind CSS
- **Autenticación**: Supabase Auth
- **Base de datos**: PostgreSQL (Supabase)

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd SivarCuponera
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

**Lee la guía completa en [SETUP-SUPABASE.md](SETUP-SUPABASE.md)**

Pasos rápidos:
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia `.env.example` a `.env.local` y agrega tus credenciales
3. Ejecuta el script `supabase-schema.sql` en el SQL Editor de Supabase

### 4. Ejecutar el proyecto

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── LoginForm.jsx   # Ejemplo de autenticación
│   └── ...
├── context/            # Contextos de React
│   └── AuthContext.jsx # Manejo de autenticación
├── lib/                # Utilidades y configuración
│   ├── supabase.js     # Cliente de Supabase
│   └── api.js          # Funciones de API
├── App.jsx             # Componente principal
├── main.jsx            # Punto de entrada
└── index.css           # Estilos globales
```

## 🎯 Funcionalidades - Fase 1

✅ **Completado:**
- [x] Configuración de Supabase
- [x] Sistema de autenticación
- [x] Estructura de base de datos

🔨 **En desarrollo:**
- [ ] Mostrar ofertas por rubro
- [ ] Registro y login de clientes
- [ ] Compra de cupones
- [ ] Visualización de cupones del cliente

## 📚 Uso del Sistema

### Sistema de Autenticación

```jsx
import { useAuth } from './context/AuthContext'

function MiComponente() {
  const { user, cliente, iniciarSesion, cerrarSesion } = useAuth()
  
  // user: usuario de Supabase Auth
  // cliente: datos completos del cliente (nombres, apellidos, etc.)
}
```

### Obtener Ofertas

```jsx
import { obtenerOfertasActivas } from './lib/api'

const resultado = await obtenerOfertasActivas()
if (resultado.success) {
  console.log(resultado.data) // Array de ofertas
}
```

### Comprar Cupón

```jsx
import { comprarCupon } from './lib/api'

const resultado = await comprarCupon(ofertaId, 'tarjeta_credito')
if (resultado.success) {
  console.log('Cupón:', resultado.data.codigo)
}
```

Ver más ejemplos en [src/components/LoginForm.jsx](src/components/LoginForm.jsx)

## 🗄️ Base de Datos

### Tablas principales:
- `rubros`: Categorías de ofertas
- `empresas`: Empresas ofertantes
- `ofertas`: Promociones con descuentos
- `clientes`: Usuarios registrados
- `cupones`: Cupones comprados

### Esquema completo:
Ver [supabase-schema.sql](supabase-schema.sql)

## 🔐 Seguridad

- Row Level Security (RLS) habilitado
- Clientes solo pueden ver sus propios cupones
- Ofertas públicas solo si están aprobadas
- Autenticación mediante Supabase Auth

## 📝 Scripts Disponibles

```bash
npm run dev       # Ejecutar en modo desarrollo
npm run build     # Construir para producción
npm run preview   # Vista previa de producción
npm run lint      # Verificar errores de ESLint
```

## 🐛 Solución de Problemas

### Error: Variables de entorno no encontradas
- Verifica que `.env.local` existe
- Las variables deben comenzar con `VITE_`
- Reinicia el servidor (`npm run dev`)

### No se muestran las ofertas
- Verifica que ejecutaste el script SQL completo
- Asegúrate de que existen ofertas con estado 'aprobada'
- Revisa las fechas de inicio/fin de las ofertas

## 👥 Equipo

Proyecto desarrollado por [Nombre del equipo]

## 📄 Licencia

Este proyecto es parte de un trabajo académico.

---

Para más información sobre la configuración de Supabase, consulta [SETUP-SUPABASE.md](SETUP-SUPABASE.md)

```
SivarCuponera
├─ database
│  ├─ migrations
│  │  ├─ 001_initial_schema.sql
│  │  ├─ 002_views.sql
│  │  ├─ 003_functions_and_triggers.sql
│  │  ├─ 004_row_level_security.sql
│  │  ├─ 005_add_image_support.sql
│  │  ├─ 006_coupon_purchase_setup.sql
│  │  ├─ 007_add_product_name.sql
│  │  ├─ 008_seed_test_data.sql
│  │  └─ README.md
│  └─ README.md
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  ├─ img
│  │  ├─ cafe.jpg
│  │  ├─ gorras.jpg
│  │  ├─ MAC.jpg
│  │  ├─ mascotas.jpg
│  │  ├─ radio.webp
│  │  └─ zapatosSportline.png
│  └─ vite.svg
├─ README.md
├─ src
│  ├─ App.css
│  ├─ App.jsx
│  ├─ assets
│  │  └─ react.svg
│  ├─ components
│  │  ├─ common
│  │  │  ├─ Footer.jsx
│  │  │  ├─ info.txt
│  │  │  └─ PopupFooter.jsx
│  │  └─ ui
│  │     ├─ CuponCard.jsx
│  │     ├─ Header.jsx
│  │     ├─ Hero.jsx
│  │     ├─ info.txt
│  │     ├─ Layout.jsx
│  │     ├─ OfertaCard.jsx
│  │     ├─ OfertasCuadricula.jsx
│  │     └─ Sidebar.jsx
│  ├─ context
│  │  └─ AuthContext.jsx
│  ├─ hooks
│  │  └─ info.txt
│  ├─ index.css
│  ├─ main.jsx
│  ├─ pages
│  │  ├─ admin
│  │  │  ├─ AdminLayout.jsx
│  │  │  ├─ CategoriesPage.jsx
│  │  │  ├─ CompaniesPage.jsx
│  │  │  ├─ CompanyFormPage.jsx
│  │  │  ├─ DashboardPage.jsx
│  │  │  ├─ info.txt
│  │  │  └─ OffersReviewPage.jsx
│  │  ├─ client
│  │  │  ├─ info.txt
│  │  │  ├─ MisCupones.jsx
│  │  │  ├─ MisCuponesComprados.jsx
│  │  │  └─ PagoCupon.jsx
│  │  ├─ company
│  │  │  ├─ CompanyLayout.jsx
│  │  │  ├─ DashboardPage.jsx
│  │  │  ├─ EmployeesPage.jsx
│  │  │  ├─ info.txt
│  │  │  ├─ OfferFormPage.jsx
│  │  │  └─ OffersPage.jsx
│  │  ├─ employee
│  │  │  └─ info.txt
│  │  └─ public
│  │     ├─ ForgotPassword.jsx
│  │     ├─ Home.jsx
│  │     ├─ info.txt
│  │     ├─ LogIn.jsx
│  │     ├─ ResetPassword.jsx
│  │     └─ SignUp.jsx
│  ├─ routes
│  │  ├─ AppRouter.jsx
│  │  └─ ProtectedRoute.jsx
│  ├─ services
│  │  ├─ authService.js
│  │  ├─ categoriesService.js
│  │  ├─ companiesService.js
│  │  ├─ employeesService.js
│  │  ├─ info.txt
│  │  ├─ offersService.js
│  │  ├─ statsService.js
│  │  └─ supabaseClient.js
│  └─ utils
│     ├─ api.js
│     └─ info.txt
├─ supabase-schema.sql
└─ vite.config.js

```