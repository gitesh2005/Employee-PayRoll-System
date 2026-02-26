function calculateSalary(basicSalary, workingDays, presentDays) {
    const perDaySalary = basicSalary / workingDays;
    const earnedSalary = perDaySalary * presentDays;

    const hra = earnedSalary * 0.20;
    const da = earnedSalary * 0.10;
    const pf = earnedSalary * 0.05;
    const tax = earnedSalary * 0.08;

    const netSalary = earnedSalary + hra + da - pf - tax;

    return {
        earnedSalary,
        hra,
        da,
        pf,
        tax,
        netSalary
    };
}

module.exports = calculateSalary;
