/* ============================================================
   STACKLY ADVENTURE — validation.js (reusable form validation)
   ============================================================ */
"use strict";

const SA_VALID = {
  name: (v) => /^[A-Za-z][A-Za-z\s.'-]{1,49}$/.test(v.trim()),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  phone: (v) => /^[0-9]{10,15}$/.test(v.replace(/[\s-]/g, "")),
  password: (v) => v.length >= 8,
  required: (v) => v.trim().length > 0,
};

function pwStrength(v) {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v)) s++;
  return s; // 0..3
}

function setFieldState(input, ok, msg) {
  const group = input.closest(".form-group");
  const err = group ? group.querySelector(".form-error") : null;
  input.classList.toggle("invalid", !ok);
  if (err) {
    err.textContent = ok ? "" : msg || "Invalid value.";
    err.classList.toggle("show", !ok);
  }
  return ok;
}

function attachLiveValidation(form) {
  form.querySelectorAll("[data-validate]").forEach((input) => {
    input.addEventListener("input", () => validateField(input));
    input.addEventListener("blur", () => validateField(input));
  });
}

function validateField(input) {
  const rules = input.dataset.validate.split("|");
  const v = input.value;
  for (const rule of rules) {
    if (rule === "name" && !SA_VALID.name(v)) return setFieldState(input, false, "Only letters allowed (2–50 chars).");
    if (rule === "email" && !SA_VALID.email(v)) return setFieldState(input, false, "Enter a valid email address.");
    if (rule === "phone" && !SA_VALID.phone(v)) return setFieldState(input, false, "Numbers only, 10–15 digits.");
    if (rule === "password" && !SA_VALID.password(v)) return setFieldState(input, false, "Minimum 8 characters.");
    if (rule === "required" && !SA_VALID.required(v)) return setFieldState(input, false, "This field is required.");
    if (rule.startsWith("max:")) {
      const max = parseInt(rule.split(":")[1], 10);
      if (v.length > max) return setFieldState(input, false, "Maximum " + max + " characters.");
    }
    if (rule.startsWith("min:")) {
      const min = parseInt(rule.split(":")[1], 10);
      if (v.trim().length < min) return setFieldState(input, false, "Minimum " + min + " characters.");
    }
    if (rule === "match") {
      const other = input.closest("form").querySelector("[data-validate*='password']");
      if (other && v !== other.value) return setFieldState(input, false, "Passwords do not match.");
    }
  }
  return setFieldState(input, true);
}

function validateForm(form) {
  let ok = true;
  form.querySelectorAll("[data-validate]").forEach((input) => {
    if (!validateField(input)) ok = false;
  });
  return ok;
}

/* ---------- Password show/hide + strength meter ---------- */
function initPasswordTools() {
  document.querySelectorAll(".pw-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      const ic = btn.querySelector(".ic");
      if (ic) ic.className = "ic " + (show ? "ic-eye-off" : "ic-eye");
    });
  });
  document.querySelectorAll("[data-strength]").forEach((input) => {
    const meter = document.querySelector(input.dataset.strength);
    if (!meter) return;
    const bars = meter.querySelectorAll("span");
    input.addEventListener("input", () => {
      const s = pwStrength(input.value);
      bars.forEach((b, i) => {
        b.className = i < s ? "s" + s : "";
      });
    });
  });
}

/* ---------- Contact form ---------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  attachLiveValidation(form);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm(form)) { showToast("Please fix the highlighted fields.", true); return; }
    const msgs = JSON.parse(localStorage.getItem("sa_messages") || "[]");
    msgs.push({
      name: form.elements["name"].value.trim(),
      email: form.elements["email"].value.trim(),
      phone: form.elements["phone"].value.trim(),
      subject: form.elements["subject"].value.trim(),
      message: form.elements["message"].value.trim(),
      at: Date.now(),
    });
    localStorage.setItem("sa_messages", JSON.stringify(msgs));
    showToast("Message sent! Our travel experts will reply within 24 hours.");
    form.reset();
    form.querySelectorAll(".form-control").forEach((i) => i.classList.remove("invalid"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initPasswordTools();
  initContactForm();
});
