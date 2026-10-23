// src/utils/storage.js

export const KEYS = {
    pets: "petShopPets",
    products: "petShopProducts",
    customers: "petShopCustomers",
    sales: "petShopSales",
    employees: "petShopEmployees",
    settings: "petShopSettings",
};

export function loadList(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
}

export function saveList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}

export function loadObject(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
}

export function saveObject(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
}

export function removeKey(key) {
    localStorage.removeItem(key);
}