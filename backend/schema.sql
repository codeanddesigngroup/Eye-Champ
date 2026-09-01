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
  compare_price NUMERIC(12,2), cost NUMERIC(12,2), taxable BOOLEAN NOT NULL DEFAULT TRUE,
  sku VARCHAR(120) UNIQUE, barcode VARCHAR(160), track_quantity BOOLEAN NOT NULL DEFAULT TRUE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0), continue_selling BOOLEAN NOT NULL DEFAULT FALSE,
  shape VARCHAR(80), material VARCHAR(80), rim VARCHAR(80), fit VARCHAR(80), weight NUMERIC(10,2),
  special_feature VARCHAR(180), measurements JSONB NOT NULL DEFAULT '{}'::jsonb,
  lens_compatibility JSONB NOT NULL DEFAULT '[]'::jsonb, variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Active','Draft','Archived')),
  genders JSONB NOT NULL DEFAULT '[]'::jsonb, categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  subcategories JSONB NOT NULL DEFAULT '[]'::jsonb, collections JSONB NOT NULL DEFAULT '[]'::jsonb,
  brands JSONB NOT NULL DEFAULT '[]'::jsonb, tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  media JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
