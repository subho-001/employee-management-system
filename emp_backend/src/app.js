const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const notFound = require("./middleware/employeeMiddleware/not-found");
const errorHandler = require("./middleware/employeeMiddleware/error-handler");
const employeeRoutes = require("./routes/employeeRoutes/employee.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Employee Management API is running",
  });
});

app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
