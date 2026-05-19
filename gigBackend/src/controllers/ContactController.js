import { transporter } from '../config/mailer.js';
import {
  validateContactSubmission,
  validateVolunteerSubmission
} from '../utils/validateInput.js';

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const sanitizeHeaderValue = (value = '') => String(value).replace(/[\r\n]+/g, ' ').trim();
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const HONEYPOT_FIELDS = ['website', 'companyWebsite'];

const verifyRecaptchaToken = async (token, remoteIp) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    const error = new Error('reCAPTCHA secret key is not configured.');
    error.statusCode = 500;
    throw error;
  }

  if (!token || typeof token !== 'string') {
    return false;
  }

  const response = await fetch(RECAPTCHA_VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      secret,
      response: token.trim(),
      ...(remoteIp ? { remoteip: remoteIp } : {})
    })
  });

  if (!response.ok) {
    const error = new Error('reCAPTCHA verification failed.');
    error.statusCode = 502;
    throw error;
  }

  const payload = await response.json().catch(() => null);
  return Boolean(payload?.success);
};

const hasTriggeredHoneypot = (body = {}) =>
  HONEYPOT_FIELDS.some((field) => typeof body?.[field] === 'string' && body[field].trim() !== '');

const createEmailShell = ({ title, subtitle, body, footerNote = 'GIGs Impact Community' }) => `
  <div style="margin:0;padding:32px 16px;background:#f4f7ff;font-family:Arial,'Helvetica Neue',sans-serif;color:#1f2937;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dbe5ff;box-shadow:0 18px 40px rgba(11,29,102,0.08);">
      <div style="padding:28px 32px;background:linear-gradient(135deg,#0b1d66 0%,#1e5af3 100%);color:#ffffff;">
        <div style="display:inline-block;padding:6px 12px;background:rgba(255,219,36,0.18);border:1px solid rgba(255,219,36,0.28);font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">
          GIGs Impact
        </div>
        <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.2;">${title}</h1>
        <p style="margin:0;color:rgba(255,255,255,0.84);font-size:15px;line-height:1.7;">${subtitle}</p>
      </div>
      <div style="padding:30px 32px;">
        ${body}
      </div>
      <div style="padding:20px 32px;background:#f8fbff;border-top:1px solid #e5edff;color:#64748b;font-size:13px;line-height:1.7;">
        <p style="margin:0 0 6px;"><strong style="color:#0b1d66;">${footerNote}</strong></p>
        <p style="margin:0;">This is an official message from the GIGs Impact website response system.</p>
      </div>
    </div>
  </div>
`;

const createInfoRows = (rows) => `
  <div style="margin:22px 0 0;border:1px solid #e2e8f0;background:#f8fafc;">
    ${rows
      .map(
        ({ label, value }, index) => `
          <div style="padding:14px 16px;${index < rows.length - 1 ? 'border-bottom:1px solid #e2e8f0;' : ''}">
            <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;font-weight:700;">${label}</p>
            <p style="margin:0;color:#111827;font-size:15px;line-height:1.6;">${value}</p>
          </div>
        `
      )
      .join('')}
  </div>
`;

