import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (error) => console.error("Unexpected PostgreSQL error", error));

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id BIGSERIAL PRIMARY KEY,
      email VARCHAR(320) NOT NULL UNIQUE,
      name VARCHAR(120) NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token_hash CHAR(64) PRIMARY KEY,
      admin_id BIGINT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx ON admin_sessions(expires_at);
    CREATE TABLE IF NOT EXISTS categories (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      slug VARCHAR(180) NOT NULL UNIQUE,
      parent_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
      description TEXT NOT NULL DEFAULT '',
      product_count INTEGER NOT NULL DEFAULT 0 CHECK (product_count >= 0),
      status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Draft')),
      type VARCHAR(20) NOT NULL DEFAULT 'Manual' CHECK (type IN ('Manual', 'Smart')),
      image_url TEXT NOT NULL DEFAULT '/images/Browline.webp',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (parent_id IS NULL OR parent_id <> id)
    );
    CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON categories(parent_id);
    CREATE TABLE IF NOT EXISTS collections (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      slug VARCHAR(180) NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      product_count INTEGER NOT NULL DEFAULT 0 CHECK (product_count >= 0),
      status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Active', 'Draft')),
      method VARCHAR(20) NOT NULL DEFAULT 'Smart' CHECK (method IN ('Smart', 'Manual')),
      image_url TEXT NOT NULL DEFAULT '/images/Rectangle.webp',
      rule TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS brands (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      slug VARCHAR(180) NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      product_count INTEGER NOT NULL DEFAULT 0 CHECK (product_count >= 0),
      status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Active', 'Draft')),
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      origin VARCHAR(120) NOT NULL DEFAULT 'Not specified',
      image_url TEXT NOT NULL DEFAULT '/images/brand-banners/ray-ban.webp',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products (
      id BIGSERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(220) NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
      discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
      compare_price NUMERIC(12,2) CHECK (compare_price IS NULL OR compare_price >= 0),
      cost NUMERIC(12,2) CHECK (cost IS NULL OR cost >= 0),
      taxable BOOLEAN NOT NULL DEFAULT TRUE,
      sku VARCHAR(120) UNIQUE,
      barcode VARCHAR(160),
      track_quantity BOOLEAN NOT NULL DEFAULT TRUE,
      quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      continue_selling BOOLEAN NOT NULL DEFAULT FALSE,
      shape VARCHAR(80), material VARCHAR(80), rim VARCHAR(80), fit VARCHAR(80),
      weight NUMERIC(10,2), special_feature VARCHAR(180), measurements JSONB NOT NULL DEFAULT '{}'::jsonb,
      lens_compatibility JSONB NOT NULL DEFAULT '[]'::jsonb, variants JSONB NOT NULL DEFAULT '[]'::jsonb,
      status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Active','Draft','Archived')),
      genders JSONB NOT NULL DEFAULT '[]'::jsonb, categories JSONB NOT NULL DEFAULT '[]'::jsonb,
      subcategories JSONB NOT NULL DEFAULT '[]'::jsonb, collections JSONB NOT NULL DEFAULT '[]'::jsonb,
      brands JSONB NOT NULL DEFAULT '[]'::jsonb, tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      media JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY, order_number VARCHAR(40) UNIQUE, customer_name VARCHAR(160) NOT NULL,
      email VARCHAR(320) NOT NULL, phone VARCHAR(50) NOT NULL, address TEXT NOT NULL, city VARCHAR(120) NOT NULL,
      postal_code VARCHAR(30) NOT NULL, items JSONB NOT NULL DEFAULT '[]'::jsonb,
      subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0), payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
      fulfillment_status VARCHAR(30) NOT NULL DEFAULT 'Unfulfilled', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(40) NOT NULL DEFAULT 'Cash on Delivery';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100);
    CREATE TABLE IF NOT EXISTS customer_otp_challenges (
      id CHAR(64) PRIMARY KEY,
      email VARCHAR(320) NOT NULL,
      code_hash CHAR(64) NOT NULL,
      attempts SMALLINT NOT NULL DEFAULT 0,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS customer_otp_email_idx ON customer_otp_challenges(email);
    CREATE INDEX IF NOT EXISTS customer_otp_expires_idx ON customer_otp_challenges(expires_at);
    CREATE TABLE IF NOT EXISTS customer_sessions (
      token_hash CHAR(64) PRIMARY KEY,
      email VARCHAR(320) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS customer_sessions_expires_idx ON customer_sessions(expires_at);
  `);
}
