/*
 * DALIL — sumber hukum untuk setiap aturan yang dipakai kalkulator ini.
 *
 * Dataset statis. Aturan waris dalam Islam sudah baku dan tertutup: tidak
 * berubah sejak diturunkan, tidak perlu ditanyakan ulang ke mesin pencari
 * atau AI setiap kali orang menghitung. Jadi sumbernya dikumpulkan sekali,
 * disimpan di sini, lalu dipanggil berulang-ulang lewat lookup biasa.
 *
 * ─────────────────────────────────────────────────────────────────────
 * CATATAN UNTUK PEMILIK SITUS
 * Ini menyangkut hukum agama. Sebelum situs dipublikasikan, mintalah satu
 * orang ustadz yang kompeten di bidang faraid untuk memeriksa isi file ini
 * (teks Arab, terjemahan, nomor hadits, dan status kesahihannya). Kode bisa
 * diuji dengan test suite; keabsahan kutipan tidak bisa.
 * ─────────────────────────────────────────────────────────────────────
 *
 * Terjemahan di bawah sengaja ditulis dalam bahasa Indonesia sehari-hari
 * agar mudah dipahami orang awam, bukan salinan terjemahan resmi.
 */

(function (root) {
  'use strict';

  var DALIL = {

    // ── Al-Qur'an ───────────────────────────────────────────────────
    'qs4-7': {
      jenis: 'quran',
      rujukan: 'QS An-Nisa ayat 7',
      arab: 'لِّلرِّجَالِ نَصِيبٌ مِّمَّا تَرَكَ الْوَالِدَانِ وَالْأَقْرَبُونَ وَلِلنِّسَاءِ نَصِيبٌ مِّمَّا تَرَكَ الْوَالِدَانِ وَالْأَقْرَبُونَ مِمَّا قَلَّ مِنْهُ أَوْ كَثُرَ ۚ نَصِيبًا مَّفْرُوضًا',
      terjemah: 'Laki-laki punya bagian dari harta peninggalan orang tua dan kerabatnya, ' +
        'dan perempuan juga punya bagian dari harta peninggalan orang tua dan kerabatnya — ' +
        'baik sedikit maupun banyak. Itu bagian yang sudah ditetapkan.',
      ringkas: 'Perempuan berhak mewarisi. Ayat ini menghapus kebiasaan jahiliah yang hanya ' +
        'memberi warisan kepada laki-laki dewasa.'
    },

    'qs4-11': {
      jenis: 'quran',
      rujukan: 'QS An-Nisa ayat 11',
      arab: 'يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ',
      terjemah: 'Allah mensyariatkan kepadamu tentang pembagian warisan untuk anak-anakmu: ' +
        'bagian anak laki-laki sama dengan bagian dua anak perempuan.',
      ringkas: 'Dasar bagian anak, ayah, dan ibu. Ayat ini juga menetapkan bahwa pembagian ' +
        'dilakukan setelah wasiat dilaksanakan dan hutang dilunasi.',
      detail: 'Dari ayat ini: dua anak perempuan atau lebih mendapat 2/3, satu anak perempuan ' +
        'mendapat 1/2, masing-masing orang tua mendapat 1/6 jika ada anak, dan ibu mendapat 1/3 ' +
        'jika tidak ada anak — turun menjadi 1/6 jika pewaris punya beberapa saudara.'
    },

    'qs4-12': {
      jenis: 'quran',
      rujukan: 'QS An-Nisa ayat 12',
      arab: 'وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌ ۚ فَإِن كَانَ لَهُنَّ وَلَدٌ فَلَكُمُ الرُّبُعُ مِمَّا تَرَكْنَ',
      terjemah: 'Kamu (para suami) mendapat setengah dari harta yang ditinggalkan istrimu ' +
        'jika mereka tidak punya anak. Jika mereka punya anak, kamu mendapat seperempat.',
      ringkas: 'Dasar bagian suami dan istri, serta bagian saudara seibu.',
      detail: 'Ayat yang sama menetapkan istri mendapat 1/4 jika tidak ada anak dan 1/8 jika ada ' +
        'anak, serta saudara seibu mendapat 1/6 bila seorang diri dan berbagi 1/3 bila dua orang ' +
        'atau lebih.'
    },

    'qs4-176': {
      jenis: 'quran',
      rujukan: 'QS An-Nisa ayat 176',
      arab: 'يَسْتَفْتُونَكَ قُلِ اللَّهُ يُفْتِيكُمْ فِي الْكَلَالَةِ ۚ إِنِ امْرُؤٌ هَلَكَ لَيْسَ لَهُ وَلَدٌ وَلَهُ أُخْتٌ فَلَهَا نِصْفُ مَا تَرَكَ',
      terjemah: 'Mereka meminta fatwa kepadamu. Katakanlah: Allah memberi fatwa tentang kalalah. ' +
        'Jika seseorang meninggal tanpa meninggalkan anak, dan ia punya seorang saudara perempuan, ' +
        'maka saudara perempuan itu mendapat setengah dari harta yang ditinggalkan.',
      ringkas: 'Dasar bagian saudara kandung dan saudara seayah, dalam keadaan kalalah — ' +
        'pewaris tidak punya anak maupun ayah.'
    },

    'qs4-13': {
      jenis: 'quran',
      rujukan: 'QS An-Nisa ayat 13-14',
      arab: 'تِلْكَ حُدُودُ اللَّهِ ۚ وَمَن يُطِعِ اللَّهَ وَرَسُولَهُ يُدْخِلْهُ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ',
      terjemah: 'Itulah batas-batas yang ditetapkan Allah. Siapa yang taat kepada Allah dan ' +
        'Rasul-Nya akan dimasukkan ke dalam surga yang mengalir sungai-sungai di bawahnya.',
      ringkas: 'Penutup ayat-ayat waris: aturan ini bukan saran, tapi batas yang ditetapkan Allah. ' +
        'Karena itu ia tidak boleh ditambah atau dikurangi.'
    },

    // ── Hadits ──────────────────────────────────────────────────────
    'hadits-ashabah': {
      jenis: 'hadits',
      rujukan: 'HR Bukhari no. 6732 & Muslim no. 1615',
      arab: 'أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا، فَمَا بَقِيَ فَهُوَ لِأَوْلَى رَجُلٍ ذَكَرٍ',
      terjemah: 'Berikanlah bagian-bagian yang sudah ditetapkan kepada yang berhak. Lalu sisanya ' +
        'untuk kerabat laki-laki yang paling dekat.',
      sumber: 'Dari Ibnu Abbas radhiyallahu anhuma. Muttafaq alaih (disepakati Bukhari dan Muslim).',
      ringkas: 'Dasar seluruh sistem ashabah: siapa yang menerima sisa harta setelah bagian ' +
        'tetap dibayarkan, dan urutan kedekatannya.'
    },

    'hadits-nenek': {
      jenis: 'hadits',
      rujukan: 'HR Abu Dawud no. 2894, Tirmidzi no. 2101, Ibnu Majah no. 2724',
      arab: 'أَنَّ النَّبِيَّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ أَعْطَى الْجَدَّةَ السُّدُسَ',
      terjemah: 'Nabi shallallahu alaihi wa sallam memberikan bagian seperenam kepada nenek.',
      sumber: 'Dari Al-Mughirah bin Syu\'bah dan Muhammad bin Maslamah. Dinilai hasan sahih.',
      ringkas: 'Bagian nenek 1/6 tidak disebut dalam Al-Qur\'an, melainkan ditetapkan lewat ' +
        'sunnah. Kalau ada dua nenek yang sama-sama berhak, 1/6 itu dibagi rata.'
    },

    'hadits-cucu-pr': {
      jenis: 'hadits',
      rujukan: 'HR Bukhari no. 6736',
      arab: 'لِلِابْنَةِ النِّصْفُ، وَلِابْنَةِ الِابْنِ السُّدُسُ تَكْمِلَةَ الثُّلُثَيْنِ، وَمَا بَقِيَ فَلِلْأُخْتِ',
      terjemah: 'Untuk anak perempuan setengah, untuk cucu perempuan dari anak laki-laki ' +
        'seperenam sebagai pelengkap dua pertiga, dan sisanya untuk saudara perempuan.',
      sumber: 'Putusan Abdullah bin Mas\'ud radhiyallahu anhu, yang menyatakan bahwa beliau ' +
        'memutuskan sesuai putusan Nabi shallallahu alaihi wa sallam.',
      ringkas: 'Dasar bagian 1/6 untuk cucu perempuan sebagai pelengkap ketika hanya ada satu ' +
        'anak perempuan. Juga dasar saudara perempuan menjadi ashabah bersama anak perempuan.'
    },

    'hadits-wasiat-sepertiga': {
      jenis: 'hadits',
      rujukan: 'HR Bukhari no. 2742 & Muslim no. 1628',
      arab: 'الثُّلُثُ، وَالثُّلُثُ كَثِيرٌ. إِنَّكَ أَنْ تَذَرَ وَرَثَتَكَ أَغْنِيَاءَ خَيْرٌ مِنْ أَنْ تَذَرَهُمْ عَالَةً يَتَكَفَّفُونَ النَّاسَ',
      terjemah: 'Sepertiga, dan sepertiga itu sudah banyak. Sungguh, meninggalkan ahli warismu ' +
        'dalam keadaan berkecukupan itu lebih baik daripada meninggalkan mereka miskin sehingga ' +
        'meminta-minta kepada orang lain.',
      sumber: 'Dari Sa\'ad bin Abi Waqqash radhiyallahu anhu. Muttafaq alaih.',
      ringkas: 'Batas maksimal wasiat adalah 1/3 harta. Lebih dari itu hanya sah kalau seluruh ' +
        'ahli waris merelakan.'
    },

    'hadits-wasiat-ahli-waris': {
      jenis: 'hadits',
      rujukan: 'HR Abu Dawud no. 2870, Tirmidzi no. 2120, Ibnu Majah no. 2713',
      arab: 'إِنَّ اللَّهَ قَدْ أَعْطَى كُلَّ ذِي حَقٍّ حَقَّهُ، فَلَا وَصِيَّةَ لِوَارِثٍ',
      terjemah: 'Sesungguhnya Allah telah memberikan hak kepada setiap yang berhak, maka tidak ' +
        'ada wasiat untuk ahli waris.',
      sumber: 'Dari Abu Umamah al-Bahili radhiyallahu anhu. Dinilai hasan sahih.',
      ringkas: 'Wasiat tidak boleh diberikan kepada orang yang sudah menjadi ahli waris — ' +
        'bagiannya sudah diatur. Kecuali kalau seluruh ahli waris lain merelakan.'
    },

    'hadits-beda-agama': {
      jenis: 'hadits',
      rujukan: 'HR Bukhari no. 6764 & Muslim no. 1614',
      arab: 'لَا يَرِثُ الْمُسْلِمُ الْكَافِرَ، وَلَا الْكَافِرُ الْمُسْلِمَ',
      terjemah: 'Orang muslim tidak mewarisi orang kafir, dan orang kafir tidak mewarisi orang muslim.',
      sumber: 'Dari Usamah bin Zaid radhiyallahu anhuma. Muttafaq alaih.',
      ringkas: 'Perbedaan agama menggugurkan hak waris — dari kedua arah. Tapi pemberian lewat ' +
        'hibah semasa hidup atau wasiat (maksimal 1/3) tetap boleh.'
    },

    'hadits-pembunuh': {
      jenis: 'hadits',
      rujukan: 'HR Abu Dawud no. 4564, Nasa\'i, Ibnu Majah no. 2735',
      arab: 'لَيْسَ لِلْقَاتِلِ شَيْءٌ',
      terjemah: 'Pembunuh tidak mendapat apa pun (dari warisan orang yang dibunuhnya).',
      sumber: 'Dari Abu Hurairah dan Amr bin Syu\'aib. Dinilai sahih oleh para ulama hadits.',
      ringkas: 'Membunuh pewaris menggugurkan hak waris. Ini mencegah orang mempercepat kematian ' +
        'demi harta.'
    },

    // ── Atsar sahabat & ijma ────────────────────────────────────────
    'atsar-zaid': {
      jenis: 'atsar',
      rujukan: 'Putusan Zaid bin Tsabit radhiyallahu anhu',
      terjemah: 'Zaid bin Tsabit — sahabat yang paling dikenal keahliannya dalam ilmu faraid — ' +
        'memutuskan bahwa kakek tidak menggugurkan saudara kandung maupun saudara seayah, ' +
        'melainkan berbagi dengan mereka dan mengambil pilihan yang paling menguntungkan baginya.',
      sumber: 'Diriwayatkan dalam Al-Muwaththa\' Imam Malik dan As-Sunan Al-Kubra Al-Baihaqi. ' +
        'Menjadi pegangan mazhab Syafi\'i dan Maliki.',
      ringkas: 'Dasar aturan kakek bersama saudara, dan dasar penyelesaian kasus Al-Akdariyyah.',
      khilafiyah: 'Abu Hanifah berpendapat sebaliknya: kakek menggugurkan seluruh saudara. ' +
        'Kalkulator ini mengikuti Zaid bin Tsabit sesuai mazhab Syafi\'i.'
    },

    'atsar-umar-musyarakah': {
      jenis: 'atsar',
      rujukan: 'Putusan Umar bin Khattab radhiyallahu anhu',
      terjemah: 'Dalam kasus di mana suami, ibu, dan saudara seibu sudah menghabiskan seluruh ' +
        'harta sehingga saudara kandung tidak kebagian apa-apa, Umar memutuskan agar saudara ' +
        'kandung ikut berbagi sepertiga bersama saudara seibu — karena mereka sama-sama satu ibu ' +
        'dengan pewaris.',
      sumber: 'Diriwayatkan dalam Al-Muwaththa\' Imam Malik dan As-Sunan Al-Kubra Al-Baihaqi. ' +
        'Menjadi pegangan mazhab Syafi\'i dan Maliki.',
      ringkas: 'Dasar penyelesaian kasus Musyarakah.',
      khilafiyah: 'Mazhab Hanafi dan Hanbali berpendapat saudara kandung tidak kebagian sama ' +
        'sekali dalam kasus ini.'
    },

    'ijma-kakek': {
      jenis: 'ijma',
      rujukan: 'Kesepakatan ulama',
      terjemah: 'Ketika ayah sudah tidak ada, kakek dari pihak ayah menempati posisi ayah dalam ' +
        'pembagian warisan — dengan beberapa pengecualian, terutama saat ia berkumpul bersama ' +
        'saudara-saudara pewaris.',
      sumber: 'Kesepakatan ulama mazhab yang empat, bersandar pada keumuman ayat waris.',
      ringkas: 'Dasar bagian kakek 1/6 dan statusnya sebagai ashabah.'
    },

    'hadits-hutang': {
      jenis: 'hadits',
      rujukan: 'HR Tirmidzi no. 2122, Ibnu Majah no. 2715',
      terjemah: 'Rasulullah shallallahu alaihi wa sallam memutuskan bahwa hutang dilunasi lebih ' +
        'dulu sebelum wasiat dilaksanakan, meskipun dalam Al-Qur\'an wasiat disebut terlebih dahulu.',
      sumber: 'Dari Ali bin Abi Thalib radhiyallahu anhu. Para ulama sepakat mengamalkannya.',
      ringkas: 'Urutan yang benar: biaya pengurusan jenazah, lalu hutang, lalu wasiat, baru warisan.'
    }
  };

  function ambil(id) {
    return DALIL[id] || null;
  }

  /** Semua dalil yang dipakai dalam satu hasil perhitungan, tanpa duplikat. */
  function kumpulkan(hasil) {
    var ids = [];
    function tambah(id) { if (id && ids.indexOf(id) === -1 && DALIL[id]) ids.push(id); }

    tambah('qs4-11');
    tambah('qs4-12');
    (hasil.ahliWaris || []).forEach(function (a) { tambah(a.dalil); });
    if (hasil.perhitungan && hasil.perhitungan.kasusKhusus) {
      tambah(hasil.perhitungan.kasusKhusus.dalil);
    }
    (hasil.catatan || []).forEach(function (c) { tambah(c.dalil); });
    (hasil.peringatan || []).forEach(function (p) { tambah(p.dalil); });
    if (hasil.harta && hasil.harta.wasiat > 0) tambah('hadits-wasiat-sepertiga');
    if (hasil.harta && hasil.harta.hutang > 0) tambah('hadits-hutang');
    tambah('hadits-ashabah');

    return ids.map(function (id) {
      return Object.assign({ id: id }, DALIL[id]);
    });
  }

  root.Dalil = { DATA: DALIL, ambil: ambil, kumpulkan: kumpulkan };
})(typeof window !== 'undefined' ? window : globalThis);
