"use strict";

/* ============ PRELOADER ============ */
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("preloader").classList.add("hidden"), 500);
});

/* ============ NAVBAR / SCROLL EFFECTS ============ */
const navbar = document.getElementById("navbar");
const progressBar = document.getElementById("scroll-progress");
const backToTop = document.getElementById("back-to-top");

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  navbar.classList.toggle("scrolled", y > 40);
  backToTop.classList.toggle("visible", y > 500);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (y / max) * 100 + "%";
}, { passive: true });

backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* Mobile menu */
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("nav-links");
hamburger.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => navLinks.classList.remove("open"))
);

/* ============ THEME TOGGLE ============ */
const themeToggle = document.getElementById("theme-toggle");
const setTheme = t => {
  document.documentElement.dataset.theme = t;
  themeToggle.textContent = t === "dark" ? "🌙" : "☀️";
  localStorage.setItem("theme", t);
};
setTheme(localStorage.getItem("theme") || "dark");
themeToggle.addEventListener("click", () =>
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark")
);

/* ============ SCROLL REVEAL (IntersectionObserver) ============ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      if (e.target.closest("#dashboard, #hero")) animateCounters(e.target);
      const fill = e.target.querySelector?.(".progress-fill");
      if (fill) fill.style.width = fill.dataset.progress + "%";
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* ============ ANIMATED COUNTERS ============ */
function animateCounters(scope) {
  scope.querySelectorAll("[data-count]").forEach(el => {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const target = +el.dataset.count, dur = 1800, start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
// Hero counters fire on load too
animateCounters(document.querySelector(".hero-text"));

/* ============ HERO PARALLAX (mouse-move 3D) ============ */
const hero3d = document.getElementById("hero-3d");
if (hero3d && matchMedia("(pointer:fine)").matches) {
  document.getElementById("hero").addEventListener("mousemove", e => {
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    hero3d.querySelectorAll(".card-3d").forEach((card, i) => {
      const depth = (i + 1) * 8;
      card.style.transform = `translate(${x * depth}px, ${y * depth}px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
  });
}

/* ============ PRODUCTS (from products.json) ============ */
async function loadProducts() {
  const grid = document.getElementById("product-grid");
  try {
    const res = await fetch("products.json");
    if (!res.ok) throw new Error(res.status);
    const products = await res.json();
    grid.innerHTML = "";
    products.forEach((p, i) => {
      const card = document.createElement("div");
      card.className = "glass-card product-card reveal";
      card.style.transitionDelay = i * 0.1 + "s";
      
      // WhatsApp link aur button text check karne ke liye logic
      const buttonText = p.buttonText ? p.buttonText : "Add to Cart";
      const buttonAction = p.whatsappLink 
        ? `<a href="${p.whatsappLink}" target="_blank" class="btn btn-primary btn-sm" style="text-align: center; display: inline-block;">${buttonText}</a>`
        : `<button class="btn btn-primary btn-sm">${buttonText}</button>`;

      card.innerHTML = `
        <div class="p-img"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
        <div class="p-body">
          <h3>${p.name}</h3>
          <p class="p-price">$${p.price.toFixed(2)}</p>
          <p>${p.description}</p>
          ${buttonAction}
        </div>`;
      grid.appendChild(card);
      revealObserver.observe(card);
    });
  } catch (err) {
    grid.innerHTML = `<p class="loading-msg">⚠️ Could not load products.json — run the site via a local server.</p>`;
  }
}
loadProducts();

/* ============ INCOME CALCULATOR ============ */
const refInput = document.getElementById("referrals");
const pkgSelect = document.getElementById("package");
const refValue = document.getElementById("ref-value");

function calcIncome() {
  const refs = +refInput.value;
  const pkg = +pkgSelect.value;
  refValue.textContent = refs;
  // Level 1: 10% direct + estimated 5% L2 (assume each ref brings 2) + 3% L3
  const monthly = refs * pkg * 0.10 + refs * 2 * pkg * 0.05 + refs * 4 * pkg * 0.03;
  document.getElementById("calc-monthly").textContent = "$" + Math.round(monthly).toLocaleString();
  document.getElementById("calc-yearly").textContent = "$" + Math.round(monthly * 12).toLocaleString();
}
refInput.addEventListener("input", calcIncome);
pkgSelect.addEventListener("change", calcIncome);
calcIncome();

/* ============ TESTIMONIAL SLIDER ============ */
const slides = document.getElementById("slides");
const dotsWrap = document.getElementById("dots");
const total = slides.children.length;
let current = 0, autoTimer;

for (let i = 0; i < total; i++) {
  const d = document.createElement("span");
  d.className = "dot" + (i === 0 ? " active" : "");
  d.addEventListener("click", () => goTo(i));
  dotsWrap.appendChild(d);
}
function goTo(i) {
  current = (i + total) % total;
  slides.style.transform = `translateX(-${current * 100}%)`;
  dotsWrap.querySelectorAll(".dot").forEach((d, j) => d.classList.toggle("active", j === current));
  restartAuto();
}
function restartAuto() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => goTo(current + 1), 5000);
}
document.getElementById("prev-slide").addEventListener("click", () => goTo(current - 1));
document.getElementById("next-slide").addEventListener("click", () => goTo(current + 1));
restartAuto();

/* ============ FAQ ACCORDION ============ */
document.querySelectorAll(".faq-item").forEach(item => {
  item.querySelector(".faq-q").addEventListener("click", () => {
    const answer = item.querySelector(".faq-a");
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach(o => {
      o.classList.remove("open");
      o.querySelector(".faq-a").style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add("open");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

/* ============ FORMS (demo handlers) ============ */
function handleForm(formId, msgId, successText) {
  const form = document.getElementById(formId);
  const msg = document.getElementById(msgId);
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!form.checkValidity()) {
      msg.textContent = "⚠️ Please fill all fields correctly.";
      msg.classList.add("error");
      return;
    }
    msg.classList.remove("error");
    msg.textContent = successText;
    form.reset();
    setTimeout(() => (msg.textContent = ""), 4000);
  });
}
handleForm("join-form", "join-msg", "🎉 Welcome aboard! Check your email to verify. (demo)");
handleForm("contact-form", "contact-msg", "✅ Message sent! We'll reply within 24h. (demo)");

/* ============ TILT EFFECT ON CARDS ============ */
document.querySelectorAll(".tilt").forEach(card => {
  card.addEventListener("mousemove", e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
  });
  card.addEventListener("mouseleave", () => (card.style.transform = ""));
});
