---
name: ridesalle-full-design
description: Spec completo de RideSalle — plataforma SaaS de transporte compartido para universitarios. Cubre arquitectura, modelos MongoDB, API REST, auth, frontend y 13 fases de implementación.
metadata:
  type: project
---

# RideSalle — Diseño Completo

## Visión

Plataforma web Mobile First de transporte compartido **exclusiva para estudiantes universitarios**. Un estudiante publica un viaje; otros reservan asiento para compartir gastos. Inspirado en BlaBlaCar/Uber/DiDi pero restringido a una comunidad universitaria con correo institucional obligatorio.

Calidad objetivo: producto profesional, no prototipo. Diseño minimalista tipo Uber/Airbnb/Linear.

---

## Stack

**Frontend:** React 19 · Vite · TypeScript · React Router · TailwindCSS · shadcn/ui · Framer Motion · React Hook Form · Zod · TanStack Query · Lucide Icons

**Backend:** Node.js · Express · TypeScript · MongoDB Atlas · Mongoose · JWT (access + refresh) · bcrypt · Socket.io · Cloudinary

**Despliegue:** Vercel — frontend estático + API como función serverless (`api/index.ts`)

---

## Arquitectura

Monolito con **npm workspaces**: `client/` (React SPA) y `server/` (Express API). Un solo repo, un solo deploy.

```
Flujo backend: route → middleware → controller → service → repository → model
Flujo frontend: page → hooks → api client → TanStack Query → backend
```

**Regla de oro:** nunca lógica de negocio en componentes React.

---

## Reglas de Dominio

1. **Correo institucional obligatorio** — solo `@lasallebajio.edu.mx` (configurable via `ALLOWED_EMAIL_DOMAIN`)
2. **Dos roles en una cuenta** — Pasajero y Conductor intercambiables; no cuentas separadas
3. **Rol Admin** — panel aparte, no intercambiable con Pasajero/Conductor
4. **Reservas** — pasajero solicita → conductor acepta/rechaza → si lleno, no acepta más
5. **Calificaciones** — al terminar viaje, ambos se califican (1–5 estrellas + comentario); recalcular promedio
6. **Notificaciones** — nueva reserva, reserva aceptada/rechazada, nuevo mensaje, viaje cancelado

---

## Modelos MongoDB

### User
```
_id, nombre, apellidos, email (único, indexado), passwordHash,
rol: ['pasajero','conductor','admin'], foto (Cloudinary URL),
universidad, carrera, semestre, bio,
calificacionPromedio, totalViajes, totalReservas, totalPasajeros,
vehiculo: { marca, modelo, año, color, placas, asientos },
activo, createdAt, updatedAt
```
Índices: `email` (único), `activo`

### Ride
```
_id, conductor (ref User), origen, destino,
fechaSalida (Date), horaEstimadaLlegada,
asientosTotal, asientosDisponibles,
precio (por asiento), descripcion, estado: ['activo','completo','cancelado','finalizado'],
pasajerosAceptados: [ref Booking], createdAt, updatedAt
```
Índices: `conductor`, `fechaSalida`, `estado`, `origen+destino`

### Booking
```
_id, ride (ref Ride), pasajero (ref User),
estado: ['pendiente','aceptada','rechazada','cancelada'],
asientos (default 1), createdAt, updatedAt
```
Índices: `ride`, `pasajero`, `estado`

### Chat
```
_id, participantes: [ref User], ride (ref Ride, opcional),
ultimoMensaje (ref Message), updatedAt
```

### Message
```
_id, chat (ref Chat), autor (ref User),
contenido, leido: Boolean, createdAt
```
Índices: `chat`, `createdAt`

### Rating
```
_id, evaluador (ref User), evaluado (ref User),
ride (ref Ride), booking (ref Booking),
estrellas (1-5), comentario, createdAt
```
Índices: `evaluado`, `ride`; compuesto único: `(evaluador, ride)`

### Notification
```
_id, usuario (ref User), tipo: enum, mensaje,
leida, entidad: { tipo, id }, createdAt
```
Índice: `usuario + leida`

### Session
```
_id, usuario (ref User), refreshToken (hashed), userAgent, ip,
expiresAt, createdAt
```
Índice: `usuario`, TTL en `expiresAt`

---

## API REST (`/api`)

