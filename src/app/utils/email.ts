import nodemailer from 'nodemailer';
import configs from '../configs';

export const transporter = nodemailer.createTransport({
  host: configs.emailHost,
  port: configs.emailPort,
  secure: configs.emailSecure,
  auth: {
    user: configs.email,
    pass: configs.emailPassword,
  },
} as nodemailer.TransportOptions);

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">Verify Your Email Address</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #374151;">
                                Thank you for signing up! To complete your registration, please verify your email address by entering the code below:
                            </p>
                            <!-- OTP Code -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <div style="display: inline-block; padding: 16px 32px; background-color: #f3f4f6; border-radius: 8px; border: 2px dashed #d1d5db;">
                                            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: 'Courier New', monospace;">{{OTP_CODE}}</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 20px 0 0; font-size: 14px; line-height: 20px; color: #6b7280; text-align: center;">
                                This code will expire in <strong>5 minutes</strong>
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 10px; font-size: 12px; line-height: 18px; color: #6b7280;">
                                If you didn't request this email, you can safely ignore it.
                            </p>
                            <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9ca3af;">
                                © 2025 Part Timer. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const sendOTPEmail = async (to: string, otp: string): Promise<void> => {
  const emailContent = htmlTemplate.replace('{{OTP_CODE}}', otp);

  await transporter.sendMail({
    from: `"Part Timer" <${configs.adminEmail}>`,
    to,
    subject: 'Verify Your Email Address',
    html: emailContent,
  });
};
