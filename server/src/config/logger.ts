import { env } from './env.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const minLevel: LogLevel = env.NODE_ENV === 'production' ? 'info' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];
}

function serializeMeta(meta: unknown): string {
  if (meta instanceof Error) {
    return JSON.stringify({ message: meta.message, stack: meta.stack, name: meta.name });
  }
  return JSON.stringify(meta);
}

function format(level: LogLevel, message: string, meta?: unknown): string {
  const base = `${new Date().toISOString()} [${level.toUpperCase()}] ${message}`;
  if (meta === undefined) return base;
  return `${base} ${serializeMeta(meta)}`;
}

/**
 * Logger minimalista sin dependencias. Silencia `debug`/`info` en producción salvo lo
 * necesario y nunca expone objetos de error completos en producción.
 */
export const logger = {
  debug(message: string, meta?: unknown): void {
    if (shouldLog('debug')) console.debug(format('debug', message, meta));
  },
  info(message: string, meta?: unknown): void {
    if (shouldLog('info')) console.info(format('info', message, meta));
  },
  warn(message: string, meta?: unknown): void {
    if (shouldLog('warn')) console.warn(format('warn', message, meta));
  },
  error(message: string, meta?: unknown): void {
    if (shouldLog('error')) console.error(format('error', message, meta));
  },
};
