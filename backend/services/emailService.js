// services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  async sendOTP(email, otp) {
    await this.transporter.sendMail({
      from: `"Taxi App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your OTP',
      html: `<h2>Your OTP is: <b>${otp}</b></h2><p>Valid for 5 minutes</p>`
    });
  }
}

module.exports = new EmailService();