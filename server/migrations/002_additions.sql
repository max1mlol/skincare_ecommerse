-- COALESCE -> NULL утгыг default утгаар солино

/* Захиалгын хүсгэгтэд хүргэлт, тэмдэглэлтэй холбоотой шинэ талбаруудыг нэмэх */
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_fee    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50) NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS notes           TEXT;

/* Бүтээгдэхүүний хүснэгтэд хэрэглэх заавар, орц, үлдэгдэл зэрэг шинэ талбаруудыг нэмэх */
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS how_to_use   TEXT,
  ADD COLUMN IF NOT EXISTS ingredients  TEXT,
  ADD COLUMN IF NOT EXISTS images       TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS stock_qty    INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS brand_origin VARCHAR(100);

/* Хэрэглэгчдийн хүснэгтэд утасны дугаар хадгалах талбар нэмэх */
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

/* Сэтгэгдлийн хүснэгтэд сэтгэгдлийн биеийг хадгалах body талбар нэмэх */
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS body TEXT;

/* Хуучин сэтгэгдлийн утгуудыг шинэ талбар руу хөрвүүлж хуулах */
UPDATE reviews SET body = comment WHERE body IS NULL AND comment IS NOT NULL;

/* Захиалга болон сэтгэгдлийг хурдан хайж шүүхэд зориулсан шинэ индексүүд үүсгэх */
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_id ON login_attempts(identifier, attempted_at DESC);

/* Сэтгэгдэл өөрчлөгдөх бүрт бүтээгдэхүүний дундаж үнэлгээ болон нийт сэтгэгдлийн тоог автоматаар бодох функц */
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

/* Хуучин триггерийг устгаж шинэчилсэн үнэлгээний триггерийг үүсгэх */
DROP TRIGGER IF EXISTS trg_review_rating ON reviews;
CREATE TRIGGER trg_review_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION fn_update_product_rating();
