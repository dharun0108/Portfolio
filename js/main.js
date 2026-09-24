/* Dharun S — Portfolio interactions · editorial story system */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const progressBar = document.getElementById("progress-bar");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const chapters = Array.from(document.querySelectorAll("[data-chapter]"));

  /* ------------------------------------------------ Header + reading progress + chapter spy */
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%";

    const probe = y + window.innerHeight * 0.4;
    let current = null;
    for (const c of chapters) if (c.offsetTop <= probe) current = c.dataset.chapter;
    if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) current = chapters[chapters.length - 1].dataset.chapter;
    navLinks.forEach((l) => l.classList.toggle("is-active", l.dataset.nav === current));
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ------------------------------------------------ Mobile navigation (hamburger) */
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const backdrop = document.querySelector(".nav-backdrop");
  if (navToggle && siteNav) {
    const setMenu = (open) => {
      document.body.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (backdrop) backdrop.hidden = !open;
      if (open) {
        const first = siteNav.querySelector("a");
        if (first) first.focus({ preventScroll: true });
      }
    };
    const isOpen = () => document.body.classList.contains("nav-open");
    navToggle.addEventListener("click", () => setMenu(!isOpen()));
    siteNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { if (isOpen()) setMenu(false); }));
    if (backdrop) backdrop.addEventListener("click", () => setMenu(false));
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && isOpen()) { setMenu(false); navToggle.focus(); }
    });
    // if the viewport grows back to desktop while open, reset
    const mq = window.matchMedia("(min-width: 1024px)");
    mq.addEventListener ? mq.addEventListener("change", (e) => { if (e.matches && isOpen()) setMenu(false); }) : null;
  }

  /* ------------------------------------------------ Restrained scroll reveal (chapter-level only) */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ------------------------------------------------ Case study progressive disclosure */
  document.querySelectorAll(".case-toggle").forEach((toggle) => {
    const card = toggle.closest(".case");
    const panel = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!card || !panel) return;
    toggle.addEventListener("click", () => {
      const open = card.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      if (open) {
        // keep the opened details in view without hijacking the scroll
        const rect = panel.getBoundingClientRect();
        if (rect.top > window.innerHeight * 0.7) panel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });

  /* ------------------------------------------------ Craft: highlight technologies by project */
  const craftGrid = document.getElementById("craft-grid");
  const filters = Array.from(document.querySelectorAll(".filter"));
  if (craftGrid && filters.length) {
    const items = Array.from(craftGrid.querySelectorAll(".tech-list li"));
    const apply = (key) => {
      filters.forEach((f) => {
        const on = f.dataset.filter === key;
        f.classList.toggle("is-active", on);
        f.setAttribute("aria-pressed", String(on));
      });
      if (key === "all") {
        craftGrid.classList.remove("is-filtered");
        items.forEach((li) => li.classList.remove("is-hit"));
        return;
      }
      craftGrid.classList.add("is-filtered");
      items.forEach((li) => li.classList.toggle("is-hit", (li.dataset.p || "").split(" ").includes(key)));
    };
    filters.forEach((f) => f.addEventListener("click", () => apply(f.dataset.filter)));
  }

  /* ------------------------------------------------ Impact: clinical data flow stages */
  const stages = Array.from(document.querySelectorAll(".stage"));
  const panels = Array.from(document.querySelectorAll(".stage-panel"));
  const flowFill = document.getElementById("flow-fill");
  const dots = Array.from(document.querySelectorAll(".flow-dots circle"));
  const setStage = (idx, focus) => {
    stages.forEach((s, i) => {
      const on = i === idx;
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-selected", String(on));
      s.tabIndex = on ? 0 : -1;
      if (on && focus) s.focus();
    });
    panels.forEach((p, i) => {
      const on = i === idx;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
    if (flowFill) {
      const total = 1080; // path length of the track
      flowFill.style.strokeDashoffset = String(total - (total * idx) / 3);
    }
    dots.forEach((d, i) => d.classList.toggle("is-lit", i <= idx));
  };
  if (stages.length) {
    setStage(0, false);
    stages.forEach((s, i) => {
      s.addEventListener("click", () => setStage(i, false));
      s.addEventListener("keydown", (ev) => {
        if (ev.key === "ArrowRight") { ev.preventDefault(); setStage((i + 1) % stages.length, true); }
        if (ev.key === "ArrowLeft") { ev.preventDefault(); setStage((i - 1 + stages.length) % stages.length, true); }
        if (ev.key === "Home") { ev.preventDefault(); setStage(0, true); }
        if (ev.key === "End") { ev.preventDefault(); setStage(stages.length - 1, true); }
      });
    });
  }

  /* ------------------------------------------------ Contact form: honest mailto hand-off with inline validation */
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  if (form) {
    const fields = {
      name: { el: form.name, err: document.getElementById("err-name"), ok: (v) => v.length > 0 },
      email: { el: form.email, err: document.getElementById("err-email"), ok: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
      message: { el: form.message, err: document.getElementById("err-message"), ok: (v) => v.length > 0 },
    };
    const validate = (key) => {
      const f = fields[key];
      const good = f.ok(f.el.value.trim());
      f.el.classList.toggle("is-invalid", !good);
      f.el.setAttribute("aria-invalid", String(!good));
      if (f.err) f.err.hidden = good;
      return good;
    };
    Object.keys(fields).forEach((k) => fields[k].el.addEventListener("blur", () => validate(k)));
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const results = Object.keys(fields).map(validate);
      if (results.includes(false)) {
        const first = Object.keys(fields).find((k) => fields[k].el.classList.contains("is-invalid"));
        fields[first].el.focus();
        note.textContent = "Please complete the highlighted fields.";
        note.className = "form-note is-error";
        return;
      }
      const name = fields.name.el.value.trim();
      const email = fields.email.el.value.trim();
      const message = fields.message.el.value.trim();
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
      window.location.href = `mailto:dharun0108@gmail.com?subject=${subject}&body=${body}`;
      note.textContent = "Your email app should now be open with the message ready. Nothing is sent until you press send there.";
      note.className = "form-note is-ok";
    });
  }

  /* ------------------------------------------------ Footer year */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
