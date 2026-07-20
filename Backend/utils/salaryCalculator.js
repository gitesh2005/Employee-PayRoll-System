// backend/utils/salaryCalculator.js

function calculateSalary(basicSalary, workingDays, presentDays) {
    const basic = Number(basicSalary);
    const total = Number(workingDays);
    const present = Number(presentDays);

    // 1. Calculate the Earned Basic
    // Formula: (Basic Salary * Present Days) / Total Working Days
    let earnedSalary = (basic * present) / total;

    // 2. Round to 2 decimal places to avoid floating point errors (like 12500.0000001)
    const finalNet = Math.round(earnedSalary * 100) / 100;

    // 3. Return the object structure your controller expects (...salary)
    return {
        earnedSalary: finalNet,
        hra: 0,
        da: 0,
        pf: 0,
        tax: 0,
        netSalary: finalNet
    };
}

module.exports = calculateSalary;