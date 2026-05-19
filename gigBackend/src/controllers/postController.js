import {
  approvePost,
  createPost,
  deletePost,
  deletePostByAuthor,
  getAllPosts,
  getPendingPosts,
  getPostById,
  getPostsByAuthor,
  getPostsForAdmin,
  recordPostView,
  rejectPost,
  searchPosts,
  updatePost,
  updatePostByAuthor
} from './../models/postModels.js';
import { deleteCloudinaryImage, isManagedBlogImage } from '../services/cloudinaryService.js';

const normalizeFeaturedImageFields = (body = {}) => {
  const hasFeaturedImage = Object.prototype.hasOwnProperty.call(body, 'featured_image');
  const hasFeaturedImagePublicId = Object.prototype.hasOwnProperty.call(body, 'featured_image_public_id');
  const featuredImage = typeof body.featured_image === 'string' ? body.featured_image.trim() : body.featured_image;
  const featuredImagePublicId = typeof body.featured_image_public_id === 'string'
    ? body.featured_image_public_id.trim()
    : body.featured_image_public_id;

  if (featuredImage && !featuredImage.startsWith('https://')) {
    const error = new Error('Featured image URL must use HTTPS.');
    error.statusCode = 400;
    throw error;
  }

  if (featuredImagePublicId && !isManagedBlogImage(featuredImagePublicId)) {
    const error = new Error('Featured image public ID is invalid.');
    error.statusCode = 400;
    throw error;
  }

  if (featuredImagePublicId && !featuredImage) {
    const error = new Error('Featured image URL is required when a featured image public ID is provided.');
    error.statusCode = 400;
    throw error;
  }

  return {
    ...body,
    ...(hasFeaturedImage ? { featured_image: featuredImage || '' } : {}),
    ...(hasFeaturedImagePublicId ? { featured_image_public_id: featuredImagePublicId || '' } : {})
  };
};

const deleteManagedImageSafely = async (publicId) => {
  if (!publicId || !isManagedBlogImage(publicId)) {
    return;
  }

  try {
    await deleteCloudinaryImage(publicId);
  } catch (error) {
    console.error('Cloudinary cleanup failed:', error.message);
  }
};

export const approvePostController = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await approvePost(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectPostController = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await rejectPost(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPendingPostsController = async (_req, res) => {
  try {
    const posts = await getPendingPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPostsByAuthorController = async (req, res) => {
  try {
    const posts = await getPostsByAuthor(req.user.user_id);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getManagePostsController = async (_req, res) => {
  try {
    const posts = await getPostsForAdmin();
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPostController = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const normalizedBody = normalizeFeaturedImageFields(req.body);

    const post = await createPost(
      {
        ...normalizedBody,
        author_id: normalizedBody.author_id || req.user.user_id
      },
      isAdmin
        ? {
            forcePublished: Boolean(normalizedBody.is_published)
          }
        : {
            forcePublished: false
          }
    );

    res.status(201).json(post);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getPostsController = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 6 } = req.query;

    const result = search || category
      ? await searchPosts(search, category, Number(page), Number(limit))
      : await getAllPosts(Number(page), Number(limit));

    const totalPages = Math.ceil(result.total / Number(limit));

    res.json({
      posts: result.posts,
      total: result.total,
      page: Number(page),
      totalPages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSinglePostController = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await getPostById(id, false);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await recordPostView(post.id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePostController = async (req, res) => {
  try {
    const { id } = req.params;
    const normalizedBody = normalizeFeaturedImageFields(req.body);
    const existingPost = await getPostById(id, true);

    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const updatedPost = await updatePost(
      id,
      {
        ...normalizedBody,
        author_id: normalizedBody.author_id || req.user.user_id
      },
      {
        forcePublished: normalizedBody.is_published
      }
    );

    await deleteManagedImageSafely(
      existingPost.featured_image_public_id !== updatedPost.featured_image_public_id
        ? existingPost.featured_image_public_id
        : null
    );

    res.json(updatedPost);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const updateOwnPostController = async (req, res) => {
  try {
    const { id } = req.params;
    const normalizedBody = normalizeFeaturedImageFields(req.body);
    const existingPost = await getPostById(id, true);
    const updatedPost = await updatePostByAuthor(id, req.user.user_id, normalizedBody);

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await deleteManagedImageSafely(
      existingPost?.featured_image_public_id !== updatedPost.featured_image_public_id
        ? existingPost?.featured_image_public_id
        : null
    );

    res.json(updatedPost);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const deletePostController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await deletePost(id);

    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await deleteManagedImageSafely(deletedPost.featured_image_public_id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOwnPostController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await deletePostByAuthor(id, req.user.user_id);

    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await deleteManagedImageSafely(deletedPost.featured_image_public_id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
