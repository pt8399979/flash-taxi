const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Use custom SMTP configuration instead of 'service: gmail'
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 2525,           // Changed from default 587 to 2525
      secure: false,         // Use TLS
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false, // Helps with connection issues on some networks
        ciphers: 'SSLv3'           // Sometimes required for Gmail
      },
      connectionTimeout: 30000,     // 30 second timeout (increased from default)
      greetingTimeout: 30000,        // 30 second timeout
      socketTimeout: 30000          // 30 second timeout
    });
  }

  async sendOTP(email, otp) {
    try {
      console.log(`📧 Attempting to send OTP to ${email} using port 2525...`);
      
      const info = await this.transporter.sendMail({
        from: `"⚡ Flash Taxi" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: '⚡ Your Flash Taxi OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 15px; border: 3px solid #ffd700;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #ffd700; font-size: 36px; margin: 0;">⚡ FLASH TAXI ⚡</h1>
            </div>
            <div style="background: rgba(255, 255, 255, 0.1); padding: 25px; border-radius: 10px;">
              <h2 style="color: #fff; text-align: center; margin-bottom: 20px;">Your Verification Code</h2>
              <div style="background: #ffd700; padding: 20px; border-radius: 10px; text-align: center;">
                <span style="font-size: 48px; font-weight: bold; color: #1a1a2e; letter-spacing: 5px;">${otp}</span>
              </div>
              <p style="color: #fff; text-align: center; margin-top: 20px;">This code is valid for 5 minutes</p>
            </div>
            <p style="color: #888; text-align: center; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
          </div>
        `
      });
      
      console.log(`✅ OTP sent successfully to ${email}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      throw error;
    }
  }

  // Optional: Add a test method to verify connection
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified on port 2525');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();