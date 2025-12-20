import { gql } from 'urql';

export const SEARCH_BOOKS = gql`
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

export const GET_BOOK = gql`
  query GetBook($id: ID!) {
    book(id: $id) {
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
  }
`;

export const GET_SERIES = gql`
  query GetSeries($id: ID!) {
    series(id: $id) {
      id
      name
      bookCount
      books {
        id
        title
        seriesPosition
        author {
          name
        }
      }
    }
  }
`;

export const LIST_SERIES = gql`
  query ListSeries {
    seriesList {
      id
      name
      bookCount
    }
  }
`;

export const LIST_AUTHORS = gql`
  query ListAuthors($search: String) {
    authors(search: $search) {
      name
    }
  }
`;