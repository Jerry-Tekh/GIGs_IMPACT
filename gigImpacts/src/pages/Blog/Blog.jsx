import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import styles from './Blog.module.css';
// import PageLoader from '../../components/PageLoader.jsx';
import { formatReadableDate } from '../../utils/date.js';
import { slideLeft, staggerGroup, viewport } from '../../utils/motion.js';
import { smoothScrollToElement } from '../../utils/smoothScroll.js';

const blogSectionReveal = {
  hidden: { y: 28 },
  show: {
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const blogItemReveal = {
  hidden: { y: 22 },
  show: {
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const pageTransition = {
  hidden: { opacity: 0.01, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0.01,
    y: -18,
    transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] }
  }
};

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [error, setError] = useState('');
  const articleLibraryRef = useRef(null);
  const shouldScrollToArticlesRef = useRef(false);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, activeCategory, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    if (isLoading || !shouldScrollToArticlesRef.current) {
      return;
    }

    smoothScrollToElement(articleLibraryRef.current, 110, 650);
    shouldScrollToArticlesRef.current = false;
  }, [isLoading, page]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError('');
      let url = `${import.meta.env.VITE_SERVER_URL}/api/posts`;
      const params = new URLSearchParams();

      if (searchQuery) params.append('search', searchQuery);
      if (activeCategory !== 'all') params.append('category', activeCategory);

      params.append('page', page);
      params.append('limit', 6);

      url += `?${params.toString()}`;
      const res = await fetch(url, { credentials: 'include', method: 'GET' });
      const data = await res.json();

      setArticles(data.posts || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
      setError('We could not load the latest articles right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsCategoryLoading(true);
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/categories`);
      const data = await res.json();
      const allCategories = [{ id: 'all', name: 'All Articles', slug: 'all' }, ...(data || [])];
      setCategories(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const categoryMatch = activeCategory === 'all' || article.category_slug === activeCategory;
    const title = (article.title || '').toLowerCase();
    const excerpt = (article.excerpt || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const searchMatch = title.includes(q) || excerpt.includes(q);
    return categoryMatch && searchMatch;
  });

  const handlePageChange = (nextPage) => {
    if (nextPage === page) {
      return;
    }

    shouldScrollToArticlesRef.current = true;
    setPage(nextPage);
  };

  return (
    <div className={styles.page}>
      <motion.section className={styles.hero}>
        <div className={styles.heroInner}>
          <motion.div className={styles.heroCopy} variants={slideLeft} initial="hidden" animate="show">
            <h1>GIGs Impact Blog bring to you the latest updates and perspectives for growth, work, and impact.</h1>
            <p>
              Explore ideas, stories, and practical insight designed to help ambitious people grow in mindset,
              skill, income, and influence.
            </p>
            <div className={styles.heroActions}>
              <a href="#article-library" className={styles.primaryBtn}>
                Browse Articles
              </a>
              <NavLink to="/login" className={styles.secondaryBtn}>
                Login
              </NavLink>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className={styles.controlsSection}
        variants={blogSectionReveal}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <motion.div className={styles.controlsGrid} variants={staggerGroup}>
          <motion.div className={styles.searchBlock} variants={blogItemReveal}>
            <span className={styles.sectionTag}>Search</span>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </motion.div>

          <motion.div className={styles.categoryBlock} variants={blogItemReveal}>
            <span className={styles.sectionTag}>Categories</span>
            <div className={styles.categoriesContainer}>
              {isCategoryLoading ? (
                <div className={styles.inlineLoader}>
                  <span className={styles.inlineLoaderMark} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <p>Loading categories...</p>
                </div>
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat.slug || cat.value}
                    className={`${styles.categoryBtn} ${activeCategory === (cat.slug || cat.value) ? styles.active : ''}`}
                    onClick={() => setActiveCategory(cat.slug || cat.value)}
                  >
                    <span className={styles.categoryDot} aria-hidden="true" />
                    {cat.name || cat.label}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section
        className={styles.articlesSection}
        id="article-library"
        ref={articleLibraryRef}
        variants={blogSectionReveal}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <motion.div className={styles.sectionIntro} variants={blogItemReveal}>
          <span className={styles.sectionTag}>Article Library</span>
          <h2>Stories, strategy, and practical learning surfaces.</h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key={`loading-${page}-${activeCategory}-${searchQuery}`}
              variants={pageTransition}
              initial="hidden"
              animate="show"
              exit="exit"
              className={styles.inlineLoader}
            >
              <span className={styles.inlineLoaderMark} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <p>Loading blog articles...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key={`error-${page}-${activeCategory}-${searchQuery}`}
              variants={pageTransition}
              initial="hidden"
              animate="show"
              exit="exit"
              className={styles.noResults}
            >
              <p>{error}</p>
            </motion.div>
          ) : filteredArticles.length > 0 ? (
            <motion.div
              key={`articles-${page}-${activeCategory}-${searchQuery}`}
              className={styles.articlesGrid}
              variants={pageTransition}
              initial="hidden"
              animate="show"
              exit="exit"
              layout
            >
              {filteredArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  className={styles.articleCard}
                  variants={blogItemReveal}
                  initial="hidden"
                  animate="show"
                  whileHover={{ y: -4 }}
                  layout
                >
                  <div className={styles.articleMedia}>
                    {article.featured_image ? (
                      <img src={article.featured_image} alt="" loading="lazy" />
                    ) : (
                      <div className={styles.articleMediaFallback} aria-hidden="true">
                        <span>{String(index + 1).padStart(2, '0')}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.articleContent}>
                    <div className={styles.articleTopline}>
                      <span className={styles.articleNumber}>{String(index + 1).padStart(2, '0')}</span>
                      <span className={styles.categoryTag}>{article.category || 'General'}</span>
                    </div>

                    <div className={styles.articleMeta}>
                      <span>{formatReadableDate(article.published_at)}</span>
                      {article.read_time && <span>{article.read_time} min read</span>}
                    </div>

                    <h2 className={styles.articleTitle}>{article.title}</h2>
                    <p className={styles.articleExcerpt}>{article.excerpt}</p>
                  </div>

                  <div className={styles.articleFooter}>
                    <Link to={`/blog/${article.id}`} className={styles.readMoreBtn}>
                      Read Article
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`empty-${page}-${activeCategory}-${searchQuery}`}
              variants={pageTransition}
              initial="hidden"
              animate="show"
              exit="exit"
              className={styles.noResults}
            >
              <p>No articles found matching your search. Try adjusting your filters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <motion.div
        className={styles.pagination}
        variants={blogItemReveal}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        {!isLoading && Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => handlePageChange(i + 1)} className={page === i + 1 ? styles.activePage : ''}>
            {i + 1}
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default Blog;
