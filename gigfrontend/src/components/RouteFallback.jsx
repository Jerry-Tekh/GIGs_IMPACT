import React from 'react';
import styles from '../App.module.css';

const RouteFallback = () => (
  <div className={styles.routeFallback} role="status" aria-live="polite">
    <div className={styles.routeFallbackCard}>
      <span className={styles.routeFallbackSpinner} />
      <p>Loading page...</p>
    </div>
  </div>
);

export default RouteFallback;
