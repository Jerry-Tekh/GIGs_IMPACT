import { useEffect, useState } from 'react';
import Layout from './../../components/Admin/Layout.jsx';
import styles from './Dashboard.module.css';
import { motion } from 'framer-motion';
import { FaFileAlt, FaTags, FaEye, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Analytics from './../../components/Analytics.jsx';


const Dashboard = () => {
  const [stats, setStats] = useState({
    posts: 0,
    categories: 0,
    views: 0
  });

  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentPosts();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/admin/stats`, {
        credentials: 'include'
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/posts?limit=5`, {
        credentials: 'include'
      });
      const data = await res.json();
      setRecentPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <motion.div
        className={styles.dashboard}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2>Dashboard</h2>
          <Link to="/admin/create" className={styles.createBtn}>
            <FaPlus /> New Post
          </Link>
        </div>

        {/* Stats Cards */}
        <div className={styles.cards}>
          <motion.div className={styles.card} whileHover={{ scale: 1.03 }}>
            <FaFileAlt className={styles.icon} />
            <h3>Total Posts</h3>
            <p>{stats.posts}</p>
          </motion.div>

          <motion.div className={styles.card} whileHover={{ scale: 1.03 }}>
            <FaTags className={styles.icon} />
            <h3>Categories</h3>
            <p>{stats.categories}</p>
          </motion.div>

          <motion.div className={styles.card} whileHover={{ scale: 1.03 }}>
            <FaEye className={styles.icon} />
            <h3>Views</h3>
            <p>{stats.views}</p>
          </motion.div>
        </div>

        {/* Analytics */}
        <Analytics /> 

        
        {/* Recent Posts */}
        <div className={styles.section}>
          <h3>Recent Posts</h3>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {recentPosts.map(post => (
                  <tr key={post.id}>
                    <td>{post.title}</td>
                    <td>{post.category}</td>
                    <td>{new Date(post.published_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </motion.div>
    </Layout>
  );
};

export default Dashboard;