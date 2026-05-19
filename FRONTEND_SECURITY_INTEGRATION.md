# Frontend Integration Guide for New Security Features

## Overview
The backend has been updated with enhanced security features. This guide shows how to integrate these changes on the frontend.

## 1. Registration Flow

### Changes from Previous Implementation
- **Before**: User could login immediately after registration
- **Now**: User must verify email before login

### Registration Endpoint (Unchanged Route)
```javascript
POST /auth/register

Request:
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "MySecure@Pass123"
}

Success Response (201):
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "verified": false  // NEW: Always false on registration
  }
}

Validation Error (400):
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Name: Name must be at least 2 characters long",
    "Email: Invalid email format",
    "Password: Password must contain at least one uppercase letter"
  ]
}
```

### Frontend Handling
```javascript
// Registration form submit
const handleRegister = async (formData) => {
  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include' // For cookies
    });

    const data = await response.json();

    if (!response.ok) {
      // Show validation errors
      if (data.errors && Array.isArray(data.errors)) {
        data.errors.forEach(error => {
          console.error(error); // "Name: ...", "Email: ...", "Password: ..."
          // Display in form below relevant field
        });
      }
      return;
    }

    // Success: Show verification pending message
    console.log('Registration successful!');
    console.log(`Please verify your email: ${data.data.email}`);
    
    // Redirect to verification page or show message
    // User will receive email with verification link
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

## 2. Email Verification Flow

### New Endpoint: Verify Email
```javascript
POST /auth/verify-email/:token

// Token comes from email link:
// https://yourfrontend.com/verify-email/abc123def456...

Response (200):
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}

