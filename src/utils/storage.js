// src/utils/storage.js
import { supabase } from "../supabase.js";

export const KEYS = {
    pets: "pets",
    products: "products",
    customers: "customers",
    sales: "sales",
    employees: "employees",
    settings: "shop_settings", // Note: idinagdag sa schema
};

export async function loadList(key) {
    const { data, error } = await supabase.from(key).select("*");
    if (error) {
        console.error(`Error loading ${key}:`, error.message);
        return []; // Nag-return ng empty array kung may error
    }
    return data || [];
}

export async function saveList(key, list) {
    const { error } = await supabase.from(key).upsert(list, { onConflict: "id" });
    if (error) {
        console.error(`Error saving ${key}:`, error.message);
        throw new Error(error.message);
    }
}

export async function deleteItem(key, id) {
    const { error } = await supabase.from(key).delete().eq("id", id);
    if (error) {
        console.error(`Error deleting from ${key}:`, error.message);
        throw new Error(error.message);
    }
}

export async function loadObject(key) {
    const { data, error } = await supabase.from(key).select("*").eq("id", 1).maybeSingle();
    if (error) {
        console.error(`Error loading ${key}:`, error.message);
        return null;
    }
    return data || null;
}

export async function saveObject(key, obj) {
    obj.id = 1; 
    const { error } = await supabase.from(key).upsert(obj, { onConflict: "id" });
    if (error) {
        console.error(`Error saving ${key}:`, error.message);
        throw new Error(error.message);
    }
}

export async function removeKey(key) {
    const { error } = await supabase.from(key).delete().eq("id", 1);
    if (error) {
        console.error(`Error deleting ${key}:`, error.message);
        throw new Error(error.message);
    }
}