import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ForgotPassword from './ForgotPassword';
import styles from './Auth.module.css';
import { getDashboardPath, notifyAuthChanged } from '../utils/auth.js';

const loginBenefits = [
  'Manage blog publishing and editorial updates',
  'Keep your posts, drafts, and workflows in one place',
  'Stay connected to the same impact-focused platform design'
];

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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const isFormValid = formData.email.trim() !== '' && formData.password.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        notifyAuthChanged();
        navigate(getDashboardPath(data?.data?.role));
      } else {
        setError(data.message || 'Login failed. Please try again.');
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

                  <motion.button type="submit" className={styles.submitBtn} disabled={isLoading || !isFormValid}>
                    {isLoading && <span className={styles.loadingSpinner} />}
                    {isLoading ? 'Signing In...' : 'Sign In'}
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
