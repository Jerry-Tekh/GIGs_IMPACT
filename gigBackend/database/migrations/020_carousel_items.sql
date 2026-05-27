DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'carousel_items'
  ) THEN
    CREATE TABLE carousel_items (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      meta TEXT,
      image_url TEXT NOT NULL,
      image_public_id TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    RAISE NOTICE 'Created table carousel_items';
  ELSE
    RAISE NOTICE 'Skipping carousel_items creation: table already exists';
  END IF;
END
$$;
