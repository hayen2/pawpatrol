// src/main.js
import { initDashboard } from "./pages/dashboard.js";
import { initPetsPage } from "./pages/pets.js";
import { initProductsPage } from "./pages/products.js";
import { initCustomersPage } from "./pages/customers.js";
import { initSalesPage } from "./pages/sales.js";
import { initInventoryPage } from "./pages/inventory.js";
import { initEmployeesPage } from "./pages/employees.js";
import { initReportsPage } from "./pages/reports.js";
import { initSettingsPage } from "./pages/settings.js";

const pages = {
    dashboard: initDashboard,
    pets: initPetsPage,
    products: initProductsPage,
    customers: initCustomersPage,
    sales: initSalesPage,
    inventory: initInventoryPage,
    employees: initEmployeesPage,
    reports: initReportsPage,
    settings: initSettingsPage,
};

const initialized = new Set();

function showPage(route) {
    const name = route.replace("#", "") || "dashboard";
    if (!pages[name]) return;

    document.querySelectorAll(".page").forEach((s) => {
        s.classList.toggle("active", s.dataset.page === name);
    });

    document.querySelectorAll("aside a[data-route]").forEach((l) => {
        l.classList.toggle("active", l.dataset.route === name);
    });

    if (!initialized.has(name)) {
        try {
            pages[name]();
            initialized.add(name);
        } catch (err) {
            console.error(`Failed to init ${name}:`, err);
        }
    }
}

window.addEventListener("hashchange", () => showPage(location.hash));
window.addEventListener("DOMContentLoaded", () => showPage(location.hash || "#dashboard"));