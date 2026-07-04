import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import kit from '../_shared/pageKit.module.css';
import styles from './NotFound.module.css';
import { smoothScrollToY } from '../../utils/smoothScroll.js';

const NotFoundPage = () => {
  useEffect(() => { smoothScrollToY(0); }, []);

  return (
    <section className={styles.wrap}>
      <div className={styles.inner}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>This page took a different path.</h1>
        <p className={styles.text}>
          The page you are looking for may have moved or no longer exists — but the mission continues.
          Let&apos;s get you back on track.
        </p>
        <div className={styles.actions}>
          <Link to="/" className={kit.btnPrimary}>Back to Home <FaArrowRight aria-hidden="true" /></Link>
          <Link to="/programs" className={kit.btnGhost}>Explore Programs</Link>
        </div>
        <nav className={styles.links} aria-label="Helpful links">
          <Link to="/about">About</Link>
          <Link to="/programs">Programs</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
    </section>
  );
};

export default NotFoundPage;
