const Employee = require("../models/Employee");

console.log("Employee Controller Loaded");


// GET ALL EMPLOYEES
exports.getEmployees = async (req, res) => {
    try {

        const employees = await Employee.find();

        res.json(employees);

    } catch (error) {

        res.status(500).json({
            message: "Error fetching employees",
            error: error.message
        });

    }
};



// GET SINGLE EMPLOYEE BY ID
exports.getEmployeeById = async (req, res) => {

    try {

        const employee = await Employee.findOne({
            id: Number(req.params.id)
        });


        if (!employee) {

            return res.status(404).json({
                message: "Employee not found"
            });

        }


        res.json(employee);


    } catch (error) {

        res.status(500).json({
            message: "Error fetching employee",
            error: error.message
        });

    }

};



// ADD NEW EMPLOYEE
exports.addEmployee = async (req, res) => {

    console.log("ADD EMPLOYEE API HIT");
    console.log(req.body);


    try {

        const {
            name,
            department,
            basicSalary
        } = req.body;



        if (!name || !department || !basicSalary) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }



        const employee = new Employee({

            id: Date.now(),

            name: name,

            department: department,

            basicSalary: Number(basicSalary)

        });



        const savedEmployee = await employee.save();


        console.log("Saved Employee:", savedEmployee);



        res.status(201).json(savedEmployee);



    } catch (error) {


        console.log(error);


        res.status(500).json({

            message: "Error adding employee",

            error: error.message

        });


    }

};



// UPDATE EMPLOYEE
exports.updateEmployee = async (req, res) => {

    try {


        const employee = await Employee.findOneAndUpdate(

            {
                id: Number(req.params.id)
            },

            req.body,

            {
                new: true
            }

        );



        if (!employee) {

            return res.status(404).json({
                message: "Employee not found"
            });

        }



        res.json(employee);



    } catch (error) {


        res.status(500).json({

            message: "Error updating employee",

            error: error.message

        });


    }

};



// DELETE EMPLOYEE
exports.deleteEmployee = async (req, res) => {

    try {


        const employee = await Employee.findOneAndDelete({

            id: Number(req.params.id)

        });



        if (!employee) {

            return res.status(404).json({

                message: "Employee not found"

            });

        }



        res.json({

            message: "Employee deleted successfully"

        });



    } catch (error) {


        res.status(500).json({

            message: "Error deleting employee",

            error: error.message

        });


    }

};