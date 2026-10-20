import type { SessionEntity } from './session.entity.js';

export class SessionResponseDto {
  id!: string;
  title!: string;
  description!: string;
  location!: string;
  startsAt!: string;
  endsAt!: string;
  timeZone!: string;
  capacity!: number;
  priceMinor!: number;
  currency!: 'USD';
}

export function toSessionResponse(session: SessionEntity): SessionResponseDto {
  return {
    id: session.id,
    title: session.title,
    description: session.description,
    location: session.location,
    startsAt: session.startsAt.toISOString(),
    endsAt: session.endsAt.toISOString(),
    timeZone: session.timeZone,
    capacity: session.capacity,
    priceMinor: session.priceMinor,
    currency: session.currency,
  };
}
