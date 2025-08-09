import * as THREE from 'three';

// Utilitários
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

// ============================
// Matrix Background (Three.js)
// ============================
(() => {
  const container = $('#matrix-bg');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  container.appendChild(renderer.domElement);

  let canvas, ctx, texture, plane;
  let fontSize = 12;
  let cols = 0, rows = 0;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ';
  const colState = [];

  function setupCanvas(w, h) {
    fontSize = Math.max(10, Math.round(w / 160)); // escala leve
    cols = Math.floor(w / fontSize);
    rows = Math.floor(h / fontSize);

    canvas = document.createElement('canvas');
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    plane = new THREE.Mesh(geo, mat);
    scene.add(plane);

    camera.position.z = 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);

    colState.length = 0;
    for (let i = 0; i < cols; i++) {
      colState[i] = { y: Math.random() * rows, speed: 0.6 + Math.random() * 2.2 };
    }
  }

  function draw(w, h) {
    ctx.fillStyle = 'rgba(10,15,20,0.1)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#00ff9c';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < cols; i++) {
      const s = colState[i];
      const ch = chars.charAt((Math.random() * chars.length) | 0);
      const x = i * fontSize;
      const y = s.y * fontSize;
      ctx.fillText(ch, x, y);
      s.y += s.speed / 20;
      if (y > h && Math.random() > 0.975) s.y = 0;
    }

    texture.needsUpdate = true;
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // limpar anterior
    if (plane) {
      plane.geometry.dispose();
      plane.material.map.dispose();
      plane.material.dispose();
      scene.remove(plane);
    }

    setupCanvas(w, h);
  }

  let raf;
  function loop() {
    draw(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }

  // Respeita reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function start() {
    resize();
    if (!prefersReduced) loop();
  }

  // Pause quando aba oculta
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!prefersReduced) loop();
  });

  window.addEventListener('resize', resize, { passive: true });
  start();
})();

// =====================
// Typing effect simples
// =====================
(() => {
  const el = $('#typing-effect');
  if (!el) return;
  const text = 'Analista de Cibersegurança Ofensiva | Pentester | Bug Hunter';
  let i = 0, del = false, curr = '';
  const speed = 100, delSpeed = 50, wait = 1500;

  function tick() {
    const full = text;
    curr = del ? full.slice(0, curr.length - 1) : full.slice(0, curr.length + 1);
    el.textContent = curr;
    let t = del ? delSpeed : speed;
    if (!del && curr === full) { t = wait; del = true; }
    else if (del && curr === '') { del = false; t = 500; }
    setTimeout(tick, t);
  }
  setTimeout(tick, 400);
})();

// ==============================
// Hero scroll effects otimizado
// ==============================
(() => {
  const hero = $('#hero-section');
  const content = $('.hero-content');
  if (!hero || !content) return;

  const effectDistance = Math.floor(window.innerHeight * 0.6) || 1;
  const root = document.documentElement;

  function onScroll() {
    const y = window.scrollY;
    const r = Math.min(y / effectDistance, 1);
    const opacity = 1 - r;
    const scale = 1 - r * 0.1;
    const blur = r * 8;
    const paddingFactor = 1 - Math.min(r * 1.2, 1);

    content.style.opacity = opacity;
    content.style.transform = `scale(${scale})`;
    content.style.filter = `blur(${blur}px)`;
    content.style.paddingTop = `${4 * paddingFactor}rem`;
    content.style.paddingBottom = `${3 * paddingFactor}rem`;
    content.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';

    const alpha = parseFloat(getComputedStyle(root).getPropertyValue('--cover-overlay-alpha')) || 0.8;
    hero.style.backgroundColor = `rgba(10,15,20, ${alpha * (1 - r)})`;
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ===============================
// Scroll reveal com Intersection
// ===============================
(() => {
  const sections = $$('main section');
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const obs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }
    }
  }, { threshold: 0.1 });

  sections.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(20px)';
    s.style.transition = 'opacity .6s ease-out, transform .6s ease-out';
    obs.observe(s);
  });
})();

// ========================================
// Menu: botão sempre visível e funcional
// ========================================
(() => {
  const nav  = document.querySelector('.site-nav');
  const btn  = document.getElementById('menu-toggle') || document.querySelector('.menu-toggle');
  const list = document.getElementById('nav-list') || document.querySelector('.nav-list');
  if (!nav || !btn || !list) return;

  function openNav() {
    nav.classList.remove('hidden');
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }
  function closeNav() {
    nav.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
  function toggleNav() {
    if (nav.classList.contains('hidden')) openNav();
    else closeNav();
  }

  // Garante que cliques no botão sempre disparem o toggle
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleNav();
  });

  // Delegação como fallback, caso o botão seja re-renderizado em algum fluxo
  document.addEventListener('click', (e) => {
    const target = e.target.closest('#menu-toggle, .menu-toggle');
    if (target) {
      e.stopPropagation();
      toggleNav();
    }
  });

  // Fecha ao clicar em links do menu
  list.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeNav();
  });

  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  // Estado inicial: fechado
  closeNav();
})();

// Ano no footer
(() => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
