// Ram Maruboina — portfolio interactions (no dependencies)
(() => {
  "use strict";

  document.documentElement.classList.remove("no-js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- Nav: background on scroll + mobile menu ---------- */
  const nav = document.querySelector(".nav");
  const menuBtn = document.querySelector(".menu-btn");
  const navLinks = document.getElementById("nav-links");
  const setMenu = (open) => {
    navLinks.classList.toggle("open", open);
    nav.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Nav: highlight the section in view ---------- */
  const linkFor = new Map([...navLinks.querySelectorAll("a")].map((a) => [a.getAttribute("href").slice(1), a]));
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      linkFor.forEach((a) => a.classList.remove("active"));
      const link = linkFor.get(entry.target.id);
      if (link) link.classList.add("active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  linkFor.forEach((_, id) => { const s = document.getElementById(id); if (s) sectionObserver.observe(s); });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Hero stats count up ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const runCount = (el) => {
    const end = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const t0 = performance.now();
    const dur = 1400;
    const step = (now) => {
      const t = clamp((now - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(end * eased) + (t === 1 ? suffix : "");
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!reduceMotion) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countObserver.observe(el));
  }

  /* ---------- Work filter ---------- */
  const filters = document.querySelectorAll(".filter");
  const works = document.querySelectorAll(".work");
  const countFor = (f) => [...works].filter((w) => f === "all" || w.dataset.cat.split(" ").includes(f)).length;
  filters.forEach((btn) => {
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = String(countFor(btn.dataset.filter));
    btn.appendChild(n);
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      filters.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      works.forEach((w) => {
        const show = f === "all" || w.dataset.cat.split(" ").includes(f);
        w.hidden = !show;
        if (show) w.classList.add("in");
      });
    });
  });

  /* ---------- Journey progress line ---------- */
  const jobs = document.querySelector(".jobs");
  if (jobs) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = jobs.getBoundingClientRect();
      const p = clamp((window.innerHeight * 0.6 - r.top) / r.height, 0, 1);
      jobs.style.setProperty("--progress", p.toFixed(4));
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Nav: background on scroll, hidden over the image hero on desktop ---------- */
  // The hero image already shows a logo and menu, so the real nav stays out of the way
  // until you scroll past most of it (desktop only; phones always show the nav).
  const heroEl = document.querySelector(".hero");
  const desktop = window.matchMedia("(min-width: 701px)");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 8);
    const hideUntil = heroEl ? heroEl.offsetHeight * 0.6 : 0;
    nav.classList.toggle("nav-hidden", desktop.matches && y < hideUntil && !navLinks.classList.contains("open"));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Copy email ---------- */
  const toastEl = document.querySelector(".toast");
  let toastTimer = 0;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
  };
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        toast("Email copied");
      } catch {
        window.location.href = `mailto:${btn.dataset.copy}`;
      }
    });
  });

  /* ---------- Footer year ---------- */
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
