# RideSalle 🚗

Plataforma de **transporte compartido exclusiva para estudiantes universitarios**. Un
estudiante publica un viaje y otros reservan un asiento para compartir gastos. Combina
conceptos de BlaBlaCar, Uber y DiDi, enfocada en una sola comunidad universitaria.

> Aplicación web responsive con apariencia de app móvil (**Mobile First**), construida como un
> **monolito** en un único repositorio y desplegable en **Vercel**.

---

## Tabla de contenido

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Scripts](#scripts)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Decisiones técnicas](#decisiones-técnicas)
- [Estado y roadmap](#estado-y-roadmap)

---

## Descripción

RideSalle permite a los estudiantes:

- **Como pasajero:** buscar viajes, reservar asiento, chatear, calificar y cancelar reservas.
- **Como conductor:** publicar/editar/cancelar viajes y aceptar o rechazar pasajeros.

Un mismo usuario alterna entre ambos roles. Existe además un **panel de administración** para
gestionar usuarios, viajes, estadísticas y reportes. El registro está restringido a **correos
institucionales** del dominio universitario.

## Arquitectura

Monolito en un solo repositorio mediante **npm workspaces**:

- `client/` — SPA con Vite + React 19.
- `server/` — API REST con Express + Mongoose.
- `api/` — entrypoint serverless para Vercel que reutiliza la app Express.

El backend sigue arquitectura limpia: `route → middleware → controller → service →
repository → model`. La lógica de negocio nunca vive en componentes React.

## Tecnologías

**Frontend:** React 19, Vite, TypeScript, React Router, TailwindCSS, shadcn/ui, Framer
Motion, React Hook Form, Zod, TanStack Query, Lucide Icons.

**Backend:** Node.js, Express, TypeScript, MongoDB Atlas, Mongoose, JWT, bcrypt, Socket.io,
Cloudinary.

## Estructura del proyecto

```
RideSalle/
├── CLAUDE.md              # Guía del proyecto para Claude Code
├── api/index.ts          # Entrypoint serverless (Vercel) → reusa app Express
├── client/               # Frontend (Vite + React)
│   └── src/{components,pages,hooks,context,lib,api,types}
├── server/               # Backend (Express)
│   └── src/{config,controllers,services,repositories,models,routes,middlewares,sockets,utils,types}
├── package.json          # Workspaces + scripts orquestadores
├── tsconfig.base.json    # Config TS estricta compartida
├── eslint.config.js      # ESLint flat config (client + server)
└── vercel.json           # Build estático + rewrites de API/SPA
```

## Instalación

Requisitos: **Node.js ≥ 18.18** y una cuenta de **MongoDB Atlas**.

```bash
git clone <repo> ridesalle && cd ridesalle
npm install                 # instala todos los workspaces
cp .env.example .env        # y completa los valores
npm run dev                 # client (5173) + server (4000) en paralelo
```

## Variables de entorno

Copia `.env.example` a `.env` y completa:

| Variable | Descripción |
| --- | --- |
| `MONGODB_URI` | Cadena de conexión de MongoDB Atlas |
| `JWT_SECRET` | Secreto para firmar access tokens |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens |
| `CLOUDINARY_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Credenciales de Cloudinary |
| `CLIENT_URL` | Origen del frontend (CORS) |
| `PORT` | Puerto del servidor local (default 4000) |
| `ALLOWED_EMAIL_DOMAIN` | Dominio institucional permitido para registro |

## Scripts

| Script | Acción |
| --- | --- |
| `npm run dev` | Client + server en paralelo |
| `npm run dev:client` / `npm run dev:server` | Cada uno por separado |
| `npm run build` | Build de server y client |
| `npm run lint` | ESLint en ambos workspaces |
| `npm run typecheck` | `tsc --noEmit` en ambos workspaces |
| `npm run format` | Prettier sobre todo el repo |

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Vercel usa `vercel.json`: `buildCommand` compila el client a `client/dist` y publica
   `api/index.ts` como función serverless bajo `/api/*`.
3. Configura las variables de entorno en el dashboard de Vercel.

## Decisiones técnicas

- **Monolito con workspaces** en lugar de repos separados: un único proyecto desplegable que
  mantiene separación limpia frontend/backend sin mezclar responsabilidades.
- **TypeScript estricto** (`strict`, sin `any`) en todo el código; ESLint + Prettier
  compartidos.
- **Tailwind con CSS variables** compatible con shadcn/ui y dark mode por clase, con
  preferencia persistida en `localStorage`.
- **⚠️ Socket.io en Vercel:** las funciones serverless no mantienen WebSockets persistentes.
  El chat en tiempo real (Fase 9) requerirá un host de proceso largo (Render/Railway/Fly) o
  el fallback de long-polling. Decisión a tomar antes de implementar el chat.

## Estado y roadmap

Scaffold inicial listo. El desarrollo avanza por fases (ver `CLAUDE.md` §10): backend →
autenticación → frontend base → viajes → reservas → chat → perfil → administrador → pruebas →
optimización. Tras cada fase: compilar, lint y corregir antes de continuar.
