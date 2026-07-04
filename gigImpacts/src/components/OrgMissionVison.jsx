import React from 'react';
import styles from './OrgMissionVision.module.css';

const CompanyMVVss = () => {
  const mvvData = [
    {
      title: 'Mission',
      shortLabel: 'What drives us',
      text: 'To build a talent-driven ecosystem that develops individuals into skilled, value-driven, and independent contributors while creating pathways for sustainable income, enterprise, and large-scale employment.',
      points: ['Talent development', 'Independent contributors', 'Sustainable opportunity']
    },
    {
      title: 'Vision',
      shortLabel: 'Where we are going',
      text: 'To build a global community of independent, visionary individuals who believe in their ability to create change and empower others through the effective use of their talents.',
      points: ['Global reach', 'Visionary people', 'Change through talent']
    },
    {
      title: 'Values',
      shortLabel: 'How we operate',
      text: 'Integrity, Growth, Independence, Impact and Community, guiding every action as we transform talents into economic value and sustainable opportunity.',
      points: ['Integrity first', 'Growth mindset', 'Community impact']
    }
  ];

  return (
    <section className={styles.mvvSection}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.kicker}>Organization Profile</p>
          <h2 className={styles.mainTitle}>
            Activating talents and shaping <em>independent minds</em>.
          </h2>
          <p className={styles.subTitle}>
            A modern community built around purpose, opportunity, and meaningful impact —
            here is what we stand for.
          </p>
        </header>

        <div className={styles.rows}>
          {mvvData.map((item, i) => (
            <article key={item.title} className={styles.row}>
              <div className={styles.rowIndex}>
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.eyebrow}>{item.shortLabel}</span>
              </div>

              <div className={styles.rowMain}>
                <h3 className={styles.rowTitle}>{item.title}</h3>
                <p className={styles.rowText}>{item.text}</p>
              </div>

              <ul className={styles.pointList}>
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompanyMVVss;
