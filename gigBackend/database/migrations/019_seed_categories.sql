DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'categories'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM categories) THEN
      INSERT INTO categories (name, slug)
      SELECT name, slug FROM (VALUES
        ('Earnings & Income','earnings'),
        ('Financial Planning','finance'),
        ('Health & Wellness','wellness'),
        ('Industry Trends','trends'),
        ('Career Growth','career'),
        ('Tools & Technology','tools'),
        ('Success Stories','stories')
      ) AS v(name, slug);
      RAISE NOTICE 'Seeded categories table with initial rows';
    ELSE
      RAISE NOTICE 'Skipping categories seed: table "categories" is not empty';
    END IF;
  ELSE
    RAISE NOTICE 'Skipping categories seed: table "categories" does not exist';
  END IF;
END
$$;
