import pool from '../config/db.js';



export const getAdminStats = async () => {
  const posts = await pool.query('SELECT COUNT(*) FROM posts');
  const categories = await pool.query('SELECT COUNT(*) FROM categories');

  return {
    posts: parseInt(posts.rows[0].count),
    categories: parseInt(categories.rows[0].count),
    views: 0 // later you can track views
  };
};

//get post Analytics
export const getViewsAnalytics = async () => {
  const query = `
    SELECT 
      DATE(viewed_at) as date,
      COUNT(*) as views
    FROM post_views
    GROUP BY DATE(viewed_at)
    ORDER BY DATE(viewed_at) ASC;
  `;

  const result = await pool.query(query);
  return result.rows;
};

//get top posts
export const getTopPosts = async () => {
  const query = `
    SELECT 
      p.title,
      COUNT(pv.id) as views
    FROM post_views pv
    JOIN posts p ON pv.post_id = p.id
    GROUP BY p.id
    ORDER BY views DESC
    LIMIT 5;
  `;

  const result = await pool.query(query);
  return result.rows;
};

