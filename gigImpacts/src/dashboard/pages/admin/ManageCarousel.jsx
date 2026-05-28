import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus, FaImage } from 'react-icons/fa';
import Layout from './../../components/Layout.jsx';
import styles from './ManagePosts.module.css';
import { apiFetch } from './../../../utils/apiClient.js';
import { getNavigationForRole } from './../../config/navigation.js';
import {
  cleanupUploadedBlogImages,
  uploadBlogImageToCloudinary,
  validateBlogImageFile
} from './../../../utils/cloudinaryUpload.js';

const CarouselItemModal = ({ existing, onClose }) => {
  const MAX_TITLE = 40;
  const MAX_DESC = 75;
  const MAX_META = 20;

  const [form, setForm] = useState({ title: '', description: '', meta: '', image_url: '', image_public_id: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existing) {
      setForm({
        title: (existing.title || '').slice(0, MAX_TITLE),
        description: (existing.description || '').slice(0, MAX_DESC),
        meta: (existing.meta || '').slice(0, MAX_META),
        image_url: existing.image_url || '',
        image_public_id: existing.image_public_id || ''
      });
    }
  }, [existing]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFile = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    const validation = validateBlogImageFile(file);
    if (validation) {
      setError(validation);
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'title') next = value.slice(0, MAX_TITLE);
    if (name === 'description') next = value.slice(0, MAX_DESC);
    if (name === 'meta') next = value.slice(0, MAX_META);
    setForm((s) => ({ ...s, [name]: next }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Title is required');
    if (!form.image_url && !selectedFile) return setError('Please choose an image');

    setIsSaving(true);
    let uploaded = null;
    try {
      if (selectedFile) {
        uploaded = await uploadBlogImageToCloudinary(selectedFile);
      }

      const payload = {
        title: form.title,
        description: form.description,
        meta: form.meta,
        image_url: uploaded?.secure_url || form.image_url,
        image_public_id: uploaded?.public_id || form.image_public_id
      };

      if (existing) {
        await apiFetch(`/api/carousels/${existing.id}`, { method: 'PUT', requireAuth: true, body: JSON.stringify(payload) });
      } else {
        await apiFetch('/api/carousels', { method: 'POST', requireAuth: true, body: JSON.stringify(payload) });
      }

      onClose({ success: true });
    } catch (err) {
      console.error(err);
      if (uploaded?.public_id) await cleanupUploadedBlogImages([uploaded.public_id]);
      setError(err.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={() => onClose?.()}>
      <motion.div className={styles.confirmModal} onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h3>{existing ? 'Edit Carousel Item' : 'Create Carousel Item'}</h3>
        {error && <div className={styles.errorBanner}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>Title</label>
          <input name="title" value={form.title} onChange={handleChange} />
          <small className={styles.helperText}>{form.title.length}/{MAX_TITLE} characters</small>

          <label className={styles.label}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
          <small className={styles.helperText}>{form.description.length}/{MAX_DESC} characters</small>

          <label className={styles.label}>Meta</label>
          <input name="meta" value={form.meta} onChange={handleChange} />
          <small className={styles.helperText}>{form.meta.length}/{MAX_META} characters</small>

          <label className={styles.label}>Image</label>
          <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFile} />
          {previewUrl && <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', marginTop: 8 }} />}
          {!previewUrl && form.image_url && <img src={form.image_url} alt="current" style={{ maxWidth: '100%', marginTop: 8 }} />}

          <div className={styles.modalActions} style={{ marginTop: 12 }}>
            <button type="button" className={styles.cancelBtn} onClick={() => onClose?.()}>Cancel</button>
            <button type="submit" className={styles.confirmDeleteBtn} disabled={isSaving}>{isSaving ? 'Saving...' : existing ? 'Save' : 'Create'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ManageCarousel = ({ user, refreshUser }) => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [itemsLoading, setItemsLoading] = useState(true);

  const fetchItems = async () => {
    setItemsLoading(true);
    try {
      setError('');
      const res = await apiFetch('/api/carousels', { requireAuth: true });
      setItems(res.items || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load carousel items');
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/carousels/${deleteId}`, { method: 'DELETE', requireAuth: true });
      setDeleteId(null);
      fetchItems();
    } catch (err) {
      console.error(err);
      setError('Failed to delete item');
    }
  };

  return (
    <Layout user={user} title="Manage Carousel" navItems={getNavigationForRole('admin')} refreshUser={refreshUser}>
      <div className={styles.managePage}>
        <section className={styles.heroSection}>
          <motion.div className={styles.heroContent} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className={styles.eyebrow}>Site Carousel</span>
            <h1>Manage homepage carousel items</h1>
            <p>Admin-only control for featured organization adverts.</p>
          </motion.div>
          <div style={{ marginTop: 12 }}>
            <button className={styles.publishBtn} onClick={() => { setSelected(null); setShowModal(true); }}><FaPlus /> New Item</button>
          </div>
        </section>

        <section className={styles.contentSection}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          {itemsLoading ? (
            <div className={styles.inlineSectionLoader}>
              <span className={styles.inlineSectionSpinner} aria-hidden="true" />
              <p>Checking for carousel items to display...</p>
            </div>
          ) : items.length > 0 ? (
            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Preview</th>
                      <th>Title</th>
                      <th>Meta</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.id}>
                        <td className={styles.titleCell}><img src={it.image_url} alt={it.title} style={{ width: 120, height: 64, objectFit: 'cover' }} /></td>
                        <td>{it.title}</td>
                        <td>{it.meta}</td>
                        <td className={styles.actionsCell}>
                          <button className={styles.editBtn} onClick={() => { setSelected(it); setShowModal(true); }} title="Edit"><FaEdit /></button>
                          <button className={styles.deleteBtn} onClick={() => setDeleteId(it.id)} title="Delete"><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}><FaImage /><h3>No carousel items</h3><p>Create one to feature on the homepage.</p></div>
          )}
        </section>

        {deleteId && (
          <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
            <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
              <h3>Delete item?</h3>
              <p>This will remove the carousel item and its managed Cloudinary image.</p>
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
                <button className={styles.confirmDeleteBtn} onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <CarouselItemModal existing={selected} onClose={(result) => { setShowModal(false); setSelected(null); if (result?.success) fetchItems(); }} />
        )}
      </div>
    </Layout>
  );
};

export default ManageCarousel;
