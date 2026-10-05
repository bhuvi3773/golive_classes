import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (to: string, code: string) => {
  // If SMTP is not configured, we'll just log the code for local testing
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[DEVELOPMENT] SMTP not configured. Verification code for ${to} is: ${code}`);
    return true; // Simulate success
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"GoLive e-Learning" <noreply@golive.com>',
    to,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
        <p style="color: #555; font-size: 16px;">Hello,</p>
        <p style="color: #555; font-size: 16px;">Thank you for registering. Please use the following 6-digit code to verify your email address:</p>
        
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="margin: 0; color: #2563eb; letter-spacing: 5px; font-size: 32px;">${code}</h1>
        </div>
        
        <p style="color: #555; font-size: 14px;">This code will expire in 15 minutes.</p>
        <p style="color: #555; font-size: 14px;">If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="color: #888; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} GoLive e-Learning. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[DEVELOPMENT] SMTP not configured. Password reset token for ${to} is: ${token}`);
    return true;
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"GoLive e-Learning" <noreply@golive.com>',
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <p style="color: #555; font-size: 16px;">Hello,</p>
        <p style="color: #555; font-size: 16px;">We received a request to reset your password. Click the button below to create a new one:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        
        <p style="color: #555; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #555; font-size: 14px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="color: #888; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} GoLive e-Learning. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};
