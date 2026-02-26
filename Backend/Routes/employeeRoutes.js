const express = require("express");
const router = express.Router();

const {
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee
} = require("../controller/employeeController");

// Get all employees
router.get("/", getEmployees);

// Get single employee
router.get("/:id", getEmployeeById);

// Add new employee
router.post("/", addEmployee);

// Update employee
router.put("/:id", updateEmployee);

// Delete employee
router.delete("/:id", deleteEmployee);

module.exports = router;