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
 *  14. Mode Jour (toggle clair/sombre)
 *  15. Easter egg Konami
 *  16. Scroll reveal timeline & certifications
 *  17. Curseur manga (mode jour)
 *  18. Initialisation
 * ================================================================
 */

'use strict';

/* ================================================================
   1. UTILITAIRES
   ================================================================ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

function isDayMode() {
  return document.documentElement.classList.contains('mode-jour');
}

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
   3. CURSEUR SPOTLIGHT
   Halo de lumière cyan qui suit la souris (désactivé sur tactile)
   ================================================================ */
function initCustomCursor() {
  // Spotlight supprimé — la plume gère les deux modes
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
  bar.setAttribute('aria-valuenow', '0');
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
   7. FILTRES COMPÉTENCES
   Filtre les skill-cards par domaine (Linux, Windows, Sécurité, DevOps)
   ================================================================ */
function initSkillsFilter() {
  const grid = $('.skills-cards-grid');
  if (!grid) return;

  const domainMap = {
    'Linux':    'skill-card--system',
    'Windows':  'skill-card--network',
    'Sécurité': 'skill-card--security',
    'DevOps':   'skill-card--dev',
  };

  const filterBar = document.createElement('div');
  filterBar.classList.add('skills-filter-bar');
  filterBar.setAttribute('role', 'group');
  filterBar.setAttribute('aria-label', 'Filtrer par domaine');

  filterBar.appendChild(createFilterButton('Tout', true));
  Object.keys(domainMap).forEach(label => filterBar.appendChild(createFilterButton(label, false)));

  grid.parentNode.insertBefore(filterBar, grid);

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    $$('.filter-btn', filterBar).forEach(b => {
      b.classList.toggle('filter-btn--active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    const filter = btn.dataset.filter;
    $$('.skill-card', grid).forEach(card => {
      const visible = filter === 'Tout' || card.classList.contains(domainMap[filter]);
      card.style.display = visible ? '' : 'none';
    });
  });
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
      // Extrait le nombre en début de chaîne (gère "10+", "95%", "28", etc.)
      const match = el.textContent.trim().match(/^(\d+)/);
      const num   = match ? parseInt(match[1], 10) : NaN;
      if (!isNaN(num)) animateCount(el, num);
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
          body.scrollTop = body.scrollHeight; // scroll après ajout du texte
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
    // Évite le doublon si le HTML contient déjà un .project-card__shine statique
    if (!card.querySelector('.project-card__shine')) {
      const shine = document.createElement('div');
      shine.classList.add('project-card__shine');
      card.appendChild(shine);
    }

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

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const inputs   = [...$$('.form-input', form)];
    const allValid = inputs.map(validateField).every(Boolean);
    if (!allValid) return;

    showFormFeedback(form, 'loading');

    try {
      const data     = new FormData(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body:   data,
      });
      const json = await response.json();

      if (json.success) {
        showFormFeedback(form, 'success');
        form.reset();
      } else {
        showFormFeedback(form, 'error');
      }
    } catch {
      showFormFeedback(form, 'error');
    }
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
  if (state === 'error') {
    btn.disabled    = false;
    btn.textContent = '✗ Erreur — Réessayer';
    btn.classList.add('btn--error');
    setTimeout(() => {
      btn.textContent = '◈ Envoyer le message';
      btn.classList.remove('btn--error');
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
   14. MODE JOUR — Toggle clair/sombre
   La préférence est persistée dans localStorage pour survivre aux rechargements.
   ================================================================ */
function initDayMode() {
  const btn = $('#matrix-toggle');
  if (!btn) return;

  // Restaurer l'état sauvegardé
  let isActive = localStorage.getItem('dayMode') === 'true';
  document.documentElement.classList.toggle('mode-jour', isActive);
  btn.setAttribute('aria-label', isActive ? 'Désactiver le mode Jour' : 'Activer le mode Jour');
  btn.querySelector('.matrix-toggle__icon').textContent = isActive ? '☽' : '☀';

  btn.addEventListener('click', () => {
    isActive = !isActive;
    localStorage.setItem('dayMode', String(isActive));
    document.documentElement.classList.toggle('mode-jour', isActive);
    btn.setAttribute('aria-label', isActive ? 'Désactiver le mode Jour' : 'Activer le mode Jour');
    btn.querySelector('.matrix-toggle__icon').textContent = isActive ? '☽' : '☀';
  });
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
   18. CURSEUR PLUME — Mode jour ET mode nuit
   Plume ✒️ + traces + splash au clic
   Mode jour  : traces #111 (encre noire),  splash #111
   Mode nuit  : traces #ddeef8 (blanc-bleu), splash #eab308 (or)
   ================================================================ */
function initMangaCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  // Plume
  const pen = document.createElement('div');
  pen.id = 'manga-pen';
  pen.setAttribute('aria-hidden', 'true');
  pen.textContent = '✒️';
  pen.style.cssText = `
    position: fixed;
    pointer-events: none;
    font-size: 20px;
    transform: rotate(-30deg);
    z-index: 99999;
    display: none;
    line-height: 1;
    transition: none;
  `;
  document.body.appendChild(pen);

  let mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    pen.style.display = 'block';
    pen.style.left = (mx + 5) + 'px';
    pen.style.top  = (my - 20) + 'px';

    // Couleur de trace selon le mode
    const trailColor = isDayMode() ? '#111' : 'rgba(221, 238, 248, 0.7)';

    // Bout de la plume : la plume est à (mx+5, my-20), rotation -30deg, taille 20px
    // Le bout pointe en bas à gauche => on recentre sur le vrai tip
    const tipX = mx + 14;
    const tipY = my + 2;

    // Trace
    if (Math.random() > 0.45) {
      const dot = document.createElement('div');
      dot.setAttribute('aria-hidden', 'true');
      const size = 2 + Math.random() * 5;
      dot.style.cssText = `
        position: fixed;
        pointer-events: none;
        border-radius: 50%;
        z-index: 99998;
        width: ${size}px;
        height: ${size}px;
        background: ${trailColor};
        left: ${tipX}px;
        top: ${tipY}px;
        transform: translate(-50%, -50%);
        animation: mangaInkFade 0.7s ease-out forwards;
      `;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 700);
    }
  });

  document.addEventListener('mouseleave', () => { pen.style.display = 'none'; });

  // Splash au clic
  document.addEventListener('click', e => {
    // Couleur du splash selon le mode
    const splashColor = isDayMode() ? '#111' : '#eab308';

    for (let i = 0; i < 10; i++) {
      const drop = document.createElement('div');
      drop.setAttribute('aria-hidden', 'true');
      const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.4;
      const dist  = 8 + Math.random() * 22;
      const size  = 3 + Math.random() * 8;
      drop.style.cssText = `
        position: fixed;
        pointer-events: none;
        border-radius: 50%;
        z-index: 99997;
        width: ${size}px;
        height: ${size}px;
        background: ${splashColor};
        left: ${e.clientX + Math.cos(angle) * dist}px;
        top:  ${e.clientY + Math.sin(angle) * dist}px;
        transform: translate(-50%, -50%);
        animation: mangaSplash 0.55s ease-out forwards;
      `;
      document.body.appendChild(drop);
      setTimeout(() => drop.remove(), 600);
    }
  });
}



/* ================================================================
   20. RIPPLE NÉON AU CLIC DU CURSEUR — Mode nuit uniquement
   3 cercles concentriques qui irradient à chaque clic
   ================================================================ */
function initCursorRipple() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.addEventListener('click', e => {
    if (isDayMode()) return;
    return; // Plume active en mode nuit aussi, pas de ripple

    for (let i = 1; i <= 3; i++) {
      const ripple = document.createElement('div');
      ripple.setAttribute('aria-hidden', 'true');
      ripple.classList.add('cursor-ripple', `cursor-ripple--${i}`);
      ripple.style.left = e.clientX + 'px';
      ripple.style.top  = e.clientY + 'px';
      document.body.appendChild(ripple);
      // Durée max des 3 cercles = 0.9s + 0.18s delay = ~1.1s
      setTimeout(() => ripple.remove(), 1100);
    }
  });
}

/* ================================================================
   17. INITIALISATION
   ================================================================ */
// Appliquer le mode jour IMMÉDIATEMENT (avant le préloader) pour éviter le flash bleu
if (localStorage.getItem('dayMode') === 'true') {
  document.documentElement.classList.add('mode-jour');
}

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initDayMode();
  initCustomCursor();
  initNavigation();
  initScrollReveal();
  initTimelineReveal();
  initReadingProgress();
  initSkillsFilter();
  initCounters();
  initTerminalTypewriter();
  initProjectTilt();
  initContactForm();
  initKonamiCode();
  updateFooterYear();
  initMangaCursor();
  initCursorRipple();

  console.log(
    '%c[TM] _ Portfolio chargé ✓\n%cBTS SIO SISR — Nexa Digital School, Paris\n%cTips: clique sur le toggle ☀️ pour le mode Jour',
    'color:#00f5ff;font-family:monospace;font-size:16px;font-weight:bold;',
    'color:#7a9bc4;font-family:monospace;font-size:11px;',
    'color:#2563eb;font-family:monospace;font-size:11px;'
  );
});

