import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import styles from './Auth.module.css';
import { clearCsrfToken, fetchCsrfToken } from '../utils/csrf.js';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 100;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('We are checking your reset link now.');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const verifyResetToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Reset link is incomplete. Please use the full link from your email.');
        return;
      }

      try {
        const csrfToken = await fetchCsrfToken();
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/verify-reset-token/${token}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          }
        });

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (response.ok) {
          setStatus('ready');
          setMessage(data.message || 'Reset link verified. You can choose a new password now.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Reset link is invalid or expired.');
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setStatus('error');
        setMessage('Network error. Please try the reset link again.');
      }
    };

    verifyResetToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (redirectCountdown <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRedirectCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          navigate('/login', {
            state: {
              feedback: {
                type: 'success',
                message: 'Password reset successful. Sign in with your new password.'
              }
            }
          });
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [navigate, redirectCountdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < MIN_PASSWORD_LENGTH || formData.newPassword.length > MAX_PASSWORD_LENGTH) {
      setError(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long`);
      return;
    }

    setIsLoading(true);

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
          resetToken: token,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        clearCsrfToken();
        setSuccess(data.message || 'Password reset successful. Please login again.');
        setRedirectCountdown(4);
        setStatus('success');
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.newPassword.trim() !== '' && formData.confirmPassword.trim() !== '';

  return (
    <div className={styles.authPage}>
      <Header />
      <main className={styles.authMain}>
        <section className={styles.authHero}>
          <div className={styles.authShell}>
            <div className={styles.authCopy}>
              <span className={styles.eyebrow}>Reset Password</span>
              <h1>Choose a new password for your account.</h1>
              <p>
                We verify the reset link first, then allow you to set a fresh password and safely revoke older sessions.
              </p>
            </div>

            <div className={styles.authPanel}>
              <div className={styles.panelIntro}>
                <span className={styles.sectionTag}>Password Reset</span>
                <h2>
                  {status === 'verifying' && 'Checking your reset link'}
                  {status === 'ready' && 'Create your new password'}
                  {status === 'success' && 'Password updated'}
                  {status === 'error' && 'Reset link problem'}
                </h2>
              </div>

              <AuthCard
                title="Reset Password"
                subtitle="Only valid, time-limited reset links can continue to this step."
              >
                {status === 'verifying' && (
                  <motion.div className={styles.infoNotice}>
                    <span className={styles.loadingSpinner} />
                    <span>{message}</span>
                  </motion.div>
                )}

                {status === 'error' && (
                  <>
                    <div className={styles.error}>
                      <strong>We could not validate this reset link.</strong>
                      <div className={styles.feedbackDetail}>{message}</div>
                    </div>
                    <div className={styles.authActionStack}>
                      <Link to="/login" className={styles.secondaryAction}>
                        Go to Login
                      </Link>
                    </div>
                  </>
                )}

                {(status === 'ready' || status === 'success') && (
                  <form className={styles.form} onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}
                    {success && (
                      <div className={styles.success}>
                        <strong>Password reset successful.</strong>
                        <div className={styles.feedbackDetail}>{success}</div>
                        <div className={styles.feedbackDetail}>Redirecting to login in {redirectCountdown}s...</div>
                      </div>
                    )}

                    {status === 'ready' && (
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

                        <motion.button
                          type="submit"
                          className={styles.submitBtn}
                          disabled={isLoading || !isFormValid}
                        >
                          {isLoading && <span className={styles.loadingSpinner} />}
                          {isLoading ? 'Resetting Password...' : 'Reset Password'}
                        </motion.button>
                      </>
                    )}

                    {status === 'success' && (
                      <div className={styles.authActionStack}>
                        <Link to="/login" className={styles.secondaryAction}>
                          Go to Login Now
                        </Link>
                      </div>
                    )}
                  </form>
                )}
              </AuthCard>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
