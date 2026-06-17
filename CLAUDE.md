# CLAUDE.md — RideSalle

Guía persistente para Claude Code. Léela antes de generar o modificar código. Captura el
"Prompt Maestro" de RideSalle: visión, stack, arquitectura, reglas de dominio y flujo de
trabajo. **No inventes funcionalidades que contradigan este documento.** Puedes proponer
mejoras siempre que mantengan la visión original.

---

## 1. Proyecto y visión

**RideSalle** es una plataforma SaaS de transporte compartido **exclusiva para estudiantes
universitarios**. Combina conceptos de BlaBlaCar, Uber y DiDi, pero enfocada solo en una
comunidad universitaria: un estudiante publica un viaje y otros reservan un asiento para
compartir gastos.

- Web responsive con **apariencia de app móvil (Mobile First)**. Debe funcionar perfecto en
  teléfono, tablet y escritorio, y sentirse como una app nativa desde el navegador.
- Debe sentirse **moderna, fluida y profesional**. No debe parecer un proyecto escolar.
- Objetivo de calidad: código que parezca hecho por un equipo profesional. No es un
  prototipo ni un MVP simple, es una **base sólida y escalable**.

Inspiración de diseño: Uber, Airbnb, Linear, Notion, BlaBlaCar, Spotify. Minimalista,
profesional, con animaciones suaves. **No** usar Bootstrap ni Material UI.

---

## 2. Stack tecnológico obligatorio

**Frontend:** React 19 · Vite · TypeScript · React Router · TailwindCSS · shadcn/ui ·
Framer Motion · React Hook Form · Zod · TanStack Query · Lucide Icons.

**Backend:** Node.js · Express · TypeScript · MongoDB Atlas · Mongoose · JWT · bcrypt ·
Socket.io · Cloudinary.

No sustituir piezas del stack sin justificación explícita.

---

## 3. Arquitectura

**Monolito en un único repositorio.** Prohibido: microservicios, repos múltiples, o tratar
frontend/backend como proyectos separados. Para mantener una sola base desplegable usamos
**npm workspaces**: `client/` (Vite + React) y `server/` (Express). Sigue siendo un único
proyecto/repo.

Despliegue en **Vercel**: el frontend se sirve estático; la API Express se expone como
función serverless vía `api/index.ts` (reexporta la app Express). `vercel.json` enruta
`/api/*` a la función y el resto a la SPA.

Arquitectura limpia, separación estricta de responsabilidades:

```
server/src/  -> config · controllers · services · repositories · models ·
                routes · middlewares · sockets · utils · types
client/src/  -> components (+ components/ui) · pages · hooks · context ·
                lib · api · types
```

Reglas:
- **Nunca** lógica de negocio dentro de componentes React. Vive en services/hooks.
- Flujo backend: route → middleware → controller → service → repository → model.
- No crear archivos gigantes; cada archivo/función con una sola responsabilidad.

---

## 4. Reglas de dominio

- **Correo institucional obligatorio.** Solo se aceptan correos del dominio universitario
  (ej. `usuario@lasallebajio.edu.mx`). El dominio permitido es configurable por env. Rechazar
  Gmail/Outlook/otros.
- **Dos roles intercambiables en una sola cuenta:** Pasajero y Conductor. No hay cuentas
  distintas; el usuario alterna entre roles.
  - *Pasajero:* buscar viajes, reservar asiento, chatear, calificar, cancelar reserva.
  - *Conductor:* publicar/editar/cancelar viajes, aceptar/rechazar pasajeros.
- **Rol Administrador** (panel aparte): ver/suspender usuarios, eliminar viajes, ver
  estadísticas, moderar reportes.
- **Reservas:** el pasajero solicita asiento; el conductor acepta o rechaza. **Si el viaje
  está lleno, no aceptar más solicitudes.**
- **Calificaciones:** al terminar un viaje ambos usuarios se califican (1–5 estrellas +
  comentario). El promedio del perfil se recalcula automáticamente.
- **Notificaciones:** nueva reserva, reserva aceptada/rechazada, nuevo mensaje, viaje
  cancelado.
