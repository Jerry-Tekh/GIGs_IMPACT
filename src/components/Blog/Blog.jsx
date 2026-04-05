import React, { useState, useEffect } from 'react';
import styles from './Blog.module.css';

const Blog = () => {
// const [activeCategory, setActiveCategory] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);


  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);



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
    let url = `${import.meta.env.VITE_SERVER_URL}/api/posts`;

    const params = new URLSearchParams();

    if (searchQuery) params.append('search', searchQuery);
    if (activeCategory !== 'all') params.append('category', activeCategory);

    params.append('page', page);
    params.append('limit', 6);

    url += `?${params.toString()}`;

    const res = await fetch(url);
    const data = await res.json();

    setArticles(data.posts);
    setTotalPages(data.totalPages);

  } catch (error) {
    console.error(error);
  }
};





  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/categories`);
      const data = await res.json();
      // Add "All Articles" option at the beginning
      const allCategories = [{ id: 'all', name: 'All Articles', slug: 'all' }, ...data];
      setCategories(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  



  {/*const articles = [
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
  ]; */}

  const filteredArticles = articles.filter(article => {
    const categoryMatch = activeCategory === 'all' || article.category_slug === activeCategory;
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
              key={cat.slug || cat.value}
              className={`${styles.categoryBtn} ${activeCategory === (cat.slug || cat.value) ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat.slug || cat.value)}
            >
              {cat.name || cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Articles Grid */}
      {/* if sortingis done on the frontend then i will change it to filteredArticles.length and filterArticles.map */}
      <section className={styles.articlesSection}>
        {articles.length > 0 ? (
          <div className={styles.articlesGrid}>
            {articles.map((article) => (
              <article key={article.id} className={styles.articleCard}>
                <div className={styles.articleImage}>
                  {/*<img src={article.image} alt={article.title} />*/}
                  <img src={article.featured_image} alt={article.title} />
                  <div className={styles.categoryTag}>{article.category}</div>
                  
                </div>

                <div className={styles.articleContent}>
                  <div className={styles.articleMeta}>
                    <span className={styles.date}>{new Date(article.published_at).toLocaleDateString()}</span>
                   {/* <span className={styles.readTime}>{article.readTime}</span>*/}
                   <span className={styles.readTime}>{article.read_time} min read</span>

                  </div>

                  <h2 className={styles.articleTitle}>{article.title}</h2>
                  <p className={styles.articleExcerpt}>{article.excerpt}</p>

                  <div className={styles.articleFooter}>
                    {/*<span className={styles.author}>By {article.author}</span>*/}
                    
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

      {Array.from({ length: totalPages }, (_, i) => (
  <button
    key={i}
    onClick={() => setPage(i + 1)}
    className={page === i + 1 ? styles.activePage : ''}
  >
    {i + 1}
  </button>
  ))}

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
