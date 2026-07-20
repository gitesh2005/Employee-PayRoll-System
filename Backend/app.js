const express = require("express");
const cors = require("cors");

const employeeRoutes = require("./Routes/employeeRoutes");
const payrollRoutes = require("./Routes/payrollRoutes");

const app = express();

// CORS Configuration
app.use(cors({
    origin: [
        "http://localhost:5500",
        "https://employee-payroll-managementsystem.netlify.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Body Parsers
app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/payroll", payrollRoutes);

module.exports = app;