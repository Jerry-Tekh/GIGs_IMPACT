import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';

import styles from './Auth.module.css';


import Header from './../components/Header.jsx';
import Footer from './../components/Footer.jsx';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - redirect to dashboard
        navigate('/admin/dashboard');
      } else {
        // Error
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <Header />
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to access your GigImpact dashboard"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <motion.div
          className={styles.inputGroup}
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
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

        <motion.div
          className={styles.inputGroup}
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
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

        <motion.button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading && <span className={styles.loadingSpinner}></span>}
          {isLoading ? 'Signing In...' : 'Sign In'}
        </motion.button>
      </form>

      <p className={styles.switchText}>
        Don't have an account?{' '}
        <Link to="/signup" className={styles.switchLink}>
          Sign up here
        </Link>
      </p>
    </AuthCard>
    <Footer />
    </div>
  );
};

export default Login;