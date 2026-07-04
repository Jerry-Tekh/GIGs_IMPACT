import React from 'react';
import { FaQuoteLeft } from 'react-icons/fa';
import styles from './Testimonials.module.css';
import { siteData } from '../SiteData.js';

const Testimonials = () => {
  const testimonials = siteData.testimonials || [];
  if (!testimonials.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <span className={styles.kicker}>Voices From The Community</span>
          <h2 className={styles.title}>
            Real people, real <em>transformation</em>.
          </h2>
        </header>

        <div className={styles.grid}>
          {testimonials.map((t, i) => (
            <figure key={t.name + i} className={styles.quote}>
              <FaQuoteLeft className={styles.mark} aria-hidden="true" />
              <blockquote className={styles.text}>{t.quote}</blockquote>
              <figcaption className={styles.cite}>
                <span className={styles.name}>{t.name}</span>
                <span className={styles.role}>{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
