/*
 * Tampilan hasil.
 *
 * Tujuannya bukan sekadar menampilkan angka, tapi membuat orang paham KENAPA
 * angkanya segitu. Karena itu setiap kartu bisa dibuka untuk melihat alasan
 * dan dalilnya, dan yang terhalang tetap ditampilkan lengkap dengan sebabnya.
 */

(function (root) {
  'use strict';

  var f = root.Fraction;

  var WARNA = [
    '#E8391D', '#F5A623', '#A0341A', '#F5760A',
    '#C7541F', '#7A2E12', '#E0821B', '#5C2A15',
    '#1B5E3B', '#B8641D'
  ];

  function rp(n) {
    return 'Rp ' + String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /** Versi pendek untuk ruang sempit seperti bagian tengah donut. */
  function rpRingkas(n) {
    n = Math.round(n || 0);
    var satuan = [[1e12, 'T'], [1e9, 'M'], [1e6, 'jt'], [1e3, 'rb']];
    for (var i = 0; i < satuan.length; i++) {
      if (n >= satuan[i][0]) {
        var v = n / satuan[i][0];
        var teks = (v < 10 ? v.toFixed(1) : Math.round(v).toString()).replace('.', ',');
        return 'Rp ' + teks.replace(/,0$/, '') + ' ' + satuan[i][1];
      }
    }
    return rp(n);
  }

  function ikon(id, kelas) {
    return '<svg class="ic ' + (kelas || '') + '" aria-hidden="true"><use href="#' + id + '"></use></svg>';
  }

  function ringkasSusunan(hasil) {
    var bagian = hasil.ahliWaris
      .filter(function (a) { return a.status === 'menerima'; })
      .map(function (a) { return (a.jumlah > 1 ? a.jumlah + ' ' : '') + a.label.toLowerCase(); });
    return bagian.join(', ');
  }

  // ═══════════════════════════════════════════════════════════════
  // Ledger harta
  // ═══════════════════════════════════════════════════════════════
  /*
   * Rincian harta.
   *
   * Semua angka diletakkan pada satu kolom rata kanan supaya pengurangannya
   * terbaca menurun sampai ke hasil akhir — seperti membaca struk. Keterangan
   * panjang tidak lagi menyela di antara baris, melainkan disembunyikan di
   * balik tombol info yang bisa diketuk (ini juga jalan di layar sentuh, yang
   * tidak punya hover).
   */
  function renderLedger(hasil, diam) {
    return '<div class="ledger">' + hasil.harta.langkah.map(function (l, i) {
      var delay = diam ? 0 : i * 90;
      var idKet = 'ket-' + l.id;
      return '<div class="ledger-baris ' + l.tipe + '" style="animation-delay:' + delay + 'ms">' +
        '<span class="ledger-label">' + l.label +
        (l.ket
          ? '<button class="ledger-info" type="button" data-ket="' + idKet + '" ' +
            'aria-expanded="false" aria-controls="' + idKet + '" ' +
            'aria-label="Penjelasan ' + l.label + '" title="' + l.ket.replace(/"/g, '&quot;') + '">' +
            ikon('i-info', 'ic-sm') + '</button>'
          : '') +
        '</span>' +
        '<span class="ledger-nilai">' + (l.nilai < 0 ? '\u2212\u00a0' : '') + rp(Math.abs(l.nilai)) + '</span>' +
        (l.ket ? '<div class="ledger-ket" id="' + idKet + '" hidden>' + l.ket + '</div>' : '') +
        '</div>';
    }).join('') + '</div>';
  }

  // ═══════════════════════════════════════════════════════════════
  // Donut
  // ═══════════════════════════════════════════════════════════════
  function renderDonut(hasil, penerima) {
    var R = 72, C = 2 * Math.PI * R;
    var offset = 0;

    var segmen = penerima.map(function (a, i) {
      var panjang = (f.toNumber(a.bagian)) * C;
      var s = '<circle class="donut-seg" data-key="' + a.key + '" cx="100" cy="100" r="' + R + '" ' +
        'fill="none" stroke="' + WARNA[i % WARNA.length] + '" stroke-width="28" ' +
        'stroke-dasharray="' + panjang.toFixed(2) + ' ' + (C - panjang).toFixed(2) + '" ' +
        'stroke-dashoffset="' + (-offset).toFixed(2) + '">' +
        '<title>' + a.label + ' — ' + a.bagianTeks + '</title></circle>';
      offset += panjang;
      return s;
    }).join('');

    if (hasil.sisaTidakTerbagi) {
      var p = f.toNumber(hasil.sisaTidakTerbagi.bagian) * C;
      segmen += '<circle cx="100" cy="100" r="' + R + '" fill="none" stroke="#CCC4BB" ' +
        'stroke-width="28" stroke-dasharray="' + p.toFixed(2) + ' ' + (C - p).toFixed(2) + '" ' +
        'stroke-dashoffset="' + (-offset).toFixed(2) + '"><title>Belum terbagi</title></circle>';
    }

    var legenda = penerima.map(function (a, i) {
      return '<div class="hasil-kartu" data-legenda="' + a.key + '">' +
        '<div class="hasil-kepala" style="cursor:default">' +
        '<span class="hasil-warna" style="background:' + WARNA[i % WARNA.length] + '"></span>' +
        '<span class="hasil-info"><span class="hasil-nama">' + a.label +
        (a.jumlah > 1 ? ' <span class="dim">×' + a.jumlah + '</span>' : '') + '</span>' +
        '<span class="hasil-sub">' + a.persen + '% dari harta yang dibagi</span></span>' +
        '<span class="hasil-angka"><span class="hasil-pecahan">' + a.bagianTeks + '</span>' +
        '<span class="hasil-rp">' + rp(a.nominal) + '</span></span>' +
        '</div></div>';
    }).join('');

    return '<div class="donut-wrap">' +
      '<div class="donut"><svg viewBox="0 0 200 200" role="img" aria-label="Diagram pembagian warisan">' +
      segmen + '</svg>' +
      '<div class="donut-tengah"><span class="angka" title="' + rp(hasil.harta.tirkah) + '">' +
      rpRingkas(hasil.harta.tirkah) + '</span>' +
      '<span class="ket">Dibagi ke ' + penerima.length + ' pihak</span></div></div>' +
      '<div class="donut-legenda hasil-grid">' + legenda + '</div></div>';
  }

  // ═══════════════════════════════════════════════════════════════
  // Kartu rinci per ahli waris
  // ═══════════════════════════════════════════════════════════════
  var LABEL_JENIS = {
    fardh: 'Bagian tetap',
    ashabah: 'Penerima sisa',
    'fardh+ashabah': 'Bagian tetap + sisa',
    radd: 'Bagian tetap + radd',
    khusus: 'Aturan khusus'
  };

  /* Tautan periksa-sendiri untuk sebuah dalil. */
  function tautanDalil(d) {
    var semua = (d.tautan ? [d.tautan] : []).concat(d.tautanLain || []);
    if (!semua.length) return '';
    return '<div class="dalil-tautan">' + semua.map(function (t) {
      return '<a href="' + t.url + '" target="_blank" rel="noopener noreferrer">' +
        ikon('i-tautan', 'ic-sm') + t.label + '</a>';
    }).join('') + '</div>';
  }

  /*
   * Ayat SELALU ditampilkan utuh — tidak pernah dipenggal.
   *
   * Satu ayat waris memuat beberapa ketetapan sekaligus. Kalau hanya klausa
   * yang sedang dibahas yang ditampilkan, pembaca kehilangan konteks dan
   * kutipannya berubah jadi potongan. Jadi seluruh ayat dirender, lalu ruas
   * yang menetapkan bagian orang ini disorot dan sisanya dipudarkan —
   * kejelasan tanpa memotong firman.
   */
  function ayatBersorot(d, idPotongan, kelasTeks, ambil) {
    if (!d.segmen) return '<div class="' + kelasTeks + '">' + ambil(d) + '</div>';
    return '<div class="' + kelasTeks + '">' + d.segmen.map(function (s) {
      var sorot = idPotongan && s.id === idPotongan;
      return '<span class="' + (sorot ? 'ayat-sorot' : 'ayat-redup') + '">' +
        ambil(s) + '</span>';
    }).join(' ') + '</div>';
  }

  function blokDalil(id, idPotongan) {
    var d = root.Dalil.ambil(id);
    if (!d) return '';
    var pot = (d.potongan && idPotongan) ? d.potongan[idPotongan] : null;

    return '<div class="dalil">' +
      '<div class="dalil-rujukan">' + d.rujukan +
      (pot ? '<span class="dalil-klausa">Yang disorot: ' + pot.ket + '</span>' : '') + '</div>' +
      (d.arab
        ? ayatBersorot(d, idPotongan, 'dalil-arab" lang="ar" dir="rtl',
            function (x) { return x.arab; })
        : '') +
      ayatBersorot(d, idPotongan, 'dalil-terjemah',
        function (x) { return x.arti || x.terjemah; }) +
      (d.sumber ? '<div class="dalil-sumber">' + d.sumber + '</div>' : '') +
      tautanDalil(d) +
      '</div>';
  }

  function kartuWaris(a, warna) {
    var dalil = a.dalil ? root.Dalil.ambil(a.dalil) : null;

    // Sebagian bagian bersandar pada lebih dari satu sumber — ayat menetapkan
    // besarannya, hadits menetapkan mekanismenya. Keduanya ditampilkan.
    var isiDalil = dalil
      ? blokDalil(a.dalil, a.potongan) +
        (a.dalilLain || []).map(function (id) { return blokDalil(id, null); }).join('')
      : '';

    var kanan = (a.status === 'terhalang' || a.status === 'nol')
      ? '<span class="hasil-angka"><span class="hasil-pecahan hasil-nihil">' +
        (a.status === 'nol' ? 'Tidak kebagian' : 'Terhalang') + '</span></span>'
      : '<span class="hasil-angka"><span class="hasil-pecahan">' + a.bagianTeks + '</span>' +
        '<span class="hasil-rp">' + rp(a.nominal) + '</span>' +
        (a.jumlah > 1
          ? '<span class="hasil-perorang">' + rpRingkas(a.nominalPerOrang) + ' / orang</span>'
          : '') +
        '</span>';

    var sub = a.status === 'terhalang'
      ? 'Terhalang oleh ' + a.terhalangOleh.map(function (k) {
          return root.Heirs.label(k).toLowerCase();
        }).filter(function (v, i, s) { return s.indexOf(v) === i; }).join(', ')
      : a.status === 'nol'
        ? 'Berhak, tapi harta sudah habis'
        : (LABEL_JENIS[a.jenis] || '');

    var rincianOrang = (a.status === 'menerima' && a.jumlah > 1)
      ? '<p class="hasil-bagi-rata">Dibagi rata untuk ' + a.jumlah + ' orang: masing-masing ' +
        '<strong>' + rp(a.nominalPerOrang) + '</strong>.</p>'
      : '';

    return '<div class="hasil-kartu' +
      (a.status === 'terhalang' || a.status === 'nol' ? ' terhalang' : '') + '">' +
      '<button class="hasil-kepala" type="button" data-buka-kartu aria-expanded="false">' +
      (warna ? '<span class="hasil-warna" style="background:' + warna + '"></span>' : '') +
      '<span class="hasil-ikon">' + ikon(a.icon) + '</span>' +
      '<span class="hasil-info"><span class="hasil-nama">' + a.label +
      (a.jumlah > 1 ? ' <span class="dim">×' + a.jumlah + '</span>' : '') + '</span>' +
      '<span class="hasil-sub">' + sub + '</span></span>' +
      kanan + ikon('i-chevron', 'ic-sm panah') + '</button>' +
      '<div class="hasil-detail"><p>' + a.alasan + '</p>' + rincianOrang + isiDalil + '</div></div>';
  }

  // ═══════════════════════════════════════════════════════════════
  // Cara menghitungnya
  // ═══════════════════════════════════════════════════════════════
  function renderCara(hasil, penerima) {
    var p = hasil.perhitungan;
    var baris = [];

    if (p.asalMasalahAkhir) {
      baris.push('<p class="blok-ket">Supaya tidak berurusan dengan banyak pecahan sekaligus, ' +
        'harta dibayangkan dipotong menjadi <strong>' + p.asalMasalahAkhir + ' bagian sama besar</strong>. ' +
        'Masing-masing ahli waris lalu mengambil sejumlah potongan berikut.</p>');
      baris.push('<div class="rumus">' + penerima.map(function (a) {
        return a.label + ' = ' + a.siham + '/' + p.asalMasalahAkhir;
      }).join('  ·  ') + '</div>');
    }

    if (p.aul) {
      baris.push('<p class="blok-ket" style="margin-top:var(--space-4)">Semula asal masalahnya ' +
        p.asalMasalah + ', tapi jumlah semua bagian tetap mencapai ' + p.totalSiham +
        ' — melebihi harta yang ada. Dalam keadaan ini penyebutnya dinaikkan menjadi ' +
        p.totalSiham + ', disebut <strong>’aul</strong>. Semua ahli waris menyusut ' +
        'proporsional, tidak ada yang dikorbankan.</p>');
    }

    p.langkah.forEach(function (l) {
      baris.push('<p class="blok-ket" style="margin-top:var(--space-4)">' + l + '</p>');
    });

    if (hasil.pembulatan > 0) {
      baris.push('<div class="pita" style="margin-top:var(--space-5)">' + ikon('i-info') +
        '<span>Ada sisa <strong>' + rp(hasil.pembulatan) + '</strong> dari pembulatan ke rupiah ' +
        'penuh. Jumlahnya kecil — sepakati saja bersama mau diberikan ke siapa atau ' +
        'disedekahkan.</span></div>');
    }

    return baris.join('');
  }

  /*
   * Bagian appendix dijadikan akordeon.
   *
   * Tiga blok terakhir (catatan Pengadilan Agama, sumber dalil, langkah
   * lanjutan) semuanya panjang. Kalau terbuka semua, halaman hasil jadi
   * gulungan tanpa ujung dan orang kehilangan jejak. Judul plus ringkasan satu
   * baris membuat mereka bisa memilih mana yang mau dibaca.
   */
  var nomorApx = 0;

  function appendix(judul, ringkas, isi, terbuka) {
    var id = 'apx-' + (++nomorApx);
    return '<div class="apx' + (terbuka ? ' buka' : '') + '">' +
      '<button class="apx-kepala" type="button" data-apx aria-expanded="' + !!terbuka +
      '" aria-controls="' + id + '">' +
      '<span class="apx-teks"><span class="apx-judul">' + judul + '</span>' +
      '<span class="apx-ringkas">' + ringkas + '</span></span>' +
      ikon('i-chevron', 'panah') + '</button>' +
      '<div class="apx-isi" id="' + id + '">' + isi + '</div></div>';
  }

  // ═══════════════════════════════════════════════════════════════
  // Render utama
  // ═══════════════════════════════════════════════════════════════
  function render(hasil, opts) {
    opts = opts || {};
    var wadah = document.getElementById('hasil');
    nomorApx = 0;

    if (!hasil.valid) {
      root.UIResult.hasilTerakhir = hasil;
      wadah.innerHTML = '<div class="wrap wrap-narrow"><div class="kosong">' +
        ikon('i-waspada', 'ic-lg') + '<p style="margin-top:var(--space-3)">' + hasil.pesan + '</p>' +
        '</div></div>';
      return;
    }

    var penerima = hasil.ahliWaris.filter(function (a) { return a.status === 'menerima'; });
    // Termasuk yang berhak tapi tidak kebagian karena 'aul — kalau tidak
    // dimasukkan ke sini, orangnya hilang sama sekali dari daftar.
    var terhalang = hasil.ahliWaris.filter(function (a) {
      return a.status === 'terhalang' || a.status === 'nol';
    });
    // Mode dasar hukum. Bawaannya syariat murni: aturan negara hanya muncul
    // kalau user memang memilihnya (atau mencentang harta bersama di langkah 3).
    var pakaiHukum = !!hasil.pakaiHukumIndonesia;
    var catatanKHI = pakaiHukum ? root.KHI.catatan(hasil) : [];
    var saran = root.Advice.langkah(hasil).filter(function (s) {
      return pakaiHukum || !s.hukumIndonesia;
    });
    var dalilDipakai = root.Dalil.kumpulkan(hasil);

    var html = '';

    // ── Kepala ─────────────────────────────────────────────────────
    html += '<div class="wrap wrap-narrow hasil-kepala-besar">' +
      '<img class="hitung-flav" src="assets/flav-confident.svg" alt="">' +
      '<span class="overline">Hasil perhitungan</span>' +
      '<h2 class="flav-display-l">Beginilah warisannya dibagi</h2>' +
      '<p class="flav-body" style="margin-top:var(--space-4)">' +
      (penerima.length
        ? 'Dari <strong>' + rp(hasil.harta.tirkah) + '</strong> harta yang siap dibagi, ' +
          ringkasSusunan(hasil) + ' mendapat bagian sesuai ketetapan Al-Qur’an dan Sunnah.'
        : 'Tidak ada harta yang bisa dibagi.') +
      '</p></div>';

    // Peringatan ditaruh di ATAS, sebelum angkanya dibaca. Kalau hanya di kaki
    // halaman, orang keburu menganggap angka ini final sebelum sampai ke sana.
    html += '<div class="wrap wrap-narrow"><div class="awas">' +
      '<div class="awas-kepala">' + ikon('i-waspada') +
      '<span>Jangan jadikan ini sumber utama</span></div>' +
      '<p>Verifikasi dan validasikan hasil ini kepada <strong>ustadz atau ulama terdekat</strong> ' +
      'yang kamu percaya, atau ke <strong>Pengadilan Agama</strong>, sebelum dipakai membagi ' +
      'harta yang sebenarnya. Kalkulator hanya menghitung dari apa yang kamu isikan — ia tidak ' +
      'bisa melihat hibah yang sudah diberikan semasa hidup, status harta bawaan, atau ahli ' +
      'waris yang belum diketahui.</p>' +
      '<a class="btn btn-ghost btn-sm" href="rujukan.html" target="_blank" rel="noopener">' +
      ikon('i-kitab', 'ic-sm') + ' Lihat seluruh dalil rujukannya</a>' +
      '</div></div>';

    // ── Pilihan dasar hukum ────────────────────────────────────────
    // Diletakkan di atas angka, bukan di kaki halaman: dasar yang dipakai
    // mengubah angkanya, jadi user harus tahu sebelum membaca hasilnya.
    html += '<div class="wrap wrap-narrow"><div class="dasar">' +
      '<span class="dasar-teks">' +
      '<span class="dasar-judul">Dasar yang dipakai</span>' +
      '<span class="dasar-ket">' +
      (pakaiHukum
        ? 'Al-Qur\u2019an dan Sunnah, ditambah aturan negara yang berlaku bagi umat Islam \u2014 ' +
          'pemisahan harta bersama dan catatan Pengadilan Agama.'
        : 'Murni Al-Qur\u2019an dan Sunnah. Aturan negara seperti harta bersama, ahli waris ' +
          'pengganti, dan wasiat wajibah tidak diterapkan.') +
      '</span></span>' +
      '<span class="dasar-pilih" role="group" aria-label="Dasar hukum yang dipakai">' +
      '<button type="button" data-dasar="syariat" aria-pressed="' + (!pakaiHukum) + '">' +
      'Qur\u2019an &amp; Sunnah</button>' +
      '<button type="button" data-dasar="indonesia" aria-pressed="' + pakaiHukum + '">' +
      '+ Hukum Indonesia</button>' +
      '</span></div>' +
      (!pakaiHukum && hasil.hartaBersamaDicentang
        ? '<div class="pita pita-hukum" style="margin-bottom:var(--space-6);align-items:flex-start">' +
          ikon('i-info') +
          '<span>Kamu mencentang <strong>harta bersama</strong> di langkah 3, tapi mode ini ' +
          'tidak memakainya \u2014 pemisahan harta bersama berasal dari hukum negara, bukan dari ' +
          'ayat atau hadits waris. Pilih <strong>+ Hukum Indonesia</strong> untuk ' +
          'memberlakukannya.</span></div>'
        : '') +
      '</div>';

    // ── Ledger ─────────────────────────────────────────────────────
    html += '<div class="wrap wrap-narrow"><div class="blok">' +
      '<h3 class="blok-judul">Harta yang boleh dibagi</h3>' +
      '<p class="blok-ket">Warisan tidak langsung dibagi dari total harta. Biaya pengurusan ' +
      'jenazah, hutang, dan wasiat diselesaikan lebih dulu — urutan ini disebut sendiri dalam ' +
      'QS An-Nisa ayat 11 dan 12.</p>' +
      renderLedger(hasil, opts.diam) + '</div></div>';

    if (hasil.harta.tirkah > 0 && penerima.length) {
      // ── Donut ────────────────────────────────────────────────────
      html += '<div class="wrap"><div class="blok" id="area-export">' +
        '<h3 class="blok-judul">Pembagiannya</h3>' +
        '<p class="blok-ket">Setiap warna adalah satu pihak. Angka pecahan menunjukkan haknya ' +
        'menurut syariat, dan nominal rupiahnya sudah dihitungkan.</p>' +
        renderDonut(hasil, penerima) + '</div></div>';

      // ── Pohon keluarga ───────────────────────────────────────────
      html += '<div class="wrap"><div class="blok">' +
        '<h3 class="blok-judul">Posisinya dalam keluarga</h3>' +
        '<p class="blok-ket">Nama hubungan keluarga dalam faraid sering terdengar mirip ' +
        'padahal orangnya berbeda. Digambar begini, bedanya langsung kelihatan — perhatikan ' +
        'dari siapa masing-masing orang menurun. <strong>Ketuk siapa pun untuk mengubahnya</strong>, ' +
        'dan seluruh perhitungan di halaman ini ikut menyesuaikan.</p>' +
        // Keterangan warna ditaruh di ATAS pohon supaya bisa dibaca sambil
        // melihat gambarnya, tanpa perlu menggulir ke bawah dulu.
        '<div class="pohon-legenda">' +
        '<span><i class="l-pewaris"></i> Pewaris (yang meninggal)</span>' +
        '<span><i class="l-menerima"></i> Dapat bagian</span>' +
        '<span><i class="l-terhalang"></i> Terhalang</span>' +
        '<span><i class="l-kosong"></i> Berhak, tidak kebagian</span>' +
        '<span><i class="l-bukan"></i> Bukan ahli waris</span>' +
        '<span><i class="l-wafat"></i> Sudah wafat</span>' +
        '</div>' +
        '<div class="pohon" id="pohon-hasil"></div>' +
        '<p class="pohon-geser">Geser ke samping untuk melihat seluruh keluarga.</p>' +
        '</div></div>';

      // ── Kartu rinci ──────────────────────────────────────────────
      html += '<div class="wrap wrap-narrow"><div class="blok">' +
        '<h3 class="blok-judul">Kenapa segitu bagiannya?</h3>' +
        '<p class="blok-ket">Ketuk salah satu untuk melihat alasan dan ayat atau haditsnya.</p>' +
        '<div class="hasil-grid">' +
        penerima.map(function (a, i) { return kartuWaris(a, WARNA[i % WARNA.length]); }).join('') +
        '</div></div></div>';
    }

    // ── Sisa tidak terbagi ─────────────────────────────────────────
    if (hasil.sisaTidakTerbagi) {
      html += '<div class="wrap wrap-narrow"><div class="note" style="margin-bottom:var(--space-12)">' +
        '<div class="note-title">Sisa ' + hasil.sisaTidakTerbagi.bagianTeks + ' (' +
        rp(hasil.sisaTidakTerbagi.nominal) + ') belum ada yang berhak</div>' +
        hasil.sisaTidakTerbagi.alasan + '</div></div>';
    }

    // ── Yang terhalang ─────────────────────────────────────────────
    if (terhalang.length) {
      html += '<div class="wrap wrap-narrow"><div class="blok">' +
        '<h3 class="blok-judul">Yang tidak mendapat bagian</h3>' +
        '<p class="blok-ket">Bukan karena dilupakan. Dalam Islam, kerabat yang lebih dekat ' +
        'menutup yang lebih jauh — dan ini justru mencegah harta terpecah terlalu banyak.</p>' +
        '<div class="hasil-grid">' + terhalang.map(function (a) { return kartuWaris(a); }).join('') +
        '</div></div></div>';
    }

    // ── Cara menghitung ────────────────────────────────────────────
    if (penerima.length) {
      html += '<div class="wrap wrap-narrow"><div class="blok">' +
        '<h3 class="blok-judul">Cara menghitungnya</h3>' + renderCara(hasil, penerima) +
        '</div></div>';
    }

    // ── Peringatan ─────────────────────────────────────────────────
    if (hasil.peringatan.length || hasil.catatan.length) {
      html += '<div class="wrap wrap-narrow"><div class="blok">';
      hasil.peringatan.forEach(function (p) {
        html += '<div class="pita pita-peringatan" style="margin-bottom:var(--space-3)">' +
          ikon('i-waspada') + '<span>' + p.teks + '</span></div>';
      });
      hasil.catatan.forEach(function (c) {
        html += '<div class="pita" style="margin-bottom:var(--space-3)">' +
          ikon('i-info') + '<span>' + c.teks + '</span></div>';
      });
      html += '</div></div>';
    }

    // ── Appendix: dibuka satu per satu sesuai kebutuhan ───────────
    var apx = '';

    if (catatanKHI.length) {
      apx += appendix('Kalau dibawa ke Pengadilan Agama',
        catatanKHI.length + ' hal yang bisa diputuskan berbeda oleh hakim',
        '<p class="blok-ket">Hasil di atas mengikuti fiqh mazhab Syafi\u2019i. Pengadilan Agama ' +
        'memakai Kompilasi Hukum Islam, yang di beberapa titik memutuskan berbeda. Ini bukan ' +
        'pertentangan \u2014 keduanya sah ditempuh, dan yang perlu kamu tahu adalah bedanya di mana.</p>' +
        '<div class="pita" style="margin-bottom:var(--space-5)">' + ikon('i-info') +
        '<span><strong>Yang di bawah ini aturan negara, bukan dalil.</strong> Rujukan utama ' +
        'kalkulator ini tetap Al-Qur\u2019an dan sunnah. Aturan negara dicantumkan hanya karena ' +
        'ia berlaku bagi umat Islam dan dipakai hakim Pengadilan Agama \u2014 yang kewenangannya ' +
        'memang dibatasi pada perkara orang beragama Islam. Kalau keduanya berbeda, yang mengikat ' +
        'secara hukum adalah putusan pengadilan, dan yang mengikat secara agama adalah dalilnya. ' +
        'Tanyakan ke ustadz atau hakim yang berwenang sebelum memutuskan.</span></div>' +
        catatanKHI.map(function (c) {
          return '<div class="note note-green" style="margin-bottom:var(--space-3)">' +
            '<div class="note-title">' + c.judul + '</div>' + c.teks +
            '<div class="dalil-sumber" style="margin-top:var(--space-3)">' + c.pasal + '</div>' +
            ((c.tautan || []).length
              ? '<div class="dalil-tautan">' + c.tautan.map(function (t) {
                  return '<a href="' + t.url + '" target="_blank" rel="noopener noreferrer">' +
                    ikon('i-tautan', 'ic-sm') + t.label + '</a>';
                }).join('') + '</div>'
              : '') +
            '</div>';
        }).join(''), true);
    }

    apx += appendix('Sumber aturannya',
      dalilDipakai.length + ' ayat, hadits, dan putusan sahabat yang dipakai di kasus ini',
      '<p class="blok-ket">Tidak ada satu pun aturan yang kami tambahkan sendiri. Daftar ' +
      'lengkapnya \u2014 termasuk yang tidak terpakai di kasus ini \u2014 ada di ' +
      '<a href="rujukan.html" target="_blank" rel="noopener">halaman Rujukan</a>.</p>' +
      dalilDipakai.map(function (d) {
        return '<div class="card" style="margin-bottom:var(--space-3)">' +
          '<div class="dalil-rujukan">' + d.rujukan + '</div>' +
          (d.arab ? '<div class="dalil-arab" lang="ar" dir="rtl">' + d.arab + '</div>' : '') +
          '<div class="dalil-terjemah">' + d.terjemah + '</div>' +
          (d.sumber ? '<div class="dalil-sumber">' + d.sumber + '</div>' : '') +
          tautanDalil(d) +
          (d.ringkas ? '<p class="flav-body-sm" style="margin-top:var(--space-3)">' + d.ringkas + '</p>' : '') +
          (d.khilafiyah ? '<div class="note" style="margin-top:var(--space-3)">' + d.khilafiyah + '</div>' : '') +
          '</div>';
      }).join(''), !catatanKHI.length);

    var wajib = saran.filter(function (x) { return x.tingkat === 'wajib'; }).length;
    var totalPoin = saran.reduce(function (t, x) { return t + (x.poin || []).length; }, 0);

    apx += appendix('Langkah selanjutnya',
      saran.length + ' langkah, ' + totalPoin + ' hal yang perlu dikerjakan \u2014 ' +
      wajib + ' di antaranya wajib didahulukan',
      '<p class="blok-ket">Tahu angkanya baru setengah jalan. Ini yang perlu dilakukan supaya ' +
      'pembagiannya benar-benar tuntas dan tidak jadi perkara di kemudian hari.</p>' +
      '<div class="saran">' + saran.map(function (s, i) {
        var poin = (s.poin || []).length
          ? '<ul class="saran-poin">' + s.poin.map(function (p) {
              return '<li>' + p.teks + '</li>';
            }).join('') + '</ul>'
          : '';
        var tautan = (s.tautan || []).length
          ? '<div class="saran-tautan">' + s.tautan.map(function (t) {
              return '<a href="' + t.url + '" target="_blank" rel="noopener noreferrer">' +
                ikon('i-tautan', 'ic-sm') + t.label + '</a>';
            }).join('') + '</div>'
          : '';
        return '<div class="saran-item" data-tingkat="' + s.tingkat + '">' +
          '<span class="saran-nomor">' + (i + 1) + '</span>' +
          '<span><span class="saran-judul">' + s.judul + '</span>' +
          '<span class="saran-teks">' + s.teks + '</span>' + poin + tautan + '</span></div>';
      }).join('') + '</div>' +
      '<p class="flav-caption" style="margin-top:var(--space-5)">Alamat situs dan prosedur di ' +
      'atas bisa berubah, dan syarat administrasi kadang berbeda antar daerah. Pastikan lagi ' +
      'ke kantor terkait sebelum berangkat.</p>' +
      '<p class="flav-caption" style="margin-top:var(--space-5)">Alamat situs dan prosedur di ' +
      'atas bisa berubah, dan syarat administrasi kadang berbeda antar daerah. Pastikan lagi ' +
      'ke kantor terkait sebelum berangkat.</p>', false);

    // Bungkus seluruh appendix beserta kendali buka/tutup semuanya
    html += '<div class="wrap wrap-narrow"><div class="blok">' +
      '<div class="apx-kepala-blok">' +
      '<h3 class="blok-judul" style="margin:0">Selengkapnya</h3>' +
      '<button class="btn btn-ghost btn-sm" type="button" id="btn-apx-semua" ' +
      'data-terbuka="false">Buka semua</button></div>' +
      '<p class="blok-ket">Ketuk bagian yang ingin kamu baca.</p>' +
      apx + '</div></div>';

    // ── Penutup ────────────────────────────────────────────────────
    html += '<div class="wrap wrap-narrow"><div class="note" style="margin-bottom:var(--space-10)">' +
      '<div class="note-title">Sekali lagi, sebelum dipakai</div>' +
      'Kalkulator ini menerapkan aturan yang sudah baku, dan hitungannya diuji dengan ' +
      'kasus-kasus baku dari kitab faraid. Tapi alat hitung tetaplah alat hitung. ' +
      '<strong>Bawa hasil ini ke ustadz atau ulama terdekat untuk diverifikasi</strong>, dan ke ' +
      'Pengadilan Agama kalau butuh putusan yang mengikat. Jangan jadikan halaman ini sumber ' +
      'utama dalam membagi harta keluarga.</div></div>';

    // ── Bar aksi ───────────────────────────────────────────────────
    html += '<div class="bar-aksi no-print"><div class="wrap">' +
      '<button class="btn btn-ghost btn-sm" type="button" id="btn-ubah-input">' +
      ikon('i-kiri', 'ic-sm') + ' Ubah</button>' +
      '<button class="btn btn-ghost btn-sm" type="button" id="btn-png">' +
      ikon('i-gambar', 'ic-sm') + ' PNG</button>' +
      '<button class="btn btn-dark btn-sm" type="button" id="btn-pdf">' +
      ikon('i-unduh', 'ic-sm') + ' PDF</button>' +
      '</div></div>';

    wadah.innerHTML = html;
    root.UIResult.hasilTerakhir = hasil;

    // Pohon di halaman hasil ikut bisa disunting: ubah susunan keluarganya di
    // sini, seluruh perhitungan langsung menyesuaikan tanpa balik ke form.
    var wadahPohon = document.getElementById('pohon-hasil');
    if (wadahPohon && root.Pohon && hasil.keluarga) {
      root.Pohon.render(wadahPohon, {
        keluarga: hasil.keluarga,
        hasil: hasil,
        sunting: !!opts.onUbahPohon,
        onUbah: opts.onUbahPohon
      });
    }

    // Pilihan dasar hukum. Menggulir balik ke pemilihnya setelah render ulang,
    // supaya user tidak kehilangan tempat saat angkanya berubah.
    if (opts.onUbahDasar) {
      Array.prototype.forEach.call(wadah.querySelectorAll('[data-dasar]'), function (b) {
        b.addEventListener('click', function () {
          if (b.getAttribute('aria-pressed') === 'true') return;
          var atas = b.getBoundingClientRect().top;
          opts.onUbahDasar(b.dataset.dasar === 'indonesia');
          var baru = document.querySelector('#hasil [data-dasar]');
          if (baru) window.scrollBy(0, baru.getBoundingClientRect().top - atas);
        });
      });
    }

    if (root.WarisExport) root.WarisExport.pasang(hasil);
  }

  /** Ketuk simpul di pohon -> buka kartu penjelasan orang tersebut. */
  document.addEventListener('click', function (e) {
    var simpul = e.target.closest('#pohon-hasil .pohon-simpul[data-key]');
    if (!simpul) return;
    bukaKartu(simpul.dataset.key);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var simpul = e.target.closest && e.target.closest('#pohon-hasil .pohon-simpul[data-key]');
    if (!simpul) return;
    e.preventDefault();
    bukaKartu(simpul.dataset.key);
  });

  function bukaKartu(key) {
    var semua = document.querySelectorAll('#hasil .hasil-kartu');
    var hasilTerakhir = root.UIResult.hasilTerakhir;
    if (!hasilTerakhir) return;

    // Urutan kartu penjelasan mengikuti urutan ahliWaris, jadi cocokkan lewat
    // label yang tampil supaya tidak perlu menaruh id di dua tempat.
    var target = null;
    Array.prototype.forEach.call(semua, function (k) {
      var nama = k.querySelector('.hasil-nama');
      var def = root.Heirs.BY_KEY[key];
      if (!target && def && nama && nama.textContent.indexOf(def.label) === 0) target = k;
    });
    if (!target) return;

    target.classList.add('buka');
    var tombol = target.querySelector('[data-buka-kartu]');
    if (tombol) tombol.setAttribute('aria-expanded', 'true');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // buka/tutup kartu penjelasan
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-buka-kartu]');
    if (!t) return;
    var kartu = t.closest('.hasil-kartu');
    var buka = kartu.classList.toggle('buka');
    t.setAttribute('aria-expanded', String(buka));
  });

  // buka/tutup satu bagian appendix
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-apx]');
    if (!t) return;
    var buka = t.closest('.apx').classList.toggle('buka');
    t.setAttribute('aria-expanded', String(buka));
  });

  // buka/tutup semua appendix sekaligus
  document.addEventListener('click', function (e) {
    var t = e.target.closest('#btn-apx-semua');
    if (!t) return;
    var buka = t.dataset.terbuka !== 'true';
    Array.prototype.forEach.call(document.querySelectorAll('#hasil .apx'), function (a) {
      a.classList.toggle('buka', buka);
      a.querySelector('[data-apx]').setAttribute('aria-expanded', String(buka));
    });
    t.dataset.terbuka = String(buka);
    t.textContent = buka ? 'Tutup semua' : 'Buka semua';
  });

  // keterangan baris rincian harta
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-ket]');
    if (!t) return;
    var ket = document.getElementById(t.dataset.ket);
    if (!ket) return;
    ket.hidden = !ket.hidden;
    t.setAttribute('aria-expanded', String(!ket.hidden));
  });

  root.UIResult = { render: render, WARNA: WARNA, rp: rp, rpRingkas: rpRingkas, hasilTerakhir: null };
})(typeof window !== 'undefined' ? window : globalThis);
