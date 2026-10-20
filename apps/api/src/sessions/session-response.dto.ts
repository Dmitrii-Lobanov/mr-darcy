import type { SessionEntity } from './session.entity.js';
import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  @ApiProperty({ type: String, maxLength: 120 })
  title!: string;

  @ApiProperty({ type: String })
  description!: string;

  @ApiProperty({ type: String, maxLength: 200 })
  location!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  startsAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  endsAt!: string;

  @ApiProperty({
    type: String,
    example: 'America/Guayaquil',
    description: 'IANA timezone used to display the session.',
  })
  timeZone!: string;

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    description: 'Total session capacity, not remaining availability.',
  })
  capacity!: number;

  @ApiProperty({
    type: 'integer',
    minimum: 0,
    example: 4800,
    description: 'Price per person in minor units: 4800 means USD 48.00.',
  })
  priceMinor!: number;

  @ApiProperty({ type: String, enum: ['USD'] })
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
