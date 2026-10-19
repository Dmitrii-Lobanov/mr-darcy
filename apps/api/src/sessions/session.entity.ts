import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity('sessions')
@Index('sessions_starts_at_id_idx', ['startsAt', 'id'])
@Check('sessions_capacity_positive', '"capacity" > 0')
@Check('sessions_price_nonnegative', '"price_minor" >= 0')
@Check('sessions_valid_time_range', '"ends_at" > "starts_at"')
@Check('sessions_currency_usd', `"currency" = 'USD'`)
@Check('sessions_title_nonblank', `length(btrim("title")) > 0`)
export class SessionEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 200 })
  location!: string;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt!: Date;

  @Column({ name: 'time_zone', type: 'varchar', length: 100 })
  timeZone!: string;

  @Column({ type: 'integer' })
  capacity!: number;

  @Column({ name: 'price_minor', type: 'integer' })
  priceMinor!: number;

  @Column({ type: 'char', length: 3, default: 'USD' })
  currency!: 'USD';

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
