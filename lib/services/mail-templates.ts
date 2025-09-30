export const verificationMailTemplate = (
  fullName: string,
  verificationUrl: string
) => `
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
      `;

// Template for notifying employees about leave request approval
export const leaveApprovalTemplate = (
  employeeName: string,
  leaveDetails: {
    leaveType: string;
    startDate: string;
    endDate: string;
    daysRequested: number;
    status: string;
    adminNotes?: string;
    approvedBy: string;
  }
) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
    <!-- The style block is for reference and for email clients that support it -->
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            font-family: 'Trebuchet MS', sans-serif;
        }
        table {
            border-spacing: 0;
        }
        td {
            padding: 0;
        }
        img {
            border: 0;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f4f4f4;
            padding-bottom: 60px;
        }
        .main {
            background-color: #ffffff;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
            font-family: 'Trebuchet MS', sans-serif;
            color: #4a4a4a;
            border: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>

    <center class="wrapper" style="width: 100%; table-layout: fixed; background-color: #f4f4f4; padding-bottom: 10px 5px 60px;">
        <table class="main" width="100%" style="background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: 'Trebuchet MS', sans-serif; color: #4a4a4a; border: 1px solid #e2e8f0;">

            <!-- LOGO SECTION -->
            <tr>
                <td style="padding: 0;">
                    <table width="100%" style="border-spacing: 0; background: linear-gradient(135deg, #dc2626, #2563eb);">
                        <tr>
                            <td style=" padding: 10px; text-align: left;">
                               <img src="https://image.s7.sfmc-content.com/lib/fe2a11717d640474741277/m/1/572f415e-e0b4-45ef-8bfc-7ed983975410.png" alt="Company Logo" width="100%" style="border: 0; max-width: 40px;">
                            </td>
                             <td style="padding: 0 10px 0 0; text-align: right; color: #fff">
                               <p style="text-transform: capitalize;">${new Date().toDateString()}</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- TITLE SECTION -->
            <tr>
                <td style="padding: 30px 30px 10px 30px;">
                    <table width="100%" style="border-spacing: 0;">
                        <tr>
                            <td style="padding: 0; text-align: left;">
                                <h1 style="margin: 0; font-size: 28px; color: #1e293b; font-weight: 600;">${leaveDetails.status === "approved" ? "✅ Leave Request Approved" : "❌ Leave Request Status Update"}</h1>
                                <p style="font-size: 16px; color: #64748b; margin-top: 5px;">Hello ${employeeName}, here is an update regarding your recent leave request.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            
            <!-- HR-LINE -->
            <tr>
                <td style="padding: 10px 30px;">
                    <hr style="border: 0; border-top: 2px solid #e2e8f0;">
                </td>
            </tr>

            <!-- DETAILS SECTION -->
            <tr>
                <td style="padding: 10px 30px 20px 30px;">
                     <h3 style="font-size: 18px; color: #334155; margin-top: 0; margin-bottom: 15px;">📋 Details </h3>
                     <table width="100%" style="border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 15px;">
                        <tr style="background-color: ${leaveDetails.status === 'approved' ? '#d1fae5' : '#fee2e2'};">
                           <td style="padding: 12px 20px; font-weight: bold; color: #475569; width: 40%; border-bottom: 1px solid #e2e8f0;">Final Status</td>
                           <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: ${leaveDetails.status === 'approved' ? '#059669' : '#ef4444'}; text-transform: capitalize;">${leaveDetails.status}</td>
                        </tr>
                        <tr>
                           <td style="padding: 12px 20px; font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">Leave Type</td>
                           <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">${leaveDetails.leaveType}</td>
                        </tr>
                        <tr>
                           <td style="padding: 12px 20px; font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">Start Date</td>
                           <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">${new Date(leaveDetails.startDate).toDateString()}</td>
                        </tr>
                        <tr>
                           <td style="padding: 12px 20px; font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">End Date</td>
                           <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">${new Date(leaveDetails.endDate).toDateString()}</td>
                        </tr>
                        <tr>
                           <td style="padding: 12px 20px; font-weight: bold; color: #475569; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">Total Days</td>
                           <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">${leaveDetails.daysRequested}</td>
                        </tr>
                        <tr>
                           <td style="padding: 12px 20px; font-weight: bold; color: #475569; background-color: #f8fafc;">Reviewed By</td>
                           <td style="padding: 12px 20px;">${leaveDetails.approvedBy}</td>
                        </tr>
                     </table>
                </td>
            </tr>
            
            <!-- ADMIN NOTES (conditional) 
            <tr>
                <td style="padding: 0 30px 20px 30px;">
                    <div style="background-color: #f3f4f6; border-left: 4px solid #6b7280; padding: 20px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #4b5563;">📝 Notes from HR</h3>
                        <p style="margin: 0; font-size: 16px; color: #4b5563; line-height: 1.5;">${leaveDetails.adminNotes}</p>
                    </div>
                </td>
            </tr>

            <!-- NEXT STEPS (conditional) -->
            ${leaveDetails.status === "approved" ? (
              `<tr>
                <td style="padding: 0 30px 20px 30px;">
                    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-left: 4px solid #10b981; padding: 20px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #065f46;">🎉 Congratulations ${employeeName}, Your Leave is Confirmed!</h3>
                        <p style="margin: 0; font-size: 16px; color: #047857; line-height: 1.5;">Please ensure you have completed any necessary handovers and have updated your calendar accordingly. Enjoy your time off!</p>
                    </div>
                </td>
            </tr>`
            ):(
             ` <tr>
                <td style="padding: 0 30px 20px 30px;">
                    <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; padding: 20px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #b45309;">📞 Next Steps</h3>
                        <p style="margin: 0; font-size: 16px; color: #78350f; line-height: 1.5;">If you have any questions or require further clarification regarding this decision, please contact your manager or the HR department directly.</p>
                    </div>
                </td>
            </tr>`
            )}

        </table>
    </center>

</body>
</html>
`;

// Template for notifying admins/HR about new leave requests
export const leaveRequestNotificationTemplate = (
  employeeName: string,
  employeeEmail: string,
  leaveDetails: {
    leaveType: string;
    startDate: string;
    endDate: string;
    daysRequested: number;
    reason?: string;
  }
) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Leave Request</title>
    <!-- The style block is for reference and for email clients that support it -->
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            font-family: 'Trebuchet MS', sans-serif;
        }
        table {
            border-spacing: 0;
        }
        td {
            padding: 0;
        }
        img {
            border: 0;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f4f4f4;
            padding-bottom: 60px;
        }
        .main {
            background-color: #ffffff;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
            font-family: 'Trebuchet MS', sans-serif;
            color: #4a4a4a;
        }
        .two-columns {
            text-align: left;
            font-size: 0;
            padding: 20px;
        }
        .two-columns .column {
            width: 100%;
            max-width: 300px;
            display: inline-block;
            vertical-align: top;
            text-align: left;
        }
    </style>
</head>
<body>

    <center class="wrapper" style="width: 100%; table-layout: fixed; background-color: #f4f4f4; padding: 10px 5px 60px;">
        <table class="main" width="100%" style="background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: 'Trebuchet MS', sans-serif; color: #4a4a4a;">

            <!-- LOGO SECTION -->
            <tr>
                <td style="padding: 0;">
                    <table width="100%" style="border-spacing: 0; background: linear-gradient(135deg, #dc2626, #2563eb);">
                        <tr>
                            <td style=" padding: 10px; text-align: left;">
                               <img src="https://image.s7.sfmc-content.com/lib/fe2a11717d640474741277/m/1/572f415e-e0b4-45ef-8bfc-7ed983975410.png" alt="Company Logo" width="100%" style="border: 0; max-width: 40px;">
                            </td>
                             <td style="padding: 0 10px 0 0; text-align: right; color: #fff">
                               <p style="text-transform: capitalize;">${new Date().toDateString()}</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- TITLE SECTION -->
            <tr>
                <td style="padding: 20px 30px 10px 30px;">
                    <table width="100%" style="border-spacing: 0;">
                        <tr>
                            <td style="padding: 0; text-align: center;">
                                <h1 style="margin: 0; font-size: 28px; color: #1e293b; font-weight: 600;">New Leave Request</h1>
                                <p style="font-size: 16px; color: #64748b; margin-top: 5px;">A new request requires your attention.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            
            <!-- HR-LINE -->
            <tr>
                <td style="padding: 0 30px;">
                    <hr style="border: 0; border-top: 1px solid #e2e8f0;">
                </td>
            </tr>

            <!-- EMPLOYEE INFO SECTION -->
            <tr>
                <td style="padding: 20px 30px;">
                    <h3 style="font-size: 18px; color: #334155; margin-top: 0; margin-bottom: 15px;"> Employee Information</h3>
                    <div style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 20px; font-size: 16px;">
                        <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${employeeName}</p>
                        <p style="margin: 0;"><strong>Email:</strong> ${employeeEmail}</p>
                    </div>
                </td>
            </tr>
            
            <!-- ACTION REQUIRED SECTION -->
            <tr>
                <td style="padding: 10px 30px;">
                    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px;">
                    <h3 style="margin: 0 0 10px 0; padding: 0; font-size: 20px">Reason</h3>
                        <p style="margin: 0; font-size: 16px; color: #78350f; line-height: 1.5;">${leaveDetails.reason}</p>
                    </div>
                </td>
            </tr>

            <!-- LEAVE DETAILS SECTION -->
            <tr>
                <td style="padding: 0px 30px 20px 30px;">
                    <h3 style="font-size: 18px; color: #334155; margin-top: 10px; margin-bottom: 15px;">👤 Leave Details</h3>
                     <table width="100%" style="border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                         
                        <tr style="background-color: #f1f5f9;">
                           <td style="padding: 12px 20px; font-weight: bold; color: #475569;">Leave Type</td>
                           <td style="padding: 12px 20px;">${leaveDetails.leaveType}</td>
                        </tr>
                        <tr>
                           <td style="padding: 12px 20px; font-weight: bold; color: #475569;">Start Date</td>
                           <td style="padding: 12px 20px;">${new Date(leaveDetails.startDate).toDateString()}</td>
                        </tr>
                         <tr style="background-color: #f1f5f9;">
                           <td style="padding: 12px 20px; font-weight: bold; color: #475569;">End Date</td>
                           <td style="padding: 12px 20px;">${new Date(leaveDetails.endDate).toDateString()}</td>
                        </tr>
                         <tr>
                           <td style="padding: 12px 20px; font-weight: bold; color: #475569;">Days Requested</td>
                           <td style="padding: 12px 20px;">${leaveDetails.daysRequested}</td>
                        </tr>
                     </table>
                </td>
            </tr>


            <!-- CTA BUTTON -->
            <tr>
                <td style="padding: 30px; text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/leave-requests" style="background: linear-gradient(135deg, #dc2626, #2563eb); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Review Request
                    </a>
                </td>
            </tr>
        </table>
    </center>

</body>
</html>
`;
