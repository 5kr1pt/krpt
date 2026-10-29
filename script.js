// Utilitários
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

// =====================
// Typing effect
// =====================
(() => {
  const el = $('#typing-effect');
  if (!el) return;
  const text = 'Offensive Security Engineer | Red Team | Bug Hunter';
  let del = false, curr = '';
  const speed = 100, delSpeed = 50, wait = 1500;

  function tick() {
    curr = del ? text.slice(0, curr.length - 1) : text.slice(0, curr.length + 1);
    el.textContent = curr;
    let t = del ? delSpeed : speed;
    if (!del && curr === text) { t = wait; del = true; }
    else if (del && curr === '') { del = false; t = 500; }
    setTimeout(tick, t);
  }
  setTimeout(tick, 400);
})();

// ==============================
// Hero scroll effect
// ==============================
(() => {
  const hero = $('#hero-section');
  const content = $('.hero-content');
  if (!hero || !content) return;

  const navHeight = document.querySelector('.site-header')?.offsetHeight || 60;

  let ticking = false;
  let lastR = -1;

  function update() {
    ticking = false;
    const rect = hero.getBoundingClientRect();
    const heroHeight = hero.offsetHeight;
    const effectDistance = heroHeight * 0.6 || 1;
    // scrolled: 0 at page top, increases as hero scrolls off-screen
    const scrolled = Math.max(0, navHeight - rect.top);
    const r = Math.min(scrolled / effectDistance, 1);
    // Abaixo do hero r fica em 1: não reescreve estilo (nem refaz o blur) a cada scroll
    if (r === lastR) return;
    lastR = r;

    content.style.opacity = 1 - r;
    content.style.transform = `scale(${1 - r * 0.1})`;
    content.style.filter = r ? `blur(${r * 8}px)` : 'none';
    content.style.pointerEvents = r > 0.9 ? 'none' : 'auto';
    hero.style.backgroundColor = `rgba(10,15,20,${(1 - r) * 0.8})`;
  }

  // No máximo uma atualização por frame
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ===============================
// Scroll reveal (IntersectionObserver)
// ===============================
(() => {
  const sections = $$('main section');
  if (!sections.length || !('IntersectionObserver' in window)) return;

  // Revela quando o topo da seção entra na tela. Com threshold: 0.1, uma seção
  // mais alta que 10x a tela nunca chegaria a 10% visível e ficaria invisível.
  const obs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    }
  }, { rootMargin: '0px 0px -10% 0px' });

  sections.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(20px)';
    s.style.transition = 'opacity .6s ease-out, transform .6s ease-out';
    obs.observe(s);
  });
})();

// ========================================
// Mobile menu toggle
// ========================================
(() => {
  const nav = document.querySelector('.site-nav');
  const btn = document.getElementById('menu-toggle');
  const list = document.getElementById('nav-list');
  if (!nav || !btn || !list) return;

  const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

  function openMenu() {
    nav.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Fechar menu');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    nav.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('menu-open');
  }

  function toggleMenu() {
    if (isDesktop()) return;
    nav.classList.contains('is-open') ? closeMenu() : openMenu();
  }

  btn.addEventListener('click', toggleMenu);

  // Close when a nav link is clicked
  list.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu();
  });

  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Close when viewport widens to desktop
  window.addEventListener('resize', () => {
    if (isDesktop()) closeMenu();
  }, { passive: true });
})();

// ==============================
// Lightbox dos prints de Hall of Fame
// ==============================
(() => {
  const dialog = $('#proof-dialog');
  // Sem suporte a <dialog>, o link abre o print em outra aba
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const img = $('img', dialog);

  $$('[data-proof]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      img.src = link.getAttribute('href');
      img.alt = link.dataset.proofAlt || '';
      dialog.showModal();
    });
  });

  // Fecha ao clicar fora da imagem
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
})();

// Ano no footer
(() => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

// ==============================
// Cert progress-bar animation
// ==============================
(() => {
  const fills = $$('.ctt-bar-fill');
  if (!fills.length || !('IntersectionObserver' in window)) return;

  const obs = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.fill || '0%';
        obs.unobserve(e.target);
      }
    }
  }, { threshold: 0.4 });

  fills.forEach(f => obs.observe(f));
})();

// ============================
// Console Easter Egg
// ============================
(() => {
  const g  = 'color:#00ff9c;font-family:monospace;';
  const b  = 'color:#00ff9c;font-family:monospace;font-weight:bold;font-size:13px;';
  const y  = 'color:#ffd700;font-family:monospace;';
  const d  = 'color:#4a5568;font-family:monospace;font-size:11px;';
  setTimeout(() => {
    console.log('%c\n[*] Reconhecimento via DevTools detectado.', b);
    console.log('%c[*] Target%c pgwerneck5@gmail.com', g, y);
    console.log('%c[+] Curiosidade: HIGH', g);
    console.log('%c[+] Stack: Python · PowerShell · Burp Suite · BloodHound · Impacket', g);
    console.log('%c[+] CVE count: 6', g);
    console.log('%c[!] Você chegou até aqui — isso já é critério de contratação.', b);
    console.log('%c    → linkedin.com/in/pgw-script', y);
    console.log('%c    → github.com/5kr1pt', y);
    console.log('%c\n[hint] Tente o Konami Code: ↑↑↓↓←→←→BA', d);
  }, 1200);
})();

// ============================
// Konami Code Easter Egg
// ============================
(() => {
  const SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;

  document.addEventListener('keydown', e => {
    idx = e.key === SEQ[idx] ? idx + 1 : (e.key === SEQ[0] ? 1 : 0);
    if (idx === SEQ.length) { idx = 0; showKonamiToast(); }
  });

  function showKonamiToast() {
    const old = document.getElementById('konami-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = 'konami-toast';
    toast.innerHTML = `
      <div class="kt-header">✓ ACCESS GRANTED</div>
      <pre class="kt-body">root@5kr1pt:~# whoami
→ hacker reconhecendo o portfólio 👀

root@5kr1pt:~# cat flag.txt
→ CTF-{v0c3_ach0u_0_easter_egg}

root@5kr1pt:~# _</pre>`;

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('kt-visible'));
    setTimeout(() => {
      toast.classList.remove('kt-visible');
      setTimeout(() => toast.remove(), 500);
    }, 5500);
  }
})();
