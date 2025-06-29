-- AlgorithmPress-GenDB Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- For uuid_generate_v4()

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    images TEXT[], -- Storing as array of URLs. Consider a separate images table for more complex needs.
    stock INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    attributes JSONB, -- Storing attributes as JSONB for flexibility.
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for many-to-many relationship between products and categories
CREATE TABLE product_categories (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- Triggers to update updated_at timestamps

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON product_categories(category_id);
-- Consider GIN index for attributes if searching within JSONB is frequent
-- CREATE INDEX idx_products_attributes ON products USING GIN(attributes);

-- Example of how to add a category:
-- INSERT INTO categories (name, slug, description) VALUES ('Electronics', 'electronics', 'All kinds of electronic gadgets');

-- Example of how to add a product:
-- INSERT INTO products (name, description, price, stock, sku, attributes, images) VALUES
-- ('Awesome Laptop 16GB RAM', 'A very powerful and awesome laptop.', 1299.99, 50, 'LPTP-AWSM-16',
--  '{"RAM": "16GB", "Storage": "512GB SSD", "Screen": "15.6 inch"}',
--  ARRAY['https://example.com/laptop1.jpg', 'https://example.com/laptop2.jpg']);

-- Example of how to link a product to categories:
-- Assuming 'Awesome Laptop 16GB RAM' has id 'product_uuid_1' and 'Electronics' has id 'category_uuid_1'
-- INSERT INTO product_categories (product_id, category_id) VALUES ('product_uuid_1', 'category_uuid_1');
