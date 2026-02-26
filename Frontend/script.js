const BASE_URL = "https://employee-payroll-system-backend-lo3i.onrender.com/api";

// ================= TOAST FUNCTION =================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

// ================= FORMAT CURRENCY =================
function formatCurrency(amount) {
  if (!amount) return "₹ 0.00";
  return "₹ " + Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ================= LOAD EMPLOYEES =================
async function loadEmployees() {
  try {
    const res = await fetch(`${BASE_URL}/employees`);
    const employees = await res.json();

    const tableBody = document.getElementById("employeeTableBody");
    tableBody.innerHTML = "";

    employees.forEach(emp => {
      tableBody.innerHTML += `
        <tr>
          <td>${emp.id}</td>
          <td>${emp.name}</td>
          <td>${emp.department}</td>
          <td>${formatCurrency(emp.basicSalary)}</td>
          <td>
            <button onclick="fillPayrollForm(${emp.id})">Generate</button>
            <button onclick="deleteEmployee(${emp.id})">Delete</button>
          </td>
        </tr>
      `;
    });

  } catch (error) {
    showToast("Failed to load employees", "error");
  }
}

// ================= GLOBAL FUNCTIONS FOR BUTTONS =================
window.fillPayrollForm = function(id) {
  const input = document.getElementById("payrollEmployeeId");
  if (input) input.value = id;

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth"
  });
};

window.deleteEmployee = async function(id) {
  await fetch(`${BASE_URL}/employees/${id}`, { method: "DELETE" });
  loadEmployees();
  showToast("Employee Deleted");
};

window.deletePayroll = async function(id) {
  await fetch(`${BASE_URL}/payroll/${id}`, { method: "DELETE" });
  loadPayroll();
  showToast("Payroll Record Deleted");
};

// ================= ADD EMPLOYEE =================
document.addEventListener("DOMContentLoaded", function () {

  const employeeForm = document.getElementById("employeeForm");

  if (employeeForm) {
    employeeForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const employee = {
        name: document.getElementById("name").value,
        department: document.getElementById("department").value,
        basicSalary: Number(document.getElementById("salary").value)
      };

      try {
        const res = await fetch(`${BASE_URL}/employees`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(employee)
        });

        if (!res.ok) throw new Error();

        e.target.reset();
        loadEmployees();
        showToast("Employee Added Successfully 🎉");

      } catch {
        showToast("Error adding employee", "error");
      }
    });
  }

  const payrollForm = document.getElementById("payrollForm");

  if (payrollForm) {
    payrollForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        employeeId: Number(document.getElementById("payrollEmployeeId").value),
        month: document.getElementById("month").value,
        year: Number(document.getElementById("year").value),
        workingDays: Number(document.getElementById("workingDays").value),
        presentDays: Number(document.getElementById("presentDays").value)
      };

      try {
        const res = await fetch(`${BASE_URL}/payroll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
          showToast(result.message, "error");
          return;
        }

        e.target.reset();
        loadPayroll();
        showToast("Payroll Generated Successfully 💰");

      } catch {
        showToast("Error generating payroll", "error");
      }
    });
  }

  // ================= THEME TOGGLE =================
  const themeToggle = document.getElementById("themeToggle");

  if (themeToggle) {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.body.classList.add("dark");
      themeToggle.textContent = "☀️ Light Mode";
    }

    themeToggle.addEventListener("click", function () {
      document.body.classList.toggle("dark");

      if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️ Light Mode";
      } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙 Dark Mode";
      }
    });
  }

  // ================= INIT =================
  loadEmployees();
  loadPayroll();
});

// ================= LOAD PAYROLL =================
async function loadPayroll() {
  const res = await fetch(`${BASE_URL}/payroll`);
  const payrolls = await res.json();

  const tableBody = document.getElementById("payrollTableBody");
  tableBody.innerHTML = "";

  payrolls.forEach(p => {
    tableBody.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.month}</td>
        <td>${p.year}</td>
        <td>${p.presentDays}</td>
        <td>${formatCurrency(p.netSalary)}</td>
        <td>
          <button onclick="deletePayroll(${p.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}


window.clearAllPayroll = async function () {
  try {
    await fetch(`${BASE_URL}/payroll`, { method: "DELETE" });
    loadPayroll();
    showToast("All Payroll Records Cleared 🗑️");
  } catch (error) {
    showToast("Failed to clear payroll", "error");
  }
};