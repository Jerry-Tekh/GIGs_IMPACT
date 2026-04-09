import React from 'react';
import { motion } from 'framer-motion';
import styles from './ActionCards.module.css';
import { FaUsers, FaHandshake, FaGraduationCap, FaBook } from 'react-icons/fa';
import { siteData } from '../SiteData.js';

const iconMap = {
  FaUsers,
  FaHandshake,
  FaGraduationCap,
  FaBook
};

const ActionCards = () => {
  return (
    <motion.section 
      className={styles.section}
      initial={{ backgroundColor: 'transparent' }}
      whileInView={{ backgroundColor: '#fff' }} // adjust
      transition={{ duration: 1 }}
    >
      <motion.h2 
        className={styles.heading}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Bridge The Gap
      </motion.h2>
      <motion.p 
        className={styles.subheading}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        At GIGs Impact Community, we are not waiting for change, we are
creating an alternative system.
      </motion.p>
      <motion.div 
        className={styles.grid}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        {siteData.actions.map((action, index) => {
          const IconComponent = iconMap[action.icon];
          return (
            <motion.div 
              key={index} 
              className={styles.card} 
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${action.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className={styles.icon}>
                {IconComponent && <IconComponent size={40} color="white" />}
              </div>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              >
                {action.title}
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
              >
                {action.text}
              </motion.p>
              <motion.span 
                className={styles.link}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.6 }}
              >
                Learn More →
              </motion.span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
};

export default ActionCards;