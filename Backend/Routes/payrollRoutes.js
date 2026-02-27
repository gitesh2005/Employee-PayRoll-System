const express = require("express");
const router = express.Router();

const {
    generatePayroll,
    getPayrolls,
    getPayrollSummary,
    deletePayroll,
    clearAllPayroll
} = require("../controller/payrollController");

// ================= ROUTES =================

// POST: Generate a new payroll record
router.post("/", generatePayroll);

// GET: Fetch all payroll history (used for the table)
router.get("/", getPayrolls);

/** * GET: Fetch the overall summary 
 * FIX: Removed /:month/:year because your current controller 
 * logic calculates the summary for ALL records in payroll.json.
 */
router.get("/summary", getPayrollSummary);

// DELETE: Delete a specific record by ID
router.delete("/:id", deletePayroll);

// DELETE: Clear all payroll data
router.delete("/", clearAllPayroll);

module.exports = router;