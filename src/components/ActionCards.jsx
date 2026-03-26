import React from 'react';
import styles from './ActionCards.module.css';

import  { siteData } from '../SiteData.js';


const ActionCards = () => {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Bridge The Gap</h2>
      <p className={styles.subheading}>At GIGs Impact Community, we are not waiting for change, we are
creating an alternative system.</p>
      <div className={styles.grid}>
        {siteData.actions.map((action, index) => (
          <div 
            key={index} 
            className={styles.card} 
            style={{ backgroundColor: action.color, color: action.textColor }}
          >
            <div className={styles.icon}>{action.icon}</div>
            <h3>{action.title}</h3>
            <p>{action.text}</p>
            <span className={styles.link}>
              {action.title === 'Advocate' ? 'Speak Out →' : 'Give Now →'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ActionCards;