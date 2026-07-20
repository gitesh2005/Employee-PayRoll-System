const mongoose = require("mongoose");


const payrollSchema = new mongoose.Schema({

    id:{
        type:Number,
        required:true,
        unique:true
    },

    employeeId:{
        type:Number,
        required:true
    },

    name:String,

    month:String,

    year:Number,

    workingDays:Number,

    presentDays:Number,

    earnedSalary:Number,

    hra:Number,

    da:Number,

    pf:Number,

    tax:Number,

    netSalary:Number

});


module.exports = mongoose.model(
    "Payroll",
    payrollSchema,
    "payrolls"
);