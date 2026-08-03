/*
 * Ashabul furudh — ahli waris yang bagiannya sudah dipatok Al-Qur'an.
 * Hanya ada enam angka: 1/2, 1/4, 1/8, 2/3, 1/3, dan 1/6.
 *
 * Fungsi di sini mengembalikan bagian per KELOMPOK (misal total untuk semua
 * istri), bukan per orang. Pembagian per orang dilakukan di solve.js.
 */

(function (root) {
  'use strict';

  var f = root.Fraction;
  var H = root.Heirs;

  var F = f.F;

  /**
   * @param {Object} aktif        ahli waris yang lolos hijab
   * @param {Object} countsAsli   jumlah sebelum hijab (untuk hitung saudara
   *                              yang tetap menurunkan bagian ibu)
   * @param {Object} opts         { lewatiKakek, lewatiFardhSaudara }
   *   lewatiKakek / lewatiFardhSaudara dipakai saat kakek berkumpul dengan
   *   saudara: di situ saudara perempuan tidak mengambil bagian tetapnya
   *   melainkan ikut muqasamah bersama kakek (lihat special.js).
   */
  function hitung(aktif, countsAsli, opts) {
    opts = opts || {};
    var fardh = {};   // key -> Fraction (total kelompok)
    var alasan = {};  // key -> penjelasan singkat
    var dalil = {};   // key -> id dalil di dalil.js

    function ada(k) { return (aktif[k] || 0) > 0; }
    function n(k) { return aktif[k] || 0; }

    var faruLk = H.FARU_LK.some(ada);
    var faruPr = ada('anak_pr') || ada('cucu_pr');
    var faru = faruLk || faruPr;

    function set(key, frac, teks, idDalil) {
      fardh[key] = frac;
      alasan[key] = teks;
      dalil[key] = idDalil;
    }

    // ── Pasangan ─────────────────────────────────────────────────────
    if (ada('suami')) {
      set('suami', faru ? F(1, 4) : F(1, 2),
        faru
          ? 'Suami mendapat 1/4 karena pewaris meninggalkan anak atau cucu.'
          : 'Suami mendapat 1/2 karena pewaris tidak meninggalkan anak atau cucu.',
        'qs4-12');
    }
    if (ada('istri')) {
      set('istri', faru ? F(1, 8) : F(1, 4),
        faru
          ? 'Istri mendapat 1/8 karena pewaris meninggalkan anak atau cucu' +
            (n('istri') > 1 ? ', dibagi rata untuk ' + n('istri') + ' istri.' : '.')
          : 'Istri mendapat 1/4 karena pewaris tidak meninggalkan anak atau cucu' +
            (n('istri') > 1 ? ', dibagi rata untuk ' + n('istri') + ' istri.' : '.'),
        'qs4-12');
    }

    // ── Ibu ──────────────────────────────────────────────────────────
    var jmlSaudaraAsli = H.SEMUA_SAUDARA.reduce(function (t, k) {
      return t + (countsAsli[k] || 0);
    }, 0);

    if (ada('ibu')) {
      if (faru) {
        set('ibu', F(1, 6), 'Ibu mendapat 1/6 karena pewaris meninggalkan anak atau cucu.', 'qs4-11');
      } else if (jmlSaudaraAsli >= 2) {
        set('ibu', F(1, 6),
          'Ibu mendapat 1/6 karena pewaris punya dua saudara atau lebih. ' +
          'Ini berlaku walaupun saudara-saudara itu sendiri terhalang oleh ayah.', 'qs4-11');
      } else {
        set('ibu', F(1, 3), 'Ibu mendapat 1/3 karena pewaris tidak punya anak, cucu, maupun dua saudara.', 'qs4-11');
      }
    }

    // ── Nenek ────────────────────────────────────────────────────────
    var nenekAktif = ['nenek_ayah', 'nenek_ibu'].filter(ada);
    if (nenekAktif.length) {
      var bagianNenek = F(1, 6 * nenekAktif.length);
      nenekAktif.forEach(function (k) {
        set(k, bagianNenek,
          nenekAktif.length > 1
            ? 'Nenek mendapat 1/6 bersama-sama, dibagi rata antara dua nenek.'
            : 'Nenek mendapat 1/6.',
          'hadits-nenek');
      });
    }

    // ── Ayah ─────────────────────────────────────────────────────────
    if (ada('ayah')) {
      if (faruLk) {
        set('ayah', F(1, 6),
          'Ayah mendapat 1/6 karena pewaris meninggalkan keturunan laki-laki. ' +
          'Sisa harta jatuh ke keturunan itu.', 'qs4-11');
      } else if (faruPr) {
        set('ayah', F(1, 6),
          'Ayah mendapat 1/6 sebagai bagian tetap, ditambah sisa harta setelah ' +
          'semua bagian tetap dibayarkan.', 'qs4-11');
      }
      // tanpa keturunan sama sekali: ayah murni ashabah, tidak punya bagian tetap
    }

    // ── Kakek (bila ayah tidak ada) ──────────────────────────────────
    if (ada('kakek') && !opts.lewatiKakek) {
      if (faruLk) {
        set('kakek', F(1, 6),
          'Kakek menempati posisi ayah dan mendapat 1/6 karena ada keturunan laki-laki.', 'ijma-kakek');
      } else if (faruPr) {
        set('kakek', F(1, 6),
          'Kakek mendapat 1/6 sebagai bagian tetap, ditambah sisa harta yang masih ada.', 'ijma-kakek');
      }
    }

    // ── Anak perempuan ───────────────────────────────────────────────
    if (ada('anak_pr') && !ada('anak_lk')) {
      if (n('anak_pr') === 1) {
        set('anak_pr', F(1, 2), 'Satu anak perempuan tanpa saudara laki-laki mendapat 1/2.', 'qs4-11');
      } else {
        set('anak_pr', F(2, 3),
          n('anak_pr') + ' anak perempuan tanpa saudara laki-laki berbagi 2/3.', 'qs4-11');
      }
    }

    // ── Cucu perempuan dari anak laki-laki ───────────────────────────
    if (ada('cucu_pr') && !ada('cucu_lk')) {
      if (n('anak_pr') === 1) {
        set('cucu_pr', F(1, 6),
          'Cucu perempuan mendapat 1/6 sebagai pelengkap: satu anak perempuan sudah ' +
          'mengambil 1/2, sisa 1/6 melengkapinya menjadi 2/3.', 'hadits-cucu-pr');
      } else if (!ada('anak_pr')) {
        if (n('cucu_pr') === 1) {
          set('cucu_pr', F(1, 2), 'Satu cucu perempuan menempati posisi anak perempuan dan mendapat 1/2.', 'qs4-11');
        } else {
          set('cucu_pr', F(2, 3), n('cucu_pr') + ' cucu perempuan berbagi 2/3, menempati posisi anak perempuan.', 'qs4-11');
        }
      }
    }

    // ── Saudara seibu ────────────────────────────────────────────────
    var seibuTotal = n('sdr_lk_seibu') + n('sdr_pr_seibu');
    if (seibuTotal > 0) {
      var totalSeibu = seibuTotal === 1 ? F(1, 6) : F(1, 3);
      var teksSeibu = seibuTotal === 1
        ? 'Satu saudara seibu mendapat 1/6.'
        : seibuTotal + ' saudara seibu berbagi 1/3 sama rata — laki-laki dan perempuan sama besar.';
      // dibagi rata per kepala tanpa membedakan laki-laki/perempuan
      if (ada('sdr_lk_seibu')) {
        set('sdr_lk_seibu', f.mul(totalSeibu, F(n('sdr_lk_seibu'), seibuTotal)), teksSeibu, 'qs4-12');
      }
      if (ada('sdr_pr_seibu')) {
        set('sdr_pr_seibu', f.mul(totalSeibu, F(n('sdr_pr_seibu'), seibuTotal)), teksSeibu, 'qs4-12');
      }
    }

    // ── Saudara perempuan kandung ────────────────────────────────────
    if (!opts.lewatiFardhSaudara && ada('sdr_pr_kandung') && !ada('sdr_lk_kandung') && !faruPr) {
      if (n('sdr_pr_kandung') === 1) {
        set('sdr_pr_kandung', F(1, 2), 'Satu saudara perempuan kandung mendapat 1/2.', 'qs4-176');
      } else {
        set('sdr_pr_kandung', F(2, 3), n('sdr_pr_kandung') + ' saudara perempuan kandung berbagi 2/3.', 'qs4-176');
      }
    }

    // ── Saudara perempuan seayah ─────────────────────────────────────
    if (!opts.lewatiFardhSaudara && ada('sdr_pr_sebapak') && !ada('sdr_lk_sebapak') && !faruPr) {
      if (n('sdr_pr_kandung') === 1) {
        set('sdr_pr_sebapak', F(1, 6),
          'Saudara perempuan seayah mendapat 1/6 sebagai pelengkap bagian 2/3, ' +
          'karena saudara perempuan kandung hanya satu orang.', 'qs4-176');
      } else if (!ada('sdr_pr_kandung')) {
        if (n('sdr_pr_sebapak') === 1) {
          set('sdr_pr_sebapak', F(1, 2), 'Satu saudara perempuan seayah mendapat 1/2.', 'qs4-176');
        } else {
          set('sdr_pr_sebapak', F(2, 3), n('sdr_pr_sebapak') + ' saudara perempuan seayah berbagi 2/3.', 'qs4-176');
        }
      }
    }

    return { fardh: fardh, alasan: alasan, dalil: dalil, faru: faru, faruLk: faruLk, faruPr: faruPr };
  }

  root.Shares = { hitung: hitung };
})(typeof window !== 'undefined' ? window : globalThis);
