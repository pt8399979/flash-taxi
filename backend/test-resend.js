// Load environment variables FIRST
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const emailService = require('./services/emailService-resend');

async function testResend() {
  console.log('⚡ Testing Resend API for Flash Taxi...\n');
  
  // Debug: Check if API key is loaded
  console.log('🔍 Checking environment variables:');
  console.log('RESEND_API_KEY present:', process.env.RESEND_API_KEY ? '✅ Yes' : '❌ No');
  console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0);
  
  if (!process.env.RESEND_API_KEY) {
    console.error('\n❌ ERROR: RESEND_API_KEY not found in environment!');
    console.log('\n📝 Troubleshooting:');
    console.log('1. Make sure .env file exists in:', __dirname);
    console.log('2. Check if .env contains: RESEND_API_KEY=re_84rGo9Q1_9uRYBdszBNRrWEP5c1TheCKv');
    console.log('3. Try running: node -r dotenv/config test-resend.js');
    return;
  }
  
  // Test 1: Verify connection
  console.log('\n📋 Test 1: Verifying API connection...');
  const connected = await emailService.verifyConnection();
  
  if (connected) {
    console.log('\n📋 Test 2: Sending test OTP...');
    try {
      // Generate a test OTP
      const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Send to your own email for testing
      await emailService.sendOTP(
        process.env.GMAIL_USER || 'pt8399979@gmail.com',
        testOTP
      );
      
      console.log('\n✅ All tests passed! Resend is working perfectly!');
      console.log(`📧 Check your email for the test OTP: ${testOTP}`);
    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
    }
  }
}

testResend();