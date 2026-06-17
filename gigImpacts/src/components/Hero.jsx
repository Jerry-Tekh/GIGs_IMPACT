import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';
import { siteData } from '../SiteData.js';

const CountUpStat = ({ end, suffix = '' }) => {
  const [value, setValue] = useState(0);
  const counterRef = useRef(null);
  const isInView = useInView(counterRef, { once: true, amount: 0.6 });

  useEffect(() => {
    if (!isInView) {
      return undefined;
    }

    const duration = 1600;
    let animationFrameId = 0;
    const startTime = window.performance.now();

    const updateValue = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(end * eased));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(updateValue);
      }
    };

    animationFrameId = window.requestAnimationFrame(updateValue);

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [end, isInView]);

  return (
    <span ref={counterRef}>
      {value}
      {suffix}
    </span>
  );
};

const heroStats = [
  { end: 7, suffix: '', label: 'Stage transformation framework' },
  { end: 4, suffix: '+', label: 'Volunteers building the mission' },
  { end: 100, suffix: '%', label: 'Focused on real impact' }
];

const Hero = () => {
  return (
    <section className={styles.heroContainer}>
      <div className={styles.inner}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className={styles.kicker}>GIGs Impact Community</p>
          <h1 className={styles.title}>
            {siteData.hero.title[0]}{' '}
            <span className={styles.accent}>{siteData.hero.title[1]}</span>{' '}
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
          className={styles.statStrip}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {heroStats.map((stat) => (
            <div key={stat.label} className={styles.statItem}>
              <span className={styles.statNumber}>
                <CountUpStat end={stat.end} suffix={stat.suffix} />
              </span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
