/**
 * ================================================================
 * script.js — Portfolio Tom Marcorelli
 * BTS SIO SISR — Thème Cyberpunk Japonais
 *
 *  1.  Utilitaires
 *  2.  Préloader animé
 *  3.  Curseur personnalisé
 *  4.  Navigation
 *  5.  Scroll reveal
 *  6.  Barre de progression de lecture
 *  7.  Filtres tableau de compétences
 *  8.  Compteurs animés
 *  9.  Particules canvas hero
 *  10. Terminal typewriter
 *  11. Tilt 3D cartes projets
 *  12. Formulaire de contact
 *  13. Easter egg Konami
 *  14. Mode Jour (matrix toggle + animation jour)
 *  15. GitHub Stats
 *  16. Scroll reveal timeline & certifications
 *  17. Initialisation
 * ================================================================
 */

'use strict';

/* ================================================================
   1. UTILITAIRES
   ================================================================ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

function updateFooterYear() {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ================================================================
   2. PRÉLOADER ANIMÉ
   Séquence de boot avec messages et barre de progression
   ================================================================ */
function initPreloader() {
  const preloader  = $('#preloader');
  const bar        = $('#preloader-bar');
  const statusText = $('#preloader-status');
  if (!preloader || !bar || !statusText) return;

  const bootMessages = [
    { text: 'Initialisation du système...',    progress: 10  },
    { text: 'Chargement des modules réseau...', progress: 35 },
    { text: 'Connexion sécurisée établie...',   progress: 60 },
    { text: 'Déchiffrement des données...',     progress: 80 },
    { text: 'Portfolio prêt.',                  progress: 100 },
  ];

  let step = 0;

  const interval = setInterval(() => {
    if (step >= bootMessages.length) {
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('preloader--hidden');
        preloader.addEventListener('transitionend', () => preloader.remove(), { once: true });
      }, 400);
      return;
    }
    const { text, progress } = bootMessages[step];
    statusText.textContent = text;
    bar.style.width = `${progress}%`;
    step++;
  }, 420);
}

/* ================================================================
   3. CURSEUR PERSONNALISÉ
   Caché sur tactile. Point instantané + anneau avec lag fluide.
   ================================================================ */
function initCustomCursor() {
  const dot  = $('.cursor-dot');
  const ring = $('.cursor-ring');
  if (!dot || !ring) return;

  if (window.matchMedia('(hover: none)').matches) {
    dot.style.display  = 'none';
    ring.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let isVisible = false;

  dot.style.opacity  = '0';
  ring.style.opacity = '0';

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    if (!isVisible) {
      isVisible = true;
      dot.style.opacity  = '1';
      ring.style.opacity = '0.5';
    }
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
    isVisible = false;
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '0.5';
    isVisible = true;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  $$('a, button, .project-card, .watch-card, .filter-btn').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('cursor-ring--hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('cursor-ring--hover'));
  });
}

/* ================================================================
   4. NAVIGATION
   Menu mobile, lien actif par IntersectionObserver, header sticky
   ================================================================ */
