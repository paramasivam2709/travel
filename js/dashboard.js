/* ============================================================
   STACKLY ADVENTURE — dashboard.js (user dashboard logic)
   ============================================================ */
"use strict";

function dashBoot(requiredRole) {
  if (typeof SA_AUTH === "undefined") return null;
  const session = guardArea(requiredRole);
  if (!session) return null;

  // fill identity
  document.querySelectorAll(".js-user-name").forEach((el) => (el.textContent = session.name));
  document.querySelectorAll(".js-user-email").forEach((el) => (el.textContent = session.email));
  document.querySelectorAll(".js-user-role").forEach((el) => (el.textContent = session.role.charAt(0).toUpperCase() + session.role.slice(1)));
  const initials = session.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  document.querySelectorAll(".js-user-initials").forEach((el) => (el.textContent = initials));

  // sidebar toggle (mobile)
  const toggle = document.querySelector(".sb-toggle");
  const sidebar = document.querySelector(".sidebar");
  let overlay = document.querySelector(".sb-overlay");
  if (!overlay && sidebar) {
    overlay = document.createElement("div");
    overlay.className = "sb-overlay";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", () => { sidebar.classList.remove("open"); overlay.classList.remove("show"); });
  }
  if (toggle && sidebar)
    toggle.addEventListener("click", () => {
      sidebar.classList.add("open");
      overlay.classList.add("show");
    });

  // theme
  const saved = localStorage.getItem("theme");
  if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
  document.querySelectorAll(".theme-toggle").forEach((btn) =>
    btn.addEventListener("click", () => {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      document.documentElement.toggleAttribute("data-theme", !dark);
      localStorage.setItem("theme", dark ? "light" : "dark");
    })
  );

  // logout links
  document.querySelectorAll("[data-logout]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      SA_AUTH.logout();
      location.href = "../login.html";
    })
  );

  // animate bars
  document.querySelectorAll(".bar[data-h]").forEach((b, i) => {
    b.style.height = b.dataset.h + "%";
    b.style.animationDelay = i * 0.08 + "s";
  });

  // counters
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el = en.target;
      const end = parseFloat(el.dataset.count);
      const dec = el.dataset.count.includes(".") ? 1 : 0;
      const t0 = performance.now();
      (function step(now) {
        const p = Math.min(1, (now - t0) / 1500);
        el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec) + (el.dataset.suffix || "");
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll("[data-count]").forEach((c) => io.observe(c));

  // progress lines
  setTimeout(() => {
    document.querySelectorAll(".progress-line span[data-w]").forEach((s) => (s.style.width = s.dataset.w + "%"));
  }, 400);

  // settings form demo save
  const settingsForm = document.getElementById("settingsForm");
  if (settingsForm) {
    settingsForm.elements["name"].value = session.name;
    settingsForm.elements["email"].value = session.email;
    if (session.phone) settingsForm.elements["phone"].value = session.phone;
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Settings saved successfully.");
    });
  }
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.elements["name"].value = session.name;
    profileForm.elements["email"].value = session.email;
    if (session.phone) profileForm.elements["phone"].value = session.phone;
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const users = SA_AUTH.users();
      const u = users.find((x) => x.email === session.email);
      if (u) {
        u.name = profileForm.elements["name"].value.trim();
        u.phone = profileForm.elements["phone"].value.trim();
        localStorage.setItem(SA_AUTH.USERS_KEY, JSON.stringify(users));
        SA_AUTH.login(u, session.remember);
      }
      showToast("Profile updated.");
      setTimeout(() => location.reload(), 900);
    });
  }
  return session;
}
