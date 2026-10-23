// src/pages/customers.js
import { KEYS, loadList, saveList } from "../utils/storage.js";

let customers = [];

const tbody = document.getElementById("customerTableBody");

function render(searchText = "") {
    const kw = searchText.trim().toLowerCase();
    const filtered = customers.filter((c) =>
        [c.id, c.name, c.phone, c.email, c.address].some((v) =>
            String(v).toLowerCase().includes(kw)
        )
    );

    tbody.replaceChildren();

    if (filtered.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.textContent = customers.length === 0 ? "No customers yet." : "No customers found.";
        cell.colSpan = 6;
        cell.style.textAlign = "center";
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    filtered.forEach((c) => {
        const row = document.createElement("tr");
        row.dataset.id = c.id;
        [c.id, c.name, c.phone, c.email, c.address].forEach((text) => {
            const td = document.createElement("td");
            td.textContent = text;
            row.appendChild(td);
        });
        const actions = document.createElement("td");
        actions.innerHTML = `<button class="edit-button">Edit</button> <button class="delete-button">Delete</button>`;
        row.appendChild(actions);
        tbody.appendChild(row);
    });
}

function createId() {
    const max = customers.reduce((m, c) => {
        const match = /^CUST-(\d+)$/.exec(c.id);
        return match ? Math.max(m, Number(match[1])) : m;
    }, 0);
    return `CUST-${String(max + 1).padStart(3, "0")}`;
}

export function initCustomersPage() {
    if (!tbody) return;

    customers = loadList(KEYS.customers);

    const form = document.getElementById("customerForm");
    const modal = document.getElementById("customerModal");
    const input = document.getElementById("searchCustomerInput");

    function openModal(customer = null) {
        form.reset();
        document.getElementById("customerId").value = customer ? customer.id : "";
        document.getElementById("customerModalTitle").textContent = customer ? "Edit Customer" : "Add Customer";
        document.getElementById("submitCustomerButton").textContent = customer ? "Update" : "Add";
        if (customer) {
            document.getElementById("customerName").value = customer.name;
            document.getElementById("customerPhone").value = customer.phone;
            document.getElementById("customerEmail").value = customer.email;
            document.getElementById("customerAddress").value = customer.address;
        }
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
    }

    function closeModal() {
        form.reset();
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
    }

    document.getElementById("addCustomerButton").onclick = () => openModal();
    document.getElementById("closeCustomerModal").onclick = closeModal;
    document.getElementById("cancelCustomerForm").onclick = closeModal;

    form.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById("customerId").value;
        const data = {
            id: id || createId(),
            name: document.getElementById("customerName").value.trim(),
            phone: document.getElementById("customerPhone").value.trim(),
            email: document.getElementById("customerEmail").value.trim(),
            address: document.getElementById("customerAddress").value.trim(),
        };
        if (!data.name || !data.phone || !data.email || !data.address) return alert("Fill all fields.");

        if (id) {
            const i = customers.findIndex((c) => c.id === id);
            if (i !== -1) customers[i] = data;
        } else customers.push(data);

        saveList(KEYS.customers, customers);
        render(input.value);
        closeModal();
    };

    tbody.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        const row = btn?.closest("tr");
        if (!btn || !row?.dataset.id) return;
        const c = customers.find((x) => x.id === row.dataset.id);
        if (!c) return;

        if (btn.classList.contains("edit-button")) openModal(c);
        if (btn.classList.contains("delete-button") && confirm(`Delete ${c.name}?`)) {
            customers = customers.filter((x) => x.id !== c.id);
            saveList(KEYS.customers, customers);
            render(input.value);
        }
    });

    document.getElementById("searchCustomerButton").onclick = () => render(input.value);
    input.oninput = () => render(input.value);

    render();
}