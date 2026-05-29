import nodemailer from 'nodemailer';
import dns from 'node:dns';
import 'dotenv/config';

dns.setDefaultResultOrder('ipv4first');

const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecureValue = process.env.SMTP_SECURE ?? process.env.SMPT_SECURE;
const smtpSecure = smtpSecureValue
  ? String(smtpSecureValue).toLowerCase() === 'true'
  : smtpPort === 465;

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpSecure,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password
  },
});