- **Perfil:** nombre, apellidos, foto, correo, universidad, carrera, semestre, descripción,
  calificación promedio, # viajes realizados/publicados, # pasajeros transportados. Vehículo
  opcional (marca, modelo, año, color, placas, # asientos).

---

## 5. Modelos MongoDB (mínimo)

`User` · `Vehicle` · `Ride` · `Booking` · `Chat` · `Message` · `Rating` · `Notification` ·
`Session`.

Diseño profesional: evitar duplicación, usar referencias cuando aplique, **crear índices**,
optimizar consultas y pensar en escalabilidad desde el esquema.

---

## 6. API REST

Prefijo `/api`. Diseño limpio y documentado. Ejemplos:

```
POST   /api/auth/register      POST /api/auth/login
GET    /api/users/me           PATCH /api/users/me
GET    /api/rides              POST /api/rides
PATCH  /api/rides/:id          DELETE /api/rides/:id
POST   /api/bookings           PATCH /api/bookings/:id
GET    /api/chats              POST /api/messages
```

**Validación con Zod en cliente Y servidor.** Nunca confiar solo en la validación del
cliente. Documentar todos los endpoints.

---

## 7. Autenticación y seguridad

- Auth: registro, login, logout, recuperación de contraseña, **JWT + refresh token**, hash
  con bcrypt, protección de rutas, persistencia de sesión.
- Seguridad obligatoria: **helmet, rate limiting, CORS, sanitización, protección anti
  NoSQL-injection, manejo correcto de errores**. Nunca exponer información sensible
  (passwords, secrets, stack traces en producción).

---

## 8. UX · Rendimiento · Accesibilidad

- **UX:** skeleton loaders, loading/empty/error states, toasts, confirmaciones, animaciones
  y transiciones suaves.
- **Tema:** Light y Dark mode con preferencia **persistida**.
- **Mobile First:** diseñar primero para teléfono, luego tablet/escritorio.
- **Rendimiento:** lazy loading, code splitting, `React.memo`, `useMemo`, `useCallback`,
  optimización de imágenes (Cloudinary).
- **Accesibilidad:** navegación por teclado, ARIA labels, focus visible, buen contraste.

---

## 9. Calidad de código

- **TypeScript estricto** en todo el proyecto. **Prohibido `any`.**
- Principios: SOLID, DRY, KISS, Clean Code. Single responsibility por componente/función.
- Sin funciones enormes. Documentar solo cuando aporte (constraints que el código no muestra).

---

## 10. Flujo de trabajo por fases

Construir **por fases**, no todo de golpe:

1. Analizar documentación · 2. Diseñar arquitectura · 3. Diseñar MongoDB · 4. Backend ·
5. Autenticación · 6. Frontend base · 7. Sistema de viajes · 8. Reservas · 9. Chat ·
10. Perfil · 11. Administrador · 12. Pruebas · 13. Optimización.

**Después de CADA fase:** verificar compilación → ejecutar lint → corregir errores →
continuar solo si todo pasa.

> Estado actual: scaffold inicial creado (carpetas + configs + docs). Aún **no** se han
> implementado las Fases 1–13.

---

## 11. Comandos

Scripts de raíz (npm workspaces):

```
npm run dev          # client + server en paralelo
npm run dev:client   # solo Vite
npm run dev:server   # solo Express (tsx watch)
npm run build        # build de client y server
npm run lint         # eslint en ambos workspaces
npm run typecheck    # tsc --noEmit en ambos workspaces
```

---

## 12. Caveats

- **Socket.io en Vercel:** las funciones serverless de Vercel **no** mantienen conexiones
  WebSocket persistentes. El chat en tiempo real (Fase 9) requerirá un host de proceso largo
  (Render / Railway / Fly) o el fallback de long-polling de Socket.io. Decidir antes de
  implementar la Fase 9; el scaffold deja `server/server.ts` listo para correr Socket.io en
  local y desarrollo.

---

## 13. Variables de entorno

Ver `.env.example`. Mínimo: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`,
`CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLIENT_URL`,
`ALLOWED_EMAIL_DOMAIN`. Nunca commitear `.env`.
