CREATE TABLE IF NOT EXISTS campaign_waste_banks (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT NOT NULL,
  waste_bank_id BIGINT NOT NULL,
  CONSTRAINT fk_cwb_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE,
  CONSTRAINT fk_cwb_wb FOREIGN KEY (waste_bank_id) REFERENCES waste_banks (id) ON DELETE CASCADE
);