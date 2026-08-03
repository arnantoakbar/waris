/*
 * Orkestrator pembagian waris.
 *
 * Alur:
 *   1. hitung tirkah (harta yang boleh dibagi)
 *   2. terapkan hijab (siapa yang terhalang)
 *   3. cek kasus khusus yang mengubah aturan
 *   4. bagian tetap (ashabul furudh)
 *   5. sisa untuk ashabah
 *   6. 'aul kalau bagian tetap melebihi harta
 *   7. radd kalau harta tersisa dan tidak ada ashabah
 *   8. konversi ke rupiah
 */

(function (root) {
  'use strict';

  var f = root.Fraction;
  var H = root.Heirs;
  var F = f.F;

  function lcmList(list) {
    return list.reduce(function (a, b) { return f.lcm(a, b); }, 1);
  }

  /**
   * @param {Object} input
   *   jenisKelamin  : 'L' | 'P'  jenis kelamin pewaris
   *   harta         : { total, hartaBersama, biayaJenazah, hutang, wasiat }
   *   ahliWaris     : { anak_lk: 2, istri: 1, ... }
   *   kondisi       : { bedaAgama, pembunuh, cucuDariAnakWafat, anakAngkat, istriHamil }
   */
  function hitung(input) {
    var kondisi = input.kondisi || {};
    var counts = {};
    Object.keys(input.ahliWaris || {}).forEach(function (k) {
      var v = parseInt(input.ahliWaris[k], 10) || 0;
      if (v > 0 && H.BY_KEY[k]) counts[k] = Math.min(v, H.BY_KEY[k].max);
    });

    // pasangan harus konsisten dengan jenis kelamin pewaris
    if (input.jenisKelamin === 'L') delete counts.suami;
    if (input.jenisKelamin === 'P') delete counts.istri;

    var adaPasangan = (counts.suami || 0) > 0 || (counts.istri || 0) > 0;
    var harta = root.Estate.hitung(input.harta || {}, adaPasangan);

    var hasilHijab = root.Hijab.terapkan(counts);
    var aktif = hasilHijab.aktif;

    var peringatan = [];
    var catatan = harta.catatan.slice();

    var out = {
      input: input,
      harta: harta,
      ahliWaris: [],
      perhitungan: {
        asalMasalah: 0, totalSiham: 0, asalMasalahAkhir: 0,
        siham: {}, aul: false, radd: false,
        kasusKhusus: null, langkah: []
      },
      sisaTidakTerbagi: null,
      pembulatan: 0,
      catatan: catatan,
      peringatan: peringatan,
      valid: true
    };

    if (!Object.keys(aktif).length) {
      out.valid = false;
      out.pesan = Object.keys(counts).length
        ? 'Semua ahli waris yang dimasukkan terhalang oleh yang lain. Periksa lagi isian kamu.'
        : 'Belum ada ahli waris yang dimasukkan.';
      return out;
    }

    // ── Kasus khusus yang menentukan seluruh hasil ───────────────────
    var khusus = root.Special.cekUmariyyatain(aktif)
              || root.Special.cekAkdariyyah(aktif)
              || root.Special.cekMusyarakah(aktif);

    var final = {};    // key -> Fraction (total per kelompok)
    var jenis = {};    // key -> 'fardh' | 'ashabah' | 'fardh+ashabah' | 'khusus' | 'radd'
    var alasan = {};
    var dalilKey = {};
    var fardh = {};

    if (khusus) {
      out.perhitungan.kasusKhusus = khusus;
      Object.keys(khusus.bagian).forEach(function (k) {
        final[k] = khusus.bagian[k];
        jenis[k] = 'khusus';
        alasan[k] = (khusus.alasan && khusus.alasan[k]) || khusus.penjelasan;
        dalilKey[k] = khusus.dalil;
      });
      out.perhitungan.langkah.push(khusus.nama + ': ' + khusus.penjelasan);
      if (khusus.khilafiyah) {
        catatan.push({ id: 'khilafiyah', tingkat: 'khilafiyah', teks: khusus.khilafiyah });
      }
    } else {
      // ── Alur normal ────────────────────────────────────────────────
      var kakekVsSaudara = (aktif.kakek || 0) > 0 &&
        ['sdr_lk_kandung', 'sdr_pr_kandung', 'sdr_lk_sebapak', 'sdr_pr_sebapak']
          .some(function (k) { return (aktif[k] || 0) > 0; });

      var hasilShares = root.Shares.hitung(aktif, counts, {
        lewatiKakek: kakekVsSaudara,
        lewatiFardhSaudara: kakekVsSaudara
      });
      fardh = hasilShares.fardh;

      Object.keys(fardh).forEach(function (k) {
        final[k] = fardh[k];
        jenis[k] = 'fardh';
        alasan[k] = hasilShares.alasan[k];
        dalilKey[k] = hasilShares.dalil[k];
      });

      // asal masalah sebelum 'aul
      var penyebut = Object.keys(fardh).map(function (k) { return fardh[k].d; });
      var am = penyebut.length ? lcmList(penyebut) : 1;
      var totalSiham = 0;
      Object.keys(fardh).forEach(function (k) {
        var s = fardh[k].n * (am / fardh[k].d);
        out.perhitungan.siham[k] = s;
        totalSiham += s;
      });
      out.perhitungan.asalMasalah = am;
      out.perhitungan.totalSiham = totalSiham;

      var totalFardh = f.sum(Object.keys(fardh).map(function (k) { return fardh[k]; }));

      if (f.gt(totalFardh, f.ONE)) {
        // ── 'AUL ────────────────────────────────────────────────────
        out.perhitungan.aul = true;
        Object.keys(fardh).forEach(function (k) {
          final[k] = f.div(fardh[k], totalFardh);
        });
        out.perhitungan.langkah.push(
          'Jumlah semua bagian tetap melebihi harta yang ada (' + totalSiham + '/' + am +
          '). Dalam keadaan ini penyebutnya dinaikkan menjadi ' + totalSiham +
          ' — disebut \'aul — sehingga semua ahli waris menyusut secara proporsional dan ' +
          'tidak ada yang dikorbankan.');
        catatan.push({
          id: 'aul', tingkat: 'info',
          teks: 'Terjadi \'aul: bagian semua ahli waris disusutkan proporsional karena total ' +
                'bagian tetap melebihi harta yang tersedia.'
        });
      } else {
        var sisa = f.sub(f.ONE, totalFardh);

        if (kakekVsSaudara) {
          // ── Kakek bersama saudara ─────────────────────────────────
          var ks = root.Special.kakekBersamaSaudara(aktif, sisa);
          out.perhitungan.kasusKhusus = ks;
          Object.keys(ks.bagian).forEach(function (k) {
            final[k] = f.add(final[k] || f.ZERO, ks.bagian[k]);
            jenis[k] = k === 'kakek' ? 'khusus' : 'ashabah';
            alasan[k] = k === 'kakek' ? ks.alasanKakek : ks.alasanSaudara;
            dalilKey[k] = ks.dalil;
          });
          out.perhitungan.langkah.push(ks.nama + ': ' + ks.penjelasan);
          if (ks.khilafiyah) {
            catatan.push({ id: 'khilafiyah', tingkat: 'khilafiyah', teks: ks.khilafiyah });
          }
          if (ks.perluKonsultasi) {
            peringatan.push({ id: 'muaddah', teks: ks.perluKonsultasi });
          }
          sisa = f.ZERO;
        } else if (!f.isZero(sisa)) {
          var ash = root.Ashabah.bagi(aktif, sisa);
          if (ash) {
            // ── ASHABAH ─────────────────────────────────────────────
            Object.keys(ash.bagian).forEach(function (k) {
              var sebelum = final[k];
              final[k] = f.add(sebelum || f.ZERO, ash.bagian[k]);
              jenis[k] = sebelum ? 'fardh+ashabah' : 'ashabah';
              alasan[k] = sebelum
                ? alasan[k] + ' ' + ash.alasan
                : ash.alasan;
              dalilKey[k] = dalilKey[k] || ash.dalil;
            });
            out.perhitungan.langkah.push('Sisa harta ' + f.toText(sisa) + ' — ' + ash.alasan);
            out.perhitungan.tipeAshabah = ash.tipe;
          } else {
            // ── RADD ────────────────────────────────────────────────
            var pasanganKeys = ['suami', 'istri'].filter(function (k) { return fardh[k]; });
            var lainKeys = Object.keys(fardh).filter(function (k) {
              return pasanganKeys.indexOf(k) === -1;
            });

            if (!lainKeys.length) {
              out.sisaTidakTerbagi = {
                bagian: sisa,
                alasan: 'Tidak ada ahli waris lain selain pasangan. Menurut fiqh klasik, sisa ' +
                        'harta diserahkan ke baitul mal (kas negara/lembaga sosial Islam). ' +
                        'Dalam praktik Pengadilan Agama di Indonesia, sisa ini biasanya ' +
                        'diberikan kepada pasangan.'
              };
            } else {
              out.perhitungan.radd = true;
              var totalLain = f.sum(lainKeys.map(function (k) { return fardh[k]; }));
              lainKeys.forEach(function (k) {
                var tambahan = f.mul(sisa, f.div(fardh[k], totalLain));
                final[k] = f.add(final[k], tambahan);
                jenis[k] = 'radd';
                alasan[k] = alasan[k] + ' Karena masih ada sisa harta dan tidak ada ahli ' +
                  'waris penerima sisa (ashabah), sisa itu dikembalikan lagi kepada ahli waris ' +
                  'sesuai besar bagiannya — disebut radd.';
              });
              var teksPasangan = pasanganKeys.length
                ? ' ' + H.label(pasanganKeys[0]) + ' tidak ikut menerima radd menurut pendapat jumhur ulama.'
                : '';
              out.perhitungan.langkah.push(
                'Masih ada sisa ' + f.toText(sisa) + ' dan tidak ada ahli waris penerima sisa. ' +
                'Sisa dikembalikan proporsional kepada ahli waris yang punya bagian tetap (radd).' +
                teksPasangan);
              catatan.push({
                id: 'radd', tingkat: 'info',
                teks: 'Terjadi radd: sisa harta dikembalikan kepada ahli waris yang ada, bukan ' +
                      'dibiarkan menganggur.' + teksPasangan
              });
            }
          }
        }
      }
    }

    // ── Susun daftar ahli waris untuk ditampilkan ────────────────────
    var tirkah = harta.tirkah;
    var totalNominal = 0;

    H.LIST.forEach(function (def) {
      var jumlahAktif = aktif[def.key] || 0;
      var terhalang = hasilHijab.terhalang.filter(function (t) { return t.key === def.key; })[0];

      if (!jumlahAktif && !terhalang) return;

      if (terhalang) {
        out.ahliWaris.push({
          key: def.key, label: def.label, jumlah: terhalang.jumlah,
          gender: def.gender, icon: def.icon, group: def.group,
          status: 'terhalang',
          bagian: f.ZERO, bagianTeks: '0', persen: 0,
          nominal: 0, nominalPerOrang: 0,
          terhalangOleh: terhalang.oleh,
          alasan: terhalang.alasan,
          dalil: 'hadits-ashabah'
        });
        return;
      }

      var b = final[def.key] || f.ZERO;
      var nominal = f.applyTo(tirkah, b);
      totalNominal += nominal;

      // Ahli waris yang berhak tapi tidak kebagian sepeser pun. Ini terjadi
      // saat bagian tetap ahli waris lain sudah menghabiskan seluruh harta
      // ('aul), sehingga tidak ada sisa untuk penerima sisa (ashabah). Tanpa
      // penjelasan ini, kartunya tampil kosong dan terlihat seperti bug.
      if (f.isZero(b) && !alasan[def.key]) {
        alasan[def.key] = out.perhitungan.aul
          ? 'Berhak menerima sisa harta, tapi bagian tetap ahli waris lain sudah ' +
            'menghabiskan seluruh harta sehingga tidak ada sisa yang tertinggal. ' +
            'Ini konsekuensi wajar dari \'aul, bukan karena terhalang.'
          : 'Berhak menerima sisa harta, tapi tidak ada sisa yang tertinggal setelah ' +
            'semua bagian tetap dibayarkan.';
        dalilKey[def.key] = dalilKey[def.key] || 'hadits-ashabah';
      }

      out.ahliWaris.push({
        key: def.key, label: def.label, jumlah: jumlahAktif,
        gender: def.gender, icon: def.icon, group: def.group,
        status: f.isZero(b) ? 'nol' : 'menerima',
        bagian: b,
        bagianTeks: f.toText(b),
        persen: f.toPercent(b),
        nominal: nominal,
        nominalPerOrang: Math.floor(nominal / jumlahAktif),
        jenis: jenis[def.key] || 'ashabah',
        alasan: alasan[def.key] || '',
        dalil: dalilKey[def.key] || null
      });
    });

    // sisa yang tidak terbagi (baitul mal)
    if (out.sisaTidakTerbagi) {
      out.sisaTidakTerbagi.nominal = f.applyTo(tirkah, out.sisaTidakTerbagi.bagian);
      out.sisaTidakTerbagi.bagianTeks = f.toText(out.sisaTidakTerbagi.bagian);
      out.sisaTidakTerbagi.persen = f.toPercent(out.sisaTidakTerbagi.bagian);
      totalNominal += out.sisaTidakTerbagi.nominal;
    }

    // sisa recehan akibat pembulatan ke bawah
    var perOrangTotal = out.ahliWaris.reduce(function (t, a) {
      return t + a.nominalPerOrang * (a.status === 'menerima' ? a.jumlah : 0);
    }, 0) + (out.sisaTidakTerbagi ? out.sisaTidakTerbagi.nominal : 0);
    out.pembulatan = Math.max(0, tirkah - perOrangTotal);

    // Asal masalah akhir: penyebut bersama setelah semua penyesuaian. Dipakai
    // untuk menampilkan pembagian dalam bentuk "sekian dari sekian bagian",
    // yang lebih mudah dicerna daripada deretan pecahan.
    var penerima = out.ahliWaris.filter(function (a) { return a.status === 'menerima'; });
    var penyebutAkhir = penerima.map(function (a) { return a.bagian.d; });
    if (out.sisaTidakTerbagi) penyebutAkhir.push(out.sisaTidakTerbagi.bagian.d);
    var amAkhir = penyebutAkhir.length ? lcmList(penyebutAkhir) : 0;
    out.perhitungan.asalMasalahAkhir = amAkhir;
    out.perhitungan.sihamAkhir = {};
    penerima.forEach(function (a) {
      a.siham = a.bagian.n * (amAkhir / a.bagian.d);
      out.perhitungan.sihamAkhir[a.key] = a.siham;
    });

    // ── Peringatan dari kondisi khusus ───────────────────────────────
    if (kondisi.istriHamil) {
      peringatan.push({
        id: 'hamil',
        teks: 'Ada istri yang sedang hamil. Anak dalam kandungan sudah punya hak waris, tapi ' +
              'bagiannya baru bisa dipastikan setelah lahir dan diketahui jenis kelaminnya. ' +
              'Tahan dulu bagian yang setara dengan satu anak laki-laki, lalu hitung ulang setelah kelahiran.'
      });
    }
    if (kondisi.bedaAgama) {
      peringatan.push({
        id: 'beda_agama',
        teks: 'Ada anggota keluarga yang berbeda agama. Rasulullah bersabda: "Orang muslim tidak ' +
              'mewarisi orang kafir, dan orang kafir tidak mewarisi orang muslim." (HR Bukhari & Muslim). ' +
              'Jangan masukkan mereka ke dalam hitungan di atas. Tapi mereka bisa diberi lewat ' +
              'hibah semasa hidup atau wasiat maksimal 1/3.',
        dalil: 'hadits-beda-agama'
      });
    }
    if (kondisi.pembunuh) {
      peringatan.push({
        id: 'pembunuh',
        teks: 'Ada ahli waris yang terlibat dalam kematian pewaris. Rasulullah bersabda: ' +
              '"Pembunuh tidak mendapat warisan." Orang tersebut gugur haknya dan tidak boleh ' +
              'dimasukkan ke dalam hitungan. Status ini sebaiknya ditetapkan lewat putusan pengadilan.',
        dalil: 'hadits-pembunuh'
      });
    }

    return out;
  }

  root.Faraid = { hitung: hitung };
})(typeof window !== 'undefined' ? window : globalThis);
