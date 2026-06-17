import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DonationForm.module.css';
import { loadRecaptchaScript, RECAPTCHA_SITE_KEY } from '../utils/recaptcha.js';

import volunteer from './../assets/volunteer3.png';

const honeypotStyles = {
  position: 'absolute',
  left: '-9999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden'
};

const DonationForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    skills: '',
    contributionType: 'How would you like to contribute?',
    website: ''
  });
  const [status, setStatus] = useState(null);
  const [captchaReady, setCaptchaReady] = useState(false);
  const captchaContainerRef = React.useRef(null);
  const captchaWidgetIdRef = React.useRef(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const recaptchaToken = captchaWidgetIdRef.current !== null && window.grecaptcha
      ? window.grecaptcha.getResponse(captchaWidgetIdRef.current)
      : '';

    if (!recaptchaToken) {
      setStatus('Please complete the reCAPTCHA check before submitting your application.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/contact/volunteer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recaptchaToken
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setStatus('Your application has been sent successfully!');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          skills: '',
          contributionType: 'How would you like to contribute?',
          website: ''
        });
        if (captchaWidgetIdRef.current !== null && window.grecaptcha) {
          window.grecaptcha.reset(captchaWidgetIdRef.current);
        }
      } else {
        setStatus(data.errors?.[0] || data.message || 'Something went wrong. Please try again.');
      }
    } catch (_error) {
      setStatus('Error sending message. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <motion.section id="volunteer" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionTag}>Volunteer With Us</span>
          <h2>Join the people helping us build opportunities, structure, and real community impact.</h2>
          <p>
            This section is for contributors who want to give time, skill, and energy to the mission.
          </p>
        </div>

        <motion.div className={styles.formCard}>
          <p className={styles.kicker}>Volunteer</p>
          <h3>Volunteer With Us</h3>
          <p>
            Be part of a mission that is transforming lives and shaping the future of Nigeria and Africa.
          </p>

          <motion.form className={styles.form} onSubmit={handleSubmit}>
            <input type="text" name="fullName" placeholder="Full Name" aria-label="Full name" className={styles.input} value={formData.fullName} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" aria-label="Email address" className={styles.input} value={formData.email} onChange={handleChange} required />
            <input type="tel" name="phone" placeholder="Phone" aria-label="Phone number" className={styles.input} value={formData.phone} onChange={handleChange} required />
            <input type="text" name="skills" placeholder="Skills" aria-label="Your skills" className={styles.input} value={formData.skills} onChange={handleChange} required />
            <select name="contributionType" aria-label="How would you like to contribute?" className={styles.input} value={formData.contributionType} onChange={handleChange}>
              <option>How would you like to contribute?</option>
              <option>Trainers and facilitators</option>
              <option>Mentors and coaches</option>
              <option>Event organizers</option>
              <option>Content creators</option>
              <option>Social media managers</option>
            </select>

            <div style={honeypotStyles} aria-hidden="true">
              <label htmlFor="volunteer-website">Leave this field empty</label>
              <input
                id="volunteer-website"
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                tabIndex="-1"
                autoComplete="off"
              />
            </div>

            <div className={styles.input}>
              <div ref={captchaContainerRef} />
              {!captchaReady && <small>Please wait while the security check loads.</small>}
            </div>

            <button className={styles.submit} disabled={loading || !captchaReady}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </motion.form>

          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
                aria-live="polite"
                className={`${styles.status} ${status.toLowerCase().includes('success') ? styles.statusSuccess : styles.statusError}`}
              >
                {status}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.aside className={styles.infoCol}>
          <h4>Volunteer Requirements</h4>
          <img src={volunteer} alt="GIGs Impact volunteers collaborating at a community session" />
          <ul>
            <li>Willingness to serve</li>
            <li>Commitment to growth</li>
            <li>Alignment with our values</li>
            <li>Passion for impact</li>
          </ul>
        </motion.aside>
      </div>
    </motion.section>
  );
};

export default DonationForm;
