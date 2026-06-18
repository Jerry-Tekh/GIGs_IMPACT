import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './SinglePost.module.css';
import { saveReadingHistory } from '../../utils/readingHistory.js';

const SinglePost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/posts/${id}`);
      if (!res.ok) {
        throw new Error('Post not found');
      }

      const data = await res.json();
      setPost(data);
      saveReadingHistory(data);

      if (data.category_slug) {
        fetchRelatedPosts(data.category_slug, data.id);
      } else {
        setRelatedPosts([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (categorySlug, currentPostId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/posts?category=${categorySlug}&limit=5`);
      const data = await res.json();
      const filtered = (data.posts || []).filter((item) => item.id !== currentPostId);
      setRelatedPosts(filtered);
    } catch (err) {
      console.error('Error fetching related posts:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.stateShell}>
        <div className={styles.stateCard}>Loading article...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.stateShell}>
        <div className={styles.stateCard}>Error: {error}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.stateShell}>
        <div className={styles.stateCard}>Post not found.</div>
      </div>
    );
  }

  const publishedDate = post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Unpublished';

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
         {/* <div className={styles.heroCopy}>
            {/*<span className={styles.eyebrow}>Single Post</span>
            <div className={styles.breadcrumb}>
              <Link to="/blog">Blog</Link>
              <span>-</span>
              <span>{post.category || 'General'}</span>
            </div>
            <h1>{post.title}</h1>
            <p>{post.excerpt || 'A closer look at one of the ideas shaping growth, work, and impact.'}</p>

            <div className={styles.metaRow}>
              <span>By {post.author || 'GIGs Impact Team'}</span>
              <span>{publishedDate}</span>
              <span>{post.read_time ||5} min read</span>
            </div>
          </div>*/}

          <div className={styles.heroPanel}>
            <span className={styles.panelLabel}>Article Snapshot</span>
           {/* <h2>This story is part of the same editorial system powering the blog overview page.</h2>*/}
            <p>
              Read our blog on to get your mindset right and engineered for positive impact. We cover a range of topics related to the future of work, and how individuals can build the skills they need to thrive.
            </p>

            <div className={styles.heroStats}>
             {/*<div>
                <strong>{post.category || 'General'}</strong>
                <span>category</span>
              </div>*/}
              <div>
                <strong>{post.read_time || 5} min</strong>
                <span>estimated read</span>
              </div>
            </div>
          </div>

          <div className={styles.heroCopy}>
        
            <h1>{post.title}</h1>
            <p>{post.excerpt || 'A closer look at one of the ideas shaping growth, work, and impact.'}</p>


          </div>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.contentGrid}>
          <article className={styles.articleCard}>
            {post.featured_image ? (
              <div className={styles.coverWrap}>
                <img src={post.featured_image} alt={post.title} className={styles.coverImage} loading="lazy" decoding="async" />
              </div>
            ) : null}

            <div className={styles.postContent}>
              {post.content.split('\n\n').map((paragraph, index) => (
                <p key={`${post.id}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </article>

          <aside className={styles.sidebar}>
            <div className={styles.sideCard}>
              <span className={styles.sectionTag}>Quick Info</span>
              <h3>Article details</h3>
              <ul className={styles.sideList}>
                <li>
                  <strong>Author</strong>
                  <span>{post.author || 'GIGs Impact Team'}</span>
                </li>
                <li>
                  <strong>Published</strong>
                  <span>{publishedDate}</span>
                </li>
                <li>
                  <strong>Category</strong>
                  <span>{post.category || 'General'}</span>
                </li>
              </ul>
            </div>

            <div className={styles.sideCard}>
              <span className={styles.sectionTag}>Next Step</span>
              <h3>Keep exploring the blog.</h3>
              <p>Return to our full article library or read related reading below.</p>
              <Link to="/blog" className={styles.primaryBtn}>
                Back To Blog
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Related Articles</span>
            <h2>More reading from the same content journey.</h2>
          </div>

          <div className={styles.relatedGrid}>
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.id} to={`/blog/${relatedPost.id}`} className={styles.relatedCard}>
                <div className={styles.relatedContent}>
                  <span className={styles.relatedTag}>{relatedPost.category || 'General'}</span>
                  <h3>{relatedPost.title}</h3>
                  <p>{relatedPost.excerpt}</p>
                  <div className={styles.relatedMeta}>
                    <span>
                      {relatedPost.published_at
                        ? new Date(relatedPost.published_at).toLocaleDateString()
                        : 'Unpublished'}
                    </span>
                    <span>{relatedPost.read_time || 5} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SinglePost;
