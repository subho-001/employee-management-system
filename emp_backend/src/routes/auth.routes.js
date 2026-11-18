
const express = require("express");

const { registerUser, loginUser } = require("../controllers/auth.controller");
const validateRegister = require("../middleware/validate-register");
const validateLogin = require("../middleware/validate-login");
const requireAuth = require("../middleware/require-auth");
const User = require("../models/user.model");

const router = express.Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);

// Return the currently authenticated user's public information.
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("name email role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Clear the authentication cookie.
router.post("/logout", (req, res) => {
  res.clearCookie("ems_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
