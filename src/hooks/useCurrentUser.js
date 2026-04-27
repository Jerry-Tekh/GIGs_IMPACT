import { useCallback, useEffect, useState } from 'react';
import { AUTH_STATE_EVENT, fetchCurrentUser } from '../utils/auth.js';

const useCurrentUser = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextUser = await fetchCurrentUser();
      setUser(nextUser);
      return nextUser;
    } catch (err) {
      setUser(null);
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const handleAuthChanged = () => {
      loadUser();
    };

    window.addEventListener(AUTH_STATE_EVENT, handleAuthChanged);
    return () => window.removeEventListener(AUTH_STATE_EVENT, handleAuthChanged);
  }, [loadUser]);

  return {
    user,
    isLoading,
    error,
    refreshUser: loadUser
  };
};

export default useCurrentUser;
