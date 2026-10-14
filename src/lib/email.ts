import nodemailer from 'nodemailer';

export function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465');
  const secure = port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000,
  });
}

const transporter = getTransporter();

export function getSenderAddress(): string {
  if (process.env.EMAIL_FROM) {
    return process.env.EMAIL_FROM;
  }
  if (process.env.SMTP_USER) {
    return `"GoLive Classes" <${process.env.SMTP_USER}>`;
  }
  return '"GoLive Classes" <noreply@goliveclasses.com>';
}

export async function verifyEmailTransport(): Promise<{ success: boolean; message: string }> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'your_email@gmail.com') {
    return { success: false, message: 'SMTP credentials unconfigured or set to placeholder.' };
  }
  try {
    const transport = getTransporter();
    await transport.verify();
    return { success: true, message: 'Gmail SMTP transport is verified and operational.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'SMTP verification failed.' };
  }
}

/**
 * 1. Scholar Email Verification Code (OTP)
 */
export const sendVerificationEmail = async (to: string, code: string): Promise<boolean> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.warn(`[DEVELOPMENT] SMTP not configured. Verification code for ${to} is: ${code}`);
    return true;
  }

  const mailOptions = {
    from: getSenderAddress(),
    to,
    subject: `${code} is your GoLive Classes verification code`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8F4EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F4EC; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #FAF7F0; border: 1px solid #E9DFCC; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(27, 46, 38, 0.04);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #24483C; padding: 32px 28px; text-align: center;">
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; color: #F8F4EC; font-size: 26px; font-weight: bold; letter-spacing: 0.5px;">
                      GoLive<span style="color: #C96F4A;">Classes</span>
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #DCE6D8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                      The Classical Cohort LMS
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 36px 32px; color: #1B2E26;">
                    <h2 style="margin: 0 0 16px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #24483C;">
                      Confirm Your Scholar Account
                    </h2>
                    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #3D5A4C;">
                      Welcome to GoLive Classes. To complete your registration and activate your account, enter the following 6-digit verification code:
                    </p>

                    <!-- Code Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                      <tr>
                        <td align="center" style="background-color: #F8F4EC; border: 2px dashed #E9DFCC; border-radius: 12px; padding: 24px;">
                          <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: bold; letter-spacing: 8px; color: #24483C;">
                            ${code}
                          </div>
                          <p style="margin: 8px 0 0 0; font-size: 12px; color: #6D8277; font-weight: 500;">
                            Code expires in 15 minutes
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.5; color: #6D8277;">
                      If you did not request this registration, please disregard this email. Your email address will remain unverified.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #F8F4EC; border-top: 1px solid #E9DFCC; padding: 20px 32px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #6D8277;">
                      &copy; ${new Date().getFullYear()} GoLive Classes Academy. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.error('Error sending verification email:', error.message || error);
    return false;
  }
};

/**
 * 2. Password Reset Request Email
 */
export const sendPasswordResetEmail = async (to: string, token: string): Promise<boolean> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.warn(`[DEVELOPMENT] SMTP not configured. Password reset token for ${to} is: ${token}`);
    return true;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: getSenderAddress(),
    to,
    subject: 'Reset your GoLive Classes password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8F4EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F4EC; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #FAF7F0; border: 1px solid #E9DFCC; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(27, 46, 38, 0.04);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #24483C; padding: 32px 28px; text-align: center;">
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; color: #F8F4EC; font-size: 26px; font-weight: bold; letter-spacing: 0.5px;">
                      GoLive<span style="color: #C96F4A;">Classes</span>
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #DCE6D8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                      Security & Account Recovery
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 36px 32px; color: #1B2E26;">
                    <h2 style="margin: 0 0 16px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #24483C;">
                      Password Reset Request
                    </h2>
                    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #3D5A4C;">
                      We received a request to reset the password for your GoLive Classes account. Click the button below to establish a new password:
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                      <tr>
                        <td align="center">
                          <a href="${resetUrl}" style="background-color: #C96F4A; color: #F8F4EC; padding: 14px 32px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 3px 8px rgba(201, 111, 74, 0.25);">
                            Reset My Password &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #6D8277;">
                      This link will securely expire in <strong>1 hour</strong>.
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.5; color: #6D8277;">
                      If you did not request this password reset, please ignore this email; your existing password will remain completely secure.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #F8F4EC; border-top: 1px solid #E9DFCC; padding: 20px 32px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #6D8277;">
                      &copy; ${new Date().getFullYear()} GoLive Classes Academy. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.error('Error sending password reset email:', error.message || error);
    return false;
  }
};

/**
 * 3. Course Enrollment Confirmation Email
 */
