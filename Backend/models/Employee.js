const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    basicSalary: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Employee", employeeSchema);