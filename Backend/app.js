const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5500",
        "https://employee-payroll-managementsystem.netlify.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));

module.exports = app;