-- name: GetAuthorByID :one
SELECT * FROM authors WHERE id = $1;

-- name: GetAuthorBySlug :one
SELECT * FROM authors WHERE slug = $1;

-- name: GetAuthorByName :one
SELECT * FROM authors WHERE name = $1;

-- name: ListAuthors :many
SELECT * FROM authors
ORDER BY name
LIMIT $1 OFFSET $2;

-- name: SearchAuthors :many
SELECT * FROM authors
WHERE name ILIKE '%' || $1 || '%'
ORDER BY name
LIMIT $2 OFFSET $3;

-- name: CountAuthors :one
SELECT COUNT(*) FROM authors;

-- name: CountAuthorsSearch :one
SELECT COUNT(*) FROM authors
WHERE name ILIKE '%' || $1 || '%';

-- name: CreateAuthor :one
INSERT INTO authors (name, slug, bio)
VALUES ($1, $2, $3)
RETURNING *;

-- name: UpdateAuthor :one
UPDATE authors
SET name = $2, slug = $3, bio = $4, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: DeleteAuthor :exec
DELETE FROM authors WHERE id = $1;

-- name: GetAuthorBookCount :one
SELECT COUNT(*) FROM books WHERE author_id = $1;
