/* ============================================================
   STACKLY ADVENTURE — slider.js (testimonial slider, vanilla)
   ============================================================ */
"use strict";

function initTestimonialSlider() {
  const slider = document.querySelector(".testi-slider");
  if (!slider) return;
  const track = slider.querySelector(".testi-track");
  const slides = slider.querySelectorAll(".testi-slide");
  const prev = document.querySelector(".testi-arrow.prev");
  const next = document.querySelector(".testi-arrow.next");
  const dotsWrap = document.querySelector(".testi-dots");
  if (!track || slides.length === 0) return;

  let index = 0;
  let timer = null;

  slides.forEach((_, i) => {
    const d = document.createElement("button");
    d.setAttribute("aria-label", "Go to review " + (i + 1));
    if (i === 0) d.classList.add("active");
    d.addEventListener("click", () => goTo(i));
    dotsWrap && dotsWrap.appendChild(d);
  });
  const dots = dotsWrap ? dotsWrap.querySelectorAll("button") : [];

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = "translateX(-" + index * 100 + "%)";
    dots.forEach((d, di) => d.classList.toggle("active", di === index));
    restart();
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => goTo(index + 1), 5200);
  }
  prev && prev.addEventListener("click", () => goTo(index - 1));
  next && next.addEventListener("click", () => goTo(index + 1));

  // touch swipe
  let startX = 0;
  track.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
  track.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 48) goTo(index + (dx < 0 ? 1 : -1));
  }, { passive: true });

  slider.addEventListener("mouseenter", () => clearInterval(timer));
  slider.addEventListener("mouseleave", restart);
  restart();
}

/* ---------- Generic logo/brand marquee pause ---------- */
function initMarquee() {
  document.querySelectorAll(".marquee-band").forEach((m) => {
    m.addEventListener("mouseenter", () => {
      const t = m.querySelector(".marquee-track");
      if (t) t.style.animationPlayState = "paused";
    });
    m.addEventListener("mouseleave", () => {
      const t = m.querySelector(".marquee-track");
      if (t) t.style.animationPlayState = "running";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTestimonialSlider();
  initMarquee();
});
