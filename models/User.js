const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  name: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  verificationTokenExpiry: {
    type: Date,
  },
  avatar: String,
  password: {
    type: String,
    minlength: 8,
    required: function () {
      return !this.providers?.some((p) => p.name !== "local"); // password required only if 'local' is the only provider
    },
  },
  passwordChangedAt: Date,
  providers: [
    {
      name: {
        type: String,
        enum: ["local", "google", "facebook", "instagram", "apple"],
        required: true,
      },
      providerId: {
        type: String,
        required: true,
      },
    },
  ],
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpiry: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Method to compare passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.isProviderLinked = function (providerName) {
  return this.providers.some((p) => p.name === providerName);
};

// Static method to find or create user
userSchema.statics.findOrCreate = async function (userData) {
  const { email, name, avatar, provider } = userData;
  const { name: providerName, providerId } = provider;

  let user = await this.findOne({ email });

  if (user) {
    const alreadyLinked = user.providers.some((p) => p.name === providerName);

    if (!alreadyLinked) {
      user.providers.push({ name: providerName, providerId });
      await user.save();
    }
  } else {
    user = await this.create({
      email,
      name,
      avatar,
      providers: [{ name: providerName, providerId }],
    });
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
