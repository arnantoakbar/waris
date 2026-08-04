/*
 * Penyunting pohon keluarga.
 *
 * Menempel pada pohon yang sudah dirender (ui-pohon.js) dan menangani dua hal:
 * bilah "Tambah" di bawah pohon, dan lembar ubah yang muncul saat sebuah simpul
 * diketuk.
 *
 * Kuncinya ada pada "Tambah anak" di dalam lembar ubah: cucu ditambahkan dari
 * dalam kartu anak tertentu, keponakan dari dalam kartu saudara tertentu. Jadi
 * hubungannya tidak pernah perlu ditebak — dan cucu lewat anak perempuan
 * langsung ketahuan bukan ahli waris.
 */

(function (root) {
  'use strict';

  var K = root.Keluarga;

  var lembar = null;      // elemen lembar ubah
  var wadahAktif = null;  // pohon yang sedang disunting
  var idAktif = null;

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function ikon(id, kelas) {
    return '<svg class="ic ' + (kelas || '') + '" aria-hidden="true"><use href="#' + id + '"></use></svg>';
  }

  function opsiModel() { return wadahAktif && wadahAktif._opsi; }
  function model() { var o = opsiModel(); return o && o.keluarga; }

  function perbarui() {
    var o = opsiModel();
    if (o && typeof o.onUbah === 'function') o.onUbah();
  }

  // ═══════════════════════════════════════════════════════════════
  // Lembar ubah
  // ═══════════════════════════════════════════════════════════════

  function pastikanLembar() {
    if (lembar) return lembar;
    lembar = document.createElement('div');
    lembar.className = 'lembar';
    lembar.setAttribute('role', 'dialog');
    lembar.setAttribute('aria-modal', 'true');
    lembar.hidden = true;
    lembar.innerHTML = '<div class="lembar-tirai" data-tutup></div>' +
      '<div class="lembar-isi" role="document"></div>';
    document.body.appendChild(lembar);
    return lembar;
  }

  function tutup() {
    if (lembar) lembar.hidden = true;
    idAktif = null;
    document.body.classList.remove('lembar-terbuka');
  }

  function buka(isiHtml) {
    pastikanLembar();
    lembar.querySelector('.lembar-isi').innerHTML = isiHtml;
    lembar.hidden = false;
    document.body.classList.add('lembar-terbuka');
    var fokus = lembar.querySelector('button:not([data-tutup])');
    if (fokus) fokus.focus();
  }

  function baris(judul, isi) {
    return '<div class="lembar-baris"><span class="lembar-label">' + judul + '</span>' + isi + '</div>';
  }

  function pilihan(nama, daftar, terpilih) {
    return '<div class="lembar-pilih">' + daftar.map(function (d) {
      return '<button type="button" data-set="' + nama + '" data-nilai="' + d[0] + '"' +
        (String(terpilih) === String(d[0]) ? ' aria-pressed="true"' : ' aria-pressed="false"') +
        '>' + d[1] + '</button>';
    }).join('') + '</div>';
  }

  var JUDUL_TIPE = {
    pasangan: 'Pasangan', anak: 'Anak', cucu: 'Cucu', ayah: 'Ayah', ibu: 'Ibu',
    kakek: 'Kakek', nenekAyah: 'Nenek dari ayah', nenekIbu: 'Nenek dari ibu',
    saudara: 'Saudara', keponakan: 'Keponakan', paman: 'Paman', sepupu: 'Sepupu'
  };

  function bukaUbah(idOrang, tipe) {
    var k = model();
    if (!k) return;
    idAktif = idOrang;

    var temuan = K.cari(k, idOrang);
    var o = temuan ? temuan.orang : null;
    var h = '<div class="lembar-kepala"><h3>' + (JUDUL_TIPE[tipe] || 'Anggota keluarga') + '</h3>' +
      '<button type="button" class="lembar-tutup" data-tutup aria-label="Tutup">' +
      ikon('i-silang') + '</button></div>';

    if (!o) {
      // Simpul bayangan — belum ada di model, tawarkan menambahkannya.
      h += '<p class="lembar-ket">Kerabat ini digambar samar karena diperlukan untuk ' +
        'menyambungkan keluarga, tapi belum kamu masukkan.</p>' +
        '<div class="lembar-aksi"><button type="button" class="btn btn-dark btn-sm btn-block" ' +
        'data-hidupkan="' + esc(idOrang) + '">Tambahkan sebagai ahli waris yang masih hidup</button></div>';
      buka(h);
      return;
    }

    // ── Jenis kelamin ──────────────────────────────────────────────
    if (['anak', 'cucu', 'saudara', 'keponakan', 'sepupu'].indexOf(tipe) > -1) {
      h += baris('Jenis kelamin', pilihan('gender',
        [['L', 'Laki-laki'], ['P', 'Perempuan']], o.gender));
    }

    // ── Jenis hubungan saudara / paman ─────────────────────────────
    if (tipe === 'saudara') {
      h += baris('Hubungan', pilihan('jenis', [
        ['kandung', 'Seayah seibu'], ['seayah', 'Beda ibu'], ['seibu', 'Beda ayah']
      ], o.jenis));
    }
    if (tipe === 'paman') {
      h += baris('Hubungan', pilihan('jenis', [
        ['kandung', 'Saudara kandung ayah'], ['seayah', 'Beda nenek']
      ], o.jenis));
    }

    // ── Masih hidup atau sudah wafat ───────────────────────────────
    if (['anak', 'saudara', 'paman', 'ayah', 'ibu', 'kakek', 'nenekAyah', 'nenekIbu'].indexOf(tipe) > -1) {
      h += baris('Keadaan', pilihan('hidup',
        [[true, 'Masih hidup'], [false, 'Sudah wafat']], o.hidup !== false));
    }

    // ── Anak angkat ────────────────────────────────────────────────
    if (tipe === 'anak') {
      h += baris('Status', pilihan('angkat',
        [[false, 'Anak kandung'], [true, 'Anak angkat']], !!o.angkat));
      if (o.angkat) {
        h += '<p class="lembar-ket lembar-catat">Anak angkat bukan ahli waris. Tapi KHI ' +
          'Pasal 209 memberinya hak wasiat wajibah maksimal 1/3 harta, ditetapkan lewat ' +
          'Pengadilan Agama.</p>';
      }
    }

    // ── Tambah keturunan ───────────────────────────────────────────
    var labelKeturunan = tipe === 'anak' ? 'cucu'
                       : tipe === 'saudara' ? 'keponakan'
                       : tipe === 'paman' ? 'sepupu' : null;

    if (labelKeturunan) {
      var jml = (o.anak || []).length;
      h += '<div class="lembar-baris lembar-blok">' +
        '<span class="lembar-label">Anak dari orang ini (' + labelKeturunan + ')</span>' +
        (jml ? '<div class="lembar-daftar">' + o.anak.map(function (c) {
          return '<span class="lembar-cip">' + (c.gender === 'L' ? 'Laki-laki' : 'Perempuan') +
            '<button type="button" data-hapus-anak="' + esc(c.id) + '" aria-label="Hapus">' +
            ikon('i-silang', 'ic-sm') + '</button></span>';
        }).join('') + '</div>' : '<p class="lembar-ket">Belum ada.</p>') +
        '<div class="lembar-pilih lembar-pilih-longgar">' +
        '<button type="button" data-tambah-anak="L">' + ikon('i-plus', 'ic-sm') + ' Laki-laki</button>' +
        '<button type="button" data-tambah-anak="P">' + ikon('i-plus', 'ic-sm') + ' Perempuan</button>' +
        '</div>';

      // Peringatan spesifik: inilah sumber kesalahan yang paling sering.
      if (tipe === 'anak' && o.gender === 'P' && jml) {
        h += '<p class="lembar-ket lembar-catat">Cucu lewat anak perempuan BUKAN ahli waris ' +
          '(disebut dzawil arham). Selama ibunya masih hidup, ibunyalah yang menerima bagian.</p>';
      }
      if (tipe === 'saudara' && jml && (o.gender === 'P' || o.jenis === 'seibu')) {
        h += '<p class="lembar-ket lembar-catat">Yang mewarisi hanya keponakan laki-laki dari ' +
          'saudara laki-laki kandung atau seayah. Anak dari saudara ini tidak mendapat bagian.</p>';
      }
      h += '</div>';
    }

    // "Selesai" dibuat menonjol dengan warna utama, "Hapus" sengaja tetap
    // kalem — keduanya bersebelahan, dan yang merusak tidak boleh terlihat
    // sama menariknya dengan yang aman.
    h += '<div class="lembar-aksi">' +
      '<button type="button" class="btn btn-ghost btn-sm lembar-hapus" data-hapus>' +
      ikon('i-sampah', 'ic-sm') + ' Hapus</button>' +
      '<button type="button" class="btn btn-dark btn-sm lembar-simpan" data-tutup>' +
      ikon('i-check', 'ic-sm') + ' Selesai</button></div>';

    buka(h);
  }

  // ═══════════════════════════════════════════════════════════════
  // Tambah anggota baru
  // ═══════════════════════════════════════════════════════════════

  function bukaTambah(jenis) {
    var k = model();
    if (!k) return;

    var h = '<div class="lembar-kepala"><h3>Tambah anggota keluarga</h3>' +
      '<button type="button" class="lembar-tutup" data-tutup aria-label="Tutup">' +
      ikon('i-silang') + '</button></div>';

    function tombol(aksi, label, ket) {
      return '<button type="button" class="lembar-opsi" data-buat="' + aksi + '">' +
        '<span class="lembar-opsi-judul">' + label + '</span>' +
        (ket ? '<span class="lembar-opsi-ket">' + ket + '</span>' : '') + '</button>';
    }

    switch (jenis) {
      case 'pasangan':
        K.tambahPasangan(k); perbarui(); return;

      case 'anak':
        h += tombol('anak_L', 'Anak laki-laki') + tombol('anak_P', 'Anak perempuan');
        break;

      case 'anak_angkat':
        h += '<p class="lembar-ket">Anak angkat bukan ahli waris, tapi tetap digambar supaya ' +
          'susunan keluarganya utuh — dan kami akan menambahkan catatan tentang wasiat wajibah.</p>' +
          tombol('angkat_L', 'Anak angkat laki-laki') + tombol('angkat_P', 'Anak angkat perempuan');
        break;

      case 'ortu':
        if (!k.ayah) h += tombol('ayah', 'Ayah');
        if (!k.ibu) h += tombol('ibu', 'Ibu');
        break;

      case 'kakeknenek':
        if (!k.kakek) h += tombol('kakek', 'Kakek', 'Ayah dari ayah. Kakek dari pihak ibu bukan ahli waris.');
        if (!k.nenekAyah) h += tombol('nenekAyah', 'Nenek dari pihak ayah');
        if (!k.nenekIbu) h += tombol('nenekIbu', 'Nenek dari pihak ibu');
        break;

      case 'saudara':
        h += '<p class="lembar-ket">Pilih hubungannya dengan pewaris. Ini menentukan besar ' +
          'bagiannya, jadi periksa baik-baik.</p>' +
          tombol('sdr_kandung_L', 'Saudara laki-laki kandung', 'Satu ayah satu ibu') +
          tombol('sdr_kandung_P', 'Saudara perempuan kandung', 'Satu ayah satu ibu') +
          tombol('sdr_seayah_L', 'Saudara laki-laki seayah', 'Satu ayah, lain ibu') +
          tombol('sdr_seayah_P', 'Saudara perempuan seayah', 'Satu ayah, lain ibu') +
          tombol('sdr_seibu_L', 'Saudara laki-laki seibu', 'Satu ibu, lain ayah') +
          tombol('sdr_seibu_P', 'Saudara perempuan seibu', 'Satu ibu, lain ayah');
        break;

      case 'paman':
        h += tombol('paman_kandung', 'Paman kandung', 'Saudara ayah, satu ayah satu ibu dengan ayah') +
          tombol('paman_seayah', 'Paman seayah', 'Satu kakek, lain nenek');
        break;
    }

    buka(h);
  }

  function buat(aksi) {
    var k = model();
    if (!k) return;

    if (aksi === 'anak_L') K.tambahAnak(k, 'L');
    else if (aksi === 'anak_P') K.tambahAnak(k, 'P');
    else if (aksi === 'angkat_L') K.tambahAnak(k, 'L', { angkat: true });
    else if (aksi === 'angkat_P') K.tambahAnak(k, 'P', { angkat: true });
    else if (aksi === 'ayah') k.ayah = { hidup: true };
    else if (aksi === 'ibu') k.ibu = { hidup: true };
    else if (aksi === 'kakek') k.kakek = { hidup: true };
    else if (aksi === 'nenekAyah') k.nenekAyah = { hidup: true };
    else if (aksi === 'nenekIbu') k.nenekIbu = { hidup: true };
    else if (aksi.indexOf('sdr_') === 0) {
      var p = aksi.split('_');
      K.tambahSaudara(k, p[1], p[2]);
    } else if (aksi === 'paman_kandung') K.tambahPaman(k, 'kandung');
    else if (aksi === 'paman_seayah') K.tambahPaman(k, 'seayah');

    tutup();
    perbarui();
  }

  // ═══════════════════════════════════════════════════════════════
  // Penanganan klik
  // ═══════════════════════════════════════════════════════════════

  document.addEventListener('click', function (e) {
    // ── di dalam pohon ────────────────────────────────────────────
    var simpul = e.target.closest('.pohon-simpul[data-id]');
    if (simpul) {
      var pohon = simpul.closest('.pohon');
      if (pohon && pohon._opsi && pohon._opsi.sunting) {
        wadahAktif = pohon;
        if (simpul.dataset.tipe !== 'pewaris') {
          bukaUbah(simpul.dataset.id, simpul.dataset.tipe);
          return;
        }
      }
      return; // mode baca: biarkan ui-result yang menangani
    }

    var tambah = e.target.closest('[data-tambah]');
    if (tambah && tambah.closest('.pohon')) {
      wadahAktif = tambah.closest('.pohon');
      bukaTambah(tambah.dataset.tambah);
      return;
    }

    // ── di dalam lembar ───────────────────────────────────────────
    if (!lembar || lembar.hidden) return;

    if (e.target.closest('[data-tutup]')) { tutup(); return; }

    var buatBtn = e.target.closest('[data-buat]');
    if (buatBtn) { buat(buatBtn.dataset.buat); return; }

    var k = model();
    if (!k) return;

    var hidupkan = e.target.closest('[data-hidupkan]');
    if (hidupkan) {
      var t = hidupkan.dataset.hidupkan;
      if (t === 'ayah') k.ayah = { hidup: true };
      else if (t === 'ibu') k.ibu = { hidup: true };
      else if (t === 'kakek') k.kakek = { hidup: true };
      tutup(); perbarui(); return;
    }

    var set = e.target.closest('[data-set]');
    if (set) {
      var temuan = K.cari(k, idAktif);
      if (!temuan) return;
      var o = temuan.orang;
      var nilai = set.dataset.nilai;
      if (set.dataset.set === 'hidup') o.hidup = (nilai === 'true');
      else if (set.dataset.set === 'angkat') o.angkat = (nilai === 'true');
      else o[set.dataset.set] = nilai;
      perbarui();
      bukaUbah(idAktif, temuan.tipe);   // gambar ulang lembar dengan nilai baru
      return;
    }

    var tambahAnak = e.target.closest('[data-tambah-anak]');
    if (tambahAnak) {
      var f = K.cari(k, idAktif);
      if (!f) return;
      K.tambahKeturunan(f.orang, tambahAnak.dataset.tambahAnak);
      perbarui();
      bukaUbah(idAktif, f.tipe);
      return;
    }

    var hapusAnak = e.target.closest('[data-hapus-anak]');
    if (hapusAnak) {
      var f2 = K.cari(k, idAktif);
      K.hapus(k, hapusAnak.dataset.hapusAnak);
      perbarui();
      if (f2) bukaUbah(idAktif, f2.tipe);
      return;
    }

    if (e.target.closest('[data-hapus]')) {
      K.hapus(k, idAktif);
      K.rapikan(k);
      tutup();
      perbarui();
      return;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lembar && !lembar.hidden) { tutup(); return; }

    if (e.key !== 'Enter' && e.key !== ' ') return;
    var simpul = e.target.closest && e.target.closest('.pohon-simpul[data-id]');
    if (!simpul) return;
    var pohon = simpul.closest('.pohon');
    if (pohon && pohon._opsi && pohon._opsi.sunting && simpul.dataset.tipe !== 'pewaris') {
      e.preventDefault();
      wadahAktif = pohon;
      bukaUbah(simpul.dataset.id, simpul.dataset.tipe);
    }
  });

  root.PohonEdit = { tutup: tutup };
})(typeof window !== 'undefined' ? window : globalThis);
