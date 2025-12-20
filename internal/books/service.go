package books

import (
	"book-nexus/internal/database/sqlc"
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db      *pgxpool.Pool
	queries *sqlc.Queries
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (s *Service) GetBook(ctx context.Context, id uuid.UUID) (*sqlc.Book, error) {
	book, err := s.queries.GetBookByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return &book, nil
}

func (s *Service) GetBookWithRelations(ctx context.Context, id uuid.UUID) (*sqlc.GetBookWithRelationsRow, error) {
	book, err := s.queries.GetBookWithRelations(ctx, id)
	if err != nil {
		return nil, err
	}
	return &book, nil
}

func (s *Service) ListBooks(ctx context.Context, limit, offset int32) ([]sqlc.Book, error) {
	return s.queries.ListBooks(ctx, sqlc.ListBooksParams{
		Limit:  limit,
		Offset: offset,
	})
}

func (s *Service) CountBooks(ctx context.Context) (int64, error) {
	return s.queries.CountBooks(ctx)
}

type SearchInput struct {
	Query       string
	AuthorID    string // UUID as string, empty for no filter
	PublisherID string // UUID as string, empty for no filter
	SeriesID    string // UUID as string, empty for no filter
	AuthorName  string
	Genre       string
	SortBy      string // Options: title_asc, title_desc, date_asc, date_desc, author
	Limit       int32
	Offset      int32
}

type SearchResult struct {
	Books []sqlc.Book
	Total int64
}

func (s *Service) SearchBooks(ctx context.Context, input SearchInput) (*SearchResult, error) {
	books, err := s.queries.SearchBooks(ctx, sqlc.SearchBooksParams{
		Column1: input.Query,
		Column2: input.AuthorID,
		Column3: input.PublisherID,
		Column4: input.SeriesID,
		Column5: input.AuthorName,
		Column6: input.Genre,
		Column7: input.SortBy,
		Limit:   input.Limit,
		Offset:  input.Offset,
	})
	if err != nil {
		return nil, err
	}

	count, err := s.queries.CountSearchResults(ctx, sqlc.CountSearchResultsParams{
		Column1: input.Query,
		Column2: input.AuthorID,
		Column3: input.PublisherID,
		Column4: input.SeriesID,
		Column5: input.AuthorName,
		Column6: input.Genre,
	})
	if err != nil {
		return nil, err
	}

	return &SearchResult{
		Books: books,
		Total: count,
	}, nil
}

func (s *Service) GetBooksByAuthor(ctx context.Context, authorID uuid.UUID) ([]sqlc.Book, error) {
	return s.queries.GetBooksByAuthor(ctx, authorID)
}

func (s *Service) GetBooksByPublisher(ctx context.Context, publisherID uuid.UUID) ([]sqlc.Book, error) {
	return s.queries.GetBooksByPublisher(ctx, pgtype.UUID{Bytes: publisherID, Valid: true})
}

func (s *Service) GetBooksBySeries(ctx context.Context, seriesID uuid.UUID) ([]sqlc.Book, error) {
	return s.queries.GetBooksBySeries(ctx, pgtype.UUID{Bytes: seriesID, Valid: true})
}

type CreateBookInput struct {
	Title          string
	Subtitle       *string
	AuthorID       uuid.UUID
	PublisherID    *uuid.UUID
	PublishedDate  *string
	ISBN10         *string
	ISBN13         *string
	Pages          *int32
	Language       *string
	Description    *string
	SeriesID       *uuid.UUID
	SeriesPosition *int32
	Genres         *string
	Tags           *string
	ImageURL       *string
}

func (s *Service) CreateBook(ctx context.Context, input CreateBookInput) (*sqlc.Book, error) {
	var publisherID, seriesID pgtype.UUID

	if input.PublisherID != nil {
		publisherID = pgtype.UUID{Bytes: *input.PublisherID, Valid: true}
	}
	if input.SeriesID != nil {
		seriesID = pgtype.UUID{Bytes: *input.SeriesID, Valid: true}
	}

	book, err := s.queries.CreateBook(ctx, sqlc.CreateBookParams{
		Title:          input.Title,
		Subtitle:       input.Subtitle,
		AuthorID:       input.AuthorID,
		PublisherID:    publisherID,
		PublishedDate:  nil, // TODO: parse date string
		Isbn10:         input.ISBN10,
		Isbn13:         input.ISBN13,
		Pages:          input.Pages,
		Language:       input.Language,
		Description:    input.Description,
		SeriesID:       seriesID,
		SeriesPosition: input.SeriesPosition,
		Genres:         input.Genres,
		Tags:           input.Tags,
		ImageUrl:       input.ImageURL,
	})
	if err != nil {
		return nil, err
	}
	return &book, nil
}

func (s *Service) DeleteBook(ctx context.Context, id uuid.UUID) error {
	return s.queries.DeleteBook(ctx, id)
}
