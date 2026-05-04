import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaArrowLeft } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import styles from './Auth.module.css';
import { fetchCsrfToken, setCsrfToken } from '../utils/csrf.js';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 100;

const ForgotPassword = ({ onBackToLogin }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Step 1: Request password reset
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
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Reset code sent to your email');
        setStep(2);
      } else {
        setError(data.message || 'Failed to send reset code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify reset code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const csrfToken = await fetchCsrfToken();
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ 
          email: formData.email,
          resetCode: formData.resetCode 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCsrfToken(data?.csrfToken || csrfToken);
        setSuccess('Code verified! Set your new password.');
        setStep(3);
      } else {
        setError(data.message || 'Invalid or expired code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < MIN_PASSWORD_LENGTH || formData.newPassword.length > MAX_PASSWORD_LENGTH) {
      setError(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long`);
      setIsLoading(false);
      return;
    }

    try {
      const csrfToken = await fetchCsrfToken();
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ 
          email: formData.email,
          resetCode: formData.resetCode,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
      setSuccess('');
    } else {
      onBackToLogin();
    }
  };

  const isStepValid =
    step === 1
      ? formData.email.trim() !== ''
      : step === 2
        ? formData.resetCode.trim() !== ''
        : formData.newPassword.trim() !== '' && formData.confirmPassword.trim() !== '';

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
              <h1>Reset your password in just a few steps</h1>
              <p>
                Forgot your password? No problem. We'll send you a verification code to your registered email
                address, and you can set a new password in minutes.
              </p>

              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <strong>3</strong>
                  <span>Simple steps</span>
                </div>
                <div className={styles.statCard}>
                  <strong>Secure</strong>
                  <span>Email verification</span>
                </div>
              </div>

              <ul className={styles.featureList}>
                <li>✓ Verify your email identity</li>
                <li>✓ Receive a 6-digit reset code</li>
                <li>✓ Create a new secure password</li>
              </ul>
            </motion.div>

            <div className={styles.authPanel}>
              <div className={styles.panelIntro}>
                <span className={styles.sectionTag}>Recovery</span>
                <h2>
                  {step === 1 && 'Enter your email'}
                  {step === 2 && 'Verify your code'}
                  {step === 3 && 'Create new password'}
                </h2>
              </div>

              <AuthCard 
                title={step === 1 ? 'Enter Email' : step === 2 ? 'Enter Code' : 'New Password'}
                subtitle={
                  step === 1 ? 'We\'ll send a code to your registered email'
                  : step === 2 ? 'Check your email for the 6-digit code'
                  : 'Choose a strong password'
                }
              >
                <form className={styles.form} onSubmit={
                  step === 1 ? handleRequestReset
                  : step === 2 ? handleVerifyCode
                  : handleResetPassword
                }>
                  {error && <div className={styles.error}>{error}</div>}
                  {success && <div className={styles.success}>{success}</div>}

                  {step === 1 && (
                    <motion.div className={styles.inputGroup}>
                      <FaEnvelope className={styles.inputIcon} />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.input}
                        required
                        aria-label="Email address"
                      />
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div className={styles.inputGroup}>
                      <FaLock className={styles.inputIcon} />
                      <input
                        type="text"
                        name="resetCode"
                        placeholder="Enter 6-digit code"
                        value={formData.resetCode}
                        onChange={handleChange}
                        className={styles.input}
                        required
                        maxLength="6"
                        aria-label="Reset code"
                      />
                    </motion.div>
                  )}

                  {step === 3 && (
                    <>
                      <motion.div className={styles.inputGroup}>
                        <FaLock className={styles.inputIcon} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="newPassword"
                          placeholder="New password"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className={styles.input}
                          required
                          minLength={MIN_PASSWORD_LENGTH}
                          maxLength={MAX_PASSWORD_LENGTH}
                          aria-label="New password"
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </motion.div>

                      <motion.div className={styles.inputGroup}>
                        <FaLock className={styles.inputIcon} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={styles.input}
                          required
                          minLength={MIN_PASSWORD_LENGTH}
                          maxLength={MAX_PASSWORD_LENGTH}
                          aria-label="Confirm password"
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </motion.div>
                    </>
                  )}

                  <motion.button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isLoading || !isStepValid}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isLoading && <span className={styles.loadingSpinner}></span>}
                    {step === 1 && 'Send Code'}
                    {step === 2 && 'Verify Code'}
                    {step === 3 && 'Reset Password'}
                  </motion.button>

                  <button
                    type="button"
                    onClick={handleBackStep}
                    className={styles.backBtn}
                  >
                    <FaArrowLeft /> {step === 1 ? 'Back to Login' : 'Back'}
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
