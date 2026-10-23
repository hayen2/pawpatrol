// src/pages/pets.js
import { KEYS, loadList, saveList } from "../utils/storage.js";

let pets = [];
const tbody = document.getElementById("petTableBody");

function statusClass(status) {
    return status === "Available" ? "available" : "sold";
}

function render(searchText = "") {
    const kw = searchText.trim().toLowerCase();
    const filtered = pets.filter((p) =>
        !kw || [p.name, p.type, p.breed, p.gender, p.status]
            .some((v) => String(v).toLowerCase().includes(kw))
    );

    tbody.replaceChildren();

    if (filtered.length === 0) {
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.textContent = pets.length === 0 ? "No pets yet." : "No pets found.";
        td.colSpan = 8;
        td.style.textAlign = "center";
        td.style.padding = "20px";
        td.style.color = "#777";
        row.appendChild(td);
        tbody.appendChild(row);
        return;
    }

    filtered.forEach((pet) => {
        const row = document.createElement("tr");
        row.dataset.id = pet.id;
        [pet.id, pet.name, pet.type, pet.breed, pet.age, pet.gender].forEach((t) => {
            const td = document.createElement("td");
            td.textContent = t;
            row.appendChild(td);
        });

        const statusTd = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = `status ${statusClass(pet.status)}`;
        badge.textContent = pet.status;
        statusTd.appendChild(badge);
        row.appendChild(statusTd);

        const actions = document.createElement("td");
        actions.innerHTML = `<button class="edit-button">Edit</button> <button class="delete-button">Delete</button>`;
        row.appendChild(actions);
        tbody.appendChild(row);
    });
}

function createId() {
    const max = pets.reduce((m, p) => {
        const match = /^PET-(\d+)$/.exec(p.id);
        return match ? Math.max(m, Number(match[1])) : m;
    }, 0);
    return `PET-${String(max + 1).padStart(3, "0")}`;
}

export function initPetsPage() {
    if (!tbody) return;
    pets = loadList(KEYS.pets);

    const form = document.getElementById("petForm");
    const modal = document.getElementById("petModal");
    const input = document.getElementById("searchPetInput");

    function openModal(pet = null) {
        form.reset();
        document.getElementById("petId").value = pet ? pet.id : "";
        document.getElementById("petModalTitle").textContent = pet ? "Edit Pet" : "Add Pet";
        document.getElementById("submitPetButton").textContent = pet ? "Update" : "Add";
        if (pet) {
            document.getElementById("petName").value = pet.name;
            document.getElementById("petType").value = pet.type;
            document.getElementById("petBreed").value = pet.breed;
            document.getElementById("petAge").value = pet.age;
            document.getElementById("petGender").value = pet.gender;
            document.getElementById("petStatus").value = pet.status;
        }
        modal.style.display = "flex";
    }

    function closeModal() {
        form.reset();
        modal.style.display = "none";
    }

    document.getElementById("addPetButton").onclick = () => openModal();
    document.getElementById("closePetModal").onclick = closeModal;
    document.getElementById("cancelPetForm").onclick = closeModal;

    form.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById("petId").value;
        const data = {
            id: id || createId(),
            name: document.getElementById("petName").value.trim(),
            type: document.getElementById("petType").value,
            breed: document.getElementById("petBreed").value.trim(),
            age: document.getElementById("petAge").value,
            gender: document.getElementById("petGender").value,
            status: document.getElementById("petStatus").value,
        };
        if (!data.name || !data.type || !data.breed || !data.age || !data.gender) {
            return alert("Complete all fields.");
        }
        if (id) {
            const i = pets.findIndex((p) => p.id === id);
            if (i !== -1) pets[i] = data;
        } else pets.push(data);
        saveList(KEYS.pets, pets);
        render(input.value);
        closeModal();
    };

    tbody.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        const row = btn?.closest("tr");
        if (!btn || !row?.dataset.id) return;
        const pet = pets.find((p) => p.id === row.dataset.id);
        if (!pet) return;
        if (btn.classList.contains("edit-button")) openModal(pet);
        if (btn.classList.contains("delete-button") && confirm(`Delete ${pet.name}?`)) {
            pets = pets.filter((p) => p.id !== pet.id);
            saveList(KEYS.pets, pets);
            render(input.value);
        }
    });

    document.getElementById("searchPetBtn").onclick = () => render(input.value);
    input.oninput = () => render(input.value);

    render();
}