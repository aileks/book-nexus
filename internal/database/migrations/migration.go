package migration

import (
	"context"
	"embed"
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
)

//go:embed *.sql
var migrationsFS embed.FS

func RunMigrations(pool *pgxpool.Pool) error {
	schema := os.Getenv("DATABASE_SCHEMA")
	if schema == "" {
		schema = "public"
	}

	ctx := context.Background()

	if schema != "public" {
		// Quote identifier to handle special characters safely
		quotedSchema := fmt.Sprintf(`"%s"`, strings.ReplaceAll(schema, `"`, `""`))
		createSchemaSQL := fmt.Sprintf("CREATE SCHEMA IF NOT EXISTS %s", quotedSchema)
		if _, err := pool.Exec(ctx, createSchemaSQL); err != nil {
			return fmt.Errorf("failed to create schema %s: %w", schema, err)
		}
		log.Printf("Schema %s ensured", schema)
	}

	// Set the search path for this connection to ensure migrations run in the correct schema
	quotedSchema := fmt.Sprintf(`"%s"`, strings.ReplaceAll(schema, `"`, `""`))
	if _, err := pool.Exec(ctx, fmt.Sprintf("SET search_path TO %s", quotedSchema)); err != nil {
		return fmt.Errorf("failed to set search_path: %w", err)
	}

	goose.SetBaseFS(migrationsFS)

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set dialect: %w", err)
	}

	// Convert pgxpool to sql.DB using stdlib driver
	sqlDB := stdlib.OpenDB(*pool.Config().ConnConfig)
	defer sqlDB.Close()

	if err := goose.Up(sqlDB, "."); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("Migrations completed successfully")
	return nil
}

func MigrateDown(pool *pgxpool.Pool) error {
	goose.SetBaseFS(migrationsFS)

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set dialect: %w", err)
	}

	sqlDB := stdlib.OpenDB(*pool.Config().ConnConfig)
	defer sqlDB.Close()

	if err := goose.Down(sqlDB, "."); err != nil {
		return fmt.Errorf("failed to rollback migration: %w", err)
	}

	log.Println("Migration rollback completed successfully")
	return nil
}

func MigrateToVersion(pool *pgxpool.Pool, version int64) error {
	goose.SetBaseFS(migrationsFS)

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set dialect: %w", err)
	}

	sqlDB := stdlib.OpenDB(*pool.Config().ConnConfig)
	defer sqlDB.Close()

	if err := goose.UpTo(sqlDB, ".", version); err != nil {
		return fmt.Errorf("failed to migrate to version %d: %w", version, err)
	}

	log.Printf("Migration to version %d completed successfully\n", version)
	return nil
}

func MigrateReset(pool *pgxpool.Pool) error {
	goose.SetBaseFS(migrationsFS)

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set dialect: %w", err)
	}

	sqlDB := stdlib.OpenDB(*pool.Config().ConnConfig)
	defer sqlDB.Close()

	if err := goose.Reset(sqlDB, "."); err != nil {
		return fmt.Errorf("failed to reset migrations: %w", err)
	}

	log.Println("Migration reset completed successfully")
	return nil
}

func MigrateStatus(pool *pgxpool.Pool) error {
	goose.SetBaseFS(migrationsFS)

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set dialect: %w", err)
	}

	sqlDB := stdlib.OpenDB(*pool.Config().ConnConfig)
	defer sqlDB.Close()

	if err := goose.Status(sqlDB, "."); err != nil {
		return fmt.Errorf("failed to get migration status: %w", err)
	}

	return nil
}

