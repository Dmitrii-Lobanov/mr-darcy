import { fileURLToPath } from 'node:url';
import type { DataSourceOptions } from 'typeorm';
import { SessionEntity } from '../sessions/session.entity.js';

export function createDatabaseOptions(url: string) {
  return {
    type: 'postgres',
    url,

    entities: [SessionEntity],
    migrations: [fileURLToPath(new URL('./migrations/*.js', import.meta.url))],

    synchronize: false,
    migrationsRun: false,
    migrationsTransactionMode: 'all',

    connectTimeoutMS: 5000,
  } satisfies DataSourceOptions;
}
