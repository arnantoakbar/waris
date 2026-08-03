/*
 * Export hasil ke PNG dan PDF.
 *
 * Sengaja tanpa pustaka pihak ketiga:
 *  - PNG  : kartu ringkasan digambar langsung ke <canvas>. Hasilnya rapi dan
 *           konsisten, bukan screenshot yang ikut terpotong.
 *  - PDF  : lewat dialog cetak browser (Simpan sebagai PDF), diatur oleh
 *           css/print.css. Teksnya tetap bisa diseleksi dan dicari, ukuran
 *           filenya kecil, dan tidak ada satu byte pun yang keluar dari
 *           perangkat.
 */

(function (root) {
  'use strict';

  var f = root.Fraction;
  var W = 1080;              // lebar kanvas
  var PAD = 72;
  var CREAM = '#FFF8F0';
  var CHARCOAL = '#111111';
  var MID = '#555555';
  var LIGHT = '#999999';
  var FLAME = '#E8391D';

  function rp(n) {
    return 'Rp ' + String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function tanggalHariIni() {
    var bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
      'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    var d = new Date();
    return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
  }

  // ═══════════════════════════════════════════════════════════════
  // Piktogram & pohon keluarga di atas kanvas
  // ═══════════════════════════════════════════════════════════════

  /** Piktogram orang bergaya rambu toilet, digambar langsung ke kanvas. */
  function piktogram(ctx, x, y, ukuran, gender, warna) {
    var s = ukuran / 24;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = warna;

    ctx.beginPath();
    ctx.arc(12, 4.8, 3.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    if (gender === 'P') {
      // gaun segitiga + dua kaki
      ctx.moveTo(12, 9);
      ctx.lineTo(7.9, 12.8);
      ctx.lineTo(6.6, 16.4);
      ctx.lineTo(8.9, 16.4);
      ctx.lineTo(8.9, 22);
      ctx.lineTo(11, 22);
      ctx.lineTo(11, 16.8);
      ctx.lineTo(13, 16.8);
      ctx.lineTo(13, 22);
      ctx.lineTo(15.1, 22);
      ctx.lineTo(15.1, 16.4);
      ctx.lineTo(17.4, 16.4);
      ctx.lineTo(16.1, 12.8);
      ctx.closePath();
    } else {
      // badan persegi + dua kaki
      ctx.moveTo(7.4, 10.7);
      ctx.lineTo(7.4, 15.3);
      ctx.lineTo(9.3, 15.3);
      ctx.lineTo(9.3, 22);
      ctx.lineTo(11.4, 22);
      ctx.lineTo(11.4, 15.8);
      ctx.lineTo(12.6, 15.8);
      ctx.lineTo(12.6, 22);
      ctx.lineTo(14.7, 22);
      ctx.lineTo(14.7, 15.3);
      ctx.lineTo(16.6, 15.3);
      ctx.lineTo(16.6, 10.7);
      ctx.closePath();
    }
    ctx.fill();
    ctx.restore();
  }

  function kotakBulat(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /** Tampilan tiap status simpul, disamakan dengan yang di layar. */
  var GAYA = {
    pewaris:   { isi: '#111111', garis: '#111111', putus: null, teks: '#FFF8F0', ket: 'rgba(255,248,240,0.6)', ikon: '#F5A623' },
    menerima:  { isi: 'rgba(232,57,29,0.06)', garis: '#E8391D', putus: null, teks: '#111111', ket: '#A0341A', ikon: '#E8391D' },
    kosong:    { isi: '#FFFFFF', garis: '#F5A623', putus: [4, 3], teks: '#111111', ket: '#A0341A', ikon: '#F5A623' },
    terhalang: { isi: 'rgba(17,17,17,0.03)', garis: 'rgba(17,17,17,0.2)', putus: [4, 3], teks: '#555555', ket: '#999999', ikon: '#999999' },
    bukan:     { isi: '#FFFFFF', garis: 'rgba(17,17,17,0.22)', putus: [2, 3], teks: '#555555', ket: '#999999', ikon: 'rgba(17,17,17,0.3)' },
    wafat:     { isi: '#FFFFFF', garis: 'rgba(17,17,17,0.2)', putus: [4, 3], teks: '#999999', ket: '#999999', ikon: 'rgba(17,17,17,0.25)' },
    hantu:     { isi: '#FFFFFF', garis: 'rgba(17,17,17,0.16)', putus: [4, 3], teks: '#999999', ket: '#999999', ikon: 'rgba(17,17,17,0.2)' },
    ada:       { isi: '#FFF0E0', garis: '#F5A623', putus: null, teks: '#111111', ket: '#A0341A', ikon: '#F5760A' }
  };

  /**
   * Gambar pohon keluarga ke kanvas, memakai tata letak yang sama persis
   * dengan yang tampil di layar.
   * @returns {number} tinggi yang terpakai
   */
  function gambarPohon(ctx, data, atas, lebarTersedia) {
    var skala = Math.min(1, lebarTersedia / data.lebar);
    var offsetX = PAD + (lebarTersedia - data.lebar * skala) / 2;

    function petaX(v) { return offsetX + v * skala; }
    function petaY(v) { return atas + v * skala; }

    // ── Garis penghubung, digambar lebih dulu supaya berada di belakang ──
    Object.keys(data.sisi).forEach(function (anakId) {
      var kAnak = data.kotak[anakId];
      if (!kAnak) return;
      var ortu = (data.sisi[anakId] || []).map(function (id) { return data.kotak[id]; }).filter(Boolean);
      if (!ortu.length) return;

      var pangkalX = ortu.reduce(function (t, k) { return t + k.x + k.w / 2; }, 0) / ortu.length;
      var pangkalY = Math.max.apply(null, ortu.map(function (k) { return k.y + k.h; }));
      if (kAnak.y <= pangkalY) return;
      var tengahY = pangkalY + (kAnak.y - pangkalY) / 2;

      ctx.save();
      ctx.strokeStyle = 'rgba(232,57,29,0.28)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(petaX(pangkalX), petaY(pangkalY));
      ctx.lineTo(petaX(pangkalX), petaY(tengahY));
      ctx.lineTo(petaX(kAnak.x + kAnak.w / 2), petaY(tengahY));
      ctx.lineTo(petaX(kAnak.x + kAnak.w / 2), petaY(kAnak.y));
      ctx.stroke();
      ctx.restore();
    });

    // ── Simpul ───────────────────────────────────────────────────
    data.simpul.forEach(function (s) {
      var g = GAYA[s.status] || GAYA.hantu;
      var x = petaX(s.kotak.x), y = petaY(s.kotak.y);
      var w = s.kotak.w * skala, h = s.kotak.h * skala;

      ctx.save();
      kotakBulat(ctx, x, y, w, h, 10 * skala);
      ctx.fillStyle = g.isi;
      ctx.fill();
      ctx.strokeStyle = g.garis;
      ctx.lineWidth = 1.6;
      if (g.putus) ctx.setLineDash(g.putus);
      ctx.stroke();
      ctx.restore();

      var ukIkon = 26 * skala;
      piktogram(ctx, x + w / 2 - ukIkon / 2, y + 9 * skala, ukIkon, s.gender, g.ikon);

      ctx.textAlign = 'center';
      var ty = y + 9 * skala + ukIkon + 15 * skala;

      ctx.fillStyle = g.teks;
      ctx.font = '700 ' + (12 * skala).toFixed(1) + 'px "DM Sans", sans-serif';
      ctx.fillText(s.nama || '', x + w / 2, ty, w - 6);
      ty += 12 * skala;

      ctx.fillStyle = g.ket;
      ctx.font = '400 ' + (9.5 * skala).toFixed(1) + 'px "DM Sans", sans-serif';
      pecahBaris(ctx, s.jalur || '', w - 8).slice(0, 2).forEach(function (b) {
        ctx.fillText(b, x + w / 2, ty, w - 6);
        ty += 10.5 * skala;
      });

      if (s.bagian) {
        ctx.fillStyle = '#E8391D';
        ctx.font = '800 ' + (15 * skala).toFixed(1) + 'px "Bricolage Grotesque", "Arial Black", sans-serif';
        ty += 3 * skala;
        ctx.fillText(s.bagian, x + w / 2, ty, w - 6);
        ty += 12 * skala;
      }
      if (s.rp) {
        ctx.fillStyle = MID;
        ctx.font = '600 ' + (9.5 * skala).toFixed(1) + 'px "DM Sans", sans-serif';
        ctx.fillText(s.rp, x + w / 2, ty, w - 6);
        ty += 11 * skala;
      }
      if (s.catatan) {
        ctx.fillStyle = g.ket;
        ctx.font = '700 ' + (8 * skala).toFixed(1) + 'px "DM Sans", sans-serif';
        ctx.fillText(s.catatan.toUpperCase(), x + w / 2, ty, w - 6);
      }
      ctx.textAlign = 'left';
    });

    return data.tinggi * skala;
  }

  /** Bungkus teks ke beberapa baris sesuai lebar maksimum. */
  function pecahBaris(ctx, teks, lebarMaks) {
    var kata = teks.split(' ');
    var baris = [];
    var kini = '';
    kata.forEach(function (k) {
      var coba = kini ? kini + ' ' + k : k;
      if (ctx.measureText(coba).width > lebarMaks && kini) {
        baris.push(kini);
        kini = k;
      } else {
        kini = coba;
      }
    });
    if (kini) baris.push(kini);
    return baris;
  }

  // ═══════════════════════════════════════════════════════════════
  // PNG
  // ═══════════════════════════════════════════════════════════════
  function gambarKartu(hasil) {
    var penerima = hasil.ahliWaris.filter(function (a) { return a.status === 'menerima'; });
    var terhalang = hasil.ahliWaris.filter(function (a) { return a.status === 'terhalang'; });
    var warna = root.UIResult.WARNA;

    // Tinggi sementara dilebihkan; kanvas dipotong ke tinggi isi sebenarnya
    // di akhir fungsi supaya tidak ada ruang kosong menggantung di bawah.
    var dataPohon = root.Pohon && root.Pohon.dataUntukEkspor(document.getElementById('pohon-hasil'));
    var lebarIsi = W - PAD * 2;
    var tinggiPohon = dataPohon
      ? dataPohon.tinggi * Math.min(1, lebarIsi / dataPohon.lebar) + 90
      : 0;

    var tinggiDonut = penerima.length ? 500 : 0;
    var tinggi = 340 + tinggiDonut + tinggiPohon + penerima.length * 78 +
      (terhalang.length ? 70 + terhalang.length * 42 : 0) + 520;

    var skala = 2; // untuk layar beresolusi tinggi
    var kanvas = document.createElement('canvas');
    kanvas.width = W * skala;
    kanvas.height = tinggi * skala;
    var ctx = kanvas.getContext('2d');
    ctx.scale(skala, skala);
    ctx.textBaseline = 'alphabetic';

    // latar
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, W, tinggi);
    // garis aksen atas
    var grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, FLAME);
    grad.addColorStop(1, '#F5A623');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 8);

    var y = 96;

    // ── Kepala ───────────────────────────────────────────────────
    ctx.fillStyle = FLAME;
    ctx.font = '700 20px "DM Sans", sans-serif';
    ctx.fillText('PEMBAGIAN WARISAN MENURUT SYARIAT ISLAM', PAD, y);
    y += 52;

    ctx.fillStyle = CHARCOAL;
    ctx.font = '800 52px "Bricolage Grotesque", "Arial Black", sans-serif';
    ctx.fillText('Hasil perhitungan waris', PAD, y);
    y += 44;

    ctx.fillStyle = MID;
    ctx.font = '400 22px "DM Sans", sans-serif';
    ctx.fillText('Harta siap dibagi: ' + rp(hasil.harta.tirkah) + '   ·   ' + tanggalHariIni(), PAD, y);
    y += 56;

    // ── Donut ────────────────────────────────────────────────────
    if (penerima.length) {
      var cx = W / 2, cy = y + 180, R = 150, tebal = 56;
      var mulai = -Math.PI / 2;

      penerima.forEach(function (a, i) {
        var sudut = f.toNumber(a.bagian) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, R, mulai, mulai + sudut);
        ctx.strokeStyle = warna[i % warna.length];
        ctx.lineWidth = tebal;
        ctx.stroke();
        mulai += sudut;
      });

      if (hasil.sisaTidakTerbagi) {
        var s = f.toNumber(hasil.sisaTidakTerbagi.bagian) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, R, mulai, mulai + s);
        ctx.strokeStyle = '#CCC4BB';
        ctx.lineWidth = tebal;
        ctx.stroke();
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = CHARCOAL;
      ctx.font = '800 34px "Bricolage Grotesque", "Arial Black", sans-serif';
      ctx.fillText(root.UIResult.rpRingkas(hasil.harta.tirkah), cx, cy + 4);
      ctx.fillStyle = LIGHT;
      ctx.font = '700 15px "DM Sans", sans-serif';
      ctx.fillText('DIBAGI KE ' + penerima.length + ' PIHAK', cx, cy + 32);
      ctx.textAlign = 'left';

      y = cy + R + 100;
    }

    // ── Pohon keluarga ───────────────────────────────────────────
    if (dataPohon) {
      ctx.fillStyle = FLAME;
      ctx.font = '700 17px "DM Sans", sans-serif';
      ctx.fillText('POSISINYA DALAM KELUARGA', PAD, y);
      y += 30;
      y += gambarPohon(ctx, dataPohon, y, lebarIsi);
      y += 46;
    }

    // ── Daftar penerima ──────────────────────────────────────────
    penerima.forEach(function (a, i) {
      ctx.fillStyle = warna[i % warna.length];
      ctx.fillRect(PAD, y - 22, 10, 44);

      ctx.fillStyle = CHARCOAL;
      ctx.font = '600 24px "DM Sans", sans-serif';
      ctx.fillText(a.label + (a.jumlah > 1 ? '  ×' + a.jumlah : ''), PAD + 28, y);

      ctx.fillStyle = LIGHT;
      ctx.font = '400 17px "DM Sans", sans-serif';
      var sub = a.persen + '%' + (a.jumlah > 1 ? '  ·  ' + rp(a.nominalPerOrang) + ' per orang' : '');
      ctx.fillText(sub, PAD + 28, y + 24);

      ctx.textAlign = 'right';
      ctx.fillStyle = CHARCOAL;
      ctx.font = '800 30px "Bricolage Grotesque", "Arial Black", sans-serif';
      ctx.fillText(a.bagianTeks, W - PAD, y);
      ctx.fillStyle = MID;
      ctx.font = '600 18px "DM Sans", sans-serif';
      ctx.fillText(rp(a.nominal), W - PAD, y + 24);
      ctx.textAlign = 'left';

      y += 78;
    });

    if (hasil.sisaTidakTerbagi) {
      ctx.fillStyle = MID;
      ctx.font = '400 19px "DM Sans", sans-serif';
      ctx.fillText('Belum ada yang berhak: ' + hasil.sisaTidakTerbagi.bagianTeks + '  ·  ' +
        rp(hasil.sisaTidakTerbagi.nominal), PAD, y);
      y += 48;
    }

    // ── Yang terhalang ───────────────────────────────────────────
    if (terhalang.length) {
      y += 20;
      ctx.fillStyle = FLAME;
      ctx.font = '700 17px "DM Sans", sans-serif';
      ctx.fillText('TIDAK MENDAPAT BAGIAN', PAD, y);
      y += 34;
      terhalang.forEach(function (a) {
        ctx.fillStyle = MID;
        ctx.font = '400 19px "DM Sans", sans-serif';
        var oleh = a.terhalangOleh.map(function (k) { return root.Heirs.label(k).toLowerCase(); })
          .filter(function (v, idx, s) { return s.indexOf(v) === idx; }).join(', ');
        ctx.fillText(a.label + (a.jumlah > 1 ? ' ×' + a.jumlah : '') + ' — terhalang oleh ' + oleh, PAD, y);
        y += 42;
      });
    }

    // ── Kaki ─────────────────────────────────────────────────────
    y += 40;
    ctx.strokeStyle = 'rgba(232,57,29,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, y);
    ctx.lineTo(W - PAD, y);
    ctx.stroke();
    y += 44;

    // Peringatan dibuat menonjol, bukan sekadar catatan kaki kecil. Lembar ini
    // akan beredar di grup keluarga lepas dari websitenya, jadi peringatannya
    // harus ikut ke mana pun gambarnya pergi.
    var tinggiKotak = 132;
    kotakBulat(ctx, PAD, y, W - PAD * 2, tinggiKotak, 14);
    ctx.fillStyle = 'rgba(232,57,29,0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,57,29,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = FLAME;
    ctx.font = '800 20px "Bricolage Grotesque", "Arial Black", sans-serif';
    ctx.fillText('Jangan jadikan ini sumber utama', PAD + 24, y + 34);

    ctx.fillStyle = CHARCOAL;
    ctx.font = '400 16px "DM Sans", sans-serif';
    var awas = 'Verifikasi dan validasikan hasil ini kepada ustadz atau ulama terdekat, atau ke ' +
      'Pengadilan Agama, sebelum dipakai membagi harta yang sebenarnya. Kalkulator tidak bisa ' +
      'melihat hal yang tidak diisikan — hibah semasa hidup, status harta bawaan, atau ahli ' +
      'waris yang belum diketahui.';
    var yy = y + 60;
    pecahBaris(ctx, awas, W - PAD * 2 - 48).forEach(function (b) {
      ctx.fillText(b, PAD + 24, yy);
      yy += 23;
    });
    y += tinggiKotak + 34;

    ctx.fillStyle = MID;
    ctx.font = '400 16px "DM Sans", sans-serif';
    var kaki = 'Dihitung menurut ketetapan QS An-Nisa ayat 11, 12, dan 176 serta hadits-hadits ' +
      'sahih tentang waris, mengikuti fiqh mazhab Syafi\'i. Rujukan lengkapnya ada di halaman ' +
      'Rujukan (rujukan.html) pada situs ini.';
    pecahBaris(ctx, kaki, W - PAD * 2).forEach(function (b) {
      ctx.fillText(b, PAD, y);
      y += 24;
    });

    y += 20;
    ctx.fillStyle = CHARCOAL;
    ctx.font = '800 22px "Bricolage Grotesque", "Arial Black", sans-serif';
    ctx.fillText('Waris', PAD, y);
    ctx.fillStyle = LIGHT;
    ctx.font = '400 18px "DM Sans", sans-serif';
    ctx.fillText('  by Flavida', PAD + ctx.measureText('Waris').width + 14, y);

    // ── Potong ke tinggi isi ─────────────────────────────────────
    var tinggiAkhir = Math.min(tinggi, y + 56);
    var potong = document.createElement('canvas');
    potong.width = W * skala;
    potong.height = tinggiAkhir * skala;
    var pctx = potong.getContext('2d');
    pctx.fillStyle = CREAM;
    pctx.fillRect(0, 0, potong.width, potong.height);
    pctx.drawImage(kanvas, 0, 0, W * skala, tinggiAkhir * skala,
                            0, 0, W * skala, tinggiAkhir * skala);
    return potong;
  }

  function unduhPNG(hasil) {
    var lanjut = function () {
      var kanvas = gambarKartu(hasil);
      kanvas.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'pembagian-waris-' + new Date().toISOString().slice(0, 10) + '.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      }, 'image/png');
    };
    // tunggu font selesai dimuat supaya kanvas tidak memakai font pengganti
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(lanjut);
    else lanjut();
  }

  // ═══════════════════════════════════════════════════════════════
  // PDF (lewat dialog cetak)
  // ═══════════════════════════════════════════════════════════════
  function unduhPDF() {
    // semua kartu penjelasan dibuka dulu agar ikut tercetak
    Array.prototype.forEach.call(document.querySelectorAll('.hasil-kartu'), function (k) {
      k.classList.add('buka');
    });
    window.print();
  }

  function pasang(hasil) {
    var btnPng = document.getElementById('btn-png');
    var btnPdf = document.getElementById('btn-pdf');
    if (btnPng) btnPng.onclick = function () { unduhPNG(hasil); };
    if (btnPdf) btnPdf.onclick = unduhPDF;
  }

  root.WarisExport = { pasang: pasang, unduhPNG: unduhPNG, unduhPDF: unduhPDF, gambarKartu: gambarKartu };
})(typeof window !== 'undefined' ? window : globalThis);
