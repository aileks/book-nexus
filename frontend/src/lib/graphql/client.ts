import { GraphQLClient } from 'graphql-request';

const endpoint = '/query';

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add error handling wrapper
export async function requestWithError<T>(query: string, variables?: any): Promise<T> {
  try {
    console.log('Making GraphQL request to:', endpoint);
    console.log('Query:', query.substring(0, 100) + '...');
    console.log('Variables:', variables);
    const result = await graphqlClient.request<T>(query, variables);
    console.log('GraphQL response:', result);
    return result;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    throw error;
  }
}

export default graphqlClient;