Error Response (400):
{
  "success": false,
  "message": "Verification token has expired. Please request a new one."
  // OR
  // "message": "Invalid verification token"
}
```

### Frontend Implementation

**Step 1: Create Verification Page Component**
```javascript
// pages/VerifyEmail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const { token } = useParams(); // From URL: /verify-email/:token
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch(`/auth/verify-email/${token}`, {
          method: 'POST',
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified! Redirecting to login...');
          // Redirect to login after 3 seconds
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    if (token) {
      verify();
    }
  }, [token, navigate]);

  return (
    <div className="verify-email-container">
      {status === 'verifying' && <p>Verifying your email...</p>}
      
      {status === 'success' && (
        <div className="success">
          ✅ {message}
        </div>
      )}
      
      {status === 'error' && (
        <div className="error">
          ❌ {message}
          <button onClick={() => navigate('/register')}>
            Request new verification link
          </button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Update Router**
```javascript
// routes/index.jsx or App.jsx
import VerifyEmail from '../pages/VerifyEmail';

// Add route
<Route path="/verify-email/:token" element={<VerifyEmail />} />
```

**Step 3: Update Registration Success Page**
```javascript
export function RegistrationSuccess({ email }) {
  return (
    <div className="registration-success">
      <h2>✅ Registration Successful!</h2>
      <p>We've sent a verification email to:</p>
      <p className="email">{email}</p>
      <p>Click the verification link in your email to complete registration.</p>
      <p className="note">
        The link expires in <strong>24 hours</strong>.
      </p>
      <p className="help">
        Didn't receive the email? Check your spam folder or request a new verification link.
      </p>
    </div>
  );
}
```

## 3. Login Flow (Updated)

### Login Endpoint (Mostly Unchanged)
```javascript
POST /auth/login

Request:
{
  "email": "john@example.com",
  "password": "MySecure@Pass123"
}

Success Response (200):
{
  "success": true,
  "message": "Login successful",
  "csrfToken": "...",
  "data": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "reader"
  }
}

// NEW: Unverified Email Error
Unverified Email Response (403):
{
  "success": false,
  "message": "Please verify your email address before logging in",
  "requiresVerification": true  // NEW FLAG
}

// Existing: Invalid Credentials Error
Invalid Credentials Response (401):
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Frontend Handling (Updated)
```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      // NEW: Check for unverified email
      if (data.requiresVerification) {
        // Show message and link to request new verification
        showError(
          'Please verify your email address before logging in. ' +
          'Check your email for a verification link.'
        );
        
        // Optionally: Show option to request new verification email
        return;
      }

      // Existing: Invalid credentials
      showError(data.message);
      return;
    }

    // Success: Store token and redirect
    localStorage.setItem('csrfToken', data.csrfToken);
    // Set cookies are handled automatically
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

## 4. Password Validation Display

### Form Validation Feedback
```javascript
function PasswordInput({ value, onChange }) {
  const [feedback, setFeedback] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
    isLongEnough: false
  });

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    onChange(pwd);

    setFeedback({
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasNumbers: /\d/.test(pwd),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      isLongEnough: pwd.length >= 8
    });
  };

  const isValid = Object.values(feedback).every(v => v);

  return (
    <div className="password-input-group">
      <input
        type="password"
        value={value}
        onChange={handlePasswordChange}
        placeholder="Enter password"
      />
      
      <div className="password-requirements">
        <p className={feedback.isLongEnough ? 'valid' : 'invalid'}>
          {feedback.isLongEnough ? '✅' : '❌'} At least 8 characters
        </p>
        <p className={feedback.hasUpperCase ? 'valid' : 'invalid'}>
          {feedback.hasUpperCase ? '✅' : '❌'} One uppercase letter (A-Z)
        </p>
        <p className={feedback.hasLowerCase ? 'valid' : 'invalid'}>
          {feedback.hasLowerCase ? '✅' : '❌'} One lowercase letter (a-z)
        </p>
        <p className={feedback.hasNumbers ? 'valid' : 'invalid'}>
          {feedback.hasNumbers ? '✅' : '❌'} One number (0-9)
        </p>
        <p className={feedback.hasSpecialChar ? 'valid' : 'invalid'}>
          {feedback.hasSpecialChar ? '✅' : '❌'} One special character (!@#$%^&* etc.)
        </p>
      </div>

      <button disabled={!isValid}>
        Register
      </button>
    </div>
  );
}
```

## 5. Error Display

### Display Validation Errors from Backend
```javascript
function RegistrationForm() {
  const [errors, setErrors] = useState({});

  const handleSubmit = async (formData) => {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok && data.errors) {
      // Parse errors by field
      const fieldErrors = {};
      data.errors.forEach(error => {
        // Error format: "FieldName: error message"
        const [field, message] = error.split(': ');
        const fieldKey = field.toLowerCase();
        fieldErrors[fieldKey] = message;
      });
      setErrors(fieldErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <input type="text" name="full_name" placeholder="Full Name" />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <input type="email" name="email" placeholder="Email" />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <input type="password" name="password" placeholder="Password" />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <button type="submit">Register</button>
    </form>
  );
}
```

## 6. Email Templates

### What Users Will Receive
Email Subject: **"Verify your GIGs Impact email address"**

Email Body:
```
Hello [User's Name],

Thank you for signing up with GIGs Impact! To complete your registration, 
please verify your email address by clicking the button below.

[VERIFY EMAIL ADDRESS BUTTON]

Or copy and paste this link in your browser:
https://yourdomain.com/verify-email/token123...

This link will expire in 24 hours. After that, you'll need to request 
a new verification email.

Note: You won't be able to log in to your account until you verify 
your email address.

If you didn't create this account, you can safely ignore this email.

Best regards,
GIGs Impact Team
```

## 7. Environmental Setup

### No New Dependencies Required
All dependencies already in package.json:
- `validator` (v13.15.35) - For email validation
- `bcrypt` (v6.0.0) - Already used for passwords
- `crypto` - Node.js built-in

### Environment Variables (Already Set)
```
CLIENT_ORIGIN=http://localhost:5173  # Used for email verification link
EMAIL_USER=your-email@gmail.com      # Email sender
```

## 8. Testing Checklist for Frontend

### Registration
- [ ] Form shows password requirements in real-time
- [ ] Cannot submit until all requirements met
- [ ] Name validation errors shown (XSS attempt rejected)
- [ ] Email validation errors shown
- [ ] Success shows verification pending message
- [ ] Email received with verification link

### Email Verification
- [ ] Clicking email link loads verification page
- [ ] "Verifying..." message shown briefly
- [ ] Success page shown with redirect to login
- [ ] Expired token shows error message
- [ ] Invalid token shows error message

### Login
- [ ] Can't login with unverified email
- [ ] Error message: "Please verify your email address"
- [ ] After verification, login succeeds
- [ ] CSRF token updated (if using token-based approach)

### Password
- [ ] Invalid password shows all failing requirements
- [ ] Valid password allows form submission
- [ ] Common passwords like "Welcome@123" are accepted

## 9. Backward Compatibility Notes

### For Existing Users
- Users created before update will have `verified = NULL`
- They will need to:
  1. Request password reset to get verification email
  2. OR admin can set `verified = true` for existing users
  3. OR frontend can prompt for re-verification

### Database Considerations
```sql
-- Option 1: Mark all existing users as verified
UPDATE users SET verified = true WHERE verified IS NULL;

-- Option 2: Check for unverified users
SELECT COUNT(*) FROM users WHERE verified = false;

-- Option 3: Find users created before migration
SELECT id, email, created_at FROM users 
WHERE created_at < '2024-01-01'  -- adjust date
AND verified = false;
```

## 10. Support & Troubleshooting

### Common Issues

**"Email not received"**
- Check spam/junk folder
- Verify email address was typed correctly
- Check EMAIL_USER and EMAIL_PASS in .env

**"Token expired"**
- Tokens expire after 24 hours
- User must register again or request new email
- (Optional: Implement "Resend Verification Email" endpoint)

**"Verification link doesn't work"**
- Ensure CLIENT_ORIGIN in .env matches frontend URL
- Check token is passed correctly to endpoint
- Verify database migration ran successfully

---

## Quick Reference: Updated API Endpoints

| Method | Endpoint | Change | Auth Required |
|--------|----------|--------|---------------|
| POST | `/auth/register` | Now requires email verification | No |
| POST | `/auth/verify-email/:token` | **NEW ENDPOINT** | No |
| POST | `/auth/login` | Checks if email verified | No |
| POST | `/auth/refresh` | Unchanged | No |
| POST | `/auth/logout` | Unchanged | Yes |
| POST | `/auth/logout-all` | Unchanged | Yes |
| GET | `/auth/me` | Unchanged | Yes |
| GET | `/auth/active-sessions` | Unchanged | Yes |

---

## Need Help?

See the comprehensive implementation document: 
`gigBackend/SECURITY_IMPLEMENTATION_COMPLETE.md`

---
