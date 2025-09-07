const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Use Ethereal for development
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

// Email templates
const templates = {
  'license-purchase': (data) => ({
    subject: `License Purchase Confirmation - ${data.pluginName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .license-key { background: #e8f4fd; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 15px 0; font-family: monospace; font-size: 16px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 License Purchase Confirmed!</h1>
            <p>Thank you for your purchase</p>
          </div>
          <div class="content">
            <h2>Hello ${data.userName}!</h2>
            <p>Your license purchase has been successfully processed. Here are your license details:</p>
            
            <h3>Purchase Details:</h3>
            <ul>
              <li><strong>Plugin:</strong> ${data.pluginName}</li>
              <li><strong>License Type:</strong> ${data.licenseType}</li>
              <li><strong>Quantity:</strong> ${data.quantity}</li>
              <li><strong>Total Amount:</strong> $${data.totalAmount}</li>
            </ul>

            <h3>Your License Keys:</h3>
            ${data.licenses.map(license => `
              <div class="license-key">
                <strong>License Key:</strong> ${license.key}<br>
                <strong>Expires:</strong> ${new Date(license.expiresAt).toLocaleDateString()}
              </div>
            `).join('')}

            <p><strong>Important:</strong> Please keep your license keys safe and do not share them publicly.</p>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Access Your Dashboard</a>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>This email was sent from Licensing SaaS Platform</p>
            <p>© 2024 Licensing SaaS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  'license-expired': (data) => ({
    subject: `License Expired - ${data.pluginName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .license-key { background: #ffe6e6; border: 1px solid #ffb3b3; padding: 15px; border-radius: 5px; margin: 15px 0; font-family: monospace; font-size: 16px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ License Expired</h1>
            <p>Your license has expired</p>
          </div>
          <div class="content">
            <h2>Hello ${data.userName}!</h2>
            <p>Your license for <strong>${data.pluginName}</strong> has expired on ${new Date(data.expiresAt).toLocaleDateString()}.</p>
            
            <div class="license-key">
              <strong>Expired License Key:</strong> ${data.licenseKey}
            </div>

            <p>To continue using the plugin, please renew your license or purchase a new one.</p>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Renew License</a>
            
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>This email was sent from Licensing SaaS Platform</p>
            <p>© 2024 Licensing SaaS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  'welcome': (data) => ({
    subject: 'Welcome to Licensing SaaS!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Licensing SaaS!</h1>
            <p>Start selling licenses for your Minecraft plugins</p>
          </div>
          <div class="content">
            <h2>Hello ${data.userName}!</h2>
            <p>Welcome to the most powerful licensing platform for Minecraft plugin developers!</p>
            
            <h3>What you can do:</h3>
            <ul>
              <li>Create and manage license keys for your plugins</li>
              <li>Track license usage and analytics</li>
              <li>Integrate with Discord for easy management</li>
              <li>Accept payments through Stripe</li>
              <li>Get detailed reports and insights</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Get Started</a>
            
            <p>If you need help getting started, check out our documentation or contact support.</p>
          </div>
          <div class="footer">
            <p>This email was sent from Licensing SaaS Platform</p>
            <p>© 2024 Licensing SaaS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    const transporter = createTransporter();
    
    let emailContent;
    if (template && templates[template]) {
      emailContent = templates[template](data);
    } else {
      emailContent = { subject, html, text };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@licensingsaas.com',
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text || emailContent.html.replace(/<[^>]*>/g, '')
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    }
    
    logger.info(`Email sent successfully to ${to}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

// Send bulk emails
const sendBulkEmail = async (recipients, template, data) => {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const result = await sendEmail({
        to: recipient.email,
        template,
        data: { ...data, userName: recipient.name }
      });
      results.push({ success: true, recipient: recipient.email, result });
    } catch (error) {
      results.push({ success: false, recipient: recipient.email, error: error.message });
    }
  }
  
  return results;
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  templates
};
