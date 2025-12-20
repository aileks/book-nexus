import { createClient, cacheExchange, fetchExchange } from 'urql';

const client = createClient({
  url: '/query',
  exchanges: [cacheExchange, fetchExchange],
});

export { client };