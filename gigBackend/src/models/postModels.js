import pool from '../config/db.js';

const buildPostState = (data, currentPost = {}, options = {}) => {
  const nextTitle = data.title?.trim() || currentPost.title;
  const isPublished =
    options.forcePublished ??
    data.is_published ??
    currentPost.is_published ??
    false;

  return {
    title: nextTitle,
    content: data.content ?? currentPost.content ?? '',
    excerpt: data.excerpt ?? currentPost.excerpt ?? '',
    featured_image: data.featured_image ?? currentPost.featured_image ?? '',
    featured_image_public_id: data.featured_image_public_id ?? currentPost.featured_image_public_id ?? '',
    author_id: data.author_id ?? currentPost.author_id ?? null,
    category_id: data.category_id ?? currentPost.category_id ?? null,
    read_time: data.read_time || currentPost.read_time || null,
    is_published: Boolean(isPublished)
  };
};

const resolvePublishedAt = (postState, currentPost = {}) => {
  if (postState.is_published) {
    return currentPost.published_at || new Date();
  }

  return null;
};

const adminPostSelect = `
  SELECT
    p.id,
    p.title,
    p.excerpt,
    p.content,
    p.featured_image,
    p.featured_image_public_id,
    p.read_time,
    p.author_id,
    p.category_id,
    p.is_published,
    p.published_at,
    p.created_at,
    p.updated_at,
    u.full_name AS author,
    c.name AS category,
    c.slug AS category_slug
  FROM posts p
  LEFT JOIN users u ON p.author_id = u.id
  LEFT JOIN categories c ON p.category_id = c.id
`;

export const createPost = async (data, options = {}) => {
  const postState = buildPostState(data, {}, options);
  const publishedAt = resolvePublishedAt(postState);

  const query = `
    INSERT INTO posts
    (title, content, excerpt, featured_image, featured_image_public_id, author_id, category_id, read_time, is_published, published_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
  `;

  const values = [
    postState.title,
    postState.content,
    postState.excerpt,
    postState.featured_image,
    postState.featured_image_public_id,
    postState.author_id,
    postState.category_id,
    postState.read_time,
    postState.is_published,
    publishedAt
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const approvePost = async (postId) => {
  const query = `
    UPDATE posts
    SET is_published = TRUE,
        published_at = COALESCE(published_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *;
  `;
  const result = await pool.query(query, [postId]);
  return result.rows[0];
};

export const rejectPost = async (postId) => {
  const query = `
    UPDATE posts
    SET is_published = FALSE,
        published_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *;
  `;
  const result = await pool.query(query, [postId]);
  return result.rows[0];
};

export const getPendingPosts = async () => {
  const query = `
    ${adminPostSelect}
    WHERE p.is_published = FALSE
    ORDER BY p.created_at DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getPostsByAuthor = async (authorId) => {
  const query = `
    ${adminPostSelect}
    WHERE p.author_id = $1
    ORDER BY p.created_at DESC;
  `;
  const result = await pool.query(query, [authorId]);
  return result.rows;
};

export const getPostsForAdmin = async () => {
  const query = `
    ${adminPostSelect}
    ORDER BY p.created_at DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getAllPosts = async (page = 1, limit = 6) => {
  const offset = (page - 1) * limit;

  const query = `
    SELECT
      p.id,
      p.title,
      p.excerpt,
      p.content,
      p.featured_image,
      p.featured_image_public_id,
      p.read_time,
      p.published_at,
      u.full_name AS author,
      c.name AS category,
      c.slug AS category_slug
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_published = TRUE
    ORDER BY p.published_at DESC
    LIMIT $1 OFFSET $2;
  `;

  const countQuery = 'SELECT COUNT(*) FROM posts WHERE is_published = TRUE';

  const posts = await pool.query(query, [limit, offset]);
  const total = await pool.query(countQuery);

  return {
    posts: posts.rows,
    total: parseInt(total.rows[0].count, 10)
  };
};

export const getPostById = async (id, includeUnpublished = false) => {
  const query = `
    ${adminPostSelect}
    WHERE p.id = $1
    ${includeUnpublished ? '' : 'AND p.is_published = TRUE'}
    LIMIT 1;
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const recordPostView = async (postId) => {
  await pool.query('INSERT INTO post_views (post_id) VALUES ($1)', [postId]);
};

export const searchPosts = async (search, category, page = 1, limit = 6) => {
  let query = `
    SELECT
      p.id,
      p.title,
      p.excerpt,
      p.featured_image,
      p.featured_image_public_id,
      p.read_time,
      p.published_at,
      u.full_name AS author,
      c.name AS category,
      c.slug AS category_slug
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_published = TRUE
  `;

  let countQuery = `
    SELECT COUNT(*)
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_published = TRUE
  `;

  const values = [];
  let count = 1;

  if (search) {
    query += ` AND (p.title ILIKE $${count} OR p.content ILIKE $${count})`;
    countQuery += ` AND (p.title ILIKE $${count} OR p.content ILIKE $${count})`;
    values.push(`%${search}%`);
    count += 1;
  }

  if (category && category !== 'all') {
    query += ` AND c.slug = $${count}`;
    countQuery += ` AND c.slug = $${count}`;
    values.push(category);
    count += 1;
  }

  const offset = (page - 1) * limit;
  query += ` ORDER BY p.published_at DESC LIMIT $${count} OFFSET $${count + 1}`;
  values.push(limit, offset);

  const posts = await pool.query(query, values);
  const total = await pool.query(countQuery, values.slice(0, count - 1));

  return {
    posts: posts.rows,
    total: parseInt(total.rows[0].count, 10)
  };
};

export const updatePost = async (id, data, options = {}) => {
  const currentPost = await getPostById(id, true);
  if (!currentPost) {
    return null;
  }

  const postState = buildPostState(data, currentPost, options);
  const publishedAt = resolvePublishedAt(postState, currentPost);

  const query = `
    UPDATE posts
    SET
      title = $1,
      content = $2,
      excerpt = $3,
      featured_image = $4,
      featured_image_public_id = $5,
      author_id = $6,
      category_id = $7,
      read_time = $8,
      is_published = $9,
      published_at = $10,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $11
    RETURNING *;
  `;

  const values = [
    postState.title,
    postState.content,
    postState.excerpt,
    postState.featured_image,
    postState.featured_image_public_id,
    postState.author_id,
    postState.category_id,
    postState.read_time,
    postState.is_published,
    publishedAt,
    id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updatePostByAuthor = async (id, authorId, data) => {
  const currentPost = await getPostById(id, true);
  if (!currentPost || currentPost.author_id !== authorId) {
    return null;
  }

  return updatePost(
    id,
    {
      ...data,
      author_id: authorId
    },
    {
      forcePublished: false
    }
  );
};

export const deletePost = async (id) => {
  const query = 'DELETE FROM posts WHERE id = $1 RETURNING *;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const deletePostByAuthor = async (id, authorId) => {
  const query = 'DELETE FROM posts WHERE id = $1 AND author_id = $2 RETURNING *;';
  const result = await pool.query(query, [id, authorId]);
  return result.rows[0];
};
