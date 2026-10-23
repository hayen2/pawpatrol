// src/pages/dashboard.js
import { KEYS, loadList, loadObject } from "../utils/storage.js";

// ---------- Helpers ----------
function formatCurrency(value) {
    return `₱${Number(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function isToday(dateValue) {
    const d = new Date(dateValue);
    const t = new Date();
    return (
        !Number.isNaN(d.getTime()) &&
        d.getFullYear() === t.getFullYear() &&
        d.getMonth() === t.getMonth() &&
        d.getDate() === t.getDate()
    );
}

function appendCell(row, value) {
    const td = document.createElement("td");
    td.textContent = value;
    row.appendChild(td);
}

// ---------- Renderers ----------
function renderStats(pets, products, customers, sales) {
    document.getElementById("totalPets").textContent = String(pets.length);
    document.getElementById("totalProducts").textContent = String(products.length);
    document.getElementById("totalCustomers").textContent = String(customers.length);

    const todayTotal = sales
        .filter((s) => isToday(s.date))
        .reduce((sum, s) => sum + Number(s.total), 0);
    document.getElementById("todaySales").textContent = formatCurrency(todayTotal);
}

function renderRecentSales(sales) {
    const body = document.getElementById("recentSalesBody");
    body.replaceChildren();

    const recent = [...sales]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    if (recent.length === 0) {
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.textContent = "No sales recorded yet.";
        td.colSpan = 4;
        td.style.color = "#777";
        row.appendChild(td);
        body.appendChild(row);
        return;
    }

    recent.forEach((sale) => {
        const row = document.createElement("tr");
        appendCell(row, sale.id);
        appendCell(row, sale.customerName);
        appendCell(row, formatCurrency(sale.total));
        const d = new Date(sale.date);
        appendCell(row, Number.isNaN(d.getTime()) ? "Invalid date" : d.toLocaleDateString());
        body.appendChild(row);
    });
}

function renderLowStock(products) {
    const body = document.getElementById("lowStockBody");
    body.replaceChildren();

    const low = products.filter((p) => Number(p.stock) <= 5);

    if (low.length === 0) {
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.textContent = "No low stock products.";
        td.colSpan = 3;
        td.style.color = "#777";
        row.appendChild(td);
        body.appendChild(row);
        return;
    }

    low.forEach((product) => {
        const row = document.createElement("tr");
        appendCell(row, product.name);
        appendCell(row, String(product.stock));
        const statusTd = document.createElement("td");
        statusTd.className = "low";
        statusTd.textContent = Number(product.stock) === 0 ? "Out of Stock" : "Low Stock";
        row.appendChild(statusTd);
        body.appendChild(row);
    });
}

function renderShopInfo() {
    const settings = loadObject(KEYS.settings) || {};
    document.getElementById("dashboardShopName").textContent =
        settings.shopName || "Not configured";
    document.getElementById("dashboardShopAddress").textContent =
        settings.address || "Not configured";
    document.getElementById("dashboardShopPhone").textContent =
        settings.phone || "Not configured";
    document.getElementById("dashboardShopEmail").textContent =
        settings.email || "Not configured";
}

// ---------- View Details Panel ----------
function createDetailItem(item) {
    const row = document.createElement("div");
    row.className = "dashboard-detail-item";

    const copy = document.createElement("div");
    copy.className = "dashboard-detail-item-copy";

    const title = document.createElement("strong");
    title.textContent = item.title;
    copy.appendChild(title);

    const subtitle = document.createElement("small");
    subtitle.textContent = item.subtitle;
    copy.appendChild(subtitle);
    row.appendChild(copy);

    const tag = document.createElement("span");
    tag.className = "dashboard-detail-tag";
    tag.textContent = item.tag;
    row.appendChild(tag);

    return row;
}

function renderMetricDetails(metricKey, panel, data) {
    const { pets, products, customers, sales } = data;

    const config = {
        pets: {
            title: "Pet Records",
            items: pets.map((pet) => ({
                title: pet.name,
                subtitle: [pet.type, pet.breed, pet.age ? `${pet.age} yr` : ""]
                    .filter(Boolean)
                    .join(" · "),
                tag: pet.status || "Unlisted",
            })),
        },
        products: {
            title: "Product Stock",
            items: products.map((p) => ({
                title: p.name,
                subtitle: `${p.category || "Product"} · ${formatCurrency(p.price)}`,
                tag: `${p.stock} in stock`,
            })),
        },
        customers: {
            title: "Customer Directory",
            items: customers.map((c) => ({
                title: c.name,
                subtitle: [c.email, c.phone].filter(Boolean).join(" · "),
                tag: c.id || "Customer",
            })),
        },
        sales: {
            title: "Sales Today",
            items: sales
                .filter((s) => isToday(s.date))
                .map((sale) => {
                    const d = new Date(sale.date);
                    return {
                        title: sale.customerName || "Walk-in Customer",
                        subtitle: `${sale.id || "Sale"}${
                            Number.isNaN(d.getTime())
                                ? ""
                                : ` · ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                        }`,
                        tag: formatCurrency(sale.total),
                    };
                }),
        },
    };

    const chosen = config[metricKey];
    if (!chosen) return;

    panel.replaceChildren();

    const heading = document.createElement("div");
    heading.className = "dashboard-detail-heading";
    heading.append(document.createTextNode(chosen.title));

    const count = document.createElement("span");
    count.className = "dashboard-detail-count";
    count.textContent = `${chosen.items.length} ${
        chosen.items.length === 1 ? "record" : "records"
    }`;
    heading.appendChild(count);
    panel.appendChild(heading);

    if (chosen.items.length === 0) {
        const empty = document.createElement("p");
        empty.className = "dashboard-detail-empty";
        empty.textContent = "No records to show right now.";
        panel.appendChild(empty);
        return;
    }

    const list = document.createElement("div");
    list.className = "dashboard-detail-list";
    chosen.items.forEach((item) => list.appendChild(createDetailItem(item)));
    panel.appendChild(list);
}

// ---------- Entry Point ----------
export function initDashboard() {
    // Load data (all empty by default — Supabase will replace this)
    const pets = loadList(KEYS.pets);
    const products = loadList(KEYS.products);
    const customers = loadList(KEYS.customers);
    const sales = loadList(KEYS.sales);

    renderStats(pets, products, customers, sales);
    renderRecentSales(sales);
    renderLowStock(products);
    renderShopInfo();

    // Wire "View Details" buttons
    document.querySelectorAll(".dashboard-view-details[data-metric]").forEach((button) => {
        const panel = document.getElementById(button.getAttribute("aria-controls"));
        button.addEventListener("click", () => {
            const expanded = button.getAttribute("aria-expanded") === "true";

            // Close others
            document
                .querySelectorAll(".dashboard-view-details[data-metric]")
                .forEach((b) => {
                    if (b !== button) b.setAttribute("aria-expanded", "false");
                });

            button.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;

            if (!expanded) {
                renderMetricDetails(button.dataset.metric, panel, {
                    pets,
                    products,
                    customers,
                    sales,
                });
            }
        });
    });
}