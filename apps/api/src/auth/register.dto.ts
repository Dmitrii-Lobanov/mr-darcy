import { Transform } from 'class-transformer';
import {
  IsAscii,
  IsEmail,
  IsString,
  MaxLength,
  ValidateBy,
} from 'class-validator';

function hasValidPasswordLength(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const length = [...value].length;

  return length >= 15 && length <= 128;
}

export class RegisterDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsAscii()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @ValidateBy({
    name: 'passwordCodePointLength',
    validator: {
      validate: hasValidPasswordLength,
      defaultMessage: () =>
        'password must contain between 15 and 128 Unicode code points',
    },
  })
  password!: string;
}
