package authors

import (
	"book-nexus/internal/database/sqlc"
	"context"

	"github.com/google/uuid"
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

func (s *Service) GetAuthor(ctx context.Context, id uuid.UUID) (*sqlc.Author, error) {
	author, err := s.queries.GetAuthorByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return &author, nil
}

func (s *Service) GetAuthorBySlug(ctx context.Context, slug string) (*sqlc.Author, error) {
	author, err := s.queries.GetAuthorBySlug(ctx, &slug)
	if err != nil {
		return nil, err
	}
	return &author, nil
}

func (s *Service) GetAuthorByName(ctx context.Context, name string) (*sqlc.Author, error) {
	author, err := s.queries.GetAuthorByName(ctx, name)
	if err != nil {
		return nil, err
	}
	return &author, nil
}

func (s *Service) ListAuthors(ctx context.Context, limit, offset int32) ([]sqlc.Author, error) {
	return s.queries.ListAuthors(ctx, sqlc.ListAuthorsParams{
		Limit:  limit,
		Offset: offset,
	})
}

func (s *Service) SearchAuthors(ctx context.Context, query string, limit, offset int32) ([]sqlc.Author, error) {
	return s.queries.SearchAuthors(ctx, sqlc.SearchAuthorsParams{
		Column1: &query,
		Limit:   limit,
		Offset:  offset,
	})
}

func (s *Service) CountAuthors(ctx context.Context) (int64, error) {
	return s.queries.CountAuthors(ctx)
}

func (s *Service) CountAuthorsSearch(ctx context.Context, query string) (int64, error) {
	return s.queries.CountAuthorsSearch(ctx, &query)
}

func (s *Service) GetAuthorBookCount(ctx context.Context, authorID uuid.UUID) (int64, error) {
	return s.queries.GetAuthorBookCount(ctx, authorID)
}

type CreateAuthorInput struct {
	Name string
	Slug *string
	Bio  *string
}

func (s *Service) CreateAuthor(ctx context.Context, input CreateAuthorInput) (*sqlc.Author, error) {
	author, err := s.queries.CreateAuthor(ctx, sqlc.CreateAuthorParams{
		Name: input.Name,
		Slug: input.Slug,
		Bio:  input.Bio,
	})
	if err != nil {
		return nil, err
	}
	return &author, nil
}

type UpdateAuthorInput struct {
	ID   uuid.UUID
	Name string
	Slug *string
	Bio  *string
}

func (s *Service) UpdateAuthor(ctx context.Context, input UpdateAuthorInput) (*sqlc.Author, error) {
	author, err := s.queries.UpdateAuthor(ctx, sqlc.UpdateAuthorParams{
		ID:   input.ID,
		Name: input.Name,
		Slug: input.Slug,
		Bio:  input.Bio,
	})
	if err != nil {
		return nil, err
	}
	return &author, nil
}

func (s *Service) DeleteAuthor(ctx context.Context, id uuid.UUID) error {
	return s.queries.DeleteAuthor(ctx, id)
}
