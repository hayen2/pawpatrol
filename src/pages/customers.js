import { KEYS, loadList, saveList, deleteItem } from "../utils/storage.js";

let customers = [];
const tbody = document.getElementById("customerTableBody");

function render(searchText = "") {
    const kw = searchText.trim().toLowerCase();
    const filtered = customers.filter((c) =>
        !kw || [c.id, c.name, c.phone, c.email, c.address].some((v) => String(v).toLowerCase().includes(kw))
    );
    tbody.replaceChildren();
    if (filtered.length === 0) {
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.textContent = customers.length === 0 ? "No customers yet." : "No customers found.";
        td.colSpan = 6; td.style.textAlign = "center"; td.style.padding = "20px"; td.style.color = "#777";
        row.appendChild(td); tbody.appendChild(row); return;
    }
    filtered.forEach((c) => {
        const row = document.createElement("tr");
        row.dataset.id = c.id;
        [c.id, c.name, c.phone, c.email, c.address].forEach((t) => {
            const td = document.createElement("td"); td.textContent = t; row.appendChild(td);
        });
        const actions = document.createElement("td");
        actions.innerHTML = `<button class="edit-button">Edit</button> <button class="delete-button">Delete</button>`;
        row.appendChild(actions); tbody.appendChild(row);
    });
}

function createId() {
    const max = customers.reduce((m, c) => {
        const match = /^CUST-(\d+)$/.exec(c.id);
        return match ? Math.max(m, Number(match[1])) : m;
    }, 0);
    return `CUST-${String(max + 1).padStart(3, "0")}`;
}

export async function initCustomersPage() {
    if (!tbody) return;
    customers = await loadList(KEYS.customers);

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
    }

    function closeModal() { form.reset(); modal.style.display = "none"; }

    document.getElementById("addCustomerButton").onclick = () => openModal();
    document.getElementById("closeCustomerModal").onclick = closeModal;
    document.getElementById("cancelCustomerForm").onclick = closeModal;

    form.onsubmit = async (e) => {
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
        
        try {
            await saveList(KEYS.customers, [data]); // Save directly to Supabase
            customers = await loadList(KEYS.customers); // Refresh data
            render(input.value);
            closeModal();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        const row = btn?.closest("tr");
        if (!btn || !row?.dataset.id) return;
        const c = customers.find((x) => x.id === row.dataset.id);
        if (!c) return;
        
        if (btn.classList.contains("edit-button")) openModal(c);
        if (btn.classList.contains("delete-button") && confirm(`Delete ${c.name}?`)) {
            try {
                await deleteItem(KEYS.customers, c.id);
                customers = await loadList(KEYS.customers);
                render(input.value);
            } catch (err) { alert(`Error: ${err.message}`); }
        }
    });

    document.getElementById("searchCustomerButton").onclick = () => render(input.value);
    input.oninput = () => render(input.value);
    render();
}