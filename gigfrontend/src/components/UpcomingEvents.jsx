import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
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
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80',
    icon: <FaTicketAlt />
  },
  {
    title: 'Impact Partner Forum',
    description: 'Collaborate with global impact investors',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
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

  const [slideWidth, setSlideWidth] = useState(310);
  const maxIndex = Math.max(0, events.length - visibleSlides);

  useEffect(() => {
    if (!containerRef.current) return;
    const cardElement = containerRef.current.querySelector('article');
    if (!cardElement) return;

    const width = cardElement.offsetWidth;
    const gap = 10;
    setSlideWidth(width + gap);
  }, [visibleSlides]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrevious,
    trackMouse: true,
    preventScrollOnSwipe: true
  });

  return (
    <motion.section 
      className={styles.advertSection}
      initial={{ backgroundColor: 'transparent' }}
      whileInView={{ backgroundColor: '#f9f9f9' }} // adjust
      transition={{ duration: 1 }}
    >
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Upcoming Events
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Live events, learning pathways, and community experiences
        </motion.p>
      </motion.div>

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
        <div className={styles.carousel} ref={containerRef} {...swipeHandlers}>
          <motion.div
            className={styles.track}
            animate={{ x: -currentIndex * slideWidth }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {events.map((item, index) => (
              <motion.article 
                key={index} 
                className={styles.card}
                initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className={styles.imageWrapper}>
                  <motion.img 
                    src={item.image} 
                    alt={item.title} 
                    className={styles.image}
                    initial={{ x: -100, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                  />
                  <div className={styles.eventIcon}>{item.icon}</div>
                </div>
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                >
                  {item.title}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.6 }}
                >
                  {item.description}
                </motion.p>
              </motion.article>
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
      <motion.div 
        className={styles.dotsContainer}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {events.map((_, index) => (
          <motion.button
            key={index}
            className={`${styles.dot} ${index <= currentIndex + visibleSlides - 1 && index >= currentIndex ? styles.active : ''}`}
            onClick={() => handleDotClick(index)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </motion.div>
    </motion.section>
  );
};

export default UpcomingEvents;
