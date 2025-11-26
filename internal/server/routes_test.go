package server

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"book-nexus/internal/database/sqlc"

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
	s := &Server{
		port: 8080,
		db:   &mockDB{},
	}

	req, err := http.NewRequest("GET", "/health", nil)
	if err != nil {
		t.Fatalf("error creating request. Err: %v", err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(s.healthHandler)
	handler.ServeHTTP(rr, req)

	// Assertions
	if rr.Code != http.StatusOK {
		t.Errorf("expected status OK; got %v", rr.Code)
	}

	if rr.Header().Get("Content-Type") != "application/json" {
		t.Errorf("expected Content-Type to be application/json; got %v", rr.Header().Get("Content-Type"))
	}

	body, err := io.ReadAll(rr.Body)
	if err != nil {
		t.Fatalf("error reading response body. Err: %v", err)
	}

	if len(body) == 0 {
		t.Errorf("expected non-empty response body; got empty")
	}
}
