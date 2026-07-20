const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const calculateSalary = require("../utils/salaryCalculator");

// GET ALL PAYROLLS
exports.getPayrolls = async (req, res) => {
    try {
        const payrolls = await Payroll.find();
        res.json(payrolls);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch payroll"
        });
    }
};

// GET PAYROLL SUMMARY
exports.getPayrollSummary = async (req, res) => {
    try {
        const payrollData = await Payroll.find();

        if (payrollData.length === 0) {
            return res.json({
                totalPayroll: 0,
                employeeCount: 0,
                highestSalary: 0,
                averageSalary: 0
            });
        }

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

        res.json({
            totalPayroll,
            employeeCount,
            highestSalary,
            averageSalary
        });
    } catch (error) {
        res.status(500).json({
            message: "Error generating summary"
        });
    }
};

// GET PAYROLL BY EMPLOYEE ID
exports.getPayrollByEmployee = async (req, res) => {
    try {
        const payroll = await Payroll.find({
            employeeId: Number(req.params.employeeId)
        });

        if (payroll.length === 0) {
            return res.status(404).json({
                message: "Payroll not found"
            });
        }

        res.json(payroll);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching payroll"
        });
    }
};

// ADD PAYROLL
exports.addPayroll = async (req, res) => {
    try {
        const {
            employeeId,
            month,
            year,
            workingDays,
            presentDays
        } = req.body;

        if (!employeeId || !month || !year || workingDays === undefined || presentDays === undefined) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const workDaysNum = Number(workingDays);
        const presDaysNum = Number(presentDays);

        if (workDaysNum <= 0) {
            return res.status(400).json({
                message: "Working days must be greater than 0"
            });
        }

        if (presDaysNum < 0 || presDaysNum > workDaysNum) {
            return res.status(400).json({
                message: "Present days must be between 0 and working days"
            });
        }

        // Fetch employee details from DB
        const employee = await Employee.findOne({ id: Number(employeeId) });
        if (!employee) {
            return res.status(404).json({
                message: `Employee with ID ${employeeId} not found`
            });
        }

        // Calculate salary breakdown using salaryCalculator utility
        const salaryDetails = calculateSalary(employee.basicSalary, workDaysNum, presDaysNum);

        const payroll = new Payroll({
            id: Date.now(),
            employeeId: Number(employeeId),
            name: employee.name,
            month,
            year: Number(year),
            workingDays: workDaysNum,
            presentDays: presDaysNum,
            earnedSalary: salaryDetails.earnedSalary,
            hra: salaryDetails.hra,
            da: salaryDetails.da,
            pf: salaryDetails.pf,
            tax: salaryDetails.tax,
            netSalary: salaryDetails.netSalary
        });

        const savedPayroll = await payroll.save();
        console.log("PAYROLL SAVED:", savedPayroll);

        res.status(201).json(savedPayroll);
    } catch (error) {
        console.log("PAYROLL ERROR:", error);
        res.status(500).json({
            message: error.message || "Failed to generate payroll"
        });
    }
};

// DELETE SINGLE PAYROLL
exports.deletePayroll = async (req, res) => {
    try {
        const payroll = await Payroll.findOneAndDelete({
            id: Number(req.params.id)
        });

        if (!payroll) {
            return res.status(404).json({
                message: "Payroll not found"
            });
        }

        res.json({
            message: "Payroll deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting payroll"
        });
    }
};

// CLEAR ALL PAYROLLS
exports.clearAllPayrolls = async (req, res) => {
    try {
        await Payroll.deleteMany({});
        res.json({
            message: "All payroll records deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error clearing payroll records"
        });
    }
};