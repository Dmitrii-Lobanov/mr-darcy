import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SessionResponseDto } from './session-response.dto.js';
import { SessionsService } from './sessions.service.js';

@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({
    operationId: 'listSessions',
    summary: 'List upcoming sessions',
    description: 'Returns at most 100 sessions, ordered by start time and ID.',
  })
  @ApiOkResponse({
    type: SessionResponseDto,
    isArray: true,
  })
  listUpcoming(): Promise<SessionResponseDto[]> {
    return this.sessionsService.listUpcoming();
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getSession',
    summary: 'Get a session by ID',
    description: 'Returns an existing session, including past sessions.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({ type: SessionResponseDto })
  @ApiBadRequestResponse({ description: 'Malformed session UUID.' })
  @ApiNotFoundResponse({ description: 'Session not found.' })
  getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<SessionResponseDto> {
    return this.sessionsService.getById(id);
  }
}
