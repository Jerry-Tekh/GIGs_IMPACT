import React, { useState } from 'react';
import styles from './Blog.module.css';

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const articles = [
    {
      id: 1,
      title: 'How to Maximize Your Gig Income: 5 Proven Strategies',
      category: 'earnings',
      date: 'March 20, 2024',
      author: 'Sarah Johnson',
      excerpt: 'Discover practical techniques to increase your hourly rate and close more deals in your gig work.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600',
      readTime: '5 min read',
    },
    {
      id: 2,
      title: 'Managing Taxes as an Independent Contractor',
      category: 'finance',
      date: 'March 15, 2024',
      author: 'Michael Chen',
      excerpt: 'A comprehensive guide to deductions, quarterly payments, and tax strategies for gig workers.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e838f1?auto=format&fit=crop&q=80&w=600',
      readTime: '8 min read',
    },
    {
      id: 3,
      title: 'Work-Life Balance Tips for the Always-On Gig Worker',
      category: 'wellness',
      date: 'March 10, 2024',
      author: 'Emma Wilson',
      excerpt: 'Learn how to set boundaries, prevent burnout, and maintain your health while working flexible hours.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600',
      readTime: '6 min read',
    },
    {
      id: 4,
      title: 'The Rise of Gig Economy: Trends & Opportunities in 2024',
      category: 'trends',
      date: 'March 5, 2024',
      author: 'David Martinez',
      excerpt: 'Explore emerging opportunities and market trends in various gig economy sectors.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600',
      readTime: '7 min read',
    },
    {
      id: 5,
      title: 'Building Your Personal Brand as a Freelancer',
      category: 'career',
      date: 'February 28, 2024',
      author: 'Jessica Lee',
      excerpt: 'Stand out in a competitive market by developing a strong personal brand and online presence.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600',
      readTime: '6 min read',
    },
    {
      id: 6,
      title: 'Technology Tools Every Gig Worker Should Use',
      category: 'tools',
      date: 'February 22, 2024',
      author: 'Alex Kumar',
      excerpt: 'Essential apps and software to streamline your work, manage clients, and track income.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
      readTime: '5 min read',
    },
    {
      id: 7,
      title: 'Success Stories: From Gig Worker to Entrepreneur',
      category: 'stories',
      date: 'February 18, 2024',
      author: 'Rachel Brown',
      excerpt: 'Inspiring stories of gig workers who built sustainable businesses from their passion and skills.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600',
      readTime: '4 min read',
    },
    {
      id: 8,
      title: 'Negotiating Better Rates and Contracts',
      category: 'earnings',
      date: 'February 12, 2024',
      author: 'Tom Anderson',
      excerpt: 'Master negotiation skills to secure better pay and more favorable working conditions.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600',
      readTime: '7 min read',
    },
  ];

  const categories = [
    { value: 'all', label: 'All Articles' },
    { value: 'earnings', label: 'Earnings & Income' },
    { value: 'finance', label: 'Financial Planning' },
    { value: 'wellness', label: 'Health & Wellness' },
    { value: 'trends', label: 'Industry Trends' },
    { value: 'career', label: 'Career Growth' },
    { value: 'tools', label: 'Tools & Technology' },
    { value: 'stories', label: 'Success Stories' },
  ];

  const filteredArticles = articles.filter(article => {
    const categoryMatch = activeCategory === 'all' || article.category === activeCategory;
    const searchMatch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>GigImpact Blog</h1>
          <p>Insights, Tips, and Stories to Help You Thrive as a Gig Worker</p>
        </div>
      </section>

      {/* Search Section */}
      <section className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      </section>

      {/* Categories Filter */}
      <section className={styles.categoriesSection}>
        <div className={styles.categoriesContainer}>
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`${styles.categoryBtn} ${activeCategory === cat.value ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Articles Grid */}
      <section className={styles.articlesSection}>
        {filteredArticles.length > 0 ? (
          <div className={styles.articlesGrid}>
            {filteredArticles.map((article) => (
              <article key={article.id} className={styles.articleCard}>
                <div className={styles.articleImage}>
                  <img src={article.image} alt={article.title} />
                  <div className={styles.categoryTag}>{article.category}</div>
                </div>

                <div className={styles.articleContent}>
                  <div className={styles.articleMeta}>
                    <span className={styles.date}>{article.date}</span>
                    <span className={styles.readTime}>{article.readTime}</span>
                  </div>

                  <h2 className={styles.articleTitle}>{article.title}</h2>
                  <p className={styles.articleExcerpt}>{article.excerpt}</p>

                  <div className={styles.articleFooter}>
                    <span className={styles.author}>By {article.author}</span>
                    <button className={styles.readMoreBtn}>Read More →</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <p>No articles found matching your search. Try adjusting your filters.</p>
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className={styles.newsletterSection}>
        <div className={styles.newsletterContent}>
          <h2>Subscribe to Our Newsletter</h2>
          <p>Get weekly tips, industry insights, and exclusive resources delivered to your inbox.</p>
          <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Blog;
