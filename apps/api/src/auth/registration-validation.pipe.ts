import { Injectable, ValidationPipe } from '@nestjs/common';

@Injectable()
export class RegistrationValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
      validationError: {
        target: false,
        value: false,
      },
    });
  }
}
