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
  // If SMTP is not configured or still using placeholders, we'll just log the code for local testing
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'your_email@gmail.com') {
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
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'your_email@gmail.com') {
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

export const sendEnrollmentEmail = async (to: string, userName: string, courseTitle: string, courseId: string) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.warn(`[DEVELOPMENT] SMTP not configured. Enrollment email for ${to} (Course: ${courseTitle}) would be sent here.`);
    return true;
  }

  const courseUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/courses/${courseId}/play`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"GoLive Classes" <noreply@golive.com>',
    to,
    subject: `You're Enrolled! Welcome to ${courseTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        
        <div style="background-color: #0f172a; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">GoLive Classes</h1>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Hi ${userName},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Get ready to dive in! We are thrilled to confirm your enrollment in <strong>${courseTitle}</strong>. 
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Your course is now available in your dashboard, and you have lifetime access. You can start learning immediately by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${courseUrl}" style="background-color: #10b981; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">
              Start Learning Now
            </a>
          </div>
          
          <h3 style="color: #0f172a; font-size: 18px; margin-top: 40px;">What's next?</h3>
          <ul style="color: #475569; font-size: 15px; line-height: 1.6; padding-left: 20px;">
            <li>Watch the introductory lectures to get familiar with the course.</li>
            <li>Join the Q&A discussion board if you have any questions.</li>
            <li>Complete all assignments to earn your certificate of completion!</li>
          </ul>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            Need help? Reply to this email or visit our support center.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin: 10px 0 0 0;">
            &copy; ${new Date().getFullYear()} GoLive Classes. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending enrollment email:', error);
    return false;
  }
};

export const sendCourseRecommendationEmail = async (to: string, userName: string, viewedCourseTitle: string, recommendations: any[]) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.warn(`[DEVELOPMENT] SMTP not configured. Recommendation email for ${to} based on viewing ${viewedCourseTitle} would be sent here.`);
    return true;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Build the HTML for the recommended courses list
  const recommendationsHtml = recommendations.map(course => `
    <div style="margin-bottom: 20px; border-bottom: 1px solid #eaeaea; padding-bottom: 15px;">
      <h3 style="color: #0f172a; margin: 0 0 5px 0;">${course.title}</h3>
      <p style="color: #475569; font-size: 14px; margin: 0 0 10px 0;">Category: ${course.category}</p>
      <a href="${appUrl}/courses/${course._id}" style="color: #10b981; text-decoration: none; font-weight: bold;">View Course &rarr;</a>
    </div>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"GoLive Classes" <noreply@golive.com>',
    to,
    subject: `Still thinking about ${viewedCourseTitle}?`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        
        <div style="background-color: #0f172a; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">GoLive Classes</h1>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Hi ${userName},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            We noticed you were checking out <strong>${viewedCourseTitle}</strong> recently! 
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            If you're still on the fence, we thought you might also be interested in some of these highly-rated courses in the same category:
          </p>
          
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;">
            ${recommendationsHtml}
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${appUrl}/courses" style="background-color: #0f172a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Explore All Courses
            </a>
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} GoLive Classes. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending recommendation email:', error);
    return false;
  }
};
