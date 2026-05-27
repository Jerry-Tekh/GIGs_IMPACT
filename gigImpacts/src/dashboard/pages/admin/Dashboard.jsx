import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaCheckCircle, FaClock, FaFileAlt, FaTags, FaUsers } from 'react-icons/fa';
import Layout from './../../components/Layout.jsx';
import Analytics from './../../../components/Analytics.jsx';
import { apiFetch } from './../../../utils/apiClient.js';
import { smoothScrollToElement } from './../../../utils/smoothScroll.js';
import styles from './Dashboard.module.css';


import { getNavigationForRole } from './../../config/navigation.js';

const POSTS_PER_PAGE = 6;


const Dashboard = ({ user, refreshUser }) => {
  const [stats, setStats] = useState({ posts: 0, categories: 0, views: 0 });
  const [recentPosts, setRecentPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [accessRequirement, setAccessRequirement] = useState('');
  const [feedback, setFeedback] = useState('');
  const recentPostsPageRef = useRef(null);
  const [recentPostsPage, setRecentPostsPage] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.feedback?.message) {
      return;
    }

    setFeedback(location.state.feedback.message);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoadError('');
        setAccessRequirement('');
        const [statsData, manageData, pendingData, usersData] = await Promise.all([
          apiFetch('/api/admin/stats', { requireAuth: true }),
          apiFetch('/api/posts/manage', { requireAuth: true }),
          apiFetch('/api/posts/pending', { requireAuth: true }),
          apiFetch('/api/users', { requireAuth: true })
        ]);

        setStats(statsData || { posts: 0, categories: 0, views: 0 });
        setRecentPosts(manageData.posts || []);
        setPendingPosts((pendingData || []).slice(0, 5));
        setPendingCount((pendingData || []).length);
        setUsers(usersData.users || []);
      } catch (error) {
        console.error(error);
        if (error?.status === 403 && error?.payload?.requiresMFASetup) {
          setAccessRequirement('mfa');
          setLoadError('Multi-Factor Authentication must be enabled before privileged admin data can load.');
        } else if (error?.status === 403 && error?.payload?.requiresSecurityVerification) {
          setAccessRequirement('verification');
          setLoadError('This session needs extra verification before sensitive admin tools can load.');
        } else {
          setLoadError('Dashboard data could not be loaded right now.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const roleCounts = users.reduce(
    (accumulator, member) => {
      accumulator[member.role] = (accumulator[member.role] || 0) + 1;
      return accumulator;
    },
    { admin: 0, author: 0, reader: 0 }
  );

  const recentPostsTotalPages = Math.max(1, Math.ceil(recentPosts.length / POSTS_PER_PAGE));
  const paginatedRecentPosts = useMemo(() => {
    const startIndex = (recentPostsPage - 1) * POSTS_PER_PAGE;
    return recentPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [recentPosts, recentPostsPage]);

  const handleRecentPostsPageChange = (nextPage) => {
    if (nextPage === recentPostsPage) {
      return;
    }

    setRecentPostsPage(nextPage);
    window.requestAnimationFrame(() => {
      smoothScrollToElement(recentPostsPageRef.current, 110, 650);
    });
  };

  // Inline loader for dashboard loading state
  if (loading) {
    return (
      <Layout user={user} title="Admin Workspace" navItems={getNavigationForRole('admin')} refreshUser={refreshUser}>
        <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ width: 52, height: 52, border: '4px solid #eee', borderTop: '4px solid #1e5af3', borderRadius: '50%', animation: 'spin 0.85s linear infinite', display: 'inline-block' }} />
          <h2>Loading your dashboard</h2>
          <p>We're pulling the latest posts, approvals, users, and analytics now.</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} title="Admin Workspace" navItems={getNavigationForRole('admin')} refreshUser={refreshUser}>
      <div className={styles.dashboardPage}>
        {feedback && <div className={styles.successBanner}>{feedback}</div>}
        {loadError && <div className={styles.errorBanner}>{loadError}</div>}
        {accessRequirement ? (
          <section className={styles.securityNotice}>
            <span className={styles.sectionTag}>Access Notice</span>
            <h2>{accessRequirement === 'mfa' ? 'Finish MFA setup from your profile settings' : 'Verify this session before continuing'}</h2>
            <p>
              {accessRequirement === 'mfa'
                ? 'Use the profile/settings button in the top bar to enable MFA. Once setup is complete, refresh the dashboard and your admin data will load normally.'
                : 'This login was flagged as high risk. Please complete the required verification flow, then reload the dashboard.'}
            </p>
          </section>
        ) : null}
        <section className={styles.heroSection}>
          <motion.div className={styles.heroContent} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className={styles.eyebrow}>Editorial Control</span>
            <h1>Welcome {user?.name}</h1>
            <p>Monitor publishing activity, review author submissions, and keep user roles organized from one admin workspace.</p>
          </motion.div>

          <motion.div className={styles.heroAction} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <Link to="/admin/createPost" className={styles.primaryBtn}>
              <FaFileAlt /> Create Post
            </Link>
          </motion.div>
        </section>

        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <motion.div className={styles.statCard} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
              <div className={styles.statIcon}><FaFileAlt /></div>
              <h3>Total Posts</h3>
              <p className={styles.statNumber}>{stats.posts}</p>
              <span className={styles.statLabel}>Published and pending</span>
            </motion.div>

            <motion.div className={styles.statCard} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <div className={styles.statIcon}><FaTags /></div>
              <h3>Categories</h3>
              <p className={styles.statNumber}>{stats.categories}</p>
              <span className={styles.statLabel}>Content structure</span>
            </motion.div>

            <motion.div className={styles.statCard} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
              <div className={styles.statIcon}><FaUsers /></div>
              <h3>Registered Users</h3>
              <p className={styles.statNumber}>{users.length}</p>
              <span className={styles.statLabel}>Admins, authors, and readers</span>
            </motion.div>

            <motion.div className={styles.statCard} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
              <div className={styles.statIcon}><FaClock /></div>
              <h3>Pending Review</h3>
              <p className={styles.statNumber}>{pendingCount}</p>
              <span className={styles.statLabel}>Waiting for approval</span>
            </motion.div>
          </div>
        </section>

        {!accessRequirement ? <Analytics /> : null}

        <section className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Team Snapshot</span>
            <h2>Role distribution</h2>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <span>Admins</span>
              <strong>{roleCounts.admin}</strong>
            </div>
            <div className={styles.summaryCard}>
              <span>Authors</span>
              <strong>{roleCounts.author}</strong>
            </div>
            <div className={styles.summaryCard}>
              <span>Readers</span>
              <strong>{roleCounts.reader}</strong>
            </div>
            <div className={styles.summaryCard}>
              <span>Total Views</span>
              <strong>{stats.views}</strong>
            </div>
          </div>
        </section>

        <section className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Approval Queue</span>
            <h2>Pending author posts</h2>
          </div>

          <div className={styles.postsContainer}>
            {pendingPosts.length > 0 ? (
              <div className={styles.postsGrid}>
                {pendingPosts.map((post) => (
                  <motion.div key={post.id} className={styles.postCard} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
                    <div className={styles.postCardHeader}>
                      <h3>{post.title}</h3>
                      <span className={styles.pendingBadge}>Pending</span>
                    </div>
                    <p className={styles.postMeta}>By {post.author || 'Unknown author'}</p>
                    <p className={styles.postDate}>{post.category || 'General'}</p>
                    <Link to="/admin/posts" className={styles.postLink}>
                      Review now <FaArrowRight />
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <FaCheckCircle />
                <p>{loading ? 'Loading approval queue...' : 'No pending author submissions right now.'}</p>
              </div>
            )}
          </div>
        </section>

        <section className={styles.recentSection} ref={recentPostsPageRef}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Recent Activity</span>
            <h2>Latest posts</h2>
          </div>

          <div className={styles.postsContainer}>
            {recentPosts.length > 0 ? (
              <>
              <div className={styles.postsGrid}>
                {paginatedRecentPosts.map((post) => (
                  <motion.div key={post.id} className={styles.postCard} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
                    <div className={styles.postCardHeader}>
                      <h3>{post.title}</h3>
                      <span className={post.is_published ? styles.postStatus : styles.pendingBadge}>
                        {post.is_published ? 'Published' : 'Pending'}
                      </span>
                    </div>
                    <p className={styles.postMeta}>{post.category || 'General'}</p>
                    <p className={styles.postDate}>By {post.author || 'Unknown author'}</p>
                    <Link to="/admin/posts" className={styles.postLink}>
                      Open manager <FaArrowRight />
                    </Link>
                  </motion.div>
                ))}
              </div>
              {recentPostsTotalPages > 1 ? (
                <div className={styles.sectionPagination}>
                  {Array.from({ length: recentPostsTotalPages }, (_, index) => (
                    <button
                      key={`admin-recent-${index + 1}`}
                      type="button"
                      onClick={() => handleRecentPostsPageChange(index + 1)}
                      className={recentPostsPage === index + 1 ? styles.activePage : ''}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              ) : null}
              </>
            ) : (
              <div className={styles.emptyState}>
                <FaFileAlt />
                <p>No posts yet. Create the first post to start the editorial flow.</p>
                <Link to="/admin/createPost" className={styles.primaryBtn}>Create Post</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;
