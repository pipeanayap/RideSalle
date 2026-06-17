import { createApp } from '../server/src/app.js';
import { connectToDatabase } from '../server/src/config/db.js';

/**
 * Entrypoint serverless de Vercel. Reutiliza la app Express del workspace `server`.
 * La conexión a MongoDB se establece una vez y se reutiliza entre invocaciones.
 *
 * NOTA: Socket.io (chat en tiempo real) NO funciona aquí — las funciones serverless de
 * Vercel no mantienen WebSockets persistentes. Ver CLAUDE.md § Caveats.
 */
const app = createApp();
let dbReady: Promise<unknown> | null = null;

export default async function handler(req: unknown, res: unknown): Promise<void> {
  if (!dbReady) {
    dbReady = connectToDatabase();
  }
  await dbReady;
  // Express app es un request listener válido para Vercel Node functions.
  (app as unknown as (req: unknown, res: unknown) => void)(req, res);
}
