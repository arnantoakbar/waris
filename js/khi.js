/*
 * Catatan Kompilasi Hukum Islam (KHI).
 *
 * Hasil utama kalkulator ini mengikuti fiqh mazhab Syafi'i. Tapi kalau
 * perkaranya dibawa ke Pengadilan Agama di Indonesia, hakim memakai KHI
 * (Inpres No. 1 Tahun 1991), yang di beberapa titik memutuskan berbeda.
 *
 * File ini tidak mengubah hitungan apa pun. Ia hanya memunculkan catatan
 * "kalau perkara ini dibawa ke Pengadilan Agama, hasilnya bisa begini",
 * supaya keluarga tidak kaget di kemudian hari.
 */

(function (root) {
  'use strict';

  /**
   * @param {Object} hasil   keluaran Faraid.hitung()
   * @returns {Array<{id, judul, teks, pasal}>}
   */
  function catatan(hasil) {
    var out = [];
    var input = hasil.input || {};
    var kondisi = input.kondisi || {};
    var harta = input.harta || {};
    var aw = input.ahliWaris || {};

    var adaPasangan = (aw.suami || 0) > 0 || (aw.istri || 0) > 0;

    // ── Pasal 185: ahli waris pengganti ─────────────────────────────
    if (kondisi.cucuDariAnakWafat) {
      out.push({
        id: 'khi-185',
        judul: 'Cucu dari anak yang wafat lebih dulu',
        pasal: 'KHI Pasal 185',
        teks: 'Menurut fiqh klasik, cucu dari anak yang wafat lebih dulu TERHALANG selama ' +
          'masih ada anak pewaris yang hidup — jadi mereka tidak masuk hitungan di atas. ' +
          'KHI Pasal 185 mengatur lain: cucu itu bisa menggantikan posisi orang tuanya sebagai ' +
          '"ahli waris pengganti", dengan catatan bagiannya tidak boleh melebihi bagian ahli ' +
          'waris sederajat yang masih hidup. Kalau perkara ini dibawa ke Pengadilan Agama, ' +
          'kemungkinan besar cucu tersebut akan diberi bagian. Banyak keluarga juga memilih ' +
          'jalan tengah: memberi cucu itu lewat hibah atau kesepakatan damai antar ahli waris.'
      });
    }

    // ── Pasal 209 & 171(h): wasiat wajibah ──────────────────────────
    if (kondisi.anakAngkat) {
      out.push({
        id: 'khi-209',
        judul: 'Anak angkat',
        pasal: 'KHI Pasal 209',
        teks: 'Anak angkat bukan ahli waris, karena hubungan nasab tidak berpindah lewat ' +
          'pengangkatan. Tapi KHI Pasal 209 memberi anak angkat hak "wasiat wajibah" maksimal ' +
          '1/3 dari harta warisan orang tua angkatnya, meskipun wasiat itu tidak pernah ' +
          'dituliskan. Aturan yang sama berlaku sebaliknya untuk orang tua angkat.'
      });
    }

    if (kondisi.bedaAgama) {
      out.push({
        id: 'khi-wasiat-wajibah',
        judul: 'Anggota keluarga yang berbeda agama',
        pasal: 'Yurisprudensi Mahkamah Agung',
        teks: 'Secara fiqh, perbedaan agama menggugurkan hak waris — dan KHI juga mensyaratkan ' +
          'ahli waris beragama Islam. Namun dalam beberapa putusannya, Mahkamah Agung memberikan ' +
          '"wasiat wajibah" kepada ahli waris non-muslim, besarnya tidak melebihi bagian yang ' +
          'akan ia terima seandainya ia berhak, dan maksimal 1/3. Ini bukan warisan, melainkan ' +
          'pemberian. Kalau keluarga ingin menempuh jalan ini, putusannya ada di Pengadilan Agama.'
      });
    }

    // ── Pasal 96: harta bersama ─────────────────────────────────────
    if (adaPasangan && !harta.hartaBersama) {
      out.push({
        id: 'khi-96',
        judul: 'Harta bersama belum dipisahkan',
        pasal: 'KHI Pasal 96 & UU Perkawinan Pasal 35',
        teks: 'Kamu tidak menandai harta ini sebagai harta bersama, jadi seluruhnya dihitung ' +
          'sebagai milik pewaris. Perlu dicek lagi: harta yang diperoleh selama pernikahan ' +
          'umumnya berstatus harta bersama, dan separuhnya adalah hak milik pasangan yang masih ' +
          'hidup — bukan warisan. Yang dibagi hanya separuh milik pewaris. Harta bawaan sebelum ' +
          'menikah, warisan, dan hadiah pribadi tetap milik masing-masing. Kalau statusnya harta ' +
          'bersama, aktifkan pilihan itu di form supaya hasilnya benar.'
      });
    }

    // ── Radd & sisa yang tidak terbagi ──────────────────────────────
    if (hasil.perhitungan && hasil.perhitungan.radd && adaPasangan) {
      out.push({
        id: 'khi-radd',
        judul: 'Pasangan tidak ikut menerima sisa (radd)',
        pasal: 'Praktik Pengadilan Agama',
        teks: 'Dalam hitungan di atas, sisa harta dikembalikan hanya kepada ahli waris selain ' +
          'suami/istri — ini pendapat jumhur ulama. Sebagian hakim Pengadilan Agama di Indonesia ' +
          'mengikuti pendapat lain yang juga mengikutsertakan pasangan dalam radd, sehingga ' +
          'bagian pasangan menjadi lebih besar. Kalau ahli waris sepakat, keduanya sah ditempuh.'
      });
    }

    if (hasil.sisaTidakTerbagi) {
      out.push({
        id: 'khi-sisa',
        judul: 'Sisa harta setelah bagian pasangan',
        pasal: 'Praktik Pengadilan Agama',
        teks: 'Karena tidak ada ahli waris lain, secara fiqh klasik sisa harta diserahkan ke ' +
          'baitul mal. Di Indonesia lembaga baitul mal tidak berjalan seperti dulu, sehingga ' +
          'Pengadilan Agama pada umumnya menyerahkan sisa itu kepada suami/istri yang masih ' +
          'hidup. Alternatif lain yang lazim: menyalurkannya ke lembaga sosial atau wakaf.'
      });
    }

    return out;
  }

  root.KHI = { catatan: catatan };
})(typeof window !== 'undefined' ? window : globalThis);
