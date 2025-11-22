package database

import (
	"context"
	"log"
	"os"
	"testing"
	"time"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

var dockerAvailable bool

func mustStartPostgresContainer() (func(context.Context, ...testcontainers.TerminateOption) error, error) {
	var (
		dbName = "database"
		dbPwd  = "password"
		dbUser = "user"
	)

	dbContainer, err := postgres.Run(
		context.Background(),
		"postgres:latest",
		postgres.WithDatabase(dbName),
		postgres.WithUsername(dbUser),
		postgres.WithPassword(dbPwd),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(5*time.Second)),
	)
	if err != nil {
		return nil, err
	}

	database = dbName
	password = dbPwd
	username = dbUser

	dbHost, err := dbContainer.Host(context.Background())
	if err != nil {
		return dbContainer.Terminate, err
	}

	dbPort, err := dbContainer.MappedPort(context.Background(), "5432/tcp")
	if err != nil {
		return dbContainer.Terminate, err
	}

	host = dbHost
	port = dbPort.Port()

	return dbContainer.Terminate, err
}

func TestMain(m *testing.M) {
	// Attempt to start Docker container with panic recovery
	var teardown func(context.Context, ...testcontainers.TerminateOption) error

	func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Warning: Docker initialization panicked: %v", r)
				log.Printf("Tests requiring Docker will be skipped")
				dockerAvailable = false
			}
		}()

		var err error
		teardown, err = mustStartPostgresContainer()
		if err != nil {
			log.Printf("Warning: could not start postgres container: %v", err)
			log.Printf("Tests requiring Docker will be skipped")
			dockerAvailable = false
			return
		}

		dockerAvailable = true
	}()

	code := m.Run()

	if dockerAvailable && teardown != nil {
		if err := teardown(context.Background()); err != nil {
			log.Printf("Warning: could not teardown postgres container: %v", err)
		}
	}

	os.Exit(code)
}

func TestNew(t *testing.T) {
	if !dockerAvailable {
		t.Skip("Skipping test: Docker not available")
	}

	srv := New()
	if srv == nil {
		t.Fatal("New() returned nil")
	}
}

func TestHealth(t *testing.T) {
	if !dockerAvailable {
		t.Skip("Skipping test: Docker not available")
	}

	srv := New()

	stats := srv.Health()

	if stats["status"] != "up" {
		t.Fatalf("expected status to be up, got %s", stats["status"])
	}

	if _, ok := stats["error"]; ok {
		t.Fatalf("expected error not to be present")
	}

	if stats["message"] != "It's healthy" {
		t.Fatalf("expected message to be 'It's healthy', got %s", stats["message"])
	}
}

func TestClose(t *testing.T) {
	if !dockerAvailable {
		t.Skip("Skipping test: Docker not available")
	}

	srv := New()

	if srv.Close() != nil {
		t.Fatalf("expected Close() to return nil")
	}
}
