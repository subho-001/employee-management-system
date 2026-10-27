const express = require("express");

const { registerUser, loginUser } = require("../controllers/auth.controller");
const validateRegister = require("../middleware/validate-register");
const validateLogin = require("../middleware/validate-login");

const router = express.Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);

module.exports = router;