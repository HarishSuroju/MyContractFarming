const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: {
            name: 'ACF - Assured Contract Farming',
            address: process.env.EMAIL_USER
        },
        to: email,
        subject: '🔐 ACF Verification Code - Complete Your Registration',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>ACF Email Verification</title>
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                    <!-- Header with ACF Branding -->
                    <div style="background: linear-gradient(135deg, #2d5a27 0%, #1a3d1a 100%); padding: 40px 30px; text-align: center; position: relative;">
                        <div style="position: absolute; top: -50px; left: 50%; transform: translateX(-50%); width: 100px; height: 100px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                            <div style="font-size: 36px; font-weight: bold; color: #2d5a27; letter-spacing: -2px;">ACF</div>
                        </div>
                        <h1 style="color: white; margin: 60px 0 10px 0; font-size: 28px; font-weight: 300;">Assured Contract Farming</h1>
                        <p style="color: #e8f5e8; margin: 0; font-size: 16px;">Secure • Transparent • Reliable</p>
                    </div>

                    <!-- Main Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #2d5a27; text-align: center; margin-bottom: 30px; font-size: 24px;">Verify Your Contractor Account</h2>

                        <div style="background: #f8f9fa; border-left: 4px solid #2d5a27; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                            <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6;">
                                Welcome to <strong>ACF</strong>! To complete your contractor registration and start connecting with farmers, please verify your email address using the code below.
                            </p>
                        </div>

                        <!-- OTP Display -->
                        <div style="text-align: center; margin: 40px 0;">
                            <div style="display: inline-block; background: linear-gradient(135deg, #2d5a27 0%, #1a3d1a 100%); color: white; padding: 25px 40px; border-radius: 15px; box-shadow: 0 8px 25px rgba(45, 90, 39, 0.3);">
                                <div style="font-size: 14px; margin-bottom: 10px; opacity: 0.9; letter-spacing: 1px;">YOUR VERIFICATION CODE</div>
                                <div style="font-size: 42px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
                            </div>
                        </div>

                        <!-- Instructions -->
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
                            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">📋 How to Verify:</h3>
                            <ol style="color: #856404; margin: 0; padding-left: 20px;">
                                <li style="margin-bottom: 8px;">Return to the ACF registration page</li>
                                <li style="margin-bottom: 8px;">Enter this 6-digit code in the OTP field</li>
                                <li>Complete your account setup</li>
                            </ol>
                        </div>

                        <!-- Warning -->
                        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; color: #721c24; font-size: 14px;">
                                <strong>⚠️ Important:</strong> This code expires in <strong>10 minutes</strong>. If you didn't request this verification, please ignore this email.
                            </p>
                        </div>

                        <!-- Footer -->
                        <div style="border-top: 1px solid #dee2e6; padding-top: 30px; margin-top: 40px; text-align: center;">
                            <div style="margin-bottom: 20px;">
                                <span style="display: inline-block; background: #2d5a27; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold;">ACF</span>
                            </div>
                            <p style="color: #6c757d; font-size: 14px; margin: 5px 0;">
                                Connecting Farmers & Contractors with Trust
                            </p>
                            <p style="color: #adb5bd; font-size: 12px; margin: 5px 0;">
                                © 2025 ACF - Assured Contract Farming. All rights reserved.
                            </p>
                            <p style="color: #adb5bd; font-size: 11px; margin: 5px 0;">
                                This is an automated message. Please do not reply to this email.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
            ACF - Assured Contract Farming
            ================================

            Verify Your Contractor Account

            Welcome to ACF! Your verification code is: ${otp}

            This code will expire in 10 minutes.

            How to verify:
            1. Return to the ACF registration page
            2. Enter this 6-digit code
            3. Complete your account setup

            If you didn't request this verification, please ignore this email.

            © 2025 ACF - Assured Contract Farming. All rights reserved.
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