function initNavigation() {
  const toggle   = $('.nav-toggle');
  const menu     = $('.nav-menu');
  const header   = $('.site-header');
  const links    = $$('.nav-link');
  const sections = $$('section[id]');
  if (!toggle || !menu) return;

  function closeMenu() {
    menu.classList.remove('nav-menu--open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('nav-toggle--active');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('nav-menu--open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.classList.toggle('nav-toggle--active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  links.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });

  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('site-header--scrolled', window.scrollY > 50);
  }, { passive: true });

  if (!sections.length) return;

  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => {
          link.classList.toggle('nav-link--active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => navObserver.observe(s));
}

/* ================================================================
   5. SCROLL REVEAL
   Ajoute .is-revealed aux cartes au passage dans le viewport
   ================================================================ */
function initScrollReveal() {
  const targets = $$('.project-card, .watch-card, .about-grid, .exam-info-card, .skills-table');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-revealed'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => observer.observe(el));
}

/* ================================================================
   6. BARRE DE PROGRESSION DE LECTURE
   ================================================================ */
function initReadingProgress() {
  const bar = document.createElement('div');
  bar.classList.add('reading-progress');
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Progression de lecture');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const percent    = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    bar.style.setProperty('--reading-progress', `${percent}%`);
    bar.setAttribute('aria-valuenow', String(percent));
  }, { passive: true });
}

/* ================================================================
   7. FILTRES TABLEAU DE COMPÉTENCES
   ================================================================ */
function initSkillsFilter() {
  const table = $('.skills-table');
  if (!table) return;

  const domains    = ['Réseaux', 'Systèmes', 'Sécurité', 'Dev / Web'];
  const filterBar  = document.createElement('div');
  filterBar.classList.add('skills-filter-bar');
  filterBar.setAttribute('role', 'group');
  filterBar.setAttribute('aria-label', 'Filtrer par domaine');

  filterBar.appendChild(createFilterButton('Tout', true));
  domains.forEach(d => filterBar.appendChild(createFilterButton(d, false)));

  const tableWrapper = $('.table-wrapper');
  if (tableWrapper) tableWrapper.parentNode.insertBefore(filterBar, tableWrapper);

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    $$('.filter-btn', filterBar).forEach(b => {
      b.classList.toggle('filter-btn--active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    filterRows(btn.dataset.filter);
  });

  function filterRows(filter) {
    $$('.skills-table__domain', table).forEach(cell => {
      const text  = cell.textContent.replace(/◈\s*/g, '').trim();
      const match = filter === 'Tout' || text.includes(filter.replace(' / Web', ''));
      getRowsForDomain(cell).forEach(row => row.classList.toggle('skills-row--hidden', !match));
    });
  }

  function getRowsForDomain(cell) {
    const rows = [];
    let row    = cell.closest('tr');
    const span = parseInt(cell.getAttribute('rowspan') || '1', 10);
    for (let i = 0; i < span; i++) {
      if (row) { rows.push(row); row = row.nextElementSibling; }
    }
    return rows;
  }
}

function createFilterButton(label, isActive) {
  const btn = document.createElement('button');
  btn.classList.add('filter-btn');
  if (isActive) btn.classList.add('filter-btn--active');
  btn.dataset.filter = label;
  btn.textContent    = label;
  btn.type           = 'button';
  btn.setAttribute('aria-pressed', String(isActive));
  return btn;
}

/* ================================================================
   8. COMPTEURS ANIMÉS
   ================================================================ */
function initCounters() {
  const vals = $$('.stat-item__value');
  if (!vals.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const num = parseInt(el.textContent, 10);
      if (!isNaN(num) && el.textContent.trim() === String(num)) animateCount(el, num);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  vals.forEach(el => observer.observe(el));

  function animateCount(el, target, duration = 1200) {
    const start = performance.now();
    (function step(now) {
      const t     = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }
}

/* ================================================================
   9. PARTICULES CANVAS HERO
   Couleurs adaptées au mode actif : cyan/magenta (nuit) ou bleu/gris (jour)
   ================================================================ */
function initHeroParticles() {
  const hero = $('.hero-section');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.classList.add('hero-particles-canvas');
  canvas.setAttribute('aria-hidden', 'true');
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext('2d');
  let particles = [], animFrame;

  function isDayMode() {
    return document.documentElement.classList.contains('mode-matrix');
  }

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function mkParticle() {
    const day = isDayMode();
    const colors = day
      ? ['37,99,235', '100,116,139', '14,165,233']   // bleu, gris-bleu, bleu ciel
      : ['0,245,255', '255,0,110'];                   // cyan, magenta
    return {
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - 0.5) * 0.4,
      vy:    (Math.random() - 0.5) * 0.4,
      size:  Math.random() * 1.5 + 0.5,
      alpha: day ? Math.random() * 0.25 + 0.05 : Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  }

  function init() {
    particles = Array.from(
      { length: Math.floor((canvas.width * canvas.height) / 8000) },
      mkParticle
    );
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha * 0.1})`;
      ctx.fill();
    });
    animFrame = requestAnimationFrame(draw);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animFrame);
      resize(); init(); draw();
    }, 200);
  });

  resize(); init(); draw();

  // Regénère les particules avec les bonnes couleurs à chaque changement de mode
  const modeBtn = $('#matrix-toggle');
  if (modeBtn) {
    modeBtn.addEventListener('click', () => {
      cancelAnimationFrame(animFrame);
      init();
      draw();
    });
  }
}

/* ================================================================
   10. TERMINAL TYPEWRITER — LETTRE PAR LETTRE
   ================================================================ */
function initTerminalTypewriter() {
  const body = $('#terminal-body');
  if (!body) return;

  const script = [
    { type: 'cmd',    text: 'whoami' },
    { type: 'output', text: 'tom_marcorelli',                       delay: 200 },
    { type: 'blank' },
    { type: 'cmd',    text: 'cat profil.txt' },
    { type: 'output', text: 'BTS SIO SISR — Réseaux & Sécurité',   delay: 200 },
    { type: 'output', text: 'Age: 28 ans | Argenteuil, France',     delay: 80  },
    { type: 'blank' },
    { type: 'cmd',    text: 'ping cybersécurité.fr' },
    { type: 'output', text: '64 bytes: icmp_seq=1 ttl=64 time=0.42ms', delay: 300, success: true },
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let currentEl = null;

  const cursorEl = document.createElement('p');
  cursorEl.classList.add('terminal-line');
  cursorEl.innerHTML = '<span class="terminal-prompt">$</span> <span class="terminal-cursor">▌</span>';

  function typeChar() {
    if (lineIndex >= script.length) {
      body.appendChild(cursorEl);
      return;
    }

    const line = script[lineIndex];

    if (line.type === 'blank') {
      body.appendChild(document.createElement('br'));
      lineIndex++;
      setTimeout(typeChar, 200);
      return;
    }

    if (charIndex === 0) {
      currentEl = document.createElement('p');

      if (line.type === 'cmd') {
        currentEl.classList.add('terminal-line');
        currentEl.innerHTML = '<span class="terminal-prompt">$</span> <span class="terminal-cmd-text"></span>';
        body.appendChild(currentEl);

      } else if (line.type === 'output') {
        currentEl.classList.add('terminal-output');
        if (line.success) currentEl.classList.add('terminal-output--success');
        body.appendChild(currentEl);

        setTimeout(() => {
          currentEl.textContent = line.text;
          lineIndex++;
          charIndex = 0;
          setTimeout(typeChar, 120);
        }, line.delay || 100);
        return;
      }
    }

    if (line.type === 'cmd') {
      const textSpan = currentEl.querySelector('.terminal-cmd-text');
      if (textSpan && charIndex < line.text.length) {
        textSpan.textContent += line.text[charIndex];
        charIndex++;
        setTimeout(typeChar, Math.random() * 60 + 60);
      } else {
        lineIndex++;
        charIndex = 0;
        setTimeout(typeChar, 300);
      }
    }

    body.scrollTop = body.scrollHeight;
  }

  setTimeout(typeChar, 800);
}

/* ================================================================
   11. TILT 3D CARTES PROJETS
   Rotation selon position souris, désactivé sur tactile
   ================================================================ */
function initProjectTilt() {
  const cards = $$('.project-card');
  if (!cards.length || window.matchMedia('(hover: none)').matches) return;

  cards.forEach(card => {
    const shine = document.createElement('div');
    shine.classList.add('project-card__shine');
    card.appendChild(shine);

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top)  / rect.height;
      const tiltX = (relY - 0.5) * -8;
      const tiltY = (relX - 0.5) *  8;

      card.style.setProperty('--tilt-x', `${tiltX}deg`);
      card.style.setProperty('--tilt-y', `${tiltY}deg`);
      card.style.setProperty('--tilt-z', '8px');
      card.style.setProperty('--shine-x', `${relX * 100}%`);
      card.style.setProperty('--shine-y', `${relY * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--tilt-z', '0px');
    });
  });
}

/* ================================================================
   12. FORMULAIRE DE CONTACT
   ================================================================ */
function initContactForm() {
  const form = $('.contact-form');
  if (!form) return;

  $$('.form-input', form).forEach(input => {
    input.addEventListener('blur',  () => validateField(input));
    input.addEventListener('input', () => clearFieldError(input));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const inputs   = [...$$('.form-input', form)];
    const allValid = inputs.map(validateField).every(Boolean);
    if (!allValid) return;
    showFormFeedback(form, 'loading');
    setTimeout(() => { showFormFeedback(form, 'success'); form.reset(); }, 1500);
  });
}

function validateField(field) {
  clearFieldError(field);
  if (field.required && !field.value.trim()) {
    showFieldError(field, 'Ce champ est obligatoire.');
    return false;
  }
  if (field.type === 'email' && field.value.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
      showFieldError(field, 'Adresse email invalide.');
      return false;
    }
  }
  if (field.id === 'contact-message' && field.value.trim().length < 10) {
    showFieldError(field, 'Le message doit contenir au moins 10 caractères.');
    return false;
  }
  field.classList.add('form-input--valid');
  return true;
}

