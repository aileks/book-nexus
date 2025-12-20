package publishers

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

func (s *Service) GetPublisher(ctx context.Context, id uuid.UUID) (*sqlc.Publisher, error) {
	publisher, err := s.queries.GetPublisherByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return &publisher, nil
}

func (s *Service) GetPublisherBySlug(ctx context.Context, slug string) (*sqlc.Publisher, error) {
	publisher, err := s.queries.GetPublisherBySlug(ctx, &slug)
	if err != nil {
		return nil, err
	}
	return &publisher, nil
}

func (s *Service) GetPublisherByName(ctx context.Context, name string) (*sqlc.Publisher, error) {
	publisher, err := s.queries.GetPublisherByName(ctx, name)
	if err != nil {
		return nil, err
	}
	return &publisher, nil
}

func (s *Service) ListPublishers(ctx context.Context, limit, offset int32) ([]sqlc.Publisher, error) {
	return s.queries.ListPublishers(ctx, sqlc.ListPublishersParams{
		Limit:  limit,
		Offset: offset,
	})
}

func (s *Service) SearchPublishers(ctx context.Context, query string, limit, offset int32) ([]sqlc.Publisher, error) {
	return s.queries.SearchPublishers(ctx, sqlc.SearchPublishersParams{
		Column1: &query,
		Limit:   limit,
		Offset:  offset,
	})
}

func (s *Service) CountPublishers(ctx context.Context) (int64, error) {
	return s.queries.CountPublishers(ctx)
}

func (s *Service) GetPublisherBookCount(ctx context.Context, publisherID uuid.UUID) (int64, error) {
	return s.queries.GetPublisherBookCount(ctx, pgtype.UUID{Bytes: publisherID, Valid: true})
}

type CreatePublisherInput struct {
	Name    string
	Slug    *string
	Website *string
}

func (s *Service) CreatePublisher(ctx context.Context, input CreatePublisherInput) (*sqlc.Publisher, error) {
	publisher, err := s.queries.CreatePublisher(ctx, sqlc.CreatePublisherParams{
		Name:    input.Name,
		Slug:    input.Slug,
		Website: input.Website,
	})
	if err != nil {
		return nil, err
	}
	return &publisher, nil
}

type UpdatePublisherInput struct {
	ID      uuid.UUID
	Name    string
	Slug    *string
	Website *string
}

func (s *Service) UpdatePublisher(ctx context.Context, input UpdatePublisherInput) (*sqlc.Publisher, error) {
	publisher, err := s.queries.UpdatePublisher(ctx, sqlc.UpdatePublisherParams{
		ID:      input.ID,
		Name:    input.Name,
		Slug:    input.Slug,
		Website: input.Website,
	})
	if err != nil {
		return nil, err
	}
	return &publisher, nil
}

func (s *Service) DeletePublisher(ctx context.Context, id uuid.UUID) error {
	return s.queries.DeletePublisher(ctx, id)
}
