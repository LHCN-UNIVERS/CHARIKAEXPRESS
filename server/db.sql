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

-- Own login (e-mail + password) for the team space
ALTER TABLE team ADD COLUMN pass_hash TEXT;           -- PBKDF2-SHA256, 100 000 iterations, hex
ALTER TABLE team ADD COLUMN pass_salt TEXT;           -- random, hex
ALTER TABLE team ADD COLUMN must_change INTEGER NOT NULL DEFAULT 0;   -- 1 = temporary password, change it at next login
ALTER TABLE team ADD COLUMN active INTEGER NOT NULL DEFAULT 1;
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,     -- SHA-256 of the cookie value (the cookie itself is never stored)
  email TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS login_fails (k TEXT NOT NULL, at TEXT NOT NULL);   -- k = 'e:<email>' or 'i:<ip hash>'
CREATE INDEX IF NOT EXISTS login_fails_k ON login_fails(k, at);

-- Partner (affiliate) programme: partners bring clients with their promo codes and earn 350 MAD per delivered company
CREATE TABLE IF NOT EXISTS affiliates (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT, phone TEXT, city TEXT, profile TEXT,
  pay_method TEXT, pay_info TEXT,            -- 'virement' + RIB, or 'cashplus' + account number
  status TEXT NOT NULL DEFAULT 'pending',    -- 'pending' (signed up, to validate), 'active', 'refused', 'suspended'
  pass_hash TEXT, pass_salt TEXT,
  must_change INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS promo_codes (
  code TEXT PRIMARY KEY,                     -- upper case, e.g. AMAL
  affiliate_id TEXT NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,       -- MAD taken off the client's total (0 = code only identifies the partner)
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS promo_codes_aff ON promo_codes(affiliate_id);
CREATE TABLE IF NOT EXISTS aff_sessions (
  token_hash TEXT PRIMARY KEY,               -- SHA-256 of the ce_aff cookie
  affiliate_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