function showFieldError(field, msg) {
  field.classList.add('form-input--error');
  field.setAttribute('aria-invalid', 'true');
  const id = `${field.id}-error`;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('p');
    el.id = id;
    el.classList.add('form-error-msg');
    el.setAttribute('role', 'alert');
    field.parentNode.appendChild(el);
    field.setAttribute('aria-describedby', id);
  }
  el.textContent = msg;
}

function clearFieldError(field) {
  field.classList.remove('form-input--error', 'form-input--valid');
  field.removeAttribute('aria-invalid');
  const el = document.getElementById(`${field.id}-error`);
  if (el) el.remove();
}

function showFormFeedback(form, state) {
  const btn = $('[type="submit"]', form);
  if (state === 'loading') {
    btn.disabled     = true;
    btn.textContent  = '◈ Envoi en cours...';
  }
  if (state === 'success') {
    btn.disabled     = false;
    btn.textContent  = '✓ Message envoyé !';
    btn.classList.add('btn--success');
    setTimeout(() => {
      btn.textContent = '◈ Envoyer le message';
      btn.classList.remove('btn--success');
    }, 3000);
  }
}

/* ================================================================
   13. EASTER EGG KONAMI  ↑↑↓↓←→←→BA
   ================================================================ */
function initKonamiCode() {
  const seq   = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let typed   = [];

  document.addEventListener('keydown', e => {
    typed.push(e.key);
    typed = typed.slice(-seq.length);
    if (typed.join() !== seq.join()) return;

    typed = [];
    document.body.classList.add('konami-active');
    const toast = document.createElement('div');
    toast.classList.add('konami-toast');
    toast.setAttribute('role', 'status');
    toast.innerHTML = '🎮 CODE KONAMI ACTIVÉ — <span>神</span>';
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.classList.remove('konami-active');
      toast.remove();
    }, 3000);
  });
}

