CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    VARCHAR(255) NOT NULL,
  last_name     VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  salt          VARCHAR(255) NOT NULL,
  role          VARCHAR(50)  NOT NULL DEFAULT 'customer',
  avatar_url    TEXT,
  phone         VARCHAR(30)  UNIQUE,
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Sessions (connect-pg-simple) ──────────────────────────────
CREATE TABLE IF NOT EXISTS session (
  sid    VARCHAR     NOT NULL COLLATE "default" PRIMARY KEY,
  sess   JSON        NOT NULL,
  expire TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session(expire);

-- ── Products ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             SERIAL       PRIMARY KEY,
  slug           VARCHAR(255) UNIQUE NOT NULL,
  brand          VARCHAR(255) NOT NULL,
  name           VARCHAR(500) NOT NULL,
  name_mn        VARCHAR(500),
  description    TEXT,
  how_to_use     TEXT,
  ingredients    TEXT,
  price          INTEGER      NOT NULL CHECK (price >= 0),
  original_price INTEGER      CHECK (original_price >= 0),
  image          VARCHAR(500),
  images         TEXT[]       DEFAULT '{}',
  badge          VARCHAR(100),
  -- rating болон reviews_count нь reviews хүснэгтээс автоматаар тооцогдоно
  rating         DECIMAL(3,2) DEFAULT 0,
  reviews_count  INTEGER      DEFAULT 0,
  category       VARCHAR(100),
  category_mn    VARCHAR(100),
  brand_origin   VARCHAR(100),
  skin_types     TEXT[]       DEFAULT '{}',
  skin_concerns  TEXT[]       DEFAULT '{}',
  tags           TEXT[]       DEFAULT '{}',
  in_stock       BOOLEAN      DEFAULT TRUE,
  stock_qty      INTEGER      DEFAULT 0,
  created_at     TIMESTAMPTZ  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Orders ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     VARCHAR(20) UNIQUE NOT NULL,
  user_id          UUID        REFERENCES users(id) ON DELETE SET NULL,
  items            JSONB       NOT NULL,
  total            INTEGER     NOT NULL CHECK (total >= 0),
  shipping_fee     INTEGER     NOT NULL DEFAULT 0,
  delivery_method  VARCHAR(50) NOT NULL DEFAULT 'standard',
  status           VARCHAR(50) NOT NULL DEFAULT 'pending',
  shipping_address JSONB,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ── Cart Items ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID     REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER  REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  qty        INTEGER  NOT NULL CHECK (qty > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- ── Reviews ───────────────────────────────────────────────────
-- Нэг хэрэглэгч нэг бараанд зөвхөн нэг удаа сэтгэгдэл үлдээнэ.
-- body: сэтгэгдлийн текст (comment → body болгов)
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID     REFERENCES users(id)    ON DELETE CASCADE NOT NULL,
  product_id INTEGER  REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  rating     INTEGER  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

-- ── Login attempt log ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_attempts (
  id           SERIAL      PRIMARY KEY,
  identifier   VARCHAR(255) NOT NULL,
  attempted_at TIMESTAMPTZ  DEFAULT NOW(),
  success      BOOLEAN      DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_id ON login_attempts(identifier, attempted_at DESC);

-- ── Updated_at автомат trigger ────────────────────────────────
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN CREATE TRIGGER trg_users_ts    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER trg_products_ts BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER trg_orders_ts   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER trg_reviews_ts  BEFORE UPDATE ON reviews  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Review-оос product-ийн rating автоматаар шинэчлэх trigger ─
CREATE OR REPLACE FUNCTION fn_update_product_rating()
RETURNS TRIGGER AS $$
DECLARE pid INTEGER;
BEGIN
  -- INSERT, UPDATE, DELETE бүгдэд зөв product_id авна
  pid := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE products
  SET rating        = (SELECT COALESCE(AVG(rating::DECIMAL), 0) FROM reviews WHERE product_id = pid),
      reviews_count = (SELECT COUNT(*) FROM reviews WHERE product_id = pid),
      updated_at    = NOW()
  WHERE id = pid;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_review_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION fn_update_product_rating();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
