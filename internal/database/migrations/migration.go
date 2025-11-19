package migration

import (
	"database/sql"
	"embed"
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/pressly/goose/v3"
)

//go:embed *.sql
var migrationsFS embed.FS

func RunMigrations(db *sql.DB) error {
	schema := os.Getenv("DATABASE_SCHEMA")
	if schema == "" {
		schema = "public"
	}

	if schema != "public" {
		// Quote identifier to handle special characters safely
		quotedSchema := fmt.Sprintf(`"%s"`, strings.ReplaceAll(schema, `"`, `""`))
		createSchemaSQL := fmt.Sprintf("CREATE SCHEMA IF NOT EXISTS %s", quotedSchema)
		if _, err := db.Exec(createSchemaSQL); err != nil {
			return fmt.Errorf("failed to create schema %s: %w", schema, err)
		}
		log.Printf("Schema %s ensured", schema)
	}

	// Set the search path for this connection to ensure migrations run in the correct schema
	quotedSchema := fmt.Sprintf(`"%s"`, strings.ReplaceAll(schema, `"`, `""`))
	if _, err := db.Exec(fmt.Sprintf("SET search_path TO %s", quotedSchema)); err != nil {
		return fmt.Errorf("failed to set search_path: %w", err)
	}

	goose.SetBaseFS(migrationsFS)

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set dialect: %w", err)
	}

	if err := goose.Up(db, "."); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("Migrations completed successfully")
	return nil
}

func MigrateDown(db *sql.DB) error {
	goose.SetBaseFS(migrationsFS)

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set dialect: %w", err)
	}

	if err := goose.Down(db, "."); err != nil {
		return fmt.Errorf("failed to rollback migration: %w", err)
	}

	log.Println("Migration rollback completed successfully")
	return nil
}

func MigrateToVersion(db *sql.DB, version int64) error {
	goose.SetBaseFS(migrationsFS)

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set dialect: %w", err)
	}

	if err := goose.UpTo(db, ".", version); err != nil {
		return fmt.Errorf("failed to migrate to version %d: %w", version, err)
	}

	log.Printf("Migration to version %d completed successfully\n", version)
	return nil
}

func MigrateReset(db *sql.DB) error {
	goose.SetBaseFS(migrationsFS)

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set dialect: %w", err)
	}

	if err := goose.Reset(db, "."); err != nil {
		return fmt.Errorf("failed to reset migrations: %w", err)
	}

	log.Println("Migration reset completed successfully")
	return nil
}

func MigrateStatus(db *sql.DB) error {
	goose.SetBaseFS(migrationsFS)

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set dialect: %w", err)
	}

	if err := goose.Status(db, "."); err != nil {
		return fmt.Errorf("failed to get migration status: %w", err)
	}

	return nil
}

// SeedBooks reads the CSV file and inserts book data into the database.
// It skips rows that already exist (based on ISBN13 if present, or title+author combination).
func SeedBooks(db *sql.DB, csvPath string) error {
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

	// Prepare insert statement
	// Use ON CONFLICT to skip duplicates based on ISBN13 unique index
	stmt := `INSERT INTO books (
		title, subtitle, author, publisher, published_date, isbn10, isbn13,
		pages, language, description, series_name, series_position, genres, tags, image_url
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	ON CONFLICT (isbn13) DO NOTHING`

	insertStmt, err := db.Prepare(stmt)
	if err != nil {
		return fmt.Errorf("failed to prepare insert statement: %w", err)
	}
	defer insertStmt.Close()

	var inserted, skipped int
	batchSize := 100

	// Process rows in batches
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

		// Extract values (ignoring columns: image_width, image_height, image_color, image_color_name, rating, ratings_count, users_count, users_read_count)
		title := strings.TrimSpace(row[colMap["title"]])
		subtitle := strings.TrimSpace(row[colMap["subtitle"]])
		author := strings.TrimSpace(row[colMap["author"]])
		publisher := strings.TrimSpace(row[colMap["publisher"]])
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
		if title == "" || author == "" {
			skipped++
			continue
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
		var subtitlePtr *string
		if subtitle != "" {
			subtitlePtr = &subtitle
		}
		var publisherPtr *string
		if publisher != "" {
			publisherPtr = &publisher
		}
		var isbn10Ptr *string
		if isbn10 != "" {
			isbn10Ptr = &isbn10
		}
		var isbn13Ptr *string
		if isbn13 != "" {
			isbn13Ptr = &isbn13
		}
		var languagePtr *string
		if language != "" {
			languagePtr = &language
		}
		var descriptionPtr *string
		if description != "" {
			descriptionPtr = &description
		}
		var seriesNamePtr *string
		if seriesName != "" {
			seriesNamePtr = &seriesName
		}
		var genresPtr *string
		if genres != "" {
			genresPtr = &genres
		}
		var tagsPtr *string
		if tags != "" {
			tagsPtr = &tags
		}
		var imageURLPtr *string
		if imageURL != "" {
			imageURLPtr = &imageURL
		}

		// Execute insert
		result, err := insertStmt.Exec(
			title, subtitlePtr, author, publisherPtr, publishedDate,
			isbn10Ptr, isbn13Ptr, pages, languagePtr, descriptionPtr,
			seriesNamePtr, seriesPosition, genresPtr, tagsPtr, imageURLPtr,
		)
		if err != nil {
			log.Printf("Error inserting book %s by %s: %v", title, author, err)
			skipped++
			continue
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected > 0 {
			inserted++
		} else {
			skipped++
		}

		// Log progress every 100 rows
		if (inserted+skipped)%batchSize == 0 {
			log.Printf("Processed %d books (inserted: %d, skipped: %d)", inserted+skipped, inserted, skipped)
		}
	}

	log.Printf("Seeding completed: %d books inserted, %d skipped", inserted, skipped)
	return nil
}
