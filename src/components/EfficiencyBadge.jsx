import React from 'react';
import styles from './EfficiencyBadge.module.css';

const EfficiencyBadge = () => (
  <div className={styles.badgeSection}>
    <div className={styles.circle}>
      <span className={styles.num}>98%</span>
      <span className={styles.label}>INVESTED</span>
    </div>
    <p>Feeding America invests 98% of all cash and non-cash donations directly into programs.</p>
  </div>
);
export default EfficiencyBadge;