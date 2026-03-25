import React from 'react';
import styles from './VideoSection.module.css';

const VideoSection = () => {
  return (
    <section className={styles.videoSection}>
      <div className={styles.header}>
        <h2 className={styles.title}>Hunger in America is a crisis.</h2>
        <div className={styles.description}>
          <p>48 million people face hunger in the U.S.—including 14 million children. Hunger touches every U.S. community, including yours.</p>
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