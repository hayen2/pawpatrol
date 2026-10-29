import { KEYS, loadObject, saveObject, removeKey } from "../utils/storage.js";

export async function initSettingsPage() {
    const form = document.getElementById("settingsForm");
    if (!form) return;

    const msg = document.getElementById("settingsMessage");
    const currentSettings = await loadObject(KEYS.settings);

    function fill(settings) {
        document.getElementById("shopName").value = settings?.shop_name || "";
        document.getElementById("shopAddress").value = settings?.address || "";
        document.getElementById("shopPhone").value = settings?.phone || "";
        document.getElementById("shopEmail").value = settings?.email || "";
        document.getElementById("systemVersion").value = "1.0";
    }

    fill(currentSettings);

    form.onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            shop_name: document.getElementById("shopName").value.trim(),
            address: document.getElementById("shopAddress").value.trim(),
            phone: document.getElementById("shopPhone").value.trim(),
            email: document.getElementById("shopEmail").value.trim(),
            version: "1.0",
        };
        if (!data.shop_name || !data.address || !data.phone || !data.email) return alert("Complete all fields.");
        
        try {
            await saveObject(KEYS.settings, data);
            msg.textContent = "Settings saved to database.";
            msg.classList.add("is-visible");
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    document.getElementById("resetSettings").onclick = async () => {
        if (!confirm("Restore defaults?")) return;
        try {
            await removeKey(KEYS.settings);
            fill(null);
            msg.textContent = "Defaults restored.";
            msg.classList.add("is-visible");
        } catch (err) { alert(`Error: ${err.message}`); }
    };
}