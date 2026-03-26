import React from 'react';
import styles from './VideoSection.module.css';

const VideoSection = () => {
  return (
    <section className={styles.videoSection}>
      <div className={styles.header}>
        <h2 className={styles.title}>At Gigs Impact Our Focus is Simple.</h2>
        <div className={styles.description}>
          <p>Close the gap between talent and opportunity, and unlock the full potential of individuals at scale.</p>
          <p><strong>Together, we can meet this moment.</strong></p>
        </div>
      </div>
      <div className={styles.videoPlaceholder}>
        <div className={styles.playButton}>▶</div>
        <img src="/video-bg.jpg" alt="Video thumbnail" className={styles.bg} />
      </div>
    </section>
  );
};

export default VideoSection;