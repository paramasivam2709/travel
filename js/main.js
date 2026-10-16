/* ============================================================
   STACKLY ADVENTURE — main.js (core site behaviour)
   ============================================================ */
"use strict";

/* ---------- Theme (runs before paint via inline init too) ---------- */
function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      if (dark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      }
    });
  });
}

/* ---------- Toast ---------- */
function showToast(msg, isError = false) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.innerHTML = '<span class="ic"></span><span class="t-msg"></span>';
    document.body.appendChild(toast);
  }
  toast.querySelector(".ic").className = "ic " + (isError ? "ic-close" : "ic-check");
  toast.querySelector(".t-msg").textContent = msg;
  toast.classList.toggle("error", isError);
  requestAnimationFrame(() => toast.classList.add("show"));
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 3400);
}

/* ---------- Preloader ---------- */
function initPreloader() {
  const pre = document.getElementById("preloader");
  if (!pre) return;
  const bar = pre.querySelector(".bar");
  const pct = pre.querySelector(".preloader-pct");
  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(100, p + Math.random() * 14 + 4);
    if (bar) bar.style.strokeDashoffset = String(327 - (327 * p) / 100);
    if (pct) pct.textContent = Math.floor(p) + "%";
    if (p >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        pre.classList.add("done");
        document.body.classList.add("loaded");
        if (window.gsap) heroIntro();
      }, 350);
    }
  }, 110);
  // safety net
  setTimeout(() => {
    if (!pre.classList.contains("done")) {
      pre.classList.add("done");
      document.body.classList.add("loaded");
      if (window.gsap) heroIntro();
    }
  }, 5000);
}

/* ---------- Header ---------- */
function initNavbar() {
  const header = document.querySelector(".header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 60);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const burger = document.querySelector(".hamburger");
  const mnav = document.querySelector(".mobile-nav");
  const mclose = document.querySelector(".mobile-close");
  if (burger && mnav) {
    burger.addEventListener("click", () => {
      mnav.classList.add("open");
      mnav.querySelectorAll("a").forEach((a, i) => (a.style.transitionDelay = 0.15 + i * 0.05 + "s"));
    });
  }
  if (mclose && mnav) mclose.addEventListener("click", () => mnav.classList.remove("open"));
  if (mnav) mnav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => mnav.classList.remove("open")));
}

/* ---------- Search overlay ---------- */
function initSearch() {
  const overlay = document.querySelector(".search-overlay");
  if (!overlay) return;
  document.querySelectorAll(".search-btn").forEach((b) =>
    b.addEventListener("click", () => {
      overlay.classList.add("open");
      const inp = overlay.querySelector("input");
      if (inp) setTimeout(() => inp.focus(), 250);
    })
  );
  const close = overlay.querySelector(".search-close");
  if (close) close.addEventListener("click", () => overlay.classList.remove("open"));
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("open"); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") overlay.classList.remove("open"); });
  const form = overlay.querySelector("form");
  if (form)
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = overlay.querySelector("input").value.trim();
      overlay.classList.remove("open");
      if (q) showToast('Searching adventures for "' + q + '"…');
    });
}

/* ---------- Page transitions ---------- */
function initPageTransitions() {
  let veil = document.getElementById("page-transition");
  if (!veil) {
    veil = document.createElement("div");
    veil.id = "page-transition";
    document.body.appendChild(veil);
  }
  // fade-in on arrival
  veil.classList.add("active");
  requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add("leaving")));
  setTimeout(() => veil.classList.remove("active", "leaving"), 950);

  document.querySelectorAll('a[href$=".html"]').forEach((a) => {
    const url = a.getAttribute("href");
    if (!url || url.startsWith("http") || a.target === "_blank" || a.dataset.noTransition !== undefined) return;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      veil.classList.remove("leaving");
      veil.classList.add("active");
      setTimeout(() => (location.href = url), 460);
    });
  });
}

/* ---------- FAQ accordion (single open) ---------- */
function initFAQ() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((o) => {
        o.classList.remove("open");
        o.querySelector(".faq-a").style.maxHeight = "0";
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });
}

