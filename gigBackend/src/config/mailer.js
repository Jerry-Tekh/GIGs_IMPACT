import nodemailer from 'nodemailer';
import 'dotenv/config';

const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecureValue = process.env.SMTP_SECURE ?? process.env.SMTP_SECURE;
const smtpSecure = smtpSecureValue
  ? String(smtpSecureValue).toLowerCase() === 'true'
  : smtpPort === 465;

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password
  },
});

console.log({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  user: process.env.EMAIL_USER
});