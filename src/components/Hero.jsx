import React from 'react';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';


import  { siteData } from '../SiteData.js';


const Hero = () => {
  return (
    <section className={styles.hero}>
      <motion.div 
        className={styles.container}
        initial={{ backgroundColor: 'transparent' }}
        // assuming a background color, adjust as needed
        transition={{ duration: 1 }}
      >
        <motion.div 
          className={styles.textContent}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className={styles.topLabel}>Together we're,</p>
          <h1 className={styles.title}>{siteData.hero.title[1]}</h1>
          <p className={styles.subtitle}>{siteData.hero.subtitle}</p>
          <button className={styles.cta}>{siteData.hero.cta}</button>
        </motion.div>
       
      </motion.div>
    </section>
  );
};

export default Hero;