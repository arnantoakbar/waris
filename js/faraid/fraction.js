/*
 * Aritmatika pecahan bilangan bulat.
 *
 * Pembagian waris penuh dengan 1/3, 1/6, 1/8. Floating point tidak bisa
 * menyimpan angka itu dengan tepat (0.1 + 0.2 !== 0.3), dan di sini selisih
 * satu bit berarti hasil bagi yang salah. Jadi semua perhitungan bagian
 * memakai pasangan bilangan bulat {n, d} yang selalu disederhanakan.
 */

(function (root) {
  'use strict';

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      var t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  /** Buat pecahan tersederhana. F(3, 6) -> 1/2 */
  function F(n, d) {
    if (d === undefined) d = 1;
    if (d === 0) throw new Error('Penyebut pecahan tidak boleh nol');
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d);
    return { n: n / g, d: d / g };
  }

  var ZERO = F(0, 1);
  var ONE = F(1, 1);

  function add(a, b) { return F(a.n * b.d + b.n * a.d, a.d * b.d); }
  function sub(a, b) { return F(a.n * b.d - b.n * a.d, a.d * b.d); }
  function mul(a, b) { return F(a.n * b.n, a.d * b.d); }
  function div(a, b) {
    if (b.n === 0) throw new Error('Pembagian pecahan dengan nol');
    return F(a.n * b.d, a.d * b.n);
  }

  function isZero(a) { return a.n === 0; }
  function eq(a, b) { return a.n * b.d === b.n * a.d; }
  /** -1 jika a < b, 0 jika sama, 1 jika a > b */
  function cmp(a, b) {
    var l = a.n * b.d, r = b.n * a.d;
    return l < r ? -1 : l > r ? 1 : 0;
  }
  function gt(a, b) { return cmp(a, b) > 0; }
  function lt(a, b) { return cmp(a, b) < 0; }
  function max(a, b) { return gt(a, b) ? a : b; }

  function sum(list) {
    return list.reduce(function (acc, f) { return add(acc, f); }, ZERO);
  }

  function toNumber(a) { return a.n / a.d; }

  /** "1/8", "2/3", "0", "1" */
  function toText(a) {
    if (a.n === 0) return '0';
    if (a.d === 1) return String(a.n);
    return a.n + '/' + a.d;
  }

  /** Persen dengan maksimal 2 desimal, tanpa nol di belakang. */
  function toPercent(a, digits) {
    if (digits === undefined) digits = 2;
    var v = toNumber(a) * 100;
    return parseFloat(v.toFixed(digits));
  }

  /**
   * Bagian dalam rupiah, dibulatkan ke bawah ke rupiah penuh.
   * Memakai BigInt supaya nominal besar (miliaran/triliunan) tetap tepat.
   */
  function applyTo(amount, frac) {
    if (frac.n === 0) return 0;
    var a = BigInt(Math.round(amount));
    var res = (a * BigInt(frac.n)) / BigInt(frac.d);
    return Number(res);
  }

  root.Fraction = {
    F: F, ZERO: ZERO, ONE: ONE,
    gcd: gcd, lcm: lcm,
    add: add, sub: sub, mul: mul, div: div, sum: sum,
    isZero: isZero, eq: eq, cmp: cmp, gt: gt, lt: lt, max: max,
    toNumber: toNumber, toText: toText, toPercent: toPercent,
    applyTo: applyTo
  };
})(typeof window !== 'undefined' ? window : globalThis);
