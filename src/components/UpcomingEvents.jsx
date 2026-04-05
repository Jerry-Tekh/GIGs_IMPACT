import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTicketAlt } from 'react-icons/fa';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(3);
  const containerRef = useRef(null);

  useEffect(() => {
    const calculateVisibleSlides = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const cardWidth = 180; // 180px card width
      const gap = 10; // gap between cards
      const totalWidth = cardWidth + gap;

      const visible = Math.floor(containerWidth / totalWidth);
      setVisibleSlides(Math.max(1, visible));
    };

    calculateVisibleSlides();
    window.addEventListener('resize', calculateVisibleSlides);

    return () => window.removeEventListener('resize', calculateVisibleSlides);
  }, []);

  const maxIndex = Math.max(0, events.length - visibleSlides);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
  };

  const handleDotClick = (index) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  return (
    <section className={styles.advertSection}>
      <div className={styles.header}>
        <h2>Upcoming Events</h2>
        <p>Live events, learning pathways, and community experiences</p>
      </div>

      <div className={styles.carouselWrapper}>
        {/* Left Arrow */}
        <motion.button
          className={styles.arrowButton}
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{ left: 0 }}
        >
          <FaChevronLeft />
        </motion.button>

        {/* Carousel Container */}
        <div className={styles.carousel} ref={containerRef}>
          <motion.div
            className={styles.track}
            animate={{ x: -currentIndex * 190 }} // 180px card + 10px gap
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {events.map((item, index) => (
              <article key={index} className={styles.card}>
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

        {/* Right Arrow */}
        <motion.button
          className={styles.arrowButton}
          onClick={handleNext}
          disabled={currentIndex >= maxIndex}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{ right: 0 }}
        >
          <FaChevronRight />
        </motion.button>
      </div>

      {/* Indicator Dots */}
      <div className={styles.dotsContainer}>
        {events.map((_, index) => (
          <motion.button
            key={index}
            className={`${styles.dot} ${index <= currentIndex + visibleSlides - 1 && index >= currentIndex ? styles.active : ''}`}
            onClick={() => handleDotClick(index)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </section>
  );
};

export default UpcomingEvents;
