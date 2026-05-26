import React from 'react';
import { motion } from 'framer-motion';
import styles from './VideoSection.module.css';

const VideoSection = () => {
  return (
    <section className={styles.videoSection}>
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className={styles.title}>At Gigs Impact Our Focus is Simple.</h2>
        <div className={styles.description}>
          <p>Close the gap between talent and opportunity, and unlock the full potential of individuals at scale.</p>
          <p><strong>Together, we can meet this moment.</strong></p>
        </div>
      </motion.div>
      <motion.div 
        className={styles.videoPlaceholder}
        initial={{ x: -100, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <div className={styles.playButton}>▶</div>
        <img src="/video-bg.jpg" alt="Video thumbnail" className={styles.bg} />
      </motion.div>
    </section>
  );
};

export default VideoSection;