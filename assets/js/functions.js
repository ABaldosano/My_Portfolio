/* ==========================================================================
   portfolio :: functions.js
   single source code for functions. load on every page.
   ========================================================================== */

// 1. theme toggle ─────────────────────────────────────────────────────────────
const html     = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
html.setAttribute('data-theme', localStorage.getItem('portfolio-theme') || 'light');
themeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('portfolio-theme', next);
});

// 2. hamburger nav ───────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

function closeMobileNav() {
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
  window._navScrollUnlock && window._navScrollUnlock();
}

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
  // wag ka po mawala sa mobile hihi
  if (isOpen) {
    window._navScrollLock && window._navScrollLock();
    document.querySelector('nav').classList.remove('header-hidden');
  } else {
    window._navScrollUnlock && window._navScrollUnlock();
  }
});

// 3. sticky navbar ─────────────────────────────────────────────────────
(function initNavScroll() {
  const navEl   = document.querySelector('nav');
  let lastY     = window.scrollY;
  let ticking   = false;
  let navLocked = false;

  window._navScrollLock   = function () { navLocked = true; };
  window._navScrollUnlock = function () { navLocked = false; };

  window.addEventListener('scroll', () => {
    if (ticking || navLocked) return;
    ticking = true;
    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      const diff     = currentY - lastY;

      if (currentY <= 8) {
        navEl.classList.remove('header-hidden');
        lastY   = currentY;
        ticking = false;
        return;
      }

      if (Math.abs(diff) >= 2) {
        navEl.classList.toggle('header-hidden', diff > 0);
      }

      lastY   = currentY;
      ticking = false;
    });
  }, { passive: true });
})();

// 4. custom cursor for desktop only ───────────────────────────
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');
if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });
  (function loop() {
    rx += (mx - rx) * 0.22;
    ry += (my - ry) * 0.22;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
      ring.style.transform   = 'translate(-50%,-50%) scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.transform   = 'translate(-50%,-50%) scale(1)';
    });
  });
}

// 5. scroll reveal ─────────────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(r => obs.observe(r));

// 6. nav activestate ─────────────────────────────────────────────────────
(function () {
  const path = window.location.pathname;
  let activePage = 'home';
  if      (path.includes('projects'))      activePage = 'projects';
  else if (path.includes('certifications')) activePage = 'certifications';
  else if (path.includes('contact'))       activePage = 'contact';

  document.querySelectorAll('.nav-links a').forEach(a => {
    const text = a.textContent.trim().toLowerCase();
    const isActive =
      (activePage === 'home'           && text === 'home') ||
      (activePage === 'projects'       && text === 'projects') ||
      (activePage === 'certifications' && text === 'certifications') ||
      (activePage === 'contact'        && text === 'contact');
    a.style.color = isActive ? 'var(--gold)' : '';
    a.classList.toggle('active', isActive);
  });
})();