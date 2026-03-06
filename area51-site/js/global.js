/* ══════════════════════════════════════════════════════
   AREA 51 — js/global.js
   Nav, mobile menu, scroll reveal, active links
   Safe on all pages (guards before every DOM access)
   ══════════════════════════════════════════════════════ */
'use strict';

/* ── NAVBAR SCROLL ── */
const $navbar = document.getElementById('navbar');
if ($navbar) {
  window.addEventListener('scroll', () => {
    $navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
  $navbar.classList.toggle('scrolled', window.scrollY > 60);
}

/* ── ACTIVE NAV LINK ── */
(function setActiveLink() {
  const file = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-center a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('#')[0];
    if (href === file || (file === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── MOBILE MENU ── */
window.toggleMenu = function () {
  const nav = document.getElementById('navCenter');
  nav?.classList.contains('open') ? closeMenu() : openMenu();
};
window.openMenu = function () {
  document.getElementById('navCenter')?.classList.add('open');
  document.getElementById('hamburger')?.classList.add('open');
  document.getElementById('navOverlay')?.classList.add('show');
  document.body.classList.add('menu-open');
};
window.closeMenu = function () {
  document.getElementById('navCenter')?.classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('open');
  document.getElementById('navOverlay')?.classList.remove('show');
  document.body.classList.remove('menu-open');
};
document.querySelectorAll('#navCenter a').forEach(link => {
  link.addEventListener('click', () => setTimeout(closeMenu, 80));
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
const $overlay = document.getElementById('navOverlay');
if ($overlay) {
  $overlay.addEventListener('click', closeMenu);
  $overlay.addEventListener('touchend', e => { e.preventDefault(); closeMenu(); });
}

/* ── MENU TABS (home only) ── */
window.mostraTab = function (nome, btn) {
  document.querySelectorAll('.mgrid').forEach(g => g.classList.remove('on'));
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('on'));
  document.getElementById('t-' + nome)?.classList.add('on');
  btn?.classList.add('on');
};

/* ── SCROLL REVEAL ── */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } });
}, { threshold: 0.08 });
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
