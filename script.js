/* ============================================================
   ANDRESNOTES_ · Main Script
   ============================================================ */

/* ── STARFIELD CANVAS ───────────────────────────────────────── */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let animId;
  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars(count) {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.2,
        alpha: Math.random() * 0.6 + 0.1,
        speed: Math.random() * 0.15 + 0.02,
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        color: pickStarColor(),
      });
    }
  }

  function pickStarColor() {
    const roll = Math.random();
    if (roll < 0.06) return '#a855f7';
    if (roll < 0.12) return '#22d3ee';
    if (roll < 0.16) return '#60a5fa';
    return '#ffffff';
  }

  function drawNebula() {
    const grad1 = ctx.createRadialGradient(
      canvas.width * 0.15, canvas.height * 0.3, 0,
      canvas.width * 0.15, canvas.height * 0.3, canvas.width * 0.35
    );
    grad1.addColorStop(0, 'rgba(124,58,237,0.07)');
    grad1.addColorStop(1, 'transparent');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const grad2 = ctx.createRadialGradient(
      canvas.width * 0.82, canvas.height * 0.65, 0,
      canvas.width * 0.82, canvas.height * 0.65, canvas.width * 0.28
    );
    grad2.addColorStop(0, 'rgba(34,211,238,0.05)');
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  let tick = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNebula();

    tick += 0.016;

    stars.forEach(s => {
      s.twinklePhase += s.twinkleSpeed;
      const twinkle = Math.sin(s.twinklePhase) * 0.3 + 0.7;

      ctx.save();
      ctx.globalAlpha = s.alpha * twinkle;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      if (s.r > 0.9) {
        ctx.globalAlpha = s.alpha * twinkle * 0.25;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      s.y -= s.speed;
      if (s.y < -2) {
        s.y = canvas.height + 2;
        s.x = Math.random() * canvas.width;
      }
    });

    animId = requestAnimationFrame(draw);
  }

  resize();
  createStars(180);
  draw();

  window.addEventListener('resize', () => {
    resize();
    createStars(180);
  });

  canvas.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
})();

/* ── NAVBAR ─────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastY = y;
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active');
  });
})();

function closeMobile() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('active');
}

/* ── SMOOTH SCROLL ──────────────────────────────────────────── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
      closeMobile();
    }
  });
});

/* ── REVEAL ON SCROLL ───────────────────────────────────────── */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const siblings = [...el.parentElement.querySelectorAll('.reveal')];
          const idx = siblings.indexOf(el);
          setTimeout(() => {
            el.classList.add('visible');
          }, idx * 80);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach(el => observer.observe(el));
})();

