/*
 * Animasi demo di halaman utama.
 *
 * Angka yang ditampilkan TIDAK dikarang. Contoh kasusnya dijalankan lewat
 * mesin faraid yang sama persis dengan yang dipakai user nanti — jadi apa yang
 * dilihat di halaman depan memang begitulah hasilnya.
 */

(function () {
  'use strict';

  var CONTOH = {
    jenisKelamin: 'L',
    harta: { total: 640000000, biayaJenazah: 10000000, hutang: 30000000, wasiat: 0 },
    ahliWaris: { istri: 1, anak_lk: 2, anak_pr: 1, ibu: 1 }
  };

  var hasil = window.Faraid.hitung(CONTOH);
  var penerima = hasil.ahliWaris.filter(function (a) { return a.status === 'menerima'; });
  var WARNA = ['#E8391D', '#F5A623', '#A0341A', '#F5760A', '#C7541F', '#7A2E12'];

  function rp(n) {
    return 'Rp ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function rpPendek(n) {
    if (n >= 1e9) return 'Rp ' + (n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 1).replace('.', ',') + ' M';
    if (n >= 1e6) return 'Rp ' + Math.round(n / 1e6) + ' jt';
    return rp(n);
  }
  function ikon(id, gaya) {
    return '<svg class="ic" aria-hidden="true"' + (gaya ? ' style="' + gaya + '"' : '') +
      '><use href="#' + id + '"></use></svg>';
  }

  // ── Isi tiap tahap ───────────────────────────────────────────────
  var TAHAP = [
    {
      judul: 'Langkah 1 — Kondisi keluarga',
      isi: function () {
        var chips = penerima.map(function (a, i) {
          return '<span class="demo-chip" style="animation-delay:' + (i * 160) + 'ms">' +
            ikon(a.icon) + (a.jumlah > 1 ? a.jumlah + ' ' : '') + a.label + '</span>';
        }).join('');
        return '<p class="flav-body-sm" style="margin-bottom:var(--space-4)">Seorang bapak wafat ' +
          'dan meninggalkan:</p><div>' + chips + '</div>';
      }
    },
    {
      judul: 'Langkah 2 — Harta dan kewajiban',
      isi: function () {
        return hasil.harta.langkah.map(function (l, i) {
          return '<div class="demo-baris" style="opacity:0;animation:naik .4s ease ' +
            (i * 170) + 'ms forwards">' +
            ikon(l.tipe === 'hasil' ? 'i-timbangan' : l.tipe === 'awal' ? 'i-kotak' : 'i-dompet') +
            '<span' + (l.tipe === 'hasil' ? ' style="font-weight:600"' : '') + '>' + l.label + '</span>' +
            '<b style="color:' + (l.nilai < 0 ? 'var(--color-flame)' : 'inherit') + '">' +
            (l.nilai < 0 ? '− ' : '') + rpPendek(Math.abs(l.nilai)) + '</b></div>';
        }).join('');
      }
    },
    {
      judul: 'Langkah 3 — Pembagiannya',
      isi: function () {
        var seg = penerima.map(function (a, i) {
          return '<div class="demo-bar-seg" data-lebar="' + (a.persen) + '" ' +
            'style="background:' + WARNA[i % WARNA.length] + '">' + a.bagianTeks + '</div>';
        }).join('');
        return '<p class="flav-body-sm" style="margin-bottom:var(--space-2)">Dari ' +
          rp(hasil.harta.tirkah) + ' yang siap dibagi:</p>' +
          '<div class="demo-bar">' + seg + '</div>' +
          penerima.map(function (a, i) {
            return '<div class="demo-baris" style="opacity:0;animation:naik .4s ease ' +
              (600 + i * 150) + 'ms forwards">' +
              '<span style="width:10px;height:10px;border-radius:2px;background:' +
              WARNA[i % WARNA.length] + ';flex:none"></span>' +
              '<span>' + a.label + (a.jumlah > 1 ? ' ×' + a.jumlah : '') + '</span>' +
              '<b>' + rp(a.nominal) + '</b></div>';
          }).join('');
      },
      sesudah: function (wadah) {
        // Bar diisi setelah elemen menempel supaya transisinya kelihatan.
        // Membaca offsetWidth memaksa browser menetapkan gaya awal (width: 0)
        // lebih dulu, sehingga perubahan berikutnya benar-benar dianimasikan.
        // Cara ini tidak bergantung pada requestAnimationFrame, yang tidak
        // berjalan kalau halaman sedang tidak digambar.
        Array.prototype.forEach.call(wadah.querySelectorAll('.demo-bar-seg'), function (el, i) {
          void el.offsetWidth;
          el.style.transitionDelay = (i * 130) + 'ms';
          el.style.width = el.dataset.lebar + '%';
        });
      }
    },
    {
      judul: 'Langkah 4 — Dasar aturannya',
      isi: function () {
        return '<div class="dalil" style="margin-top:0">' +
          '<div class="dalil-rujukan">QS An-Nisa ayat 11</div>' +
          '<div class="dalil-arab" lang="ar" dir="rtl">يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ</div>' +
          '<div class="dalil-terjemah">Allah mensyariatkan kepadamu tentang pembagian warisan ' +
          'untuk anak-anakmu: bagian anak laki-laki sama dengan bagian dua anak perempuan.</div>' +
          '</div>' +
          '<p class="flav-body-sm" style="margin-top:var(--space-4)">Setiap angka di atas ' +
          'ditelusuri sampai ke ayat atau haditsnya, dan bisa kamu baca sendiri di halaman hasil.</p>';
      }
    }
  ];

  var wadahIsi = document.getElementById('demo-isi');
  var wadahJudul = document.getElementById('demo-tahap');
  var wadahTitik = document.getElementById('demo-titik');
  var kini = 0;
  var timer = null;

  wadahTitik.innerHTML = TAHAP.map(function (t, i) {
    return '<button type="button" aria-label="Lihat ' + t.judul + '" data-tahap="' + i + '"></button>';
  }).join('');

  function tampil(n) {
    kini = n % TAHAP.length;
    var t = TAHAP[kini];
    wadahJudul.textContent = t.judul;
    wadahIsi.innerHTML = '<div class="demo-panel aktif">' + t.isi() + '</div>';
    if (t.sesudah) t.sesudah(wadahIsi);
    Array.prototype.forEach.call(wadahTitik.children, function (s, i) {
      s.classList.toggle('on', i === kini);
      s.setAttribute('aria-current', String(i === kini));
    });
  }

  // Selalu bersihkan timer lama sebelum menjadwalkan yang baru. Tanpa ini,
  // setiap ketukan pada titik navigasi meninggalkan rantai timer sendiri dan
  // panel bisa berganti sendiri di waktu yang tidak diinginkan.
  function jalan() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      tampil(kini + 1);
      jalan();
    }, kini === 2 ? 4600 : 3600);
  }

  tampil(0);

  var kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!kurangiGerak.matches) jalan();

  // hormati preferensi yang berubah di tengah jalan
  kurangiGerak.addEventListener('change', function (e) {
    if (e.matches) clearTimeout(timer);
    else jalan();
  });

  // berhenti saat tidak terlihat, supaya tidak membuang baterai
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearTimeout(timer);
    else if (!kurangiGerak.matches) jalan();
  });

  // ketuk titik untuk pindah manual
  wadahTitik.addEventListener('click', function (e) {
    var t = e.target.closest('[data-tahap]');
    if (!t) return;
    tampil(Number(t.dataset.tahap));
    if (!kurangiGerak.matches) jalan();
    else clearTimeout(timer);
  });
})();
