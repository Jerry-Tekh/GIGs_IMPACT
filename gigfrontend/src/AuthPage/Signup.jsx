import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import styles from './Auth.module.css';
import { clearCsrfToken, fetchCsrfToken, setCsrfToken } from '../utils/csrf.js';

const signupBenefits = [
  'Create an editorial account that matches the public site identity',
  'Start managing blog content with a clear and responsive form flow',
  'Keep admin onboarding visually consistent across devices'
];

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 100;

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdEmail, setCreatedEmail] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const navigate = useNavigate();

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
                message: 'Account created successfully. Verify your email address, then sign in.'
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
    const nextValue = name === 'email' ? value.toLowerCase() : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue
    }));
  };

  const isFormValid = 
    formData.fullName.trim() !== '' && 
    formData.email.trim() !== '' && 
    formData.password.trim() !== '' && 
    formData.confirmPassword.trim() !== '';

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < MIN_PASSWORD_LENGTH || formData.password.length > MAX_PASSWORD_LENGTH) {
      setError(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long`);
      return false;
    }

    return true;
  };

  const parseResponseBody = async (response) => {
    const rawBody = await response.text();

    if (!rawBody) {
      return {};
    }

    try {
      return JSON.parse(rawBody);
    } catch {
      return { message: rawBody };
    }
  };

  const isCsrfError = (response, data) =>
    response.status === 403 &&
    ['CSRF token missing', 'Invalid CSRF token'].includes(data?.message);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const registrationPayload = JSON.stringify({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      const attemptSignup = async (csrfToken) => {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/register`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: registrationPayload
        });

        const data = await parseResponseBody(response);
        return { response, data };
      };

      let csrfToken = await fetchCsrfToken();
      let { response, data } = await attemptSignup(csrfToken);

      if (isCsrfError(response, data)) {
        clearCsrfToken();
        csrfToken = await fetchCsrfToken({ force: true });
        ({ response, data } = await attemptSignup(csrfToken));
      }

      if (response.ok) {
        setCsrfToken(data?.csrfToken || csrfToken);
        setCreatedEmail(data?.data?.email || formData.email);
        setSuccess(data.message || 'Account created successfully. Please check your email to verify your account.');
        setRedirectCountdown(4);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
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
            <div className={styles.authCopy}>
              <span className={styles.eyebrow}>Blog Signup</span>
              <h1>Create your blog account.</h1>
            
            <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <strong>Brand</strong>
                  <span>Consistent onboarding</span>
                </div>
                <div className={styles.statCard}>
                  <strong>Clear</strong>
                  <span>Responsive typography</span>
                </div>
              </div>
              

              <ul className={styles.featureList}>
                {signupBenefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.authPanel}>
              <div className={styles.panelIntro}>
                <span className={styles.sectionTag}>Create Account</span>
                
              </div>

              <AuthCard title="Sign Up" subtitle="Create your admin account to start managing blog content.">
                <form className={styles.form} onSubmit={handleSubmit}>
                  {error && <div className={styles.error}>{error}</div>}
                  {success && (
                    <div className={styles.success}>
                      <strong>Account created successfully.</strong>
                      <div className={styles.feedbackDetail}>
                        We sent a verification email to {createdEmail}. Please open it and verify your account before
                        signing in.
                      </div>
                      <div className={styles.feedbackDetail}>
                        Redirecting to login in {redirectCountdown}s...
                      </div>
                    </div>
                  )}

                  <motion.div className={styles.inputGroup}>
                    <FaUser className={styles.inputIcon} />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={styles.input}
                      required
                      aria-label="Full name"
                    />
                  </motion.div>

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

                  <motion.div className={styles.inputGroup}>
                    <FaLock className={styles.inputIcon} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className={styles.input}
                      required
                      minLength={MIN_PASSWORD_LENGTH}
                      maxLength={MAX_PASSWORD_LENGTH}
                      aria-label="Password"
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
                    disabled={isLoading || !isFormValid || Boolean(success)}
                  >
                    {isLoading && <span className={styles.loadingSpinner} />}
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </motion.button>
                </form>

                <p className={styles.switchText}>
                  Already have an account?{' '}
                  <Link to="/login" className={styles.switchLink}>
                    Sign in here
                  </Link>
                </p>
              </AuthCard>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
