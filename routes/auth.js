const express = require("express");
const router = express.Router();
const passport = require("passport");
const authService = require("../services/authService");
const {
  validateRegister,
  validateLogin,
  validatePassword,
} = require("../middleware/validation");

// Local Auth
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user using Local Strategy
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newuser@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123
 *               name:
 *                 type: string
 *                 example: Alice Johnson
 *     responses:
 *       201:
 *         description: User successfully registered and logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f1b0245ef2ab001d1e0a12
 *                     email:
 *                       type: string
 *                       example: newuser@example.com
 *                     name:
 *                       type: string
 *                       example: Alice Johnson
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Email already in use or validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: integer
 *                       example: 400
 *                     message:
 *                       type: string
 *                       example: Email already in use
 */

router.post("/register", validateRegister, authService.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user with email and password using Local Strategy
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mySecurePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f1b0245ef2ab001d1e0a12
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     name:
 *                       type: string
 *                       example: John Doe
 *       400:
 *         description: Validation error (e.g., missing fields, invalid format)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: integer
 *                       example: 400
 *                     message:
 *                       type: string
 *                       example: Validation Error
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           msg:
 *                             type: string
 *                           param:
 *                             type: string
 *                           location:
 *                             type: string
 *       401:
 *         description: Incorrect email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: integer
 *                       example: 401
 *                     message:
 *                       type: string
 *                       example: Incorrect email or password
 */

router.post(
  "/login",
  validateLogin,
  passport.authenticate("local"),
  authService.loginSuccess
);

// Verify Email
router.get("/verify-email", authService.verifyEmail);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Redirect to Google for authentication
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Redirect type ('web' or 'mobile')
 *     responses:
 *       302:
 *         description: Redirect to Google
 */

// Google Auth
router.get("/google", (req, res, next) => {
  const state = req.query.state || "web";
  passport.authenticate("google", {
    prompt: "select_account",
    state, // custom state
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  authService.handleAuthSuccess
);

/**
 * @swagger
 * /auth/facebook:
 *   get:
 *     summary: Redirect to Facebook for authentication
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Redirect type ('web' or 'mobile')
 *     responses:
 *       302:
 *         description: Redirect to Facebook
 */

// Facebook Auth
router.get("/facebook", (req, res, next) => {
  const state = req.query.state || "web";
  passport.authenticate("facebook", {
    scope: ["email"],
    state,
  })(req, res, next);
});

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  authService.handleAuthSuccess
);

/**
 * @swagger
 * /auth/instagram:
 *   get:
 *     summary: Redirect to Instagram for authentication
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Redirect type ('web' or 'mobile')
 *     responses:
 *       302:
 *         description: Redirect to Instagram
 */

// Instagram Auth
app.get(
  "/auth/instagram",
  passport.authenticate("instagram", { scope: ["instagram_business_basic"] })
);

// Route to handle the callback from Instagram
app.get(
  "/auth/instagram/callback",
  passport.authenticate("instagram", {
    failureRedirect: "/login",
  })
);

// Forgot Password
router.post("/forgot-password", authService.forgotPassword);

// Reset Password
router.post("/reset-password", validatePassword, authService.resetPassword);

// Logout
router.get("/logout", authService.logout);

// Get current user
router.get("/current", authService.getCurrentUser);

module.exports = router;
