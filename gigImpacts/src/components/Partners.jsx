import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './Partners.module.css';

const Partners = () => {
  const values = [
    {
      id: '01',
      title: 'Integrity',
      text: 'Doing what is right, even when no one is watching.'
    },
    {
      id: '02',
      title: 'Growth',
      text: 'Continuous personal and professional development.'
    },
    {
      id: '03',
      title: 'Independence',
      text: 'Building self-reliance through value creation.'
    },
    {
      id: '04',
      title: 'Impact',
      text: 'Creating solutions that improve lives.'
    },
    {
      id: '05',
      title: 'Community',
      text: 'Growing together and supporting one another.'
    }
  ];

  return (
    <motion.section className={styles.partners}>
      <div className={styles.shell}>
        <div className={styles.intro}>
          <span className={styles.label}>Our Core Values</span>
          <h2>We Build a Talent-Driven Ecosystem</h2>
          <p>
            GigImpact grows through principles that shape how we lead, build, and serve. These values guide our
            programs, partnerships, and the kind of people we are raising.
          </p>
          <Link to="/about" className={styles.btn}>
            Learn More About Our Mission
          </Link>
        </div>

        <div className={styles.storyboard}>
          {values.map((value, index) => (
            <article
              key={value.id}
              className={`${styles.valueCard} `}
            >
              <span className={styles.count}>{value.id}</span>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </article>
          ))}

          <div className={styles.highlightPanel}>
            <span className={styles.highlightTag}>Why it matters</span>
            <p>
              We are not just teaching skills. We are shaping disciplined, capable people who can create
              opportunities, lead others, and sustain impact.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Partners;
