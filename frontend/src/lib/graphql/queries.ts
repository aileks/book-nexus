import { useQuery } from '@tanstack/react-query';
import { requestWithError } from './client';
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
      console.log('useSearchBooks called with input:', input);
      const data = await requestWithError<{
        searchBooks: SearchResult;
      }>(SEARCH_BOOKS_QUERY, { input });
      console.log('useSearchBooks received data:', data);
      return data.searchBooks;
    },
    enabled: !!input.query,
  });
}
