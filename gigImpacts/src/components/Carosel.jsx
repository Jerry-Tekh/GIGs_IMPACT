import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Carosel.module.css';
import { FaLock } from 'react-icons/fa';

const Carousel = ({ slides: initialSlides = [] }) => {
  const [slides, setSlides] = useState(initialSlides.length ? initialSlides : null);
  // fallback default slides preserved visually if fetch fails
  const [fallback] = useState([
    {
      title: 'Youth Empowerment Summit',
      description: 'Networking and skill labs for emerging leaders',
      image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80',
      meta: 'Live Gathering'
    },
    {
      title: 'Digital Skills Bootcamp',
      description: '6-week hands-on training in digital tools',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
      meta: 'Training Series'
    },
    {
      title: 'Community Pitch Day',
      description: 'Present ideas, win seed support',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      meta: 'Opportunity Room'
    }
  ]);

  useEffect(() => {
    if (initialSlides && initialSlides.length) return;

    const load = async () => {
      try {
        const url = `${import.meta.env.VITE_SERVER_URL}/api/carousels`;
        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.error('Carousel load failed:', res.status, text);
          throw new Error('Failed to load');
        }
        const json = await res.json();
        const items = (json.items || []).map((it) => ({
          title: it.title,
          description: it.description,
          image: it.image_url,
          meta: it.meta
        }));
        
        if (items.length) setSlides(items);
        else setSlides(fallback);
      } catch (err) {
        console.error('Carousel fetch error:', err.message);
        setSlides(fallback);
      }
    };


    load();
  }, [initialSlides, fallback]);
  const [cur, setCur] = useState(0);
  const len = (slides || fallback).length;

  const prevSlide = () => setCur((current) => (current - 1 + len) % len);
  const nextSlide = () => setCur((current) => (current + 1) % len);

  useEffect(() => {
    if (!len) return;
    const timeoutId = window.setTimeout(nextSlide, 4500);
    return () => window.clearTimeout(timeoutId);
  }, [cur, len]);

  if (!len) return null;

  const activeSlide = (slides || fallback)[cur];

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
            <div className={styles.statusRow}>
              <span className={styles.metaTag}>
                <FaLock />
                {activeSlide.meta}
              </span>
              <span className={styles.slideCount}>
                {String(cur + 1).padStart(2, '0')}
                <span>/</span>
                {String(len).padStart(2, '0')}
              </span>
            </div>
            <span className={styles.contentRule} aria-hidden="true" />
            <h3>{activeSlide.title}</h3>
            <p>{activeSlide.description}</p>
            <div className={styles.progressTrack} aria-hidden="true">
              <span className={styles.progressFill} style={{ width: `${((cur + 1) / len) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className={styles.rail}>
          {(slides || fallback).map((slide, index) => (
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
