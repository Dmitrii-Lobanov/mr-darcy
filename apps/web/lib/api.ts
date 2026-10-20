import 'server-only';
import createClient from 'openapi-fetch';
import type { paths } from '@mr-darcy/api-contract';

const apiOrigin = process.env.API_ORIGIN;

if (!apiOrigin) {
  throw new Error('API_ORIGIN must be configured');
}

const client = createClient<paths>({
  baseUrl: apiOrigin,
});

export async function getSessions() {
  const { data, response } = await client.GET('/api/sessions', {
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok || data === undefined) {
    throw new Error('Could not load sessions');
  }

  return data;
}
