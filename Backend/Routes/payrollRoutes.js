const express = require("express");

const router = express.Router();

const {
    getPayrolls,
    getPayrollSummary,
    getPayrollByEmployee,
    addPayroll,
    deletePayroll,
    clearAllPayrolls
} = require("../controller/payrollController");

// Get all payrolls
router.get("/", getPayrolls);

// Payroll summary (keep this BEFORE /:employeeId)
router.get("/summary", getPayrollSummary);

// Get payroll by employee id
router.get("/:employeeId", getPayrollByEmployee);

// Add payroll
router.post("/", addPayroll);

// Clear all payrolls (keep BEFORE /:id)
router.delete("/", clearAllPayrolls);

// Delete payroll by ID
router.delete("/:id", deletePayroll);

module.exports = router;