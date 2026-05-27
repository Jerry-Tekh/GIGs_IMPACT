import React from 'react';
import styles from '../App.module.css';

const RouteFallback = () => (
  <div className={styles.routeFallback} role="status" aria-live="polite">
    <div className={styles.routeFallbackCard}>
      <span className={styles.routeFallbackSpinner} aria-hidden="true" />
      <span className={styles.srOnly}>Loading page</span>
    </div>
  </div>
);

export default RouteFallback;
