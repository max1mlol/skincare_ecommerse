-- ================================================================
-- AURA SKIN — Migration 002: Schema additions
-- Run if you already have the DB from migration 001:
-- psql -U postgres -d auraskin_db -f migrations/002_additions.sql
-- ================================================================

-- Orders-д шинэ баганууд нэмэх (байгаа бол алгасна)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_fee    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50) NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS notes           TEXT;

-- Products-д шинэ баганууд
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS how_to_use   TEXT,
  ADD COLUMN IF NOT EXISTS ingredients  TEXT,
  ADD COLUMN IF NOT EXISTS images       TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS stock_qty    INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS brand_origin VARCHAR(100);

-- Users-д утасны дугаар
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

-- Reviews-д body (comment → body нэрийг сольсон)
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS body TEXT;
-- Хуучин comment баганы утгыг body-д хуулна (байгаа бол)
UPDATE reviews SET body = comment WHERE body IS NULL AND comment IS NOT NULL;

-- Шинэ index-ууд
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_id ON login_attempts(identifier, attempted_at DESC);

-- Rating auto-update trigger (шинэ хувилбар)
CREATE OR REPLACE FUNCTION fn_update_product_rating()
RETURNS TRIGGER AS $$
DECLARE pid INTEGER;
BEGIN
  pid := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE products
  SET rating        = COALESCE((SELECT AVG(rating::DECIMAL) FROM reviews WHERE product_id = pid), 0),
      reviews_count = (SELECT COUNT(*) FROM reviews WHERE product_id = pid),
      updated_at    = NOW()
  WHERE id = pid;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_review_rating ON reviews;
CREATE TRIGGER trg_review_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION fn_update_product_rating();
