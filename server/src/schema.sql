-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  alipay_name TEXT,
  alipay_account TEXT,
  avatar_url TEXT,
  user_no TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A simple sequence for user_no if extension not present we'll fallback in code
CREATE TABLE IF NOT EXISTS user_no_seq (
  id SERIAL PRIMARY KEY
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  home_background_url TEXT,
  ornament_urls TEXT[], -- array of small decorative urls
  min_withdraw_amount NUMERIC(12,2) DEFAULT 100.00,
  min_withdraw_hours INT DEFAULT 24
);

INSERT INTO settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Home Buttons (6)
CREATE TABLE IF NOT EXISTS home_buttons (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  icon_url TEXT,
  content_text TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

-- Recycle Page Config
CREATE TABLE IF NOT EXISTS recycle_config (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  image_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO recycle_config (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Profile Page custom buttons (4)
CREATE TABLE IF NOT EXISTS profile_buttons (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'modal', -- 'modal' or 'link'
  payload TEXT, -- modal text or URL
  sort_order INT NOT NULL DEFAULT 0
);

-- Avatar gallery uploaded by admin
CREATE TABLE IF NOT EXISTS avatars (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Withdrawal Records (admin-generated public feed)
CREATE TABLE IF NOT EXISTS withdrawal_records (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
