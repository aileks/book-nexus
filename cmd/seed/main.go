package main

import (
	"flag"
	"log"
	"os"

	"book-nexus/internal/database"
	migration "book-nexus/internal/database/migrations"
)

func main() {
	var csvPath string
	flag.StringVar(&csvPath, "csv", "data/books.csv", "Path to the CSV file to seed from")
	flag.Parse()

	// Initialize database
	dbService := database.New()
	db := dbService.DB()
	defer dbService.Close()

	// Ensure migrations are run first
	log.Println("Running migrations...")
	if err := migration.RunMigrations(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Check if CSV file exists
	if _, err := os.Stat(csvPath); os.IsNotExist(err) {
		log.Fatalf("CSV file not found at %s", csvPath)
	}

	// Seed database
	log.Printf("Seeding database from CSV file: %s", csvPath)
	if err := migration.SeedBooks(db, csvPath); err != nil {
		log.Fatalf("Failed to seed database: %v", err)
	}

	log.Println("Seeding completed successfully!")
}
