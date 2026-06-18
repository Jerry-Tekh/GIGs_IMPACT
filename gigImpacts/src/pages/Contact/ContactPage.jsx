import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import styles from './ContactPage.module.css';
import { riseItem, sectionFade, slideLeft, slideRight, staggerGroup, viewport } from '../../utils/motion.js';
import { loadRecaptchaScript, RECAPTCHA_SITE_KEY } from '../../utils/recaptcha.js';

const honeypotStyles = {
  position: 'absolute',
  left: '-9999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden'
};

const contactCards = [
  {
    icon: FaEnvelope,
    label: 'Email',
    value: 'gigsimpact@gmail.com',
    note: 'For partnerships, support, and general enquiries.'
  },
  {
    icon: FaPhoneAlt,
    label: 'Phone',
    value: '0814 616 3211',
    note: 'Reach out for direct community or program questions.'
  },
  {
    icon: FaMapMarkerAlt,
    label: 'Location',
    value: 'Enugu, Nigeria',
    note: 'Our work is rooted locally while building toward wider impact.'
  }
];

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [captchaReady, setCaptchaReady] = useState(false);
  const captchaContainerRef = React.useRef(null);
  const captchaWidgetIdRef = React.useRef(null);

  useEffect(() => {
    if (!status) {
      return undefined;
    }

    const timer = window.setTimeout(() => setStatus(null), 5000);
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    let isMounted = true;

    if (!RECAPTCHA_SITE_KEY || !captchaContainerRef.current) {
      setCaptchaReady(false);
      return undefined;
    }

    loadRecaptchaScript()
      .then((grecaptcha) => {
        if (!isMounted || !captchaContainerRef.current || !grecaptcha?.render) {
          return;
        }

        grecaptcha.ready(() => {
          if (!isMounted || captchaWidgetIdRef.current !== null || !captchaContainerRef.current) {
            return;
          }

          captchaWidgetIdRef.current = grecaptcha.render(captchaContainerRef.current, {
            sitekey: RECAPTCHA_SITE_KEY
          });
          setCaptchaReady(true);
        });
      })
      .catch(() => {
        if (isMounted) {
          setCaptchaReady(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const recaptchaToken = captchaWidgetIdRef.current !== null && window.grecaptcha
      ? window.grecaptcha.getResponse(captchaWidgetIdRef.current)
      : '';

    if (!recaptchaToken) {
      setStatus({
        type: 'error',
        message: 'Please complete the reCAPTCHA check before sending your message.'
      });
      setIsSubmitting(false);
      return;
    }

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      subject: e.target.subject.value,
      message: e.target.message.value,
      website: e.target.website.value,
      recaptchaToken
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: 'success',
          message: 'Your message has been sent successfully. We will get back to you soon.'
        });
        e.target.reset();
        if (captchaWidgetIdRef.current !== null && window.grecaptcha) {
          window.grecaptcha.reset(captchaWidgetIdRef.current);
        }
      } else {
        setStatus({
          type: 'error',
          message: data.errors?.[0] || data.message || 'We could not send your message right now. Please try again.'
        });
      }
    } catch (error) {
      console.error(error);
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <motion.section className={styles.hero}>
        <div className={styles.heroGrid}>
          <motion.div className={styles.heroCopy} variants={slideLeft} initial="hidden" animate="show">
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
          </motion.div>

          <motion.div className={styles.heroPanel} variants={slideRight} initial="hidden" animate="show">
            <span className={styles.panelLabel}>Response Promise</span>
            <h2>We aim to make every conversation clear and action-oriented.</h2>
            <p>
              Use the form below to reach us . We will respond within one business day
              and guide you on the next steps to get your questions answered.
            </p>

            {/*<div className={styles.heroStats}>
              <div>
                <strong>One Day</strong>
                <span>Effective Response</span>
              </div>
              <div>
                <strong>Three</strong>
                <span>Ways to connect</span>
              </div>
            </div>*/}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className={styles.infoSection}
        variants={sectionFade}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <motion.div className={styles.sectionHeader} variants={riseItem}>
          <span className={styles.sectionTag}>Get In Touch</span>
          <h2>Choose the contact path that fits your need.</h2>
        </motion.div>

        <motion.div className={styles.infoGrid} variants={staggerGroup}>
          {contactCards.map((card) => {
            const Icon = card.icon;

            return (
              <motion.article key={card.label} className={styles.infoCard} variants={riseItem} whileHover={{ y: -6 }}>
                <div className={styles.infoCardTop}>
                  <span className={styles.infoIcon} aria-hidden="true">
                    <Icon />
                  </span>
                  <span className={styles.infoLabel}>{card.label}</span>
                </div>
                <h3>{card.value}</h3>
                <p>{card.note}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </motion.section>

      <motion.section
        className={styles.formSection}
        id="contact-form"
        variants={sectionFade}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <motion.div className={styles.formGrid} variants={staggerGroup}>
          <motion.article className={styles.copyCard} variants={slideLeft}>
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
          </motion.article>

          <motion.form className={styles.form} onSubmit={handleSubmit} variants={slideRight}>
            <AnimatePresence>
              {status && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`${styles.status} ${status.type === 'success' ? styles.statusSuccess : styles.statusError}`}
                >
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>

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

            <div style={honeypotStyles} aria-hidden="true">
              <label htmlFor="website">Leave this field empty</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex="-1"
                autoComplete="off"
              />
            </div>

            <div className={styles.formRow}>
              <label>Security Check</label>
              <div ref={captchaContainerRef} />
              {!captchaReady && (
                <small>Please wait while the security check loads.</small>
              )}
            </div>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting || !captchaReady}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </motion.form>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default ContactPage;
