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
import { initStorePage } from "./pages/store.js"; // Bagong Store Page

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
    store: initStorePage,
};

const initialized = new Set();

async function showPage(route) {
    const name = route.replace("#", "") || "dashboard";
    if (!pages[name]) return;

    // 1. Itago lahat ng pages
    document.querySelectorAll(".page").forEach((s) => s.classList.remove("active"));
    
    // 2. Ipakita yung target page
    const activePage = document.querySelector(`.page[data-page="${name}"]`);
    if (activePage) activePage.classList.add("active");

    // 3. Update sidebar highlight
    document.querySelectorAll("aside a[data-route]").forEach((l) => {
        l.classList.remove("active");
        if (l.dataset.route === name) l.classList.add("active");
    });

    // 4. Init page logic kung hindi pa
    if (!initialized.has(name)) {
        try {
            await pages[name]();
            initialized.add(name);
        } catch (err) {
            console.error(`Error loading ${name}:`, err);
        }
    }
}

// --- SIDEBAR NAVIGATION (Para hindi mag-reload ang page) ---
document.addEventListener("click", (e) => {
    const link = e.target.closest("aside a[data-route]");
    if (link) {
        e.preventDefault();
        const route = link.dataset.route;
        window.location.hash = route;
        showPage(route);
    }
});

// --- STORE NAVIGATION (Para gumana yung tabs sa loob ng Store) ---
document.addEventListener("click", (e) => {
    const storeTab = e.target.closest(".tab");
    if (storeTab) {
        const tabName = storeTab.dataset.tab;
        if (tabName) {
            e.preventDefault();
            window.location.hash = `store`; // Panatilihing nasa store
            // I-trigger ang store tab logic sa store.js
            if (typeof window.setStoreTab === "function") {
                window.setStoreTab(tabName);
            }
        }
    }
});

// --- INITIAL LOAD & ROUTING ---
window.addEventListener("hashchange", () => {
    // Kung ang hash ay isang store tab, huwag i-trigger ang page reload
    const hash = location.hash.replace("#", "");
    if (["browse", "cart", "pets", "orders"].includes(hash)) {
        // Nasa loob tayo ng store, hayaan ang store.js na mag-handle
        if (typeof window.setStoreTab === "function") {
            window.setStoreTab(hash);
        }
        return;
    }
    showPage(location.hash);
});

window.addEventListener("DOMContentLoaded", () => {
    const session = localStorage.getItem("petShopLocalSession");
    if (!session) {
        window.location.href = "/login.html";
        return;
    }
    showPage(location.hash || "#dashboard");
});