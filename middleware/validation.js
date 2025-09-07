const { check, validationResult } = require("express-validator");
const createError = require("http-errors");

exports.validateRegister = [
  check("email").isEmail().withMessage("Must be a valid email"),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[a-zA-Z]/)
    .withMessage("Password must contain a letter"),
  check("name")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage("Name is required")
    .isLength({ max: 50 })
    .withMessage("Name must be less than 50 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation Error",
        errors: errors.array(),
      });
    }
    next();
  },
];

exports.validateLogin = [
  check("email").isEmail().withMessage("Must be a valid email"),
  check("password").not().isEmpty().withMessage("Password is required"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation Error",
        errors: errors.array(),
      });
    }
    next();
  },
];

exports.validatePassword = [
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[a-zA-Z]/)
    .withMessage("Password must contain a letter"),
  check("password").not().isEmpty().withMessage("Password is required"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation Error",
        errors: errors.array(),
      });
    }
    next();
  },
];
