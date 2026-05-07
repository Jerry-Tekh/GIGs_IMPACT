import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaExclamationCircle } from 'react-icons/fa';
import Layout from '../../components/Admin/Layout.jsx';
import styles from './CreatePost.module.css';
import { apiFetch } from '../../utils/apiClient.js';
import { getNavigationForRole } from '../../utils/dashboardNavigation.js';

const getPreviewParagraphs = (content = '') =>
  content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const CreatePostModal = ({ onClose, existingPost, role = 'admin' }) => {
  const [categories, setCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [submitFeedback, setSubmitFeedback] = useState(null);
  const [feedbackCountdown, setFeedbackCountdown] = useState(0);

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category_id: '',
    featured_image: '',
    read_time: '',
    is_published: role === 'admin'
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch('/api/categories', {
          headers: {}
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
      read_time: existingPost.read_time || '',
      is_published: existingPost.is_published !== false
    });
  }, [existingPost]);

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
      [name]: type === 'checkbox' ? checked : value
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

    setIsSaving(true);
    setError('');

    const payload =
      role === 'author'
        ? {
            ...form,
            is_published: false
          }
        : form;

    const path = existingPost
      ? role === 'author'
        ? `/api/posts/author/${existingPost.id}`
        : `/api/posts/${existingPost.id}`
      : role === 'author'
        ? '/api/posts/author'
        : '/api/posts';

    const method = existingPost ? 'PUT' : 'POST';

    try {
      await apiFetch(path, {
        method,
        body: JSON.stringify(payload)
      });

      onClose();
    } catch (err) {
      console.error(err);
      setSubmitFeedback({
        type: 'error',
        title: existingPost ? 'Changes were not saved' : isAuthor ? 'Post submission did not go through' : 'Post could not be published',
        message: err.message || 'Please review your content, confirm your connection, and try again.',
        hint: 'Your draft is still here, so you can fix the issue and submit again without losing your work.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = Boolean(
    form.title.trim() &&
    form.excerpt.trim() &&
    form.content.trim() &&
    form.category_id &&
    form.featured_image.trim() &&
    String(form.read_time).trim()
  );
  const isAuthor = role === 'author';
  const selectedCategory = categories.find((category) => String(category.id) === String(form.category_id));
  const previewParagraphs = getPreviewParagraphs(form.content);

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
              <label className={styles.label}>Excerpt</label>
              <input
                name="excerpt"
                placeholder="A brief summary of your post..."
                className={styles.excerptInput}
                value={form.excerpt}
                onChange={handleChange}
              />
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
              <label className={styles.label}>Category</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} className={styles.select}>
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div className={styles.sidebarSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <label className={styles.label}>Featured Image URL</label>
              <input
                name="featured_image"
                placeholder="https://example.com/image.jpg"
                className={styles.input}
                value={form.featured_image}
                onChange={handleChange}
              />
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
              {isSaving ? 'Saving...' : existingPost ? 'Save Changes' : isAuthor ? 'Submit For Approval' : 'Publish Post'}
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
              {form.featured_image ? (
                <img
                  src={form.featured_image}
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
      <CreatePostModal onClose={() => navigate('/admin/dashboard')} role="admin" />
    </Layout>
  );
};

export { CreatePostModal };
export default CreatePost;
