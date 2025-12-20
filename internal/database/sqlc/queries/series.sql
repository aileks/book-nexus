-- name: GetSeriesByID :one
SELECT * FROM series WHERE id = $1;

-- name: GetSeriesBySlug :one
SELECT * FROM series WHERE slug = $1;

-- name: GetSeriesByName :one
SELECT * FROM series WHERE name = $1;

-- name: ListSeries :many
SELECT * FROM series
ORDER BY name
LIMIT $1 OFFSET $2;

-- name: SearchSeries :many
SELECT * FROM series
WHERE name ILIKE '%' || $1 || '%'
ORDER BY name
LIMIT $2 OFFSET $3;

-- name: CountSeries :one
SELECT COUNT(*) FROM series;

-- name: CreateSeries :one
INSERT INTO series (name, slug, description)
VALUES ($1, $2, $3)
RETURNING *;

-- name: UpdateSeries :one
UPDATE series
SET name = $2, slug = $3, description = $4, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: DeleteSeries :exec
DELETE FROM series WHERE id = $1;

-- name: GetSeriesBookCount :one
SELECT COUNT(*) FROM books WHERE series_id = $1;
