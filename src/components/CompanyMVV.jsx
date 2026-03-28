import React from 'react';
import styles from './CompanyMVV.module.css';
import value from './../assets/MVV/value.png';
import vision from './../assets/MVV/vision.png';
import mission from './../assets/MVV/mission.png';





// using Unsplash for real human-focused imagery in MVV cards:
const mvvImages = [
  mission,
  vision,
  value
];




const CompanyMVV = () => {
  const mvvData = [
    {
      title: 'MISSION',
      text: 'To build a talent-driven ecosystem that develops individuals into skilled, value-driven, and independent contributors while creating pathways for sustainable income, enterprise, and large-scale employment.',
      icon: '🎯',
      /*color: '#6fa8dc', // Mission Blue,*/
      color: '#fff', // Mission Blue,
      bg : mvvImages[0]

    },
    {
      title: 'VISION',
      text: 'To build a global community of independent, visionary individuals who believe in their ability to create change and empower others through the effective use of their talents.',
      icon: '👁️',
      /*color: '#e06666' ,// Vision Red*/
      color: '#fff' ,// Vision Red
        bg : mvvImages[1]
    },
    {
      title: 'VALUES',
      text: 'Integrity, Growth, Independence, Impact and Community—guiding every action as we transform talents into economic value and sustainable opportunity.',
      icon: '💎',
      /*color: '#f6b26b' // Values Orange*/
      color: '#ffff' ,// Values Orange
        bg : mvvImages[2]
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
            About Us<span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      
      <div className={styles.gridContainer}>
        {mvvData.map((item, index) => (
          <div key={index} className={styles.mvvColumn}>
            <div className={styles.imageCard} style={{ borderColor: item.color }}>
              <img src={item.bg} alt={item.title} className={styles.bgImage} />
              <div className={styles.overlayText}>{item.title}</div>
            </div>
            
            <div className={styles.iconHex} style={{ backgroundColor: item.color, opacity : 0.8 }}>
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
      <div className={styles.scrollContainer}>

<footer className={`${styles.footer} ${styles.scrollwrapper}`}>
  {/* Original set of spans */}
  <span>30 | Slidelisting.com | Date 2021</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  
  {/* Duplicate set for seamless looping */}
  <span>30 | Slidelisting.com | Date 2021</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
  <span className={styles.logo}>slidelisting</span>
</footer>


      </div>
    </section>
  );
};

export default CompanyMVV;