/* ================================================================
   14. MODE JOUR — Toggle simple
   ================================================================ */
function initMatrixMode() {
  const btn = $('#matrix-toggle');
  if (!btn) return;

  let isActive = false;

  btn.addEventListener('click', () => {
    isActive = !isActive;
    document.documentElement.classList.toggle('mode-matrix', isActive);
    btn.setAttribute('aria-label', isActive ? 'Désactiver le mode Jour' : 'Activer le mode Jour');
  });
}

/* ================================================================
   15. GITHUB STATS — API temps réel
   ================================================================ */
async function initGithubStats() {
  const grid = $('#github-stats-grid');
  if (!grid) return;

  const username = 'tommarcorelli-crypto';

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100`),
    ]);

    if (!userRes.ok) throw new Error('GitHub API error');
    const data  = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    const totalStars = Array.isArray(repos)
      ? repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0)
      : 0;

    const stats = [
      { value: data.public_repos || 0, label: 'Repositories' },
      { value: data.followers    || 0, label: 'Followers'     },
      { value: data.following    || 0, label: 'Following'     },
      { value: totalStars,             label: 'Stars reçues'  },
    ];

    grid.innerHTML = stats.map(s => `
      <div class="github-stat-card">
        <span class="github-stat-card__value">${s.value}</span>
        <span class="github-stat-card__label">${s.label}</span>
      </div>
    `).join('');

  } catch {
    grid.innerHTML = `
      <div class="github-stat-card github-stat-card--loading">
        <span class="github-loading-text">
          Stats disponibles sur
          <a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer"
             style="color:var(--color-neon-cyan)">github.com/${username}</a>
        </span>
      </div>`;
  }
}

/* ================================================================
   16. SCROLL REVEAL — TIMELINE & CERTIFICATIONS
   ================================================================ */
function initTimelineReveal() {
  const items = $$('.timeline-item, .cert-card');
  if (!items.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-revealed'), i * 100);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => obs.observe(el));
}

/* ================================================================
   17. INITIALISATION
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initMatrixMode();
  initCustomCursor();
  initNavigation();
  initScrollReveal();
  initTimelineReveal();
  initReadingProgress();
  initSkillsFilter();
  initCounters();
  initHeroParticles();
  initTerminalTypewriter();
  initProjectTilt();
  initContactForm();
  initGithubStats();
  initKonamiCode();
  updateFooterYear();

  console.log(
    '%c[TM] _ Portfolio chargé ✓\n%cBTS SIO SISR — Nexa Digital School, Paris\n%cTips: appuie sur 矩 pour le mode Jour ☀️',
    'color:#00f5ff;font-family:monospace;font-size:16px;font-weight:bold;',
    'color:#7a9bc4;font-family:monospace;font-size:11px;',
    'color:#2563eb;font-family:monospace;font-size:11px;'
  );
});
