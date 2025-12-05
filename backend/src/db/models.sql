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
  name TEXT,
  email TEXT
);

CREATE TABLE proposal (
  id SERIAL PRIMARY KEY,
  rfp_id INTEGER REFERENCES rfp(id),
  vendor_id INTEGER REFERENCES vendor(id),
  raw_email TEXT,
  parsed JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);