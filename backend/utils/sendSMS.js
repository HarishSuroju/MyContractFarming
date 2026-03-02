/**
 * SMS Utility for sending OTP via phone
 * Currently supports Twilio - can be extended for other providers
 */

const sendSMS = async ({ to, message }) => {
  try {
    // Check if Twilio credentials are configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      console.warn('Twilio credentials not configured. Logging SMS instead:');
      console.log(`[SMS to ${to}]: ${message}`);
      return {
        success: true,
        message: 'SMS logged (Twilio not configured)'
      };
    }

    // Use Twilio if credentials are available
    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);

    const result = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to
    });

    console.log(`SMS sent successfully to ${to}:`, result.sid);
    return {
      success: true,
      message: 'SMS sent successfully',
      sid: result.sid
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      message: 'Failed to send SMS',
      error: error.message
    };
  }
};

/**
 * Send OTP via SMS
 * @param {string} phone - Phone number to send OTP to
 * @param {string} otp - The OTP to send
 * @param {string} role - User role (farmer)
 */
const sendPhoneOTP = async (phone, otp, role = 'farmer') => {
  const message = `Your ACF Platform verification code is: ${otp}. This code will expire in 10 minutes.`;
  return sendSMS({ to: phone, message });
};

module.exports = {
  sendSMS,
  sendPhoneOTP
};
