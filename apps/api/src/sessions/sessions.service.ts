import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { SessionEntity } from './session.entity.js';
import {
  SessionResponseDto,
  toSessionResponse,
} from './session-response.dto.js';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessions: Repository<SessionEntity>,
  ) {}

  async listUpcoming(): Promise<SessionResponseDto[]> {
    const sessions = await this.sessions
      .createQueryBuilder('session')
      .where('session.startsAt > statement_timestamp()')
      .orderBy('session.startsAt', 'ASC')
      .addOrderBy('session.id', 'ASC')
      .take(100)
      .getMany();

    return sessions.map(toSessionResponse);
  }

  async getById(id: string): Promise<SessionResponseDto> {
    const session = await this.sessions.findOneBy({ id });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return toSessionResponse(session);
  }
}
