import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaHistory, FaUser } from 'react-icons/fa';
import Layout from './../../components/Layout.jsx';
import dashboardStyles from './../admin/Dashboard.module.css';
import { apiFetch } from './../../../utils/apiClient.js';
import { getNavigationForRole } from './../../config/navigation.js';
import { getReadingHistory } from './../../../utils/readingHistory.js';
import { smoothScrollToElement } from './../../../utils/smoothScroll.js';

// import PageLoader from '../../components/PageLoader.jsx';
import { formatReadableDate } from  './../../../utils/date.js';

const POSTS_PER_PAGE = 6;

const ReaderDashboard = ({ user, refreshUser }) => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [history, setHistory] = useState([]);
  const [latestPage, setLatestPage] = useState(1);
  const [latestTotalPages, setLatestTotalPages] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLatestLoading, setIsLatestLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const historySectionRef = useRef(null);
  const latestSectionRef = useRef(null);
  const shouldScrollLatestRef = useRef(false);

  useEffect(() => {
    const loadReaderData = async () => {
      try {
        setIsLatestLoading(true);
        setLoadError('');
        const data = await apiFetch(`/api/posts?page=${latestPage}&limit=${POSTS_PER_PAGE}`, {
          headers: {}
        });
        setLatestPosts(data.posts || []);
        setLatestTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error(error);
        setLoadError('We could not load the latest public posts right now.');
      } finally {
        setHistory(getReadingHistory());
        setIsLatestLoading(false);
        setIsInitialLoading(false);
      }
    };

    loadReaderData();
  }, [latestPage]);

  useEffect(() => {
    setHistoryPage(1);
  }, [history.length]);

  useEffect(() => {
    if (isLatestLoading || !shouldScrollLatestRef.current) {
      return;
    }

    smoothScrollToElement(latestSectionRef.current, 110, 650);
    shouldScrollLatestRef.current = false;
  }, [isLatestLoading, latestPosts]);

  const historyTotalPages = Math.max(1, Math.ceil(history.length / POSTS_PER_PAGE));

  const paginatedHistory = useMemo(() => {
    const startIndex = (historyPage - 1) * POSTS_PER_PAGE;
    return history.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [history, historyPage]);

  const handleHistoryPageChange = (nextPage) => {
    if (nextPage === historyPage) {
      return;
    }

    setHistoryPage(nextPage);

    window.requestAnimationFrame(() => {
      smoothScrollToElement(historySectionRef.current, 110, 650);
    });
  };

  const handleLatestPageChange = (nextPage) => {
    if (nextPage === latestPage) {
      return;
    }

    shouldScrollLatestRef.current = true;
    setLatestPage(nextPage);
  };

  // Loader spinner removed for non-dashboard pages
  if (isInitialLoading) {
    return (
      <Layout user={user} title="Reader Dashboard" navItems={getNavigationForRole('reader')} refreshUser={refreshUser}>
        <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span className="inlineSpinner" style={{ width: 34, height: 34, border: '3px solid #eee', borderTop: '3px solid #1e5af3', borderRadius: '50%', animation: 'spin 0.85s linear infinite', display: 'inline-block' }} />
          <p>Loading reader dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} title="Reader Dashboard" navItems={getNavigationForRole('reader')} refreshUser={refreshUser}>
      <div className={dashboardStyles.dashboardPage}>
        {loadError && <div className={dashboardStyles.errorBanner}>{loadError}</div>}
        <section className={dashboardStyles.heroSection}>
          <div className={dashboardStyles.heroContent}>
            <span className={dashboardStyles.eyebrow}>Reader Space</span>
            <h1>Welcome {user?.name}</h1>
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

        <section className={dashboardStyles.recentSection} id="reading-history" ref={historySectionRef}>
          <div className={dashboardStyles.sectionHeader}>
            <span className={dashboardStyles.sectionTag}>History</span>
            <h2>Posts you have already read</h2>
          </div>

          <div className={dashboardStyles.postsContainer}>
            {history.length > 0 ? (
              <>
              <div className={dashboardStyles.postsGrid}>
                {paginatedHistory.map((post) => (
                  <div key={post.id} className={dashboardStyles.postCard}>
                    <div className={dashboardStyles.postCardHeader}>
                      <h3>{post.title}</h3>
                      <span className={dashboardStyles.postStatus}>Archived</span>
                    </div>
                    <p className={dashboardStyles.postMeta}>{post.category || 'General'}</p>
                    <p className={dashboardStyles.postDate}>Read on {formatReadableDate(post.readAt)}</p>
                    <Link to={`/blog/${post.id}`} className={dashboardStyles.postLink}>Open again</Link>
                  </div>
                ))}
              </div>
              {historyTotalPages > 1 ? (
                <div className={dashboardStyles.sectionPagination}>
                  {Array.from({ length: historyTotalPages }, (_, index) => (
                    <button
                      key={`history-${index + 1}`}
                      type="button"
                      onClick={() => handleHistoryPageChange(index + 1)}
                      className={historyPage === index + 1 ? dashboardStyles.activePage : ''}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              ) : null}
              </>
            ) : (
              <div className={dashboardStyles.emptyState}>
                <FaHistory />
                <p>Your reading history will appear here after you open blog posts.</p>
              </div>
            )}
          </div>
        </section>

        <section className={dashboardStyles.recentSection} ref={latestSectionRef}>
          <div className={dashboardStyles.sectionHeader}>
            <span className={dashboardStyles.sectionTag}>Latest Posts</span>
            <h2>Continue reading</h2>
          </div>

          <div className={dashboardStyles.postsContainer}>
            {isLatestLoading ? (
              <div className={dashboardStyles.inlineSectionLoader}>
                <span className={dashboardStyles.inlineSectionSpinner} />
                <p>Loading latest posts...</p>
              </div>
            ) : latestPosts.length > 0 ? (
              <>
              <div className={dashboardStyles.postsGrid}>
                {latestPosts.map((post) => (
                  <div key={post.id} className={dashboardStyles.postCard}>
                    <div className={dashboardStyles.postCardHeader}>
                     {/* <h3>{post.title}</h3>*/}
                      <span className={dashboardStyles.postStatus}>{post.category || 'General'}</span>
                    </div>
                    <p className={dashboardStyles.postMeta}>{post.excerpt || 'Explore the full article for more details.'}</p>
                    <p className={dashboardStyles.postDate}>{post.read_time || 5} min read</p>
                    <Link to={`/blog/${post.id}`} className={dashboardStyles.postLink}>Read article</Link>
                  </div>
                ))}
              </div>
              {latestTotalPages > 1 ? (
                <div className={dashboardStyles.sectionPagination}>
                  {Array.from({ length: latestTotalPages }, (_, index) => (
                    <button
                      key={`latest-${index + 1}`}
                      type="button"
                      onClick={() => handleLatestPageChange(index + 1)}
                      className={latestPage === index + 1 ? dashboardStyles.activePage : ''}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              ) : null}
              </>
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
