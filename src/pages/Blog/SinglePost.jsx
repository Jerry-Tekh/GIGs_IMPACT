import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./SinglePost.module.css";

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
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/posts/${id}`,
      );
      if (!res.ok) {
        throw new Error("Post not found");
      }
      const data = await res.json();
      setPost(data);

      // Fetch related posts from same category
      if (data.category_slug) {
        fetchRelatedPosts(data.category_slug, data.id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (categorySlug, currentPostId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/posts?category=${categorySlug}&limit=5`,
      );
      const data = await res.json();
      // Filter out current post
      const filtered = data.posts.filter((p) => p.id !== currentPostId);
      setRelatedPosts(filtered);
    } catch (err) {
      console.error("Error fetching related posts:", err);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!post) {
    return <div className={styles.notFound}>Post not found</div>;
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroWrapper}>

        <div className={styles.heroContent}>
          <div className={styles.breadcrumb}>
            <Link to="/blog">Blog</Link> / <span>{post.category}</span>
          </div>
          <h1>{post.title}</h1>
          <div className={styles.meta}>
            <span>By {post.author}</span>
            <span>{new Date(post.published_at).toLocaleDateString()}</span>
            <span>{post.read_time} min read</span>
          </div>
        </div>
        {post.featured_image && (
          <div className={styles.heroImage}>
            <img src={post.featured_image} alt={post.title} />
          </div>
        )}
        </div>
      </section>

      {/* Content Section */}
      <section className={styles.content}>
        <div className={styles.contentWrapper}>
          <div className={styles.postContent}>
            {post.content.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Related Posts Carousel */}
      {relatedPosts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2>Related Articles</h2>
          <div className={styles.carousel}>
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                to={`/blog/${relatedPost.id}`}
                className={styles.relatedCard}
              >
                <div className={styles.relatedImage}>
                  <img
                    src={relatedPost.featured_image}
                    alt={relatedPost.title}
                  />
                </div>
                <div className={styles.relatedContent}>
                  <h3>{relatedPost.title}</h3>
                  <p>{relatedPost.excerpt}</p>
                  <div className={styles.relatedMeta}>
                    <span>
                      {new Date(relatedPost.published_at).toLocaleDateString()}
                    </span>
                    <span>{relatedPost.read_time} min read</span>
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
