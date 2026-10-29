import { KEYS, loadList, saveList, deleteItem } from "../utils/storage.js";

let employees = [];
const tbody = document.getElementById("employeeTableBody");

function render(searchText = "") {
    const kw = searchText.trim().toLowerCase();
    const filtered = employees.filter((e) =>
        !kw || [e.id, e.name, e.role, e.phone, e.email, e.hire_date || e.hireDate].some((v) => String(v).toLowerCase().includes(kw))
    );
    tbody.replaceChildren();
    if (filtered.length === 0) {
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.textContent = employees.length === 0 ? "No employees yet." : "No employees found.";
        td.colSpan = 7; td.style.textAlign = "center"; td.style.padding = "20px"; td.style.color = "#777";
        row.appendChild(td); tbody.appendChild(row); return;
    }
    filtered.forEach((e) => {
        const row = document.createElement("tr");
        row.dataset.id = e.id;
        [e.id, e.name, e.role, e.phone, e.email, e.hire_date || e.hireDate].forEach((t) => {
            const td = document.createElement("td"); td.textContent = t; row.appendChild(td);
        });
        const actions = document.createElement("td");
        actions.innerHTML = `<button class="edit-button">Edit</button> <button class="delete-button">Delete</button>`;
        row.appendChild(actions); tbody.appendChild(row);
    });
}

function createId() {
    const max = employees.reduce((m, e) => {
        const match = /^EMP-(\d+)$/.exec(e.id);
        return match ? Math.max(m, Number(match[1])) : m;
    }, 0);
    return `EMP-${String(max + 1).padStart(3, "0")}`;
}

export async function initEmployeesPage() {
    if (!tbody) return;
    employees = await loadList(KEYS.employees);

    const form = document.getElementById("employeeForm");
    const modal = document.getElementById("employeeModal");
    const input = document.getElementById("searchEmployeeInput");

    function openModal(emp = null) {
        form.reset();
        document.getElementById("employeeId").value = emp ? emp.id : "";
        document.getElementById("employeeModalTitle").textContent = emp ? "Edit Employee" : "Add Employee";
        document.getElementById("submitEmployeeButton").textContent = emp ? "Update" : "Add";
        if (emp) {
            document.getElementById("employeeName").value = emp.name;
            document.getElementById("employeeRole").value = emp.role;
            document.getElementById("employeePhone").value = emp.phone;
            document.getElementById("employeeEmail").value = emp.email;
            document.getElementById("employeeHireDate").value = emp.hire_date || emp.hireDate;
        }
        modal.style.display = "flex";
    }

    function closeModal() { form.reset(); modal.style.display = "none"; }

    document.getElementById("addEmployeeButton").onclick = () => openModal();
    document.getElementById("closeEmployeeModal").onclick = closeModal;
    document.getElementById("cancelEmployeeForm").onclick = closeModal;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById("employeeId").value;
        const data = {
            id: id || createId(),
            name: document.getElementById("employeeName").value.trim(),
            role: document.getElementById("employeeRole").value,
            phone: document.getElementById("employeePhone").value.trim(),
            email: document.getElementById("employeeEmail").value.trim(),
            hire_date: document.getElementById("employeeHireDate").value,
        };
        if (!data.name || !data.role || !data.phone || !data.email || !data.hire_date) return alert("Complete all fields.");
        
        try {
            await saveList(KEYS.employees, [data]);
            employees = await loadList(KEYS.employees);
            render(input.value);
            closeModal();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        const row = btn?.closest("tr");
        if (!btn || !row?.dataset.id) return;
        const emp = employees.find((x) => x.id === row.dataset.id);
        if (!emp) return;
        
        if (btn.classList.contains("edit-button")) openModal(emp);
        if (btn.classList.contains("delete-button") && confirm(`Delete ${emp.name}?`)) {
            try {
                await deleteItem(KEYS.employees, emp.id);
                employees = await loadList(KEYS.employees);
                render(input.value);
            } catch (err) { alert(`Error: ${err.message}`); }
        }
    });

    document.getElementById("searchEmployeeButton").onclick = () => render(input.value);
    input.oninput = () => render(input.value);
    render();
}