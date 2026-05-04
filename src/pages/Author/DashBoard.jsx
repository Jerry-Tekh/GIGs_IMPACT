import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle, FaClock, FaFileAlt } from 'react-icons/fa';
import Layout from '../../components/Admin/Layout.jsx';
import dashboardStyles from '../Admin/DashBoard.module.css';
import { apiFetch } from '../../utils/apiClient.js';
import { getNavigationForRole } from '../../utils/dashboardNavigation.js';
// import PageLoader from '../../components/PageLoader.jsx';
import { formatReadableDate } from '../../utils/date.js';

const AuthorDashboard = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoadError('');
        const data = await apiFetch('/api/posts/author/myposts');
        setPosts(data || []);
      } catch (error) {
        console.error(error);
        setLoadError('We could not load your latest author activity right now.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const approvedPosts = posts.filter((post) => post.is_published).length;
  const pendingPosts = posts.filter((post) => !post.is_published).length;

  // Loader spinner removed for non-dashboard pages
  if (isLoading) {
    return (
      <Layout user={user} title="Author Workspace" navItems={getNavigationForRole('author')}>
        <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span className="inlineSpinner" style={{ width: 34, height: 34, border: '3px solid #eee', borderTop: '3px solid #1e5af3', borderRadius: '50%', animation: 'spin 0.85s linear infinite', display: 'inline-block' }} />
          <p>Loading author workspace...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} title="Author Workspace" navItems={getNavigationForRole('author')}>
      <div className={dashboardStyles.dashboardPage}>
        {loadError && <div className={dashboardStyles.errorBanner}>{loadError}</div>}
        <section className={dashboardStyles.heroSection}>
          <div className={dashboardStyles.heroContent}>
            <span className={dashboardStyles.eyebrow}>Author Studio</span>
            <h1>Welcome {user?.name}</h1>
            <p>Create articles, track approval progress, and manage every post you have written.</p>
          </div>
          <div className={dashboardStyles.heroAction}>
            <Link to="/author/createPost" className={dashboardStyles.primaryBtn}>
              <FaFileAlt /> New Post
            </Link>
          </div>
        </section>

        <section className={dashboardStyles.statsSection}>
          <div className={dashboardStyles.statsGrid}>
            <div className={dashboardStyles.statCard}>
              <div className={dashboardStyles.statIcon}><FaFileAlt /></div>
              <h3>Total Posts</h3>
              <p className={dashboardStyles.statNumber}>{posts.length}</p>
              <span className={dashboardStyles.statLabel}>Everything you have written</span>
            </div>
            <div className={dashboardStyles.statCard}>
              <div className={dashboardStyles.statIcon}><FaCheckCircle /></div>
              <h3>Approved</h3>
              <p className={dashboardStyles.statNumber}>{approvedPosts}</p>
              <span className={dashboardStyles.statLabel}>Live on the public blog</span>
            </div>
            <div className={dashboardStyles.statCard}>
              <div className={dashboardStyles.statIcon}><FaClock /></div>
              <h3>Pending</h3>
              <p className={dashboardStyles.statNumber}>{pendingPosts}</p>
              <span className={dashboardStyles.statLabel}>Waiting for admin review</span>
            </div>
          </div>
        </section>

        <section className={dashboardStyles.recentSection}>
          <div className={dashboardStyles.sectionHeader}>
            <span className={dashboardStyles.sectionTag}>My Posts</span>
            <h2>Latest submissions</h2>
          </div>

          <div className={dashboardStyles.postsContainer}>
            {posts.length > 0 ? (
              <div className={dashboardStyles.postsGrid}>
                {posts.slice(0, 6).map((post) => (
                  <div key={post.id} className={dashboardStyles.postCard}>
                    <div className={dashboardStyles.postCardHeader}>
                      <h3>{post.title}</h3>
                      <span className={post.is_published ? dashboardStyles.postStatus : dashboardStyles.pendingBadge}>
                        {post.is_published ? 'Published' : 'Pending'}
                      </span>
                    </div>
                    <p className={dashboardStyles.postMeta}>{post.category || 'General'}</p>
                    <p className={dashboardStyles.postDate}>
                      {post.updated_at ? formatReadableDate(post.updated_at) : 'Recently updated'}
                    </p>
                    <Link to="/author/posts" className={dashboardStyles.postLink}>
                      Manage post <FaArrowRight />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className={dashboardStyles.emptyState}>
                <FaFileAlt />
                <p>You have not created a post yet.</p>
                <Link to="/author/createPost" className={dashboardStyles.primaryBtn}>Create Post</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AuthorDashboard;
