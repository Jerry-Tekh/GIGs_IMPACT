import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ForgotPassword from './ForgotPassword';
import styles from './Auth.module.css';
import { getDashboardPath, notifyAuthChanged } from '../utils/auth.js';
import { fetchCsrfToken, setCsrfToken } from '../utils/csrf.js';

const loginBenefits = [
  'Manage blog publishing and editorial updates',
  'Keep your posts, drafts, and workflows in one place',
  'Stay connected to the same impact-focused platform design'
];

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 100;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (retryAfterSeconds <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRetryAfterSeconds((current) => (current > 1 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [retryAfterSeconds]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const isFormValid = formData.email.trim() !== '' && formData.password.trim() !== '';

  const parseRetryAfterSeconds = (retryAfterValue) => {
    if (!retryAfterValue) {
      return 0;
    }

    const directSeconds = Number(retryAfterValue);
    if (!Number.isNaN(directSeconds) && directSeconds > 0) {
      return directSeconds;
    }

    const retryAt = new Date(retryAfterValue);
    if (Number.isNaN(retryAt.getTime())) {
      return 0;
    }

    const secondsUntilRetry = Math.ceil((retryAt.getTime() - Date.now()) / 1000);
    return secondsUntilRetry > 0 ? secondsUntilRetry : 0;
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading || retryAfterSeconds > 0) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const csrfToken = await fetchCsrfToken();
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await parseResponseBody(response);

      if (response.ok) {
        setRetryAfterSeconds(0);
        setCsrfToken(data?.csrfToken || csrfToken);
        notifyAuthChanged();
        navigate(getDashboardPath(data?.data?.role));
      } else {
        if (response.status === 429) {
          const retryAfterHeader = response.headers.get('Retry-After');
          const retryDelay =
            data?.retryAfterSeconds ||
            data?.retryAfter ||
            parseRetryAfterSeconds(retryAfterHeader);

          if (retryDelay > 0) {
            setRetryAfterSeconds(retryDelay);
            setError(data.message || `Too many login attempts. Please wait ${retryDelay} seconds before trying again.`);
          } else {
            setError(data.message || 'Too many login attempts. Please try again shortly.');
          }
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className={styles.authPage}>
      <Header />
      <main className={styles.authMain}>
        <section className={styles.authHero}>
          <div className={styles.authShell}>
            <div className={styles.authCopy}>
              <span className={styles.eyebrow}>Blog Login</span>
              <h1>Access the GIGs Impact blog page.</h1>
              <p>
                Sign in to manage articles,
              publishing activity, and content flow from one place.
              </p>

              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <strong>1</strong>
                  <span>Editorial workspace</span>
                </div>
                <div className={styles.statCard}>
                  <strong>Fast</strong>
                  <span>Content access</span>
                </div>
              </div>

              <ul className={styles.featureList}>
                {loginBenefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.authPanel}>
              <div className={styles.panelIntro}>
                <span className={styles.sectionTag}>Welcome Back</span>
                <h2>Sign in to continue to your dashboard.</h2>
              </div>

              <AuthCard title="Login" subtitle="Use your registered blog admin account details.">
                <form className={styles.form} onSubmit={handleSubmit}>
                  {error && <div className={styles.error}>{error}</div>}
                  {retryAfterSeconds > 0 && (
                    <div className={styles.rateLimitNotice}>
                      Login is temporarily paused. You can try again in
                      {' '}
                      <strong>{retryAfterSeconds}s</strong>.
                    </div>
                  )}

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

                  <div className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className={styles.checkbox}
                    />
                    <label htmlFor="rememberMe" className={styles.checkboxLabel}>
                      Remember me
                    </label>
                  </div>

                  <motion.button type="submit" className={styles.submitBtn} disabled={isLoading || retryAfterSeconds > 0 || !isFormValid}>
                    {isLoading && <span className={styles.loadingSpinner} />}
                    {isLoading ? 'Signing In...' : retryAfterSeconds > 0 ? `Try again in ${retryAfterSeconds}s` : 'Sign In'}
                  </motion.button>
                </form>

                <div className={styles.loginLinks}>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className={styles.forgotPasswordLink}
                  >
                    Forgot password?
                  </button>
                </div>

                <p className={styles.switchText}>
                  Don&apos;t have an account?{' '}
                  <Link to="/signup" className={styles.switchLink}>
                    Create one here
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

export default Login;
