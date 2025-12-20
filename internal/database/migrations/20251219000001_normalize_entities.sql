-- +goose Up
-- +goose StatementBegin

-- Create authors table
CREATE TABLE authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_authors_name ON authors(name);
CREATE INDEX idx_authors_slug ON authors(slug) WHERE slug IS NOT NULL;

-- Create publishers table
CREATE TABLE publishers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_publishers_name ON publishers(name);
CREATE INDEX idx_publishers_slug ON publishers(slug) WHERE slug IS NOT NULL;

-- Create series table
CREATE TABLE series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_series_name ON series(name);
CREATE INDEX idx_series_slug ON series(slug) WHERE slug IS NOT NULL;

-- Populate authors from existing books
INSERT INTO authors (name, slug)
SELECT DISTINCT
    author,
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(author, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
FROM books
WHERE author IS NOT NULL AND author != ''
ON CONFLICT (name) DO NOTHING;

-- Populate publishers from existing books
INSERT INTO publishers (name, slug)
SELECT DISTINCT
    publisher,
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(publisher, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
FROM books
WHERE publisher IS NOT NULL AND publisher != ''
ON CONFLICT (name) DO NOTHING;

-- Populate series from existing books
INSERT INTO series (name, slug)
SELECT DISTINCT
    series_name,
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(series_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
FROM books
WHERE series_name IS NOT NULL AND series_name != ''
ON CONFLICT (name) DO NOTHING;

-- Add foreign key columns to books
ALTER TABLE books
    ADD COLUMN author_id UUID REFERENCES authors(id),
    ADD COLUMN publisher_id UUID REFERENCES publishers(id),
    ADD COLUMN series_id UUID REFERENCES series(id);

-- Populate foreign keys
UPDATE books b
SET author_id = a.id
FROM authors a
WHERE b.author = a.name;

UPDATE books b
SET publisher_id = p.id
FROM publishers p
WHERE b.publisher = p.name;

UPDATE books b
SET series_id = s.id
FROM series s
WHERE b.series_name = s.name;

-- Create indexes for foreign keys
CREATE INDEX idx_books_author_id ON books(author_id);
CREATE INDEX idx_books_publisher_id ON books(publisher_id);
CREATE INDEX idx_books_series_id ON books(series_id);

-- Drop old indexes that reference text columns we're about to remove
DROP INDEX IF EXISTS idx_books_author;
DROP INDEX IF EXISTS idx_books_series_name;

-- Drop old text columns
ALTER TABLE books
    DROP COLUMN author,
    DROP COLUMN publisher,
    DROP COLUMN series_name;

-- Make author_id NOT NULL (every book must have an author)
ALTER TABLE books ALTER COLUMN author_id SET NOT NULL;

-- Add triggers for updated_at on new tables
CREATE TRIGGER update_authors_updated_at
    BEFORE UPDATE ON authors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_publishers_updated_at
    BEFORE UPDATE ON publishers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_series_updated_at
    BEFORE UPDATE ON series
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Drop triggers
DROP TRIGGER IF EXISTS update_authors_updated_at ON authors;
DROP TRIGGER IF EXISTS update_publishers_updated_at ON publishers;
DROP TRIGGER IF EXISTS update_series_updated_at ON series;

-- Add back text columns
ALTER TABLE books
    ADD COLUMN author TEXT,
    ADD COLUMN publisher TEXT,
    ADD COLUMN series_name TEXT;

-- Restore data from normalized tables
UPDATE books b
SET author = a.name
FROM authors a
WHERE b.author_id = a.id;

UPDATE books b
SET publisher = p.name
FROM publishers p
WHERE b.publisher_id = p.id;

UPDATE books b
SET series_name = s.name
FROM series s
WHERE b.series_id = s.id;

-- Make author NOT NULL
ALTER TABLE books ALTER COLUMN author SET NOT NULL;

-- Recreate old indexes
CREATE INDEX idx_books_author ON books(author) WHERE author IS NOT NULL;
CREATE INDEX idx_books_series_name ON books(series_name) WHERE series_name IS NOT NULL;

-- Drop foreign key columns and indexes
DROP INDEX IF EXISTS idx_books_author_id;
DROP INDEX IF EXISTS idx_books_publisher_id;
DROP INDEX IF EXISTS idx_books_series_id;

ALTER TABLE books
    DROP COLUMN author_id,
    DROP COLUMN publisher_id,
    DROP COLUMN series_id;

-- Drop normalized tables
DROP TABLE IF EXISTS series;
DROP TABLE IF EXISTS publishers;
DROP TABLE IF EXISTS authors;

-- +goose StatementEnd
