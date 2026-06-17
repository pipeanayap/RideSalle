import { createServer } from 'node:http';
import { createApp } from './app.js';
import { connectToDatabase } from './config/db.js';
import { initSockets } from './sockets/index.js';
import { env } from './config/env.js';

/** Bootstrap del servidor para desarrollo local (con Socket.io). */
async function bootstrap(): Promise<void> {
  await connectToDatabase();

  const app = createApp();
  const httpServer = createServer(app);
  initSockets(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`RideSalle API escuchando en http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
});
