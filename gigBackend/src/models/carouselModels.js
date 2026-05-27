import pool from '../config/db.js';

export const createCarouselItem = async (data) => {
  const query = `
    INSERT INTO carousel_items
      (title, description, meta, image_url, image_public_id, is_active)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *;
  `;

  const values = [
    data.title,
    data.description || '',
    data.meta || '',
    data.image_url,
    data.image_public_id,
    data.is_active ?? true
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getActiveCarouselItems = async () => {
  const query = `
    SELECT id, title, description, meta, image_url, image_public_id, is_active, created_at, updated_at
    FROM carousel_items
    WHERE is_active = TRUE
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query);
  return result.rows;
};

export const getCarouselItemById = async (id) => {
  const query = 'SELECT * FROM carousel_items WHERE id = $1 LIMIT 1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const updateCarouselItem = async (id, data) => {
  const current = await getCarouselItemById(id);
  if (!current) return null;

  const query = `
    UPDATE carousel_items
    SET
      title = $1,
      description = $2,
      meta = $3,
      image_url = $4,
      image_public_id = $5,
      is_active = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *;
  `;

  const values = [
    data.title ?? current.title,
    data.description ?? current.description,
    data.meta ?? current.meta,
    data.image_url ?? current.image_url,
    data.image_public_id ?? current.image_public_id,
    data.is_active ?? current.is_active,
    id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteCarouselItem = async (id) => {
  const query = 'DELETE FROM carousel_items WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
