const express = require("express");
const cors = require("cors");

const employeeRoutes = require("./Routes/employeeRoutes");
const payrollRoutes = require("./Routes/payrollRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/employees", employeeRoutes);
app.use("/api/payroll", payrollRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

module.exports = app;