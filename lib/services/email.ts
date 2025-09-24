import nodemailer from 'nodemailer'
import crypto from 'crypto'

// Email configuration - only create transporter if credentials are available
let transporter: nodemailer.Transporter | null = null;

try {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('[Email Service] Creating SMTP transporter...');
    console.log('[Email Service] Host:', process.env.SMTP_HOST);
    console.log('[Email Service] Port:', process.env.SMTP_PORT);
    console.log('[Email Service] User:', process.env.SMTP_USER);
    
    transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });
    console.log('[Email Service] SMTP transporter created successfully');
  } else {
    console.log('[Email Service] SMTP credentials not configured, email sending will be disabled');
  }
} catch (error) {
  console.error('[Email Service] Failed to create transporter:', error);
}

export async function sendVerificationEmail(
  email: string,
  fullName: string,
  verificationToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if transporter is configured
    if (!transporter) {
      console.log('[Email Service] SMTP not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    console.log('[Email Service] Attempting to send verification email to:', email);
    
    // Test connection first
    console.log('[Email Service] Testing SMTP connection...');
    await transporter.verify();
    console.log('[Email Service] SMTP connection verified successfully');

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@yourcompany.com',
      to: email,
      subject: 'Verify Your Email - Complete Your Registration',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #dc2626, #2563eb); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to HRMS!</h1>
            </div>
            <div class="content">
              <h2>Hello ${fullName}!</h2>
              <p>Thank you for registering with our HR Management System. To complete your registration and set up your account, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email & Set Password</a>
              </div>
              
              <p>This link will expire in 24 hours for security reasons.</p>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
              
              <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    console.log('[Email Service] Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('[Email Service] Email sent successfully:', result.messageId);
    return { success: true }
  } catch (error) {
    console.error('[Email Service] Email sending error:', error);
    if (error instanceof Error) {
      console.error('[Email Service] Error details:', {
        message: error.message,
        code: (error as any).code,
        command: (error as any).command,
        response: (error as any).response
      });
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    }
  }
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    if (!transporter) {
      console.log('[Email Service] No transporter available for testing')
      return false
    }
    console.log('[Email Service] Testing SMTP connection...')
    await transporter.verify()
    console.log('[Email Service] SMTP connection successful!')
    return true
  } catch (error) {
    console.error('[Email Service] SMTP connection test failed:', error)
    if (error instanceof Error) {
      console.error('[Email Service] Error details:', {
        message: error.message,
        code: (error as any).code,
        command: (error as any).command,
        response: (error as any).response
      })
    }
    return false
  }
}
