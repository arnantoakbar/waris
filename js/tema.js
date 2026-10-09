/*
 * Tombol terang/gelap. Bawaannya mengikuti pengaturan perangkat (data-theme="auto");
 * begitu pengguna menekan tombol, pilihannya dipakai dan diingat di browser ini
 * (kunci "waris-tema", hanya berisi "light" atau "dark") lewat skrip kecil di <head>
 * tiap halaman. Tidak ada isian pengguna yang ikut tersimpan.
 */
(function () {
  var h = document.documentElement;
  var perangkat = window.matchMedia('(prefers-color-scheme: dark)');
  var tombol = [].slice.call(document.querySelectorAll('[data-tema-toggle]'));
  if (!tombol.length) return;

  function gelap() {
    var t = h.getAttribute('data-theme');
    return t === 'dark' || (t !== 'light' && perangkat.matches);
  }
  function segarkan() {
    tombol.forEach(function (b) { b.setAttribute('aria-pressed', String(gelap())); });
  }

  tombol.forEach(function (b) {
    b.addEventListener('click', function () {
      var t = gelap() ? 'light' : 'dark';
      h.setAttribute('data-theme', t);
      try { localStorage.setItem('waris-tema', t); } catch (e) { /* mode privat: pilihan berlaku sampai halaman ditutup */ }
      segarkan();
    });
  });
  if (perangkat.addEventListener) perangkat.addEventListener('change', segarkan);
  segarkan();
})();
