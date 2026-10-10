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
    { id: 'rumah',     label: 'Rumah',            icon: 'i-home',    utuh: true },
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
    ecourt:    { label: 'e-Court — daftar perkara online',
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
   * @returns {Array<{id, tingkat, judul, teks, poin, tautan, hukumIndonesia}>}
   *   hukumIndonesia menandai langkah yang bersumber dari aturan negara, bukan
   *   dari dalil — halaman hasil menyembunyikannya di mode syariat murni.
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
      judul: 'Urus dokumen dasar',
      teks: 'Tanpa dokumen ini, bank tidak mencairkan rekening dan BPN tidak memproses ' +
        'balik nama. Urus sekaligus agar tidak bolak-balik.',
      poin: [
        { teks: 'Akta kematian dari Dinas Dukcapil. Bawa surat kematian dari rumah sakit ' +
          'atau kelurahan, KK, dan KTP pelapor. Gratis.' },
        { teks: 'Kartu Keluarga baru. Nama almarhum dikeluarkan dari KK.' },
        { teks: 'Surat Keterangan Ahli Waris. Biasanya cukup dari kelurahan, dikuatkan ' +
          'camat. Jika nilainya besar atau ada tanah, minta Penetapan Ahli Waris dari ' +
          'Pengadilan Agama. Kekuatannya jauh lebih kuat.' },
        { teks: 'Fotokopi KTP dan KK semua ahli waris di hasil ini.' },
        { teks: 'Buku nikah almarhum, jika ada pasangan yang masih hidup.' }
      ],
      tautan: [T.dukcapil, T.badilag]
    });

    // ── 2. Inventarisasi ──────────────────────────────────────────
    out.push({
      id: 'inventaris',
      tingkat: 'wajib',
      judul: 'Catat semua harta dan hutang secara terbuka',
      teks: 'Lakukan bersama semua ahli waris. Jangan sendirian. Sengketa waris biasanya ' +
        'berawal dari harta yang tidak dicatat terbuka, bukan dari salah hitung.',
      poin: [
        { teks: 'Kumpulkan bukti kepemilikan: sertifikat, BPKB dan STNK, buku rekening, ' +
          'deposito, polis asuransi, saham atau reksadana.' },
        { teks: 'Cek saldo rekening pada tanggal wafat, bukan hari ini.' },
        { teks: 'Daftar hutang dan piutang, lengkap dengan bukti dan nama pihaknya. ' +
          'Termasuk hutang almarhum ke keluarga sendiri.' },
        { teks: 'Cek kewajiban tertunda: zakat, nazar, atau biaya haji yang sudah ' +
          'didaftarkan.' },
        { teks: 'Foto semua dokumen. Bagikan ke semua ahli waris. Keterbukaan mencegah ' +
          'masalah nanti.' }
      ]
    });

    // ── 3. Hutang ─────────────────────────────────────────────────
    if (hasil.harta && hasil.harta.hutang > 0) {
      out.push({
        id: 'hutang',
        tingkat: 'wajib',
        judul: 'Lunasi hutang sebelum membagi',
        teks: 'Hutang sudah dipotong dari hitungan di atas. Pastikan benar-benar dibayar ' +
          'sebelum harta dipindahkan. Selama hutang belum lunas, tanggungan almarhum belum ' +
          'selesai.',
        poin: [
          { teks: 'Bayar dari harta peninggalan, bukan dari uang pribadi ahli waris.' },
          { teks: 'Minta bukti lunas tertulis dari pemberi hutang.' },
          { teks: 'Jika ada hutang baru ketahuan, hitung ulang dari awal.' }
        ]
      });
    }

    if (hasil.harta && hasil.harta.hutangKurang > 0) {
      out.push({
        id: 'hutang_kurang',
        tingkat: 'wajib',
        judul: 'Hutang lebih besar dari harta',
        teks: 'Tidak ada warisan yang bisa dibagi. Ahli waris tidak wajib menutup dari ' +
          'uang pribadi. Tapi sangat dianjurkan membantu melunasi agar almarhum terbebas ' +
          'dari tanggungan.',
        poin: [
          { teks: 'Bicarakan baik-baik dengan pemberi hutang. Banyak yang mau membebaskan ' +
            'sisanya.' },
          { teks: 'Jika ada asuransi jiwa, cek apakah menanggung pelunasan hutang.' }
        ]
      });
    }

    // ── 4. Wasiat ─────────────────────────────────────────────────
    if (hasil.harta && hasil.harta.wasiat > 0) {
      out.push({
        id: 'wasiat',
        tingkat: 'penting',
        judul: 'Laksanakan wasiat sebelum pembagian',
        teks: 'Serahkan wasiat ke penerimanya lebih dulu, setelah hutang lunas.',
        poin: [
          { teks: 'Maksimal 1/3 dari harta setelah hutang lunas. Kelebihannya sah hanya ' +
            'jika semua ahli waris rela secara tertulis.' },
          { teks: 'Tidak boleh untuk ahli waris, kecuali semua ahli waris lain setuju.' },
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
        teks: 'Angka di atas adalah nilai, bukan potongan fisik. Rumah dan tanah tidak ' +
          'bisa dibelah. Pilih satu cara, lalu tulis kesepakatannya.',
        poin: [
          { teks: 'Dijual, lalu uangnya dibagi sesuai bagian. Paling bersih dan paling ' +
            'kecil risiko sengketa.' },
          { teks: 'Satu ahli waris mengambil aset dan membayar tunai bagian yang lain. ' +
            'Pakai penilai (appraisal) agar harga disepakati bersama.' },
          { teks: 'Dimiliki bersama, dengan kesepakatan tertulis: siapa yang menempati, ' +
            'bagaimana biaya perawatan dan pajak dibagi, dan apa yang terjadi jika ada ' +
            'yang ingin menjual bagiannya.' }
        ],
        tautan: [T.bpn]
      });
    }

    // ── 6. Kesepakatan tertulis ───────────────────────────────────
    out.push({
      id: 'kesepakatan',
      tingkat: 'penting',
      judul: 'Tuangkan hasilnya dalam akta pembagian warisan',
      teks: 'Setelah semua ahli waris paham dan setuju, buat akta di depan notaris atau ' +
        'PPAT. Semua pihak menandatangani. Akta ini diperlukan untuk balik nama dan ' +
        'mencegah sengketa bertahun-tahun kemudian.',
      poin: [
        { teks: 'Bawa: akta kematian, KK, surat keterangan ahli waris, KTP semua ahli waris, ' +
          'dan bukti kepemilikan aset.' },
        { teks: 'Semua ahli waris hadir dan menandatangani. Yang tidak bisa hadir membuat ' +
          'surat kuasa bermeterai.' },
        { teks: 'Ahli waris di bawah umur diwakili wali. Untuk aset besar, sebaiknya lewat ' +
          'penetapan pengadilan.' },
        { teks: 'Biaya notaris biasanya dihitung dari nilai harta. Tanyakan di depan. ' +
          'Bandingkan beberapa notaris.' }
      ],
      tautan: [T.notaris]
    });

    // ── 7. Balik nama ─────────────────────────────────────────────
    out.push({
      id: 'balik_nama',
      tingkat: 'penting',
      judul: 'Balik nama aset ke ahli waris',
      teks: 'Selama masih atas nama almarhum, aset tidak bisa dijual atau dijaminkan. ' +
        'Urusan makin sulit jika ada ahli waris yang ikut wafat.',
      poin: [
        { teks: 'Tanah dan rumah: ajukan peralihan hak karena pewarisan ke Kantor ' +
          'Pertanahan (BPN). Ada batas 6 bulan sejak wafat untuk bebas sebagian biaya. Cek ' +
          'ketentuan terbaru.' },
        { teks: 'Rekening bank: bawa akta kematian, surat keterangan ahli waris, dan KTP ' +
          'semua ahli waris ke bank.' },
        { teks: 'Kendaraan: balik nama BPKB/STNK di Samsat.' },
        { teks: 'Warisan bukan objek pajak penghasilan. Tapi peralihan hak atas tanah ' +
          'punya biaya sendiri. Tanyakan ke BPN atau notaris.' }
      ],
      tautan: [T.bpn]
    });

    // ── 8. Perdamaian / tanazul ───────────────────────────────────
    out.push({
      id: 'tanazul',
      tingkat: 'saran',
      judul: 'Boleh berdamai, setelah tahu haknya',
      teks: 'Ahli waris dewasa boleh merelakan sebagian atau seluruh bagiannya untuk yang ' +
        'lain, misalnya untuk ibu yang sudah sepuh atau saudara yang kesulitan. Ini sah ' +
        'dan sering jadi jalan terbaik.',
      poin: [
        { teks: 'Syaratnya: rela SETELAH tahu persis berapa haknya. Hitungan di halaman ' +
          'ini untuk itu.' },
        { teks: 'Tuangkan dalam akta perdamaian di notaris. Jangan cukup lisan.' },
        { teks: 'Secara hukum ini hibah dari ahli waris itu, bukan perubahan bagian waris. ' +
          'Catat angka aslinya di akta.' }
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
        teks: 'Karena ' + alasanPA.join(', ') + '. Putusan pengadilan mengikat, jadi ' +
          'perkara selesai dan tidak bisa diungkit lagi.',
        poin: [
          { teks: 'Jika semua ahli waris sepakat dan hanya butuh kepastian: ajukan ' +
            'Permohonan Penetapan Ahli Waris (voluntair). Prosesnya relatif singkat.' },
          { teks: 'Jika ada yang berselisih: ajukan Gugatan Waris (contentius).' },
          { teks: 'Daftar di Pengadilan Agama tempat almarhum terakhir tinggal. Bisa juga ' +
            'online lewat e-Court.' },
          { teks: 'Tidak mampu membayar biaya perkara? Ajukan pembebasan biaya (prodeo). ' +
            'Manfaatkan Posbakum, pos bantuan hukum gratis di gedung pengadilan.' },
          { teks: 'Bawa hasil ini sebagai bahan awal, bukan keputusan akhir.' }
        ],
        tautan: [T.badilag, T.ecourt, T.putusan]
      });
    } else {
      out.push({
        id: 'konsultasi',
        tingkat: 'saran',
        judul: 'Tanyakan sekali ke ustadz atau Pengadilan Agama',
        teks: 'Hitungan ini mengikuti aturan baku. Tapi tiap keluarga punya detail yang ' +
          'tidak tertangkap form sederhana.',
        poin: [
          { teks: 'Yang sering terlewat: hibah semasa hidup, status harta bawaan sebelum ' +
            'menikah, dan ahli waris yang belum diketahui.' },
          { teks: 'Banyak Pengadilan Agama menyediakan konsultasi gratis lewat Posbakum.' },
          { teks: 'Jika semua sudah jelas dan sepakat, kamu bisa langsung ke notaris tanpa ' +
            'ke pengadilan.' }
        ],
        tautan: [T.badilag]
      });
    }

    // ── 10. Harta bersama ─────────────────────────────────────────
    // Pemisahan harta bersama BUKAN bagian dari faraid. Ia menentukan siapa
    // pemilik hartanya lebih dulu; warisan baru berjalan atas bagian pewaris.
    // Karena itu langkahnya selalu disertai penegasan dan sumber hukumnya.
    var CATATAN_HARTA_BERSAMA =
      'Pemisahan harta bersama bukan aturan faraid dan bukan dari Al-Qur\'an atau hadits ' +
      'waris. Ini hukum negara: KEPEMILIKAN ditetapkan lebih dulu, sisanya dibagi menurut ' +
      'syariat. Angka 50:50 adalah patokan umum. Pengadilan Agama dapat memutus proporsi ' +
      'lain jika kontribusi kedua pihak timpang. Tanyakan ke ustadz dan Pengadilan Agama.';

    var SUMBER_HARTA_BERSAMA = [
      { teks: '<strong>UU Perkawinan No. 1/1974 Pasal 35 ayat (1):</strong> harta yang ' +
        'diperoleh selama perkawinan menjadi harta bersama. Ayat (2): harta bawaan, ' +
        'serta warisan dan hadiah yang diterima masing-masing, TIDAK termasuk. ' +
        'Pasal ini tidak diubah oleh UU No. 16/2019.' },
      { teks: '<strong>KHI Pasal 96 ayat (1):</strong> "Apabila terjadi cerai mati, maka ' +
        'separoh harta bersama menjadi hak pasangan yang hidup lebih lama."' },
      { teks: '<strong>UU No. 3/2006 Pasal 49:</strong> perkara perkawinan dan waris bagi ' +
        'orang beragama Islam menjadi kewenangan Pengadilan Agama. Karena itu aturan di ' +
        'atas relevan bagi keluarga muslim.' }
    ];

    if (adaPasangan && !harta.hartaBersama) {
      out.push({
        id: 'cek_harta_bersama',
        tingkat: 'penting',
        hukumIndonesia: true,
        judul: 'Pastikan status harta bersama',
        teks: 'Kamu tidak menandai harta ini sebagai harta bersama, jadi seluruhnya ' +
          'dihitung milik almarhum. Cek ulang, karena pengaruhnya besar. ' +
          CATATAN_HARTA_BERSAMA,
        poin: [
          { teks: 'Harta yang diperoleh selama menikah umumnya harta bersama. Separuhnya ' +
            'milik pasangan yang masih hidup, bukan warisan.' },
          { teks: 'Harta bawaan sebelum menikah, warisan, dan hadiah pribadi tetap milik ' +
            'masing-masing.' },
          { teks: 'Jika ternyata harta bersama, kembali ke form dan aktifkan pilihan itu. ' +
            'Hasilnya akan berubah cukup jauh.' }
        ].concat(SUMBER_HARTA_BERSAMA),
        tautan: tautanHukum('uuKawin35', 'khi', 'peradilanAgama').concat([T.badilag])
      });
    }

    if (adaPasangan && harta.hartaBersama) {
      out.push({
        id: 'pisah_harta_bersama',
        tingkat: 'wajib',
        hukumIndonesia: true,
        judul: 'Pisahkan harta bersama sebelum warisan dibagi',
        teks: 'Separuh harta bersama sudah dikeluarkan dari hitungan, karena milik ' +
          'pasangan yang masih hidup sejak awal, bukan warisan. Sepakati pemisahan itu ' +
          'secara tertulis. Sebaiknya kuatkan lewat penetapan pengadilan agar tidak jadi ' +
          'sengketa. ' + CATATAN_HARTA_BERSAMA,
        poin: [
          { teks: 'Catat mana harta bersama dan mana harta bawaan. Cek tanggal perolehan ' +
            'lewat sertifikat, BPKB, atau rekening, bukan dari ingatan.' },
          { teks: 'Jika ada perjanjian perkawinan (pranikah atau pascanikah), isinya yang ' +
            'berlaku, bukan patokan 50:50.' },
          { teks: 'Tulis hasil pemisahan dalam kesepakatan yang ditandatangani semua ahli ' +
            'waris. Di depan notaris jika nilainya besar.' },
          { teks: 'Untuk aset bersertifikat, pemisahan harus tercermin di dokumen ' +
            'kepemilikan. Jika tidak, masalah muncul saat balik nama.' }
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
        teks: 'Ada bagian harta yang tidak punya ahli waris. Menurut fiqh klasik, ' +
          'diserahkan ke baitul mal. Di Indonesia ada beberapa jalan yang lazim.',
        poin: [
          { teks: 'Pengadilan Agama umumnya menyerahkannya ke pasangan yang masih hidup.' },
          { teks: 'Alternatif: disalurkan sebagai wakaf atau ke lembaga amil zakat resmi.' }
        ],
        tautan: [T.baznas]
      });
    }

    return out;
  }

  root.Advice = { JENIS_HARTA: JENIS_HARTA, langkah: langkah, TAUTAN: T };
})(typeof window !== 'undefined' ? window : globalThis);
