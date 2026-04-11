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
    package_delivery: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 500px; border: 1px solid #d4d4d4;">
        <div style="background-color: #ffcc00; padding: 15px;">
          <h2 style="margin: 0; font-size: 18px;">Delivery Exception Notification</h2>
        </div>
        <div style="padding: 20px;">
          <p>We attempted to deliver your package today, but no one was available to sign for it. As a signature is required, we have returned the items to our local sorting facility.</p>
          <p><strong>Tracking:</strong> ${Math.random().toString(36).substring(2, 12).toUpperCase()}</p>
          <p>Please reschedule your delivery or arrange for pickup within 48 hours to avoid the package being returned to the sender.</p>
          <a href="${trackingUrl}" style="display: block; width: 100%; text-align: center; background-color: #333; color: white; padding: 12px 0; text-decoration: none; margin-top: 20px;">Reschedule Delivery</a>
        </div>
      </div>
    `
  };

  return templates[templateId] || `
    <p>A new security awareness simulation has been launched by ${companyName}.</p>
    <p>Please click here to participate: <a href="${trackingUrl}">Security Portal</a></p>
  `;
}
