const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER || "your_email@gmail.com",
    pass: process.env.SMTP_PASS || "your_gmail_app_password",
  },
});

module.exports = transporter;
