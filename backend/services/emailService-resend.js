const { Resend } = require('resend');

class EmailService {
  constructor() {
    // Initialize Resend with API key from environment variables
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendOTP(email, otp) {
    try {
      console.log(`📧 Sending OTP to ${email} via Resend API...`);
      
      const { data, error } = await this.resend.emails.send({
        from: 'Flash Taxi <onboarding@resend.dev>', // Free testing domain
        to: [email],
        subject: '⚡ Your Flash Taxi Verification Code',
        html: this.getOTPEmailTemplate(otp)
      });

      if (error) {
        console.error('❌ Resend error:', error);
        throw error;
      }

      console.log(`✅ OTP sent successfully! Email ID: ${data.id}`);
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      throw error;
    }
  }

  getOTPEmailTemplate(otp) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Poppins', 'Segoe UI', sans-serif;
            background: #0f0f1f;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 30px;
            padding: 40px;
            border: 3px solid #ffd700;
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.3);
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo h1 {
            font-size: 48px;
            font-weight: 900;
            background: linear-gradient(135deg, #e63946 0%, #ffaa00 50%, #ffd700 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0;
            letter-spacing: 4px;
          }
          .logo span {
            font-size: 60px;
            color: #ffd700;
            display: block;
            margin-bottom: 10px;
          }
          .content {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(255, 215, 0, 0.3);
          }
          h2 {
            color: #ffd700;
            text-align: center;
            font-size: 28px;
            margin-bottom: 20px;
            font-weight: 700;
          }
          .otp-box {
            background: linear-gradient(135deg, #e63946 0%, #ffaa00 100%);
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            margin: 25px 0;
            border: 3px solid #ffd700;
            box-shadow: 0 0 30px rgba(230, 57, 70, 0.5);
          }
          .otp-code {
            font-size: 64px;
            font-weight: 900;
            color: #1a1a2e;
            letter-spacing: 10px;
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
            font-family: monospace;
          }
          .message {
            color: #fff;
            text-align: center;
            font-size: 16px;
            margin: 20px 0;
            line-height: 1.6;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: rgba(255, 255, 255, 0.5);
            font-size: 12px;
          }
          .footer::before {
            content: '⚡⚡⚡';
            display: block;
            font-size: 20px;
            color: #ffd700;
            margin-bottom: 10px;
            letter-spacing: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span>⚡</span>
            <h1>FLASH TAXI</h1>
          </div>
          <div class="content">
            <h2>⚡ SPEED FORCE VERIFICATION ⚡</h2>
            <div class="message">
              <p>Your lightning-fast verification code is ready!</p>
            </div>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <div class="message">
              <p>⏱️ This code will expire in 5 minutes</p>
              <p style="font-size: 14px; opacity: 0.8;">Never share this code with anyone</p>
            </div>
          </div>
          <div class="footer">
            <p>⚡ The Fastest Taxi in Central City ⚡</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test connection method
  async verifyConnection() {
    try {
      console.log('🔍 Testing Resend API connection...');
      
      // Send a test email to Resend's test inbox
      const { data, error } = await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: ['delivered@resend.dev'], // Resend's test inbox
        subject: '⚡ Flash Taxi Connection Test',
        html: '<p>✅ Resend API is working perfectly with Flash Taxi!</p>'
      });

      if (error) {
        console.error('❌ Resend connection failed:', error);
        return false;
      }

      console.log('✅ Resend API connected successfully!');
      console.log(`📧 Test email sent! ID: ${data.id}`);
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();