export const sendEnrollmentEmail = async (to: string, userName: string, courseTitle: string, courseId: string): Promise<boolean> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.warn(`[DEVELOPMENT] SMTP not configured. Enrollment email for ${to} (Course: ${courseTitle}) would be sent here.`);
    return true;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const courseUrl = `${appUrl}/courses/${courseId}/play`;

  const mailOptions = {
    from: getSenderAddress(),
    to,
    subject: `Enrolled: Welcome to ${courseTitle} | GoLive Classes`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8F4EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F4EC; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #FAF7F0; border: 1px solid #E9DFCC; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(27, 46, 38, 0.04);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #24483C; padding: 32px 28px; text-align: center;">
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; color: #F8F4EC; font-size: 26px; font-weight: bold; letter-spacing: 0.5px;">
                      GoLive<span style="color: #C96F4A;">Classes</span>
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #DCE6D8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                      Enrollment Confirmation
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 36px 32px; color: #1B2E26;">
                    <h2 style="margin: 0 0 16px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #24483C;">
                      Welcome, ${userName}
                    </h2>
                    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #3D5A4C;">
                      Your enrollment in <strong>${courseTitle}</strong> is confirmed. You now have full lifetime access to all course modules, assignments, and curriculum resources.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                      <tr>
                        <td align="center">
                          <a href="${courseUrl}" style="background-color: #24483C; color: #F8F4EC; padding: 14px 32px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 3px 8px rgba(36, 72, 60, 0.25);">
                            Start Learning Now &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <div style="background-color: #F8F4EC; border: 1px solid #E9DFCC; border-radius: 10px; padding: 18px 20px; margin: 20px 0;">
                      <h4 style="margin: 0 0 8px 0; color: #24483C; font-size: 14px;">Next Steps:</h4>
                      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #3D5A4C; line-height: 1.6;">
                        <li>Review syllabus modules and lecture notes in your player.</li>
                        <li>Participate in peer discussions and ask questions.</li>
                        <li>Complete all coursework to receive your certificate of completion.</li>
                      </ul>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #F8F4EC; border-top: 1px solid #E9DFCC; padding: 20px 32px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #6D8277;">
                      &copy; ${new Date().getFullYear()} GoLive Classes Academy. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.error('Error sending enrollment email:', error.message || error);
    return false;
  }
};

/**
 * 4. Curated Course Recommendation Email
 */
export const sendCourseRecommendationEmail = async (
  to: string,
  userName: string,
  viewedCourseTitle: string,
  recommendations: any[]
): Promise<boolean> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.warn(`[DEVELOPMENT] SMTP not configured. Recommendation email for ${to} would be sent here.`);
    return true;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const recommendationsHtml = (recommendations || []).map(course => `
    <div style="margin-bottom: 16px; border-bottom: 1px solid #E9DFCC; padding-bottom: 14px;">
      <h4 style="color: #24483C; margin: 0 0 4px 0; font-size: 15px;">${course.title}</h4>
      <p style="color: #6D8277; font-size: 12px; margin: 0 0 8px 0;">Category: ${course.category || 'General'}</p>
      <a href="${appUrl}/courses/${course.id}" style="color: #C96F4A; font-size: 13px; font-weight: bold; text-decoration: none;">
        View Syllabus &rarr;
      </a>
    </div>
  `).join('');

  const mailOptions = {
    from: getSenderAddress(),
    to,
    subject: `Curated Curricula based on ${viewedCourseTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8F4EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F4EC; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #FAF7F0; border: 1px solid #E9DFCC; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(27, 46, 38, 0.04);">
                <tr>
                  <td style="background-color: #24483C; padding: 32px 28px; text-align: center;">
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; color: #F8F4EC; font-size: 26px; font-weight: bold;">
                      GoLive<span style="color: #C96F4A;">Classes</span>
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 36px 32px; color: #1B2E26;">
                    <h2 style="margin: 0 0 16px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #24483C;">
                      Scholar Recommendations for ${userName}
                    </h2>
                    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #3D5A4C;">
                      Based on your recent interest in <em>${viewedCourseTitle}</em>, our faculty recommends these courses:
                    </p>
                    <div style="background-color: #F8F4EC; border: 1px solid #E9DFCC; border-radius: 10px; padding: 20px; margin: 20px 0;">
                      ${recommendationsHtml}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #F8F4EC; border-top: 1px solid #E9DFCC; padding: 20px 32px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #6D8277;">
                      &copy; ${new Date().getFullYear()} GoLive Classes Academy. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.error('Error sending recommendation email:', error.message || error);
    return false;
  }
};
