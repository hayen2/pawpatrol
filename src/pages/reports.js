// src/pages/reports.js
import { KEYS, loadList } from "../utils/storage.js";

const LOW_STOCK = 5;
let sales = [];
let products = [];

function dateKey(v) {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function renderSales(start = "", end = "") {
    const filtered = sales
        .filter((s) => {
            const k = dateKey(s.date);
            return k && (!start || k >= start) && (!end || k <= end);
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const revenue = filtered.reduce((t, s) => t + Number(s.total), 0);
    const units = filtered.reduce((t, s) => t + Number(s.quantity), 0);
    const avg = filtered.length ? revenue / filtered.length : 0;

    document.getElementById("reportRevenue").textContent = `₱${revenue.toFixed(2)}`;
    document.getElementById("reportTransactionCount").textContent = filtered.length;
    document.getElementById("reportUnitsSold").textContent = units;
    document.getElementById("reportAverageSale").textContent = `₱${avg.toFixed(2)}`;

    const body = document.getElementById("reportSalesBody");
    body.replaceChildren();
    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#777;">No sales.</td></tr>`;
    } else {
        filtered.forEach((s) => {
            const row = document.createElement("tr");
            [s.id, new Date(s.date).toLocaleString(), s.customerName, s.productName,
             String(s.quantity), `₱${Number(s.total).toFixed(2)}`].forEach((t) => {
                const td = document.createElement("td");
                td.textContent = t;
                row.appendChild(td);
            });
            body.appendChild(row);
        });
    }

    document.getElementById("reportPeriod").textContent =
        start && end ? `From ${start} to ${end}` :
        start ? `From ${start}` :
        end ? `Through ${end}` :
        "Showing all sales";
}

function renderLowStock() {
    const low = products
        .filter((p) => Number(p.stock) <= LOW_STOCK)
        .sort((a, b) => Number(a.stock) - Number(b.stock));
    const body = document.getElementById("reportLowStockBody");
    body.replaceChildren();
    if (low.length === 0) {
        body.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#777;">No low stock.</td></tr>`;
    } else {
        low.forEach((p) => {
            const row = document.createElement("tr");
            [p.name, p.category, String(p.stock)].forEach((t) => {
                const td = document.createElement("td");
                td.textContent = t;
                row.appendChild(td);
            });
            const statusTd = document.createElement("td");
            statusTd.className = "low";
            statusTd.textContent = Number(p.stock) === 0 ? "Out of Stock" : "Low Stock";
            row.appendChild(statusTd);
            body.appendChild(row);
        });
    }
}

export function initReportsPage() {
    sales = loadList(KEYS.sales);
    products = loadList(KEYS.products);

    document.getElementById("reportFilterForm").onsubmit = (e) => {
        e.preventDefault();
        const s = document.getElementById("reportStartDate").value;
        const en = document.getElementById("reportEndDate").value;
        if (s && en && s > en) return alert("Start must be before end.");
        renderSales(s, en);
    };

    document.getElementById("clearReportDates").onclick = () => {
        document.getElementById("reportFilterForm").reset();
        renderSales();
    };

    renderSales();
    renderLowStock();
}