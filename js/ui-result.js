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
  function renderLedger(hasil, diam) {
    return '<div class="ledger">' + hasil.harta.langkah.map(function (l, i) {
      var delay = diam ? 0 : i * 90;
      return '<div class="ledger-baris ' + l.tipe + '" style="animation-delay:' + delay + 'ms">' +
        '<span class="ledger-label">' + l.label + '</span>' +
        '<span class="ledger-nilai">' + (l.nilai < 0 ? '− ' : '') + rp(Math.abs(l.nilai)) + '</span>' +
        (l.ket ? '<span class="ledger-ket">' + l.ket + '</span>' : '') +
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

  function kartuWaris(a, warna) {
    var dalil = a.dalil ? root.Dalil.ambil(a.dalil) : null;

    var isiDalil = dalil ? '<div class="dalil">' +
      '<div class="dalil-rujukan">' + dalil.rujukan + '</div>' +
      (dalil.arab ? '<div class="dalil-arab" lang="ar" dir="rtl">' + dalil.arab + '</div>' : '') +
      '<div class="dalil-terjemah">' + dalil.terjemah + '</div>' +
      (dalil.sumber ? '<div class="dalil-sumber">' + dalil.sumber + '</div>' : '') +
      '</div>' : '';

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

  // ═══════════════════════════════════════════════════════════════
  // Render utama
  // ═══════════════════════════════════════════════════════════════
  function render(hasil, opts) {
    opts = opts || {};
    var wadah = document.getElementById('hasil');

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
    var catatanKHI = root.KHI.catatan(hasil);
    var saran = root.Advice.langkah(hasil);
    var dalilDipakai = root.Dalil.kumpulkan(hasil);

    var html = '';

    // ── Kepala ─────────────────────────────────────────────────────
    html += '<div class="wrap wrap-narrow hasil-kepala-besar">' +
      '<img class="hitung-flav" src="assets/flav-confident.svg" alt="">' +
      '<span class="overline">Hasil perhitungan</span>' +
      '<h2 class="flav-display-l">Beginilah warisannya dibagi</h2>' +
      '<p class="flav-body" style="margin-top:var(--space-4)">' +
      (penerima.length
        ? 'Dari ' + rp(hasil.harta.tirkah) + ' harta yang siap dibagi, ' +
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
        '<div class="pohon" id="pohon-hasil"></div>' +
        '<p class="pohon-geser">Geser ke samping untuk melihat seluruh keluarga.</p>' +
        '<div class="pohon-legenda">' +
        '<span><i class="l-pewaris"></i> Pewaris (yang meninggal)</span>' +
        '<span><i class="l-menerima"></i> Dapat bagian</span>' +
        '<span><i class="l-terhalang"></i> Terhalang</span>' +
        '<span><i class="l-kosong"></i> Berhak, tidak kebagian</span>' +
        '<span><i class="l-bukan"></i> Bukan ahli waris</span>' +
        '<span><i class="l-wafat"></i> Sudah wafat</span>' +
        '</div></div></div>';

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

    // ── Catatan KHI ────────────────────────────────────────────────
    if (catatanKHI.length) {
      html += '<div class="wrap wrap-narrow"><div class="blok">' +
        '<h3 class="blok-judul">Kalau dibawa ke Pengadilan Agama</h3>' +
        '<p class="blok-ket">Hasil di atas mengikuti fiqh mazhab Syafi’i. Pengadilan Agama ' +
        'memakai Kompilasi Hukum Islam, yang di beberapa titik memutuskan berbeda. Ini bukan ' +
        'pertentangan — keduanya sah ditempuh, dan yang perlu kamu tahu adalah bedanya di mana.</p>' +
        catatanKHI.map(function (c) {
          return '<div class="note note-green" style="margin-bottom:var(--space-3)">' +
            '<div class="note-title">' + c.judul + '</div>' + c.teks +
            '<div class="dalil-sumber" style="margin-top:var(--space-3)">' + c.pasal + '</div></div>';
        }).join('') + '</div></div>';
    }

    // ── Dalil ──────────────────────────────────────────────────────
    html += '<div class="wrap wrap-narrow"><div class="blok">' +
      '<h3 class="blok-judul">Sumber aturannya</h3>' +
      '<p class="blok-ket">Semua angka di halaman ini berasal dari sumber berikut. Tidak ada ' +
      'satu pun aturan yang kami tambahkan sendiri. Daftar lengkapnya — termasuk yang tidak ' +
      'terpakai di kasus ini — ada di <a href="rujukan.html" target="_blank" rel="noopener">' +
      'halaman Rujukan</a>.</p>' +
      dalilDipakai.map(function (d) {
        return '<div class="card" style="margin-bottom:var(--space-3)">' +
          '<div class="dalil-rujukan">' + d.rujukan + '</div>' +
          (d.arab ? '<div class="dalil-arab" lang="ar" dir="rtl">' + d.arab + '</div>' : '') +
          '<div class="dalil-terjemah">' + d.terjemah + '</div>' +
          (d.sumber ? '<div class="dalil-sumber">' + d.sumber + '</div>' : '') +
          (d.ringkas ? '<p class="flav-body-sm" style="margin-top:var(--space-3)">' + d.ringkas + '</p>' : '') +
          (d.khilafiyah ? '<div class="note" style="margin-top:var(--space-3)">' + d.khilafiyah + '</div>' : '') +
          '</div>';
      }).join('') + '</div></div>';

    // ── Langkah selanjutnya ────────────────────────────────────────
    html += '<div class="wrap wrap-narrow"><div class="blok">' +
      '<h3 class="blok-judul">Langkah selanjutnya</h3>' +
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
      '</div></div>';

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

  root.UIResult = { render: render, WARNA: WARNA, rp: rp, rpRingkas: rpRingkas, hasilTerakhir: null };
})(typeof window !== 'undefined' ? window : globalThis);
