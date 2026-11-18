const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Bcrypt processes passwords up to 72 bytes.
    if (Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must not exceed 72 bytes",
      });
    }

    // Hash the password before saving it.
    const passwordHash = await bcrypt.hash(password, 12);

    // Public registration always creates a viewer.
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "viewer",
    });

    // Return only public user fields.
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Explicitly include passwordHash because the schema hides it by default.
    const user = await User.findOne({ email }).select("+passwordHash");

    // Use the same error for an unknown email and an incorrect password.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        subject: user._id.toString(),
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
        algorithm: "HS256",
      }
    );


    const expiresIn = process.env.JWT_EXPIRES_IN || "15m";

    // Set the JWT in an HttpOnly cookie.
    res.cookie("ems_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        tokenType: "Bearer",
        expiresIn,
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
};

module.exports = {
  registerUser,
  loginUser,
};