const emailService = require('./services/emailService');

async function testEmail() {
  console.log('🔍 Testing email configuration...\n');
  
  // Test 1: Verify SMTP connection
  console.log('Test 1: Verifying SMTP connection...');
  const connected = await emailService.verifyConnection();
  
  if (connected) {
    console.log('✅ SMTP connection successful on port 2525!\n');
    
    // Test 2: Send test OTP
    console.log('Test 2: Sending test OTP...');
    try {
      await emailService.sendOTP(
        process.env.GMAIL_USER, 
        Math.floor(100000 + Math.random() * 900000).toString()
      );
      console.log('✅ Test email sent successfully!\n');
    } catch (error) {
      console.log('❌ Test email failed:', error.message);
    }
  } else {
    console.log('❌ SMTP connection failed');
  }
}

// Load environment variables
require('dotenv').config();
testEmail();