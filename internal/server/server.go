package server

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"time"

	_ "github.com/joho/godotenv/autoload"

	"book-nexus/internal/database"
)

type Server struct {
	port       int
	db         database.Service
	httpServer *http.Server
}

func NewServer() *Server {
	port := 8080
	if envPort := os.Getenv("PORT"); envPort != "" {
		if p, err := strconv.Atoi(envPort); err == nil {
			port = p
		} else {
			slog.Warn("invalid PORT environment variable, using default", "port", port)
		}
	}

	server := &Server{
		port: port,
		db:   database.New(),
	}

	mux := server.setupRoutes()

	server.httpServer = &http.Server{
		Addr:         fmt.Sprintf(":%d", port),
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  time.Minute,
	}

	return server
}

func (s *Server) Listen() error {
	return s.httpServer.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}
