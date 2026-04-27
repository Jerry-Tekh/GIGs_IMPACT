import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';
import { siteData } from '../SiteData.js';

const Hero = () => {
  return (
    <section className={styles.heroContainer}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <p className={styles.kicker}>GIGs Impact Community</p>
        <h1 className={styles.title}>
          {siteData.hero.title[0]}
          <br />
          <span className={styles.accent}>{siteData.hero.title[1]}</span>
          <br />
          {siteData.hero.title[2]}
        </h1>
        <p className={styles.description}>{siteData.hero.subtitle}</p>
        <div className={styles.buttonGroup}>
          <Link to="/about" className={styles.primaryBtn}>
            {siteData.hero.cta}
          </Link>
          <Link to="/programs" className={styles.videoBtn}>
            <span className={styles.playIcon}>▶</span> View Programs
          </Link>
        </div>
      </motion.div>

      <motion.div
        className={styles.imageGrid}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className={styles.mainImageWrapper}>
          <div className={styles.mainImg}>
            <p className={styles.panelLabel}>Transformation Pathway</p>
            <h3>Potential to Skill to Value to Income</h3>
            <p>
              We create structured pathways where young people build competence,
              confidence, and sustainable opportunities.
            </p>
          </div>

          <div className={styles.statBadge}>
            <h3>150+</h3>
            <p>Happy Volunteers</p>
            <div className={styles.avatars}>
              <div className={styles.avatar}>A</div>
              <div className={styles.avatar}>B</div>
              <div className={styles.avatar}>C</div>
            </div>
          </div>
        </div>

        <div className={styles.topImg}>
          <h4>Focused Impact</h4>
          <p>Talent development, enterprise growth, and leadership formation.</p>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
