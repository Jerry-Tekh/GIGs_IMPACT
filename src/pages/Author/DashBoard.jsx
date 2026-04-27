import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle, FaClock, FaFileAlt } from 'react-icons/fa';
import Layout from '../../components/Admin/Layout.jsx';
import dashboardStyles from '../Admin/DashBoard.module.css';
import { apiFetch } from '../../utils/apiClient.js';
import { getNavigationForRole } from '../../utils/dashboardNavigation.js';

const AuthorDashboard = ({ user }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await apiFetch('/api/posts/author/myposts');
        setPosts(data || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadPosts();
  }, []);

  const approvedPosts = posts.filter((post) => post.is_published).length;
  const pendingPosts = posts.filter((post) => !post.is_published).length;

  return (
    <Layout user={user} title="Author Workspace" navItems={getNavigationForRole('author')}>
      <div className={dashboardStyles.dashboardPage}>
        <section className={dashboardStyles.heroSection}>
          <div className={dashboardStyles.heroContent}>
            <span className={dashboardStyles.eyebrow}>Author Studio</span>
            <h1>Welcome to {user?.name}</h1>
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
                      {post.updated_at ? new Date(post.updated_at).toLocaleDateString() : 'Recently updated'}
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
