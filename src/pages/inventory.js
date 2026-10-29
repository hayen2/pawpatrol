import { KEYS, loadList, saveList } from "../utils/storage.js";

const LOW_STOCK = 5;
let products = [];
const tbody = document.getElementById("inventoryTableBody");

function statusOf(stock) {
    if (stock === 0) return { label: "Out of Stock", cls: "sold" };
    if (stock <= LOW_STOCK) return { label: "Low Stock", cls: "low-stock" };
    return { label: "In Stock", cls: "available" };
}

function updateSummary() {
    document.getElementById("inventoryProductCount").textContent = products.length;
    document.getElementById("inventoryUnitCount").textContent = products.reduce((t, p) => t + Number(p.stock), 0);
    document.getElementById("inventoryAttentionCount").textContent = products.filter((p) => Number(p.stock) <= LOW_STOCK).length;
}

function render(searchText = "") {
    updateSummary();
    const kw = searchText.trim().toLowerCase();
    const filtered = products.filter((p) =>
        !kw || [p.id, p.name, p.category, String(p.price), String(p.stock)].some((v) => String(v).toLowerCase().includes(kw))
    );
    tbody.replaceChildren();
    if (filtered.length === 0) {
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.textContent = products.length === 0 ? "No products yet." : "No items found.";
        td.colSpan = 7; td.style.textAlign = "center"; td.style.padding = "20px"; td.style.color = "#777";
        row.appendChild(td); tbody.appendChild(row); return;
    }
    filtered.forEach((p) => {
        const row = document.createElement("tr");
        row.dataset.id = p.id;
        [p.id, p.name, p.category, `₱${Number(p.price).toFixed(2)}`, String(p.stock)].forEach((t) => {
            const td = document.createElement("td"); td.textContent = t; row.appendChild(td);
        });
        const status = statusOf(Number(p.stock));
        const statusTd = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = `status ${status.cls}`;
        badge.textContent = status.label;
        statusTd.appendChild(badge); row.appendChild(statusTd);
        const actionTd = document.createElement("td");
        actionTd.innerHTML = `<button class="edit-button">Restock</button>`;
        row.appendChild(actionTd); tbody.appendChild(row);
    });
}

export async function initInventoryPage() {
    if (!tbody) return;
    products = await loadList(KEYS.products);

    const form = document.getElementById("restockForm");
    const modal = document.getElementById("restockModal");
    const input = document.getElementById("searchInventoryInput");

    function openModal(product) {
        form.reset();
        document.getElementById("restockProductId").value = product.id;
        document.getElementById("restockModalTitle").textContent = `Restock ${product.name}`;
        document.getElementById("restockProductDetails").textContent = `Current stock: ${product.stock} | Price: ₱${Number(product.price).toFixed(2)}`;
        document.getElementById("restockQuantity").value = "1";
        modal.style.display = "flex";
    }
    function closeModal() { form.reset(); modal.style.display = "none"; }

    document.getElementById("closeRestockModal").onclick = closeModal;
    document.getElementById("cancelRestockForm").onclick = closeModal;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById("restockProductId").value;
        const qty = Number(document.getElementById("restockQuantity").value);
        if (!Number.isInteger(qty) || qty < 1) return alert("Enter positive whole number.");

        const product = products.find((p) => p.id === id);
        if (!product) return alert("Product not found.");

        const updatedProduct = { ...product, stock: Number(product.stock) + qty };
        
        try {
            await saveList(KEYS.products, [updatedProduct]);
            products = await loadList(KEYS.products);
            render(input.value);
            closeModal();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    tbody.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        const row = btn?.closest("tr");
        if (!btn || !row?.dataset.id) return;
        const p = products.find((x) => x.id === row.dataset.id);
        if (p) openModal(p);
    });

    document.getElementById("searchInventoryButton").onclick = () => render(input.value);
    input.oninput = () => render(input.value);
    render();
}