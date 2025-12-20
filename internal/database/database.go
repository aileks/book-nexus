package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
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

func New() Service {
	if dbInstance != nil {
		return dbInstance
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("FATAL: DATABASE_URL is not set")
	}

	// Add search_path if provided
	if schema := os.Getenv("DATABASE_SCHEMA"); schema != "" {
		dbURL = fmt.Sprintf("%s?search_path=%s", dbURL, schema)
	}

	db, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("FATAL: Failed to create connection pool: %v", err)
	}

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
