/* ============================================================
   STACKLY ADVENTURE — animation.js (GSAP / text / scroll FX)
   ============================================================ */
"use strict";

/* ---------- Hero intro (called after preloader) ---------- */
function heroIntro() {
  const hero = document.querySelector(".hero");
  if (!hero || !window.gsap) return;
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.fromTo(".hero-tag", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
    .fromTo(".hero h1 .line > span", { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.14 }, "-=0.35")
    .fromTo(".hero-script-words", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
    .fromTo(".hero p.lead", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.4")
    .fromTo(".hero-cta > *", { y: 26, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.6 }, "-=0.35")
    .fromTo(".hero-stat", { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.6 }, "-=0.3")
    .fromTo(".hero-float", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.1, duration: 0.8, ease: "back.out(1.8)" }, "-=0.5")
    .fromTo(".booking-bar", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.4");
}

/* ---------- Typing effect ---------- */
function initTyping() {
  const el = document.querySelector("[data-typing]");
  if (!el) return;
  const words = el.dataset.typing.split("|");
  const txt = el.querySelector(".type-text") || el;
  let wi = 0, ci = 0, deleting = false;
  (function tick() {
    const word = words[wi];
    ci += deleting ? -1 : 1;
    txt.textContent = word.slice(0, ci);
    let delay = deleting ? 45 : 95;
    if (!deleting && ci === word.length) { delay = 1700; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 400; }
    setTimeout(tick, delay);
  })();
}

/* ---------- Char & word reveals ---------- */
function splitReveal() {
  document.querySelectorAll(".char-reveal").forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach((c, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.style.transitionDelay = i * 0.03 + "s";
      s.textContent = c === " " ? " " : c;
      el.appendChild(s);
    });
  });
  document.querySelectorAll(".word-reveal").forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach((w, i) => {
      const s = document.createElement("span");
      s.className = "wd";
      s.style.transitionDelay = i * 0.07 + "s";
      s.textContent = w;
      el.appendChild(s);
      el.appendChild(document.createTextNode(" "));
    });
  });
}

/* ---------- Scroll reveal (IntersectionObserver fallback to AOS) ---------- */
function initReveals() {
  const targets = document.querySelectorAll(".reveal-up,.reveal-left,.reveal-right,.reveal-zoom,.stagger,.char-reveal,.word-reveal");
  if (!("IntersectionObserver" in window) || !targets.length) {
    targets.forEach((t) => t.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }),
    { threshold: 0.16 }
  );
  targets.forEach((t) => io.observe(t));
}

/* ---------- Animated counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el = en.target;
      const end = parseFloat(el.dataset.count);
      const decimals = el.dataset.count.includes(".") ? 1 : 0;
      const suffix = el.dataset.suffix || "";
      const dur = 1800;
      const t0 = performance.now();
      (function step(now) {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (end * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }),
    { threshold: 0.4 }
  );
  counters.forEach((c) => io.observe(c));
}

/* ---------- GSAP scroll effects ---------- */
function initGSAP() {
  if (!window.gsap) return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // hero parallax on scroll
  const heroBg = document.querySelector(".hero-bg");
  if (heroBg && window.ScrollTrigger) {
    gsap.to(heroBg, {
      yPercent: 18,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".hero-content", {
      yPercent: -12,
      opacity: 0.25,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 30%", scrub: true },
    });
  }

  // mouse-move parallax in hero
  const hero = document.querySelector(".hero");
  if (hero && matchMedia("(pointer:fine)").matches) {
    hero.addEventListener("mousemove", (e) => {
      const x = (e.clientX / innerWidth - 0.5);
      const y = (e.clientY / innerHeight - 0.5);
      gsap.to(".hf-compass", { x: x * 34, y: y * 26, duration: 1.1, ease: "power2.out" });
      gsap.to(".hf-plane", { x: x * -48, y: y * -30, duration: 1.3, ease: "power2.out" });
      gsap.to(".hf-pin", { x: x * 22, y: y * 18, duration: 1, ease: "power2.out" });
      gsap.to(".hero-bg", { x: x * -16, duration: 1.6, ease: "power2.out" });
    });
  }

  // navbar pop-in
  gsap.fromTo(".header", { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, delay: 0.15, ease: "power3.out" });

  // generic gsap reveals
  if (window.ScrollTrigger) {
    document.querySelectorAll("[data-gsap='fade-up']").forEach((el) => {
      gsap.fromTo(el, { y: 60, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%" },
      });
    });
    document.querySelectorAll("[data-gsap='zoom']").forEach((el) => {
      gsap.fromTo(el, { scale: 0.82, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 1.1, ease: "back.out(1.4)",
        scrollTrigger: { trigger: el, start: "top 86%" },
      });
    });
  }
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  splitReveal();
  initTyping();
  initReveals();
  initCounters();
  initGSAP();
  // pages without preloader: run hero intro immediately
  if (!document.getElementById("preloader")) {
    setTimeout(() => { if (window.gsap) heroIntro(); }, 120);
  }
});
