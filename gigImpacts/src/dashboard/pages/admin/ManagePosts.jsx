import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaEdit, FaFileAlt, FaSearch, FaTimes, FaTrash } from 'react-icons/fa';
import Layout from './../../components/Layout.jsx';
import { CreatePostModal } from './CreatePost.jsx';
import styles from './ManagePosts.module.css';
import { apiFetch } from './../../../utils/apiClient.js';
import { getNavigationForRole } from './../../config/navigation.js';


const getPostStatus = (post) => {
  if (post.is_published) {
    return 'Published';
  }

  return 'Pending';
};

const ManagePosts = ({ user, refreshUser }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [postsLoading, setPostsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      setError('');
      const data = await apiFetch('/api/posts/manage', { requireAuth: true });
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await apiFetch('/api/categories', { headers: {}, requireAuth: true });
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/posts/${deleteId}`, {
        method: 'DELETE',
        requireAuth: true
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
        method: 'PATCH',
        requireAuth: true
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
        method: 'PATCH',
        requireAuth: true
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
    <Layout user={user} title="Manage Posts" navItems={getNavigationForRole('admin')} refreshUser={refreshUser}>
      <div className={styles.managePage}>
        <section className={styles.heroSection}>
          <motion.div className={styles.heroContent} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className={styles.eyebrow}>Content Management</span>
            <h1>Review, edit, and publish all blog posts.</h1>
            <p>Manage direct posts and decide which author submissions move into public visibility.</p>
          </motion.div>
        </section>

        <section className={styles.contentSection}>
          {successMessage && <div className={styles.successBanner}>{successMessage}</div>}
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
                {!categoriesLoading && categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {postsLoading ? (
            <motion.div className={styles.inlineSectionLoader} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className={styles.inlineSectionSpinner} aria-hidden="true" />
              <p>Checking for posts to display...</p>
            </motion.div>
          ) : filteredPosts.length > 0 ? (
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

              <div className={styles.mobileCardList}>
                {filteredPosts.map((post) => (
                  <details key={post.id} className={styles.mobileCard}>
                    <summary className={styles.mobileCardSummary}>
                      <div className={styles.mobileCardPrimary}>
                        <strong>{post.title}</strong>
                        <span>{post.author || 'Unknown author'}</span>
                      </div>
                      <div className={styles.mobileCardMeta}>
                        <span className={styles.categoryBadge}>{post.category || 'General'}</span>
                        <span className={`${styles.statusBadge} ${post.is_published ? styles.published : styles.pending}`}>
                          {getPostStatus(post)}
                        </span>
                      </div>
                    </summary>

                    <div className={styles.mobileCardBody}>
                      <div className={styles.mobileDetailGrid}>
                        <div className={styles.mobileDetailItem}>
                          <span className={styles.mobileDetailLabel}>Author</span>
                          <strong>{post.author || 'Unknown author'}</strong>
                        </div>
                        <div className={styles.mobileDetailItem}>
                          <span className={styles.mobileDetailLabel}>Category</span>
                          <strong>{post.category || 'General'}</strong>
                        </div>
                        <div className={styles.mobileDetailItem}>
                          <span className={styles.mobileDetailLabel}>Status</span>
                          <strong>{getPostStatus(post)}</strong>
                        </div>
                      </div>

                      <div className={styles.mobileActionRow}>
                        {!post.is_published && (
                          <>
                            <button className={styles.approveBtn} onClick={() => handleApprove(post.id)} title="Approve post">
                              <FaCheck />
                              <span>Approve</span>
                            </button>
                            <button className={styles.rejectBtn} onClick={() => handleReject(post.id)} title="Reject post">
                              <FaTimes />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        <button
                          className={styles.editBtn}
                          onClick={() => { setSelectedPost(post); setShowModal(true); }}
                          title="Edit post"
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>
                        <button className={styles.deleteBtn} onClick={() => setDeleteId(post.id)} title="Delete post">
                          <FaTrash />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </details>
                ))}
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
            onClose={(result) => {
              setShowModal(false);
              setSelectedPost(null);
              setSuccessMessage(result?.message || '');
              fetchPosts();
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default ManagePosts;
