import pool from '../config/db.js';

export const testDB = async () => {
  try {
    // Test connection
    const res = await pool.query('SELECT NOW()');
    console.log('DB Connected:', res.rows[0]);

    // Fetch all posts
    const postsQuery = `
      SELECT
        p.id,
        p.title,
        p.excerpt,
        p.featured_image,
        p.read_time,
        p.published_at,
        u.full_name AS author,
        c.name AS category,
        c.slug AS category_slug
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_published = TRUE
      ORDER BY p.published_at DESC;
    `;
    const postsRes = await pool.query(postsQuery);
   // console.log('Posts from DB:', JSON.stringify(postsRes.rows, null, 2));

  } catch (err) {
    console.error('DB Error:', err);
  }
};

// Run the test if this file is executed directly
testDB();
