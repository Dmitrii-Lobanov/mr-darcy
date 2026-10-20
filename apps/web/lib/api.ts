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

export async function getSession(id: string) {
  const { data, response } = await client.GET('/api/sessions/{id}', {
    params: {
      path: { id },
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });

  if (response.status === 400 || response.status === 404) {
    return null;
  }

  if (!response.ok || data === undefined) {
    throw new Error('Could not load the session');
  }

  return data;
}
