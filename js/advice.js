/*
 * Langkah selanjutnya.
 *
 * Tahu angkanya baru setengah jalan. Bagian ini menerjemahkan hasil hitungan
 * menjadi daftar periksa: apa yang harus dilakukan, urutannya, dan ke mana
 * harus pergi. Setiap butir dibuat sekonkret mungkin — dokumen apa yang
 * dibawa, ke kantor mana, kira-kira berapa biayanya.
 *
 * ─────────────────────────────────────────────────────────────────────
 * CATATAN UNTUK PEMILIK SITUS
 * Tautan di bawah mengarah ke situs resmi lembaga terkait, tapi alamat dan
 * prosedurnya bisa berubah sewaktu-waktu, dan syarat administrasi sering
 * berbeda antar daerah. Periksa ulang sebelum situs dipublikasikan, dan
 * jadwalkan pemeriksaan berkala.
 * ─────────────────────────────────────────────────────────────────────
 */

(function (root) {
  'use strict';

  /** Jenis harta untuk rincian opsional di form. */
  var JENIS_HARTA = [
    { id: 'rumah',     label: 'Rumah',            icon: 'i-rumah',    utuh: true },
    { id: 'tanah',     label: 'Tanah',            icon: 'i-tanah',    utuh: true },
    { id: 'kendaraan', label: 'Kendaraan',        icon: 'i-mobil',    utuh: true },
    { id: 'usaha',     label: 'Usaha',            icon: 'i-toko',     utuh: true },
    { id: 'tabungan',  label: 'Tabungan & tunai', icon: 'i-dompet',   utuh: false },
    { id: 'emas',      label: 'Emas & perhiasan', icon: 'i-emas',     utuh: false },
    { id: 'lainnya',   label: 'Lainnya',          icon: 'i-kotak',    utuh: false }
  ];

  // Tautan yang dipakai berulang kali
  var T = {
    dukcapil:  { label: 'Layanan Dukcapil Kemendagri', url: 'https://dukcapil.kemendagri.go.id' },
    badilag:   { label: 'Ditjen Badan Peradilan Agama (cari pengadilan terdekat)',
                 url: 'https://badilag.mahkamahagung.go.id' },
    ecourt:    { label: 'e-Court — daftar perkara secara online',
                 url: 'https://ecourt.mahkamahagung.go.id' },
    putusan:   { label: 'Direktori Putusan MA — contoh putusan waris',
                 url: 'https://putusan3.mahkamahagung.go.id' },
    bpn:       { label: 'Kementerian ATR/BPN — balik nama sertifikat',
                 url: 'https://www.atrbpn.go.id' },
    notaris:   { label: 'Ikatan Notaris Indonesia — cari notaris',
                 url: 'https://www.ini.id' },
    baznas:    { label: 'BAZNAS — menyalurkan bagian yang tidak terbagi',
                 url: 'https://baznas.go.id' }
  };

  /* Sumber hukum diambil dari registry di js/khi.js supaya tautannya tidak
     bercabang dua. Semuanya sudah dicocokkan ke basis data peraturan resmi. */
  function hukum(nama) {
    var s = root.KHI && root.KHI.SUMBER;
    return (s && s[nama]) || null;
  }
  function tautanHukum() {
    return Array.prototype.slice.call(arguments)
      .map(hukum).filter(Boolean);
  }

  /**
   * @param {Object} hasil  keluaran Faraid.hitung()
   * @returns {Array<{id, tingkat, judul, teks, poin, tautan}>}
   *          tingkat: 'wajib' | 'penting' | 'saran'
   */
  function langkah(hasil) {
    var out = [];
    var input = hasil.input || {};
    var kondisi = input.kondisi || {};
    var harta = input.harta || {};
    var rincian = harta.rincian || {};
    var adaPasangan = (input.ahliWaris || {}).suami > 0 || (input.ahliWaris || {}).istri > 0;

    // ── 1. Dokumen dasar ──────────────────────────────────────────
    out.push({
      id: 'dokumen',
      tingkat: 'wajib',
      judul: 'Urus dokumen dasarnya',
      teks: 'Tanpa dokumen ini, bank tidak akan mencairkan rekening dan BPN tidak akan ' +
        'memproses balik nama sertifikat. Urus sekaligus supaya tidak bolak-balik.',
      poin: [
        { teks: 'Akta kematian dari Dinas Dukcapil kabupaten/kota. Bawa surat keterangan ' +
          'kematian dari rumah sakit atau kelurahan, KK, dan KTP pelapor. Gratis.' },
        { teks: 'Kartu Keluarga yang sudah diperbarui — nama almarhum dikeluarkan dari KK.' },
        { teks: 'Surat Keterangan Ahli Waris. Untuk keluarga muslim biasanya cukup dibuat di ' +
          'kelurahan lalu dikuatkan camat. Kalau nilainya besar atau ada aset tanah, minta ' +
          'Penetapan Ahli Waris dari Pengadilan Agama — kekuatannya jauh lebih kuat.' },
        { teks: 'Fotokopi KTP dan KK seluruh ahli waris yang tercantum di hasil perhitungan ini.' },
        { teks: 'Buku nikah almarhum, kalau ada pasangan yang masih hidup.' }
      ],
      tautan: [T.dukcapil, T.badilag]
    });

    // ── 2. Inventarisasi ──────────────────────────────────────────
    out.push({
      id: 'inventaris',
      tingkat: 'wajib',
      judul: 'Catat semua harta dan hutang secara terbuka',
      teks: 'Lakukan bersama seluruh ahli waris, jangan sendirian. Sebagian besar sengketa ' +
        'waris berawal dari harta yang tidak pernah dicatat terbuka sejak awal — bukan dari ' +
        'salah hitung.',
      poin: [
        { teks: 'Kumpulkan bukti kepemilikan: sertifikat tanah/rumah, BPKB dan STNK, buku ' +
          'rekening, bilyet deposito, polis asuransi, sertifikat saham atau reksadana.' },
        { teks: 'Cek saldo rekening per tanggal wafat, bukan tanggal hari ini.' },
        { teks: 'Daftar hutang piutang lengkap dengan bukti dan nama pihaknya — termasuk ' +
          'hutang almarhum kepada keluarga sendiri.' },
        { teks: 'Cek kewajiban yang tertunda: zakat yang belum dibayar, nazar, atau biaya ' +
          'haji yang sudah didaftarkan.' },
        { teks: 'Foto atau pindai semuanya, bagikan ke seluruh ahli waris di grup keluarga. ' +
          'Keterbukaan di tahap ini mencegah banyak masalah nanti.' }
      ]
    });

    // ── 3. Hutang ─────────────────────────────────────────────────
    if (hasil.harta && hasil.harta.hutang > 0) {
      out.push({
        id: 'hutang',
        tingkat: 'wajib',
        judul: 'Lunasi hutang sebelum membagi apa pun',
        teks: 'Hutang sudah dipotong dalam hitungan di atas, tapi pastikan benar-benar ' +
          'dibayarkan lebih dulu sebelum harta dipindahtangankan. Selama hutang belum lunas, ' +
          'tanggungan almarhum belum selesai.',
        poin: [
          { teks: 'Bayar dari harta peninggalan, bukan dari kantong pribadi ahli waris.' },
          { teks: 'Minta bukti lunas tertulis dari setiap pihak pemberi hutang.' },
          { teks: 'Kalau ada hutang yang baru ketahuan belakangan, perhitungan ini harus ' +
            'diulang dari awal.' }
        ]
      });
    }

    if (hasil.harta && hasil.harta.hutangKurang > 0) {
      out.push({
        id: 'hutang_kurang',
        tingkat: 'wajib',
        judul: 'Hutang lebih besar dari harta',
        teks: 'Tidak ada warisan yang bisa dibagi. Ahli waris tidak wajib menomboki dari harta ' +
          'pribadi, tapi sangat dianjurkan membantu melunasi agar almarhum terbebas dari ' +
          'tanggungannya.',
        poin: [
          { teks: 'Bicarakan baik-baik dengan pihak pemberi hutang. Banyak yang bersedia ' +
            'membebaskan sisanya setelah tahu keadaannya.' },
          { teks: 'Kalau ada asuransi jiwa, cek apakah menanggung pelunasan hutang.' }
        ]
      });
    }

    // ── 4. Wasiat ─────────────────────────────────────────────────
    if (hasil.harta && hasil.harta.wasiat > 0) {
      out.push({
        id: 'wasiat',
        tingkat: 'penting',
        judul: 'Laksanakan wasiat sebelum pembagian',
        teks: 'Wasiat diserahkan kepada penerimanya lebih dulu, setelah hutang lunas.',
        poin: [
          { teks: 'Maksimal 1/3 dari harta setelah hutang dilunasi. Kelebihannya hanya sah ' +
            'kalau seluruh ahli waris merelakan secara tertulis.' },
          { teks: 'Tidak boleh ditujukan kepada orang yang sudah menjadi ahli waris — kecuali ' +
            'seluruh ahli waris lain menyetujui.' },
          { teks: 'Serahkan dengan tanda terima tertulis.' }
        ]
      });
    }

    // ── 5. Aset yang tidak bisa dipotong ──────────────────────────
    var asetUtuh = JENIS_HARTA.filter(function (j) {
      return j.utuh && (rincian[j.id] || 0) > 0;
    });
    if (asetUtuh.length) {
      var nama = asetUtuh.map(function (j) { return j.label.toLowerCase(); }).join(', ');
      out.push({
        id: 'aset_utuh',
        tingkat: 'penting',
        judul: 'Putuskan cara membagi ' + nama,
        teks: 'Angka di atas adalah nilai, bukan potongan fisik. Rumah dan tanah tidak bisa ' +
          'dibelah sesuai pecahan. Pilih satu jalan, lalu tuliskan kesepakatannya.',
        poin: [
          { teks: 'Dijual, lalu uangnya dibagi sesuai bagian masing-masing. Paling bersih dan ' +
            'paling sedikit menimbulkan perselisihan di kemudian hari.' },
          { teks: 'Satu ahli waris mengambil asetnya dan membayar tunai ke yang lain sebesar ' +
            'bagian mereka. Pakai jasa penilai (appraisal) supaya harganya disepakati bersama.' },
          { teks: 'Dimiliki bersama, dengan kesepakatan tertulis soal siapa yang menempati, ' +
            'bagaimana biaya perawatan dan pajaknya dibagi, dan apa yang terjadi kalau salah ' +
            'satu ingin menjual bagiannya.' }
        ],
        tautan: [T.bpn]
      });
    }

    // ── 6. Kesepakatan tertulis ───────────────────────────────────
    out.push({
      id: 'kesepakatan',
      tingkat: 'penting',
      judul: 'Tuangkan hasilnya dalam akta pembagian warisan',
      teks: 'Setelah seluruh ahli waris memahami dan menyetujui angkanya, buat akta di hadapan ' +
        'notaris atau PPAT, ditandatangani semua pihak. Inilah yang dibutuhkan untuk balik ' +
        'nama dan mencegah perkara terbuka lagi bertahun-tahun kemudian.',
      poin: [
        { teks: 'Bawa: akta kematian, KK, surat keterangan ahli waris, KTP semua ahli waris, ' +
          'dan bukti kepemilikan aset.' },
        { teks: 'Semua ahli waris hadir dan menandatangani. Yang tidak bisa hadir membuat ' +
          'surat kuasa bermeterai.' },
        { teks: 'Ahli waris yang masih di bawah umur diwakili wali, dan untuk aset besar ' +
          'sebaiknya lewat penetapan pengadilan.' },
        { teks: 'Biaya notaris umumnya dihitung dari nilai harta — tanyakan di depan, dan ' +
          'bandingkan beberapa notaris.' }
      ],
      tautan: [T.notaris]
    });

    // ── 7. Balik nama ─────────────────────────────────────────────
    out.push({
      id: 'balik_nama',
      tingkat: 'penting',
      judul: 'Balik nama aset ke ahli waris',
      teks: 'Selama masih atas nama almarhum, aset tidak bisa dijual atau dijaminkan, dan ' +
        'urusannya makin sulit setiap kali ada ahli waris yang ikut wafat.',
      poin: [
        { teks: 'Tanah dan rumah: ajukan peralihan hak karena pewarisan ke Kantor Pertanahan ' +
          '(BPN) setempat. Ada batas waktu 6 bulan sejak tanggal wafat untuk bebas dari ' +
          'sebagian biaya — cek ketentuan terbarunya.' },
        { teks: 'Rekening bank: bawa akta kematian, surat keterangan ahli waris, dan KTP ' +
          'seluruh ahli waris ke bank tempat rekening dibuka.' },
        { teks: 'Kendaraan: balik nama BPKB/STNK di Samsat.' },
        { teks: 'Warisan bukan objek pajak penghasilan, tapi peralihan hak atas tanah tetap ' +
          'punya komponen biaya sendiri. Tanyakan ke BPN atau notaris.' }
      ],
      tautan: [T.bpn]
    });

    // ── 8. Perdamaian / tanazul ───────────────────────────────────
    out.push({
      id: 'tanazul',
      tingkat: 'saran',
      judul: 'Boleh berdamai, asalkan setelah tahu haknya',
      teks: 'Ahli waris yang sudah dewasa dan sadar boleh merelakan sebagian atau seluruh ' +
        'bagiannya untuk yang lain — misalnya untuk ibu yang sudah sepuh atau saudara yang ' +
        'sedang kesulitan. Ini sah dan sering menjadi jalan terbaik.',
      poin: [
        { teks: 'Syaratnya satu: kerelaan diberikan SETELAH ia tahu persis berapa haknya, ' +
          'bukan sebelumnya. Hitungan di halaman ini justru untuk itu.' },
        { teks: 'Tuangkan dalam akta perdamaian di notaris, jangan cukup lisan.' },
        { teks: 'Secara hukum ini adalah hibah dari ahli waris tersebut, bukan pengubahan ' +
          'bagian waris — jadi tetap catat angka aslinya di akta.' }
      ]
    });

    // ── 9. Kapan harus ke Pengadilan Agama ────────────────────────
    var alasanPA = [];
    if (kondisi.istriHamil) alasanPA.push('ada anak yang masih dalam kandungan');
    if (kondisi.anakAngkat) alasanPA.push('ada anak angkat yang perlu ditetapkan wasiat wajibahnya');
    if (kondisi.bedaAgama) alasanPA.push('ada anggota keluarga yang berbeda agama');
    if (kondisi.pembunuh) alasanPA.push('ada dugaan keterlibatan dalam kematian pewaris');
    if (kondisi.cucuDariAnakWafat) alasanPA.push('ada cucu dari anak yang wafat lebih dulu');
    if (kondisi.adaSengketa) alasanPA.push('ahli waris belum sepakat');
    if ((hasil.peringatan || []).some(function (p) { return p.id === 'muaddah'; })) {
      alasanPA.push('susunan ahli warisnya termasuk kasus rumit dalam faraid');
    }

    if (alasanPA.length) {
      out.push({
        id: 'pengadilan',
        tingkat: 'penting',
        judul: 'Bawa perkara ini ke Pengadilan Agama',
        teks: 'Karena ' + alasanPA.join(', ') + '. Putusan pengadilan mengikat, sehingga ' +
          'perkaranya benar-benar selesai dan tidak bisa diungkit lagi.',
        poin: [
          { teks: 'Kalau semua ahli waris sepakat dan hanya butuh kepastian: ajukan ' +
            'Permohonan Penetapan Ahli Waris (voluntair). Prosesnya relatif singkat.' },
          { teks: 'Kalau ada yang berselisih: ajukan Gugatan Waris (contentius).' },
          { teks: 'Daftarkan di Pengadilan Agama tempat almarhum terakhir berdomisili. ' +
            'Bisa juga mendaftar online lewat e-Court.' },
          { teks: 'Tidak mampu membayar biaya perkara? Ajukan pembebasan biaya (prodeo), dan ' +
            'manfaatkan Posbakum — pos bantuan hukum gratis yang ada di gedung pengadilan.' },
          { teks: 'Bawa hasil perhitungan ini sebagai bahan awal, bukan sebagai keputusan akhir.' }
        ],
        tautan: [T.badilag, T.ecourt, T.putusan]
      });
    } else {
      out.push({
        id: 'konsultasi',
        tingkat: 'saran',
        judul: 'Konsultasikan sekali ke ustadz atau Pengadilan Agama',
        teks: 'Hitungan ini mengikuti aturan baku, tapi kondisi tiap keluarga bisa punya ' +
          'detail yang tidak tertangkap oleh form sederhana.',
        poin: [
          { teks: 'Hal yang sering luput: hibah yang sudah diberikan semasa hidup, status ' +
            'harta bawaan sebelum menikah, dan ahli waris yang belum diketahui keberadaannya.' },
          { teks: 'Banyak Pengadilan Agama menyediakan layanan konsultasi gratis lewat Posbakum.' },
          { teks: 'Kalau semua sudah jelas dan sepakat, kamu bisa langsung ke notaris tanpa ' +
            'perlu ke pengadilan.' }
        ],
        tautan: [T.badilag]
      });
    }

    // ── 10. Harta bersama ─────────────────────────────────────────
    // Pemisahan harta bersama BUKAN bagian dari faraid. Ia menentukan siapa
    // pemilik hartanya lebih dulu; warisan baru berjalan atas bagian pewaris.
    // Karena itu langkahnya selalu disertai penegasan dan sumber hukumnya.
    var CATATAN_HARTA_BERSAMA =
      'Perlu ditegaskan: pemisahan harta bersama BUKAN aturan faraid dan tidak ' +
      'berasal dari Al-Qur\'an maupun hadits waris. Kitab faraid klasik tidak ' +
      'mengenal istilah ini — harta suami tetap milik suami, harta istri tetap ' +
      'milik istri. Yang berlaku di Indonesia adalah penetapan KEPEMILIKAN lebih ' +
      'dulu menurut hukum negara, baru sisanya dibagi menurut syariat. Dasar ' +
      'fiqihnya disandarkan pada syirkah (perkongsian) dan \'urf, dengan sandaran ' +
      'QS An-Nisa ayat 32. Angka 50:50 adalah patokan umum, bukan harga mati: ' +
      'Pengadilan Agama dapat memutus proporsi lain bila kontribusi kedua pihak ' +
      'terbukti timpang. Untuk kasus nyata, tanyakan ke ustadz dan ke Pengadilan ' +
      'Agama — jangan bersandar pada halaman ini saja.';

    var SUMBER_HARTA_BERSAMA = [
      { teks: '<strong>UU Perkawinan No. 1/1974 Pasal 35 ayat (1):</strong> harta yang ' +
        'diperoleh selama perkawinan menjadi harta bersama. Ayat (2): harta bawaan, ' +
        'serta warisan dan hadiah yang diterima masing-masing, TIDAK termasuk. ' +
        'Pasal ini tidak diubah oleh UU No. 16/2019.' },
      { teks: '<strong>KHI Pasal 96 ayat (1):</strong> "Apabila terjadi cerai mati, maka ' +
        'separoh harta bersama menjadi hak pasangan yang hidup lebih lama."' },
      { teks: '<strong>UU No. 3/2006 Pasal 49:</strong> perkara perkawinan dan waris bagi ' +
        'orang beragama Islam menjadi kewenangan Pengadilan Agama — inilah yang membuat ' +
        'aturan di atas relevan bagi keluarga muslim.' }
    ];

    if (adaPasangan && !harta.hartaBersama) {
      out.push({
        id: 'cek_harta_bersama',
        tingkat: 'penting',
        judul: 'Pastikan dulu status harta bersamanya',
        teks: 'Kamu tidak menandai harta ini sebagai harta bersama, jadi seluruhnya dihitung ' +
          'sebagai milik almarhum. Ini perlu dicek ulang karena pengaruhnya besar. ' +
          CATATAN_HARTA_BERSAMA,
        poin: [
          { teks: 'Harta yang diperoleh selama pernikahan umumnya berstatus harta bersama. ' +
            'Separuhnya milik pasangan yang masih hidup — bukan warisan.' },
          { teks: 'Harta bawaan sebelum menikah, warisan, dan hadiah pribadi tetap milik ' +
            'masing-masing.' },
          { teks: 'Kalau ternyata harta bersama, kembali ke form dan aktifkan pilihan itu — ' +
            'hasilnya akan berubah cukup jauh.' }
        ].concat(SUMBER_HARTA_BERSAMA),
        tautan: tautanHukum('uuKawin35', 'khi', 'peradilanAgama').concat([T.badilag])
      });
    }

    if (adaPasangan && harta.hartaBersama) {
      out.push({
        id: 'pisah_harta_bersama',
        tingkat: 'wajib',
        judul: 'Pisahkan dulu harta bersama, sebelum warisan dibagi',
        teks: 'Separuh harta bersama sudah dikeluarkan dari hitungan karena ia milik pasangan ' +
          'yang masih hidup sejak semula, bukan warisan. Pemisahan itu perlu disepakati ' +
          'tertulis dan sebaiknya dikuatkan lewat penetapan pengadilan supaya tidak jadi ' +
          'sengketa. ' + CATATAN_HARTA_BERSAMA,
        poin: [
          { teks: 'Daftarkan mana yang harta bersama dan mana harta bawaan. Cek tanggal ' +
            'perolehannya lewat sertifikat, BPKB, atau rekening — bukan dari ingatan.' },
          { teks: 'Kalau ada perjanjian perkawinan (pranikah/pascanikah), isinya yang berlaku, ' +
            'bukan patokan 50:50.' },
          { teks: 'Tuangkan hasil pemisahan dalam kesepakatan tertulis yang ditandatangani ' +
            'seluruh ahli waris, di hadapan notaris kalau nilainya besar.' },
          { teks: 'Untuk aset bersertifikat, pemisahan ini harus tercermin di dokumen ' +
            'kepemilikannya — kalau tidak, masalahnya muncul saat balik nama.' }
        ].concat(SUMBER_HARTA_BERSAMA),
        tautan: tautanHukum('uuKawin35', 'khi', 'peradilanAgama')
          .concat([T.badilag, T.notaris])
      });
    }

    // ── 11. Sisa yang tidak terbagi ───────────────────────────────
    if (hasil.sisaTidakTerbagi) {
      out.push({
        id: 'sisa',
        tingkat: 'saran',
        judul: 'Putuskan ke mana sisa harta disalurkan',
        teks: 'Ada bagian harta yang tidak ada ahli warisnya. Secara fiqh klasik diserahkan ke ' +
          'baitul mal; di Indonesia ada beberapa jalan yang lazim ditempuh.',
        poin: [
          { teks: 'Pengadilan Agama umumnya menyerahkannya kepada pasangan yang masih hidup.' },
          { teks: 'Alternatif lain: disalurkan sebagai wakaf atau ke lembaga amil zakat resmi.' }
        ],
        tautan: [T.baznas]
      });
    }

    return out;
  }

  root.Advice = { JENIS_HARTA: JENIS_HARTA, langkah: langkah, TAUTAN: T };
})(typeof window !== 'undefined' ? window : globalThis);
