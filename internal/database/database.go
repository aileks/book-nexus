package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"book-nexus/internal/database/sqlc"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/joho/godotenv/autoload"
)

type Service interface {
	Health() map[string]string
	Close() error
	DB() *pgxpool.Pool
	Queries() *sqlc.Queries
}

type service struct {
	db      *pgxpool.Pool
	queries *sqlc.Queries
}

var dbInstance *service

func getConnectionString() string {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("FATAL: DATABASE_URL is not set")
	}

	// Production: Use URL exactly as provided
	if os.Getenv("APP_ENV") == "production" {
		log.Println("Production mode: Using DATABASE_URL without modification")
		return dbURL
	}

	// Development: Add search_path if schema provided
	if schema := os.Getenv("DATABASE_SCHEMA"); schema != "" {
		separator := "?"
		if strings.Contains(dbURL, "?") {
			separator = "&"
		}
		dbURL = fmt.Sprintf("%s%ssearch_path=%s", dbURL, separator, schema)
		log.Printf("Development mode: Added search_path=%s", schema)
	}

	return dbURL
}

func New() Service {
	if dbInstance != nil {
		return dbInstance
	}

	connStr := getConnectionString()
	log.Printf("Attempting to connect to database...")

	db, err := pgxpool.New(context.Background(), connStr)
	if err != nil {
		log.Fatalf("FATAL: Failed to create connection pool: %v", err)
	}

	// Verify connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.Ping(ctx); err != nil {
		log.Fatalf("FATAL: Database ping failed: %v", err)
	}

	log.Println("Database connected successfully")
	dbInstance = &service{
		db:      db,
		queries: sqlc.New(db),
	}
	return dbInstance
}

func (s *service) Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	stats := make(map[string]string)

	err := s.db.Ping(ctx)
	if err != nil {
		stats["status"] = "down"
		stats["error"] = fmt.Sprintf("db down: %v", err)
		log.Fatalf("db down: %v", err)
		return stats
	}

	stats["status"] = "up"
	stats["message"] = "It's healthy"

	dbStats := s.db.Stat()
	stats["open_connections"] = strconv.Itoa(int(dbStats.TotalConns()))
	stats["in_use"] = strconv.Itoa(int(dbStats.AcquiredConns()))
	stats["idle"] = strconv.Itoa(int(dbStats.IdleConns()))

	return stats
}

func (s *service) Close() error {
	log.Printf("Disconnected from database")
	s.db.Close()
	return nil
}

func (s *service) DB() *pgxpool.Pool {
	return s.db
}

func (s *service) Queries() *sqlc.Queries {
	return s.queries
}
