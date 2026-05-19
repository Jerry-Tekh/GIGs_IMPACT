import crypto from 'crypto';

const CLOUDINARY_UPLOAD_FOLDER = 'blog/posts';
const CLOUDINARY_ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
const CLOUDINARY_MAX_FILE_SIZE_BYTES = 1024 * 1024;

const getCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const error = new Error('Cloudinary environment variables are not configured.');
    error.statusCode = 500;
    throw error;
  }

  return { cloudName, apiKey, apiSecret };
};

const signParams = (params, apiSecret) => {
  const serializedParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(',') : value}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(`${serializedParams}${apiSecret}`)
    .digest('hex');
};

export const getBlogImageUploadConfig = () => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);

  const signedParams = {
    allowed_formats: CLOUDINARY_ALLOWED_FORMATS.join(','),
    folder: CLOUDINARY_UPLOAD_FOLDER,
    timestamp,
    unique_filename: true,
    use_filename: false
  };

  return {
    cloudName,
    apiKey,
    timestamp,
    signature: signParams(signedParams, apiSecret),
    folder: CLOUDINARY_UPLOAD_FOLDER,
    allowedFormats: CLOUDINARY_ALLOWED_FORMATS,
    maxFileSizeBytes: CLOUDINARY_MAX_FILE_SIZE_BYTES,
    useFilename: false,
    uniqueFilename: true,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  };
};

export const isManagedBlogImage = (publicId = '') =>
  typeof publicId === 'string' && publicId.startsWith(`${CLOUDINARY_UPLOAD_FOLDER}/`);

export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId || !isManagedBlogImage(publicId)) {
    return { result: 'skipped' };
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const destroyParams = {
    invalidate: true,
    public_id: publicId,
    timestamp
  };

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      ...Object.fromEntries(
        Object.entries(destroyParams).map(([key, value]) => [key, String(value)])
      ),
      api_key: apiKey,
      signature: signParams(destroyParams, apiSecret)
    })
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.error?.message || 'Cloudinary image deletion failed.');
    error.statusCode = response.status;
    throw error;
  }

  return payload;
};

export {
  CLOUDINARY_ALLOWED_FORMATS,
  CLOUDINARY_MAX_FILE_SIZE_BYTES,
  CLOUDINARY_UPLOAD_FOLDER
};
