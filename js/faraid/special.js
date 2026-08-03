/*
 * Kasus-kasus khusus yang menyimpang dari pola biasa.
 *
 * Empat kasus ini punya nama sendiri dalam kitab faraid karena penerapan aturan
 * umum di situ menghasilkan sesuatu yang janggal, dan para sahabat Nabi sudah
 * memutuskannya secara khusus. Semuanya harus dicek SEBELUM pembagian normal.
 */

(function (root) {
  'use strict';

  var f = root.Fraction;
  var H = root.Heirs;
  var F = f.F;

  function kunciAktif(aktif) {
    return Object.keys(aktif).filter(function (k) { return aktif[k] > 0; }).sort();
  }

  function samaPersis(aktif, arr) {
    var a = kunciAktif(aktif);
    var b = arr.slice().sort();
    return a.length === b.length && a.every(function (k, i) { return k === b[i]; });
  }

  // ═══════════════════════════════════════════════════════════════════
  // 1. Umariyyatain (Gharrawain)
  //    Pasangan + ayah + ibu, tidak ada ahli waris lain.
  //    Ibu mendapat 1/3 SISA setelah bagian pasangan, bukan 1/3 harta.
  //    Kalau tidak begitu, ibu justru dapat lebih besar dari ayah.
  //    Putusan Umar bin Khattab, diikuti jumhur ulama termasuk Imam Syafi'i.
  // ═══════════════════════════════════════════════════════════════════
  function cekUmariyyatain(aktif) {
    var pasangan = null;
    if (samaPersis(aktif, ['suami', 'ayah', 'ibu'])) pasangan = 'suami';
    else if (samaPersis(aktif, ['istri', 'ayah', 'ibu'])) pasangan = 'istri';
    else return null;

    var bagianPasangan = pasangan === 'suami' ? F(1, 2) : F(1, 4);
    var sisa = f.sub(f.ONE, bagianPasangan);
    var bagianIbu = f.mul(sisa, F(1, 3));
    var bagianAyah = f.sub(sisa, bagianIbu);

    var bagian = {};
    bagian[pasangan] = bagianPasangan;
    bagian.ibu = bagianIbu;
    bagian.ayah = bagianAyah;

    return {
      id: 'umariyyatain',
      nama: 'Kasus Umariyyatain',
      bagian: bagian,
      alasan: {
        suami: 'Suami mendapat 1/2 karena pewaris tidak meninggalkan anak.',
        istri: 'Istri mendapat 1/4 karena pewaris tidak meninggalkan anak.',
        ibu: 'Ibu mendapat 1/3 dari SISA setelah bagian ' + H.label(pasangan).toLowerCase() +
             ' diambil — bukan 1/3 dari seluruh harta.',
        ayah: 'Ayah mendapat sisanya, yaitu dua kali bagian ibu.'
      },
      penjelasan: 'Kalau ibu diberi 1/3 dari seluruh harta, bagiannya justru lebih besar ' +
        'daripada ayah. Padahal dalam sistem waris Islam, ketika kedudukan sama, ' +
        'laki-laki mendapat dua kali bagian perempuan. Umar bin Khattab memutuskan ibu ' +
        'mendapat 1/3 dari sisa, dan putusan ini diikuti jumhur ulama termasuk Imam Syafi\'i.',
      dalil: 'qs4-11'
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. Al-Akdariyyah
  //    Suami + ibu + kakek + satu saudara perempuan.
  //    Solusi Zaid bin Tsabit: saudara perempuan tetap diberi bagian tetapnya
  //    (sehingga terjadi 'aul), lalu bagiannya digabung dengan kakek dan
  //    dibagi 2:1.
  // ═══════════════════════════════════════════════════════════════════
  function cekAkdariyyah(aktif) {
    var sdr = null;
    if (samaPersis(aktif, ['suami', 'ibu', 'kakek', 'sdr_pr_kandung'])) sdr = 'sdr_pr_kandung';
    else if (samaPersis(aktif, ['suami', 'ibu', 'kakek', 'sdr_pr_sebapak'])) sdr = 'sdr_pr_sebapak';
    else return null;
    if (aktif[sdr] !== 1) return null;

    var bagian = {
      suami: F(9, 27),
      ibu: F(6, 27),
      kakek: F(8, 27)
    };
    bagian[sdr] = F(4, 27);

    var alasan = {
      suami: 'Suami mendapat 1/2, lalu ikut menyusut karena terjadi \'aul.',
      ibu: 'Ibu mendapat 1/3, lalu ikut menyusut karena terjadi \'aul.',
      kakek: 'Kakek mendapat 1/6, lalu bagiannya digabung dengan saudara perempuan dan dibagi 2:1.'
    };
    alasan[sdr] = 'Saudara perempuan tetap diberi bagian tetap 1/2, lalu digabung dengan kakek dan dibagi 2:1.';

    return {
      id: 'akdariyyah',
      nama: 'Kasus Al-Akdariyyah',
      bagian: bagian,
      alasan: alasan,
      penjelasan: 'Ini kombinasi paling rumit dalam faraid. Kalau aturan biasa dipakai, ' +
        'saudara perempuan tidak kebagian sama sekali. Zaid bin Tsabit memutuskan: ' +
        'saudara perempuan tetap diberi 1/2, penyebutnya dinaikkan dari 6 ke 9 (\'aul), ' +
        'lalu bagian kakek dan saudara perempuan digabung dan dibagi 2:1 — sehingga ' +
        'penyebut akhirnya menjadi 27. Pendapat ini diikuti mazhab Syafi\'i.',
      dalil: 'atsar-zaid',
      khilafiyah: 'Ulama berbeda pendapat dalam kasus ini. Angka di atas mengikuti ' +
        'putusan Zaid bin Tsabit yang dipakai mazhab Syafi\'i dan Maliki.'
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. Musyarakah (Himariyyah / Musytarakah)
  //    Suami + ibu/nenek + dua saudara seibu atau lebih + saudara kandung.
  //    Bagian tetap habis persis 1/1, saudara kandung tidak kebagian apa-apa.
  //    Imam Syafi'i: saudara kandung ikut berbagi 1/3 bersama saudara seibu,
  //    karena mereka sama-sama satu ibu dengan pewaris.
  // ═══════════════════════════════════════════════════════════════════
  function cekMusyarakah(aktif) {
    function n(k) { return aktif[k] || 0; }
    var seibu = n('sdr_lk_seibu') + n('sdr_pr_seibu');
    var punyaIbuAtauNenek = n('ibu') > 0 || n('nenek_ayah') > 0 || n('nenek_ibu') > 0;

    if (!(n('suami') === 1 && punyaIbuAtauNenek && seibu >= 2 && n('sdr_lk_kandung') >= 1)) {
      return null;
    }
    // pastikan tidak ada ahli waris lain yang mengubah gambar
    var diizinkan = ['suami', 'ibu', 'nenek_ayah', 'nenek_ibu',
      'sdr_lk_seibu', 'sdr_pr_seibu', 'sdr_lk_kandung', 'sdr_pr_kandung'];
    var adaLain = kunciAktif(aktif).some(function (k) { return diizinkan.indexOf(k) === -1; });
    if (adaLain) return null;

    var bagian = { suami: F(1, 2) };
    var alasan = {
      suami: 'Suami mendapat 1/2 karena pewaris tidak meninggalkan anak atau cucu.'
    };

    var nenekAktif = ['nenek_ayah', 'nenek_ibu'].filter(function (k) { return n(k) > 0; });
    if (n('ibu') > 0) {
      bagian.ibu = F(1, 6);
      alasan.ibu = 'Ibu mendapat 1/6 karena pewaris punya lebih dari satu saudara.';
    } else {
      nenekAktif.forEach(function (k) {
        bagian[k] = F(1, 6 * nenekAktif.length);
        alasan[k] = 'Nenek mendapat 1/6 menggantikan posisi ibu.';
      });
    }

    // 1/3 dibagi rata per kepala: saudara seibu + saudara kandung, laki-laki
    // dan perempuan sama besar
    var pesertaKey = ['sdr_lk_seibu', 'sdr_pr_seibu', 'sdr_lk_kandung', 'sdr_pr_kandung']
      .filter(function (k) { return n(k) > 0; });
    var totalKepala = pesertaKey.reduce(function (t, k) { return t + n(k); }, 0);

    pesertaKey.forEach(function (k) {
      bagian[k] = f.mul(F(1, 3), F(n(k), totalKepala));
      alasan[k] = 'Ikut berbagi 1/3 bersama saudara seibu, dibagi rata per kepala ' +
        '(' + totalKepala + ' orang), laki-laki dan perempuan sama besar.';
    });

    return {
      id: 'musyarakah',
      nama: 'Kasus Musyarakah',
      bagian: bagian,
      alasan: alasan,
      penjelasan: 'Setelah suami (1/2), ibu (1/6), dan saudara seibu (1/3), harta sudah ' +
        'habis persis. Saudara kandung yang seharusnya menerima sisa jadi tidak kebagian ' +
        'apa-apa. Umar bin Khattab memutuskan mereka ikut berbagi 1/3 bersama saudara ' +
        'seibu, dengan alasan mereka sama-sama satu ibu dengan pewaris. Ini pendapat ' +
        'mazhab Syafi\'i dan Maliki.',
      dalil: 'atsar-umar-musyarakah',
      khilafiyah: 'Mazhab Hanafi dan Hanbali berpendapat lain: saudara kandung tidak ' +
        'kebagian sama sekali dalam kasus ini. Angka di atas mengikuti mazhab Syafi\'i.'
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. Kakek bersama saudara
  //    Mazhab Syafi'i mengikuti Zaid bin Tsabit: kakek TIDAK menggugurkan
  //    saudara kandung/seayah. Kakek mengambil yang paling menguntungkan dari
  //    tiga pilihan: muqasamah (berbagi seperti saudara), 1/3 sisa, atau 1/6
  //    harta.
  // ═══════════════════════════════════════════════════════════════════
  function kakekBersamaSaudara(aktif, sisa) {
    function n(k) { return aktif[k] || 0; }

    var sdrKeys = ['sdr_lk_kandung', 'sdr_pr_kandung', 'sdr_lk_sebapak', 'sdr_pr_sebapak']
      .filter(function (k) { return n(k) > 0; });
    if (!n('kakek') || !sdrKeys.length) return null;

    // Muqasamah: kakek dihitung sebagai satu saudara laki-laki (2 bagian),
    // saudara laki-laki 2 bagian, saudara perempuan 1 bagian.
    var unitSaudara = sdrKeys.reduce(function (t, k) {
      return t + n(k) * (H.BY_KEY[k].gender === 'L' ? 2 : 1);
    }, 0);
    var unitTotal = 2 + unitSaudara;

    var opsiMuqasamah = f.mul(sisa, F(2, unitTotal));
    var opsiSepertigaSisa = f.mul(sisa, F(1, 3));
    var opsiSeperenamHarta = F(1, 6);

    var pilihan = [
      { nama: 'muqasamah', nilai: opsiMuqasamah,
        teks: 'berbagi sisa seperti seorang saudara laki-laki' },
      { nama: 'sepertiga_sisa', nilai: opsiSepertigaSisa,
        teks: '1/3 dari sisa harta' },
      { nama: 'seperenam_harta', nilai: opsiSeperenamHarta,
        teks: '1/6 dari seluruh harta' }
    ];

    var terbaik = pilihan[0];
    pilihan.forEach(function (p) { if (f.gt(p.nilai, terbaik.nilai)) terbaik = p; });

    // tidak boleh melebihi sisa yang tersedia
    var bagianKakek = f.gt(terbaik.nilai, sisa) ? sisa : terbaik.nilai;
    var sisaSaudara = f.sub(sisa, bagianKakek);

    var bagian = { kakek: bagianKakek };
    if (!f.isZero(sisaSaudara) && unitSaudara > 0) {
      sdrKeys.forEach(function (k) {
        var unit = n(k) * (H.BY_KEY[k].gender === 'L' ? 2 : 1);
        bagian[k] = f.mul(sisaSaudara, F(unit, unitSaudara));
      });
    } else {
      sdrKeys.forEach(function (k) { bagian[k] = f.ZERO; });
    }

    var adaKandung = n('sdr_lk_kandung') + n('sdr_pr_kandung') > 0;
    var adaSebapak = n('sdr_lk_sebapak') + n('sdr_pr_sebapak') > 0;

    return {
      id: 'kakek_saudara',
      nama: 'Kakek bersama saudara',
      bagian: bagian,
      metode: terbaik.nama,
      alasanKakek: 'Kakek mengambil pilihan yang paling menguntungkan baginya, yaitu ' +
        terbaik.teks + '.',
      alasanSaudara: 'Saudara berbagi sisa setelah bagian kakek, dengan perbandingan ' +
        '2 : 1 antara laki-laki dan perempuan.',
      penjelasan: 'Dalam mazhab Syafi\'i, kakek tidak menggugurkan saudara kandung maupun ' +
        'saudara seayah — keduanya sama-sama terhubung ke pewaris lewat ayah. Kakek ' +
        'diberi hak memilih yang terbaik dari tiga kemungkinan: berbagi seperti saudara ' +
        '(muqasamah), 1/3 dari sisa, atau 1/6 dari seluruh harta. Di sini yang terbaik ' +
        'adalah ' + terbaik.teks + '.',
      dalil: 'atsar-zaid',
      khilafiyah: 'Mazhab Hanafi berpendapat kakek menggugurkan seluruh saudara, sehingga ' +
        'saudara tidak kebagian apa pun. Angka di atas mengikuti Zaid bin Tsabit yang ' +
        'dipakai mazhab Syafi\'i.',
      perluKonsultasi: adaKandung && adaSebapak
        ? 'Di sini kakek berkumpul dengan saudara kandung DAN saudara seayah sekaligus. ' +
          'Dalam kitab faraid ada aturan tambahan (mu\'addah) untuk kombinasi ini yang ' +
          'belum diterapkan kalkulator ini. Mohon konsultasikan hasilnya ke ustadz atau ' +
          'Pengadilan Agama sebelum dipakai.'
        : null
    };
  }

  root.Special = {
    cekUmariyyatain: cekUmariyyatain,
    cekAkdariyyah: cekAkdariyyah,
    cekMusyarakah: cekMusyarakah,
    kakekBersamaSaudara: kakekBersamaSaudara
  };
})(typeof window !== 'undefined' ? window : globalThis);
