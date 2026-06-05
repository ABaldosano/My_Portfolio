// THEME TOGGLE
    const html = document.documentElement;
    const themeBtn = document.getElementById('themeToggle');
    html.setAttribute('data-theme', localStorage.getItem('portfolio-theme') || 'light');
    themeBtn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      localStorage.setItem('portfolio-theme', next);
    });

    // HAMBURGER MENU
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');

    function closeMobileNav() {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // CUSTOM CURSOR (desktop only)
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

    // SCROLL REVEAL
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(r => obs.observe(r));

    // NAV ACTIVE
    const secs  = document.querySelectorAll('section[id]');
    const navAs = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
      let cur = '';
      secs.forEach(s => { if (window.scrollY >= s.offsetTop - 200) cur = s.id; });
      navAs.forEach(a => { a.style.color = a.getAttribute('href') === '#' + cur ? 'var(--gold)' : ''; });
    });