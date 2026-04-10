import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../../components/Admin/Layout.jsx';
import styles from './Createpost.module.css';

const CreatePostModal = ({ onClose, existingPost, modalRef }) => {
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category_id: '',
    featured_image: '',
    read_time: '',
    is_published: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Populate form with existing post data when editing
  useEffect(() => {
    if (existingPost) {
      setForm({
        title: existingPost.title || '',
        excerpt: existingPost.excerpt || '',
        content: existingPost.content || '',
        category_id: existingPost.category_id || '',
        featured_image: existingPost.featured_image || '',
        read_time: existingPost.read_time || '',
        is_published: existingPost.is_published !== false
      });
    }
  }, [existingPost]);
  

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleContentKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = e.target;
      const tab = '  ';
      const newValue = value.slice(0, selectionStart) + tab + value.slice(selectionEnd);
      setForm(prev => ({ ...prev, content: newValue }));
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + tab.length;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = existingPost
      ? `${import.meta.env.VITE_SERVER_URL}/api/posts/${existingPost.id}`
      : `${import.meta.env.VITE_SERVER_URL}/api/posts`;

    const method = existingPost ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        alert(existingPost ? 'Post Updated!' : 'Post Created!');
        onClose();
      }
    } catch (error) {
      console.error(error);
      alert('Error saving post');
    }
  };

  return (
    <div 
      className={`${styles.pageWrapper} ${existingPost ? styles.editModal : ''}`}
      onClick={(e) => {
        if (existingPost && e.target === e.currentTarget) {
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
          <h2>{existingPost ? 'Edit Post' : 'Create New Post'}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.editor}>
            <input
              name="title"
              placeholder="Post Title..."
              className={styles.titleInput}
              value={form.title}
              onChange={handleChange}
            />

            <input
              name="excerpt"
              placeholder="Short description..."
              className={styles.excerptInput}
              value={form.excerpt}
              onChange={handleChange}
            />

            <textarea
              name="content"
              placeholder="Start writing your story..."
              className={styles.contentInput}
              value={form.content}
              onChange={handleChange}
              onKeyDown={handleContentKeyDown}
            />
          </div>

          <div className={styles.sidebar}>
            <label>Category</label>
            <select name="category_id" value={form.category_id} onChange={handleChange}>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <label>Featured Image URL</label>
            <input
              name="featured_image"
              placeholder="https://image-url..."
              value={form.featured_image}
              onChange={handleChange}
            />

            <label>Read Time (minutes)</label>
            <input
              name="read_time"
              type="number"
              value={form.read_time}
              onChange={handleChange}
            />

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="is_published"
                checked={form.is_published}
                onChange={handleChange}
              />
              Publish Immediately
            </label>

            {form.title && form.content && form.category_id && (
              <button type="submit" className={styles.publishBtn}>
                {existingPost ? 'Update Post' : 'Publish Post'}
              </button>
            )}
          </div>

          <div className={styles.preview}>
            <h1>{form.title || 'Post Title Preview'}</h1>
            <p className={styles.previewExcerpt}>
              {form.excerpt || 'Excerpt preview will show here...'}
            </p>

            {form.featured_image && (
              <img src={form.featured_image} alt="preview" />
            )}

            <p className={styles.previewContent}>
              {form.content || 'Start typing to see preview...'}
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const CreatePost = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/admin/dashboard');
  };

  return (
    <Layout>
      <CreatePostModal onClose={handleClose} />
    </Layout>
  );
};

// In your component file
export { CreatePostModal };
export default CreatePost;


