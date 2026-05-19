import pool from '../config/db.js';

// Get all users
export const getAllUsers = async () => {
  const result = await pool.query('SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC');
  return result.rows;
};

// Update user role
export const updateUserRole = async (userId, role) => {
  const allowedRoles = ['admin', 'author', 'reader'];
  if (!allowedRoles.includes(role)) throw new Error('Invalid role');
  const result = await pool.query(
    'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, full_name, email, role, created_at',
    [role, userId]
  );
  return result.rows[0];
};
