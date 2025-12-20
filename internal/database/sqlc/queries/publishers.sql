-- name: GetPublisherByID :one
SELECT * FROM publishers WHERE id = $1;

-- name: GetPublisherBySlug :one
SELECT * FROM publishers WHERE slug = $1;

-- name: GetPublisherByName :one
SELECT * FROM publishers WHERE name = $1;

-- name: ListPublishers :many
SELECT * FROM publishers
ORDER BY name
LIMIT $1 OFFSET $2;

-- name: SearchPublishers :many
SELECT * FROM publishers
WHERE name ILIKE '%' || $1 || '%'
ORDER BY name
LIMIT $2 OFFSET $3;

-- name: CountPublishers :one
SELECT COUNT(*) FROM publishers;

-- name: CreatePublisher :one
INSERT INTO publishers (name, slug, website)
VALUES ($1, $2, $3)
RETURNING *;

-- name: UpdatePublisher :one
UPDATE publishers
SET name = $2, slug = $3, website = $4, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: DeletePublisher :exec
DELETE FROM publishers WHERE id = $1;

-- name: GetPublisherBookCount :one
SELECT COUNT(*) FROM books WHERE publisher_id = $1;
