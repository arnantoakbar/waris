/*
 * Tirkah — menghitung harta yang benar-benar boleh dibagi.
 *
 * Warisan bukan langsung dibagi dari total harta. Ada urutan yang disebut
 * berulang kali dalam QS An-Nisa ayat 11 dan 12: "...sesudah dipenuhi wasiat
 * yang dibuatnya atau (dan) sesudah dibayar hutangnya."
 *
 * Urutan yang dipakai di sini:
 *   1. keluarkan bagian harta bersama milik pasangan (kalau ada)
 *   2. biaya pengurusan jenazah
 *   3. pelunasan hutang
 *   4. pelaksanaan wasiat, maksimal 1/3
 *   5. sisanya barulah dibagi ke ahli waris
 */

(function (root) {
  'use strict';

  function bulat(x) {
    var v = Number(x) || 0;
    return v > 0 ? Math.floor(v) : 0;
  }

  /**
   * @param {Object} h  { total, hartaBersama, biayaJenazah, hutang, wasiat }
   * @param {boolean} adaPasangan  apakah ada suami/istri yang masih hidup
   */
  function hitung(h, adaPasangan) {
    var total = bulat(h.total);
    var langkah = [];
    var catatan = [];

    langkah.push({
      id: 'total', label: 'Total harta peninggalan', nilai: total, tipe: 'awal'
    });

    var sisa = total;

    // 1. Harta bersama (gono-gini)
    var bagianPasangan = 0;
    if (h.hartaBersama && adaPasangan) {
      bagianPasangan = Math.floor(total / 2);
      sisa -= bagianPasangan;
      langkah.push({
        id: 'harta_bersama',
        label: 'Bagian harta bersama untuk pasangan',
        nilai: -bagianPasangan,
        tipe: 'kurang',
        ket: 'Separuh harta bersama adalah hak milik pasangan sejak awal, bukan warisan. ' +
             'Yang dibagi hanya separuh milik pewaris. Dasarnya UU Perkawinan No. 1/1974 ' +
             'Pasal 35 dan KHI Pasal 96 — hukum positif Indonesia, bukan dalil faraid. ' +
             'Harta bawaan sebelum menikah, serta warisan dan hadiah yang diterima ' +
             'masing-masing, TIDAK termasuk harta bersama.',
        dalil: 'harta-bersama'
      });
      catatan.push({
        id: 'harta_bersama',
        teks: 'Pasangan menerima ' + bagianPasangan + ' sebagai pemilik separuh harta bersama, ' +
              'lalu MASIH mendapat bagian warisan lagi dari harta pewaris.'
      });
    }

    // 2. Biaya pengurusan jenazah
    var biaya = Math.min(bulat(h.biayaJenazah), sisa);
    if (biaya > 0) {
      sisa -= biaya;
      langkah.push({
        id: 'biaya', label: 'Biaya pengurusan jenazah', nilai: -biaya, tipe: 'kurang',
        ket: 'Memandikan, mengafani, menyalatkan, dan menguburkan didahulukan dari semua hak lain.'
      });
    }

    // 3. Hutang
    var hutangDiminta = bulat(h.hutang);
    var hutang = Math.min(hutangDiminta, sisa);
    var hutangKurang = hutangDiminta - hutang;
    if (hutangDiminta > 0) {
      sisa -= hutang;
      langkah.push({
        id: 'hutang', label: 'Pelunasan hutang', nilai: -hutang, tipe: 'kurang',
        ket: 'Hutang pewaris wajib dilunasi lebih dulu, baik hutang ke sesama manusia ' +
             'maupun kewajiban yang tertunda seperti zakat.'
      });
    }
    if (hutangKurang > 0) {
      catatan.push({
        id: 'hutang_lebih_besar',
        tingkat: 'penting',
        teks: 'Hutang pewaris lebih besar dari hartanya, kurang ' + hutangKurang + '. ' +
              'Tidak ada warisan yang bisa dibagi. Sisa hutang bukan kewajiban ahli waris, ' +
              'tapi sangat dianjurkan ditanggung keluarga agar pewaris terbebas dari tanggungannya.'
      });
    }

    // 4. Wasiat, dibatasi 1/3
    var batasWasiat = Math.floor(sisa / 3);
    var wasiatDiminta = bulat(h.wasiat);
    var wasiat = Math.min(wasiatDiminta, batasWasiat);
    if (wasiatDiminta > 0) {
      sisa -= wasiat;
      langkah.push({
        id: 'wasiat', label: 'Pelaksanaan wasiat', nilai: -wasiat, tipe: 'kurang',
        ket: 'Wasiat dilaksanakan setelah hutang lunas, dan maksimal 1/3 dari sisa harta.'
      });
    }
    if (wasiatDiminta > wasiat) {
      catatan.push({
        id: 'wasiat_dipotong',
        tingkat: 'penting',
        teks: 'Wasiat yang ditulis (' + wasiatDiminta + ') melebihi batas 1/3 dan dipotong ' +
              'menjadi ' + wasiat + '. Rasulullah membatasi wasiat maksimal sepertiga: ' +
              '"Sepertiga, dan sepertiga itu sudah banyak." (HR Bukhari & Muslim). ' +
              'Kelebihannya hanya sah kalau seluruh ahli waris merelakan.',
        dalil: 'hadits-wasiat-sepertiga'
      });
    }

    langkah.push({
      id: 'tirkah', label: 'Harta siap dibagi', nilai: sisa, tipe: 'hasil'
    });

    return {
      total: total,
      bagianHartaBersama: bagianPasangan,
      biayaJenazah: biaya,
      hutang: hutang,
      hutangKurang: hutangKurang,
      wasiat: wasiat,
      wasiatDiminta: wasiatDiminta,
      batasWasiat: batasWasiat,
      tirkah: sisa,
      langkah: langkah,
      catatan: catatan
    };
  }

  root.Estate = { hitung: hitung };
})(typeof window !== 'undefined' ? window : globalThis);
