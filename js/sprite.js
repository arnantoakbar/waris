/*
 * Sprite ikon.
 *
 * Ditulis lewat document.write supaya <symbol>-nya sudah ada di dokumen
 * sebelum elemen <use> di markup di-parse. Dengan begitu ikon tidak pernah
 * berkedip kosong, dan definisinya cukup ditulis sekali untuk semua halaman.
 */
document.write('<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
  // Piktogram isi penuh bergaya rambu toilet, dipakai di pohon keluarga.
  // Sengaja sesederhana mungkin: yang perlu langsung terbaca hanya laki-laki
  // atau perempuan. Hubungan kekerabatannya dijelaskan lewat posisi di pohon.
  '<symbol id="p-pria" viewBox="0 0 24 24"><circle cx="12" cy="4.8" r="3.1"/>' +
  '<path d="M9.1 9h5.8a1.7 1.7 0 0 1 1.7 1.7v4.6h-1.9V22h-2.1v-6.2h-1.2V22H9.3v-6.7H7.4v-4.6A1.7 1.7 0 0 1 9.1 9z"/></symbol>' +
  '<symbol id="p-wanita" viewBox="0 0 24 24"><circle cx="12" cy="4.8" r="3.1"/>' +
  '<path d="M12 9c-2.5 0-3.4 1.6-4.1 3.8l-1.3 4h2.3V22h2.1v-5.2h2V22h2.1v-5.2h2.3l-1.3-4C15.4 10.6 14.5 9 12 9z"/></symbol>' +
  '<symbol id="i-pensil" viewBox="0 0 24 24"><path d="M16.5 4.6a1.9 1.9 0 0 1 2.7 2.7L8.4 18.1l-3.6.9.9-3.6z"/></symbol>' +
  '<symbol id="i-silang" viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></symbol>' +
  '<symbol id="i-sampah" viewBox="0 0 24 24"><path d="M4.5 6.6h15"/>' +
  '<path d="M9.4 6.6V4.9a1.4 1.4 0 0 1 1.4-1.4h2.4a1.4 1.4 0 0 1 1.4 1.4v1.7"/>' +
  '<path d="M6.6 6.6l.9 12.3a1.7 1.7 0 0 0 1.7 1.6h5.6a1.7 1.7 0 0 0 1.7-1.6l.9-12.3"/></symbol>' +
  '<symbol id="i-daftar" viewBox="0 0 24 24"><path d="M9 6.5h11M9 12h11M9 17.5h11"/>' +
  '<path d="M4.6 6.5h.01M4.6 12h.01M4.6 17.5h.01"/></symbol>' +
  // Logo GitHub. Bentuknya isi penuh, bukan garis seperti ikon lain, jadi
  // dipakai bersama kelas .ic-isi. Memakai logo ini untuk menautkan ke GitHub
  // diizinkan oleh pedoman merek mereka.
  '<symbol id="i-github" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 ' +
  '5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724' +
  '-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 ' +
  '1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76' +
  '-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105' +
  '-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28' +
  '-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 ' +
  '4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315' +
  '.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></symbol>' +
  '<symbol id="i-kode" viewBox="0 0 24 24"><path d="m8.4 7.6-4.6 4.4 4.6 4.4"/>' +
  '<path d="m15.6 7.6 4.6 4.4-4.6 4.4"/><path d="M13.4 4.6 10.6 19.4"/></symbol>' +
  '<symbol id="i-tautan" viewBox="0 0 24 24">' +
  '<path d="M10.6 13.4a3.6 3.6 0 0 0 5.4.4l2.2-2.2a3.6 3.6 0 0 0-5.1-5.1l-1.2 1.2"/>' +
  '<path d="M13.4 10.6a3.6 3.6 0 0 0-5.4-.4l-2.2 2.2a3.6 3.6 0 0 0 5.1 5.1l1.2-1.2"/></symbol>' +
  '<symbol id="i-pohon" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="4.4" rx="1.2"/>' +
  '<rect x="3" y="16.6" width="6" height="4.4" rx="1.2"/><rect x="15" y="16.6" width="6" height="4.4" rx="1.2"/>' +
  '<path d="M12 7.4v4.4M6 16.6v-2.4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2.4"/></symbol>' +
  '  <symbol id="i-pria" viewBox="0 0 24 24"><circle cx="12" cy="7.8" r="3.6"/><path d="M5.5 20v-1.6A5.4 5.4 0 0 1 10.9 13h2.2a5.4 5.4 0 0 1 5.4 5.4V20"/></symbol>' +
  '  <symbol id="i-wanita" viewBox="0 0 24 24"><circle cx="12" cy="7.4" r="3.3"/><path d="M12 11.8c-2.7 0-4.1 2-4.8 4.5L6.2 20h11.6l-1-3.7c-.7-2.5-2.1-4.5-4.8-4.5z"/></symbol>' +
  '  <symbol id="i-anak-pria" viewBox="0 0 24 24"><circle cx="12" cy="9.2" r="3"/><path d="M7.6 20v-2.2a4.4 4.4 0 0 1 8.8 0V20"/></symbol>' +
  '  <symbol id="i-anak-wanita" viewBox="0 0 24 24"><circle cx="12" cy="9" r="2.8"/><path d="M12 12.6c-2.1 0-3.2 1.7-3.7 3.6L7.6 20h8.8l-.7-3.8c-.5-1.9-1.6-3.6-3.7-3.6z"/></symbol>' +
  '  <symbol id="i-lansia-pria" viewBox="0 0 24 24"><circle cx="10.2" cy="7.4" r="3.2"/><path d="M4.6 20v-1.6A5.2 5.2 0 0 1 9.8 13h1a5.2 5.2 0 0 1 5.2 5.4V20"/><path d="M19.4 10.5V20"/></symbol>' +
  '  <symbol id="i-lansia-wanita" viewBox="0 0 24 24"><circle cx="10.2" cy="7.2" r="3"/><path d="M10.2 11.4c-2.5 0-3.8 1.9-4.4 4.3L4.9 20h10.6l-.9-4.3c-.6-2.4-1.9-4.3-4.4-4.3z"/><path d="M19.4 10.5V20"/></symbol>' +
  '' +
  '  <symbol id="i-rumah" viewBox="0 0 24 24"><path d="M3.5 11 12 4.4l8.5 6.6"/><path d="M6 10v9.5h12V10"/><path d="M10 19.5V14h4v5.5"/></symbol>' +
  '  <symbol id="i-tanah" viewBox="0 0 24 24"><path d="M12 4 21 9.5 12 15 3 9.5z"/><path d="M3 14l9 5.5 9-5.5"/></symbol>' +
  '  <symbol id="i-mobil" viewBox="0 0 24 24"><path d="M4 16.5v-3.2l1.8-4.4A2 2 0 0 1 7.7 7.6h8.6a2 2 0 0 1 1.9 1.3l1.8 4.4v3.2"/><path d="M3.2 13.3h17.6"/><circle cx="7.6" cy="17.4" r="1.4"/><circle cx="16.4" cy="17.4" r="1.4"/></symbol>' +
  '  <symbol id="i-toko" viewBox="0 0 24 24"><path d="M4.5 9.5h15V20h-15z"/><path d="M3 9.5 4.6 4.5h14.8L21 9.5"/><path d="M9.5 20v-5.5h5V20"/></symbol>' +
  '  <symbol id="i-dompet" viewBox="0 0 24 24"><rect x="3" y="6.5" width="18" height="12" rx="2.6"/><path d="M3 10.5h18"/><circle cx="16.8" cy="14.6" r="1.1"/></symbol>' +
  '  <symbol id="i-emas" viewBox="0 0 24 24"><path d="M8.4 9.5h7.2l1.4 3.6H7z"/><path d="M4.6 15.2h6.5l1.3 3.6H3.3z"/><path d="M12.9 15.2h6.5l1.3 3.6h-9.1z"/></symbol>' +
  '  <symbol id="i-kotak" viewBox="0 0 24 24"><path d="M3.5 8 12 4l8.5 4v8L12 20l-8.5-4z"/><path d="M3.5 8 12 12l8.5-4"/><path d="M12 12v8"/></symbol>' +
  '' +
  '  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></symbol>' +
  '  <symbol id="i-minus" viewBox="0 0 24 24"><path d="M6 12h12"/></symbol>' +
  '  <symbol id="i-chevron" viewBox="0 0 24 24"><path d="m6 9.5 6 6 6-6"/></symbol>' +
  '  <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.6 4.5L19 7.5"/></symbol>' +
  '  <symbol id="i-unduh" viewBox="0 0 24 24"><path d="M12 4v10.5"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M4.5 19.5h15"/></symbol>' +
  '  <symbol id="i-gambar" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="14" rx="2.4"/><circle cx="8.6" cy="9.8" r="1.5"/><path d="m4.2 17 4.6-4.4 3.4 3.2 3-2.6 4.4 3.8"/></symbol>' +
  '  <symbol id="i-ulang" viewBox="0 0 24 24"><path d="M19.5 12a7.5 7.5 0 1 1-2.4-5.5"/><path d="M19.8 4.5v4.2h-4.2"/></symbol>' +
  '  <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.4"/><path d="M12 11.2v5"/><path d="M12 8.2h.01"/></symbol>' +
  '  <symbol id="i-kitab" viewBox="0 0 24 24"><path d="M4 5.2A1.7 1.7 0 0 1 5.7 3.5H19v15.8H5.7A1.7 1.7 0 0 0 4 21z"/><path d="M4 5.2v13.6"/><path d="M8 8h7M8 11.5h5"/></symbol>' +
  '  <symbol id="i-waspada" viewBox="0 0 24 24"><path d="M12 4.2 21 19.5H3z"/><path d="M12 10v4"/><path d="M12 16.8h.01"/></symbol>' +
  '  <symbol id="i-kanan" viewBox="0 0 24 24"><path d="M5 12h13.5"/><path d="m13 6.5 5.5 5.5-5.5 5.5"/></symbol>' +
  '  <symbol id="i-kiri" viewBox="0 0 24 24"><path d="M19 12H5.5"/><path d="m11 17.5-5.5-5.5 5.5-5.5"/></symbol>' +
  '  <symbol id="i-dokumen" viewBox="0 0 24 24"><path d="M13.5 3.5H7a1.8 1.8 0 0 0-1.8 1.8v13.4A1.8 1.8 0 0 0 7 20.5h10a1.8 1.8 0 0 0 1.8-1.8V8.8z"/><path d="M13.5 3.5v5.3h5.3"/><path d="M8.6 13h6.8M8.6 16.4h4.5"/></symbol>' +
  '  <symbol id="i-timbangan" viewBox="0 0 24 24"><path d="M12 4.5V20"/><path d="M7 20h10"/><path d="M4 8h16"/><path d="M4 8 1.8 13.4h4.4z"/><path d="M20 8l-2.2 5.4h4.4z"/></symbol>' +
  '  <symbol id="i-hati" viewBox="0 0 24 24"><path d="M12 19.5S4 14.6 4 9.6a4.1 4.1 0 0 1 8-1.4 4.1 4.1 0 0 1 8 1.4c0 5-8 9.9-8 9.9z"/></symbol>' +
  '</defs></svg>');
