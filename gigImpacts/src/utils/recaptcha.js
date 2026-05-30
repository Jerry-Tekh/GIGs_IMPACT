const RECAPTCHA_SCRIPT_ID = 'google-recaptcha-script';
const RECAPTCHA_SCRIPT_SRC = 'https://www.google.com/recaptcha/api.js?render=explicit';

export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

let recaptchaLoadPromise = null;

export const loadRecaptchaScript = () => {
  if (!RECAPTCHA_SITE_KEY) {
    return Promise.reject(new Error('reCAPTCHA site key is not configured.'));
  }

  if (window.grecaptcha?.render) {
    return Promise.resolve(window.grecaptcha);
  }

  if (recaptchaLoadPromise) {
    return recaptchaLoadPromise;
  }

  recaptchaLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.grecaptcha), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = RECAPTCHA_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.grecaptcha);
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA.'));
    document.body.appendChild(script);
  }).catch((error) => {
    recaptchaLoadPromise = null;
    throw error;
  });

  return recaptchaLoadPromise;
};

export const preloadRecaptcha = () => {
  if (!RECAPTCHA_SITE_KEY) {
    return;
  }

  loadRecaptchaScript().catch(() => {});
};
