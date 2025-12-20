package recommendations

import (
	"book-nexus/internal/database/sqlc"
	"context"
	"sort"

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

type ScoredBook struct {
	Book  sqlc.Book
	Score int
}

// rowToBook converts a GetRecommendationsByTagsRow to a Book
func rowToBook(row sqlc.GetRecommendationsByTagsRow) sqlc.Book {
	return sqlc.Book{
		ID:             row.ID,
		Title:          row.Title,
		Subtitle:       row.Subtitle,
		AuthorID:       row.AuthorID,
		PublisherID:    row.PublisherID,
		PublishedDate:  row.PublishedDate,
		Isbn10:         row.Isbn10,
		Isbn13:         row.Isbn13,
		Pages:          row.Pages,
		Language:       row.Language,
		Description:    row.Description,
		SeriesID:       row.SeriesID,
		SeriesPosition: row.SeriesPosition,
		Genres:         row.Genres,
		Tags:           row.Tags,
		ImageUrl:       row.ImageUrl,
		CreatedAt:      row.CreatedAt,
		UpdatedAt:      row.UpdatedAt,
	}
}

// GetRecommendations returns book recommendations based on:
// 1. Same series (score: 5)
// 2. Same author (score: 3)
// 3. Tag overlap (score: 1 per matching tag)
func (s *Service) GetRecommendations(ctx context.Context, bookID uuid.UUID, limit int) ([]sqlc.Book, error) {
	// Get the source book
	book, err := s.queries.GetBookByID(ctx, bookID)
	if err != nil {
		return nil, err
	}

	scored := make(map[uuid.UUID]*ScoredBook)

	// Same series books (highest priority)
	if book.SeriesID.Valid {
		seriesBooks, err := s.queries.GetRecommendationsBySeries(ctx, sqlc.GetRecommendationsBySeriesParams{
			SeriesID: book.SeriesID,
			ID:       bookID,
			Limit:    int32(limit),
		})
		if err == nil {
			for _, b := range seriesBooks {
				if _, exists := scored[b.ID]; !exists {
					scored[b.ID] = &ScoredBook{Book: b, Score: 0}
				}
				scored[b.ID].Score += 5
			}
		}
	}

	// Same author books
	authorBooks, err := s.queries.GetRecommendationsByAuthor(ctx, sqlc.GetRecommendationsByAuthorParams{
		AuthorID: book.AuthorID,
		ID:       bookID,
		Limit:    int32(limit),
	})
	if err == nil {
		for _, b := range authorBooks {
			if _, exists := scored[b.ID]; !exists {
				scored[b.ID] = &ScoredBook{Book: b, Score: 0}
			}
			scored[b.ID].Score += 3
		}
	}

	// Tag overlap books
	if book.Tags != nil && *book.Tags != "" {
		tagBooks, err := s.queries.GetRecommendationsByTags(ctx, sqlc.GetRecommendationsByTagsParams{
			ID:      bookID,
			Column2: *book.Tags,
			Limit:   int32(limit * 2), // Get more to filter
		})
		if err == nil {
			for _, row := range tagBooks {
				b := rowToBook(row)
				if _, exists := scored[b.ID]; !exists {
					scored[b.ID] = &ScoredBook{Book: b, Score: 0}
				}
				// Add 1 point per matching tag (up to 3)
				tagScore := int(row.TagMatches)
				if tagScore > 3 {
					tagScore = 3
				}
				scored[b.ID].Score += tagScore
			}
		}
	}

	// Convert map to slice and sort by score
	var results []ScoredBook
	for _, sb := range scored {
		results = append(results, *sb)
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].Score > results[j].Score
	})

	// Return top N books
	var books []sqlc.Book
	for i, sb := range results {
		if i >= limit {
			break
		}
		books = append(books, sb.Book)
	}

	return books, nil
}