const sendWelcomeEmail = async (email, name, password) => {
    const mailOptions = {
        from: {
            name: 'ACF - Assured Contract Farming',
            address: process.env.EMAIL_USER
        },
        to: email,
        subject: '🎉 Welcome to ACF! Your Account is Ready',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to ACF</title>
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                    <!-- Header with ACF Branding -->
                    <div style="background: linear-gradient(135deg, #2d5a27 0%, #1a3d1a 100%); padding: 40px 30px; text-align: center; position: relative;">
                        <div style="position: absolute; top: -50px; left: 50%; transform: translateX(-50%); width: 100px; height: 100px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                            <div style="font-size: 36px; font-weight: bold; color: #2d5a27; letter-spacing: -2px;">ACF</div>
                        </div>
                        <h1 style="color: white; margin: 60px 0 10px 0; font-size: 28px; font-weight: 300;">Welcome to ACF!</h1>
                        <p style="color: #e8f5e8; margin: 0; font-size: 16px;">Your Account is Successfully Verified</p>
                    </div>

                    <!-- Main Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #2d5a27; text-align: center; margin-bottom: 30px; font-size: 24px;">Hello ${name}! 🎊</h2>

                        <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                            <p style="margin: 0; color: #155724; font-size: 16px; line-height: 1.6;">
                                <strong>✅ Success!</strong> Your contractor account with <strong>ACF - Assured Contract Farming</strong> has been successfully verified. You can now access all platform features and start connecting with farmers.
                            </p>
                        </div>

                        <!-- Account Credentials -->
                        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border: 2px solid #2d5a27;">
                            <h3 style="color: #2d5a27; margin: 0 0 20px 0; text-align: center; font-size: 20px;">🔐 Your Account Credentials</h3>

                            <div style="display: table; width: 100%; margin-bottom: 15px;">
                                <div style="display: table-row;">
                                    <div style="display: table-cell; padding: 8px 0; font-weight: bold; color: #495057; width: 120px;">Email:</div>
                                    <div style="display: table-cell; padding: 8px 15px; background: white; border-radius: 6px; font-family: monospace; color: #2d5a27;">${email}</div>
                                </div>
                                <div style="display: table-row;">
                                    <div style="display: table-cell; padding: 8px 0; font-weight: bold; color: #495057;">Password:</div>
                                    <div style="display: table-cell; padding: 8px 15px; background: white; border-radius: 6px; font-family: monospace; color: #dc3545; font-weight: bold;">${password}</div>
                                </div>
                            </div>

                            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin-top: 15px;">
                                <p style="margin: 0; color: #856404; font-size: 14px;">
                                    <strong>🔒 Security Note:</strong> Please save these credentials securely. You can change your password anytime from your account settings.
                                </p>
                            </div>
                        </div>

                        <!-- Action Button -->
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login"
                               style="background: linear-gradient(135deg, #2d5a27 0%, #1a3d1a 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 8px 25px rgba(45, 90, 39, 0.3); transition: transform 0.2s;">
                                🚀 Login to ACF Now
                            </a>
                        </div>

                        <!-- Features -->
                        <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 30px 0;">
                            <h3 style="color: #2d5a27; margin: 0 0 20px 0; text-align: center;">🌟 What You Can Do on ACF:</h3>
                            <ul style="color: #495057; margin: 0; padding-left: 20px;">
                                <li style="margin-bottom: 10px;">📋 Create and manage farming contracts</li>
                                <li style="margin-bottom: 10px;">👥 Connect with verified farmers</li>
                                <li style="margin-bottom: 10px;">📊 Track contract progress and payments</li>
                                <li style="margin-bottom: 10px;">💬 Communicate securely with farmers</li>
                                <li>📈 Access market insights and analytics</li>
                            </ul>
                        </div>

                        <!-- Support -->
                        <div style="text-align: center; margin: 30px 0;">
                            <p style="color: #6c757d; font-size: 14px; margin-bottom: 15px;">
                                Need help? Our support team is here for you!
                            </p>
                            <a href="mailto:support@acf.com" style="color: #2d5a27; text-decoration: none; font-weight: bold;">📧 Contact ACF Support</a>
                        </div>

                        <!-- Footer -->
                        <div style="border-top: 1px solid #dee2e6; padding-top: 30px; margin-top: 40px; text-align: center;">
                            <div style="margin-bottom: 20px;">
                                <span style="display: inline-block; background: #2d5a27; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold;">ACF</span>
                            </div>
                            <p style="color: #6c757d; font-size: 14px; margin: 5px 0;">
                                Building Trust Between Farmers & Contractors
                            </p>
                            <p style="color: #adb5bd; font-size: 12px; margin: 5px 0;">
                                © 2025 ACF - Assured Contract Farming. All rights reserved.
                            </p>
                            <p style="color: #adb5bd; font-size: 11px; margin: 5px 0;">
                                This is an automated message. Please do not reply to this email.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
            ACF - Assured Contract Farming
            ===============================

            Welcome ${name}!

            Your contractor account has been successfully verified!

            YOUR ACCOUNT CREDENTIALS:
            Email: ${email}
            Password: ${password}

            Login here: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login

            What you can do on ACF:
            - Create and manage farming contracts
            - Connect with verified farmers
            - Track contract progress and payments
            - Communicate securely with farmers
            - Access market insights and analytics

            Need help? Contact our support team.

            © 2025 ACF - Assured Contract Farming. All rights reserved.
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
};

module.exports = { sendOTP, sendWelcomeEmail };