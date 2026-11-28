// DigitalNetCare@copyright
// ===== BLOK: DNC_CONFIG =====
const IS_PREVIEW = false; // Ubah menjadi false SAAT DEPLOY PRODUKSI agar terhubung murni ke Firebase tanpa data dummy

// Konfigurasi Firebase Produksi Anda
const firebaseConfig = {
  apiKey: "AIzaSyDevD5JTzphc-jdpsxJJ6a6psH0tWJyjgI",
  authDomain: "asesmen-sumatif-akhir-se-b2baa.firebaseapp.com",
  projectId: "asesmen-sumatif-akhir-se-b2baa",
  storageBucket: "asesmen-sumatif-akhir-se-b2baa.firebasestorage.app",
  messagingSenderId: "359180699832",
  appId: "1:359180699832:web:5b1974b35aeea73c13cc4d",
  measurementId: "G-SV4B41K7ST"
};

const COLLECTIONS = {
  pengguna: 'pengguna',
  kelas: 'kelas',
  mataPelajaran: 'mata_pelajaran',
  bankSoal: 'bank_soal',
  paketAsas: 'paket_asas',
  hasilUjian: 'hasil_ujian'
};

const GAS_EMAIL_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxyX9EZRF0DDijgsEqA_wV8DcXLlYbi_mne6Fh_y1yb8NuRHVvxMabBfureKYfS0aYb9w/exec'; // Tempel URL /exec hasil deploy EmailWebhook.gs di Tahap 4
const GAS_EMAIL_SECRET = 'DNC_ASAS_BIMBEL_2026_KEY'; // Harus sama persis dengan SECRET_KEY di EmailWebhook.gs

const MENU_DAFTAR = [
  { id: 'DNC-M1', label: 'Dashboard', pendek: 'Beranda', icon: 'icon-dashboard', roles: ['Admin', 'Guru', 'Guru Bimbel'] },
  { id: 'DNC-M2', label: 'Master Kelas & Mapel', pendek: 'Master', icon: 'icon-master', roles: ['Admin', 'Guru', 'Guru Bimbel'] },
  { id: 'DNC-M3', label: 'Bank Soal', pendek: 'Soal', icon: 'icon-bank', roles: ['Admin', 'Guru', 'Guru Bimbel'] },
  { id: 'DNC-M4', label: 'Jadwal & Paket Ruang Asesmen Digital (RAD)', pendek: 'Paket', icon: 'icon-jadwal', roles: ['Admin', 'Guru'] },
  { id: 'DNC-M5', label: 'Ruang Asesmen Digital (RAD)', pendek: 'Ujian', icon: 'icon-ujian', roles: ['Siswa', 'Siswa Bimbel'] },
  { id: 'DNC-M6', label: 'Hasil & Rekap Nilai', pendek: 'Nilai', icon: 'icon-hasil', roles: ['Admin', 'Guru', 'Guru Bimbel', 'Siswa', 'Siswa Bimbel'] },
  { id: 'DNC-M7', label: 'Manajemen Pengguna', pendek: 'Pengguna', icon: 'icon-users', roles: ['Admin'] },
  { id: 'DNC-M8', label: 'Profil & Sandi', pendek: 'Profil', icon: 'icon-users', roles: ['Siswa Bimbel'] }
];

const TINGKAT_LIST = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const TIPE_SOAL_LIST = ['Pilihan Ganda', 'Pilihan Ganda Kompleks', 'Benar/Salah', 'Isian Singkat', 'Uraian'];
const KATEGORI_SOAL_LIST = ['ASAS', 'TKA'];
// ===== AKHIR BLOK: DNC_CONFIG =====

// ===== BLOK: DNC_PWA =====
function inisialisasiPwaDnc() {
  try {
    const ikonSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='36' fill='%232563EB'/%3E%3Cpath d='M48 64h96M48 96h68M48 128h46' stroke='%23FFFFFF' stroke-width='14' stroke-linecap='round'/%3E%3Ccircle cx='136' cy='124' r='22' fill='%23F59E0B'/%3E%3C/svg%3E";
    const manifestObj = {
      name: 'Ruang Asesmen Digital (RAD) - DigitalNetCare',
      short_name: 'Portal RAD',
      start_url: location.href,
      scope: './',
      display: 'standalone',
      background_color: '#F8FAFC',
      theme_color: '#2563EB',
      icons: [{ src: ikonSvg, sizes: '192x192', type: 'image/svg+xml', purpose: 'any' }]
    };
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = 'data:application/manifest+json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifestObj));
    document.head.appendChild(link);

    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      const swKode = `self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',()=>{});`;
      const blobUrl = URL.createObjectURL(new Blob([swKode], { type: 'text/javascript' }));
      navigator.serviceWorker.register(blobUrl).catch(() => {});
    }
  } catch (_) {}
}
// ===== AKHIR BLOK: DNC_PWA =====

// ===== BLOK: DNC_CORE =====
const esc = v => String(v === null || v === undefined ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const teks = v => String(v === null || v === undefined ? '' : v).toLowerCase();

async function hashTeks(nilai) {
  const buf = new TextEncoder().encode(String(nilai || ''));
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function keDate(val) {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === 'object' && typeof val.toDate === 'function') return val.toDate();
  if (typeof val === 'object' && typeof val.seconds === 'number') return new Date(val.seconds * 1000);
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function formatTanggal(val, pakaiJam = false) {
  const d = keDate(val);
  if (!d) return '-';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  if (!pakaiJam) return `${dd}/${mm}/${yyyy}`;
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function keInputDatetimeLocal(val) {
  const d = keDate(val);
  if (!d) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(angka || 0));
}

function bulatDua(angka) {
  return Math.round((Number(angka || 0) + Number.EPSILON) * 100) / 100;
}

function buatTokenAcak(panjang = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let hasil = '';
  for (let i = 0; i < panjang; i++) hasil += chars[Math.floor(Math.random() * chars.length)];
  return hasil;
}

function acakArray(arr) {
  const salinan = [...arr];
  for (let i = salinan.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [salinan[i], salinan[j]] = [salinan[j], salinan[i]];
  }
  return salinan;
}

function labelTingkat(t) {
  if (['I', 'II', 'III', 'IV', 'V', 'VI'].includes(t)) return `Tingkat ${t} (SD)`;
  if (['VII', 'VIII', 'IX'].includes(t)) return `Tingkat ${t} (SMP)`;
  return `Tingkat ${t} (SMA/SMK)`;
}

function deteksiTingkat(val) {
  const raw = String(val || '').trim().toUpperCase().replace(/^(?:KELAS|TINGKAT|KLS|ROMBEL|SD|SMP|SMA|SMK)\s*/i, '');
  if (!raw) return '';
  const petaAngka = {
    '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V', '6': 'VI',
    '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X', '11': 'XI', '12': 'XII'
  };
  const mRomawi = raw.match(/^(XII|XI|IX|VIII|VII|VI|IV|III|II|X|V|I)(?:\b|[\s\-_/.]|$)/);
  if (mRomawi) return mRomawi[1];
  const mAngka = raw.match(/^(1[0-2]|[1-9])(?:\b|[\s\-_/.A-Z]|$)/);
  if (mAngka && petaAngka[mAngka[1]]) return petaAngka[mAngka[1]];
  const mRomawiDalam = raw.match(/\b(XII|XI|IX|VIII|VII|VI|IV|III|II|X|V|I)\b/);
  if (mRomawiDalam) return mRomawiDalam[1];
  const mAngkaDalam = raw.match(/\b(1[0-2]|[1-9])\b/);
  if (mAngkaDalam && petaAngka[mAngkaDalam[1]]) return petaAngka[mAngkaDalam[1]];
  return '';
}

function normalisasiTingkat(tingkatRaw, kodeKelas = '', namaKelas = '') {
  return deteksiTingkat(tingkatRaw) || deteksiTingkat(kodeKelas) || deteksiTingkat(namaKelas) || 'I';
}

function normalisasiKunciKompleks(val) {
  const huruf = String(val || '').toUpperCase().match(/[A-E]/g) || [];
  return [...new Set(huruf)].sort().join(', ');
}

function parseKunciKompleksSet(val) {
  return new Set((String(val || '').toUpperCase().match(/[A-E]/g) || []));
}

function normalisasiIsian(val) {
  return String(val || '').toLowerCase().replace(/[\s]+/g, ' ').trim();
}

function adalahTipePoinOtomatis(tipeSoal) {
  return tipeSoal !== 'Uraian';
}

function bobotOtomatisTipeSoal(tipeSoal, bobotManual = 0) {
  if (tipeSoal === 'Pilihan Ganda') return 1;
  if (tipeSoal === 'Pilihan Ganda Kompleks') return 1;
  if (tipeSoal === 'Benar/Salah') return 1;
  if (tipeSoal === 'Isian Singkat') return 2;
  if (tipeSoal === 'Uraian') {
    const m = Number(bobotManual);
    return !isNaN(m) && m > 0 ? m : 5;
  }
  return 1;
}

function poinEfektifSoal(soal) {
  if (!soal) return 0;
  return bobotOtomatisTipeSoal(soal.tipeSoal, soal.bobotNilai);
}

function debounceDnc(fn, jeda = 250) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), jeda);
  };
}

function tampilkanToast(pesan, tipe = 'sukses') {
  const wadah = document.getElementById('dnc-toast-container');
  if (!wadah) return;
  const el = document.createElement('div');
  el.className = `dnc-toast ${tipe}`;
  el.textContent = pesan;
  wadah.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.25s ease';
    setTimeout(() => el.remove(), 260);
  }, 3600);
}

async function denganLoading(btn, teksProses, kerja) {
  if (!btn) return await kerja();
  const asli = btn.textContent;
  btn.disabled = true;
  btn.textContent = teksProses;
  try { return await kerja(); }
  catch (e) { tampilkanToast(e.message || 'Terjadi kesalahan.', 'error'); return null; }
  finally { btn.disabled = false; btn.textContent = asli; }
}

function togglePassword(idInput, btn) {
  const inp = document.getElementById(idInput);
  if (!inp) return;
  const isPass = inp.type === 'password';
  inp.type = isPass ? 'text' : 'password';
  const iconUse = btn.querySelector('use');
  if (iconUse) iconUse.setAttribute('href', isPass ? '#icon-eye-off' : '#icon-eye');
}

let _konfirmasiAksi = null;
function bukaKonfirmasi({ judul = 'Konfirmasi', pesan = '', labelYa = 'Ya, Lanjutkan', kelasTombol = 'dnc-tombol-bahaya-solid', onYa }) {
  document.getElementById('dnc-konfirmasi-judul').textContent = judul;
  document.getElementById('dnc-konfirmasi-pesan').textContent = pesan;
  const btnYa = document.getElementById('btn-ya-konfirmasi');
  btnYa.textContent = labelYa;
  btnYa.className = `dnc-tombol ${kelasTombol}`;
  _konfirmasiAksi = onYa;
  document.getElementById('dnc-modal-konfirmasi').classList.remove('dnc-disembunyikan');
}

function tutupKonfirmasi() {
  _konfirmasiAksi = null;
  document.getElementById('dnc-modal-konfirmasi').classList.add('dnc-disembunyikan');
}

// --- Lazy-Load Pustaka Eksternal (Grafik, Word, Excel, PDF) ---
const _scriptCache = {};
function muatSkripCdn(url, cekGlobal, pesanGagal) {
  if (cekGlobal()) return Promise.resolve(cekGlobal());
  if (_scriptCache[url]) return _scriptCache[url];
  _scriptCache[url] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload = () => cekGlobal() ? resolve(cekGlobal()) : reject(new Error(pesanGagal));
    s.onerror = () => reject(new Error(pesanGagal));
    document.head.appendChild(s);
  });
  return _scriptCache[url];
}

const muatChartJs = () => muatSkripCdn(
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js',
  () => window.Chart,
  'Gagal memuat pustaka grafik.'
);

const muatMammothJs = () => muatSkripCdn(
  'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js',
  () => window.mammoth,
  'Gagal memuat pembaca dokumen Word (.docx).'
);

const muatSheetJs = () => muatSkripCdn(
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  () => window.XLSX,
  'Gagal memuat pembaca file Excel (.xlsx/.xls).'
);

async function muatPdfJs() {
  const lib = await muatSkripCdn(
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
    () => window.pdfjsLib,
    'Gagal memuat pembaca dokumen PDF (.pdf).'
  );
  if (lib.GlobalWorkerOptions) {
    lib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  }
  return lib;
}

function normalisasiNilaiBenarSalah(kataRaw) {
  const k = teks(String(kataRaw || '').trim()).replace(/\s+/g, ' ');
  if (['benar', 'b', 'true', 'ya', 'sesuai', 'tepat', 'setuju'].includes(k)) return 'Benar';
  if (['salah', 's', 'false', 'tidak', 'tidak sesuai', 'tidak tepat', 'tidak setuju'].includes(k)) return 'Salah';
  return '';
}

function parseKunciBenarSalah(val) {
  const str = String(val || '').trim();
  if (!str) return [];
  const peta = new Map();

  const reBernomor = /(\d+)\s*(?:[\.\)\:\-\=]\s*|\s+)(tidak\s+sesuai|tidak\s+tepat|tidak\s+setuju|benar|salah|true|false|sesuai|tepat|setuju|ya|tidak|[bs])(?=\s|$|[,;|.\)])/gi;
  let m;
  while ((m = reBernomor.exec(str)) !== null) {
    const no = Number(m[1]);
    const nilai = normalisasiNilaiBenarSalah(m[2]);
    if (no > 0 && nilai) peta.set(no, nilai);
  }

  if (peta.size > 0) {
    return [...peta.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([no, nilai]) => ({ no, nilai }));
  }

  const potong = str.split(/[,;|\n]+/).map(x => x.trim()).filter(Boolean);
  const hasil = [];
  potong.forEach((p, idx) => {
    const nilai = normalisasiNilaiBenarSalah(p);
    if (nilai) hasil.push({ no: idx + 1, nilai });
  });
  return hasil;
}

function normalisasiKunciBenarSalah(val) {
  const items = parseKunciBenarSalah(val);
  return items.length ? items.map(it => `${it.no}. ${it.nilai}`).join(', ') : String(val || '').trim();
}

function parseJawabanBenarSalahMap(val) {
  const map = {};
  parseKunciBenarSalah(val).forEach(it => {
    map[String(it.no)] = it.nilai;
  });
  return map;
}

function formatJawabanBenarSalahMap(peta) {
  return Object.entries(peta || {})
    .filter(([, v]) => v === 'Benar' || v === 'Salah')
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([no, v]) => `${no}. ${v}`)
    .join(', ');
}

const muatTesseractJs = () => muatSkripCdn(
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
  () => window.Tesseract,
  'Gagal memuat mesin OCR pembaca gambar (Tesseract.js).'
);

async function bacaTeksOcrDariGambar(sumberGambar, onProgress = null) {
  if (!sumberGambar) throw new Error('Sumber gambar untuk OCR kosong.');
  const TesseractLib = await muatTesseractJs();
  const res = await TesseractLib.recognize(sumberGambar, 'ind+eng', {
    logger: info => {
      if (typeof onProgress === 'function' && info?.status === 'recognizing text') {
        onProgress(Math.round((info.progress || 0) * 100));
      }
    }
  });
  return String(res?.data?.text || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function bacaFileSebagaiDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file gambar lokal.'));
    reader.readAsDataURL(file);
  });
}

async function kompresFileGambarLokal(file, maksLebar = 1024) {
  const dataUrl = await bacaFileSebagaiDataUrl(file);
  return await kompresDataGambar(dataUrl, maksLebar, 0.85);
}

async function ekstrakTeksBarisPdf(file) {
  const pdfjsLib = await muatPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
  const semuaBaris = [];
  for (let hal = 1; hal <= pdf.numPages; hal++) {
    const page = await pdf.getPage(hal);
    const tc = await page.getTextContent();
    const kelompokY = [];
    tc.items.forEach(it => {
      const str = String(it.str || '').trim();
      if (!str) return;
      const y = Math.round(it.transform[5] / 4) * 4;
      const x = it.transform[4];
      let baris = kelompokY.find(b => Math.abs(b.y - y) <= 4);
      if (!baris) {
        baris = { y, sel: [] };
        kelompokY.push(baris);
      }
      baris.sel.push({ x, str });
    });
    kelompokY.sort((a, b) => b.y - a.y);
    kelompokY.forEach(b => {
      b.sel.sort((a, b2) => a.x - b2.x);
      let gabung = '';
      for (let i = 0; i < b.sel.length; i++) {
        if (i > 0) {
          const jarak = b.sel[i].x - b.sel[i - 1].x;
          gabung += jarak > 45 ? '\t' : ' ';
        }
        gabung += b.sel[i].str;
      }
      if (gabung.trim()) semuaBaris.push(gabung.trim());
    });
  }
  return semuaBaris;
}

function kalikanMatriksPdf(m1, m2) {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
  ];
}

function ambilObjGambarPdf(page, nama) {
  return new Promise(resolve => {
    let selesai = false;
    const done = val => { if (!selesai) { selesai = true; resolve(val || null); } };
    const timer = setTimeout(() => done(null), 1200);
    try {
      const sumber = String(nama || '').startsWith('g_') ? page.commonObjs : page.objs;
      if (typeof sumber.has === 'function' && sumber.has(nama)) {
        clearTimeout(timer);
        done(sumber.get(nama));
        return;
      }
      sumber.get(nama, obj => {
        clearTimeout(timer);
        done(obj);
      });
    } catch (_) {
      clearTimeout(timer);
      done(null);
    }
  });
}

async function konversiObjGambarPdfKeDataUrl(imgObj) {
  if (!imgObj) return '';
  const w = Number(imgObj.width || imgObj.bitmap?.width || 0);
  const h = Number(imgObj.height || imgObj.bitmap?.height || 0);
  if (w < 60 || h < 35) return '';
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (imgObj.bitmap) {
    ctx.drawImage(imgObj.bitmap, 0, 0);
  } else if (imgObj.data) {
    const imgData = ctx.createImageData(w, h);
    const src = imgObj.data;
    const dst = imgData.data;
    if (src.length === w * h * 4) {
      dst.set(src);
    } else if (src.length === w * h * 3) {
      for (let s = 0, d = 0; s < src.length; s += 3, d += 4) {
        dst[d] = src[s];
        dst[d + 1] = src[s + 1];
        dst[d + 2] = src[s + 2];
        dst[d + 3] = 255;
      }
    } else if (src.length === w * h) {
      for (let s = 0, d = 0; s < src.length; s++, d += 4) {
        dst[d] = dst[d + 1] = dst[d + 2] = src[s];
        dst[d + 3] = 255;
      }
    } else {
      return '';
    }
    ctx.putImageData(imgData, 0, 0);
  } else {
    return '';
  }
  return await kompresDataGambar(c.toDataURL('image/png'), 1024, 0.85);
}

async function ekstrakBarisDanGambarPdf(file) {
  const pdfjsLib = await muatPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
  const hasilAkhir = [];
  const OPS = pdfjsLib.OPS || {};

  for (let hal = 1; hal <= pdf.numPages; hal++) {
    const page = await pdf.getPage(hal);
    const tc = await page.getTextContent();
    const kelompokY = [];
    let totalKarakter = 0;

    tc.items.forEach(it => {
      const str = String(it.str || '').trim();
      if (!str) return;
      totalKarakter += str.length;
      const y = Math.round(it.transform[5] / 4) * 4;
      const x = it.transform[4];
      let baris = kelompokY.find(b => Math.abs(b.y - y) <= 4);
      if (!baris) {
        baris = { y, sel: [] };
        kelompokY.push(baris);
      }
      baris.sel.push({ x, str });
    });

    const itemHalaman = [];
    kelompokY.forEach(b => {
      b.sel.sort((a, b2) => a.x - b2.x);
      let gabung = '';
      for (let i = 0; i < b.sel.length; i++) {
        if (i > 0) {
          const jarak = b.sel[i].x - b.sel[i - 1].x;
          gabung += jarak > 45 ? '\t' : ' ';
        }
        gabung += b.sel[i].str;
      }
      if (gabung.trim()) {
        itemHalaman.push({ y: b.y, teks: gabung.trim(), img: '', bold: false });
      }
    });

    // Jika halaman PDF berupa hasil scan gambar (minim teks), render halaman agar bisa di-OCR / disimpan
    if (totalKarakter < 25) {
      try {
        const viewport = page.getViewport({ scale: 1.6 });
        const c = document.createElement('canvas');
        c.width = Math.round(viewport.width);
        c.height = Math.round(viewport.height);
        await page.render({ canvasContext: c.getContext('2d'), viewport }).promise;
        const scanUrl = await kompresDataGambar(c.toDataURL('image/png'), 1024, 0.85);
        if (scanUrl) {
          hasilAkhir.push({ teks: '', img: scanUrl, imgAsli: '', labelGambar: `Halaman Scan ${hal}`, bold: false, isHalamanScan: true, halaman: hal });
        }
      } catch (_) {}
      continue;
    }

    // Ekstrak gambar tertanam beserta posisi vertikalnya agar menyisip tepat di soal terkait
    try {
      const opList = await page.getOperatorList();
      const stack = [];
      let ctm = [1, 0, 0, 1, 0, 0];
      const gambarKandidat = [];
      for (let i = 0; i < opList.fnArray.length; i++) {
        const fn = opList.fnArray[i];
        const args = opList.argsArray[i];
        if (fn === OPS.save) stack.push([...ctm]);
        else if (fn === OPS.restore) ctm = stack.length ? stack.pop() : [1, 0, 0, 1, 0, 0];
        else if (fn === OPS.transform && Array.isArray(args)) ctm = kalikanMatriksPdf(ctm, args);
        else if (fn === OPS.paintImageXObject || fn === OPS.paintJpegXObject) {
          gambarKandidat.push({ y: ctm[5] + Math.abs(ctm[3]) / 2, nama: args[0], inlineObj: null });
        } else if (fn === OPS.paintInlineImageXObject && args?.[0]) {
          gambarKandidat.push({ y: ctm[5] + Math.abs(ctm[3]) / 2, nama: '', inlineObj: args[0] });
        }
      }

      for (const gk of gambarKandidat) {
        const obj = gk.inlineObj || await ambilObjGambarPdf(page, gk.nama);
        const dataUrl = await konversiObjGambarPdfKeDataUrl(obj);
        if (dataUrl) {
          itemHalaman.push({ y: gk.y, teks: '', img: dataUrl, imgAsli: '', labelGambar: `Gambar PDF Hal ${hal}`, bold: false });
        }
      }
    } catch (_) {}

    itemHalaman.sort((a, b) => b.y - a.y);
    itemHalaman.forEach(it => hasilAkhir.push({
      teks: it.teks,
      img: it.img,
      imgAsli: it.imgAsli || '',
      labelGambar: it.labelGambar || '',
      bold: it.bold
    }));
  }

  return hasilAkhir;
}

const stateMemori = {
  pengguna: [],
  kelas: [],
  mataPelajaran: [],
  bankSoal: [],
  paketAsas: [],
  hasilUjian: []
};

const sudahDimuat = {
  'DNC-M1': false,
  'DNC-M2': false,
  'DNC-M3': false,
  'DNC-M4': false,
  'DNC-M5': false,
  'DNC-M6': false,
  'DNC-M7': false,
  'DNC-M8': false
};

let menuAktif = '';
let penggunaAktif = null;
let roleLoginDipilih = 'Admin';
let chartBarInstance = null;
let chartDonutInstance = null;

function adalahRoleGuru(role) {
  return role === 'Guru' || role === 'Guru Bimbel';
}

function adalahRoleSiswa(role) {
  return role === 'Siswa' || role === 'Siswa Bimbel';
}

function normalisasiKategoriSoal(val) {
  return String(val || '').trim().toUpperCase() === 'TKA' ? 'TKA' : 'ASAS';
}

function badgeKategoriSoal(kat) {
  const k = normalisasiKategoriSoal(kat);
  return k === 'TKA'
    ? '<span class="dnc-badge dnc-badge-tka">TKA</span>'
    : '<span class="dnc-badge dnc-badge-asas">ASAS</span>';
}

function buatSandiSementaraBimbel(panjang = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let hasil = '';
  for (let i = 0; i < panjang; i++) hasil += chars[Math.floor(Math.random() * chars.length)];
  return hasil;
}

async function kirimEmailSandiBimbelOtomatis({ email, namaLengkap, sandiSementara, asalSekolah = '', kelasTeks = '' }) {
  if (IS_PREVIEW) return { terkirim: true, modePreview: true };
  const url = String(GAS_EMAIL_WEBHOOK_URL || '').trim();
  if (!url || url.includes('PASTE_URL_WEB_APP_GAS')) {
    return {
      terkirim: false,
      pesan: 'URL Mini-Webhook GAS (GAS_EMAIL_WEBHOOK_URL) di app.js belum diisi.'
    };
  }
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        secret: GAS_EMAIL_SECRET,
        to: email,
        namaLengkap,
        sandiSementara,
        asalSekolah,
        kelasTeks,
        urlAplikasi: location.origin + location.pathname
      })
    });
    const hasil = await resp.json().catch(() => null);
    if (hasil && hasil.status === 'ok') return { terkirim: true };
    return {
      terkirim: false,
      pesan: hasil?.message || 'Mini-Webhook GAS mengembalikan status gagal.'
    };
  } catch (err) {
    return {
      terkirim: false,
      pesan: err?.message || 'Gagal menghubungi Mini-Webhook GAS pengirim email.'
    };
  }
}

function resetCacheMenu(daftarMenu = null) {
  const target = daftarMenu || Object.keys(sudahDimuat);
  target.forEach(k => { sudahDimuat[k] = false; });
}

function cariById(koleksiKey, id) {
  return (stateMemori[koleksiKey] || []).find(item => item.id === id) || null;
}

function namaKelasById(id) {
  const k = cariById('kelas', id);
  return k ? `${k.kodeKelas} - ${k.namaKelas}` : '-';
}

function namaMapelById(id) {
  const m = cariById('mataPelajaran', id);
  return m ? m.namaMapel : '-';
}

function daftarMapelDiizinkan() {
  if (!penggunaAktif) return [];
  if (adalahRoleGuru(penggunaAktif.role)) {
    const ampu = Array.isArray(penggunaAktif.mapelIds) ? penggunaAktif.mapelIds : [];
    return stateMemori.mataPelajaran.filter(m =>
      m.dibuatOleh === penggunaAktif.id || ampu.includes(m.id)
    );
  }
  return stateMemori.mataPelajaran;
}

function bolehAksesMapel(mapelId) {
  if (!penggunaAktif || !mapelId) return false;
  if (penggunaAktif.role === 'Admin') return true;
  if (adalahRoleGuru(penggunaAktif.role)) {
    const m = cariById('mataPelajaran', mapelId);
    if (m && m.dibuatOleh === penggunaAktif.id) return true;
    return Array.isArray(penggunaAktif.mapelIds) && penggunaAktif.mapelIds.includes(mapelId);
  }
  return false;
}

function bolehKelolaMapel(mapel) {
  if (!penggunaAktif || !mapel) return false;
  if (penggunaAktif.role === 'Admin') return true;
  if (adalahRoleGuru(penggunaAktif.role)) {
    if (mapel.dibuatOleh) return mapel.dibuatOleh === penggunaAktif.id;
    return Array.isArray(penggunaAktif.mapelIds) && penggunaAktif.mapelIds.includes(mapel.id);
  }
  return false;
}

async function cekUnikKodeMapelPerPemilik(kodeMapel, pemilikId = '', kecualiId = null) {
  const target = teks(String(kodeMapel || '').trim());
  if (!target) return true;
  const semua = await dbList(COLLECTIONS.mataPelajaran);
  const duplikat = semua.find(item =>
    item.id !== kecualiId &&
    teks(String(item.kodeMapel || '').trim()) === target &&
    String(item.dibuatOleh || '') === String(pemilikId || '')
  );
  return !duplikat;
}

function daftarTipeSoalDiizinkanForm() {
  return TIPE_SOAL_LIST;
}

function punyaKelasAmpuGuru(userObj = penggunaAktif) {
  return Array.isArray(userObj?.kelasIds) && userObj.kelasIds.filter(Boolean).length > 0;
}

function daftarKelasDiizinkan() {
  if (!penggunaAktif) return [];
  if (adalahRoleGuru(penggunaAktif.role) && punyaKelasAmpuGuru(penggunaAktif)) {
    const ampu = penggunaAktif.kelasIds;
    return stateMemori.kelas.filter(k => ampu.includes(k.id));
  }
  return stateMemori.kelas;
}

function bolehAksesKelas(kelasId) {
  if (!penggunaAktif) return false;
  if (penggunaAktif.role === 'Admin') return true;
  if (adalahRoleGuru(penggunaAktif.role)) {
    if (!punyaKelasAmpuGuru(penggunaAktif)) return true;
    return Boolean(kelasId && penggunaAktif.kelasIds.includes(kelasId));
  }
  return false;
}

function bolehKelolaSoal(soal) {
  if (!penggunaAktif || !soal) return false;
  if (penggunaAktif.role === 'Admin') return true;
  if (adalahRoleGuru(penggunaAktif.role)) {
    return bolehAksesMapel(soal.mapelId) && soal.dibuatOleh === penggunaAktif.id;
  }
  return false;
}

function bolehKelolaPaket(paket) {
  if (!penggunaAktif || !paket) return false;
  if (penggunaAktif.role === 'Admin') return true;
  if (adalahRoleGuru(penggunaAktif.role)) {
    return bolehAksesMapel(paket.mapelId) && paket.dibuatOleh === penggunaAktif.id;
  }
  return false;
}

function bolehAksesHasilGuru(hasil) {
  if (!penggunaAktif || !hasil) return false;
  if (penggunaAktif.role === 'Admin') return true;
  if (!adalahRoleGuru(penggunaAktif.role)) return false;
  if (!bolehAksesMapel(hasil.mapelId)) return false;

  const adalahBimbel = hasil.jenisSesi === 'Bimbel' || String(hasil.paketId || '').startsWith('bmb_');
  if (adalahBimbel) {
    const soalIds = Array.isArray(hasil.daftarSoalIds) && hasil.daftarSoalIds.length
      ? hasil.daftarSoalIds
      : (Array.isArray(hasil.urutanSoalIds) ? hasil.urutanSoalIds : []);
    if (soalIds.length && stateMemori.bankSoal.length) {
      return soalIds.some(sid => cariById('bankSoal', sid)?.dibuatOleh === penggunaAktif.id);
    }
    return penggunaAktif.role === 'Guru Bimbel';
  }

  const paketMilikGuru = cariById('paketAsas', hasil.paketId);
  if (!paketMilikGuru) return false;
  if (punyaKelasAmpuGuru(penggunaAktif)) {
    return Boolean(hasil.kelasId && penggunaAktif.kelasIds.includes(hasil.kelasId));
  }
  return true;
}

function namaPemilikSoal(userId) {
  if (!userId) return 'Belum Ditetapkan';
  const u = cariById('pengguna', userId);
  if (u) return u.namaLengkap || u.email || userId;
  if (penggunaAktif && penggunaAktif.id === userId) return penggunaAktif.namaLengkap || 'Saya';
  return 'Pengguna Lain';
}
// ===== AKHIR BLOK: DNC_CORE =====

// ===== BLOK: DNC_UI_HELPER =====
let _modalSubmitHandler = null;

function bukaModalFormDnc({
  judul = 'Formulir',
  lebar = false,
  labelSimpan = 'Simpan',
  tampilSimpan = true,
  labelBatal = 'Batal',
  htmlKonten = '',
  onMount = null,
  onSubmit = null
}) {
  const backdrop = document.getElementById('dnc-modal-backdrop');
  const box = document.getElementById('dnc-modal-box');
  const fields = document.getElementById('dnc-modal-fields');
  const btnSimpan = document.getElementById('btn-simpan-modal');
  const btnBatal = document.getElementById('btn-batal-modal');

  document.getElementById('dnc-modal-judul').textContent = judul;
  box.classList.toggle('dnc-modal-lebar', Boolean(lebar));
  fields.innerHTML = htmlKonten;
  btnSimpan.textContent = labelSimpan;
  btnSimpan.classList.toggle('dnc-disembunyikan', !tampilSimpan);
  btnBatal.textContent = labelBatal;
  _modalSubmitHandler = onSubmit;

  backdrop.classList.remove('dnc-disembunyikan');
  if (typeof onMount === 'function') onMount(fields);
}

function tutupModalFormDnc() {
  _modalSubmitHandler = null;
  document.getElementById('dnc-modal-fields').innerHTML = '';
  document.getElementById('dnc-modal-backdrop').classList.add('dnc-disembunyikan');
}

function renderTabelDnc(idTbody, barisData, kolomSpec, teksKosong = 'Belum ada data') {
  const tbody = document.getElementById(idTbody);
  if (!tbody) return;
  if (!barisData || barisData.length === 0) {
    tbody.innerHTML = `<tr><td class="dnc-tabel-kosong" colspan="${kolomSpec.length}">${esc(teksKosong)}</td></tr>`;
    return;
  }
  tbody.innerHTML = barisData.map(item => {
    const selHtml = kolomSpec.map(k => {
      const isi = typeof k.render === 'function' ? k.render(item) : esc(item[k.key] ?? '-');
      const cls = k.aksi ? ' class="dnc-sel-aksi"' : (k.kelas ? ` class="${k.kelas}"` : '');
      const lbl = k.aksi ? '' : ` data-label="${esc(k.label)}"`;
      return `<td${cls}${lbl}>${isi}</td>`;
    }).join('');
    return `<tr>${selHtml}</tr>`;
  }).join('');
}

function isiSelectOpsi(idSelect, opsiList, teksSemua = 'Semua') {
  const el = document.getElementById(idSelect);
  if (!el) return;
  const nilaiLama = el.value;
  el.innerHTML = `<option value="">${esc(teksSemua)}</option>` +
    opsiList.map(o => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('');
  if ([...el.options].some(o => o.value === nilaiLama)) el.value = nilaiLama;
}

function badgeStatus(teksStatus) {
  const s = teks(teksStatus);
  if (s === 'aktif' || s === 'tuntas' || s === 'selesai' || s === 'valid' || s.includes('dibuka')) {
    return `<span class="dnc-badge dnc-badge-hijau">${esc(teksStatus)}</span>`;
  }
  if (s === 'sedang dikerjakan' || s === 'menunggu koreksi' || s === 'perlu perbaikan' || s.includes('menunggu')) {
    return `<span class="dnc-badge dnc-badge-amber">${esc(teksStatus)}</span>`;
  }
  if (s === 'belum tuntas' || s === 'nonaktif' || s.includes('dihentikan') || s === 'duplikat') {
    return `<span class="dnc-badge dnc-badge-merah">${esc(teksStatus)}</span>`;
  }
  return `<span class="dnc-badge dnc-badge-abu">${esc(teksStatus)}</span>`;
}

function badgeTipeSoal(tipe) {
  if (tipe === 'Pilihan Ganda') return `<span class="dnc-badge dnc-badge-biru">Pilihan Ganda</span>`;
  if (tipe === 'Pilihan Ganda Kompleks') return `<span class="dnc-badge dnc-badge-ungu">PG Kompleks</span>`;
  if (tipe === 'Benar/Salah') return `<span class="dnc-badge dnc-badge-bs">Benar/Salah</span>`;
  if (tipe === 'Isian Singkat') return `<span class="dnc-badge dnc-badge-amber">Isian Singkat</span>`;
  return `<span class="dnc-badge dnc-badge-abu">Uraian</span>`;
}
// ===== AKHIR BLOK: DNC_UI_HELPER =====

// ===== BLOK: DNC_DATA_LAYER =====
let fb = null; // Modul Firebase (hanya diisi saat IS_PREVIEW === false)
let memoriPreview = null;

async function inisialisasiDataPreview() {
  if (!IS_PREVIEW) return;
  const hashGuru = await hashTeks('guru123');
  const hashSiswa = await hashTeks('siswa123');
  const sekarang = new Date();
  const mulai = new Date(sekarang.getTime() - 30 * 60000);
  const selesai = new Date(sekarang.getTime() + 4 * 3600000);

  memoriPreview = {
    [COLLECTIONS.kelas]: [
      { id: 'kls_1', dibuat: sekarang.toISOString(), kodeKelas: 'VI-A', namaKelas: 'Kelas Enam A', tingkat: 'VI', tahunAjaran: '2026/2027', waliKelas: 'Dra. Sri Wahyuni' },
      { id: 'kls_2', dibuat: sekarang.toISOString(), kodeKelas: 'V-A', namaKelas: 'Kelas Lima A', tingkat: 'V', tahunAjaran: '2026/2027', waliKelas: 'Bambang Sutrisno, S.Pd.' }
    ],
    [COLLECTIONS.mataPelajaran]: [
      { id: 'mpl_1', dibuat: sekarang.toISOString(), kodeMapel: 'MTK-06', namaMapel: 'Matematika', kkm: 75 },
      { id: 'mpl_2', dibuat: sekarang.toISOString(), kodeMapel: 'BIN-06', namaMapel: 'Bahasa Indonesia', kkm: 78 }
    ],
    [COLLECTIONS.pengguna]: [
      { id: 'usr_admin', dibuat: sekarang.toISOString(), email: 'admin@asas-sekolah.id', namaLengkap: 'Hendra Wijaya, S.Kom.', nomorInduk: '198801012015031001', role: 'Admin', kelasId: '', mapelIds: [], statusAktif: true },
      { id: 'usr_guru', dibuat: sekarang.toISOString(), email: 'guru@asas-sekolah.id', namaLengkap: 'Siti Rahmawati, S.Pd.', nomorInduk: '199105142018022004', role: 'Guru', kelasId: '', mapelIds: ['mpl_1'], statusAktif: true, passwordHash: hashGuru },
      { id: 'usr_siswa', dibuat: sekarang.toISOString(), email: 'siswa@asas-sekolah.id', namaLengkap: 'Raka Pratama Putra', nomorInduk: '202610001', role: 'Siswa', kelasId: 'kls_1', mapelIds: [], statusAktif: true, passwordHash: hashSiswa }
    ],
    [COLLECTIONS.bankSoal]: [
      {
        id: 'soal_1', dibuat: sekarang.toISOString(), kodeSoal: 'MTK06-001', mapelId: 'mpl_1', tingkat: 'VI',
        tipeSoal: 'Pilihan Ganda', pertanyaan: 'Hasil dari 24 x 5 adalah ...', urlGambar: '',
        opsiJawaban: [
          { kode: 'A', teks: '100' }, { kode: 'B', teks: '120' }, { kode: 'C', teks: '125' }, { kode: 'D', teks: '140' }
        ],
        kunciJawaban: 'B', bobotNilai: 40, statusAktif: true, dibuatOleh: 'usr_guru'
      },
      {
        id: 'soal_2', dibuat: sekarang.toISOString(), kodeSoal: 'MTK06-002', mapelId: 'mpl_1', tingkat: 'VI',
        tipeSoal: 'Pilihan Ganda Kompleks', pertanyaan: 'Pilih lebih dari satu bilangan prima berikut ini:', urlGambar: '',
        opsiJawaban: [
          { kode: 'A', teks: '2' }, { kode: 'B', teks: '9' }, { kode: 'C', teks: '11' }, { kode: 'D', teks: '15' }
        ],
        kunciJawaban: 'A, C', bobotNilai: 60, statusAktif: true, dibuatOleh: 'usr_guru'
      }
    ],
    [COLLECTIONS.paketAsas]: [
      {
        id: 'pkt_1', dibuat: sekarang.toISOString(), judulPaket: 'ASAS Ganjil Matematika Kelas VI', semester: 'Ganjil',
        tahunAjaran: '2026/2027', mapelId: 'mpl_1', kelasIds: ['kls_1'], daftarSoalIds: ['soal_1', 'soal_2'],
        waktuMulai: mulai.toISOString(), waktuSelesai: selesai.toISOString(), durasiMenit: 60,
        tokenUjian: 'MTK26A', acakSoal: true, acakOpsi: true, tampilkanNilai: true, statusPaket: 'Aktif',
        ujianDibuka: true, dibuatOleh: 'usr_guru'
      }
    ],
    [COLLECTIONS.hasilUjian]: []
  };
}

async function muatFirebaseSdk() {
  if (IS_PREVIEW) return null;
  if (fb) return fb;
  const base = 'https://www.gstatic.com/firebasejs/11.0.2';
  const [appMod, authMod, fsMod] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-auth.js`),
    import(`${base}/firebase-firestore.js`)
  ]);
  const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
  const auth = authMod.getAuth(app);
  const db = fsMod.getFirestore(app);
  fb = { app, auth, db, appMod, authMod, fsMod };
  return fb;
}

async function dbList(namaKoleksi, opsi = {}) {
  if (IS_PREVIEW) {
    let hasil = [...(memoriPreview[namaKoleksi] || [])];
    if (opsi.urutDesc) {
      hasil.sort((a, b) => (keDate(b[opsi.urutDesc])?.getTime() || 0) - (keDate(a[opsi.urutDesc])?.getTime() || 0));
    }
    if (opsi.batas) hasil = hasil.slice(0, opsi.batas);
    return hasil;
  }
  const { db, fsMod } = await muatFirebaseSdk();
  const ref = fsMod.collection(db, namaKoleksi);
  const constraints = [];
  if (opsi.whereList) {
    opsi.whereList.forEach(([f, op, v]) => constraints.push(fsMod.where(f, op, v)));
  }
  if (opsi.urutDesc) constraints.push(fsMod.orderBy(opsi.urutDesc, 'desc'));
  if (opsi.batas) constraints.push(fsMod.limit(opsi.batas));
  const q = constraints.length ? fsMod.query(ref, ...constraints) : ref;
  const snap = await fsMod.getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function dbGetById(namaKoleksi, id) {
  if (IS_PREVIEW) {
    return (memoriPreview[namaKoleksi] || []).find(x => x.id === id) || null;
  }
  const { db, fsMod } = await muatFirebaseSdk();
  const snap = await fsMod.getDoc(fsMod.doc(db, namaKoleksi, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

function formatErrorFirestoreDnc(err) {
  const kode = String(err?.code || '').toLowerCase();
  const pesan = String(err?.message || '');
  if (kode.includes('permission-denied') || pesan.toLowerCase().includes('insufficient permissions')) {
    return new Error('Izin Firestore ditolak. Pastikan firestore.rules terbaru sudah dipublikasikan dan Anda login dengan sesi Admin/Guru aktif.');
  }
  return err;
}

async function dbCreate(namaKoleksi, data, customId = null) {
  const sekarangIso = new Date().toISOString();
  if (IS_PREVIEW) {
    const id = customId || `${namaKoleksi.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const baru = { id, dibuat: sekarangIso, ...data };
    memoriPreview[namaKoleksi].unshift(baru);
    return baru;
  }
  try {
    const { db, fsMod } = await muatFirebaseSdk();
    const payload = { ...data, dibuat: fsMod.serverTimestamp() };
    if (customId) {
      await fsMod.setDoc(fsMod.doc(db, namaKoleksi, customId), { id: customId, ...payload }, { merge: true });
      return { id: customId, dibuat: sekarangIso, ...data };
    }
    const docRef = fsMod.doc(fsMod.collection(db, namaKoleksi));
    await fsMod.setDoc(docRef, { id: docRef.id, ...payload });
    return { id: docRef.id, dibuat: sekarangIso, ...data };
  } catch (err) {
    throw formatErrorFirestoreDnc(err);
  }
}

async function dbUpdate(namaKoleksi, id, data) {
  if (IS_PREVIEW) {
    const list = memoriPreview[namaKoleksi] || [];
    const idx = list.findIndex(x => x.id === id);
    if (idx < 0) throw new Error('Dokumen tidak ditemukan.');
    list[idx] = { ...list[idx], ...data };
    return list[idx];
  }
  try {
    const { db, fsMod } = await muatFirebaseSdk();
    await fsMod.updateDoc(fsMod.doc(db, namaKoleksi, id), data);
    return { id, ...data };
  } catch (err) {
    throw formatErrorFirestoreDnc(err);
  }
}

async function dbDelete(namaKoleksi, id) {
  if (IS_PREVIEW) {
    memoriPreview[namaKoleksi] = (memoriPreview[namaKoleksi] || []).filter(x => x.id !== id);
    return true;
  }
  try {
    const { db, fsMod } = await muatFirebaseSdk();
    await fsMod.deleteDoc(fsMod.doc(db, namaKoleksi, id));
    return true;
  } catch (err) {
    throw formatErrorFirestoreDnc(err);
  }
}

async function cekUnik(namaKoleksi, field, nilai, kecualiId = null) {
  const target = teks(String(nilai || '').trim());
  if (!target) return true;
  const semua = await dbList(namaKoleksi);
  const duplikat = semua.find(item => item.id !== kecualiId && teks(String(item[field] || '').trim()) === target);
  return !duplikat;
}

async function buatAkunAdminSekunder(email, password) {
  if (IS_PREVIEW) return `usr_${Date.now()}`;
  const { appMod, authMod } = await muatFirebaseSdk();
  const namaSekunder = 'dnc-secondary-admin-creator';
  const appSekunder = appMod.getApps().find(a => a.name === namaSekunder) || appMod.initializeApp(firebaseConfig, namaSekunder);
  const authSekunder = authMod.getAuth(appSekunder);
  try {
    const cred = await authMod.createUserWithEmailAndPassword(authSekunder, email, password);
    const uid = cred.user.uid;
    await authMod.signOut(authSekunder);
    return uid;
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') throw new Error('Email Admin sudah terdaftar di Firebase Authentication.');
    if (err.code === 'auth/weak-password') throw new Error('Password minimal 6 karakter.');
    throw new Error(err.message || 'Gagal membuat akun Admin di Firebase Auth.');
  }
}

async function muatDataDasar() {
  const [kelas, mapel] = await Promise.all([
    dbList(COLLECTIONS.kelas),
    dbList(COLLECTIONS.mataPelajaran)
  ]);
  stateMemori.kelas = kelas.sort((a, b) => {
    const ti = TINGKAT_LIST.indexOf(a.tingkat) - TINGKAT_LIST.indexOf(b.tingkat);
    return ti !== 0 ? ti : teks(a.kodeKelas).localeCompare(teks(b.kodeKelas));
  });
  stateMemori.mataPelajaran = mapel.sort((a, b) => teks(a.namaMapel).localeCompare(teks(b.namaMapel)));
}

async function muatDataPengguna() {
  stateMemori.pengguna = await dbList(COLLECTIONS.pengguna);
}

async function cekUnikNisPerKelas(nomorInduk, kelasId = '', role = 'Siswa', kecualiId = null) {
  const target = teks(String(nomorInduk || '').trim());
  if (!target) return true;
  const semua = await dbList(COLLECTIONS.pengguna);
  const roleTarget = normalisasiRoleDnc(role);
  const duplikat = semua.find(item => {
    if (item.id === kecualiId) return false;
    if (teks(String(item.nomorInduk || '').trim()) !== target) return false;
    const roleItem = normalisasiRoleDnc(item.role);
    if (roleTarget === 'Siswa' && roleItem === 'Siswa') {
      return String(item.kelasId || '') === String(kelasId || '');
    }
    return true;
  });
  return !duplikat;
}

async function muatDataBankSoal() {
  const semua = await dbList(COLLECTIONS.bankSoal, { urutDesc: 'dibuat', batas: 1000 });
  if (adalahRoleGuru(penggunaAktif?.role)) {
    stateMemori.bankSoal = semua.filter(s => bolehAksesMapel(s.mapelId));
  } else {
    // Admin & Siswa Bimbel tetap menerima seluruh bank soal dari guru mana pun
    stateMemori.bankSoal = semua;
  }
}

async function muatDataPaket() {
  const semua = await dbList(COLLECTIONS.paketAsas, { urutDesc: 'dibuat', batas: 150 });
  if (adalahRoleGuru(penggunaAktif?.role)) {
    stateMemori.paketAsas = semua.filter(p => bolehKelolaPaket(p));
  } else if (penggunaAktif?.role === 'Siswa') {
    stateMemori.paketAsas = semua.filter(p => Array.isArray(p.kelasIds) && p.kelasIds.includes(penggunaAktif.kelasId));
  } else if (penggunaAktif?.role === 'Siswa Bimbel') {
    stateMemori.paketAsas = [];
  } else {
    stateMemori.paketAsas = semua;
  }
}

async function muatDataHasil() {
  const semua = await dbList(COLLECTIONS.hasilUjian, { urutDesc: 'dibuat', batas: 300 });
  if (adalahRoleGuru(penggunaAktif?.role)) {
    stateMemori.hasilUjian = semua.filter(h => bolehAksesHasilGuru(h));
  } else if (adalahRoleSiswa(penggunaAktif?.role)) {
    stateMemori.hasilUjian = semua.filter(h => h.penggunaId === penggunaAktif.id);
  } else {
    stateMemori.hasilUjian = semua;
  }
}
// ===== AKHIR BLOK: DNC_DATA_LAYER =====

// ===== BLOK: DNC_AUTH =====
function renderSlotPreviewLogin() {
  const slot = document.getElementById('dnc-preview-login-slot');
  if (!slot) return;
  if (!IS_PREVIEW) {
    slot.innerHTML = '';
    return;
  }
  slot.innerHTML = `
    <div class="dnc-preview-box">
      <strong>Mode Preview Aktif (Data Simulasi Memori)</strong>
      <div>Pilih tombol cepat untuk menguji 3 role secara langsung tanpa setup Firebase:</div>
      <div class="dnc-preview-btn-row">
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-preview-cepat="Admin">Isi Admin</button>
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-preview-cepat="Guru">Isi Guru</button>
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-preview-cepat="Siswa">Isi Siswa</button>
      </div>
    </div>`;
  slot.querySelectorAll('[data-preview-cepat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = btn.getAttribute('data-preview-cepat');
      setRoleLogin(r);
      const idEl = document.getElementById('input-login-identitas');
      const pwEl = document.getElementById('input-login-password');
      if (r === 'Admin') { idEl.value = 'admin@asas-sekolah.id'; pwEl.value = 'admin123'; }
      if (r === 'Guru') { idEl.value = 'guru@asas-sekolah.id'; pwEl.value = 'guru123'; }
      if (r === 'Siswa') { idEl.value = '202610001'; pwEl.value = 'siswa123'; }
    });
  });
}

function renderBannerPreviewApp() {
  const slot = document.getElementById('dnc-preview-banner-slot');
  if (!slot) return;
  if (!IS_PREVIEW) {
    slot.innerHTML = '';
    return;
  }
  slot.innerHTML = `
    <div class="dnc-preview-banner">
      <span>Mode Preview Aktif — Data simulasi sementara di memori. Ubah IS_PREVIEW = false di app.js saat deploy produksi.</span>
      <span class="dnc-badge dnc-badge-amber">PREVIEW</span>
    </div>`;
}

function setRoleLogin(role) {
  roleLoginDipilih = role || 'Auto';
}

let sedangProsesLogin = false;

function normalisasiRoleDnc(roleRaw) {
  const r = teks(String(roleRaw || '').trim());
  if (r === 'admin' || r === 'administrator') return 'Admin';
  if (r === 'guru bimbel') return 'Guru Bimbel';
  if (r === 'guru' || r === 'pengajar') return 'Guru';
  if (r === 'siswa bimbel') return 'Siswa Bimbel';
  if (r === 'siswa' || r === 'peserta didik') return 'Siswa';
  return String(roleRaw || '').trim();
}

async function sinkronProfilAdminDnc(fbUser, profilKetemu = null) {
  const uid = fbUser.uid;
  const emailBersih = (fbUser.email || profilKetemu?.email || '').trim();
  const profilFinal = {
    id: uid,
    email: emailBersih,
    namaLengkap: profilKetemu?.namaLengkap || fbUser.displayName || 'Administrator ASAS',
    nomorInduk: profilKetemu?.nomorInduk || 'ADMIN-01',
    role: 'Admin',
    kelasId: '',
    mapelIds: [],
    statusAktif: true
  };
  try {
    const dokUid = await dbGetById(COLLECTIONS.pengguna, uid);
    if (!dokUid || normalisasiRoleDnc(dokUid.role) !== 'Admin') {
      await dbCreate(COLLECTIONS.pengguna, {
        email: profilFinal.email,
        namaLengkap: profilFinal.namaLengkap,
        nomorInduk: profilFinal.nomorInduk,
        role: 'Admin',
        kelasId: '',
        mapelIds: [],
        statusAktif: true
      }, uid);
    }
  } catch (_) {}
  return profilFinal;
}

async function pilihAkunLoginGandaDnc(kandidatList) {
  if (!stateMemori.kelas.length) {
    try { await muatDataDasar(); } catch (_) {}
  }

  return new Promise((resolve, reject) => {
    let selesai = false;
    const btnBatal = document.getElementById('btn-batal-modal');
    const btnTutup = document.getElementById('btn-tutup-modal');

    const bersihkan = () => {
      btnBatal?.removeEventListener('click', handleBatal);
      btnTutup?.removeEventListener('click', handleBatal);
    };

    const handleBatal = () => {
      if (selesai) return;
      selesai = true;
      bersihkan();
      reject(new Error('Pemilihan akun dibatalkan.'));
    };

    const daftarHtml = kandidatList.map((u, idx) => {
      const kls = u.kelasId ? cariById('kelas', u.kelasId) : null;
      const infoKelas = kls
        ? `${kls.kodeKelas} — ${kls.namaKelas} (${labelTingkat(kls.tingkat)})`
        : (u.kelasTeks || 'Kelas belum ditetapkan');
      return `
        <button type="button" class="dnc-opsi-item" data-pilih-akun-ganda="${idx}" style="align-items:center;min-height:54px">
          <span class="dnc-opsi-kode">${idx + 1}</span>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;color:var(--text-main)">${esc(u.namaLengkap || '-')}</div>
            <div class="dnc-form-bantuan">NIS: ${esc(u.nomorInduk || '-')} • ${esc(infoKelas)}</div>
            <div class="dnc-form-bantuan">${esc(u.email || '-')}</div>
          </div>
          <span class="dnc-badge dnc-badge-biru">Pilih</span>
        </button>`;
    }).join('');

    bukaModalFormDnc({
      judul: 'Pilih Akun & Kelas Anda',
      tampilSimpan: false,
      labelBatal: 'Batal',
      htmlKonten: `
        <div class="dnc-pratinjau-soal dnc-mb-12">
          <strong>NIS Terdaftar di Lebih dari Satu Kelas</strong>
          <div class="dnc-form-bantuan">Pilih nama dan kelas Anda di bawah ini untuk melanjutkan masuk ke Portal ASAS.</div>
        </div>
        <div class="dnc-opsi-list">${daftarHtml}</div>`,
      onMount: fields => {
        btnBatal?.addEventListener('click', handleBatal);
        btnTutup?.addEventListener('click', handleBatal);
        fields.querySelectorAll('[data-pilih-akun-ganda]').forEach(btn => {
          btn.addEventListener('click', () => {
            if (selesai) return;
            selesai = true;
            bersihkan();
            const dipilih = kandidatList[Number(btn.dataset.pilihAkunGanda)];
            tutupModalFormDnc();
            resolve(dipilih);
          });
        });
      }
    });
  });
}

async function prosesLoginDnc(identitas, password) {
  const idTrim = String(identitas || '').trim();
  const pw = String(password || '');
  if (!idTrim || !pw) throw new Error('Email/Username dan password wajib diisi.');

  const cari = teks(idTrim);

  const selesaikanKandidatNonAdmin = async (daftarKandidat, hashInput) => {
    if (!daftarKandidat.length) return null;
    const menunggu = daftarKandidat.filter(u =>
      normalisasiRoleDnc(u.role) === 'Siswa Bimbel' && u.statusPendaftaran === 'Menunggu'
    );
    const aktifList = daftarKandidat.filter(u =>
      u.statusAktif !== false && !(normalisasiRoleDnc(u.role) === 'Siswa Bimbel' && u.statusPendaftaran === 'Menunggu')
    );

    if (!aktifList.length) {
      if (menunggu.length) {
        throw new Error('Pendaftaran Anda masih menunggu persetujuan Admin. Kata sandi sementara akan dikirim otomatis ke Gmail Anda setelah diterima.');
      }
      throw new Error('Akun Anda berstatus nonaktif. Hubungi Admin.');
    }

    const cocokPw = aktifList.filter(u => u.passwordHash && u.passwordHash === hashInput);
    if (!cocokPw.length) {
      throw new Error('Password yang dimasukkan salah.');
    }
    if (cocokPw.length === 1) {
      return { ...cocokPw[0], role: normalisasiRoleDnc(cocokPw[0].role) };
    }
    const dipilih = await pilihAkunLoginGandaDnc(cocokPw);
    return { ...dipilih, role: normalisasiRoleDnc(dipilih.role) };
  };

  if (IS_PREVIEW) {
    const daftar = memoriPreview[COLLECTIONS.pengguna] || [];
    const cocokAdmin = daftar.find(u => normalisasiRoleDnc(u.role) === 'Admin' && (teks(u.email) === cari || teks(u.nomorInduk) === cari));
    if (cocokAdmin) {
      if (cocokAdmin.statusAktif === false) throw new Error('Akun Admin sedang dinonaktifkan.');
      if (pw !== 'admin123') throw new Error('Password Admin salah.');
      return { ...cocokAdmin, role: 'Admin' };
    }
    const tepatEmail = daftar.filter(u => normalisasiRoleDnc(u.role) !== 'Admin' && teks(u.email) === cari);
    const kandidat = tepatEmail.length ? tepatEmail : daftar.filter(u => {
      const r = normalisasiRoleDnc(u.role);
      if (r === 'Admin') return false;
      if (u.nomorInduk && teks(u.nomorInduk) === cari) return true;
      if (r === 'Siswa' && u.nomorInduk && teks(`${u.nomorInduk}@siswa.asas.id`) === cari) return true;
      return false;
    });
    if (!kandidat.length) throw new Error('Akun tidak ditemukan pada data preview.');
    const h = await hashTeks(pw);
    return await selesaikanKandidatNonAdmin(kandidat, h);
  }

  // MODE PRODUKSI MURNI — DETEKSI PERAN OTOMATIS + ANTI-BENTROK NIS BEDA KELAS
  sedangProsesLogin = true;
  try {
    const { auth, authMod } = await muatFirebaseSdk();
    let semuaPengguna = [];
    try {
      semuaPengguna = await dbList(COLLECTIONS.pengguna);
    } catch (_) {}

    // 1. Cek akun Non-Admin (prioritas email persis agar langsung unik, lalu NIS lintas kelas)
    const tepatEmailNonAdmin = semuaPengguna.filter(u =>
      normalisasiRoleDnc(u.role) !== 'Admin' && teks(u.email) === cari
    );
    const kandidatNonAdmin = tepatEmailNonAdmin.length
      ? tepatEmailNonAdmin
      : semuaPengguna.filter(u => {
          const r = normalisasiRoleDnc(u.role);
          if (r === 'Admin') return false;
          if (u.nomorInduk && teks(u.nomorInduk) === cari) return true;
          if (r === 'Siswa' && u.nomorInduk && teks(`${u.nomorInduk}@siswa.asas.id`) === cari) return true;
          return false;
        });

    if (kandidatNonAdmin.length) {
      const hashInput = await hashTeks(pw);
      return await selesaikanKandidatNonAdmin(kandidatNonAdmin, hashInput);
    }

    // 2. Cek akun Admin via Firebase Authentication
    if (!idTrim.includes('@')) {
      throw new Error('Akun dengan username/NIS/NIP tersebut tidak ditemukan.');
    }

    let cred;
    try {
      cred = await authMod.signInWithEmailAndPassword(auth, idTrim, pw);
    } catch (_) {
      const adaAdminDiDb = semuaPengguna.some(u => teks(u.email) === cari && normalisasiRoleDnc(u.role) === 'Admin');
      throw new Error(adaAdminDiDb
        ? 'Password Admin tidak valid.'
        : 'Email/Username atau password tidak terdaftar. Periksa kembali kredensial Anda.');
    }

    const uid = cred.user.uid;
    let profilUid = null;
    try {
      profilUid = await dbGetById(COLLECTIONS.pengguna, uid);
    } catch (_) {}

    if (profilUid && profilUid.statusAktif === false) {
      await authMod.signOut(auth);
      throw new Error('Akun Admin ini berstatus nonaktif.');
    }
    if (profilUid && profilUid.role && normalisasiRoleDnc(profilUid.role) !== 'Admin') {
      await authMod.signOut(auth);
      throw new Error('Akun ini tidak memiliki hak akses Admin.');
    }

    let profilCocok = profilUid;
    if (!profilCocok) {
      profilCocok = semuaPengguna.find(u => teks(u.email) === cari && normalisasiRoleDnc(u.role) === 'Admin') || null;
    }
    if (profilCocok && profilCocok.statusAktif === false) {
      await authMod.signOut(auth);
      throw new Error('Akun Admin ini berstatus nonaktif.');
    }
    return await sinkronProfilAdminDnc(cred.user, profilCocok);
  } finally {
    sedangProsesLogin = false;
  }
}

function bukaModalDaftarSiswaBimbel() {
  bukaModalFormDnc({
    judul: 'Daftar Akun Siswa Bimbel',
    labelSimpan: 'Kirim Pendaftaran',
    htmlKonten: `
      <div class="dnc-pratinjau-soal dnc-mb-12">
        <strong>Informasi Pendaftaran Siswa Bimbel</strong>
        <div class="dnc-form-bantuan">Isi data lengkap di bawah ini menggunakan alamat <strong>Gmail (@gmail.com)</strong> aktif. Setelah pendaftaran diterima oleh Admin, kata sandi sementara akan dikirim otomatis ke Gmail Anda dan dapat diganti mandiri pada menu Profil.</div>
      </div>
      <div class="dnc-form-grid">
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="daftar-nama">Nama Lengkap *</label>
          <input id="daftar-nama" class="dnc-input" type="text" placeholder="Masukkan nama lengkap siswa" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="daftar-sekolah">Asal Sekolah *</label>
          <input id="daftar-sekolah" class="dnc-input" type="text" placeholder="Contoh: SDN 1 Banguntapan" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="daftar-kelas">Kelas *</label>
          <input id="daftar-kelas" class="dnc-input" type="text" placeholder="Contoh: Kelas 6 / VI-A" required>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="daftar-gmail">Email Gmail Aktif * (Wajib @gmail.com)</label>
          <input id="daftar-gmail" class="dnc-input" type="email" placeholder="contoh.siswa@gmail.com" required>
          <span class="dnc-form-bantuan">Kata sandi login sementara akan dikirim otomatis ke alamat Gmail ini setelah Admin menyetujui pendaftaran Anda.</span>
        </div>
      </div>`,
    onSubmit: async () => {
      const namaLengkap = document.getElementById('daftar-nama').value.trim();
      const asalSekolah = document.getElementById('daftar-sekolah').value.trim();
      const kelasTeks = document.getElementById('daftar-kelas').value.trim();
      const email = document.getElementById('daftar-gmail').value.trim().toLowerCase();

      if (!namaLengkap || !asalSekolah || !kelasTeks || !email) {
        throw new Error('Nama lengkap, asal sekolah, kelas, dan email Gmail wajib diisi.');
      }
      if (!/^[a-z0-9._%+-]+@gmail\.com$/i.test(email)) {
        throw new Error('Alamat email wajib menggunakan akun Gmail yang valid (@gmail.com).');
      }
      if (!(await cekUnik(COLLECTIONS.pengguna, 'email', email))) {
        throw new Error('Email Gmail ini sudah terdaftar. Jika sudah mendaftar, tunggu persetujuan Admin atau coba masuk.');
      }

      const nomorInduk = `BMB${Date.now().toString().slice(-6)}`;
      await dbCreate(COLLECTIONS.pengguna, {
        email,
        namaLengkap,
        nomorInduk,
        role: 'Siswa Bimbel',
        asalSekolah,
        kelasTeks,
        tingkat: deteksiTingkat(kelasTeks) || '',
        kelasId: '',
        mapelIds: [],
        statusAktif: false,
        statusPendaftaran: 'Menunggu',
        tanggalDaftar: new Date().toISOString(),
        tanggalDiterima: '',
        diterimaOleh: '',
        passwordHash: ''
      });

      tutupModalFormDnc();
      tampilkanToast('Pendaftaran Siswa Bimbel berhasil! Tunggu persetujuan Admin, sandi sementara akan dikirim otomatis ke Gmail Anda.');
    }
  });
}

const BATAS_PELANGGARAN_SISWA = 3;
let lockdownSiswaAktif = false;
let lockdownTombolTerikat = false;
let pernahMasukFullscreen = false;
let jedaDeteksiLockdownSampai = 0;

function cekSedangFullscreenDnc() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

function dukungFullscreenDnc() {
  const el = document.documentElement;
  return Boolean(el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen);
}

function perbaruiBadgeLockdownM5() {
  const badge = document.getElementById('m5-status-lockdown');
  if (!badge) return;
  const jml = Number(sesiUjianAktif?.jumlahPelanggaran || 0);
  badge.textContent = `Layar Terkunci (${jml}/${BATAS_PELANGGARAN_SISWA})`;
  if (jml >= BATAS_PELANGGARAN_SISWA) badge.className = 'dnc-badge dnc-badge-merah';
  else if (jml > 0) badge.className = 'dnc-badge dnc-badge-amber';
  else badge.className = 'dnc-badge dnc-badge-biru';
}

function tampilkanOverlayLockdownSiswa({ judul, pesan, bahaya = false, infoCounter = '' }) {
  const overlay = document.getElementById('dnc-lockdown-overlay');
  if (!overlay) return;
  const ikon = document.getElementById('dnc-lockdown-ikon');
  const elJudul = document.getElementById('dnc-lockdown-judul');
  const elPesan = document.getElementById('dnc-lockdown-pesan');
  const elCounter = document.getElementById('dnc-lockdown-counter');
  const btnAktif = document.getElementById('btn-aktif-lockdown');

  ikon.classList.toggle('bahaya', Boolean(bahaya));
  elJudul.textContent = judul || 'Mode Kunci Layar Siswa';
  elPesan.textContent = pesan || 'Siswa wajib tetap berada pada layar penuh aplikasi ASAS dan dilarang membuka tab atau situs lain.';
  if (infoCounter) {
    elCounter.textContent = infoCounter;
    elCounter.classList.remove('dnc-disembunyikan');
  } else {
    elCounter.classList.add('dnc-disembunyikan');
  }
  btnAktif.textContent = dukungFullscreenDnc() ? 'Aktifkan Layar Penuh & Lanjutkan' : 'Kembali ke Layar Aplikasi';
  overlay.classList.remove('dnc-disembunyikan');
}

function sembunyikanOverlayLockdownSiswa() {
  document.getElementById('dnc-lockdown-overlay')?.classList.add('dnc-disembunyikan');
}

async function mintaFullscreenSiswa() {
  jedaDeteksiLockdownSampai = Date.now() + 1500;
  const el = document.documentElement;
  try {
    if (el.requestFullscreen) await el.requestFullscreen();
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) await el.msRequestFullscreen();
    pernahMasukFullscreen = true;
    sembunyikanOverlayLockdownSiswa();
    return true;
  } catch (_) {
    if (!dukungFullscreenDnc()) {
      sembunyikanOverlayLockdownSiswa();
      return true;
    }
    tampilkanToast('Izinkan Mode Layar Penuh (Fullscreen) pada browser untuk melanjutkan.', 'error');
    return false;
  }
}

async function catatPelanggaranLockdownSiswa(alasan) {
  if (!lockdownSiswaAktif || penggunaAktif?.role !== 'Siswa') return;
  if (Date.now() < jedaDeteksiLockdownSampai) return;
  jedaDeteksiLockdownSampai = Date.now() + 1800;

  const jam = new Date().toLocaleTimeString('id-ID', { hour12: false });
  if (sesiUjianAktif && !sedangSubmitUjian) {
    sesiUjianAktif.jumlahPelanggaran = Number(sesiUjianAktif.jumlahPelanggaran || 0) + 1;
    sesiUjianAktif.logPelanggaran = Array.isArray(sesiUjianAktif.logPelanggaran) ? sesiUjianAktif.logPelanggaran : [];
    sesiUjianAktif.logPelanggaran.push(`${jam} - ${alasan}`);
    perbaruiBadgeLockdownM5();

    dbUpdate(COLLECTIONS.hasilUjian, sesiUjianAktif.hasilId, {
      jumlahPelanggaran: sesiUjianAktif.jumlahPelanggaran,
      logPelanggaran: sesiUjianAktif.logPelanggaran
    }).catch(() => {});

    if (sesiUjianAktif.jumlahPelanggaran >= BATAS_PELANGGARAN_SISWA) {
      tampilkanToast(`Batas pelanggaran keluar layar (${BATAS_PELANGGARAN_SISWA}/${BATAS_PELANGGARAN_SISWA}) tercapai. Ujian dikumpulkan otomatis.`, 'error');
      sembunyikanOverlayLockdownSiswa();
      await selesaikanUjianSiswa(true, 'pelanggaran_lockdown');
      tampilkanOverlayLockdownSiswa({
        judul: 'Ujian Dikumpulkan Otomatis',
        pesan: `Anda terdeteksi meninggalkan layar ujian sebanyak ${BATAS_PELANGGARAN_SISWA} kali (${alasan}). Lembar ujian telah dikunci dan dikirim ke Guru.`,
        bahaya: true,
        infoCounter: `Pelanggaran Maksimal Tercapai (${BATAS_PELANGGARAN_SISWA}/${BATAS_PELANGGARAN_SISWA})`
      });
      return;
    }

    tampilkanOverlayLockdownSiswa({
      judul: 'Peringatan: Dilarang Keluar Layar!',
      pesan: `Terdeteksi: ${alasan}. Selama aplikasi ASAS dibuka, Siswa dilarang membuka tab lain, situs lain, atau keluar dari Layar Penuh.`,
      bahaya: true,
      infoCounter: `Pelanggaran Tercatat: ${sesiUjianAktif.jumlahPelanggaran} dari ${BATAS_PELANGGARAN_SISWA} (Mencapai ${BATAS_PELANGGARAN_SISWA}x ujian otomatis dikumpulkan)`
    });
    return;
  }

  tampilkanOverlayLockdownSiswa({
    judul: 'Akses Layar Dikunci Kembali',
    pesan: `Terdeteksi: ${alasan}. Akun Siswa wajib tetap berada pada Mode Layar Penuh aplikasi ASAS dan tidak boleh membuka situs atau tab lain.`,
    bahaya: true
  });
}

function handleLockdownContextMenu(e) {
  if (!lockdownSiswaAktif) return;
  e.preventDefault();
}

function handleLockdownClipboard(e) {
  if (!lockdownSiswaAktif) return;
  e.preventDefault();
  tampilkanToast('Fitur salin dan tempel dinonaktifkan khusus untuk Siswa.', 'error');
}

function handleLockdownKeydown(e) {
  if (!lockdownSiswaAktif) return;
  const k = String(e.key || '').toLowerCase();
  const ctrl = e.ctrlKey || e.metaKey;
  const terlarang =
    k === 'f12' || k === 'f11' || k === 'f5' || k === 'printscreen' ||
    (ctrl && ['t', 'n', 'w', 'l', 'k', 'r', 'p', 'u', 's', 'c', 'v', 'x', 'a', 'tab'].includes(k)) ||
    (ctrl && e.shiftKey && ['i', 'j', 'c', 'n'].includes(k)) ||
    (e.altKey && (k === 'tab' || k === 'f4'));
  if (terlarang) {
    e.preventDefault();
    e.stopPropagation();
    tampilkanToast('Pintasan browser dan pembukaan tab baru dinonaktifkan pada Mode Siswa.', 'error');
  }
}

function handleLockdownVisibility() {
  if (!lockdownSiswaAktif) return;
  if (document.hidden) {
    catatPelanggaranLockdownSiswa('Berpindah tab atau membuka aplikasi/situs lain');
  }
}

function handleLockdownBlur() {
  if (!lockdownSiswaAktif) return;
  catatPelanggaranLockdownSiswa('Fokus layar berpindah keluar dari aplikasi ASAS');
}

function handleLockdownFullscreenChange() {
  if (!lockdownSiswaAktif) return;
  if (cekSedangFullscreenDnc()) {
    pernahMasukFullscreen = true;
    sembunyikanOverlayLockdownSiswa();
  } else if (pernahMasukFullscreen) {
    catatPelanggaranLockdownSiswa('Keluar dari Mode Layar Penuh (Fullscreen)');
  }
}

let wakeLockSentinel = null;
let wakeLockDiinginkan = false;
let wakeLockListenerTerpasang = false;

function perbaruiBadgeWakeLockM5(status = 'siaga') {
  const badge = document.getElementById('m5-status-wakelock');
  if (!badge) return;
  if (status === 'aktif') {
    badge.className = 'dnc-badge dnc-badge-hijau';
    badge.textContent = 'Layar Tetap Nyala (Aktif)';
  } else if (status === 'tidak_didukung') {
    badge.className = 'dnc-badge dnc-badge-abu';
    badge.textContent = 'Mode Layar Standar';
  } else {
    badge.className = 'dnc-badge dnc-badge-biru';
    badge.textContent = 'Layar Tetap Nyala (Siaga)';
  }
}

async function mintaWakeLockLayar() {
  if (!wakeLockDiinginkan || document.hidden) return false;
  if (!('wakeLock' in navigator) || !navigator.wakeLock?.request) {
    perbaruiBadgeWakeLockM5('tidak_didukung');
    return false;
  }
  if (wakeLockSentinel && !wakeLockSentinel.released) {
    perbaruiBadgeWakeLockM5('aktif');
    return true;
  }
  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen');
    perbaruiBadgeWakeLockM5('aktif');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
      if (wakeLockDiinginkan) perbaruiBadgeWakeLockM5('siaga');
    });
    return true;
  } catch (_) {
    wakeLockSentinel = null;
    perbaruiBadgeWakeLockM5('siaga');
    return false;
  }
}

function handleWakeLockVisibility() {
  if (wakeLockDiinginkan && !document.hidden) {
    mintaWakeLockLayar();
  }
}

function handleWakeLockInteraksi() {
  if (wakeLockDiinginkan && (!wakeLockSentinel || wakeLockSentinel.released)) {
    mintaWakeLockLayar();
  }
}

function aktifkanWakeLockSiswa() {
  wakeLockDiinginkan = true;
  if (!wakeLockListenerTerpasang) {
    wakeLockListenerTerpasang = true;
    document.addEventListener('visibilitychange', handleWakeLockVisibility);
    window.addEventListener('pointerdown', handleWakeLockInteraksi, { passive: true });
    window.addEventListener('touchstart', handleWakeLockInteraksi, { passive: true });
  }
  mintaWakeLockLayar();
}

async function nonaktifkanWakeLockSiswa() {
  wakeLockDiinginkan = false;
  if (wakeLockSentinel) {
    try { await wakeLockSentinel.release(); } catch (_) {}
    wakeLockSentinel = null;
  }
  perbaruiBadgeWakeLockM5('siaga');
}

function aktifkanLockdownSiswa() {
  if (penggunaAktif?.role !== 'Siswa') return;
  lockdownSiswaAktif = false;
  pernahMasukFullscreen = false;
  document.body.classList.remove('dnc-mode-lockdown-siswa');
  sembunyikanOverlayLockdownSiswa();
}

function nonaktifkanLockdownSiswa() {
  lockdownSiswaAktif = false;
  pernahMasukFullscreen = false;
  document.body.classList.remove('dnc-mode-lockdown-siswa');
  sembunyikanOverlayLockdownSiswa();
  nonaktifkanWakeLockSiswa();
}

async function masukKeAplikasi(userObj) {
  penggunaAktif = userObj;
  resetCacheMenu();

  document.getElementById('dnc-halaman-login').classList.add('dnc-disembunyikan');
  document.getElementById('dnc-aplikasi').classList.remove('dnc-disembunyikan');

  const inisial = (userObj.namaLengkap || 'US')
    .split(' ').filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('');
  document.getElementById('sidebar-user-avatar').textContent = inisial || 'US';
  document.getElementById('sidebar-user-nama').textContent = userObj.namaLengkap || '-';
  document.getElementById('sidebar-user-role').textContent = userObj.role || '-';
  document.getElementById('hp-user-nama').textContent = userObj.namaLengkap || '-';

  renderBannerPreviewApp();
  bangunNavigasiRole();
  await muatDataDasar();

  if (adalahRoleSiswa(userObj.role)) aktifkanLockdownSiswa();
  else nonaktifkanLockdownSiswa();

  const menuAwal = adalahRoleSiswa(userObj.role) ? 'DNC-M5' : 'DNC-M1';
  await bukaMenu(menuAwal);
}

async function keluarAplikasi() {
  if (typeof hentikanTimerUjian === 'function') hentikanTimerUjian();
  if (typeof hentikanListenerPaketSiswa === 'function') hentikanListenerPaketSiswa();
  if (typeof hentikanListenerHasilM6 === 'function') hentikanListenerHasilM6();
  nonaktifkanLockdownSiswa();
  sesiUjianAktif = null;
  penggunaAktif = null;
  resetCacheMenu();
  if (!IS_PREVIEW && fb?.auth?.currentUser) {
    try { await fb.authMod.signOut(fb.auth); } catch (_) {}
  }
  document.getElementById('dnc-aplikasi').classList.add('dnc-disembunyikan');
  document.getElementById('dnc-halaman-login').classList.remove('dnc-disembunyikan');
  document.getElementById('input-login-password').value = '';
  tampilkanToast('Anda telah keluar dari Ruang Asesmen Digital (RAD).', 'info');
}

function bangunNavigasiRole() {
  const diizinkan = MENU_DAFTAR
    .filter(m => m.roles.includes(penggunaAktif.role))
    .map(m => {
      if (m.id === 'DNC-M2' && adalahRoleGuru(penggunaAktif.role)) {
        return { ...m, label: 'Mata Pelajaran & KKM', pendek: 'Mapel' };
      }
      if (m.id === 'DNC-M5' && penggunaAktif.role === 'Siswa Bimbel') {
        return { ...m, label: 'Bank Soal', pendek: 'Soal', icon: 'icon-bank' };
      }
      return m;
    });

  const navDesktop = document.getElementById('dnc-sidebar-nav');
  navDesktop.innerHTML = diizinkan.map(m => `
    <button type="button" class="dnc-nav-item" data-menu="${m.id}">
      <svg class="dnc-ikon"><use href="#${m.icon}"></use></svg>
      <span>${esc(m.label)}</span>
    </button>`).join('');

  navDesktop.querySelectorAll('[data-menu]').forEach(btn => {
    btn.addEventListener('click', () => bukaMenu(btn.getAttribute('data-menu')));
  });

  const tabbar = document.getElementById('dnc-tabbar-hp');
  const butuhLainnya = diizinkan.length > 5;
  const utamaHp = butuhLainnya ? diizinkan.slice(0, 4) : diizinkan;
  const sisaHp = butuhLainnya ? diizinkan.slice(4) : [];

  tabbar.style.gridTemplateColumns = `repeat(${utamaHp.length + (butuhLainnya ? 1 : 0)}, 1fr)`;
  tabbar.innerHTML = utamaHp.map(m => `
    <button type="button" class="dnc-tab-item" data-menu="${m.id}">
      <svg class="dnc-ikon"><use href="#${m.icon}"></use></svg>
      <span>${esc(m.pendek)}</span>
    </button>`).join('') + (butuhLainnya ? `
    <button type="button" class="dnc-tab-item" id="btn-tab-lainnya">
      <svg class="dnc-ikon"><use href="#icon-more"></use></svg>
      <span>Lainnya</span>
    </button>` : '');

  tabbar.querySelectorAll('[data-menu]').forEach(btn => {
    btn.addEventListener('click', () => bukaMenu(btn.getAttribute('data-menu')));
  });

  if (butuhLainnya) {
    const sheetList = document.getElementById('dnc-sheet-menu-list');
    sheetList.innerHTML = sisaHp.map(m => `
      <button type="button" class="dnc-sheet-item" data-sheet-menu="${m.id}">
        <svg class="dnc-ikon"><use href="#${m.icon}"></use></svg>
        <span>${esc(m.label)}</span>
      </button>`).join('');
    sheetList.querySelectorAll('[data-sheet-menu]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('dnc-sheet-lainnya').classList.add('dnc-disembunyikan');
        bukaMenu(btn.getAttribute('data-sheet-menu'));
      });
    });
    document.getElementById('btn-tab-lainnya')?.addEventListener('click', () => {
      document.getElementById('dnc-sheet-lainnya').classList.remove('dnc-disembunyikan');
    });
  }
}

async function bukaMenu(kodeMenu) {
  const izin = MENU_DAFTAR.find(m => m.id === kodeMenu && m.roles.includes(penggunaAktif?.role));
  if (!izin) return;

  menuAktif = kodeMenu;
  document.querySelectorAll('.dnc-section').forEach(s => s.classList.remove('aktif'));
  document.getElementById(`sec-${kodeMenu}`)?.classList.add('aktif');

  document.querySelectorAll('.dnc-nav-item, .dnc-tab-item').forEach(el => {
    el.classList.toggle('aktif', el.getAttribute('data-menu') === kodeMenu);
  });

  if (kodeMenu === 'DNC-M1') await muatM1Dashboard();
  if (kodeMenu === 'DNC-M2') await muatM2Master();
  if (kodeMenu === 'DNC-M3') await muatM3BankSoal();
  if (kodeMenu === 'DNC-M4') await muatM4PaketAsas();
  if (kodeMenu === 'DNC-M5') await muatM5RuangUjian();
  if (kodeMenu === 'DNC-M6') await muatM6HasilNilai();
  if (kodeMenu === 'DNC-M7') await muatM7Pengguna();
  if (kodeMenu === 'DNC-M8') await muatM8Profil();
}
// ===== AKHIR BLOK: DNC_AUTH =====

// ===== BLOK: DNC_M1_DASHBOARD =====
async function muatM1Dashboard(paksa = false) {
  if (!sudahDimuat['DNC-M1'] || paksa) {
    await Promise.all([muatDataDasar(), muatDataPengguna(), muatDataBankSoal(), muatDataPaket()]);
    await muatDataHasil();
    sudahDimuat['DNC-M1'] = true;
  }

  const sub = document.getElementById('subjudul-m1');
  if (adalahRoleGuru(penggunaAktif.role)) {
    const namaAmpu = daftarMapelDiizinkan().map(m => m.namaMapel).join(', ') || 'belum ditetapkan';
    const kelasAmpuTeks = punyaKelasAmpuGuru(penggunaAktif)
      ? ` • Kelas Ampu: ${daftarKelasDiizinkan().map(k => k.kodeKelas).join(', ')}`
      : '';
    sub.textContent = `Cakupan ${penggunaAktif.role} — Mapel Ampu: ${namaAmpu}${kelasAmpuTeks}.`;
  } else {
    sub.textContent = 'Ringkasan capaian pelaksanaan, bank soal, dan status ketuntasan seluruh mata pelajaran.';
  }

  const siswaAsasAktif = stateMemori.pengguna.filter(u =>
    normalisasiRoleDnc(u.role) === 'Siswa' &&
    u.statusAktif !== false &&
    (!adalahRoleGuru(penggunaAktif.role) || bolehAksesKelas(u.kelasId))
  );
  const siswaBimbelAktif = stateMemori.pengguna.filter(u =>
    normalisasiRoleDnc(u.role) === 'Siswa Bimbel' && u.statusAktif !== false
  );
  const siswaAktif = penggunaAktif.role === 'Guru'
    ? siswaAsasAktif
    : (penggunaAktif.role === 'Guru Bimbel' ? [...siswaAsasAktif, ...siswaBimbelAktif] : [...siswaAsasAktif, ...siswaBimbelAktif]);

  const jumlahSoalTampil = adalahRoleGuru(penggunaAktif.role)
    ? stateMemori.bankSoal.filter(s => bolehKelolaSoal(s)).length
    : stateMemori.bankSoal.length;
  const paketAktif = stateMemori.paketAsas.filter(p => p.statusPaket === 'Aktif');
  const hasilSelesai = stateMemori.hasilUjian.filter(h => h.statusUjian === 'Selesai');
  const rataSkor = hasilSelesai.length
    ? bulatDua(hasilSelesai.reduce((s, h) => s + Number(h.skorAkhir || 0), 0) / hasilSelesai.length)
    : 0;

  document.getElementById('kpi-siswa-aktif').textContent = siswaAktif.length;
  document.getElementById('kpi-bank-soal').textContent = jumlahSoalTampil;
  document.getElementById('kpi-paket-aktif').textContent = paketAktif.length;
  document.getElementById('kpi-rata-skor').textContent = rataSkor;

  const peringatanSiswa = [];
  const barisJadwal = paketAktif.map(p => {
    const targetSiswa = siswaAsasAktif.filter(s => Array.isArray(p.kelasIds) && p.kelasIds.includes(s.kelasId));
    const hasilPaket = stateMemori.hasilUjian.filter(h => h.paketId === p.id);
    const selesaiIds = new Set(hasilPaket.filter(h => h.statusUjian !== 'Sedang Dikerjakan').map(h => h.penggunaId));
    const belum = targetSiswa.filter(s => !selesaiIds.has(s.id));
    if (belum.length > 0) {
      peringatanSiswa.push(`${p.judulPaket}: ${belum.slice(0, 4).map(s => s.namaLengkap).join(', ')}${belum.length > 4 ? ` (+${belum.length - 4} siswa)` : ''}`);
    }
    return {
      judulPaket: p.judulPaket,
      mapel: namaMapelById(p.mapelId),
      kelas: (p.kelasIds || []).map(id => cariById('kelas', id)?.kodeKelas || id).join(', '),
      rentang: `${formatTanggal(p.waktuMulai, true)} – ${formatTanggal(p.waktuSelesai, true)}`,
      progres: `${selesaiIds.size} / ${targetSiswa.length} siswa selesai`,
      ujianDibuka: Boolean(p.ujianDibuka)
    };
  });

  renderTabelDnc('tbody-m1-jadwal', barisJadwal, [
    { label: 'Judul Paket', key: 'judulPaket' },
    { label: 'Mata Pelajaran', key: 'mapel' },
    { label: 'Kelas Sasaran', key: 'kelas' },
    { label: 'Rentang Waktu', key: 'rentang' },
    { label: 'Progres Siswa', key: 'progres' },
    {
      label: 'Status Sesi',
      render: r => r.ujianDibuka
        ? `<span class="dnc-badge dnc-badge-hijau"><span class="dnc-dot-live"></span>Sedang Dibuka</span>`
        : `<span class="dnc-badge dnc-badge-amber">Menunggu Mulai</span>`
    }
  ], 'Belum ada paket Ruang Asesmen Digital (RAD) berstatus Aktif');

  const teksPeringatan = document.getElementById('teks-peringatan-m1');
  if (peringatanSiswa.length) {
    teksPeringatan.innerHTML = `<strong>Perhatian Sesi Berjalan:</strong> Peserta didik yang belum menyelesaikan ujian aktif — ${esc(peringatanSiswa.join(' | '))}`;
  } else {
    teksPeringatan.textContent = 'Seluruh peserta didik pada jadwal aktif telah menyelesaikan ujian atau belum ada sesi aktif berjalan.';
  }

  try {
    const ChartLib = await muatChartJs();
    const mapelList = daftarMapelDiizinkan();
    const labelBar = mapelList.map(m => m.namaMapel);
    const dataBar = mapelList.map(m => {
      const hs = hasilSelesai.filter(h => h.mapelId === m.id);
      if (!hs.length) return 0;
      return bulatDua(hs.reduce((acc, x) => acc + Number(x.skorAkhir || 0), 0) / hs.length);
    });

    if (chartBarInstance) chartBarInstance.destroy();
    chartBarInstance = new ChartLib(document.getElementById('chart-rata-mapel'), {
      type: 'bar',
      data: {
        labels: labelBar.length ? labelBar : ['Belum ada data'],
        datasets: [{
          label: 'Rata-rata Nilai',
          data: labelBar.length ? dataBar : [0],
          backgroundColor: '#2563EB',
          borderRadius: 6,
          maxBarThickness: 42
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, max: 100 } }
      }
    });

    const jmlTuntas = hasilSelesai.filter(h => h.statusKetuntasan === 'Tuntas').length;
    const jmlBelum = hasilSelesai.filter(h => h.statusKetuntasan === 'Belum Tuntas').length;
    const jmlTunggu = stateMemori.hasilUjian.filter(h => h.statusKetuntasan === 'Menunggu Koreksi').length;

    if (chartDonutInstance) chartDonutInstance.destroy();
    chartDonutInstance = new ChartLib(document.getElementById('chart-ketuntasan'), {
      type: 'doughnut',
      data: {
        labels: ['Tuntas', 'Belum Tuntas', 'Menunggu Koreksi'],
        datasets: [{
          data: (jmlTuntas + jmlBelum + jmlTunggu) ? [jmlTuntas, jmlBelum, jmlTunggu] : [1, 0, 0],
          backgroundColor: (jmlTuntas + jmlBelum + jmlTunggu) ? ['#059669', '#DC2626', '#F59E0B'] : ['#E2E8F0', '#E2E8F0', '#E2E8F0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '64%',
        plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 11 } } } }
      }
    });
  } catch (_) {}
}
// ===== AKHIR BLOK: DNC_M1_DASHBOARD =====

// ===== BLOK: DNC_M2_MASTER =====
async function muatM2Master(paksa = false) {
  if (!sudahDimuat['DNC-M2'] || paksa) {
    await Promise.all([muatDataDasar(), muatDataPengguna()]);
    sudahDimuat['DNC-M2'] = true;
  }

  const adalahGuru = adalahRoleGuru(penggunaAktif?.role);
  const adalahAdmin = penggunaAktif?.role === 'Admin';
  const elJudul = document.getElementById('judul-m2');
  const elSub = document.getElementById('subjudul-m2');
  const elSubtabs = document.getElementById('subtabs-m2');
  const panelKelas = document.getElementById('panel-m2-kelas');
  const panelMapel = document.getElementById('panel-m2-mapel');
  const tabKelas = document.getElementById('tab-m2-kelas');
  const tabMapel = document.getElementById('tab-m2-mapel');
  const btnPemilik = document.getElementById('btn-tetapkan-pemilik-mapel');
  const selPemilik = document.getElementById('filter-pemilik-mapel');

  if (adalahGuru) {
    if (elJudul) elJudul.textContent = 'Mata Pelajaran & Batas KKM';
    if (elSub) elSub.textContent = 'Kelola daftar mata pelajaran dan batas nilai KKM sesuai kewenangan Anda.';
    elSubtabs?.classList.add('dnc-disembunyikan');
    panelKelas?.classList.remove('aktif');
    panelKelas?.classList.add('dnc-disembunyikan');
    panelMapel?.classList.add('aktif');
    tabKelas?.classList.remove('aktif');
    tabMapel?.classList.add('aktif');
    btnPemilik?.classList.add('dnc-disembunyikan');
    selPemilik?.classList.add('dnc-disembunyikan');
  } else {
    if (elJudul) elJudul.textContent = 'Master Kelas & Mata Pelajaran';
    if (elSub) elSub.textContent = 'Kelola rombongan belajar jenjang SD–SMA (manual atau impor PDF, Excel, Word), mata pelajaran ujian, dan batas KKM.';
    elSubtabs?.classList.remove('dnc-disembunyikan');
    panelKelas?.classList.remove('dnc-disembunyikan');
    if (panelKelas && panelMapel && !panelKelas.classList.contains('aktif') && !panelMapel.classList.contains('aktif')) {
      panelKelas.classList.add('aktif');
      tabKelas?.classList.add('aktif');
    }
    btnPemilik?.classList.toggle('dnc-disembunyikan', !adalahAdmin);
    if (selPemilik) {
      selPemilik.classList.toggle('dnc-disembunyikan', !adalahAdmin);
      const nilaiLama = selPemilik.value;
      const daftarPemilik = stateMemori.pengguna
        .filter(u => !adalahRoleSiswa(normalisasiRoleDnc(u.role)))
        .sort((a, b) => teks(a.namaLengkap).localeCompare(teks(b.namaLengkap)));
      selPemilik.innerHTML = `
        <option value="">Semua Pemilik</option>
        <option value="tanpa_pemilik">Belum Ditetapkan Pemiliknya</option>
        ${daftarPemilik.map(u => `<option value="${esc(u.id)}">${esc(u.namaLengkap)} (${esc(normalisasiRoleDnc(u.role))})</option>`).join('')}`;
      if ([...selPemilik.options].some(o => o.value === nilaiLama)) selPemilik.value = nilaiLama;
      else selPemilik.value = '';
    }
    renderTabelKelas();
  }

  renderTabelMapel();
}

function renderTabelKelas() {
  const q = teks(document.getElementById('cari-kelas')?.value || '');
  const tingkat = document.getElementById('filter-tingkat-kelas')?.value || '';
  const data = stateMemori.kelas.filter(k => {
    if (tingkat && k.tingkat !== tingkat) return false;
    if (q && !`${teks(k.kodeKelas)} ${teks(k.namaKelas)} ${teks(k.waliKelas)}`.includes(q)) return false;
    return true;
  });
  renderTabelDnc('tbody-kelas', data, [
    { label: 'Kode Kelas', render: k => `<span class="dnc-mono">${esc(k.kodeKelas)}</span>` },
    { label: 'Nama Kelas', key: 'namaKelas' },
    { label: 'Tingkat', render: k => `<span class="dnc-badge dnc-badge-biru">${esc(labelTingkat(k.tingkat))}</span>` },
    { label: 'Tahun Ajaran', key: 'tahunAjaran' },
    { label: 'Wali Kelas', render: k => esc(k.waliKelas || '-') },
    {
      label: 'Aksi', aksi: true,
      render: k => `<div class="dnc-aksi-baris">
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-ubah-kelas="${esc(k.id)}">Ubah</button>
        <button type="button" class="dnc-tombol dnc-tombol-bahaya dnc-tombol-kecil" data-hapus-kelas="${esc(k.id)}">Hapus</button>
      </div>`
    }
  ], 'Belum ada data kelas');
}

function renderTabelMapel() {
  const adalahGuru = adalahRoleGuru(penggunaAktif?.role);
  const q = teks(document.getElementById('cari-mapel')?.value || '');
  const fPemilik = document.getElementById('filter-pemilik-mapel')?.value || '';

  const data = stateMemori.mataPelajaran.filter(m => {
    if (adalahGuru && !bolehKelolaMapel(m)) return false;
    if (!adalahGuru) {
      if (fPemilik === 'tanpa_pemilik' && m.dibuatOleh) return false;
      if (fPemilik && fPemilik !== 'tanpa_pemilik' && m.dibuatOleh !== fPemilik) return false;
    }
    if (q && !`${teks(m.kodeMapel)} ${teks(m.namaMapel)} ${teks(namaPemilikSoal(m.dibuatOleh))}`.includes(q)) return false;
    return true;
  });

  renderTabelDnc('tbody-mapel', data, [
    { label: 'Kode Mapel', render: m => `<span class="dnc-mono">${esc(m.kodeMapel)}</span>` },
    { label: 'Nama Mata Pelajaran', key: 'namaMapel' },
    { label: 'KKM', render: m => `<strong>${esc(m.kkm)}</strong>` },
    {
      label: 'Pemilik',
      render: m => m.dibuatOleh
        ? `<span class="dnc-badge dnc-badge-biru">${esc(namaPemilikSoal(m.dibuatOleh))}</span>`
        : `<span class="dnc-badge dnc-badge-amber">Belum Ditetapkan</span>`
    },
    {
      label: 'Aksi', aksi: true,
      render: m => `<div class="dnc-aksi-baris">
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-ubah-mapel="${esc(m.id)}">Ubah</button>
        <button type="button" class="dnc-tombol dnc-tombol-bahaya dnc-tombol-kecil" data-hapus-mapel="${esc(m.id)}">Hapus</button>
      </div>`
    }
  ], adalahGuru ? 'Belum ada mata pelajaran milik Anda. Klik "Tambah Mata Pelajaran" untuk mulai mengisi.' : 'Belum ada data mata pelajaran');
}

function bukaFormKelas(item = null) {
  bukaModalFormDnc({
    judul: item ? 'Ubah Data Kelas' : 'Tambah Data Kelas',
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-kodeKelas">Kode Kelas *</label>
          <input id="f-kodeKelas" class="dnc-input" type="text" placeholder="Contoh: I-A, VI-B, atau X-IPA-1" value="${esc(item?.kodeKelas || '')}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-namaKelas">Nama Kelas *</label>
          <input id="f-namaKelas" class="dnc-input" type="text" placeholder="Contoh: Kelas Satu A / Kelas Enam B" value="${esc(item?.namaKelas || '')}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-tingkat">Tingkat (SD / SMP / SMA) *</label>
          <select id="f-tingkat" class="dnc-select" required>
            ${TINGKAT_LIST.map(t => `<option value="${t}" ${(item?.tingkat || 'I') === t ? 'selected' : ''}>${esc(labelTingkat(t))}</option>`).join('')}
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-tahunAjaran">Tahun Ajaran *</label>
          <input id="f-tahunAjaran" class="dnc-input" type="text" placeholder="Contoh: 2026/2027" value="${esc(item?.tahunAjaran || '2026/2027')}" required>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="f-waliKelas">Wali Kelas</label>
          <input id="f-waliKelas" class="dnc-input" type="text" placeholder="Nama wali kelas (opsional)" value="${esc(item?.waliKelas || '')}">
        </div>
      </div>`,
    onSubmit: async () => {
      const payload = {
        kodeKelas: document.getElementById('f-kodeKelas').value.trim(),
        namaKelas: document.getElementById('f-namaKelas').value.trim(),
        tingkat: document.getElementById('f-tingkat').value,
        tahunAjaran: document.getElementById('f-tahunAjaran').value.trim(),
        waliKelas: document.getElementById('f-waliKelas').value.trim()
      };
      if (!payload.kodeKelas || !payload.namaKelas || !payload.tahunAjaran) {
        throw new Error('Kode kelas, nama kelas, dan tahun ajaran wajib diisi.');
      }
      if (!(await cekUnik(COLLECTIONS.kelas, 'kodeKelas', payload.kodeKelas, item?.id))) {
        throw new Error(`Kode kelas "${payload.kodeKelas}" sudah digunakan.`);
      }
      if (item) await dbUpdate(COLLECTIONS.kelas, item.id, payload);
      else await dbCreate(COLLECTIONS.kelas, payload);
      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M2', 'DNC-M4', 'DNC-M6', 'DNC-M7']);
      await muatM2Master(true);
      tampilkanToast(item ? 'Data kelas berhasil diperbarui.' : 'Data kelas berhasil ditambahkan.');
    }
  });
}

// --- Impor Data Kelas Multi-Format (PDF, Excel .xlsx/.xls/.csv, Word .docx) ---
function validasiItemKelasImpor(it, kodeSudahAdaSet) {
  const masalah = [];
  if (!it.kodeKelas) masalah.push('Kode kosong');
  if (!it.namaKelas) masalah.push('Nama kelas kosong');
  if (!TINGKAT_LIST.includes(it.tingkat)) it.tingkat = normalisasiTingkat(it.tingkat, it.kodeKelas, it.namaKelas);
  if (!it.tahunAjaran) it.tahunAjaran = '2026/2027';
  if (it.kodeKelas && kodeSudahAdaSet.has(teks(it.kodeKelas))) masalah.push('Duplikat di database');
  it.valid = masalah.length === 0;
  it.statusTeks = masalah.length === 0 ? 'Valid' : (masalah.includes('Duplikat di database') ? 'Duplikat' : 'Perlu Perbaikan');
  it.catatan = masalah.length ? masalah.join('; ') : 'Siap disimpan';
  return it;
}

function petakanMatriksKelas(barisMatriks, tahunDefault) {
  if (!barisMatriks.length) return [];
  const bersih = barisMatriks
    .map(r => (Array.isArray(r) ? r : [r]).map(c => String(c ?? '').trim()))
    .filter(r => r.some(c => c !== ''));
  if (!bersih.length) return [];

  let idxHeader = -1;
  let iKode = 0, iNama = 1, iTingkat = 2, iTahun = 3, iWali = 4;

  for (let i = 0; i < Math.min(5, bersih.length); i++) {
    const rowLower = bersih[i].map(c => teks(c));
    if (rowLower.some(c => c.includes('kode') || c.includes('nama kelas') || c.includes('rombel') || c.includes('wali'))) {
      idxHeader = i;
      const cariIdx = kata => rowLower.findIndex(h => kata.some(k => h.includes(k)));
      const ck = cariIdx(['kode']);
      const cn = cariIdx(['nama kelas', 'nama', 'rombel', 'kelas']);
      const ct = cariIdx(['tingkat', 'jenjang', 'level']);
      const cta = cariIdx(['tahun', 'tapel', 'ajaran']);
      const cw = cariIdx(['wali']);
      if (ck >= 0) iKode = ck;
      if (cn >= 0) iNama = cn === ck ? ck + 1 : cn;
      if (ct >= 0) iTingkat = ct;
      if (cta >= 0) iTahun = cta;
      if (cw >= 0) iWali = cw;
      break;
    }
  }

  const mulai = idxHeader >= 0 ? idxHeader + 1 : 0;
  const hasil = [];
  for (let r = mulai; r < bersih.length; r++) {
    const row = bersih[r];
    let offset = 0;
    if (idxHeader < 0 && /^\d+\.?$/.test(row[0]) && row.length >= 3) offset = 1;
    let kodeKelas = (row[iKode + offset] || '').trim();
    let namaKelas = (row[iNama + offset] || '').trim();
    const tingkatRaw = (row[iTingkat + offset] || '').trim();
    const tahunRaw = (row[iTahun + offset] || '').trim();
    const waliKelas = (row[iWali + offset] || '').trim();

    if (!kodeKelas && !namaKelas) continue;
    if (/^(daftar kelas|data kelas|no|kode)/i.test(kodeKelas)) continue;
    if (!namaKelas) namaKelas = kodeKelas;
    if (!kodeKelas) kodeKelas = namaKelas.replace(/\s+/g, '-').toUpperCase();

    hasil.push({
      dipilih: true,
      kodeKelas,
      namaKelas,
      tingkat: normalisasiTingkat(tingkatRaw, kodeKelas, namaKelas),
      tahunAjaran: /\d{4}\/\d{4}/.test(tahunRaw) ? tahunRaw : (tahunRaw || tahunDefault),
      waliKelas
    });
  }
  return hasil;
}

function parseTeksBarisKelas(daftarBaris, tahunDefault) {
  const matriks = [];
  daftarBaris.forEach(line => {
    const t = String(line || '').trim();
    if (!t || /^(daftar|data|templat|petunjuk|no\b)/i.test(t)) return;
    let pecah = [];
    if (t.includes('\t')) pecah = t.split('\t').map(x => x.trim());
    else if (t.includes('|')) pecah = t.split('|').map(x => x.trim());
    else if (t.includes(';')) pecah = t.split(';').map(x => x.trim());
    else if (t.includes(',')) pecah = t.split(',').map(x => x.trim());
    else {
      const m = t.match(/^(?:\d+[\.\)]\s*)?([A-Za-z0-9\-/]+)\s{2,}(.+)$/);
      if (m) pecah = [m[1], ...m[2].split(/\s{2,}/)];
      else {
        const bersih = t.replace(/^\d+[\.\)]\s*/, '');
        const parts = bersih.split(/\s+-\s+/);
        if (parts.length >= 2) pecah = parts;
        else if (/^(XII|XI|IX|VIII|VII|VI|IV|III|II|X|V|I|1[0-2]|[1-9])(?:[\s\-]|[A-Za-z])/i.test(bersih)) {
          pecah = [bersih.split(/\s+/)[0], bersih];
        }
      }
    }
    if (pecah.length) matriks.push(pecah);
  });
  return petakanMatriksKelas(matriks, tahunDefault);
}

function bukaModalImporKelas() {
  const kodeSudahAda = new Set(stateMemori.kelas.map(k => teks(k.kodeKelas)));
  let daftarKelasImpor = [];

  const renderPratinjauKelas = () => {
    const wadah = document.getElementById('wadah-pratinjau-kelas');
    const info = document.getElementById('info-impor-kelas');
    if (!wadah) return;
    const jmlValid = daftarKelasImpor.filter(x => x.valid).length;
    info.textContent = daftarKelasImpor.length
      ? `Terdeteksi ${daftarKelasImpor.length} data kelas (${jmlValid} Valid, ${daftarKelasImpor.length - jmlValid} Duplikat/Perlu Perbaikan).`
      : 'Unggah file PDF (.pdf), Excel (.xlsx/.xls/.csv), atau Word (.docx) untuk melihat pratinjau.';

    if (!daftarKelasImpor.length) { wadah.innerHTML = ''; return; }
    wadah.innerHTML = `
      <div class="dnc-pembungkus-tabel dnc-mt-12">
        <table class="dnc-tabel dnc-tabel-padat">
          <thead>
            <tr>
              <th>Pilih</th>
              <th>Kode Kelas</th>
              <th>Nama Kelas</th>
              <th>Tingkat</th>
              <th>Tahun Ajaran</th>
              <th>Wali Kelas</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${daftarKelasImpor.map((it, idx) => `
              <tr>
                <td data-label="Pilih"><input type="checkbox" data-ik-pilih="${idx}" ${it.dipilih && it.valid ? 'checked' : ''} ${!it.valid ? 'disabled' : ''}></td>
                <td data-label="Kode"><input class="dnc-input" style="height:30px" data-ik-kode="${idx}" value="${esc(it.kodeKelas)}"></td>
                <td data-label="Nama"><input class="dnc-input" style="height:30px" data-ik-nama="${idx}" value="${esc(it.namaKelas)}"></td>
                <td data-label="Tingkat">
                  <select class="dnc-select" style="height:30px" data-ik-tingkat="${idx}">
                    ${TINGKAT_LIST.map(t => `<option value="${t}" ${it.tingkat === t ? 'selected' : ''}>${esc(labelTingkat(t))}</option>`).join('')}
                  </select>
                </td>
                <td data-label="Tahun"><input class="dnc-input" style="height:30px" data-ik-tahun="${idx}" value="${esc(it.tahunAjaran)}"></td>
                <td data-label="Wali"><input class="dnc-input" style="height:30px" data-ik-wali="${idx}" value="${esc(it.waliKelas)}"></td>
                <td data-label="Status">${badgeStatus(it.statusTeks)}<div class="dnc-form-bantuan">${esc(it.catatan)}</div></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    wadah.querySelectorAll('[data-ik-pilih]').forEach(el => {
      el.addEventListener('change', () => { daftarKelasImpor[Number(el.dataset.ikPilih)].dipilih = el.checked; });
    });
    const ikat = (attr, field) => {
      wadah.querySelectorAll(`[${attr}]`).forEach(el => {
        el.addEventListener('change', () => {
          const i = Number(el.getAttribute(attr));
          daftarKelasImpor[i][field] = el.value.trim();
          validasiItemKelasImpor(daftarKelasImpor[i], kodeSudahAda);
          if (daftarKelasImpor[i].valid) daftarKelasImpor[i].dipilih = true;
          renderPratinjauKelas();
        });
      });
    };
    ikat('data-ik-kode', 'kodeKelas');
    ikat('data-ik-nama', 'namaKelas');
    ikat('data-ik-tingkat', 'tingkat');
    ikat('data-ik-tahun', 'tahunAjaran');
    ikat('data-ik-wali', 'waliKelas');
  };

  bukaModalFormDnc({
    judul: 'Impor Data Kelas (PDF, Excel, atau Word)',
    lebar: true,
    labelSimpan: 'Simpan Massal Data Kelas',
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup">
          <label class="dnc-label" for="ik-tahun-default">Tahun Ajaran Bawaan *</label>
          <input id="ik-tahun-default" class="dnc-input" type="text" value="2026/2027">
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label">Unduh Contoh Templat</label>
          <div class="dnc-flex-gap">
            <button type="button" id="btn-templat-kelas-csv" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil">Templat Excel/CSV</button>
            <button type="button" id="btn-templat-kelas-word" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil">Templat Word (.docx)</button>
          </div>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="ik-file">Pilih File Daftar Kelas (.pdf, .xlsx, .xls, .csv, .docx) *</label>
          <div class="dnc-file-drop">
            <input id="ik-file" class="dnc-input" type="file" accept=".pdf,.xlsx,.xls,.csv,.docx" style="padding-top:7px">
            <div id="info-impor-kelas" class="dnc-form-bantuan dnc-mt-12">Mendukung tingkat I–VI (SD), VII–IX (SMP), dan X–XII (SMA/SMK) dalam format tabel Excel/Word/PDF maupun teks berpemisah.</div>
          </div>
        </div>
      </div>
      <div id="wadah-pratinjau-kelas"></div>`,
    onMount: () => {
      document.getElementById('btn-templat-kelas-csv').addEventListener('click', () => {
        const isi = 'KodeKelas,NamaKelas,Tingkat,TahunAjaran,WaliKelas\n' +
          'I-A,Kelas Satu A,I,2026/2027,Siti Aminah S.Pd.SD\n' +
          'IV-A,Kelas Empat A,IV,2026/2027,Budi Santoso S.Pd.\n' +
          'VI-A,Kelas Enam A,VI,2026/2027,Dra. Sri Wahyuni\n';
        unduhBlobFile(new Blob([isi], { type: 'text/csv;charset=utf-8' }), 'Templat_Kelas_ASAS_DNC.csv');
      });
      document.getElementById('btn-templat-kelas-word').addEventListener('click', () => {
        unduhDokumenWordSederhana([
          'DAFTAR KELAS ASAS - DIGITALNETCARE',
          'KodeKelas | NamaKelas | Tingkat | TahunAjaran | WaliKelas',
          'I-A | Kelas Satu A | I | 2026/2027 | Siti Aminah, S.Pd.SD',
          'IV-A | Kelas Empat A | IV | 2026/2027 | Budi Santoso, S.Pd.',
          'VI-A | Kelas Enam A | VI | 2026/2027 | Dra. Sri Wahyuni'
        ], 'Templat_Kelas_ASAS_DNC.docx');
      });
      document.getElementById('ik-file').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        const info = document.getElementById('info-impor-kelas');
        const ext = teks(file.name.split('.').pop());
        const tahunDef = document.getElementById('ik-tahun-default').value.trim() || '2026/2027';
        info.textContent = `Membaca file ${file.name}...`;

        try {
          let hasilMentah = [];
          if (ext === 'csv') {
            hasilMentah = petakanMatriksKelas(parseCsvBaris(await file.text()), tahunDef);
          } else if (ext === 'xlsx' || ext === 'xls') {
            const XLSX = await muatSheetJs();
            const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            hasilMentah = petakanMatriksKelas(rows, tahunDef);
          } else if (ext === 'docx') {
            const mammothLib = await muatMammothJs();
            const { value: html } = await mammothLib.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const tbl = doc.querySelector('table');
            if (tbl) {
              const rows = [...tbl.querySelectorAll('tr')].map(tr => [...tr.querySelectorAll('th,td')].map(td => td.textContent.trim()));
              hasilMentah = petakanMatriksKelas(rows, tahunDef);
            }
            if (!hasilMentah.length) {
              const lines = [...doc.body.querySelectorAll('p, li')].map(p => p.textContent.trim()).filter(Boolean);
              hasilMentah = parseTeksBarisKelas(lines, tahunDef);
            }
          } else if (ext === 'pdf') {
            const barisPdf = await ekstrakTeksBarisPdf(file);
            hasilMentah = parseTeksBarisKelas(barisPdf, tahunDef);
          } else {
            throw new Error('Format file tidak didukung. Gunakan PDF, Excel (.xlsx/.xls/.csv), atau Word (.docx).');
          }

          const kodeDalamFile = new Set();
          daftarKelasImpor = hasilMentah.map(it => {
            const key = teks(it.kodeKelas);
            const obj = validasiItemKelasImpor(it, kodeSudahAda);
            if (obj.valid && kodeDalamFile.has(key)) {
              obj.valid = false;
              obj.statusTeks = 'Duplikat';
              obj.catatan = 'Kode duplikat di dalam file';
            }
            kodeDalamFile.add(key);
            return obj;
          });
          renderPratinjauKelas();
        } catch (err) {
          info.textContent = err.message || 'Gagal membaca file daftar kelas.';
          tampilkanToast(info.textContent, 'error');
        }
      });
    },
    onSubmit: async () => {
      const terpilih = daftarKelasImpor.filter(x => x.dipilih && x.valid);
      if (!terpilih.length) throw new Error('Belum ada data kelas berstatus Valid yang dipilih untuk disimpan.');
      let tersimpan = 0;
      for (const k of terpilih) {
        if (!(await cekUnik(COLLECTIONS.kelas, 'kodeKelas', k.kodeKelas))) continue;
        await dbCreate(COLLECTIONS.kelas, {
          kodeKelas: k.kodeKelas.trim(),
          namaKelas: k.namaKelas.trim(),
          tingkat: k.tingkat,
          tahunAjaran: k.tahunAjaran.trim(),
          waliKelas: k.waliKelas.trim()
        });
        tersimpan++;
      }
      if (!tersimpan) throw new Error('Seluruh kelas terpilih sudah terdaftar di database.');
      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M2', 'DNC-M4', 'DNC-M6', 'DNC-M7']);
      await muatM2Master(true);
      tampilkanToast(`${tersimpan} data kelas berhasil diimpor.`);
    }
  });
}

async function sinkronMapelKeAkunGuru(userId, mapelId, mode = 'tambah') {
  if (!userId || !mapelId) return;
  const userObj = cariById('pengguna', userId) ||
    (penggunaAktif?.id === userId ? penggunaAktif : await dbGetById(COLLECTIONS.pengguna, userId));
  if (!userObj || !adalahRoleGuru(normalisasiRoleDnc(userObj.role))) return;
  const lama = Array.isArray(userObj.mapelIds) ? userObj.mapelIds : [];
  const baru = mode === 'hapus'
    ? lama.filter(x => x !== mapelId)
    : [...new Set([...lama, mapelId])];
  if (baru.length === lama.length && baru.every((v, i) => v === lama[i])) return;
  await dbUpdate(COLLECTIONS.pengguna, userId, { mapelIds: baru });
  userObj.mapelIds = baru;
  if (penggunaAktif?.id === userId) penggunaAktif.mapelIds = baru;
}

function bukaFormMapel(item = null) {
  if (item && !bolehKelolaMapel(item)) {
    tampilkanToast('Anda tidak memiliki izin mengubah mata pelajaran milik guru lain.', 'error');
    return;
  }

  const adalahAdmin = penggunaAktif?.role === 'Admin';
  const daftarPemilik = adalahAdmin
    ? stateMemori.pengguna
      .filter(u => !adalahRoleSiswa(normalisasiRoleDnc(u.role)) && u.statusAktif !== false)
      .sort((a, b) => {
        const p = r => (adalahRoleGuru(r) ? 0 : 1);
        const s = p(normalisasiRoleDnc(a.role)) - p(normalisasiRoleDnc(b.role));
        return s !== 0 ? s : teks(a.namaLengkap).localeCompare(teks(b.namaLengkap));
      })
    : [];
  const pemilikAwal = item?.dibuatOleh || penggunaAktif.id;

  bukaModalFormDnc({
    judul: item ? 'Ubah Mata Pelajaran & KKM' : 'Tambah Mata Pelajaran & KKM',
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-kodeMapel">Kode Mata Pelajaran *</label>
          <input id="f-kodeMapel" class="dnc-input" type="text" placeholder="Contoh: MTK-06" value="${esc(item?.kodeMapel || '')}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-kkm">Batas Nilai KKM (0–100) *</label>
          <input id="f-kkm" class="dnc-input" type="number" min="0" max="100" value="${esc(item?.kkm ?? 75)}" required>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="f-namaMapel">Nama Mata Pelajaran *</label>
          <input id="f-namaMapel" class="dnc-input" type="text" placeholder="Contoh: Matematika" value="${esc(item?.namaMapel || '')}" required>
        </div>
        ${adalahAdmin ? `
          <div class="dnc-form-grup dnc-form-full">
            <label class="dnc-label" for="f-pemilikMapel">Pemilik Mata Pelajaran &amp; KKM *</label>
            <select id="f-pemilikMapel" class="dnc-select" required>
              ${daftarPemilik.map(u => `<option value="${esc(u.id)}" ${pemilikAwal === u.id ? 'selected' : ''}>${esc(u.namaLengkap)} — ${esc(normalisasiRoleDnc(u.role))} (${esc(u.email)})</option>`).join('')}
            </select>
            <span class="dnc-form-bantuan">Mata pelajaran ini akan otomatis masuk ke daftar kewenangan dan KKM milik akun yang dipilih.</span>
          </div>` : ''}
      </div>`,
    onSubmit: async () => {
      const kkm = Number(document.getElementById('f-kkm').value);
      const pemilikId = adalahAdmin
        ? (document.getElementById('f-pemilikMapel')?.value || penggunaAktif.id)
        : penggunaAktif.id;
      const payload = {
        kodeMapel: document.getElementById('f-kodeMapel').value.trim(),
        namaMapel: document.getElementById('f-namaMapel').value.trim(),
        kkm,
        dibuatOleh: pemilikId
      };
      if (!payload.kodeMapel || !payload.namaMapel) throw new Error('Kode dan nama mata pelajaran wajib diisi.');
      if (isNaN(kkm) || kkm < 0 || kkm > 100) throw new Error('Nilai KKM harus berada pada rentang 0 sampai 100.');
      if (!(await cekUnikKodeMapelPerPemilik(payload.kodeMapel, pemilikId, item?.id))) {
        throw new Error(`Kode mata pelajaran "${payload.kodeMapel}" sudah digunakan pada akun pemilik ini.`);
      }

      if (item) {
        await dbUpdate(COLLECTIONS.mataPelajaran, item.id, payload);
        if (item.dibuatOleh && item.dibuatOleh !== pemilikId) {
          await sinkronMapelKeAkunGuru(item.dibuatOleh, item.id, 'hapus');
        }
        await sinkronMapelKeAkunGuru(pemilikId, item.id, 'tambah');
      } else {
        const baru = await dbCreate(COLLECTIONS.mataPelajaran, payload);
        await sinkronMapelKeAkunGuru(pemilikId, baru.id, 'tambah');
      }

      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M2', 'DNC-M3', 'DNC-M4', 'DNC-M6', 'DNC-M7']);
      await muatM2Master(true);
      tampilkanToast(item ? 'Mata pelajaran & KKM berhasil diperbarui.' : 'Mata pelajaran & KKM berhasil ditambahkan.');
    }
  });
}

async function hapusKelasDenganProteksi(id) {
  const k = cariById('kelas', id);
  if (!k) return;
  bukaKonfirmasi({
    judul: 'Hapus Data Kelas',
    pesan: `Yakin ingin menghapus kelas ${k.kodeKelas} (${k.namaKelas})?`,
    labelYa: 'Ya, Hapus',
    onYa: async () => {
      const [users, pakets, hasils] = await Promise.all([
        dbList(COLLECTIONS.pengguna),
        dbList(COLLECTIONS.paketAsas),
        dbList(COLLECTIONS.hasilUjian)
      ]);
      if (users.some(u => u.kelasId === id)) throw new Error('Kelas tidak dapat dihapus karena masih memiliki data Siswa.');
      if (pakets.some(p => Array.isArray(p.kelasIds) && p.kelasIds.includes(id))) throw new Error('Kelas tidak dapat dihapus karena masih digunakan pada Paket ASAS.');
      if (hasils.some(h => h.kelasId === id)) throw new Error('Kelas tidak dapat dihapus karena masih tercatat pada Hasil Ujian.');
      await dbDelete(COLLECTIONS.kelas, id);
      resetCacheMenu(['DNC-M1', 'DNC-M2', 'DNC-M4', 'DNC-M6', 'DNC-M7']);
      await muatM2Master(true);
      tampilkanToast('Data kelas berhasil dihapus.');
    }
  });
}

async function hapusMapelDenganProteksi(id) {
  const m = cariById('mataPelajaran', id);
  if (!m) return;
  if (!bolehKelolaMapel(m)) {
    tampilkanToast('Anda tidak memiliki izin menghapus mata pelajaran milik guru lain.', 'error');
    return;
  }
  bukaKonfirmasi({
    judul: 'Hapus Mata Pelajaran & KKM',
    pesan: `Yakin ingin menghapus mata pelajaran ${m.namaMapel} (KKM ${m.kkm})?`,
    labelYa: 'Ya, Hapus',
    onYa: async () => {
      const [users, soals, pakets, hasils] = await Promise.all([
        dbList(COLLECTIONS.pengguna),
        dbList(COLLECTIONS.bankSoal),
        dbList(COLLECTIONS.paketAsas),
        dbList(COLLECTIONS.hasilUjian)
      ]);
      if (soals.some(s => s.mapelId === id)) throw new Error('Mata pelajaran tidak dapat dihapus karena masih memiliki butir Bank Soal.');
      if (pakets.some(p => p.mapelId === id)) throw new Error('Mata pelajaran tidak dapat dihapus karena masih digunakan pada Paket RAD.');
      if (hasils.some(h => h.mapelId === id)) throw new Error('Mata pelajaran tidak dapat dihapus karena masih memiliki rekaman Hasil Ujian.');

      const guruLainPengampu = users.filter(u =>
        u.id !== m.dibuatOleh &&
        u.id !== penggunaAktif.id &&
        Array.isArray(u.mapelIds) &&
        u.mapelIds.includes(id)
      );
      if (guruLainPengampu.length) {
        throw new Error('Mata pelajaran tidak dapat dihapus karena masih diampu oleh akun Guru lain.');
      }

      if (m.dibuatOleh) await sinkronMapelKeAkunGuru(m.dibuatOleh, id, 'hapus');
      if (penggunaAktif?.id && penggunaAktif.id !== m.dibuatOleh) {
        await sinkronMapelKeAkunGuru(penggunaAktif.id, id, 'hapus');
      }

      await dbDelete(COLLECTIONS.mataPelajaran, id);
      resetCacheMenu(['DNC-M1', 'DNC-M2', 'DNC-M3', 'DNC-M4', 'DNC-M6', 'DNC-M7']);
      await muatM2Master(true);
      tampilkanToast('Mata pelajaran berhasil dihapus.');
    }
  });
}

function bukaModalAturPemilikMapel() {
  if (penggunaAktif?.role !== 'Admin') {
    tampilkanToast('Hanya Admin yang dapat mengatur kepemilikan Mata Pelajaran.', 'error');
    return;
  }

  const daftarKandidat = stateMemori.pengguna
    .filter(u => !adalahRoleSiswa(normalisasiRoleDnc(u.role)) && u.statusAktif !== false)
    .sort((a, b) => {
      const prior = r => (adalahRoleGuru(r) ? 0 : 1);
      const sel = prior(normalisasiRoleDnc(a.role)) - prior(normalisasiRoleDnc(b.role));
      return sel !== 0 ? sel : teks(a.namaLengkap).localeCompare(teks(b.namaLengkap));
    });

  if (!daftarKandidat.length) {
    tampilkanToast('Belum ada akun Guru atau Admin aktif pada Manajemen Pengguna.', 'error');
    return;
  }

  const guruSanti = daftarKandidat.find(u =>
    adalahRoleGuru(normalisasiRoleDnc(u.role)) &&
    (teks(u.namaLengkap).includes('santi') || teks(u.email).includes('santi'))
  );
  const defaultTargetId = guruSanti?.id || daftarKandidat[0].id;
  const jmlTanpaPemilik = stateMemori.mataPelajaran.filter(m => !m.dibuatOleh).length;

  const opsiCakupan = [
    `<option value="semua" selected>Semua mata pelajaran &amp; KKM yang ada saat ini (${stateMemori.mataPelajaran.length} mapel)</option>`,
    `<option value="tanpa_pemilik">Hanya mata pelajaran yang belum ditetapkan pemiliknya (${jmlTanpaPemilik} mapel)</option>`,
    ...stateMemori.mataPelajaran.map(m =>
      `<option value="${esc(m.id)}">Mapel: ${esc(m.kodeMapel)} — ${esc(m.namaMapel)} (KKM ${esc(m.kkm)} • Pemilik: ${esc(namaPemilikSoal(m.dibuatOleh))})</option>`
    )
  ].join('');

  bukaModalFormDnc({
    judul: 'Atur / Alihkan Pemilik Mata Pelajaran & KKM',
    labelSimpan: 'Tetapkan Pemilik Mapel',
    htmlKonten: `
      <div class="dnc-pratinjau-soal dnc-mb-12">
        <strong>Pengaturan Kewenangan Mata Pelajaran &amp; Nilai KKM (Khusus Admin)</strong>
        <div class="dnc-form-bantuan">Gunakan fitur ini untuk menetapkan seluruh mata pelajaran dan batas nilai KKM yang sudah ada saat ini menjadi hak milik akun <strong>Guru Santi</strong> (atau guru tertentu), sekaligus menyinkronkan daftar mapel ampunya.</div>
      </div>
      <div class="dnc-form-grup">
        <label class="dnc-label" for="f-target-pemilik-mapel">Tetapkan Menjadi Hak Milik Akun *</label>
        <select id="f-target-pemilik-mapel" class="dnc-select" required>
          ${daftarKandidat.map(u => `<option value="${esc(u.id)}" ${u.id === defaultTargetId ? 'selected' : ''}>${esc(u.namaLengkap)} — ${esc(normalisasiRoleDnc(u.role))} (${esc(u.email)})</option>`).join('')}
        </select>
      </div>
      <div class="dnc-form-grup">
        <label class="dnc-label" for="f-cakupan-pemilik-mapel">Cakupan Mata Pelajaran yang Dialihkan *</label>
        <select id="f-cakupan-pemilik-mapel" class="dnc-select" required>
          ${opsiCakupan}
        </select>
      </div>
      <div class="dnc-form-grup">
        <label class="dnc-check-label">
          <input id="f-sinkron-mapelids-guru" type="checkbox" checked>
          <span>Sinkronkan otomatis daftar mapel ampu (mapelIds) akun pemilik tujuan</span>
        </label>
      </div>`,
    onSubmit: async () => {
      const targetUserId = document.getElementById('f-target-pemilik-mapel').value;
      const cakupan = document.getElementById('f-cakupan-pemilik-mapel').value;
      const ikutSinkron = document.getElementById('f-sinkron-mapelids-guru').checked;
      if (!targetUserId) throw new Error('Pilih akun pemilik tujuan terlebih dahulu.');

      let targetMapel = [];
      if (cakupan === 'semua') {
        targetMapel = [...stateMemori.mataPelajaran];
      } else if (cakupan === 'tanpa_pemilik') {
        targetMapel = stateMemori.mataPelajaran.filter(m => !m.dibuatOleh);
      } else {
        targetMapel = stateMemori.mataPelajaran.filter(m => m.id === cakupan);
      }

      if (!targetMapel.length) throw new Error('Tidak ada mata pelajaran pada cakupan yang dipilih.');

      let jmlDiubah = 0;
      for (const m of targetMapel) {
        const pemilikLama = m.dibuatOleh || '';
        if (pemilikLama !== targetUserId) {
          await dbUpdate(COLLECTIONS.mataPelajaran, m.id, { dibuatOleh: targetUserId });
          jmlDiubah++;
        }
        if (ikutSinkron) {
          if (pemilikLama && pemilikLama !== targetUserId) {
            await sinkronMapelKeAkunGuru(pemilikLama, m.id, 'hapus');
          }
          await sinkronMapelKeAkunGuru(targetUserId, m.id, 'tambah');
        }
      }

      const targetObj = cariById('pengguna', targetUserId);
      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M2', 'DNC-M3', 'DNC-M4', 'DNC-M5', 'DNC-M6', 'DNC-M7']);
      await muatM2Master(true);
      tampilkanToast(`${targetMapel.length} mata pelajaran & KKM (${jmlDiubah} diperbarui) resmi menjadi hak milik ${targetObj?.namaLengkap || 'pemilik baru'}.`);
    }
  });
}
// ===== AKHIR BLOK: DNC_M2_MASTER =====

// ===== BLOK: DNC_M3_BANK_SOAL =====
async function muatM3BankSoal(paksa = false) {
  if (!sudahDimuat['DNC-M3'] || paksa) {
    await Promise.all([muatDataDasar(), muatDataPengguna(), muatDataBankSoal()]);
    sudahDimuat['DNC-M3'] = true;
  }

  const btnAturPemilik = document.getElementById('btn-tetapkan-pemilik-soal');
  if (btnAturPemilik) {
    btnAturPemilik.classList.toggle('dnc-disembunyikan', penggunaAktif?.role !== 'Admin');
  }

  const selPemilik = document.getElementById('filter-pemilik-soal');
  if (selPemilik) {
    const nilaiLama = selPemilik.value;
    if (adalahRoleGuru(penggunaAktif?.role)) {
      selPemilik.innerHTML = `
        <option value="milik_saya">Bank Soal Saya</option>
        <option value="referensi">Soal Guru Lain / Admin (Hanya Baca)</option>`;
      selPemilik.value = nilaiLama === 'referensi' ? 'referensi' : 'milik_saya';
    } else {
      const daftarPemilik = stateMemori.pengguna
        .filter(u => !adalahRoleSiswa(normalisasiRoleDnc(u.role)))
        .sort((a, b) => teks(a.namaLengkap).localeCompare(teks(b.namaLengkap)));
      selPemilik.innerHTML = `
        <option value="">Semua Pemilik</option>
        <option value="tanpa_pemilik">Belum Ditetapkan Pemiliknya</option>
        ${daftarPemilik.map(u => `<option value="${esc(u.id)}">${esc(u.namaLengkap)} (${esc(normalisasiRoleDnc(u.role))})</option>`).join('')}`;
      if ([...selPemilik.options].some(o => o.value === nilaiLama)) selPemilik.value = nilaiLama;
      else selPemilik.value = '';
    }
  }

  const mapelOpsi = daftarMapelDiizinkan().map(m => ({ value: m.id, label: `${m.kodeMapel} - ${m.namaMapel}` }));
  isiSelectOpsi('filter-mapel-soal', mapelOpsi, 'Semua Mapel');
  renderTabelSoal();
}

function bersihkanNamaPaketSoal(namaFile) {
  return String(namaFile || '').replace(/\.[^/.]+$/, '').trim();
}

function namaSumberPaketSoal(s) {
  const eksplisit = String(s?.sumberPaket || '').trim();
  if (eksplisit) return eksplisit;
  const kode = String(s?.kodeSoal || '').trim();
  const mBatch = kode.match(/^([A-Za-z0-9]+-[WS]\d+)-\d+/i);
  if (mBatch) return `Paket_Impor_${mBatch[1]}`;
  const mCsv = kode.match(/^([A-Za-z0-9]+-\d{4})-\d+/i);
  if (mCsv) return `Paket_Impor_${mCsv[1]}`;
  const mapel = namaMapelById(s?.mapelId).replace(/\s+/g, '_');
  return `Soal_Manual_${mapel}_Tingkat_${s?.tingkat || 'Umum'}`;
}

const STOPWORD_GAMBAR_DNC = new Set([
  'http', 'https', 'www', 'com', 'org', 'net', 'edu', 'gov', 'id', 'co', 'io', 'app',
  'drive', 'google', 'docs', 'file', 'view', 'open', 'uc', 'thumbnail', 'export', 'usp', 'sharing',
  'dropbox', 'raw', 'dl', 'github', 'githubusercontent', 'blob', 'main', 'master',
  'firebasestorage', 'googleapis', 'storage', 'media', 'upload', 'uploads', 'wikimedia', 'wikipedia',
  'commons', 'thumb', 'images', 'image', 'img', 'foto', 'photo', 'pic', 'picture', 'gambar', 'ilustrasi',
  'assets', 'static', 'content', 'public', 'cdn', 'files', 'soal', 'asas', 'tka', 'bank', 'paket',
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif', 'px', 'w1000', 'sz', 'alt', 'token',
  'dan', 'yang', 'dari', 'untuk', 'pada', 'atau', 'dengan', 'ini', 'itu', 'adalah', 'dalam', 'oleh',
  'sumber', 'link', 'url', 'perhatikan', 'berikut', 'di', 'ke', 'sebagai', 'tersebut', 'bawah'
]);

function normalisasiUrlGambarSoal(urlRaw) {
  let u = String(urlRaw || '').trim();
  if (!u) return '';
  if (u.startsWith('data:image/')) return u;
  u = u.replace(/^[<(\["']+/, '').replace(/[>)\]"'\.,;]+$/, '').trim();
  if (!/^https?:\/\//i.test(u)) return u;

  // Konversi link Google Drive menjadi URL gambar langsung
  const mDriveFile = u.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  const mDriveId = u.match(/drive\.google\.com\/(?:open|uc|thumbnail)\?[^#]*\bid=([a-zA-Z0-9_-]+)/i);
  const driveId = mDriveFile?.[1] || mDriveId?.[1] || '';
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
  }

  // Konversi link Dropbox menjadi URL raw langsung
  if (/dropbox\.com/i.test(u)) {
    try {
      const parsed = new URL(u);
      parsed.searchParams.delete('dl');
      parsed.searchParams.set('raw', '1');
      return parsed.toString();
    } catch (_) {}
  }

  // Konversi link GitHub blob menjadi raw.githubusercontent
  const mGh = u.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/i);
  if (mGh) {
    return `https://raw.githubusercontent.com/${mGh[1]}/${mGh[2]}/${mGh[3]}`;
  }

  return u;
}

function adalahUrlGambarPotensial(urlRaw) {
  const u = String(urlRaw || '').trim();
  if (!u) return false;
  if (u.startsWith('data:image/')) return true;
  if (!/^https?:\/\//i.test(u)) return false;
  if (/\.(?:png|jpe?g|gif|webp|svg|bmp|avif)(?:[?#].*)?$/i.test(u)) return true;
  return /(?:drive\.google\.com|googleusercontent\.com|dropbox\.com|imgur\.com|ibb\.co|postimg\.cc|upload\.wikimedia\.org|firebasestorage\.googleapis\.com|cloudinary\.com|unsplash\.com|pixabay\.com|pexels\.com)/i.test(u);
}

function ekstrakLinkGambarDariTeks(teksRaw) {
  let teksBersih = String(teksRaw || '');
  let urlAsli = '';
  let labelTeksGambar = '';

  const reBerlabel = /(?:[\(\[]\s*)?(?:sumber\s+gambar|link\s+gambar|url\s+gambar|gambar|ilustrasi|foto)\s*[:=\-]?\s*(https?:\/\/[^\s<>"'\)\]]+)(?:\s*[\)\]])?/i;
  const mLabel = teksBersih.match(reBerlabel);
  if (mLabel) {
    urlAsli = mLabel[1].replace(/[.,;)\]]+$/, '');
    labelTeksGambar = mLabel[0].replace(mLabel[1], '').trim();
    teksBersih = teksBersih.replace(mLabel[0], ' ');
  } else {
    const semuaUrl = teksBersih.match(/https?:\/\/[^\s<>"'\)\]]+/gi) || [];
    const kandidat = semuaUrl.map(x => x.replace(/[.,;)\]]+$/, '')).find(adalahUrlGambarPotensial);
    if (kandidat) {
      urlAsli = kandidat;
      teksBersih = teksBersih.replace(kandidat, ' ');
    }
  }

  teksBersih = teksBersih
    .replace(/[\(\[]\s*(?:sumber\s+gambar|link\s+gambar|gambar)?\s*[:=\-]?\s*[\)\]]/gi, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    teksBersih,
    urlAsli,
    urlGambar: urlAsli ? normalisasiUrlGambarSoal(urlAsli) : '',
    labelTeksGambar
  };
}

function ekstrakTokenKataKunciDnc(teksRaw) {
  let s = String(teksRaw || '');
  try { s = decodeURIComponent(s); } catch (_) {}
  const kata = s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(Boolean);
  return [...new Set(kata.filter(k => k.length >= 3 && !/^\d+$/.test(k) && !STOPWORD_GAMBAR_DNC.has(k)))];
}

function ambilInfoKunciJawabanSoal(soal) {
  const tipe = soal?.tipeSoal || 'Pilihan Ganda';
  const opsi = Array.isArray(soal?.opsiJawaban) ? soal.opsiJawaban : [];
  const kunciRaw = String(soal?.kunciJawaban || '').trim();

  if (tipe === 'Pilihan Ganda') {
    const kode = kunciRaw.toUpperCase().replace(/[^A-E]/g, '').slice(0, 1);
    const cocok = opsi.find(o => o.kode === kode);
    const pengecoh = opsi.filter(o => o.kode !== kode).map(o => o.teks).join(' ');
    return {
      ringkas: cocok ? `${kode}. ${cocok.teks}` : (kode || 'Belum diisi'),
      teksBenar: cocok ? cocok.teks : kunciRaw,
      teksPengecoh: pengecoh
    };
  }
  if (tipe === 'Pilihan Ganda Kompleks') {
    const setK = parseKunciKompleksSet(kunciRaw);
    const benarList = opsi.filter(o => setK.has(o.kode));
    const pengecoh = opsi.filter(o => !setK.has(o.kode)).map(o => o.teks).join(' ');
    return {
      ringkas: benarList.length ? benarList.map(o => `${o.kode}. ${o.teks}`).join(' | ') : (kunciRaw || 'Belum diisi'),
      teksBenar: benarList.map(o => o.teks).join(' '),
      teksPengecoh: pengecoh
    };
  }
  return {
    ringkas: kunciRaw || 'Belum diisi',
    teksBenar: kunciRaw,
    teksPengecoh: ''
  };
}

function analisisKesesuaianGambarSoal(soal, statusMuat = 'belum') {
  const url = normalisasiUrlGambarSoal(soal?.urlGambar || '');
  if (!url) return null;
  const infoKunci = ambilInfoKunciJawabanSoal(soal);

  if (statusMuat === 'gagal') {
    return {
      kelas: 'bahaya',
      status: 'Link Gambar Rusak / Tidak Tampil',
      pesan: 'Gambar gagal dimuat. Periksa link sumber, dan bila memakai Google Drive pastikan akses dibagikan ke "Siapa saja yang memiliki link" (Pelihat).',
      ringkasKunci: infoKunci.ringkas,
      urlTampil: url
    };
  }

  if (soal?.gambarTerverifikasi) {
    return {
      kelas: 'cocok',
      status: 'Terverifikasi Sesuai Guru',
      pesan: 'Kesesuaian gambar dengan kunci jawaban telah dikonfirmasi secara visual.',
      ringkasKunci: infoKunci.ringkas,
      urlTampil: url
    };
  }

  const sumberMeta = `${soal?.urlGambarAsli || url} ${soal?.labelGambar || ''}`;
  const tokenGambar = url.startsWith('data:image/') ? [] : ekstrakTokenKataKunciDnc(sumberMeta);
  const tokenKunci = new Set(ekstrakTokenKataKunciDnc(infoKunci.teksBenar));
  const tokenTanya = new Set(ekstrakTokenKataKunciDnc(soal?.pertanyaan || ''));
  const tokenPengecoh = new Set(ekstrakTokenKataKunciDnc(infoKunci.teksPengecoh));

  const cocokKunci = tokenGambar.filter(t => tokenKunci.has(t));
  const cocokTanya = tokenGambar.filter(t => tokenTanya.has(t));
  const cocokPengecoh = tokenGambar.filter(t => tokenPengecoh.has(t) && !tokenKunci.has(t));

  if (cocokKunci.length > 0) {
    return {
      kelas: 'cocok',
      status: 'Relevan & Cocok Kunci',
      pesan: `Metadata link gambar ("${cocokKunci.slice(0, 3).join(', ')}") cocok dengan isi Kunci Jawaban.`,
      ringkasKunci: infoKunci.ringkas,
      urlTampil: url
    };
  }
  if (cocokPengecoh.length > 0) {
    return {
      kelas: 'bahaya',
      status: 'Indikasi Tidak Sesuai Kunci!',
      pesan: `Link gambar justru mengandung kata "${cocokPengecoh.slice(0, 3).join(', ')}" yang ada di opsi pengecoh, bukan di Kunci Jawaban. Periksa ulang kunci atau gambar!`,
      ringkasKunci: infoKunci.ringkas,
      urlTampil: url
    };
  }
  if (cocokTanya.length > 0) {
    return {
      kelas: 'cocok',
      status: 'Relevan dengan Topik Soal',
      pesan: `Metadata gambar ("${cocokTanya.slice(0, 3).join(', ')}") sesuai topik soal. Pastikan gambar selaras secara visual dengan Kunci Jawaban.`,
      ringkasKunci: infoKunci.ringkas,
      urlTampil: url
    };
  }

  return {
    kelas: 'peringatan',
    status: 'Perlu Cek Visual Kunci',
    pesan: 'URL/gambar tidak memuat kata kunci deskriptif (mis. ID acak Drive/dokumen). Bandingkan thumbnail gambar dengan isi Kunci Jawaban di samping.',
    ringkasKunci: infoKunci.ringkas,
    urlTampil: url
  };
}

const paketSoalTerbukaM3 = new Set();

function kunciGrupSoalM3(s) {
  return `${namaSumberPaketSoal(s)}||${s.mapelId || ''}||${normalisasiKategoriSoal(s.kategoriSoal)}||${s.dibuatOleh || ''}`;
}

function togglePaketSoalM3(kunci) {
  if (!kunci) return;
  if (paketSoalTerbukaM3.has(kunci)) paketSoalTerbukaM3.delete(kunci);
  else paketSoalTerbukaM3.add(kunci);
  renderTabelSoal();
}

function renderTabelSoal() {
  const wadah = document.getElementById('wadah-paket-soal-m3');
  if (!wadah) return;

  const adalahGuru = adalahRoleGuru(penggunaAktif?.role);
  const adalahAdmin = penggunaAktif?.role === 'Admin';
  const q = teks(document.getElementById('cari-soal')?.value || '');
  const fPemilik = document.getElementById('filter-pemilik-soal')?.value || (adalahGuru ? 'milik_saya' : '');
  const fKategori = document.getElementById('filter-kategori-soal')?.value || '';
  const fMapel = document.getElementById('filter-mapel-soal')?.value || '';
  const fTingkat = document.getElementById('filter-tingkat-soal')?.value || '';
  const fTipe = document.getElementById('filter-tipe-soal')?.value || '';
  const fStatus = document.getElementById('filter-status-soal')?.value || '';

  const data = stateMemori.bankSoal.filter(s => {
    if (adalahGuru) {
      if (fPemilik === 'referensi') {
        if (s.dibuatOleh === penggunaAktif.id) return false;
      } else if (s.dibuatOleh !== penggunaAktif.id) {
        return false;
      }
    } else if (fPemilik === 'tanpa_pemilik') {
      if (s.dibuatOleh) return false;
    } else if (fPemilik && s.dibuatOleh !== fPemilik) {
      return false;
    }

    const kat = normalisasiKategoriSoal(s.kategoriSoal);
    if (fKategori && kat !== fKategori) return false;
    if (fMapel && s.mapelId !== fMapel) return false;
    if (fTingkat && s.tingkat !== fTingkat) return false;
    if (fTipe && s.tipeSoal !== fTipe) return false;
    if (fStatus === 'aktif' && !s.statusAktif) return false;
    if (fStatus === 'nonaktif' && s.statusAktif) return false;
    if (q && !`${teks(s.kodeSoal)} ${teks(kat)} ${teks(namaSumberPaketSoal(s))} ${teks(namaPemilikSoal(s.dibuatOleh))} ${teks(s.pertanyaan)} ${teks(s.kunciJawaban)}`.includes(q)) return false;
    return true;
  });

  if (!data.length) {
    const pesanKosong = adalahGuru && fPemilik === 'milik_saya'
      ? 'Belum ada soal milik akun Anda. Gunakan tombol Tambah Soal, Impor Pintar, atau pilih filter "Soal Guru Lain / Admin (Hanya Baca)" untuk menyalin referensi.'
      : 'Belum ada paket atau butir soal yang sesuai filter.';
    wadah.innerHTML = `<div class="dnc-kosong-box">${esc(pesanKosong)}</div>`;
    return;
  }

  const petaGrup = new Map();
  data.forEach(s => {
    const kunci = kunciGrupSoalM3(s);
    if (!petaGrup.has(kunci)) {
      petaGrup.set(kunci, {
        kunci,
        namaGrup: namaSumberPaketSoal(s),
        mapelId: s.mapelId,
        kategoriSoal: normalisasiKategoriSoal(s.kategoriSoal),
        dibuatOleh: s.dibuatOleh || '',
        list: []
      });
    }
    petaGrup.get(kunci).list.push(s);
  });

  const daftarGrup = [...petaGrup.values()].map(g => {
    g.list.sort((a, b) =>
      String(a.kodeSoal || '').localeCompare(String(b.kodeSoal || ''), undefined, { numeric: true, sensitivity: 'base' })
    );
    return g;
  });

  wadah.innerHTML = daftarGrup.map(g => {
    const terbuka = paketSoalTerbukaM3.has(g.kunci);
    const bolehKelolaGrup = g.list.every(s => bolehKelolaSoal(s));
    const totalBobot = bulatDua(g.list.reduce((acc, s) => acc + poinEfektifSoal(s), 0));
    const jmlAktif = g.list.filter(s => s.statusAktif !== false).length;
    const jmlBergambar = g.list.filter(s => Boolean(s.urlGambar)).length;
    const daftarTingkat = [...new Set(g.list.map(s => s.tingkat).filter(Boolean))].join(', ');
    const daftarTipe = [...new Set(g.list.map(s => s.tipeSoal).filter(Boolean))].join(', ');

    const isiTabelHtml = terbuka ? `
      <div class="dnc-grup-halaman-isi">
        <div class="dnc-pembungkus-tabel">
          <table class="dnc-tabel dnc-tabel-padat">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode Soal</th>
                <th>Tipe Soal</th>
                <th>Pertanyaan</th>
                <th>Kunci Jawaban</th>
                <th>Poin</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${g.list.map((s, idx) => {
                const bolehEdit = bolehKelolaSoal(s);
                const poinButir = poinEfektifSoal(s);
                const kunciHtml = s.tipeSoal === 'Pilihan Ganda' || s.tipeSoal === 'Pilihan Ganda Kompleks'
                  ? `<strong class="dnc-mono">${esc(s.kunciJawaban || '-')}</strong>`
                  : `<div class="dnc-teks-potong" style="max-width:160px" title="${esc(s.kunciJawaban || '')}">${esc(s.kunciJawaban || 'Rubrik')}</div>`;
                const cekGbr = s.urlGambar ? analisisKesesuaianGambarSoal(s) : null;
                const badgeGbr = cekGbr
                  ? `<span class="dnc-badge ${cekGbr.kelas === 'bahaya' ? 'dnc-badge-merah' : (cekGbr.kelas === 'cocok' ? 'dnc-badge-hijau' : 'dnc-badge-amber')}" title="${esc(cekGbr.pesan)}">Bergambar</span>`
                  : '';
                const tombolBarisHtml = bolehEdit
                  ? `<button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-pratinjau-soal="${esc(s.id)}">Lihat</button>
                     <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-duplikat-soal="${esc(s.id)}">Duplikat</button>
                     <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-ubah-soal="${esc(s.id)}">Ubah</button>
                     <button type="button" class="dnc-tombol dnc-tombol-bahaya dnc-tombol-kecil" data-hapus-soal="${esc(s.id)}">Hapus</button>`
                  : `<button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-pratinjau-soal="${esc(s.id)}">Lihat</button>
                     <button type="button" class="dnc-tombol dnc-tombol-primer dnc-tombol-kecil" data-duplikat-soal="${esc(s.id)}">Salin ke Soal Saya</button>`;
                return `
                  <tr>
                    <td data-label="No"><strong>${idx + 1}</strong></td>
                    <td data-label="Kode Soal"><span class="dnc-mono">${esc(s.kodeSoal)}</span>${badgeGbr ? `<div style="margin-top:3px">${badgeGbr}</div>` : ''}</td>
                    <td data-label="Tipe Soal">${badgeTipeSoal(s.tipeSoal)}</td>
                    <td data-label="Pertanyaan"><div class="dnc-teks-potong" title="${esc(s.pertanyaan)}">${esc(s.pertanyaan)}</div></td>
                    <td data-label="Kunci Jawaban">${kunciHtml}</td>
                    <td data-label="Poin"><strong>${esc(poinButir)}</strong></td>
                    <td data-label="Status">${badgeStatus(s.statusAktif ? 'Aktif' : 'Nonaktif')}</td>
                    <td class="dnc-sel-aksi">
                      <div class="dnc-aksi-baris">${tombolBarisHtml}</div>
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>` : '';

    let aksiHeaderPaket = '';
    if (adalahAdmin) {
      aksiHeaderPaket = `
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-alihkan-pemilik-paket="${esc(g.kunci)}">Alihkan Pemilik</button>
        <button type="button" class="dnc-tombol dnc-tombol-bahaya dnc-tombol-kecil" data-hapus-paket-soal="${esc(g.kunci)}">Hapus Paket</button>`;
    } else if (bolehKelolaGrup) {
      aksiHeaderPaket = `
        <button type="button" class="dnc-tombol dnc-tombol-bahaya dnc-tombol-kecil" data-hapus-paket-soal="${esc(g.kunci)}">Hapus Paket</button>`;
    } else {
      aksiHeaderPaket = `
        <button type="button" class="dnc-tombol dnc-tombol-primer dnc-tombol-kecil" data-salin-paket-soal="${esc(g.kunci)}">Salin Paket ke Soal Saya</button>`;
    }

    return `
      <div class="dnc-grup-halaman-kartu">
        <div class="dnc-grup-halaman-kepala ${terbuka ? 'terbuka' : ''}">
          <button type="button" class="dnc-grup-halaman-toggle" data-toggle-paket-m3="${esc(g.kunci)}" aria-expanded="${terbuka ? 'true' : 'false'}">
            <div style="min-width:0">
              <div class="dnc-grup-halaman-judul">${esc(g.namaGrup)}</div>
              <div class="dnc-grup-halaman-meta">
                ${badgeKategoriSoal(g.kategoriSoal)}
                <span class="dnc-badge dnc-badge-biru">${esc(namaMapelById(g.mapelId))}</span>
                <span class="dnc-badge dnc-badge-abu">Pemilik: ${esc(namaPemilikSoal(g.dibuatOleh))}</span>
                ${adalahGuru && !bolehKelolaGrup ? '<span class="dnc-badge dnc-badge-amber">Hanya Baca</span>' : ''}
                ${daftarTingkat ? `<span class="dnc-badge dnc-badge-abu">Tingkat ${esc(daftarTingkat)}</span>` : ''}
                ${jmlBergambar ? `<span class="dnc-badge dnc-badge-ungu">${jmlBergambar} Bergambar</span>` : ''}
                <span>${g.list.length} butir soal • Total Poin Maks ${totalBobot} • Aktif ${jmlAktif}/${g.list.length}</span>
                ${daftarTipe ? `<span>• ${esc(daftarTipe)}</span>` : ''}
              </div>
            </div>
            <span class="dnc-grup-halaman-panah">${terbuka ? 'Tutup Butir ▴' : 'Lihat Butir ▾'}</span>
          </button>
          <div class="dnc-grup-halaman-aksi">${aksiHeaderPaket}</div>
        </div>
        ${isiTabelHtml}
      </div>`;
  }).join('');
}

function sinkronkanBobotBankSoalOtomatis() {
  const daftarKelola = stateMemori.bankSoal.filter(s => bolehKelolaSoal(s));
  if (!daftarKelola.length) {
    tampilkanToast('Belum ada butir Bank Soal yang dapat disinkronkan.', 'error');
    return;
  }

  const perluUpdate = daftarKelola.filter(s => Number(s.bobotNilai) !== poinEfektifSoal(s));
  if (!perluUpdate.length) {
    tampilkanToast('Seluruh butir Bank Soal sudah sesuai poin otomatis standar RAD (PG/PGK/BS = 1, Isian = 2).', 'info');
    return;
  }

  bukaKonfirmasi({
    judul: 'Sinkronkan Poin Bank Soal Lama',
    pesan: `Ditemukan ${perluUpdate.length} dari ${daftarKelola.length} butir soal yang masih memakai bobot lama. Ubah seluruhnya ke poin otomatis standar RAD (PG = 1, PG Kompleks = 1, Benar/Salah = 1, Isian Singkat = 2)?`,
    labelYa: 'Ya, Sinkronkan Poin',
    kelasTombol: 'dnc-tombol-primer',
    onYa: async () => {
      let berhasil = 0;
      for (const s of perluUpdate) {
        await dbUpdate(COLLECTIONS.bankSoal, s.id, { bobotNilai: poinEfektifSoal(s) });
        berhasil++;
      }
      resetCacheMenu(['DNC-M1', 'DNC-M3', 'DNC-M4', 'DNC-M5', 'DNC-M6']);
      await muatM3BankSoal(true);
      tampilkanToast(`${berhasil} butir soal berhasil disinkronkan ke poin otomatis RAD. Buka menu Jadwal & Paket RAD lalu klik "Hitung Ulang Nilai" untuk memperbarui hasil ujian yang sudah berjalan.`);
    }
  });
}

function opsiMapToObj(list) {
  const map = { A: '', B: '', C: '', D: '', E: '' };
  (list || []).forEach(o => { if (o && o.kode) map[o.kode.toUpperCase()] = o.teks || ''; });
  return map;
}

function adalahTipeBeropsi(tipe) {
  return tipe === 'Pilihan Ganda' || tipe === 'Pilihan Ganda Kompleks';
}

function bukaFormSoal(item = null) {
  if (item && !bolehKelolaSoal(item)) {
    tampilkanToast('Soal milik guru lain berstatus Hanya Baca. Klik "Salin ke Soal Saya" untuk membuat salinan yang dapat Anda ubah.', 'error');
    return;
  }
  const mapelList = daftarMapelDiizinkan();
  if (!mapelList.length) {
    tampilkanToast('Tambahkan mata pelajaran terlebih dahulu sebelum membuat soal.', 'error');
    return;
  }
  const opsi = opsiMapToObj(item?.opsiJawaban);
  const tipeAwal = item?.tipeSoal || 'Pilihan Ganda';
  const kategoriAwal = normalisasiKategoriSoal(item?.kategoriSoal);
  const kunciSet = parseKunciKompleksSet(item?.kunciJawaban);
  let gambarTerverifikasiForm = Boolean(item?.gambarTerverifikasi);

  bukaModalFormDnc({
    judul: item ? 'Ubah Butir Soal' : 'Tambah Butir Soal',
    lebar: true,
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-kodeSoal">Kode Soal *</label>
          <input id="f-kodeSoal" class="dnc-input" type="text" placeholder="Contoh: MTK06-003" value="${esc(item?.kodeSoal || '')}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-kategoriSoal">Kategori Soal *</label>
          <select id="f-kategoriSoal" class="dnc-select" required>
            ${KATEGORI_SOAL_LIST.map(k => `<option value="${k}" ${kategoriAwal === k ? 'selected' : ''}>Soal ${k}</option>`).join('')}
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-mapelId">Mata Pelajaran *</label>
          <select id="f-mapelId" class="dnc-select" required>
            ${mapelList.map(m => `<option value="${esc(m.id)}" ${item?.mapelId === m.id ? 'selected' : ''}>${esc(m.kodeMapel)} - ${esc(m.namaMapel)}</option>`).join('')}
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-tingkatSoal">Tingkat (SD / SMP / SMA) *</label>
          <select id="f-tingkatSoal" class="dnc-select" required>
            ${TINGKAT_LIST.map(t => `<option value="${t}" ${(item?.tingkat || 'I') === t ? 'selected' : ''}>${esc(labelTingkat(t))}</option>`).join('')}
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-tipeSoal">Tipe Soal *</label>
          <select id="f-tipeSoal" class="dnc-select" required>
            ${daftarTipeSoalDiizinkanForm().map(t => `<option value="${t}" ${tipeAwal === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-bobotNilai">Poin Soal (Otomatis RAD) *</label>
          <input id="f-bobotNilai" class="dnc-input" type="number" min="0.5" step="0.5" value="${esc(bobotOtomatisTipeSoal(tipeAwal, item?.bobotNilai))}" ${adalahTipePoinOtomatis(tipeAwal) ? 'readonly' : ''} required>
          <span id="bantuan-bobot-form" class="dnc-form-bantuan">Otomatis: PG/PGK/BS = 1, Isian Singkat = 2.</span>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="f-sumberPaket">Nama Paket / Grup Soal (Opsional)</label>
          <input id="f-sumberPaket" class="dnc-input" type="text" list="daftar-paket-soal-eksisting" placeholder="Contoh: Bank_Soal_ASAS_Matematika_Kelas_6_Semester_1" value="${esc(item?.sumberPaket || '')}">
          <datalist id="daftar-paket-soal-eksisting">
            ${[...new Set(stateMemori.bankSoal.map(s => namaSumberPaketSoal(s)))].map(nm => `<option value="${esc(nm)}"></option>`).join('')}
          </datalist>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="f-pertanyaan">Pertanyaan *</label>
          <textarea id="f-pertanyaan" class="dnc-textarea" placeholder="Tulis pertanyaan soal secara lengkap (jika memuat link gambar akan terdeteksi otomatis)..." required>${esc(item?.pertanyaan || '')}</textarea>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="f-urlGambar">Gambar Pendukung (Unggah File Lokal atau Tempel Link Drive / Dropbox / URL)</label>
          <input id="f-urlGambar" class="dnc-input" type="text" placeholder="Tempel link gambar (https://...) atau gunakan tombol Unggah Gambar di bawah" value="${esc((item?.urlGambar || '').startsWith('data:image/') ? '' : (item?.urlGambar || ''))}">
          <div class="dnc-gbr-aksi-row">
            <label class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" style="cursor:pointer">
              <span>Unggah Gambar Lokal</span>
              <input id="f-file-gambar-soal" type="file" accept="image/*" style="display:none">
            </label>
            <button type="button" id="btn-ocr-gambar-form" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil">Baca Teks Gambar (OCR)</button>
            <button type="button" id="btn-hapus-gambar-form" class="dnc-tombol dnc-tombol-bahaya dnc-tombol-kecil">Hapus Gambar</button>
          </div>
          <div id="wadah-cek-gambar-form"></div>
        </div>
        <div id="wadah-opsi-pg" class="dnc-form-full ${!adalahTipeBeropsi(tipeAwal) ? 'dnc-disembunyikan' : ''}">
          <div class="dnc-form-grid">
            ${['A', 'B', 'C', 'D', 'E'].map(k => `
              <div class="dnc-form-grup ${k === 'E' ? 'dnc-form-full' : ''}">
                <label class="dnc-label" for="f-opsi-${k}">Opsi ${k} ${k === 'E' ? '(Opsional)' : '*'}</label>
                <input id="f-opsi-${k}" class="dnc-input" type="text" value="${esc(opsi[k])}" placeholder="Teks pilihan ${k}">
              </div>`).join('')}
          </div>
        </div>
        <div id="wadah-kunci-kompleks" class="dnc-form-grup dnc-form-full ${tipeAwal !== 'Pilihan Ganda Kompleks' ? 'dnc-disembunyikan' : ''}">
          <label class="dnc-label">Centang Kunci Jawaban Benar (PG Kompleks — pilih 2 atau lebih) *</label>
          <div class="dnc-flex-gap">
            ${['A', 'B', 'C', 'D', 'E'].map(k => `
              <label class="dnc-check-label">
                <input type="checkbox" name="f-kunci-kompleks" value="${k}" ${kunciSet.has(k) ? 'checked' : ''}>
                <span>Opsi ${k}</span>
              </label>`).join('')}
          </div>
        </div>
        <div id="wadah-kunci-teks" class="dnc-form-grup dnc-form-full ${tipeAwal === 'Pilihan Ganda Kompleks' ? 'dnc-disembunyikan' : ''}">
          <label id="lbl-kunci-teks-form" class="dnc-label" for="f-kunciJawaban">Kunci Jawaban / Rubrik</label>
          <input id="f-kunciJawaban" class="dnc-input" type="text" placeholder="A-E untuk PG; 1. Benar, 2. Benar, 3. Salah untuk Benar/Salah; teks Isian; rubrik Uraian" value="${esc(item?.kunciJawaban || '')}">
          <span id="bantuan-kunci-teks-form" class="dnc-form-bantuan"></span>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-check-label">
            <input id="f-statusAktifSoal" type="checkbox" ${(item ? item.statusAktif : true) ? 'checked' : ''}>
            <span>Status Aktif (tersedia untuk dipilih pada Paket ASAS &amp; Bank Soal Bimbel)</span>
          </label>
        </div>
      </div>`,
    onMount: () => {
      const selTipe = document.getElementById('f-tipeSoal');
      const wadahCek = document.getElementById('wadah-cek-gambar-form');
      const inpUrlGbr = document.getElementById('f-urlGambar');
      if (inpUrlGbr) {
        inpUrlGbr._gambarLokal = (item?.urlGambar || '').startsWith('data:image/') ? item.urlGambar : '';
      }

      const ambilDraftSoalForm = () => {
        const tp = selTipe.value;
        const opsiNow = [];
        ['A', 'B', 'C', 'D', 'E'].forEach(k => {
          const val = (document.getElementById(`f-opsi-${k}`)?.value || '').trim();
          if (val) opsiNow.push({ kode: k, teks: val });
        });
        const kunciNow = tp === 'Pilihan Ganda Kompleks'
          ? [...document.querySelectorAll('input[name="f-kunci-kompleks"]:checked')].map(el => el.value).join(', ')
          : (document.getElementById('f-kunciJawaban')?.value || '').trim();
        const urlInput = (inpUrlGbr?.value || '').trim();
        const urlAsli = urlInput || inpUrlGbr?._gambarLokal || '';
        return {
          tipeSoal: tp,
          pertanyaan: (document.getElementById('f-pertanyaan')?.value || '').trim(),
          urlGambar: normalisasiUrlGambarSoal(urlAsli),
          urlGambarAsli: urlInput,
          opsiJawaban: opsiNow,
          kunciJawaban: kunciNow,
          gambarTerverifikasi: gambarTerverifikasiForm
        };
      };

      const renderCekGambarForm = (statusMuat = 'belum') => {
        if (!wadahCek) return;
        const draft = ambilDraftSoalForm();
        const cek = analisisKesesuaianGambarSoal(draft, statusMuat);
        if (!cek) { wadahCek.innerHTML = ''; return; }
        wadahCek.innerHTML = `
          <div class="dnc-img-cek-box ${cek.kelas}">
            <img id="f-img-preview-soal" class="dnc-img-cek-thumb" src="${esc(cek.urlTampil)}" alt="Pratinjau gambar soal" title="Klik untuk perbesar gambar">
            <div class="dnc-img-cek-info">
              <div class="dnc-flex-between">
                <strong>Cek Gambar &amp; Kunci: ${esc(cek.status)}</strong>
                ${cek.kelas !== 'bahaya' && !gambarTerverifikasiForm ? '<button type="button" id="btn-verif-gbr-form" class="dnc-tombol dnc-tombol-sukses dnc-tombol-kecil" style="height:24px;font-size:11px">Tandai Sesuai</button>' : ''}
              </div>
              <div class="dnc-img-cek-kunci"><strong>Isi Kunci:</strong> ${esc(cek.ringkasKunci)}</div>
              <div class="dnc-teks-muted">${esc(cek.pesan)}</div>
            </div>
          </div>`;
        const imgEl = document.getElementById('f-img-preview-soal');
        if (imgEl) {
          imgEl.addEventListener('error', () => {
            if (statusMuat !== 'gagal') renderCekGambarForm('gagal');
          });
          imgEl.addEventListener('click', () => bukaZoomGambarDnc(cek.urlTampil));
        }
        document.getElementById('btn-verif-gbr-form')?.addEventListener('click', () => {
          gambarTerverifikasiForm = true;
          renderCekGambarForm('sukses');
        });
      };

      document.getElementById('f-file-gambar-soal')?.addEventListener('change', async e => {
        const fileGbr = e.target.files[0];
        if (!fileGbr) return;
        try {
          const terkompres = await kompresFileGambarLokal(fileGbr, 1024);
          if (!terkompres) throw new Error('Ukuran gambar terlalu besar atau format tidak didukung.');
          if (inpUrlGbr) {
            inpUrlGbr._gambarLokal = terkompres;
            inpUrlGbr.value = '';
          }
          gambarTerverifikasiForm = false;
          renderCekGambarForm('sukses');
          tampilkanToast('Gambar lokal berhasil dimuat dan dikompres tajam.');
        } catch (err) {
          tampilkanToast(err.message || 'Gagal memuat gambar lokal.', 'error');
        }
      });

      document.getElementById('btn-hapus-gambar-form')?.addEventListener('click', () => {
        if (inpUrlGbr) {
          inpUrlGbr._gambarLokal = '';
          inpUrlGbr.value = '';
        }
        gambarTerverifikasiForm = false;
        renderCekGambarForm();
        tampilkanToast('Gambar soal dihapus.', 'info');
      });

      document.getElementById('btn-ocr-gambar-form')?.addEventListener('click', async e => {
        const btn = e.currentTarget;
        const draft = ambilDraftSoalForm();
        if (!draft.urlGambar) {
          tampilkanToast('Unggah atau masukkan gambar soal terlebih dahulu.', 'error');
          return;
        }
        await denganLoading(btn, 'Membaca OCR...', async () => {
          const teksOcr = await bacaTeksOcrDariGambar(draft.urlGambar, pct => {
            btn.textContent = `OCR ${pct}%...`;
          });
          if (!teksOcr) throw new Error('Tidak ada teks terbaca dari gambar.');
          const inpTanya = document.getElementById('f-pertanyaan');
          if (inpTanya) {
            inpTanya.value = inpTanya.value.trim()
              ? `${inpTanya.value.trim()}\n${teksOcr}`
              : teksOcr;
          }
          tampilkanToast('Teks dari gambar berhasil dibaca (OCR) dan ditambahkan ke kolom pertanyaan.');
        });
      });

      const perbaruiTampilanTipe = () => {
        const tp = selTipe.value;
        document.getElementById('wadah-opsi-pg').classList.toggle('dnc-disembunyikan', !adalahTipeBeropsi(tp));
        document.getElementById('wadah-kunci-kompleks').classList.toggle('dnc-disembunyikan', tp !== 'Pilihan Ganda Kompleks');
        document.getElementById('wadah-kunci-teks').classList.toggle('dnc-disembunyikan', tp === 'Pilihan Ganda Kompleks');

        const inpBobot = document.getElementById('f-bobotNilai');
        const bantuanBobot = document.getElementById('bantuan-bobot-form');
        if (inpBobot) {
          const autoPoin = adalahTipePoinOtomatis(tp);
          inpBobot.readOnly = autoPoin;
          inpBobot.value = bobotOtomatisTipeSoal(tp, autoPoin ? 0 : (inpBobot.value || item?.bobotNilai));
          if (bantuanBobot) {
            bantuanBobot.textContent = autoPoin
              ? `Poin otomatis tipe ${tp}: Benar = ${inpBobot.value}, Salah = 0.`
              : 'Tipe Uraian: masukkan poin maksimal rubrik (bawaan 5).';
          }
        }

        const lblKunci = document.getElementById('lbl-kunci-teks-form');
        const bantuanKunci = document.getElementById('bantuan-kunci-teks-form');
        if (lblKunci && bantuanKunci) {
          if (tp === 'Benar/Salah') {
            lblKunci.textContent = 'Kunci Jawaban Benar/Salah *';
            bantuanKunci.textContent = 'Format: 1. Benar, 2. Benar, 3. Salah (jumlah tombol pilihan di lembar ujian siswa otomatis mengikuti jumlah nomor kunci).';
          } else if (tp === 'Pilihan Ganda') {
            lblKunci.textContent = 'Kunci Jawaban Pilihan Ganda (A–E) *';
            bantuanKunci.textContent = '';
          } else if (tp === 'Isian Singkat') {
            lblKunci.textContent = 'Kunci Isian Singkat *';
            bantuanKunci.textContent = 'Pisahkan beberapa jawaban benar alternatif dengan tanda | (mis. Yogyakarta|Jogja).';
          } else {
            lblKunci.textContent = 'Rubrik / Kunci Uraian';
            bantuanKunci.textContent = '';
          }
        }
        renderCekGambarForm();
      };

      selTipe.addEventListener('change', perbaruiTampilanTipe);
      document.getElementById('f-urlGambar')?.addEventListener('input', debounceDnc(() => {
        gambarTerverifikasiForm = false;
        renderCekGambarForm();
      }, 300));
      document.getElementById('f-kunciJawaban')?.addEventListener('input', debounceDnc(() => renderCekGambarForm(), 250));
      document.getElementById('f-pertanyaan')?.addEventListener('blur', () => {
        const inpGbr = document.getElementById('f-urlGambar');
        const inpTanya = document.getElementById('f-pertanyaan');
        if (inpGbr && !inpGbr.value.trim() && inpTanya) {
          const eks = ekstrakLinkGambarDariTeks(inpTanya.value);
          if (eks.urlGambar) {
            inpTanya.value = eks.teksBersih;
            inpGbr.value = eks.urlGambar;
            gambarTerverifikasiForm = false;
            renderCekGambarForm();
            tampilkanToast('Link gambar pada pertanyaan otomatis diubah menjadi soal bergambar.', 'info');
          }
        }
      });
      ['A', 'B', 'C', 'D', 'E'].forEach(k => {
        document.getElementById(`f-opsi-${k}`)?.addEventListener('input', debounceDnc(() => renderCekGambarForm(), 300));
      });
      document.querySelectorAll('input[name="f-kunci-kompleks"]').forEach(el => {
        el.addEventListener('change', () => renderCekGambarForm());
      });

      perbaruiTampilanTipe();
    },
    onSubmit: async () => {
      const tipeSoal = document.getElementById('f-tipeSoal').value;
      const kategoriSoal = normalisasiKategoriSoal(document.getElementById('f-kategoriSoal').value);
      const kodeSoal = document.getElementById('f-kodeSoal').value.trim();
      const mapelId = document.getElementById('f-mapelId').value;
      const tingkat = document.getElementById('f-tingkatSoal').value;
      let pertanyaan = document.getElementById('f-pertanyaan').value.trim();
      const inpUrlGbr = document.getElementById('f-urlGambar');
      let urlGambarAsli = (inpUrlGbr?.value || '').trim() || inpUrlGbr?._gambarLokal || '';
      if (!urlGambarAsli) {
        const eks = ekstrakLinkGambarDariTeks(pertanyaan);
        if (eks.urlGambar) {
          pertanyaan = eks.teksBersih;
          urlGambarAsli = eks.urlAsli;
        }
      }
      const urlGambar = normalisasiUrlGambarSoal(urlGambarAsli);
      let kunciJawaban = document.getElementById('f-kunciJawaban').value.trim();
      const bobotNilai = bobotOtomatisTipeSoal(tipeSoal, document.getElementById('f-bobotNilai').value);
      const statusAktif = document.getElementById('f-statusAktifSoal').checked;

      if (!kodeSoal || !mapelId || !pertanyaan) throw new Error('Kode soal, mata pelajaran, dan pertanyaan wajib diisi.');
      if (!bolehAksesMapel(mapelId)) throw new Error('Anda tidak memiliki akses pada mata pelajaran tersebut.');
      if (isNaN(bobotNilai) || bobotNilai <= 0) throw new Error('Bobot/skor soal harus lebih besar dari 0.');

      let opsiJawaban = [];
      if (adalahTipeBeropsi(tipeSoal)) {
        ['A', 'B', 'C', 'D', 'E'].forEach(k => {
          const val = document.getElementById(`f-opsi-${k}`).value.trim();
          if (val) opsiJawaban.push({ kode: k, teks: val });
        });
        if (opsiJawaban.length < 2) throw new Error('Soal Pilihan Ganda wajib memiliki minimal 2 opsi jawaban.');
        if (tipeSoal === 'Pilihan Ganda') {
          kunciJawaban = kunciJawaban.toUpperCase().replace(/[^A-E]/g, '').slice(0, 1);
          if (!opsiJawaban.some(o => o.kode === kunciJawaban)) {
            throw new Error('Kunci jawaban Pilihan Ganda harus cocok dengan kode opsi yang tersedia (A–E).');
          }
        } else {
          const dipilih = [...document.querySelectorAll('input[name="f-kunci-kompleks"]:checked')].map(el => el.value);
          const validKunci = dipilih.filter(k => opsiJawaban.some(o => o.kode === k));
          if (validKunci.length < 2) {
            throw new Error('Pilihan Ganda Kompleks wajib memiliki minimal 2 kunci jawaban yang cocok dengan opsi terisi.');
          }
          kunciJawaban = validKunci.sort().join(', ');
        }
      } else if (tipeSoal === 'Benar/Salah') {
        kunciJawaban = normalisasiKunciBenarSalah(kunciJawaban);
        if (!parseKunciBenarSalah(kunciJawaban).length) {
          throw new Error('Kunci Benar/Salah wajib diisi dengan benar, contoh: 1. Benar, 2. Benar, 3. Salah');
        }
      } else if (tipeSoal === 'Isian Singkat' && !kunciJawaban) {
        throw new Error('Soal Isian Singkat wajib memiliki kunci jawaban.');
      }

      if (!(await cekUnik(COLLECTIONS.bankSoal, 'kodeSoal', kodeSoal, item?.id))) {
        throw new Error(`Kode soal "${kodeSoal}" sudah digunakan.`);
      }

      const sumberPaket = (document.getElementById('f-sumberPaket')?.value || '').trim();
      const payload = {
        kodeSoal, kategoriSoal, sumberPaket, mapelId, tingkat, tipeSoal, pertanyaan,
        urlGambar, urlGambarAsli: urlGambar.startsWith('data:image/') ? '' : (urlGambarAsli || ''),
        gambarTerverifikasi: Boolean(urlGambar && gambarTerverifikasiForm),
        opsiJawaban, kunciJawaban, bobotNilai, statusAktif,
        dibuatOleh: item?.dibuatOleh || penggunaAktif.id
      };
      if (item) await dbUpdate(COLLECTIONS.bankSoal, item.id, payload);
      else await dbCreate(COLLECTIONS.bankSoal, payload);

      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M3', 'DNC-M4', 'DNC-M5']);
      await muatM3BankSoal(true);
      tampilkanToast(item ? 'Butir soal berhasil diperbarui.' : 'Butir soal berhasil disimpan.');
    }
  });
}

function bukaZoomGambarDnc(urlGambar) {
  if (!urlGambar) return;
  const w = window.open('', '_blank', 'width=980,height=720');
  if (!w) {
    if (!urlGambar.startsWith('data:image/')) window.open(urlGambar, '_blank', 'noopener');
    return;
  }
  w.document.open();
  w.document.write(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Pratinjau Gambar Soal</title></head><body style="margin:0;background:#0F172A;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:16px;box-sizing:border-box"><img src="${esc(urlGambar)}" alt="Gambar soal" style="max-width:100%;max-height:94vh;background:#FFFFFF;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,0.4)"></body></html>`);
  w.document.close();
}

function bukaPratinjauSoal(id) {
  const s = cariById('bankSoal', id);
  if (!s) return;
  const kunciSet = parseKunciKompleksSet(s.kunciJawaban);
  const urlImg = normalisasiUrlGambarSoal(s.urlGambar);
  const cekGbr = urlImg ? analisisKesesuaianGambarSoal(s) : null;

  let opsiHtml = '';
  if (adalahTipeBeropsi(s.tipeSoal)) {
    opsiHtml = `<div class="dnc-opsi-list dnc-mt-12">${(s.opsiJawaban || []).map(o => `
      <div class="dnc-opsi-item ${kunciSet.has(o.kode) ? 'terpilih' : ''}">
        <span class="dnc-opsi-kode">${esc(o.kode)}</span>
        <span>${esc(o.teks)}</span>
      </div>`).join('')}</div>`;
  } else if (s.tipeSoal === 'Benar/Salah') {
    const daftarBs = parseKunciBenarSalah(s.kunciJawaban);
    opsiHtml = `
      <div class="dnc-bs-tabel-wrap dnc-mt-12">
        <table class="dnc-bs-tabel">
          <thead><tr><th style="width:68px">No</th><th>Pernyataan</th><th style="width:120px;text-align:center">Kunci</th></tr></thead>
          <tbody>
            ${daftarBs.length ? daftarBs.map(it => `
              <tr>
                <td data-label="No"><strong>${it.no}</strong></td>
                <td data-label="Pernyataan">Pernyataan #${it.no} (sesuai gambar/teks soal)</td>
                <td data-label="Kunci" style="text-align:center"><span class="dnc-badge ${it.nilai === 'Benar' ? 'dnc-badge-hijau' : 'dnc-badge-merah'}">${esc(it.nilai)}</span></td>
              </tr>`).join('') : '<tr><td colspan="3" class="dnc-teks-muted">Kunci Benar/Salah belum diisi.</td></tr>'}
          </tbody>
        </table>
      </div>`;
  } else {
    opsiHtml = `<div class="dnc-jawaban-box dnc-mt-12"><strong>Kunci / Rubrik (${esc(s.tipeSoal)}):</strong>\n${esc(s.kunciJawaban || 'Belum diisi')}</div>`;
  }

  bukaModalFormDnc({
    judul: `Pratinjau Soal — ${s.kodeSoal}`,
    tampilSimpan: false,
    labelBatal: 'Tutup',
    htmlKonten: `
      <div class="dnc-pratinjau-soal">
        <div class="dnc-flex-between dnc-mb-12">
          <div class="dnc-flex-gap">
            ${badgeKategoriSoal(s.kategoriSoal)}
            <span class="dnc-badge dnc-badge-biru">${esc(namaMapelById(s.mapelId))} • ${esc(labelTingkat(s.tingkat))}</span>
          </div>
          <div class="dnc-flex-gap">${badgeTipeSoal(s.tipeSoal)}<span class="dnc-badge dnc-badge-abu">Poin ${esc(poinEfektifSoal(s))}</span></div>
        </div>
        ${urlImg ? `<img id="dnc-img-pratinjau-zoom" src="${esc(urlImg)}" alt="Gambar soal" class="dnc-soal-gambar" title="Klik untuk perbesar gambar">` : ''}
        ${cekGbr ? `<div class="dnc-img-cek-box ${cekGbr.kelas} dnc-mb-12"><div class="dnc-img-cek-info"><strong>Status Gambar &amp; Kunci: ${esc(cekGbr.status)}</strong><div class="dnc-img-cek-kunci"><strong>Kunci:</strong> ${esc(cekGbr.ringkasKunci)}</div><div class="dnc-teks-muted">${esc(cekGbr.pesan)}</div></div></div>` : ''}
        <div class="dnc-soal-teks">${esc(s.pertanyaan)}</div>
        ${opsiHtml}
      </div>`,
    onMount: () => {
      document.getElementById('dnc-img-pratinjau-zoom')?.addEventListener('click', () => bukaZoomGambarDnc(urlImg));
    }
  });
}

async function duplikatSoal(id) {
  const s = cariById('bankSoal', id);
  if (!s) return;
  const salinDariOrangLain = !bolehKelolaSoal(s);
  const tagWaktu = Date.now().toString().slice(-3);
  const kodeBaru = `${s.kodeSoal}-${salinDariOrangLain ? 'SLN' : 'CPY'}${tagWaktu}${Math.floor(10 + Math.random() * 89)}`;
  const namaPaketAsli = s.sumberPaket || namaSumberPaketSoal(s);
  const namaPaketBaru = salinDariOrangLain ? `${namaPaketAsli}_Salinan` : namaPaketAsli;
  const urlImg = normalisasiUrlGambarSoal(s.urlGambar || '');

  await dbCreate(COLLECTIONS.bankSoal, {
    kodeSoal: kodeBaru,
    kategoriSoal: normalisasiKategoriSoal(s.kategoriSoal),
    sumberPaket: namaPaketBaru,
    mapelId: s.mapelId,
    tingkat: s.tingkat,
    tipeSoal: s.tipeSoal,
    pertanyaan: salinDariOrangLain ? s.pertanyaan : `${s.pertanyaan} (Salinan)`,
    urlGambar: urlImg,
    urlGambarAsli: urlImg.startsWith('data:image/') ? '' : (s.urlGambarAsli || ''),
    gambarTerverifikasi: Boolean(s.gambarTerverifikasi),
    opsiJawaban: s.opsiJawaban || [],
    kunciJawaban: s.kunciJawaban || '',
    bobotNilai: s.bobotNilai,
    statusAktif: s.statusAktif,
    dibuatOleh: penggunaAktif.id
  });
  resetCacheMenu(['DNC-M1', 'DNC-M3', 'DNC-M4', 'DNC-M5']);
  await muatM3BankSoal(true);
  tampilkanToast(salinDariOrangLain
    ? `Soal berhasil disalin ke "Bank Soal Saya" dengan kode ${kodeBaru}.`
    : `Soal berhasil diduplikasi dengan kode ${kodeBaru}.`);
}

function salinPaketSoalKeSaya(kunciGrup) {
  const soalDalamPaket = stateMemori.bankSoal.filter(s => kunciGrupSoalM3(s) === kunciGrup);
  if (!soalDalamPaket.length) return;
  const namaAsli = namaSumberPaketSoal(soalDalamPaket[0]);
  const namaDepan = String(penggunaAktif?.namaLengkap || 'Guru').split(/\s+/)[0].replace(/[^A-Za-z0-9]/g, '');
  const namaPaketBaru = `${namaAsli}_Salinan_${namaDepan || 'Saya'}`;

  bukaKonfirmasi({
    judul: 'Salin Paket Referensi ke Bank Soal Saya',
    pesan: `Salin seluruh ${soalDalamPaket.length} butir soal dari paket "${namaAsli}" menjadi salinan pribadi milik akun Anda? Soal asli milik guru pembuat tidak akan berubah.`,
    labelYa: 'Ya, Salin ke Soal Saya',
    kelasTombol: 'dnc-tombol-primer',
    onYa: async () => {
      const cap = Date.now().toString().slice(-4);
      let tersalin = 0;
      for (let i = 0; i < soalDalamPaket.length; i++) {
        const s = soalDalamPaket[i];
        const kodeBaru = `${s.kodeSoal}-S${cap}-${String(i + 1).padStart(2, '0')}`;
        const urlImg = normalisasiUrlGambarSoal(s.urlGambar || '');
        await dbCreate(COLLECTIONS.bankSoal, {
          kodeSoal: kodeBaru,
          kategoriSoal: normalisasiKategoriSoal(s.kategoriSoal),
          sumberPaket: namaPaketBaru,
          mapelId: s.mapelId,
          tingkat: s.tingkat,
          tipeSoal: s.tipeSoal,
          pertanyaan: s.pertanyaan,
          urlGambar: urlImg,
          urlGambarAsli: urlImg.startsWith('data:image/') ? '' : (s.urlGambarAsli || ''),
          gambarTerverifikasi: Boolean(s.gambarTerverifikasi),
          opsiJawaban: s.opsiJawaban || [],
          kunciJawaban: s.kunciJawaban || '',
          bobotNilai: s.bobotNilai,
          statusAktif: true,
          dibuatOleh: penggunaAktif.id
        });
        tersalin++;
      }
      const selPemilik = document.getElementById('filter-pemilik-soal');
      if (selPemilik) selPemilik.value = 'milik_saya';
      resetCacheMenu(['DNC-M1', 'DNC-M3', 'DNC-M4', 'DNC-M5']);
      await muatM3BankSoal(true);
      tampilkanToast(`${tersalin} butir soal berhasil disalin ke "Bank Soal Saya" (${namaPaketBaru}).`);
    }
  });
}

function hapusSoalDenganProteksi(id) {
  const s = cariById('bankSoal', id);
  if (!s) return;
  if (!bolehKelolaSoal(s)) {
    tampilkanToast('Anda tidak dapat menghapus soal milik guru lain.', 'error');
    return;
  }
  bukaKonfirmasi({
    judul: 'Hapus Butir Soal',
    pesan: `Yakin ingin menghapus soal ${s.kodeSoal}?`,
    labelYa: 'Ya, Hapus',
    onYa: async () => {
      const pakets = await dbList(COLLECTIONS.paketAsas);
      if (pakets.some(p => Array.isArray(p.daftarSoalIds) && p.daftarSoalIds.includes(id))) {
        throw new Error('Soal tidak dapat dihapus karena masih terpasang pada Paket ASAS.');
      }
      await dbDelete(COLLECTIONS.bankSoal, id);
      resetCacheMenu(['DNC-M1', 'DNC-M3', 'DNC-M4', 'DNC-M5']);
      await muatM3BankSoal(true);
      tampilkanToast('Butir soal berhasil dihapus.');
    }
  });
}

function hapusPaketSoalDenganProteksi(kunciGrup) {
  const soalDalamPaket = stateMemori.bankSoal.filter(s => kunciGrupSoalM3(s) === kunciGrup);
  if (!soalDalamPaket.length) return;
  if (!soalDalamPaket.every(s => bolehKelolaSoal(s))) {
    tampilkanToast('Anda tidak dapat menghapus paket soal milik guru lain.', 'error');
    return;
  }
  const namaGrup = namaSumberPaketSoal(soalDalamPaket[0]);
  bukaKonfirmasi({
    judul: 'Hapus Seluruh Paket Soal',
    pesan: `Yakin ingin menghapus seluruh ${soalDalamPaket.length} butir soal dalam paket "${namaGrup}"?`,
    labelYa: 'Ya, Hapus Paket',
    onYa: async () => {
      const pakets = await dbList(COLLECTIONS.paketAsas);
      const idPaketSet = new Set(soalDalamPaket.map(s => s.id));
      const terpakai = pakets.some(p =>
        Array.isArray(p.daftarSoalIds) && p.daftarSoalIds.some(sid => idPaketSet.has(sid))
      );
      if (terpakai) {
        throw new Error('Paket soal tidak dapat dihapus karena masih ada butir soal yang terpasang pada Paket ASAS.');
      }
      for (const s of soalDalamPaket) {
        await dbDelete(COLLECTIONS.bankSoal, s.id);
      }
      paketSoalTerbukaM3.delete(kunciGrup);
      resetCacheMenu(['DNC-M1', 'DNC-M3', 'DNC-M4', 'DNC-M5']);
      await muatM3BankSoal(true);
      tampilkanToast(`Paket "${namaGrup}" (${soalDalamPaket.length} soal) berhasil dihapus.`);
    }
  });
}

function bukaModalAturPemilikSoal(kunciGrupTarget = '') {
  if (penggunaAktif?.role !== 'Admin') {
    tampilkanToast('Hanya Admin yang dapat mengatur kepemilikan Bank Soal.', 'error');
    return;
  }

  const daftarKandidat = stateMemori.pengguna
    .filter(u => !adalahRoleSiswa(normalisasiRoleDnc(u.role)) && u.statusAktif !== false)
    .sort((a, b) => {
      const prior = r => (adalahRoleGuru(r) ? 0 : 1);
      const sel = prior(normalisasiRoleDnc(a.role)) - prior(normalisasiRoleDnc(b.role));
      return sel !== 0 ? sel : teks(a.namaLengkap).localeCompare(teks(b.namaLengkap));
    });

  if (!daftarKandidat.length) {
    tampilkanToast('Belum ada akun Guru atau Admin aktif pada Manajemen Pengguna.', 'error');
    return;
  }

  const petaGrup = new Map();
  stateMemori.bankSoal.forEach(s => {
    const k = kunciGrupSoalM3(s);
    if (!petaGrup.has(k)) {
      petaGrup.set(k, {
        kunci: k,
        namaGrup: namaSumberPaketSoal(s),
        mapelId: s.mapelId,
        dibuatOleh: s.dibuatOleh || '',
        jumlah: 0
      });
    }
    petaGrup.get(k).jumlah++;
  });

  const guruIds = new Set(stateMemori.pengguna.filter(u => adalahRoleGuru(normalisasiRoleDnc(u.role))).map(u => u.id));
  const jmlNonGuru = stateMemori.bankSoal.filter(s => !s.dibuatOleh || !guruIds.has(s.dibuatOleh)).length;

  const opsiCakupan = [
    `<option value="semua" ${!kunciGrupTarget ? 'selected' : ''}>Semua soal yang sudah ter-upload saat ini (${stateMemori.bankSoal.length} butir)</option>`,
    `<option value="non_guru">Hanya soal milik Admin / belum ditetapkan ke Guru (${jmlNonGuru} butir)</option>`,
    ...[...petaGrup.values()].map(g =>
      `<option value="${esc(g.kunci)}" ${kunciGrupTarget === g.kunci ? 'selected' : ''}>Paket: ${esc(g.namaGrup)} — ${esc(namaMapelById(g.mapelId))} (Saat ini: ${esc(namaPemilikSoal(g.dibuatOleh))}, ${g.jumlah} butir)</option>`
    )
  ].join('');

  bukaModalFormDnc({
    judul: 'Atur / Alihkan Pemilik Bank Soal',
    labelSimpan: 'Tetapkan Pemilik Soal',
    htmlKonten: `
      <div class="dnc-pratinjau-soal dnc-mb-12">
        <strong>Pengaturan Hak Milik Bank Soal (Khusus Admin)</strong>
        <div class="dnc-form-bantuan">Gunakan fitur ini untuk menetapkan seluruh soal yang sudah ter-upload saat ini menjadi hak milik akun Guru tertentu (misalnya <strong>Guru Santi</strong>), atau mengalihkan kepemilikan per paket soal.</div>
      </div>
      <div class="dnc-form-grup">
        <label class="dnc-label" for="f-target-pemilik-soal">Tetapkan Menjadi Hak Milik Akun *</label>
        <select id="f-target-pemilik-soal" class="dnc-select" required>
          ${daftarKandidat.map(u => `<option value="${esc(u.id)}">${esc(u.namaLengkap)} — ${esc(normalisasiRoleDnc(u.role))} (${esc(u.email)})</option>`).join('')}
        </select>
      </div>
      <div class="dnc-form-grup">
        <label class="dnc-label" for="f-cakupan-pemilik-soal">Cakupan Soal yang Dialihkan *</label>
        <select id="f-cakupan-pemilik-soal" class="dnc-select" required>
          ${opsiCakupan}
        </select>
      </div>
      <div class="dnc-form-grup">
        <label class="dnc-check-label">
          <input id="f-ikut-paket-asas" type="checkbox" checked>
          <span>Ikut alihkan Paket ASAS yang menggunakan soal tersebut ke pemilik baru</span>
        </label>
        <span class="dnc-form-bantuan">Pastikan guru tujuan sudah mengampu mata pelajaran terkait pada menu Manajemen Pengguna agar seluruh soal langsung tampil di akunnya.</span>
      </div>`,
    onSubmit: async () => {
      const targetUserId = document.getElementById('f-target-pemilik-soal').value;
      const cakupan = document.getElementById('f-cakupan-pemilik-soal').value;
      const ikutPaket = document.getElementById('f-ikut-paket-asas').checked;
      if (!targetUserId) throw new Error('Pilih akun pemilik tujuan terlebih dahulu.');

      let targetSoal = [];
      if (cakupan === 'semua') {
        targetSoal = [...stateMemori.bankSoal];
      } else if (cakupan === 'non_guru') {
        targetSoal = stateMemori.bankSoal.filter(s => !s.dibuatOleh || !guruIds.has(s.dibuatOleh));
      } else {
        targetSoal = stateMemori.bankSoal.filter(s => kunciGrupSoalM3(s) === cakupan);
      }

      if (!targetSoal.length) throw new Error('Tidak ada butir soal pada cakupan yang dipilih.');

      let jmlDiubah = 0;
      const idSoalDiubah = new Set();
      for (const s of targetSoal) {
        idSoalDiubah.add(s.id);
        if (s.dibuatOleh !== targetUserId) {
          await dbUpdate(COLLECTIONS.bankSoal, s.id, { dibuatOleh: targetUserId });
          jmlDiubah++;
        }
      }

      let jmlPaketDiubah = 0;
      if (ikutPaket) {
        const semuaPaket = await dbList(COLLECTIONS.paketAsas);
        for (const p of semuaPaket) {
          const terkait = Array.isArray(p.daftarSoalIds) && p.daftarSoalIds.some(sid => idSoalDiubah.has(sid));
          if (terkait && p.dibuatOleh !== targetUserId) {
            await dbUpdate(COLLECTIONS.paketAsas, p.id, { dibuatOleh: targetUserId, diubahOleh: penggunaAktif.id });
            jmlPaketDiubah++;
          }
        }
      }

      const targetObj = cariById('pengguna', targetUserId);
      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M3', 'DNC-M4', 'DNC-M5', 'DNC-M6']);
      await muatM3BankSoal(true);
      tampilkanToast(`${jmlDiubah} butir soal${jmlPaketDiubah ? ` dan ${jmlPaketDiubah} paket ASAS` : ''} resmi ditetapkan menjadi hak milik ${targetObj?.namaLengkap || 'pemilik baru'}.`);
    }
  });
}

// --- Utilitas File & Pembuat Dokumen Word (.docx) ---
function unduhBlobFile(blob, namaFile) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buatZipStoreBlob(entriFiles) {
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[i] = c >>> 0;
  }
  const crc32 = bytes => {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  };
  const enc = new TextEncoder();
  const lokalBagian = [], pusatBagian = [];
  let offset = 0;

  entriFiles.forEach(({ nama, isi }) => {
    const namaBytes = enc.encode(nama);
    const dataBytes = enc.encode(isi);
    const crc = crc32(dataBytes);

    const lh = new ArrayBuffer(30 + namaBytes.length);
    const lv = new DataView(lh);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, dataBytes.length, true);
    lv.setUint32(22, dataBytes.length, true);
    lv.setUint16(26, namaBytes.length, true);
    new Uint8Array(lh, 30).set(namaBytes);
    lokalBagian.push(new Uint8Array(lh), dataBytes);

    const ch = new ArrayBuffer(46 + namaBytes.length);
    const cv = new DataView(ch);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, dataBytes.length, true);
    cv.setUint32(24, dataBytes.length, true);
    cv.setUint16(28, namaBytes.length, true);
    cv.setUint32(42, offset, true);
    new Uint8Array(ch, 46).set(namaBytes);
    pusatBagian.push(new Uint8Array(ch));

    offset += lh.byteLength + dataBytes.length;
  });

  const ukuranPusat = pusatBagian.reduce((s, b) => s + b.byteLength, 0);
  const eocd = new ArrayBuffer(22);
  const ev = new DataView(eocd);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entriFiles.length, true);
  ev.setUint16(10, entriFiles.length, true);
  ev.setUint32(12, ukuranPusat, true);
  ev.setUint32(16, offset, true);

  return new Blob([...lokalBagian, ...pusatBagian, new Uint8Array(eocd)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

function unduhDokumenWordSederhana(barisTeks, namaFile) {
  const xmlParagraf = barisTeks.map(t => `<w:p><w:r><w:t xml:space="preserve">${esc(t)}</w:t></w:r></w:p>`).join('');
  const entri = [
    {
      nama: '[Content_Types].xml',
      isi: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
    },
    {
      nama: '_rels/.rels',
      isi: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
    },
    {
      nama: 'word/_rels/document.xml.rels',
      isi: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>'
    },
    {
      nama: 'word/document.xml',
      isi: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${xmlParagraf}<w:sectPr/></w:body></w:document>`
    }
  ];
  unduhBlobFile(buatZipStoreBlob(entri), namaFile);
}

function unduhTemplatWordDocx() {
  unduhDokumenWordSederhana([
    'TEMPLAT SOAL RUANG ASESMEN DIGITAL (RAD) - DIGITALNETCARE',
    'Petunjuk: Tidak perlu menulis bobot/skor tiap butir soal. Sistem otomatis memberi poin PG = 1, PG Kompleks = 1, Benar/Salah = 1, dan Isian Singkat = 2.',
    '',
    'A. PILIHAN GANDA',
    '1. Hasil dari 24 x 5 adalah ...',
    'A. 100',
    'B. 120',
    'C. 125',
    'D. 140',
    '',
    'B. PILIHAN GANDA KOMPLEKS',
    '2. Pilih lebih dari satu bilangan prima di bawah ini:',
    'A. 2',
    'B. 9',
    'C. 11',
    'D. 15',
    '',
    'C. BENAR/SALAH',
    '3. Tentukan Benar atau Salah untuk pernyataan berikut!',
    'Pernyataan 1: Matahari terbit dari arah timur.',
    'Pernyataan 2: Air mendidih pada suhu 0 derajat Celsius.',
    '',
    'D. ISIAN SINGKAT',
    '4. Ibukota Provinsi Daerah Istimewa Yogyakarta adalah ....',
    '',
    'KUNCI JAWABAN',
    '1. B',
    '2. A, C',
    '3. 1. Benar, 2. Salah',
    '4. Yogyakarta'
  ], 'Templat_Soal_RAD_DigitalNetCare.docx');
}

function parseCsvBaris(teksCsv) {
  const baris = [];
  let row = [], field = '', dalamKutip = false;
  for (let i = 0; i < teksCsv.length; i++) {
    const ch = teksCsv[i], next = teksCsv[i + 1];
    if (dalamKutip) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') dalamKutip = false;
      else field += ch;
    } else if (ch === '"') {
      dalamKutip = true;
    } else if (ch === ',' || ch === ';') {
      row.push(field.trim()); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && next === '\n') i++;
      row.push(field.trim());
      if (row.some(c => c !== '')) baris.push(row);
      row = []; field = '';
    } else {
      field += ch;
    }
  }
  if (field.length || row.length) {
    row.push(field.trim());
    if (row.some(c => c !== '')) baris.push(row);
  }
  return baris;
}

function kompresDataGambar(dataUrl, maksLebar = 1024, kualitas = 0.85) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const batasKarakter = 360000;
      const langkah = [
        [maksLebar, kualitas],
        [Math.min(maksLebar, 920), 0.76],
        [Math.min(maksLebar, 760), 0.68],
        [Math.min(maksLebar, 620), 0.58],
        [480, 0.5]
      ];
      let hasilTerbaik = '';
      for (const [lebarTarget, q] of langkah) {
        const skala = img.width > lebarTarget ? lebarTarget / img.width : 1;
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * skala));
        c.height = Math.max(1, Math.round(img.height * skala));
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const kandidat = c.toDataURL('image/jpeg', q);
        hasilTerbaik = kandidat;
        if (kandidat.length <= batasKarakter) {
          resolve(kandidat);
          return;
        }
      }
      resolve(hasilTerbaik.length <= 500000 ? hasilTerbaik : '');
    };
    img.onerror = () => resolve('');
    img.src = dataUrl;
  });
}

// --- Mesin Parser Pintar Bank Soal (Word, PDF, Excel, Gambar) ---
function deteksiTipeDariTeks(teksRaw, opsiCount, kunciRaw, pertanyaanRaw) {
  const t = teks(teksRaw || '');
  const p = teks(pertanyaanRaw || '');
  if (
    (t.includes('benar') && t.includes('salah')) ||
    t === 'bs' || t === 'b/s' ||
    (t.includes('true') && t.includes('false')) ||
    (t.includes('sesuai') && t.includes('tidak'))
  ) {
    return 'Benar/Salah';
  }
  if (t.includes('kompleks') || t.includes('pgk') || t.includes('multi') || t.includes('lebih dari satu')) {
    return 'Pilihan Ganda Kompleks';
  }
  if (t.includes('isian') || t.includes('singkat') || t.includes('melengkapi')) {
    return 'Isian Singkat';
  }
  if (t.includes('urai') || t.includes('esai') || t.includes('essay')) {
    return 'Uraian';
  }
  if (t.includes('pilihan ganda') || t === 'pg') {
    if (opsiCount >= 2 && parseKunciKompleksSet(kunciRaw).size > 1) return 'Pilihan Ganda Kompleks';
    return 'Pilihan Ganda';
  }

  if (opsiCount >= 2) {
    const setKunci = parseKunciKompleksSet(kunciRaw);
    const ciriKompleks = /(pilih(?:lah)?\s+(?:lebih\s+dari\s+satu|dua|2|tiga|3|beberapa)|jawaban\s+(?:benar\s+)?lebih\s+dari\s+satu|berilah\s+tanda\s+centang|pilihan\s+ganda\s+kompleks)/i.test(p);
    if (setKunci.size > 1 || ciriKompleks) return 'Pilihan Ganda Kompleks';
    return 'Pilihan Ganda';
  }

  const bsItems = parseKunciBenarSalah(kunciRaw);
  const ciriBs = /(?:tentukan\s+benar\s+(?:atau|\/)\s+salah|benar\s+(?:atau|\/)\s+salah\s+untuk\s+pernyataan|pernyataan\s+berikut.*benar.*salah|sesuai\s+atau\s+tidak\s+sesuai)/i.test(p);
  if (bsItems.length >= 2 || (ciriBs && bsItems.length >= 1) || ciriBs) {
    return 'Benar/Salah';
  }

  const kunciBersih = String(kunciRaw || '').trim();
  const ciriIsian = /(?:_{3,}|\.{4,}|isilah\s+titik|lengkapi\s+kalimat)/i.test(p);
  if (ciriIsian || (kunciBersih && kunciBersih.length <= 55 && kunciBersih.split(/\s+/).length <= 5)) {
    return 'Isian Singkat';
  }
  return 'Uraian';
}

function deteksiHeadingBagianSoal(teksBaris) {
  const b = String(teksBaris || '').trim();
  if (!b || b.length > 130) return null;
  if (/^(?:(?:[IVX]+|[A-E]|\d+)[\.\)]\s*)?(?:soal\s+)?(?:benar\s*\/\s*salah|benar\s+atau\s+salah|true\s*\/\s*false)\b/i.test(b)) {
    return 'Benar/Salah';
  }
  if (/^(?:(?:[IVX]+|[A-E]|\d+)[\.\)]\s*)?(?:soal\s+)?(?:pilihan\s+ganda\s+kompleks|pg\s+kompleks|pgk)\b/i.test(b)) {
    return 'Pilihan Ganda Kompleks';
  }
  if (/^(?:(?:[IVX]+|[A-E]|\d+)[\.\)]\s*)?(?:soal\s+)?(?:pilihan\s+ganda|pg)\b/i.test(b)) {
    return 'Pilihan Ganda';
  }
  if (/^(?:(?:[IVX]+|[A-E]|\d+)[\.\)]\s*)?(?:soal\s+)?(?:isian\s+singkat|isian|melengkapi)\b/i.test(b)) {
    return 'Isian Singkat';
  }
  if (/^(?:(?:[IVX]+|[A-E]|\d+)[\.\)]\s*)?(?:soal\s+)?(?:uraian|essay|esai)\b/i.test(b)) {
    return 'Uraian';
  }
  return null;
}

function ekstrakAngkaSkorTeks(teksBaris) {
  const m = String(teksBaris || '').match(/(?:bobot|skor|poin|nilai)\s*(?:maks(?:imal)?|per\s*soal|masing-masing|@)?\s*[:=@]?\s*(\d+(?:[\.,]\d+)?)/i) ||
    String(teksBaris || '').match(/@\s*(\d+(?:[\.,]\d+)?)/);
  return m ? Number(m[1].replace(',', '.')) : null;
}

function validasiItemSoalPintar(item) {
  item.bobotNilai = bobotOtomatisTipeSoal(item.tipeSoal, item.bobotNilai);
  const masalah = [];
  if (!item.pertanyaan || !item.pertanyaan.trim()) masalah.push('Pertanyaan kosong');
  if (!Number(item.bobotNilai) || Number(item.bobotNilai) <= 0) masalah.push('Poin soal tidak valid');

  if (item.tipeSoal === 'Pilihan Ganda') {
    if (!item.opsiJawaban || item.opsiJawaban.length < 2) masalah.push('Opsi PG kurang dari 2');
    const k = String(item.kunciJawaban || '').trim().toUpperCase().replace(/[^A-E]/g, '').slice(0, 1);
    item.kunciJawaban = k;
    if (!k || !(item.opsiJawaban || []).some(o => o.kode === k)) masalah.push('Kunci PG belum terdeteksi / tidak cocok opsi');
  } else if (item.tipeSoal === 'Pilihan Ganda Kompleks') {
    if (!item.opsiJawaban || item.opsiJawaban.length < 2) masalah.push('Opsi PGK kurang dari 2');
    item.kunciJawaban = normalisasiKunciKompleks(item.kunciJawaban);
    const setK = parseKunciKompleksSet(item.kunciJawaban);
    const cocokSemua = [...setK].every(k => (item.opsiJawaban || []).some(o => o.kode === k));
    if (setK.size < 2 || !cocokSemua) masalah.push('Kunci PG Kompleks minimal 2 opsi valid (mis. A, C)');
  } else if (item.tipeSoal === 'Benar/Salah') {
    item.kunciJawaban = normalisasiKunciBenarSalah(item.kunciJawaban);
    if (!parseKunciBenarSalah(item.kunciJawaban).length) {
      masalah.push('Kunci Benar/Salah kosong / tidak valid (contoh: 1. Benar, 2. Benar, 3. Salah)');
    }
  } else if (item.tipeSoal === 'Isian Singkat') {
    if (!String(item.kunciJawaban || '').trim()) masalah.push('Kunci Isian Singkat kosong');
  }

  item.valid = masalah.length === 0;
  item.catatanValidasi = masalah.length ? masalah.join('; ') : 'Terdeteksi otomatis & siap disimpan';
  return item;
}

function bersihkanTandaBenarOpsi(teksOpsi) {
  let isi = String(teksOpsi || '').trim();
  const adaTanda = /(?:^\*\s*|\s*\*\s*$|\(\s*(?:benar|kunci|jawaban)\s*\)|\s*\[(?:benar|kunci)\])/i.test(isi);
  if (adaTanda) {
    isi = isi.replace(/^\*\s*|\s*\*\s*$|\s*\(\s*(?:benar|kunci|jawaban)\s*\)|\s*\[(?:benar|kunci)\]/gi, '').trim();
  }
  return { isi, adaTanda };
}

function pecahOpsiInlineDariTeks(teksBaris, kodeSudahAda = []) {
  const str = String(teksBaris || '');
  if (!str.trim()) return null;

  const regex = /(?:^|[\s\t\.\?\!\,\:\;])(?:\*\s*)?(?:\(([A-Ea-e])\)|([A-Ea-e])[\.\)])(?:\s+|(?=\d))/g;
  const kandidat = [];
  let m;
  while ((m = regex.exec(str)) !== null) {
    const huruf = (m[1] || m[2] || '').toUpperCase();
    const matchStr = m[0];
    const offsetLokal = matchStr.search(/[\*\(]?[A-Ea-e]/);
    const startToken = m.index + (offsetLokal >= 0 ? offsetLokal : 0);
    const bintangAwal = /\*/.test(matchStr.slice(0, Math.max(1, offsetLokal + 1)));
    kandidat.push({ kode: huruf, start: startToken, isiMulai: regex.lastIndex, bintangAwal });
  }
  if (kandidat.length < 2) return null;

  const urutanHuruf = ['A', 'B', 'C', 'D', 'E'];
  const cariRantai = idxMulaiTarget => {
    for (let i = 0; i < kandidat.length; i++) {
      if (kandidat[i].kode !== urutanHuruf[idxMulaiTarget]) continue;
      const rantai = [kandidat[i]];
      let nextIdx = idxMulaiTarget + 1;
      for (let j = i + 1; j < kandidat.length && nextIdx < urutanHuruf.length; j++) {
        if (kandidat[j].kode === urutanHuruf[nextIdx]) {
          rantai.push(kandidat[j]);
          nextIdx++;
        }
      }
      if (rantai.length >= 2) return rantai;
    }
    return null;
  };

  let rantaiTerpilih = cariRantai(0);
  if (!rantaiTerpilih && kodeSudahAda.length) {
    const terakhir = kodeSudahAda[kodeSudahAda.length - 1];
    const idxLanjut = urutanHuruf.indexOf(terakhir) + 1;
    if (idxLanjut > 0 && idxLanjut < urutanHuruf.length - 1) {
      rantaiTerpilih = cariRantai(idxLanjut);
    }
  }
  if (!rantaiTerpilih) return null;

  const teksSebelum = str.slice(0, rantaiTerpilih[0].start).trim();
  const opsi = [];
  const kunciDariTanda = [];
  for (let i = 0; i < rantaiTerpilih.length; i++) {
    const akhir = i + 1 < rantaiTerpilih.length ? rantaiTerpilih[i + 1].start : str.length;
    const mentah = str.slice(rantaiTerpilih[i].isiMulai, akhir).trim();
    const { isi, adaTanda } = bersihkanTandaBenarOpsi(mentah);
    if (isi) {
      opsi.push({ kode: rantaiTerpilih[i].kode, teks: isi });
      if (adaTanda || rantaiTerpilih[i].bintangAwal) kunciDariTanda.push(rantaiTerpilih[i].kode);
    }
  }
  if (opsi.length < 2) return null;
  return { teksSebelum, opsi, kunciDariTanda };
}

function ekstrakBarisDariElemenHtml(el) {
  const klon = el.cloneNode(true);
  klon.querySelectorAll('ol, ul').forEach(sub => sub.remove());
  let imgSrc = klon.querySelector('img')?.getAttribute('src') || '';
  let imgAsli = imgSrc;
  let labelGambar = '';

  if (!imgSrc) {
    const tautan = [...klon.querySelectorAll('a[href]')];
    const cocokLink = tautan.find(a => {
      const href = (a.getAttribute('href') || '').trim();
      if (!/^https?:\/\//i.test(href)) return false;
      return adalahUrlGambarPotensial(href) || /(?:gambar|ilustrasi|foto|image|sumber)/i.test(a.textContent || '');
    });
    if (cocokLink) {
      imgAsli = (cocokLink.getAttribute('href') || '').trim();
      imgSrc = normalisasiUrlGambarSoal(imgAsli);
      labelGambar = (cocokLink.textContent || '').trim();
      if (labelGambar === imgAsli || /^(?:https?:\/\/|link\s+gambar|sumber\s+gambar|gambar)/i.test(labelGambar)) {
        cocokLink.remove();
      }
    }
  }

  klon.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
  const seluruhTebal = Boolean(klon.querySelector('strong, b, u, mark')) &&
    (klon.textContent || '').trim().length > 0 &&
    (klon.textContent || '').trim().length < 140;

  const potongan = (klon.textContent || '')
    .split('\n')
    .map(b => b.replace(/[\t\u00A0]+/g, ' ').replace(/\s{2,}/g, ' ').trim())
    .filter(Boolean);

  if (!potongan.length && imgSrc) {
    return [{ teks: '', img: imgSrc, imgAsli, labelGambar, bold: false }];
  }
  return potongan.map((t, idx) => ({
    teks: t,
    img: idx === 0 ? imgSrc : '',
    imgAsli: idx === 0 ? imgAsli : '',
    labelGambar: idx === 0 ? labelGambar : '',
    bold: seluruhTebal
  }));
}

function ubahHtmlWordKeBarisTerstruktur(htmlStr) {
  const doc = new DOMParser().parseFromString(htmlStr, 'text/html');
  const hasilBaris = [];
  const tabelTerpisah = [];
  const hurufOpsi = ['A', 'B', 'C', 'D', 'E'];

  const prosesDaftar = (listEl, level) => {
    let nomor = Number(listEl.getAttribute('start') || 1);
    const tipeList = listEl.getAttribute('type') || '';
    const isHuruf = tipeList === 'a' || tipeList === 'A' || level > 0;
    let idxHuruf = 0;

    [...listEl.children].forEach(child => {
      if (child.tagName !== 'LI') return;
      const barisLi = ekstrakBarisDariElemenHtml(child);

      barisLi.forEach((b, idxB) => {
        const txt = b.teks;
        if (!txt && b.img) {
          hasilBaris.push(b);
          return;
        }
        if (idxB > 0) {
          hasilBaris.push(b);
          return;
        }
        const sudahBernomor = /^\d+[\.\)]\s/.test(txt);
        const sudahBerhuruf = /^(?:\([A-Ea-e]\)|[A-Ea-e][\.\)])\s/.test(txt);
        const adalahMeta = /^(?:kunci|jawaban|kj|tipe|jenis|bobot|skor|nilai|kode)/i.test(txt);
        if (sudahBernomor || sudahBerhuruf || adalahMeta) {
          hasilBaris.push(b);
        } else if (isHuruf && idxHuruf < hurufOpsi.length) {
          hasilBaris.push({ teks: `${hurufOpsi[idxHuruf]}. ${txt}`, img: b.img, imgAsli: b.imgAsli || '', labelGambar: b.labelGambar || '', bold: b.bold });
          idxHuruf++;
        } else {
          hasilBaris.push({ teks: `${nomor}. ${txt}`, img: b.img, imgAsli: b.imgAsli || '', labelGambar: b.labelGambar || '', bold: b.bold });
          nomor++;
        }
      });

      [...child.children].forEach(sub => {
        if (sub.tagName === 'OL' || sub.tagName === 'UL') {
          prosesDaftar(sub, level + 1);
        }
      });
    });
  };

  [...doc.body.children].forEach(el => {
    const tag = el.tagName;
    if (tag === 'TABLE') {
      const rows = [...el.querySelectorAll('tr')].map(tr =>
        [...tr.querySelectorAll('th,td')].map(td => {
          const klon = td.cloneNode(true);
          klon.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
          return {
            teks: (klon.textContent || '').replace(/[\t\u00A0]+/g, ' ').trim(),
            img: td.querySelector('img')?.getAttribute('src') || '',
            bold: Boolean(td.querySelector('strong, b, u'))
          };
        })
      );

      const semuaSel = rows.flat();
      const semuaTeks = semuaSel.map(c => c.teks).filter(Boolean);
      const gambarDalamTabel = semuaSel.map(c => c.img).filter(Boolean);

      // 1. Jika tabel hanya berisi gambar (tanpa teks), sisipkan langsung di posisi soal
      if (!semuaTeks.length && gambarDalamTabel.length) {
        gambarDalamTabel.forEach(src => hasilBaris.push({ teks: '', img: src, imgAsli: src, labelGambar: '', bold: false }));
        return;
      }

      // 2. Jika tabel merupakan matriks pernyataan Benar/Salah native Word, sisipkan inline ke soal induk
      const headerRow = (rows[0] || []).map(c => teks(c.teks));
      const idxPernyataan = headerRow.findIndex(h => h.includes('pernyataan') || h.includes('kalimat') || h.includes('uraian'));
      const adaKolomBs = headerRow.some(h => h === 'benar' || h === 'true' || h === 'sesuai') &&
        headerRow.some(h => h === 'salah' || h === 'false' || h.includes('tidak sesuai'));
      if (idxPernyataan >= 0 && adaKolomBs && rows.length >= 2) {
        for (let r = 1; r < rows.length; r++) {
          const selP = rows[r][idxPernyataan];
          const isiP = (selP?.teks || '').replace(/\s+/g, ' ').trim();
          if (isiP) {
            hasilBaris.push({
              teks: `Pernyataan ${r}: ${isiP}`,
              img: selP?.img || '',
              imgAsli: selP?.img || '',
              labelGambar: '',
              bold: false,
              isPernyataanBs: true
            });
          }
        }
        return;
      }

      tabelTerpisah.push(rows);
    } else if (tag === 'OL' || tag === 'UL') {
      prosesDaftar(el, 0);
    } else {
      hasilBaris.push(...ekstrakBarisDariElemenHtml(el));
    }
  });

  return { baris: hasilBaris, tabel: tabelTerpisah };
}

function ekstraksiSoalDariTabel(rows, kodeMapelPrefix, cap) {
  if (!rows || rows.length < 1) return { soal: [], kunciMap: {}, bobotBagian: {}, barisTambahan: [] };
  const header = rows[0].map(c => teks(c.teks));
  const idxTanya = header.findIndex(h => h.includes('pertanyaan') || h.includes('butir soal') || h === 'soal' || h.includes('uraian soal'));
  const idxKunci = header.findIndex(h => h.includes('kunci') || h.includes('jawaban') || h === 'kj');
  const idxNo = header.findIndex(h => h === 'no' || h === 'no.' || h.includes('nomor'));
  const idxBobot = header.findIndex(h => h.includes('bobot') || h.includes('skor') || h.includes('nilai') || h.includes('poin'));
  const idxTipe = header.findIndex(h => h.includes('tipe') || h.includes('jenis') || h.includes('bentuk'));

  if (idxTanya >= 0 && rows.length >= 2) {
    const idxKode = header.findIndex(h => h.includes('kode'));
    const idxGambar = header.findIndex(h => h.includes('gambar') || h.includes('image') || h.includes('foto') || h.includes('ilustrasi') || h.includes('url') || h.includes('link'));
    const soal = [];
    for (let r = 1; r < rows.length; r++) {
      const sel = rows[r];
      const ambil = i => (i >= 0 && sel[i] ? sel[i].teks.trim() : '');
      let pertanyaan = ambil(idxTanya);
      if (!pertanyaan) continue;

      let urlGambarAsli = ambil(idxGambar) || sel[idxGambar]?.img || sel[idxTanya]?.img || '';
      let labelGambar = '';
      const eks = ekstrakLinkGambarDariTeks(pertanyaan);
      if (eks.urlGambar) {
        pertanyaan = eks.teksBersih || pertanyaan;
        if (!urlGambarAsli) {
          urlGambarAsli = eks.urlAsli;
          labelGambar = eks.labelTeksGambar;
        }
      }
      const urlGambar = normalisasiUrlGambarSoal(urlGambarAsli);

      let opsiJawaban = [];
      ['a', 'b', 'c', 'd', 'e'].forEach(hrf => {
        const io = header.findIndex(h => h === hrf || h === `opsi ${hrf}` || h === `pilihan ${hrf}` || h === `opsi_${hrf}` || h === `opsi${hrf}` || h === `jawaban ${hrf}`);
        const v = ambil(io);
        if (v) opsiJawaban.push({ kode: hrf.toUpperCase(), teks: v });
      });
      let kunciRaw = ambil(idxKunci);
      if (!opsiJawaban.length) {
        const pecah = pecahOpsiInlineDariTeks(pertanyaan.replace(/\n+/g, ' '));
        if (pecah) {
          pertanyaan = pecah.teksSebelum || pertanyaan;
          opsiJawaban = pecah.opsi;
          if (!kunciRaw && pecah.kunciDariTanda.length) kunciRaw = pecah.kunciDariTanda.join(', ');
        }
      }
      const tipeSoal = deteksiTipeDariTeks(ambil(idxTipe), opsiJawaban.length, kunciRaw, pertanyaan);
      const bobotNilai = Number(ambil(idxBobot).replace(/[^0-9\.,]/g, '').replace(',', '.')) || 10;
      soal.push(validasiItemSoalPintar({
        dipilih: true,
        nomorAsli: Number(ambil(idxNo)) || (soal.length + 1),
        urutanGlobal: soal.length + 1,
        kodeSoal: ambil(idxKode) || `${kodeMapelPrefix}-S${cap}-${String(soal.length + 1).padStart(2, '0')}`,
        tipeSoal,
        pertanyaan,
        urlGambar,
        urlGambarAsli,
        labelGambar,
        statusMuatGambar: 'belum',
        gambarTerverifikasi: false,
        opsiJawaban: adalahTipeBeropsi(tipeSoal) ? opsiJawaban : [],
        kunciJawaban: kunciRaw,
        bobotNilai
      }));
    }
    return { soal, kunciMap: {}, bobotBagian: {}, barisTambahan: [] };
  }

  const kunciMap = {};
  const bobotBagian = {};
  const barisTambahan = [];

  if (idxKunci >= 0 || idxBobot >= 0) {
    for (let r = 1; r < rows.length; r++) {
      const sel = rows[r];
      const ambil = i => (i >= 0 && sel[i] ? sel[i].teks.trim() : '');
      // Dukung tabel kunci multi-kolom berpasangan (mis. No | Kunci | No | Kunci)
      if (sel.length >= 4 && header.filter(h => h.includes('kunci') || h.includes('jawaban') || h === 'no' || h === 'no.').length >= 4) {
        for (let c = 0; c + 1 < sel.length; c += 2) {
          const mNoPair = (sel[c]?.teks || '').match(/\d+/);
          const valPair = (sel[c + 1]?.teks || '').trim();
          if (mNoPair && valPair) {
            const kNo = String(Number(mNoPair[0]));
            kunciMap[kNo] = { ...(kunciMap[kNo] || {}), kunci: valPair };
          }
        }
        continue;
      }

      const noStr = ambil(idxNo >= 0 ? idxNo : 0);
      const kunciVal = idxKunci >= 0 ? ambil(idxKunci) : '';
      const bobotVal = idxBobot >= 0 ? Number(ambil(idxBobot).replace(/[^0-9\.,]/g, '').replace(',', '.')) : null;
      const tipeRow = idxTipe >= 0 ? deteksiTipeDariTeks(ambil(idxTipe), 0, '', '') : null;

      const mRentang = noStr.match(/^(\d+)\s*[-–]\s*(\d+)$/);
      if (mRentang && bobotVal > 0) {
        for (let n = Number(mRentang[1]); n <= Number(mRentang[2]); n++) {
          kunciMap[String(n)] = { ...(kunciMap[String(n)] || {}), bobot: bobotVal, tipe: tipeRow || kunciMap[String(n)]?.tipe };
        }
        continue;
      }

      const mNo = noStr.match(/\d+/);
      if (mNo) {
        const keyNo = String(Number(mNo[0]));
        kunciMap[keyNo] = {
          ...(kunciMap[keyNo] || {}),
          ...(kunciVal ? { kunci: kunciVal } : {}),
          ...(bobotVal > 0 ? { bobot: bobotVal } : {}),
          ...(tipeRow ? { tipe: tipeRow } : {})
        };
      } else if (tipeRow && bobotVal > 0) {
        bobotBagian[tipeRow] = bobotVal;
      }
    }
    return { soal: [], kunciMap, bobotBagian, barisTambahan: [] };
  }

  // Tabel tata letak soal Word tanpa header (mis. kolom 1 nomor, kolom 2 isi soal + opsi)
  rows.forEach(sel => {
    const teksSel = sel.map(c => c.teks.trim()).filter(Boolean);
    if (!teksSel.length) return;
    if (sel.length >= 2 && /^\d+[\.\)]?$/.test(sel[0].teks.trim())) {
      const no = sel[0].teks.trim().replace(/[\.\)]$/, '');
      const isiGabung = sel.slice(1).map(c => c.teks.trim()).filter(Boolean).join('\n');
      const imgCell = sel.find(c => c.img)?.img || '';
      const pecahBaris = isiGabung.split('\n').map(x => x.trim()).filter(Boolean);
      pecahBaris.forEach((b, idx) => {
        barisTambahan.push({
          teks: idx === 0 ? `${no}. ${b}` : b,
          img: idx === 0 ? imgCell : '',
          bold: false
        });
      });
    } else {
      sel.forEach(c => {
        c.teks.split('\n').map(x => x.trim()).filter(Boolean).forEach((b, idx) => {
          barisTambahan.push({ teks: b, img: idx === 0 ? c.img : '', bold: c.bold });
        });
      });
    }
  });

  return { soal: [], kunciMap, bobotBagian, barisTambahan };
}

function parseTeksKunciDanPenskoran(teksRaw, kunciGlobal = {}, kunciPerBagian = {}, bobotDefaultTipe = {}) {
  const barisList = String(teksRaw || '').split(/\r?\n/).map(b => b.replace(/\s+/g, ' ').trim()).filter(Boolean);
  let bagianKunciAktif = '';

  barisList.forEach(txt => {
    if (/^(?:(?:[IVX]+|[A-E])[\.\)]\s*)?(?:kunci\s+jawaban|pedoman\s+penskoran|rubrik\s+penilaian|pembahasan|daftar\s+kunci)/i.test(txt)) {
      const skorHead = ekstrakAngkaSkorTeks(txt);
      const tipeHead = deteksiHeadingBagianSoal(txt);
      if (tipeHead && skorHead > 0) bobotDefaultTipe[tipeHead] = skorHead;
      return;
    }

    const headBagian = deteksiHeadingBagianSoal(txt);
    if (headBagian) {
      bagianKunciAktif = headBagian;
      const skorHead = ekstrakAngkaSkorTeks(txt);
      if (skorHead > 0) bobotDefaultTipe[headBagian] = skorHead;
      return;
    }

    const tipeAturan = deteksiHeadingBagianSoal(txt.replace(/^[-•*]\s*/, ''));
    const skorAturan = ekstrakAngkaSkorTeks(txt);
    if (tipeAturan && skorAturan > 0 && !/^\d+[\.\)\:\-\s]/.test(txt)) {
      bobotDefaultTipe[tipeAturan] = skorAturan;
      return;
    }

    const mRentang = txt.match(/(?:no\.?\s*|soal\s*)?(\d+)\s*[-–s\.d\.]+\s*(\d+)/i);
    if (mRentang && skorAturan > 0) {
      for (let n = Number(mRentang[1]); n <= Number(mRentang[2]); n++) {
        kunciGlobal[String(n)] = { ...(kunciGlobal[String(n)] || {}), bobot: skorAturan };
      }
      return;
    }

    const multiMatch = [...txt.matchAll(/(?:^|[\s;,|])(\d+)\s*[\.\)\:\-\=]?\s*([A-Ea-e](?:\s*(?:,|dan|&|;)\s*[A-Ea-e])*)(?=(?:[\s;,|]+\d+\s*[\.\)\:\-\=]?\s*[A-Ea-e])|\s*$)/g)];
    if (multiMatch.length >= 2) {
      multiMatch.forEach(mm => {
        const noKey = String(Number(mm[1]));
        const val = mm[2].trim();
        const targetObj = { ...(kunciGlobal[noKey] || {}), kunci: val };
        kunciGlobal[noKey] = targetObj;
        if (bagianKunciAktif) kunciPerBagian[`${bagianKunciAktif}#${noKey}`] = targetObj;
      });
      return;
    }

    const mSatu = txt.match(/^(?:no\.?\s*|soal\s*)?(\d+)\s*[\.\)\:\-\=]\s*(.+)$/i) ||
      txt.match(/^(\d+)\s+([A-Ea-e](?:\s*(?:,|dan|&|;)\s*[A-Ea-e])*)(?:\s+.*)?$/);
    if (mSatu) {
      const noKey = String(Number(mSatu[1]));
      let isiKunci = mSatu[2].trim();
      const skorInline = ekstrakAngkaSkorTeks(isiKunci) ||
        (() => {
          const mKurung = isiKunci.match(/[\(\[]\s*(\d+(?:[\.,]\d+)?)\s*[\)\]]\s*$/);
          return mKurung ? Number(mKurung[1].replace(',', '.')) : null;
        })();
      isiKunci = isiKunci
        .replace(/\s*[\(\[]?\s*(?:bobot|skor|poin|nilai)\s*(?:maks(?:imal)?)?\s*[:=@]?\s*\d+(?:[\.,]\d+)?\s*(?:poin|skor)?\s*[\)\]]?$/i, '')
        .replace(/\s*[\(\[]\s*\d+(?:[\.,]\d+)?\s*[\)\]]\s*$/, '')
        .trim();
      const entri = {
        ...(kunciGlobal[noKey] || {}),
        ...(isiKunci ? { kunci: isiKunci } : {}),
        ...(skorInline > 0 ? { bobot: skorInline } : {})
      };
      kunciGlobal[noKey] = entri;
      if (bagianKunciAktif) kunciPerBagian[`${bagianKunciAktif}#${noKey}`] = entri;
    }
  });

  return { kunciGlobal, kunciPerBagian, bobotDefaultTipe };
}

function ekstrakSoalPintarDariSumber({ baris, tabel }, kodeMapelPrefix) {
  const cap = Date.now().toString().slice(-4);
  let daftarSoal = [];
  const kunciGlobal = {};
  const kunciPerBagian = {};
  const bobotDefaultTipe = {};
  const barisGabungan = [...(baris || [])];

  (tabel || []).forEach(rows => {
    const res = ekstraksiSoalDariTabel(rows, kodeMapelPrefix, cap);
    if (res.soal.length) daftarSoal.push(...res.soal);
    Object.entries(res.kunciMap).forEach(([k, v]) => {
      kunciGlobal[k] = { ...(kunciGlobal[k] || {}), ...v };
    });
    Object.assign(bobotDefaultTipe, res.bobotBagian);
    if (res.barisTambahan && res.barisTambahan.length) {
      barisGabungan.push(...res.barisTambahan);
    }
  });

  if (daftarSoal.length && barisGabungan.length < 4) {
    return daftarSoal.map(s => terapkanKunciDanBobot(s, kunciGlobal, kunciPerBagian, bobotDefaultTipe));
  }

  let modeKunci = false;
  let bagianAktif = '';
  let aktif = null;
  let pendingGambar = null;
  let nomorUrut = 0;
  const barisModeKunci = [];

  const sisipkanOpsiKeAktif = (opsiList, kunciTanda = [], boldFlag = false) => {
    opsiList.forEach(o => {
      const ada = aktif.opsiJawaban.find(x => x.kode === o.kode);
      if (ada) ada.teks = o.teks;
      else aktif.opsiJawaban.push({ kode: o.kode, teks: o.teks });
      if (boldFlag && !aktif.opsiTebal.includes(o.kode)) aktif.opsiTebal.push(o.kode);
    });
    kunciTanda.forEach(k => {
      if (!aktif.kunciDariTanda.includes(k)) aktif.kunciDariTanda.push(k);
    });
  };

  const dorongAktif = () => {
    if (!aktif) return;
    if (!aktif.pertanyaan.trim() && !aktif.urlGambar) { aktif = null; return; }
    // Ekstrak link gambar yang masih menempel di dalam teks pertanyaan
    const eksTanya = ekstrakLinkGambarDariTeks(aktif.pertanyaan);
    if (eksTanya.urlGambar) {
      aktif.pertanyaan = eksTanya.teksBersih || aktif.pertanyaan;
      if (!aktif.urlGambar) {
        aktif.urlGambar = eksTanya.urlGambar;
        aktif.urlGambarAsli = eksTanya.urlAsli;
        aktif.labelGambar = eksTanya.labelTeksGambar;
      }
    }
    if (aktif.urlGambar) {
      aktif.urlGambar = normalisasiUrlGambarSoal(aktif.urlGambar);
    }
    aktif.statusMuatGambar = 'belum';
    aktif.gambarTerverifikasi = false;

    // Pemindaian ulang terakhir: jika opsi masih menempel di dalam teks pertanyaan
    if (aktif.opsiJawaban.length < 2 && aktif.tipeSoal !== 'Benar/Salah') {
      const pecahUlang = pecahOpsiInlineDariTeks(aktif.pertanyaan.replace(/\n+/g, ' '));
      if (pecahUlang && pecahUlang.opsi.length >= 2) {
        if (pecahUlang.teksSebelum) aktif.pertanyaan = pecahUlang.teksSebelum;
        sisipkanOpsiKeAktif(pecahUlang.opsi, pecahUlang.kunciDariTanda, false);
      }
    }
    if (!aktif.kunciJawaban && aktif.kunciDariTanda.length) {
      aktif.kunciJawaban = aktif.kunciDariTanda.join(', ');
    }
    if (!aktif.kunciJawaban && aktif.opsiTebal.length > 0 && aktif.opsiTebal.length < aktif.opsiJawaban.length) {
      aktif.kunciJawaban = aktif.opsiTebal.join(', ');
    }
    daftarSoal.push(aktif);
    aktif = null;
  };

  barisGabungan.forEach(item => {
    const txt = String(item.teks || '').replace(/\s+/g, ' ').trim();
    const imgSrc = item.img ? normalisasiUrlGambarSoal(item.img) : '';
    const imgAsli = item.imgAsli || item.img || '';
    const labelGbr = item.labelGambar || '';
    const isBold = Boolean(item.bold);

    if (!txt && imgSrc) {
      if (aktif && !aktif.urlGambar) {
        aktif.urlGambar = imgSrc;
        aktif.urlGambarAsli = imgAsli;
        aktif.labelGambar = labelGbr;
      } else if (!aktif) {
        pendingGambar = { img: imgSrc, imgAsli, labelGbr };
      }
      return;
    }
    if (!txt) return;

    const adalahKunciInlineSoal = Boolean(aktif) && /^kunci\s+jawaban\s*[:=\-]\s*\S+/i.test(txt);
    if (!adalahKunciInlineSoal && /^(?:(?:[IVX]+|[A-E])[\.\)]\s*)?(?:kunci\s+jawaban|pedoman\s+penskoran|rubrik\s+penilaian|pembahasan\s+dan\s+kunci|daftar\s+kunci)/i.test(txt)) {
      dorongAktif();
      modeKunci = true;
      barisModeKunci.push(txt);
      return;
    }

    if (modeKunci) {
      barisModeKunci.push(txt);
      return;
    }

    if (item.isPernyataanBs && aktif) {
      aktif.pertanyaan += `\n${txt}`;
      if (!aktif.tipeSoal) aktif.tipeSoal = 'Benar/Salah';
      if (imgSrc && !aktif.urlGambar) {
        aktif.urlGambar = imgSrc;
        aktif.urlGambarAsli = imgAsli;
        aktif.labelGambar = labelGbr;
      }
      return;
    }

    const headSoal = deteksiHeadingBagianSoal(txt);
    if (headSoal) {
      dorongAktif();
      bagianAktif = headSoal;
      const skorHead = ekstrakAngkaSkorTeks(txt);
      if (skorHead > 0) bobotDefaultTipe[headSoal] = skorHead;
      return;
    }

    if (!aktif && /^(?:templat|petunjuk|soal\s+asas|asesmen\s+sumatif|penilaian\s+akhir|ulangan\s+akhir|mata\s+pelajaran|kelas\s*:|waktu\s*:|semester\s*:|hari\s*\/\s*tanggal)/i.test(txt)) {
      return;
    }

    const mNomor = txt.match(/^(?:no\.?\s*)?(\d+)\s*[\.\)]\s*(.+)$/i);
    const mOpsiTunggal = txt.match(/^(?:\*\s*)?(?:\(([A-Ea-e])\)|([A-Ea-e])[\.\)])\s*(.+)$/);
    const kodeSudahAda = aktif ? aktif.opsiJawaban.map(o => o.kode) : [];
    const opsiInline = pecahOpsiInlineDariTeks(txt, kodeSudahAda);
    const mKunci = txt.match(/^(?:kunci\s+jawaban|kunci|jawaban\s+benar|jawaban|kj)\s*[:=\-]\s*(.+)$/i);
    const mTipe = txt.match(/^(?:tipe\s+soal|jenis\s+soal|bentuk\s+soal|tipe|jenis)\s*[:=\-]\s*(.+)$/i);
    const mBobot = txt.match(/^(?:bobot\s+nilai|bobot|skor\s+maks(?:imal)?|skor|poin|nilai)\s*[:=\-]\s*(\d+(?:[\.,]\d+)?)/i);
    const mKode = txt.match(/^(?:kode\s+soal|kode)\s*[:=\-]\s*([A-Za-z0-9_\-]+)/i);
    const mGambarBaris = txt.match(/^(?:sumber\s+gambar|link\s+gambar|url\s+gambar|gambar|ilustrasi|foto)\s*[:=\-]\s*(https?:\/\/\S+)/i);
    const adalahLinkGambarSaja = !mNomor && !mOpsiTunggal && /^https?:\/\/\S+$/i.test(txt) && adalahUrlGambarPotensial(txt);

    if (mNomor) {
      dorongAktif();
      nomorUrut++;
      const noAsli = Number(mNomor[1]);
      let teksPertanyaan = mNomor[2].trim();
      const skorDiSoal = ekstrakAngkaSkorTeks(teksPertanyaan);
      if (skorDiSoal > 0) {
        teksPertanyaan = teksPertanyaan.replace(/\s*[\(\[]\s*(?:bobot|skor|poin|nilai)\s*[:=@]?\s*\d+(?:[\.,]\d+)?\s*[\)\]]/i, '').trim();
      }

      let kunciInlineDiSoal = '';
      const mKunciAkhir = teksPertanyaan.match(/\s*[\(\[]?\s*(?:kunci|jawaban|kj)\s*[:=]\s*([^\)\]]+)[\)\]]?\s*$/i);
      if (mKunciAkhir) {
        kunciInlineDiSoal = mKunciAkhir[1].trim();
        teksPertanyaan = teksPertanyaan.slice(0, mKunciAkhir.index).trim();
      }

      const gbrAwal = imgSrc || pendingGambar?.img || '';
      const gbrAsliAwal = imgSrc ? imgAsli : (pendingGambar?.imgAsli || '');
      const gbrLabelAwal = imgSrc ? labelGbr : (pendingGambar?.labelGbr || '');
      pendingGambar = null;

      aktif = {
        dipilih: true,
        nomorAsli: noAsli,
        urutanGlobal: nomorUrut,
        bagianAsal: bagianAktif,
        kodeSoal: `${kodeMapelPrefix}-W${cap}-${String(nomorUrut).padStart(2, '0')}`,
        tipeSoal: bagianAktif || '',
        pertanyaan: teksPertanyaan,
        urlGambar: gbrAwal,
        urlGambarAsli: gbrAsliAwal,
        labelGambar: gbrLabelAwal,
        opsiJawaban: [],
        opsiTebal: [],
        kunciDariTanda: [],
        kunciJawaban: kunciInlineDiSoal,
        bobotNilai: skorDiSoal || 0
      };

      const pecahLangsung = pecahOpsiInlineDariTeks(aktif.pertanyaan, []);
      if (pecahLangsung && pecahLangsung.opsi.length >= 2) {
        aktif.pertanyaan = pecahLangsung.teksSebelum || aktif.pertanyaan;
        sisipkanOpsiKeAktif(pecahLangsung.opsi, pecahLangsung.kunciDariTanda, false);
      }
    } else if (aktif) {
      if (imgSrc && !aktif.urlGambar) {
        aktif.urlGambar = imgSrc;
        aktif.urlGambarAsli = imgAsli;
        aktif.labelGambar = labelGbr;
      }
      if (mGambarBaris || adalahLinkGambarSaja) {
        const rawLink = (mGambarBaris ? mGambarBaris[1] : txt).replace(/[.,;)\]]+$/, '');
        if (!aktif.urlGambar) {
          aktif.urlGambar = normalisasiUrlGambarSoal(rawLink);
          aktif.urlGambarAsli = rawLink;
        }
      } else if (mKunci) {
        let kVal = mKunci[1].trim();
        const sk = ekstrakAngkaSkorTeks(kVal);
        if (sk > 0 && !aktif.bobotNilai) {
          aktif.bobotNilai = sk;
          kVal = kVal.replace(/\s*[\(\[]?\s*(?:bobot|skor|poin|nilai)\s*[:=@]?\s*\d+(?:[\.,]\d+)?\s*[\)\]]?$/i, '').trim();
        }
        aktif.kunciJawaban = kVal;
      } else if (mTipe) {
        aktif.tipeSoal = deteksiTipeDariTeks(mTipe[1], aktif.opsiJawaban.length, aktif.kunciJawaban, aktif.pertanyaan);
      } else if (mBobot) {
        aktif.bobotNilai = Number(mBobot[1].replace(',', '.')) || aktif.bobotNilai;
      } else if (mKode) {
        aktif.kodeSoal = mKode[1].trim();
      } else if (opsiInline) {
        if (opsiInline.teksSebelum && !aktif.opsiJawaban.length) {
          aktif.pertanyaan += `\n${opsiInline.teksSebelum}`;
        }
        sisipkanOpsiKeAktif(opsiInline.opsi, opsiInline.kunciDariTanda, false);
      } else if (mOpsiTunggal) {
        const kode = (mOpsiTunggal[1] || mOpsiTunggal[2]).toUpperCase();
        const bintangAwal = /^\*/.test(txt);
        const { isi, adaTanda } = bersihkanTandaBenarOpsi(mOpsiTunggal[3]);
        sisipkanOpsiKeAktif([{ kode, teks: isi }], (bintangAwal || adaTanda) ? [kode] : [], isBold);
      } else if (!aktif.opsiJawaban.length && !aktif.kunciJawaban) {
        aktif.pertanyaan += `\n${txt}`;
      } else if (aktif.opsiJawaban.length && !aktif.kunciJawaban) {
        aktif.opsiJawaban[aktif.opsiJawaban.length - 1].teks += ` ${txt}`;
      }
    }
  });
  dorongAktif();

  if (barisModeKunci.length) {
    parseTeksKunciDanPenskoran(barisModeKunci.join('\n'), kunciGlobal, kunciPerBagian, bobotDefaultTipe);
  }

  return daftarSoal.map(s => terapkanKunciDanBobot(s, kunciGlobal, kunciPerBagian, bobotDefaultTipe));
}

function selesaikanKunciOpsiDariTeks(kunciRaw, opsiList, tipeSoal) {
  const k = String(kunciRaw || '').trim();
  if (!k) return '';
  const daftarOpsi = opsiList || [];

  if (tipeSoal === 'Pilihan Ganda') {
    const mAwal = k.match(/^(?:opsi\s+|jawaban\s+|pilihan\s+)?\(?([A-Ea-e])\)?(?:[\.\)\s]|$)/i);
    if (mAwal && daftarOpsi.some(o => o.kode === mAwal[1].toUpperCase())) {
      return mAwal[1].toUpperCase();
    }
    const cocokTeks = daftarOpsi.find(o => normalisasiIsian(o.teks) === normalisasiIsian(k));
    if (cocokTeks) return cocokTeks.kode;
    return k.toUpperCase().replace(/[^A-E]/g, '').slice(0, 1);
  }

  if (tipeSoal === 'Pilihan Ganda Kompleks') {
    if (/^(?:[A-Ea-e\s,\.\)\(&;/\-]|dan)+$/i.test(k)) {
      return normalisasiKunciKompleks(k);
    }
    const potongan = k.split(/[,;|\n]/).map(normalisasiIsian).filter(Boolean);
    const cocokKode = daftarOpsi.filter(o => potongan.includes(normalisasiIsian(o.teks))).map(o => o.kode);
    if (cocokKode.length >= 2) return cocokKode.sort().join(', ');
    return normalisasiKunciKompleks(k);
  }

  return k;
}

function terapkanKunciDanBobot(s, kunciGlobal, kunciPerBagian, bobotDefaultTipe) {
  const noKey = String(s.nomorAsli || s.urutanGlobal || '');
  const urutKey = String(s.urutanGlobal || '');
  const entriBagian = s.bagianAsal ? kunciPerBagian[`${s.bagianAsal}#${noKey}`] : null;
  const entriGlobal = kunciGlobal[noKey] || kunciGlobal[urutKey] || null;
  const sumberKunci = entriBagian || entriGlobal;

  if (!s.kunciJawaban && sumberKunci?.kunci) s.kunciJawaban = sumberKunci.kunci;
  if (!s.tipeSoal && sumberKunci?.tipe) s.tipeSoal = sumberKunci.tipe;

  s.tipeSoal = deteksiTipeDariTeks(s.tipeSoal || s.bagianAsal, (s.opsiJawaban || []).length, s.kunciJawaban, s.pertanyaan);

  if (adalahTipeBeropsi(s.tipeSoal)) {
    s.kunciJawaban = selesaikanKunciOpsiDariTeks(s.kunciJawaban, s.opsiJawaban, s.tipeSoal);
  } else if (s.tipeSoal === 'Benar/Salah') {
    s.opsiJawaban = [];
    s.kunciJawaban = normalisasiKunciBenarSalah(s.kunciJawaban);
  } else {
    s.opsiJawaban = [];
  }

  if (!s.bobotNilai || s.bobotNilai <= 0) {
    s.bobotNilai = sumberKunci?.bobot || bobotDefaultTipe[s.tipeSoal] || (s.tipeSoal === 'Uraian' ? 20 : (s.tipeSoal === 'Pilihan Ganda Kompleks' ? 15 : 10));
  }

  return validasiItemSoalPintar(s);
}

async function bacaTeksMentahFileKunci(file) {
  const ext = teks(file.name.split('.').pop());
  if (ext === 'txt' || ext === 'csv') return await file.text();
  if (ext === 'docx') {
    const mammothLib = await muatMammothJs();
    const { value: html } = await mammothLib.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    const sumber = ubahHtmlWordKeBarisTerstruktur(html);
    const garisTabel = [];
    sumber.tabel.forEach(rows => rows.forEach(r => garisTabel.push(r.map(c => c.teks).filter(Boolean).join(' '))));
    return [...sumber.baris.map(b => b.teks), ...garisTabel].filter(Boolean).join('\n');
  }
  if (ext === 'pdf') {
    return (await ekstrakTeksBarisPdf(file)).join('\n');
  }
  if (ext === 'xlsx' || ext === 'xls') {
    const XLSX = await muatSheetJs();
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    return rows.map(r => r.map(c => String(c ?? '').trim()).filter(Boolean).join(' ')).filter(Boolean).join('\n');
  }
  throw new Error('Format file kunci tidak didukung. Gunakan .docx, .pdf, .xlsx, .xls, .csv, atau .txt.');
}

// --- Modal Impor Pintar Bank Soal (Bebas Template: Word, PDF, Excel, CSV, TXT) ---
function bukaModalImporWord() {
  const mapelList = daftarMapelDiizinkan();
  if (!mapelList.length) {
    tampilkanToast('Tambahkan mata pelajaran terlebih dahulu sebelum mengimpor soal.', 'error');
    return;
  }

  let daftarEkstrak = [];

  const terapkanKunciTambahanKeDaftar = teksKunci => {
    if (!daftarEkstrak.length || !String(teksKunci || '').trim()) return;
    const { kunciGlobal, kunciPerBagian, bobotDefaultTipe } = parseTeksKunciDanPenskoran(teksKunci);
    daftarEkstrak = daftarEkstrak.map(it => {
      const noKey = String(it.nomorAsli || it.urutanGlobal || '');
      const urutKey = String(it.urutanGlobal || '');
      const entri = (it.bagianAsal ? kunciPerBagian[`${it.bagianAsal}#${noKey}`] : null) || kunciGlobal[noKey] || kunciGlobal[urutKey];
      if (entri?.kunci) {
        if (adalahTipeBeropsi(it.tipeSoal)) {
          it.kunciJawaban = selesaikanKunciOpsiDariTeks(entri.kunci, it.opsiJawaban, it.tipeSoal);
        } else if (it.tipeSoal === 'Benar/Salah') {
          it.kunciJawaban = normalisasiKunciBenarSalah(entri.kunci);
        } else {
          it.kunciJawaban = entri.kunci;
        }
      }
      if (entri?.bobot > 0) it.bobotNilai = entri.bobot;
      else if (bobotDefaultTipe[it.tipeSoal] > 0) it.bobotNilai = bobotDefaultTipe[it.tipeSoal];
      validasiItemSoalPintar(it);
      if (it.valid) it.dipilih = true;
      return it;
    });
  };

  const renderPratinjauWord = () => {
    const wadah = document.getElementById('wadah-pratinjau-word');
    const info = document.getElementById('info-ringkas-word');
    if (!wadah) return;

    const jmlValid = daftarEkstrak.filter(x => x.valid).length;
    const jmlBergambar = daftarEkstrak.filter(x => Boolean(x.urlGambar)).length;
    const jmlPeringatanGbr = daftarEkstrak.filter(x => {
      if (!x.urlGambar) return false;
      const cek = analisisKesesuaianGambarSoal(x, x.statusMuatGambar || 'belum');
      return cek && cek.kelas === 'bahaya';
    }).length;
    const totalBobot = bulatDua(daftarEkstrak.filter(x => x.dipilih && x.valid).reduce((acc, x) => acc + poinEfektifSoal(x), 0));
    const hitungTipe = tp => daftarEkstrak.filter(x => x.tipeSoal === tp).length;

    info.textContent = daftarEkstrak.length
      ? `Terdeteksi ${daftarEkstrak.length} butir soal (${jmlValid} Valid, ${daftarEkstrak.length - jmlValid} Perlu Perbaikan${jmlBergambar ? `, ${jmlBergambar} Bergambar` : ''}${jmlPeringatanGbr ? `, ${jmlPeringatanGbr} Cek Ulang Gambar/Kunci` : ''}). Poin ditetapkan otomatis (PG/PGK/BS = 1, Isian = 2).`
      : 'Unggah file soal format bebas (.docx, .pdf, .xlsx, .xls, .csv, .txt, atau gambar .png/.jpg/.webp) tanpa perlu bobot manual — poin otomatis PG/PGK/BS = 1, Isian = 2.';

    if (!daftarEkstrak.length) {
      wadah.innerHTML = '';
      return;
    }

    wadah.innerHTML = `
      <div class="dnc-ringkasan-impor">
        <div>
          <strong>Deteksi Otomatis:</strong>
          PG: ${hitungTipe('Pilihan Ganda')} (@1) | PGK: ${hitungTipe('Pilihan Ganda Kompleks')} (@1) | Benar/Salah: ${hitungTipe('Benar/Salah')} (@1) | Isian: ${hitungTipe('Isian Singkat')} (@2) | Uraian: ${hitungTipe('Uraian')}${jmlBergambar ? ` | Bergambar: ${jmlBergambar}` : ''}
        </div>
        <div class="dnc-flex-gap">
          <strong>Total Poin Maks Terpilih: ${totalBobot}</strong>
          <span class="dnc-badge dnc-badge-biru">Nilai = (Perolehan / ${totalBobot || 1}) × 100</span>
        </div>
      </div>
      <div class="dnc-pembungkus-tabel dnc-mt-12">
        <table class="dnc-tabel dnc-tabel-padat">
          <thead>
            <tr>
              <th>Pilih</th>
              <th>Kode &amp; Tipe Soal</th>
              <th>Pertanyaan, Gambar &amp; Opsi</th>
              <th>Kunci &amp; Poin Otomatis</th>
              <th>Status Validasi</th>
            </tr>
          </thead>
          <tbody>
            ${daftarEkstrak.map((it, idx) => {
              const petaOpsi = opsiMapToObj(it.opsiJawaban);
              const autoPoin = adalahTipePoinOtomatis(it.tipeSoal);
              const poinButir = poinEfektifSoal(it);
              const cekGbr = it.urlGambar ? analisisKesesuaianGambarSoal(it, it.statusMuatGambar || 'belum') : null;
              const htmlGambarEdit = `
                <div style="margin-top:6px">
                  <input class="dnc-input" style="height:28px;font-size:11px" data-w-gambar="${idx}" placeholder="Link sumber gambar (opsional — atau unggah file lokal di bawah)" value="${esc(it.urlGambar && !it.urlGambar.startsWith('data:image/') ? (it.urlGambarAsli || it.urlGambar) : '')}">
                </div>
                <div class="dnc-gbr-aksi-row">
                  <label class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" style="height:26px;font-size:11px;cursor:pointer">
                    <span>${it.urlGambar ? 'Ganti Gambar' : 'Unggah Gambar'}</span>
                    <input type="file" accept="image/*" data-w-file-gbr="${idx}" style="display:none">
                  </label>
                  ${it.urlGambar ? `<button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" style="height:26px;font-size:11px" data-w-ocr-gbr="${idx}">Baca Teks Gambar (OCR)</button>` : ''}
                  ${it.urlGambar ? `<button type="button" class="dnc-tombol dnc-tombol-bahaya dnc-tombol-kecil" style="height:26px;font-size:11px" data-w-hapus-gbr="${idx}">Hapus Gambar</button>` : ''}
                </div>
                ${cekGbr ? `
                  <div class="dnc-img-cek-box ${cekGbr.kelas}">
                    <img class="dnc-img-cek-thumb" data-w-img-cek="${idx}" src="${esc(cekGbr.urlTampil)}" alt="Gambar soal ${idx + 1}" title="Klik untuk perbesar gambar">
                    <div class="dnc-img-cek-info">
                      <div class="dnc-flex-between">
                        <strong>${esc(cekGbr.status)}</strong>
                        ${cekGbr.kelas !== 'bahaya' && !it.gambarTerverifikasi ? `<button type="button" class="dnc-tombol dnc-tombol-sukses dnc-tombol-kecil" style="height:22px;font-size:10px;padding:0 7px" data-w-verif-gbr="${idx}">Tandai Sesuai</button>` : ''}
                      </div>
                      <div class="dnc-img-cek-kunci"><strong>Kunci:</strong> ${esc(cekGbr.ringkasKunci)}</div>
                      <div class="dnc-teks-muted">${esc(cekGbr.pesan)}</div>
                    </div>
                  </div>` : ''}`;
              const htmlOpsiEdit = adalahTipeBeropsi(it.tipeSoal)
                ? `<div class="dnc-opsi-edit-grid">
                    ${['A', 'B', 'C', 'D', 'E'].map(hrf => `
                      <div class="dnc-opsi-edit-baris">
                        <span class="dnc-opsi-edit-kode">${hrf}.</span>
                        <input class="dnc-input" data-w-opsi-idx="${idx}" data-w-opsi-kode="${hrf}" placeholder="Opsi ${hrf}" value="${esc(petaOpsi[hrf])}">
                      </div>`).join('')}
                  </div>`
                : '';
              return `
                <tr>
                  <td data-label="Pilih">
                    <input type="checkbox" data-w-pilih="${idx}" ${it.dipilih && it.valid ? 'checked' : ''} ${!it.valid ? 'disabled' : ''}>
                  </td>
                  <td data-label="Kode &amp; Tipe">
                    <input class="dnc-input" style="height:30px;margin-bottom:4px" data-w-kode="${idx}" value="${esc(it.kodeSoal)}">
                    <select class="dnc-select" style="height:30px" data-w-tipe="${idx}">
                      ${TIPE_SOAL_LIST.map(tp => `<option value="${tp}" ${it.tipeSoal === tp ? 'selected' : ''}>${tp}</option>`).join('')}
                    </select>
                  </td>
                  <td data-label="Pertanyaan, Gambar &amp; Opsi">
                    <textarea class="dnc-textarea" style="min-height:52px" data-w-tanya="${idx}">${esc(it.pertanyaan)}</textarea>
                    ${htmlGambarEdit}
                    ${htmlOpsiEdit}
                  </td>
                  <td data-label="Kunci &amp; Poin">
                    <input class="dnc-input" style="height:30px;margin-bottom:4px" data-w-kunci="${idx}" placeholder="Kunci (B / A, C / 1. Benar, 2. Salah)" value="${esc(it.kunciJawaban)}">
                    <input class="dnc-input" style="height:30px" type="number" min="0.5" step="0.5" data-w-bobot="${idx}" value="${esc(poinButir)}" ${autoPoin ? 'readonly title="Poin ditetapkan otomatis sesuai tipe soal"' : ''}>
                    <div class="dnc-form-bantuan">${autoPoin ? `Poin otomatis: ${poinButir}` : 'Poin rubrik Uraian'}</div>
                  </td>
                  <td data-label="Validasi">
                    ${badgeStatus(it.valid ? 'Valid' : 'Perlu Perbaikan')}
                    <div class="dnc-form-bantuan">${esc(it.catatanValidasi)}</div>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;

    wadah.querySelectorAll('[data-w-pilih]').forEach(el => {
      el.addEventListener('change', () => {
        daftarEkstrak[Number(el.dataset.wPilih)].dipilih = el.checked;
        renderPratinjauWord();
      });
    });

    wadah.querySelectorAll('[data-w-gambar]').forEach(el => {
      el.addEventListener('change', () => {
        const i = Number(el.dataset.wGambar);
        const raw = el.value.trim();
        daftarEkstrak[i].urlGambarAsli = raw;
        daftarEkstrak[i].urlGambar = normalisasiUrlGambarSoal(raw);
        daftarEkstrak[i].statusMuatGambar = 'belum';
        daftarEkstrak[i].gambarTerverifikasi = false;
        renderPratinjauWord();
      });
    });

    wadah.querySelectorAll('[data-w-file-gbr]').forEach(el => {
      el.addEventListener('change', async () => {
        const i = Number(el.dataset.wFileGbr);
        const fileGbr = el.files[0];
        if (!fileGbr || !daftarEkstrak[i]) return;
        try {
          const terkompres = await kompresFileGambarLokal(fileGbr, 1024);
          if (!terkompres) throw new Error('Ukuran gambar terlalu besar atau format tidak didukung.');
          daftarEkstrak[i].urlGambar = terkompres;
          daftarEkstrak[i].urlGambarAsli = '';
          daftarEkstrak[i].statusMuatGambar = 'sukses';
          daftarEkstrak[i].gambarTerverifikasi = false;
          renderPratinjauWord();
          tampilkanToast(`Gambar untuk soal #${i + 1} berhasil dipasang.`);
        } catch (err) {
          tampilkanToast(err.message || 'Gagal memuat gambar.', 'error');
        }
      });
    });

    wadah.querySelectorAll('[data-w-ocr-gbr]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const i = Number(btn.dataset.wOcrGbr);
        const it = daftarEkstrak[i];
        if (!it?.urlGambar) return;
        await denganLoading(btn, 'OCR...', async () => {
          const teksOcr = await bacaTeksOcrDariGambar(it.urlGambar, pct => {
            btn.textContent = `OCR ${pct}%`;
          });
          if (!teksOcr) throw new Error('Tidak ada teks yang terbaca dari gambar.');
          it.pertanyaan = it.pertanyaan.trim() ? `${it.pertanyaan.trim()}\n${teksOcr}` : teksOcr;
          validasiItemSoalPintar(it);
          renderPratinjauWord();
          tampilkanToast(`Teks gambar soal #${i + 1} berhasil diekstrak (OCR).`);
        });
      });
    });

    wadah.querySelectorAll('[data-w-hapus-gbr]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.wHapusGbr);
        if (!daftarEkstrak[i]) return;
        daftarEkstrak[i].urlGambar = '';
        daftarEkstrak[i].urlGambarAsli = '';
        daftarEkstrak[i].gambarTerverifikasi = false;
        renderPratinjauWord();
      });
    });

    wadah.querySelectorAll('[data-w-verif-gbr]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.wVerifGbr);
        if (daftarEkstrak[i]) {
          daftarEkstrak[i].gambarTerverifikasi = true;
          renderPratinjauWord();
        }
      });
    });

    wadah.querySelectorAll('[data-w-img-cek]').forEach(img => {
      const i = Number(img.dataset.wImgCek);
      img.addEventListener('load', () => {
        if (daftarEkstrak[i] && daftarEkstrak[i].statusMuatGambar !== 'sukses') {
          daftarEkstrak[i].statusMuatGambar = 'sukses';
        }
      });
      img.addEventListener('error', () => {
        if (daftarEkstrak[i] && daftarEkstrak[i].statusMuatGambar !== 'gagal') {
          daftarEkstrak[i].statusMuatGambar = 'gagal';
          renderPratinjauWord();
        }
      });
      img.addEventListener('click', () => {
        const u = normalisasiUrlGambarSoal(daftarEkstrak[i]?.urlGambar || '');
        if (u) bukaZoomGambarDnc(u);
      });
    });

    const ikatEdit = (attr, field, numerik = false) => {
      wadah.querySelectorAll(`[${attr}]`).forEach(el => {
        el.addEventListener('change', () => {
          const i = Number(el.getAttribute(attr));
          daftarEkstrak[i][field] = numerik ? Number(el.value) : el.value.trim();
          if (field === 'pertanyaan' && !daftarEkstrak[i].urlGambar) {
            const eks = ekstrakLinkGambarDariTeks(daftarEkstrak[i].pertanyaan);
            if (eks.urlGambar) {
              daftarEkstrak[i].pertanyaan = eks.teksBersih || daftarEkstrak[i].pertanyaan;
              daftarEkstrak[i].urlGambar = eks.urlGambar;
              daftarEkstrak[i].urlGambarAsli = eks.urlAsli;
              daftarEkstrak[i].statusMuatGambar = 'belum';
            }
          }
          if (field === 'kunciJawaban') {
            if (adalahTipeBeropsi(daftarEkstrak[i].tipeSoal)) {
              daftarEkstrak[i].kunciJawaban = selesaikanKunciOpsiDariTeks(daftarEkstrak[i].kunciJawaban, daftarEkstrak[i].opsiJawaban, daftarEkstrak[i].tipeSoal);
            } else if (daftarEkstrak[i].tipeSoal === 'Benar/Salah') {
              daftarEkstrak[i].kunciJawaban = normalisasiKunciBenarSalah(daftarEkstrak[i].kunciJawaban);
            }
          }
          validasiItemSoalPintar(daftarEkstrak[i]);
          if (daftarEkstrak[i].valid) daftarEkstrak[i].dipilih = true;
          renderPratinjauWord();
        });
      });
    };
    ikatEdit('data-w-kode', 'kodeSoal');
    ikatEdit('data-w-tipe', 'tipeSoal');
    ikatEdit('data-w-tanya', 'pertanyaan');
    ikatEdit('data-w-kunci', 'kunciJawaban');
    ikatEdit('data-w-bobot', 'bobotNilai', true);

    wadah.querySelectorAll('[data-w-opsi-idx]').forEach(el => {
      el.addEventListener('change', () => {
        const i = Number(el.dataset.wOpsiIdx);
        const kode = el.dataset.wOpsiKode;
        const val = el.value.trim();
        const daftar = (daftarEkstrak[i].opsiJawaban || []).filter(o => o.kode !== kode);
        if (val) daftar.push({ kode, teks: val });
        daftar.sort((a, b) => a.kode.localeCompare(b.kode));
        daftarEkstrak[i].opsiJawaban = daftar;
        validasiItemSoalPintar(daftarEkstrak[i]);
        if (daftarEkstrak[i].valid) daftarEkstrak[i].dipilih = true;
        renderPratinjauWord();
      });
    });
  };

  bukaModalFormDnc({
    judul: 'Impor Pintar Bank Soal — Bebas Template (Word, PDF, Excel)',
    lebar: true,
    labelSimpan: 'Simpan Massal ke Bank Soal',
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup">
          <label class="dnc-label" for="w-kategoriSoal">Kategori Soal *</label>
          <select id="w-kategoriSoal" class="dnc-select">
            ${KATEGORI_SOAL_LIST.map(k => `<option value="${k}">Soal ${k}</option>`).join('')}
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="w-mapelId">Mata Pelajaran Sasaran *</label>
          <select id="w-mapelId" class="dnc-select">${mapelList.map(m => `<option value="${esc(m.id)}">${esc(m.kodeMapel)} - ${esc(m.namaMapel)}</option>`).join('')}</select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="w-tingkat">Tingkat Kelas *</label>
          <select id="w-tingkat" class="dnc-select">${TINGKAT_LIST.map(t => `<option value="${t}" ${t === 'VI' ? 'selected' : ''}>${esc(labelTingkat(t))}</option>`).join('')}</select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="w-sumberPaket">Nama Paket / Grup Soal * (otomatis dari nama file)</label>
          <input id="w-sumberPaket" class="dnc-input" type="text" placeholder="Contoh: Bank_Soal_ASAS_Matematika_Kelas_6_Semester_1">
          <span class="dnc-form-bantuan">Seluruh soal dari file ini akan dikelompokkan dalam satu paket agar rapi saat dipilih di Jadwal &amp; Paket ASAS.</span>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <div class="dnc-flex-between dnc-mb-12">
            <label class="dnc-label" for="w-file-docx">Dokumen / Gambar Soal (.docx, .pdf, .xlsx, .xls, .csv, .txt, .png, .jpg, .webp) *</label>
            <button type="button" id="btn-unduh-templat-word" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil">
              <svg class="dnc-ikon"><use href="#icon-download"></use></svg>
              <span>Contoh Word (Opsional)</span>
            </button>
          </div>
          <div class="dnc-file-drop">
            <input id="w-file-docx" class="dnc-input" type="file" multiple accept=".docx,.pdf,.xlsx,.xls,.csv,.txt,.png,.jpg,.jpeg,.webp" style="padding-top:7px">
            <div id="info-ringkas-word" class="dnc-form-bantuan dnc-mt-12">Mendukung soal bergambar di Word (.docx), gambar tertanam/scan PDF (.pdf), unggahan gambar langsung (.png/.jpg/.webp via OCR), PG, PG Kompleks, Benar/Salah, Isian, dan Uraian.</div>
          </div>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <div class="dnc-flex-between">
            <label class="dnc-label" for="w-teks-kunci-opsional">Kunci Jawaban &amp; Penskoran Tambahan (Opsional — jika file kunci terpisah)</label>
            <div class="dnc-flex-gap">
              <label class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" style="cursor:pointer">
                <span>Unggah File Kunci</span>
                <input id="w-file-kunci-opsional" type="file" accept=".docx,.pdf,.xlsx,.xls,.csv,.txt" style="display:none">
              </label>
              <button type="button" id="btn-terapkan-kunci-tambahan" class="dnc-tombol dnc-tombol-aksen dnc-tombol-kecil">Terapkan Kunci &amp; Bobot</button>
            </div>
          </div>
          <textarea id="w-teks-kunci-opsional" class="dnc-textarea" style="min-height:58px" placeholder="Contoh bebas: 1. B 2. C 3. A, D (Skor 5) atau tempel isi kunci jawaban &amp; pedoman penskoran dari Word/PDF di sini..."></textarea>
        </div>
      </div>
      <div id="wadah-pratinjau-word"></div>`,
    onMount: () => {
      document.getElementById('btn-unduh-templat-word').addEventListener('click', () => {
        unduhTemplatWordDocx();
        tampilkanToast('Contoh dokumen Word berhasil diunduh.');
      });

      document.getElementById('btn-terapkan-kunci-tambahan').addEventListener('click', () => {
        const isi = document.getElementById('w-teks-kunci-opsional').value;
        if (!daftarEkstrak.length) {
          tampilkanToast('Unggah file soal terlebih dahulu.', 'error');
          return;
        }
        if (!isi.trim()) {
          tampilkanToast('Tempel teks kunci jawaban atau unggah file kunci terlebih dahulu.', 'error');
          return;
        }
        terapkanKunciTambahanKeDaftar(isi);
        renderPratinjauWord();
        tampilkanToast('Kunci jawaban dan bobot penskoran berhasil diterapkan otomatis.');
      });

      document.getElementById('w-file-kunci-opsional').addEventListener('change', async e => {
        const fileKunci = e.target.files[0];
        if (!fileKunci) return;
        try {
          const teksKunci = await bacaTeksMentahFileKunci(fileKunci);
          document.getElementById('w-teks-kunci-opsional').value = teksKunci;
          if (daftarEkstrak.length) {
            terapkanKunciTambahanKeDaftar(teksKunci);
            renderPratinjauWord();
            tampilkanToast(`File kunci "${fileKunci.name}" berhasil dibaca dan dicocokkan.`);
          } else {
            tampilkanToast(`File kunci "${fileKunci.name}" siap dicocokkan setelah file soal diunggah.`);
          }
        } catch (err) {
          tampilkanToast(err.message || 'Gagal membaca file kunci.', 'error');
        }
      });

      document.getElementById('w-file-docx').addEventListener('change', async e => {
        const files = [...(e.target.files || [])];
        const file = files[0];
        if (!file) return;
        const inpPaket = document.getElementById('w-sumberPaket');
        if (inpPaket) inpPaket.value = bersihkanNamaPaketSoal(file.name);
        const info = document.getElementById('info-ringkas-word');
        const ext = teks(file.name.split('.').pop());
        const daftarExtGambar = ['png', 'jpg', 'jpeg', 'webp', 'bmp'];
        info.textContent = `Menganalisis struktur soal, gambar, opsi, kunci jawaban, dan bobot penskoran dari ${file.name}...`;
        try {
          const mapelObj = cariById('mataPelajaran', document.getElementById('w-mapelId').value);
          const prefix = (mapelObj?.kodeMapel || 'SOAL').replace(/[^A-Za-z0-9]/g, '').slice(0, 8);

          if (daftarExtGambar.includes(ext)) {
            const hasilGambar = [];
            const capImg = Date.now().toString().slice(-4);
            for (let fi = 0; fi < files.length; fi++) {
              const fg = files[fi];
              info.textContent = `Memproses gambar ${fi + 1}/${files.length} (${fg.name}) — mengompres & menjalankan OCR...`;
              const imgUrl = await kompresFileGambarLokal(fg, 1024);
              let teksOcr = '';
              try {
                teksOcr = await bacaTeksOcrDariGambar(imgUrl, pct => {
                  info.textContent = `Membaca teks gambar ${fi + 1}/${files.length} (${fg.name}) — OCR ${pct}%...`;
                });
              } catch (_) {}

              const linesOcr = teksOcr.split(/\r?\n/).map(t => t.trim()).filter(Boolean);
              const parsed = linesOcr.length
                ? ekstrakSoalPintarDariSumber({
                    baris: linesOcr.map((t, idx) => ({ teks: t, img: idx === 0 ? imgUrl : '', imgAsli: '', labelGambar: fg.name, bold: false })),
                    tabel: []
                  }, prefix)
                : [];

              if (parsed.length) {
                parsed.forEach((p, idxP) => {
                  if (idxP === 0 && !p.urlGambar) p.urlGambar = imgUrl;
                  p.urlGambarAsli = '';
                  p.statusMuatGambar = 'sukses';
                  p.kodeSoal = `${prefix}-IMG${capImg}-${String(hasilGambar.length + 1).padStart(2, '0')}`;
                  hasilGambar.push(validasiItemSoalPintar(p));
                });
              } else {
                const tipeAuto = deteksiTipeDariTeks('', 0, '', teksOcr);
                hasilGambar.push(validasiItemSoalPintar({
                  dipilih: true,
                  nomorAsli: hasilGambar.length + 1,
                  urutanGlobal: hasilGambar.length + 1,
                  kodeSoal: `${prefix}-IMG${capImg}-${String(hasilGambar.length + 1).padStart(2, '0')}`,
                  tipeSoal: tipeAuto,
                  pertanyaan: teksOcr || 'Perhatikan gambar soal berikut!',
                  urlGambar: imgUrl,
                  urlGambarAsli: '',
                  labelGambar: fg.name,
                  statusMuatGambar: 'sukses',
                  gambarTerverifikasi: false,
                  opsiJawaban: [],
                  kunciJawaban: '',
                  bobotNilai: 10
                }));
              }
            }
            daftarEkstrak = hasilGambar;
          } else if (ext === 'docx') {
            const mammothLib = await muatMammothJs();
            const hasilHtml = await mammothLib.convertToHtml(
              { arrayBuffer: await file.arrayBuffer() },
              {
                convertImage: mammothLib.images.imgElement(async image => {
                  const b64 = await image.read('base64');
                  const dataUrl = `data:${image.contentType};base64,${b64}`;
                  const terkompres = await kompresDataGambar(dataUrl, 1024, 0.85);
                  return { src: terkompres };
                })
              }
            );
            const sumber = ubahHtmlWordKeBarisTerstruktur(hasilHtml.value);
            daftarEkstrak = ekstrakSoalPintarDariSumber(sumber, prefix);
          } else if (ext === 'pdf') {
            info.textContent = `Membaca teks & mengekstrak gambar tertanam dari ${file.name}...`;
            const barisPdf = await ekstrakBarisDanGambarPdf(file);
            const barisSiap = [];
            for (const item of barisPdf) {
              if (item.isHalamanScan && item.img) {
                info.textContent = `Halaman ${item.halaman} berupa scan gambar — menjalankan OCR otomatis...`;
                let teksOcr = '';
                try {
                  teksOcr = await bacaTeksOcrDariGambar(item.img, pct => {
                    info.textContent = `Membaca scan Halaman ${item.halaman} (OCR ${pct}%)...`;
                  });
                } catch (_) {}
                const linesOcr = teksOcr.split(/\r?\n/).map(t => t.trim()).filter(Boolean);
                if (linesOcr.length) {
                  linesOcr.forEach((t, idx) => barisSiap.push({
                    teks: t,
                    img: idx === 0 ? item.img : '',
                    imgAsli: '',
                    labelGambar: idx === 0 ? item.labelGambar : '',
                    bold: false
                  }));
                } else {
                  barisSiap.push({
                    teks: `${barisSiap.length + 1}. Perhatikan gambar soal berikut!`,
                    img: item.img,
                    imgAsli: '',
                    labelGambar: item.labelGambar,
                    bold: false
                  });
                }
              } else {
                barisSiap.push(item);
              }
            }
            daftarEkstrak = ekstrakSoalPintarDariSumber({ baris: barisSiap, tabel: [] }, prefix);
            if (!daftarEkstrak.length) {
              const halGbr = barisPdf.filter(x => x.img);
              const capPdf = Date.now().toString().slice(-4);
              daftarEkstrak = halGbr.map((x, idx) => validasiItemSoalPintar({
                dipilih: true,
                nomorAsli: idx + 1,
                urutanGlobal: idx + 1,
                kodeSoal: `${prefix}-PDF${capPdf}-${String(idx + 1).padStart(2, '0')}`,
                tipeSoal: 'Pilihan Ganda',
                pertanyaan: 'Perhatikan gambar soal berikut!',
                urlGambar: x.img,
                urlGambarAsli: '',
                labelGambar: x.labelGambar || `Gambar PDF ${idx + 1}`,
                statusMuatGambar: 'sukses',
                gambarTerverifikasi: false,
                opsiJawaban: [],
                kunciJawaban: '',
                bobotNilai: 10
              }));
            }
          } else if (ext === 'xlsx' || ext === 'xls') {
            const XLSX = await muatSheetJs();
            const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
              .map(r => r.map(c => ({ teks: String(c ?? '').trim(), img: '', bold: false })));
            daftarEkstrak = ekstrakSoalPintarDariSumber({ baris: [], tabel: [rows] }, prefix);
          } else if (ext === 'csv') {
            const rows = parseCsvBaris(await file.text())
              .map(r => r.map(c => ({ teks: String(c ?? '').trim(), img: '', bold: false })));
            daftarEkstrak = ekstrakSoalPintarDariSumber({ baris: [], tabel: [rows] }, prefix);
          } else if (ext === 'txt') {
            const lines = (await file.text()).split(/\r?\n/).map(t => t.trim()).filter(Boolean);
            daftarEkstrak = ekstrakSoalPintarDariSumber({
              baris: lines.map(t => ({ teks: t, img: '', bold: false })),
              tabel: []
            }, prefix);
          } else {
            throw new Error('Gunakan file Word (.docx), PDF (.pdf), Excel (.xlsx/.xls), CSV, TXT, atau Gambar (.png/.jpg/.webp).');
          }

          const teksKunciTambahan = document.getElementById('w-teks-kunci-opsional')?.value || '';
          if (teksKunciTambahan.trim()) terapkanKunciTambahanKeDaftar(teksKunciTambahan);

          renderPratinjauWord();
        } catch (err) {
          info.textContent = err.message || 'Gagal membaca dokumen soal.';
          tampilkanToast(info.textContent, 'error');
        }
      });
    },
    onSubmit: async () => {
      const terpilih = daftarEkstrak.filter(x => x.dipilih && x.valid);
      if (!terpilih.length) throw new Error('Belum ada butir soal berstatus Valid yang dipilih untuk disimpan.');
      const kategoriSoal = normalisasiKategoriSoal(document.getElementById('w-kategoriSoal')?.value);
      const mapelId = document.getElementById('w-mapelId').value;
      const tingkat = document.getElementById('w-tingkat').value;
      if (!bolehAksesMapel(mapelId)) throw new Error('Anda tidak memiliki akses pada mata pelajaran tersebut.');
      const mapelObjSimpan = cariById('mataPelajaran', mapelId);
      const sumberPaket = (document.getElementById('w-sumberPaket')?.value || '').trim() ||
        `Paket_Soal_${kategoriSoal}_${(mapelObjSimpan?.namaMapel || 'Mapel').replace(/\s+/g, '_')}_Tingkat_${tingkat}`;

      let tersimpan = 0;
      for (const it of terpilih) {
        let kodeUnik = it.kodeSoal.trim();
        if (!(await cekUnik(COLLECTIONS.bankSoal, 'kodeSoal', kodeUnik))) {
          kodeUnik = `${kodeUnik}-${Math.floor(10 + Math.random() * 89)}`;
        }
        const urlGambar = normalisasiUrlGambarSoal(it.urlGambar || '');
        const kunciSimpan = it.tipeSoal === 'Pilihan Ganda'
          ? String(it.kunciJawaban).toUpperCase().slice(0, 1)
          : (it.tipeSoal === 'Pilihan Ganda Kompleks'
            ? normalisasiKunciKompleks(it.kunciJawaban)
            : (it.tipeSoal === 'Benar/Salah' ? normalisasiKunciBenarSalah(it.kunciJawaban) : it.kunciJawaban));

        await dbCreate(COLLECTIONS.bankSoal, {
          kodeSoal: kodeUnik,
          kategoriSoal,
          sumberPaket,
          mapelId,
          tingkat,
          tipeSoal: it.tipeSoal,
          pertanyaan: it.pertanyaan.trim(),
          urlGambar,
          urlGambarAsli: urlGambar.startsWith('data:image/') ? '' : (it.urlGambarAsli || ''),
          gambarTerverifikasi: Boolean(urlGambar && it.gambarTerverifikasi),
          opsiJawaban: adalahTipeBeropsi(it.tipeSoal) ? it.opsiJawaban : [],
          kunciJawaban: kunciSimpan,
          bobotNilai: Number(it.bobotNilai),
          statusAktif: true,
          dibuatOleh: penggunaAktif.id
        });
        tersimpan++;
      }
      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M3', 'DNC-M4', 'DNC-M5']);
      await muatM3BankSoal(true);
      tampilkanToast(`${tersimpan} butir soal (${kategoriSoal}) berhasil disimpan dalam paket "${sumberPaket}".`);
    }
  });
}

function bukaModalImporCsvSoal() {
  const mapelList = daftarMapelDiizinkan();
  if (!mapelList.length) { tampilkanToast('Belum ada mata pelajaran tersedia.', 'error'); return; }

  bukaModalFormDnc({
    judul: 'Impor Bank Soal RAD dari CSV (Poin Otomatis)',
    lebar: true,
    labelSimpan: 'Impor Soal CSV',
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup">
          <label class="dnc-label" for="csv-kategoriSoal">Kategori Soal *</label>
          <select id="csv-kategoriSoal" class="dnc-select">
            ${KATEGORI_SOAL_LIST.map(k => `<option value="${k}">Soal ${k}</option>`).join('')}
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="csv-mapelId">Mata Pelajaran Sasaran *</label>
          <select id="csv-mapelId" class="dnc-select">${mapelList.map(m => `<option value="${esc(m.id)}">${esc(m.kodeMapel)} - ${esc(m.namaMapel)}</option>`).join('')}</select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="csv-tingkat">Tingkat Kelas *</label>
          <select id="csv-tingkat" class="dnc-select">${TINGKAT_LIST.map(t => `<option value="${t}" ${t === 'VI' ? 'selected' : ''}>${esc(labelTingkat(t))}</option>`).join('')}</select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="csv-sumberPaket">Nama Paket / Grup Soal * (otomatis dari nama file CSV)</label>
          <input id="csv-sumberPaket" class="dnc-input" type="text" placeholder="Contoh: Bank_Soal_RAD_Matematika_Kelas_6_Semester_1">
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <div class="dnc-flex-between">
            <label class="dnc-label" for="csv-file-soal">Pilih File CSV (.csv)</label>
            <button type="button" id="btn-unduh-templat-csv" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil">Unduh Templat CSV</button>
          </div>
          <input id="csv-file-soal" class="dnc-input" type="file" accept=".csv,text/csv" style="padding-top:7px">
          <span class="dnc-form-bantuan">Header kolom tanpa bobot manual: kodeSoal,tipeSoal,pertanyaan,opsiA,opsiB,opsiC,opsiD,opsiE,kunciJawaban,urlGambar (opsional). Poin ditetapkan otomatis (PG/PGK/BS = 1, Isian = 2).</span>
        </div>
      </div>`,
    onMount: () => {
      document.getElementById('btn-unduh-templat-csv').addEventListener('click', () => {
        const isi = 'kodeSoal,tipeSoal,pertanyaan,opsiA,opsiB,opsiC,opsiD,opsiE,kunciJawaban,urlGambar\n' +
          'SOAL-01,Pilihan Ganda,"Hasil dari 12 x 5 adalah ...",50,55,60,65,,C,\n' +
          'SOAL-02,Pilihan Ganda Kompleks,"Pilih bilangan prima berikut:",2,9,11,15,,"A, C",\n' +
          'SOAL-03,Benar/Salah,"Tentukan Benar atau Salah! Pernyataan 1: Matahari terbit dari timur. Pernyataan 2: Air membeku di 100 C.",,,,,,"1. Benar, 2. Salah",\n' +
          'SOAL-04,Isian Singkat,"Ibukota Provinsi DIY adalah ....",,,,,,Yogyakarta,\n';
        unduhBlobFile(new Blob([isi], { type: 'text/csv;charset=utf-8' }), 'Templat_Bank_Soal_RAD_DNC.csv');
      });
      document.getElementById('csv-file-soal').addEventListener('change', e => {
        const file = e.target.files[0];
        const inpPaket = document.getElementById('csv-sumberPaket');
        if (file && inpPaket) inpPaket.value = bersihkanNamaPaketSoal(file.name);
      });
    },
    onSubmit: async () => {
      const file = document.getElementById('csv-file-soal').files[0];
      if (!file) throw new Error('Pilih file CSV terlebih dahulu.');
      const kategoriSoal = normalisasiKategoriSoal(document.getElementById('csv-kategoriSoal')?.value);
      const mapelId = document.getElementById('csv-mapelId').value;
      const tingkat = document.getElementById('csv-tingkat').value;
      const mapelObj = cariById('mataPelajaran', mapelId);
      const sumberPaket = (document.getElementById('csv-sumberPaket')?.value || '').trim() ||
        bersihkanNamaPaketSoal(file.name) ||
        `Paket_CSV_${kategoriSoal}_${(mapelObj?.namaMapel || 'Mapel').replace(/\s+/g, '_')}_Tingkat_${tingkat}`;
      const baris = parseCsvBaris(await file.text());
      if (baris.length < 2) throw new Error('File CSV tidak berisi baris soal.');

      const headerCsv = (baris[0] || []).map(h => teks(h));
      const punyaKolomBobotLama = headerCsv.some(h => h.includes('bobot') || h.includes('skor'));

      let tersimpan = 0;
      const waktuTag = Date.now().toString().slice(-4);
      for (let i = 1; i < baris.length; i++) {
        const row = baris[i];
        const [kodeRaw, tipeRaw, pertanyaanRaw, a, b, c, d, e, kunciRaw] = row;
        const bobotRaw = punyaKolomBobotLama ? row[9] : '';
        const gambarRaw = punyaKolomBobotLama ? row[10] : row[9];
        if (!pertanyaanRaw) continue;
        let pertanyaan = pertanyaanRaw.trim();
        let urlGambarAsli = String(gambarRaw || '').trim();
        if (!urlGambarAsli) {
          const eks = ekstrakLinkGambarDariTeks(pertanyaan);
          if (eks.urlGambar) {
            pertanyaan = eks.teksBersih || pertanyaan;
            urlGambarAsli = eks.urlAsli;
          }
        }
        const urlGambar = normalisasiUrlGambarSoal(urlGambarAsli);
        const opsiTemp = [['A', a], ['B', b], ['C', c], ['D', d], ['E', e]].filter(([, v]) => v).map(([kode, teksOpsi]) => ({ kode, teks: teksOpsi }));
        const tipeSoal = deteksiTipeDariTeks(tipeRaw, opsiTemp.length, kunciRaw, pertanyaan);
        const opsiJawaban = adalahTipeBeropsi(tipeSoal) ? opsiTemp : [];
        const kodeSoal = kodeRaw || `${(mapelObj?.kodeMapel || 'SL')}-${waktuTag}-${String(i).padStart(2, '0')}`;
        const bobotNilai = bobotOtomatisTipeSoal(tipeSoal, bobotRaw);
        const kunciJawaban = tipeSoal === 'Pilihan Ganda'
          ? String(kunciRaw || 'A').trim().toUpperCase().slice(0, 1)
          : (tipeSoal === 'Pilihan Ganda Kompleks'
            ? normalisasiKunciKompleks(kunciRaw)
            : (tipeSoal === 'Benar/Salah' ? normalisasiKunciBenarSalah(kunciRaw) : String(kunciRaw || '').trim()));
        if (adalahTipeBeropsi(tipeSoal) && opsiJawaban.length < 2) continue;
        await dbCreate(COLLECTIONS.bankSoal, {
          kodeSoal, kategoriSoal, sumberPaket, mapelId, tingkat, tipeSoal, pertanyaan,
          urlGambar, urlGambarAsli: urlGambar.startsWith('data:image/') ? '' : urlGambarAsli,
          gambarTerverifikasi: false,
          opsiJawaban, kunciJawaban, bobotNilai, statusAktif: true, dibuatOleh: penggunaAktif.id
        });
        tersimpan++;
      }
      if (!tersimpan) throw new Error('Tidak ada baris soal yang valid untuk diimpor.');
      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M3', 'DNC-M4', 'DNC-M5']);
      await muatM3BankSoal(true);
      tampilkanToast(`${tersimpan} butir soal (${kategoriSoal}) berhasil diimpor dengan poin otomatis dalam paket "${sumberPaket}".`);
    }
  });
}
// ===== AKHIR BLOK: DNC_M3_BANK_SOAL =====
// ===== BLOK: DNC_M4_PAKET_ASAS =====
async function muatM4PaketAsas(paksa = false) {
  if (!sudahDimuat['DNC-M4'] || paksa) {
    await Promise.all([muatDataDasar(), muatDataPengguna(), muatDataBankSoal(), muatDataPaket()]);
    sudahDimuat['DNC-M4'] = true;
  }
  isiSelectOpsi('filter-mapel-paket', daftarMapelDiizinkan().map(m => ({ value: m.id, label: m.namaMapel })), 'Semua Mapel');
  isiSelectOpsi('filter-kelas-paket', daftarKelasDiizinkan().map(k => ({ value: k.id, label: `${k.kodeKelas} - ${k.namaKelas}` })), 'Semua Kelas');
  renderTabelPaket();
}

function hitungTotalBobotPaket(daftarSoalIds) {
  return bulatDua((daftarSoalIds || []).reduce((total, sid) => {
    const s = cariById('bankSoal', sid);
    return total + poinEfektifSoal(s);
  }, 0));
}

function renderTabelPaket() {
  const q = teks(document.getElementById('cari-paket')?.value || '');
  const fSem = document.getElementById('filter-semester-paket')?.value || '';
  const fMapel = document.getElementById('filter-mapel-paket')?.value || '';
  const fKelas = document.getElementById('filter-kelas-paket')?.value || '';
  const fStatus = document.getElementById('filter-status-paket')?.value || '';

  const data = stateMemori.paketAsas.filter(p => {
    if (fSem && p.semester !== fSem) return false;
    if (fMapel && p.mapelId !== fMapel) return false;
    if (fKelas && !(p.kelasIds || []).includes(fKelas)) return false;
    if (fStatus && p.statusPaket !== fStatus) return false;
    if (q && !`${teks(p.judulPaket)} ${teks(p.tokenUjian)}`.includes(q)) return false;
    return true;
  });

  renderTabelDnc('tbody-paket', data, [
    { label: 'Judul Paket', render: p => `<strong>${esc(p.judulPaket)}</strong><div class="dnc-form-bantuan">${esc(p.tahunAjaran)}</div>` },
    { label: 'Mapel & Semester', render: p => `${esc(namaMapelById(p.mapelId))}<div class="dnc-form-bantuan">Semester ${esc(p.semester)}</div>` },
    { label: 'Kelas Sasaran', render: p => esc((p.kelasIds || []).map(id => cariById('kelas', id)?.kodeKelas || id).join(', ') || '-') },
    { label: 'Jadwal & Durasi', render: p => `${formatTanggal(p.waktuMulai, true)}<div class="dnc-form-bantuan">s.d. ${formatTanggal(p.waktuSelesai, true)} (${esc(p.durasiMenit)} mnt)</div>` },
    { label: 'Soal & Poin Maks', render: p => `${(p.daftarSoalIds || []).length} soal<div class="dnc-form-bantuan">Poin Maks: ${hitungTotalBobotPaket(p.daftarSoalIds)}</div>` },
    { label: 'Token', render: p => `<span class="dnc-mono">${esc(p.tokenUjian)}</span>` },
    {
      label: 'Status & Kontrol Sesi',
      render: p => {
        const dibuka = Boolean(p.ujianDibuka) && p.statusPaket === 'Aktif';
        const badgeLive = dibuka
          ? `<span class="dnc-badge dnc-badge-hijau"><span class="dnc-dot-live"></span>Ujian Dibuka</span>`
          : (p.statusPaket === 'Selesai'
            ? badgeStatus('Selesai')
            : `<span class="dnc-badge dnc-badge-amber">${p.dihentikanPada ? 'Dihentikan Guru' : 'Belum Dimulai'}</span>`);
        const tombolKontrol = dibuka
          ? `<button type="button" class="dnc-tombol dnc-tombol-bahaya-solid dnc-tombol-kecil" data-berhenti-sesi="${esc(p.id)}">
               <svg class="dnc-ikon" style="width:13px;height:13px"><use href="#icon-stop"></use></svg>
               <span>Berhenti Ujian</span>
             </button>`
          : `<button type="button" class="dnc-tombol dnc-tombol-sukses dnc-tombol-kecil" data-mulai-sesi="${esc(p.id)}">
               <svg class="dnc-ikon" style="width:13px;height:13px"><use href="#icon-play"></use></svg>
               <span>Mulai Ujian</span>
             </button>`;
        return `<div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start">${badgeLive}${tombolKontrol}</div>`;
      }
    },
    {
      label: 'Aksi', aksi: true,
      render: p => `<div class="dnc-aksi-baris">
        <button type="button" class="dnc-tombol dnc-tombol-aksen dnc-tombol-kecil" data-rehitung-paket="${esc(p.id)}">Hitung Ulang</button>
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-token-paket="${esc(p.id)}">Token Baru</button>
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-ubah-paket="${esc(p.id)}">Ubah</button>
        <button type="button" class="dnc-tombol dnc-tombol-bahaya dnc-tombol-kecil" data-hapus-paket="${esc(p.id)}">Hapus</button>
      </div>`
    }
  ], 'Belum ada jadwal dan paket Ruang Asesmen Digital (RAD)');
}

async function mulaiSesiUjianOlehGuru(paketId) {
  const p = cariById('paketAsas', paketId);
  if (!p) return;
  bukaKonfirmasi({
    judul: 'Mulai Sesi Ujian ASAS',
    pesan: `Aktifkan dan buka akses pengerjaan untuk paket "${p.judulPaket}" sekarang? Siswa pada kelas sasaran akan langsung dapat masuk memakai token ${p.tokenUjian}.`,
    labelYa: 'Ya, Mulai Ujian',
    kelasTombol: 'dnc-tombol-sukses',
    onYa: async () => {
      await dbUpdate(COLLECTIONS.paketAsas, paketId, {
        statusPaket: 'Aktif',
        ujianDibuka: true,
        dibukaPada: new Date().toISOString(),
        diubahOleh: penggunaAktif.id
      });
      resetCacheMenu(['DNC-M1', 'DNC-M4', 'DNC-M5']);
      await muatM4PaketAsas(true);
      tampilkanToast(`Ujian "${p.judulPaket}" telah DIMULAI. Siswa kini dapat mengerjakan soal.`);
    }
  });
}

async function hentikanSesiUjianOlehGuru(paketId) {
  const p = cariById('paketAsas', paketId);
  if (!p) return;
  bukaKonfirmasi({
    judul: 'Berhenti & Kunci Sesi Ujian',
    pesan: `Menghentikan ujian "${p.judulPaket}" akan langsung menutup akses siswa dan mengumpulkan otomatis lembar ujian siswa yang masih berlangsung. Lanjutkan?`,
    labelYa: 'Ya, Berhenti Ujian',
    kelasTombol: 'dnc-tombol-bahaya-solid',
    onYa: async () => {
      await dbUpdate(COLLECTIONS.paketAsas, paketId, {
        ujianDibuka: false,
        dihentikanPada: new Date().toISOString(),
        diubahOleh: penggunaAktif.id
      });
      resetCacheMenu(['DNC-M1', 'DNC-M4', 'DNC-M5']);
      await muatM4PaketAsas(true);
      tampilkanToast(`Ujian "${p.judulPaket}" telah DIHENTIKAN. Siswa tidak dapat mengerjakan soal lagi.`, 'info');
    }
  });
}

function bukaFormPaket(item = null) {
  if (item && !bolehKelolaPaket(item)) {
    tampilkanToast('Anda tidak memiliki izin mengubah paket ASAS milik guru lain.', 'error');
    return;
  }
  const mapelList = daftarMapelDiizinkan();
  const kelasListDiizinkan = daftarKelasDiizinkan();
  if (!mapelList.length) { tampilkanToast('Tambahkan mata pelajaran terlebih dahulu.', 'error'); return; }
  if (!kelasListDiizinkan.length) { tampilkanToast('Tambahkan data kelas atau tetapkan kelas ampu guru terlebih dahulu.', 'error'); return; }

  const mapelAwal = item?.mapelId || mapelList[0].id;
  const mulaiDefault = item?.waktuMulai ? keInputDatetimeLocal(item.waktuMulai) : keInputDatetimeLocal(new Date());
  const selesaiDefault = item?.waktuSelesai ? keInputDatetimeLocal(item.waktuSelesai) : keInputDatetimeLocal(new Date(Date.now() + 2 * 3600000));
  const kelasTerpilih = new Set(item?.kelasIds || []);
  const soalTerpilih = new Set(item?.daftarSoalIds || []);

  let sinkronStatusGrupPaket = () => {};

  const renderChecklistSoal = (mapelId, modeTipe = 'semua') => {
    const wadah = document.getElementById('f-paket-soal-list');
    const infoBobot = document.getElementById('f-paket-info-bobot');
    if (!wadah) return;

    const soalTersedia = stateMemori.bankSoal.filter(s => {
      if (!bolehKelolaSoal(s)) return false;
      if (s.mapelId !== mapelId || s.statusAktif === false) return false;
      if (modeTipe === 'pg_pgk') return adalahTipeBeropsi(s.tipeSoal);
      return true;
    });

    if (!soalTersedia.length) {
      wadah.innerHTML = '<div class="dnc-teks-muted" style="padding:8px">Belum ada paket soal aktif milik akun Anda sesuai filter tipe untuk mata pelajaran ini. Tambah/impor soal atau salin dari referensi di Bank Soal.</div>';
      infoBobot.textContent = '0 paket (0 soal) • Bobot: 0';
      sinkronStatusGrupPaket = () => {};
      return;
    }

    const petaGrup = new Map();
    soalTersedia.forEach(s => {
      const namaGrup = namaSumberPaketSoal(s);
      if (!petaGrup.has(namaGrup)) petaGrup.set(namaGrup, []);
      petaGrup.get(namaGrup).push(s);
    });

    const daftarGrup = [...petaGrup.entries()].map(([namaGrup, list]) => {
      const terurut = [...list].sort((a, b) =>
        String(a.kodeSoal || '').localeCompare(String(b.kodeSoal || ''), undefined, { numeric: true, sensitivity: 'base' })
      );
      return { namaGrup, list: terurut };
    });

    wadah.innerHTML = daftarGrup.map(({ namaGrup, list }, gIdx) => {
      const bobotGrup = bulatDua(list.reduce((acc, s) => acc + poinEfektifSoal(s), 0));
      const daftarTingkat = [...new Set(list.map(s => s.tingkat).filter(Boolean))].join(', ');
      const daftarTipe = [...new Set(list.map(s => s.tipeSoal).filter(Boolean))].join(', ');
      return `
        <div class="dnc-grup-soal-kartu" data-grup-kartu="${gIdx}">
          <div class="dnc-grup-soal-kepala" data-grup-kepala="${gIdx}">
            <input type="checkbox" data-grup-cek="${gIdx}" aria-label="Pilih seluruh soal pada paket ${esc(namaGrup)}">
            <button type="button" class="dnc-grup-soal-toggle" data-grup-toggle="${gIdx}" aria-expanded="false">
              <div>
                <div class="dnc-grup-soal-judul">${esc(namaGrup)}</div>
                <div class="dnc-grup-soal-meta">${list.length} butir soal • Total Poin Maks ${bobotGrup}${daftarTingkat ? ` • Tingkat ${esc(daftarTingkat)}` : ''} • ${esc(daftarTipe)}</div>
              </div>
              <span class="dnc-grup-soal-panah" data-grup-panah="${gIdx}">Lihat Butir ▾</span>
            </button>
          </div>
          <div class="dnc-grup-soal-isi dnc-disembunyikan" data-grup-isi="${gIdx}">
            ${list.map((s, noIdx) => {
              const poinButir = poinEfektifSoal(s);
              return `
              <label class="dnc-checklist-item">
                <input type="checkbox" name="f-soal-id" data-grup-induk="${gIdx}" value="${esc(s.id)}" data-bobot="${poinButir}" ${soalTerpilih.has(s.id) ? 'checked' : ''}>
                <div style="flex:1">
                  <div class="dnc-flex-between">
                    <strong>${noIdx + 1}. ${esc(s.kodeSoal)}</strong>
                    <span class="dnc-form-bantuan">${esc(s.tipeSoal)} • ${esc(labelTingkat(s.tingkat))} • Poin ${esc(poinButir)}</span>
                  </div>
                  <div class="dnc-form-bantuan">${esc(s.pertanyaan.slice(0, 110))}${s.pertanyaan.length > 110 ? '...' : ''}</div>
                </div>
              </label>`;
            }).join('')}
          </div>
        </div>`;
    }).join('');

    sinkronStatusGrupPaket = () => {
      let jmlPaketTerpilih = 0;
      daftarGrup.forEach((_, gIdx) => {
        const items = [...wadah.querySelectorAll(`input[name="f-soal-id"][data-grup-induk="${gIdx}"]`)];
        const jmlCek = items.filter(el => el.checked).length;
        const cekGrup = wadah.querySelector(`input[data-grup-cek="${gIdx}"]`);
        const kepala = wadah.querySelector(`[data-grup-kepala="${gIdx}"]`);
        if (cekGrup) {
          cekGrup.checked = items.length > 0 && jmlCek === items.length;
          cekGrup.indeterminate = jmlCek > 0 && jmlCek < items.length;
        }
        if (kepala) kepala.classList.toggle('terpilih', jmlCek > 0);
        if (jmlCek > 0) jmlPaketTerpilih++;
      });
      const checked = [...wadah.querySelectorAll('input[name="f-soal-id"]:checked')];
      const total = bulatDua(checked.reduce((acc, el) => acc + Number(el.dataset.bobot || 0), 0));
      infoBobot.textContent = `${jmlPaketTerpilih} paket (${checked.length} soal) • Poin Maks: ${total}`;
    };

    wadah.querySelectorAll('[data-grup-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const gIdx = btn.dataset.grupToggle;
        const panelIsi = wadah.querySelector(`[data-grup-isi="${gIdx}"]`);
        const panah = wadah.querySelector(`[data-grup-panah="${gIdx}"]`);
        if (!panelIsi) return;
        const terbuka = panelIsi.classList.toggle('dnc-disembunyikan') === false;
        btn.setAttribute('aria-expanded', terbuka ? 'true' : 'false');
        if (panah) panah.textContent = terbuka ? 'Tutup Butir ▴' : 'Lihat Butir ▾';
      });
    });

    wadah.querySelectorAll('input[data-grup-cek]').forEach(cbGrup => {
      cbGrup.addEventListener('change', () => {
        const gIdx = cbGrup.dataset.grupCek;
        const items = wadah.querySelectorAll(`input[name="f-soal-id"][data-grup-induk="${gIdx}"]`);
        items.forEach(cb => {
          cb.checked = cbGrup.checked;
          if (cbGrup.checked) soalTerpilih.add(cb.value);
          else soalTerpilih.delete(cb.value);
        });
        sinkronStatusGrupPaket();
      });
    });

    wadah.querySelectorAll('input[name="f-soal-id"]').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) soalTerpilih.add(cb.value);
        else soalTerpilih.delete(cb.value);
        sinkronStatusGrupPaket();
      });
    });

    sinkronStatusGrupPaket();
  };

  bukaModalFormDnc({
    judul: item ? 'Ubah Paket Ruang Asesmen Digital (RAD)' : 'Buat Jadwal & Paket Ruang Asesmen Digital (RAD)',
    lebar: true,
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="f-judulPaket">Judul Paket *</label>
          <input id="f-judulPaket" class="dnc-input" type="text" placeholder="Contoh: Asesmen Ganjil Matematika Kelas VI" value="${esc(item?.judulPaket || '')}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-semester">Semester *</label>
          <select id="f-semester" class="dnc-select">
            <option value="Ganjil" ${(item?.semester || 'Ganjil') === 'Ganjil' ? 'selected' : ''}>Ganjil</option>
            <option value="Genap" ${item?.semester === 'Genap' ? 'selected' : ''}>Genap</option>
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-tahunAjaranPaket">Tahun Ajaran *</label>
          <input id="f-tahunAjaranPaket" class="dnc-input" type="text" value="${esc(item?.tahunAjaran || '2026/2027')}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-mapelPaket">Mata Pelajaran *</label>
          <select id="f-mapelPaket" class="dnc-select">
            ${mapelList.map(m => `<option value="${esc(m.id)}" ${mapelAwal === m.id ? 'selected' : ''}>${esc(m.kodeMapel)} - ${esc(m.namaMapel)}</option>`).join('')}
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-statusPaket">Status Paket *</label>
          <select id="f-statusPaket" class="dnc-select">
            ${['Draft', 'Aktif', 'Selesai'].map(st => `<option value="${st}" ${(item?.statusPaket || 'Aktif') === st ? 'selected' : ''}>${st}</option>`).join('')}
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-waktuMulai">Waktu Mulai *</label>
          <input id="f-waktuMulai" class="dnc-input" type="datetime-local" value="${esc(mulaiDefault)}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-waktuSelesai">Waktu Selesai *</label>
          <input id="f-waktuSelesai" class="dnc-input" type="datetime-local" value="${esc(selesaiDefault)}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-durasiMenit">Durasi Pengerjaan (Menit) *</label>
          <input id="f-durasiMenit" class="dnc-input" type="number" min="1" value="${esc(item?.durasiMenit ?? 60)}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-tokenUjian">Token Ujian (6 Karakter) *</label>
          <div class="dnc-input-grup">
            <input id="f-tokenUjian" class="dnc-input dnc-mono" type="text" maxlength="6" value="${esc(item?.tokenUjian || buatTokenAcak(6))}" required>
            <button type="button" id="btn-gen-token" class="dnc-tombol dnc-tombol-sekunder">Acak</button>
          </div>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label">Kelas Sasaran * (pilih minimal satu)</label>
          <div class="dnc-checklist-box" style="max-height:115px">
            ${kelasListDiizinkan.map(k => `
              <label class="dnc-checklist-item">
                <input type="checkbox" name="f-kelas-id" value="${esc(k.id)}" ${kelasTerpilih.has(k.id) ? 'checked' : ''}>
                <span><strong>${esc(k.kodeKelas)}</strong> — ${esc(k.namaKelas)} (${esc(labelTingkat(k.tingkat))})</span>
              </label>`).join('')}
          </div>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <div class="dnc-flex-between">
            <label class="dnc-label">Pilih Paket Soal * (Klik nama paket untuk lihat butirnya)</label>
            <div class="dnc-flex-gap">
              <select id="f-filter-tipe-paket" class="dnc-select" style="height:28px;font-size:11px;width:auto">
                <option value="semua">Semua Jenis Soal (PG, PGK, Isian, Uraian)</option>
                <option value="pg_pgk">Hanya PG &amp; PG Kompleks</option>
              </select>
              <button type="button" id="btn-pilih-semua-soal-paket" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" style="height:28px">Pilih Semua</button>
              <span id="f-paket-info-bobot" class="dnc-badge dnc-badge-biru">0 paket (0 soal)</span>
            </div>
          </div>
          <div id="f-paket-soal-list" class="dnc-checklist-box" style="max-height:290px"></div>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <div class="dnc-flex-gap" style="gap:16px">
            <label class="dnc-check-label"><input id="f-acakSoal" type="checkbox" ${(item ? item.acakSoal : true) ? 'checked' : ''}><span>Acak Urutan Soal Per Siswa</span></label>
            <label class="dnc-check-label"><input id="f-acakOpsi" type="checkbox" ${(item ? item.acakOpsi : true) ? 'checked' : ''}><span>Acak Opsi Jawaban Per Siswa</span></label>
            <label class="dnc-check-label"><input id="f-tampilkanNilai" type="checkbox" ${item?.tampilkanNilai ? 'checked' : ''}><span>Tampilkan Nilai ke Siswa</span></label>
          </div>
          <span class="dnc-form-bantuan">Setelah disimpan, tekan tombol <strong>Mulai Ujian</strong> pada tabel paket agar siswa dapat membuka lembar soal.</span>
        </div>
      </div>`,
    onMount: () => {
      const selMapel = document.getElementById('f-mapelPaket');
      const selFilterTipe = document.getElementById('f-filter-tipe-paket');

      renderChecklistSoal(mapelAwal, selFilterTipe.value);
      selMapel.addEventListener('change', e => {
        soalTerpilih.clear();
        renderChecklistSoal(e.target.value, selFilterTipe.value);
      });
      selFilterTipe.addEventListener('change', () => {
        renderChecklistSoal(selMapel.value, selFilterTipe.value);
      });
      document.getElementById('btn-pilih-semua-soal-paket').addEventListener('click', () => {
        const boxes = document.querySelectorAll('#f-paket-soal-list input[name="f-soal-id"]');
        const belumSemua = [...boxes].some(b => !b.checked);
        boxes.forEach(b => {
          b.checked = belumSemua;
          if (belumSemua) soalTerpilih.add(b.value);
          else soalTerpilih.delete(b.value);
        });
        sinkronStatusGrupPaket();
      });
      document.getElementById('btn-gen-token').addEventListener('click', () => {
        document.getElementById('f-tokenUjian').value = buatTokenAcak(6);
      });
    },
    onSubmit: async () => {
      const judulPaket = document.getElementById('f-judulPaket').value.trim();
      const semester = document.getElementById('f-semester').value;
      const tahunAjaran = document.getElementById('f-tahunAjaranPaket').value.trim();
      const mapelId = document.getElementById('f-mapelPaket').value;
      const statusPaket = document.getElementById('f-statusPaket').value;
      const waktuMulaiVal = document.getElementById('f-waktuMulai').value;
      const waktuSelesaiVal = document.getElementById('f-waktuSelesai').value;
      const durasiMenit = Number(document.getElementById('f-durasiMenit').value);
      const tokenUjian = document.getElementById('f-tokenUjian').value.trim().toUpperCase();
      const kelasIds = [...document.querySelectorAll('input[name="f-kelas-id"]:checked')].map(el => el.value);
      const daftarSoalIds = [...document.querySelectorAll('input[name="f-soal-id"]:checked')].map(el => el.value);

      if (!judulPaket || !tahunAjaran || !mapelId) throw new Error('Judul paket, tahun ajaran, dan mata pelajaran wajib diisi.');
      if (!bolehAksesMapel(mapelId)) throw new Error('Anda tidak memiliki akses pada mata pelajaran tersebut.');
      if (!kelasIds.length) throw new Error('Pilih minimal satu kelas sasaran.');
      if (kelasIds.some(kid => !bolehAksesKelas(kid))) throw new Error('Terdapat kelas sasaran yang tidak termasuk kelas ampu Anda.');
      if (!daftarSoalIds.length) throw new Error('Pilih minimal satu butir soal untuk paket ASAS.');
      if (daftarSoalIds.some(sid => !bolehKelolaSoal(cariById('bankSoal', sid)))) throw new Error('Terdapat butir soal yang bukan milik akun Anda.');
      if (!waktuMulaiVal || !waktuSelesaiVal) throw new Error('Waktu mulai dan waktu selesai wajib diisi.');
      const dMulai = new Date(waktuMulaiVal);
      const dSelesai = new Date(waktuSelesaiVal);
      if (dSelesai.getTime() <= dMulai.getTime()) throw new Error('Waktu selesai harus lebih besar dari waktu mulai.');
      if (isNaN(durasiMenit) || durasiMenit <= 0) throw new Error('Durasi pengerjaan harus lebih besar dari 0 menit.');
      if (!/^[A-Z0-9]{6}$/.test(tokenUjian)) throw new Error('Token ujian wajib tepat 6 karakter alfanumerik kapital.');
      if (!(await cekUnik(COLLECTIONS.paketAsas, 'tokenUjian', tokenUjian, item?.id))) {
        throw new Error(`Token "${tokenUjian}" sudah digunakan paket lain.`);
      }

      const payload = {
        judulPaket, semester, tahunAjaran, mapelId, kelasIds, daftarSoalIds,
        waktuMulai: dMulai.toISOString(),
        waktuSelesai: dSelesai.toISOString(),
        durasiMenit, tokenUjian,
        acakSoal: document.getElementById('f-acakSoal').checked,
        acakOpsi: document.getElementById('f-acakOpsi').checked,
        tampilkanNilai: document.getElementById('f-tampilkanNilai').checked,
        statusPaket,
        ujianDibuka: statusPaket === 'Aktif' ? Boolean(item?.ujianDibuka) : false,
        dibuatOleh: item?.dibuatOleh || penggunaAktif.id,
        diubahOleh: penggunaAktif.id
      };
      if (item) await dbUpdate(COLLECTIONS.paketAsas, item.id, payload);
      else await dbCreate(COLLECTIONS.paketAsas, payload);

      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M4', 'DNC-M5', 'DNC-M6']);
      await muatM4PaketAsas(true);
      tampilkanToast(item ? 'Paket ASAS berhasil diperbarui.' : 'Paket ASAS berhasil dibuat.');
    }
  });
}

async function perbaruiTokenPaket(id) {
  let tokenBaru = buatTokenAcak(6);
  while (!(await cekUnik(COLLECTIONS.paketAsas, 'tokenUjian', tokenBaru, id))) {
    tokenBaru = buatTokenAcak(6);
  }
  await dbUpdate(COLLECTIONS.paketAsas, id, { tokenUjian: tokenBaru, diubahOleh: penggunaAktif.id });
  resetCacheMenu(['DNC-M4', 'DNC-M5']);
  await muatM4PaketAsas(true);
  tampilkanToast(`Token ujian diperbarui menjadi ${tokenBaru}.`);
}

function hapusPaketDenganProteksi(id) {
  const p = cariById('paketAsas', id);
  if (!p) return;
  bukaKonfirmasi({
    judul: 'Hapus Paket Ruang Asesmen Digital (RAD)',
    pesan: `Yakin ingin menghapus paket "${p.judulPaket}"?`,
    labelYa: 'Ya, Hapus',
    onYa: async () => {
      const hasils = await dbList(COLLECTIONS.hasilUjian);
      if (hasils.some(h => h.paketId === id)) {
        throw new Error('Paket RAD tidak dapat dihapus karena sudah memiliki rekaman hasil ujian peserta didik.');
      }
      await dbDelete(COLLECTIONS.paketAsas, id);
      resetCacheMenu(['DNC-M1', 'DNC-M4', 'DNC-M5', 'DNC-M6']);
      await muatM4PaketAsas(true);
      tampilkanToast('Paket RAD berhasil dihapus.');
    }
  });
}

async function hitungUlangNilaiPaketRad(paketIdTarget = '') {
  const paketTunggal = paketIdTarget ? cariById('paketAsas', paketIdTarget) : null;
  if (paketIdTarget && !paketTunggal) {
    tampilkanToast('Paket tidak ditemukan.', 'error');
    return;
  }
  if (paketTunggal && !bolehKelolaPaket(paketTunggal)) {
    tampilkanToast('Anda tidak memiliki izin menghitung ulang nilai paket milik guru lain.', 'error');
    return;
  }

  const labelSasaran = paketTunggal
    ? `paket "${paketTunggal.judulPaket}"`
    : (penggunaAktif?.role === 'Admin'
      ? 'SELURUH paket RAD & latihan yang sudah dilaksanakan'
      : 'seluruh paket RAD milik Anda yang sudah dilaksanakan');

  bukaKonfirmasi({
    judul: 'Hitung Ulang Nilai Standar RAD',
    pesan: `Hitung ulang nilai hasil ujian pada ${labelSasaran} menggunakan aturan poin terbaru (PG = 1, PG Kompleks = 1, Benar/Salah = 1, Isian Singkat = 2; Nilai = (Perolehan / Poin Maks) × 100)?`,
    labelYa: 'Ya, Hitung Ulang Nilai',
    kelasTombol: 'dnc-tombol-aksen',
    onYa: async () => {
      const [semuaSoal, semuaPaket, semuaHasil] = await Promise.all([
        dbList(COLLECTIONS.bankSoal, { batas: 2000 }),
        dbList(COLLECTIONS.paketAsas, { batas: 300 }),
        dbList(COLLECTIONS.hasilUjian, { batas: 1000 })
      ]);

      const petaSoal = new Map(semuaSoal.map(s => [s.id, s]));
      const petaPaket = new Map(semuaPaket.map(p => [p.id, p]));
      const paketDiizinkanSet = new Set(stateMemori.paketAsas.map(p => p.id));

      const targetHasil = semuaHasil.filter(h => {
        if (h.statusUjian === 'Sedang Dikerjakan') return false;
        if (paketIdTarget) return h.paketId === paketIdTarget;
        if (penggunaAktif?.role === 'Admin') return true;
        return paketDiizinkanSet.has(h.paketId);
      });

      if (!targetHasil.length) {
        tampilkanToast('Belum ada hasil ujian selesai yang perlu dihitung ulang pada cakupan ini.', 'info');
        return;
      }

      let jmlDiperbarui = 0;
      for (const h of targetHasil) {
        const paketObj = petaPaket.get(h.paketId) || null;
        const daftarSoalIds = (Array.isArray(paketObj?.daftarSoalIds) && paketObj.daftarSoalIds.length)
          ? paketObj.daftarSoalIds
          : (Array.isArray(h.daftarSoalIds) && h.daftarSoalIds.length
            ? h.daftarSoalIds
            : (Array.isArray(h.urutanSoalIds) && h.urutanSoalIds.length
              ? h.urutanSoalIds
              : (h.jawabanSiswa || []).map(j => j.soalId)));

        const totalPoinMaks = bulatDua(daftarSoalIds.reduce((acc, sid) => {
          const s = petaSoal.get(sid);
          return acc + (s ? poinEfektifSoal(s) : 1);
        }, 0));

        let skorPg = 0;
        let skorUraian = 0;
        let adaUraian = false;

        const jawabanBaru = (h.jawabanSiswa || []).map(j => {
          const s = petaSoal.get(j.soalId);
          if (!s) {
            const skorTetap = Number(j.skor || 0);
            skorPg = bulatDua(skorPg + skorTetap);
            return j;
          }
          if (s.tipeSoal === 'Uraian') {
            adaUraian = true;
            const maksUraian = poinEfektifSoal(s);
            const skorLama = Math.min(maksUraian, Math.max(0, Number(j.skor || 0)));
            skorUraian = bulatDua(skorUraian + skorLama);
            return { ...j, skor: skorLama };
          }
          const skorButir = hitungSkorButirOtomatis(s, j.jawaban);
          skorPg = bulatDua(skorPg + skorButir);
          return { ...j, skor: skorButir };
        });

        const totalPerolehan = bulatDua(skorPg + skorUraian);
        const skorAkhir = totalPoinMaks > 0 ? bulatDua((totalPerolehan / totalPoinMaks) * 100) : 0;
        const kkm = Number(cariById('mataPelajaran', h.mapelId)?.kkm ?? 75);
        const statusUjian = h.statusUjian === 'Menunggu Koreksi' && adaUraian ? 'Menunggu Koreksi' : 'Selesai';
        const statusKetuntasan = statusUjian === 'Menunggu Koreksi'
          ? 'Menunggu Koreksi'
          : (skorAkhir >= kkm ? 'Tuntas' : 'Belum Tuntas');

        await dbUpdate(COLLECTIONS.hasilUjian, h.id, {
          jawabanSiswa: jawabanBaru,
          skorPg,
          skorUraian,
          skorAkhir,
          statusUjian,
          statusKetuntasan
        });
        jmlDiperbarui++;
      }

      resetCacheMenu(['DNC-M1', 'DNC-M4', 'DNC-M5', 'DNC-M6']);
      await muatM4PaketAsas(true);
      tampilkanToast(`${jmlDiperbarui} hasil ujian berhasil dihitung ulang sesuai rumus poin otomatis RAD.`);
    }
  });
}
// ===== AKHIR BLOK: DNC_M4_PAKET_ASAS =====

// ===== BLOK: DNC_M5_RUANG_UJIAN =====
let sesiUjianAktif = null;
let timerUjianInterval = null;
let sedangSubmitUjian = false;
let unsubPaketSiswa = null;
let unsubPaketAktif = null;

function hentikanTimerUjian() {
  if (timerUjianInterval) {
    clearInterval(timerUjianInterval);
    timerUjianInterval = null;
  }
}

function hentikanListenerPaketSiswa() {
  if (typeof unsubPaketSiswa === 'function') {
    unsubPaketSiswa();
    unsubPaketSiswa = null;
  }
  if (typeof unsubPaketAktif === 'function') {
    unsubPaketAktif();
    unsubPaketAktif = null;
  }
}

async function pasangListenerDaftarPaketSiswa() {
  if (IS_PREVIEW || penggunaAktif?.role !== 'Siswa') return;
  if (typeof unsubPaketSiswa === 'function') return;
  try {
    const { db, fsMod } = await muatFirebaseSdk();
    unsubPaketSiswa = fsMod.onSnapshot(fsMod.collection(db, COLLECTIONS.paketAsas), snap => {
      if (!penggunaAktif || penggunaAktif.role !== 'Siswa') return;
      const semua = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      stateMemori.paketAsas = semua.filter(p => Array.isArray(p.kelasIds) && p.kelasIds.includes(penggunaAktif.kelasId));
      if (!sesiUjianAktif && menuAktif === 'DNC-M5') {
        renderGridUjianSiswa();
      }
    });
  } catch (_) {}
}

async function pasangListenerPaketUjianBerjalan(paketId) {
  if (typeof unsubPaketAktif === 'function') {
    unsubPaketAktif();
    unsubPaketAktif = null;
  }
  if (IS_PREVIEW) return;
  try {
    const { db, fsMod } = await muatFirebaseSdk();
    unsubPaketAktif = fsMod.onSnapshot(fsMod.doc(db, COLLECTIONS.paketAsas, paketId), snap => {
      if (!sesiUjianAktif || sesiUjianAktif.paket.id !== paketId || sedangSubmitUjian) return;
      const data = snap.exists() ? snap.data() : null;
      if (!data || data.statusPaket !== 'Aktif' || data.ujianDibuka !== true) {
        const badgeLive = document.getElementById('m5-status-live');
        if (badgeLive) {
          badgeLive.className = 'dnc-badge dnc-badge-merah';
          badgeLive.textContent = 'Dihentikan Guru';
        }
        tampilkanToast('Guru telah menekan Berhenti Ujian. Lembar jawaban Anda dikunci dan dikumpulkan otomatis.', 'info');
        selesaikanUjianSiswa(true, 'dihentikan_guru');
      }
    });
  } catch (_) {}
}

let filterKategoriBimbelM5 = '';
let filterMapelBimbelM5 = '';
let filterRiwayatBimbelM5 = '';

function buatPaketIdBimbel(namaGrup, mapelId, kategoriSoal) {
  const slug = String(namaGrup || 'paket')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 56) || 'paket';
  const kat = normalisasiKategoriSoal(kategoriSoal).toLowerCase();
  const mpl = String(mapelId || 'umum').replace(/[^a-zA-Z0-9_-]/g, '');
  return `bmb_${kat}_${mpl}_${slug}`;
}

function buatDaftarPaketBimbel() {
  const soalAktif = stateMemori.bankSoal.filter(s => s.statusAktif !== false);
  const peta = new Map();
  soalAktif.forEach(s => {
    const namaGrup = namaSumberPaketSoal(s);
    const kategoriSoal = normalisasiKategoriSoal(s.kategoriSoal);
    const mapelId = s.mapelId || '';
    const id = buatPaketIdBimbel(namaGrup, mapelId, kategoriSoal);
    if (!peta.has(id)) {
      peta.set(id, {
        id,
        judulPaket: namaGrup,
        kategoriSoal,
        mapelId,
        list: []
      });
    }
    peta.get(id).list.push(s);
  });

  return [...peta.values()].map(g => {
    g.list.sort((a, b) =>
      String(a.kodeSoal || '').localeCompare(String(b.kodeSoal || ''), undefined, { numeric: true, sensitivity: 'base' })
    );
    const daftarTingkat = [...new Set(g.list.map(s => s.tingkat).filter(Boolean))].join(', ');
    const totalBobot = bulatDua(g.list.reduce((acc, s) => acc + poinEfektifSoal(s), 0));
    return {
      id: g.id,
      judulPaket: g.judulPaket,
      kategoriSoal: g.kategoriSoal,
      mapelId: g.mapelId,
      daftarTingkat,
      totalBobot,
      daftarSoalIds: g.list.map(s => s.id),
      durasiMenit: 0,
      acakSoal: false,
      acakOpsi: false,
      tampilkanNilai: true,
      statusPaket: 'Aktif',
      ujianDibuka: true,
      modeBimbel: true
    };
  }).sort((a, b) => {
    const kSel = a.kategoriSoal.localeCompare(b.kategoriSoal);
    if (kSel !== 0) return kSel;
    return a.judulPaket.localeCompare(b.judulPaket, 'id', { sensitivity: 'base' });
  });
}

async function muatM5RuangUjian(paksa = false) {
  if (sesiUjianAktif) return;
  if (!sudahDimuat['DNC-M5'] || paksa) {
    await Promise.all([muatDataDasar(), muatDataBankSoal(), muatDataPaket(), muatDataHasil()]);
    sudahDimuat['DNC-M5'] = true;
  }
  document.getElementById('m5-daftar-view').classList.remove('dnc-disembunyikan');
  document.getElementById('m5-lembar-view').classList.add('dnc-disembunyikan');

  const elJudul = document.getElementById('judul-m5');
  const elSub = document.getElementById('subjudul-m5');

  if (penggunaAktif?.role === 'Siswa Bimbel') {
    if (elJudul) elJudul.textContent = 'Bank Soal';
    if (elSub) {
      elSub.textContent = `${penggunaAktif.asalSekolah || 'Siswa Bimbel'} (${penggunaAktif.kelasTeks || '-'}) — Pilih paket soal yang ingin dikerjakan terlebih dahulu.`;
    }
    renderBankSoalBimbel();
    return;
  }

  if (elJudul) elJudul.textContent = 'Ruang Asesmen Digital (RAD)';
  if (elSub) {
    elSub.textContent = `Kelas Anda: ${namaKelasById(penggunaAktif.kelasId)}. Ujian hanya bisa dimulai ketika Guru menekan tombol Mulai Ujian.`;
  }
  renderGridUjianSiswa();
  pasangListenerDaftarPaketSiswa();
}

function renderBankSoalBimbel() {
  const grid = document.getElementById('grid-ujian-siswa');
  if (!grid) return;

  const semuaPaket = buatDaftarPaketBimbel();
  const mapelTerpakai = [...new Set(semuaPaket.map(p => p.mapelId).filter(Boolean))]
    .map(id => ({ id, nama: namaMapelById(id) }))
    .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));

  const denganRiwayat = semuaPaket.map(p => {
    const hasilId = `${p.id}_${penggunaAktif.id}`;
    const hasil = stateMemori.hasilUjian.find(h => h.id === hasilId || (h.paketId === p.id && h.penggunaId === penggunaAktif.id)) || null;
    let statusRiwayat = 'belum';
    if (hasil) {
      statusRiwayat = hasil.statusUjian === 'Sedang Dikerjakan' ? 'sedang' : 'sudah';
    }
    return { paket: p, hasil, statusRiwayat };
  });

  const jmlSudah = denganRiwayat.filter(x => x.statusRiwayat === 'sudah').length;
  const jmlSedang = denganRiwayat.filter(x => x.statusRiwayat === 'sedang').length;
  const jmlBelum = denganRiwayat.filter(x => x.statusRiwayat === 'belum').length;

  const tersaring = denganRiwayat.filter(({ paket, statusRiwayat }) => {
    if (filterKategoriBimbelM5 && paket.kategoriSoal !== filterKategoriBimbelM5) return false;
    if (filterMapelBimbelM5 && paket.mapelId !== filterMapelBimbelM5) return false;
    if (filterRiwayatBimbelM5 && statusRiwayat !== filterRiwayatBimbelM5) return false;
    return true;
  });

  const filterBarHtml = `
    <div class="dnc-kartu" style="grid-column:1/-1">
      <div class="dnc-bimbel-filter-bar" style="margin-bottom:8px">
        <select id="bmb-filter-kat" class="dnc-select dnc-select-filter" aria-label="Filter Kategori Bank Soal">
          <option value="">Semua Kategori (ASAS &amp; TKA)</option>
          <option value="ASAS" ${filterKategoriBimbelM5 === 'ASAS' ? 'selected' : ''}>Kategori ASAS</option>
          <option value="TKA" ${filterKategoriBimbelM5 === 'TKA' ? 'selected' : ''}>Kategori TKA</option>
        </select>
        <select id="bmb-filter-mapel" class="dnc-select dnc-select-filter" aria-label="Filter Mapel Bank Soal">
          <option value="">Semua Mapel</option>
          ${mapelTerpakai.map(m => `<option value="${esc(m.id)}" ${filterMapelBimbelM5 === m.id ? 'selected' : ''}>${esc(m.nama)}</option>`).join('')}
        </select>
        <select id="bmb-filter-riwayat" class="dnc-select dnc-select-filter" aria-label="Filter Riwayat Pengerjaan">
          <option value="">Semua Riwayat (${semuaPaket.length})</option>
          <option value="belum" ${filterRiwayatBimbelM5 === 'belum' ? 'selected' : ''}>Belum Dikerjakan (${jmlBelum})</option>
          <option value="sedang" ${filterRiwayatBimbelM5 === 'sedang' ? 'selected' : ''}>Sedang Dikerjakan (${jmlSedang})</option>
          <option value="sudah" ${filterRiwayatBimbelM5 === 'sudah' ? 'selected' : ''}>Sudah Dikerjakan (${jmlSudah})</option>
        </select>
      </div>
      <div class="dnc-bimbel-meta">
        <span class="dnc-badge dnc-badge-hijau">Sudah Dikerjakan: ${jmlSudah}</span>
        ${jmlSedang ? `<span class="dnc-badge dnc-badge-amber">Sedang Dikerjakan: ${jmlSedang}</span>` : ''}
        <span class="dnc-badge dnc-badge-abu">Belum Dikerjakan: ${jmlBelum}</span>
      </div>
    </div>`;

  if (!tersaring.length) {
    grid.innerHTML = filterBarHtml +
      `<div class="dnc-kartu dnc-teks-tengah dnc-teks-muted" style="grid-column:1/-1">Belum ada paket bank soal yang sesuai filter.</div>`;
  } else {
    const kategoriTampil = KATEGORI_SOAL_LIST.filter(k => tersaring.some(x => x.paket.kategoriSoal === k));
    const blokKategoriHtml = kategoriTampil.map(kat => {
      const daftarKat = tersaring.filter(x => x.paket.kategoriSoal === kat);
      const judulKat = `
        <div class="dnc-subbagian-judul" style="grid-column:1/-1;margin-top:6px">
          <span>Paket Bank Soal Kategori ${esc(kat)}</span>
          <span class="dnc-badge ${kat === 'TKA' ? 'dnc-badge-tka' : 'dnc-badge-asas'}">${daftarKat.length} paket</span>
        </div>`;

      const kartuKat = daftarKat.map(({ paket: p, hasil, statusRiwayat }) => {
        let badgeRiwayat = '<span class="dnc-badge dnc-badge-abu">Belum Dikerjakan</span>';
        let infoSkor = 'Belum ada riwayat pengerjaan';
        let tombolHtml = `<button type="button" class="dnc-tombol dnc-tombol-primer dnc-tombol-penuh" data-bmb-mulai="${esc(p.id)}">Kerjakan Paket Soal</button>`;

        if (statusRiwayat === 'sedang') {
          const prog = hitungProgresSoalHasil(hasil, p);
          badgeRiwayat = '<span class="dnc-badge dnc-badge-amber">Sedang Dikerjakan</span>';
          infoSkor = `Progres: ${prog.dijawab}/${prog.totalSoal} soal terjawab`;
          tombolHtml = `<button type="button" class="dnc-tombol dnc-tombol-aksen dnc-tombol-penuh" data-bmb-mulai="${esc(p.id)}">Lanjutkan Mengerjakan</button>`;
        } else if (statusRiwayat === 'sudah') {
          badgeRiwayat = '<span class="dnc-badge dnc-badge-hijau">Sudah Dikerjakan</span>';
          infoSkor = `Nilai: <strong>${esc(hasil.skorAkhir ?? 0)}</strong> (${esc(hasil.statusKetuntasan || hasil.statusUjian)}) • ${formatTanggal(hasil.waktuSelesaiKerja, true)}`;
          tombolHtml = `
            <div class="dnc-aksi-baris" style="width:100%">
              <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" style="flex:1" data-bmb-rinci="${esc(hasil.id)}">Lihat Rincian</button>
              <button type="button" class="dnc-tombol dnc-tombol-primer dnc-tombol-kecil" style="flex:1" data-bmb-ulang="${esc(p.id)}">Kerjakan Ulang</button>
            </div>`;
        }

        return `
          <article class="dnc-kartu-ujian">
            <div class="dnc-flex-between">
              <div class="dnc-flex-gap">
                ${badgeKategoriSoal(p.kategoriSoal)}
                <span class="dnc-badge dnc-badge-biru">${esc(namaMapelById(p.mapelId))}</span>
              </div>
              ${badgeRiwayat}
            </div>
            <h3 style="font-size:15px;font-weight:700;word-break:break-word">${esc(p.judulPaket)}</h3>
            <div class="dnc-ujian-meta">
              <div><span class="dnc-teks-muted">Jumlah Soal:</span><br><strong>${p.daftarSoalIds.length} butir</strong></div>
              <div><span class="dnc-teks-muted">Tingkat:</span><br><strong>${esc(p.daftarTingkat || '-')}</strong></div>
              <div style="grid-column:1/-1"><span class="dnc-teks-muted">Riwayat:</span><br>${infoSkor}</div>
            </div>
            ${tombolHtml}
          </article>`;
      }).join('');

      return judulKat + kartuKat;
    }).join('');

    grid.innerHTML = filterBarHtml + blokKategoriHtml;
  }

  document.getElementById('bmb-filter-kat')?.addEventListener('change', e => {
    filterKategoriBimbelM5 = e.target.value;
    renderBankSoalBimbel();
  });
  document.getElementById('bmb-filter-mapel')?.addEventListener('change', e => {
    filterMapelBimbelM5 = e.target.value;
    renderBankSoalBimbel();
  });
  document.getElementById('bmb-filter-riwayat')?.addEventListener('change', e => {
    filterRiwayatBimbelM5 = e.target.value;
    renderBankSoalBimbel();
  });
  grid.querySelectorAll('[data-bmb-mulai]').forEach(btn => {
    btn.addEventListener('click', () => mulaiLatihanBimbel(btn.dataset.bmbMulai, false));
  });
  grid.querySelectorAll('[data-bmb-rinci]').forEach(btn => {
    btn.addEventListener('click', () => bukaModalKoreksiHasil(btn.dataset.bmbRinci, true));
  });
  grid.querySelectorAll('[data-bmb-ulang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.dataset.bmbUlang;
      bukaKonfirmasi({
        judul: 'Kerjakan Ulang Paket Soal',
        pesan: 'Memulai ulang akan mereset jawaban sebelumnya pada paket soal ini agar Anda dapat berlatih kembali dari awal. Lanjutkan?',
        labelYa: 'Ya, Mulai Ulang',
        kelasTombol: 'dnc-tombol-primer',
        onYa: () => mulaiLatihanBimbel(pid, true)
      });
    });
  });
}

async function mulaiLatihanBimbel(paketId, kerjakanUlang = false) {
  const paket = buatDaftarPaketBimbel().find(p => p.id === paketId);
  if (!paket || !paket.daftarSoalIds.length) {
    tampilkanToast('Paket soal tidak ditemukan atau belum memiliki butir soal.', 'error');
    return;
  }

  const hasilId = `${paket.id}_${penggunaAktif.id}`;
  let hasil = kerjakanUlang ? null : await dbGetById(COLLECTIONS.hasilUjian, hasilId);
  if (!hasil || hasil.statusUjian !== 'Sedang Dikerjakan') {
    const urutanSoalIds = [...paket.daftarSoalIds];
    const jawabanAwal = urutanSoalIds.map(sid => ({ soalId: sid, jawaban: '', ragu: false, skor: 0 }));
    hasil = await dbCreate(COLLECTIONS.hasilUjian, {
      paketId: paket.id,
      judulPaket: paket.judulPaket,
      kategoriSoal: paket.kategoriSoal,
      jenisSesi: 'Bimbel',
      daftarSoalIds: urutanSoalIds,
      penggunaId: penggunaAktif.id,
      kelasId: '',
      kelasTeks: penggunaAktif.kelasTeks || '',
      asalSekolah: penggunaAktif.asalSekolah || '',
      mapelId: paket.mapelId,
      waktuMulaiKerja: new Date().toISOString(),
      waktuSelesaiKerja: null,
      statusUjian: 'Sedang Dikerjakan',
      urutanSoalIds,
      urutanOpsiMap: {},
      jawabanSiswa: jawabanAwal,
      skorPg: 0,
      skorUraian: 0,
      skorAkhir: 0,
      statusKetuntasan: 'Menunggu Koreksi',
      catatanKoreksi: '',
      dikoreksiOleh: ''
    }, hasilId);
  }

  await mulaiLembarUjian(paket, hasil);
}

function renderGridUjianSiswa() {
  const grid = document.getElementById('grid-ujian-siswa');
  if (!grid) return;
  const paketAktif = stateMemori.paketAsas.filter(p => p.statusPaket === 'Aktif');
  if (!paketAktif.length) {
    grid.innerHTML = `<div class="dnc-kartu dnc-teks-tengah dnc-teks-muted" style="grid-column:1/-1">Belum ada jadwal ASAS aktif untuk kelas Anda saat ini.</div>`;
    return;
  }

  grid.innerHTML = paketAktif.map(p => {
    const hasilId = `${p.id}_${penggunaAktif.id}`;
    const hasil = stateMemori.hasilUjian.find(h => h.id === hasilId || (h.paketId === p.id && h.penggunaId === penggunaAktif.id));
    const dibukaGuru = Boolean(p.ujianDibuka);

    let statusBadgeHtml = '';
    let tombolAksi = '';

    if (hasil && hasil.statusUjian !== 'Sedang Dikerjakan') {
      statusBadgeHtml = badgeStatus('Selesai');
      tombolAksi = `<button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-penuh" disabled>Sudah Diselesaikan (${esc(hasil.statusUjian)})</button>`;
    } else if (!dibukaGuru) {
      statusBadgeHtml = p.dihentikanPada
        ? `<span class="dnc-badge dnc-badge-merah">Dihentikan Guru</span>`
        : `<span class="dnc-badge dnc-badge-amber">Menunggu Mulai Guru</span>`;
      tombolAksi = `<button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-penuh" disabled>${p.dihentikanPada ? 'Ujian Telah Dihentikan Guru' : 'Menunggu Guru Klik Mulai Ujian'}</button>`;
    } else if (hasil && hasil.statusUjian === 'Sedang Dikerjakan') {
      statusBadgeHtml = `<span class="dnc-badge dnc-badge-hijau"><span class="dnc-dot-live"></span>Sedang Dikerjakan</span>`;
      tombolAksi = `<button type="button" class="dnc-tombol dnc-tombol-aksen dnc-tombol-penuh" data-lanjut-ujian="${esc(p.id)}">Lanjutkan Sesi Ujian</button>`;
    } else {
      statusBadgeHtml = `<span class="dnc-badge dnc-badge-hijau"><span class="dnc-dot-live"></span>Ujian Dibuka</span>`;
      tombolAksi = `<button type="button" class="dnc-tombol dnc-tombol-primer dnc-tombol-penuh" data-mulai-ujian="${esc(p.id)}">Mulai Ujian (Masukkan Token)</button>`;
    }

    return `
      <article class="dnc-kartu-ujian">
        <div class="dnc-flex-between">
          <span class="dnc-badge dnc-badge-biru">${esc(namaMapelById(p.mapelId))}</span>
          ${statusBadgeHtml}
        </div>
        <h3 style="font-size:15px;font-weight:700">${esc(p.judulPaket)}</h3>
        <div class="dnc-ujian-meta">
          <div><span class="dnc-teks-muted">Mulai:</span><br><strong>${formatTanggal(p.waktuMulai, true)}</strong></div>
          <div><span class="dnc-teks-muted">Selesai:</span><br><strong>${formatTanggal(p.waktuSelesai, true)}</strong></div>
          <div><span class="dnc-teks-muted">Durasi:</span><br><strong>${esc(p.durasiMenit)} menit</strong></div>
          <div><span class="dnc-teks-muted">Jumlah Soal:</span><br><strong>${(p.daftarSoalIds || []).length} butir</strong></div>
        </div>
        ${tombolAksi}
      </article>`;
  }).join('');

  grid.querySelectorAll('[data-mulai-ujian]').forEach(btn => {
    btn.addEventListener('click', () => bukaModalTokenUjian(btn.dataset.mulaiUjian));
  });
  grid.querySelectorAll('[data-lanjut-ujian]').forEach(btn => {
    btn.addEventListener('click', () => lanjutkanSesiUjianSiswa(btn.dataset.lanjutUjian));
  });
}

function buatPetaAcakSiswa(paket) {
  const soalIdsAsli = [...(paket.daftarSoalIds || [])];
  const urutanSoalIds = paket.acakSoal ? acakArray(soalIdsAsli) : soalIdsAsli;
  const urutanOpsiMap = {};
  urutanSoalIds.forEach(sid => {
    const s = cariById('bankSoal', sid);
    if (s && adalahTipeBeropsi(s.tipeSoal)) {
      const daftarKodeAsli = (s.opsiJawaban || []).map(o => o.kode);
      urutanOpsiMap[sid] = paket.acakOpsi ? acakArray(daftarKodeAsli) : daftarKodeAsli;
    }
  });
  return { urutanSoalIds, urutanOpsiMap };
}

function bukaModalTokenUjian(paketId) {
  const paket = cariById('paketAsas', paketId);
  if (!paket) return;

  bukaModalFormDnc({
    judul: 'Verifikasi Token Ruang Asesmen Digital (RAD)',
    labelSimpan: 'Buka Lembar Soal',
    htmlKonten: `
      <div class="dnc-pratinjau-soal dnc-mb-12">
        <strong>${esc(paket.judulPaket)}</strong>
        <div class="dnc-form-bantuan">${esc(namaMapelById(paket.mapelId))} • Durasi ${esc(paket.durasiMenit)} menit • ${(paket.daftarSoalIds || []).length} soal</div>
      </div>
      <div class="dnc-form-grup">
        <label class="dnc-label" for="f-input-token">Masukkan Token Ujian (6 Karakter) *</label>
        <input id="f-input-token" class="dnc-input dnc-mono" type="text" maxlength="6" placeholder="Contoh: MTK26A" required>
      </div>`,
    onSubmit: async () => {
      const tokenInput = document.getElementById('f-input-token').value.trim().toUpperCase();
      const paketTerbaru = await dbGetById(COLLECTIONS.paketAsas, paket.id) || paket;
      const sekarang = Date.now();
      const tMulai = keDate(paketTerbaru.waktuMulai)?.getTime() || 0;
      const tSelesai = keDate(paketTerbaru.waktuSelesai)?.getTime() || 0;

      if (paketTerbaru.statusPaket !== 'Aktif') throw new Error('Paket RAD ini tidak berstatus Aktif.');
      if (!paketTerbaru.ujianDibuka) throw new Error('Guru belum menekan tombol Mulai Ujian atau sesi telah dihentikan.');
      if (sekarang < tMulai) throw new Error(`Jadwal ujian belum dimulai. Mulai pada ${formatTanggal(paketTerbaru.waktuMulai, true)}.`);
      if (sekarang > tSelesai) throw new Error('Rentang jadwal ujian untuk paket ini telah berakhir.');
      if (tokenInput !== String(paketTerbaru.tokenUjian || '').toUpperCase()) throw new Error('Token ujian tidak cocok. Periksa kembali token dari pengawas.');

      if (!stateMemori.bankSoal.length) await muatDataBankSoal();

      const hasilId = `${paketTerbaru.id}_${penggunaAktif.id}`;
      let hasil = await dbGetById(COLLECTIONS.hasilUjian, hasilId);
      if (hasil && hasil.statusUjian !== 'Sedang Dikerjakan') {
        throw new Error('Anda sudah menyelesaikan paket RAD ini.');
      }
      if (!hasil) {
        const { urutanSoalIds, urutanOpsiMap } = buatPetaAcakSiswa(paketTerbaru);
        const jawabanAwal = urutanSoalIds.map(sid => ({ soalId: sid, jawaban: '', ragu: false, skor: 0 }));
        hasil = await dbCreate(COLLECTIONS.hasilUjian, {
          paketId: paketTerbaru.id,
          penggunaId: penggunaAktif.id,
          kelasId: penggunaAktif.kelasId,
          mapelId: paketTerbaru.mapelId,
          waktuMulaiKerja: new Date().toISOString(),
          waktuSelesaiKerja: null,
          statusUjian: 'Sedang Dikerjakan',
          urutanSoalIds,
          urutanOpsiMap,
          jawabanSiswa: jawabanAwal,
          skorPg: 0,
          skorUraian: 0,
          skorAkhir: 0,
          statusKetuntasan: 'Menunggu Koreksi',
          catatanKoreksi: '',
          dikoreksiOleh: ''
        }, hasilId);
      }

      tutupModalFormDnc();
      await mulaiLembarUjian(paketTerbaru, hasil);
    }
  });
}

async function lanjutkanSesiUjianSiswa(paketId) {
  const paketTerbaru = await dbGetById(COLLECTIONS.paketAsas, paketId) || cariById('paketAsas', paketId);
  if (!paketTerbaru || paketTerbaru.statusPaket !== 'Aktif' || !paketTerbaru.ujianDibuka) {
    tampilkanToast('Sesi ujian sedang ditutup atau telah dihentikan oleh Guru.', 'error');
    await muatM5RuangUjian(true);
    return;
  }
  const hasilId = `${paketTerbaru.id}_${penggunaAktif.id}`;
  const hasil = await dbGetById(COLLECTIONS.hasilUjian, hasilId) ||
    stateMemori.hasilUjian.find(h => h.paketId === paketId && h.penggunaId === penggunaAktif.id);
  if (!hasil || hasil.statusUjian !== 'Sedang Dikerjakan') {
    tampilkanToast('Sesi ujian sudah tidak aktif.', 'error');
    await muatM5RuangUjian(true);
    return;
  }
  await mulaiLembarUjian(paketTerbaru, hasil);
}

async function mulaiLembarUjian(paket, hasil) {
  if (!stateMemori.bankSoal.length) await muatDataBankSoal();
  const labelVisual = ['A', 'B', 'C', 'D', 'E'];

  const urutanIds = Array.isArray(hasil.urutanSoalIds) && hasil.urutanSoalIds.length
    ? hasil.urutanSoalIds
    : (paket.acakSoal ? acakArray(paket.daftarSoalIds || []) : [...(paket.daftarSoalIds || [])]);

  const petaOpsiTersimpan = hasil.urutanOpsiMap || {};

  const daftarSoal = urutanIds.map(id => {
    const s = cariById('bankSoal', id);
    if (!s) return null;
    const urlGambarNorm = normalisasiUrlGambarSoal(s.urlGambar || '');
    if (!adalahTipeBeropsi(s.tipeSoal)) return { ...s, urlGambar: urlGambarNorm, opsiTampil: [] };

    const opsiAsli = s.opsiJawaban || [];
    const urutanKode = Array.isArray(petaOpsiTersimpan[s.id]) && petaOpsiTersimpan[s.id].length
      ? petaOpsiTersimpan[s.id]
      : (paket.acakOpsi ? acakArray(opsiAsli.map(o => o.kode)) : opsiAsli.map(o => o.kode));

    const opsiTampil = urutanKode
      .map(kodeAsli => opsiAsli.find(o => o.kode === kodeAsli))
      .filter(Boolean)
      .map((o, idx) => ({
        labelTampil: labelVisual[idx] || o.kode,
        kodeAsli: o.kode,
        teks: o.teks
      }));

    return { ...s, urlGambar: urlGambarNorm, opsiTampil };
  }).filter(Boolean);

  if (!daftarSoal.length) {
    tampilkanToast('Butir soal pada paket ini tidak ditemukan.', 'error');
    return;
  }

  const petaJawaban = {};
  (hasil.jawabanSiswa || []).forEach(j => {
    petaJawaban[j.soalId] = { soalId: j.soalId, jawaban: j.jawaban || '', ragu: Boolean(j.ragu), skor: Number(j.skor || 0) };
  });
  daftarSoal.forEach(s => {
    if (!petaJawaban[s.id]) petaJawaban[s.id] = { soalId: s.id, jawaban: '', ragu: false, skor: 0 };
  });

  const adalahModeBimbel = Boolean(paket.modeBimbel);
  let batasAkhirMs = null;
  if (!adalahModeBimbel) {
    const batasMulaiPlusDurasi = (keDate(hasil.waktuMulaiKerja)?.getTime() || Date.now()) + Number(paket.durasiMenit || 60) * 60000;
    const batasJadwal = keDate(paket.waktuSelesai)?.getTime() || batasMulaiPlusDurasi;
    batasAkhirMs = Math.min(batasMulaiPlusDurasi, batasJadwal);
  }

  sesiUjianAktif = {
    paket,
    hasilId: hasil.id,
    daftarSoal,
    petaJawaban,
    indeks: 0,
    batasAkhirMs,
    modeBimbel: adalahModeBimbel,
    mulaiBimbelMs: keDate(hasil.waktuMulaiKerja)?.getTime() || Date.now(),
    jumlahPelanggaran: Number(hasil.jumlahPelanggaran || 0),
    logPelanggaran: Array.isArray(hasil.logPelanggaran) ? [...hasil.logPelanggaran] : []
  };
  sedangSubmitUjian = false;

  document.getElementById('m5-daftar-view').classList.add('dnc-disembunyikan');
  document.getElementById('m5-lembar-view').classList.remove('dnc-disembunyikan');
  document.getElementById('m5-judul-ujian').textContent = paket.judulPaket;
  document.getElementById('m5-info-mapel').textContent = `${namaMapelById(paket.mapelId)} • ${daftarSoal.length} soal${adalahModeBimbel ? ` • Kategori ${normalisasiKategoriSoal(paket.kategoriSoal)}` : ''}`;
  const badgeLive = document.getElementById('m5-status-live');
  if (badgeLive) {
    if (adalahModeBimbel) {
      badgeLive.className = normalisasiKategoriSoal(paket.kategoriSoal) === 'TKA' ? 'dnc-badge dnc-badge-tka' : 'dnc-badge dnc-badge-asas';
      badgeLive.textContent = `Bank Soal ${normalisasiKategoriSoal(paket.kategoriSoal)}`;
    } else {
      badgeLive.className = 'dnc-badge dnc-badge-hijau';
      badgeLive.innerHTML = '<span class="dnc-dot-live"></span>Sesi Dibuka Guru';
    }
  }

  sembunyikanOverlayLockdownSiswa();
  if (adalahRoleSiswa(penggunaAktif?.role)) {
    aktifkanWakeLockSiswa();
  }

  renderSoalAktifM5();
  mulaiCountdownUjian();
  if (!adalahModeBimbel) {
    pasangListenerPaketUjianBerjalan(paket.id);
  }
}

function mulaiCountdownUjian() {
  hentikanTimerUjian();
  const updateTimer = () => {
    if (!sesiUjianAktif) { hentikanTimerUjian(); return; }
    if (sesiUjianAktif.modeBimbel) {
      const berlaluDetik = Math.max(0, Math.floor((Date.now() - (sesiUjianAktif.mulaiBimbelMs || Date.now())) / 1000));
      const jam = String(Math.floor(berlaluDetik / 3600)).padStart(2, '0');
      const mnt = String(Math.floor((berlaluDetik % 3600) / 60)).padStart(2, '0');
      const dtk = String(berlaluDetik % 60).padStart(2, '0');
      document.getElementById('m5-timer-teks').textContent = `${jam}:${mnt}:${dtk}`;
      document.getElementById('m5-timer').classList.remove('kritis');
      return;
    }
    const sisaDetik = Math.max(0, Math.floor((sesiUjianAktif.batasAkhirMs - Date.now()) / 1000));
    const jam = String(Math.floor(sisaDetik / 3600)).padStart(2, '0');
    const mnt = String(Math.floor((sisaDetik % 3600) / 60)).padStart(2, '0');
    const dtk = String(sisaDetik % 60).padStart(2, '0');
    document.getElementById('m5-timer-teks').textContent = `${jam}:${mnt}:${dtk}`;
    document.getElementById('m5-timer').classList.toggle('kritis', sisaDetik <= 300);
    if (sisaDetik <= 0 && !sedangSubmitUjian) {
      hentikanTimerUjian();
      tampilkanToast('Waktu ujian telah habis. Jawaban dikirim otomatis.', 'info');
      selesaikanUjianSiswa(true, 'waktu_habis');
    }
  };
  updateTimer();
  timerUjianInterval = setInterval(updateTimer, 1000);
}

async function autosaveJawabanUjian() {
  if (!sesiUjianAktif) return;
  const badge = document.getElementById('m5-status-simpan');
  badge.textContent = 'Menyimpan...';
  badge.className = 'dnc-badge dnc-badge-amber';
  try {
    const arr = Object.values(sesiUjianAktif.petaJawaban);
    await dbUpdate(COLLECTIONS.hasilUjian, sesiUjianAktif.hasilId, { jawabanSiswa: arr });
    badge.textContent = 'Tersimpan otomatis';
    badge.className = 'dnc-badge dnc-badge-hijau';
  } catch (e) {
    badge.textContent = 'Gagal autosave';
    badge.className = 'dnc-badge dnc-badge-merah';
  }
}

const autosaveTeksDebounced = debounceDnc(() => autosaveJawabanUjian(), 500);

function renderNavigasiNomorM5() {
  if (!sesiUjianAktif) return;
  const { daftarSoal, petaJawaban, indeks } = sesiUjianAktif;
  const jmlTerjawab = daftarSoal.filter(s => String(petaJawaban[s.id]?.jawaban || '').trim() !== '').length;
  document.getElementById('m5-ringkasan-progres').textContent = `${jmlTerjawab} dari ${daftarSoal.length} soal terjawab`;

  const grid = document.getElementById('m5-nomor-grid');
  grid.innerHTML = daftarSoal.map((s, i) => {
    const j = petaJawaban[s.id];
    const cls = [
      'dnc-nomor-btn',
      i === indeks ? 'aktif' : '',
      j?.ragu ? 'ragu' : (String(j?.jawaban || '').trim() !== '' ? 'terjawab' : '')
    ].filter(Boolean).join(' ');
    return `<button type="button" class="${cls}" data-ke-soal="${i}">${i + 1}</button>`;
  }).join('');

  grid.querySelectorAll('[data-ke-soal]').forEach(btn => {
    btn.addEventListener('click', () => {
      sesiUjianAktif.indeks = Number(btn.dataset.keSoal);
      renderSoalAktifM5();
    });
  });
}

function renderSoalAktifM5() {
  if (!sesiUjianAktif) return;
  const { daftarSoal, petaJawaban, indeks } = sesiUjianAktif;
  const soal = daftarSoal[indeks];
  const jwb = petaJawaban[soal.id];

  document.getElementById('m5-nomor-label').textContent = `Soal ${indeks + 1} dari ${daftarSoal.length} (Poin ${poinEfektifSoal(soal)})`;
  const tipeEl = document.getElementById('m5-tipe-badge');
  tipeEl.outerHTML = badgeTipeSoal(soal.tipeSoal).replace('<span ', '<span id="m5-tipe-badge" ');

  document.getElementById('m5-btn-prev').disabled = indeks === 0;
  document.getElementById('m5-btn-next').textContent = indeks === daftarSoal.length - 1 ? 'Selesai & Kumpulkan' : 'Selanjutnya';

  const btnRagu = document.getElementById('m5-btn-ragu');
  btnRagu.textContent = jwb.ragu ? 'Hapus Tanda Ragu' : 'Tandai Ragu-ragu';
  btnRagu.className = `dnc-tombol ${jwb.ragu ? 'dnc-tombol-aksen' : 'dnc-tombol-sekunder'}`;

  const konten = document.getElementById('m5-soal-konten');
  if (soal.tipeSoal === 'Pilihan Ganda') {
    konten.innerHTML = `
      <div class="dnc-opsi-petunjuk">Pilihan Ganda — Pilih satu jawaban yang paling tepat.</div>
      ${soal.urlGambar ? `<img src="${esc(soal.urlGambar)}" alt="Gambar soal" class="dnc-soal-gambar" title="Klik untuk memperbesar gambar">` : ''}
      <div class="dnc-soal-teks">${esc(soal.pertanyaan)}</div>
      <div class="dnc-opsi-list">
        ${soal.opsiTampil.map(o => `
          <button type="button" class="dnc-opsi-item ${jwb.jawaban === o.kodeAsli ? 'terpilih' : ''}" data-pilih-opsi="${esc(o.kodeAsli)}">
            <span class="dnc-opsi-kode">${esc(o.labelTampil)}</span>
            <span>${esc(o.teks)}</span>
          </button>`).join('')}
      </div>`;
    konten.querySelectorAll('[data-pilih-opsi]').forEach(btn => {
      btn.addEventListener('click', async () => {
        jwb.jawaban = btn.dataset.pilihOpsi;
        renderSoalAktifM5();
        await autosaveJawabanUjian();
      });
    });
  } else if (soal.tipeSoal === 'Pilihan Ganda Kompleks') {
    const dipilihSet = parseKunciKompleksSet(jwb.jawaban);
    konten.innerHTML = `
      <div class="dnc-opsi-petunjuk kompleks">Pilihan Ganda Kompleks — Centang lebih dari satu jawaban yang benar.</div>
      ${soal.urlGambar ? `<img src="${esc(soal.urlGambar)}" alt="Gambar soal" class="dnc-soal-gambar" title="Klik untuk memperbesar gambar">` : ''}
      <div class="dnc-soal-teks">${esc(soal.pertanyaan)}</div>
      <div class="dnc-opsi-list">
        ${soal.opsiTampil.map(o => {
          const aktif = dipilihSet.has(o.kodeAsli);
          return `
            <button type="button" class="dnc-opsi-item ${aktif ? 'terpilih' : ''}" data-toggle-kompleks="${esc(o.kodeAsli)}">
              <span class="dnc-opsi-cek">${aktif ? '✓' : ''}</span>
              <span class="dnc-opsi-kode">${esc(o.labelTampil)}</span>
              <span>${esc(o.teks)}</span>
            </button>`;
        }).join('')}
      </div>`;
    konten.querySelectorAll('[data-toggle-kompleks]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const kode = btn.dataset.toggleKompleks;
        const setBaru = parseKunciKompleksSet(jwb.jawaban);
        if (setBaru.has(kode)) setBaru.delete(kode);
        else setBaru.add(kode);
        jwb.jawaban = [...setBaru].sort().join(', ');
        renderSoalAktifM5();
        await autosaveJawabanUjian();
      });
    });
  } else if (soal.tipeSoal === 'Benar/Salah') {
    const kunciBs = parseKunciBenarSalah(soal.kunciJawaban);
    const nomorList = kunciBs.length ? kunciBs.map(x => x.no) : [1, 2, 3];
    const petaJwbBs = parseJawabanBenarSalahMap(jwb.jawaban);
    const petaLabelPernyataan = {};
    String(soal.pertanyaan || '').split(/\r?\n/).forEach(line => {
      const mP = line.trim().match(/^Pernyataan\s+(\d+)\s*[:\.\-]\s*(.+)$/i);
      if (mP) petaLabelPernyataan[mP[1]] = mP[2].trim();
    });

    konten.innerHTML = `
      <div class="dnc-opsi-petunjuk kompleks">Benar / Salah — Pilih Benar atau Salah untuk setiap nomor pernyataan sesuai bacaan/gambar di bawah ini.</div>
      <div class="dnc-soal-teks">${esc(soal.pertanyaan)}</div>
      ${soal.urlGambar ? `<img src="${esc(soal.urlGambar)}" alt="Gambar pernyataan soal" class="dnc-soal-gambar" title="Klik untuk memperbesar gambar">` : ''}
      <div class="dnc-bs-tabel-wrap">
        <table class="dnc-bs-tabel">
          <thead>
            <tr>
              <th style="width:64px">No</th>
              <th>Pernyataan</th>
              <th style="width:190px;text-align:center">Pilihan Anda</th>
            </tr>
          </thead>
          <tbody>
            ${nomorList.map(no => {
              const terpilih = petaJwbBs[String(no)] || '';
              const labelPernyataan = petaLabelPernyataan[String(no)] || `Pernyataan Nomor ${no} (lihat tabel pada gambar/soal)`;
              return `
                <tr>
                  <td data-label="No"><strong>${no}</strong></td>
                  <td data-label="Pernyataan">${esc(labelPernyataan)}</td>
                  <td data-label="Pilihan Anda">
                    <div class="dnc-bs-pilihan-grup">
                      <button type="button" class="dnc-bs-btn ${terpilih === 'Benar' ? 'aktif-benar' : ''}" data-pilih-bs-no="${no}" data-pilih-bs-val="Benar">Benar</button>
                      <button type="button" class="dnc-bs-btn ${terpilih === 'Salah' ? 'aktif-salah' : ''}" data-pilih-bs-no="${no}" data-pilih-bs-val="Salah">Salah</button>
                    </div>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;

    konten.querySelectorAll('[data-pilih-bs-no]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const no = btn.dataset.pilihBsNo;
        const val = btn.dataset.pilihBsVal;
        const petaBaru = parseJawabanBenarSalahMap(jwb.jawaban);
        petaBaru[String(no)] = val;
        jwb.jawaban = formatJawabanBenarSalahMap(petaBaru);
        renderSoalAktifM5();
        await autosaveJawabanUjian();
      });
    });
  } else if (soal.tipeSoal === 'Isian Singkat') {
    konten.innerHTML = `
      <div class="dnc-opsi-petunjuk">Isian Singkat — Tuliskan jawaban singkat dan tepat pada kolom di bawah.</div>
      ${soal.urlGambar ? `<img src="${esc(soal.urlGambar)}" alt="Gambar soal" class="dnc-soal-gambar" title="Klik untuk memperbesar gambar">` : ''}
      <div class="dnc-soal-teks">${esc(soal.pertanyaan)}</div>
      <div class="dnc-form-grup">
        <label class="dnc-label" for="m5-input-isian">Jawaban Isian Singkat</label>
        <input id="m5-input-isian" class="dnc-input" type="text" placeholder="Ketik jawaban singkat Anda..." value="${esc(jwb.jawaban)}">
      </div>`;
    document.getElementById('m5-input-isian').addEventListener('input', e => {
      jwb.jawaban = e.target.value;
      renderNavigasiNomorM5();
      autosaveTeksDebounced();
    });
  } else {
    konten.innerHTML = `
      <div class="dnc-opsi-petunjuk">Uraian — Tuliskan penjelasan jawaban secara lengkap.</div>
      ${soal.urlGambar ? `<img src="${esc(soal.urlGambar)}" alt="Gambar soal" class="dnc-soal-gambar" title="Klik untuk memperbesar gambar">` : ''}
      <div class="dnc-soal-teks">${esc(soal.pertanyaan)}</div>
      <div class="dnc-form-grup">
        <label class="dnc-label" for="m5-input-uraian">Jawaban Uraian Anda</label>
        <textarea id="m5-input-uraian" class="dnc-textarea" style="min-height:140px" placeholder="Tulis jawaban uraian secara lengkap dan jelas...">${esc(jwb.jawaban)}</textarea>
      </div>`;
    document.getElementById('m5-input-uraian').addEventListener('input', e => {
      jwb.jawaban = e.target.value;
      renderNavigasiNomorM5();
      autosaveTeksDebounced();
    });
  }

  konten.querySelector('.dnc-soal-gambar')?.addEventListener('click', () => {
    bukaZoomGambarDnc(soal.urlGambar);
  });

  renderNavigasiNomorM5();
}

function hitungSkorButirOtomatis(soal, jawabanSiswaRaw) {
  const bobot = poinEfektifSoal(soal);
  if (bobot <= 0) return 0;

  if (soal.tipeSoal === 'Pilihan Ganda') {
    const j = String(jawabanSiswaRaw || '').trim().toUpperCase();
    const k = String(soal.kunciJawaban || '').trim().toUpperCase();
    return j && j === k ? bobot : 0;
  }

  if (soal.tipeSoal === 'Pilihan Ganda Kompleks') {
    const kunciSet = parseKunciKompleksSet(soal.kunciJawaban);
    const jwbSet = parseKunciKompleksSet(jawabanSiswaRaw);
    if (!kunciSet.size || !jwbSet.size) return 0;
    const tepat = kunciSet.size === jwbSet.size && [...kunciSet].every(k => jwbSet.has(k));
    return tepat ? bobot : 0;
  }

  if (soal.tipeSoal === 'Benar/Salah') {
    const kunciList = parseKunciBenarSalah(soal.kunciJawaban);
    if (!kunciList.length) return 0;
    const jwbMap = parseJawabanBenarSalahMap(jawabanSiswaRaw);
    let benar = 0;
    kunciList.forEach(it => {
      if (jwbMap[String(it.no)] === it.nilai) benar++;
    });
    return bulatDua((benar / kunciList.length) * bobot);
  }

  if (soal.tipeSoal === 'Isian Singkat') {
    const jNorm = normalisasiIsian(jawabanSiswaRaw);
    if (!jNorm) return 0;
    const alternatifKunci = String(soal.kunciJawaban || '').split(/[|;]/).map(normalisasiIsian).filter(Boolean);
    return alternatifKunci.includes(jNorm) ? bobot : 0;
  }

  return 0;
}

function konfirmasiKumpulUjian() {
  if (!sesiUjianAktif) return;
  const total = sesiUjianAktif.daftarSoal.length;
  const terjawab = sesiUjianAktif.daftarSoal.filter(s => String(sesiUjianAktif.petaJawaban[s.id]?.jawaban || '').trim() !== '').length;
  const ragu = sesiUjianAktif.daftarSoal.filter(s => sesiUjianAktif.petaJawaban[s.id]?.ragu).length;
  bukaKonfirmasi({
    judul: 'Kumpulkan Lembar Ruang Asesmen Digital (RAD)',
    pesan: `Ringkasan: ${terjawab} dari ${total} soal terjawab (${total - terjawab} belum dijawab, ${ragu} ditandai ragu-ragu). Setelah dikumpulkan, jawaban tidak dapat diubah lagi. Lanjutkan?`,
    labelYa: 'Ya, Kumpulkan Ujian',
    kelasTombol: 'dnc-tombol-sukses',
    onYa: () => selesaikanUjianSiswa(false, 'manual')
  });
}

async function selesaikanUjianSiswa(otomatis = false, alasan = 'manual') {
  if (!sesiUjianAktif || sedangSubmitUjian) return;
  sedangSubmitUjian = true;
  hentikanTimerUjian();
  if (typeof unsubPaketAktif === 'function') {
    unsubPaketAktif();
    unsubPaketAktif = null;
  }

  const { paket, hasilId, daftarSoal, petaJawaban } = sesiUjianAktif;
  let skorOtomatis = 0;
  let totalBobot = 0;
  let adaUraian = false;

  const jawabanFinal = daftarSoal.map(s => {
    const j = petaJawaban[s.id] || { soalId: s.id, jawaban: '', ragu: false, skor: 0 };
    const bobot = poinEfektifSoal(s);
    totalBobot = bulatDua(totalBobot + bobot);
    if (s.tipeSoal === 'Uraian') {
      adaUraian = true;
      return { soalId: s.id, jawaban: j.jawaban || '', ragu: Boolean(j.ragu), skor: 0 };
    }
    const skorButir = hitungSkorButirOtomatis(s, j.jawaban);
    skorOtomatis = bulatDua(skorOtomatis + skorButir);
    return { soalId: s.id, jawaban: j.jawaban || '', ragu: Boolean(j.ragu), skor: skorButir };
  });

  const skorAkhir = totalBobot > 0 ? bulatDua((skorOtomatis / totalBobot) * 100) : 0;
  const mapelObj = cariById('mataPelajaran', paket.mapelId);
  const kkm = Number(mapelObj?.kkm ?? 75);
  const statusUjian = adaUraian ? 'Menunggu Koreksi' : 'Selesai';
  const statusKetuntasan = adaUraian ? 'Menunggu Koreksi' : (skorAkhir >= kkm ? 'Tuntas' : 'Belum Tuntas');

  await dbUpdate(COLLECTIONS.hasilUjian, hasilId, {
    waktuSelesaiKerja: new Date().toISOString(),
    statusUjian,
    jawabanSiswa: jawabanFinal,
    skorPg: skorOtomatis,
    skorUraian: 0,
    skorAkhir,
    statusKetuntasan
  });

  sesiUjianAktif = null;
  sedangSubmitUjian = false;
  nonaktifkanWakeLockSiswa();
  resetCacheMenu(['DNC-M1', 'DNC-M5', 'DNC-M6']);
  await muatM5RuangUjian(true);
  if (alasan === 'manual') tampilkanToast(paket.modeBimbel ? `Latihan selesai! Skor Anda: ${skorAkhir}.` : 'Lembar ujian Ruang Asesmen Digital (RAD) berhasil dikumpulkan.');
  else if (alasan === 'waktu_habis') tampilkanToast('Ujian selesai otomatis karena waktu habis.');
}
// ===== AKHIR BLOK: DNC_M5_RUANG_UJIAN =====

// ===== BLOK: DNC_M8_PROFIL =====
async function muatM8Profil() {
  if (!penggunaAktif) return;
  const wadah = document.getElementById('wadah-info-profil-m8');
  if (!wadah) return;

  const baris = [
    ['Nama Lengkap', penggunaAktif.namaLengkap || '-'],
    ['Peran Akun', penggunaAktif.role || 'Siswa Bimbel'],
    ['ID Peserta', penggunaAktif.nomorInduk || '-'],
    ['Asal Sekolah', penggunaAktif.asalSekolah || '-'],
    ['Kelas', penggunaAktif.kelasTeks || '-'],
    ['Email Gmail Login', penggunaAktif.email || '-'],
    ['Tanggal Diterima', penggunaAktif.tanggalDiterima ? formatTanggal(penggunaAktif.tanggalDiterima, true) : '-']
  ];

  wadah.innerHTML = baris.map(([lbl, val]) => `
    <div class="dnc-profil-baris">
      <span class="dnc-profil-label">${esc(lbl)}</span>
      <span class="dnc-profil-nilai">${esc(val)}</span>
    </div>`).join('');
  sudahDimuat['DNC-M8'] = true;
}

async function simpanGantiSandiBimbel() {
  if (!penggunaAktif || penggunaAktif.role !== 'Siswa Bimbel') {
    throw new Error('Fitur ganti sandi mandiri hanya tersedia untuk akun Siswa Bimbel.');
  }
  const sandiLama = document.getElementById('input-sandi-lama-m8')?.value || '';
  const sandiBaru = document.getElementById('input-sandi-baru-m8')?.value || '';
  const sandiKonf = document.getElementById('input-sandi-konf-m8')?.value || '';

  if (!sandiLama || !sandiBaru || !sandiKonf) {
    throw new Error('Seluruh kolom kata sandi wajib diisi.');
  }
  if (sandiBaru.length < 6) {
    throw new Error('Kata sandi baru minimal 6 karakter.');
  }
  if (sandiBaru !== sandiKonf) {
    throw new Error('Konfirmasi kata sandi baru tidak cocok.');
  }
  if (sandiBaru === sandiLama) {
    throw new Error('Kata sandi baru harus berbeda dari kata sandi saat ini.');
  }

  const hashLama = await hashTeks(sandiLama);
  let hashTersimpan = penggunaAktif.passwordHash || '';
  if (!hashTersimpan) {
    const dokTerbaru = await dbGetById(COLLECTIONS.pengguna, penggunaAktif.id);
    hashTersimpan = dokTerbaru?.passwordHash || '';
  }
  if (hashTersimpan && hashTersimpan !== hashLama) {
    throw new Error('Kata sandi saat ini yang Anda masukkan salah.');
  }

  const passwordHashBaru = await hashTeks(sandiBaru);
  await dbUpdate(COLLECTIONS.pengguna, penggunaAktif.id, {
    passwordHash: passwordHashBaru,
    sandiDiubahPada: new Date().toISOString()
  });

  penggunaAktif.passwordHash = passwordHashBaru;
  document.getElementById('input-sandi-lama-m8').value = '';
  document.getElementById('input-sandi-baru-m8').value = '';
  document.getElementById('input-sandi-konf-m8').value = '';
  tampilkanToast('Kata sandi berhasil diperbarui. Gunakan kata sandi baru saat login berikutnya.');
}
// ===== AKHIR BLOK: DNC_M8_PROFIL =====

// ===== BLOK: DNC_M6_HASIL_NILAI =====
let dataHasilTersaring = [];
const paketHasilTerbukaM6 = new Set();
let unsubHasilLiveM6 = null;
let waktuSyncLiveM6 = null;

function hentikanListenerHasilM6() {
  if (typeof unsubHasilLiveM6 === 'function') {
    unsubHasilLiveM6();
    unsubHasilLiveM6 = null;
  }
}

function cariInfoPaketHasil(hasil) {
  const paketAsas = cariById('paketAsas', hasil?.paketId);
  if (paketAsas) return paketAsas;
  const paketBimbel = buatDaftarPaketBimbel().find(p => p.id === hasil?.paketId);
  if (paketBimbel) return paketBimbel;
  return {
    id: hasil?.paketId || '',
    judulPaket: hasil?.judulPaket || 'Paket Soal',
    mapelId: hasil?.mapelId || '',
    kategoriSoal: hasil?.kategoriSoal || 'ASAS',
    daftarSoalIds: Array.isArray(hasil?.daftarSoalIds) && hasil.daftarSoalIds.length
      ? hasil.daftarSoalIds
      : (Array.isArray(hasil?.urutanSoalIds) ? hasil.urutanSoalIds : (hasil?.jawabanSiswa || []).map(j => j.soalId)),
    kelasIds: [],
    tampilkanNilai: hasil?.jenisSesi === 'Bimbel',
    modeBimbel: hasil?.jenisSesi === 'Bimbel' || String(hasil?.paketId || '').startsWith('bmb_')
  };
}

async function pasangListenerHasilLiveM6() {
  if (IS_PREVIEW || !penggunaAktif || adalahRoleSiswa(penggunaAktif.role)) return;
  if (typeof unsubHasilLiveM6 === 'function') return;
  try {
    const { db, fsMod } = await muatFirebaseSdk();
    unsubHasilLiveM6 = fsMod.onSnapshot(fsMod.collection(db, COLLECTIONS.hasilUjian), snap => {
      if (!penggunaAktif || adalahRoleSiswa(penggunaAktif.role)) {
        hentikanListenerHasilM6();
        return;
      }
      const semua = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (keDate(b.dibuat)?.getTime() || 0) - (keDate(a.dibuat)?.getTime() || 0));

      stateMemori.hasilUjian = adalahRoleGuru(penggunaAktif.role)
        ? semua.filter(h => bolehAksesHasilGuru(h))
        : semua;
      waktuSyncLiveM6 = new Date();
      if (menuAktif === 'DNC-M6') {
        renderTabelHasil();
      }
    });
  } catch (_) {}
}

function togglePaketHasilM6(paketId) {
  if (!paketId) return;
  if (paketHasilTerbukaM6.has(paketId)) paketHasilTerbukaM6.delete(paketId);
  else paketHasilTerbukaM6.add(paketId);
  renderTabelHasil();
}

function hitungProgresSoalHasil(hasil, paket) {
  const daftarJwb = Array.isArray(hasil?.jawabanSiswa) ? hasil.jawabanSiswa : [];
  const totalSoal = (paket?.daftarSoalIds?.length)
    || (Array.isArray(hasil?.daftarSoalIds) ? hasil.daftarSoalIds.length : 0)
    || (Array.isArray(hasil?.urutanSoalIds) ? hasil.urutanSoalIds.length : 0)
    || daftarJwb.length;
  const dijawabMentah = daftarJwb.filter(j => String(j?.jawaban ?? '').trim() !== '').length;
  const dijawab = totalSoal > 0 ? Math.min(dijawabMentah, totalSoal) : dijawabMentah;
  const belum = Math.max(0, totalSoal - dijawab);
  const persen = totalSoal > 0 ? Math.min(100, Math.round((dijawab / totalSoal) * 100)) : 0;
  return { totalSoal, dijawab, belum, persen };
}

async function muatM6HasilNilai(paksa = false) {
  if (!sudahDimuat['DNC-M6'] || paksa) {
    await Promise.all([muatDataDasar(), muatDataPengguna(), muatDataBankSoal(), muatDataPaket()]);
    await muatDataHasil();
    sudahDimuat['DNC-M6'] = true;
    waktuSyncLiveM6 = new Date();
  }

  const adalahSiswa = adalahRoleSiswa(penggunaAktif.role);
  document.getElementById('btn-ekspor-csv-nilai').classList.toggle('dnc-disembunyikan', adalahSiswa);
  document.getElementById('btn-cetak-nilai').classList.toggle('dnc-disembunyikan', adalahSiswa);
  document.getElementById('filter-kelas-hasil').classList.toggle('dnc-disembunyikan', adalahSiswa);
  document.getElementById('subjudul-m6').textContent = penggunaAktif.role === 'Siswa Bimbel'
    ? 'Riwayat nilai latihan Bank Soal per paket soal.'
    : (adalahSiswa
      ? 'Riwayat nilai pribadi per paket Ruang Asesmen Digital (RAD) yang mengaktifkan penampilan nilai.'
      : 'Pantau pengerjaan siswa secara live per Judul Paket Ruang Asesmen Digital (RAD) & Bank Soal Bimbel, progres soal terjawab/belum, koreksi jawaban, dan cetak rekap tabel per paket.');

  const petaOpsiPaket = new Map();
  stateMemori.paketAsas.forEach(p => petaOpsiPaket.set(p.id, p.judulPaket));
  stateMemori.hasilUjian.forEach(h => {
    if (h.paketId && !petaOpsiPaket.has(h.paketId)) {
      const info = cariInfoPaketHasil(h);
      petaOpsiPaket.set(h.paketId, `${info.judulPaket}${info.modeBimbel ? ` (${normalisasiKategoriSoal(info.kategoriSoal)} Bimbel)` : ''}`);
    }
  });

  isiSelectOpsi('filter-paket-hasil', [...petaOpsiPaket.entries()].map(([value, label]) => ({ value, label })), 'Semua Paket');
  isiSelectOpsi('filter-mapel-hasil', daftarMapelDiizinkan().map(m => ({ value: m.id, label: m.namaMapel })), 'Semua Mapel');
  isiSelectOpsi('filter-kelas-hasil', daftarKelasDiizinkan().map(k => ({ value: k.id, label: `${k.kodeKelas} - ${k.namaKelas}` })), 'Semua Kelas');
  renderTabelHasil();
  if (!adalahSiswa) pasangListenerHasilLiveM6();
}

function renderTabelHasil() {
  const wadah = document.getElementById('wadah-hasil-paket-m6');
  const liveBar = document.getElementById('live-bar-m6');
  if (!wadah) return;

  const q = teks(document.getElementById('cari-hasil')?.value || '');
  const fPaket = document.getElementById('filter-paket-hasil')?.value || '';
  const fMapel = document.getElementById('filter-mapel-hasil')?.value || '';
  const fKelas = document.getElementById('filter-kelas-hasil')?.value || '';
  const fStatus = document.getElementById('filter-status-hasil')?.value || '';
  const fTuntas = document.getElementById('filter-tuntas-hasil')?.value || '';
  const adalahSiswa = adalahRoleSiswa(penggunaAktif.role);

  dataHasilTersaring = stateMemori.hasilUjian.filter(h => {
    const paket = cariInfoPaketHasil(h);
    if (penggunaAktif.role === 'Siswa' && (!paket || !paket.tampilkanNilai)) return false;
    if (fPaket && h.paketId !== fPaket) return false;
    if (fMapel && h.mapelId !== fMapel) return false;
    if (fKelas && h.kelasId !== fKelas) return false;
    if (fStatus && h.statusUjian !== fStatus) return false;
    if (fTuntas && h.statusKetuntasan !== fTuntas) return false;
    const siswa = cariById('pengguna', h.penggunaId);
    const teksCari = `${teks(siswa?.namaLengkap)} ${teks(siswa?.nomorInduk)} ${teks(siswa?.asalSekolah)} ${teks(paket?.judulPaket)} ${teks(namaMapelById(h.mapelId))}`;
    if (q && !teksCari.includes(q)) return false;
    return true;
  });

  if (liveBar) {
    if (adalahSiswa) {
      liveBar.classList.add('dnc-disembunyikan');
      liveBar.innerHTML = '';
    } else {
      const totalSedang = dataHasilTersaring.filter(h => h.statusUjian === 'Sedang Dikerjakan').length;
      const totalSelesai = dataHasilTersaring.filter(h => h.statusUjian !== 'Sedang Dikerjakan').length;
      const jamSync = waktuSyncLiveM6
        ? waktuSyncLiveM6.toLocaleTimeString('id-ID', { hour12: false })
        : '-';
      liveBar.classList.remove('dnc-disembunyikan');
      liveBar.innerHTML = `
        <div class="dnc-flex-gap">
          <span class="dnc-dot-live"></span>
          <span>Pemantauan Live Progres Pengerjaan Aktif — Klik Judul Paket untuk melihat daftar siswa</span>
        </div>
        <span>${totalSedang} sedang mengerjakan • ${totalSelesai} sudah mengumpulkan • Sinkron: ${esc(jamSync)}</span>`;
    }
  }

  if (!dataHasilTersaring.length) {
    wadah.innerHTML = `<div class="dnc-kosong-box">${esc(adalahSiswa ? 'Belum ada hasil nilai yang ditampilkan untuk Anda.' : 'Belum ada data hasil ujian yang sesuai filter.')}</div>`;
    return;
  }

  const petaPaket = new Map();
  dataHasilTersaring.forEach(h => {
    const kunci = h.paketId || '__tanpa_paket__';
    if (!petaPaket.has(kunci)) {
      const paketObj = cariInfoPaketHasil(h);
      petaPaket.set(kunci, {
        kunci,
        paketObj,
        mapelId: paketObj?.mapelId || h.mapelId,
        list: []
      });
    }
    petaPaket.get(kunci).list.push(h);
  });

  const urutanPaketId = new Map(stateMemori.paketAsas.map((p, idx) => [p.id, idx]));
  const daftarGrupPaket = [...petaPaket.values()].sort((a, b) => {
    const aAktif = a.list.some(x => x.statusUjian === 'Sedang Dikerjakan') ? 0 : 1;
    const bAktif = b.list.some(x => x.statusUjian === 'Sedang Dikerjakan') ? 0 : 1;
    if (aAktif !== bAktif) return aAktif - bAktif;
    const ia = urutanPaketId.has(a.kunci) ? urutanPaketId.get(a.kunci) : 99999;
    const ib = urutanPaketId.has(b.kunci) ? urutanPaketId.get(b.kunci) : 99999;
    return ia - ib;
  });

  const prioritasStatus = st => (st === 'Sedang Dikerjakan' ? 0 : (st === 'Menunggu Koreksi' ? 1 : 2));
  daftarGrupPaket.forEach(g => {
    g.list.sort((a, b) => {
      const pSel = prioritasStatus(a.statusUjian) - prioritasStatus(b.statusUjian);
      if (pSel !== 0) return pSel;
      const skorSel = Number(b.skorAkhir || 0) - Number(a.skorAkhir || 0);
      if (skorSel !== 0) return skorSel;
      const sa = cariById('pengguna', a.penggunaId)?.namaLengkap || a.penggunaId;
      const sb = cariById('pengguna', b.penggunaId)?.namaLengkap || b.penggunaId;
      return String(sa).localeCompare(String(sb), 'id', { sensitivity: 'base' });
    });
  });

  wadah.innerHTML = daftarGrupPaket.map(g => {
    const terbuka = paketHasilTerbukaM6.has(g.kunci);
    const judulPaket = g.paketObj?.judulPaket || 'Paket ASAS';
    const jmlSedang = g.list.filter(h => h.statusUjian === 'Sedang Dikerjakan').length;
    const jmlKoreksi = g.list.filter(h => h.statusUjian === 'Menunggu Koreksi').length;
    const jmlSelesai = g.list.filter(h => h.statusUjian === 'Selesai').length;
    const jmlSoalPaket = g.paketObj?.daftarSoalIds?.length || 0;
    const kelasSasaranTeks = (g.paketObj?.kelasIds || [])
      .map(id => cariById('kelas', id)?.kodeKelas || id)
      .join(', ');

    const isiTabelHtml = terbuka ? `
      <div class="dnc-grup-halaman-isi">
        <div class="dnc-pembungkus-tabel">
          <table class="dnc-tabel dnc-tabel-padat">
            <thead>
              <tr>
                <th>No</th>
                <th>Peserta Didik</th>
                <th>Kelas / Asal</th>
                <th>Status Ujian</th>
                <th>Progres Soal (Live)</th>
                <th>Skor Otomatis / Manual</th>
                <th>Skor Akhir</th>
                <th>Ketuntasan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${g.list.map((h, idx) => {
                const s = cariById('pengguna', h.penggunaId) || (h.penggunaId === penggunaAktif.id ? penggunaAktif : null);
                const prog = hitungProgresSoalHasil(h, g.paketObj);
                const statusBadge = h.statusUjian === 'Sedang Dikerjakan'
                  ? `<span class="dnc-badge dnc-badge-hijau"><span class="dnc-dot-live"></span>Sedang Dikerjakan</span>`
                  : badgeStatus(h.statusUjian);
                const jmlPel = Number(h.jumlahPelanggaran || 0);
                const logTeks = Array.isArray(h.logPelanggaran) && h.logPelanggaran.length ? h.logPelanggaran.join(' | ') : '';
                const infoKelas = h.kelasId
                  ? esc(cariById('kelas', h.kelasId)?.kodeKelas || '-')
                  : `${esc(h.kelasTeks || s?.kelasTeks || '-')}${h.asalSekolah || s?.asalSekolah ? `<div class="dnc-form-bantuan">${esc(h.asalSekolah || s?.asalSekolah)}</div>` : ''}`;
                const aksiHtml = adalahSiswa
                  ? `<button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-rinci-hasil="${esc(h.id)}">Rincian</button>`
                  : `<div class="dnc-aksi-baris">
                      <button type="button" class="dnc-tombol dnc-tombol-primer dnc-tombol-kecil" data-koreksi-hasil="${esc(h.id)}">Koreksi / Rincian</button>
                      <button type="button" class="dnc-tombol dnc-tombol-bahaya dnc-tombol-kecil" data-reset-hasil="${esc(h.id)}">Reset Sesi</button>
                    </div>`;

                return `
                  <tr>
                    <td data-label="No"><strong>${idx + 1}</strong></td>
                    <td data-label="Peserta Didik">
                      <strong>${esc(s?.namaLengkap || h.penggunaId)}</strong>
                      <div class="dnc-form-bantuan">${esc(s?.nomorInduk || '-')}${s?.role === 'Siswa Bimbel' ? ' • Bimbel' : ''}</div>
                    </td>
                    <td data-label="Kelas / Asal">${infoKelas}</td>
                    <td data-label="Status Ujian">
                      ${statusBadge}
                      ${jmlPel > 0 ? `<div style="margin-top:4px"><span class="dnc-badge dnc-badge-merah" title="${esc(logTeks)}">Keluar Layar: ${esc(jmlPel)}x</span></div>` : ''}
                    </td>
                    <td data-label="Progres Soal (Live)">
                      <div class="dnc-progres-soal-wrap">
                        <div class="dnc-progres-soal-angka">
                          <span class="dnc-progres-dijawab">Dijawab: ${prog.dijawab}/${prog.totalSoal}</span>
                          <span class="dnc-progres-belum ${prog.belum === 0 ? 'habis' : ''}">Belum: ${prog.belum}</span>
                        </div>
                        <div class="dnc-progres-soal-track" title="${prog.persen}% terjawab">
                          <div class="dnc-progres-soal-isi ${prog.belum === 0 && prog.totalSoal > 0 ? 'selesai' : ''}" style="width:${prog.persen}%"></div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Skor Otomatis / Manual">${esc(h.skorPg ?? 0)} / ${esc(h.skorUraian ?? 0)}</td>
                    <td data-label="Skor Akhir"><strong style="font-size:15px">${esc(h.skorAkhir ?? 0)}</strong></td>
                    <td data-label="Ketuntasan">${badgeStatus(h.statusKetuntasan || 'Menunggu Koreksi')}</td>
                    <td class="dnc-sel-aksi">${aksiHtml}</td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>` : '';

    return `
      <div class="dnc-grup-halaman-kartu">
        <div class="dnc-grup-halaman-kepala ${terbuka ? 'terbuka' : ''}">
          <button type="button" class="dnc-grup-halaman-toggle" data-toggle-paket-m6="${esc(g.kunci)}" aria-expanded="${terbuka ? 'true' : 'false'}">
            <div style="min-width:0">
              <div class="dnc-grup-halaman-judul">${esc(judulPaket)}</div>
              <div class="dnc-grup-halaman-meta">
                ${g.paketObj?.modeBimbel ? badgeKategoriSoal(g.paketObj?.kategoriSoal) : ''}
                ${g.paketObj?.modeBimbel ? '<span class="dnc-badge dnc-badge-ungu">Bank Soal Bimbel</span>' : ''}
                <span class="dnc-badge dnc-badge-biru">${esc(namaMapelById(g.mapelId))}</span>
                ${kelasSasaranTeks ? `<span class="dnc-badge dnc-badge-abu">Kelas ${esc(kelasSasaranTeks)}</span>` : ''}
                ${jmlSedang > 0 ? `<span class="dnc-badge dnc-badge-hijau"><span class="dnc-dot-live"></span>${jmlSedang} Sedang Mengerjakan</span>` : ''}
                ${jmlKoreksi > 0 ? `<span class="dnc-badge dnc-badge-amber">${jmlKoreksi} Menunggu Koreksi</span>` : ''}
                <span>${g.list.length} peserta • ${jmlSelesai} selesai${jmlSoalPaket ? ` • ${jmlSoalPaket} soal` : ''}</span>
              </div>
            </div>
            <span class="dnc-grup-halaman-panah">${terbuka ? 'Tutup Daftar Siswa ▴' : 'Lihat Daftar Siswa ▾'}</span>
          </button>
          ${!adalahSiswa ? `
            <div class="dnc-grup-halaman-aksi">
              <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-cetak-paket-m6="${esc(g.kunci)}">Cetak Tabel</button>
            </div>` : ''}
        </div>
        ${isiTabelHtml}
      </div>`;
  }).join('');
}

function bukaModalKoreksiHasil(hasilId, hanyaBaca = false) {
  const hasil = cariById('hasilUjian', hasilId);
  if (!hasil) return;
  const paket = cariInfoPaketHasil(hasil);
  const siswa = cariById('pengguna', hasil.penggunaId) || penggunaAktif;
  const mapel = cariById('mataPelajaran', hasil.mapelId);
  const kkm = Number(mapel?.kkm ?? 75);

  const daftarSoalPaket = (paket?.daftarSoalIds || []).map(id => cariById('bankSoal', id)).filter(Boolean);
  const totalBobotPaket = bulatDua(daftarSoalPaket.reduce((s, x) => s + poinEfektifSoal(x), 0));

  const itemsHtml = (hasil.jawabanSiswa || []).map((j, idx) => {
    const soal = cariById('bankSoal', j.soalId);
    if (!soal) return '';
    const poinMaks = poinEfektifSoal(soal);

    if (soal.tipeSoal === 'Pilihan Ganda' || soal.tipeSoal === 'Pilihan Ganda Kompleks' || soal.tipeSoal === 'Benar/Salah') {
      const skorButir = hitungSkorButirOtomatis(soal, j.jawaban);
      const badgeNilai = skorButir >= poinMaks
        ? badgeStatus(`Benar (+${skorButir}/${poinMaks})`)
        : (skorButir > 0 ? `<span class="dnc-badge dnc-badge-amber">Parsial (+${skorButir}/${poinMaks})</span>` : badgeStatus('Salah (0)'));
      const urlGbrKoreksi = normalisasiUrlGambarSoal(soal.urlGambar || '');
      const labelJawaban = soal.tipeSoal === 'Benar/Salah' ? 'Jawaban Siswa' : 'Jawaban Siswa (kode asli)';
      return `
        <div class="dnc-koreksi-item">
          <div class="dnc-koreksi-header">
            <strong>Soal #${idx + 1} (${esc(soal.kodeSoal)}) — ${esc(soal.tipeSoal)}</strong>
            ${badgeNilai}
          </div>
          <div style="font-size:13px;margin-bottom:6px;white-space:pre-wrap">${esc(soal.pertanyaan)}</div>
          ${urlGbrKoreksi ? `<img src="${esc(urlGbrKoreksi)}" alt="Gambar soal" class="dnc-soal-gambar" style="max-height:180px">` : ''}
          <div class="dnc-form-bantuan">${labelJawaban}: <strong>${esc(j.jawaban || '-')}</strong> | Kunci: <strong>${esc(soal.kunciJawaban)}</strong></div>
        </div>`;
    }

    if (soal.tipeSoal === 'Isian Singkat') {
      const skorButir = typeof j.skor === 'number' && j.skor <= poinMaks
        ? j.skor
        : hitungSkorButirOtomatis(soal, j.jawaban);
      return `
        <div class="dnc-koreksi-item">
          <div class="dnc-koreksi-header">
            <strong>Soal #${idx + 1} (${esc(soal.kodeSoal)}) — Isian Singkat (Poin Maks ${esc(poinMaks)})</strong>
            ${badgeStatus(skorButir >= poinMaks ? `Benar (+${skorButir}/${poinMaks})` : (skorButir > 0 ? `Parsial (+${skorButir}/${poinMaks})` : 'Perlu Cek (0)'))}
          </div>
          <div style="font-size:13px">${esc(soal.pertanyaan)}</div>
          <div class="dnc-jawaban-box"><strong>Jawaban Siswa:</strong> ${esc(j.jawaban || '(Tidak dijawab)')}</div>
          <div class="dnc-form-bantuan dnc-mb-12"><strong>Kunci Isian:</strong> ${esc(soal.kunciJawaban || '-')}</div>
          ${!hanyaBaca ? `
            <div class="dnc-form-grup" style="margin-bottom:0">
              <label class="dnc-label" for="skor-manual-${esc(soal.id)}">Penyesuaian Poin Isian (0 – ${esc(poinMaks)})</label>
              <input id="skor-manual-${esc(soal.id)}" data-koreksi-soal="${esc(soal.id)}" data-tipe="Isian Singkat" data-maks="${esc(poinMaks)}" class="dnc-input" type="number" min="0" max="${esc(poinMaks)}" step="0.5" value="${esc(skorButir)}">
            </div>` : ''}
        </div>`;
    }

    const skorUraianTampil = Math.min(poinMaks, Math.max(0, Number(j.skor ?? 0)));
    return `
      <div class="dnc-koreksi-item">
        <div class="dnc-koreksi-header">
          <strong>Soal #${idx + 1} (${esc(soal.kodeSoal)}) — Uraian (Poin Maks ${esc(poinMaks)})</strong>
          <span class="dnc-badge dnc-badge-amber">Koreksi Manual</span>
        </div>
        <div style="font-size:13px">${esc(soal.pertanyaan)}</div>
        <div class="dnc-jawaban-box"><strong>Jawaban Siswa:</strong>\n${esc(j.jawaban || '(Tidak dijawab)')}</div>
        ${!hanyaBaca ? `<div class="dnc-form-bantuan dnc-mb-12"><strong>Rubrik/Kunci:</strong> ${esc(soal.kunciJawaban || '-')}</div>` : ''}
        <div class="dnc-form-grup" style="margin-bottom:0">
          <label class="dnc-label" for="skor-manual-${esc(soal.id)}">Poin Uraian (0 – ${esc(poinMaks)})</label>
          <input id="skor-manual-${esc(soal.id)}" data-koreksi-soal="${esc(soal.id)}" data-tipe="Uraian" data-maks="${esc(poinMaks)}" class="dnc-input" type="number" min="0" max="${esc(poinMaks)}" step="0.5" value="${esc(skorUraianTampil)}" ${hanyaBaca ? 'disabled' : ''}>
        </div>
      </div>`;
  }).join('');

  bukaModalFormDnc({
    judul: hanyaBaca ? 'Rincian Hasil Ruang Asesmen Digital (RAD)' : 'Koreksi & Rincian Lembar Jawaban RAD',
    lebar: true,
    tampilSimpan: !hanyaBaca,
    labelSimpan: 'Simpan Koreksi & Hitung Nilai',
    labelBatal: hanyaBaca ? 'Tutup' : 'Batal',
    htmlKonten: `
      <div class="dnc-pratinjau-soal dnc-mb-12">
        <strong>${esc(siswa?.namaLengkap || '-')} (${esc(siswa?.nomorInduk || '-')})</strong>
        <div class="dnc-form-bantuan">${esc(paket?.judulPaket || '-')} • ${esc(mapel?.namaMapel || '-')} (KKM: ${kkm}) • Total Poin Maks Paket: ${totalBobotPaket}</div>
        <div class="dnc-form-bantuan">Perolehan Otomatis (PG/PGK/BS/Isian): ${esc(hasil.skorPg)} | Poin Uraian: ${esc(hasil.skorUraian)} | Nilai Akhir: <strong>${esc(hasil.skorAkhir)}</strong> (${esc(hasil.statusKetuntasan)})</div>
      </div>
      ${itemsHtml}
      <div class="dnc-form-grup dnc-mt-12">
        <label class="dnc-label" for="f-catatan-koreksi">Catatan Koreksi Guru / Admin</label>
        <textarea id="f-catatan-koreksi" class="dnc-textarea" placeholder="Tambahkan catatan umpan balik (opsional)" ${hanyaBaca ? 'disabled' : ''}>${esc(hasil.catatanKoreksi || '')}</textarea>
      </div>`,
    onSubmit: async () => {
      let skorPg = 0;
      let skorUraian = 0;
      const jawabanBaru = (hasil.jawabanSiswa || []).map(j => {
        const soal = cariById('bankSoal', j.soalId);
        const inp = document.querySelector(`[data-koreksi-soal="${j.soalId}"]`);
        if (inp) {
          const maks = Number(inp.dataset.maks || 0);
          const val = Number(inp.value);
          if (isNaN(val) || val < 0 || val > maks) {
            throw new Error(`Poin koreksi harus berada di rentang 0 sampai ${maks}.`);
          }
          if (inp.dataset.tipe === 'Uraian') skorUraian = bulatDua(skorUraian + val);
          else skorPg = bulatDua(skorPg + val);
          return { ...j, skor: val };
        }
        const nilaiButir = soal ? hitungSkorButirOtomatis(soal, j.jawaban) : Number(j.skor || 0);
        skorPg = bulatDua(skorPg + nilaiButir);
        return { ...j, skor: nilaiButir };
      });

      const skorAkhir = totalBobotPaket > 0 ? bulatDua(((skorPg + skorUraian) / totalBobotPaket) * 100) : 0;
      const statusKetuntasan = skorAkhir >= kkm ? 'Tuntas' : 'Belum Tuntas';
      const catatanKoreksi = document.getElementById('f-catatan-koreksi').value.trim();

      await dbUpdate(COLLECTIONS.hasilUjian, hasil.id, {
        jawabanSiswa: jawabanBaru,
        skorPg,
        skorUraian,
        skorAkhir,
        statusUjian: 'Selesai',
        statusKetuntasan,
        catatanKoreksi,
        dikoreksiOleh: penggunaAktif.id
      });

      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M6']);
      await muatM6HasilNilai(true);
      tampilkanToast(`Koreksi tersimpan. Nilai akhir: ${skorAkhir} (${statusKetuntasan}).`);
    }
  });
}

function resetSesiHasilUjian(hasilId) {
  const h = cariById('hasilUjian', hasilId);
  if (!h) return;
  const siswa = cariById('pengguna', h.penggunaId);
  bukaKonfirmasi({
    judul: 'Reset Sesi Ujian Peserta Didik',
    pesan: `Menghapus rekaman sesi ujian milik ${siswa?.namaLengkap || h.penggunaId} agar dapat mengulang ujian kembali. Lanjutkan?`,
    labelYa: 'Ya, Reset Sesi',
    onYa: async () => {
      await dbDelete(COLLECTIONS.hasilUjian, hasilId);
      resetCacheMenu(['DNC-M1', 'DNC-M5', 'DNC-M6']);
      await muatM6HasilNilai(true);
      tampilkanToast('Sesi ujian berhasil direset.');
    }
  });
}

function analisisNomorBenarSalahHasil(hasil, daftarSoalIdsKanonik) {
  const petaJwb = new Map();
  (hasil?.jawabanSiswa || []).forEach(j => {
    if (j?.soalId) petaJwb.set(j.soalId, j);
  });

  const ids = (Array.isArray(daftarSoalIdsKanonik) && daftarSoalIdsKanonik.length)
    ? daftarSoalIdsKanonik
    : (Array.isArray(hasil?.urutanSoalIds) && hasil.urutanSoalIds.length
      ? hasil.urutanSoalIds
      : (hasil?.jawabanSiswa || []).map(j => j.soalId));

  const benar = [];
  const salah = [];

  ids.forEach((soalId, idx) => {
    const no = idx + 1;
    const soal = cariById('bankSoal', soalId);
    const j = petaJwb.get(soalId);
    const bobot = poinEfektifSoal(soal);
    let skorButir = 0;

    if (j) {
      if (soal && soal.tipeSoal !== 'Uraian') {
        skorButir = hasil?.statusUjian !== 'Sedang Dikerjakan' && typeof j.skor === 'number' && j.skor <= bobot
          ? j.skor
          : hitungSkorButirOtomatis(soal, j.jawaban);
      } else {
        skorButir = Number(j.skor || 0);
      }
    }

    if (bobot > 0 && skorButir >= bobot) {
      benar.push(String(no));
    } else if (bobot > 0 && skorButir > 0) {
      salah.push(`${no} (parsial)`);
    } else {
      salah.push(String(no));
    }
  });

  return {
    totalSoal: ids.length,
    benar,
    salah
  };
}

function cetakRekapTabelPaketM6(paketIdTarget = '') {
  const sumber = paketIdTarget
    ? dataHasilTersaring.filter(h => h.paketId === paketIdTarget)
    : [...dataHasilTersaring];

  if (!sumber.length) {
    tampilkanToast('Tidak ada data hasil ujian untuk dicetak.', 'error');
    return;
  }

  const petaGrup = new Map();
  sumber.forEach(h => {
    const kunci = h.paketId || '__tanpa_paket__';
    if (!petaGrup.has(kunci)) {
      const paketObj = cariInfoPaketHasil(h);
      petaGrup.set(kunci, { kunci, paketObj, mapelId: paketObj?.mapelId || h.mapelId, list: [] });
    }
    petaGrup.get(kunci).list.push(h);
  });

  const waktuCetak = formatTanggal(new Date(), true);
  const namaPencetak = penggunaAktif?.namaLengkap || '-';

  const blokPaketHtml = [...petaGrup.values()].map((g, gIdx) => {
    const judulPaket = g.paketObj?.judulPaket || 'Paket ASAS';
    const namaMapel = namaMapelById(g.mapelId);
    const kelasSasaran = (g.paketObj?.kelasIds || []).map(id => cariById('kelas', id)?.kodeKelas || id).join(', ');
    const daftarSoalIds = g.paketObj?.daftarSoalIds || [];

    // Otomatis urut dari nilai tertinggi ke nilai terendah
    const barisUrut = [...g.list].sort((a, b) => {
      const selNilai = Number(b.skorAkhir || 0) - Number(a.skorAkhir || 0);
      if (selNilai !== 0) return selNilai;
      const na = cariById('pengguna', a.penggunaId)?.namaLengkap || a.penggunaId;
      const nb = cariById('pengguna', b.penggunaId)?.namaLengkap || b.penggunaId;
      return String(na).localeCompare(String(nb), 'id', { sensitivity: 'base' });
    });

    const nilaiList = barisUrut.map(x => Number(x.skorAkhir || 0));
    const rata = nilaiList.length ? bulatDua(nilaiList.reduce((s, n) => s + n, 0) / nilaiList.length) : 0;
    const tertinggi = nilaiList.length ? Math.max(...nilaiList) : 0;
    const terendah = nilaiList.length ? Math.min(...nilaiList) : 0;

    const rowsHtml = barisUrut.map((h, idx) => {
      const s = cariById('pengguna', h.penggunaId);
      const kelasTeks = h.kelasId
        ? (cariById('kelas', h.kelasId)?.kodeKelas || '-')
        : `${h.kelasTeks || s?.kelasTeks || '-'}${h.asalSekolah || s?.asalSekolah ? ` — ${h.asalSekolah || s?.asalSekolah}` : ''}`;
      const analisis = analisisNomorBenarSalahHasil(h, daftarSoalIds);
      const teksBenar = analisis.benar.length ? analisis.benar.join(', ') : '-';
      const teksSalah = analisis.salah.length ? analisis.salah.join(', ') : '-';
      return `
        <tr>
          <td class="t-center">${idx + 1}</td>
          <td>
            <strong>${esc(s?.namaLengkap || h.penggunaId)}</strong>
            <div class="sub-info">${esc(s?.nomorInduk || '-')} • ${esc(kelasTeks)}</div>
          </td>
          <td class="t-center"><strong>${esc(h.skorAkhir ?? 0)}</strong></td>
          <td>
            <div class="jml-info">Benar: ${analisis.benar.length} dari ${analisis.totalSoal}</div>
            <div>No: ${esc(teksBenar)}</div>
          </td>
          <td>
            <div class="jml-info">Salah/Belum: ${analisis.salah.length} dari ${analisis.totalSoal}</div>
            <div>No: ${esc(teksSalah)}</div>
          </td>
        </tr>`;
    }).join('');

    return `
      <section class="paket-cetak ${gIdx > 0 ? 'page-break' : ''}">
        <header class="kop-cetak">
          <h1>REKAPITULASI NILAI &amp; ANALISIS BUTIR JAWABAN — RUANG ASESMEN DIGITAL (RAD)</h1>
          <h2>${esc(judulPaket)}</h2>
          <p>
            <strong>Belajar, Berlatih, Berprestasi</strong> | Mata Pelajaran: <strong>${esc(namaMapel)}</strong>
            ${g.paketObj?.modeBimbel ? ` | Kategori: <strong>${esc(normalisasiKategoriSoal(g.paketObj?.kategoriSoal))} (Bimbel)</strong>` : ''}
            ${kelasSasaran ? ` | Kelas: <strong>${esc(kelasSasaran)}</strong>` : ''}
            | Jumlah Soal: <strong>${daftarSoalIds.length || '-'}</strong>
          </p>
          <p class="meta-cetak">
            Peserta: ${barisUrut.length} | Rata-rata: ${rata} | Tertinggi: ${tertinggi} | Terendah: ${terendah} | Diurutkan: Nilai Tertinggi ke Terendah
          </p>
        </header>
        <table>
          <thead>
            <tr>
              <th style="width:44px" class="t-center">No</th>
              <th style="width:24%">Nama Siswa</th>
              <th style="width:72px" class="t-center">Nilai</th>
              <th style="width:32%">Nomor Soal Benar</th>
              <th style="width:32%">Nomor Soal Salah</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <footer class="kaki-cetak">
          <span>Dicetak pada ${esc(waktuCetak)} oleh ${esc(namaPencetak)}</span>
          <span>DigitalNetCare@copyright</span>
        </footer>
      </section>`;
  }).join('');

  const dokumenHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Rekap Nilai Tabel Per Paket - DigitalNetCare</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0F172A; font-size: 11px; line-height: 1.45; margin: 0; padding: 14px; background: #FFFFFF; }
    .bar-aksi { margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #CBD5E1; display: flex; gap: 8px; justify-content: flex-end; }
    .btn-cetak { padding: 7px 14px; border: 1px solid #2563EB; background: #2563EB; color: #FFFFFF; font-weight: 700; border-radius: 6px; cursor: pointer; font-size: 12px; }
    .btn-tutup { padding: 7px 14px; border: 1px solid #CBD5E1; background: #FFFFFF; color: #0F172A; font-weight: 700; border-radius: 6px; cursor: pointer; font-size: 12px; }
    .kop-cetak { text-align: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #0F172A; }
    .kop-cetak h1 { font-size: 15px; margin: 0 0 3px; letter-spacing: 0.03em; }
    .kop-cetak h2 { font-size: 13px; margin: 0 0 4px; color: #1E40AF; }
    .kop-cetak p { margin: 2px 0; font-size: 11px; }
    .meta-cetak { color: #475569; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #334155; padding: 6px 8px; vertical-align: top; text-align: left; word-break: break-word; }
    thead th { background: #F1F5F9; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; }
    .t-center { text-align: center; }
    .sub-info { font-size: 10px; color: #475569; margin-top: 2px; }
    .jml-info { font-size: 10px; font-weight: 700; color: #334155; margin-bottom: 2px; }
    .kaki-cetak { margin-top: 12px; padding-top: 6px; border-top: 1px solid #CBD5E1; display: flex; justify-content: space-between; font-size: 10px; color: #475569; }
    .page-break { page-break-before: always; margin-top: 20px; }
    @media print {
      body { padding: 0; }
      .bar-aksi { display: none !important; }
      .page-break { margin-top: 0; }
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="bar-aksi">
    <button type="button" class="btn-cetak" onclick="window.print()">Cetak / Simpan PDF Tabel</button>
    <button type="button" class="btn-tutup" onclick="window.close()">Tutup</button>
  </div>
  ${blokPaketHtml}
  <script>window.addEventListener('load',function(){setTimeout(function(){window.print();},250);});<\/script>
</body>
</html>`;

  const jendela = window.open('', '_blank', 'width=1100,height=760');
  if (jendela) {
    jendela.document.open();
    jendela.document.write(dokumenHtml);
    jendela.document.close();
    return;
  }

  // Fallback jika browser memblokir popup: cetak lewat iframe tersembunyi
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(dokumenHtml);
  iframe.contentDocument.close();
  setTimeout(() => {
    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (_) {}
    setTimeout(() => iframe.remove(), 2000);
  }, 300);
}

function eksporRekapNilaiCsv() {
  if (!dataHasilTersaring.length) {
    tampilkanToast('Tidak ada data hasil ujian untuk diekspor.', 'error');
    return;
  }
  const header = ['NomorInduk', 'NamaLengkap', 'KelasAtauAsal', 'PaketSoal', 'MataPelajaran', 'StatusUjian', 'PerolehanOtomatis', 'PoinUraian', 'NilaiAkhir', 'Ketuntasan'];
  const qCsv = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const baris = [header.join(',')];
  dataHasilTersaring.forEach(h => {
    const s = cariById('pengguna', h.penggunaId);
    const p = cariInfoPaketHasil(h);
    const k = cariById('kelas', h.kelasId);
    const infoKelas = k ? k.kodeKelas : `${h.kelasTeks || s?.kelasTeks || ''}${h.asalSekolah || s?.asalSekolah ? ` (${h.asalSekolah || s?.asalSekolah})` : ''}`;
    baris.push([
      s?.nomorInduk || '', s?.namaLengkap || '', infoKelas,
      p?.judulPaket || '', namaMapelById(h.mapelId), h.statusUjian || '',
      h.skorPg ?? 0, h.skorUraian ?? 0, h.skorAkhir ?? 0, h.statusKetuntasan || ''
    ].map(qCsv).join(','));
  });
  unduhBlobFile(new Blob([baris.join('\n')], { type: 'text/csv;charset=utf-8' }), `Rekap_Nilai_RAD_${formatTanggal(new Date()).replace(/\//g, '-')}.csv`);
  tampilkanToast('Rekap nilai CSV Ruang Asesmen Digital (RAD) berhasil diunduh.');
}
// ===== AKHIR BLOK: DNC_M6_HASIL_NILAI =====

// ===== BLOK: DNC_M7_PENGGUNA =====
async function muatM7Pengguna(paksa = false) {
  if (!sudahDimuat['DNC-M7'] || paksa) {
    await Promise.all([muatDataDasar(), muatDataPengguna()]);
    sudahDimuat['DNC-M7'] = true;
  }
  isiSelectOpsi('filter-kelas-pengguna', stateMemori.kelas.map(k => ({ value: k.id, label: `${k.kodeKelas} - ${k.namaKelas}` })), 'Semua Kelas');
  isiSelectOpsi('filter-mapel-pengguna', stateMemori.mataPelajaran.map(m => ({ value: m.id, label: m.namaMapel })), 'Semua Mapel Ampu');
  renderTabelPengguna();
}

const kelasSiswaTerbukaM7 = new Set();
let siswaBimbelTerbukaM7 = false;

function toggleKelasSiswaM7(kunciKelas) {
  if (!kunciKelas) return;
  if (kelasSiswaTerbukaM7.has(kunciKelas)) kelasSiswaTerbukaM7.delete(kunciKelas);
  else kelasSiswaTerbukaM7.add(kunciKelas);
  renderTabelPengguna();
}

function toggleSiswaBimbelM7() {
  siswaBimbelTerbukaM7 = !siswaBimbelTerbukaM7;
  renderTabelPengguna();
}

function terimaPendaftarSiswaBimbel(id) {
  const u = cariById('pengguna', id);
  if (!u) return;
  bukaKonfirmasi({
    judul: 'Terima Pendaftaran Siswa Bimbel',
    pesan: `Terima pendaftaran atas nama ${u.namaLengkap} (${u.email})? Sistem akan mengaktifkan akun, membuat kata sandi sementara 8 karakter, dan mengirimkannya secara otomatis ke Gmail siswa.`,
    labelYa: 'Ya, Terima & Kirim Sandi Otomatis',
    kelasTombol: 'dnc-tombol-sukses',
    onYa: async () => {
      const sandiSementara = buatSandiSementaraBimbel(8);
      const passwordHash = await hashTeks(sandiSementara);
      const waktuDiterima = new Date().toISOString();

      await dbUpdate(COLLECTIONS.pengguna, id, {
        statusAktif: true,
        statusPendaftaran: 'Diterima',
        tanggalDiterima: waktuDiterima,
        diterimaOleh: penggunaAktif?.namaLengkap || penggunaAktif?.id || 'Admin',
        passwordHash
      });

      const hasilKirim = await kirimEmailSandiBimbelOtomatis({
        email: u.email,
        namaLengkap: u.namaLengkap,
        sandiSementara,
        asalSekolah: u.asalSekolah || '',
        kelasTeks: u.kelasTeks || ''
      });

      siswaBimbelTerbukaM7 = true;
      resetCacheMenu(['DNC-M1', 'DNC-M6', 'DNC-M7']);
      await muatM7Pengguna(true);

      if (hasilKirim.terkirim) {
        tampilkanToast(`Siswa Bimbel ${u.namaLengkap} diterima. Kata sandi sementara telah terkirim otomatis ke ${u.email}.`);
      } else {
        tampilkanToast(`Akun ${u.namaLengkap} sudah aktif (Sandi: ${sandiSementara}), tetapi email otomatis gagal: ${hasilKirim.pesan}`, 'error');
      }
    }
  });
}

function tolakPendaftarSiswaBimbel(id) {
  const u = cariById('pengguna', id);
  if (!u) return;
  bukaKonfirmasi({
    judul: 'Tolak Pendaftaran Siswa Bimbel',
    pesan: `Yakin ingin menolak dan menghapus pendaftaran milik ${u.namaLengkap} (${u.email})?`,
    labelYa: 'Ya, Tolak & Hapus',
    onYa: async () => {
      await dbDelete(COLLECTIONS.pengguna, id);
      resetCacheMenu(['DNC-M1', 'DNC-M7']);
      await muatM7Pengguna(true);
      tampilkanToast(`Pendaftaran ${u.namaLengkap} telah ditolak dan dihapus.`, 'info');
    }
  });
}

function renderTabelPengguna() {
  const wadah = document.getElementById('wadah-pengguna-m7');
  if (!wadah) return;

  const q = teks(document.getElementById('cari-pengguna')?.value || '');
  const fRole = document.getElementById('filter-role-pengguna')?.value || '';
  const fKelas = document.getElementById('filter-kelas-pengguna')?.value || '';
  const fMapel = document.getElementById('filter-mapel-pengguna')?.value || '';
  const fStatus = document.getElementById('filter-status-pengguna')?.value || '';

  const data = stateMemori.pengguna.filter(u => {
    const roleNorm = normalisasiRoleDnc(u.role);
    if (fRole && roleNorm !== fRole) return false;
    if (fKelas) {
      const cocokKelasSiswa = u.kelasId === fKelas;
      const cocokKelasGuru = adalahRoleGuru(roleNorm) && Array.isArray(u.kelasIds) && u.kelasIds.includes(fKelas);
      if (!cocokKelasSiswa && !cocokKelasGuru) return false;
    }
    if (fMapel && !(u.mapelIds || []).includes(fMapel)) return false;
    if (fStatus === 'aktif' && u.statusAktif === false) return false;
    if (fStatus === 'nonaktif' && u.statusAktif !== false) return false;
    const teksKelas = roleNorm === 'Siswa'
      ? teks(namaKelasById(u.kelasId))
      : (adalahRoleGuru(roleNorm)
        ? teks((u.kelasIds || []).map(id => namaKelasById(id)).join(' '))
        : teks(u.kelasTeks || ''));
    const teksSekolah = teks(u.asalSekolah || '');
    if (q && !`${teks(u.namaLengkap)} ${teks(u.nomorInduk)} ${teks(u.email)} ${teksKelas} ${teksSekolah}`.includes(q)) return false;
    return true;
  });

  if (!data.length) {
    wadah.innerHTML = '<div class="dnc-kosong-box">Belum ada data pengguna yang sesuai filter.</div>';
    return;
  }

  const nonSiswa = data
    .filter(u => !adalahRoleSiswa(normalisasiRoleDnc(u.role)))
    .sort((a, b) => {
      const urutRole = r => (r === 'Admin' ? 0 : (r === 'Guru' ? 1 : 2));
      const selRole = urutRole(normalisasiRoleDnc(a.role)) - urutRole(normalisasiRoleDnc(b.role));
      return selRole !== 0 ? selRole : teks(a.namaLengkap).localeCompare(teks(b.namaLengkap));
    });

  const siswaList = data.filter(u => normalisasiRoleDnc(u.role) === 'Siswa');
  const siswaBimbelList = data.filter(u => normalisasiRoleDnc(u.role) === 'Siswa Bimbel');
  let htmlBagian = '';

  if (nonSiswa.length) {
    htmlBagian += `
      <div class="dnc-subbagian-judul">
        <span>Akun Admin, Guru &amp; Guru Bimbel</span>
        <span class="dnc-badge dnc-badge-abu">${nonSiswa.length} akun</span>
      </div>
      <div class="dnc-pembungkus-tabel dnc-mb-12">
        <table class="dnc-tabel">
          <thead>
            <tr>
              <th>Nomor Induk</th>
              <th>Nama Lengkap</th>
              <th>Email</th>
              <th>Role</th>
              <th>Mapel &amp; Kelas Ampu</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${nonSiswa.map(u => {
              const r = normalisasiRoleDnc(u.role);
              const mapelTeks = (u.mapelIds || []).map(id => namaMapelById(id)).join(', ') || '-';
              const kelasAmpuTeks = (u.kelasIds || []).map(id => cariById('kelas', id)?.kodeKelas || id).join(', ');
              const cakupan = adalahRoleGuru(r)
                ? `${esc(mapelTeks)}<div class="dnc-form-bantuan">Kelas Ampu: ${kelasAmpuTeks ? esc(kelasAmpuTeks) : 'Semua Kelas'}</div>`
                : '<span class="dnc-teks-muted">Semua Cakupan</span>';
              const badgeCls = r === 'Guru Bimbel' ? 'dnc-badge-ungu' : 'dnc-badge-biru';
              return `
                <tr>
                  <td data-label="Nomor Induk"><span class="dnc-mono">${esc(u.nomorInduk)}</span></td>
                  <td data-label="Nama Lengkap"><strong>${esc(u.namaLengkap)}</strong></td>
                  <td data-label="Email">${esc(u.email)}</td>
                  <td data-label="Role"><span class="dnc-badge ${badgeCls}">${esc(r)}</span></td>
                  <td data-label="Mapel Ampu / Cakupan">${cakupan}</td>
                  <td data-label="Status">${badgeStatus(u.statusAktif !== false ? 'Aktif' : 'Nonaktif')}</td>
                  <td class="dnc-sel-aksi">
                    <div class="dnc-aksi-baris">
                      <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-ubah-user="${esc(u.id)}">Ubah</button>
                      <button type="button" class="dnc-tombol ${u.statusAktif !== false ? 'dnc-tombol-bahaya' : 'dnc-tombol-sukses'} dnc-tombol-kecil" data-toggle-user="${esc(u.id)}">${u.statusAktif !== false ? 'Nonaktifkan' : 'Aktifkan'}</button>
                    </div>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }

  if (siswaList.length) {
    const petaKelas = new Map();
    siswaList.forEach(u => {
      const kelasObj = u.kelasId ? cariById('kelas', u.kelasId) : null;
      const kunciKelas = kelasObj ? kelasObj.id : '__tanpa_kelas__';
      if (!petaKelas.has(kunciKelas)) {
        petaKelas.set(kunciKelas, { kunciKelas, kelasObj, list: [] });
      }
      petaKelas.get(kunciKelas).list.push(u);
    });

    const urutanKelasId = new Map(stateMemori.kelas.map((k, idx) => [k.id, idx]));
    const daftarGrupKelas = [...petaKelas.values()].sort((a, b) => {
      const ia = urutanKelasId.has(a.kunciKelas) ? urutanKelasId.get(a.kunciKelas) : 99999;
      const ib = urutanKelasId.has(b.kunciKelas) ? urutanKelasId.get(b.kunciKelas) : 99999;
      return ia - ib;
    });

    daftarGrupKelas.forEach(g => {
      g.list.sort((a, b) =>
        String(a.namaLengkap || '').localeCompare(String(b.namaLengkap || ''), 'id', { sensitivity: 'base' }) ||
        String(a.nomorInduk || '').localeCompare(String(b.nomorInduk || ''), undefined, { numeric: true })
      );
    });

    htmlBagian += `
      <div class="dnc-subbagian-judul">
        <span>Akun Siswa Ruang Asesmen Digital (RAD) Berdasarkan Kelas (Klik kelas untuk melihat data siswa)</span>
        <span class="dnc-badge dnc-badge-biru">${daftarGrupKelas.length} kelas • ${siswaList.length} siswa</span>
      </div>
      <div class="dnc-grup-halaman-list dnc-mb-12">
        ${daftarGrupKelas.map(g => {
          const terbuka = kelasSiswaTerbukaM7.has(g.kunciKelas);
          const judulKelas = g.kelasObj
            ? `${g.kelasObj.kodeKelas} — ${g.kelasObj.namaKelas}`
            : 'Belum Ditempatkan di Kelas';
          const jmlAktif = g.list.filter(s => s.statusAktif !== false).length;

          const tabelSiswaHtml = terbuka ? `
            <div class="dnc-grup-halaman-isi">
              <div class="dnc-pembungkus-tabel">
                <table class="dnc-tabel dnc-tabel-padat">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nomor Induk</th>
                      <th>Nama Lengkap</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${g.list.map((u, idx) => `
                      <tr>
                        <td data-label="No"><strong>${idx + 1}</strong></td>
                        <td data-label="Nomor Induk"><span class="dnc-mono">${esc(u.nomorInduk)}</span></td>
                        <td data-label="Nama Lengkap"><strong>${esc(u.namaLengkap)}</strong></td>
                        <td data-label="Email">${esc(u.email)}</td>
                        <td data-label="Status">${badgeStatus(u.statusAktif !== false ? 'Aktif' : 'Nonaktif')}</td>
                        <td class="dnc-sel-aksi">
                          <div class="dnc-aksi-baris">
                            <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-ubah-user="${esc(u.id)}">Ubah</button>
                            <button type="button" class="dnc-tombol ${u.statusAktif !== false ? 'dnc-tombol-bahaya' : 'dnc-tombol-sukses'} dnc-tombol-kecil" data-toggle-user="${esc(u.id)}">${u.statusAktif !== false ? 'Nonaktifkan' : 'Aktifkan'}</button>
                          </div>
                        </td>
                      </tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </div>` : '';

          return `
            <div class="dnc-grup-halaman-kartu">
              <div class="dnc-grup-halaman-kepala ${terbuka ? 'terbuka' : ''}">
                <button type="button" class="dnc-grup-halaman-toggle" data-toggle-kelas-m7="${esc(g.kunciKelas)}" aria-expanded="${terbuka ? 'true' : 'false'}">
                  <div style="min-width:0">
                    <div class="dnc-grup-halaman-judul">${esc(judulKelas)}</div>
                    <div class="dnc-grup-halaman-meta">
                      ${g.kelasObj?.tingkat ? `<span class="dnc-badge dnc-badge-biru">${esc(labelTingkat(g.kelasObj.tingkat))}</span>` : ''}
                      <span class="dnc-badge dnc-badge-abu">${g.list.length} siswa</span>
                      <span>Aktif ${jmlAktif}/${g.list.length}</span>
                      ${g.kelasObj?.waliKelas ? `<span>• Wali Kelas: ${esc(g.kelasObj.waliKelas)}</span>` : ''}
                      ${g.kelasObj?.tahunAjaran ? `<span>• ${esc(g.kelasObj.tahunAjaran)}</span>` : ''}
                    </div>
                  </div>
                  <span class="dnc-grup-halaman-panah">${terbuka ? 'Tutup Data Siswa ▴' : 'Lihat Data Siswa ▾'}</span>
                </button>
              </div>
              ${tabelSiswaHtml}
            </div>`;
        }).join('')}
      </div>`;
  }

  if (siswaBimbelList.length || fRole === 'Siswa Bimbel') {
    const pendaftarBaru = siswaBimbelList
      .filter(u => u.statusPendaftaran === 'Menunggu')
      .sort((a, b) => (keDate(b.tanggalDaftar || b.dibuat)?.getTime() || 0) - (keDate(a.tanggalDaftar || a.dibuat)?.getTime() || 0));

    const bimbelDiterima = siswaBimbelList
      .filter(u => u.statusPendaftaran !== 'Menunggu')
      .sort((a, b) => (keDate(b.tanggalDiterima || b.dibuat)?.getTime() || 0) - (keDate(a.tanggalDiterima || a.dibuat)?.getTime() || 0));

    const isiBimbelHtml = siswaBimbelTerbukaM7 ? `
      <div class="dnc-grup-halaman-isi">
        <div class="dnc-subbagian-judul" style="margin-top:0">
          <span>Pendaftar Baru Siswa Bimbel (Perlu Eksekusi Terima)</span>
          <span class="dnc-badge ${pendaftarBaru.length ? 'dnc-badge-amber' : 'dnc-badge-abu'}">${pendaftarBaru.length} menunggu</span>
        </div>
        ${pendaftarBaru.length ? `
          <div class="dnc-pembungkus-tabel dnc-mb-12">
            <table class="dnc-tabel dnc-tabel-padat">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Lengkap</th>
                  <th>Asal Sekolah</th>
                  <th>Kelas</th>
                  <th>Email Gmail</th>
                  <th>Tanggal Daftar</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${pendaftarBaru.map((u, idx) => `
                  <tr>
                    <td data-label="No"><strong>${idx + 1}</strong></td>
                    <td data-label="Nama Lengkap"><strong>${esc(u.namaLengkap)}</strong><div class="dnc-form-bantuan">${esc(u.nomorInduk || '-')}</div></td>
                    <td data-label="Asal Sekolah">${esc(u.asalSekolah || '-')}</td>
                    <td data-label="Kelas">${esc(u.kelasTeks || '-')}</td>
                    <td data-label="Email Gmail">${esc(u.email)}</td>
                    <td data-label="Tanggal Daftar">${esc(formatTanggal(u.tanggalDaftar || u.dibuat, true))}</td>
                    <td class="dnc-sel-aksi">
                      <div class="dnc-aksi-baris">
                        <button type="button" class="dnc-tombol dnc-tombol-sukses dnc-tombol-kecil" data-terima-bimbel="${esc(u.id)}">Terima</button>
                        <button type="button" class="dnc-tombol dnc-tombol-bahaya dnc-tombol-kecil" data-tolak-bimbel="${esc(u.id)}">Tolak</button>
                      </div>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>` : '<div class="dnc-kosong-box dnc-mb-12" style="padding:14px">Tidak ada pendaftar baru Siswa Bimbel yang menunggu persetujuan.</div>'}

        <div class="dnc-subbagian-judul">
          <span>Daftar Siswa Bimbel (Sudah Diterima)</span>
          <span class="dnc-badge dnc-badge-hijau">${bimbelDiterima.length} siswa</span>
        </div>
        ${bimbelDiterima.length ? `
          <div class="dnc-pembungkus-tabel">
            <table class="dnc-tabel dnc-tabel-padat">
              <thead>
                <tr>
                  <th>No</th>
                  <th>ID / Nomor Induk</th>
                  <th>Nama Lengkap</th>
                  <th>Asal Sekolah</th>
                  <th>Kelas</th>
                  <th>Email Gmail</th>
                  <th>Tanggal Diterima</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${bimbelDiterima.map((u, idx) => `
                  <tr>
                    <td data-label="No"><strong>${idx + 1}</strong></td>
                    <td data-label="ID / Nomor Induk"><span class="dnc-mono">${esc(u.nomorInduk || '-')}</span></td>
                    <td data-label="Nama Lengkap"><strong>${esc(u.namaLengkap)}</strong></td>
                    <td data-label="Asal Sekolah">${esc(u.asalSekolah || '-')}</td>
                    <td data-label="Kelas">${esc(u.kelasTeks || '-')}</td>
                    <td data-label="Email Gmail">${esc(u.email)}</td>
                    <td data-label="Tanggal Diterima">${esc(formatTanggal(u.tanggalDiterima || u.dibuat, true))}</td>
                    <td data-label="Status">${badgeStatus(u.statusAktif !== false ? 'Aktif' : 'Nonaktif')}</td>
                    <td class="dnc-sel-aksi">
                      <div class="dnc-aksi-baris">
                        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-ubah-user="${esc(u.id)}">Ubah</button>
                        <button type="button" class="dnc-tombol ${u.statusAktif !== false ? 'dnc-tombol-bahaya' : 'dnc-tombol-sukses'} dnc-tombol-kecil" data-toggle-user="${esc(u.id)}">${u.statusAktif !== false ? 'Nonaktifkan' : 'Aktifkan'}</button>
                      </div>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>` : '<div class="dnc-kosong-box" style="padding:14px">Belum ada Siswa Bimbel yang diterima.</div>'}
      </div>` : '';

    htmlBagian += `
      <div class="dnc-subbagian-judul">
        <span>Kategori Siswa Bimbel (Klik dropdown untuk persetujuan pendaftar baru &amp; daftar siswa)</span>
        <span class="dnc-badge dnc-badge-ungu">${siswaBimbelList.length} total akun</span>
      </div>
      <div class="dnc-grup-halaman-list">
        <div class="dnc-grup-halaman-kartu">
          <div class="dnc-grup-halaman-kepala ${siswaBimbelTerbukaM7 ? 'terbuka' : ''}">
            <button type="button" class="dnc-grup-halaman-toggle" data-toggle-bimbel-m7="1" aria-expanded="${siswaBimbelTerbukaM7 ? 'true' : 'false'}">
              <div style="min-width:0">
                <div class="dnc-grup-halaman-judul">Siswa Bimbel</div>
                <div class="dnc-grup-halaman-meta">
                  ${pendaftarBaru.length ? `<span class="dnc-badge dnc-badge-amber">${pendaftarBaru.length} Pendaftar Baru (Perlu Terima)</span>` : '<span class="dnc-badge dnc-badge-abu">0 Pendaftar Baru</span>'}
                  <span class="dnc-badge dnc-badge-hijau">${bimbelDiterima.length} Siswa Diterima</span>
                </div>
              </div>
              <span class="dnc-grup-halaman-panah">${siswaBimbelTerbukaM7 ? 'Tutup Siswa Bimbel ▴' : 'Buka Siswa Bimbel ▾'}</span>
            </button>
          </div>
          ${isiBimbelHtml}
        </div>
      </div>`;
  }

  wadah.innerHTML = htmlBagian;
}

function bukaFormPengguna(item = null) {
  const roleAwal = item ? normalisasiRoleDnc(item.role) : 'Siswa';
  const mapelSet = new Set(item?.mapelIds || []);
  const kelasAmpuSet = new Set(item?.kelasIds || []);

  bukaModalFormDnc({
    judul: item ? 'Ubah Profil Pengguna' : 'Tambah Akun Pengguna',
    lebar: true,
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-roleUser">Role Akses *</label>
          <select id="f-roleUser" class="dnc-select" ${item ? 'disabled' : ''}>
            <option value="Admin" ${roleAwal === 'Admin' ? 'selected' : ''}>Admin</option>
            <option value="Guru" ${roleAwal === 'Guru' ? 'selected' : ''}>Guru</option>
            <option value="Guru Bimbel" ${roleAwal === 'Guru Bimbel' ? 'selected' : ''}>Guru Bimbel</option>
            <option value="Siswa" ${roleAwal === 'Siswa' ? 'selected' : ''}>Siswa (ASAS)</option>
            <option value="Siswa Bimbel" ${roleAwal === 'Siswa Bimbel' ? 'selected' : ''}>Siswa Bimbel</option>
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-nomorInduk">Nomor Induk (NIS/NISN/NIP/ID) *</label>
          <input id="f-nomorInduk" class="dnc-input" type="text" placeholder="Contoh: 3558 atau BMB123456" value="${esc(item?.nomorInduk || '')}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-namaLengkap">Nama Lengkap *</label>
          <input id="f-namaLengkap" class="dnc-input" type="text" placeholder="Nama lengkap pengguna" value="${esc(item?.namaLengkap || '')}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-emailUser">Email Login *</label>
          <input id="f-emailUser" class="dnc-input" type="email" placeholder="3558@siswa.asas.id atau nama@gmail.com" value="${esc(item?.email || '')}" ${item && roleAwal === 'Admin' ? 'disabled' : ''} required>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="f-passwordUser">${item ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password Akun * (minimal 6 karakter)'}</label>
          <div class="dnc-wadah-input-password">
            <input id="f-passwordUser" class="dnc-input" type="password" placeholder="Masukkan password">
            <button type="button" id="btn-intip-pw-modal" class="dnc-tombol-intip" aria-label="Intip password">
              <svg class="dnc-ikon"><use href="#icon-eye"></use></svg>
            </button>
          </div>
        </div>
        <div id="grup-kelas-user" class="dnc-form-grup dnc-form-full ${roleAwal !== 'Siswa' ? 'dnc-disembunyikan' : ''}">
          <label class="dnc-label" for="f-kelasUser">Penempatan Kelas Siswa ASAS *</label>
          <select id="f-kelasUser" class="dnc-select">
            <option value="">-- Pilih Kelas --</option>
            ${stateMemori.kelas.map(k => `<option value="${esc(k.id)}" ${item?.kelasId === k.id ? 'selected' : ''}>${esc(k.kodeKelas)} - ${esc(k.namaKelas)}</option>`).join('')}
          </select>
        </div>
        <div id="grup-bimbel-user" class="dnc-form-full ${roleAwal !== 'Siswa Bimbel' ? 'dnc-disembunyikan' : ''}">
          <div class="dnc-form-grid">
            <div class="dnc-form-grup">
              <label class="dnc-label" for="f-asalSekolahUser">Asal Sekolah *</label>
              <input id="f-asalSekolahUser" class="dnc-input" type="text" placeholder="Contoh: SDN 1 Banguntapan" value="${esc(item?.asalSekolah || '')}">
            </div>
            <div class="dnc-form-grup">
              <label class="dnc-label" for="f-kelasTeksUser">Kelas Siswa Bimbel *</label>
              <input id="f-kelasTeksUser" class="dnc-input" type="text" placeholder="Contoh: Kelas 6 / VI-A" value="${esc(item?.kelasTeks || '')}">
            </div>
          </div>
        </div>
        <div id="grup-mapel-user" class="dnc-form-grup dnc-form-full ${!adalahRoleGuru(roleAwal) ? 'dnc-disembunyikan' : ''}">
          <label class="dnc-label">Mata Pelajaran yang Diampu (Guru / Guru Bimbel) * (minimal 1)</label>
          <div class="dnc-checklist-box" style="max-height:130px">
            ${stateMemori.mataPelajaran.map(m => `
              <label class="dnc-checklist-item">
                <input type="checkbox" name="f-mapel-guru" value="${esc(m.id)}" ${mapelSet.has(m.id) ? 'checked' : ''}>
                <span><strong>${esc(m.kodeMapel)}</strong> — ${esc(m.namaMapel)}</span>
              </label>`).join('')}
          </div>
        </div>
        <div id="grup-kelas-guru" class="dnc-form-grup dnc-form-full ${!adalahRoleGuru(roleAwal) ? 'dnc-disembunyikan' : ''}">
          <label class="dnc-label">Kelas yang Diampu Guru (Opsional — kosongkan jika semua kelas)</label>
          <div class="dnc-checklist-box" style="max-height:130px">
            ${stateMemori.kelas.map(k => `
              <label class="dnc-checklist-item">
                <input type="checkbox" name="f-kelas-guru" value="${esc(k.id)}" ${kelasAmpuSet.has(k.id) ? 'checked' : ''}>
                <span><strong>${esc(k.kodeKelas)}</strong> — ${esc(k.namaKelas)} (${esc(labelTingkat(k.tingkat))})</span>
              </label>`).join('')}
          </div>
          <span class="dnc-form-bantuan">Jika dicentang (mis. khusus Kelas VI), guru hanya dapat memilih kelas tersebut di Paket ASAS serta memantau hasil nilai kelas ampunya saja.</span>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-check-label">
            <input id="f-statusUser" type="checkbox" ${(item ? item.statusAktif !== false : true) ? 'checked' : ''}>
            <span>Status Akun Aktif</span>
          </label>
        </div>
      </div>`,
    onMount: () => {
      document.getElementById('btn-intip-pw-modal').addEventListener('click', e => {
        togglePassword('f-passwordUser', e.currentTarget);
      });
      document.getElementById('f-roleUser').addEventListener('change', e => {
        const r = e.target.value;
        document.getElementById('grup-kelas-user').classList.toggle('dnc-disembunyikan', r !== 'Siswa');
        document.getElementById('grup-bimbel-user').classList.toggle('dnc-disembunyikan', r !== 'Siswa Bimbel');
        document.getElementById('grup-mapel-user').classList.toggle('dnc-disembunyikan', !adalahRoleGuru(r));
        document.getElementById('grup-kelas-guru').classList.toggle('dnc-disembunyikan', !adalahRoleGuru(r));
      });
    },
    onSubmit: async () => {
      const role = item ? normalisasiRoleDnc(item.role) : document.getElementById('f-roleUser').value;
      const nomorInduk = document.getElementById('f-nomorInduk').value.trim();
      const namaLengkap = document.getElementById('f-namaLengkap').value.trim();
      const email = document.getElementById('f-emailUser').value.trim();
      const password = document.getElementById('f-passwordUser').value;
      const kelasId = role === 'Siswa' ? document.getElementById('f-kelasUser').value : '';
      const kelasIds = adalahRoleGuru(role) ? [...document.querySelectorAll('input[name="f-kelas-guru"]:checked')].map(el => el.value) : [];
      const asalSekolah = role === 'Siswa Bimbel' ? (document.getElementById('f-asalSekolahUser')?.value || '').trim() : '';
      const kelasTeks = role === 'Siswa Bimbel' ? (document.getElementById('f-kelasTeksUser')?.value || '').trim() : '';
      const mapelIds = adalahRoleGuru(role) ? [...document.querySelectorAll('input[name="f-mapel-guru"]:checked')].map(el => el.value) : [];
      const statusAktif = document.getElementById('f-statusUser').checked;

      if (!nomorInduk || !namaLengkap || !email) throw new Error('Nomor induk, nama lengkap, dan email wajib diisi.');
      if (role === 'Siswa' && !kelasId) throw new Error('Siswa ASAS wajib ditempatkan pada satu kelas.');
      if (role === 'Siswa Bimbel') {
        if (!asalSekolah || !kelasTeks) throw new Error('Asal sekolah dan kelas wajib diisi untuk Siswa Bimbel.');
        if (!/^[a-z0-9._%+-]+@gmail\.com$/i.test(email)) throw new Error('Email Siswa Bimbel wajib menggunakan akun Gmail (@gmail.com).');
      }
      if (adalahRoleGuru(role) && !mapelIds.length) throw new Error(`${role} wajib mengampu minimal satu mata pelajaran.`);
      if (!item && password.length < 6) throw new Error('Password akun baru minimal 6 karakter.');
      if (item && password && password.length < 6) throw new Error('Password baru minimal 6 karakter.');

      if (!(await cekUnikNisPerKelas(nomorInduk, kelasId, role, item?.id))) {
        throw new Error(role === 'Siswa'
          ? `NIS "${nomorInduk}" sudah terdaftar pada kelas tersebut.`
          : `Nomor Induk "${nomorInduk}" sudah terdaftar.`);
      }
      if (!(await cekUnik(COLLECTIONS.pengguna, 'email', email, item?.id))) {
        throw new Error(`Email "${email}" sudah terdaftar.`);
      }

      const payload = { email, namaLengkap, nomorInduk, role, kelasId, kelasIds, mapelIds, statusAktif };
      if (role === 'Siswa Bimbel') {
        payload.asalSekolah = asalSekolah;
        payload.kelasTeks = kelasTeks;
        payload.tingkat = deteksiTingkat(kelasTeks) || '';
        payload.statusPendaftaran = item?.statusPendaftaran || 'Diterima';
        payload.tanggalDaftar = item?.tanggalDaftar || new Date().toISOString();
        payload.tanggalDiterima = item?.tanggalDiterima || new Date().toISOString();
      }
      if (role !== 'Admin' && password) {
        payload.passwordHash = await hashTeks(password);
      }

      if (item) {
        await dbUpdate(COLLECTIONS.pengguna, item.id, payload);
      } else if (role === 'Admin') {
        const uidAdminBaru = await buatAkunAdminSekunder(email, password);
        await dbCreate(COLLECTIONS.pengguna, payload, uidAdminBaru);
      } else {
        await dbCreate(COLLECTIONS.pengguna, payload);
      }

      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M6', 'DNC-M7']);
      await muatM7Pengguna(true);
      tampilkanToast(item ? 'Profil pengguna berhasil diperbarui.' : `Akun ${role} berhasil dibuat.`);
    }
  });
}

async function toggleStatusPengguna(id) {
  const u = cariById('pengguna', id);
  if (!u) return;
  if (u.id === penggunaAktif.id) {
    tampilkanToast('Anda tidak dapat menonaktifkan akun yang sedang dipakai masuk.', 'error');
    return;
  }
  const statusBaru = u.statusAktif === false;
  await dbUpdate(COLLECTIONS.pengguna, id, { statusAktif: statusBaru });
  resetCacheMenu(['DNC-M1', 'DNC-M7']);
  await muatM7Pengguna(true);
  tampilkanToast(`Akun ${u.namaLengkap} kini berstatus ${statusBaru ? 'Aktif' : 'Nonaktif'}.`);
}

// --- Impor Massal Data Siswa Bebas Template (Excel, CSV, Word, PDF, TXT) ---
function rapikanTokenKelasSiswa(str) {
  return teks(String(str || '').replace(/^(?:kelas|kls|rombel)\s*/i, '').replace(/[^a-z0-9]/gi, ''));
}

function cocokkanKelasSiswaDnc(nilaiRaw, kelasDefaultId = '') {
  const raw = String(nilaiRaw || '').trim();
  if (!raw) return kelasDefaultId;
  const norm = rapikanTokenKelasSiswa(raw);
  if (!norm) return kelasDefaultId;

  const cocokPersis = stateMemori.kelas.find(k =>
    rapikanTokenKelasSiswa(k.kodeKelas) === norm ||
    rapikanTokenKelasSiswa(k.namaKelas) === norm ||
    rapikanTokenKelasSiswa(`${k.kodeKelas}${k.namaKelas}`) === norm
  );
  if (cocokPersis) return cocokPersis.id;

  const tingkatDeteksi = deteksiTingkat(raw);
  const mHurufAkhir = raw.toUpperCase().match(/(?:[\-\s\/]|1[0-2]|[1-9]|XII|XI|IX|VIII|VII|VI|IV|III|II|X|V|I)([A-Z])$/);
  const sufiks = mHurufAkhir ? mHurufAkhir[1] : '';

  if (tingkatDeteksi) {
    if (sufiks) {
      const targetGabung = rapikanTokenKelasSiswa(`${tingkatDeteksi}${sufiks}`);
      const cocokSufiks = stateMemori.kelas.find(k =>
        k.tingkat === tingkatDeteksi && (
          rapikanTokenKelasSiswa(k.kodeKelas) === targetGabung ||
          rapikanTokenKelasSiswa(k.kodeKelas).endsWith(teks(sufiks)) ||
          rapikanTokenKelasSiswa(k.namaKelas).endsWith(teks(sufiks))
        )
      );
      if (cocokSufiks) return cocokSufiks.id;
    }
    const cocokTingkat = stateMemori.kelas.filter(k => k.tingkat === tingkatDeteksi);
    if (cocokTingkat.length === 1) return cocokTingkat[0].id;
  }

  return kelasDefaultId;
}

function buatEmailOtomatisSiswa(nomorInduk, namaLengkap, indeks) {
  const basisNis = String(nomorInduk || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (basisNis.length >= 3) return `${basisNis}@siswa.asas.id`;
  const basisNama = String(namaLengkap || 'siswa').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14) || 'siswa';
  return `${basisNama}${indeks + 1}@siswa.asas.id`;
}

function tentukanPasswordSiswa(passwordFile, nomorInduk, modePassword, passwordBawaan) {
  const pwFile = String(passwordFile || '').trim();
  const pwDef = String(passwordBawaan || 'siswa123').trim() || 'siswa123';
  const nisBersih = String(nomorInduk || '').replace(/\s+/g, '');

  if (modePassword === 'file_dulu' && pwFile.length >= 6) return pwFile;
  if (modePassword === 'nis') {
    if (nisBersih.length >= 6) return nisBersih;
    if (nisBersih.length > 0) return nisBersih.padEnd(6, '0');
    return pwDef;
  }
  return pwFile.length >= 6 ? pwFile : pwDef;
}

function deteksiKelasJudulDokumen(barisMatriks, kelasDefaultId) {
  for (let i = 0; i < Math.min(4, barisMatriks.length); i++) {
    const gabung = (Array.isArray(barisMatriks[i]) ? barisMatriks[i] : [barisMatriks[i]]).join(' ').trim();
    if (!gabung || gabung.length > 100) continue;
    if (/(?:kelas|rombel|daftar\s+siswa|peserta\s+didik|absen)/i.test(gabung)) {
      const mKelas = gabung.match(/(?:kelas|rombel)\s*[:\-]?\s*([A-Za-z0-9\-\s]{1,16})/i);
      const ketemu = cocokkanKelasSiswaDnc(mKelas ? mKelas[1] : gabung, '');
      if (ketemu) return ketemu;
    }
  }
  return kelasDefaultId;
}

function adalahTeksNamaSiswa(str) {
  const t = String(str || '').trim();
  if (t.length < 3 || t.length > 85) return false;
  if (/@/.test(t)) return false;
  if (/^\d[\d\s\-\/\.\:]+$/.test(t)) return false;
  if (/^(?:l|p|l\/p|laki[\-\s]?laki|perempuan|islam|kristen|katolik|hindu|buddha|konghucu|aktif|nonaktif|siswa|ya|tidak|no|no\.|nama|nama\s+lengkap|nama\s+siswa|nis|nisn|kelas|rombel|email|password|sandi|jenis\s+kelamin|jk|ttl|tanggal\s+lahir|alamat|keterangan)$/i.test(t)) {
    return false;
  }
  if (/^\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{2,4}$/.test(t)) return false;
  const huruf = (t.match(/[A-Za-zÀ-ÿ]/g) || []).length;
  return huruf >= 3 && huruf / t.replace(/\s/g, '').length >= 0.65;
}

function adalahKodeNisSiswa(str) {
  const t = String(str || '').replace(/[\s\-\.]/g, '');
  if (/^\d{4,16}$/.test(t)) return true;
  if (/^[A-Za-z]{1,4}\d{4,12}$/.test(t)) return true;
  return false;
}

function petakanMatriksSiswaBebas(barisMatriks, { kelasDefaultId, modePassword, passwordBawaan }) {
  const bersih = (barisMatriks || [])
    .map(r => (Array.isArray(r) ? r : [r]).map(c => String(c ?? '').replace(/\s+/g, ' ').trim()))
    .filter(r => r.some(c => c !== ''));
  if (!bersih.length) return [];

  const kelasFallback = deteksiKelasJudulDokumen(bersih, kelasDefaultId);
  let idxHeader = -1;
  let iNis = -1, iNama = -1, iKelas = -1, iEmail = -1, iPass = -1;

  for (let i = 0; i < Math.min(8, bersih.length); i++) {
    const rowLower = bersih[i].map(c => teks(c));
    const skorHeader =
      (rowLower.some(c => c.includes('nama') || c.includes('peserta didik') || c.includes('siswa')) ? 1 : 0) +
      (rowLower.some(c => c.includes('nis') || c.includes('induk') || c.includes('no.') || c === 'no' || c.includes('kelas') || c.includes('rombel') || c.includes('email')) ? 1 : 0);
    if (skorHeader >= 2) {
      idxHeader = i;
      const cariKol = daftarKata => rowLower.findIndex(h => daftarKata.some(k => h === k || h.includes(k)));
      iNis = cariKol(['nisn', 'nomor induk', 'no induk', 'nis', 'induk', 'id siswa']);
      iNama = cariKol(['nama lengkap', 'nama siswa', 'nama peserta', 'peserta didik', 'nama']);
      iKelas = cariKol(['kode kelas', 'nama kelas', 'kelas', 'rombel', 'tingkat']);
      iEmail = cariKol(['email', 'e-mail', 'surel']);
      iPass = cariKol(['password', 'kata sandi', 'sandi', 'pin', 'pass']);
      break;
    }
  }

  const mulai = idxHeader >= 0 ? idxHeader + 1 : 0;
  const hasil = [];
  const capAuto = String(new Date().getFullYear()).slice(-2);

  for (let r = mulai; r < bersih.length; r++) {
    const row = bersih[r];
    const gabungBaris = row.join(' ').trim();
    if (!gabungBaris) continue;
    if (/^(?:daftar\s+(?:siswa|nama|peserta)|data\s+siswa|rekap\s+siswa|semester|tahun\s+ajaran|sekolah|sdn|smpn|sman|smkn|wali\s+kelas|jumlah\s+siswa|total\s+siswa)/i.test(gabungBaris) && row.filter(Boolean).length <= 2) {
      continue;
    }

    let nomorInduk = iNis >= 0 ? (row[iNis] || '').trim() : '';
    let namaLengkap = iNama >= 0 ? (row[iNama] || '').trim() : '';
    let kelasRaw = iKelas >= 0 ? (row[iKelas] || '').trim() : '';
    let email = iEmail >= 0 ? (row[iEmail] || '').trim() : '';
    let passwordFile = iPass >= 0 ? (row[iPass] || '').trim() : '';

    // Deteksi heuristik bebas template jika kolom header tidak ada atau sebagian kosong
    row.forEach((sel, idxSel) => {
      if (!sel) return;
      if (idxSel === 0 && /^\d{1,3}[\.\)]?$/.test(sel) && row.length >= 2) return;
      if (!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sel)) {
        email = sel;
        return;
      }
      if (!nomorInduk && adalahKodeNisSiswa(sel)) {
        nomorInduk = sel.replace(/\s+/g, '');
        return;
      }
      if (!kelasRaw && idxSel !== iNama && sel.length <= 24) {
        const cekKls = cocokkanKelasSiswaDnc(sel, '');
        if (cekKls) {
          kelasRaw = sel;
          return;
        }
      }
      if (!namaLengkap && adalahTeksNamaSiswa(sel)) {
        namaLengkap = sel;
      }
    });

    if (!namaLengkap) {
      const kandidatNama = row.filter((sel, idxSel) =>
        idxSel !== iNis && idxSel !== iKelas && idxSel !== iEmail && idxSel !== iPass && adalahTeksNamaSiswa(sel)
      );
      if (kandidatNama.length) {
        namaLengkap = kandidatNama.sort((a, b) => b.length - a.length)[0];
      }
    }

    namaLengkap = namaLengkap.replace(/^\d+[\.\)]\s*/, '').trim();
    if (!namaLengkap || !adalahTeksNamaSiswa(namaLengkap)) continue;

    if (!nomorInduk) {
      nomorInduk = `SIS${capAuto}${String(hasil.length + 1).padStart(4, '0')}`;
    }

    const kelasId = cocokkanKelasSiswaDnc(kelasRaw, kelasFallback);
    const emailFinal = email || buatEmailOtomatisSiswa(nomorInduk, namaLengkap, hasil.length);
    const passwordFinal = tentukanPasswordSiswa(passwordFile, nomorInduk, modePassword, passwordBawaan);

    hasil.push({
      dipilih: true,
      nomorInduk,
      namaLengkap,
      kelasId,
      email: emailFinal,
      password: passwordFinal
    });
  }

  return hasil;
}

function parseTeksBarisSiswaBebas(daftarBaris, opsi) {
  const matriks = [];
  (daftarBaris || []).forEach(line => {
    const t = String(line || '').trim();
    if (!t) return;
    if (t.includes('\t')) {
      matriks.push(t.split('\t').map(x => x.trim()));
      return;
    }
    if (t.includes('|')) {
      matriks.push(t.split('|').map(x => x.trim()));
      return;
    }
    if (t.includes(';')) {
      matriks.push(t.split(';').map(x => x.trim()));
      return;
    }
    if (t.includes(',') && t.split(',').length >= 2) {
      matriks.push(t.split(',').map(x => x.trim()));
      return;
    }
    if (/\s{2,}/.test(t)) {
      matriks.push(t.split(/\s{2,}/).map(x => x.trim()));
      return;
    }

    // Baris polos dipisah spasi tunggal (mis. "1. 0098765432 Ahmad Fauzi VI-A" atau "1. Ahmad Fauzi")
    let sisa = t.replace(/^\d+[\.\)]\s*/, '').trim();
    let email = '';
    const mEmail = sisa.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
    if (mEmail) {
      email = mEmail[0];
      sisa = sisa.replace(mEmail[0], ' ').trim();
    }
    let nis = '';
    const mNis = sisa.match(/\b\d{4,16}\b/);
    if (mNis) {
      nis = mNis[0];
      sisa = sisa.replace(mNis[0], ' ').trim();
    }
    let kelasToken = '';
    const potongan = sisa.split(/\s+/).filter(Boolean);
    if (potongan.length >= 2) {
      const cekAkhir = cocokkanKelasSiswaDnc(potongan[potongan.length - 1], '');
      if (cekAkhir) {
        kelasToken = potongan.pop();
      }
    }
    const nama = potongan.filter(p => !/^(?:l|p|l\/p)$/i.test(p)).join(' ').trim();
    if (nama) {
      matriks.push([nis, nama, kelasToken, email]);
    }
  });

  return petakanMatriksSiswaBebas(matriks, opsi);
}

function validasiDaftarSiswaImpor(daftar, nisSudahAda, emailSudahAda) {
  const nisKelasSudahAda = new Set(
    stateMemori.pengguna
      .filter(u => normalisasiRoleDnc(u.role) === 'Siswa')
      .map(u => `${teks(u.nomorInduk)}||${u.kelasId || ''}`)
  );
  const nisNonSiswaSudahAda = new Set(
    stateMemori.pengguna
      .filter(u => normalisasiRoleDnc(u.role) !== 'Siswa')
      .map(u => teks(u.nomorInduk))
  );
  const nisKelasDalamFile = new Set();
  const emailDalamFile = new Set();

  return daftar.map(it => {
    const masalah = [];
    const nisKey = teks(it.nomorInduk);
    const nisKelasKey = `${nisKey}||${it.kelasId || ''}`;

    // Jika email otomatis @siswa.asas.id bentrok karena NIS sama beda kelas, buat unik memakai kode kelas
    if (it.email && /@siswa\.asas\.id$/i.test(it.email)) {
      const emailCek = teks(it.email);
      if (emailSudahAda.has(emailCek) || emailDalamFile.has(emailCek)) {
        const basisNis = String(it.nomorInduk || '').toLowerCase().replace(/[^a-z0-9]/g, '') || 'siswa';
        const klsObj = cariById('kelas', it.kelasId);
        const tagKelas = String(klsObj?.kodeKelas || 'kls').toLowerCase().replace(/[^a-z0-9]/g, '') || 'kls';
        let kandidat = `${basisNis}.${tagKelas}@siswa.asas.id`;
        let urutan = 2;
        while (emailSudahAda.has(teks(kandidat)) || emailDalamFile.has(teks(kandidat))) {
          kandidat = `${basisNis}.${tagKelas}${urutan}@siswa.asas.id`;
          urutan++;
        }
        it.email = kandidat;
      }
    }

    const emailKey = teks(it.email);

    if (!it.nomorInduk) masalah.push('NIS/NISN kosong');
    if (!it.namaLengkap) masalah.push('Nama kosong');
    if (!it.kelasId || !cariById('kelas', it.kelasId)) masalah.push('Kelas belum dipilih');
    if (!it.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(it.email)) masalah.push('Format email tidak valid');
    if (!it.password || String(it.password).length < 6) masalah.push('Password min. 6 karakter');

    if (nisKey && nisNonSiswaSudahAda.has(nisKey)) masalah.push('NIS bentrok akun non-siswa');
    else if (nisKey && nisKelasSudahAda.has(nisKelasKey)) masalah.push('NIS sudah terdaftar di kelas ini');
    else if (nisKey && nisKelasDalamFile.has(nisKelasKey)) masalah.push('NIS duplikat di kelas yang sama');

    if (emailKey && emailSudahAda.has(emailKey)) masalah.push('Email sudah terdaftar');
    else if (emailKey && emailDalamFile.has(emailKey)) masalah.push('Email duplikat di file');

    if (nisKey) nisKelasDalamFile.add(nisKelasKey);
    if (emailKey) emailDalamFile.add(emailKey);

    it.valid = masalah.length === 0;
    it.statusTeks = it.valid ? 'Valid' : (masalah.some(m => m.includes('terdaftar') || m.includes('duplikat') || m.includes('bentrok')) ? 'Duplikat' : 'Perlu Perbaikan');
    it.catatan = masalah.length ? masalah.join('; ') : 'Siap disimpan';
    return it;
  });
}

function bukaModalImporSiswa() {
  if (!stateMemori.kelas.length) {
    tampilkanToast('Tambahkan minimal satu Data Kelas di Master Kelas terlebih dahulu.', 'error');
    return;
  }

  const nisSudahAda = new Set(stateMemori.pengguna.map(u => teks(u.nomorInduk)));
  const emailSudahAda = new Set(stateMemori.pengguna.map(u => teks(u.email)));
  let daftarSiswaImpor = [];

  const renderPratinjauSiswa = () => {
    daftarSiswaImpor = validasiDaftarSiswaImpor(daftarSiswaImpor, nisSudahAda, emailSudahAda);
    const wadah = document.getElementById('wadah-pratinjau-siswa');
    const info = document.getElementById('info-impor-siswa');
    if (!wadah) return;

    const jmlValid = daftarSiswaImpor.filter(x => x.valid).length;
    info.textContent = daftarSiswaImpor.length
      ? `Terdeteksi ${daftarSiswaImpor.length} data siswa (${jmlValid} Valid, ${daftarSiswaImpor.length - jmlValid} Duplikat/Perlu Perbaikan).`
      : 'Unggah file Excel (.xlsx/.xls), CSV, Word (.docx), PDF, atau TXT format bebas untuk deteksi otomatis siswa.';

    if (!daftarSiswaImpor.length) {
      wadah.innerHTML = '';
      return;
    }

    wadah.innerHTML = `
      <div class="dnc-ringkasan-impor">
        <div><strong>Siap Simpan:</strong> ${daftarSiswaImpor.filter(x => x.dipilih && x.valid).length} dari ${daftarSiswaImpor.length} siswa</div>
        <div class="dnc-flex-gap">
          <button type="button" id="btn-terapkan-kelas-semua" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil">Samakan ke Kelas Bawaan</button>
          <button type="button" id="btn-terapkan-pw-semua" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil">Terapkan Mode Password</button>
        </div>
      </div>
      <div class="dnc-pembungkus-tabel dnc-mt-12">
        <table class="dnc-tabel dnc-tabel-padat">
          <thead>
            <tr>
              <th>Pilih</th>
              <th>NIS / NISN</th>
              <th>Nama Lengkap</th>
              <th>Kelas</th>
              <th>Email Login</th>
              <th>Password</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${daftarSiswaImpor.map((it, idx) => `
              <tr>
                <td data-label="Pilih"><input type="checkbox" data-is-pilih="${idx}" ${it.dipilih && it.valid ? 'checked' : ''} ${!it.valid ? 'disabled' : ''}></td>
                <td data-label="NIS / NISN"><input class="dnc-input" style="height:30px" data-is-nis="${idx}" value="${esc(it.nomorInduk)}"></td>
                <td data-label="Nama Lengkap"><input class="dnc-input" style="height:30px" data-is-nama="${idx}" value="${esc(it.namaLengkap)}"></td>
                <td data-label="Kelas">
                  <select class="dnc-select" style="height:30px" data-is-kelas="${idx}">
                    <option value="">-- Pilih --</option>
                    ${stateMemori.kelas.map(k => `<option value="${esc(k.id)}" ${it.kelasId === k.id ? 'selected' : ''}>${esc(k.kodeKelas)} - ${esc(k.namaKelas)}</option>`).join('')}
                  </select>
                </td>
                <td data-label="Email Login"><input class="dnc-input" style="height:30px" data-is-email="${idx}" value="${esc(it.email)}"></td>
                <td data-label="Password"><input class="dnc-input" style="height:30px" data-is-pw="${idx}" value="${esc(it.password)}"></td>
                <td data-label="Status">${badgeStatus(it.statusTeks)}<div class="dnc-form-bantuan">${esc(it.catatan)}</div></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    document.getElementById('btn-terapkan-kelas-semua')?.addEventListener('click', () => {
      const kDef = document.getElementById('is-kelas-default').value;
      daftarSiswaImpor.forEach(it => { it.kelasId = kDef; });
      renderPratinjauSiswa();
    });

    document.getElementById('btn-terapkan-pw-semua')?.addEventListener('click', () => {
      const modePw = document.getElementById('is-mode-pw').value;
      const pwDef = document.getElementById('is-pw-default').value.trim() || 'siswa123';
      daftarSiswaImpor.forEach(it => {
        it.password = tentukanPasswordSiswa('', it.nomorInduk, modePw, pwDef);
      });
      renderPratinjauSiswa();
    });

    wadah.querySelectorAll('[data-is-pilih]').forEach(el => {
      el.addEventListener('change', () => {
        daftarSiswaImpor[Number(el.dataset.isPilih)].dipilih = el.checked;
        renderPratinjauSiswa();
      });
    });

    const ikat = (attr, field) => {
      wadah.querySelectorAll(`[${attr}]`).forEach(el => {
        el.addEventListener('change', () => {
          const i = Number(el.getAttribute(attr));
          daftarSiswaImpor[i][field] = el.value.trim();
          daftarSiswaImpor = validasiDaftarSiswaImpor(daftarSiswaImpor, nisSudahAda, emailSudahAda);
          if (daftarSiswaImpor[i].valid) daftarSiswaImpor[i].dipilih = true;
          renderPratinjauSiswa();
        });
      });
    };
    ikat('data-is-nis', 'nomorInduk');
    ikat('data-is-nama', 'namaLengkap');
    ikat('data-is-kelas', 'kelasId');
    ikat('data-is-email', 'email');
    ikat('data-is-pw', 'password');
  };

  bukaModalFormDnc({
    judul: 'Impor Massal Data Siswa — Bebas Template',
    lebar: true,
    labelSimpan: 'Simpan Massal Akun Siswa',
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup">
          <label class="dnc-label" for="is-kelas-default">Kelas Bawaan (jika tidak ada di file) *</label>
          <select id="is-kelas-default" class="dnc-select">
            ${stateMemori.kelas.map(k => `<option value="${esc(k.id)}">${esc(k.kodeKelas)} - ${esc(k.namaKelas)}</option>`).join('')}
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="is-mode-pw">Pengaturan Password Otomatis</label>
          <select id="is-mode-pw" class="dnc-select">
            <option value="file_dulu">Dari File / Password Bawaan</option>
            <option value="nis">Gunakan NIS/NISN Masing-masing</option>
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="is-pw-default">Password Bawaan (min. 6 karakter)</label>
          <input id="is-pw-default" class="dnc-input" type="text" value="siswa123">
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label">Contoh File (Opsional)</label>
          <div class="dnc-flex-gap">
            <button type="button" id="btn-templat-siswa-csv" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil">Contoh Excel/CSV</button>
            <button type="button" id="btn-templat-siswa-word" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil">Contoh Word</button>
          </div>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="is-file-siswa">Unggah File Data Siswa Format Bebas (.xlsx, .xls, .csv, .docx, .pdf, .txt) *</label>
          <div class="dnc-file-drop">
            <input id="is-file-siswa" class="dnc-input" type="file" accept=".xlsx,.xls,.csv,.docx,.pdf,.txt" style="padding-top:7px">
            <div id="info-impor-siswa" class="dnc-form-bantuan dnc-mt-12">Langsung unggah daftar absen, ekspor Dapodik, tabel Word/PDF, atau daftar nama biasa — sistem otomatis mendeteksi NIS/NISN, Nama, Kelas, dan membuatkan Email/Password login.</div>
          </div>
        </div>
      </div>
      <div id="wadah-pratinjau-siswa"></div>`,
    onMount: () => {
      document.getElementById('btn-templat-siswa-csv').addEventListener('click', () => {
        const kelasContoh = stateMemori.kelas[0]?.kodeKelas || 'VI-A';
        const isi = `NISN,Nama Lengkap,Kelas,Email,Password\n` +
          `0098765431,Ahmad Pratama,${kelasContoh},ahmad@siswa.asas.id,siswa123\n` +
          `0098765432,Siti Nurhaliza,${kelasContoh},,\n`;
        unduhBlobFile(new Blob([isi], { type: 'text/csv;charset=utf-8' }), 'Contoh_Data_Siswa_ASAS_DNC.csv');
      });

      document.getElementById('btn-templat-siswa-word').addEventListener('click', () => {
        const kelasContoh = stateMemori.kelas[0]?.kodeKelas || 'VI-A';
        unduhDokumenWordSederhana([
          `DAFTAR SISWA KELAS ${kelasContoh}`,
          `1. 0098765431 | Ahmad Pratama | ${kelasContoh}`,
          `2. 0098765432 | Siti Nurhaliza | ${kelasContoh}`
        ], 'Contoh_Data_Siswa_ASAS_DNC.docx');
      });

      document.getElementById('is-file-siswa').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        const info = document.getElementById('info-impor-siswa');
        const ext = teks(file.name.split('.').pop());
        const opsi = {
          kelasDefaultId: document.getElementById('is-kelas-default').value,
          modePassword: document.getElementById('is-mode-pw').value,
          passwordBawaan: document.getElementById('is-pw-default').value.trim() || 'siswa123'
        };
        info.textContent = `Mendeteksi otomatis daftar siswa dari ${file.name}...`;

        try {
          let mentah = [];
          if (ext === 'csv') {
            mentah = petakanMatriksSiswaBebas(parseCsvBaris(await file.text()), opsi);
          } else if (ext === 'xlsx' || ext === 'xls') {
            const XLSX = await muatSheetJs();
            const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            mentah = petakanMatriksSiswaBebas(rows, opsi);
          } else if (ext === 'docx') {
            const mammothLib = await muatMammothJs();
            const { value: html } = await mammothLib.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const semuaTabel = [...doc.querySelectorAll('table')];
            semuaTabel.forEach(tbl => {
              const rows = [...tbl.querySelectorAll('tr')].map(tr => [...tr.querySelectorAll('th,td')].map(td => td.textContent.trim()));
              mentah.push(...petakanMatriksSiswaBebas(rows, opsi));
            });
            if (!mentah.length) {
              const lines = [...doc.body.querySelectorAll('p, li')].map(p => p.textContent.trim()).filter(Boolean);
              mentah = parseTeksBarisSiswaBebas(lines, opsi);
            }
          } else if (ext === 'pdf') {
            const barisPdf = await ekstrakTeksBarisPdf(file);
            mentah = parseTeksBarisSiswaBebas(barisPdf, opsi);
          } else if (ext === 'txt') {
            const lines = (await file.text()).split(/\r?\n/).map(t => t.trim()).filter(Boolean);
            mentah = parseTeksBarisSiswaBebas(lines, opsi);
          } else {
            throw new Error('Format file tidak didukung. Gunakan Excel, CSV, Word (.docx), PDF, atau TXT.');
          }

          daftarSiswaImpor = mentah;
          renderPratinjauSiswa();
        } catch (err) {
          info.textContent = err.message || 'Gagal membaca file data siswa.';
          tampilkanToast(info.textContent, 'error');
        }
      });
    },
    onSubmit: async () => {
      daftarSiswaImpor = validasiDaftarSiswaImpor(daftarSiswaImpor, nisSudahAda, emailSudahAda);
      const terpilih = daftarSiswaImpor.filter(x => x.dipilih && x.valid);
      if (!terpilih.length) throw new Error('Belum ada data siswa berstatus Valid yang dipilih untuk disimpan.');

      let tersimpan = 0;
      for (const s of terpilih) {
        if (!(await cekUnikNisPerKelas(s.nomorInduk, s.kelasId, 'Siswa'))) continue;
        if (!(await cekUnik(COLLECTIONS.pengguna, 'email', s.email))) continue;
        const passwordHash = await hashTeks(s.password);
        await dbCreate(COLLECTIONS.pengguna, {
          email: s.email.trim(),
          namaLengkap: s.namaLengkap.trim(),
          nomorInduk: s.nomorInduk.trim(),
          role: 'Siswa',
          kelasId: s.kelasId,
          mapelIds: [],
          statusAktif: true,
          passwordHash
        });
        tersimpan++;
      }

      if (!tersimpan) throw new Error('Seluruh akun siswa terpilih sudah terdaftar di database.');
      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M6', 'DNC-M7']);
      await muatM7Pengguna(true);
      tampilkanToast(`${tersimpan} akun Siswa berhasil diimpor massal.`);
    }
  });
}
// ===== AKHIR BLOK: DNC_M7_PENGGUNA =====

// ===== BLOK: DNC_BOOT =====
async function inisialisasiAplikasiDnc() {
  inisialisasiPwaDnc();
  if (IS_PREVIEW) {
    await inisialisasiDataPreview();
  }
  renderSlotPreviewLogin();
  setRoleLogin('Auto');

  document.getElementById('btn-daftar-bimbel')?.addEventListener('click', bukaModalDaftarSiswaBimbel);

  document.getElementById('btn-intip-password')?.addEventListener('click', e => {
    togglePassword('input-login-password', e.currentTarget);
  });

  document.getElementById('form-login-dnc')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('btn-masuk-dnc');
    const identitas = document.getElementById('input-login-identitas').value;
    const password = document.getElementById('input-login-password').value;
    await denganLoading(btn, 'Memverifikasi...', async () => {
      const userObj = await prosesLoginDnc(identitas, password);
      await masukKeAplikasi(userObj);
      tampilkanToast(`Selamat datang, ${userObj.namaLengkap} (${userObj.role}).`);
    });
  });

  document.getElementById('btn-keluar-desktop')?.addEventListener('click', keluarAplikasi);
  document.getElementById('btn-keluar-hp')?.addEventListener('click', keluarAplikasi);

  document.getElementById('btn-tutup-modal')?.addEventListener('click', tutupModalFormDnc);
  document.getElementById('btn-batal-modal')?.addEventListener('click', tutupModalFormDnc);
  document.getElementById('dnc-modal-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (typeof _modalSubmitHandler !== 'function') return;
    const btn = document.getElementById('btn-simpan-modal');
    await denganLoading(btn, 'Menyimpan...', () => _modalSubmitHandler());
  });

  document.getElementById('btn-tutup-konfirmasi')?.addEventListener('click', tutupKonfirmasi);
  document.getElementById('btn-batal-konfirmasi')?.addEventListener('click', tutupKonfirmasi);
  document.getElementById('btn-ya-konfirmasi')?.addEventListener('click', async () => {
    const aksi = _konfirmasiAksi;
    if (typeof aksi !== 'function') { tutupKonfirmasi(); return; }
    const btn = document.getElementById('btn-ya-konfirmasi');
    await denganLoading(btn, 'Memproses...', async () => {
      await aksi();
      tutupKonfirmasi();
    });
  });

  document.getElementById('btn-tutup-sheet')?.addEventListener('click', () => {
    document.getElementById('dnc-sheet-lainnya').classList.add('dnc-disembunyikan');
  });

  // --- Event DNC-M1 ---
  document.getElementById('btn-muat-ulang-m1')?.addEventListener('click', () => muatM1Dashboard(true));

  // --- Event Poin Otomatis & Hitung Ulang Nilai RAD (DNC-M3 & DNC-M4) ---
  document.getElementById('btn-sinkron-bobot-m3')?.addEventListener('click', sinkronkanBobotBankSoalOtomatis);
  document.getElementById('btn-hitung-ulang-nilai-m4')?.addEventListener('click', () => hitungUlangNilaiPaketRad(''));
  document.getElementById('tbody-paket')?.addEventListener('click', e => {
    const btnRehitung = e.target.closest('[data-rehitung-paket]');
    if (btnRehitung) hitungUlangNilaiPaketRad(btnRehitung.dataset.rehitungPaket);
  });

  // --- Event DNC-M2 ---
  document.getElementById('btn-muat-ulang-m2')?.addEventListener('click', () => muatM2Master(true));
  document.querySelectorAll('[data-m2-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.m2Tab;
      document.querySelectorAll('[data-m2-tab]').forEach(t => t.classList.toggle('aktif', t.dataset.m2Tab === target));
      document.getElementById('panel-m2-kelas').classList.toggle('aktif', target === 'kelas');
      document.getElementById('panel-m2-mapel').classList.toggle('aktif', target === 'mapel');
    });
  });
  document.getElementById('cari-kelas')?.addEventListener('input', debounceDnc(renderTabelKelas, 250));
  document.getElementById('filter-tingkat-kelas')?.addEventListener('change', renderTabelKelas);
  document.getElementById('btn-impor-kelas')?.addEventListener('click', bukaModalImporKelas);
  document.getElementById('btn-tambah-kelas')?.addEventListener('click', () => bukaFormKelas());
  document.getElementById('tbody-kelas')?.addEventListener('click', e => {
    const btnUbah = e.target.closest('[data-ubah-kelas]');
    if (btnUbah) bukaFormKelas(cariById('kelas', btnUbah.dataset.ubahKelas));
    const btnHapus = e.target.closest('[data-hapus-kelas]');
    if (btnHapus) hapusKelasDenganProteksi(btnHapus.dataset.hapusKelas);
  });

  document.getElementById('cari-mapel')?.addEventListener('input', debounceDnc(renderTabelMapel, 250));
  document.getElementById('btn-tambah-mapel')?.addEventListener('click', () => bukaFormMapel());
  document.getElementById('tbody-mapel')?.addEventListener('click', e => {
    const btnUbah = e.target.closest('[data-ubah-mapel]');
    if (btnUbah) bukaFormMapel(cariById('mataPelajaran', btnUbah.dataset.ubahMapel));
    const btnHapus = e.target.closest('[data-hapus-mapel]');
    if (btnHapus) hapusMapelDenganProteksi(btnHapus.dataset.hapusMapel);
  });

  // --- Event DNC-M3 ---
  document.getElementById('btn-muat-ulang-m3')?.addEventListener('click', () => muatM3BankSoal(true));
  document.getElementById('btn-tetapkan-pemilik-soal')?.addEventListener('click', () => bukaModalAturPemilikSoal());
  document.getElementById('btn-tambah-soal')?.addEventListener('click', () => bukaFormSoal());
  document.getElementById('btn-impor-word')?.addEventListener('click', bukaModalImporWord);
  document.getElementById('btn-impor-csv-soal')?.addEventListener('click', bukaModalImporCsvSoal);
  document.getElementById('cari-soal')?.addEventListener('input', debounceDnc(renderTabelSoal, 250));
  ['filter-pemilik-soal', 'filter-kategori-soal', 'filter-mapel-soal', 'filter-tingkat-soal', 'filter-tipe-soal', 'filter-status-soal'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', renderTabelSoal);
  });
  document.getElementById('wadah-paket-soal-m3')?.addEventListener('click', e => {
    const bToggle = e.target.closest('[data-toggle-paket-m3]');
    if (bToggle) { togglePaketSoalM3(bToggle.dataset.togglePaketM3); return; }
    const bAlihkan = e.target.closest('[data-alihkan-pemilik-paket]');
    if (bAlihkan) { bukaModalAturPemilikSoal(bAlihkan.dataset.alihkanPemilikPaket); return; }
    const bSalinPaket = e.target.closest('[data-salin-paket-soal]');
    if (bSalinPaket) { salinPaketSoalKeSaya(bSalinPaket.dataset.salinPaketSoal); return; }
    const bHapusPaket = e.target.closest('[data-hapus-paket-soal]');
    if (bHapusPaket) { hapusPaketSoalDenganProteksi(bHapusPaket.dataset.hapusPaketSoal); return; }
    const bLihat = e.target.closest('[data-pratinjau-soal]');
    if (bLihat) { bukaPratinjauSoal(bLihat.dataset.pratinjauSoal); return; }
    const bDup = e.target.closest('[data-duplikat-soal]');
    if (bDup) { duplikatSoal(bDup.dataset.duplikatSoal); return; }
    const bUbah = e.target.closest('[data-ubah-soal]');
    if (bUbah) { bukaFormSoal(cariById('bankSoal', bUbah.dataset.ubahSoal)); return; }
    const bHapus = e.target.closest('[data-hapus-soal]');
    if (bHapus) hapusSoalDenganProteksi(bHapus.dataset.hapusSoal);
  });

  // --- Event DNC-M4 ---
  document.getElementById('btn-muat-ulang-m4')?.addEventListener('click', () => muatM4PaketAsas(true));
  document.getElementById('btn-tambah-paket')?.addEventListener('click', () => bukaFormPaket());
  document.getElementById('cari-paket')?.addEventListener('input', debounceDnc(renderTabelPaket, 250));
  ['filter-semester-paket', 'filter-mapel-paket', 'filter-kelas-paket', 'filter-status-paket'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', renderTabelPaket);
  });
  document.getElementById('tbody-paket')?.addEventListener('click', e => {
    const bMulai = e.target.closest('[data-mulai-sesi]');
    if (bMulai) mulaiSesiUjianOlehGuru(bMulai.dataset.mulaiSesi);
    const bStop = e.target.closest('[data-berhenti-sesi]');
    if (bStop) hentikanSesiUjianOlehGuru(bStop.dataset.berhentiSesi);
    const bTok = e.target.closest('[data-token-paket]');
    if (bTok) perbaruiTokenPaket(bTok.dataset.tokenPaket);
    const bUbah = e.target.closest('[data-ubah-paket]');
    if (bUbah) bukaFormPaket(cariById('paketAsas', bUbah.dataset.ubahPaket));
    const bHapus = e.target.closest('[data-hapus-paket]');
    if (bHapus) hapusPaketDenganProteksi(bHapus.dataset.hapusPaket);
  });

  // --- Event DNC-M5 ---
  document.getElementById('btn-muat-ulang-m5')?.addEventListener('click', () => muatM5RuangUjian(true));
  document.getElementById('m5-btn-prev')?.addEventListener('click', () => {
    if (sesiUjianAktif && sesiUjianAktif.indeks > 0) {
      sesiUjianAktif.indeks--;
      renderSoalAktifM5();
    }
  });
  document.getElementById('m5-btn-next')?.addEventListener('click', () => {
    if (!sesiUjianAktif) return;
    if (sesiUjianAktif.indeks < sesiUjianAktif.daftarSoal.length - 1) {
      sesiUjianAktif.indeks++;
      renderSoalAktifM5();
    } else {
      konfirmasiKumpulUjian();
    }
  });
  document.getElementById('m5-btn-ragu')?.addEventListener('click', async () => {
    if (!sesiUjianAktif) return;
    const soal = sesiUjianAktif.daftarSoal[sesiUjianAktif.indeks];
    sesiUjianAktif.petaJawaban[soal.id].ragu = !sesiUjianAktif.petaJawaban[soal.id].ragu;
    renderSoalAktifM5();
    await autosaveJawabanUjian();
  });
  document.getElementById('btn-kumpul-ujian')?.addEventListener('click', konfirmasiKumpulUjian);

  // --- Event DNC-M6 ---
  document.getElementById('btn-muat-ulang-m6')?.addEventListener('click', () => muatM6HasilNilai(true));
  document.getElementById('btn-ekspor-csv-nilai')?.addEventListener('click', eksporRekapNilaiCsv);
  document.getElementById('btn-cetak-nilai')?.addEventListener('click', () => {
    const fPaket = document.getElementById('filter-paket-hasil')?.value || '';
    cetakRekapTabelPaketM6(fPaket);
  });
  document.getElementById('cari-hasil')?.addEventListener('input', debounceDnc(renderTabelHasil, 250));
  ['filter-paket-hasil', 'filter-mapel-hasil', 'filter-kelas-hasil', 'filter-status-hasil', 'filter-tuntas-hasil'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', renderTabelHasil);
  });
  document.getElementById('wadah-hasil-paket-m6')?.addEventListener('click', e => {
    const bCetakPaket = e.target.closest('[data-cetak-paket-m6]');
    if (bCetakPaket) { cetakRekapTabelPaketM6(bCetakPaket.dataset.cetakPaketM6); return; }
    const bTogglePaket = e.target.closest('[data-toggle-paket-m6]');
    if (bTogglePaket) { togglePaketHasilM6(bTogglePaket.dataset.togglePaketM6); return; }
    const bKor = e.target.closest('[data-koreksi-hasil]');
    if (bKor) { bukaModalKoreksiHasil(bKor.dataset.koreksiHasil, false); return; }
    const bRinci = e.target.closest('[data-rinci-hasil]');
    if (bRinci) { bukaModalKoreksiHasil(bRinci.dataset.rinciHasil, true); return; }
    const bRes = e.target.closest('[data-reset-hasil]');
    if (bRes) resetSesiHasilUjian(bRes.dataset.resetHasil);
  });

  // --- Event DNC-M7 ---
  document.getElementById('btn-muat-ulang-m7')?.addEventListener('click', () => muatM7Pengguna(true));
  document.getElementById('btn-impor-siswa')?.addEventListener('click', bukaModalImporSiswa);
  document.getElementById('btn-tambah-pengguna')?.addEventListener('click', () => bukaFormPengguna());
  document.getElementById('cari-pengguna')?.addEventListener('input', debounceDnc(renderTabelPengguna, 250));
  ['filter-role-pengguna', 'filter-kelas-pengguna', 'filter-mapel-pengguna', 'filter-status-pengguna'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', renderTabelPengguna);
  });
  document.getElementById('wadah-pengguna-m7')?.addEventListener('click', e => {
    const bToggleKelas = e.target.closest('[data-toggle-kelas-m7]');
    if (bToggleKelas) { toggleKelasSiswaM7(bToggleKelas.dataset.toggleKelasM7); return; }
    const bToggleBimbel = e.target.closest('[data-toggle-bimbel-m7]');
    if (bToggleBimbel) { toggleSiswaBimbelM7(); return; }
    const bTerima = e.target.closest('[data-terima-bimbel]');
    if (bTerima) { terimaPendaftarSiswaBimbel(bTerima.dataset.terimaBimbel); return; }
    const bTolak = e.target.closest('[data-tolak-bimbel]');
    if (bTolak) { tolakPendaftarSiswaBimbel(bTolak.dataset.tolakBimbel); return; }
    const bUbah = e.target.closest('[data-ubah-user]');
    if (bUbah) { bukaFormPengguna(cariById('pengguna', bUbah.dataset.ubahUser)); return; }
    const bTog = e.target.closest('[data-toggle-user]');
    if (bTog) toggleStatusPengguna(bTog.dataset.toggleUser);
  });

  // --- Event DNC-M8 (Profil & Ganti Sandi Mandiri Siswa Bimbel) ---
  document.getElementById('btn-intip-sandi-lama')?.addEventListener('click', e => {
    togglePassword('input-sandi-lama-m8', e.currentTarget);
  });
  document.getElementById('btn-intip-sandi-baru')?.addEventListener('click', e => {
    togglePassword('input-sandi-baru-m8', e.currentTarget);
  });
  document.getElementById('btn-intip-sandi-konf')?.addEventListener('click', e => {
    togglePassword('input-sandi-konf-m8', e.currentTarget);
  });
  document.getElementById('form-ganti-sandi-m8')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('btn-simpan-sandi-m8');
    await denganLoading(btn, 'Menyimpan...', simpanGantiSandiBimbel);
  });

  if (!IS_PREVIEW) {
    try {
      const { auth, authMod } = await muatFirebaseSdk();
      authMod.onAuthStateChanged(auth, async fbUser => {
        if (fbUser && !penggunaAktif && !sedangProsesLogin) {
          let profil = null;
          try {
            profil = await dbGetById(COLLECTIONS.pengguna, fbUser.uid);
          } catch (_) {}
          if (profil && profil.statusAktif === false) {
            await authMod.signOut(auth);
            return;
          }
          if (profil && profil.role && normalisasiRoleDnc(profil.role) !== 'Admin') {
            await authMod.signOut(auth);
            return;
          }
          const profilAdmin = await sinkronProfilAdminDnc(fbUser, profil);
          await masukKeAplikasi(profilAdmin);
        }
      });
    } catch (err) {
      tampilkanToast('Periksa firebaseConfig di app.js sebelum mode produksi.', 'error');
    }
  }
}

document.addEventListener('DOMContentLoaded', inisialisasiAplikasiDnc);
// ===== AKHIR BLOK: DNC_BOOT =====
