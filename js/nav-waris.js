/*
 * Waris — penyesuaian navbar seluler (di luar design system, jadi tidak ikut
 * tertimpa saat flavida.css / js/flavida.js disinkronkan ulang).
 *
 *  1) Tombol tutup DI DALAM lapisan menu. Navbar berada di bawah overlay
 *     (--z-overlay > --z-nav), sehingga ikon ✕ pada tombol hamburger tidak
 *     terlihat selagi menu terbuka.
 *  2) Tombol utama navbar ("Mulai Hitung") disembunyikan selama banner cover
 *     masih terlihat, karena cover sudah punya tombol itu sendiri.
 *
 * Keadaan menu tetap dipegang js/flavida.js; berkas ini hanya memakai ulang
 * tombolnya (tidak menggandakan state, tidak menyentuh scroll lock-nya).
 */
(function () {
  var doc = document;
  var menu = doc.querySelector('.fl-menu');
  var toggle = doc.querySelector('.fl-nav__toggle');
  if (!menu || !toggle) return;

  /* 1) tutup menu dari dalam overlay */
  var close = doc.querySelector('.fl-menu__close');
  if (close) {
    close.addEventListener('click', function () {
      if (menu.classList.contains('is-open')) toggle.click();
      toggle.focus();
    });
  }

  /* 2) sembunyikan tombol utama navbar selama cover terlihat */
  var nav = doc.querySelector('.fl-nav');
  var hero = doc.querySelector('.fl-hero');
  if (!nav || !hero || !nav.querySelector('.fl-nav__cta')) return;

  var sync = function (covered) { nav.classList.toggle('is-cover', covered); };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) sync(entries[i].isIntersecting);
    }).observe(hero);
  } else {
    var onScroll = function () {
      var r = hero.getBoundingClientRect();
      sync(r.bottom > 0 && r.top < window.innerHeight);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }
})();
