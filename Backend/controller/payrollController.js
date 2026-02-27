const fs = require("fs");
const path = require("path");
const calculateSalary = require("../utils/salaryCalculator");

const employeeFile = path.join(__dirname, "../data/employee.json");
const payrollFile = path.join(__dirname, "../data/payroll.json");

// ================= HELPERS =================
const readEmployees = () => {
  return JSON.parse(fs.readFileSync(employeeFile, "utf-8"));
};

const readPayrolls = () => {
  return JSON.parse(fs.readFileSync(payrollFile, "utf-8"));
};

const savePayrolls = (data) => {
  fs.writeFileSync(payrollFile, JSON.stringify(data, null, 2));
};

// ================= GENERATE PAYROLL =================
exports.generatePayroll = (req, res) => {
  try {
    const { employeeId, workingDays, presentDays, month, year } = req.body;

    if (!employeeId || !workingDays || !presentDays || !month || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const id = Number(employeeId);
    const totalWorking = Number(workingDays);
    const totalPresent = Number(presentDays);

    // ================= VALIDATION =================

    if (isNaN(totalWorking) || totalWorking <= 0 || totalWorking > 31) {
      return res.status(400).json({
        message: "Working days must be between 1 and 31"
      });
    }

    if (isNaN(totalPresent) || totalPresent < 0 || totalPresent > totalWorking) {
      return res.status(400).json({
        message: "Present days cannot exceed working days"
      });
    }

    // ================= CHECK EMPLOYEE =================

    const employees = readEmployees();
    const employee = employees.find(emp => emp.id === id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const payrollData = readPayrolls();

    // Prevent duplicate payroll for same employee same month/year
    const duplicate = payrollData.find(
      p =>
        p.employeeId === id &&
        p.month === month &&
        String(p.year) === String(year)
    );

    if (duplicate) {
      return res.status(400).json({
        message: "Payroll already generated for this month"
      });
    }

    // ================= CALCULATE SALARY =================

    const salary = calculateSalary(
      employee.basicSalary,
      totalWorking,
      totalPresent
    );

    const record = {
      id: Date.now(),
      employeeId: id,
      name: employee.name,
      month,
      year,
      workingDays: totalWorking,
      presentDays: totalPresent,
      ...salary
    };

    payrollData.push(record);
    savePayrolls(payrollData);

    res.status(201).json(record);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating payroll" });
  }
};

// ================= GET ALL PAYROLLS =================
exports.getPayrolls = (req, res) => {
  try {
    const payrollData = readPayrolls();
    res.json(payrollData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payroll data" });
  }
};

// ================= OVERALL SUMMARY (ALL RECORDS) =================
exports.getPayrollSummary = (req, res) => {
    try {
        const payrollData = readPayrolls(); // Helper to read payroll.json

        // If no data exists, return zeros
        if (payrollData.length === 0) {
            return res.json({
                totalPayroll: 0,
                employeeCount: 0,
                highestSalary: 0,
                averageSalary: 0
            });
        }

        // Calculate Totals
        const totalPayroll = payrollData.reduce(
            (sum, p) => sum + (p.netSalary || 0),
            0
        );

        const employeeCount = payrollData.length;

        const highestSalary = Math.max(
            ...payrollData.map(p => p.netSalary || 0)
        );

        const averageSalary = Number(
            (totalPayroll / employeeCount).toFixed(2)
        );

        // Send JSON response to Frontend
        res.json({
            totalPayroll,
            employeeCount,
            highestSalary,
            averageSalary
        });

    } catch (error) {
        console.error("Summary Error:", error);
        res.status(500).json({ message: "Error generating summary" });
    }
};

// ================= DELETE SINGLE PAYROLL =================
exports.deletePayroll = (req, res) => {
  try {
    const id = Number(req.params.id);

    const payrollData = readPayrolls();
    const filtered = payrollData.filter(p => p.id !== id);

    if (filtered.length === payrollData.length) {
      return res.status(404).json({ message: "Payroll record not found" });
    }

    savePayrolls(filtered);

    res.json({ message: "Payroll record deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error deleting payroll record" });
  }
};

// ================= CLEAR ALL PAYROLL =================
exports.clearAllPayroll = (req, res) => {
  try {
    savePayrolls([]);
    res.json({ message: "All payroll records cleared" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing payroll records" });
  }
};