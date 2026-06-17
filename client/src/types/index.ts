export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type RideStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';
export type NotificationType =
  | 'booking_requested'
  | 'booking_accepted'
  | 'booking_rejected'
  | 'booking_cancelled'
  | 'new_message'
  | 'ride_cancelled'
  | 'ride_completed'
  | 'new_rating';

export interface Vehicle {
  brand: string;
  model: string;
  year: number;
  color: string;
  plates: string;
  seats: number;
}

export interface User {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
  university: string;
  career: string;
  semester: number;
  description?: string;
  role: UserRole;
  status: UserStatus;
  vehicle?: Vehicle;
  ratingAverage: number;
  ratingCount: number;
  ridesCompleted: number;
  ridesPublished: number;
  passengersTransported: number;
  createdAt: string;
  updatedAt: string;
}

export interface Ride {
  _id: string;
  id: string;
  driver: User;
  origin: string;
  destination: string;
  departureAt: string;
  meetingPoint: string;
  pricePerSeat: number;
  totalSeats: number;
  seatsAvailable: number;
  description?: string;
  status: RideStatus;
  passengers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  id: string;
  ride: Ride;
  passenger: User;
  driver: User;
  seats: number;
  status: BookingStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  _id: string;
  id: string;
  ride: string;
  author: User;
  target: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  id: string;
  recipient: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  ride?: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  id: string;
  chat: string;
  sender: User;
  content: string;
  readBy: string[];
  createdAt: string;
}

export interface Chat {
  _id: string;
  id: string;
  ride: { _id: string; origin: string; destination: string; departureAt: string; status: RideStatus };
  participants: User[];
  lastMessage?: { content: string; sender: string; createdAt: string };
  lastMessageAt?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
