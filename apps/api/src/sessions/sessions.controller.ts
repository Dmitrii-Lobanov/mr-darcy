import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import type { SessionResponseDto } from './session-response.dto.js';
import { SessionsService } from './sessions.service.js';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  listUpcoming(): Promise<SessionResponseDto[]> {
    return this.sessionsService.listUpcoming();
  }

  @Get(':id')
  getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<SessionResponseDto> {
    return this.sessionsService.getById(id);
  }
}