// SeedBooks reads the CSV file and inserts book data into the database.
// It uses the normalized schema with separate authors, publishers, and series tables.
func SeedBooks(pool *pgxpool.Pool, csvPath string) error {
	file, err := os.Open(csvPath)
	if err != nil {
		return fmt.Errorf("failed to open CSV file: %w", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.LazyQuotes = true
	reader.TrimLeadingSpace = true

	// Read header row
	header, err := reader.Read()
	if err != nil {
		return fmt.Errorf("failed to read CSV header: %w", err)
	}

	// Map column indices
	colMap := make(map[string]int)
	for i, col := range header {
		colMap[col] = i
	}

	ctx := context.Background()

	// Cache for entity IDs to avoid repeated lookups
	authorCache := make(map[string]string)    // name -> id
	publisherCache := make(map[string]string) // name -> id
	seriesCache := make(map[string]string)    // name -> id

	var inserted, skipped int

	// Process rows one at a time (we need to resolve foreign keys)
	for {
		row, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Printf("Error reading CSV row: %v", err)
			continue
		}

		// Skip rows with insufficient columns
		if len(row) < len(header) {
			continue
		}

		// Extract values
		title := strings.TrimSpace(row[colMap["title"]])
		subtitle := strings.TrimSpace(row[colMap["subtitle"]])
		authorName := strings.TrimSpace(row[colMap["author"]])
		publisherName := strings.TrimSpace(row[colMap["publisher"]])
		publishedDateStr := strings.TrimSpace(row[colMap["publishedDate"]])
		isbn10 := strings.TrimSpace(row[colMap["isbn10"]])
		isbn13 := strings.TrimSpace(row[colMap["isbn13"]])
		pagesStr := strings.TrimSpace(row[colMap["pages"]])
		language := strings.TrimSpace(row[colMap["language"]])
		description := strings.TrimSpace(row[colMap["description"]])
		seriesName := strings.TrimSpace(row[colMap["series_name"]])
		seriesPositionStr := strings.TrimSpace(row[colMap["series_position"]])
		genres := strings.TrimSpace(row[colMap["genres"]])
		tags := strings.TrimSpace(row[colMap["tags"]])
		imageURL := strings.TrimSpace(row[colMap["image_url"]])

		// Validate required fields
		if title == "" || authorName == "" {
			skipped++
			continue
		}

		// Get or create author
		authorID, ok := authorCache[authorName]
		if !ok {
			authorID, err = getOrCreateAuthor(ctx, pool, authorName)
			if err != nil {
				log.Printf("Error getting/creating author %s: %v", authorName, err)
				skipped++
				continue
			}
			authorCache[authorName] = authorID
		}

		// Get or create publisher (if present)
		var publisherID *string
		if publisherName != "" {
			pid, ok := publisherCache[publisherName]
			if !ok {
				pid, err = getOrCreatePublisher(ctx, pool, publisherName)
				if err != nil {
					log.Printf("Error getting/creating publisher %s: %v", publisherName, err)
					// Continue without publisher
				} else {
					publisherCache[publisherName] = pid
					publisherID = &pid
				}
			} else {
				publisherID = &pid
			}
		}

		// Get or create series (if present)
		var seriesID *string
		if seriesName != "" {
			sid, ok := seriesCache[seriesName]
			if !ok {
				sid, err = getOrCreateSeries(ctx, pool, seriesName)
				if err != nil {
					log.Printf("Error getting/creating series %s: %v", seriesName, err)
					// Continue without series
				} else {
					seriesCache[seriesName] = sid
					seriesID = &sid
				}
			} else {
				seriesID = &sid
			}
		}

		// Parse published_date
		var publishedDate *time.Time
		if publishedDateStr != "" {
			parsed, err := time.Parse("2006-01-02", publishedDateStr)
			if err == nil {
				publishedDate = &parsed
			}
		}

		// Parse pages
		var pages *int
		if pagesStr != "" {
			if p, err := strconv.Atoi(pagesStr); err == nil && p > 0 {
				pages = &p
			}
		}

		// Parse series_position
		var seriesPosition *int
		if seriesPositionStr != "" {
			if sp, err := strconv.Atoi(seriesPositionStr); err == nil && sp > 0 {
				seriesPosition = &sp
			}
		}

		// Convert empty strings to NULL
		var subtitlePtr, isbn10Ptr, isbn13Ptr, languagePtr, descriptionPtr, genresPtr, tagsPtr, imageURLPtr *string
		if subtitle != "" {
			subtitlePtr = &subtitle
		}
		if isbn10 != "" {
			isbn10Ptr = &isbn10
		}
		if isbn13 != "" {
			isbn13Ptr = &isbn13
		}
		if language != "" {
			languagePtr = &language
		}
		if description != "" {
			descriptionPtr = &description
		}
		if genres != "" {
			genresPtr = &genres
		}
		if tags != "" {
			tagsPtr = &tags
		}
		if imageURL != "" {
			imageURLPtr = &imageURL
		}

		// Insert book with foreign keys
		_, err = pool.Exec(ctx, `
			INSERT INTO books (
				title, subtitle, author_id, publisher_id, published_date, isbn10, isbn13,
				pages, language, description, series_id, series_position, genres, tags, image_url
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
			ON CONFLICT (isbn13) DO NOTHING`,
			title, subtitlePtr, authorID, publisherID, publishedDate,
			isbn10Ptr, isbn13Ptr, pages, languagePtr, descriptionPtr,
			seriesID, seriesPosition, genresPtr, tagsPtr, imageURLPtr,
		)
		if err != nil {
			log.Printf("Error inserting book %s: %v", title, err)
			skipped++
		} else {
			inserted++
		}
	}

	log.Printf("Seeding completed: %d books inserted, %d skipped", inserted, skipped)
	log.Printf("Created %d authors, %d publishers, %d series", len(authorCache), len(publisherCache), len(seriesCache))
	return nil
}

// getOrCreateAuthor finds an existing author by name or creates a new one.
func getOrCreateAuthor(ctx context.Context, pool *pgxpool.Pool, name string) (string, error) {
	var id string
	err := pool.QueryRow(ctx, "SELECT id FROM authors WHERE name = $1", name).Scan(&id)
	if err == nil {
		return id, nil
	}
	if err != pgx.ErrNoRows {
		return "", err
	}

	// Create new author
	slug := slugify(name)
	err = pool.QueryRow(ctx,
		"INSERT INTO authors (name, slug) VALUES ($1, $2) RETURNING id",
		name, slug,
	).Scan(&id)
	if err != nil {
		// Handle race condition - try to select again
		if strings.Contains(err.Error(), "duplicate key") {
			err = pool.QueryRow(ctx, "SELECT id FROM authors WHERE name = $1", name).Scan(&id)
			return id, err
		}
		return "", err
	}
	return id, nil
}

// getOrCreatePublisher finds an existing publisher by name or creates a new one.
func getOrCreatePublisher(ctx context.Context, pool *pgxpool.Pool, name string) (string, error) {
	var id string
	err := pool.QueryRow(ctx, "SELECT id FROM publishers WHERE name = $1", name).Scan(&id)
	if err == nil {
		return id, nil
	}
	if err != pgx.ErrNoRows {
		return "", err
	}

	// Create new publisher
	slug := slugify(name)
	err = pool.QueryRow(ctx,
		"INSERT INTO publishers (name, slug) VALUES ($1, $2) RETURNING id",
		name, slug,
	).Scan(&id)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			err = pool.QueryRow(ctx, "SELECT id FROM publishers WHERE name = $1", name).Scan(&id)
			return id, err
		}
		return "", err
	}
	return id, nil
}

