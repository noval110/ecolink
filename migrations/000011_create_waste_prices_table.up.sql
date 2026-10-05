CREATE TABLE IF NOT EXISTS waste_prices (
  id BIGSERIAL PRIMARY KEY,
  waste_bank_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  price_per_kg NUMERIC(12,2) NOT NULL,
  effective_from DATE DEFAULT NULL,
  effective_to DATE DEFAULT NULL,
  CONSTRAINT fk_wp_wb FOREIGN KEY (waste_bank_id) REFERENCES waste_banks (id) ON DELETE CASCADE,
  CONSTRAINT fk_wp_category FOREIGN KEY (category_id) REFERENCES waste_categories (id) ON DELETE CASCADE
);