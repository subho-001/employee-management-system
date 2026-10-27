const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Employee email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },

    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
    },

    
createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},

updatedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},

  },
  {
    timestamps: true,
  }
);

// Supports the default newest-first employee listing.
employeeSchema.index({
  createdAt: -1,
  _id: -1,
});

// Supports filtering by department, then listing newest first.
employeeSchema.index({
  department: 1,
  createdAt: -1,
  _id: -1,
});

// Supports sorting employees by salary.
employeeSchema.index({
  salary: 1,
  _id: 1,
});

// Supports sorting employees by name.
employeeSchema.index({
  name: 1,
  _id: 1,
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;