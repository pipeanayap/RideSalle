import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Conexión a MongoDB Atlas. Reutiliza la conexión existente (importante en serverless,
 * donde la función puede reusar el contexto entre invocaciones).
 */
let connection: typeof mongoose | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (connection && mongoose.connection.readyState === 1) {
    return connection;
  }

  mongoose.set('strictQuery', true);
  connection = await mongoose.connect(env.MONGODB_URI);
  return connection;
}
