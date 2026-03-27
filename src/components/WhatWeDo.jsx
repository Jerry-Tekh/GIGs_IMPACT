import React from 'react';
import styles from './WhatWeDo.module.css';



import { siteData } from '../SiteData.js';

const whatWeDoImages = [
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981b?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1400&q=80',
];


const WhatWeDo = () => {
  return (
    <section className={styles.section}>
      <p className={styles.topLabel}>WHAT WE DO</p>
      <h2 className={styles.mainTitle}>We empower youth by helping them discover their purpose, developing their mindset and skills, and providing platforms to turn talents into income and impact.</h2>
      
      <div className={styles.grid}>
        {siteData.programs.stages.slice(0, 7).map((stage, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.label} style={{ backgroundColor: siteData.whatWeDo[index % 4].color }}>
              STAGE {stage.stage}
            </div>
            <div className={styles.cardBody}>
              <h3>{stage.title}</h3>
              <p>{stage.focus.join(', ')}</p>
              <div className={styles.imgContainer}>
                <img src={whatWeDoImages[index % whatWeDoImages.length]} alt={`Stage ${stage.stage}`} />
                <span className={styles.imgName}>Stage {stage.stage}</span>
              </div>
            </div>
          </div>
          
        ))}
        <div>
          <p>oh yes</p>
        </div>
      </div>
      <button className={styles.learnMore}>Learn About Our Work</button>
    </section>
  );
};

export default WhatWeDo;