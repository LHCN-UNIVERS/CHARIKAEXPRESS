-- Schema of the D1 database "charikaexpress" (already created; kept here for reference / re-creation)
CREATE TABLE IF NOT EXISTS requests (
  ref TEXT PRIMARY KEY,            -- CE-123456
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,        -- changes on every save; used to detect two people editing the same file
  ip_hash TEXT,                    -- hashed sender IP, only for the anti-spam limit
  data TEXT NOT NULL               -- the whole file as JSON (form answers + workflow + notes)
);
CREATE INDEX IF NOT EXISTS requests_ip ON requests(ip_hash, created_at);
CREATE TABLE IF NOT EXISTS team (
  email TEXT PRIMARY KEY,
  id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'juriste',   -- 'admin' or 'juriste'
  color TEXT NOT NULL,
  created_at TEXT NOT NULL
);
