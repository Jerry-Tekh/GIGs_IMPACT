import React from 'react';
import styles from './WhatWeDo.module.css';



import { siteData } from '../SiteData.js';


const WhatWeDo = () => {
  return (
    <section className={styles.section}>
      <p className={styles.topLabel}>WHAT WE DO</p>
      <h2 className={styles.mainTitle}>We empower youth by helping them discover their purpose, developing their mindset and skills, and providing platforms to turn talents into income and impact.</h2>
      
      <div className={styles.grid}>
        {siteData.programs.stages.slice(0, 4).map((stage, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.label} style={{ backgroundColor: siteData.whatWeDo[index % 4].color }}>
              STAGE {stage.stage}
            </div>
            <div className={styles.cardBody}>
              <h3>{stage.title}</h3>
              <p>{stage.focus.join(', ')}</p>
              <div className={styles.imgContainer}>
                <img src={`/person-${index % 4}.jpg`} alt={`Stage ${stage.stage}`} />
                <span className={styles.imgName}>Stage {stage.stage}</span>
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