import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';

import styles from './Auth.module.css';

import Header from './../components/Header.jsx';
import Footer from './../components/Footer.jsx';


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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - redirect to login or dashboard
        navigate('/login');
      } else {
        // Error
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.signupWraper}>

      <Header />  
    <AuthCard
      title="Join GigImpact"
      subtitle="Create your account to get started"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <motion.div
          className={styles.inputGroup}
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
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

        <motion.div
          className={styles.inputGroup}
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FaLock className={styles.inputIcon} />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={styles.input}
            required
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
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading && <span className={styles.loadingSpinner}></span>}
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
    <Footer />
    </div>
  );
};

export default Signup;