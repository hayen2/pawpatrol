import { KEYS, loadList } from "../utils/storage.js";

export async function initDashboard() {
    // 1. Kunin lahat ng data mula sa Supabase
    const pets = await loadList(KEYS.pets);
    const products = await loadList(KEYS.products);
    const customers = await loadList(KEYS.customers);
    const sales = await loadList(KEYS.sales);

    // 2. I-update ang Stats Cards
    document.getElementById("totalPets").textContent = pets.length;
    document.getElementById("totalProducts").textContent = products.length;
    document.getElementById("totalCustomers").textContent = customers.length;

    const today = new Date().toDateString();
    const todayTotal = sales
        .filter((s) => new Date(s.sold_at || s.date).toDateString() === today)
        .reduce((sum, s) => sum + Number(s.total), 0);
    document.getElementById("todaySales").textContent = `₱${todayTotal.toFixed(2)}`;

    // 3. Recent Sales Table
    const recentBody = document.getElementById("recentSalesBody");
    recentBody.replaceChildren();
    const recent = [...sales].sort((a, b) => new Date(b.sold_at || b.date) - new Date(a.sold_at || a.date)).slice(0, 5);
    
    if (recent.length === 0) {
        recentBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#777;">No sales yet.</td></tr>`;
    } else {
        recent.forEach((s) => {
            const row = document.createElement("tr");
            [s.id, s.customer_name || s.customerName, `₱${Number(s.total).toFixed(2)}`, new Date(s.sold_at || s.date).toLocaleDateString()].forEach((t) => {
                const td = document.createElement("td");
                td.textContent = t;
                row.appendChild(td);
            });
            recentBody.appendChild(row);
        });
    }

    // 4. Low Stock Table
    const lowBody = document.getElementById("lowStockBody");
    lowBody.replaceChildren();
    const low = products.filter((p) => Number(p.stock) <= 5);
    if (low.length === 0) {
        lowBody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#777;">No low stock.</td></tr>`;
    } else {
        low.forEach((p) => {
            const row = document.createElement("tr");
            [p.name, p.stock].forEach((t) => {
                const td = document.createElement("td");
                td.textContent = t;
                row.appendChild(td);
            });
            const statusTd = document.createElement("td");
            statusTd.className = "low";
            statusTd.textContent = Number(p.stock) === 0 ? "Out of Stock" : "Low Stock";
            row.appendChild(statusTd);
            lowBody.appendChild(row);
        });
    }
}