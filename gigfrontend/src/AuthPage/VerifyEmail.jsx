import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthCard from '../components/AuthCard';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import styles from './Auth.module.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('We are confirming your email address now.');
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const verifyAccountEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification link is incomplete. Please use the full link from your email.');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/verify-email/${token}`, {
          method: 'POST'
        });

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully. You can now log in.');
          setRedirectCountdown(4);
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed.');
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setStatus('error');
        setMessage('Network error. Please try the verification link again.');
      }
    };

    verifyAccountEmail();

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
                message: 'Email verified successfully. Sign in to continue.'
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

  return (
    <div className={styles.authPage}>
      <Header />
      <main className={styles.authMain}>
        <section className={styles.authHero}>
          <div className={styles.authShell}>
            <div className={styles.authCopy}>
              <span className={styles.eyebrow}>Email Verification</span>
              <h1>Finish setting up your GIGs Impact account.</h1>
              <p>
                Your verification link is being processed so your account can move from registration to active sign-in.
              </p>
            </div>

            <div className={styles.authPanel}>
              <div className={styles.panelIntro}>
                <span className={styles.sectionTag}>Verification Status</span>
                <h2>
                  {status === 'verifying' && 'Verifying your email'}
                  {status === 'success' && 'Email confirmed'}
                  {status === 'error' && 'Verification problem'}
                </h2>
              </div>

              <AuthCard
                title="Verify Email"
                subtitle="This keeps your account secure before login is enabled."
              >
                {status === 'verifying' && (
                  <motion.div className={styles.infoNotice}>
                    <span className={styles.loadingSpinner} />
                    <span>{message}</span>
                  </motion.div>
                )}

                {status === 'success' && (
                  <div className={styles.success}>
                    <strong>Email verified successfully.</strong>
                    <div className={styles.feedbackDetail}>{message}</div>
                    <div className={styles.feedbackDetail}>Redirecting to login in {redirectCountdown}s...</div>
                  </div>
                )}

                {status === 'error' && (
                  <div className={styles.error}>
                    <strong>We could not verify this email.</strong>
                    <div className={styles.feedbackDetail}>{message}</div>
                  </div>
                )}

                <div className={styles.authActionStack}>
                  {status !== 'success' && (
                    <Link to="/login" className={styles.secondaryAction}>
                      Go to Login
                    </Link>
                  )}
                  {status === 'error' && (
                    <Link to="/signup" className={styles.secondaryAction}>
                      Create a New Account
                    </Link>
                  )}
                </div>
              </AuthCard>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
