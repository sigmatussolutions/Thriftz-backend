const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");

router.get("/", (req, res) => {
  res.send("Welcome to Fanclip Backend");
});
router.use("/auth", authRoutes);
// router.use('/music', require('./music'));
// router.use('/video', require('./video'));
// router.use('/pdf', require('./pdf'));

module.exports = router;
