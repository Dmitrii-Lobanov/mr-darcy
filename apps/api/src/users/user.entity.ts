import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole = 'customer' | 'organizer';

@Entity('users')
@Index('users_email_unique', ['email'], { unique: true })
@Check(
  'users_email_normalized',
  `"email" = lower("email") AND "email" !~ '[[:space:]]'`,
)
@Check('users_email_nonblank', `length("email") > 0`)
@Check('users_email_ascii', `octet_length("email") = char_length("email")`)
@Check('users_role_valid', `"role" IN ('customer', 'organizer')`)
@Check('users_password_hash_nonblank', `length(btrim("password_hash")) > 0`)
export class UserEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 254 })
  email!: string;

  @Column({ name: 'password_hash', type: 'text', select: false })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 20, default: 'customer' })
  role!: UserRole;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
