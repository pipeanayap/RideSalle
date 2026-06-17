/** Roles del sistema. Pasajero/Conductor son intercambiables; admin es elevado. */
export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Estado de una cuenta (moderación admin). */
export const USER_STATUSES = ['active', 'suspended'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

/** Estados del ciclo de vida de un viaje. */
export const RIDE_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'] as const;
export type RideStatus = (typeof RIDE_STATUSES)[number];

/** Estados de una solicitud de reserva. */
export const BOOKING_STATUSES = ['pending', 'accepted', 'rejected', 'cancelled'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** Tipos de notificación soportados. */
export const NOTIFICATION_TYPES = [
  'booking_requested',
  'booking_accepted',
  'booking_rejected',
  'booking_cancelled',
  'new_message',
  'ride_cancelled',
  'ride_completed',
  'new_rating',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Payload firmado dentro del JWT de acceso. */
export interface JwtPayload {
  sub: string;
  role: UserRole;
}

/** Par de tokens emitido al autenticar. */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** Resultado paginado genérico para listados. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
