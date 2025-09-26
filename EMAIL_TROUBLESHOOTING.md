# Email Troubleshooting Guide

## Issue: Leave request and approval emails not sending

### Step 1: Check Email Configuration

First, verify your email configuration by checking your environment variables and server logs.

### Step 2: Required Environment Variables

Add these to your `.env.local` file:

```env
# Email Configuration (REQUIRED)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourcompany.com

# Optional: Override admin/HR emails
ADMIN_EMAILS=admin1@company.com,admin2@company.com
HR_EMAILS=hr1@company.com,hr2@company.com
```

### Step 3: Gmail Setup (Most Common)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `SMTP_PASS`

### Step 4: Test Email Functionality

Test emails by submitting actual leave requests and approvals in the application.

### Step 5: Check Console Logs

Look for these log messages in your server console:

```
[Email Service] Initializing email service...
[Email Service] SMTP_USER exists: true
[Email Service] SMTP_PASS exists: true
[Email Service] SMTP transport created successfully
[Email Service] SMTP connection verified successfully
```

### Step 6: Common Issues & Solutions

#### Issue: "SMTP not configured"
**Solution**: Set `SMTP_USER` and `SMTP_PASS` environment variables

#### Issue: "SMTP connection verification failed"
**Solutions**:
- Check your Gmail app password
- Ensure 2FA is enabled
- Try different SMTP settings:
  ```env
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=465
  # Set secure: true in email service
  ```

#### Issue: "No admin emails provided"
**Solutions**:
- Add admin/HR users to database with role 'admin' or 'hr'
- Or set `ADMIN_EMAILS` and `HR_EMAILS` environment variables

#### Issue: "Email sent but not received"
**Solutions**:
- Check spam/junk folder
- Verify recipient email address
- Check Gmail sending limits
- Try with a different email provider

### Step 7: Alternative Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

#### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

#### Custom SMTP
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

### Step 8: Debug Mode

Enable detailed logging by checking server console for:
- Email service initialization
- SMTP connection status
- Email sending attempts
- Error messages

### Step 9: Manual Testing

1. Submit a leave request as an employee
2. Check server logs for email notification attempts
3. Approve/reject the request as admin
4. Check server logs for status notification attempts

### Step 10: Still Not Working?

1. Check if emails are being sent but not delivered (check spam)
2. Verify SMTP credentials with email provider
3. Test with a different email service
4. Check server logs for specific error messages
5. Ensure firewall/network allows SMTP connections

## Quick Fix Commands

```bash
# Restart server after changing env vars
npm run dev

# Check environment variables
echo $SMTP_USER
echo $SMTP_PASS

# Check server logs for email activity
```
