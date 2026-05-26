import React from 'react';
import { motion } from 'framer-motion';
import styles from './ImpactStats.module.css';
import { siteData } from '../SiteData.js';

const ImpactStats = () => {
  const [leadStat, ...supportStats] = siteData.stats;

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
          <h2 className={styles.sectionTitle}>We build systems that turn human potential into measurable impact.</h2>
          <p className={styles.bodyText}>
            &quot;We are building systems that transform potential into productivity and productivity into
            prosperity.&quot;
          </p>

          <div className={styles.tabs}>
            {siteData.stats.map((stat, index) => (
              <span key={stat.label} className={index === 0 ? styles.activeTab : styles.tab}>
                {stat.label}
              </span>
            ))}
          </div>

          <p className={styles.tabText}>
            GIGs Impact Community is creating a long-term structure for youth transformation, economic value,
            and scalable opportunity across communities.
          </p>
        </div>

        <div className={styles.imageSide}>
          <div className={styles.imageCard}>
            <div className={styles.mainStat}>
              <span className={styles.statLabel}>Projected Reach</span>
              <h3>{leadStat.value}</h3>
              <p>
                <strong>{leadStat.label}</strong>
              </p>
              <p>{leadStat.sub}</p>
            </div>

            <div className={styles.onlineWidget}>
              <div className={styles.widgetHeader}>
                <span>Impact Markers</span>
                <span className={styles.peopleCount}>{siteData.stats.length} Goals</span>
              </div>

              <ul className={styles.userList}>
                {supportStats.map((stat, index) => (
                  <li key={stat.label}>
                    <div className={`${styles.avatar} ${styles[`avatar${index + 1}`]}`} />
                    <div className={styles.metricCopy}>
                      <strong>{stat.value}</strong>
                      <span>
                        {stat.label} {stat.sub}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ImpactStats;
