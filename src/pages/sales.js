import { supabase } from "../supabase.js";
import { KEYS, loadList } from "../utils/storage.js";

let sales = [];
let products = [];
let customers = [];
const tbody = document.getElementById("salesTableBody");

function render(searchText = "") {
    const kw = searchText.trim().toLowerCase();
    const filtered = sales.filter((s) =>
        !kw || [s.id, s.customer_name, s.product_name, s.sold_at, String(s.quantity), String(s.total)].some((v) => String(v).toLowerCase().includes(kw))
    );
    tbody.replaceChildren();
    if (filtered.length === 0) {
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.textContent = sales.length === 0 ? "No sales yet." : "No sales found.";
        td.colSpan = 7; td.style.textAlign = "center"; td.style.padding = "20px"; td.style.color = "#777";
        row.appendChild(td); tbody.appendChild(row); return;
    }
    filtered.forEach((s) => {
        const row = document.createElement("tr");
        [s.id, new Date(s.sold_at).toLocaleString(), s.customer_name, s.product_name, String(s.quantity), `₱${Number(s.unit_price).toFixed(2)}`, `₱${Number(s.total).toFixed(2)}`].forEach((t) => {
            const td = document.createElement("td"); td.textContent = t; row.appendChild(td);
        });
        tbody.appendChild(row);
    });
}

export async function initSalesPage() {
    if (!tbody) return;
    sales = await loadList(KEYS.sales);
    products = await loadList(KEYS.products);
    customers = await loadList(KEYS.customers);

    const form = document.getElementById("saleForm");
    const modal = document.getElementById("saleModal");
    const input = document.getElementById("searchSaleInput");
    const customerSel = document.getElementById("saleCustomer");
    const productSel = document.getElementById("saleProduct");
    const qtyInput = document.getElementById("saleQuantity");

    function refreshOptions() {
        customerSel.innerHTML = `<option value="">Select customer</option>` + customers.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
        productSel.innerHTML = `<option value="">Select product</option>` + products.map((p) => `<option value="${p.id}">${p.name} — ₱${Number(p.price).toFixed(2)} (${p.stock} stock)</option>`).join("");
    }

    function updateTotal() {
        const p = products.find((x) => x.id === productSel.value);
        const q = Number(qtyInput.value);
        const total = p && q > 0 ? Number(p.price) * q : 0;
        document.getElementById("saleTotal").textContent = `Total: ₱${total.toFixed(2)}`;
    }

    function openModal() {
        form.reset(); qtyInput.value = "1"; refreshOptions(); updateTotal();
        modal.style.display = "flex";
    }
    function closeModal() { form.reset(); modal.style.display = "none"; }

    document.getElementById("newSaleButton").onclick = openModal;
    document.getElementById("closeSaleModal").onclick = closeModal;
    document.getElementById("cancelSaleForm").onclick = closeModal;
    productSel.onchange = updateTotal;
    qtyInput.oninput = updateTotal;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const customer = customers.find((c) => c.id === customerSel.value);
        const product = products.find((p) => p.id === productSel.value);
        const qty = Number(qtyInput.value);

        if (!customer || !product) return alert("Select customer and product.");
        if (!Number.isInteger(qty) || qty < 1) return alert("Invalid quantity.");
        if (qty > Number(product.stock)) return alert(`Only ${product.stock} in stock.`);

        try {
            // GAMIT ANG RPC FUNCTION PARA SA AUTOMATIC STOCK DEDUCTION
            const { error } = await supabase.rpc('create_sale', {
                p_customer_id: customer.id,
                p_product_id: product.id,
                p_quantity: qty
            });

            if (error) throw error;

            // I-refresh ang data
            sales = await loadList(KEYS.sales);
            products = await loadList(KEYS.products);
            render(input.value);
            closeModal();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    document.getElementById("searchSaleButton").onclick = () => render(input.value);
    input.oninput = () => render(input.value);
    render();
}