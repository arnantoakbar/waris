/*
 * Hijab — siapa menggugurkan siapa.
 *
 * Prinsipnya: kerabat yang lebih dekat menutup yang lebih jauh. Cucu tidak
 * dapat apa-apa selama anak laki-laki masih ada, paman tidak dapat apa-apa
 * selama saudara masih ada, dan seterusnya.
 *
 * Yang terhalang tetap dikembalikan dalam hasil (bukan dibuang) supaya bisa
 * ditampilkan ke user lengkap dengan alasannya. Itu justru bagian yang paling
 * sering bikin keluarga bertanya-tanya.
 */

(function (root) {
  'use strict';

  var H = root.Heirs;

  /**
   * @param {Object} counts  { anak_lk: 2, istri: 1, ... }
   * @returns {{aktif: Object, terhalang: Array<{key, oleh, alasan}>}}
   */
  function terapkan(counts) {
    var aktif = {};
    Object.keys(counts).forEach(function (k) {
      if (counts[k] > 0) aktif[k] = counts[k];
    });

    var terhalang = [];

    function ada(key) { return (aktif[key] || 0) > 0; }
    function jml(key) { return aktif[key] || 0; }

    function blokir(key, oleh, alasan) {
      if (!ada(key)) return;
      terhalang.push({ key: key, jumlah: aktif[key], oleh: oleh, alasan: alasan });
      delete aktif[key];
    }

    // ── Tingkat 1: cucu terhadap anak ────────────────────────────────
    if (ada('anak_lk')) {
      blokir('cucu_lk', ['anak_lk'], 'Terhalang oleh anak laki-laki pewaris, yang lebih dekat kekerabatannya.');
      blokir('cucu_pr', ['anak_lk'], 'Terhalang oleh anak laki-laki pewaris, yang lebih dekat kekerabatannya.');
    }
    // Dua anak perempuan atau lebih sudah mengambil 2/3, tidak tersisa bagian
    // tetap untuk cucu perempuan — kecuali ada cucu laki-laki yang menariknya
    // jadi ashabah.
    if (jml('anak_pr') >= 2 && !ada('cucu_lk')) {
      blokir('cucu_pr', ['anak_pr'],
        'Bagian anak perempuan (2/3) sudah penuh dan tidak ada cucu laki-laki yang bisa menariknya menjadi ashabah.');
    }

    // ── Tingkat 2: kakek & nenek ─────────────────────────────────────
    if (ada('ayah')) {
      blokir('kakek', ['ayah'], 'Terhalang oleh ayah pewaris.');
      blokir('nenek_ayah', ['ayah'], 'Terhalang oleh ayah pewaris (jalur nenek ini lewat ayah).');
    }
    if (ada('ibu')) {
      blokir('nenek_ayah', ['ibu'], 'Terhalang oleh ibu pewaris.');
      blokir('nenek_ibu', ['ibu'], 'Terhalang oleh ibu pewaris.');
    }

    // ── Tingkat 3: saudara seibu ─────────────────────────────────────
    var faruAda = H.FARU.some(ada);
    if (faruAda || ada('ayah') || ada('kakek')) {
      var olehSeibu = [];
      H.FARU.forEach(function (k) { if (ada(k)) olehSeibu.push(k); });
      if (ada('ayah')) olehSeibu.push('ayah');
      if (ada('kakek')) olehSeibu.push('kakek');
      var alasanSeibu = 'Saudara seibu hanya mewarisi dalam keadaan kalalah — ' +
        'pewaris tidak punya anak/cucu dan tidak punya ayah/kakek (QS An-Nisa: 12).';
      blokir('sdr_lk_seibu', olehSeibu, alasanSeibu);
      blokir('sdr_pr_seibu', olehSeibu, alasanSeibu);
    }

    // ── Tingkat 4: saudara kandung ───────────────────────────────────
    var faruLk = H.FARU_LK.some(ada);
    if (faruLk || ada('ayah')) {
      var olehKandung = [];
      H.FARU_LK.forEach(function (k) { if (ada(k)) olehKandung.push(k); });
      if (ada('ayah')) olehKandung.push('ayah');
      var alasanKandung = faruLk
        ? 'Terhalang oleh keturunan laki-laki pewaris.'
        : 'Terhalang oleh ayah pewaris.';
      blokir('sdr_lk_kandung', olehKandung, alasanKandung);
      blokir('sdr_pr_kandung', olehKandung, alasanKandung);
    }

    // Saudara perempuan kandung menjadi ashabah "ma'al ghair" kalau ada anak
    // atau cucu perempuan — statusnya naik seperti saudara laki-laki, sehingga
    // ia menghalangi saudara seayah dan seterusnya ke bawah.
    var faruPr = ada('anak_pr') || ada('cucu_pr');
    var maalGhairKandung = ada('sdr_pr_kandung') && faruPr;

    // ── Tingkat 5: saudara seayah ────────────────────────────────────
    var pemblokirSebapak = [];
    H.FARU_LK.forEach(function (k) { if (ada(k)) pemblokirSebapak.push(k); });
    if (ada('ayah')) pemblokirSebapak.push('ayah');
    if (ada('sdr_lk_kandung')) pemblokirSebapak.push('sdr_lk_kandung');
    if (maalGhairKandung) pemblokirSebapak.push('sdr_pr_kandung');

    if (pemblokirSebapak.length) {
      var alasanSebapak = ada('sdr_lk_kandung')
        ? 'Terhalang oleh saudara kandung, yang hubungannya lebih kuat (seayah dan seibu).'
        : maalGhairKandung && !faruLk && !ada('ayah')
          ? 'Terhalang oleh saudara perempuan kandung yang menjadi ashabah bersama anak/cucu perempuan.'
          : 'Terhalang oleh kerabat yang lebih dekat.';
      blokir('sdr_lk_sebapak', pemblokirSebapak.slice(), alasanSebapak);
      blokir('sdr_pr_sebapak', pemblokirSebapak.slice(), alasanSebapak);
    }
    // Dua saudara perempuan kandung sudah mengambil 2/3.
    if (jml('sdr_pr_kandung') >= 2 && !ada('sdr_lk_sebapak')) {
      blokir('sdr_pr_sebapak', ['sdr_pr_kandung'],
        'Bagian saudara perempuan kandung (2/3) sudah penuh dan tidak ada saudara laki-laki seayah yang bisa menariknya menjadi ashabah.');
    }

    // ── Tingkat 6+: keponakan, paman, sepupu ─────────────────────────
    var maalGhairSebapak = ada('sdr_pr_sebapak') && faruPr;

    var rantai = [
      'keponakan_kandung',
      'keponakan_sebapak',
      'paman_kandung',
      'paman_sebapak',
      'sepupu_kandung',
      'sepupu_sebapak'
    ];

    var pemblokirDasar = [];
    H.FARU_LK.forEach(function (k) { if (ada(k)) pemblokirDasar.push(k); });
    ['ayah', 'kakek', 'sdr_lk_kandung', 'sdr_lk_sebapak'].forEach(function (k) {
      if (ada(k)) pemblokirDasar.push(k);
    });
    if (maalGhairKandung) pemblokirDasar.push('sdr_pr_kandung');
    if (maalGhairSebapak) pemblokirDasar.push('sdr_pr_sebapak');

    rantai.forEach(function (key, i) {
      var oleh = pemblokirDasar.slice();
      // ditambah semua kerabat sejenis yang urutannya lebih tinggi
      for (var j = 0; j < i; j++) {
        if (ada(rantai[j])) oleh.push(rantai[j]);
      }
      if (oleh.length) {
        blokir(key, oleh,
          'Ashabah diberikan berurutan ke kerabat laki-laki terdekat. ' +
          H.label(oleh[0]) + ' lebih dekat, jadi giliran tidak sampai ke sini.');
      }
    });

    return { aktif: aktif, terhalang: terhalang };
  }

  root.Hijab = { terapkan: terapkan };
})(typeof window !== 'undefined' ? window : globalThis);
