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
            ' berbagi sisa harta dengan perbandingan 2 : 1 — bagian laki-laki dua kali bagian perempuan.',
          dalil: 'qs4-11'
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
        dalil: 'hadits-ashabah'
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
          alasan: H.label(kandidat) + ' menjadi ashabah karena pewaris meninggalkan anak/cucu perempuan, ' +
            'sehingga mengambil sisa harta setelah bagian tetap dibayarkan.',
          dalil: 'hadits-ashabah'
        };
      }
    }

    return null;
  }

  root.Ashabah = { bagi: bagi };
})(typeof window !== 'undefined' ? window : globalThis);
