/**
 * Generates convincing (but safe) phishing email HTML for simulation.
 */
export function getPhishingHTML(templateId, trackingUrl, companyName) {
  const year = new Date().getFullYear();
  
  const templates = {
    it_password_reset: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f8f9fa; padding: 20px; border-bottom: 2px solid #007bff; text-align: center;">
          <h2 style="margin: 0; color: #007bff;">IT Security Notification</h2>
        </div>
        <div style="padding: 30px;">
          <p>Hello,</p>
          <p>This is an automated notification from ${companyName} IT Department. Your network password is set to expire in <strong>24 hours</strong>.</p>
          <p>To avoid any disruption to your account access, please use the button below to verify your current password and set a new one.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${trackingUrl}" style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Update Password Now</a>
          </div>
          <p style="font-size: 13px; color: #666;">Failure to take action will result in your account being locked until an IT ticket is manually processed.</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #999;">
          © ${year} ${companyName} Global IT Services. All rights reserved.
        </div>
      </div>
    `,
    ceo_wire_transfer: `
      <div style="font-family: 'Times New Roman', Times, serif; font-size: 16px; color: #000;">
        <p>Sent from my iPad</p>
        <br>
        <p>Are you at your desk? I have a confidential request that needs immediate attention. I'm in a meeting right now and cannot take calls.</p>
        <p>We need to process an urgent wire transfer to a new vendor before end of business today. Please let me know once you get this so I can send the details. I need you to bypass the normal approval flow just this once as its time sensitive.</p>
        <p>Review the payment instruction sheet here: <a href="${trackingUrl}">${trackingUrl}</a></p>
        <br>
        <p>Regards,</p>
        <p>CEO, ${companyName}</p>
      </div>
    `,
    invoice_attachment: `
      <div style="font-family: sans-serif; color: #444;">
        <div style="padding-bottom: 20px; border-bottom: 1px solid #eee;">
          <img src="https://via.placeholder.com/150x40?text=VENDOR+INVOICE" alt="Vendor Logo" />
        </div>
        <p>Dear Valued Partner,</p>
        <p>Your payment for invoice <strong>#INV-882101</strong> is currently 3 days overdue. We value our partnership, but continued non-payment may result in service interruption.</p>
        <p><strong>Amount Due:</strong> $4,290.00 USD</p>
        <p>Please review the attached breakdown and process payment via our secure portal immediately:</p>
        <p style="margin: 25px 0;">
          <a href="${trackingUrl}" style="background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">View Invoice and Pay</a>
        </p>
        <p>Thank you for your prompt attention to this matter.</p>
        <p>Accounts Receivable Team</p>
      </div>
    `,

    hr_policy_update: `
      <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #2c3e50;">Annual Policy Acknowledgement</h2>
        <p>Dear Employee,</p>
        <p>Our annual update to the **Employee Handbook and Security Policy** is now complete. All employees are required to review and digitally sign the acknowledgement form by the end of today.</p>
        <p>Failure to complete this may result in a temporary suspension of your internal application access.</p>
        <a href="${trackingUrl}" style="background-color: #2c3e50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 15px 0;">Review Policy Update</a>
        <p style="font-size: 12px; color: #7f8c8d;">Internal Reference: HR-2024-POL-09</p>
      </div>
    `,
    mfa_disable_notice: `
      <div style="font-family: Arial, sans-serif; background: #fff4f4; border: 2px solid #e74c3c; padding: 20px; border-radius: 5px;">
        <h3 style="color: #e74c3c; margin-top: 0;">⚠️ Security Notice: MFA Disabled</h3>
        <p>This is to confirm that **Multi-Factor Authentication (MFA)** has been successfully disabled for your account as requested.</p>
        <p>If you did **NOT** request this change, your account may be compromised. Please click the button below immediately to re-enable protection and secure your account.</p>
        <a href="${trackingUrl}" style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; margin: 10px 0;">I Did Not Request This - Secure Account</a>
        <p style="font-size: 12px;">IP Address: 103.55.22.19 (Lagos, NG)</p>
      </div>
    `,

  };

  return templates[templateId] || `
    <p>A new security awareness simulation has been launched by ${companyName}.</p>
    <p>Please click here to participate: <a href="${trackingUrl}">Security Portal</a></p>
  `;
}
