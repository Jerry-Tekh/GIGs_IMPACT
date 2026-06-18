import React from 'react';
import { motion } from 'framer-motion';
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
            <motion.figure
              key={t.name + i}
              className={styles.quote}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.08, 0.24), ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <FaQuoteLeft className={styles.mark} aria-hidden="true" />
              <blockquote className={styles.text}>{t.quote}</blockquote>
              <figcaption className={styles.cite}>
                <span className={styles.name}>{t.name}</span>
                <span className={styles.role}>{t.role}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
