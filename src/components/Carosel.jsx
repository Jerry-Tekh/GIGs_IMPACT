import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./Carosel.module.css";

const defaultSlides = [
  {
    title: "Youth Empowerment Summit",
    description: "Networking + skill labs for emerging leaders",
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80",
    icon: "📅"
  },
  {
    title: "Digital Skills Bootcamp",
    description: "6-week hands-on training in digital tools",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80",
    icon: "⏰"
  },
  {
    title: "Community Pitch Day",
    description: "Present ideas, win seed support",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
    icon: "🎟️"
  }
];

const Carousel = ({ slides = defaultSlides }) => {
  const [cur, setCur] = useState(0);
  const len = slides.length;

  const prevSlide = () => {
    setCur((current) => (current - 1 + len) % len);
  };

  const nextSlide = () => {
    setCur((current) => (current + 1) % len);
  };

  useEffect(() => {
    if (!len) return;
    const timeoutId = window.setTimeout(nextSlide, 4000);
    return () => window.clearTimeout(timeoutId);
  }, [cur, len]);

  if (!len) {
    return null;
  }

  return (
    <motion.div
      className={styles.carouselWrapper}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.2 }}
    >

    <div className={styles.carousel}>
      <motion.h2
        className={styles.heading}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        View List OF Upcomming Events
      </motion.h2>

      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ transform: `translateX(-${cur * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div className={styles.slide} key={index}>
              <SlideItem slide={slide} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`${styles.navButton} ${styles.leftBtn}`}
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        ‹
      </button>

      <button
        type="button"
        className={`${styles.navButton} ${styles.rightBtn}`}
        onClick={nextSlide}
        aria-label="Next slide"
      >
        ›
      </button>

      <div className={styles.dots}>
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`${styles.dot} ${index === cur ? styles.activeDot : ''}`}
            onClick={() => setCur(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
    </motion.div>
  );
};

const SlideItem = ({ slide }) => {
  const { title, description, image, icon } = slide;

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, amount: 0.4 }}
      whileHover={{ y: -6 }}
    >
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.image} />
        <span className={styles.eventIcon}>{icon}</span>
      </div>
      <div className={styles.cardBody}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </motion.article>
  );
};




export default Carousel;
