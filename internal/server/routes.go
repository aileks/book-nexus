package server

import (
	"book-nexus/graph"
	"log/slog"
	"net/http"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/vektah/gqlparser/v2/ast"
)

func (s *Server) setupRoutes() http.Handler {
	mux := http.NewServeMux()

	// Create GraphQL handler
	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{
		DB: s.db,
	}}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	// Main GraphQL endpoint
	mux.Handle("/query", s.withLogging(srv))

	mux.Handle("/", playground.Handler("GraphQL playground", "/query"))

	return s.withCORS(mux)
}

func (s *Server) withLogging(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Log the incoming request
		slog.Info("GraphQL request received",
			"method", r.Method,
			"path", r.URL.Path,
			"remote_addr", r.RemoteAddr,
			"user_agent", r.UserAgent(),
		)

		// Wrap the response writer to capture status code
		rw := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		handler.ServeHTTP(rw, r)

		// Log the response
		duration := time.Since(start)
		slog.Info("GraphQL request completed",
			"method", r.Method,
			"path", r.URL.Path,
			"status", rw.statusCode,
			"duration_ms", duration.Milliseconds(),
		)
	})
}

func (s *Server) withCORS(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		handler.ServeHTTP(w, r)
	})
}

// responseWriter wraps http.ResponseWriter to capture status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	// Default to 200 if WriteHeader hasn't been called
	if rw.statusCode == 0 {
		rw.statusCode = http.StatusOK
	}
	return rw.ResponseWriter.Write(b)
}
