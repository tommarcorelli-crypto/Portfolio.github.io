/**
 * ================================================================
 * script.js — Portfolio Tom Marcorelli
 * BTS SIO SISR — Thème Cyberpunk Japonais
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
   Apparaît après 300px de scroll, style cyberpunk [↑]
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
    border: 1.5px solid var(--clr-gold, #eab308);
    color: var(--clr-gold, #eab308);
    font-family: 'Share Tech Mono', monospace;
    font-size: 18px;
    cursor: pointer;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s, background 0.2s, color 0.2s, box-shadow 0.2s;
    box-shadow: none;
  `;

  btn.addEventListener('mouseenter', () => {
    btn.style.background = 'var(--clr-gold, #eab308)';
    btn.style.color      = '#06080a';
    btn.style.boxShadow  = '0 0 14px var(--clr-gold, #eab308)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = 'transparent';
    btn.style.color      = 'var(--clr-gold, #eab308)';
    btn.style.boxShadow  = 'none';
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.body.appendChild(btn);

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

  console.log(
    '%c[TM] _ Portfolio chargé ✓\n%cBTS SIO SISR — Nexa Digital School, Paris\n%cTips: clique sur le toggle ☀️ pour le mode Jour',
    'color:#00f5ff;font-family:monospace;font-size:16px;font-weight:bold;',
    'color:#7a9bc4;font-family:monospace;font-size:11px;',
    'color:#2563eb;font-family:monospace;font-size:11px;'
  );
});

