import React from 'react';
import { motion } from 'framer-motion';
import styles from './ImpactStats.module.css';


import { siteData } from '../SiteData.js';

const ImpactStats = () => (
  <motion.section 
    className={styles.wrapper}
    initial={{ backgroundColor: 'transparent' }}
    whileInView={{ backgroundColor: '#f0f0f0' }} // adjust
    transition={{ duration: 1 }}
  >
    <motion.div 
      className={styles.content}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className={styles.testimonial}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div 
          className={styles.quote}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          "We are building systems that transform potential into productivity and productivity into prosperity."
        </motion.div>
        <motion.div 
          className={styles.author}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          GIGs Impact Community
        </motion.div>
      </motion.div>
      <motion.div 
        className={styles.grid}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        {siteData.stats.map((stat, i) => (
          <motion.div 
            key={i} 
            className={styles.card}
            initial={{ x: i % 2 === 0 ? -50 : 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <motion.h3 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
            >
              {stat.value}
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 + 0.4 }}
            >
              <strong>{stat.label}</strong>
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 + 0.6 }}
            >
              {stat.sub}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </motion.section>
);
export default ImpactStats;