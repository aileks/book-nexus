export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;

// Author type with full details
export type Author = {
  id: string;
  name: string;
  slug?: Maybe<string>;
  bio?: Maybe<string>;
  books: Array<Book>;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
};

// Publisher type with full details
export type Publisher = {
  id: string;
  name: string;
  slug?: Maybe<string>;
  website?: Maybe<string>;
  books: Array<Book>;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
};

// Series type with full details
export type Series = {
  id: string;
  name: string;
  slug?: Maybe<string>;
  description?: Maybe<string>;
  books: Array<Book>;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
};

// Book type matching normalized GraphQL schema
export type Book = {
  id: string;
  title: string;
  subtitle?: Maybe<string>;
  author: Author;
  publisher?: Maybe<Publisher>;
  publishedDate?: Maybe<string>;
  isbn10?: Maybe<string>;
  isbn13?: Maybe<string>;
  pages?: Maybe<number>;
  language?: Maybe<string>;
  description?: Maybe<string>;
  series?: Maybe<Series>;
  seriesPosition?: Maybe<number>;
  genres?: Maybe<string>;
  tags?: Maybe<string>;
  imageUrl?: Maybe<string>;
  createdAt: string;
  updatedAt: string;
  recommendations: Array<Book>;
};

// Sort options for search
export type SortOption =
  | "title_asc"
  | "title_desc"
  | "date_asc"
  | "date_desc"
  | "author";

// Search input type
export type SearchBooksInput = {
  query?: InputMaybe<string>;
  authorId?: InputMaybe<string>;
  publisherId?: InputMaybe<string>;
  seriesId?: InputMaybe<string>;
  authorName?: InputMaybe<string>;
  genre?: InputMaybe<string>;
  sortBy?: InputMaybe<SortOption>;
  limit?: InputMaybe<number>;
  offset?: InputMaybe<number>;
};

// Search result type
export type SearchResult = {
  books: Array<Book>;
  total: number;
};

// New book input for mutations
export type NewBook = {
  title: string;
  subtitle?: InputMaybe<string>;
  authorId: string;
  publisherId?: InputMaybe<string>;
  publishedDate?: InputMaybe<string>;
  isbn10?: InputMaybe<string>;
  isbn13?: InputMaybe<string>;
  pages?: InputMaybe<number>;
  language?: InputMaybe<string>;
  description?: InputMaybe<string>;
  seriesId?: InputMaybe<string>;
  seriesPosition?: InputMaybe<number>;
  genres?: InputMaybe<string>;
  tags?: InputMaybe<string>;
  imageUrl?: InputMaybe<string>;
};

// Update book input for mutations
export type UpdateBook = NewBook;

// Author input types
export type NewAuthor = {
  name: string;
  slug?: InputMaybe<string>;
  bio?: InputMaybe<string>;
};

export type UpdateAuthor = NewAuthor;

// Series input types
export type NewSeries = {
  name: string;
  slug?: InputMaybe<string>;
  description?: InputMaybe<string>;
};

export type UpdateSeries = NewSeries;
