-- name: GetBookByID :one
SELECT *
FROM books
WHERE id = $1;

-- name: ListBooks :many
SELECT *
FROM books
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: SearchBooks :many
SELECT *
FROM books
WHERE 
  ($1::text IS NULL OR title ILIKE '%' || $1 || '%')
  AND ($2::text IS NULL OR author ILIKE '%' || $2 || '%')
  AND ($3::text IS NULL OR publisher ILIKE '%' || $3 || '%')
  AND ($4::text IS NULL OR series_name ILIKE '%' || $4 || '%')
ORDER BY 
  CASE 
    WHEN $5 = 'title' THEN title
    WHEN $5 = 'author' THEN author
    WHEN $5 = 'published_date' THEN published_date::text
    WHEN $5 = 'created_at' THEN created_at::text
  END,
  created_at DESC
LIMIT $6 OFFSET $7;

-- name: CountSearchResults :one
SELECT COUNT(*) as total
FROM books
WHERE 
  ($1::text IS NULL OR title ILIKE '%' || $1 || '%')
  AND ($2::text IS NULL OR author ILIKE '%' || $2 || '%')
  AND ($3::text IS NULL OR publisher ILIKE '%' || $3 || '%')
  AND ($4::text IS NULL OR series_name ILIKE '%' || $4 || '%');

-- name: GetBooksByAuthor :many
SELECT *
FROM books
WHERE author = $1
ORDER BY published_date DESC;

-- name: GetBooksByISBN13 :one
SELECT *
FROM books
WHERE isbn13 = $1;

-- name: CreateBook :one
INSERT INTO books (title, subtitle, author, publisher, published_date, isbn10, isbn13, pages, language, description, series_name, series_position, genres, tags, image_url)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
RETURNING *;

-- name: UpdateBook :exec
UPDATE books
SET title = $1, subtitle = $2, author = $3, publisher = $4, published_date = $5, isbn10 = $6, isbn13 = $7, pages = $8, language = $9, description = $10, series_name = $11, series_position = $12, genres = $13, tags = $14, image_url = $15
WHERE id = $16;

-- name: DeleteBook :exec
DELETE FROM books WHERE id = $1;

-- name: GetBooksBySeries :many
SELECT *
FROM books
WHERE series_name = $1
ORDER BY series_position ASC;

-- name: ListAuthors :many
SELECT DISTINCT author
FROM books
ORDER BY author;

-- name: SearchAuthors :many
SELECT DISTINCT author
FROM books
WHERE author ILIKE '%' || $1 || '%'
ORDER BY author;

-- name: ListSeries :many
SELECT 
  DISTINCT series_name as name,
  COUNT(*) as book_count
FROM books
WHERE series_name IS NOT NULL
GROUP BY series_name
ORDER BY series_name;

-- name: GetSeriesByName :one
SELECT 
  series_name as name,
  COUNT(*) as book_count
FROM books
WHERE series_name = $1
GROUP BY series_name;
