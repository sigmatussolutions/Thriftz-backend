require('dotenv').config();

module.exports = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/auth_demo',
  port: process.env.PORT || 5000,
  sessionSecret: process.env.SESSION_SECRET || 'your-secret-key'
};