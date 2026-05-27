import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import styles from './Auth.module.css';
import { fetchCsrfToken } from '../utils/csrf.js';

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const csrfToken = await fetchCsrfToken();
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'If email exists, a password reset link has been sent.');
      } else {
        setError(data.message || 'Failed to send password reset link');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <Header />
      <main className={styles.authMain}>
        <section className={styles.authHero}>
          <div className={styles.authShell}>
            <motion.div
              className={styles.authCopy}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className={styles.eyebrow}>Password Recovery</span>
              <h2>Reset your password from a secure email link</h2>
              <p>
                Enter your email address and we will send a time-limited reset link you can use to choose a new
                password securely.
              </p>

              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <strong>1</strong>
                  <span>Email step</span>
                </div>
                <div className={styles.statCard}>
                  <strong>Secure</strong>
                  <span>Token-based reset</span>
                </div>
              </div>

              <ul className={styles.featureList}>
                <li>Enter the email address linked to your account</li>
                <li>Open the reset link we send to your inbox</li>
                <li>Choose a new password and sign back in</li>
              </ul>
            </motion.div>

            <div className={styles.authPanel}>
              <div className={styles.panelIntro}>
                <span className={styles.sectionTag}>Recovery</span>
                <h2>Send a reset link to your email</h2>
              </div>

              <AuthCard
                title="Forgot Password"
                subtitle="We will send a password reset link if the email is registered."
              >
                <form className={styles.form} onSubmit={handleRequestReset}>
                  {error && <div className={styles.error}>{error}</div>}
                  {success && (
                    <div className={styles.success}>
                      <strong>Check your email.</strong>
                      <div className={styles.feedbackDetail}>{success}</div>
                      <div className={styles.feedbackDetail}>
                        Open the link in the email to continue resetting your password.
                      </div>
                    </div>
                  )}

                  <motion.div className={styles.inputGroup}>
                    <FaEnvelope className={styles.inputIcon} />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.input}
                      required
                      aria-label="Email address"
                    />
                  </motion.div>

                  <motion.button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isLoading || email.trim() === ''}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isLoading && <span className={styles.loadingSpinner}></span>}
                    {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => onBackToLogin()}
                    className={styles.backBtn}
                  >
                    <FaArrowLeft /> Back to Login
                  </button>
                </form>
              </AuthCard>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
