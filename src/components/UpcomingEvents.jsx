import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTicketAlt } from 'react-icons/fa';
import styles from './UpcomingEvents.module.css';

const events = [
  {
    title: 'Youth Empowerment Summit',
    description: 'Networking + Skill labs for emerging leaders',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80',
    icon: <FaCalendarAlt />
  },
  {
    title: 'Digital Skills Bootcamp',
    description: '6-week hands-on training in digital tools',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
    icon: <FaClock />
  },
  {
    title: 'Community pitch day',
    description: 'Present ideas, win seed support',
    image: 'https://images.unsplash.com/photo-1515169067866-5387ec356754?auto=format&fit=crop&w=400&q=80',
    icon: <FaTicketAlt />
  },
  {
    title: 'Impact Partner Forum',
    description: 'Collaborate with global impact investors',
    image: 'https://images.unsplash.com/photo-1520975627030-6bbef94cb49a?auto=format&fit=crop&w=400&q=80',
    icon: <FaMapMarkerAlt />
  }
];

const UpcomingEvents = () => {
  const [direction, setDirection] = useState(-1);

  const handleMouseMove = (e) => {
    if (e.movementX > 0) {
      setDirection(-1);
    } else if (e.movementX < 0) {
      setDirection(1);
    }
  };

  const directionAnimation = direction === -1 ? ['0%', '-50%'] : ['-50%', '0%'];

  return (
    <section className={styles.advertSection}>
      <div className={styles.header}>
        <h2>Upcoming Events</h2>
        <p>Live events, learning pathways, and community experiences</p>
      </div>

      <div className={styles.carousel} onMouseMove={handleMouseMove}>
        <motion.div
          className={styles.track}
          animate={{ x: directionAnimation }}
          transition={{ duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'loop' }}
        >
          {[...events, ...events].map((item, index) => (
            <article key={`${item.title}-${index}`} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img src={item.image} alt={item.title} className={styles.image} />
                <div className={styles.eventIcon}>{item.icon}</div>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
