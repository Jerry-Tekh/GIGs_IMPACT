import React from 'react';
import { motion } from 'framer-motion';
import styles from './ContactPage.module.css';

const contactCards = [
  {
    label: 'Email',
    value: 'gigsimpact@gmail.com',
    note: 'For partnerships, support, and general enquiries.'
  },
  {
    label: 'Phone',
    value: '0814 616 3211',
    note: 'Reach out for direct community or program questions.'
  },
  {
    label: 'Location',
    value: 'Enugu, Nigeria',
    note: 'Our work is rooted locally while building toward wider impact.'
  }
];

const ContactPage = () => {
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      subject: e.target.subject.value,
      message: e.target.message.value
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Message sent successfully!');
        e.target.reset();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
    }
  };

  return (
    <div className={styles.page}>
      <motion.section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Contact</span>
            <h1>Let&apos;s talk about ideas, collaboration, and building practical impact together.</h1>
            <p>
              Whether you want to join the community, explore a partnership, or ask a question, we are ready to
              listen and respond.
            </p>

            <div className={styles.heroActions}>
              <a href="#contact-form" className={styles.primaryBtn}>
                Send A Message
              </a>
              <a href="mailto:gigsimpact@gmail.com" className={styles.secondaryBtn}>
                Email Us Directly
              </a>
            </div>
          </div>

          <div className={styles.heroPanel}>
            <span className={styles.panelLabel}>Response Promise</span>
            <h2>We aim to make every conversation clear and action-oriented.</h2>
            <p>
              Use the form below to reach us . We will respond within 1 business day
              and guide you on the next steps to get your questions answered, ideas
            </p>

            <div className={styles.heroStats}>
              <div>
                <strong>1 Day</strong>
                <span>Effective Response</span>
              </div>
              <div>
                <strong>3</strong>
                <span>Ways to connect</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className={styles.infoSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Get In Touch</span>
          <h2>Choose the contact path that fits your need.</h2>
        </div>

        <div className={styles.infoGrid}>
          {contactCards.map((card) => (
            <article key={card.label} className={styles.infoCard}>
              <span className={styles.infoLabel}>{card.label}</span>
              <h3>{card.value}</h3>
              <p>{card.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.formSection} id="contact-form">
        <div className={styles.formGrid}>
          <article className={styles.copyCard}>
            <span className={styles.sectionTag}>Why Reach Out</span>
            <h2>We welcome partnership ideas, volunteer interest, and questions about the community.</h2>
            <p>
              If you want to collaborate, support the mission, or understand how GIGs Impact works, share the
              details and we will guide the next step.
            </p>

            <ul className={styles.pointList}>
              <li>Partnership and sponsorship conversations</li>
              <li>Community membership enquiries</li>
              <li>Speaking, media, and collaboration requests</li>
              <li>Support for general questions and clarifications</li>
            </ul>
          </article>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" type="text" placeholder="Your name" required />
            </div>

            <div className={styles.formRow}>
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>

            <div className={styles.formRow}>
              <label htmlFor="subject">Subject</label>
              <input id="subject" name="subject" type="text" placeholder="How can we help?" required />
            </div>

            <div className={styles.formRow}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                placeholder="Tell us about your idea, need, or question"
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
