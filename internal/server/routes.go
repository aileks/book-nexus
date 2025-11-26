package server

import (
	"book-nexus/graph"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/adaptor"
	"github.com/vektah/gqlparser/v2/ast"
)

func (s *Server) RegisterRoutes() {
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

	// Register routes
	s.App.All("/query", adaptor.HTTPHandler(srv))
	s.App.Get("/", adaptor.HTTPHandler(playground.Handler("GraphQL playground", "/query")))

	s.App.Get("/health", s.healthHandler)
}

func (s *Server) healthHandler(c *fiber.Ctx) error {
	return c.JSON(s.db.Health())
}
