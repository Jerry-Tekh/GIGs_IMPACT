import validator from 'validator';

/**
 * Validate password strength
 * Requires: uppercase, lowercase, numbers, special characters
 * Length: 8-100 characters
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 100) {
    errors.push('Password must not exceed 100 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate and sanitize full name
 * - Required, non-empty after trim
 * - Length: 2-100 characters
 * - Allowed characters: letters, spaces, hyphens, apostrophes
 */
export const validateFullName = (fullName) => {
  const errors = [];

  if (!fullName?.trim()) {
    return { valid: false, errors: ['Name is required'], sanitized: null };
  }

  const trimmedName = fullName.trim();

  if (trimmedName.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (trimmedName.length > 100) {
    errors.push('Name must not exceed 100 characters');
  }

  // Only allow letters (including unicode), spaces, hyphens, and apostrophes
  if (!/^[\p{L}\s'-]+$/u.test(trimmedName)) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
  }

  // Prevent names that are only whitespace or special characters
  if (!/[a-zA-Z\p{L}]/u.test(trimmedName)) {
    errors.push('Name must contain at least one letter');
  }

  const sanitized = errors.length === 0 
    ? validator.escape(trimmedName)
    : null;

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Validate email address
 * - Proper email format validation
 * - Normalize to lowercase and trim
 * - Optionally check against disposable email domains
 */
export const validateEmail = (email, checkDisposable = false) => {
  const errors = [];

  if (!email?.trim()) {
    return { valid: false, errors: ['Email is required'], normalized: null };
  }

  const trimmedEmail = email.trim();

  if (!validator.isEmail(trimmedEmail)) {
    errors.push('Invalid email format');
  }

  if (trimmedEmail.length > 255) {
    errors.push('Email address is too long');
  }

  const normalized = trimmedEmail.toLowerCase();

  // Optional: Check against common disposable email domains
  if (checkDisposable) {
    const disposableDomains = [
      'tempmail.com',
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'throwaway.email',
      'tempmail.io',
      'temp-mail.org',
      'spam4.me',
      'fakeinbox.com',
      'mockemail.com'
    ];

    const domain = normalized.split('@')[1];
    if (disposableDomains.includes(domain)) {
      errors.push('Disposable email addresses are not allowed');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized: errors.length === 0 ? normalized : null
  };
};

/**
 * Comprehensive input validation for user registration
 * Returns object with all validation results
 */
export const validateRegistrationInput = (fullName, email, password, checkDisposableEmails = false) => {
  const nameValidation = validateFullName(fullName);
  const emailValidation = validateEmail(email, checkDisposableEmails);
  const passwordValidation = validatePassword(password);

  const allErrors = [
    ...nameValidation.errors.map(e => `Name: ${e}`),
    ...emailValidation.errors.map(e => `Email: ${e}`),
    ...passwordValidation.errors.map(e => `Password: ${e}`)
  ];

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    data: {
      fullName: nameValidation.sanitized,
      email: emailValidation.normalized,
      password
    }
  };
};

const buildTextValidationResult = (value, fieldName, { min = 1, max, pattern, patternMessage }) => {
  const errors = [];

  if (typeof value !== 'string' || !value.trim()) {
    return { valid: false, errors: [`${fieldName} is required`], sanitized: null };
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length < min) {
    errors.push(`${fieldName} must be at least ${min} characters long`);
  }

  if (max && trimmedValue.length > max) {
    errors.push(`${fieldName} must not exceed ${max} characters`);
  }

  if (pattern && !pattern.test(trimmedValue)) {
    errors.push(patternMessage || `${fieldName} contains invalid characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? validator.escape(trimmedValue) : null
  };
};

export const validateContactSubject = (subject) =>
  buildTextValidationResult(subject, 'Subject', {
    min: 2,
    max: 120,
    pattern: /^[\p{L}\p{N}\s.,!?'"()\-:&/]+$/u,
    patternMessage: 'Subject contains invalid characters'
  });

export const validateContactMessage = (message) =>
  buildTextValidationResult(message, 'Message', {
    min: 10,
    max: 2000
  });

export const validatePhoneNumber = (phone) => {
  const errors = [];

  if (typeof phone !== 'string' || !phone.trim()) {
    return { valid: false, errors: ['Phone is required'], sanitized: null };
  }

  const normalizedPhone = phone.trim().replace(/\s+/g, ' ');
  const digitsOnly = normalizedPhone.replace(/\D/g, '');

  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    errors.push('Phone must contain between 7 and 15 digits');
  }

  if (!/^[+\d\s()-]+$/.test(normalizedPhone)) {
    errors.push('Phone contains invalid characters');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? validator.escape(normalizedPhone) : null
  };
};

export const validateSkills = (skills) =>
  buildTextValidationResult(skills, 'Skills', {
    min: 2,
    max: 300,
    pattern: /^[\p{L}\p{N}\s.,!?'"()\-:&/+#]+$/u,
    patternMessage: 'Skills contains invalid characters'
  });

export const validateContributionType = (contributionType) => {
  if (!contributionType) {
    return { valid: true, errors: [], sanitized: 'General support' };
  }

  return buildTextValidationResult(contributionType, 'Contribution type', {
    min: 2,
    max: 100,
    pattern: /^[\p{L}\p{N}\s.,!?'"()\-:&/]+$/u,
    patternMessage: 'Contribution type contains invalid characters'
  });
};

export const validateContactSubmission = ({ name, email, subject, message }) => {
  const nameValidation = validateFullName(name);
  const emailValidation = validateEmail(email);
  const subjectValidation = validateContactSubject(subject);
  const messageValidation = validateContactMessage(message);

  const allErrors = [
    ...nameValidation.errors.map((error) => `Name: ${error}`),
    ...emailValidation.errors.map((error) => `Email: ${error}`),
    ...subjectValidation.errors.map((error) => `Subject: ${error}`),
    ...messageValidation.errors.map((error) => `Message: ${error}`)
  ];

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    data: {
      name: nameValidation.sanitized,
      email: emailValidation.normalized,
      subject: subjectValidation.sanitized,
      message: messageValidation.sanitized
    }
  };
};

export const validateVolunteerSubmission = ({ fullName, email, phone, skills, contributionType }) => {
  const nameValidation = validateFullName(fullName);
  const emailValidation = validateEmail(email);
  const phoneValidation = validatePhoneNumber(phone);
  const skillsValidation = validateSkills(skills);
  const contributionValidation = validateContributionType(contributionType);

  const allErrors = [
    ...nameValidation.errors.map((error) => `Full name: ${error}`),
    ...emailValidation.errors.map((error) => `Email: ${error}`),
    ...phoneValidation.errors.map((error) => `Phone: ${error}`),
    ...skillsValidation.errors.map((error) => `Skills: ${error}`),
    ...contributionValidation.errors.map((error) => `Contribution type: ${error}`)
  ];

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    data: {
      fullName: nameValidation.sanitized,
      email: emailValidation.normalized,
      phone: phoneValidation.sanitized,
      skills: skillsValidation.sanitized,
      contributionType: contributionValidation.sanitized
    }
  };
};
