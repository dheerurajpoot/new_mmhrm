# Email Verification Setup

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```env
# Email Configuration (for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourcompany.com

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `SMTP_PASS`

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Testing

The email service will automatically test the connection when the server starts. Check the console logs for connection status.

## Features Implemented

✅ **Email Verification Flow**:
1. User signs up with email and name only
2. Verification email is sent with secure token
3. User clicks link to verify email and set password
4. Account is created and user is logged in

✅ **Security Features**:
- Tokens expire in 24 hours
- Tokens can only be used once
- Secure password hashing
- Email validation

✅ **User Experience**:
- Beautiful HTML email template
- Clear success/error messages
- Password visibility toggle
- Automatic redirect after verification
