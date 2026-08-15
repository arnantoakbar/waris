/*
 * DALIL — sumber hukum untuk setiap aturan yang dipakai kalkulator ini.
 *
 * Dataset statis. Aturan waris dalam Islam sudah baku dan tertutup: tidak
 * berubah sejak diturunkan, tidak perlu ditanyakan ulang ke mesin pencari
 * atau AI setiap kali orang menghitung. Jadi sumbernya dikumpulkan sekali,
 * disimpan di sini, lalu dipanggil berulang-ulang lewat lookup biasa.
 *
 * Setiap entri menyimpan `tautan` ke sumber daring yang bisa dibuka pembaca
 * untuk memeriksa sendiri teks Arab, terjemahan, sanad, dan derajat haditsnya.
 * Nomor hadits dan derajat di bawah sudah dicocokkan satu per satu dengan
 * hadits.id (Agustus 2026).
 *
 * ─────────────────────────────────────────────────────────────────────
 * CATATAN UNTUK PEMILIK SITUS
 * Ini menyangkut hukum agama. Pencocokan dengan sumber daring memastikan
 * nomor dan teksnya benar, tapi TIDAK menggantikan pemeriksaan seorang ustadz
 * yang kompeten di bidang faraid — terutama untuk penilaian derajat hadits,
 * yang antar ulama pun bisa berbeda. Kode bisa diuji dengan test suite;
 * keabsahan kutipan tidak bisa.
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
      tautan: { label: 'Baca di Quran.com', url: 'https://quran.com/4/7' },
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
      tautan: { label: 'Baca di Quran.com', url: 'https://quran.com/4/11' },
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
      tautan: { label: 'Baca di Quran.com', url: 'https://quran.com/4/12' },
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
      tautan: { label: 'Baca di Quran.com', url: 'https://quran.com/4/176' },
      arab: 'يَسْتَفْتُونَكَ قُلِ اللَّهُ يُفْتِيكُمْ فِي الْكَلَالَةِ ۚ إِنِ امْرُؤٌ هَلَكَ لَيْسَ لَهُ وَلَدٌ وَلَهُ أُخْتٌ فَلَهَا نِصْفُ مَا تَرَكَ ۚ ' +
        'وَهُوَ يَرِثُهَا إِنْ لَمْ يَكُنْ لَهَا وَلَدٌ ۚ فَإِنْ كَانَتَا اثْنَتَيْنِ فَلَهُمَا الثُّلُثَانِ مِمَّا تَرَكَ ۚ ' +
        'وَإِنْ كَانُوا إِخْوَةً رِجَالًا وَنِسَاءً فَلِلذَّكَرِ مِثْلُ حَظِّ الْأُنْثَيَيْنِ',
      terjemah: 'Mereka meminta fatwa kepadamu. Katakanlah: Allah memberi fatwa tentang kalalah. ' +
        'Jika seseorang meninggal tanpa meninggalkan anak, dan ia punya seorang saudara perempuan, ' +
        'maka saudara perempuan itu mendapat setengah dari harta yang ditinggalkan. Saudara ' +
        'laki-laki mewarisi saudara perempuannya jika ia tidak punya anak. Jika saudara ' +
        'perempuannya dua orang, keduanya mendapat dua pertiga dari harta yang ditinggalkan. ' +
        'Dan jika mereka terdiri dari saudara laki-laki dan perempuan, maka bagian seorang ' +
        'laki-laki sama dengan bagian dua orang perempuan.',
      ringkas: 'Dasar bagian saudara kandung dan saudara seayah, dalam keadaan kalalah — ' +
        'pewaris tidak punya anak maupun ayah. Kalimat terakhirnya adalah dasar pembagian ' +
        '2 : 1 antara saudara laki-laki dan saudara perempuan.'
    },

    'qs4-13': {
      jenis: 'quran',
      rujukan: 'QS An-Nisa ayat 13-14',
      tautan: { label: 'Baca di Quran.com', url: 'https://quran.com/4/13' },
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
      tautan: { label: 'Baca di hadits.id — Bukhari 6732', url: 'https://www.hadits.id/hadits/bukhari/6732' },
      tautanLain: [{ label: 'Muslim 1615', url: 'https://www.hadits.id/hadits/muslim/1615' }],
      ringkas: 'Dasar seluruh sistem ashabah: siapa yang menerima sisa harta setelah bagian ' +
        'tetap dibayarkan, dan urutan kedekatannya.'
    },

    'hadits-nenek': {
      jenis: 'hadits',
      rujukan: 'HR Tirmidzi no. 2101, Abu Dawud no. 2894, Ibnu Majah no. 2724',
      arab: 'جَاءَتِ الْجَدَّةُ إِلَى أَبِي بَكْرٍ الصِّدِّيقِ تَسْأَلُهُ مِيرَاثَهَا ... فَشَهِدَ الْمُغِيرَةُ بْنُ شُعْبَةَ أَنَّ النَّبِيَّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ أَعْطَاهَا السُّدُسَ',
      terjemah: 'Seorang nenek datang kepada Abu Bakar menanyakan bagian warisnya. Abu Bakar ' +
        'berkata bahwa ia tidak menemukan ketetapannya, lalu Al-Mughirah bin Syu\'bah bersaksi ' +
        'bahwa Nabi shallallahu alaihi wa sallam memberikan seperenam kepada nenek, dan ' +
        'kesaksian itu dikuatkan Muhammad bin Maslamah.',
      sumber: 'Dari Qabishah bin Dzu\'aib. Jalur Tirmidzi dinilai sahih (Darussalam), ' +
        'sedangkan jalur Abu Dawud dinilai dhaif oleh Al-Albani. Pemberlakuan bagian 1/6 ' +
        'untuk nenek sendiri diamalkan keempat mazhab.',
      tautan: { label: 'Baca di hadits.id — Tirmidzi 2101', url: 'https://www.hadits.id/hadits/tirmidzi/2101' },
      tautanLain: [
        { label: 'Abu Dawud 2894', url: 'https://www.hadits.id/hadits/abudawud/2894' },
        { label: 'Ibnu Majah 2724', url: 'https://www.hadits.id/hadits/ibnmajah/2724' }
      ],
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
        'memutuskan sesuai putusan Nabi shallallahu alaihi wa sallam. Sahih.',
      tautan: { label: 'Baca di hadits.id — Bukhari 6736', url: 'https://www.hadits.id/hadits/bukhari/6736' },
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
      tautan: { label: 'Baca di hadits.id — Muslim 1628', url: 'https://www.hadits.id/hadits/muslim/1628' },
      tautanLain: [{ label: 'Bukhari 2742', url: 'https://www.hadits.id/hadits/bukhari/2742' }],
      ringkas: 'Batas maksimal wasiat adalah 1/3 harta. Lebih dari itu hanya sah kalau seluruh ' +
        'ahli waris merelakan.'
    },

    'hadits-wasiat-ahli-waris': {
      jenis: 'hadits',
      rujukan: 'HR Abu Dawud no. 2870, Tirmidzi no. 2120, Ibnu Majah no. 2713',
      arab: 'إِنَّ اللَّهَ قَدْ أَعْطَى كُلَّ ذِي حَقٍّ حَقَّهُ، فَلَا وَصِيَّةَ لِوَارِثٍ',
      terjemah: 'Sesungguhnya Allah telah memberikan hak kepada setiap yang berhak, maka tidak ' +
        'ada wasiat untuk ahli waris.',
      sumber: 'Dari Abu Umamah al-Bahili radhiyallahu anhu, dari khutbah Nabi saat Haji Wada. ' +
        'Dinilai hasan (Al-Albani dan Darussalam); Imam Tirmidzi sendiri menilainya hasan sahih.',
      tautan: { label: 'Baca di hadits.id — Tirmidzi 2120', url: 'https://www.hadits.id/hadits/tirmidzi/2120' },
      tautanLain: [
        { label: 'Abu Dawud 2870', url: 'https://www.hadits.id/hadits/abudawud/2870' },
        { label: 'Ibnu Majah 2713', url: 'https://www.hadits.id/hadits/ibnmajah/2713' }
      ],
      ringkas: 'Wasiat tidak boleh diberikan kepada orang yang sudah menjadi ahli waris — ' +
        'bagiannya sudah diatur. Kecuali kalau seluruh ahli waris lain merelakan.'
    },

    'hadits-beda-agama': {
      jenis: 'hadits',
      rujukan: 'HR Bukhari no. 6764 & Muslim no. 1614',
      arab: 'لَا يَرِثُ الْمُسْلِمُ الْكَافِرَ، وَلَا الْكَافِرُ الْمُسْلِمَ',
      terjemah: 'Orang muslim tidak mewarisi orang kafir, dan orang kafir tidak mewarisi orang muslim.',
      sumber: 'Dari Usamah bin Zaid radhiyallahu anhuma. Muttafaq alaih.',
      tautan: { label: 'Baca di hadits.id — Bukhari 6764', url: 'https://www.hadits.id/hadits/bukhari/6764' },
      tautanLain: [{ label: 'Muslim 1614', url: 'https://www.hadits.id/hadits/muslim/1614' }],
      ringkas: 'Perbedaan agama menggugurkan hak waris — dari kedua arah. Tapi pemberian lewat ' +
        'hibah semasa hidup atau wasiat (maksimal 1/3) tetap boleh.'
    },

    'hadits-pembunuh': {
      jenis: 'hadits',
      rujukan: 'HR Abu Dawud no. 4564 & Ibnu Majah no. 2735',
      arab: 'لَيْسَ لِلْقَاتِلِ شَىْءٌ ... وَلاَ يَرِثُ الْقَاتِلُ شَيْئًا',
      terjemah: 'Pembunuh tidak mendapat apa pun, dan pembunuh tidak mewarisi sedikit pun.',
      sumber: 'Riwayat Abu Dawud dalam Kitab Diyat, dinilai hasan oleh Al-Albani. Ibnu Majah ' +
        'meriwayatkan dari Abu Hurairah dengan lafal "الْقَاتِلُ لَا يَرِثُ" (pembunuh tidak ' +
        'mewarisi), dinilai hasan oleh Darussalam.',
      tautan: { label: 'Baca di hadits.id — Abu Dawud 4564', url: 'https://www.hadits.id/hadits/abudawud/4564' },
      tautanLain: [{ label: 'Ibnu Majah 2735', url: 'https://www.hadits.id/hadits/ibnmajah/2735' }],
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

    // Sengaja dipisahkan sebagai jenis 'hukum', bukan quran/hadits/atsar/ijma.
    // Pemisahan separuh harta bersama TIDAK berasal dari ayat atau hadits
    // waris, dan kitab faraid klasik tidak mengenal istilah ini — harta suami
    // tetap milik suami dan harta istri tetap milik istri. Yang terjadi di
    // Indonesia adalah penetapan KEPEMILIKAN lebih dulu, baru sisanya diwaris.
    // Menampilkannya sebagai dalil syar'i akan menyesatkan.
    'harta-bersama': {
      jenis: 'hukum',
      rujukan: 'UU Perkawinan No. 1/1974 Pasal 35 & KHI Pasal 96',
      terjemah: 'UU No. 1 Tahun 1974 Pasal 35 ayat (1): "Harta benda yang diperoleh selama ' +
        'perkawinan menjadi harta bersama." Ayat (2): harta bawaan masing-masing, serta harta ' +
        'yang diperoleh sebagai hadiah atau warisan, tetap di bawah penguasaan masing-masing. ' +
        'Kompilasi Hukum Islam Pasal 96 ayat (1): "Apabila terjadi cerai mati, maka separoh ' +
        'harta bersama menjadi hak pasangan yang hidup lebih lama."',
      sumber: 'Ini hukum positif Indonesia, bukan dalil faraid. Separuh harta bersama bukan ' +
        'warisan — ia sudah menjadi milik pasangan sejak semula, jadi dikeluarkan lebih dulu ' +
        'sebelum harta pewaris dibagi. Dasar fiqihnya disandarkan pada syirkah (perkongsian) ' +
        'dan \'urf, dengan sandaran QS An-Nisa ayat 32: "Bagi laki-laki ada bagian dari apa ' +
        'yang mereka usahakan, dan bagi perempuan ada bagian dari apa yang mereka usahakan." ' +
        'Perlu dicatat: kitab faraid klasik tidak mengenal harta bersama, dan pembagian 50:50 ' +
        'adalah patokan umum — Pengadilan Agama dapat memutus proporsi lain bila kontribusi ' +
        'kedua pihak terbukti timpang.',
      tautan: { label: 'UU 1/1974 Pasal 35', url: 'https://pasal.id/peraturan/uu/uu-no-1-tahun-1974#pasal-35' },
      tautanLain: [
        { label: 'QS An-Nisa ayat 32', url: 'https://quran.com/4/32' }
      ],
      ringkas: 'Dasar pemisahan separuh harta bersama sebelum warisan dibagi.'
    },

    'hadits-hutang': {
      jenis: 'hadits',
      rujukan: 'HR Tirmidzi no. 2122',
      arab: 'قَضَى بِالدَّيْنِ قَبْلَ الْوَصِيَّةِ',
      terjemah: 'Nabi shallallahu alaihi wa sallam memutuskan hutang dilunasi sebelum wasiat ' +
        'dilaksanakan, padahal kalian membaca wasiat disebut sebelum hutang.',
      sumber: 'Dari Ali bin Abi Thalib radhiyallahu anhu. Dinilai hasan oleh Darussalam, dan ' +
        'para ulama sepakat mengamalkan urutan ini.',
      tautan: { label: 'Baca di hadits.id — Tirmidzi 2122', url: 'https://www.hadits.id/hadits/tirmidzi/2122' },
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
    if (hasil.harta && hasil.harta.bagianHartaBersama > 0) tambah('harta-bersama');
    if (hasil.harta && hasil.harta.wasiat > 0) tambah('hadits-wasiat-sepertiga');
    if (hasil.harta && hasil.harta.hutang > 0) tambah('hadits-hutang');
    tambah('hadits-ashabah');

    return ids.map(function (id) {
      return Object.assign({ id: id }, DALIL[id]);
    });
  }

  root.Dalil = { DATA: DALIL, ambil: ambil, kumpulkan: kumpulkan };
})(typeof window !== 'undefined' ? window : globalThis);
