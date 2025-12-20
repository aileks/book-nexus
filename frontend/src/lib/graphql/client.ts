import { createClient, dedupExchange, cacheExchange, fetchExchange } from 'urql';

const client = createClient({
  url: '/query',
  exchanges: [dedupExchange, cacheExchange, fetchExchange],
});

export { client };