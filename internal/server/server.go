package server

import (
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	_ "github.com/joho/godotenv/autoload"

	"book-nexus/internal/database"
)

type Server struct {
	port int
	db   database.Service
	App  *fiber.App
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

	app := fiber.New(fiber.Config{
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-CSRF-Token",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS, PATCH",
	}))

	server := &Server{
		port: port,
		db:   database.New(),
		App:  app,
	}

	server.RegisterRoutes()

	return server
}

func (s *Server) Listen() error {
	return s.App.Listen(fmt.Sprintf(":%d", s.port))
}

func (s *Server) Shutdown() error {
	return s.App.Shutdown()
}
