import React from 'react';
import styles from '../App.module.css';

const RouteFallback = () => (
  <div className={styles.routeFallback} role="status" aria-live="polite">
    <div className={styles.routeFallbackCard}>
      <span className={styles.routeFallbackMark} aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className={styles.routeFallbackCopy}>
        <strong>GIGs Impact</strong>
        <span>Preparing page</span>
      </span>
      <span className={styles.routeFallbackRail} aria-hidden="true">
        <span />
      </span>
      <span className={styles.srOnly}>Loading page</span>
    </div>
  </div>
);

export default RouteFallback;
