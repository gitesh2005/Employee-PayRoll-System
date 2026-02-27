exports.getPayrollSummary = (req, res) => {
  try {
    const payrollData = readPayrolls();

    if (payrollData.length === 0) {
      return res.json({
        totalPayroll: 0,
        employeeCount: 0,
        highestSalary: 0,
        averageSalary: 0
      });
    }

    const totalPayroll = payrollData.reduce(
      (sum, p) => sum + p.netSalary,
      0
    );

    const employeeCount = payrollData.length;

    const highestSalary = Math.max(
      ...payrollData.map(p => p.netSalary)
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
    res.status(500).json({ message: "Error generating summary" });
  }
};