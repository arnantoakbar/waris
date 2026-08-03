/*
 * Kasus uji mesin faraid.
 *
 * Jawaban diambil dari kasus-kasus baku dalam kitab faraid (termasuk yang
 * sudah punya nama sendiri seperti 'aul 6->7, umariyyatain, akdariyyah,
 * musyarakah). Kalau ada satu saja yang merah, mesinnya tidak boleh dipakai.
 *
 * Format `harap`: kunci ahli waris -> bagian TOTAL kelompok, sebagai teks
 * pecahan. Yang tidak disebut dianggap harus nol.
 */

(function (root) {
  'use strict';

  function K(jenisKelamin, ahliWaris) {
    return { jenisKelamin: jenisKelamin, harta: { total: 0 }, ahliWaris: ahliWaris };
  }

  var KASUS = [
    // ── Pasangan & keturunan langsung ──────────────────────────────
    { nama: 'Suami + 1 anak laki-laki',
      input: K('P', { suami: 1, anak_lk: 1 }),
      harap: { suami: '1/4', anak_lk: '3/4' } },

    { nama: 'Istri + 1 anak perempuan (radd)',
      input: K('L', { istri: 1, anak_pr: 1 }),
      harap: { istri: '1/8', anak_pr: '7/8' } },

    { nama: '2 istri + 3 anak laki-laki',
      input: K('L', { istri: 2, anak_lk: 3 }),
      harap: { istri: '1/8', anak_lk: '7/8' } },

    { nama: 'Suami + 2 anak perempuan (radd)',
      input: K('P', { suami: 1, anak_pr: 2 }),
      harap: { suami: '1/4', anak_pr: '3/4' } },

    { nama: 'Istri + ayah + ibu + 2 anak laki-laki + 1 anak perempuan',
      input: K('L', { istri: 1, ayah: 1, ibu: 1, anak_lk: 2, anak_pr: 1 }),
      harap: { istri: '1/8', ayah: '1/6', ibu: '1/6', anak_lk: '13/30', anak_pr: '13/120' } },

    // ── Umariyyatain ───────────────────────────────────────────────
    { nama: 'Umariyyatain: suami + ayah + ibu',
      input: K('P', { suami: 1, ayah: 1, ibu: 1 }),
      harap: { suami: '1/2', ibu: '1/6', ayah: '1/3' },
      kasus: 'umariyyatain' },

    { nama: 'Umariyyatain: istri + ayah + ibu',
      input: K('L', { istri: 1, ayah: 1, ibu: 1 }),
      harap: { istri: '1/4', ibu: '1/4', ayah: '1/2' },
      kasus: 'umariyyatain' },

    // ── Orang tua ──────────────────────────────────────────────────
    { nama: 'Ayah + ibu + 1 anak laki-laki',
      input: K('L', { ayah: 1, ibu: 1, anak_lk: 1 }),
      harap: { ayah: '1/6', ibu: '1/6', anak_lk: '2/3' } },

    { nama: 'Ayah + ibu + 1 anak perempuan (ayah dua status)',
      input: K('L', { ayah: 1, ibu: 1, anak_pr: 1 }),
      harap: { ayah: '1/3', ibu: '1/6', anak_pr: '1/2' } },

    { nama: 'Ayah + ibu saja',
      input: K('L', { ayah: 1, ibu: 1 }),
      harap: { ayah: '2/3', ibu: '1/3' } },

    { nama: 'Ibu saja (radd penuh)',
      input: K('L', { ibu: 1 }),
      harap: { ibu: '1' } },

    { nama: 'Ayah saja (ashabah penuh)',
      input: K('L', { ayah: 1 }),
      harap: { ayah: '1' } },

    { nama: 'Ayah menghalangi kakek',
      input: K('L', { ayah: 1, kakek: 1 }),
      harap: { ayah: '1' },
      terhalang: ['kakek'] },

    // ── 'Aul ───────────────────────────────────────────────────────
    { nama: "'Aul 6->7: suami + 2 saudara perempuan kandung",
      input: K('P', { suami: 1, sdr_pr_kandung: 2 }),
      harap: { suami: '3/7', sdr_pr_kandung: '4/7' }, aul: true },

    { nama: "'Aul 6->8: suami + ibu + 2 saudara perempuan kandung",
      input: K('P', { suami: 1, ibu: 1, sdr_pr_kandung: 2 }),
      harap: { suami: '3/8', ibu: '1/8', sdr_pr_kandung: '1/2' }, aul: true },

    { nama: "'Aul 6->9: suami + ibu + 2 sdr pr kandung + 1 sdr seibu",
      input: K('P', { suami: 1, ibu: 1, sdr_pr_kandung: 2, sdr_lk_seibu: 1 }),
      harap: { suami: '1/3', ibu: '1/9', sdr_pr_kandung: '4/9', sdr_lk_seibu: '1/9' }, aul: true },

    { nama: "'Aul 6->10: suami + ibu + 2 sdr pr kandung + 2 sdr seibu",
      input: K('P', { suami: 1, ibu: 1, sdr_pr_kandung: 2, sdr_lk_seibu: 2 }),
      harap: { suami: '3/10', ibu: '1/10', sdr_pr_kandung: '2/5', sdr_lk_seibu: '1/5' }, aul: true },

    { nama: "'Aul 12->13: suami + ibu + 2 anak perempuan",
      input: K('P', { suami: 1, ibu: 1, anak_pr: 2 }),
      harap: { suami: '3/13', ibu: '2/13', anak_pr: '8/13' }, aul: true },

    // Versi istri dari kasus di atas justru TIDAK 'aul: istri hanya 1/8 kalau
    // ada anak, jadi totalnya 23/24 dan malah terjadi radd.
    { nama: 'Istri + ibu + 2 anak perempuan (23/24, radd)',
      input: K('L', { istri: 1, ibu: 1, anak_pr: 2 }),
      harap: { istri: '1/8', ibu: '7/40', anak_pr: '7/10' }, radd: true },

    { nama: "'Aul 12->15: istri + 2 sdr pr kandung + 2 sdr seibu",
      input: K('L', { istri: 1, sdr_pr_kandung: 2, sdr_lk_seibu: 2 }),
      harap: { istri: '1/5', sdr_pr_kandung: '8/15', sdr_lk_seibu: '4/15' }, aul: true },

    { nama: "'Aul 12->17: istri + ibu + 2 sdr pr kandung + 2 sdr seibu",
      input: K('L', { istri: 1, ibu: 1, sdr_pr_kandung: 2, sdr_lk_seibu: 2 }),
      harap: { istri: '3/17', ibu: '2/17', sdr_pr_kandung: '8/17', sdr_lk_seibu: '4/17' }, aul: true },

    { nama: "'Aul 24->27: istri + ibu + ayah + 2 anak perempuan",
      input: K('L', { istri: 1, ibu: 1, ayah: 1, anak_pr: 2 }),
      harap: { istri: '1/9', ibu: '4/27', ayah: '4/27', anak_pr: '16/27' }, aul: true },

    { nama: "'Aul 6->8: suami + ibu + 1 sdr pr kandung + 1 sdr pr seayah",
      input: K('P', { suami: 1, ibu: 1, sdr_pr_kandung: 1, sdr_pr_sebapak: 1 }),
      harap: { suami: '3/8', ibu: '1/8', sdr_pr_kandung: '3/8', sdr_pr_sebapak: '1/8' }, aul: true },

    // ── Radd ───────────────────────────────────────────────────────
    { nama: 'Radd: ibu + 1 anak perempuan',
      input: K('L', { ibu: 1, anak_pr: 1 }),
      harap: { ibu: '1/4', anak_pr: '3/4' }, radd: true },

    { nama: 'Radd: nenek dari ibu + 1 saudara perempuan seibu',
      input: K('L', { nenek_ibu: 1, sdr_pr_seibu: 1 }),
      harap: { nenek_ibu: '1/2', sdr_pr_seibu: '1/2' }, radd: true },

    { nama: 'Radd tanpa pasangan: 2 anak perempuan saja',
      input: K('L', { anak_pr: 2 }),
      harap: { anak_pr: '1' }, radd: true },

    { nama: 'Radd dengan pasangan: istri + ibu',
      input: K('L', { istri: 1, ibu: 1 }),
      harap: { istri: '1/4', ibu: '3/4' }, radd: true },

    { nama: 'Radd: ibu + 2 saudara perempuan seibu',
      input: K('L', { ibu: 1, sdr_pr_seibu: 2 }),
      harap: { ibu: '1/3', sdr_pr_seibu: '2/3' }, radd: true },

    { nama: 'Suami sendirian: sisa tidak terbagi',
      input: K('P', { suami: 1 }),
      harap: { suami: '1/2' }, sisaTidakTerbagi: '1/2' },

    // ── Cucu ───────────────────────────────────────────────────────
    { nama: 'Cucu perempuan penyempurna: 1 anak pr + 1 cucu pr',
      input: K('L', { anak_pr: 1, cucu_pr: 1 }),
      harap: { anak_pr: '3/4', cucu_pr: '1/4' }, radd: true },

    { nama: '1 anak pr + 1 cucu pr + ayah',
      input: K('L', { anak_pr: 1, cucu_pr: 1, ayah: 1 }),
      harap: { anak_pr: '1/2', cucu_pr: '1/6', ayah: '1/3' } },

    { nama: '2 anak perempuan menghalangi cucu perempuan',
      input: K('L', { anak_pr: 2, cucu_pr: 1 }),
      harap: { anak_pr: '1' }, terhalang: ['cucu_pr'] },

    { nama: '2 anak pr + cucu lk + cucu pr (cucu lk menarik saudarinya)',
      input: K('L', { anak_pr: 2, cucu_lk: 1, cucu_pr: 1 }),
      harap: { anak_pr: '2/3', cucu_lk: '2/9', cucu_pr: '1/9' } },

    { nama: '1 anak perempuan + 1 cucu laki-laki',
      input: K('L', { anak_pr: 1, cucu_lk: 1 }),
      harap: { anak_pr: '1/2', cucu_lk: '1/2' } },

    { nama: 'Anak laki-laki menghalangi cucu',
      input: K('L', { anak_lk: 1, cucu_lk: 2, cucu_pr: 1 }),
      harap: { anak_lk: '1' }, terhalang: ['cucu_lk', 'cucu_pr'] },

    { nama: 'Istri + 1 anak pr + 1 cucu pr + ayah',
      input: K('L', { istri: 1, anak_pr: 1, cucu_pr: 1, ayah: 1 }),
      harap: { istri: '1/8', anak_pr: '1/2', cucu_pr: '1/6', ayah: '5/24' } },

    // ── Nenek ──────────────────────────────────────────────────────
    { nama: 'Dua nenek berbagi 1/6 + 1 anak laki-laki',
      input: K('L', { nenek_ayah: 1, nenek_ibu: 1, anak_lk: 1 }),
      harap: { nenek_ayah: '1/12', nenek_ibu: '1/12', anak_lk: '5/6' } },

    { nama: 'Ibu menghalangi nenek',
      input: K('L', { ibu: 1, nenek_ibu: 1 }),
      harap: { ibu: '1' }, terhalang: ['nenek_ibu'] },

    { nama: 'Kakek + nenek dari ibu + 1 anak laki-laki',
      input: K('L', { kakek: 1, nenek_ibu: 1, anak_lk: 1 }),
      harap: { kakek: '1/6', nenek_ibu: '1/6', anak_lk: '2/3' } },

    // ── Saudara ────────────────────────────────────────────────────
    { nama: '1 sdr lk kandung + 1 sdr pr kandung (2:1)',
      input: K('L', { sdr_lk_kandung: 1, sdr_pr_kandung: 1 }),
      harap: { sdr_lk_kandung: '2/3', sdr_pr_kandung: '1/3' } },

    { nama: '1 sdr pr kandung + 1 sdr pr seayah (penyempurna, lalu radd)',
      input: K('L', { sdr_pr_kandung: 1, sdr_pr_sebapak: 1 }),
      harap: { sdr_pr_kandung: '3/4', sdr_pr_sebapak: '1/4' }, radd: true },

    { nama: "Ashabah ma'al ghair: 1 anak pr + 1 sdr pr kandung",
      input: K('L', { anak_pr: 1, sdr_pr_kandung: 1 }),
      harap: { anak_pr: '1/2', sdr_pr_kandung: '1/2' } },

    { nama: "Ma'al ghair + istri: istri + 1 anak pr + 1 sdr pr kandung",
      input: K('L', { istri: 1, anak_pr: 1, sdr_pr_kandung: 1 }),
      harap: { istri: '1/8', anak_pr: '1/2', sdr_pr_kandung: '3/8' } },

    { nama: '2 saudara seibu + 1 saudara laki-laki kandung',
      input: K('L', { sdr_lk_seibu: 2, sdr_lk_kandung: 1 }),
      harap: { sdr_lk_seibu: '1/3', sdr_lk_kandung: '2/3' } },

    { nama: 'Saudara kandung menghalangi saudara seayah',
      input: K('L', { sdr_lk_kandung: 1, sdr_lk_sebapak: 1 }),
      harap: { sdr_lk_kandung: '1' }, terhalang: ['sdr_lk_sebapak'] },

    { nama: 'Anak laki-laki menghalangi semua saudara',
      input: K('L', { anak_lk: 1, sdr_lk_kandung: 2, sdr_pr_kandung: 1, sdr_lk_seibu: 1 }),
      harap: { anak_lk: '1' },
      terhalang: ['sdr_lk_kandung', 'sdr_pr_kandung', 'sdr_lk_seibu'] },

    { nama: 'Ayah menghalangi semua saudara',
      input: K('L', { ayah: 1, sdr_lk_kandung: 2, sdr_lk_seibu: 2 }),
      harap: { ayah: '1' },
      terhalang: ['sdr_lk_kandung', 'sdr_lk_seibu'] },

    { nama: 'Ibu turun ke 1/6 karena 2 saudara, walau saudara terhalang ayah',
      input: K('L', { ayah: 1, ibu: 1, sdr_lk_kandung: 2 }),
      harap: { ayah: '5/6', ibu: '1/6' },
      terhalang: ['sdr_lk_kandung'] },

    { nama: 'Ibu tetap 1/3 kalau saudara hanya satu',
      input: K('L', { ayah: 1, ibu: 1, sdr_lk_kandung: 1 }),
      harap: { ayah: '2/3', ibu: '1/3' },
      terhalang: ['sdr_lk_kandung'] },

    // ── Musyarakah & Akdariyyah ────────────────────────────────────
    { nama: 'Musyarakah: suami + ibu + 2 sdr lk seibu + 1 sdr lk kandung',
      input: K('P', { suami: 1, ibu: 1, sdr_lk_seibu: 2, sdr_lk_kandung: 1 }),
      harap: { suami: '1/2', ibu: '1/6', sdr_lk_seibu: '2/9', sdr_lk_kandung: '1/9' },
      kasus: 'musyarakah' },

    { nama: 'Akdariyyah: suami + ibu + kakek + 1 sdr pr kandung',
      input: K('P', { suami: 1, ibu: 1, kakek: 1, sdr_pr_kandung: 1 }),
      harap: { suami: '1/3', ibu: '2/9', kakek: '8/27', sdr_pr_kandung: '4/27' },
      kasus: 'akdariyyah' },

    // ── Kakek bersama saudara ──────────────────────────────────────
    { nama: 'Kakek + 1 sdr lk kandung (muqasamah)',
      input: K('L', { kakek: 1, sdr_lk_kandung: 1 }),
      harap: { kakek: '1/2', sdr_lk_kandung: '1/2' } },

    { nama: 'Kakek + 2 sdr lk kandung (muqasamah = 1/3)',
      input: K('L', { kakek: 1, sdr_lk_kandung: 2 }),
      harap: { kakek: '1/3', sdr_lk_kandung: '2/3' } },

    { nama: 'Kakek + 3 sdr lk kandung (kakek ambil 1/3 sisa)',
      input: K('L', { kakek: 1, sdr_lk_kandung: 3 }),
      harap: { kakek: '1/3', sdr_lk_kandung: '2/3' } },

    { nama: 'Kakek + 1 sdr pr kandung',
      input: K('L', { kakek: 1, sdr_pr_kandung: 1 }),
      harap: { kakek: '2/3', sdr_pr_kandung: '1/3' } },

    { nama: 'Kakek + 2 sdr pr kandung',
      input: K('L', { kakek: 1, sdr_pr_kandung: 2 }),
      harap: { kakek: '1/2', sdr_pr_kandung: '1/2' } },

    { nama: 'Suami + kakek + 1 sdr lk kandung',
      input: K('P', { suami: 1, kakek: 1, sdr_lk_kandung: 1 }),
      harap: { suami: '1/2', kakek: '1/4', sdr_lk_kandung: '1/4' } },

    { nama: 'Ibu + kakek + 4 sdr lk kandung (kakek ambil 1/3 sisa)',
      input: K('L', { ibu: 1, kakek: 1, sdr_lk_kandung: 4 }),
      harap: { ibu: '1/6', kakek: '5/18', sdr_lk_kandung: '5/9' } },

    { nama: 'Ibu + kakek + 1 sdr lk kandung (muqasamah)',
      input: K('L', { ibu: 1, kakek: 1, sdr_lk_kandung: 1 }),
      harap: { ibu: '1/3', kakek: '1/3', sdr_lk_kandung: '1/3' } },

    { nama: 'Kakek menghalangi saudara seibu',
      input: K('L', { kakek: 1, sdr_lk_seibu: 2 }),
      harap: { kakek: '1' }, terhalang: ['sdr_lk_seibu'] },

    // ── Kerabat jauh & urutan ashabah ──────────────────────────────
    { nama: 'Paman kandung sendirian',
      input: K('L', { paman_kandung: 1 }),
      harap: { paman_kandung: '1' } },

    { nama: 'Istri + paman kandung',
      input: K('L', { istri: 1, paman_kandung: 1 }),
      harap: { istri: '1/4', paman_kandung: '3/4' } },

    { nama: 'Saudara kandung menghalangi paman',
      input: K('L', { sdr_lk_kandung: 1, paman_kandung: 1 }),
      harap: { sdr_lk_kandung: '1' }, terhalang: ['paman_kandung'] },

    { nama: 'Keponakan menghalangi paman',
      input: K('L', { keponakan_kandung: 1, paman_kandung: 1 }),
      harap: { keponakan_kandung: '1' }, terhalang: ['paman_kandung'] },

    { nama: 'Paman kandung menghalangi paman seayah dan sepupu',
      input: K('L', { paman_kandung: 1, paman_sebapak: 1, sepupu_kandung: 1 }),
      harap: { paman_kandung: '1' }, terhalang: ['paman_sebapak', 'sepupu_kandung'] },

    { nama: "Ma'al ghair menghalangi paman: 1 anak pr + 1 sdr pr kandung + paman",
      input: K('L', { anak_pr: 1, sdr_pr_kandung: 1, paman_kandung: 1 }),
      harap: { anak_pr: '1/2', sdr_pr_kandung: '1/2' }, terhalang: ['paman_kandung'] },

    { nama: 'Sepupu jauh kebagian kalau tidak ada siapa-siapa lagi',
      input: K('L', { sepupu_sebapak: 2 }),
      harap: { sepupu_sebapak: '1' } }
  ];

  // ═══════════════════════════════════════════════════════════════
  // Uji perhitungan tirkah (harta yang boleh dibagi)
  // ═══════════════════════════════════════════════════════════════
  var KASUS_HARTA = [
    { nama: 'Tanpa potongan apa pun',
      harta: { total: 120000000 }, adaPasangan: false,
      harap: { tirkah: 120000000 } },

    { nama: 'Biaya jenazah + hutang',
      harta: { total: 100000000, biayaJenazah: 5000000, hutang: 15000000 },
      adaPasangan: false,
      harap: { tirkah: 80000000 } },

    { nama: 'Wasiat dipotong ke batas 1/3',
      harta: { total: 90000000, wasiat: 50000000 }, adaPasangan: false,
      harap: { tirkah: 60000000, wasiat: 30000000 } },

    { nama: 'Wasiat di bawah batas tidak dipotong',
      harta: { total: 90000000, wasiat: 10000000 }, adaPasangan: false,
      harap: { tirkah: 80000000, wasiat: 10000000 } },

    { nama: 'Hutang melebihi harta',
      harta: { total: 50000000, hutang: 80000000 }, adaPasangan: false,
      harap: { tirkah: 0, hutangKurang: 30000000 } },

    { nama: 'Harta bersama: separuh keluar dulu untuk pasangan',
      harta: { total: 200000000, hartaBersama: true }, adaPasangan: true,
      harap: { tirkah: 100000000, bagianHartaBersama: 100000000 } },

    { nama: 'Harta bersama diabaikan kalau tidak ada pasangan',
      harta: { total: 200000000, hartaBersama: true }, adaPasangan: false,
      harap: { tirkah: 200000000, bagianHartaBersama: 0 } },

    { nama: 'Urutan lengkap: harta bersama, biaya, hutang, wasiat',
      harta: { total: 400000000, hartaBersama: true, biayaJenazah: 10000000,
               hutang: 40000000, wasiat: 100000000 },
      adaPasangan: true,
      // 400jt -> 200jt (harta bersama) -> 190jt -> 150jt -> batas wasiat 50jt -> 100jt
      harap: { tirkah: 100000000, wasiat: 50000000 } }
  ];

  // ═══════════════════════════════════════════════════════════════
  // Runner
  // ═══════════════════════════════════════════════════════════════
  function jalankan() {
    var f = root.Fraction;
    var hasil = [];

    KASUS.forEach(function (t) {
      var gagal = [];
      var r;
      try {
        r = root.Faraid.hitung(t.input);
      } catch (e) {
        hasil.push({ nama: t.nama, lulus: false, pesan: ['Error: ' + e.message], detail: '' });
        return;
      }

      var didapat = {};
      r.ahliWaris.forEach(function (a) {
        if (a.status === 'menerima') didapat[a.key] = f.toText(a.bagian);
      });

      // total harus tepat 1 (kecuali ada sisa yang tidak terbagi)
      var total = f.sum(r.ahliWaris
        .filter(function (a) { return a.status === 'menerima'; })
        .map(function (a) { return a.bagian; }));
      if (r.sisaTidakTerbagi) total = f.add(total, r.sisaTidakTerbagi.bagian);
      if (!f.eq(total, f.ONE)) {
        gagal.push('total bagian = ' + f.toText(total) + ', seharusnya 1');
      }

      Object.keys(t.harap).forEach(function (k) {
        if (didapat[k] !== t.harap[k]) {
          gagal.push(k + ': dapat ' + (didapat[k] || '0') + ', harap ' + t.harap[k]);
        }
      });
      Object.keys(didapat).forEach(function (k) {
        if (!(k in t.harap)) gagal.push(k + ': dapat ' + didapat[k] + ', seharusnya tidak kebagian');
      });

      (t.terhalang || []).forEach(function (k) {
        var a = r.ahliWaris.filter(function (x) { return x.key === k; })[0];
        if (!a || a.status !== 'terhalang') gagal.push(k + ' seharusnya terhalang');
      });

      if (t.aul && !r.perhitungan.aul) gagal.push("seharusnya terjadi 'aul");
      if (t.radd && !r.perhitungan.radd) gagal.push('seharusnya terjadi radd');
      if (t.kasus) {
        var kk = r.perhitungan.kasusKhusus;
        if (!kk || kk.id !== t.kasus) {
          gagal.push('seharusnya terdeteksi kasus ' + t.kasus + ', dapat ' + (kk ? kk.id : 'tidak ada'));
        }
      }
      if (t.sisaTidakTerbagi) {
        if (!r.sisaTidakTerbagi || f.toText(r.sisaTidakTerbagi.bagian) !== t.sisaTidakTerbagi) {
          gagal.push('sisa tidak terbagi seharusnya ' + t.sisaTidakTerbagi);
        }
      }

      hasil.push({
        nama: t.nama,
        lulus: gagal.length === 0,
        pesan: gagal,
        detail: Object.keys(didapat).map(function (k) { return k + ' ' + didapat[k]; }).join(' · ')
      });
    });

    KASUS_HARTA.forEach(function (t) {
      var r = root.Estate.hitung(t.harta, t.adaPasangan);
      var gagal = [];
      Object.keys(t.harap).forEach(function (k) {
        if (r[k] !== t.harap[k]) gagal.push(k + ': dapat ' + r[k] + ', harap ' + t.harap[k]);
      });
      hasil.push({
        nama: 'Harta — ' + t.nama,
        lulus: gagal.length === 0,
        pesan: gagal,
        detail: 'tirkah ' + r.tirkah
      });
    });

    return hasil;
  }

  root.Tests = { KASUS: KASUS, KASUS_HARTA: KASUS_HARTA, jalankan: jalankan };
})(typeof window !== 'undefined' ? window : globalThis);
