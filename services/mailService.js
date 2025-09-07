const transporter = require("../config/nodemailer");
const User = require("../models/User");

exports.sendVerificationEmail = async (toEmail, toName, verificationToken) => {
  // Configure your SMTP transporte

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Verify your Email",
    html: `
            <h2>Welcome to Fanclip!</h2>
            <p>Hello ${toName}! Click the link below to verify your email address:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>If you did not register, please ignore this email.</p>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

exports.sendResetPasswordEmail = async (to, token) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: `"Fanclip" <${process.env.SMTP_USER}>`,
      to,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};

// module.exports = { sendVerificationEmail };
