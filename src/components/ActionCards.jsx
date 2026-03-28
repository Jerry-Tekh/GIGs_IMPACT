import React from 'react';
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
    <section className={styles.section}>
      <h2 className={styles.heading}>Bridge The Gap</h2>
      <p className={styles.subheading}>At GIGs Impact Community, we are not waiting for change, we are
creating an alternative system.</p>
      <div className={styles.grid}>
        {siteData.actions.map((action, index) => {
          const IconComponent = iconMap[action.icon];
          return (
            <div 
              key={index} 
              className={styles.card} 
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${action.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className={styles.icon}>
                {IconComponent && <IconComponent size={40} color="white" />}
              </div>
              <h3>{action.title}</h3>
              <p>{action.text}</p>
              <span className={styles.link}>
                Learn More →
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ActionCards;