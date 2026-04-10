import { useEffect, useState } from 'react';
import Layout from '../../components/Admin/Layout.jsx';

// When importing
import CreatePost, { CreatePostModal } from './CreatePost.jsx';

import styles from  './ManagePost.module.css';



const ManagePosts = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [deleteId, setDeleteId] = useState(null);

  // FETCH POSTS
  const fetchPosts = async () => {
    let url = `${import.meta.env.VITE_SERVER_URL}/api/posts`;

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category !== 'all') params.append('category', category);

    url += `?${params.toString()}`;

    const res = await fetch(url, { credentials: 'include' });
    const data = await res.json();

    setPosts(data.posts || data);
  };

  // FETCH CATEGORIES
  const fetchCategories = async () => {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/categories`);
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [search, category]);

  // DELETE POST
  const handleDelete = async () => {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/api/posts/${deleteId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    setDeleteId(null);
    fetchPosts();
  };

  // EDIT POST
  const handleEdit = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  return (
    <Layout>
      <div className={styles.manageContainer}>
        <h2>Manage Posts</h2>

        {/* FILTERS */}
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td>{post.category}</td>
                  <td>
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : 'Draft'}
                  </td>
                  <td className={styles.actions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEdit(post)}
                    >
                      Edit
                    </button>

                    <button
                      className={styles.deleteBtn}
                      onClick={() => setDeleteId(post.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className={styles.mobileList}>
          {posts.map(post => (
            <div key={post.id} className={styles.card}>
              <h3>{post.title}</h3>
              <p>{post.category}</p>
              <span>
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString()
                  : 'Draft'}
              </span>

              <div className={styles.actions}>
                <button onClick={() => handleEdit(post)}>Edit</button>
                <button onClick={() => setDeleteId(post.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* DELETE CONFIRM MODAL */}
        {deleteId && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this post?</p>

              <div className={styles.modalActions}>
                <button onClick={() => setDeleteId(null)}>Cancel</button>
                <button className={styles.deleteBtn} onClick={handleDelete}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {showModal && (
          <CreatePostModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setSelectedPost(null);
              fetchPosts();
            }}
            existingPost={selectedPost}
          />
        )}
      </div>
    </Layout>
  );
};

export default ManagePosts;