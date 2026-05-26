import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Carosel.module.css';
import { FaCalendarAlt, FaClock, FaTicketAlt } from 'react-icons/fa';

const defaultSlides = [
  {
    title: 'Youth Empowerment Summit',
    description: 'Networking and skill labs for emerging leaders',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80',
    icon: <FaCalendarAlt />,
    meta: 'Live Gathering'
  },
  {
    title: 'Digital Skills Bootcamp',
    description: '6-week hands-on training in digital tools',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    icon: <FaClock />,
    meta: 'Training Series'
  },
  {
    title: 'Community Pitch Day',
    description: 'Present ideas, win seed support',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    icon: <FaTicketAlt />,
    meta: 'Opportunity Room'
  }
];

const Carousel = ({ slides = defaultSlides }) => {
  const [cur, setCur] = useState(0);
  const len = slides.length;

  const prevSlide = () => setCur((current) => (current - 1 + len) % len);
  const nextSlide = () => setCur((current) => (current + 1) % len);

  useEffect(() => {
    if (!len) return;
    const timeoutId = window.setTimeout(nextSlide, 4500);
    return () => window.clearTimeout(timeoutId);
  }, [cur, len]);

  if (!len) return null;

  const activeSlide = slides[cur];

  return (
    <motion.section
      className={styles.carouselWrapper}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className={styles.carousel}>
        <div className={styles.header}>
          <div>
            <span className={styles.kicker}>Featured Experiences</span>
            <h2 className={styles.heading}>Upcoming Events</h2>
          </div>
          <div className={styles.controls}>
            <button type="button" className={styles.navButton} onClick={prevSlide} aria-label="Previous slide">
              Prev
            </button>
            <button type="button" className={styles.navButton} onClick={nextSlide} aria-label="Next slide">
              Next
            </button>
          </div>
        </div>

        <div className={styles.featureStage}>
          <div className={styles.backdrop}>
            <img src={activeSlide.image} alt={activeSlide.title} className={styles.image} />
          </div>

          <div className={styles.overlay} />

          <div className={styles.content}>
            <span className={styles.metaTag}>
              {activeSlide.icon}
              {activeSlide.meta}
            </span>
            <h3>{activeSlide.title}</h3>
            <p>{activeSlide.description}</p>
          </div>
        </div>

        <div className={styles.rail}>
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              className={`${styles.railItem} ${index === cur ? styles.activeRailItem : ''}`}
              onClick={() => setCur(index)}
              aria-label={`Go to ${slide.title}`}
            >
              <img src={slide.image} alt={slide.title} className={styles.thumb} />
              <span className={styles.railCopy}>
                <strong>{slide.title}</strong>
                <small>{slide.description}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Carousel;
