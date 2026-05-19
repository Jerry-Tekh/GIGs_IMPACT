import pool from '../config/db.js';

// Get All Categories
export const getAllCategories = async () => {
  const query = `
    SELECT
      id,
      name,
      slug
    FROM categories
    ORDER BY name ASC;
  `;

  const result = await pool.query(query);
  return result.rows;
};