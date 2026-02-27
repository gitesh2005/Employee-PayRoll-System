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

// ================= LOAD SUMMARY =================
async function loadSummary() {
  try {
    const res = await fetch(`${BASE_URL}/payroll/summary`);
    const summary = await res.json();

    // Mapping to your HTML IDs: totalPayroll, employeeCount, highestSalary, averageSalary
    const totalPayrollEl = document.getElementById("totalPayroll");
    const employeeCountEl = document.getElementById("employeeCount");
    const highestSalaryEl = document.getElementById("highestSalary");
    const averageSalaryEl = document.getElementById("averageSalary");

    if (totalPayrollEl) totalPayrollEl.textContent = formatCurrency(summary.totalPayroll);
    if (employeeCountEl) employeeCountEl.textContent = summary.employeeCount;
    if (highestSalaryEl) highestSalaryEl.textContent = formatCurrency(summary.highestSalary);
    if (averageSalaryEl) averageSalaryEl.textContent = formatCurrency(summary.averageSalary);

  } catch (error) {
    console.error("Error loading summary:", error);
  }
}

// ================= GLOBAL FUNCTIONS =================
window.fillPayrollForm = function(id) {
  const input = document.getElementById("payrollEmployeeId");
  if (input) input.value = id;

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth"
  });
};

window.deleteEmployee = async function(id) {
  if (!confirm("Are you sure you want to delete this employee?")) return;
  await fetch(`${BASE_URL}/employees/${id}`, { method: "DELETE" });
  loadEmployees();
  showToast("Employee Deleted");
};

window.deletePayroll = async function(id) {
  if (!confirm("Are you sure you want to delete this record?")) return;
  await fetch(`${BASE_URL}/payroll/${id}`, { method: "DELETE" });
  loadPayroll();
  loadSummary(); // Update cards after delete
  showToast("Payroll Record Deleted");
};

window.clearAllPayroll = async function () {
  if (!confirm("⚠️ This will delete ALL payroll records. Continue?")) return;
  try {
    await fetch(`${BASE_URL}/payroll`, { method: "DELETE" });
    loadPayroll();
    loadSummary(); // Reset cards to zero
    showToast("All Payroll Records Cleared 🗑️");
  } catch (error) {
    showToast("Failed to clear payroll", "error");
  }
};

// ================= LOAD PAYROLL HISTORY =================
async function loadPayroll() {
  try {
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
  } catch (error) {
    console.error("Error loading payroll:", error);
  }
}

// ================= INIT & LISTENERS =================
document.addEventListener("DOMContentLoaded", function () {

  // Add Employee Form
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

  // Generate Payroll Form
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
        loadSummary(); // Updates cards after new entry
        showToast("Payroll Generated Successfully 💰");
      } catch {
        showToast("Error generating payroll", "error");
      }
    });
  }

  // Theme Toggle
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

  // Initial Data Load
  loadEmployees();
  loadPayroll();
  loadSummary(); 
});