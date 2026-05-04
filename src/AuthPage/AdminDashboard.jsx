import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './AdminDashboard.module.css';
import Layout from '../components/Admin/Layout.jsx';
import { FaFileAlt, FaTags, FaEye, FaPlus, FaArrowRight, FaEdit, FaChartBar, FaUsers, FaCog, FaArrowLeft } from 'react-icons/fa';
import Analytics from '../components/Analytics.jsx';
import { logoutUser } from '../utils/auth.js';

const dashboardItems = [
  {
    id: 1,
    title: 'Blog Posts',
    description: 'Create, edit, and manage your blog content with ease',
    link: '/admin/posts',
    label: 'Editorial',
    icon: FaEdit
  },
  {
    id: 2,
    title: 'Analytics',
    description: 'View detailed site statistics and visitor insights',
    link: '#',
    label: 'Insights',
    icon: FaChartBar,
    comingSoon: true
  },
  {
    id: 3,
    title: 'Users',
    description: 'Manage user accounts and access permissions',
    link: '#',
    label: 'Management',
    icon: FaUsers,
    comingSoon: true
  },
  {
    id: 4,
    title: 'Settings',
    description: 'Configure site settings and preferences',
    link: '#',
    label: 'Configuration',
    icon: FaCog,
    comingSoon: true
  }
];

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    posts: 0,
    categories: 0,
    views: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
      }
    };

    fetchUser();
    fetchStats();
  }, [navigate]);

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

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Layout>
      <div className={styles.dashboardPage}>
        {/* HERO SECTION */}
        <section className={styles.heroSection}>
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className={styles.eyebrow}>Editorial Control</span>
            <h1>Dashboard Overview</h1>
            <p>Track your content performance, manage posts, and grow your audience with real-time insights.</p>
            {user && (
              <div className={styles.userInfo}>
                <p><strong>Welcome, {user.name}!</strong></p>
              </div>
            )}
          </motion.div>

          <motion.div
            className={styles.heroActions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Link to="/admin/createPost" className={styles.primaryBtn}>
              <FaPlus /> Create Post
            </Link>
            <button className={styles.secondaryBtn} onClick={handleLogout}>
              Logout
            </button>
          </motion.div>
        </section>

        {/* STATS CARDS */}
        <section className={styles.statsSection}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={styles.sectionHeader}
          >
            <span className={styles.sectionTag}>Metrics</span>
            <h2>Your Content Statistics</h2>
          </motion.div>

          <div className={styles.statsGrid}>
            <motion.div
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              whileHover={{ y: -4 }}
            >
              <div className={styles.statIcon}>
                <FaFileAlt />
              </div>
              <h3>Total Posts</h3>
              <p className={styles.statNumber}>{stats.posts}</p>
              <span className={styles.statLabel}>Published & Drafts</span>
            </motion.div>

            <motion.div
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className={styles.statIcon}>
                <FaTags />
              </div>
              <h3>Categories</h3>
              <p className={styles.statNumber}>{stats.categories}</p>
              <span className={styles.statLabel}>Content Types</span>
            </motion.div>

            <motion.div
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
            >
              <div className={styles.statIcon}>
                <FaEye />
              </div>
              <h3>Total Views</h3>
              <p className={styles.statNumber}>{stats.views}</p>
              <span className={styles.statLabel}>All Time</span>
            </motion.div>
          </div>
        </section>

        {/* ANALYTICS */}
        <Analytics />

        {/* GRID SECTION */}
        <section className={styles.gridSection}>
          <div className={styles.gridContainer}>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className={styles.gridHeader}
            >
              <span className={styles.sectionTag}>Dashboard</span>
              <h2>Your workspace tools</h2>
            </motion.div>

            <div className={styles.grid}>
              {dashboardItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    className={styles.dashCard}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className={styles.cardIcon}><IconComponent /></div>
                    <span className={styles.cardLabel}>{item.label}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    {item.comingSoon ? (
                      <span className={styles.comingSoonBadge}>Coming Soon</span>
                    ) : (
                      <Link to={item.link} className={styles.cardLink}>
                        Access Tool
                        <span className={styles.linkArrow}><FaArrowRight /></span>
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BACK TO BLOG BUTTON */}
        <section className={styles.backSection}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/blog" className={styles.backBtn}>
              <FaArrowLeft /> Back to Blog
            </Link>
          </motion.div>
        </section>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
