/*
 * Wizard input.
 *
 * Satu pertanyaan per layar, isian sesedikit mungkin, dan yang jarang dipakai
 * disembunyikan di dalam lipatan. Begitu hasil pertama muncul, setiap perubahan
 * langsung menghitung ulang tanpa perlu menekan tombol lagi.
 *
 * Susunan ahli waris disimpan sebagai STRUKTUR keluarga (js/keluarga.js), bukan
 * sekadar angka. Daftar penghitung dan pohon keluarga menyunting model yang
 * sama, jadi keduanya tidak mungkin bertentangan — dan hubungan seperti "cucu
 * lewat anak perempuan" tidak perlu ditebak.
 */

(function () {
  'use strict';

  var H = window.Heirs;
  var K = window.Keluarga;
  var TOTAL_LANGKAH = 5;

  /* pakaiHukumIndonesia menentukan apakah hasil ditampilkan murni menurut
     Al-Qur'an dan sunnah, atau ditambah aturan negara yang berlaku bagi umat
     Islam (harta bersama + catatan Pengadilan Agama). Dasarnya syariat murni;
     mencentang harta bersama di langkah 3 otomatis menyalakannya, karena itu
     memang permintaan eksplisit user. */
  var state = {
    keluarga: K.baru(null),
    harta: { total: 0, totalManual: 0, rincian: {}, biayaJenazah: 0, hutang: 0, wasiat: 0, hartaBersama: false },
    kondisi: {},
    pakaiHukumIndonesia: false
  };

  var langkahKini = 1;
  var sudahAdaHasil = false;
  var modeIsian = 'daftar';   // 'daftar' | 'pohon'
  var modeHarta = 'total';    // 'total'  | 'rincian'

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function turunan() { return K.keAhliWaris(state.keluarga); }

  // ── Format uang ──────────────────────────────────────────────────
  function formatRibuan(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function bacaAngka(t) { var d = String(t).replace(/\D/g, ''); return d ? parseInt(d, 10) : 0; }

  function pasangInputUang(el, saat) {
    el.addEventListener('input', function () {
      var diUjung = el.selectionStart === el.value.length;
      var nilai = bacaAngka(el.value);
      el.value = formatRibuan(nilai);
      if (diUjung) el.setSelectionRange(el.value.length, el.value.length);
      saat(nilai);
      hitungUlangKalauPerlu();
    });
    el.addEventListener('focus', function () { if (bacaAngka(el.value) === 0) el.select(); });
  }

  function ikon(id, kelas) {
    return '<svg class="ic ' + (kelas || '') + '" aria-hidden="true"><use href="#' + id + '"></use></svg>';
  }

  // ═══════════════════════════════════════════════════════════════
  // LANGKAH 1 — jenis kelamin pewaris
  // ═══════════════════════════════════════════════════════════════
  $$('#pilih-kelamin .pilih').forEach(function (b) {
    b.addEventListener('click', function () {
      state.keluarga.jenisKelamin = b.dataset.nilai;
      $$('#pilih-kelamin .pilih').forEach(function (x) {
        x.setAttribute('aria-pressed', String(x === b));
      });
      // Pasangan dibatasi ulang: pewaris perempuan hanya boleh punya 1 suami.
      // Batasnya hanya menyangkut pasangan yang masih hidup — yang sudah wafat
      // bukan ahli waris, jadi berapa pun jumlahnya tidak perlu dipangkas.
      var maks = K.MAKS_PASANGAN(state.keluarga.jenisKelamin);
      var sisaJatah = maks;
      state.keluarga.pasangan = state.keluarga.pasangan.filter(function (o) {
        if (o.hidup === false) return true;
        return sisaJatah-- > 0;
      });
      renderAhliWaris();
      renderKondisi();
      hitungUlangKalauPerlu();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // LANGKAH 2 — harta
  // ═══════════════════════════════════════════════════════════════
  var inTotal = $('#in-total');

  function renderRincian() {
    $('#rincian-harta').innerHTML = window.Advice.JENIS_HARTA.map(function (j) {
      return '<div class="uang-field" style="margin-bottom:var(--space-3)">' +
        '<label class="uang-label" for="rin-' + j.id + '" style="display:flex;align-items:center;gap:8px">' +
        ikon(j.icon, 'ic-sm') + j.label + '</label>' +
        '<div class="uang-box"><span class="rp">Rp</span>' +
        '<input id="rin-' + j.id + '" type="text" inputmode="numeric" value="0" data-rincian="' + j.id + '"></div>' +
        '</div>';
    }).join('');

    $$('#rincian-harta input').forEach(function (el) {
      pasangInputUang(el, function (nilai) {
        state.harta.rincian[el.dataset.rincian] = nilai;
        sinkronTotal();
      });
    });
  }

  /*
   * Mode harta: "total saja" atau "rincikan per jenis".
   *
   * Sebelumnya keduanya bercampur — user mengisi total, lalu menemukan kolom
   * rincian, dan begitu diisi totalnya tertimpa serta terkunci sampai seluruh
   * rincian dikosongkan. Sekarang keduanya dipisah tegas dan bisa ditukar
   * kapan saja tanpa kehilangan angka.
   */
  function jumlahRincian() {
    return Object.keys(state.harta.rincian).reduce(function (t, k) {
      return t + (state.harta.rincian[k] || 0);
    }, 0);
  }

  function setModeHarta(mode) {
    if (mode === modeHarta) return;

    if (mode === 'rincian') {
      // Angka total yang sudah diketik tidak dibuang, hanya tidak dipakai
      // selama mode rincian aktif.
      state.harta.totalManual = state.harta.total;
    } else {
      // Kembali ke total: bawa hasil penjumlahan rincian sebagai nilai awal
      // yang bisa langsung disunting.
      var jml = jumlahRincian();
      if (jml > 0) state.harta.totalManual = jml;
      state.harta.rincian = {};
      $$('#rincian-harta input').forEach(function (el) { el.value = '0'; });
      inTotal.value = formatRibuan(state.harta.totalManual || 0);
    }

    modeHarta = mode;
    $$('[data-mode-harta]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.modeHarta === modeHarta));
    });
    $('#harta-total').hidden = modeHarta !== 'total';
    $('#harta-rincian').hidden = modeHarta !== 'rincian';
    sinkronTotal();
  }

  function sinkronTotal() {
    if (modeHarta === 'rincian') {
      state.harta.total = jumlahRincian();
      $('#rincian-jumlah').textContent = 'Rp ' + formatRibuan(state.harta.total);
    } else {
      state.harta.total = state.harta.totalManual || 0;
    }
    hitungUlangKalauPerlu();
  }

  pasangInputUang(inTotal, function (n) { state.harta.totalManual = n; sinkronTotal(); });
  pasangInputUang($('#in-biaya'), function (n) { state.harta.biayaJenazah = n; });
  pasangInputUang($('#in-hutang'), function (n) { state.harta.hutang = n; });
  pasangInputUang($('#in-wasiat'), function (n) { state.harta.wasiat = n; });

  $('#ck-harta-bersama').addEventListener('click', function () {
    state.harta.hartaBersama = !state.harta.hartaBersama;
    this.setAttribute('aria-pressed', String(state.harta.hartaBersama));
    // Harta bersama adalah aturan negara. Mencentangnya berarti user memang
    // ingin aturan Indonesia ikut dipakai.
    if (state.harta.hartaBersama) state.pakaiHukumIndonesia = true;
    hitungUlangKalauPerlu();
  });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-lipat]');
    if (!t) return;
    t.closest('.lipat').classList.toggle('buka');
  });

  // ═══════════════════════════════════════════════════════════════
  // LANGKAH 4 — ahli waris
  // ═══════════════════════════════════════════════════════════════
  function kartuWaris(def, jumlahSaatIni) {
    var jml = jumlahSaatIni;
    var tunggal = def.max === 1;

    var kendali = tunggal
      ? '<button class="toggle" type="button" data-toggle="' + def.key + '" ' +
        'aria-pressed="' + (jml > 0) + '" aria-label="' + def.label + '"></button>'
      : '<div class="counter">' +
        '<button type="button" data-kurang="' + def.key + '" aria-label="Kurangi ' + def.label + '"' +
        (jml === 0 ? ' disabled' : '') + '>' + ikon('i-minus', 'ic-sm') + '</button>' +
        '<span class="nilai" data-nilai="' + def.key + '">' + jml + '</span>' +
        '<button type="button" data-tambah="' + def.key + '" aria-label="Tambah ' + def.label + '"' +
        (jml >= def.max ? ' disabled' : '') + '>' + ikon('i-plus', 'ic-sm') + '</button>' +
        '</div>';

    // Nama sehari-hari di depan, istilah resmi faraid dalam kurung. Orang
    // mencari "keponakan", bukan "anak laki-laki dari saudara laki-laki
    // kandung" — tapi istilah resminya tetap perlu ada supaya cocok dengan
    // yang tertulis di kitab dan di putusan pengadilan.
    var judul = def.panggilan === def.label
      ? def.label
      : def.panggilan + ' <span class="waris-resmi">(' + def.label.toLowerCase() + ')</span>';

    return '<div class="waris-item' + (jml > 0 ? ' terisi' : '') + '" data-kartu="' + def.key + '">' +
      ikon(def.icon) +
      '<span class="waris-teks"><span class="waris-nama">' + judul + '</span>' +
      '<span class="waris-ket">' + def.ket + '</span></span>' +
      kendali + '</div>';
  }

  function daftarGrup(id) {
    return H.LIST.filter(function (d) {
      if (d.group !== id) return false;
      if (d.hanyaJika && d.hanyaJika !== state.keluarga.jenisKelamin) return false;
      return true;
    });
  }

  function renderAhliWaris() {
    var counts = turunan().counts;
    var jml = function (key) { return counts[key] || 0; };

    var utama = H.GROUPS.filter(function (g) { return g.utama; });
    var lain = H.GROUPS.filter(function (g) { return !g.utama; });

    $('#grup-utama').innerHTML = utama.map(function (g) {
      var list = daftarGrup(g.id);
      if (!list.length) return '';
      return '<div style="margin-bottom:var(--space-6)">' +
        '<div class="progres-teks">' + g.label + '</div>' +
        '<div class="waris-grid">' + list.map(function (d) {
          return kartuWaris(d, jml(d.key));
        }).join('') + '</div></div>';
    }).join('');

    $('#grup-lain').innerHTML = lain.map(function (g) {
      var list = daftarGrup(g.id);
      var isi = list.reduce(function (t, d) { return t + jml(d.key); }, 0);
      return '<div class="lipat' + (isi > 0 ? ' buka' : '') + '">' +
        '<button class="lipat-tombol" type="button" data-lipat>' +
        ikon(list[0].icon, 'ic-sm') + g.label +
        '<span class="lipat-hitung">' + (isi || '') + '</span>' +
        ikon('i-chevron', 'ic-sm panah') + '</button>' +
        '<div class="lipat-isi"><div class="waris-grid">' +
        list.map(function (d) { return kartuWaris(d, jml(d.key)); }).join('') +
        '</div></div></div>';
    }).join('');

    renderPohonIsian();
  }

  /** Pohon di langkah 4 — bisa langsung disunting. */
  function renderPohonIsian() {
    var wadah = $('#pohon-isian');
    if (!wadah || !window.Pohon || !state.keluarga.jenisKelamin) return;
    window.Pohon.render(wadah, {
      keluarga: state.keluarga,
      sunting: true,
      onUbah: function () {
        renderAhliWaris();
        renderKondisi();
        hitungUlangKalauPerlu();
      }
    });
  }

  function pesanRingkas(teks) {
    var lama = $('#pesan-info');
    if (lama) lama.remove();
    var el = document.createElement('div');
    el.id = 'pesan-info';
    el.className = 'pita pita-peringatan';
    el.style.marginTop = 'var(--space-4)';
    el.innerHTML = ikon('i-waspada') + '<span>' + teks + '</span>';
    var acuan = $('.langkah.aktif');
    if (acuan) acuan.appendChild(el);
    setTimeout(function () { el.remove(); }, 9000);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-tambah],[data-kurang],[data-toggle]');
    if (!t || !t.closest('.waris-item')) return;

    if (t.dataset.tambah) {
      var hasil = K.tambahLewatDaftar(state.keluarga, t.dataset.tambah);
      if (hasil && hasil.peringatan) pesanRingkas(hasil.peringatan);
    } else if (t.dataset.kurang) {
      K.kurangiLewatDaftar(state.keluarga, t.dataset.kurang);
    } else if (t.dataset.toggle) {
      var key = t.dataset.toggle;
      if ((turunan().counts[key] || 0) > 0) K.kurangiLewatDaftar(state.keluarga, key);
      else K.tambahLewatDaftar(state.keluarga, key);
    }
    renderAhliWaris();
    renderKondisi();
    hitungUlangKalauPerlu();
  });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-mode-harta]');
    if (t) setModeHarta(t.dataset.modeHarta);
  });

  // ── Pindah mode isian ────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-mode]');
    if (!t) return;
    modeIsian = t.dataset.mode;
    $$('[data-mode]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.mode === modeIsian));
    });
    $('#mode-daftar').hidden = modeIsian !== 'daftar';
    $('#mode-pohon').hidden = modeIsian !== 'pohon';
    if (modeIsian === 'pohon') renderPohonIsian();
  });

  // ═══════════════════════════════════════════════════════════════
  // LANGKAH 5 — kondisi khusus
  // ═══════════════════════════════════════════════════════════════
  function daftarKondisi() {
    var list = [
      { id: 'cucuDariAnakWafat', judul: 'Ada cucu dari anak yang meninggal lebih dulu',
        ket: 'Penting. Fiqh klasik dan Pengadilan Agama bisa memutuskan berbeda soal ini.' },
      { id: 'bedaAgama', judul: 'Ada anggota keluarga yang berbeda agama',
        ket: 'Perbedaan agama menggugurkan hak waris, tapi masih bisa diberi lewat hibah atau wasiat.' },
      { id: 'pembunuh', judul: 'Ada yang terlibat dalam kematian pewaris',
        ket: 'Menggugurkan hak waris orang tersebut.' },
      { id: 'adaSengketa', judul: 'Ahli waris belum sepakat atau sedang berselisih',
        ket: 'Kami akan menyarankan jalur Pengadilan Agama.' }
    ];
    if (state.keluarga.jenisKelamin === 'L' && K.jumlahPasanganHidup(state.keluarga)) {
      list.splice(1, 0, { id: 'istriHamil', judul: 'Ada istri yang sedang hamil',
        ket: 'Bagian anak dalam kandungan harus ditahan dulu sampai ia lahir.' });
    }
    return list;
  }

  function renderKondisi() {
    var tersedia = daftarKondisi();
    // Buang centang yang pilihannya sudah tidak berlaku lagi — misalnya
    // "istri sedang hamil" setelah istri dihapus dari daftar.
    Object.keys(state.kondisi).forEach(function (id) {
      if (!tersedia.some(function (k) { return k.id === id; })) delete state.kondisi[id];
    });

    $('#kondisi-khusus').innerHTML = tersedia.map(function (k) {
      return '<button class="ceklis" type="button" data-kondisi="' + k.id + '" ' +
        'aria-pressed="' + !!state.kondisi[k.id] + '">' +
        '<span class="kotak"><svg class="ic" aria-hidden="true" style="width:14px;height:14px;stroke-width:2.6">' +
        '<use href="#i-check"></use></svg></span>' +
        '<span><span class="ceklis-judul">' + k.judul + '</span>' +
        '<span class="ceklis-ket">' + k.ket + '</span></span></button>';
    }).join('');
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-kondisi]');
    if (!t) return;
    var id = t.dataset.kondisi;
    state.kondisi[id] = !state.kondisi[id];
    t.setAttribute('aria-pressed', String(!!state.kondisi[id]));
    hitungUlangKalauPerlu();
  });

  // ═══════════════════════════════════════════════════════════════
  // NAVIGASI
  // ═══════════════════════════════════════════════════════════════
  function renderProgres() {
    $('#progres').innerHTML = Array.apply(null, { length: TOTAL_LANGKAH }).map(function (_, i) {
      var n = i + 1;
      return '<div class="progres-item ' + (n < langkahKini ? 'lewat' : n === langkahKini ? 'kini' : '') + '"></div>';
    }).join('');
    $('#progres').setAttribute('aria-valuenow', String(langkahKini));
    $('#progres-teks').textContent = 'Langkah ' + langkahKini + ' dari ' + TOTAL_LANGKAH;
    // Di langkah pertama tidak ada langkah sebelumnya, tapi tombolnya tetap ada
    // demi konsistensi tata letak — hanya berubah jadi jalan keluar ke beranda.
    $('#btn-beranda').hidden = langkahKini !== 1;
    $('#btn-mundur').hidden = langkahKini === 1;
    $('#btn-maju').innerHTML = langkahKini === TOTAL_LANGKAH
      ? 'Lihat Hasil ' + ikon('i-timbangan', 'ic-sm')
      : 'Lanjut ' + ikon('i-kanan', 'ic-sm');
  }

  function keLangkah(n) {
    langkahKini = Math.max(1, Math.min(TOTAL_LANGKAH, n));
    $$('.langkah').forEach(function (el) {
      el.classList.toggle('aktif', Number(el.dataset.langkah) === langkahKini);
    });
    renderProgres();
    if (langkahKini === 4 && modeIsian === 'pohon') renderPohonIsian();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validasi() {
    if (langkahKini === 1 && !state.keluarga.jenisKelamin) return 'Pilih dulu jenis kelamin pewaris.';
    if (langkahKini === 4 && !Object.keys(turunan().counts).length) {
      return 'Belum ada ahli waris yang berhak. Tambahkan minimal satu kerabat yang masih hidup.';
    }
    return null;
  }

  $('#btn-maju').addEventListener('click', function () {
    var galat = validasi();
    if (galat) { pesanRingkas(galat); return; }
    if (langkahKini === TOTAL_LANGKAH) tampilkanHasil();
    else keLangkah(langkahKini + 1);
  });

  $('#btn-mundur').addEventListener('click', function () { keLangkah(langkahKini - 1); });

  // ═══════════════════════════════════════════════════════════════
  // HASIL
  // ═══════════════════════════════════════════════════════════════
  function hitung() {
    var t = turunan();
    var kondisi = {};
    Object.keys(state.kondisi).forEach(function (k) { kondisi[k] = state.kondisi[k]; });
    // Anak angkat tidak lagi ditanyakan lewat centang — sudah terbaca dari
    // susunan keluarga itu sendiri.
    if (t.anakAngkat) kondisi.anakAngkat = true;

    // Dalam mode syariat murni, pemisahan harta bersama tidak diberlakukan —
    // ia bukan aturan faraid. Centangnya tetap tersimpan, jadi user bisa
    // bolak-balik membandingkan tanpa kehilangan isian.
    var harta = state.harta;
    if (!state.pakaiHukumIndonesia && harta.hartaBersama) {
      harta = Object.keys(harta).reduce(function (o, k) { o[k] = harta[k]; return o; }, {});
      harta.hartaBersama = false;
    }

    var hasil = window.Faraid.hitung({
      jenisKelamin: state.keluarga.jenisKelamin,
      harta: harta,
      ahliWaris: t.counts,
      kondisi: kondisi
    });
    hasil.pakaiHukumIndonesia = state.pakaiHukumIndonesia;
    hasil.hartaBersamaDicentang = !!state.harta.hartaBersama;

    // Catatan dari struktur keluarga (cucu lewat anak perempuan, anak angkat,
    // keponakan yang tidak berhak) digabungkan ke catatan hasil.
    hasil.catatan = hasil.catatan.concat(t.catatan);
    hasil.keluarga = state.keluarga;
    return hasil;
  }

  /*
   * Begitu hasil tampil, form disembunyikan.
   *
   * Sebelumnya form tetap terpampang dan hasilnya menempel di bawahnya, jadi
   * halaman terasa belum selesai dan user tidak tahu harus melihat ke mana.
   * Sekarang hanya hasil yang tampil, dengan dua jalan kembali: menyunting
   * isian terakhir, atau mengulang dari awal.
   */
  function tampilkanHasil() {
    // Panel dimunculkan LEBIH DULU baru diisi. Pohon keluarga menggambar garis
    // penghubungnya dari posisi asli elemen, dan elemen di dalam panel yang
    // masih hidden tidak punya ukuran — garisnya jadi tidak tergambar.
    var el = document.getElementById('hasil');
    el.hidden = false;
    window.UIResult.render(hitung(), { onUbahPohon: saatPohonHasilBerubah,
      onUbahDasar: saatDasarBerubah });
    sudahAdaHasil = true;
    document.getElementById('wizard').hidden = true;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /** Kembali menyunting: form dimunculkan lagi di langkah terakhir. */
  function kembaliKeIsian() {
    document.getElementById('wizard').hidden = false;
    document.getElementById('hasil').hidden = true;
    keLangkah(TOTAL_LANGKAH);
  }

  /* Pohon di halaman hasil ikut bisa disunting. Setelah diubah, seluruh hasil
     dihitung ulang di tempat — tanpa perlu kembali ke form. */
  function saatPohonHasilBerubah() {
    renderAhliWaris();
    renderKondisi();
    window.UIResult.render(hitung(), { diam: true, onUbahPohon: saatPohonHasilBerubah,
      onUbahDasar: saatDasarBerubah });
  }

  /* Dipanggil dari tombol pilihan dasar hukum di halaman hasil. */
  function saatDasarBerubah(pakai) {
    state.pakaiHukumIndonesia = !!pakai;
    hitungUlangKalauPerlu();
  }

  function hitungUlangKalauPerlu() {
    if (!sudahAdaHasil) return;
    window.UIResult.render(hitung(), { diam: true, onUbahPohon: saatPohonHasilBerubah,
      onUbahDasar: saatDasarBerubah });
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('#btn-ubah-input')) kembaliKeIsian();
  });

  // ── Reset ────────────────────────────────────────────────────────
  $('#btn-mulai-ulang').addEventListener('click', function () {
    state = {
      keluarga: K.baru(null),
      harta: { total: 0, totalManual: 0, rincian: {}, biayaJenazah: 0, hutang: 0, wasiat: 0, hartaBersama: false },
      kondisi: {},
      pakaiHukumIndonesia: false
    };
    sudahAdaHasil = false;
    modeHarta = 'total';
    document.getElementById('wizard').hidden = false;
    document.getElementById('hasil').hidden = true;
    document.getElementById('hasil').innerHTML = '';
    $$('[data-mode-harta]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.modeHarta === 'total'));
    });
    $('#harta-total').hidden = false;
    $('#harta-rincian').hidden = true;
    $$('#pilih-kelamin .pilih').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    ['#in-total', '#in-biaya', '#in-hutang', '#in-wasiat'].forEach(function (s) { $(s).value = '0'; });
    $('#ck-harta-bersama').setAttribute('aria-pressed', 'false');
    renderRincian();
    sinkronTotal();
    renderAhliWaris();
    renderKondisi();
    keLangkah(1);
  });

  // ── Mulai ────────────────────────────────────────────────────────
  renderRincian();
  sinkronTotal();
  renderAhliWaris();
  renderKondisi();
  renderProgres();
})();
