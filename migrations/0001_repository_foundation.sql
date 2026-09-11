CREATE TABLE app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

INSERT INTO app_metadata (key, value, updated_at)
VALUES ('foundation_gate', '1', CURRENT_TIMESTAMP);
