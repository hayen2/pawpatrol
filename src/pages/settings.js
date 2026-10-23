// src/pages/settings.js
import { KEYS, loadObject, saveObject, removeKey } from "../utils/storage.js";

const FIELDS = ["shopName", "address", "phone", "email"];

export function initSettingsPage() {
    const form = document.getElementById("settingsForm");
    if (!form) return;

    const msg = document.getElementById("settingsMessage");

    function fill(settings) {
        document.getElementById("shopName").value = settings?.shopName ?? "";
        document.getElementById("shopAddress").value = settings?.address ?? "";
        document.getElementById("shopPhone").value = settings?.phone ?? "";
        document.getElementById("shopEmail").value = settings?.email ?? "";
        document.getElementById("systemVersion").value = "1.0";
    }

    fill(loadObject(KEYS.settings));

    form.onsubmit = (e) => {
        e.preventDefault();
        const data = {
            shopName: document.getElementById("shopName").value.trim(),
            address: document.getElementById("shopAddress").value.trim(),
            phone: document.getElementById("shopPhone").value.trim(),
            email: document.getElementById("shopEmail").value.trim(),
            version: "1.0",
        };
        if (!data.shopName || !data.address || !data.phone || !data.email) {
            return alert("Complete all fields.");
        }
        saveObject(KEYS.settings, data);
        msg.textContent = "Settings saved.";
        msg.classList.add("is-visible");
    };

    document.getElementById("resetSettings").onclick = () => {
        if (!confirm("Restore defaults?")) return;
        removeKey(KEYS.settings);
        fill(null);
        msg.textContent = "Defaults restored.";
        msg.classList.add("is-visible");
    };
}