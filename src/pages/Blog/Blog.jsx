import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import styles from './Blog.module.css';
// import PageLoader from '../../components/PageLoader.jsx';
import { formatReadableDate } from '../../utils/date.js';
import { riseItem, sectionFade, slideLeft, slideRight, staggerGroup, viewport } from '../../utils/motion.js';

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

  return (
    <div className={styles.page}>
      <motion.section className={styles.hero}>
        <div className={styles.heroGrid}>
          <motion.div className={styles.heroCopy} variants={slideLeft} initial="hidden" animate="show">
            <span className={styles.eyebrow}>Insights</span>
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

          <motion.div className={styles.heroPanel} variants={slideRight} initial="hidden" animate="show">
            <span className={styles.panelLabel}>Content Focus</span>
            <h2>Knowledge that supports the same transformation path shown across the site.</h2>
            <p>From mindset to practical execution, the blog is part of the broader GIGs Impact journey.</p>
            <div className={styles.heroStats}>
              <div>
                <strong>{articles.length}</strong>
                <span>Articles</span>
              </div>
              <div>
                <strong>{categories.length || 1}</strong>
                <span>Content categories</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className={styles.controlsSection}
        variants={sectionFade}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <motion.div className={styles.controlsGrid} variants={staggerGroup}>
          <motion.div className={styles.searchBlock} variants={riseItem}>
            <span className={styles.sectionTag}>Search</span>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </motion.div>

          <motion.div className={styles.categoryBlock} variants={riseItem}>
            <span className={styles.sectionTag}>Categories</span>
            <div className={styles.categoriesContainer}>
              {isCategoryLoading ? (
                <div className={styles.inlineLoader}>
                  <span className={styles.inlineSpinner} />
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
        variants={sectionFade}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <motion.div className={styles.sectionIntro} variants={riseItem}>
          <span className={styles.sectionTag}>Article Library</span>
          <h2>Stories, strategy, and practical learning surfaces.</h2>
        </motion.div>

        {isLoading ? (
          <div className={styles.inlineLoader}>
            <span className={styles.inlineSpinner} />
            <p>Loading blog articles...</p>
          </div>
        ) : error ? (
          <div className={styles.noResults}>
            <p>{error}</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <motion.div className={styles.articlesGrid} variants={staggerGroup} layout>
            {filteredArticles.map((article, index) => (
              <motion.article
                key={article.id}
                className={styles.articleCard}
                variants={riseItem}
                whileHover={{ y: -8, scale: 1.01 }}
                layout
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0, 22, 74, 0.14), rgba(0, 22, 74, 0.92)), url(${article.featured_image || ''})`,
                  marginTop: index % 3 === 1 || index % 3 === 2 ? '16px' : '0'
                }}
              >
                <div className={styles.articleContent}>
                  <span className={styles.categoryTag}>{article.category || 'General'}</span>

                  <div className={styles.articleMeta}>
                    <span>{formatReadableDate(article.published_at)}</span>
                    <span>{article.read_time} min read</span>
                  </div>

                  <h2 className={styles.articleTitle}>{article.title}</h2>
                  <p className={styles.articleExcerpt}>{article.excerpt}</p>

                  <div className={styles.articleFooter}>
                    <Link to={`/blog/${article.id}`} className={styles.readMoreBtn}>
                      Read Article
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <div className={styles.noResults}>
            <p>No articles found matching your search. Try adjusting your filters.</p>
          </div>
        )}
      </motion.section>

      <motion.div
        className={styles.pagination}
        variants={riseItem}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        {!isLoading && Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => setPage(i + 1)} className={page === i + 1 ? styles.activePage : ''}>
            {i + 1}
          </button>
        ))}
      </motion.div>

      <motion.section
        className={styles.newsletterSection}
        variants={sectionFade}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <motion.div className={styles.newsletterShell} variants={staggerGroup}>
          <motion.div variants={riseItem}>
            <span className={styles.sectionTagLight}>Newsletter</span>
            <h2>Get ideas and updates that support growth, work, and leadership.</h2>
          </motion.div>

          <motion.form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()} variants={riseItem}>
            <input type="email" placeholder="Your email address" required />
            <button type="submit">Subscribe</button>
          </motion.form>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Blog;
