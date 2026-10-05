CREATE TABLE IF NOT EXISTS transaction_items (
  id BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  weight NUMERIC(12,2) DEFAULT NULL,
  price_per_kg NUMERIC(12,2) DEFAULT NULL,
  subtotal NUMERIC(15,2) DEFAULT NULL,
  CONSTRAINT fk_ti_tx FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE,
  CONSTRAINT fk_ti_category FOREIGN KEY (category_id) REFERENCES waste_categories (id) ON DELETE CASCADE
);