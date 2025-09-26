import nodemailer from 'nodemailer'
import crypto from 'crypto'

// Email configuration - only create transport if credentials are available
let transport: nodemailer.Transporter | null = null;

try {
  console.log('[Email Service] Initializing email service...');
  console.log('[Email Service] SMTP_USER exists:', !!process.env.SMTP_USER);
  console.log('[Email Service] SMTP_PASS exists:', !!process.env.SMTP_PASS);
  console.log('[Email Service] SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com');
  console.log('[Email Service] SMTP_PORT:', process.env.SMTP_PORT || '587');
  
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('[Email Service] Creating SMTP transport...');
    console.log('[Email Service] Host:', process.env.SMTP_HOST);
    console.log('[Email Service] Port:', process.env.SMTP_PORT);
    console.log('[Email Service] User:', process.env.SMTP_USER);

    transport = nodemailer.createTransport({
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
    console.log('[Email Service] SMTP transport created successfully');
    
    // Test the connection
    try {
      await transport.verify();
      console.log('[Email Service] SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('[Email Service] SMTP connection verification failed:', verifyError);
    }
  } else {
    console.log('[Email Service] SMTP credentials not configured, email sending will be disabled');
    console.log('[Email Service] Please set SMTP_USER and SMTP_PASS environment variables');
  }
} catch (error) {
  console.error('[Email Service] Failed to create transport:', error);
}

export async function sendVerificationEmail(
  email: string,
  fullName: string,
  verificationToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if transport is configured
    if (!transport) {
      console.log('[Email Service] SMTP not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    console.log('[Email Service] Attempting to send verification email to:', email);

    // Test connection first
    console.log('[Email Service] Testing SMTP connection...');
    await transport!.verify();
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
            body { font-family: Trebuchet MS, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 5px; }
            .header { background: linear-gradient(135deg, #dc2626, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #dc2626, #2563eb); color: #fff !important; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://image.s7.sfmc-content.com/lib/fe2a11717d640474741277/m/1/572f415e-e0b4-45ef-8bfc-7ed983975410.png" width="60px">
            </div>
            <div class="content">
              <h2>Hi ${fullName}, welcome to the MM Team!</h2>
              <p>Thank you for registering with MM HR Management System. To complete your registration and set up your account, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email & Set Password</a>
              </div>
              
              <p>This link will expire in 10 minutes for security reasons.</p>
              
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
    const result = await transport.sendMail(mailOptions);
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

// Leave request notification to admins/HR
export async function sendLeaveRequestNotification(
  adminEmails: string[],
  employeeName: string,
  employeeEmail: string,
  leaveDetails: {
    leaveType: string
    startDate: string
    endDate: string
    daysRequested: number
    reason?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Email Service] Attempting to send leave request notification...');
    console.log('[Email Service] Transport available:', !!transport);
    console.log('[Email Service] Admin emails:', adminEmails);
    console.log('[Email Service] Employee:', employeeName, employeeEmail);
    
    if (!transport) {
      console.log('[Email Service] SMTP not configured, skipping leave request notification');
      return { success: false, error: 'Email service not configured' };
    }

    if (!adminEmails || adminEmails.length === 0) {
      console.log('[Email Service] No admin emails provided');
      return { success: false, error: 'No admin emails provided' };
    }

    console.log('[Email Service] Sending leave request notification to admins:', adminEmails);

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@yourcompany.com',
      to: adminEmails.join(', '),
      subject: `New Leave Request from ${employeeName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Leave Request Notification</title>
          <style>
            body { font-family: Trebuchet MS, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 5px; }
            .header { background: linear-gradient(135deg, #dc2626, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .status-pending { background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 New Leave Request</h1>
            </div>
            <div class="content">
              <h2>Leave Request Submitted</h2>
              <p>A new leave request has been submitted and requires your review.</p>
              
              <div class="details">
                <h3>Employee Details:</h3>
                <p><strong>Name:</strong> ${employeeName}</p>
                <p><strong>Email:</strong> ${employeeEmail}</p>
                
                <h3>Leave Details:</h3>
                <p><strong>Leave Type:</strong> ${leaveDetails.leaveType}</p>
                <p><strong>Start Date:</strong> ${new Date(leaveDetails.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> ${new Date(leaveDetails.endDate).toLocaleDateString()}</p>
                <p><strong>Days Requested:</strong> ${leaveDetails.daysRequested}</p>
                ${leaveDetails.reason ? `<p><strong>Reason:</strong> ${leaveDetails.reason}</p>` : ''}
                
                <p><span class="status-pending">Status: PENDING APPROVAL</span></p>
              </div>
              
              <p>Please log in to the HR Management System to review and approve/reject this request.</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from MM HR Management System.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    console.log('[Email Service] Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const result = await transport.sendMail(mailOptions);
    console.log('[Email Service] Leave request notification sent successfully:', result.messageId);
    return { success: true }
  } catch (error) {
    console.error('[Email Service] Leave request notification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send leave request notification'
    }
  }
}

// Leave approval/rejection notification to employee
export async function sendLeaveStatusNotification(
  employeeEmail: string,
  employeeName: string,
  leaveDetails: {
    leaveType: string
    startDate: string
    endDate: string
    daysRequested: number
    status: 'approved' | 'rejected'
    adminNotes?: string
    approvedBy?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Email Service] Attempting to send leave status notification...');
    console.log('[Email Service] Transport available:', !!transport);
    console.log('[Email Service] Employee email:', employeeEmail);
    console.log('[Email Service] Employee name:', employeeName);
    console.log('[Email Service] Status:', leaveDetails.status);
    
    if (!transport) {
      console.log('[Email Service] SMTP not configured, skipping leave status notification');
      return { success: false, error: 'Email service not configured' };
    }

    if (!employeeEmail || !employeeEmail.trim()) {
      console.log('[Email Service] No employee email provided');
      return { success: false, error: 'No employee email provided' };
    }

    console.log('[Email Service] Sending leave status notification to:', employeeEmail);

    const statusColor = leaveDetails.status === 'approved' ? '#10b981' : '#ef4444'
    const statusText = leaveDetails.status === 'approved' ? 'APPROVED ✅' : 'REJECTED ❌'
    const statusBg = leaveDetails.status === 'approved' ? '#d1fae5' : '#fee2e2'
    const statusTextColor = leaveDetails.status === 'approved' ? '#065f46' : '#991b1b'

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@yourcompany.com',
      to: employeeEmail,
      subject: `Leave Request ${leaveDetails.status === 'approved' ? 'Approved' : 'Rejected'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Leave Request Status</title>
          <style>
            body { font-family: Trebuchet MS, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 5px; }
            .header { background: linear-gradient(135deg, #dc2626, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor}; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .status-badge { background: ${statusBg}; color: ${statusTextColor}; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Leave Request Update</h1>
            </div>
            <div class="content">
              <h2>Hi ${employeeName},</h2>
              <p>Your leave request has been ${leaveDetails.status === 'approved' ? 'approved' : 'rejected'}.</p>
              
              <div class="details">
                <h3>Leave Details:</h3>
                <p><strong>Leave Type:</strong> ${leaveDetails.leaveType}</p>
                <p><strong>Start Date:</strong> ${new Date(leaveDetails.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> ${new Date(leaveDetails.endDate).toLocaleDateString()}</p>
                <p><strong>Days Requested:</strong> ${leaveDetails.daysRequested}</p>
                
                <p><span class="status-badge">Status: ${statusText}</span></p>
                
                ${leaveDetails.approvedBy ? `<p><strong>Processed by:</strong> ${leaveDetails.approvedBy}</p>` : ''}
                ${leaveDetails.adminNotes ? `<p><strong>Notes:</strong> ${leaveDetails.adminNotes}</p>` : ''}
              </div>
              
              ${leaveDetails.status === 'approved' 
                ? '<p>Your leave has been approved. Please ensure you have completed any necessary handovers before your leave period.</p>'
                : '<p>Your leave request has been rejected. Please contact HR or your manager if you have any questions.</p>'
              }
            </div>
            <div class="footer">
              <p>This is an automated notification from MM HR Management System.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    console.log('[Email Service] Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const result = await transport.sendMail(mailOptions);
    console.log('[Email Service] Leave status notification sent successfully:', result.messageId);
    return { success: true }
  } catch (error) {
    console.error('[Email Service] Leave status notification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send leave status notification'
    }
  }
}

// Helper function to get admin and HR emails
export async function getAdminAndHREmails(): Promise<string[]> {
  try {
    // Try to get from database first
    try {
      const { getProfilesCollection } = await import('@/lib/mongodb/collections')
      const profilesCollection = await getProfilesCollection()
      
      const adminAndHRProfiles = await profilesCollection.find({
        role: { $in: ['admin', 'hr'] }
      }).toArray()
      
      const emails = adminAndHRProfiles
        .map(profile => profile.email)
        .filter(email => email && email.trim())
      
      if (emails.length > 0) {
        console.log('[Email Service] Admin/HR emails from database:', emails)
        return emails
      }
    } catch (dbError) {
      console.log('[Email Service] Could not fetch from database, falling back to env vars:', dbError)
    }
    
    // Fallback to environment variables
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    const hrEmails = process.env.HR_EMAILS?.split(',') || []
    
    // Remove empty strings and duplicates
    const allEmails = [...new Set([...adminEmails, ...hrEmails].filter(email => email.trim()))]
    
    console.log('[Email Service] Admin/HR emails from env vars:', allEmails)
    return allEmails
  } catch (error) {
    console.error('[Email Service] Error getting admin/HR emails:', error)
    return []
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    if (!transport) {
      console.log('[Email Service] No transport available for testing')
      return false
    }
    console.log('[Email Service] Testing SMTP connection...')
    await transport.verify()
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
