# Book Nexus - Product Requirements Document

## Overview

Book Nexus is a microservice-based backend platform providing a public GraphQL API for book discovery, catalog management, and recommendations. The system uses Go microservices with gRPC for internal communication, PostgreSQL for persistence, and a React/Next.js landing page.

## Goals

- Provide a robust, scalable API for book catalog and metadata
- Enable book discovery through filtering, sorting, and recommendations
- Demonstrate modern microservice architecture with clear bounded contexts
- Support series tracking and author/publisher information
- Deploy easily via Docker Compose locally and on VPS/managed containers

## Core Services

### books-service

**Responsibility:** Core book catalog and metadata management  
**Capabilities:**

- Book CRUD with metadata (title, author, publisher, series, ISBN, tags, description)
- Author and publisher management
- Series support (stretch)
- gRPC API for internal consumption

### api-gateway

**Responsibility:** Public GraphQL API aggregating internal services  
**Capabilities:**

- Single GraphQL endpoint (`/graphql`) for external clients
- Query books with filters (author, series, publisher, tags, published date range)
- Sorting and pagination
- Author and series lookups
- DataLoader pattern for N+1 prevention
- Health and metrics endpoints

### recommendations-service (Stretch)

**Responsibility:** Book recommendation engine  
**Capabilities:**

- Rules-based recommendations (same series, same author, tag overlap)
- Scored recommendation results
- gRPC API for gateway consumption

### landing (Frontend)

**Responsibility:** Public-facing website  
**Pages:**

- Homepage with Book Nexus description
- API documentation with example queries
- GraphQL playground/explorer

## Technical Architecture

**Language:** Go 1.24+  
**API Layer:** GraphQL (github.com/99designs/gqlgen)  
**Inter-Service:** gRPC (google.golang.org/grpc)  
**Database:** PostgreSQL with schema-per-service, pgx/pgxpool, golang-migrate  
**Query Layer:** sqlc or GORM  
**Observability:** Prometheus metrics, Zap logging, OpenTelemetry (optional)  
**Orchestration:** Docker + docker-compose  
**Frontend:** Next.js, TypeScript, GraphQL client

## Data Model

**Book:** ID, title, slug, author, publisher, series (with index), published date, ISBN, pages, language, summary, description, tags  
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

### Phase 2 (Series)

- Series entity and tracking
- Series-to-books relationships with ordering
- GraphQL queries: `seriesList`, `series`
- Book series field resolution

### Phase 3 (Recommendations)

- Rules-based recommendation engine
- `Book.recommendations` field in GraphQL
- Configurable recommendation limits
- Batch loading of recommended books

## Non-Functional Requirements

**Performance:**

- Pagination enforced (max limits)
- DataLoader batching to prevent N+1
- Connection pooling for database
- GraphQL complexity limits

**Reliability:**

- Health and readiness endpoints
- Graceful degradation (recommendations/series failures don't break queries)
- Circuit breakers on optional services
- Retry logic with backoff for transient failures

**Security:**

- Read-only public API initially
- JWT/API key auth for future admin operations
- Internal gRPC services not publicly exposed
- Optional mTLS for inter-service communication
- Query depth and complexity protection

**Observability:**

- Structured JSON logging (Zap)
- Prometheus metrics on all services
- gRPC interceptors for logging/metrics
- Optional distributed tracing

## Success Criteria

- ✓ GraphQL API successfully returns paginated, filtered book lists
- ✓ Sub-second response times for typical queries
- ✓ All services deployable via `docker-compose up`
- ✓ Landing page functional with docs and playground
- ✓ 80%+ test coverage on core services
- ✓ Series and recommendations features functional (stretch)

## Out of Scope (V1)

- User accounts and authentication
- Book ratings/reviews
- Full-text search
- Image/cover management
- Admin UI (API-only via gRPC/future endpoints)
- Multi-language book content
