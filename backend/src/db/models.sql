-- Run these statements in order to initialise the Procuro schema.
-- For an existing database, run the migration at the bottom instead.

CREATE TABLE rfp (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description_raw TEXT,
  description_structured JSONB,
  items JSONB NOT NULL,
  budget TEXT,
  delivery_timeline TEXT,
  payment_terms TEXT,
  warranty TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vendor (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_person TEXT,          -- optional: name of the primary contact at the vendor company
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE proposal (
  id SERIAL PRIMARY KEY,
  rfp_id INTEGER REFERENCES rfp(id),
  vendor_id INTEGER REFERENCES vendor(id),
  raw_email TEXT,
  parsed JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- -----------------------------------------------------------------------
-- Migration (for existing databases — run once if tables already exist)
-- -----------------------------------------------------------------------
-- ALTER TABLE vendor ADD COLUMN IF NOT EXISTS contact_person TEXT;
-- ALTER TABLE vendor ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
-- ALTER TABLE vendor ALTER COLUMN name SET NOT NULL;
-- ALTER TABLE vendor ALTER COLUMN email SET NOT NULL;