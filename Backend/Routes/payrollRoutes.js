const express = require("express");
const router = express.Router();

const {
  generatePayroll,
  getPayrolls,
  getPayrollSummary,
  deletePayroll,
  clearAllPayroll
} = require("../controller/payrollController");

router.post("/", generatePayroll);
router.get("/", getPayrolls);
router.get("/summary/:month/:year", getPayrollSummary);
router.delete("/:id", deletePayroll);
router.delete("/", clearAllPayroll);

module.exports = router;