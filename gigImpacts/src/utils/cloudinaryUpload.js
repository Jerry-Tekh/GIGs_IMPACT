import { apiFetch } from './apiClient.js';

const ONE_MEGABYTE = 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

const getFileExtension = (filename = '') => filename.split('.').pop()?.toLowerCase() || '';

export const validateBlogImageFile = (file) => {
  if (!file) {
    return 'Please choose an image file.';
  }

  const extension = getFileExtension(file.name);
  const typeIsAllowed = ALLOWED_IMAGE_TYPES.has(file.type);
  const extensionIsAllowed = ALLOWED_EXTENSIONS.has(extension);

  if (!typeIsAllowed && !extensionIsAllowed) {
    return 'Only JPG, JPEG, PNG, and WEBP images are allowed.';
  }

  if (file.size > ONE_MEGABYTE) {
    return 'Image size must be 1MB or smaller.';
  }

  return '';
};

export const requestBlogImageUploadSignature = async () => {
  const response = await apiFetch('/api/uploads/sign', {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify({})
  });

  return response?.data;
};

export const uploadBlogImageToCloudinary = async (file) => {
  const uploadConfig = await requestBlogImageUploadSignature();
  const formData = new FormData();

  formData.append('file', file);
  formData.append('api_key', uploadConfig.apiKey);
  formData.append('timestamp', String(uploadConfig.timestamp));
  formData.append('signature', uploadConfig.signature);
  formData.append('folder', uploadConfig.folder);
  formData.append('allowed_formats', uploadConfig.allowedFormats.join(','));
  formData.append('use_filename', String(uploadConfig.useFilename));
  formData.append('unique_filename', String(uploadConfig.uniqueFilename));

  const response = await fetch(uploadConfig.uploadUrl, {
    method: 'POST',
    body: formData
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Image upload failed.');
  }

  if (!payload?.secure_url || !payload?.public_id) {
    throw new Error('Cloudinary did not return the image details we expected.');
  }

  return {
    secure_url: payload.secure_url,
    public_id: payload.public_id
  };
};

export const cleanupUploadedBlogImages = async (publicIds) => {
  const validPublicIds = publicIds.filter(Boolean);

  if (validPublicIds.length === 0) {
    return;
  }

  try {
    await apiFetch('/api/uploads/cleanup', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({ publicIds: validPublicIds })
    });
  } catch (error) {
    console.error('Failed to clean up uploaded blog image(s):', error);
  }
};
