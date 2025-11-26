package server

import (
	"io"
	"net/http"
	"testing"

	"book-nexus/internal/database/sqlc"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Mock database service for testing
type mockDB struct{}

func (m *mockDB) Health() map[string]string {
	return map[string]string{"status": "ok"}
}

func (m *mockDB) Close() error {
	return nil
}

func (m *mockDB) DB() *pgxpool.Pool {
	return nil
}

func (m *mockDB) Queries() *sqlc.Queries {
	return nil
}

func TestHealthHandler(t *testing.T) {
	app := fiber.New()
	s := &Server{
		port: 8080,
		db:   &mockDB{},
		App:  app,
	}
	s.RegisterRoutes()

	req, err := http.NewRequest("GET", "/health", nil)
	if err != nil {
		t.Fatalf("error creating request. Err: %v", err)
	}

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("error making request to server. Err: %v", err)
	}

	// Assertions
	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status OK; got %v", resp.StatusCode)
	}

	if resp.Header.Get("Content-Type") != "application/json" {
		t.Errorf("expected Content-Type to be application/json; got %v", resp.Header.Get("Content-Type"))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("error reading response body. Err: %v", err)
	}

	if len(body) == 0 {
		t.Errorf("expected non-empty response body; got empty")
	}
}
