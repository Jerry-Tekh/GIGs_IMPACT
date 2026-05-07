import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DonationForm.module.css';

import volunteer from './../assets/volunteer3.png';

const DonationForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    skills: '',
    contributionType: 'How would you like to contribute?'
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/contact/volunteer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('Your application has been sent successfully!');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          skills: '',
          contributionType: 'How would you like to contribute?'
        });
      } else {
        setStatus('Something went wrong. Please try again.');
      }
    } catch (error) {
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
            <input type="text" name="fullName" placeholder="Full Name" className={styles.input} value={formData.fullName} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" className={styles.input} value={formData.email} onChange={handleChange} required />
            <input type="tel" name="phone" placeholder="Phone" className={styles.input} value={formData.phone} onChange={handleChange} required />
            <input type="text" name="skills" placeholder="Skills" className={styles.input} value={formData.skills} onChange={handleChange} required />
            <select name="contributionType" className={styles.input} value={formData.contributionType} onChange={handleChange}>
              <option>How would you like to contribute?</option>
              <option>Trainers and facilitators</option>
              <option>Mentors and coaches</option>
              <option>Event organizers</option>
              <option>Content creators</option>
              <option>Social media managers</option>
            </select>
            <button className={styles.submit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </motion.form>

          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={styles.status}
              >
                {status}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.aside className={styles.infoCol}>
          <h4>Volunteer Requirements</h4>
          <img src={volunteer} alt="" />
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