/* ---------- Booking search bar ---------- */
function initBookingBar() {
  const form = document.getElementById("bookingForm");
  if (!form) return;
  const dateInput = form.querySelector('input[type="date"]');
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = form.querySelector(".bk-error");
    const dest = form.querySelector('[name="destination"]');
    const trav = form.querySelector('[name="travelers"]');
    let msg = "";
    if (!dest || !dest.value) msg = "Please select a destination.";
    else if (!dateInput || !dateInput.value) msg = "Please choose a travel date.";
    else if (new Date(dateInput.value) < new Date(new Date().toDateString())) msg = "Travel date cannot be in the past.";
    else if (!trav || !trav.value) msg = "Please select the number of travelers.";
    if (msg) {
      if (err) { err.textContent = msg; err.classList.add("show"); }
      return;
    }
    if (err) err.classList.remove("show");
    showToast("Great choice! Finding the best " + dest.value + " adventures for you…");
  });
}

/* ---------- Newsletter ---------- */
function initNewsletter() {
  document.querySelectorAll(".nl-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const msg = form.parentElement.querySelector(".nl-msg");
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
      if (!ok) {
        if (msg) { msg.textContent = "Please enter a valid email address."; msg.className = "nl-msg err"; }
        input.focus();
        return;
      }
      const subs = JSON.parse(localStorage.getItem("sa_newsletter") || "[]");
      subs.push({ email: input.value.trim(), at: Date.now() });
      localStorage.setItem("sa_newsletter", JSON.stringify(subs));
      if (msg) { msg.textContent = "Welcome aboard! Adventure inspiration is on its way."; msg.className = "nl-msg ok"; }
      form.reset();
    });
  });
}

/* ---------- Back to top ---------- */
function initBackTop() {
  const btn = document.getElementById("backTop");
  if (!btn) return;
  window.addEventListener("scroll", () => btn.classList.toggle("show", window.scrollY > 600), { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------- Button ripple ---------- */
function initRipples() {
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = btn.getBoundingClientRect();
      const r = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      r.className = "ripple";
      r.style.width = r.style.height = size + "px";
      r.style.left = e.clientX - rect.left - size / 2 + "px";
      r.style.top = e.clientY - rect.top - size / 2 + "px";
      btn.appendChild(r);
      setTimeout(() => r.remove(), 700);
    });
  });
}

/* ---------- Hero particles ---------- */
function initParticles() {
  const wrap = document.querySelector(".hero-particles");
  if (!wrap) return;
  for (let i = 0; i < 24; i++) {
    const p = document.createElement("span");
    p.className = "particle";
    const s = Math.random() * 5 + 2;
    p.style.width = p.style.height = s + "px";
    p.style.left = Math.random() * 100 + "%";
    p.style.bottom = "-10px";
    p.style.animationDuration = Math.random() * 12 + 9 + "s";
    p.style.animationDelay = Math.random() * 10 + "s";
    if (Math.random() > 0.6) p.style.background = "rgba(255,183,3,.5)";
    wrap.appendChild(p);
  }
}

/* ---------- Video modal ---------- */
function initVideoModal() {
  const modal = document.querySelector(".video-modal");
  if (!modal) return;
  const frame = modal.querySelector("iframe");
  document.querySelectorAll(".video-btn").forEach((b) =>
    b.addEventListener("click", () => {
      modal.classList.add("open");
      if (frame && !frame.src) frame.src = frame.dataset.src;
    })
  );
  const close = () => modal.classList.remove("open");
  modal.querySelector(".vm-close").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
}

/* ---------- Footer year ---------- */
function initYear() {
  document.querySelectorAll(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initPreloader();
  initNavbar();
  initSearch();
  initPageTransitions();
  initFAQ();
  initBookingBar();
  initNewsletter();
  initBackTop();
  initRipples();
  initParticles();
  initVideoModal();
  initYear();
  if (window.AOS) {
    AOS.init({ duration: 850, once: true, offset: 90, easing: "ease-out-cubic" });
  } else {
    // CDN/library fallback: never leave content hidden
    document.querySelectorAll("[data-aos]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }
});

/* ---------- FAQ category filter ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const pills = document.querySelectorAll(".faq-cats .cat-pill");
  if (!pills.length) return;
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      const cat = pill.textContent.trim().toLowerCase();
      document.querySelectorAll(".faq-item[data-cat]").forEach((item) => {
        const show = cat === "all" || item.dataset.cat === cat;
        item.style.display = show ? "" : "none";
        if (show) { item.style.animation = "none"; void item.offsetWidth; item.style.animation = "fadeUp .5s ease both"; }
      });
    });
  });
});
