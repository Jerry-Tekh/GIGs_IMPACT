import React from 'react';
import styles from './OrgMissionVision.module.css';
import { FaBullseye, FaEye, FaGem, FaArrowRight } from 'react-icons/fa';

const CompanyMVVss = () => {
  const mvvData = [
    {
      title: 'MISSION',
      text: 'To build a talent-driven ecosystem that develops individuals into skilled, value-driven, and independent contributors while creating pathways for sustainable income, enterprise, and large-scale employment.',
      icon: <FaBullseye />
    },
    {
      title: 'VISION',
      text: 'To build a global community of independent, visionary individuals who believe in their ability to create change and empower others through the effective use of their talents.',
      icon: <FaEye />
    },
    {
      title: 'VALUES',
      text: 'Integrity, Growth, Independence, Impact and Community, guiding every action as we transform talents into economic value and sustainable opportunity.',
      icon: <FaGem />
    }
  ];

  return (
    <section className={styles.mvvSection}>
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>Organization Profile</p>
          <h2 className={styles.mainTitle}>GIGs Impact Community</h2>
          <p className={styles.subTitle}>Activating Talents. Building Independent Minds. Creating Global Impact.</p>
        </div>
       {/* <div className={styles.ctaWrapper}>
          <a className={styles.ctaLink} href="/about" aria-label="Go to About page">
            About Us <span aria-hidden="true"><FaArrowRight /></span>
          </a>
        </div>*/}
      </div>

      <div className={styles.gridContainer}>
        {mvvData.map((item, index) => (
          <article key={index} className={styles.mvvColumn}>
            <div className={styles.iconWrap}>{item.icon}</div>
            <hr />
            <h3>{item.title}</h3>
            <p className={styles.description}>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CompanyMVVss;

