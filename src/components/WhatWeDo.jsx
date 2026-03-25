import React from 'react';
import styles from './WhatWeDo.module.css';



import { siteData } from '../SiteData.js';


const WhatWeDo = () => {
  return (
    <section className={styles.section}>
      <p className={styles.topLabel}>WHAT WE DO</p>
      <h2 className={styles.mainTitle}>We unite communities to end hunger.</h2>
      
      <div className={styles.grid}>
        {siteData.whatWeDo.map((item, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.label} style={{ backgroundColor: item.color }}>
              {item.label}
            </div>
            <div className={styles.cardBody}>
              <h3>{item.title}</h3>
              <p>We listen to neighbors facing hunger and share their stories to help shape real solutions.</p>
              <div className={styles.imgContainer}>
                <img src={`/person-${index}.jpg`} alt={item.name} />
                <span className={styles.imgName}>{item.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className={styles.learnMore}>Learn About Our Work</button>
    </section>
  );
};

export default WhatWeDo;