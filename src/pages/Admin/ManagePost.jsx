import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaEdit, FaFileAlt, FaSearch, FaTimes, FaTrash } from 'react-icons/fa';
import Layout from '../../components/Admin/Layout.jsx';
import { CreatePostModal } from './CreatePost.jsx';
import styles from './ManagePost.module.css';
import { apiFetch } from '../../utils/apiClient.js';
import { getNavigationForRole } from '../../utils/dashboardNavigation.js';

const getPostStatus = (post) => {
  if (post.is_published) {
    return 'Published';
  }

  return 'Pending';
};

const ManagePosts = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      const data = await apiFetch('/api/posts/manage');
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load posts');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiFetch('/api/categories', { headers: {} });
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/posts/${deleteId}`, {
        method: 'DELETE'
      });
      setDeleteId(null);
      fetchPosts();
    } catch (err) {
      console.error(err);
      setError('Failed to delete post');
    }
  };

  const handleApprove = async (postId) => {
    try {
      await apiFetch(`/api/posts/${postId}/approve`, {
        method: 'PATCH'
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
      setError('Failed to approve post');
    }
  };

  const handleReject = async (postId) => {
    try {
      await apiFetch(`/api/posts/${postId}/reject`, {
        method: 'PATCH'
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
      setError('Failed to reject post');
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || post.category_slug === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout user={user} title="Manage Posts" navItems={getNavigationForRole('admin')}>
      <div className={styles.managePage}>
        <section className={styles.heroSection}>
          <motion.div className={styles.heroContent} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className={styles.eyebrow}>Content Management</span>
            <h1>Review, edit, and publish all blog posts.</h1>
            <p>Manage direct posts and decide which author submissions move into public visibility.</p>
          </motion.div>
        </section>

        <section className={styles.contentSection}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          <motion.div className={styles.filterBar} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <div className={styles.filterGroup}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className={styles.categorySelect}>
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {filteredPosts.length > 0 ? (
            <motion.div className={styles.tableContainer} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr key={post.id}>
                        <td className={styles.titleCell}>{post.title}</td>
                        <td>{post.author || 'Unknown author'}</td>
                        <td className={styles.categoryCell}>
                          <span className={styles.categoryBadge}>{post.category || 'General'}</span>
                        </td>
                        <td className={styles.statusCell}>
                          <span className={`${styles.statusBadge} ${post.is_published ? styles.published : styles.pending}`}>
                            {getPostStatus(post)}
                          </span>
                        </td>
                        <td className={styles.actionsCell}>
                          {!post.is_published && (
                            <>
                              <button className={styles.approveBtn} onClick={() => handleApprove(post.id)} title="Approve post">
                                <FaCheck />
                              </button>
                              <button className={styles.rejectBtn} onClick={() => handleReject(post.id)} title="Reject post">
                                <FaTimes />
                              </button>
                            </>
                          )}
                          <button className={styles.editBtn} onClick={() => { setSelectedPost(post); setShowModal(true); }} title="Edit post">
                            <FaEdit />
                          </button>
                          <button className={styles.deleteBtn} onClick={() => setDeleteId(post.id)} title="Delete post">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div className={styles.emptyState} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
              <FaFileAlt />
              <h3>No posts found</h3>
              <p>Try another search or create a new post.</p>
            </motion.div>
          )}
        </section>

        {deleteId && (
          <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setDeleteId(null)}>
            <motion.div className={styles.confirmModal} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(event) => event.stopPropagation()}>
              <h3>Delete Post?</h3>
              <p>This action cannot be undone.</p>
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
                <button className={styles.confirmDeleteBtn} onClick={handleDelete}>Delete Post</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showModal && (
          <CreatePostModal
            role="admin"
            existingPost={selectedPost}
            onClose={() => {
              setShowModal(false);
              setSelectedPost(null);
              fetchPosts();
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default ManagePosts;
