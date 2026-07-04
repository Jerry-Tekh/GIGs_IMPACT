import React from 'react';
import styles from './PartnersSection.module.css';

// Placeholder supporter slots — swap labels for real partner names/logos.
const PARTNERS = [
  'Community Partners',
  'Tech Collaborators',
  'Education Allies',
  'Enterprise Partners',
  'Local Sponsors',
  'Volunteer Networks'
];

const PartnersSection = () => (
  <section className={styles.section} id="partners">
    <div className={styles.inner}>
      <div className={styles.head}>
        <span className={styles.eyebrow}>Partners &amp; Supporters</span>
        <h2 className={styles.title}>Built together with people who believe in talent.</h2>
        <p className={styles.lead}>
          We grow through partnership — with organizations, sponsors, and networks who help turn
          potential into opportunity. Want to see your name here?
        </p>
      </div>

      <div className={styles.logos}>
        {PARTNERS.map((p) => (
          <div key={p} className={styles.logo}>
            <span aria-hidden="true">{p.split(' ').map((w) => w[0]).join('')}</span>
            <small>{p}</small>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PartnersSection;
