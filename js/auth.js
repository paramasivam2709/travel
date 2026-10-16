/* ============================================================
   STACKLY ADVENTURE — auth.js (demo auth via localStorage)
   ============================================================ */
"use strict";

const SA_AUTH = {
  USERS_KEY: "sa_users",
  SESSION_KEY: "sa_session",

  seed() {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || "null");
    if (!users) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify([
        { name: "Demo Traveler", email: "user@stackly.com", phone: "9876543210", password: "User@123", role: "user" },
        { name: "Demo Seller", email: "seller@stackly.com", phone: "9876543211", password: "Seller@123", role: "seller" },
        { name: "Demo Admin", email: "admin@stackly.com", phone: "9876543212", password: "Admin@123", role: "admin" },
      ]));
    }
  },
  users() { this.seed(); return JSON.parse(localStorage.getItem(this.USERS_KEY)); },
  session() { return JSON.parse(localStorage.getItem(this.SESSION_KEY) || "null"); },
  login(user, remember) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify({ ...user, password: undefined, remember, at: Date.now() }));
  },
  logout() { localStorage.removeItem(this.SESSION_KEY); },
  register(data) {
    const users = this.users();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase()))
      return { ok: false, msg: "An account with this email already exists." };
    users.push(data);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return { ok: true };
  },
};

/* ---------- Login page ---------- */
function initLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;
  attachLiveValidation(form);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;
    const email = form.elements["email"].value.trim();
    const role = form.elements["role"].value;
    const remember = form.elements["remember"].checked;
    const account = SA_AUTH.users().find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    const user = {
      name: account ? account.name : email.split("@")[0],
      email,
      role,
    };
    SA_AUTH.login(user, remember);
    showToast("Welcome back, " + user.name.split(" ")[0] + "! Redirecting…");
    setTimeout(() => {
      location.href = role === "seller" ? "seller/index.html" : "dashboard/index.html";
    }, 900);
  });
}

/* ---------- Register page ---------- */
function initRegister() {
  const form = document.getElementById("registerForm");
  if (!form) return;
  attachLiveValidation(form);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm(form)) { showToast("Please fix the highlighted fields.", true); return; }
    if (!form.elements["terms"].checked) { showToast("Please accept the Terms & Conditions.", true); return; }
    const res = SA_AUTH.register({
      name: form.elements["fullname"].value.trim(),
      email: form.elements["email"].value.trim(),
      phone: form.elements["phone"].value.trim(),
      password: form.elements["password"].value,
      role: form.elements["role"].value,
    });
    if (!res.ok) { showToast(res.msg, true); return; }
    showToast("Account created! Redirecting to login…");
    setTimeout(() => (location.href = "login.html"), 1100);
  });
}

/* ---------- Guard dashboard pages ---------- */
function guardArea(requiredRole) {
  const s = SA_AUTH.session();
  if (!s) { location.href = "../login.html"; return null; }
  if (requiredRole === "seller" && s.role !== "seller" && s.role !== "admin") {
    location.href = "../dashboard/index.html"; return null;
  }
  if (requiredRole === "user" && s.role === "seller") {
    location.href = "../seller/index.html"; return null;
  }
  return s;
}

document.addEventListener("DOMContentLoaded", () => {
  SA_AUTH.seed();
  initLogin();
  initRegister();
});
