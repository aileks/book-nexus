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

var (
	database   = os.Getenv("DATABASE_NAME")
	password   = os.Getenv("DATABASE_PASSWORD")
	username   = os.Getenv("DATABASE_USERNAME")
	port       = os.Getenv("DATABASE_PORT")
	host       = os.Getenv("DATABASE_HOST")
	schema     = os.Getenv("DATABASE_SCHEMA")
	dbInstance *service
)

func New() Service {
	if dbInstance != nil {
		return dbInstance
	}
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable&search_path=%s", username, password, host, port, database, schema)
	db, err := pgxpool.New(context.Background(), connStr)
	if err != nil {
		log.Fatal(err)
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
	log.Printf("Disconnected from database: %s", database)
	s.db.Close()
	return nil
}

func (s *service) DB() *pgxpool.Pool {
	return s.db
}

func (s *service) Queries() *sqlc.Queries {
	return s.queries
}
