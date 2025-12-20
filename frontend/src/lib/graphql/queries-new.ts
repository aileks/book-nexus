import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from './client';
import type { SearchBooksInput, SearchResult } from './types';

const SEARCH_BOOKS_QUERY = `
  query SearchBooks($input: SearchBooksInput!) {
    searchBooks(input: $input) {
      books {
        id
        title
        subtitle
        publisher
        publishedDate
        author {
          name
        }
        isbn10
        isbn13
        pages
        language
        description
        seriesName
        seriesPosition
        genres
        tags
        imageUrl
        createdAt
        updatedAt
      }
      total
    }
  }
`;

export function useSearchBooks(input: SearchBooksInput) {
  return useQuery({
    queryKey: ['searchBooks', input],
    queryFn: async () => {
      const data = await graphqlClient.request<{
        searchBooks: SearchResult;
      }>(SEARCH_BOOKS_QUERY, { input });
      return data.searchBooks;
    },
    enabled: !!input.query,
  });
}