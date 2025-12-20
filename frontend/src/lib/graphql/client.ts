import { GraphQLClient } from 'graphql-request';

const endpoint = '/query';

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
});

export default graphqlClient;
