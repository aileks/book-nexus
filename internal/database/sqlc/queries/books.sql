-- name: GetBookByID :one
SELECT *
FROM books
WHERE id = $1;
-- name: ListBooks :many
SELECT *
FROM books
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;
-- name: CountBooks :one
SELECT COUNT(*)
FROM books;
-- name: SearchBooks :many
SELECT b.*
FROM books b
  LEFT JOIN authors a ON b.author_id = a.id
  LEFT JOIN publishers p ON b.publisher_id = p.id
  LEFT JOIN series s ON b.series_id = s.id
WHERE (
    $1::text = ''
    OR (
      b.title ILIKE '%' || $1 || '%'
      OR a.name ILIKE '%' || $1 || '%'
      OR b.genres ILIKE '%' || $1 || '%'
      OR b.tags ILIKE '%' || $1 || '%'
    )
  )
  AND (
    $2::text = ''
    OR b.author_id::text = $2
  )
  AND (
    $3::text = ''
    OR b.publisher_id::text = $3
  )
  AND (
    $4::text = ''
    OR b.series_id::text = $4
  )
  AND (
    $5::text = ''
    OR a.name ILIKE '%' || $5 || '%'
  )
  AND (
    $6::text = ''
    OR b.genres ILIKE '%' || $6 || '%'
  )
ORDER BY CASE
    WHEN $7 = 'title_asc' THEN b.title
  END ASC,
  CASE
    WHEN $7 = 'title_desc' THEN b.title
  END DESC,
  CASE
    WHEN $7 = 'date_asc' THEN b.published_date
  END ASC NULLS LAST,
  CASE
    WHEN $7 = 'date_desc' THEN b.published_date
  END DESC NULLS LAST,
  CASE
    WHEN $7 = 'author' THEN a.name
  END ASC,
  b.created_at DESC
LIMIT $8 OFFSET $9;
-- name: CountSearchResults :one
SELECT COUNT(*)
FROM books b
  LEFT JOIN authors a ON b.author_id = a.id
WHERE (
    $1::text = ''
    OR (
      b.title ILIKE '%' || $1 || '%'
      OR a.name ILIKE '%' || $1 || '%'
      OR b.genres ILIKE '%' || $1 || '%'
      OR b.tags ILIKE '%' || $1 || '%'
    )
  )
  AND (
    $2::text = ''
    OR b.author_id::text = $2
  )
  AND (
    $3::text = ''
    OR b.publisher_id::text = $3
  )
  AND (
    $4::text = ''
    OR b.series_id::text = $4
  )
  AND (
    $5::text = ''
    OR a.name ILIKE '%' || $5 || '%'
  )
  AND (
    $6::text = ''
    OR b.genres ILIKE '%' || $6 || '%'
  );
-- name: GetBooksByAuthor :many
SELECT *
FROM books
WHERE author_id = $1
ORDER BY published_date DESC NULLS LAST;
-- name: GetBooksByPublisher :many
SELECT *
FROM books
WHERE publisher_id = $1
ORDER BY published_date DESC NULLS LAST;
-- name: GetBooksBySeries :many
SELECT *
FROM books
WHERE series_id = $1
ORDER BY series_position ASC NULLS LAST;
-- name: GetBookByISBN13 :one
SELECT *
FROM books
WHERE isbn13 = $1;
-- name: GetBookByISBN10 :one
SELECT *
FROM books
WHERE isbn10 = $1;
-- name: CreateBook :one
INSERT INTO books (
    title,
    subtitle,
    author_id,
    publisher_id,
    published_date,
    isbn10,
    isbn13,
    pages,
    language,
    description,
    series_id,
    series_position,
    genres,
    tags,
    image_url
  )
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    $11,
    $12,
    $13,
    $14,
    $15
  )
RETURNING *;
-- name: UpdateBook :one
UPDATE books
SET title = $2,
  subtitle = $3,
  author_id = $4,
  publisher_id = $5,
  published_date = $6,
  isbn10 = $7,
  isbn13 = $8,
  pages = $9,
  language = $10,
  description = $11,
  series_id = $12,
  series_position = $13,
  genres = $14,
  tags = $15,
  image_url = $16,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
-- name: DeleteBook :exec
DELETE FROM books
WHERE id = $1;
-- name: GetBookWithRelations :one
SELECT b.*,
  a.name as author_name,
  a.slug as author_slug,
  p.name as publisher_name,
  p.slug as publisher_slug,
  s.name as series_name,
  s.slug as series_slug
FROM books b
  JOIN authors a ON b.author_id = a.id
  LEFT JOIN publishers p ON b.publisher_id = p.id
  LEFT JOIN series s ON b.series_id = s.id
WHERE b.id = $1;
-- name: GetRecommendationsByAuthor :many
SELECT *
FROM books
WHERE author_id = $1
  AND id != $2
ORDER BY published_date DESC NULLS LAST
LIMIT $3;
-- name: GetRecommendationsBySeries :many
SELECT *
FROM books
WHERE series_id = $1
  AND id != $2
ORDER BY series_position ASC NULLS LAST
LIMIT $3;
-- name: GetRecommendationsByTags :many
SELECT b.*,
  (
    SELECT COUNT(*)
    FROM unnest(string_to_array($2::text, ',')) AS t(tag)
    WHERE b.tags ILIKE '%' || trim(t.tag) || '%'
  ) as tag_matches
FROM books b
WHERE b.id != $1
  AND b.tags IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM unnest(string_to_array($2::text, ',')) AS t(tag)
    WHERE b.tags ILIKE '%' || trim(t.tag) || '%'
  )
ORDER BY tag_matches DESC,
  created_at DESC
LIMIT $3;