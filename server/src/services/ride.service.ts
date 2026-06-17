import type { FilterQuery } from 'mongoose';
import { Types } from 'mongoose';
import { rideRepository } from '../repositories/ride.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { notificationService } from './notification.service.js';
import type { IRide } from '../models/Ride.js';
import type { RideDocument } from '../models/Ride.js';
import { badRequest, forbidden, notFound } from '../utils/AppError.js';
import { buildPaginated, resolvePagination } from '../utils/pagination.js';
import type { CreateRideInput, SearchRidesInput, UpdateRideInput } from '../validation/ride.schema.js';

async function getOwnedRide(rideId: string, driverId: string): Promise<RideDocument> {
  const ride = await rideRepository.findRaw(rideId);
  if (!ride) {
    throw notFound('Viaje no encontrado');
  }
  if (ride.driver.toString() !== driverId) {
    throw forbidden('Solo el conductor puede modificar este viaje');
  }
  return ride;
}

function buildSearchFilter(params: SearchRidesInput): FilterQuery<IRide> {
  const filter: FilterQuery<IRide> = {
    status: 'scheduled',
    departureAt: { $gt: new Date() },
    seatsAvailable: { $gt: 0 },
  };

  if (params.origin) filter.origin = { $regex: params.origin, $options: 'i' };
  if (params.destination) filter.destination = { $regex: params.destination, $options: 'i' };
  if (params.maxPrice !== undefined) filter.pricePerSeat = { $lte: params.maxPrice };
  if (params.minSeats !== undefined) filter.seatsAvailable = { $gte: params.minSeats };

  if (params.date) {
    const start = new Date(params.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    filter.departureAt = { $gte: start < new Date() ? new Date() : start, $lt: end };
  }

  return filter;
}

export const rideService = {
  async create(driverId: string, input: CreateRideInput): Promise<RideDocument> {
    const driver = await userRepository.findById(driverId);
    if (!driver) {
      throw notFound('Usuario no encontrado');
    }
    if (!driver.vehicle) {
      throw badRequest('Debes registrar un vehículo antes de publicar viajes');
    }
    if (input.totalSeats > driver.vehicle.seats) {
      throw badRequest('Los asientos ofrecidos superan la capacidad de tu vehículo');
    }

    const ride = await rideRepository.create({
      driver: new Types.ObjectId(driverId),
      ...input,
      seatsAvailable: input.totalSeats,
    });

    await userRepository.updateById(driverId, { $inc: { ridesPublished: 1 } });
    return ride;
  },

  async getById(rideId: string): Promise<RideDocument> {
    const ride = await rideRepository.findById(rideId);
    if (!ride) {
      throw notFound('Viaje no encontrado');
    }
    return ride;
  },

  async search(params: SearchRidesInput) {
    const { page, limit } = resolvePagination(params.page, params.limit);
    const { items, total } = await rideRepository.paginate(buildSearchFilter(params), page, limit);
    return buildPaginated(items, total, { page, limit });
  },

  async update(rideId: string, driverId: string, input: UpdateRideInput): Promise<RideDocument> {
    const ride = await getOwnedRide(rideId, driverId);
    if (ride.status !== 'scheduled') {
      throw badRequest('Solo se pueden editar viajes programados');
    }

    if (input.totalSeats !== undefined) {
      const reserved = ride.totalSeats - ride.seatsAvailable;
      if (input.totalSeats < reserved) {
        throw badRequest('No puedes reducir los asientos por debajo de los ya reservados');
      }
      ride.seatsAvailable = input.totalSeats - reserved;
      ride.totalSeats = input.totalSeats;
    }

    if (input.origin !== undefined) ride.origin = input.origin;
    if (input.destination !== undefined) ride.destination = input.destination;
    if (input.departureAt !== undefined) ride.departureAt = input.departureAt;
    if (input.meetingPoint !== undefined) ride.meetingPoint = input.meetingPoint;
    if (input.pricePerSeat !== undefined) ride.pricePerSeat = input.pricePerSeat;
    if (input.description !== undefined) ride.description = input.description;

    await ride.save();
    return ride;
  },

  async cancel(rideId: string, driverId: string): Promise<RideDocument> {
    const ride = await getOwnedRide(rideId, driverId);
    if (ride.status === 'completed' || ride.status === 'cancelled') {
      throw badRequest('El viaje ya no puede cancelarse');
    }
    ride.status = 'cancelled';
    await ride.save();

    await Promise.all(
      ride.passengers.map((passengerId) =>
        notificationService.create({
          recipient: passengerId.toString(),
          type: 'ride_cancelled',
          title: 'Viaje cancelado',
          body: `El viaje ${ride.origin} → ${ride.destination} fue cancelado por el conductor`,
          ride: ride.id as string,
        }),
      ),
    );
    return ride;
  },

  async complete(rideId: string, driverId: string): Promise<RideDocument> {
    const ride = await getOwnedRide(rideId, driverId);
    if (ride.status !== 'scheduled' && ride.status !== 'in_progress') {
      throw badRequest('El viaje no puede marcarse como completado');
    }
    ride.status = 'completed';
    await ride.save();

    const passengerCount = ride.passengers.length;
    await userRepository.updateById(driverId, {
      $inc: { passengersTransported: passengerCount },
    });

    await Promise.all(
      ride.passengers.map((passengerId) =>
        Promise.all([
          userRepository.updateById(passengerId.toString(), { $inc: { ridesCompleted: 1 } }),
          notificationService.create({
            recipient: passengerId.toString(),
            type: 'ride_completed',
            title: 'Viaje completado',
            body: `Tu viaje ${ride.origin} → ${ride.destination} ha finalizado. ¡Califica a tu conductor!`,
            ride: ride.id as string,
          }),
        ]),
      ),
    );
    return ride;
  },

  async listAsDriver(driverId: string): Promise<RideDocument[]> {
    const { items } = await rideRepository.paginate({ driver: new Types.ObjectId(driverId) }, 1, 50);
    return items;
  },
};
