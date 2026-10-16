/* ============================================================
   STACKLY ADVENTURE — seller.js (seller panel + package CRUD)
   ============================================================ */
"use strict";

const SA_SELLER = {
  KEY: "sa_packages",
  seed() {
    if (!localStorage.getItem(this.KEY)) {
      localStorage.setItem(this.KEY, JSON.stringify([
        { id: 1, title: "Bali Island Escape", destination: "Bali, Indonesia", price: 49999, duration: "5 Days / 4 Nights", image: "../img/destinations/bali.webp", description: "Beaches, temples and volcano sunrise trek with premium stays.", rating: 4.9 },
        { id: 2, title: "Swiss Alpine Adventure", destination: "Interlaken, Switzerland", price: 89999, duration: "7 Days / 6 Nights", image: "../img/destinations/switzerland.webp", description: "Paragliding, glacier hikes and scenic rail journeys.", rating: 4.8 },
        { id: 3, title: "Maldives Luxury Retreat", destination: "Malé, Maldives", price: 74999, duration: "4 Days / 3 Nights", image: "../img/destinations/maldives.webp", description: "Overwater villa, scuba diving and sunset dolphin cruise.", rating: 5.0 },
        { id: 4, title: "Manali Snow Expedition", destination: "Manali, India", price: 24999, duration: "4 Days / 3 Nights", image: "../img/destinations/manali.webp", description: "Snow trekking, igloo camping and Solang valley skiing.", rating: 4.7 },
      ]));
    }
  },
  all() { this.seed(); return JSON.parse(localStorage.getItem(this.KEY)); },
  save(list) { localStorage.setItem(this.KEY, JSON.stringify(list)); },
  add(pkg) { const l = this.all(); pkg.id = Date.now(); l.push(pkg); this.save(l); },
  update(id, data) { this.save(this.all().map((p) => (p.id === id ? { ...p, ...data } : p))); },
  remove(id) { this.save(this.all().filter((p) => p.id !== id)); },
};

/* ---------- Package CRUD UI ---------- */
function initPackageManager() {
  const grid = document.getElementById("pkgAdminGrid");
  if (!grid) return;
  const modal = document.getElementById("pkgModal");
  const form = document.getElementById("pkgForm");
  const addBtn = document.getElementById("addPkgBtn");
  let editingId = null;

  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  function render() {
    const list = SA_SELLER.all();
    if (!list.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><span class="ic ic-box"></span><h3>No packages yet</h3><p>Click "Add Package" to create your first adventure package.</p></div>';
      return;
    }
    grid.innerHTML = list.map((p) => `
      <article class="pkg-admin">
        <div class="pa-img"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" onerror="this.src='../img/hero/hero-main.webp'"></div>
        <div class="pa-body">
          <h3>${esc(p.title)}</h3>
          <div class="pa-meta"><span>${esc(p.destination)}</span><span>·</span><span>${esc(p.duration)}</span></div>
          <p style="font-size:.85rem;color:var(--text-soft)">${esc(p.description)}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
            <span class="pa-price">₹${Number(p.price).toLocaleString("en-IN")}</span>
            <span style="color:var(--gold);font-weight:700">★ ${esc(String(p.rating || "4.5"))}</span>
          </div>
          <div class="pa-actions">
            <button class="pa-edit" data-edit="${p.id}"><span class="ic ic-edit"></span>Edit</button>
            <button class="pa-del" data-del="${p.id}"><span class="ic ic-trash"></span>Delete</button>
          </div>
        </div>
      </article>`).join("");
  }

  function openModal(pkg) {
    editingId = pkg ? pkg.id : null;
    document.getElementById("pkgModalTitle").textContent = pkg ? "Edit Package" : "Add Package";
    form.elements["title"].value = pkg ? pkg.title : "";
    form.elements["destination"].value = pkg ? pkg.destination : "";
    form.elements["price"].value = pkg ? pkg.price : "";
    form.elements["duration"].value = pkg ? pkg.duration : "";
    form.elements["image"].value = pkg ? pkg.image : "";
    form.elements["description"].value = pkg ? pkg.description : "";
    modal.classList.add("open");
  }
  function closeModal() { modal.classList.remove("open"); }

  addBtn && addBtn.addEventListener("click", () => openModal(null));
  modal.querySelector(".modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  grid.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit]");
    const delBtn = e.target.closest("[data-del]");
    if (editBtn) {
      const pkg = SA_SELLER.all().find((p) => p.id === Number(editBtn.dataset.edit));
      if (pkg) openModal(pkg);
    }
    if (delBtn) {
      SA_SELLER.remove(Number(delBtn.dataset.del));
      render();
      showToast("Package deleted.");
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      title: form.elements["title"].value.trim(),
      destination: form.elements["destination"].value.trim(),
      price: Number(form.elements["price"].value),
      duration: form.elements["duration"].value.trim(),
      image: form.elements["image"].value.trim() || "../img/destinations/thailand.webp",
      description: form.elements["description"].value.trim(),
      rating: 4.5,
    };
    if (!data.title || !data.destination || !data.price || !data.duration) {
      showToast("Please fill all required fields.", true);
      return;
    }
    if (editingId) { SA_SELLER.update(editingId, data); showToast("Package updated."); }
    else { SA_SELLER.add(data); showToast("Package added."); }
    closeModal();
    render();
  });

  render();
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof SA_AUTH !== "undefined") SA_AUTH.seed();
  SA_SELLER.seed();
  initPackageManager();
});
