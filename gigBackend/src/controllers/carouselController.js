import {
  createCarouselItem,
  getActiveCarouselItems,
  getCarouselItemById,
  updateCarouselItem,
  deleteCarouselItem
} from '../models/carouselModels.js';

import { isManagedBlogImage, deleteCloudinaryImage } from '../services/cloudinaryService.js';

const normalizeImageFields = (body = {}) => {
  const hasImageUrl = Object.prototype.hasOwnProperty.call(body, 'image_url');
  const hasPublicId = Object.prototype.hasOwnProperty.call(body, 'image_public_id');

  const imageUrl = typeof body.image_url === 'string' ? body.image_url.trim() : body.image_url;
  const imagePublicId = typeof body.image_public_id === 'string' ? body.image_public_id.trim() : body.image_public_id;

  if (imageUrl && !imageUrl.startsWith('https://')) {
    const error = new Error('Carousel image URL must use HTTPS.');
    error.statusCode = 400;
    throw error;
  }

  if (imagePublicId && !isManagedBlogImage(imagePublicId)) {
    const error = new Error('Carousel image public ID is invalid.');
    error.statusCode = 400;
    throw error;
  }

  if (imagePublicId && !imageUrl) {
    const error = new Error('Image URL is required when an image public ID is provided.');
    error.statusCode = 400;
    throw error;
  }

  return {
    ...body,
    ...(hasImageUrl ? { image_url: imageUrl || '' } : {}),
    ...(hasPublicId ? { image_public_id: imagePublicId || '' } : {})
  };
};

const validateCarouselFields = (body = {}) => {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const meta = typeof body.meta === 'string' ? body.meta.trim() : '';

  if (title && title.length > 40) {
    const error = new Error('Title must be 40 characters or fewer.');
    error.statusCode = 400;
    throw error;
  }

  if (description && description.length > 75) {
    const error = new Error('Description must be 75 characters or fewer.');
    error.statusCode = 400;
    throw error;
  }

  if (meta && meta.length > 20) {
    const error = new Error('Meta must be 20 characters or fewer.');
    error.statusCode = 400;
    throw error;
  }
};

const safeDeleteManagedImage = async (publicId) => {
  if (!publicId || !isManagedBlogImage(publicId)) return;
  try {
    await deleteCloudinaryImage(publicId);
  } catch (err) {
    console.error('Carousel image cleanup failed:', err.message);
  }
};

export const createCarouselController = async (req, res) => {
  try {
    const body = normalizeImageFields(req.body);
    validateCarouselFields(body);
    const item = await createCarouselItem({
      title: body.title || 'Untitled',
      description: body.description || '',
      meta: body.meta || '',
      image_url: body.image_url || '',
      image_public_id: body.image_public_id || '',
      is_active: body.is_active ?? true
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getPublicCarouselController = async (_req, res) => {
  try {
    const items = await getActiveCarouselItems();
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCarouselController = async (req, res) => {
  try {
    const { id } = req.params;
    const normalized = normalizeImageFields(req.body);
    validateCarouselFields(normalized);
    const existing = await getCarouselItemById(id);
    if (!existing) return res.status(404).json({ message: 'Carousel item not found' });

    const updated = await updateCarouselItem(id, {
      title: normalized.title ?? existing.title,
      description: normalized.description ?? existing.description,
      meta: normalized.meta ?? existing.meta,
      image_url: normalized.image_url ?? existing.image_url,
      image_public_id: normalized.image_public_id ?? existing.image_public_id,
      is_active: normalized.is_active ?? existing.is_active
    });

    if (existing.image_public_id !== updated.image_public_id) {
      await safeDeleteManagedImage(existing.image_public_id);
    }

    res.json(updated);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const deleteCarouselController = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getCarouselItemById(id);
    if (!existing) return res.status(404).json({ message: 'Carousel item not found' });

    const deleted = await deleteCarouselItem(id);
    await safeDeleteManagedImage(deleted.image_public_id);

    res.json({ message: 'Carousel item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