### Auth
```
POST /api/auth/register       — registro con correo institucional
POST /api/auth/login          — login, devuelve access + refresh tokens
POST /api/auth/refresh        — renovar access token
POST /api/auth/logout         — revocar refresh token
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Users
```
GET    /api/users/me          — perfil propio
PATCH  /api/users/me          — editar perfil
POST   /api/users/me/vehicle  — registrar/editar vehículo
POST   /api/users/me/photo    — subir foto (Cloudinary)
GET    /api/users/:id         — perfil público
```

### Rides
```
GET    /api/rides             — buscar viajes (filtros: origen, destino, fecha, asientos)
POST   /api/rides             — publicar viaje (requiere vehículo)
GET    /api/rides/:id         — detalle de viaje
PATCH  /api/rides/:id         — editar viaje (solo conductor dueño)
DELETE /api/rides/:id         — cancelar viaje
GET    /api/rides/my          — mis viajes publicados
```

### Bookings
```
POST   /api/bookings          — solicitar reserva
GET    /api/bookings/my       — mis reservas como pasajero
PATCH  /api/bookings/:id      — aceptar/rechazar/cancelar
```

### Chats & Messages
```
GET    /api/chats             — mis conversaciones
GET    /api/chats/:id/messages — mensajes de un chat
POST   /api/messages          — enviar mensaje (también emite via Socket.io)
```

### Ratings
```
POST   /api/ratings           — calificar (post-viaje)
GET    /api/users/:id/ratings — calificaciones recibidas
```

### Notifications
```
GET    /api/notifications     — mis notificaciones
PATCH  /api/notifications/:id — marcar como leída
PATCH  /api/notifications/read-all
```

### Admin
```
GET    /api/admin/users       — listar usuarios
PATCH  /api/admin/users/:id/suspend
GET    /api/admin/rides       — listar todos los viajes
DELETE /api/admin/rides/:id
GET    /api/admin/stats       — estadísticas globales
```

---

## Seguridad

- helmet, CORS, rate limiting, express-mongo-sanitize
- JWT access token (15 min) + refresh token (7 días, rotado)
- bcrypt (salt rounds 12)
- Validación Zod en cliente Y servidor
- Nunca exponer passwords, secrets, stack traces en producción
- Sanitización de inputs

---

## Frontend — Páginas

```
/ (Landing)                   — hero, CTA, features
/auth/login                   — login form
/auth/register                — registro con validación email institucional
/auth/forgot-password
/rides                        — buscar viajes (filtros, cards)
/rides/:id                    — detalle de viaje + reservar
/rides/publish                — publicar viaje (requiere vehículo)
/my-rides                     — mis viajes publicados
/my-bookings                  — mis reservas
/chats                        — lista conversaciones
/chats/:id                    — chat individual
/profile                      — mi perfil + vehículo
/profile/:id                  — perfil público de usuario
/notifications                — notificaciones
/admin/*                      — panel admin (rutas protegidas por rol)
```

### Layout
- Navbar/Bottom nav Mobile First
- Dark/Light mode con toggle persistido en localStorage
- Skeleton loaders en todos los estados de carga
- Toast notifications (Sonner o shadcn/ui)
- Animaciones con Framer Motion (transiciones de página, cards, modales)

---

## Real-time (Socket.io)

Eventos:
- `message:new` — nuevo mensaje en chat
- `booking:updated` — reserva aceptada/rechazada
- `notification:new` — notificación en tiempo real
- `ride:updated` — asientos disponibles actualizados

**Caveats:** Vercel no mantiene WebSockets. Para producción usar Render/Railway/Fly.io o long-polling fallback de Socket.io.

---

## Fases de Implementación

### Fase A — Fundación Backend
1. Config `env.ts` + DB connection con retry
2. Modelos Mongoose (User, Vehicle embebido, Ride, Booking, Chat, Message, Rating, Notification, Session)
3. Middleware: `auth`, `validate`, `errorHandler`, `notFound`
4. Auth routes + controller + service + repository (register, login, refresh, logout)
5. User routes (me, vehicle, photo)

### Fase B — Viajes y Reservas Backend
6. Ride routes + controller + service + repository (CRUD + búsqueda)
7. Booking routes + controller + service + repository
8. Rating routes + controller + service
9. Notification service (crear notificaciones internas)

### Fase C — Chat Backend + Socket.io
10. Chat/Message routes + controller + service
11. Socket.io setup con autenticación JWT
12. Eventos de chat, booking y notificaciones en tiempo real

### Fase D — Frontend Base
13. ThemeContext + dark mode toggle
14. Layout: Navbar (desktop) + BottomNav (mobile)
15. ProtectedRoute + AuthContext
16. Páginas Auth: Login, Register, ForgotPassword
17. API client (`http.ts`) + TanStack Query hooks base

### Fase E — Frontend Viajes y Reservas
18. Página búsqueda de viajes con filtros
19. Detalle de viaje + botón reservar
20. Publicar viaje (form con Zod)
21. Mis viajes + Mis reservas
22. Gestión de reservas del conductor (aceptar/rechazar)

### Fase F — Chat Frontend
23. Lista de conversaciones
24. Chat individual con Socket.io en tiempo real

### Fase G — Perfil y Calificaciones
25. Página perfil propio + editar
26. Registro/edición de vehículo
27. Subida de foto (Cloudinary)
28. Perfil público + calificaciones recibidas
29. Modal/flujo para calificar post-viaje

### Fase H — Notificaciones
30. Centro de notificaciones
31. Badge en navbar
32. Notificaciones en tiempo real vía Socket.io

### Fase I — Admin
33. Panel admin: listar usuarios, suspender
34. Panel admin: listar/cancelar viajes
35. Panel admin: estadísticas

### Fase J — Calidad
36. Manejo de errores consistente (empty states, error states)
37. Skeleton loaders en todas las páginas
38. Lazy loading + code splitting de rutas
39. Typecheck + lint limpios
40. Pruebas básicas de integración en endpoints críticos

---

## Variables de Entorno Requeridas

```
MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET,
CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
CLIENT_URL, PORT, ALLOWED_EMAIL_DOMAIN
```
