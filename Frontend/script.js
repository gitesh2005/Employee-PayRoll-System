const BASE_URL = "https://employee-payroll-system-backend-lo3i.onrender.com/api";

// Track active summary month/year
let currentMonth = "January";
let currentYear = 2026;

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

    // ✅ SAFE UPDATE (will not crash)
    const totalEmpElement = document.getElementById("totalEmployees");
    if (totalEmpElement) {
      totalEmpElement.innerText = employees.length;
    }

  } catch (error) {
    console.error(error); // 🔥 ADD THIS
    alert("Failed to load employees");
  }
}
// ================= ADD EMPLOYEE =================
document.getElementById("employeeForm").addEventListener("submit", async (e) => {
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
  } catch {
    alert("Error adding employee");
  }
});

// ================= DELETE EMPLOYEE =================
async function deleteEmployee(id) {
  if (!confirm("Delete this employee?")) return;

  await fetch(`${BASE_URL}/employees/${id}`, { method: "DELETE" });
  loadEmployees();
}

// ================= FILL PAYROLL FORM =================
function fillPayrollForm(id) {
  document.getElementById("payrollEmployeeId").value = id;
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

// ================= GENERATE PAYROLL =================
document.getElementById("payrollForm").addEventListener("submit", async (e) => {
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
      alert(result.message);
      return;
    }

    alert("Payroll Generated!");

    // Update active month
    currentMonth = data.month;
    currentYear = data.year;

    e.target.reset();
    loadPayroll();
    loadSummary(currentMonth, currentYear);

  } catch {
    alert("Error generating payroll");
  }
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

  // 🔥 AUTO UPDATE SUMMARY USING LATEST RECORD
  if (payrolls.length > 0) {
    const latest = payrolls[payrolls.length - 1];
    loadSummary(latest.month, latest.year);
  } else {
    // If no payroll records
    document.getElementById("totalPayroll").innerText = "₹ 0.00";
    document.getElementById("employeeCount").innerText = "0";
    document.getElementById("highestSalary").innerText = "₹ 0.00";
    document.getElementById("averageSalary").innerText = "₹ 0.00";
  }
}

// ================= DELETE PAYROLL =================
async function deletePayroll(id) {
  if (!confirm("Delete this payroll record?")) return;

  await fetch(`${BASE_URL}/payroll/${id}`, { method: "DELETE" });

  loadPayroll();
  loadSummary(currentMonth, currentYear);
}

// ================= CLEAR ALL PAYROLL =================
async function clearAllPayroll() {
  if (!confirm("Clear ALL payroll records?")) return;

  await fetch(`${BASE_URL}/payroll`, { method: "DELETE" });

  loadPayroll();
  loadSummary(currentMonth, currentYear);
}

// ================= LOAD SUMMARY =================
async function loadSummary(month, year) {
  const res = await fetch(`${BASE_URL}/payroll/summary/${month}/${year}`);
  const data = await res.json();

  document.getElementById("totalPayroll").innerText =
    formatCurrency(data.totalPayroll);

  document.getElementById("employeeCount").innerText =
    data.employeeCount || 0;

  document.getElementById("highestSalary").innerText =
    formatCurrency(data.highestSalary);

  document.getElementById("averageSalary").innerText =
    formatCurrency(data.averageSalary);
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  loadEmployees();
  loadPayroll();
  loadSummary(currentMonth, currentYear);
});


// ================= THEME TOGGLE (SAFE VERSION) =================
document.addEventListener("DOMContentLoaded", function () {

  const themeToggle = document.getElementById("themeToggle");

  if (!themeToggle) return; // prevents crash if button not found

  // Load saved theme
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Light Mode";
  }

  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "☀️ Light Mode";
    } else {
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "🌙 Dark Mode";
    }
  });

});

