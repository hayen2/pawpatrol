// src/pages/products.js
import { KEYS, loadList, saveList, deleteItem } from "../utils/storage.js";

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

        // 1. ID
        const idTd = document.createElement("td");
        idTd.textContent = p.id;
        row.appendChild(idTd);

        // 2. PRODUCT NAME WITH IMAGE
        const nameTd = document.createElement("td");
        const imageUrl = p.image_url || 'https://placehold.co/40x40/e2e8f0/718096?text=No+Img';
        
        nameTd.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${imageUrl}" alt="${p.name}" style="width: 42px; height: 42px; border-radius: 8px; object-fit: cover; border: 1px solid #edf2f7;">
                <span style="font-weight: 600; color: #1a202c;">${p.name}</span>
            </div>
        `;
        row.appendChild(nameTd);

        // 3. Category
        const catTd = document.createElement("td");
        catTd.textContent = p.category;
        row.appendChild(catTd);

        // 4. Price
        const priceTd = document.createElement("td");
        priceTd.textContent = `₱${Number(p.price).toFixed(2)}`;
        row.appendChild(priceTd);

        // 5. Stock
        const stockTd = document.createElement("td");
        stockTd.textContent = String(p.stock);
        row.appendChild(stockTd);

        // 6. Status
        const status = statusOf(Number(p.stock));
        const statusTd = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = `status ${status.cls}`;
        badge.textContent = status.label;
        statusTd.appendChild(badge);
        row.appendChild(statusTd);

        // 7. Actions
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

export async function initProductsPage() {
    if (!tbody) return;
    products = await loadList(KEYS.products);

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
            
            // Idagdag natin ang image url input kung meron sa HTML mo
            const imgInput = document.getElementById("productImageUrl");
            if (imgInput) imgInput.value = product.image_url || "";
        }
        modal.style.display = "flex";
    }

    function closeModal() { form.reset(); modal.style.display = "none"; }

    document.getElementById("addProductButton").onclick = () => openModal();
    document.getElementById("closeProductModal").onclick = closeModal;
    document.getElementById("cancelProductForm").onclick = closeModal;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById("productId").value;
        const price = Number(document.getElementById("productPrice").value);
        const stock = Number(document.getElementById("productStock").value);
        
        // Kunin ang image URL kung may input field
        const imgInput = document.getElementById("productImageUrl");
        const imageUrl = imgInput ? imgInput.value.trim() : null;
        
        const data = {
            id: id || createId(),
            name: document.getElementById("productName").value.trim(),
            category: document.getElementById("productCategory").value,
            price, 
            stock,
            image_url: imageUrl
        };
        
        if (!data.name || !data.category || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
            return alert("Invalid data.");
        }
        
        try {
            await saveList(KEYS.products, [data]);
            products = await loadList(KEYS.products);
            render(input.value);
            closeModal();
        } catch (err) { 
            alert(`Error: ${err.message}`); 
        }
    };

    tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        const row = btn?.closest("tr");
        if (!btn || !row?.dataset.id) return;
        
        const p = products.find((x) => x.id === row.dataset.id);
        if (!p) return;
        
        if (btn.classList.contains("edit-button")) openModal(p);
        
        if (btn.classList.contains("delete-button") && confirm(`Delete ${p.name}?`)) {
            try {
                await deleteItem(KEYS.products, p.id);
                products = await loadList(KEYS.products);
                render(input.value);
            } catch (err) { 
                alert(`Error: ${err.message}`); 
            }
        }
    });

    document.getElementById("searchProductButton").onclick = () => render(input.value);
    input.oninput = () => render(input.value);
    render();
}