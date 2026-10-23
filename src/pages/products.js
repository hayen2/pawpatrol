// src/pages/products.js
import { KEYS, loadList, saveList } from "../utils/storage.js";

const LOW_STOCK = 5;
let products = [];
const tbody = document.getElementById("productTableBody");

function statusOf(stock) {
    if (stock === 0) return { label: "Out of Stock", cls: "sold" };
    if (stock <= LOW_STOCK) return { label: "Low Stock", cls: "low-stock" };
    return { label: "In Stock", cls: "available" };
}

function render(searchText = "") {
    const kw = searchText.trim().toLowerCase();
    const filtered = products.filter((p) =>
        !kw || [p.id, p.name, p.category, String(p.price), String(p.stock)]
            .some((v) => String(v).toLowerCase().includes(kw))
    );

    tbody.replaceChildren();

    if (filtered.length === 0) {
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.textContent = products.length === 0 ? "No products yet." : "No products found.";
        td.colSpan = 7;
        td.style.textAlign = "center";
        td.style.padding = "20px";
        td.style.color = "#777";
        row.appendChild(td);
        tbody.appendChild(row);
        return;
    }

    filtered.forEach((p) => {
        const row = document.createElement("tr");
        row.dataset.id = p.id;
        [p.id, p.name, p.category, `₱${Number(p.price).toFixed(2)}`, String(p.stock)].forEach((t) => {
            const td = document.createElement("td");
            td.textContent = t;
            row.appendChild(td);
        });

        const status = statusOf(Number(p.stock));
        const statusTd = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = `status ${status.cls}`;
        badge.textContent = status.label;
        statusTd.appendChild(badge);
        row.appendChild(statusTd);

        const actions = document.createElement("td");
        actions.innerHTML = `<button class="edit-button">Edit</button> <button class="delete-button">Delete</button>`;
        row.appendChild(actions);
        tbody.appendChild(row);
    });
}

function createId() {
    const max = products.reduce((m, p) => {
        const match = /^PROD-(\d+)$/.exec(p.id);
        return match ? Math.max(m, Number(match[1])) : m;
    }, 0);
    return `PROD-${String(max + 1).padStart(3, "0")}`;
}

export function initProductsPage() {
    if (!tbody) return;
    products = loadList(KEYS.products);

    const form = document.getElementById("productForm");
    const modal = document.getElementById("productModal");
    const input = document.getElementById("searchProductInput");

    function openModal(product = null) {
        form.reset();
        document.getElementById("productId").value = product ? product.id : "";
        document.getElementById("productModalTitle").textContent = product ? "Edit Product" : "Add Product";
        document.getElementById("submitProductButton").textContent = product ? "Update" : "Add";
        if (product) {
            document.getElementById("productName").value = product.name;
            document.getElementById("productCategory").value = product.category;
            document.getElementById("productPrice").value = product.price;
            document.getElementById("productStock").value = product.stock;
        }
        modal.style.display = "flex";
    }

    function closeModal() {
        form.reset();
        modal.style.display = "none";
    }

    document.getElementById("addProductButton").onclick = () => openModal();
    document.getElementById("closeProductModal").onclick = closeModal;
    document.getElementById("cancelProductForm").onclick = closeModal;

    form.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById("productId").value;
        const price = Number(document.getElementById("productPrice").value);
        const stock = Number(document.getElementById("productStock").value);
        const data = {
            id: id || createId(),
            name: document.getElementById("productName").value.trim(),
            category: document.getElementById("productCategory").value,
            price, stock,
        };
        if (!data.name || !data.category || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
            return alert("Invalid data.");
        }
        if (id) {
            const i = products.findIndex((p) => p.id === id);
            if (i !== -1) products[i] = data;
        } else products.push(data);
        saveList(KEYS.products, products);
        render(input.value);
        closeModal();
    };

    tbody.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        const row = btn?.closest("tr");
        if (!btn || !row?.dataset.id) return;
        const p = products.find((x) => x.id === row.dataset.id);
        if (!p) return;
        if (btn.classList.contains("edit-button")) openModal(p);
        if (btn.classList.contains("delete-button") && confirm(`Delete ${p.name}?`)) {
            products = products.filter((x) => x.id !== p.id);
            saveList(KEYS.products, products);
            render(input.value);
        }
    });

    document.getElementById("searchProductButton").onclick = () => render(input.value);
    input.oninput = () => render(input.value);

    render();
}