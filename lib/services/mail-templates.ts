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
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leave Request ${
		leaveDetails.status === "approved" ? "Approved" : "Status Update"
  }</title>
  <style>
    body { font-family: Trebuchet MS, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 5px; }
    .header { background: linear-gradient(135deg, #dc2626, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    .status-approved { background: #d1fae5; border-left: 4px solid #10b981; }
    .status-rejected { background: #fee2e2; border-left: 4px solid #ef4444; }
    .admin-notes { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${
			leaveDetails.status === "approved"
				? "✅ Leave Request Approved"
				: "📋 Leave Request Update"
		}</h1>
      <p>Your leave request has been ${
			leaveDetails.status === "approved"
				? "approved"
				: leaveDetails.status
		}</p>
    </div>
    <div class="content">
      <h2>Hello ${employeeName}!</h2>
      <p>Your leave request has been reviewed and ${
			leaveDetails.status === "approved"
				? "approved"
				: leaveDetails.status
		} by ${leaveDetails.approvedBy}.</p>
      
      <div class="details ${
			leaveDetails.status === "approved"
				? "status-approved"
				: "status-rejected"
		}">
        <h3>📋 Leave Request Details:</h3>
        <p><strong>Status:</strong> <span style="text-transform: capitalize; font-weight: bold; color: ${
			leaveDetails.status === "approved" ? "#10b981" : "#ef4444"
		};">${leaveDetails.status}</span></p>
        <p><strong>Leave Type:</strong> ${leaveDetails.leaveType}</p>
        <p><strong>Start Date:</strong> ${new Date(
			leaveDetails.startDate
		).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(
			leaveDetails.endDate
		).toLocaleDateString()}</p>
        <p><strong>Days Requested:</strong> ${leaveDetails.daysRequested}</p>
        <p><strong>Approved By:</strong> ${leaveDetails.approvedBy}</p>
        ${
			leaveDetails.adminNotes
				? `
        <div class="admin-notes">
          <h4>📝 Admin Notes:</h4>
          <p>${leaveDetails.adminNotes}</p>
        </div>
        `
				: ""
		}
      </div>
      
      ${
			leaveDetails.status === "approved"
				? `
      <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
        <h3>🎉 Congratulations!</h3>
        <p>Your leave request has been approved. Please ensure you have completed any necessary handovers and updated your calendar accordingly.</p>
      </div>
      `
				: `
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3>📞 Next Steps:</h3>
        <p>If you have any questions about this decision, please contact your manager or HR department.</p>
      </div>
      `
		}
      
      <p><strong>Note:</strong> This is an automated notification from the MM HR Management System.</p>
    </div>
    <div class="footer">
      <p>This is an automated notification from MM HR Management System.</p>
      <p>Please do not reply to this email.</p>
    </div>
  </div>
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
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Leave Request</title>
  <style>
    body { font-family: Trebuchet MS, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 5px; }
    .header { background: linear-gradient(135deg, #dc2626, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    .employee-info { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .urgent { background: #fef3c7; border-left: 4px solid #f59e0b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 New Leave Request</h1>
      <p>Action Required - Review and Approve/Reject</p>
    </div>
    <div class="content">
      <h2>Leave Request Notification</h2>
      <p>A new leave request has been submitted and requires your review.</p>
      
      <div class="employee-info">
        <h3>👤 Employee Information:</h3>
        <p><strong>Name:</strong> ${employeeName}</p>
        <p><strong>Email:</strong> ${employeeEmail}</p>
      </div>
      
      <div class="details">
        <h3>📋 Leave Request Details:</h3>
        <p><strong>Leave Type:</strong> ${leaveDetails.leaveType}</p>
        <p><strong>Start Date:</strong> ${new Date(
			leaveDetails.startDate
		).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(
			leaveDetails.endDate
		).toLocaleDateString()}</p>
        <p><strong>Days Requested:</strong> ${leaveDetails.daysRequested}</p>
        ${
			leaveDetails.reason
				? `<p><strong>Reason:</strong> ${leaveDetails.reason}</p>`
				: ""
		}
      </div>
      
      <div class="urgent">
        <h3>⚠️ Action Required:</h3>
        <p>Please log into the HR Management System to review and approve or reject this leave request.</p>
      </div>
      
      <p><strong>Note:</strong> This is an automated notification. Please process this request promptly to ensure proper leave management.</p>
    </div>
    <div class="footer">
      <p>This is an automated notification from MM HR Management System.</p>
      <p>Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;
