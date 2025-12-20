import { GraphQLClient } from 'graphql-request';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Author,
  Book,
  Series,
  NewBook,
  UpdateBook,
  NewAuthor,
  UpdateAuthor,
  NewSeries,
  UpdateSeries,
} from './types';

const endpoint = `${window.location.origin}/query`;

// Admin password stored in session storage
const ADMIN_PASSWORD_KEY = 'adminPassword';

export function getAdminPassword(): string {
  return sessionStorage.getItem(ADMIN_PASSWORD_KEY) || '';
}

export function setAdminPassword(password: string): void {
  sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
}

export function clearAdminPassword(): void {
  sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
}

function createAdminClient(): GraphQLClient {
  return new GraphQLClient(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Password': getAdminPassword(),
    },
  });
}

async function adminRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const client = createAdminClient();
  return client.request<T>(query, variables);
}

// Queries for listing entities
const LIST_AUTHORS_QUERY = `
  query ListAuthors($limit: Int, $offset: Int, $search: String) {
    authors(limit: $limit, offset: $offset, search: $search) {
      id
      name
      slug
      bio
      bookCount
    }
  }
`;

const LIST_SERIES_QUERY = `
  query ListSeries($limit: Int, $offset: Int, $search: String) {
    seriesList(limit: $limit, offset: $offset, search: $search) {
      id
      name
      slug
      description
      bookCount
    }
  }
`;

const LIST_BOOKS_QUERY = `
  query ListBooks($limit: Int, $offset: Int) {
    books(limit: $limit, offset: $offset) {
      id
      title
      subtitle
      author {
        id
        name
      }
      series {
        id
        name
      }
      seriesPosition
      publishedDate
      imageUrl
    }
  }
`;

// Mutations
const CREATE_BOOK_MUTATION = `
  mutation CreateBook($input: NewBook!) {
    createBook(input: $input) {
      id
      title
    }
  }
`;

const UPDATE_BOOK_MUTATION = `
  mutation UpdateBook($id: ID!, $input: UpdateBook!) {
    updateBook(id: $id, input: $input) {
      id
      title
    }
  }
`;

const DELETE_BOOK_MUTATION = `
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id)
  }
`;

const CREATE_AUTHOR_MUTATION = `
  mutation CreateAuthor($input: NewAuthor!) {
    createAuthor(input: $input) {
      id
      name
    }
  }
`;

const UPDATE_AUTHOR_MUTATION = `
  mutation UpdateAuthor($id: ID!, $input: UpdateAuthor!) {
    updateAuthor(id: $id, input: $input) {
      id
      name
    }
  }
`;

const DELETE_AUTHOR_MUTATION = `
  mutation DeleteAuthor($id: ID!) {
    deleteAuthor(id: $id)
  }
`;

const CREATE_SERIES_MUTATION = `
  mutation CreateSeries($input: NewSeries!) {
    createSeries(input: $input) {
      id
      name
    }
  }
`;

const UPDATE_SERIES_MUTATION = `
  mutation UpdateSeries($id: ID!, $input: UpdateSeries!) {
    updateSeries(id: $id, input: $input) {
      id
      name
    }
  }
`;

const DELETE_SERIES_MUTATION = `
  mutation DeleteSeries($id: ID!) {
    deleteSeries(id: $id)
  }
`;

// Query hooks
export function useAdminAuthors(search?: string) {
  return useQuery({
    queryKey: ['admin', 'authors', search],
    queryFn: async () => {
      const data = await adminRequest<{ authors: Author[] }>(LIST_AUTHORS_QUERY, {
        limit: 100,
        offset: 0,
        search: search || null,
      });
      return data.authors;
    },
  });
}

export function useAdminSeries(search?: string) {
  return useQuery({
    queryKey: ['admin', 'series', search],
    queryFn: async () => {
      const data = await adminRequest<{ seriesList: Series[] }>(LIST_SERIES_QUERY, {
        limit: 100,
        offset: 0,
        search: search || null,
      });
      return data.seriesList;
    },
  });
}

export function useAdminBooks() {
  return useQuery({
    queryKey: ['admin', 'books'],
    queryFn: async () => {
      const data = await adminRequest<{ books: Book[] }>(LIST_BOOKS_QUERY, {
        limit: 100,
        offset: 0,
      });
      return data.books;
    },
  });
}

// Mutation hooks
export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewBook) => {
      const data = await adminRequest<{ createBook: Book }>(CREATE_BOOK_MUTATION, { input });
      return data.createBook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateBook }) => {
      const data = await adminRequest<{ updateBook: Book }>(UPDATE_BOOK_MUTATION, { id, input });
      return data.updateBook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
      queryClient.invalidateQueries({ queryKey: ['book'] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const data = await adminRequest<{ deleteBook: boolean }>(DELETE_BOOK_MUTATION, { id });
      return data.deleteBook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
    },
  });
}

export function useCreateAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewAuthor) => {
      const data = await adminRequest<{ createAuthor: Author }>(CREATE_AUTHOR_MUTATION, { input });
      return data.createAuthor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] });
    },
  });
}

export function useUpdateAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateAuthor }) => {
      const data = await adminRequest<{ updateAuthor: Author }>(UPDATE_AUTHOR_MUTATION, { id, input });
      return data.updateAuthor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] });
      queryClient.invalidateQueries({ queryKey: ['author'] });
    },
  });
}

export function useDeleteAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const data = await adminRequest<{ deleteAuthor: boolean }>(DELETE_AUTHOR_MUTATION, { id });
      return data.deleteAuthor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] });
    },
  });
}

export function useCreateSeries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewSeries) => {
      const data = await adminRequest<{ createSeries: Series }>(CREATE_SERIES_MUTATION, { input });
      return data.createSeries;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'series'] });
    },
  });
}

export function useUpdateSeries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateSeries }) => {
      const data = await adminRequest<{ updateSeries: Series }>(UPDATE_SERIES_MUTATION, { id, input });
      return data.updateSeries;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'series'] });
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
  });
}

export function useDeleteSeries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const data = await adminRequest<{ deleteSeries: boolean }>(DELETE_SERIES_MUTATION, { id });
      return data.deleteSeries;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'series'] });
    },
  });
}
