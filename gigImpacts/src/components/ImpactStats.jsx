import React from 'react';
import { motion } from 'framer-motion';
import styles from './ImpactStats.module.css';
import { siteData } from '../SiteData.js';

const ImpactStats = () => {
  return (
    <motion.section
      className={styles.wrapper}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className={styles.contentGrid}>
        <div className={styles.textSide}>
          <span className={styles.sectionTag}>Impact Stats</span>
          <h2 className={styles.sectionTitle}>
            We build systems that turn human potential into measurable impact.
          </h2>
          <p className={styles.bodyText}>
            &quot;We are building systems that transform potential into productivity and
            productivity into prosperity&quot; — a long-term structure for youth transformation,
            economic value, and scalable opportunity across communities.
          </p>
        </div>

        <div className={styles.statSide}>
          {siteData.stats.map((stat) => (
            <div key={stat.label} className={styles.statBlock}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
              {stat.sub && <span className={styles.statSub}>{stat.sub}</span>}
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default ImpactStats;
