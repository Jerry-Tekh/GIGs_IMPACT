import React from 'react';
import styles from './OrgMissionVision.module.css';
import { FaBullseye, FaEye, FaGem } from 'react-icons/fa';

const CompanyMVVss = () => {
  const mvvData = [
    {
      title: 'MISSION',
      shortLabel: 'What drives us',
      accent: 'Mission',
      text: 'To build a talent-driven ecosystem that develops individuals into skilled, value-driven, and independent contributors while creating pathways for sustainable income, enterprise, and large-scale employment.',
      icon: <FaBullseye />,
      points: ['Talent development', 'Independent contributors', 'Sustainable opportunity']
    },
    {
      title: 'VISION',
      shortLabel: 'Where we are going',
      accent: 'vision',
      text: 'To build a global community of independent, visionary individuals who believe in their ability to create change and empower others through the effective use of their talents.',
      icon: <FaEye />,
      points: ['Global reach', 'Visionary people', 'Change through talent']
    },
    {
      title: 'VALUES',
      shortLabel: 'How we operate',
      accent: 'Value',
      text: 'Integrity, Growth, Independence, Impact and Community, guiding every action as we transform talents into economic value and sustainable opportunity.',
      icon: <FaGem />,
      points: ['Integrity first', 'Growth mindset', 'Community impact']
    }
  ];

  return (
    <section className={styles.mvvSection}>
      <div className={styles.header}>
        <p className={styles.kicker}>Organization Profile</p>
        {/*<h2 className={styles.mainTitle}>GIGs Impact Community</h2>*/}
        <p className={styles.subTitle}>
          Activating talents, shaping independent minds, and building a modern community around purpose,
          opportunity, and meaningful impact.
        </p>
      </div>

      <div className={styles.gridContainer}>
        {mvvData.map((item) => (
          <article key={item.accent} className={styles.mvvColumn}>
            {/*<div className={styles.cardTop}>
              <div className={styles.iconWrap}>{item.icon}</div>
            </div>*/}

            <div className={styles.cardBody}>
              <span className={styles.badge}>{item.accent}</span>
              <p className={styles.eyebrow}>{item.shortLabel}</p>
              {/*<h3>{item.title}</h3>*/}
              <p className={styles.description}>{item.text}</p>
            </div>

            <ul className={styles.pointList}>
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CompanyMVVss;
