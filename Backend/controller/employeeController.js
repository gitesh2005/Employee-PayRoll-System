const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/employee.json");

// helper functions
const readEmployees = () => {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
};

const saveEmployees = (employees) => {
  fs.writeFileSync(filePath, JSON.stringify(employees, null, 2));
};

// GET all employees
exports.getEmployees = (req, res) => {
  try {
    const employees = readEmployees();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};

// GET single employee
exports.getEmployeeById = (req, res) => {
  try {
    const employees = readEmployees();
    const id = parseInt(req.params.id);

    const employee = employees.find(emp => emp.id === id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee" });
  }
};

// ADD new employee
exports.addEmployee = (req, res) => {
  try {
    const { name, department, basicSalary } = req.body;

    if (!name || !department || !basicSalary) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const employees = readEmployees();

    const newEmployee = {
      id: Date.now(),
      name,
      department,
      basicSalary: Number(basicSalary)
    };

    employees.push(newEmployee);
    saveEmployees(employees);

    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ message: "Error adding employee" });
  }
};

// UPDATE employee
exports.updateEmployee = (req, res) => {
  try {
    const employees = readEmployees();
    const id = parseInt(req.params.id);

    const index = employees.findIndex(emp => emp.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const { name, department, basicSalary } = req.body;

    employees[index] = {
      ...employees[index],
      name: name || employees[index].name,
      department: department || employees[index].department,
      basicSalary: basicSalary
        ? Number(basicSalary)
        : employees[index].basicSalary
    };

    saveEmployees(employees);

    res.json(employees[index]);
  } catch (error) {
    res.status(500).json({ message: "Error updating employee" });
  }
};

// DELETE employee
exports.deleteEmployee = (req, res) => {
  try {
    const employees = readEmployees();
    const id = parseInt(req.params.id);

    const filteredEmployees = employees.filter(emp => emp.id !== id);

    if (filteredEmployees.length === employees.length) {
      return res.status(404).json({ message: "Employee not found" });
    }

    saveEmployees(filteredEmployees);

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting employee" });
  }
};