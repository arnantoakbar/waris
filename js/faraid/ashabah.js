/*
 * Ashabah — penerima sisa harta.
 *
 * Dasarnya hadits: "Berikan bagian-bagian tetap kepada yang berhak, lalu sisanya
 * untuk kerabat laki-laki yang paling dekat." (HR Bukhari & Muslim)
 *
 * Tiga bentuk:
 *  - bin nafsihi : laki-laki yang jadi ashabah karena dirinya sendiri
 *  - bil ghair   : perempuan yang jadi ashabah karena ditarik saudara laki-lakinya (2:1)
 *  - ma'al ghair : saudara perempuan yang jadi ashabah karena adanya anak/cucu perempuan
 */

(function (root) {
  'use strict';

  var f = root.Fraction;
  var H = root.Heirs;
  var F = f.F;

  /*
   * Aturan 2 : 1 punya DUA ayat yang berbeda, dan keduanya tidak saling
   * menggantikan:
   *   - QS An-Nisa 11  berbicara tentang ANAK ("fii awlaadikum"). Cucu ikut
   *                    ayat ini karena mengambil kedudukan anak saat anak
   *                    laki-laki tidak ada.
   *   - QS An-Nisa 176 berbicara tentang SAUDARA dalam keadaan kalalah, dan
   *                    kalimat terakhirnya menyebut 2 : 1 secara khusus untuk
   *                    saudara laki-laki dan perempuan.
   * Dulu semua pasangan ditunjukkan ke QS An-Nisa 11 — keliru, karena ayat itu
   * tidak menyinggung saudara sama sekali.
   */
  var DALIL_BIL_GHAIR = {
    anak_lk: 'qs4-11',
    cucu_lk: 'qs4-11',
    sdr_lk_kandung: 'qs4-176',
    sdr_lk_sebapak: 'qs4-176'
  };

  /* Klausa di dalam ayat yang benar-benar menyebut perbandingan 2 : 1. */
  var POTONGAN_BIL_GHAIR = {
    anak_lk: 'anak',
    cucu_lk: 'anak',
    sdr_lk_kandung: 'saudaraCampur',
    sdr_lk_sebapak: 'saudaraCampur'
  };

  var KETERANGAN_BIL_GHAIR = {
    anak_lk: 'Aturan ini disebut langsung dalam QS An-Nisa ayat 11 tentang anak.',
    cucu_lk: 'Cucu lewat anak laki-laki mengambil kedudukan anak ketika pewaris tidak ' +
      'meninggalkan anak laki-laki, jadi memakai aturan yang sama dengan anak.',
    sdr_lk_kandung: 'Aturan ini disebut di akhir QS An-Nisa ayat 176, ayat tentang kalalah ' +
      '— yaitu pewaris yang tidak meninggalkan anak maupun ayah.',
    sdr_lk_sebapak: 'Saudara seayah mengambil kedudukan saudara kandung ketika saudara ' +
      'kandung tidak ada, jadi memakai aturan yang sama dalam QS An-Nisa ayat 176.'
  };

  /**
   * @param {Object} aktif
   * @param {Fraction} sisa  sisa harta setelah bagian tetap
   * @returns {null|{bagian:Object, tipe:string, penerima:Array, alasan:string, dalil:string}}
   */
  function bagi(aktif, sisa) {
    function n(k) { return aktif[k] || 0; }
    function ada(k) { return n(k) > 0; }

    var faruPr = ada('anak_pr') || ada('cucu_pr');

    // ── Ashabah bin nafsihi / bil ghair ──────────────────────────────
    for (var i = 0; i < H.URUTAN_ASHABAH.length; i++) {
      var key = H.URUTAN_ASHABAH[i];
      if (!ada(key)) continue;

      var partner = H.PASANGAN_BIL_GHAIR[key];
      var bagian = {};

      if (partner && ada(partner)) {
        var unit = 2 * n(key) + n(partner);
        bagian[key] = f.mul(sisa, F(2 * n(key), unit));
        bagian[partner] = f.mul(sisa, F(n(partner), unit));
        return {
          bagian: bagian,
          tipe: 'bil_ghair',
          penerima: [key, partner],
          alasan: H.label(key) + ' dan ' + H.label(partner).toLowerCase() +
            ' berbagi sisa harta dengan perbandingan 2 : 1 — bagian laki-laki dua kali ' +
            'bagian perempuan. ' + KETERANGAN_BIL_GHAIR[key],
          dalil: DALIL_BIL_GHAIR[key],
          potongan: POTONGAN_BIL_GHAIR[key],
          // Ayat menetapkan PERBANDINGANNYA; hadits menetapkan bahwa merekalah
          // yang mengambil sisa harta. Dua hal berbeda, jadi dua-duanya dirujuk.
          dalilLain: ['hadits-ashabah']
        };
      }

      bagian[key] = sisa;
      return {
        bagian: bagian,
        tipe: 'bin_nafsihi',
        penerima: [key],
        alasan: (key === 'ayah' || key === 'kakek')
          ? H.label(key) + ' mengambil seluruh sisa harta setelah bagian tetap dibayarkan.'
          : H.label(key) + ' adalah kerabat laki-laki terdekat, jadi seluruh sisa harta menjadi haknya.',
        dalil: 'hadits-ashabah',
        // Hak anak dan cucu untuk mewarisi sendiri berasal dari QS An-Nisa 11.
        dalilLain: (key === 'anak_lk' || key === 'cucu_lk') ? ['qs4-11']
                 : (key === 'ayah' || key === 'kakek') ? ['qs4-11'] : []
      };
    }

    // ── Ashabah ma'al ghair ──────────────────────────────────────────
    if (faruPr) {
      var kandidat = ada('sdr_pr_kandung') ? 'sdr_pr_kandung'
                   : ada('sdr_pr_sebapak') ? 'sdr_pr_sebapak' : null;
      if (kandidat) {
        var b = {};
        b[kandidat] = sisa;
        return {
          bagian: b,
          tipe: 'maal_ghair',
          penerima: [kandidat],
          // HR Bukhari 6736 menyebut keadaan ini apa adanya: "...dan sisanya
          // untuk saudara perempuan" — lebih tepat daripada hadits ashabah
          // yang sifatnya umum.
          alasan: H.label(kandidat) + ' menjadi ashabah karena pewaris meninggalkan anak/cucu perempuan, ' +
            'sehingga mengambil sisa harta setelah bagian tetap dibayarkan. Keadaan ini disebut ' +
            'langsung dalam putusan Ibnu Mas\'ud: "dan sisanya untuk saudara perempuan".',
          dalil: 'hadits-cucu-pr',
          dalilLain: ['qs4-176']
        };
      }
    }

    return null;
  }

  root.Ashabah = { bagi: bagi };
})(typeof window !== 'undefined' ? window : globalThis);
