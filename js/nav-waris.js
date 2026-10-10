/*
 * Perilaku navbar Waris, sama seperti situs Zakat.
 *
 * 1. Tombol utama navbar disembunyikan selama ajakan yang sama di hero masih
 *    terlihat (data-cta-sentinel), dan muncul lagi begitu hero digulir lewat.
 * 2. Kit menahan navbar selama ada fokus di dalamnya. Di layar sentuh, tombol
 *    yang baru diketuk tetap berfokus, jadi navbar tidak menyingkir saat
 *    menggulir. Fokus dilepas setelah ketukan pointer (event.detail > 0);
 *    lewat keyboard (detail 0) fokus tetap dijaga.
 *
 * Buka/tutup menu dipegang js/flavida.js. Navbar ada di atas lapisan menu
 * (z-index 90 di css/waris.css), jadi tombol menu berubah jadi ✕ di tempat yang sama.
 */
(function () {
  'use strict';
  var nav = document.querySelector('.fl-nav');
  if (!nav) return;

  var sentinel = document.querySelector('[data-cta-sentinel]');
  if (sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      nav.toggleAttribute('data-sans-cta', e[0].isIntersecting);
    }).observe(sentinel);
  }

  nav.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b && e.detail > 0) setTimeout(function () { b.blur(); }, 0);
  });
})();
