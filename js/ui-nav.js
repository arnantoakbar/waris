/*
 * Navigasi — tombol hamburger untuk layar sempit.
 *
 * Di layar kecil, logo "Waris by Flavida" bersaing tempat dengan tautan menu
 * sampai terpotong. Menu dipindahkan ke balik hamburger supaya logonya utuh.
 */

(function () {
  'use strict';

  var tombol = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (!tombol || !menu) return;

  var mqDesktop = window.matchMedia('(min-width: 768px)');

  function setel(buka) {
    tombol.setAttribute('aria-expanded', String(buka));
    tombol.setAttribute('aria-label', buka ? 'Tutup menu' : 'Buka menu');
    // Di desktop menu selalu tampil; atribut hidden hanya berlaku di mobile,
    // di mana CSS-nya sudah diatur untuk mengabaikannya saat lebar.
    menu.hidden = !buka && !mqDesktop.matches;
  }

  setel(false);

  tombol.addEventListener('click', function () {
    setel(tombol.getAttribute('aria-expanded') !== 'true');
  });

  // Menutup menu setelah salah satu tautannya diketuk
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a, button') && !mqDesktop.matches) setel(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && tombol.getAttribute('aria-expanded') === 'true') {
      setel(false);
      tombol.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (mqDesktop.matches) return;
    if (tombol.getAttribute('aria-expanded') !== 'true') return;
    if (e.target.closest('.nav-inner')) return;
    setel(false);
  });

  // Kalau layar melebar saat menu terbuka, kembalikan ke keadaan normal
  mqDesktop.addEventListener('change', function () { setel(false); });

  // Tandai halaman yang sedang dibuka
  var berkas = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(menu.querySelectorAll('a[href]'), function (a) {
    if (a.getAttribute('href') === berkas && !a.classList.contains('btn')) {
      a.setAttribute('aria-current', 'page');
    }
  });
})();
