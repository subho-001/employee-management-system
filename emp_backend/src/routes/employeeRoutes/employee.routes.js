const express = require('express');
const requireAuth = require("../../middleware/require-auth");
const requireRole = require("../../middleware/require-role");

const { getEmployees, createEmployee, updateEmployee, deleteEmployee } = require("../../controllers/employeeController/employee.controller");

const validateCreateEmployee = require("../../middleware/employeeMiddleware/validate-employee");
const validateUpdateEmployee = require("../../middleware/employeeMiddleware/validate-update-employee");
const validateEmployeeQuery = require("../../middleware/employeeMiddleware/validate-employee-query")

const router = express.Router(); //it lets us group related endpoints into a separate module rather than placing every api route inside server.js

router.get("/", requireAuth, validateEmployeeQuery, getEmployees);
router.post("/", requireAuth, requireRole("admin"), validateCreateEmployee, createEmployee);
router.patch("/:id", requireAuth, requireRole("admin"), validateUpdateEmployee, updateEmployee);
router.delete("/:id", requireAuth, requireRole("admin"), deleteEmployee);

module.exports = router;