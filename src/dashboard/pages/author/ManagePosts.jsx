import { useEffect, useState } from 'react';
import { FaEdit, FaFileAlt, FaSearch, FaTrash } from 'react-icons/fa';
import Layout from './../../components/Layout.jsx';
import { CreatePostModal } from './../admin/CreatePost.jsx';
import styles from './../admin/ManagePosts.module.css';
import { apiFetch } from './../../../utils/apiClient.js';
import { getNavigationForRole } from './../../config/navigation.js';


const ManagePost = ({ user, refreshUser }) => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchPosts = async () => {
    try {
      const data = await apiFetch('/api/posts/author/myposts');
      setPosts(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/posts/author/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout user={user} title="My Posts" navItems={getNavigationForRole('author')} refreshUser={refreshUser}>
      <div className={styles.managePage}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>Author Queue</span>
            <h1>Manage the posts you have written.</h1>
            <p>Edit your work, remove a post, or check whether it has been published.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          {successMessage && <div className={styles.successBanner}>{successMessage}</div>}
          <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search your posts..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {filteredPosts.length > 0 ? (
            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr key={post.id}>
                        <td className={styles.titleCell}>{post.title}</td>
                        <td className={styles.categoryCell}>
                          <span className={styles.categoryBadge}>{post.category || 'General'}</span>
                        </td>
                        <td className={styles.statusCell}>
                          <span className={`${styles.statusBadge} ${post.is_published ? styles.published : styles.pending}`}>
                            {post.is_published ? 'Published' : 'Pending'}
                          </span>
                        </td>
                        <td className={styles.actionsCell}>
                          <button className={styles.editBtn} onClick={() => { setSelectedPost(post); setShowModal(true); }}>
                            <FaEdit />
                          </button>
                          <button className={styles.deleteBtn} onClick={() => setDeleteId(post.id)}>
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
                        <span>{post.category || 'General'}</span>
                      </div>
                      <div className={styles.mobileCardMeta}>
                        <span className={`${styles.statusBadge} ${post.is_published ? styles.published : styles.pending}`}>
                          {post.is_published ? 'Published' : 'Pending'}
                        </span>
                      </div>
                    </summary>

                    <div className={styles.mobileCardBody}>
                      <div className={styles.mobileDetailGrid}>
                        <div className={styles.mobileDetailItem}>
                          <span className={styles.mobileDetailLabel}>Category</span>
                          <strong>{post.category || 'General'}</strong>
                        </div>
                        <div className={styles.mobileDetailItem}>
                          <span className={styles.mobileDetailLabel}>Status</span>
                          <strong>{post.is_published ? 'Published' : 'Pending'}</strong>
                        </div>
                      </div>

                      <div className={styles.mobileActionRow}>
                        <button
                          className={styles.editBtn}
                          onClick={() => { setSelectedPost(post); setShowModal(true); }}
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>
                        <button className={styles.deleteBtn} onClick={() => setDeleteId(post.id)}>
                          <FaTrash />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FaFileAlt />
              <h3>No posts found</h3>
              <p>Your posts will appear here after you create them.</p>
            </div>
          )}
        </section>

        {deleteId && (
          <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
            <div className={styles.confirmModal} onClick={(event) => event.stopPropagation()}>
              <h3>Delete Post?</h3>
              <p>This will remove the post from your author workspace.</p>
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
                <button className={styles.confirmDeleteBtn} onClick={handleDelete}>Delete Post</button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <CreatePostModal
            role="author"
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

export default ManagePost;
