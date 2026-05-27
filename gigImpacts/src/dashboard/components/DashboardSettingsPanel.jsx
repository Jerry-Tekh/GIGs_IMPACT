import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaKey, FaShieldAlt, FaSignOutAlt, FaTimes, FaUserCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from './../../utils/apiClient.js';


import { clearCsrfToken } from './../../utils/csrf.js';
import { logoutUser, notifyAuthChanged } from './../../utils/auth.js';
import styles from './DashboardSettingsPanel.module.css';

const initialPasswordState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

const initialMfaDisableState = {
  password: ''
};

const DashboardSettingsPanel = ({ isOpen, onClose, user, onUserUpdated }) => {
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState(user?.name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [passwordForm, setPasswordForm] = useState(initialPasswordState);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [mfaStatus, setMfaStatus] = useState(null);
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [mfaSetup, setMfaSetup] = useState(null);
  const [mfaOtp, setMfaOtp] = useState('');
  const [mfaVerifyError, setMfaVerifyError] = useState('');
  const [mfaVerifyMessage, setMfaVerifyMessage] = useState('');
  const [isSavingMfa, setIsSavingMfa] = useState(false);
  const [disableMfaForm, setDisableMfaForm] = useState(initialMfaDisableState);

  const [activeSessions, setActiveSessions] = useState([]);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  useEffect(() => {
    setProfileName(user?.name || '');
  }, [user?.name]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadSecurityState = async () => {
      try {
        setIsLoadingSecurity(true);
        setSecurityError('');

        const [mfaPayload, sessionsPayload] = await Promise.all([
          apiFetch('/api/auth/mfa/status', { method: 'GET', requireAuth: true }),
          apiFetch('/api/auth/active-sessions', { method: 'GET', requireAuth: true })
        ]);

        setMfaStatus(mfaPayload?.data || null);
        setActiveSessions(sessionsPayload?.data?.sessions || []);
      } catch (error) {
        console.error(error);
        setSecurityError(error?.payload?.message || error.message || 'Unable to load security settings right now.');
      } finally {
        setIsLoadingSecurity(false);
      }
    };

    loadSecurityState();
  }, [isOpen]);

  const initials = useMemo(() => {
    const name = user?.name?.trim() || user?.email || 'User';
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
  }, [user?.email, user?.name]);

  const refreshSecurityState = async () => {
    const [mfaPayload, sessionsPayload] = await Promise.all([
      apiFetch('/api/auth/mfa/status', { method: 'GET', requireAuth: true }),
      apiFetch('/api/auth/active-sessions', { method: 'GET', requireAuth: true })
    ]);

    setMfaStatus(mfaPayload?.data || null);
    setActiveSessions(sessionsPayload?.data?.sessions || []);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError('');
    setProfileMessage('');
    setIsSavingProfile(true);

    try {
      await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        requireAuth: true,
        body: JSON.stringify({ fullName: profileName })
      });

      setProfileMessage('Your profile name has been updated.');
      await onUserUpdated?.();
    } catch (error) {
      console.error(error);
      setProfileError(error?.payload?.message || error.message || 'Unable to update your profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Your new password confirmation does not match.');
      return;
    }

    setIsSavingPassword(true);

    try {
      const payload = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      setPasswordMessage(payload?.message || 'Password changed successfully.');
      setPasswordForm(initialPasswordState);
      clearCsrfToken();
      notifyAuthChanged();
      navigate('/login', {
        replace: true,
        state: {
          feedback: {
            message: payload?.message || 'Password changed successfully. Please sign in again.'
          }
        }
      });
    } catch (error) {
      console.error(error);
      setPasswordError(error?.payload?.message || error.message || 'Unable to change your password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleStartMfaSetup = async () => {
    setIsSavingMfa(true);
    setMfaVerifyError('');
    setMfaVerifyMessage('');

    try {
      const payload = await apiFetch('/api/auth/mfa/enable', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({})
      });

      setMfaSetup({
        qrCode: payload.qrCode,
        backupCodes: payload.backupCodes || []
      });
      setMfaVerifyMessage('Scan the QR code, save your backup codes, then enter a 6-digit authenticator code below.');
    } catch (error) {
      console.error(error);
      setMfaVerifyError(error?.payload?.message || error.message || 'Unable to start MFA setup.');
    } finally {
      setIsSavingMfa(false);
    }
  };

  const handleVerifyMfaSetup = async (event) => {
    event.preventDefault();
    setMfaVerifyError('');
    setMfaVerifyMessage('');
    setIsSavingMfa(true);

    try {
      const payload = await apiFetch('/api/auth/mfa/verify', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({ otp: mfaOtp })
      });

      setMfaSetup(null);
      setMfaOtp('');
      setMfaVerifyMessage(payload?.message || 'MFA enabled successfully.');
      await refreshSecurityState();
      await onUserUpdated?.();
    } catch (error) {
      console.error(error);
      setMfaVerifyError(error?.payload?.message || error.message || 'Unable to verify MFA setup.');
    } finally {
      setIsSavingMfa(false);
    }
  };

  const handleDisableMfa = async (event) => {
    event.preventDefault();
    setMfaVerifyError('');
    setMfaVerifyMessage('');
    setIsSavingMfa(true);

    try {
      const payload = await apiFetch('/api/auth/mfa/disable', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({
          password: disableMfaForm.password
        })
      });

      setDisableMfaForm(initialMfaDisableState);
      setMfaSetup(null);
      setMfaOtp('');
      setMfaVerifyMessage(payload?.message || 'MFA disabled successfully.');
      await refreshSecurityState();
      await onUserUpdated?.();
    } catch (error) {
      console.error(error);
      setMfaVerifyError(error?.payload?.message || error.message || 'Unable to disable MFA.');
    } finally {
      setIsSavingMfa(false);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    try {
      const payload = await apiFetch('/api/auth/logout-all', {
        method: 'POST',
        requireAuth: true
      });

      clearCsrfToken();
      notifyAuthChanged();
      navigate('/login', {
        replace: true,
        state: {
          feedback: {
            message: payload?.message || 'You have been signed out of all sessions.'
          }
        }
      });
    } catch (error) {
      console.error(error);
      setSecurityError(error?.payload?.message || error.message || 'Unable to sign out of all sessions.');
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  const handleLogoutCurrent = async () => {
    try {
      await logoutUser();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error(error);
      navigate('/login', { replace: true });
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={styles.panel}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            aria-label="Account settings"
          >
            <div className={styles.panelHeader}>
              <div className={styles.panelIdentity}>
                <div className={styles.avatar}>{initials}</div>
                <div>
                  <p className={styles.eyebrow}>Account Center</p>
                  <h2>{user?.name || 'Dashboard user'}</h2>
                  <span>{user?.email}</span>
                </div>
              </div>
              <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close settings">
                <FaTimes />
              </button>
            </div>

            <div className={styles.panelBody}>
              <section className={styles.sectionCard}>
                <div className={styles.sectionTitle}>
                  <FaUserCircle />
                  <div>
                    <h3>Profile</h3>
                    <p>Keep your account details current across the dashboard.</p>
                  </div>
                </div>

                <form className={styles.formStack} onSubmit={handleProfileSubmit}>
                  {profileMessage && <div className={styles.successNotice}>{profileMessage}</div>}
                  {profileError && <div className={styles.errorNotice}>{profileError}</div>}
                  <label className={styles.field}>
                    <span>Full name</span>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(event) => setProfileName(event.target.value)}
                      placeholder="Enter your full name"
                      maxLength={100}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Email address</span>
                    <input type="email" value={user?.email || ''} disabled />
                  </label>
                  <label className={styles.field}>
                    <span>Role</span>
                    <input type="text" value={user?.role || ''} disabled />
                  </label>
                  <button type="submit" className={styles.primaryBtn} disabled={isSavingProfile}>
                    {isSavingProfile ? 'Saving profile...' : 'Save profile'}
                  </button>
                </form>
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.sectionTitle}>
                  <FaShieldAlt />
                  <div>
                    <h3>Multi-Factor Authentication</h3>
                    <p>Protect privileged dashboard access with a time-based authenticator app.</p>
                  </div>
                </div>

                {isLoadingSecurity ? <div className={styles.infoNotice}>Loading security settings...</div> : null}
                {securityError && <div className={styles.errorNotice}>{securityError}</div>}
                {mfaVerifyMessage && <div className={styles.successNotice}>{mfaVerifyMessage}</div>}
                {mfaVerifyError && <div className={styles.errorNotice}>{mfaVerifyError}</div>}

                <div className={styles.statusRow}>
                  <div>
                    <strong>{mfaStatus?.mfaEnabled ? 'MFA is enabled' : 'MFA is not enabled yet'}</strong>
                    <p>
                      {mfaStatus?.mfaEnabled
                        ? `${mfaStatus?.backupCodesRemaining ?? 0} backup codes remaining.`
                        : 'Admins and authors should complete MFA to avoid privileged-route access errors.'}
                    </p>
                  </div>
                  {!mfaStatus?.mfaEnabled ? (
                    <button type="button" className={styles.primaryBtn} onClick={handleStartMfaSetup} disabled={isSavingMfa}>
                      <FaShieldAlt />
                      <span>{isSavingMfa ? 'Preparing MFA...' : 'Enable MFA'}</span>
                    </button>
                  ) : null}
                </div>

                {mfaSetup ? (
                  <div className={styles.mfaSetupBox}>
                    <div className={styles.qrBlock}>
                      <img src={mfaSetup.qrCode} alt="MFA QR code" className={styles.qrImage} />
                    </div>
                    <div className={styles.codesBlock}>
                      <h4>Backup codes</h4>
                      <p>Store these once-only recovery codes somewhere safe. They will not be shown again.</p>
                      <div className={styles.codeGrid}>
                        {mfaSetup.backupCodes.map((code) => (
                          <span key={code} className={styles.codePill}>{code}</span>
                        ))}
                      </div>
                    </div>
                    <form className={styles.inlineForm} onSubmit={handleVerifyMfaSetup}>
                      <label className={styles.field}>
                        <span>Authenticator code</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={mfaOtp}
                          onChange={(event) => setMfaOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit code"
                        />
                      </label>
                      <button type="submit" className={styles.primaryBtn} disabled={isSavingMfa}>
                        {isSavingMfa ? 'Verifying...' : 'Verify and activate MFA'}
                      </button>
                    </form>
                  </div>
                ) : null}

                {mfaStatus?.mfaEnabled ? (
                  <form className={styles.securityActionCard} onSubmit={handleDisableMfa}>
                    <div className={styles.securityActionHeader}>
                      <div>
                        <strong>Disable MFA</strong>
                        <p>Confirm with your current password before turning off extra protection.</p>
                      </div>
                      <span className={styles.securityActionBadge}>Security action</span>
                    </div>
                    <label className={styles.field}>
                      <span>Current password</span>
                      <input
                        type="password"
                        value={disableMfaForm.password}
                        onChange={(event) => setDisableMfaForm({ password: event.target.value })}
                        placeholder="Current password"
                      />
                    </label>
                    <button type="submit" className={styles.dangerBtn} disabled={isSavingMfa}>
                      <FaShieldAlt />
                      <span>{isSavingMfa ? 'Disabling...' : 'Disable MFA'}</span>
                    </button>
                  </form>
                ) : null}
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.sectionTitle}>
                  <FaKey />
                  <div>
                    <h3>Password</h3>
                    <p>Changing your password signs you out everywhere for safety.</p>
                  </div>
                </div>

                <form className={styles.formStack} onSubmit={handlePasswordSubmit}>
                  {passwordMessage && <div className={styles.successNotice}>{passwordMessage}</div>}
                  {passwordError && <div className={styles.errorNotice}>{passwordError}</div>}
                  <label className={styles.field}>
                    <span>Current password</span>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>New password</span>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Confirm new password</span>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    />
                  </label>
                  <button type="submit" className={styles.primaryBtn} disabled={isSavingPassword}>
                    {isSavingPassword ? 'Updating password...' : 'Change password'}
                  </button>
                </form>
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.sectionTitle}>
                  <FaSignOutAlt />
                  <div>
                    <h3>Sessions</h3>
                    <p>Review your active sessions and revoke all devices if needed.</p>
                  </div>
                </div>

                <div className={styles.sessionSummary}>
                  <strong>{activeSessions.length}</strong>
                  <span>active session{activeSessions.length === 1 ? '' : 's'}</span>
                </div>

                <div className={styles.sessionList}>
                  {activeSessions.slice(0, 4).map((session) => (
                    <div key={session.id} className={styles.sessionItem}>
                      <div>
                        <strong>{session.device || 'Unknown device'}</strong>
                        <p>{session.ipAddress || 'Unknown IP'} · {session.riskLevel || 'standard'} risk</p>
                      </div>
                      <span>{session.isVerified ? 'Verified' : 'Pending'}</span>
                    </div>
                  ))}
                </div>

                <button type="button" className={styles.dangerBtn} onClick={handleLogoutAll} disabled={isLoggingOutAll}>
                  {isLoggingOutAll ? 'Signing out all sessions...' : 'Log out all devices'}
                </button>
              </section>

              <button type="button" className={styles.secondaryBtn} onClick={handleLogoutCurrent}>
                Log out this device
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default DashboardSettingsPanel;
