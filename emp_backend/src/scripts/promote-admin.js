
require("dotenv").config();

const connectDatabase = require("../config/database");
const User = require("../models/user.model");

const promoteAdmin = async () => {
  try {
    // Never allow this development script in production
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "This development script cannot run in production"
      );
    }

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (!email) {
      throw new Error("ADMIN_EMAIL is not configured");
    }

    await connectDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error(
        "User not found. Register the account before promoting it."
      );
    }

    if (user.role === "admin") {
      console.log("This user is already an admin.");
      return;
    }

    user.role = "admin";
    await user.save();

    console.log(`Admin role granted to ${user.email}`);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    const mongoose = require("mongoose");
    await mongoose.disconnect();
  }
};

promoteAdmin();
