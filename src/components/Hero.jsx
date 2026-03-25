import React from 'react';
import styles from './Hero.module.css';


import  { siteData } from '../SiteData.js';


const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.textContent}>
          <p className={styles.topLabel}>Together we're,</p>
          <h1 className={styles.title}>{siteData.hero.title[1]}</h1>
          <p className={styles.subtitle}>{siteData.hero.subtitle}</p>
          <button className={styles.cta}>{siteData.hero.cta}</button>
        </div>
       
      </div>
    </section>
  );
};

export default Hero;