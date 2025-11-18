# Book Nexus - Product Requirements Document

## Overview

Book Nexus is a **modular monolith** backend platform providing a public GraphQL API for book discovery, catalog management, and recommendations. The system uses **a single Go application with clear internal domain boundaries (DDD)**, PostgreSQL for persistence, and a React landing page.

## Goals

- Provide a robust API for book catalog and metadata.
- Enable book discovery through filtering, sorting, and recommendations.
- **Demonstrate a clean, modular monolith architecture** based on Domain-Driven Design (DDD) principles.
- **Provide a clear architectural path** for future migration of modules (like recommendations) into independent microservices as scale demands.
- Support series tracking and author/publisher information.
- Deploy easily via Docker Compose locally and on VPS/managed containers.

## Core Modules

### books-module

**Responsibility:** Core book catalog and metadata management (Bounded Context).

**Capabilities:**

- Book admin CRUD with metadata.
- Author and publisher management.
- **Exposes Go interfaces** for internal consumption by other modules.
- Series support (stretch).

### gateway-module

**Responsibility:** Public GraphQL API aggregating data from internal modules.

**Capabilities:**

- Single GraphQL endpoint (`/graphql`) for external clients.
- Query books with filters (author, series, publisher, tags, published date range).
- Sorting and pagination.
- Author and series lookups.
- **Uses Go interfaces to call `books-module` and `recommendations-module`**.
- DataLoader pattern for N+1 prevention.
- Health and metrics endpoints.

### recommendations-module (Stretch)

**Responsibility:** Book recommendation engine (Bounded Context).

**Capabilities:**

- Rules-based recommendations (same series, same author, tag overlap).
- Scored recommendation results.
- **Exposes a Go interface** for `gateway-module` consumption.

## Technical Architecture

**Language:** Go 1.24+  
**API Layer:** GraphQL (github.com/99designs/gqlgen)  
**Inter-Module Communication:** **Go interfaces**
**Database:** PostgreSQL with **schema-per-module**, pgx/pgxpool, golang-migrate  
**Query Layer:** sqlc or GORM  
**Orchestration:** Docker + docker-compose  
**Frontend:** React, TypeScript, GraphQL client

## Data Model

**Book:** ID, title, slug, author, publisher, series (with index), published date, ISBN10, ISBN13, pages, language, summary, description, tags  
**Author:** ID, name, bio, birth/death dates, nationality  
**Publisher:** ID, name, website  
**Series:** ID, name, slug, description  
**Recommendation:** Book ID, recommended book ID, score

## Key Features

### Phase 1 (MVP)

- Book catalog with filtering, sorting, pagination
- Author and publisher associations
- GraphQL queries: `books`, `book`, `authors`, `author`
- Slug-based and ID-based lookups
- Seeded book dataset

### Phase 2 (Recommendations)

- Rules-based recommendation engine
- `Book.recommendations` field in GraphQL
- Configurable recommendation limits
- Batch loading of recommended books

### Phase 3 (Series)

- Series entity and tracking
- Series-to-books relationships with ordering
- GraphQL queries: `seriesList`, `series`
- Book series field resolution

## Future Migration Path

This modulith architecture is explicitly designed for future scalability.

- Modules like `recommendations` are loosely coupled and communicate via well-defined Go interfaces.
- If performance or scaling needs ever require it, a module can be extracted from the monolith into its own independent microservice.
- To complete the migration, the `gateway-module`'s dependency would be updated to call the new service's gRPC client (which implements the same interface) instead of the local function, requiring minimal changes to the core business logic.

## Non-Functional Requirements

**Performance:**

- Pagination enforced (max limits)
- DataLoader batching to prevent N+1
- Connection pooling for database
- GraphQL complexity limits

**Reliability:**

- Health and readiness endpoints
- **Graceful degradation** (e.g., `recommendations` module failures don't break core book queries)

**Security:**

- Read-only public API initially
- JWT/API key auth for future admin operations
- Query depth and complexity protection

## Success Criteria

- ✓ GraphQL API successfully returns paginated, filtered book lists
- ✓ Sub-second response times for typical queries
- ✓ Application and database deployable via `docker-compose up`
- ✓ Landing page functional with docs and search
- ✓ 80%+ test coverage on core modules
- ✓ Series and recommendations features functional (stretch)

## v1 Out of Scope

- User accounts and authentication
- Book ratings/reviews
- Full-text search
- Image/cover management
- Admin UI (API-only)
- Multi-language book content
