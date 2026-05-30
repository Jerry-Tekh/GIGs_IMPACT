import sgMail from '@sendgrid/mail';
import 'dotenv/config';

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const defaultFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;

if (!sendgridApiKey) {
  throw new Error('SENDGRID_API_KEY is required to send email with SendGrid.');
}

if (!defaultFrom) {
  throw new Error('EMAIL_FROM or EMAIL_USER is required for the SendGrid sender address.');
}

sgMail.setApiKey(sendgridApiKey);

const toAddressList = (value) => {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value];
};

const normalizeMailOptions = (mailOptions = {}) => {
  const {
    from,
    to,
    cc,
    bcc,
    replyTo,
    subject,
    text,
    html,
    attachments,
    ...extraOptions
  } = mailOptions;

  return {
    ...extraOptions,
    from: from || defaultFrom,
    to: toAddressList(to),
    cc: toAddressList(cc),
    bcc: toAddressList(bcc),
    replyTo,
    subject,
    text,
    html,
    attachments
  };
};

export const transporter = {
  async sendMail(mailOptions) {
    const message = normalizeMailOptions(mailOptions);
    const [response] = await sgMail.send(message);

    return {
      accepted: message.to || [],
      rejected: [],
      response: response?.statusCode,
      messageId: response?.headers?.['x-message-id']
    };
  }
};
