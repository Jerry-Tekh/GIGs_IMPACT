import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle, FaClock, FaFileAlt } from 'react-icons/fa';
import Layout from './../../components/Layout.jsx';

import dashboardStyles from './../admin/Dashboard.module.css';
import { apiFetch } from './../../../utils/apiClient.js';
import { getNavigationForRole }  from './../../config/navigation.js';
import { smoothScrollToElement } from './../../../utils/smoothScroll.js';

// import PageLoader from '../../components/PageLoader.jsx';
import { formatReadableDate } from './../../../utils/date.js';

const POSTS_PER_PAGE = 6;

const AuthorDashboard = ({ user, refreshUser }) => {
  const [posts, setPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [accessRequirement, setAccessRequirement] = useState('');
  const [feedback, setFeedback] = useState('');
  const latestSubmissionsRef = useRef(null);
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
    const loadPosts = async () => {
      try {
        setLoadError('');
        setAccessRequirement('');
        const data = await apiFetch('/api/posts/author/myposts');
        setPosts(data || []);
      } catch (error) {
        console.error(error);
        if (error?.status === 403 && error?.payload?.requiresMFASetup) {
          setAccessRequirement('mfa');
          setLoadError('Multi-Factor Authentication must be enabled before author tools can load.');
        } else if (error?.status === 403 && error?.payload?.requiresSecurityVerification) {
          setAccessRequirement('verification');
          setLoadError('This session needs extra verification before author tools can load.');
        } else {
          setLoadError('We could not load your latest author activity right now.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const approvedPosts = posts.filter((post) => post.is_published).length;
  const pendingPosts = posts.filter((post) => !post.is_published).length;
  const totalPostPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const paginatedPosts = useMemo(() => {
    const startIndex = (postsPage - 1) * POSTS_PER_PAGE;
    return posts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [posts, postsPage]);

  const handlePostsPageChange = (nextPage) => {
    if (nextPage === postsPage) {
      return;
    }

    setPostsPage(nextPage);
    window.requestAnimationFrame(() => {
      smoothScrollToElement(latestSubmissionsRef.current, 110, 650);
    });
  };

  // Loader spinner removed for non-dashboard pages
  if (isLoading) {
    return (
      <Layout user={user} title="Author Workspace" navItems={getNavigationForRole('author')} refreshUser={refreshUser}>
        <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span className="inlineSpinner" style={{ width: 34, height: 34, border: '3px solid #eee', borderTop: '3px solid #1e5af3', borderRadius: '50%', animation: 'spin 0.85s linear infinite', display: 'inline-block' }} />
          <p>Loading author workspace...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} title="Author Workspace" navItems={getNavigationForRole('author')} refreshUser={refreshUser}>
      <div className={dashboardStyles.dashboardPage}>
        {feedback && <div className={dashboardStyles.successBanner}>{feedback}</div>}
        {loadError && <div className={dashboardStyles.errorBanner}>{loadError}</div>}
        {accessRequirement ? (
          <section className={dashboardStyles.securityNotice}>
            <span className={dashboardStyles.sectionTag}>Access Notice</span>
            <h2>{accessRequirement === 'mfa' ? 'Complete MFA setup from your profile settings' : 'Verify this session before continuing'}</h2>
            <p>
              {accessRequirement === 'mfa'
                ? 'Open the profile/settings button in the top bar and enable MFA. As soon as that setup is complete, your author tools will start working normally.'
                : 'This login was flagged for extra review. Complete the security verification flow first, then refresh the dashboard.'}
            </p>
          </section>
        ) : null}
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

        <section className={dashboardStyles.recentSection} ref={latestSubmissionsRef}>
          <div className={dashboardStyles.sectionHeader}>
            <span className={dashboardStyles.sectionTag}>My Posts</span>
            <h2>Latest submissions</h2>
          </div>

          <div className={dashboardStyles.postsContainer}>
            {posts.length > 0 ? (
              <>
              <div className={dashboardStyles.postsGrid}>
                {paginatedPosts.map((post) => (
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
              {totalPostPages > 1 ? (
                <div className={dashboardStyles.sectionPagination}>
                  {Array.from({ length: totalPostPages }, (_, index) => (
                    <button
                      key={`author-posts-${index + 1}`}
                      type="button"
                      onClick={() => handlePostsPageChange(index + 1)}
                      className={postsPage === index + 1 ? dashboardStyles.activePage : ''}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              ) : null}
              </>
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
