/* Dharun S — Portfolio interactions (desktop phase) */
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const sections = navLinks.map((l) => document.getElementById(l.dataset.nav)).filter(Boolean);

  /* Header state */
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Scroll spy */
  const setActive = (id) => navLinks.forEach((l) => l.classList.toggle("is-active", l.dataset.nav === id));
  const spy = () => {
    const probe = window.scrollY + window.innerHeight * 0.38;
    let current = sections[0] ? sections[0].id : null;
    for (const s of sections) if (s.offsetTop <= probe) current = s.id;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) current = sections[sections.length - 1].id;
    if (current) setActive(current);
  };
  spy();
  window.addEventListener("scroll", spy, { passive: true });
  window.addEventListener("resize", spy);

  /* Scroll reveal */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Metric counters */
  const counters = document.querySelectorAll(".count");
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 1400);
      el.textContent = Math.round(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window && counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.count));
  }

  /* Featured project toggles (one per featured card) */
  document.querySelectorAll(".featured-toggle").forEach((toggle) => {
    const card = toggle.closest(".featured");
    if (!card) return;
    toggle.addEventListener("click", () => {
      const open = card.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  });

  /* Contact form → opens the visitor's mail client with a pre-filled message (no backend required) */
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  if (form) {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      const invalid = [];
      if (!name) invalid.push(form.name);
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalid.push(form.email);
      if (!message) invalid.push(form.message);
      form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
      if (invalid.length) {
        invalid.forEach((el) => el.classList.add("is-invalid"));
        invalid[0].focus();
        note.textContent = "Please fill in all fields with a valid email address.";
        note.classList.add("is-error");
        return;
      }
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
      window.location.href = `mailto:dharun0108@gmail.com?subject=${subject}&body=${body}`;
      note.textContent = "Your email app should open now with the message ready to send.";
      note.classList.remove("is-error");
    });
  }

  /* Footer year */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
