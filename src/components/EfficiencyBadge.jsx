import React from 'react';
import styles from './EfficiencyBadge.module.css';

const EfficiencyBadge = () => (
  <div className={styles.badgeSection}>
    <div className={styles.circle}>
      <span className={styles.num}>100%</span>
      <span className={styles.label}>IMPACT</span>
    </div>
    <p>We are building a system where talents are not wasted, skills are monetized, and individuals create opportunities.</p>
  </div>
);
export default EfficiencyBadge;