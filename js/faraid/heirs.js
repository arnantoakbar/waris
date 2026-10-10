/*
 * Definisi 23 ahli waris yang dicakup kalkulator ini.
 *
 * Cakupan sengaja berhenti sebelum dzawil arham (kerabat jauh seperti cucu
 * dari anak perempuan, bibi, paman dari pihak ibu). Kasusnya langka dan
 * ulama berbeda pendapat, jadi lebih jujur mengarahkan ke ustadz/Pengadilan
 * Agama daripada menebak. Lihat solve.js -> catatan "diluarCakupan".
 */

(function (root) {
  'use strict';

  var GROUPS = [
    { id: 'pasangan',  label: 'Pasangan',        utama: true  },
    { id: 'anak',      label: 'Anak',            utama: true  },
    { id: 'orangtua',  label: 'Orang tua',       utama: true  },
    { id: 'cucu',      label: 'Cucu',            utama: false },
    { id: 'kakeknenek',label: 'Kakek & nenek',   utama: false },
    { id: 'saudara',   label: 'Saudara',         utama: false },
    { id: 'kerabat',   label: 'Kerabat lain',    utama: false }
  ];

  // ikon: id <symbol> di sprite SVG (lihat hitung.html)
  var HEIRS = [
    {
      key: 'suami', label: 'Suami', group: 'pasangan', gender: 'L', max: 1,
      icon: 'i-pria', hanyaJika: 'P',
      panggilan: 'Suami', jalur: 'pasangan pewaris',
      ket: 'Suami yang ditinggalkan.'
    },
    {
      key: 'istri', label: 'Istri', group: 'pasangan', gender: 'P', max: 4,
      icon: 'i-wanita', hanyaJika: 'L',
      panggilan: 'Istri', jalur: 'pasangan pewaris',
      ket: 'Istri yang ditinggalkan. Jika lebih dari satu, bagian dibagi rata.'
    },

    {
      key: 'anak_lk', label: 'Anak laki-laki', group: 'anak', gender: 'L', max: 20,
      icon: 'i-anak-pria',
      panggilan: 'Anak', jalur: 'laki-laki',
      ket: 'Anak kandung pewaris sendiri.'
    },
    {
      key: 'anak_pr', label: 'Anak perempuan', group: 'anak', gender: 'P', max: 20,
      icon: 'i-anak-wanita',
      panggilan: 'Anak', jalur: 'perempuan',
      ket: 'Anak kandung pewaris sendiri.'
    },

    {
      key: 'ayah', label: 'Ayah', group: 'orangtua', gender: 'L', max: 1,
      icon: 'i-pria',
      panggilan: 'Ayah', jalur: 'orang tua',
      ket: 'Ayah kandung pewaris.'
    },
    {
      key: 'ibu', label: 'Ibu', group: 'orangtua', gender: 'P', max: 1,
      icon: 'i-wanita',
      panggilan: 'Ibu', jalur: 'orang tua',
      ket: 'Ibu kandung pewaris.'
    },

    {
      key: 'cucu_lk', label: 'Cucu laki-laki', group: 'cucu', gender: 'L', max: 20,
      icon: 'i-anak-pria',
      panggilan: 'Cucu', jalur: 'dari anak laki-laki',
      ket: 'Anak dari anak laki-laki pewaris. Cucu lewat anak perempuan tidak termasuk.'
    },
    {
      key: 'cucu_pr', label: 'Cucu perempuan', group: 'cucu', gender: 'P', max: 20,
      icon: 'i-anak-wanita',
      panggilan: 'Cucu', jalur: 'dari anak laki-laki',
      ket: 'Anak dari anak laki-laki pewaris. Cucu lewat anak perempuan tidak termasuk.'
    },

    {
      key: 'kakek', label: 'Kakek', group: 'kakeknenek', gender: 'L', max: 1,
      icon: 'i-lansia-pria',
      panggilan: 'Kakek', jalur: 'ayahnya ayah',
      ket: 'Kakek dari pihak ayah. Kakek dari pihak ibu tidak termasuk ahli waris.'
    },
    {
      key: 'nenek_ayah', label: 'Nenek dari ayah', group: 'kakeknenek', gender: 'P', max: 1,
      icon: 'i-lansia-wanita',
      panggilan: 'Nenek', jalur: 'ibunya ayah',
      ket: 'Nenek dari pihak ayah.'
    },
    {
      key: 'nenek_ibu', label: 'Nenek dari ibu', group: 'kakeknenek', gender: 'P', max: 1,
      icon: 'i-lansia-wanita',
      panggilan: 'Nenek', jalur: 'ibunya ibu',
      ket: 'Nenek dari pihak ibu.'
    },

    {
      key: 'sdr_lk_kandung', label: 'Saudara laki-laki kandung', group: 'saudara', gender: 'L', max: 20,
      icon: 'i-pria', panggilan: 'Saudara', jalur: 'seayah seibu',
      ket: 'Kakak atau adik laki-laki, satu ayah dan ibu dengan pewaris.'
    },
    {
      key: 'sdr_pr_kandung', label: 'Saudara perempuan kandung', group: 'saudara', gender: 'P', max: 20,
      icon: 'i-wanita', panggilan: 'Saudara', jalur: 'seayah seibu',
      ket: 'Kakak atau adik perempuan, satu ayah dan ibu dengan pewaris.'
    },
    {
      key: 'sdr_lk_sebapak', label: 'Saudara laki-laki seayah', group: 'saudara', gender: 'L', max: 20,
      icon: 'i-pria', panggilan: 'Saudara', jalur: 'beda ibu',
      ket: 'Satu ayah, beda ibu.'
    },
    {
      key: 'sdr_pr_sebapak', label: 'Saudara perempuan seayah', group: 'saudara', gender: 'P', max: 20,
      icon: 'i-wanita', panggilan: 'Saudara', jalur: 'beda ibu',
      ket: 'Satu ayah, beda ibu.'
    },
    {
      key: 'sdr_lk_seibu', label: 'Saudara laki-laki seibu', group: 'saudara', gender: 'L', max: 20,
      icon: 'i-pria', panggilan: 'Saudara', jalur: 'beda ayah',
      ket: 'Satu ibu, beda ayah.'
    },
    {
      key: 'sdr_pr_seibu', label: 'Saudara perempuan seibu', group: 'saudara', gender: 'P', max: 20,
      icon: 'i-wanita', panggilan: 'Saudara', jalur: 'beda ayah',
      ket: 'Satu ibu, beda ayah.'
    },

    {
      key: 'keponakan_kandung', label: 'Keponakan dari saudara kandung', group: 'kerabat', gender: 'L', max: 20,
      icon: 'i-pria', panggilan: 'Keponakan', jalur: 'anak saudara kandung',
      ket: 'Anak laki-laki dari saudara laki-laki kandung.'
    },
    {
      key: 'keponakan_sebapak', label: 'Keponakan dari saudara seayah', group: 'kerabat', gender: 'L', max: 20,
      icon: 'i-pria', panggilan: 'Keponakan', jalur: 'anak saudara beda ibu',
      ket: 'Anak laki-laki dari saudara laki-laki seayah, beda ibu.'
    },
    {
      key: 'paman_kandung', label: 'Paman kandung', group: 'kerabat', gender: 'L', max: 20,
      icon: 'i-lansia-pria', panggilan: 'Paman', jalur: 'saudara kandung ayah',
      ket: 'Saudara laki-laki kandung ayah.'
    },
    {
      key: 'paman_sebapak', label: 'Paman seayah', group: 'kerabat', gender: 'L', max: 20,
      icon: 'i-lansia-pria', panggilan: 'Paman', jalur: 'saudara ayah beda nenek',
      ket: 'Saudara laki-laki ayah, satu kakek beda nenek.'
    },
    {
      key: 'sepupu_kandung', label: 'Sepupu dari paman kandung', group: 'kerabat', gender: 'L', max: 20,
      icon: 'i-pria', panggilan: 'Sepupu', jalur: 'anak paman kandung',
      ket: 'Anak laki-laki dari paman kandung (sepupu laki-laki).'
    },
    {
      key: 'sepupu_sebapak', label: 'Sepupu dari paman seayah', group: 'kerabat', gender: 'L', max: 20,
      icon: 'i-pria', panggilan: 'Sepupu', jalur: 'anak paman beda nenek',
      ket: 'Anak laki-laki dari paman seayah.'
    }
  ];

  var BY_KEY = {};
  HEIRS.forEach(function (h) { BY_KEY[h.key] = h; });

  /** Urutan ashabah bin nafsihi: jihat dulu, lalu derajat, lalu kekuatan. */
  var URUTAN_ASHABAH = [
    'anak_lk',
    'cucu_lk',
    'ayah',
    'kakek',
    'sdr_lk_kandung',
    'sdr_lk_sebapak',
    'keponakan_kandung',
    'keponakan_sebapak',
    'paman_kandung',
    'paman_sebapak',
    'sepupu_kandung',
    'sepupu_sebapak'
  ];

  /** Pasangan ashabah bil ghair: perempuan yang "diangkat" oleh saudara laki-lakinya. */
  var PASANGAN_BIL_GHAIR = {
    anak_lk: 'anak_pr',
    cucu_lk: 'cucu_pr',
    sdr_lk_kandung: 'sdr_pr_kandung',
    sdr_lk_sebapak: 'sdr_pr_sebapak'
  };

  var SEMUA_SAUDARA = [
    'sdr_lk_kandung', 'sdr_pr_kandung',
    'sdr_lk_sebapak', 'sdr_pr_sebapak',
    'sdr_lk_seibu', 'sdr_pr_seibu'
  ];

  /** Keturunan yang berhak waris (far' warits). */
  var FARU = ['anak_lk', 'anak_pr', 'cucu_lk', 'cucu_pr'];
  /** Keturunan laki-laki (far' warits laki-laki). */
  var FARU_LK = ['anak_lk', 'cucu_lk'];

  function label(key) {
    return BY_KEY[key] ? BY_KEY[key].label : key;
  }

  root.Heirs = {
    GROUPS: GROUPS,
    LIST: HEIRS,
    BY_KEY: BY_KEY,
    URUTAN_ASHABAH: URUTAN_ASHABAH,
    PASANGAN_BIL_GHAIR: PASANGAN_BIL_GHAIR,
    SEMUA_SAUDARA: SEMUA_SAUDARA,
    FARU: FARU,
    FARU_LK: FARU_LK,
    label: label
  };
})(typeof window !== 'undefined' ? window : globalThis);
