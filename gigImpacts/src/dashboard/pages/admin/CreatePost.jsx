import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaExclamationCircle, FaLayerGroup } from 'react-icons/fa';
import Layout from './../../components/Layout.jsx';
import styles from './CreatePost.module.css';
import { apiFetch } from './../../../utils/apiClient.js';
import  { getNavigationForRole } from './../../config/navigation.js';

import {
  cleanupUploadedBlogImages,
  uploadBlogImageToCloudinary,
  validateBlogImageFile
} from './../../../utils/cloudinaryUpload.js';

const getPreviewParagraphs = (content = '') =>
  content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const EXCERPT_MAX_LENGTH = 60;

const CreatePostModal = ({ onClose, existingPost, role = 'admin' }) => {
  const [categories, setCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [submitFeedback, setSubmitFeedback] = useState(null);
  const [feedbackCountdown, setFeedbackCountdown] = useState(0);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState('');

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category_id: '',
    featured_image: '',
    featured_image_public_id: '',
    read_time: '',
    is_published: role === 'admin'
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch('/api/categories', {
          headers: {},
          requireAuth: true
        });
        setCategories(data || []);
      } catch (err) {
        console.error(err);
        setSubmitFeedback({
          type: 'error',
          title: 'Categories could not be loaded',
          message: 'Refresh the page and try again. The editor needs categories before you can publish.'
        });
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!existingPost) {
      return;
    }

    setForm({
      title: existingPost.title || '',
      excerpt: existingPost.excerpt || '',
      content: existingPost.content || '',
      category_id: existingPost.category_id || '',
      featured_image: existingPost.featured_image || '',
      featured_image_public_id: existingPost.featured_image_public_id || '',
      read_time: existingPost.read_time || '',
      is_published: existingPost.is_published !== false
    });
  }, [existingPost]);

  useEffect(() => () => {
    if (selectedImagePreviewUrl) {
      URL.revokeObjectURL(selectedImagePreviewUrl);
    }
  }, [selectedImagePreviewUrl]);

  useEffect(() => {
    if (!submitFeedback || submitFeedback.type !== 'error') {
      setFeedbackCountdown(0);
      return undefined;
    }

    setFeedbackCountdown(5);

    const intervalId = window.setInterval(() => {
      setFeedbackCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          setSubmitFeedback(null);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [submitFeedback]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'excerpt'
            ? value.slice(0, EXCERPT_MAX_LENGTH)
            : value
    }));
  };

  const handleContentKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const { selectionStart, selectionEnd, value } = event.target;
      const tab = '  ';
      const nextValue = value.slice(0, selectionStart) + tab + value.slice(selectionEnd);
      setForm((current) => ({ ...current, content: nextValue }));
      requestAnimationFrame(() => {
        event.target.selectionStart = event.target.selectionEnd = selectionStart + tab.length;
      });
    }
  };

  const handleFeaturedImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (selectedImagePreviewUrl) {
      URL.revokeObjectURL(selectedImagePreviewUrl);
    }

    if (!file) {
      setSelectedImageFile(null);
      setSelectedImagePreviewUrl('');
      setImageError('');
      return;
    }

    const validationError = validateBlogImageFile(file);
    if (validationError) {
      setSelectedImageFile(null);
      setSelectedImagePreviewUrl('');
      setImageError(validationError);
      return;
    }

    setSelectedImageFile(file);
    setSelectedImagePreviewUrl(URL.createObjectURL(file));
    setImageError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitFeedback(null);

    if (!form.title.trim()) {
      setError('Post title is required');
      return;
    }

    if (!form.category_id) {
      setError('Please select a category');
      return;
    }

    if (!form.content.trim()) {
      setError('Post content is required');
      return;
    }

    if (form.excerpt.trim().length > EXCERPT_MAX_LENGTH) {
      setError(`Excerpt must be ${EXCERPT_MAX_LENGTH} characters or fewer`);
      return;
    }

    if (!form.featured_image.trim() && !selectedImageFile) {
      setError('Please choose a featured image');
      return;
    }

    if (imageError) {
      setError(imageError);
      return;
    }

    setIsSaving(true);
    setError('');

    let uploadedImage = null;

    const path = existingPost
      ? role === 'author'
        ? `/api/posts/author/${existingPost.id}`
        : `/api/posts/${existingPost.id}`
      : role === 'author'
        ? '/api/posts/author'
        : '/api/posts';

    const method = existingPost ? 'PUT' : 'POST';

    try {
      let nextImageFields = {
        featured_image: form.featured_image,
        featured_image_public_id: form.featured_image_public_id
      };

      if (selectedImageFile) {
        setIsUploadingImage(true);
        uploadedImage = await uploadBlogImageToCloudinary(selectedImageFile);
        nextImageFields = {
          featured_image: uploadedImage.secure_url,
          featured_image_public_id: uploadedImage.public_id
        };
      }

      const payload =
        role === 'author'
          ? {
              ...form,
              ...nextImageFields,
              is_published: false
            }
          : {
              ...form,
              ...nextImageFields
            };

      await apiFetch(path, {
        method,
        requireAuth: true,
        body: JSON.stringify(payload)
      });

      setForm((current) => ({
        ...current,
        ...nextImageFields
      }));
      onClose?.({
        type: 'success',
        message: existingPost
          ? isAuthor
            ? 'Your post changes were saved successfully.'
            : 'Post updated successfully.'
          : isAuthor
            ? 'Your post was submitted successfully for admin review.'
            : payload.is_published
              ? 'Post published successfully.'
              : 'Post saved successfully.'
      });
    } catch (err) {
      console.error(err);

      if (uploadedImage?.public_id) {
        await cleanupUploadedBlogImages([uploadedImage.public_id]);
      }

      setSubmitFeedback({
        type: 'error',
        title: existingPost ? 'Changes were not saved' : isAuthor ? 'Post submission did not go through' : 'Post could not be published',
        message: err.message || 'Please review your content, confirm your connection, and try again.',
        hint: uploadedImage?.public_id
          ? 'Your draft is still here. If you retry, the selected image will upload again without leaving an unused Cloudinary file behind.'
          : 'Your draft is still here, so you can fix the issue and submit again without losing your work.'
      });
    } finally {
      setIsUploadingImage(false);
      setIsSaving(false);
    }
  };

  const isFormValid = Boolean(
    form.title.trim() &&
    form.excerpt.trim() &&
    form.content.trim() &&
    form.category_id &&
    (form.featured_image.trim() || selectedImageFile) &&
    String(form.read_time).trim()
  );
  const isAuthor = role === 'author';
  const selectedCategory = categories.find((category) => String(category.id) === String(form.category_id));
  const previewParagraphs = getPreviewParagraphs(form.content);
  const previewImage = selectedImagePreviewUrl || form.featured_image;

  return (
    <div
      className={`${styles.pageWrapper} ${existingPost ? styles.editModal : ''}`}
      onClick={(event) => {
        if (existingPost && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2>{existingPost ? 'Edit Post' : isAuthor ? 'Submit New Post' : 'Create New Post'}</h2>
            <p>{isAuthor ? 'Draft your article and send it for admin approval.' : 'Write, edit, and publish your content.'}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {submitFeedback && (
            <div className={styles.feedbackCard} role="alert">
              <div className={styles.feedbackIcon}>
                <FaExclamationCircle />
              </div>
              <div className={styles.feedbackContent}>
                <strong>{submitFeedback.title}</strong>
                <p>{submitFeedback.message}</p>
                {submitFeedback.hint && <small>{submitFeedback.hint}</small>}
                {feedbackCountdown > 0 && (
                  <span className={styles.feedbackCountdown}>
                    This message will close in {feedbackCountdown}s.
                  </span>
                )}
              </div>
            </div>
          )}

          <div className={styles.editor}>
            <motion.div className={styles.formGroup} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <label className={styles.label}>Post Title</label>
              <input
                name="title"
                placeholder="Enter a compelling title..."
                className={styles.titleInput}
                value={form.title}
                onChange={handleChange}
              />
            </motion.div>

            <motion.div className={styles.formGroup} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
              <div className={styles.fieldHeader}>
                <label className={styles.label}>Excerpt</label>
                <span className={styles.characterCount}>{form.excerpt.length}/{EXCERPT_MAX_LENGTH}</span>
              </div>
              <input
                name="excerpt"
                placeholder="A brief summary of your post..."
                className={styles.excerptInput}
                value={form.excerpt}
                onChange={handleChange}
                maxLength={EXCERPT_MAX_LENGTH}
              />
              <p className={styles.helperText}>Keep this short and punchy. Maximum {EXCERPT_MAX_LENGTH} characters.</p>
            </motion.div>

            <motion.div className={styles.formGroup} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <label className={styles.label}>Content</label>
              <textarea
                name="content"
                placeholder="Start writing your story..."
                className={styles.contentInput}
                value={form.content}
                onChange={handleChange}
                onKeyDown={handleContentKeyDown}
              />
            </motion.div>
          </div>

          <div className={styles.sidebar}>
            <motion.div className={styles.sidebarSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <div className={styles.selectHeader}>
                <label className={styles.label}>Category</label>
                <span className={styles.selectHint}>Choose where this story belongs</span>
              </div>
              <div className={styles.selectShell}>
                <span className={styles.selectIcon} aria-hidden="true">
                  <FaLayerGroup />
                </span>
                <select name="category_id" value={form.category_id} onChange={handleChange} className={styles.select}>
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            <motion.div className={styles.sidebarSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <label className={styles.label}>Featured Image</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className={styles.fileInput}
                onChange={handleFeaturedImageChange}
              />
              <p className={styles.helperText}>Allowed: JPG, JPEG, PNG, WEBP. Maximum file size: 1MB.</p>
              {selectedImageFile && (
                <p className={styles.uploadInfo}>
                  {selectedImageFile.name} selected. The file will upload securely to Cloudinary when you save this post.
                </p>
              )}
              {form.featured_image && !selectedImageFile && (
                <p className={styles.uploadInfo}>A featured image is already attached to this post.</p>
              )}
              {imageError && <p className={styles.inlineError}>{imageError}</p>}
            </motion.div>

            <motion.div className={styles.sidebarSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              <label className={styles.label}>Read Time (minutes)</label>
              <input
                name="read_time"
                type="number"
                min="1"
                placeholder="5"
                className={styles.input}
                value={form.read_time}
                onChange={handleChange}
              />
            </motion.div>

            {!isAuthor && (
              <motion.div className={styles.checkboxGroup} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={form.is_published}
                    onChange={handleChange}
                  />
                  <span>Publish immediately</span>
                </label>
              </motion.div>
            )}

            {isAuthor && (
              <motion.div className={styles.sidebarSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <label className={styles.label}>Review Flow</label>
                <p className={styles.helperText}>Author posts stay pending until an admin approves them.</p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              className={styles.publishBtn}
              disabled={!isFormValid || isSaving}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSaving || isUploadingImage
                ? isUploadingImage
                  ? 'Uploading Image...'
                  : 'Saving...'
                : existingPost
                  ? 'Save Changes'
                  : isAuthor
                    ? 'Submit For Approval'
                    : 'Publish Post'}
            </motion.button>
          </div>

          <motion.section
            className={styles.preview}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className={styles.previewHeader}>
              <div>
                <span className={styles.previewLabel}>Live Preview</span>
                <h3>How this post will look</h3>
              </div>
              <div className={styles.previewMeta}>
                <span>{selectedCategory?.name || 'No category yet'}</span>
                <span>{form.read_time ? `${form.read_time} min read` : 'Read time not set'}</span>
              </div>
            </div>

            <article className={styles.previewArticle}>
              {previewImage ? (
                <img
                  src={previewImage}
                  alt={form.title?.trim() || 'Post preview'}
                  className={styles.previewImage}
                />
              ) : (
                <div className={styles.previewImagePlaceholder}>
                  Featured image preview will appear here
                </div>
              )}

              <div className={styles.previewBody}>
                <h1>{form.title.trim() || 'Your post title will appear here'}</h1>

                <p className={styles.previewExcerpt}>
                  {form.excerpt.trim() || 'A short excerpt helps readers understand what this article is about before they open it.'}
                </p>

                <div className={styles.previewContent}>
                  {previewParagraphs.length > 0 ? (
                    previewParagraphs.map((paragraph, index) => (
                      <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>
                    ))
                  ) : (
                    <p className={styles.previewPlaceholder}>
                      Start writing the body of your article to see the full reading preview.
                    </p>
                  )}
                </div>
              </div>
            </article>
          </motion.section>
        </form>
      </motion.div>
    </div>
  );
};

const CreatePost = ({ user, refreshUser }) => {
  const navigate = useNavigate();

  return (
    <Layout
      user={user}
      title="Admin Workspace"
      navItems={getNavigationForRole('admin')}
      refreshUser={refreshUser}
    >
      <CreatePostModal
        onClose={(result) => navigate('/admin/dashboard', result?.message ? {
          state: {
            feedback: {
              message: result.message
            }
          }
        } : undefined)}
        role="admin"
      />
    </Layout>
  );
};

export { CreatePostModal };
export default CreatePost;
