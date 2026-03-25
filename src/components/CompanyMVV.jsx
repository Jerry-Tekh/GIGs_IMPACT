import React from 'react';
import styles from './CompanyMVV.module.css';
import missionpng from './../assets/MVV/Mission.png';
import visionpng from './../assets/MVV/Vision.png';
import valuespng from './../assets/MVV/Value.png';




const CompanyMVV = () => {
  const mvvData = [
    {
      title: 'MISSION',
      text: 'To build a talent-driven ecosystem that develops individuals into skilled, value-driven, and independent contributors while creating pathways for sustainable income, enterprise, and large-scale employment.',
      icon: '🎯',
      color: '#6fa8dc' // Mission Blue
    },
    {
      title: 'VISION',
      text: 'To build a global community of independent, visionary individuals who believe in their ability to create change and empower others through the effective use of their talents.',
      icon: '👁️',
      color: '#e06666' // Vision Red
    },
    {
      title: 'VALUES',
      text: 'Integrity, Growth, Independence, Impact and Community—guiding every action as we transform talents into economic value and sustainable opportunity.',
      icon: '💎',
      color: '#f6b26b' // Values Orange
    }
  ];

  return (
    <section className={styles.mvvSection}>
      <div className={styles.header}>
        <div className="div">
        <h1 className={styles.mainTitle}>GIGs Impact Community</h1>
        <p className={styles.subTitle}>Activating Talents. Building Independent Minds. Creating Global Impact.</p>
        </div>
        <div className={styles.ctaWrapper}>
          <a className={styles.ctaLink} href="/about" aria-label="Go to About page">
            About Us <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      
      <div className={styles.gridContainer}>
        {mvvData.map((item, index) => (
          <div key={index} className={styles.mvvColumn}>
            <div className={styles.imageCard} style={{ borderColor: item.color }}>
              {/*<img src={item.bg} alt={item.title} className={styles.bgImage} />*/}
              <div className={styles.overlayText}>{item.title}</div>
            </div>
            
            <div className={styles.iconHex} style={{ backgroundColor: item.color }}>
              <div className={styles.iconContent}>
                {item.icon}
              </div>
            </div>

            <p className={styles.description}>
              {item.text}
            </p>
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        <span>30 | Slidelisting.com | Date 2021</span>
        <span className={styles.logo}>slidelisting</span>
      </footer>
    </section>
  );
};

export default CompanyMVV;