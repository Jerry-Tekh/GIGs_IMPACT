import React from 'react';
import { motion } from 'framer-motion';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className={styles.contactPage}>
      <motion.section
        className={styles.hero}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1>Contact GIGs Impact Community</h1>
          <p>
            Share your idea, ask about joining, or connect with our community.
            We’re here to support talent, opportunity, and impact.
          </p>
        </motion.div>
      </motion.section>

      <motion.section
        className={styles.contentGrid}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className={styles.infoCard}>
          <span className={styles.badge}>Get in Touch</span>
          <h2>We’re ready to listen and collaborate.</h2>
          <p>
            Whether you want to volunteer, partner, or ask a question, our team
            is available to help. Fill the form and we’ll get back to you within
            one business day.
          </p>

          <div className={styles.details}>
            <div>
              <h4>Email</h4>
              <p>gigsimpact@gmail.com</p>
            </div>
            <div>
              <h4>Phone</h4>
              <p>0814 616 3211</p>
            </div>
            <div>
              <h4>Location</h4>
              <p>Enugu, Nigeria</p>
            </div>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" type="text" placeholder="Your name" />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="subject">Subject</label>
            <input id="subject" name="subject" type="text" placeholder="How can we help?" />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows="6" placeholder="Tell us about your idea or question" />
          </div>
          <button type="submit" className={styles.submitButton}>
            Send Message
          </button>
        </form>
      </motion.section>
    </div>
  );
};

export default ContactPage;
