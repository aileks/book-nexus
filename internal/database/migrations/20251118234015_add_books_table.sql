-- +goose Up
-- +goose StatementBegin
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    author TEXT NOT NULL,
    publisher TEXT,
    published_date DATE,
    isbn10 VARCHAR(10),
    isbn13 VARCHAR(13) UNIQUE,
    pages INTEGER CHECK (pages IS NULL OR pages > 0),
    language TEXT,
    description TEXT,
    series_name TEXT,
    series_position INTEGER CHECK (series_position IS NULL OR series_position > 0),
    genres TEXT,
    tags TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author) WHERE author IS NOT NULL;
CREATE INDEX idx_books_series_name ON books(series_name) WHERE series_name IS NOT NULL;
CREATE INDEX idx_books_published_date ON books(published_date) WHERE published_date IS NOT NULL;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS books;
-- +goose StatementEnd
