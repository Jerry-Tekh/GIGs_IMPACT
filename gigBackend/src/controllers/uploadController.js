import { deleteCloudinaryImage, getBlogImageUploadConfig, isManagedBlogImage } from '../services/cloudinaryService.js';

const PRIVILEGED_ROLES = new Set(['admin', 'author']);

const assertUploadAccess = (req) => {
  if (!req.user) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }

  if (!PRIVILEGED_ROLES.has(req.user.role)) {
    const error = new Error('Only admins and authors can upload blog images.');
    error.statusCode = 403;
    throw error;
  }
};

export const signUploadController = async (req, res, next) => {
  try {
    assertUploadAccess(req);
    const uploadConfig = getBlogImageUploadConfig();

    res.json({
      success: true,
      data: uploadConfig
    });
  } catch (error) {
    next(error);
  }
};

export const cleanupUploadController = async (req, res, next) => {
  try {
    assertUploadAccess(req);

    const requestedPublicIds = Array.isArray(req.body?.publicIds)
      ? req.body.publicIds
      : req.body?.publicId
        ? [req.body.publicId]
        : [];

    const validPublicIds = requestedPublicIds
      .filter((publicId) => typeof publicId === 'string')
      .map((publicId) => publicId.trim())
      .filter(Boolean)
      .filter(isManagedBlogImage);

    if (validPublicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid blog image public IDs were provided.'
      });
    }

    const results = await Promise.allSettled(
      validPublicIds.map(async (publicId) => {
        const result = await deleteCloudinaryImage(publicId);
        return { publicId, result: result.result || 'ok' };
      })
    );

    const deleted = [];
    const failed = [];

    results.forEach((result, index) => {
      const publicId = validPublicIds[index];
      if (result.status === 'fulfilled') {
        deleted.push(result.value);
        return;
      }

      failed.push({
        publicId,
        message: result.reason?.message || 'Cleanup failed.'
      });
    });

    res.json({
      success: failed.length === 0,
      deleted,
      failed
    });
  } catch (error) {
    next(error);
  }
};
