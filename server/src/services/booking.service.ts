import { Types, startSession } from 'mongoose';
import { bookingRepository } from '../repositories/booking.repository.js';
import { rideRepository } from '../repositories/ride.repository.js';
import { notificationService } from './notification.service.js';
import { badRequest, forbidden, notFound } from '../utils/AppError.js';
import type { CreateBookingInput } from '../validation/booking.schema.js';
import type { BookingDocument } from '../models/Booking.js';

async function getOwnedBooking(bookingId: string, passengerId: string): Promise<BookingDocument> {
  const booking = await bookingRepository.findRaw(bookingId);
  if (!booking) throw notFound('Reserva no encontrada');
  if (booking.passenger.toString() !== passengerId)
    throw forbidden('No tienes permisos sobre esta reserva');
  return booking;
}

export const bookingService = {
  async create(passengerId: string, input: CreateBookingInput): Promise<BookingDocument> {
    const session = await startSession();
    try {
      session.startTransaction();

      const ride = await rideRepository.findRaw(input.rideId, session);
      if (!ride) throw notFound('Viaje no encontrado');
      if (ride.status !== 'scheduled') throw badRequest('El viaje no está disponible');
      if (ride.driver.toString() === passengerId)
        throw badRequest('El conductor no puede reservar su propio viaje');
      if (ride.seatsAvailable < input.seats)
        throw badRequest(`Solo quedan ${ride.seatsAvailable} asientos disponibles`);

      const existing = await bookingRepository.findOne({
        ride: new Types.ObjectId(input.rideId),
        passenger: new Types.ObjectId(passengerId),
        status: { $in: ['pending', 'accepted'] },
      });
      if (existing) throw badRequest('Ya tienes una reserva activa para este viaje');

      const booking = await bookingRepository.create(
        {
          ride: new Types.ObjectId(input.rideId),
          passenger: new Types.ObjectId(passengerId),
          driver: ride.driver,
          seats: input.seats,
          message: input.message,
        },
        session,
      );

      if (!booking) throw new Error('Error al crear la reserva');

      ride.seatsAvailable -= input.seats;
      if (ride.seatsAvailable === 0) ride.status = 'scheduled';
      await ride.save({ session });

      await session.commitTransaction();

      await notificationService.create({
        recipient: ride.driver.toString(),
        type: 'booking_requested',
        title: 'Nueva solicitud de reserva',
        body: `Un pasajero solicitó ${input.seats} asiento(s) en tu viaje ${ride.origin} → ${ride.destination}`,
        ride: ride.id as string,
      });

      return booking;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  },

  async listAsPassenger(passengerId: string): Promise<BookingDocument[]> {
    return bookingRepository.findByFilter({ passenger: new Types.ObjectId(passengerId) });
  },

  async listAsDriver(driverId: string): Promise<BookingDocument[]> {
    return bookingRepository.findByFilter({
      driver: new Types.ObjectId(driverId),
      status: 'pending',
    });
  },

  async accept(bookingId: string, driverId: string): Promise<BookingDocument> {
    const booking = await bookingRepository.findRaw(bookingId);
    if (!booking) throw notFound('Reserva no encontrada');
    if (booking.driver.toString() !== driverId)
      throw forbidden('Solo el conductor puede aceptar reservas');
    if (booking.status !== 'pending') throw badRequest('La reserva ya fue procesada');

    const ride = await rideRepository.findRaw(booking.ride.toString());
    if (!ride || ride.seatsAvailable < booking.seats)
      throw badRequest('No hay suficientes asientos disponibles');

    booking.status = 'accepted';
    await booking.save();

    ride.passengers.push(booking.passenger);
    if (!ride.passengers.includes(booking.passenger)) {
      ride.passengers.push(booking.passenger);
    }
    await ride.save();

    await notificationService.create({
      recipient: booking.passenger.toString(),
      type: 'booking_accepted',
      title: 'Reserva aceptada',
      body: `Tu reserva para el viaje ${ride.origin} → ${ride.destination} fue aceptada`,
      ride: ride.id as string,
    });

    return booking;
  },

  async reject(bookingId: string, driverId: string): Promise<BookingDocument> {
    const booking = await bookingRepository.findRaw(bookingId);
    if (!booking) throw notFound('Reserva no encontrada');
    if (booking.driver.toString() !== driverId)
      throw forbidden('Solo el conductor puede rechazar reservas');
    if (booking.status !== 'pending') throw badRequest('La reserva ya fue procesada');

    const session = await startSession();
    try {
      session.startTransaction();

      booking.status = 'rejected';
      await booking.save({ session });

      await rideRepository.updateById(
        booking.ride.toString(),
        { $inc: { seatsAvailable: booking.seats } },
        session,
      );

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }

    await notificationService.create({
      recipient: booking.passenger.toString(),
      type: 'booking_rejected',
      title: 'Reserva rechazada',
      body: `Tu solicitud de reserva fue rechazada por el conductor`,
      ride: booking.ride.toString(),
    });

    return booking;
  },

  async cancelByPassenger(bookingId: string, passengerId: string): Promise<BookingDocument> {
    const booking = await getOwnedBooking(bookingId, passengerId);
    if (booking.status === 'cancelled' || booking.status === 'rejected')
      throw badRequest('La reserva ya fue cancelada');

    const seatsToRestore = booking.status === 'accepted' ? booking.seats : booking.seats;
    booking.status = 'cancelled';
    await booking.save();

    await rideRepository.updateById(booking.ride.toString(), {
      $inc: { seatsAvailable: seatsToRestore },
    });

    await notificationService.create({
      recipient: booking.driver.toString(),
      type: 'booking_cancelled',
      title: 'Reserva cancelada',
      body: 'Un pasajero canceló su reserva',
      ride: booking.ride.toString(),
    });

    return booking;
  },

  async getById(bookingId: string, userId: string): Promise<BookingDocument> {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw notFound('Reserva no encontrada');
    const isParty =
      booking.passenger.toString() === userId || booking.driver.toString() === userId;
    if (!isParty) throw forbidden('No tienes acceso a esta reserva');
    return booking;
  },
};