export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message, recaptchaToken } = req.body;

    const isRecaptchaValid = await verifyRecaptchaToken(recaptchaToken, req.ip);
    if (!isRecaptchaValid) {
      return res.status(400).json({
        message: 'reCAPTCHA verification failed. Please try again.'
      });
    }

    if (hasTriggeredHoneypot(req.body)) {
      return res.status(200).json({ message: 'Message sent successfully' });
    }

    const validation = validateContactSubmission({ name, email, subject, message });
    if (!validation.valid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const safeName = validation.data.name;
    const normalizedEmail = validation.data.email;
    const safeEmail = escapeHtml(normalizedEmail);
    const safeSubject = validation.data.subject;
    const safeMessage = validation.data.message;
    const subjectLine = sanitizeHeaderValue(safeSubject || 'No Subject');

    const adminMail = {
      from: `"GigImpact Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact Message: ${subjectLine}`,
      html: `
        <h2>New Message from GigImpact Website</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `
    };

    const userMail = {
      from: `"GIGs Impact Team" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'Your message has been received by GIGs Impact',
      html: createEmailShell({
        title: 'Thank you for reaching out',
        subtitle: 'Your message is safely in our inbox and our team will review it with care.',
        body: `
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#334155;">Hello ${safeName},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#334155;">
            Thank you for contacting GIGs Impact. We appreciate your message and the time you took to share it with us.
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#334155;">
            A member of our team will review your enquiry and get back to you as soon as possible with a warm and helpful response.
          </p>
          <p style="margin:22px 0 10px;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#0b1d66;">Your submission summary</p>
          ${createInfoRows([
            { label: 'Name', value: safeName },
            { label: 'Email', value: safeEmail },
            { label: 'Subject', value: safeSubject || 'General enquiry' }
          ])}
          <p style="margin:24px 0 0;font-size:15px;line-height:1.8;color:#334155;">
            With appreciation,<br />
            <strong style="color:#0b1d66;">GIGs Impact Team</strong>
          </p>
        `
      })
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

export const sendVolunteerEmail = async (req, res) => {
  try {
    const { fullName, email, phone, skills, contributionType, recaptchaToken } = req.body;

    const isRecaptchaValid = await verifyRecaptchaToken(recaptchaToken, req.ip);
    if (!isRecaptchaValid) {
      return res.status(400).json({
        message: 'reCAPTCHA verification failed. Please try again.'
      });
    }

    if (hasTriggeredHoneypot(req.body)) {
      return res.status(200).json({ message: 'Application sent successfully' });
    }

    const validation = validateVolunteerSubmission({
      fullName,
      email,
      phone,
      skills,
      contributionType
    });

    if (!validation.valid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const safeFullName = validation.data.fullName;
    const normalizedEmail = validation.data.email;
    const safeEmail = escapeHtml(normalizedEmail);
    const safePhone = validation.data.phone;
    const safeSkills = validation.data.skills;
    const safeContributionType = validation.data.contributionType;
    const subjectLine = sanitizeHeaderValue(safeFullName);

    const adminMail = {
      from: `"GigImpact Volunteer Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Volunteer Application - ${subjectLine}`,
      html: `
        <h2>New Volunteer Application</h2>
        <p><strong>Full Name:</strong> ${safeFullName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>Skills:</strong> ${safeSkills}</p>
        <p><strong>Contribution Type:</strong> ${safeContributionType}</p>
        <hr/>
        <p>This message was sent from the GigImpact website.</p>
      `
    };

    const userMail = {
      from: `"GIGs Impact Team" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'Your GIGs Impact volunteer application has been received',
      html: createEmailShell({
        title: 'Volunteer application received',
        subtitle: 'Thank you for offering your time, skills, and energy to support the GIGs Impact mission.',
        body: `
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#334155;">Hello ${safeFullName},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#334155;">
            We are grateful for your willingness to volunteer with GIGs Impact. Your application has been received successfully and will be reviewed by our team.
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#334155;">
            If your profile matches an immediate need, we will follow up with the next steps and any additional information we may need from you.
          </p>
          <p style="margin:22px 0 10px;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#0b1d66;">Application summary</p>
          ${createInfoRows([
            { label: 'Full name', value: safeFullName },
            { label: 'Email', value: safeEmail },
            { label: 'Phone', value: safePhone },
            { label: 'Skills', value: safeSkills },
            { label: 'Contribution area', value: safeContributionType }
          ])}
          <p style="margin:24px 0 0;font-size:15px;line-height:1.8;color:#334155;">
            Warm regards,<br />
            <strong style="color:#0b1d66;">GIGs Impact Team</strong>
          </p>
        `
      })
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);

    res.status(200).json({ message: 'Application sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send application' });
  }
};
