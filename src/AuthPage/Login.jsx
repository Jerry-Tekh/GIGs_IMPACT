import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaEnvelope, FaEye, FaEyeSlash, FaKey, FaLock, FaShieldAlt } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ForgotPassword from './ForgotPassword';
import styles from './Auth.module.css';
import { getDashboardPath, notifyAuthChanged } from '../utils/auth.js';
import { clearCsrfToken, fetchCsrfToken, setCsrfToken } from '../utils/csrf.js';

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
  const [feedback, setFeedback] = useState('');
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const [mfaMethod, setMfaMethod] = useState('otp');
  const [mfaValue, setMfaValue] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.feedback?.message) {
      return;
    }

    setFeedback(location.state.feedback.message);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

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
    const nextValue = type === 'checkbox'
      ? checked
      : name === 'email'
        ? value.toLowerCase()
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue
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

  const applyRateLimitFeedback = (message, retryAfterValue, fallbackMessage) => {
    const retryDelay = parseRetryAfterSeconds(retryAfterValue);

    if (retryDelay > 0) {
      setRetryAfterSeconds(retryDelay);
      setError(message || `Too many attempts. Please wait ${retryDelay} seconds before trying again.`);
      return true;
    }

    setError(message || fallbackMessage);
    return false;
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

    if (isLoading || retryAfterSeconds > 0) {
      return;
    }

    setIsLoading(true);
    setError('');
    setFeedback('');
    setMfaChallenge(null);
    setMfaValue('');
    setMfaMethod('otp');

    try {
      const loginPayload = JSON.stringify({
        email: formData.email,
        password: formData.password
      });

      const attemptLogin = async (csrfToken) => {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: loginPayload
        });

        const data = await parseResponseBody(response);
        return { response, data };
      };

      let csrfToken = await fetchCsrfToken();
      let { response, data } = await attemptLogin(csrfToken);

      if (isCsrfError(response, data)) {
        clearCsrfToken();
        csrfToken = await fetchCsrfToken({ force: true });
        ({ response, data } = await attemptLogin(csrfToken));
      }

      if (response.ok) {
        if (data?.requiresMFA && data?.mfaSessionToken) {
          setRetryAfterSeconds(0);
          setCsrfToken(csrfToken);
          setMfaChallenge({
            mfaSessionToken: data.mfaSessionToken,
            expiresAt: data.expiresAt
          });
          setFeedback(data.message || 'Finish MFA verification to complete login.');
          return;
        }

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
    } catch (error) {
      if (error?.status === 429) {
        applyRateLimitFeedback(
          error?.payload?.message || error?.message,
          error?.payload?.retryAfterSeconds || error?.payload?.retryAfter || error?.retryAfter,
          'Too many login attempts. Please try again shortly.'
        );
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaVerify = async (event) => {
    event.preventDefault();

    if (!mfaChallenge?.mfaSessionToken || isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');
    setFeedback('');

    try {
      let csrfToken = await fetchCsrfToken();
      const requestBody = {
        mfaSessionToken: mfaChallenge.mfaSessionToken,
        ...(mfaMethod === 'otp'
          ? { otp: mfaValue }
          : { backupCode: mfaValue })
      };

      const attemptVerify = async (nextCsrfToken) => {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/mfa/login-verify`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': nextCsrfToken
          },
          body: JSON.stringify(requestBody)
        });

        const data = await parseResponseBody(response);
        return { response, data };
      };

      let { response, data } = await attemptVerify(csrfToken);

      if (isCsrfError(response, data)) {
        clearCsrfToken();
        csrfToken = await fetchCsrfToken({ force: true });
        ({ response, data } = await attemptVerify(csrfToken));
      }

      if (!response.ok) {
        if (response.status === 429) {
          applyRateLimitFeedback(
            data?.message,
            data?.retryAfterSeconds || data?.retryAfter || response.headers.get('Retry-After'),
            'Too many MFA attempts. Please try again shortly.'
          );
        } else {
          setError(data?.message || 'MFA verification failed. Please try again.');
        }
        return;
      }

      setCsrfToken(data?.csrfToken || csrfToken);
      notifyAuthChanged();
      navigate(getDashboardPath(data?.data?.role));
    } catch (error) {
      console.error(error);
      if (error?.status === 429) {
        applyRateLimitFeedback(
          error?.payload?.message || error?.message,
          error?.payload?.retryAfterSeconds || error?.payload?.retryAfter || error?.retryAfter,
          'Too many MFA attempts. Please try again shortly.'
        );
      } else {
        setError('We could not verify your MFA code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <ForgotPassword
        onBackToLogin={(nextFeedback) => {
          setShowForgotPassword(false);
          setFeedback(nextFeedback || '');
        }}
      />
    );
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
                  <strong>One</strong>
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
                <h2>{mfaChallenge ? 'Verify your MFA code to finish signing in.' : 'Sign in to continue to your dashboard.'}</h2>
              </div>

              <AuthCard
                title={mfaChallenge ? 'Multi-Factor Verification' : 'Login'}
                subtitle={mfaChallenge ? 'Enter the authenticator code or a backup code tied to your account.' : 'Use your registered blog admin account details.'}
              >
                {!mfaChallenge ? (
                  <form className={styles.form} onSubmit={handleSubmit}>
                  {feedback && <div className={styles.success}>{feedback}</div>}
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
                ) : (
                  <form className={styles.form} onSubmit={handleMfaVerify}>
                    {feedback && <div className={styles.success}>{feedback}</div>}
                    {error && <div className={styles.error}>{error}</div>}
                    <div className={styles.infoNotice}>
                      <FaShieldAlt />
                      <div>
                        <strong>MFA required</strong>
                        <p className={styles.feedbackDetail}>
                          Your password was accepted. Complete MFA to unlock the dashboard and privileged tools.
                        </p>
                      </div>
                    </div>

                    <div className={styles.methodToggle}>
                      <button
                        type="button"
                        className={mfaMethod === 'otp' ? styles.methodToggleActive : styles.methodToggleBtn}
                        onClick={() => {
                          setMfaMethod('otp');
                          setMfaValue('');
                        }}
                      >
                        <FaShieldAlt /> Authenticator code
                      </button>
                      <button
                        type="button"
                        className={mfaMethod === 'backup' ? styles.methodToggleActive : styles.methodToggleBtn}
                        onClick={() => {
                          setMfaMethod('backup');
                          setMfaValue('');
                        }}
                      >
                        <FaKey /> Backup code
                      </button>
                    </div>

                    <motion.div className={styles.inputGroup}>
                      {mfaMethod === 'otp' ? <FaShieldAlt className={styles.inputIcon} /> : <FaKey className={styles.inputIcon} />}
                      <input
                        type="text"
                        name="mfaValue"
                        placeholder={mfaMethod === 'otp' ? '6-digit authenticator code' : 'Backup code'}
                        value={mfaValue}
                        onChange={(event) => {
                          const value = event.target.value;
                          setMfaValue(mfaMethod === 'otp' ? value.replace(/\D/g, '').slice(0, 6) : value.toUpperCase());
                        }}
                        className={styles.input}
                        required
                        autoComplete="one-time-code"
                      />
                    </motion.div>

                    <div className={styles.authActionStack}>
                      <motion.button type="submit" className={styles.submitBtn} disabled={isLoading || !mfaValue.trim()}>
                        {isLoading && <span className={styles.loadingSpinner} />}
                        {isLoading ? 'Verifying...' : 'Verify and continue'}
                      </motion.button>

                      <button
                        type="button"
                        className={styles.backBtn}
                        onClick={() => {
                          setMfaChallenge(null);
                          setMfaValue('');
                          setFeedback('');
                          setError('');
                        }}
                      >
                        <FaArrowLeft /> Back to login
                      </button>
                    </div>
                  </form>
                )}

                {!mfaChallenge ? (
                  <>
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
                  </>
                ) : null}
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
