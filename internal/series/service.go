package series

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

func (s *Service) GetSeries(ctx context.Context, id uuid.UUID) (*sqlc.Series, error) {
	series, err := s.queries.GetSeriesByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return &series, nil
}

func (s *Service) GetSeriesBySlug(ctx context.Context, slug string) (*sqlc.Series, error) {
	series, err := s.queries.GetSeriesBySlug(ctx, &slug)
	if err != nil {
		return nil, err
	}
	return &series, nil
}

func (s *Service) GetSeriesByName(ctx context.Context, name string) (*sqlc.Series, error) {
	series, err := s.queries.GetSeriesByName(ctx, name)
	if err != nil {
		return nil, err
	}
	return &series, nil
}

func (s *Service) ListSeries(ctx context.Context, limit, offset int32) ([]sqlc.Series, error) {
	return s.queries.ListSeries(ctx, sqlc.ListSeriesParams{
		Limit:  limit,
		Offset: offset,
	})
}

func (s *Service) SearchSeries(ctx context.Context, query string, limit, offset int32) ([]sqlc.Series, error) {
	return s.queries.SearchSeries(ctx, sqlc.SearchSeriesParams{
		Column1: &query,
		Limit:   limit,
		Offset:  offset,
	})
}

func (s *Service) CountSeries(ctx context.Context) (int64, error) {
	return s.queries.CountSeries(ctx)
}

func (s *Service) GetSeriesBookCount(ctx context.Context, seriesID uuid.UUID) (int64, error) {
	return s.queries.GetSeriesBookCount(ctx, pgtype.UUID{Bytes: seriesID, Valid: true})
}

type CreateSeriesInput struct {
	Name        string
	Slug        *string
	Description *string
}

func (s *Service) CreateSeries(ctx context.Context, input CreateSeriesInput) (*sqlc.Series, error) {
	series, err := s.queries.CreateSeries(ctx, sqlc.CreateSeriesParams{
		Name:        input.Name,
		Slug:        input.Slug,
		Description: input.Description,
	})
	if err != nil {
		return nil, err
	}
	return &series, nil
}

type UpdateSeriesInput struct {
	ID          uuid.UUID
	Name        string
	Slug        *string
	Description *string
}

func (s *Service) UpdateSeries(ctx context.Context, input UpdateSeriesInput) (*sqlc.Series, error) {
	series, err := s.queries.UpdateSeries(ctx, sqlc.UpdateSeriesParams{
		ID:          input.ID,
		Name:        input.Name,
		Slug:        input.Slug,
		Description: input.Description,
	})
	if err != nil {
		return nil, err
	}
	return &series, nil
}

func (s *Service) DeleteSeries(ctx context.Context, id uuid.UUID) error {
	return s.queries.DeleteSeries(ctx, id)
}
