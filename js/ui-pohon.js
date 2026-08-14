/*
 * Pohon keluarga — penampil sekaligus penyunting.
 *
 * Pohon ini digambar dari model struktur (js/keluarga.js), bukan dari angka.
 * Bedanya penting: cucu selalu menempel pada anak tertentu, keponakan pada
 * saudara tertentu. Jadi tidak mungkin lagi muncul "anak laki-laki yang sudah
 * wafat" hanya karena user memasukkan cucu — kalau cucunya lahir dari anak
 * perempuan, ia digambar apa adanya di bawah anak perempuan itu, dan ditandai
 * bukan ahli waris.
 *
 * Simpul disusun per generasi sebagai elemen HTML biasa, lalu garis
 * penghubungnya digambar ke <svg> di belakangnya dari posisi asli elemen
 * setelah browser selesai menata. Tata letaknya jadi responsif tanpa koordinat
 * yang dipatok mati.
 */

(function (root) {
  'use strict';

  var K = root.Keluarga;
  var PEWARIS = '__pewaris__';

  var URUT_SAUDARA = { seayah: 0, kandung: 1, seibu: 2 };
  var URUT_PAMAN = { kandung: 0, seayah: 1 };

  function piktogram(gender) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#' +
      (gender === 'P' ? 'p-wanita' : 'p-pria') + '"></use></svg>';
  }

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ═══════════════════════════════════════════════════════════════
  // Menyusun simpul per generasi
  // ═══════════════════════════════════════════════════════════════

  function susun(k, konteks) {
    var baris = [[], [], [], [], []];
    var sisi = {};   // id anak -> [id orang tua], untuk menggambar garis

    function simpul(o) { return o; }

    // Penghubung yang harus tetap digambar walau belum dimasukkan user,
    // supaya kerabat di bawahnya tidak menggantung tanpa jalur.
    var adaSdrKandung = k.saudara.some(function (s) { return s.jenis === 'kandung'; });
    var adaSdrSeayah  = k.saudara.some(function (s) { return s.jenis === 'seayah'; });
    var adaSdrSeibu   = k.saudara.some(function (s) { return s.jenis === 'seibu'; });

    var perluAyah = adaSdrKandung || adaSdrSeayah || k.paman.length > 0 || !!k.kakek || !!k.nenekAyah;
    var perluIbu  = adaSdrKandung || adaSdrSeibu || !!k.nenekIbu;
    var perluKakek = k.paman.length > 0;

    // ── Baris 0: kakek & nenek ───────────────────────────────────
    if (k.kakek || perluKakek) {
      baris[0].push(simpul({ id: 'kakek', tipe: 'kakek', nama: 'Kakek', jalur: 'ayahnya ayah',
        gender: 'L', orang: k.kakek, bayangan: !k.kakek }));
    }
    if (k.nenekAyah) {
      baris[0].push(simpul({ id: 'nenekAyah', tipe: 'nenekAyah', nama: 'Nenek', jalur: 'ibunya ayah',
        gender: 'P', orang: k.nenekAyah }));
    }
    if (k.nenekIbu) {
      baris[0].push(simpul({ id: 'nenekIbu', tipe: 'nenekIbu', nama: 'Nenek', jalur: 'ibunya ibu',
        gender: 'P', orang: k.nenekIbu }));
    }

    // ── Baris 1: paman, ayah, ibu ────────────────────────────────
    var paman = k.paman.slice().sort(function (a, b) {
      return URUT_PAMAN[a.jenis] - URUT_PAMAN[b.jenis];
    });
    paman.forEach(function (p) {
      baris[1].push(simpul({ id: p.id, tipe: 'paman', nama: 'Paman',
        jalur: p.jenis === 'kandung' ? 'saudara kandung ayah' : 'saudara ayah beda nenek',
        gender: 'L', orang: p }));
      sisi[p.id] = ['kakek'];
    });

    if (k.ayah || perluAyah) {
      baris[1].push(simpul({ id: 'ayah', tipe: 'ayah', nama: 'Ayah', jalur: 'orang tua',
        gender: 'L', orang: k.ayah, bayangan: !k.ayah }));
      sisi.ayah = [];
      if (k.kakek || perluKakek) sisi.ayah.push('kakek');
      if (k.nenekAyah) sisi.ayah.push('nenekAyah');
      if (!sisi.ayah.length) delete sisi.ayah;
    }
    if (k.ibu || perluIbu) {
      baris[1].push(simpul({ id: 'ibu', tipe: 'ibu', nama: 'Ibu', jalur: 'orang tua',
        gender: 'P', orang: k.ibu, bayangan: !k.ibu }));
      if (k.nenekIbu) sisi.ibu = ['nenekIbu'];
    }

    var adaAyah = k.ayah || perluAyah;
    var adaIbu = k.ibu || perluIbu;

    // ── Baris 2: sepupu, saudara, pewaris, pasangan ──────────────
    paman.forEach(function (p) {
      p.anak.forEach(function (c) {
        baris[2].push(simpul({ id: c.id, tipe: 'sepupu', nama: 'Sepupu',
          jalur: p.jenis === 'kandung' ? 'anak paman kandung' : 'anak paman beda nenek',
          gender: c.gender, orang: c }));
        sisi[c.id] = [p.id];
      });
    });

    var saudara = k.saudara.slice().sort(function (a, b) {
      return URUT_SAUDARA[a.jenis] - URUT_SAUDARA[b.jenis];
    });
    saudara.forEach(function (s) {
      baris[2].push(simpul({ id: s.id, tipe: 'saudara', nama: 'Saudara',
        jalur: (s.gender === 'P' ? 'perempuan, ' : 'laki-laki, ') +
          (s.jenis === 'kandung' ? 'seayah seibu' : s.jenis === 'seayah' ? 'beda ibu' : 'beda ayah'),
        gender: s.gender, orang: s }));
      sisi[s.id] = s.jenis === 'kandung' ? [adaAyah && 'ayah', adaIbu && 'ibu'].filter(Boolean)
                 : s.jenis === 'seayah' ? (adaAyah ? ['ayah'] : [])
                 : (adaIbu ? ['ibu'] : []);
    });

    baris[2].push(simpul({ id: PEWARIS, tipe: 'pewaris', nama: 'Pewaris',
      jalur: 'yang meninggal', gender: k.jenisKelamin || 'L' }));
    sisi[PEWARIS] = [adaAyah && 'ayah', adaIbu && 'ibu'].filter(Boolean);

    k.pasangan.forEach(function (o) {
      baris[2].push(simpul({ id: o.id, tipe: 'pasangan',
        nama: k.jenisKelamin === 'P' ? 'Suami' : 'Istri', jalur: 'pasangan pewaris',
        gender: k.jenisKelamin === 'P' ? 'L' : 'P', orang: o }));
    });

    // ── Baris 3: keponakan, anak ─────────────────────────────────
    saudara.forEach(function (s) {
      s.anak.forEach(function (c) {
        baris[3].push(simpul({ id: c.id, tipe: 'keponakan', nama: 'Keponakan',
          jalur: 'anak dari saudara ' +
            (s.jenis === 'kandung' ? 'kandung' : s.jenis === 'seayah' ? 'beda ibu' : 'beda ayah'),
          gender: c.gender, orang: c }));
        sisi[c.id] = [s.id];
      });
    });

    k.anak.forEach(function (a) {
      baris[3].push(simpul({ id: a.id, tipe: 'anak',
        nama: a.angkat ? 'Anak angkat' : a.tiri ? 'Anak tiri' : 'Anak',
        jalur: a.gender === 'L' ? 'laki-laki' : 'perempuan',
        gender: a.gender, orang: a }));
      sisi[a.id] = [PEWARIS];
    });

    // ── Baris 4: cucu ────────────────────────────────────────────
    k.anak.forEach(function (a) {
      a.anak.forEach(function (c) {
        baris[4].push(simpul({ id: c.id, tipe: 'cucu', nama: 'Cucu',
          jalur: 'dari anak ' + (a.gender === 'L' ? 'laki-laki' : 'perempuan'),
          gender: c.gender, orang: c }));
        sisi[c.id] = [a.id];
      });
    });

    return { baris: baris, sisi: sisi };
  }

  // ═══════════════════════════════════════════════════════════════
  // Status tiap orang
  // ═══════════════════════════════════════════════════════════════

  function statusSimpul(s, peta, dariHasil) {
    if (s.tipe === 'pewaris') return 'pewaris';
    if (s.bayangan) return 'hantu';
    var o = s.orang;
    if (!o) return 'hantu';
    if (o.angkat || o.tiri) return 'bukan';
    if (o.hidup === false) return 'wafat';

    var kunci = peta ? peta[o.id] : null;
    if (!kunci) return 'bukan';          // hidup, tapi memang bukan ahli waris
    if (!dariHasil) return 'ada';        // mode isian: belum ada hitungan
    var h = dariHasil[kunci];
    if (!h) return 'bukan';
    return h.status === 'terhalang' ? 'terhalang'
         : h.status === 'nol' ? 'kosong' : 'menerima';
  }

  var CATATAN_STATUS = {
    wafat: 'sudah wafat',
    bukan: 'bukan ahli waris',
    terhalang: 'terhalang',
    kosong: 'tidak kebagian',
    hantu: 'belum diisi'
  };

  // ═══════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════

  /**
   * @param {HTMLElement} wadah
   * @param {Object} opsi
   *   keluarga  model susunan keluarga (wajib)
   *   hasil     keluaran Faraid.hitung() — kalau ada, bagian ditampilkan
   *   sunting   boolean — tampilkan kontrol tambah/ubah
   *   onUbah    fungsi yang dipanggil setiap model berubah
   */
  function render(wadah, opsi) {
    opsi = opsi || {};
    var k = opsi.keluarga;
    if (!k) return;

    wadah._opsi = opsi;

    var turunan = K.keAhliWaris(k);
    var peta = turunan.petaOrang;

    // ringkasan hasil per kunci ahli waris
    var dariHasil = null;
    if (opsi.hasil && opsi.hasil.valid) {
      dariHasil = {};
      opsi.hasil.ahliWaris.forEach(function (a) { dariHasil[a.key] = a; });
    }

    var struktur = susun(k, opsi);

    var html = '<div class="pohon-kanvas"><svg class="pohon-garis" aria-hidden="true"></svg>';

    struktur.baris.forEach(function (b) {
      if (!b.length) return;
      html += '<div class="pohon-baris">';
      b.forEach(function (s) {
        var status = statusSimpul(s, peta, dariHasil);
        var kunci = s.orang && peta[s.orang.id];
        var h = kunci && dariHasil ? dariHasil[kunci] : null;

        // Bagian per ORANG, bukan per kelompok. Kalau 3 anak perempuan berbagi
        // 2/3, tiap orang tertulis 2/9 — jauh lebih mudah dicerna daripada
        // menempelkan 2/3 di tiga simpul sekaligus.
        var bagian = null, nominal = null;
        if (h && status === 'menerima') {
          bagian = root.Fraction.toText(root.Fraction.div(h.bagian, root.Fraction.F(h.jumlah)));
          nominal = h.nominalPerOrang;
        }

        var judul = s.nama + (s.jalur ? ' — ' + s.jalur : '');
        var bisaSunting = opsi.sunting && s.tipe !== 'pewaris';

        html += '<div class="pohon-simpul" data-status="' + status + '" data-id="' + esc(s.id) + '" ' +
          'data-tipe="' + s.tipe + '" title="' + esc(judul) + '"' +
          (bisaSunting || status === 'menerima' || status === 'terhalang' || status === 'kosong'
            ? ' tabindex="0" role="button"' : '') + '>' +
          (bisaSunting ? '<span class="pohon-ubah" aria-hidden="true">' +
            '<svg class="ic" viewBox="0 0 24 24"><use href="#i-pensil"></use></svg></span>' : '') +
          '<span class="pohon-ikon">' + piktogram(s.gender) + '</span>' +
          '<span class="pohon-nama">' + esc(s.nama) + '</span>' +
          '<span class="pohon-jalur">' + esc(s.jalur) + '</span>' +
          (bagian ? '<span class="pohon-bagian">' + bagian + '</span>' : '') +
          (nominal !== null ? '<span class="pohon-rp">' + root.UIResult.rpRingkas(nominal) + '</span>' : '') +
          (CATATAN_STATUS[status] ? '<span class="pohon-silang">' + CATATAN_STATUS[status] + '</span>' : '') +
          '</div>';
      });
      html += '</div>';
    });

    html += '</div>';

    if (opsi.sunting) html += bilahTambah(k);

    wadah.innerHTML = html;
    wadah._sisi = struktur.sisi;

    gambarGaris(wadah);
    pusatkanKePewaris(wadah);
    siapkanCetak(wadah);

    if (typeof ResizeObserver !== 'undefined') {
      var kanvas = wadah.querySelector('.pohon-kanvas');
      if (wadah._pengamat) wadah._pengamat.disconnect();
      wadah._pengamat = new ResizeObserver(function () {
        gambarGaris(wadah);
        siapkanCetak(wadah);
      });
      wadah._pengamat.observe(kanvas);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { gambarGaris(wadah); siapkanCetak(wadah); });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Bilah tambah anggota
  // ═══════════════════════════════════════════════════════════════

  function bilahTambah(k) {
    var t = [];
    // Yang dibatasi hanya pasangan yang masih hidup; yang sudah wafat tidak
    // ikut mengunci tombolnya.
    if (K.jumlahPasanganHidup(k) < K.MAKS_PASANGAN(k.jenisKelamin)) {
      t.push(['pasangan', k.jenisKelamin === 'P' ? 'Suami' : 'Istri']);
    }
    t.push(['anak', 'Anak']);
    t.push(['anak_angkat', 'Anak tiri / angkat']);
    if (!k.ayah || !k.ibu) t.push(['ortu', 'Orang tua']);
    t.push(['saudara', 'Saudara']);
    if (!k.kakek || !k.nenekAyah || !k.nenekIbu) t.push(['kakeknenek', 'Kakek / nenek']);
    t.push(['paman', 'Paman']);

    return '<div class="pohon-bilah"><span class="pohon-bilah-judul">Tambah</span>' +
      t.map(function (x) {
        return '<button type="button" class="pohon-tambah" data-tambah="' + x[0] + '">' +
          '<svg class="ic ic-sm" aria-hidden="true"><use href="#i-plus"></use></svg>' + x[1] + '</button>';
      }).join('') + '</div>';
  }

  // ═══════════════════════════════════════════════════════════════
  // Garis penghubung
  // ═══════════════════════════════════════════════════════════════

  function gambarGaris(wadah) {
    var kanvas = wadah.querySelector('.pohon-kanvas');
    var svg = wadah.querySelector('.pohon-garis');
    var sisi = wadah._sisi;
    if (!kanvas || !svg || !sisi) return;

    var asal = kanvas.getBoundingClientRect();
    if (!asal.width) return;

    svg.setAttribute('viewBox', '0 0 ' + asal.width + ' ' + asal.height);
    svg.setAttribute('width', asal.width);
    svg.setAttribute('height', asal.height);

    function kotak(idOrang) {
      var el = kanvas.querySelector('[data-id="' + CSS.escape(idOrang) + '"]');
      if (!el) return null;
      var r = el.getBoundingClientRect();
      return {
        kiri: r.left - asal.left, kanan: r.right - asal.left,
        atas: r.top - asal.top, bawah: r.bottom - asal.top,
        tengahX: r.left + r.width / 2 - asal.left,
        samar: el.dataset.status === 'hantu' || el.dataset.status === 'wafat' ||
               el.dataset.status === 'bukan'
      };
    }

    var jalur = [];

    Object.keys(sisi).forEach(function (anak) {
      var ortu = (sisi[anak] || []).map(kotak).filter(Boolean);
      if (!ortu.length) return;
      var kAnak = kotak(anak);
      if (!kAnak) return;

      // Pangkalnya di tengah-tengah orang tua yang ada. Untuk saudara kandung
      // dan pewaris itu berarti di antara ayah dan ibu — dari situ bedanya
      // dengan saudara seayah atau seibu langsung terbaca.
      var pangkalX = ortu.reduce(function (t, o) { return t + o.tengahX; }, 0) / ortu.length;
      var pangkalY = Math.max.apply(null, ortu.map(function (o) { return o.bawah; }));
      if (kAnak.atas <= pangkalY) return;

      var tengahY = pangkalY + (kAnak.atas - pangkalY) / 2;
      var samar = kAnak.samar || ortu.every(function (o) { return o.samar; });

      jalur.push('<path d="M ' + pangkalX.toFixed(1) + ' ' + pangkalY.toFixed(1) +
        ' V ' + tengahY.toFixed(1) + ' H ' + kAnak.tengahX.toFixed(1) +
        ' V ' + kAnak.atas.toFixed(1) + '" class="' + (samar ? 'garis samar' : 'garis') + '"/>');
    });

    // ── Garis pernikahan ─────────────────────────────────────────
    // Pasangan selalu digambar di sebelah kanan pewaris, jadi kalau
    // pasangannya lebih dari satu, garis ke pasangan yang jauh melewati kartu
    // pasangan yang ada di antaranya. Itu tidak apa-apa — garis digambar di
    // lapisan bawah, jadi terlihat lewat DI BELAKANG kartu, persis seperti
    // bagan silsilah pada umumnya. Syaratnya kartu tidak boleh tembus
    // pandang; lihat .pohon-simpul[data-status="wafat"] di app.css.
    // Tiap celah antar kartu digambar SEKALI saja, memakai gaya pasangan yang
    // dituju. Kalau tiap pasangan ditarik garisnya sendiri dari pewaris, garis
    // pasangan yang jauh menimpa garis pasangan yang dekat di celah yang sama,
    // dan gaya "sudah wafat" jadi tertutup garis pasangan yang masih hidup.
    var kPewaris = kotak(PEWARIS);
    if (kPewaris) {
      [].slice.call(kanvas.querySelectorAll('[data-tipe="pasangan"]'))
        .map(function (el) { return kotak(el.dataset.id); })
        .filter(Boolean)
        .sort(function (a, b) { return a.kiri - b.kiri; })
        .forEach(function (kp, i, urut) {
          var x1 = i === 0 ? kPewaris.kanan : urut[i - 1].kanan;
          if (kp.kiri <= x1) return;
          var y = (Math.max(kPewaris.atas, kp.atas) + Math.min(kPewaris.bawah, kp.bawah)) / 2;
          jalur.push('<path d="M ' + x1.toFixed(1) + ' ' + y.toFixed(1) +
            ' H ' + kp.kiri.toFixed(1) + '" class="garis nikah' +
            (kp.samar ? ' samar' : '') + '"/>');
        });
    }

    svg.innerHTML = jalur.join('');
  }

  /*
   * Versi cetak. Ukuran simpul TIDAK boleh diubah lewat CSS cetak — garisnya
   * dihitung dari posisi di layar, jadi akan meleset. Yang diperkecil adalah
   * seluruh pohon sebagai satu kesatuan lewat transform, supaya simpul dan
   * garis menyusut bersama.
   */
  var LEBAR_CETAK = 660;

  function siapkanCetak(wadah) {
    var kanvas = wadah.querySelector('.pohon-kanvas');
    if (!kanvas || !kanvas.scrollWidth) return;
    var skala = Math.min(1, LEBAR_CETAK / kanvas.scrollWidth);
    wadah.style.setProperty('--skala-cetak', skala);
    wadah.style.setProperty('--tinggi-cetak', Math.ceil(kanvas.scrollHeight * skala) + 'px');
  }

  function pusatkanKePewaris(wadah) {
    if (wadah.scrollWidth <= wadah.clientWidth) return;
    var simpul = wadah.querySelector('[data-tipe="pewaris"]');
    if (!simpul) return;
    var tengah = simpul.offsetLeft + simpul.offsetWidth / 2;
    wadah.scrollLeft = Math.max(0, tengah - wadah.clientWidth / 2);
  }

  /*
   * Data pohon untuk digambar ulang di kanvas (export PNG).
   *
   * Tata letaknya diambil dari posisi elemen yang sudah dihitung browser, bukan
   * dihitung ulang dari nol. Dengan begitu gambar di PNG persis sama dengan
   * yang dilihat user di layar — tidak ada dua versi tata letak yang bisa
   * berbeda diam-diam.
   */
  function dataUntukEkspor(wadah) {
    if (!wadah) return null;
    var kanvas = wadah.querySelector('.pohon-kanvas');
    if (!kanvas || !kanvas.scrollWidth) return null;

    var asal = kanvas.getBoundingClientRect();
    var simpul = [];
    var petaKotak = {};

    Array.prototype.forEach.call(kanvas.querySelectorAll('.pohon-simpul'), function (el) {
      var r = el.getBoundingClientRect();
      var kotak = {
        x: r.left - asal.left, y: r.top - asal.top,
        w: r.width, h: r.height
      };
      var ambil = function (sel) {
        var e = el.querySelector(sel);
        return e ? e.textContent.trim() : null;
      };
      petaKotak[el.dataset.id] = kotak;
      simpul.push({
        id: el.dataset.id,
        tipe: el.dataset.tipe,
        status: el.dataset.status,
        nama: ambil('.pohon-nama'),
        jalur: ambil('.pohon-jalur'),
        bagian: ambil('.pohon-bagian'),
        rp: ambil('.pohon-rp'),
        catatan: ambil('.pohon-silang'),
        gender: el.querySelector('use') &&
          /wanita/.test(el.querySelector('use').getAttribute('href')) ? 'P' : 'L',
        kotak: kotak
      });
    });

    return {
      lebar: kanvas.scrollWidth,
      tinggi: kanvas.scrollHeight,
      simpul: simpul,
      kotak: petaKotak,
      sisi: wadah._sisi || {}
    };
  }

  root.Pohon = {
    render: render,
    gambarGaris: gambarGaris,
    dataUntukEkspor: dataUntukEkspor,
    PEWARIS: PEWARIS
  };
})(typeof window !== 'undefined' ? window : globalThis);
