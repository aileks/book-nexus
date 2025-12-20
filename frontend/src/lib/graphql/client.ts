import { GraphQLClient } from 'graphql-request';

// Use full URL for graphql-request compatibility
const endpoint = `${window.location.origin}/query`;

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function requestWithError<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  try {
    const result = await graphqlClient.request<T>(query, variables);
    return result;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    throw error;
  }
}

export default graphqlClient;
