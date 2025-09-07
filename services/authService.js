const User = require("../models/User");
const createError = require("http-errors");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("./mailService");
const crypto = require("crypto");

exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    console.log("Registering user:", { email, name });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError(400, "Email already in use");
    }
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const newUser = await User.create({
      email,
      password,
      name,
      isVerified: false,
      verificationToken,
      providers: [{ name: "local", providerId: email }], // using email as local providerId
    });

    const mail = await sendVerificationEmail(
      newUser.email,
      newUser.name,
      verificationToken
    );
    console.log(mail);

    res.status(201).json({
      status: "success",
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token;
    console.log(token);
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      throw new Error("Invalid or expired token.");
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ status: "success", message: "Email verified successfully!" });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(400)
      .json({ status: "error", message: "Incorrect email." });
  if (!user.isVerified)
    return res
      .status(400)
      .json({ status: "error", message: "Email not verified." });
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpiry = Date.now() + 3600000; // 1 hour
  await user.save();
  await sendResetPasswordEmail(user.email, token);
  res.json({
    message: "If that email is registered, a reset link has been sent.",
  });
};

exports.resetPassword = async (req, res, next) => {
  const { password } = req.body;
  const token = req.query.token;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token." });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();
  res.json({ message: "Password has been reset successfully." });
};

exports.loginSuccess = (req, res) => {
  res.status(200).json({
    status: "success",
    user: {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
    },
  });
};

exports.handleAuthSuccess = (req, res) => {
  // Successful authentication, redirect or send response
  const userData = {
    _id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    avatar: req.user.avatar,
  };

  const state = req.query.state || "web";

  if (state === "web") {
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/success?user=${encodeURIComponent(
        JSON.stringify(userData)
      )}`
    );
  } else {
    res.redirect(
      `${process.env.MOBILE_URL}/auth/success?user=${encodeURIComponent(
        JSON.stringify(userData)
      )}`
    );
  }
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Error logging out" });
    req.session.destroy((err) => {
      if (err)
        return res.status(500).json({ message: "Error destroying session" });
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
};

exports.getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    const { _id, email, name, avatar } = req.user;
    res.json({
      user: {
        _id,
        email,
        name,
        avatar,
      },
    });
  } else {
    res.status(401).json({ user: null });
  }
};
