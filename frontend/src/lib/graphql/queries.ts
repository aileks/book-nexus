import { useQuery } from "@tanstack/react-query";
import { requestWithError } from "./client";
import type {
  Book,
  Author,
  Series,
  SearchBooksInput,
  SearchResult,
} from "./types";

// Fragment for book list items (used in search results)
const BOOK_LIST_FRAGMENT = `
  fragment BookListItem on Book {
    id
    title
    subtitle
    publishedDate
    author {
      id
      name
      slug
    }
    publisher {
      id
      name
      slug
    }
    series {
      id
      name
      slug
    }
    seriesPosition
    pages
    language
    genres
    tags
    imageUrl
  }
`;

// Fragment for full book details
const BOOK_DETAIL_FRAGMENT = `
  fragment BookDetail on Book {
    id
    title
    subtitle
    publishedDate
    author {
      id
      name
      slug
      bio
      bookCount
    }
    publisher {
      id
      name
      slug
      website
    }
    series {
      id
      name
      slug
      description
      bookCount
    }
    seriesPosition
    isbn10
    isbn13
    pages
    language
    description
    genres
    tags
    imageUrl
    createdAt
    updatedAt
    recommendations {
      id
      title
      imageUrl
      author {
        name
      }
    }
  }
`;

const SEARCH_BOOKS_QUERY = `
  ${BOOK_LIST_FRAGMENT}
  query SearchBooks($input: SearchBooksInput!) {
    searchBooks(input: $input) {
      books {
        ...BookListItem
      }
      total
    }
  }
`;

const GET_BOOK_QUERY = `
  ${BOOK_DETAIL_FRAGMENT}
  query GetBook($id: ID!) {
    book(id: $id) {
      ...BookDetail
    }
  }
`;

const GET_AUTHOR_QUERY = `
  query GetAuthor($id: ID!) {
    author(id: $id) {
      id
      name
      slug
      bio
      bookCount
      books {
        id
        title
        subtitle
        imageUrl
        publishedDate
        series {
          id
          name
        }
        seriesPosition
      }
    }
  }
`;

const GET_AUTHOR_BY_SLUG_QUERY = `
  query GetAuthorBySlug($slug: String!) {
    authorBySlug(slug: $slug) {
      id
      name
      slug
      bio
      bookCount
      books {
        id
        title
        subtitle
        imageUrl
        publishedDate
        series {
          id
          name
        }
        seriesPosition
      }
    }
  }
`;

const GET_SERIES_QUERY = `
  query GetSeries($id: ID!) {
    series(id: $id) {
      id
      name
      slug
      description
      bookCount
      books {
        id
        title
        subtitle
        imageUrl
        publishedDate
        seriesPosition
        author {
          id
          name
        }
      }
    }
  }
`;

const GET_SERIES_BY_SLUG_QUERY = `
  query GetSeriesBySlug($slug: String!) {
    seriesBySlug(slug: $slug) {
      id
      name
      slug
      description
      bookCount
      books {
        id
        title
        subtitle
        imageUrl
        publishedDate
        seriesPosition
        author {
          id
          name
        }
      }
    }
  }
`;

export function useSearchBooks(input: SearchBooksInput) {
  // Allow search with either query or genre filter
  const hasSearchCriteria = !!(input.query || input.genre);

  return useQuery({
    queryKey: ["searchBooks", input],
    queryFn: async () => {
      const data = await requestWithError<{ searchBooks: SearchResult }>(
        SEARCH_BOOKS_QUERY,
        { input },
      );
      return data.searchBooks;
    },
    enabled: hasSearchCriteria,
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ["book", id],
    queryFn: async () => {
      const data = await requestWithError<{ book: Book | null }>(
        GET_BOOK_QUERY,
        { id },
      );
      return data.book;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes - book details don't change often
    gcTime: 1000 * 60 * 60, // 1 hour - keep book data in cache longer
  });
}

export function useAuthor(id: string) {
  return useQuery({
    queryKey: ["author", id],
    queryFn: async () => {
      const data = await requestWithError<{ author: Author | null }>(
        GET_AUTHOR_QUERY,
        { id },
      );
      return data.author;
    },
    enabled: !!id,
  });
}

export function useAuthorBySlug(slug: string) {
  return useQuery({
    queryKey: ["authorBySlug", slug],
    queryFn: async () => {
      const data = await requestWithError<{ authorBySlug: Author | null }>(
        GET_AUTHOR_BY_SLUG_QUERY,
        { slug },
      );
      return data.authorBySlug;
    },
    enabled: !!slug,
  });
}

export function useSeries(id: string) {
  return useQuery({
    queryKey: ["series", id],
    queryFn: async () => {
      const data = await requestWithError<{ series: Series | null }>(
        GET_SERIES_QUERY,
        { id },
      );
      return data.series;
    },
    enabled: !!id,
  });
}

export function useSeriesBySlug(slug: string) {
  return useQuery({
    queryKey: ["seriesBySlug", slug],
    queryFn: async () => {
      const data = await requestWithError<{ seriesBySlug: Series | null }>(
        GET_SERIES_BY_SLUG_QUERY,
        { slug },
      );
      return data.seriesBySlug;
    },
    enabled: !!slug,
  });
}
