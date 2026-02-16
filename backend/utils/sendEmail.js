const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Verify the connection configuration
    await transporter.verify();

    const mailOptions = {
      from: `"ACF Platform" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text
    };

    // Add HTML if provided
    if (html) {
      mailOptions.html = html;
    }

    await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    // Log the error but don't throw to prevent server crashes
    console.warn(`Warning: Email failed to send to ${to}. Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
