/**
 * ================================================================
 * script.js — Portfolio Tom Marcorelli
 * BTS SIO SISR — Thème Manga Japonais
 *
 *  1.  Utilitaires
 *  2.  Préloader animé
 *  3.  Navigation
 *  5.  Scroll reveal
 *  6.  Barre de progression de lecture
 *  7.  Filtres tableau de compétences
 *  8.  Compteurs animés
 *  9.  Particules canvas hero
 *  10. Terminal typewriter
 *  11. Tilt 3D cartes projets
 *  12. Formulaire de contact
 *  13. Bouton retour en haut
 *  14. Easter egg Konami
 *  15. Mode Jour (toggle clair/sombre)
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
   2. PRÉLOADER ANIMÉ — Canvas manga (speedlines + panel + texte)
   Exécuté immédiatement à la lecture du script (hors DOMContentLoaded)
   pour démarrer l'animation dès que possible.
   ================================================================ */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const canvas    = document.getElementById('pl-canvas');
  if (!preloader || !canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let phase = 0, phaseFrame = 0, penProgress = 0, caseScale = 0, done = false;

  const PHASE_DUR = { 0: 40, 1: 35, 2: 130, 3: 55, 4: 45 };
  const LINE1 = 'Tom Marcorelli';
  const LINE2 = 'Technicien Reseaux & Systemes';

  const speedLines = Array.from({length: 80}, (_, i) => ({
    angle:  (i / 80) * Math.PI * 2,
    inner:  55 + Math.floor(i * 0.4) % 35,
    spread: (Math.PI * 2 / 80) * (0.18 + (i % 5) * 0.06),
    gold:   i % 3 === 0,
  }));

  const inkDrops = Array.from({length: 14}, (_, i) => ({
    x:     0.05 + (i * 0.07) % 0.9,
    y:     0.05 + (i * 0.13) % 0.9,
    r:     2 + (i % 4),
    alpha: 0.04 + (i % 3) * 0.03,
  }));

  function drawBG() {
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(0, 0, W, H);
  }

  function drawSpeedLines(alpha) {
    const cx = W / 2, cy = H / 2;
    ctx.save();
    ctx.globalAlpha = alpha;
    speedLines.forEach(l => {
      const outer = Math.max(W, H) * 0.92;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(l.angle - l.spread) * l.inner, cy + Math.sin(l.angle - l.spread) * l.inner);
      ctx.lineTo(cx + Math.cos(l.angle) * outer,              cy + Math.sin(l.angle) * outer);
      ctx.lineTo(cx + Math.cos(l.angle + l.spread) * l.inner, cy + Math.sin(l.angle + l.spread) * l.inner);
      ctx.closePath();
      ctx.fillStyle = l.gold ? 'rgba(234,179,8,0.20)' : 'rgba(0,0,0,0.07)';
      ctx.fill();
    });
    ctx.restore();
  }

  function drawInk() {
    inkDrops.forEach(d => {
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${d.alpha})`;
      ctx.fill();
    });
  }

  function drawPanel(scale) {
    const pw = Math.min(W * 0.72, 600) * scale;
    const ph = Math.min(H * 0.55, 420) * scale;
    const px = W / 2 - pw / 2, py = H / 2 - ph / 2;
    const bw = 5 * scale;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(px + 7 * scale, py + 7 * scale, pw, ph);
    ctx.fillStyle = '#faf7f0';
    ctx.fillRect(px, py, pw, ph);

    ctx.strokeStyle = '#111';
    ctx.lineWidth = bw;
    ctx.strokeRect(px + bw / 2, py + bw / 2, pw - bw, ph - bw);
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(px + bw * 2.5, py + bw * 2.5, pw - bw * 5, ph - bw * 5);

    ctx.font = `bold ${13 * scale}px "Share Tech Mono",monospace`;
    ctx.fillStyle = '#eab308';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('CHAPITRE 01', px + bw * 3.5, py + bw * 3);

    ctx.font = `${11 * scale}px "Noto Sans JP",sans-serif`;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.textAlign = 'right';
    ctx.fillText('ポートフォリオ', px + pw - bw * 3.5, py + bw * 3);

    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(px + bw, py + bw * 4 + 16 * scale);
    ctx.lineTo(px + pw - bw, py + bw * 4 + 16 * scale);
    ctx.stroke();

    return { px, py, pw, ph, bw, scale };
  }

  function drawText(panel, progress) {
    const { px, py, pw, ph, bw, scale } = panel;
    const cx = px + pw / 2, cy = py + ph / 2;
    const p1 = Math.min(progress / 0.6, 1);
    const p2 = progress > 0.6 ? Math.min((progress - 0.6) / 0.4, 1) : 0;

    const fs1 = Math.min(pw * 0.095, 50) * scale;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${fs1}px Orbitron,monospace`;
    ctx.fillStyle = '#111';
    const t1 = LINE1.substring(0, Math.ceil(LINE1.length * p1));
    ctx.fillText(t1, cx, cy - 26 * scale);

    if (p1 < 1) {
      const tw = ctx.measureText(t1).width;
      ctx.fillStyle = '#eab308';
      ctx.font = `${fs1}px monospace`;
      ctx.fillText('|', cx + tw / 2 + 3, cy - 26 * scale);
    }

    const lw = Math.min(pw * 0.62, 320) * scale;
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - lw / 2, cy - 2 * scale);
    ctx.lineTo(cx - lw / 2 + lw * p1, cy - 2 * scale);
    ctx.stroke();

    if (p2 > 0) {
      const fs2 = Math.min(pw * 0.036, 15) * scale;
      ctx.font = `${fs2}px "Share Tech Mono",monospace`;
      ctx.fillStyle = '#333';
      const t2 = LINE2.substring(0, Math.ceil(LINE2.length * p2));
      ctx.fillText(t2, cx, cy + 28 * scale);
      if (p2 < 1) {
        const tw2 = ctx.measureText(t2).width;
        ctx.fillStyle = '#eab308';
        ctx.fillText('_', cx + tw2 / 2 + 3, cy + 28 * scale);
      }
    }

    if (progress > 0.88) {
      const op = (progress - 0.88) / 0.12;
      ctx.save();
      ctx.globalAlpha = op * 0.15;
      ctx.font = `bold ${Math.min(pw * 0.055, 24) * scale}px "Noto Sans JP",sans-serif`;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'right';
      ctx.fillText('ドン！', px + pw - bw * 3.5, py + ph - bw * 4);
      ctx.restore();
    }
  }

  let panel = null;

  function loop() {
    if (done) return;
    requestAnimationFrame(loop);
    phaseFrame++;

    if (phase === 0) {
      drawBG();
      drawSpeedLines(Math.min(phaseFrame / 15, 1));
      drawInk();
      if (phaseFrame >= PHASE_DUR[0]) { phase = 1; phaseFrame = 0; }

    } else if (phase === 1) {
      drawBG(); drawSpeedLines(1); drawInk();
      const t = phaseFrame / PHASE_DUR[1];
      const b = t < 0.75 ? t / 0.75 : 1 + Math.sin((t - 0.75) / 0.25 * Math.PI) * 0.05;
      caseScale = Math.min(b, 1.05);
      panel = drawPanel(caseScale);
      if (phaseFrame >= PHASE_DUR[1]) { phase = 2; phaseFrame = 0; }

    } else if (phase === 2) {
      drawBG(); drawSpeedLines(1); drawInk();
      panel = drawPanel(1);
      penProgress = phaseFrame / PHASE_DUR[2];
      drawText(panel, penProgress);
      if (phaseFrame >= PHASE_DUR[2]) { phase = 3; phaseFrame = 0; penProgress = 1; }

    } else if (phase === 3) {
      drawBG(); drawSpeedLines(1); drawInk();
      panel = drawPanel(1);
      drawText(panel, 1);
      if (phaseFrame >= PHASE_DUR[3]) { phase = 4; phaseFrame = 0; }

    } else if (phase === 4) {
      drawBG(); drawSpeedLines(1); drawInk();
      panel = drawPanel(1); drawText(panel, 1);
      const t = phaseFrame / PHASE_DUR[4];
      ctx.fillStyle = `rgba(255,255,255,${Math.min(t * 2.5, 1)})`;
      ctx.fillRect(0, 0, W, H);
      if (t > 0.45) {
        ctx.fillStyle = `rgba(6,8,10,${Math.min((t - 0.45) * 2, 1)})`;
        ctx.fillRect(0, 0, W, H);
      }
      if (phaseFrame >= PHASE_DUR[4]) {
        done = true;
        if (preloader) {
          preloader.style.transition = 'opacity 0.25s ease';
          preloader.style.opacity    = '0';
          setTimeout(() => preloader.remove(), 300);
        }
      }
    }
  }

  loop();
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
  if (field.id === 'contact-message') {
    if (field.value.trim().length < 10) {
      showFieldError(field, 'Le message doit contenir au moins 10 caractères.');
      return false;
    }
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
   13. BOUTON RETOUR EN HAUT
   Apparaît après 300px de scroll, style Manga [↑]
   ================================================================ */
function initScrollToTop() {
  const btn = document.createElement('button');
  btn.id = 'scroll-top-btn';
  btn.setAttribute('aria-label', 'Retour en haut');
  btn.innerHTML = '↑';
  btn.style.cssText = `
    position: fixed;
    bottom: 22px;
    right: 22px;
    z-index: 900;
    width: 42px;
    height: 42px;
    background: transparent;
    font-family: 'Share Tech Mono', monospace;
    font-size: 18px;
    cursor: pointer;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s, background 0.2s, color 0.2s, box-shadow 0.2s, border-color 0.2s;
    box-shadow: none;
  `;

  function applyIdleStyle() {
    if (isDayMode()) {
      btn.style.border      = '1.5px solid #111';
      btn.style.color       = '#111';
      btn.style.background  = 'transparent';
      btn.style.boxShadow   = '4px 4px 0px #111';
    } else {
      btn.style.border      = '1.5px solid #eab308';
      btn.style.color       = '#eab308';
      btn.style.background  = 'transparent';
      btn.style.boxShadow   = 'none';
    }
  }

  applyIdleStyle();

  btn.addEventListener('mouseenter', () => {
    if (isDayMode()) {
      btn.style.background = '#111';
      btn.style.color      = '#fff';
      btn.style.border     = '1.5px solid #111';
      btn.style.boxShadow  = '4px 4px 0px #111';
    } else {
      btn.style.background = '#eab308';
      btn.style.color      = '#06080a';
      btn.style.boxShadow  = '0 0 14px #eab308';
      btn.style.border     = '1.5px solid #eab308';
    }
  });

  btn.addEventListener('mouseleave', () => {
    applyIdleStyle();
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.body.appendChild(btn);

  // Mise à jour des couleurs quand le mode change
  const modeToggle = document.getElementById('matrix-toggle');
  if (modeToggle) {
    modeToggle.addEventListener('click', () => {
      setTimeout(applyIdleStyle, 0);
    });
  }

  window.addEventListener('scroll', () => {
    const visible = window.scrollY > 300;
    btn.style.opacity       = visible ? '1'    : '0';
    btn.style.pointerEvents = visible ? 'auto' : 'none';
  }, { passive: true });
}

/* ================================================================
   14. EASTER EGG KONAMI  ↑↑↓↓←→←→BA
   Pluie de kanjis plein écran via canvas
   ================================================================ */
function initKonamiCode() {
  const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let typed = [];

  document.addEventListener('keydown', e => {
    typed.push(e.key);
    typed = typed.slice(-seq.length);
    if (typed.join() !== seq.join()) return;
    typed = [];
    triggerKonamiRain();
  });
}

function triggerKonamiRain() {
  if (document.getElementById('konami-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'konami-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 99990;
    pointer-events: none;
  `;
  document.body.appendChild(canvas);

  const toast = document.createElement('div');
  toast.setAttribute('role', 'status');
  toast.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 99995;
    font-family: 'Orbitron', monospace;
    font-size: clamp(18px, 4vw, 36px);
    font-weight: 900;
    color: #eab308;
    text-shadow: 0 0 30px #eab308, 0 0 60px #eab308;
    letter-spacing: 4px;
    text-align: center;
    pointer-events: none;
    animation: konamiPulse 0.5s ease-in-out infinite alternate;
  `;
  toast.innerHTML = '🎮 CODE KONAMI<br><span style="font-size:0.55em;color:#00f5ff;letter-spacing:6px;">神&nbsp;&nbsp;秘&nbsp;&nbsp;の&nbsp;&nbsp;力</span>';
  document.body.appendChild(toast);

  if (!document.getElementById('konami-styles')) {
    const style = document.createElement('style');
    style.id = 'konami-styles';
    style.textContent = `
      @keyframes konamiPulse {
        from { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
        to   { opacity: 1;   transform: translate(-50%, -50%) scale(1.06); }
      }
    `;
    document.head.appendChild(style);
  }

  const ctx   = canvas.getContext('2d');
  const W     = canvas.width;
  const H     = canvas.height;
  const cols  = Math.floor(W / 22);
  const CHARS = '電脳網絡神秘力夢幻影光速星宇宙時間存在未来過去現在ネットワーク';
  const drops = Array.from({ length: cols }, () => Math.random() * -H);

  const start    = performance.now();
  const DURATION = 4000;

  function rain(now) {
    const elapsed = now - start;
    if (elapsed > DURATION) {
      canvas.style.transition = 'opacity 0.6s';
      canvas.style.opacity    = '0';
      toast.style.transition  = 'opacity 0.6s';
      toast.style.opacity     = '0';
      setTimeout(() => { canvas.remove(); toast.remove(); }, 700);
      return;
    }

    const fadeIn  = Math.min(elapsed / 300, 1);
    const fadeOut = elapsed > 3500 ? 1 - (elapsed - 3500) / 500 : 1;
    const alpha   = fadeIn * fadeOut;

    ctx.fillStyle = `rgba(6,8,10,${0.18 * alpha})`;
    ctx.fillRect(0, 0, W, H);
    ctx.font = '16px "Share Tech Mono", monospace';

    drops.forEach((y, i) => {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x    = i * 22;
      ctx.fillStyle = Math.random() < 0.18
        ? `rgba(234,179,8,${alpha})`
        : `rgba(0,245,255,${alpha * 0.85})`;
      ctx.fillText(char, x, y);
      drops[i] += 18 + Math.random() * 8;
      if (drops[i] > H) drops[i] = -20 - Math.random() * 60;
    });

    requestAnimationFrame(rain);
  }

  requestAnimationFrame(rain);
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
  // Désactivé : la plume manga gère les effets au clic en mode nuit et jour.
  // Conservé pour référence future si le ripple néon est réactivé.
}

/* ================================================================
   17. INITIALISATION
   ================================================================ */
// Appliquer le mode jour IMMÉDIATEMENT (avant le préloader) pour éviter le flash bleu
if (localStorage.getItem('dayMode') === 'true') {
  document.documentElement.classList.add('mode-jour');
}

// Lancer le préloader immédiatement — pas besoin d'attendre DOMContentLoaded
// car le canvas #pl-canvas est déjà dans le DOM (placé avant ce script)
initPreloader();

document.addEventListener('DOMContentLoaded', () => {
  initDayMode();
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
  initScrollToTop();
  updateFooterYear();
  initMangaCursor();
  initCursorRipple();

  // Lightbox tableau E5
  function ouvrirTableau() {
    document.getElementById('tableau-lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
  function fermerTableau() {
    document.getElementById('tableau-lightbox').classList.remove('active');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  document.querySelectorAll('.exam-synthesis-btn--zoom, .exam-synthesis-img').forEach(el => {
    el.addEventListener('click', ouvrirTableau);
  });
  const lightbox = document.getElementById('tableau-lightbox');
  if (lightbox) {
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) fermerTableau(); });
    lightbox.querySelector('.tableau-lightbox__close')?.addEventListener('click', fermerTableau);
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerTableau(); });

  console.log(
    '%c[TM] _ Portfolio chargé ✓\n%cBTS SIO SISR — Nexa Digital School, Paris\n%cTips: clique sur le toggle ☀️ pour le mode Jour',
    'color:#00f5ff;font-family:monospace;font-size:16px;font-weight:bold;',
    'color:#7a9bc4;font-family:monospace;font-size:11px;',
    'color:#dc1414;font-family:monospace;font-size:11px;'
  );
});



/* ================================================================
   PROJETS & E5 — Accordéons
   ================================================================ */
(function () {
  document.querySelectorAll('.projets-accord__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const body    = document.getElementById(trigger.getAttribute('aria-controls'));
      const isOpen  = trigger.getAttribute('aria-expanded') === 'true';
      const chevron = trigger.querySelector('.projets-accord__chevron');

      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      trigger.classList.toggle('projets-accord__trigger--open', !isOpen);
      body.classList.toggle('projets-accord__body--hidden', isOpen);
      if (chevron) chevron.textContent = isOpen ? '▼' : '▲';
    });
  });
})();

/* ================================================================
   WIDGET RSS — Flux en direct via rss2json
   ================================================================ */
(function () {

  const RSS_SOURCES = [
    // Hacking & Vulnérabilités
    { name: 'Exploit-DB',        cat: 'hacking', url: 'https://www.exploit-db.com/rss.xml' },
    { name: 'Krebs on Security', cat: 'hacking', url: 'https://krebsonsecurity.com/feed/' },
    { name: 'The Hacker News',   cat: 'hacking', url: 'https://feeds.feedburner.com/TheHackersNews' },
    // Systèmes & Cloud
    { name: 'LinuxFr',           cat: 'systemes', url: 'https://linuxfr.org/news.atom' },
    { name: 'Developpez.com',    cat: 'systemes', url: 'https://www.developpez.com/index/rss' },
    { name: 'Journal du Hacker', cat: 'systemes', url: 'https://www.journalduhacker.net/rss' },
    // Actualité Tech
    { name: 'Next',              cat: 'actu', url: 'https://next.ink/feed/' },
    { name: 'Numerama',          cat: 'actu', url: 'https://www.numerama.com/feed/' },
    { name: 'Le Crabe Info',     cat: 'actu', url: 'https://www.lecrabeinfo.net/feed' },
    // Cybersécurité
    { name: 'CERT-FR',           cat: 'cyber', url: 'https://www.cert.ssi.gouv.fr/feed/' },
    { name: 'Hacker News',       cat: 'cyber', url: 'https://hnrss.org/frontpage' },
    // Réseau & Infrastructure
    { name: 'LeMagIT',           cat: 'reseau', url: 'https://www.lemagit.fr/rss/CreativeCloud.rss' },
    { name: 'Cisco Blog',        cat: 'reseau', url: 'https://feeds.feedburner.com/CiscoSecurityAdvisory' },
    { name: 'IT-Connect',        cat: 'reseau', url: 'https://www.it-connect.fr/feed/' },
  ];

  const CAT_LABELS = {
    hacking:  'Hacking & Vulnérabilités',
    systemes: 'Systèmes & Cloud',
    actu:     'Actualité Tech',
    cyber:    'Cybersécurité',
    reseau:   'Réseau & Infrastructure',
  };

  const API = 'https://api.rss2json.com/v1/api.json?api_key=pf25n3eyxaap3utfr9kuoipgngfnrztazpchlce9&rss_url=';
  const ITEMS_PER_FEED = 2;

  let allArticles = [];
  let currentFilter = 'all';

  const grid    = document.getElementById('rss-grid');
  const status  = document.getElementById('rss-status');
  const tabs    = document.querySelectorAll('.rss-tab:not(.rss-tab--refresh)');
  const refresh = document.getElementById('rss-refresh');

  if (!grid) return;

  function formatDate(str) {
    if (!str) return '';
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function renderArticles() {
    const filtered = currentFilter === 'all'
      ? allArticles
      : allArticles.filter(a => a.cat === currentFilter);

    if (filtered.length === 0) {
      grid.innerHTML = '<p class="rss-empty">Aucun article pour cette catégorie.</p>';
      return;
    }

    // Grouper par catégorie
    const cats = currentFilter === 'all'
      ? Object.keys(CAT_LABELS)
      : [currentFilter];

    grid.innerHTML = cats.map(cat => {
      const articles = filtered.filter(a => a.cat === cat);
      if (articles.length === 0) return '';
      return `
        <div class="rss-section">
          <h4 class="rss-section__title">
            <span class="rss-section__icon" aria-hidden="true">◈</span>
            ${CAT_LABELS[cat]}
            <span class="rss-section__count">${articles.length} articles</span>
          </h4>
          <div class="rss-section__grid">
            ${articles.map(a => `
              <article class="rss-card">
                <div class="rss-card__meta">
                  <span class="rss-card__source">${a.source}</span>
                  <span class="rss-card__date">${formatDate(a.date)}</span>
                </div>
                <div class="rss-card__title">
                  <a href="${a.link}" target="_blank" rel="noopener noreferrer">${a.title}</a>
                </div>
                <a href="${a.link}" target="_blank" rel="noopener noreferrer" class="rss-card__read">
                  Lire l'article ↗
                </a>
              </article>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  async function fetchFeed(source) {
    try {
      const res  = await fetch(`${API}${encodeURIComponent(source.url)}&count=${ITEMS_PER_FEED}`);
      const data = await res.json();
      if (data.status !== 'ok' || !data.items) return [];
      return data.items.map(item => ({
        title:  item.title,
        link:   item.link,
        date:   item.pubDate,
        source: source.name,
        cat:    source.cat,
      }));
    } catch { return []; }
  }

  async function loadAllFeeds() {
    if (!grid) return;
    status.textContent = 'Chargement des flux...';
    status.style.display = 'block';
    grid.innerHTML = '';
    allArticles = [];

    const results = await Promise.allSettled(RSS_SOURCES.map(fetchFeed));
    results.forEach(r => { if (r.status === 'fulfilled') allArticles.push(...r.value); });

    // Trier par date décroissante
    allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

    status.style.display = 'none';
    if (allArticles.length === 0) {
      status.textContent = 'Impossible de charger les flux. Vérifiez votre connexion.';
      status.style.display = 'block';
      return;
    }
    renderArticles();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('rss-tab--active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('rss-tab--active');
      tab.setAttribute('aria-selected', 'true');
      currentFilter = tab.dataset.filter;
      renderArticles();
    });
  });

  refresh.addEventListener('click', loadAllFeeds);

  // Charger au chargement de la page
  loadAllFeeds();

})();


/* ================================================================
   REACT DEMOS — openReactDemo / closeReactDemo
   ================================================================ */

function closeReactDemo() {
  const modal = document.getElementById('react-demo-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
  if (window._reactDemoRoot) { window._reactDemoRoot.unmount(); window._reactDemoRoot = null; }
  const root = document.getElementById('react-demo-root');
  if (root) root.innerHTML = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeReactDemo();
});

function openReactDemo(project) {
  const modal   = document.getElementById('react-demo-modal');
  const titleEl = document.getElementById('react-demo-title');
  const root    = document.getElementById('react-demo-root');
  if (!modal || !root) return;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  const titles = { lamp: 'LAMP + pfSense', ad: 'Active Directory & GPO', k3s: 'Lab Kubernetes K3s' };
  titleEl.textContent = titles[project] || project;

  if (window._reactDemoRoot) { window._reactDemoRoot.unmount(); window._reactDemoRoot = null; }
  root.innerHTML = '';

  const { createElement: h, useState } = React;
  const jour = document.documentElement.classList.contains('mode-jour');

  // Palette — mode nuit / mode jour
  const GOLD  = jour ? '#dc1414' : '#eab308';
  const CYAN  = jour ? '#1e293b' : '#dff0fb';
  const DIM   = jour ? '#94a3b8' : '#5a7a8a';
  const MUTED = jour ? '#555'    : '#a8c4d8';
  const GREEN = jour ? '#16a34a' : '#22c55e';
  const RED   = '#ef4444';
  const BG    = jour ? '#f8fafc' : '#06080a';
  const CARD  = jour ? '#ffffff' : '#0f1a22';

  const BORDER_ACCENT  = jour ? 'rgba(220,20,20,.3)'   : 'rgba(234,179,8,.3)';
  const BORDER_ACCENT2 = jour ? 'rgba(220,20,20,.2)'   : 'rgba(234,179,8,.2)';
  const BORDER_FAINT   = jour ? 'rgba(0,0,0,.08)'      : BORDER_FAINT;
  const BORDER_CARD    = jour ? 'rgba(220,20,20,.25)'  : 'rgba(234,179,8,.3)';
  const BG_ACCENT      = jour ? 'rgba(220,20,20,.07)'  : 'rgba(234,179,8,.1)';
  const BG_ACCENT2     = jour ? 'rgba(220,20,20,.06)'  : 'rgba(234,179,8,.12)';
  const BG_ROW         = jour ? '#f1f5f9'              : '#080f14';

  const tabStyle = (a) => ({
    padding: '.3rem .8rem', border: `1px solid ${a ? GOLD : BORDER_ACCENT}`,
    borderRadius: '4px', fontSize: '.7rem', cursor: 'pointer',
    color: a ? GOLD : MUTED, background: a ? BG_ACCENT : 'none',
    fontFamily: "'Share Tech Mono',monospace", transition: 'all .15s',
  });
  const panelStyle = { background: CARD, border: `2px solid ${BORDER_CARD}`, borderRadius: '8px', padding: '1.25rem', marginBottom: '1rem', boxShadow: jour ? '0 1px 4px rgba(0,0,0,.06)' : 'none' };
  const ptitleStyle = { fontSize: '.65rem', color: GOLD, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.75rem', borderBottom: `1px solid ${BORDER_ACCENT2}`, paddingBottom: '.4rem' };
  const rowStyle = { display: 'flex', justifyContent: 'space-between', padding: '.35rem 0', borderBottom: `1px solid ${BORDER_FAINT}`, fontSize: '.7rem', flexWrap: 'wrap', gap: '.25rem', alignItems: 'center' };
  const btnStyle = { padding: '.35rem .9rem', background: BG_ACCENT2, border: `1px solid ${BORDER_ACCENT}`, color: GOLD, borderRadius: '4px', cursor: 'pointer', fontSize: '.72rem', fontFamily: "'Share Tech Mono',monospace" };
  const appStyle = { fontFamily: "'Share Tech Mono',monospace", background: BG, color: CYAN, minHeight: '100%', padding: '1.5rem', boxSizing: 'border-box' };
  const titleStyle = { fontFamily: "'Orbitron',sans-serif", fontSize: '1rem', color: GOLD, marginBottom: '1.25rem', letterSpacing: '.05em' };

  // ── DEMO LAMP ──────────────────────────────────────────────────
  if (project === 'lamp') {
    const NODES = [
      { id: 'internet', icon: '🌐', name: 'Internet',         ip: 'WAN · 192.168.8.160',                   status: 'fw' },
      { id: 'pfsense',  icon: '🔥', name: 'pfSense CE 2.7',   ip: 'LAN: 192.168.10.2 · DMZ: 192.168.20.2', status: 'fw' },
      { id: 'debian',   icon: '🖥️', name: 'Debian 12 (LAMP)', ip: '192.168.20.10 — DMZ fixe',              status: 'up' },
      { id: 'client',   icon: '💻', name: 'Windows 10',        ip: '192.168.10.100 — DHCP LAN',             status: 'up' },
    ];
    const SERVICES = [
      { name: 'Apache',     ver: '2.4.67',   port: '80/443', detail: 'Virtual Host intranet.local · enabled au boot' },
      { name: 'MariaDB',    ver: '10.11.14', port: '3306',   detail: 'Sauvegarde mysqldump quotidienne via cron'      },
      { name: 'PHP',        ver: '8.2.31',   port: '—',      detail: 'libapache2-mod-php · php-mysql'                 },
      { name: 'phpMyAdmin', ver: '5.2.1',    port: '80/443', detail: 'intranet.local/phpmyadmin'                      },
      { name: 'Cron',       ver: '—',        port: '—',      detail: '0 0 * * * /bin/bash ~/backup_db.sh'             },
    ];
    const RULES = [
      { src: 'LAN', dst: 'DMZ', proto: 'TCP 80/443', action: 'allow', detail: '→ 192.168.20.10 (intranet LAMP)'  },
      { src: 'DMZ', dst: 'WAN', proto: 'IPv4 *',     action: 'allow', detail: 'Mises à jour Debian'               },
      { src: 'DMZ', dst: 'LAN', proto: 'IPv4 *',     action: 'block', detail: 'Isolation critique — prouvée ✔'    },
    ];
    const LOGS = [
      { t: 'cmd',  v: 'tom@lamp:~$ systemctl status apache2 mariadb' },
      { t: 'ok',   v: '● apache2  — active (running), enabled'       },
      { t: 'ok',   v: '● mariadb  — active (running), enabled'       },
      { t: 'cmd',  v: 'tom@lamp:~$ ip a | grep "inet 192"'           },
      { t: 'ok',   v: 'inet 192.168.20.10/24 brd 192.168.20.255 global ens33' },
      { t: 'cmd',  v: 'tom@lamp:~$ crontab -l'                       },
      { t: 'ok',   v: '0 0 * * * /bin/bash ~/backup_db.sh'           },
    ];
    const TESTS = [
      { label: 'Ping gateway pfSense (192.168.20.2)', delay: 900,  result: '4 packets tx, 4 received — 0% loss · gateway OK ✔',           ok: true  },
      { label: 'Isolation DMZ → LAN (192.168.10.100)', delay: 1100, result: '4 packets tx, 0 received — 100% packet loss · DMZ isolée ✔', ok: true  },
      { label: 'Accès intranet.local depuis LAN',       delay: 1300, result: 'HTTP 200 OK · intranet.local → 192.168.20.10 · DNS pfSense ✔', ok: true },
      { label: 'Accès intranet depuis DMZ (rebond)',     delay: 800,  result: 'Connection refused · Règle Block DMZ→LAN active ✔',          ok: true  },
      { label: 'Portail captif — sans auth',             delay: 700,  result: 'Redirect 302 → 192.168.10.2:8002/captive · Bloqué ✔',        ok: true  },
      { label: 'Portail captif — employe1 auth',         delay: 1500, result: 'Auth OK · Accès réseau autorisé par pfSense ✔',              ok: true  },
    ];

    function LampDemo() {
      const [tab, setTab]       = useState('services');
      const [running, setRunning] = useState(null);
      const [results, setResults] = useState({});

      const runTest = (i) => {
        if (running !== null) return;
        setRunning(i);
        setTimeout(() => {
          setResults(r => ({ ...r, [i]: TESTS[i] }));
          setRunning(null);
        }, TESTS[i].delay);
      };

      const runAll = () => {
        if (running !== null) return;
        TESTS.forEach((t, i) => {
          setTimeout(() => {
            setResults(r => ({ ...r, [i]: TESTS[i] }));
          }, t.delay + i * 300);
        });
      };

      return h('div', { style: appStyle },
        h('p', { style: titleStyle }, '⚡ Simulation — Serveur Web LAMP + pfSense CE 2.7'),

        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '.75rem', marginBottom: '1.5rem' } },
          ...NODES.map(n => h('div', { key: n.id, style: { background: CARD, border: `2px solid ${BORDER_ACCENT2}`, borderRadius: '8px', padding: '.75rem', textAlign: 'center' } },
            h('div', { style: { fontSize: '.55rem', display: 'inline-block', marginBottom: '.25rem', padding: '1px 6px', borderRadius: '8px', background: n.status === 'fw' ? BG_ACCENT2 : 'rgba(34,197,94,.15)', color: n.status === 'fw' ? GOLD : GREEN, border: `1px solid ${n.status === 'fw' ? BORDER_ACCENT : 'rgba(34,197,94,.4)'}` } }, n.status === 'fw' ? 'Pare-feu' : 'En ligne'),
            h('div', { style: { fontSize: '1.4rem', margin: '.3rem 0' } }, n.icon),
            h('div', { style: { fontSize: '.72rem', color: GOLD, fontWeight: 700 } }, n.name),
            h('div', { style: { fontSize: '.6rem', color: MUTED, marginTop: '.2rem' } }, n.ip),
          ))
        ),

        h('div', { style: { display: 'flex', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap' } },
          [['services','🔧 Services'],['regles','🔥 Règles pfSense'],['terminal','💻 Terminal'],['tests','🧪 Tests réseau']].map(([k,l]) =>
            h('button', { key: k, style: tabStyle(tab===k), onClick: () => setTab(k) }, l)
          )
        ),

        tab === 'services' && h('div', { style: panelStyle },
          h('div', { style: ptitleStyle }, 'Services actifs — Debian 12'),
          ...SERVICES.map((sv, i) => h('div', { key: i, style: rowStyle },
            h('span', null, h('span', { style: { color: CYAN, fontWeight: 700 } }, sv.name), h('span', { style: { color: DIM, marginLeft: '.4rem' } }, sv.ver)),
            h('span', { style: { color: MUTED, fontSize: '.65rem' } }, sv.detail),
            h('span', { style: { color: GREEN, fontSize: '.65rem' } }, '● actif · :' + sv.port),
          ))
        ),

        tab === 'regles' && h('div', { style: panelStyle },
          h('div', { style: ptitleStyle }, 'Firewall / Rules — pfSense CE 2.7'),
          ...RULES.map((r, i) => h('div', { key: i, style: rowStyle },
            h('span', null, h('span', { style: { color: CYAN } }, r.src), ' → ', h('span', { style: { color: GOLD } }, r.dst), h('span', { style: { color: DIM } }, ' · ' + r.proto)),
            h('span', { style: { color: MUTED, fontSize: '.65rem' } }, r.detail),
            h('span', { style: { color: r.action === 'allow' ? GREEN : RED, fontWeight: 700, fontSize: '.65rem', textTransform: 'uppercase' } }, r.action),
          ))
        ),

        tab === 'terminal' && h('div', { style: panelStyle },
          h('div', { style: ptitleStyle }, 'Terminal SSH — Debian 12 · 192.168.20.10'),
          h('div', { style: { fontSize: '.7rem', lineHeight: 1.9 } },
            ...LOGS.map((l, i) => h('div', { key: i, style: { color: l.t === 'ok' ? GREEN : l.t === 'warn' ? GOLD : CYAN } }, l.v))
          )
        ),

        tab === 'tests' && h('div', { style: panelStyle },
          h('div', { style: ptitleStyle }, 'Tests réseau & sécurité'),
          h('div', { style: { display: 'flex', gap: '.5rem', marginBottom: '1rem' } },
            h('button', { style: btnStyle, onClick: runAll }, '▶▶ Lancer tous les tests'),
          ),
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: '.5rem' } },
            ...TESTS.map((t, i) => {
              const res = results[i];
              const isRunning = running === i;
              return h('div', { key: i, style: { background: BG_ROW, border: `1px solid ${res ? (res.ok ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)') : `rgba(0,0,0,${jour?'.06':'.08'})`}`, borderRadius: '6px', padding: '.6rem .9rem', display: 'flex', flexDirection: 'column', gap: '.3rem' } },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                  h('span', { style: { fontSize: '.72rem', color: CYAN } }, t.label),
                  h('button', { style: { ...btnStyle, padding: '.2rem .6rem', fontSize: '.62rem', opacity: running !== null ? .4 : 1 }, onClick: () => runTest(i), disabled: running !== null }, isRunning ? '⏳' : '▶'),
                ),
                res && h('span', { style: { fontSize: '.65rem', color: res.ok ? GREEN : RED } }, (res.ok ? '✓ ' : '✗ ') + res.result),
                isRunning && h('span', { style: { fontSize: '.65rem', color: DIM } }, '⏳ Test en cours…'),
              );
            })
          )
        ),
      );
    }

    window._reactDemoRoot = ReactDOM.createRoot(root);
    window._reactDemoRoot.render(h(LampDemo));
    return;
  }

  // ── DEMO ACTIVE DIRECTORY ──────────────────────────────────────
  if (project === 'ad') {
    const OU_DATA = {
      label: 'OU=Utilisateurs-SISR',
      users: ['jean.dupont (jean.dupont@sisr.local)', 'Marie Martine (marie.martine@sisr.local)'],
      groupe: 'GRP-Employes — Sécurité · Domaine local',
    };
    const INFRA = [
      { name: 'SRV-AD-01',  os: 'Windows Server 2022', ip: '192.168.2.10 — VMnet2 fixe', roles: ['AD DS', 'DNS', 'GPMC'] },
      { name: 'CLI-WIN-01', os: 'Windows 10 Pro',       ip: '192.168.2.20 — VMnet2 fixe', roles: ['Membre sisr.local']    },
    ];
    const GPO = { name: 'GPO-Employes', ou: 'OU=Utilisateurs-SISR', etat: 'Activée', effet: 'Interdire accès Panneau de configuration & Paramètres', filtre: 'Utilisateurs authentifiés' };
    const GPRESULT = [
      { t: 'ok',   v: 'PARAMÈTRES UTILISATEURS' },
      { t: 'cmd',  v: 'CN=jean dupont,OU=Utilisateurs-SISR,DC=sisr,DC=local' },
      { t: 'ok',   v: 'Dernière application GPO : 11/05/2026 à 02:23:47' },
      { t: 'ok',   v: 'Stratégie appliquée depuis : SRV-AD-01.sisr.local' },
      { t: 'ok',   v: 'Nom du domaine : SISR · Type : Windows 2008 ou supérieur' },
      { t: 'warn', v: 'Objets Stratégie de groupe appliqués :' },
      { t: 'ok',   v: '    GPO-Employes ✅' },
      { t: 'warn', v: "L'utilisateur fait partie des groupes :" },
      { t: 'ok',   v: '    GRP-Employes · Utilisateurs du domaine · Utilisateurs authentifiés' },
    ];
    const TESTS = [
      { label: 'Ping SRV-AD-01 depuis CLI-WIN-01',          delay: 800,  result: '4 packets tx, 4 received — 0% loss · DC joignable ✔',            ok: true  },
      { label: 'Résolution DNS sisr.local → 192.168.2.10',  delay: 700,  result: 'nslookup sisr.local → 192.168.2.10 · DNS AD fonctionnel ✔',       ok: true  },
      { label: 'Jonction domaine — CLI-WIN-01',              delay: 1400, result: 'Bienvenue dans le domaine sisr.local ✔',                           ok: true  },
      { label: 'Connexion jean.dupont@sisr.local',           delay: 1200, result: 'Auth Kerberos OK · Profil chargé · GPO appliquées ✔',              ok: true  },
      { label: 'Panneau de configuration (GPO active)',       delay: 600,  result: 'Accès refusé — GPO-Employes bloque Control.exe ✔',                ok: true  },
      { label: 'gpupdate /force sur CLI-WIN-01',             delay: 1000, result: 'La mise à jour de la stratégie ordinateur a réussi ✔',             ok: true  },
      { label: 'Appartenance GRP-Employes',                  delay: 500,  result: 'jean.dupont membre de GRP-Employes · Filtrage GPO actif ✔',        ok: true  },
    ];

    function AdDemo() {
      const [tab, setTab]         = useState('infra');
      const [ouOpen, setOuOpen]   = useState(true);
      const [result, setResult]   = useState(null);
      const [loading, setLoading] = useState(false);
      const [running, setRunning] = useState(null);
      const [testRes, setTestRes] = useState({});

      const simulate = () => {
        setLoading(true); setResult(null);
        setTimeout(() => { setResult(GPRESULT); setLoading(false); }, 1400);
      };

      const runTest = (i) => {
        if (running !== null) return;
        setRunning(i);
        setTimeout(() => { setTestRes(r => ({ ...r, [i]: TESTS[i] })); setRunning(null); }, TESTS[i].delay);
      };

      const runAll = () => {
        if (running !== null) return;
        TESTS.forEach((t, i) => setTimeout(() => setTestRes(r => ({ ...r, [i]: TESTS[i] })), t.delay + i * 250));
      };

      return h('div', { style: appStyle },
        h('p', { style: titleStyle }, '⚡ Simulation — Active Directory + GPO · sisr.local'),

        h('div', { style: { display: 'flex', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap' } },
          [['infra','🖥️ Infrastructure'],['ou','🗂️ Arborescence AD'],['gpo','📋 GPO'],['verify','✅ gpresult /r'],['tests','🧪 Tests AD']].map(([k,l]) =>
            h('button', { key: k, style: tabStyle(tab===k), onClick: () => setTab(k) }, l)
          )
        ),

        tab === 'infra' && h('div', { style: panelStyle },
          h('div', { style: ptitleStyle }, 'VMs — VMware Workstation · VMnet2 192.168.2.0/24'),
          ...INFRA.map((m, i) => h('div', { key: i, style: { ...rowStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '.4rem' } },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', width: '100%' } },
              h('span', { style: { color: GOLD, fontWeight: 700 } }, m.name),
              h('span', { style: { color: GREEN, fontSize: '.65rem' } }, '● En ligne'),
            ),
            h('span', { style: { color: MUTED, fontSize: '.65rem' } }, m.os + ' · ' + m.ip),
            h('div', { style: { display: 'flex', gap: '.4rem', flexWrap: 'wrap' } },
              ...m.roles.map((r, j) => h('span', { key: j, style: { fontSize: '.6rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(234,179,8,.12)', border: '1px solid rgba(234,179,8,.35)', color: GOLD } }, r))
            ),
          ))
        ),

        tab === 'ou' && h('div', { style: panelStyle },
          h('div', { style: ptitleStyle }, 'Utilisateurs et ordinateurs AD · sisr.local'),
          h('div', { style: { fontSize: '.8rem', color: GOLD, marginBottom: '.5rem' } }, '🏛️ DC=sisr,DC=local'),
          h('div', { style: { marginLeft: '1rem', borderLeft: '1px dashed rgba(234,179,8,.25)', paddingLeft: '.75rem' } },
            h('div', { style: { fontSize: '.78rem', color: CYAN, padding: '.25rem 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.5rem' }, onClick: () => setOuOpen(o => !o) },
              ouOpen ? '▼' : '▶', ' 📁 ', OU_DATA.label,
              h('span', { style: { fontSize: '.6rem', color: DIM, marginLeft: '.4rem' } }, '2 utilisateurs · 1 groupe')
            ),
            ouOpen && h('div', { style: { marginLeft: '1.2rem' } },
              ...OU_DATA.users.map((u, i) => h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.2rem 0', fontSize: '.7rem', color: MUTED } },
                h('span', { style: { width: '6px', height: '6px', borderRadius: '50%', background: GREEN, display: 'inline-block', flexShrink: 0 } }), '👤 ' + u,
              )),
              h('div', { style: { display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.2rem 0', fontSize: '.7rem', color: MUTED } },
                h('span', { style: { width: '6px', height: '6px', borderRadius: '50%', background: GOLD, display: 'inline-block', flexShrink: 0 } }), '👥 ' + OU_DATA.groupe,
              ),
            ),
          )
        ),

        tab === 'gpo' && h('div', { style: panelStyle },
          h('div', { style: ptitleStyle }, 'GPMC · sisr.local'),
          h('div', { style: { ...rowStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '.4rem' } },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', width: '100%' } },
              h('span', { style: { color: GOLD, fontWeight: 700 } }, GPO.name),
              h('span', { style: { color: GREEN, fontSize: '.65rem' } }, GPO.etat),
            ),
            h('span', { style: { color: MUTED, fontSize: '.65rem' } }, 'Liée à : ' + GPO.ou),
            h('span', { style: { color: MUTED, fontSize: '.65rem' } }, 'Effet : ' + GPO.effet),
            h('span', { style: { color: DIM, fontSize: '.6rem' } }, 'Filtre sécurité : ' + GPO.filtre),
          )
        ),

        tab === 'verify' && h('div', { style: panelStyle },
          h('div', { style: ptitleStyle }, 'gpresult /r — CLI-WIN-01 · Utilisateur : jean.dupont'),
          h('button', { style: { ...btnStyle, opacity: loading ? .5 : 1, marginBottom: '1rem' }, onClick: simulate, disabled: loading },
            loading ? '⏳ Exécution gpresult /r…' : '▶ Lancer gpresult /r'
          ),
          result && h('div', { style: { fontSize: '.7rem', lineHeight: 1.9 } },
            ...result.map((l, i) => h('div', { key: i, style: { color: l.t === 'ok' ? GREEN : l.t === 'warn' ? GOLD : CYAN } }, l.v))
          )
        ),

        tab === 'tests' && h('div', { style: panelStyle },
          h('div', { style: ptitleStyle }, 'Tests Active Directory & GPO'),
          h('div', { style: { display: 'flex', gap: '.5rem', marginBottom: '1rem' } },
            h('button', { style: btnStyle, onClick: runAll }, '▶▶ Lancer tous les tests'),
          ),
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: '.5rem' } },
            ...TESTS.map((t, i) => {
              const res = testRes[i];
              return h('div', { key: i, style: { background: BG_ROW, border: `1px solid ${res ? 'rgba(34,197,94,.3)' : `rgba(0,0,0,${jour?'.06':'.08'})`}`, borderRadius: '6px', padding: '.6rem .9rem', display: 'flex', flexDirection: 'column', gap: '.3rem' } },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                  h('span', { style: { fontSize: '.72rem', color: CYAN } }, t.label),
                  h('button', { style: { ...btnStyle, padding: '.2rem .6rem', fontSize: '.62rem', opacity: running !== null ? .4 : 1 }, onClick: () => runTest(i), disabled: running !== null }, running === i ? '⏳' : '▶'),
                ),
                res && h('span', { style: { fontSize: '.65rem', color: GREEN } }, '✓ ' + res.result),
              );
            })
          )
        ),
      );
    }

    window._reactDemoRoot = ReactDOM.createRoot(root);
    window._reactDemoRoot.render(h(AdDemo));
    return;
  }

  // ── DEMO K3S ───────────────────────────────────────────────────
  if (project === 'k3s') {
    const NODES = [
      { name: 'master',  ip: '192.168.110.10', role: 'Control Plane', icon: '👑', color: '#7c3aed' },
      { name: 'worker1', ip: '192.168.110.11', role: 'Worker',        icon: '⚙️', color: '#0891b2' },
      { name: 'worker2', ip: '192.168.110.12', role: 'Worker',        icon: '⚙️', color: '#0891b2' },
      { name: 'worker3', ip: '192.168.110.13', role: 'Worker',        icon: '⚙️', color: '#0891b2' },
    ];
    const STACK = [
      { name: 'K3s',          ver: 'v1.35.5',  role: 'Orchestrateur Kubernetes',   color: '#7c3aed' },
      { name: 'Longhorn',     ver: 'latest',   role: 'Stockage persistant (PVC)',   color: '#0891b2' },
      { name: 'Prometheus',   ver: 'stack',    role: 'Collecte métriques',          color: '#ea580c' },
      { name: 'Grafana',      ver: 'latest',   role: 'Dashboards temps réel',       color: '#f97316' },
      { name: 'Gitea',        ver: 'latest',   role: 'Forge Git auto-hébergée',     color: '#22c55e' },
      { name: 'ArgoCD',       ver: 'latest',   role: 'GitOps CD — sync auto',       color: '#6366f1' },
      { name: 'Harbor',       ver: 'latest',   role: 'Registry privée OCI',         color: '#0ea5e9' },
      { name: 'Trivy',        ver: 'latest',   role: 'Scan CVE images',             color: '#ef4444' },
      { name: 'Kyverno',      ver: 'latest',   role: 'Politiques sécurité (Admit.)', color: '#8b5cf6'},
      { name: 'MetalLB',      ver: 'latest',   role: 'Load Balancer bare-metal',    color: '#14b8a6' },
      { name: 'Cert-Manager', ver: 'latest',   role: 'TLS automatique',             color: '#64748b' },
      { name: 'Traefik',      ver: 'intégré',  role: 'Ingress Controller',          color: '#06b6d4' },
    ];
    const TESTS = [
      { label: 'kubectl get nodes',                       delay: 700,  result: '4 nœuds Ready v1.35.5+k3s1 · cluster opérationnel ✔',          ok: true  },
      { label: 'Ping inter-nœuds (master → worker1)',     delay: 500,  result: '0% packet loss · ~0.5ms · réseau Flannel OK ✔',                 ok: true  },
      { label: 'Longhorn — volumes Healthy',              delay: 1100, result: '2 volumes Healthy · 4 nœuds · 111 Gi dispo ✔',                  ok: true  },
      { label: 'Grafana dashboard K3s',                   delay: 900,  result: 'HTTP 200 · k3s.local · Dashboards K8s temps réel ✔',            ok: true  },
      { label: 'Gitea → ArgoCD sync auto',                delay: 1400, result: 'Sync auto < 3 min après commit · Healthy/Synced ✔',             ok: true  },
      { label: 'Harbor scan myapp:v1 (CVE)',              delay: 1200, result: 'CVE-2026-6732 Haute détectée · fix requis ✔',                   ok: true  },
      { label: 'Harbor scan myapp:v2 (post-fix)',         delay: 1000, result: 'Aucune vulnérabilité · image propre ✔',                         ok: true  },
      { label: 'Kyverno — pod root refusé',               delay: 800,  result: 'admission webhook denied · disallow-root-user ✔',               ok: true  },
      { label: 'MetalLB — Service LoadBalancer',          delay: 600,  result: 'EXTERNAL-IP: 192.168.110.101 assignée · accès LAN direct ✔',    ok: true  },
    ];
    const PIPELINE = [
      { step: 1, icon: '📝', label: 'git commit',       detail: 'Push code → Gitea (k3s.local)',              color: '#22c55e' },
      { step: 2, icon: '🔍', label: 'Trivy scan',       detail: 'Scan CVE image Docker automatique',           color: '#f97316' },
      { step: 3, icon: '📦', label: 'Harbor push',      detail: 'Image validée → registry privée Harbor',      color: '#0ea5e9' },
      { step: 4, icon: '🔄', label: 'ArgoCD sync',      detail: 'Détection changement → deploy cluster',       color: '#6366f1' },
      { step: 5, icon: '✅', label: 'Deploy OK',        detail: 'Pods Running · Ingress Traefik actif',         color: '#22c55e' },
    ];

    function K3sDemo() {
      const [tab, setTab]       = useState('cluster');
      const [running, setRunning] = useState(null);
      const [testRes, setTestRes] = useState({});
      const [pipeStep, setPipeStep] = useState(0);
      const [pipeRunning, setPipeRunning] = useState(false);

      const runTest = (i) => {
        if (running !== null) return;
        setRunning(i);
        setTimeout(() => { setTestRes(r => ({ ...r, [i]: TESTS[i] })); setRunning(null); }, TESTS[i].delay);
      };

      const runAll = () => {
        if (running !== null) return;
        TESTS.forEach((t, i) => setTimeout(() => setTestRes(r => ({ ...r, [i]: TESTS[i] })), t.delay + i * 200));
      };

      const runPipeline = () => {
        if (pipeRunning) return;
        setPipeRunning(true); setPipeStep(0);
        PIPELINE.forEach((_, i) => {
          setTimeout(() => {
            setPipeStep(i + 1);
            if (i === PIPELINE.length - 1) setPipeRunning(false);
          }, 800 * (i + 1));
        });
      };

      return h('div', { style: appStyle },
        h('p', { style: titleStyle }, '⚡ Simulation — Lab Kubernetes K3s · 4 nœuds · VMware'),

        h('div', { style: { display: 'flex', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap' } },
          [['cluster','☸️ Cluster'],['stack','📦 Stack'],['pipeline','🔄 Pipeline GitOps'],['tests','🧪 Tests']].map(([k,l]) =>
            h('button', { key: k, style: tabStyle(tab===k), onClick: () => setTab(k) }, l)
          )
        ),

        tab === 'cluster' && h('div', null,
          h('div', { style: panelStyle },
            h('div', { style: ptitleStyle }, 'Nœuds — VMnet11 · 192.168.110.0/24'),
            h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '.75rem' } },
              ...NODES.map(n => h('div', { key: n.name, style: { background: BG_ROW, border: `2px solid ${n.color}40`, borderRadius: '8px', padding: '.9rem', textAlign: 'center' } },
                h('div', { style: { fontSize: '1.5rem', marginBottom: '.3rem' } }, n.icon),
                h('div', { style: { color: n.color, fontWeight: 700, fontSize: '.78rem' } }, n.name),
                h('div', { style: { color: MUTED, fontSize: '.65rem' } }, n.ip),
                h('div', { style: { fontSize: '.58rem', marginTop: '.3rem', padding: '1px 6px', borderRadius: '4px', background: `${n.color}20`, color: n.color, display: 'inline-block' } }, n.role),
                h('div', { style: { fontSize: '.58rem', color: GREEN, marginTop: '.3rem' } }, '● Ready · v1.35.5+k3s1'),
              ))
            )
          ),
          h('div', { style: { ...panelStyle, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.75rem', textAlign: 'center' } },
            [['4', 'Nœuds Ready'], ['111 Gi', 'Stockage Longhorn'], ['192.168.110.101', 'IP MetalLB']].map(([v, l]) =>
              h('div', { key: l },
                h('div', { style: { fontSize: '1.1rem', color: GOLD, fontWeight: 700, fontFamily: "'Orbitron',sans-serif" } }, v),
                h('div', { style: { fontSize: '.62rem', color: MUTED, marginTop: '.2rem' } }, l),
              )
            )
          )
        ),

        tab === 'stack' && h('div', { style: panelStyle },
          h('div', { style: ptitleStyle }, 'Stack déployée via Helm · ' + STACK.length + ' composants'),
          h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '.5rem' } },
            ...STACK.map((s, i) => h('div', { key: i, style: { background: BG_ROW, border: `1px solid ${s.color}40`, borderRadius: '6px', padding: '.6rem .8rem', display: 'flex', alignItems: 'center', gap: '.6rem' } },
              h('span', { style: { width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0, display: 'inline-block' } }),
              h('div', null,
                h('div', { style: { fontSize: '.72rem', color: CYAN, fontWeight: 700 } }, s.name, h('span', { style: { color: DIM, fontWeight: 400, marginLeft: '.4rem' } }, s.ver)),
                h('div', { style: { fontSize: '.6rem', color: MUTED } }, s.role),
              )
            ))
          )
        ),

        tab === 'pipeline' && h('div', { style: panelStyle },
          h('div', { style: ptitleStyle }, 'Pipeline DevSecOps — GitOps avec Gitea + ArgoCD + Harbor + Trivy'),
          h('button', { style: { ...btnStyle, marginBottom: '1.25rem', opacity: pipeRunning ? .5 : 1 }, onClick: runPipeline, disabled: pipeRunning },
            pipeRunning ? '⏳ Pipeline en cours…' : '▶ Simuler un déploiement'
          ),
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: '.6rem' } },
            ...PIPELINE.map((p, i) => {
              const done = pipeStep > i;
              const active = pipeStep === i + 1 && pipeRunning;
              return h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: '.75rem', background: BG_ROW, border: `1px solid ${done ? p.color + '60' : `rgba(0,0,0,${jour?'.05':'.06'})`}`, borderRadius: '6px', padding: '.65rem .9rem', transition: 'border-color .3s' } },
                h('span', { style: { fontSize: '1.1rem', opacity: done || active ? 1 : .3 } }, p.icon),
                h('div', { style: { flex: 1 } },
                  h('div', { style: { fontSize: '.72rem', color: done ? p.color : MUTED, fontWeight: done ? 700 : 400 } }, p.label),
                  h('div', { style: { fontSize: '.62rem', color: DIM } }, p.detail),
                ),
                h('span', { style: { fontSize: '.65rem', color: done ? GREEN : active ? GOLD : DIM } }, done ? '✓' : active ? '⏳' : '○'),
              );
            })
          )
        ),

        tab === 'tests' && h('div', { style: panelStyle },
          h('div', { style: ptitleStyle }, 'Tests cluster & sécurité'),
          h('div', { style: { display: 'flex', gap: '.5rem', marginBottom: '1rem' } },
            h('button', { style: btnStyle, onClick: runAll }, '▶▶ Lancer tous les tests'),
          ),
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: '.5rem' } },
            ...TESTS.map((t, i) => {
              const res = testRes[i];
              return h('div', { key: i, style: { background: BG_ROW, border: `1px solid ${res ? 'rgba(34,197,94,.3)' : `rgba(0,0,0,${jour?'.06':'.08'})`}`, borderRadius: '6px', padding: '.6rem .9rem', display: 'flex', flexDirection: 'column', gap: '.3rem' } },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                  h('span', { style: { fontSize: '.72rem', color: CYAN } }, t.label),
                  h('button', { style: { ...btnStyle, padding: '.2rem .6rem', fontSize: '.62rem', opacity: running !== null ? .4 : 1 }, onClick: () => runTest(i), disabled: running !== null }, running === i ? '⏳' : '▶'),
                ),
                res && h('span', { style: { fontSize: '.65rem', color: GREEN } }, '✓ ' + res.result),
              );
            })
          )
        ),
      );
    }

    window._reactDemoRoot = ReactDOM.createRoot(root);
    window._reactDemoRoot.render(h(K3sDemo));
    return;
  }
}
