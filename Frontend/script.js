const BASE_URL = "http://localhost:5000/api";
let cachedEmployees = [];

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
  if (amount === undefined || amount === null) return "₹ 0.00";

  return "₹ " + Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ================= RENDER EMPLOYEES =================
function renderEmployees(employees) {
  const tableBody = document.getElementById("employeeTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (employees.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No employees found.</td></tr>`;
    return;
  }

  employees.forEach(emp => {
    tableBody.innerHTML += `
      <tr>
        <td>${emp.id}</td>
        <td>${emp.name}</td>
        <td>${emp.department}</td>
        <td>${formatCurrency(emp.basicSalary)}</td>
        <td>
          <button class="btn-generate" onclick="fillPayrollForm(${emp.id})">
            Generate
          </button>
          <button class="btn-delete" onclick="deleteEmployee(${emp.id})">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

// ================= LOAD EMPLOYEES =================
async function loadEmployees() {
  try {
    const res = await fetch(`${BASE_URL}/employees`);
    cachedEmployees = await res.json();

    const searchInput = document.getElementById("employeeSearch");
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const filtered = cachedEmployees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm) ||
      emp.department.toLowerCase().includes(searchTerm)
    );

    renderEmployees(filtered);
  } catch (error) {
    showToast("Failed to load employees", "error");
  }
}

// ================= LOAD SUMMARY =================
async function loadSummary() {
  try {
    const res = await fetch(`${BASE_URL}/payroll/summary`);
    const summary = await res.json();

    const totalPayroll = document.getElementById("totalPayroll");
    const employeeCount = document.getElementById("employeeCount");
    const highestSalary = document.getElementById("highestSalary");
    const averageSalary = document.getElementById("averageSalary");

    if (totalPayroll) totalPayroll.textContent = formatCurrency(summary.totalPayroll);
    if (employeeCount) employeeCount.textContent = summary.employeeCount;
    if (highestSalary) highestSalary.textContent = formatCurrency(summary.highestSalary);
    if (averageSalary) averageSalary.textContent = formatCurrency(summary.averageSalary);
  } catch (error) {
    console.log(error);
  }
}

// ================= DELETE EMPLOYEE =================
window.deleteEmployee = async function(id) {
  try {
    await fetch(`${BASE_URL}/employees/${id}`, {
      method: "DELETE"
    });
    loadEmployees();
    showToast("Employee Deleted");
  } catch (error) {
    showToast("Failed to delete employee", "error");
  }
};

// ================= DELETE PAYROLL =================
window.deletePayroll = async function(id) {
  try {
    await fetch(`${BASE_URL}/payroll/${id}`, {
      method: "DELETE"
    });
    loadPayroll();
    loadSummary();
    showToast("Payroll Record Deleted");
  } catch (error) {
    showToast("Failed to delete payroll record", "error");
  }
};

window.clearAllPayroll = async function() {
  try {
    const res = await fetch(`${BASE_URL}/payroll`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to clear payroll");
    }

    loadPayroll();
    loadSummary();
    showToast("All Records Cleared 🗑️");
  } catch (error) {
    showToast(error.message || "Failed to clear payroll", "error");
  }
};

// ================= PAYROLL FORM HELPER =================
window.fillPayrollForm = function(id) {
  const input = document.getElementById("payrollEmployeeId");
  if (input) input.value = id;

  const generateSec = document.getElementById("generateSection");
  if (generateSec) {
    generateSec.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
  }
};

// ================= LOAD PAYROLL HISTORY =================
async function loadPayroll() {
  try {
    const res = await fetch(`${BASE_URL}/payroll`);
    const payrolls = await res.json();

    const tableBody = document.getElementById("payrollTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (payrolls.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No payroll records found.</td></tr>`;
      return;
    }

    payrolls.forEach(p => {
      tableBody.innerHTML += `
        <tr>
          <td>${p.name || "N/A"}</td>
          <td>${p.month}</td>
          <td>${p.year}</td>
          <td>${p.presentDays !== undefined ? p.presentDays : (p.present_days || 0)}</td>
          <td>${formatCurrency(p.netSalary)}</td>
          <td>
            <button class="btn-delete" onclick="deletePayroll(${p.id})">
              Delete
            </button>
          </td>
        </tr>
      `;
    });
  } catch (error) {
    console.log("Payroll loading error:", error);
  }
}

// ================= INIT & LISTENERS =================
document.addEventListener("DOMContentLoaded", function() {

  // ================= SEARCH FILTERING =================
  const searchInput = document.getElementById("employeeSearch");
  if (searchInput) {
    searchInput.addEventListener("input", function(e) {
      const searchTerm = e.target.value.toLowerCase().trim();
      const filtered = cachedEmployees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm) ||
        emp.department.toLowerCase().includes(searchTerm)
      );
      renderEmployees(filtered);
    });
  }

  // ================= EMPLOYEE FORM =================
  const employeeForm = document.getElementById("employeeForm");
  if (employeeForm) {
    employeeForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const salaryVal = Number(document.getElementById("salary").value);
      if (salaryVal < 0) {
        showToast("Salary cannot be negative!", "error");
        return;
      }

      const employee = {
        name: document.getElementById("name").value.trim(),
        department: document.getElementById("department").value,
        basicSalary: salaryVal
      };

      try {
        const res = await fetch(`${BASE_URL}/employees`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(employee)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Error adding employee");
        }

        e.target.reset();
        loadEmployees();
        showToast("Employee Added 🎉");
      } catch (error) {
        showToast(error.message || "Error adding employee", "error");
      }
    });
  }

  // ================= PAYROLL FORM =================
  const payrollForm = document.getElementById("payrollForm");
  if (payrollForm) {
    payrollForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const workingDays = Number(document.getElementById("workingDays").value);
      const presentDays = Number(document.getElementById("presentDays").value);

      if (workingDays <= 0) {
        showToast("Working days must be greater than 0!", "error");
        return;
      }

      if (presentDays < 0 || presentDays > workingDays) {
        showToast("Present days cannot exceed working days!", "error");
        return;
      }

      const data = {
        employeeId: Number(document.getElementById("payrollEmployeeId").value),
        month: document.getElementById("month").value,
        year: Number(document.getElementById("year").value),
        workingDays,
        presentDays
      };

      try {
        const res = await fetch(`${BASE_URL}/payroll`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
          showToast(result.message || "Error generating payroll", "error");
          return;
        }

        e.target.reset();
        loadPayroll();
        loadSummary();
        showToast("Payroll Generated 💰");
      } catch (error) {
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

    themeToggle.addEventListener("click", function() {
      const isDark = document.body.classList.toggle("dark");
      if (isDark) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️ Light Mode";
      } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙 Dark Mode";
      }
    });
  }

  // ================= INITIAL LOAD =================
  loadEmployees();
  loadPayroll();
  loadSummary();

});