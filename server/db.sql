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

-- Web Push (team phones get a notification for every new request; see server/push.js)
CREATE TABLE IF NOT EXISTS push_keys (id INTEGER PRIMARY KEY, pub TEXT NOT NULL, priv TEXT NOT NULL);   -- one VAPID key pair, created on first use
CREATE TABLE IF NOT EXISTS push_subs (endpoint TEXT PRIMARY KEY, email TEXT NOT NULL, created_at TEXT NOT NULL);

-- Domiciliation centres (marketplace, see server/centres.js): the client picks a centre in the request form,
-- the domiciliation stays included in the pack and Charika Express pays the centre its agreed rate
CREATE TABLE IF NOT EXISTS centres (
  id TEXT PRIMARY KEY,                       -- ct-xxxxxxxxxx
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,                        -- name of the centre shown to clients
  company TEXT, contact TEXT, phone TEXT,
  city TEXT, district TEXT, address TEXT,
  services TEXT NOT NULL DEFAULT '[]',       -- JSON list: courrier, scan, reunion, bureau, standard, parking
  rate12 INTEGER NOT NULL DEFAULT 0,         -- MAD paid by Charika Express for 12 months (24 months: rate24)
  rate24 INTEGER NOT NULL DEFAULT 0,
  rc TEXT, ice TEXT,
  status TEXT NOT NULL DEFAULT 'pending',    -- 'pending' (to check), 'active', 'refused', 'suspended'
  available INTEGER NOT NULL DEFAULT 1,      -- 0 = full, hidden from the request form
  photo TEXT,                                -- id of the main photo in centre_files
  pass_hash TEXT, pass_salt TEXT,
  must_change INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS centre_sessions (
  token_hash TEXT PRIMARY KEY,               -- SHA-256 of the ce_ctr cookie
  centre_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS centre_files (
  id TEXT PRIMARY KEY,                       -- fl-xxxxxxxxxxxxxxxx
  centre_id TEXT NOT NULL,
  kind TEXT NOT NULL,                        -- 'photo', 'doc' (RC, ICE, authorisation) or 'attest' (attestation for a request)
  ref TEXT,                                  -- request reference for an attestation
  name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL,
  data BLOB NOT NULL,                        -- up to 1.2 MB
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS centre_files_centre ON centre_files(centre_id);
CREATE TABLE IF NOT EXISTS domi (
  ref TEXT PRIMARY KEY,                      -- request reference
  centre_id TEXT NOT NULL,
  months INTEGER NOT NULL,                   -- 12 (Pack Essentiel) or 24
  status TEXT NOT NULL DEFAULT 'new',        -- 'new', 'accepted', 'refused', 'done' (attestation sent)
  att_file TEXT,                             -- centre_files id of the attestation
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  paid_at TEXT                               -- when Charika Express paid the centre
);
CREATE INDEX IF NOT EXISTS domi_centre ON domi(centre_id);
