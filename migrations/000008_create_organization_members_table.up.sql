CREATE TABLE IF NOT EXISTS organization_members (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  role VARCHAR(100) DEFAULT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_org_members_org FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
  CONSTRAINT fk_org_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);