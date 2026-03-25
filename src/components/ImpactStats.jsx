import React from 'react';
import styles from './ImpactStats.module.css';


import { siteData } from '../SiteData.js';

const ImpactStats = () => (
  <section className={styles.wrapper}>
    <div className={styles.content}>
      <div className={styles.testimonial}>
        <div className={styles.quote}>“I love that there’s no limit on the fruits and veggies.”</div>
        <div className={styles.author}>Adriana, California</div>
      </div>
      <div className={styles.grid}>
        {siteData.stats.map((stat, i) => (
          <div key={i} className={styles.card}>
            <h3>{stat.value}</h3>
            <p><strong>{stat.label}</strong></p>
            <p>{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default ImpactStats;