// getOrCreateSeries finds an existing series by name or creates a new one.
func getOrCreateSeries(ctx context.Context, pool *pgxpool.Pool, name string) (string, error) {
	var id string
	err := pool.QueryRow(ctx, "SELECT id FROM series WHERE name = $1", name).Scan(&id)
	if err == nil {
		return id, nil
	}
	if err != pgx.ErrNoRows {
		return "", err
	}

	// Create new series
	slug := slugify(name)
	err = pool.QueryRow(ctx,
		"INSERT INTO series (name, slug) VALUES ($1, $2) RETURNING id",
		name, slug,
	).Scan(&id)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			err = pool.QueryRow(ctx, "SELECT id FROM series WHERE name = $1", name).Scan(&id)
			return id, err
		}
		return "", err
	}
	return id, nil
}

// slugify converts a name to a URL-friendly slug.
func slugify(name string) string {
	// Convert to lowercase
	slug := strings.ToLower(name)
	// Replace spaces and special characters with hyphens
	slug = strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			return r
		}
		if r == ' ' || r == '-' || r == '_' {
			return '-'
		}
		return -1
	}, slug)
	// Remove multiple consecutive hyphens
	for strings.Contains(slug, "--") {
		slug = strings.ReplaceAll(slug, "--", "-")
	}
	// Trim leading/trailing hyphens
	slug = strings.Trim(slug, "-")
	return slug
}
