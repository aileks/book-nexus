-- name: GetBookByID :one
SELECT *
FROM books
WHERE id = $1;

-- name: ListBooks :many
SELECT *
FROM books
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: SearchBooksByTitle :many
SELECT *
FROM books
WHERE title ILIKE '%' || $1 || '%'
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

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
RETURNING id, title, subtitle, author, publisher, published_date, isbn10, isbn13, pages, language, description, series_name, series_position, genres, tags, image_url, created_at, updated_at;

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