/* ── GALLERY LIGHTBOX ───────────────────────────────────────── */
(function initLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <button class="lb-close">✕</button>
    <button class="lb-prev">‹</button>
    <button class="lb-next">›</button>
    <div class="lb-img-wrap"><img class="lb-img" src="" alt="" /></div>
    <p class="lb-caption"></p>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .lightbox-overlay {
      position: fixed; inset: 0; z-index: 999;
      background: rgba(0,0,0,0.92);
      backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none;
      transition: opacity 0.3s;
    }
    .lightbox-overlay.open { opacity: 1; pointer-events: all; }
    .lb-img-wrap { max-width: 88vw; max-height: 80vh; }
    .lb-img {
      max-width: 100%; max-height: 80vh;
      object-fit: contain; border-radius: 12px;
      box-shadow: 0 32px 80px rgba(0,0,0,0.8);
    }
    .lb-caption {
      position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
      color: rgba(255,255,255,0.6); font-size: 0.85rem; white-space: nowrap;
    }
    .lb-close, .lb-prev, .lb-next {
      position: absolute; background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15); border-radius: 50%;
      color: white; font-size: 1.2rem; cursor: pointer;
      transition: background 0.2s; display: flex; align-items: center; justify-content: center;
    }
    .lb-close { top: 24px; right: 24px; width: 40px; height: 40px; }
    .lb-prev { left: 24px; top: 50%; transform: translateY(-50%); width: 48px; height: 48px; font-size: 1.6rem; }
    .lb-next { right: 24px; top: 50%; transform: translateY(-50%); width: 48px; height: 48px; font-size: 1.6rem; }
    .lb-close:hover, .lb-prev:hover, .lb-next:hover { background: rgba(255,255,255,0.2); }
  `;
  document.head.appendChild(style);
  document.body.appendChild(overlay);

  const lbImg = overlay.querySelector('.lb-img');
  const lbCaption = overlay.querySelector('.lb-caption');
  let current = 0;
  const images = [...items].map(item => ({
    src: item.querySelector('img').src,
    caption: item.querySelector('.gallery-overlay p').textContent,
  }));

  function open(idx) {
    current = idx;
    lbImg.src = images[idx].src;
    lbCaption.textContent = images[idx].caption;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    current = (current + dir + images.length) % images.length;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = images[current].src;
      lbCaption.textContent = images[current].caption;
      lbImg.style.opacity = '1';
    }, 150);
  }

  lbImg.style.transition = 'opacity 0.15s';

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  overlay.querySelector('.lb-close').addEventListener('click', close);
  overlay.querySelector('.lb-prev').addEventListener('click', () => navigate(-1));
  overlay.querySelector('.lb-next').addEventListener('click', () => navigate(1));
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
})();

/* ── CONTACT FORM ───────────────────────────────────────────── */
function handleFormSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const btn = form.querySelector('button[type="submit"]');
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const asunto = document.getElementById('asunto').value;
  const mensaje = document.getElementById('mensaje').value;

  btn.textContent = 'Enviando...';
  btn.disabled = true;

  const subject = encodeURIComponent(`[${asunto || 'Contacto'}] Mensaje de ${nombre}`);
  const body = encodeURIComponent(`Nombre: ${nombre}\nEmail: ${email}\nAsunto: ${asunto}\n\n${mensaje}`);
  const mailtoLink = `mailto:andresfsabogal08@gmail.com?subject=${subject}&body=${body}`;

  setTimeout(() => {
    window.location.href = mailtoLink;
    btn.textContent = 'Mensaje preparado ✓';
    btn.style.background = 'linear-gradient(135deg, #059669, #34d399)';
    setTimeout(() => {
      btn.textContent = 'Enviar mensaje';
      btn.disabled = false;
      btn.style.background = '';
      form.reset();
    }, 3000);
  }, 600);
}

/* ── CURSOR GLOW (desktop only) ─────────────────────────────── */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9999;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;
    opacity: 0;
  `;
  document.body.appendChild(glow);

  let mx = 0, my = 0, gx = 0, gy = 0;
  let visible = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!visible) { visible = true; glow.style.opacity = '1'; }
  });
  document.addEventListener('mouseleave', () => {
    visible = false; glow.style.opacity = '0';
  });

  function animGlow() {
    gx += (mx - gx) * 0.1;
    gy += (my - gy) * 0.1;
    glow.style.left = gx + 'px';
    glow.style.top = gy + 'px';
    requestAnimationFrame(animGlow);
  }
  animGlow();
})();

/* ── TYPED EFFECT (hero subtitle) ──────────────────────────── */
(function initTyped() {
  const phrases = [
    'Construyo con IA.',
    'Divulgo ciencia y tecnología.',
    'Investigador nuclear.',
    'Solo founder.',
    'Physics @ U. Nacional.',
  ];

  const el = document.querySelector('.hero-subtitle');
  if (!el) return;

  el.innerHTML = '<span class="typed-text"></span><span class="typed-cursor">|</span>';
  const typed = el.querySelector('.typed-text');
  const cursor = el.querySelector('.typed-cursor');

  const cursorStyle = document.createElement('style');
  cursorStyle.textContent = `
    .typed-cursor {
      display: inline-block;
      margin-left: 2px;
      animation: blink-cursor 0.85s step-end infinite;
      color: #a855f7;
    }
    @keyframes blink-cursor { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  `;
  document.head.appendChild(cursorStyle);

  let pi = 0, ci = 0, deleting = false;
  let delay = 80;

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      typed.textContent = phrase.slice(0, ci + 1);
      ci++;
      if (ci === phrase.length) {
        deleting = true;
        delay = 2200;
      } else {
        delay = 55 + Math.random() * 40;
      }
    } else {
      typed.textContent = phrase.slice(0, ci - 1);
      ci--;
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        delay = 350;
      } else {
        delay = 28;
      }
    }
    setTimeout(tick, delay);
  }

  setTimeout(tick, 1200);
})();

/* ── NUMBER COUNTER ANIMATION ───────────────────────────────── */
(function initCounters() {
  const stats = document.querySelectorAll('.stat-num');
  const targets = [3, 2, 1];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const idx = [...stats].indexOf(el);
      const target = targets[idx] || parseInt(el.textContent);
      const suffix = el.textContent.replace(/[0-9]/g, '');
      let current = 0;
      const step = target / 30;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.ceil(current) + suffix;
        if (current >= target) clearInterval(timer);
      }, 35);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => observer.observe(el));
})();
