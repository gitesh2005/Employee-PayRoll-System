const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const calculateSalary = require("./salaryCalculator");

async function migrate() {
    try {
        console.log("Starting DB migration & recalculation...");

        // Connect to MongoDB Atlas (target: EmployeePayroll by default from MONGO_URI)
        const client = await mongoose.connect(process.env.MONGO_URI);
        const adminDb = client.connection.db.admin();

        // Access 'test' database and 'EmployeePayroll' database
        const testDb = client.connection.client.db("test");
        const empPayrollDb = client.connection.client.db("EmployeePayroll");

        // Migrate employees from test to EmployeePayroll if present
        const testEmployees = await testDb.collection("employees").find().toArray();
        if (testEmployees.length > 0) {
            console.log(`Migrating ${testEmployees.length} employees from 'test' to 'EmployeePayroll'...`);
            for (const emp of testEmployees) {
                await empPayrollDb.collection("employees").updateOne(
                    { id: emp.id },
                    { $set: emp },
                    { upsert: true }
                );
            }
        }

        // Migrate payrolls from test to EmployeePayroll if present
        const testPayrolls = await testDb.collection("payrolls").find().toArray();
        if (testPayrolls.length > 0) {
            console.log(`Migrating ${testPayrolls.length} payrolls from 'test' to 'EmployeePayroll'...`);
            for (const pay of testPayrolls) {
                await empPayrollDb.collection("payrolls").updateOne(
                    { id: pay.id },
                    { $set: pay },
                    { upsert: true }
                );
            }
        }

        // Recalculate 0-salary payrolls in EmployeePayroll
        const employeesList = await empPayrollDb.collection("employees").find().toArray();
        const empMap = new Map();
        employeesList.forEach(e => empMap.set(e.id, e));

        const zeroPayrolls = await empPayrollDb.collection("payrolls").find({
            $or: [
                { netSalary: 0 },
                { netSalary: { $exists: false } },
                { netSalary: null }
            ]
        }).toArray();

        console.log(`Found ${zeroPayrolls.length} payroll records with 0/missing netSalary in EmployeePayroll.`);

        for (const pay of zeroPayrolls) {
            const emp = empMap.get(pay.employeeId);
            if (emp && emp.basicSalary) {
                const workDays = pay.workingDays || 30;
                const presDays = pay.presentDays !== undefined ? pay.presentDays : (pay.present_days || 0);
                const salary = calculateSalary(emp.basicSalary, workDays, presDays);

                await empPayrollDb.collection("payrolls").updateOne(
                    { _id: pay._id },
                    {
                        $set: {
                            name: emp.name,
                            earnedSalary: salary.earnedSalary,
                            hra: salary.hra,
                            da: salary.da,
                            pf: salary.pf,
                            tax: salary.tax,
                            netSalary: salary.netSalary
                        }
                    }
                );
                console.log(`Recalculated payroll ID ${pay.id} for ${emp.name}: Net Salary = ${salary.netSalary}`);
            }
        }

        console.log("✅ Migration & Recalculation Complete!");
        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error("❌ Migration error:", error);
        process.exit(1);
    }
}

migrate();
