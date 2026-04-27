import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaHistory, FaUser } from 'react-icons/fa';
import Layout from '../../components/Admin/Layout.jsx';
import dashboardStyles from '../Admin/DashBoard.module.css';
import { apiFetch } from '../../utils/apiClient.js';
import { getNavigationForRole } from '../../utils/dashboardNavigation.js';
import { getReadingHistory } from '../../utils/readingHistory.js';

const ReaderDashboard = ({ user }) => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadReaderData = async () => {
      try {
        const data = await apiFetch('/api/posts?limit=6', {
          headers: {}
        });
        setLatestPosts(data.posts || []);
      } catch (error) {
        console.error(error);
      }

      setHistory(getReadingHistory());
    };

    loadReaderData();
  }, []);

  return (
    <Layout user={user} title="Reader Dashboard" navItems={getNavigationForRole('reader')}>
      <div className={dashboardStyles.dashboardPage}>
        <section className={dashboardStyles.heroSection}>
          <div className={dashboardStyles.heroContent}>
            <span className={dashboardStyles.eyebrow}>Reader Space</span>
            <h1>Welcome to {user?.name}</h1>
            <p>Keep track of what you have read, revisit recent articles, and continue exploring the public blog.</p>
          </div>
          <div className={dashboardStyles.heroAction}>
            <Link to="/blog" className={dashboardStyles.primaryBtn}>
              <FaBookOpen /> Browse Blog
            </Link>
          </div>
        </section>

        <section className={dashboardStyles.statsSection}>
          <div className={dashboardStyles.statsGrid}>
            <div className={dashboardStyles.statCard}>
              <div className={dashboardStyles.statIcon}><FaBookOpen /></div>
              <h3>Available Posts</h3>
              <p className={dashboardStyles.statNumber}>{latestPosts.length}</p>
              <span className={dashboardStyles.statLabel}>Recent public articles</span>
            </div>
            <div className={dashboardStyles.statCard}>
              <div className={dashboardStyles.statIcon}><FaHistory /></div>
              <h3>Reading History</h3>
              <p className={dashboardStyles.statNumber}>{history.length}</p>
              <span className={dashboardStyles.statLabel}>Saved from your recent reads</span>
            </div>
            <div className={dashboardStyles.statCard}>
              <div className={dashboardStyles.statIcon}><FaUser /></div>
              <h3>Your Role</h3>
              <p className={dashboardStyles.statNumber}>Reader</p>
              <span className={dashboardStyles.statLabel}>View and track posts only</span>
            </div>
          </div>
        </section>

        <section className={dashboardStyles.recentSection} id="reading-history">
          <div className={dashboardStyles.sectionHeader}>
            <span className={dashboardStyles.sectionTag}>History</span>
            <h2>Posts you have already read</h2>
          </div>

          <div className={dashboardStyles.postsContainer}>
            {history.length > 0 ? (
              <div className={dashboardStyles.postsGrid}>
                {history.map((post) => (
                  <div key={post.id} className={dashboardStyles.postCard}>
                    <div className={dashboardStyles.postCardHeader}>
                      <h3>{post.title}</h3>
                      <span className={dashboardStyles.postStatus}>Archived</span>
                    </div>
                    <p className={dashboardStyles.postMeta}>{post.category || 'General'}</p>
                    <p className={dashboardStyles.postDate}>Read on {new Date(post.readAt).toLocaleDateString()}</p>
                    <Link to={`/blog/${post.id}`} className={dashboardStyles.postLink}>Open again</Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className={dashboardStyles.emptyState}>
                <FaHistory />
                <p>Your reading history will appear here after you open blog posts.</p>
              </div>
            )}
          </div>
        </section>

        <section className={dashboardStyles.recentSection}>
          <div className={dashboardStyles.sectionHeader}>
            <span className={dashboardStyles.sectionTag}>Latest Posts</span>
            <h2>Continue reading</h2>
          </div>

          <div className={dashboardStyles.postsContainer}>
            {latestPosts.length > 0 ? (
              <div className={dashboardStyles.postsGrid}>
                {latestPosts.map((post) => (
                  <div key={post.id} className={dashboardStyles.postCard}>
                    <div className={dashboardStyles.postCardHeader}>
                      <h3>{post.title}</h3>
                      <span className={dashboardStyles.postStatus}>{post.category || 'General'}</span>
                    </div>
                    <p className={dashboardStyles.postMeta}>{post.excerpt || 'Explore the full article for more details.'}</p>
                    <p className={dashboardStyles.postDate}>{post.read_time || 5} min read</p>
                    <Link to={`/blog/${post.id}`} className={dashboardStyles.postLink}>Read article</Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className={dashboardStyles.emptyState}>
                <FaBookOpen />
                <p>No public posts are available yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ReaderDashboard;
