const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const notFound = require("./middleware/employeeMiddleware/not-found");
const errorHandler = require("./middleware/employeeMiddleware/error-handler");
const employeeRoutes = require("./routes/employeeRoutes/employee.routes");
const authRoutes = require("./routes/auth.routes")

const app = express();

app.disable("x-powered-by") //app.disable("x-powered-by") removes an unnecessary framework-identification header.

app.use(helmet()); //helmet() adds security-related HTTP headers.

app.use(
  cors({ //cors() allows requests from our configured frontend origin.
    origin: process.env.FRONTEND_URL,
  })
);

app.use(express.json({ limit: "1mb" })); //express.json() parses incoming JSON request bodies.

if (process.env.NODE_ENV !== "production") { //morgan() logs HTTP requests during development.
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => { ///api/health gives us a simple endpoint to test whether the API is responding.
  res.status(200).json({
    success: true,
    message: "Employee Management API is running",
  });
});

// Register employee API routes HERE
app.use("/api/employees", employeeRoutes);

app.use("/api/auth", authRoutes);

app.use(notFound); //notFound() handles requests to routes that don't exist.
app.use(errorHandler); 

module.exports = app;