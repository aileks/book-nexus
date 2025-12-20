export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Author = {
  books: Array<Book>;
  name: Scalars['String']['output'];
};

export type Book = {
  author: Author;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  genres?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isbn10?: Maybe<Scalars['String']['output']>;
  isbn13?: Maybe<Scalars['String']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  pages?: Maybe<Scalars['Int']['output']>;
  publishedDate?: Maybe<Scalars['String']['output']>;
  publisher?: Maybe<Scalars['String']['output']>;
  recommendations: Array<Book>;
  seriesName?: Maybe<Scalars['String']['output']>;
  seriesPosition?: Maybe<Scalars['Int']['output']>;
  subtitle?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Mutation = {
  createBook: Book;
};


export type MutationCreateBookArgs = {
  input: NewBook;
};

export type NewBook = {
  author: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  genres?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isbn10?: InputMaybe<Scalars['String']['input']>;
  isbn13?: InputMaybe<Scalars['String']['input']>;
  language?: InputMaybe<Scalars['String']['input']>;
  pages?: InputMaybe<Scalars['Int']['input']>;
  publishedDate?: InputMaybe<Scalars['String']['input']>;
  publisher?: InputMaybe<Scalars['String']['input']>;
  seriesName?: InputMaybe<Scalars['String']['input']>;
  seriesPosition?: InputMaybe<Scalars['Int']['input']>;
  subtitle?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type Query = {
  authors: Array<Author>;
  book?: Maybe<Book>;
  books: Array<Book>;
  searchBooks: SearchResult;
  series?: Maybe<Series>;
  seriesList: Array<Series>;
};


export type QueryAuthorsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBookArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySearchBooksArgs = {
  input: SearchBooksInput;
};


export type QuerySeriesArgs = {
  id: Scalars['ID']['input'];
};

export type SearchBooksInput = {
  author?: InputMaybe<Scalars['String']['input']>;
  genres?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  publisher?: InputMaybe<Scalars['String']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  series?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Scalars['String']['input']>;
};

export type SearchResult = {
  books: Array<Book>;
  total: Scalars['Int']['output'];
};

export type Series = {
  bookCount: Scalars['Int']['output'];
  books: Array<Book>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug?: Maybe<Scalars['String']['output']>;
};

export type SearchBooksQueryVariables = Exact<{
  input: SearchBooksInput;
}>;


export type SearchBooksQuery = { searchBooks: { total: number, books: Array<{ id: string, title: string, subtitle?: string | null, publisher?: string | null, publishedDate?: string | null, isbn10?: string | null, isbn13?: string | null, pages?: number | null, language?: string | null, description?: string | null, seriesName?: string | null, seriesPosition?: number | null, genres?: string | null, tags?: string | null, imageUrl?: string | null, createdAt: string, updatedAt: string, author: { name: string } }> } };

export type GetBookQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetBookQuery = { book?: { id: string, title: string, subtitle?: string | null, publisher?: string | null, publishedDate?: string | null, isbn10?: string | null, isbn13?: string | null, pages?: number | null, language?: string | null, description?: string | null, seriesName?: string | null, seriesPosition?: number | null, genres?: string | null, tags?: string | null, imageUrl?: string | null, createdAt: string, updatedAt: string, author: { name: string } } | null };

export type GetSeriesQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSeriesQuery = { series?: { id: string, name: string, bookCount: number, books: Array<{ id: string, title: string, seriesPosition?: number | null, author: { name: string } }> } | null };

export type ListSeriesQueryVariables = Exact<{ [key: string]: never; }>;


export type ListSeriesQuery = { seriesList: Array<{ id: string, name: string, bookCount: number }> };

export type ListAuthorsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type ListAuthorsQuery = { authors: Array<{ name: string }> };
