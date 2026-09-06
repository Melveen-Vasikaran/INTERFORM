const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASSWORD) {
    const errorMsg = `Email Service Not Configured: 
    Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASSWORD in your .env file.
    Cannot send email to: ${to}`;
    
    console.error(errorMsg);
    
    // As per user requirement: If actual email sending cannot be configured, 
    // create a proper email service abstraction and clearly indicate the required 
    // environment variables instead of pretending that an email was sent.
    throw new Error('Email service is not configured. Missing required environment variables.');
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT || 587,
    secure: EMAIL_PORT === '465',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: EMAIL_FROM || `"College Administration" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email. Check SMTP configuration.');
  }
};

module.exports = {
  sendEmail
};
