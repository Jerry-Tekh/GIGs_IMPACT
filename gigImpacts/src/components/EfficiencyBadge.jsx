import React from 'react';
import { motion } from 'framer-motion';
import styles from './EfficiencyBadge.module.css';

const EfficiencyBadge = () => (
  <motion.section
    className={styles.badgeSection}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
  >
    <div className={styles.contentWrap}>
      <div className={styles.sectionIntro}>
        <span className={styles.sectionTag}>Closing Statement</span>
        <h2>We are building a system where talent becomes value, value becomes income, and income creates impact.</h2>
      </div>

      <div className={styles.badgeRow}>
        <motion.div
          className={styles.circle}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
        >
          <span className={styles.num}>100%</span>
          <span className={styles.label}>IMPACT</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          We are building a system where talents are not wasted, skills are monetized, and individuals create
          opportunities.
        </motion.p>
      </div>
    </div>
  </motion.section>
);
export default EfficiencyBadge;
