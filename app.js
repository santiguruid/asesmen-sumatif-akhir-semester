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

const MENU_DAFTAR = [
  { id: 'DNC-M1', label: 'Dashboard', pendek: 'Beranda', icon: 'icon-dashboard', roles: ['Admin', 'Guru'] },
  { id: 'DNC-M2', label: 'Master Kelas & Mapel', pendek: 'Master', icon: 'icon-master', roles: ['Admin'] },
  { id: 'DNC-M3', label: 'Bank Soal', pendek: 'Soal', icon: 'icon-bank', roles: ['Admin', 'Guru'] },
  { id: 'DNC-M4', label: 'Jadwal & Paket ASAS', pendek: 'Paket', icon: 'icon-jadwal', roles: ['Admin', 'Guru'] },
  { id: 'DNC-M5', label: 'Ruang Ujian ASAS', pendek: 'Ujian', icon: 'icon-ujian', roles: ['Siswa'] },
  { id: 'DNC-M6', label: 'Hasil & Rekap Nilai', pendek: 'Nilai', icon: 'icon-hasil', roles: ['Admin', 'Guru', 'Siswa'] },
  { id: 'DNC-M7', label: 'Manajemen Pengguna', pendek: 'Pengguna', icon: 'icon-users', roles: ['Admin'] }
];

const TINGKAT_LIST = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const TIPE_SOAL_LIST = ['Pilihan Ganda', 'Pilihan Ganda Kompleks', 'Isian Singkat', 'Uraian'];
// ===== AKHIR BLOK: DNC_CONFIG =====

// ===== BLOK: DNC_PWA =====
function inisialisasiPwaDnc() {
  try {
    const ikonSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='36' fill='%232563EB'/%3E%3Cpath d='M48 64h96M48 96h68M48 128h46' stroke='%23FFFFFF' stroke-width='14' stroke-linecap='round'/%3E%3Ccircle cx='136' cy='124' r='22' fill='%23F59E0B'/%3E%3C/svg%3E";
    const manifestObj = {
      name: 'Sistem Asesmen Sumatif Akhir Semester (ASAS) - DigitalNetCare',
      short_name: 'Portal ASAS',
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
  'DNC-M7': false
};

let menuAktif = '';
let penggunaAktif = null;
let roleLoginDipilih = 'Admin';
let chartBarInstance = null;
let chartDonutInstance = null;

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
  if (penggunaAktif.role === 'Guru') {
    const ampu = Array.isArray(penggunaAktif.mapelIds) ? penggunaAktif.mapelIds : [];
    return stateMemori.mataPelajaran.filter(m => ampu.includes(m.id));
  }
  return stateMemori.mataPelajaran;
}

function bolehAksesMapel(mapelId) {
  if (!penggunaAktif) return false;
  if (penggunaAktif.role === 'Admin') return true;
  if (penggunaAktif.role === 'Guru') {
    return Array.isArray(penggunaAktif.mapelIds) && penggunaAktif.mapelIds.includes(mapelId);
  }
  return false;
}

function daftarTipeSoalDiizinkanForm() {
  return TIPE_SOAL_LIST;
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

async function muatDataBankSoal() {
  const semua = await dbList(COLLECTIONS.bankSoal, { urutDesc: 'dibuat', batas: 400 });
  stateMemori.bankSoal = penggunaAktif?.role === 'Guru'
    ? semua.filter(s => bolehAksesMapel(s.mapelId))
    : semua;
}

async function muatDataPaket() {
  const semua = await dbList(COLLECTIONS.paketAsas, { urutDesc: 'dibuat', batas: 100 });
  if (penggunaAktif?.role === 'Guru') {
    stateMemori.paketAsas = semua.filter(p => bolehAksesMapel(p.mapelId));
  } else if (penggunaAktif?.role === 'Siswa') {
    stateMemori.paketAsas = semua.filter(p => Array.isArray(p.kelasIds) && p.kelasIds.includes(penggunaAktif.kelasId));
  } else {
    stateMemori.paketAsas = semua;
  }
}

async function muatDataHasil() {
  const semua = await dbList(COLLECTIONS.hasilUjian, { urutDesc: 'dibuat', batas: 100 });
  if (penggunaAktif?.role === 'Guru') {
    stateMemori.hasilUjian = semua.filter(h => bolehAksesMapel(h.mapelId));
  } else if (penggunaAktif?.role === 'Siswa') {
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
  roleLoginDipilih = role;
  document.querySelectorAll('[data-login-role]').forEach(btn => {
    const aktif = btn.getAttribute('data-login-role') === role;
    btn.classList.toggle('aktif', aktif);
    btn.setAttribute('aria-selected', aktif ? 'true' : 'false');
  });
  const lbl = document.getElementById('label-login-identitas');
  const inp = document.getElementById('input-login-identitas');
  if (role === 'Admin') {
    lbl.textContent = 'Email Admin';
    inp.type = 'email';
    inp.placeholder = 'Masukkan email Admin terdaftar';
  } else if (role === 'Guru') {
    lbl.textContent = 'Email atau NIP/NUPTK Guru';
    inp.type = 'text';
    inp.placeholder = 'Masukkan email atau NIP Guru';
  } else {
    lbl.textContent = 'NIS/NISN atau Email Siswa';
    inp.type = 'text';
    inp.placeholder = 'Masukkan NIS/NISN atau email Siswa';
  }
}

async function prosesLoginDnc(identitas, password) {
  const idTrim = String(identitas || '').trim();
  const pw = String(password || '');
  if (!idTrim || !pw) throw new Error('Identitas login dan password wajib diisi.');

  if (IS_PREVIEW) {
    const daftar = memoriPreview[COLLECTIONS.pengguna] || [];
    const cari = teks(idTrim);
    const cocok = daftar.find(u =>
      u.role === roleLoginDipilih &&
      (teks(u.email) === cari || teks(u.nomorInduk) === cari)
    );
    if (!cocok) throw new Error(`Akun ${roleLoginDipilih} tidak ditemukan pada data preview.`);
    if (!cocok.statusAktif) throw new Error('Akun Anda sedang dinonaktifkan oleh Admin.');
    if (cocok.role === 'Admin') {
      if (pw !== 'admin123') throw new Error('Password Admin salah.');
    } else {
      const h = await hashTeks(pw);
      if (cocok.passwordHash && cocok.passwordHash !== h) throw new Error('Password salah.');
    }
    return cocok;
  }

  // MODE PRODUKSI MURNI (HYBRID AUTH)
  const { auth, authMod } = await muatFirebaseSdk();
  if (roleLoginDipilih === 'Admin') {
    let cred;
    try {
      cred = await authMod.signInWithEmailAndPassword(auth, idTrim, pw);
    } catch (e) {
      throw new Error('Email atau password Admin tidak valid.');
    }
    const uid = cred.user.uid;
    let profil = await dbGetById(COLLECTIONS.pengguna, uid);
    if (!profil) {
      const semua = await dbList(COLLECTIONS.pengguna);
      profil = semua.find(u => teks(u.email) === teks(idTrim)) || null;
    }
    if (profil && profil.role !== 'Admin') {
      await authMod.signOut(auth);
      throw new Error('Akun ini tidak memiliki hak akses Admin.');
    }
    if (profil && profil.statusAktif === false) {
      await authMod.signOut(auth);
      throw new Error('Akun Admin ini berstatus nonaktif.');
    }
    return profil || {
      id: uid,
      email: cred.user.email || idTrim,
      namaLengkap: cred.user.displayName || 'Administrator ASAS',
      nomorInduk: 'ADMIN-01',
      role: 'Admin',
      kelasId: '',
      mapelIds: [],
      statusAktif: true
    };
  }

  const hashInput = await hashTeks(pw);
  const semuaPengguna = await dbList(COLLECTIONS.pengguna);
  const cari = teks(idTrim);
  const userCocok = semuaPengguna.find(u =>
    u.role === roleLoginDipilih &&
    (teks(u.email) === cari || teks(u.nomorInduk) === cari)
  );
  if (!userCocok) throw new Error(`Akun ${roleLoginDipilih} tidak ditemukan.`);
  if (userCocok.statusAktif === false) throw new Error('Akun Anda berstatus nonaktif. Hubungi Admin.');
  if (!userCocok.passwordHash || userCocok.passwordHash !== hashInput) {
    throw new Error('Password yang dimasukkan salah.');
  }
  return userCocok;
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

  const menuAwal = userObj.role === 'Siswa' ? 'DNC-M5' : 'DNC-M1';
  await bukaMenu(menuAwal);
}

async function keluarAplikasi() {
  if (typeof hentikanTimerUjian === 'function') hentikanTimerUjian();
  if (typeof hentikanListenerPaketSiswa === 'function') hentikanListenerPaketSiswa();
  penggunaAktif = null;
  resetCacheMenu();
  if (!IS_PREVIEW && fb?.auth?.currentUser) {
    try { await fb.authMod.signOut(fb.auth); } catch (_) {}
  }
  document.getElementById('dnc-aplikasi').classList.add('dnc-disembunyikan');
  document.getElementById('dnc-halaman-login').classList.remove('dnc-disembunyikan');
  document.getElementById('input-login-password').value = '';
  tampilkanToast('Anda telah keluar dari Portal ASAS.', 'info');
}

function bangunNavigasiRole() {
  const diizinkan = MENU_DAFTAR.filter(m => m.roles.includes(penggunaAktif.role));
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
}
// ===== AKHIR BLOK: DNC_AUTH =====

// ===== BLOK: DNC_M1_DASHBOARD =====
async function muatM1Dashboard(paksa = false) {
  if (!sudahDimuat['DNC-M1'] || paksa) {
    await Promise.all([muatDataDasar(), muatDataPengguna(), muatDataBankSoal(), muatDataPaket(), muatDataHasil()]);
    sudahDimuat['DNC-M1'] = true;
  }

  const sub = document.getElementById('subjudul-m1');
  if (penggunaAktif.role === 'Guru') {
    const namaAmpu = daftarMapelDiizinkan().map(m => m.namaMapel).join(', ') || 'belum ditetapkan';
    sub.textContent = `Cakupan Guru — Mata Pelajaran Ampu: ${namaAmpu}.`;
  } else {
    sub.textContent = 'Ringkasan capaian pelaksanaan, bank soal, dan status ketuntasan seluruh mata pelajaran.';
  }

  const siswaAktif = stateMemori.pengguna.filter(u => u.role === 'Siswa' && u.statusAktif !== false);
  const paketAktif = stateMemori.paketAsas.filter(p => p.statusPaket === 'Aktif');
  const hasilSelesai = stateMemori.hasilUjian.filter(h => h.statusUjian === 'Selesai');
  const rataSkor = hasilSelesai.length
    ? bulatDua(hasilSelesai.reduce((s, h) => s + Number(h.skorAkhir || 0), 0) / hasilSelesai.length)
    : 0;

  document.getElementById('kpi-siswa-aktif').textContent = siswaAktif.length;
  document.getElementById('kpi-bank-soal').textContent = stateMemori.bankSoal.length;
  document.getElementById('kpi-paket-aktif').textContent = paketAktif.length;
  document.getElementById('kpi-rata-skor').textContent = rataSkor;

  const peringatanSiswa = [];
  const barisJadwal = paketAktif.map(p => {
    const targetSiswa = siswaAktif.filter(s => Array.isArray(p.kelasIds) && p.kelasIds.includes(s.kelasId));
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
  ], 'Belum ada paket ASAS berstatus Aktif');

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
    await muatDataDasar();
    sudahDimuat['DNC-M2'] = true;
  }
  renderTabelKelas();
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
  const q = teks(document.getElementById('cari-mapel')?.value || '');
  const data = stateMemori.mataPelajaran.filter(m =>
    !q || `${teks(m.kodeMapel)} ${teks(m.namaMapel)}`.includes(q)
  );
  renderTabelDnc('tbody-mapel', data, [
    { label: 'Kode Mapel', render: m => `<span class="dnc-mono">${esc(m.kodeMapel)}</span>` },
    { label: 'Nama Mata Pelajaran', key: 'namaMapel' },
    { label: 'KKM', render: m => `<strong>${esc(m.kkm)}</strong>` },
    {
      label: 'Aksi', aksi: true,
      render: m => `<div class="dnc-aksi-baris">
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-ubah-mapel="${esc(m.id)}">Ubah</button>
        <button type="button" class="dnc-tombol dnc-tombol-bahaya dnc-tombol-kecil" data-hapus-mapel="${esc(m.id)}">Hapus</button>
      </div>`
    }
  ], 'Belum ada data mata pelajaran');
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

function bukaFormMapel(item = null) {
  bukaModalFormDnc({
    judul: item ? 'Ubah Mata Pelajaran' : 'Tambah Mata Pelajaran',
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-kodeMapel">Kode Mata Pelajaran *</label>
          <input id="f-kodeMapel" class="dnc-input" type="text" placeholder="Contoh: MTK-06" value="${esc(item?.kodeMapel || '')}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-kkm">KKM (0–100) *</label>
          <input id="f-kkm" class="dnc-input" type="number" min="0" max="100" value="${esc(item?.kkm ?? 75)}" required>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="f-namaMapel">Nama Mata Pelajaran *</label>
          <input id="f-namaMapel" class="dnc-input" type="text" placeholder="Contoh: Matematika" value="${esc(item?.namaMapel || '')}" required>
        </div>
      </div>`,
    onSubmit: async () => {
      const kkm = Number(document.getElementById('f-kkm').value);
      const payload = {
        kodeMapel: document.getElementById('f-kodeMapel').value.trim(),
        namaMapel: document.getElementById('f-namaMapel').value.trim(),
        kkm
      };
      if (!payload.kodeMapel || !payload.namaMapel) throw new Error('Kode dan nama mata pelajaran wajib diisi.');
      if (isNaN(kkm) || kkm < 0 || kkm > 100) throw new Error('Nilai KKM harus berada pada rentang 0 sampai 100.');
      if (!(await cekUnik(COLLECTIONS.mataPelajaran, 'kodeMapel', payload.kodeMapel, item?.id))) {
        throw new Error(`Kode mata pelajaran "${payload.kodeMapel}" sudah digunakan.`);
      }
      if (item) await dbUpdate(COLLECTIONS.mataPelajaran, item.id, payload);
      else await dbCreate(COLLECTIONS.mataPelajaran, payload);
      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M2', 'DNC-M3', 'DNC-M4', 'DNC-M6', 'DNC-M7']);
      await muatM2Master(true);
      tampilkanToast(item ? 'Mata pelajaran diperbarui.' : 'Mata pelajaran ditambahkan.');
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
  bukaKonfirmasi({
    judul: 'Hapus Mata Pelajaran',
    pesan: `Yakin ingin menghapus mata pelajaran ${m.namaMapel}?`,
    labelYa: 'Ya, Hapus',
    onYa: async () => {
      const [users, soals, pakets, hasils] = await Promise.all([
        dbList(COLLECTIONS.pengguna),
        dbList(COLLECTIONS.bankSoal),
        dbList(COLLECTIONS.paketAsas),
        dbList(COLLECTIONS.hasilUjian)
      ]);
      if (users.some(u => Array.isArray(u.mapelIds) && u.mapelIds.includes(id))) throw new Error('Mata pelajaran tidak dapat dihapus karena masih diampu oleh akun Guru.');
      if (soals.some(s => s.mapelId === id)) throw new Error('Mata pelajaran tidak dapat dihapus karena masih memiliki butir Bank Soal.');
      if (pakets.some(p => p.mapelId === id)) throw new Error('Mata pelajaran tidak dapat dihapus karena masih digunakan pada Paket ASAS.');
      if (hasils.some(h => h.mapelId === id)) throw new Error('Mata pelajaran tidak dapat dihapus karena masih memiliki rekaman Hasil Ujian.');
      await dbDelete(COLLECTIONS.mataPelajaran, id);
      resetCacheMenu(['DNC-M1', 'DNC-M2', 'DNC-M3', 'DNC-M4', 'DNC-M6', 'DNC-M7']);
      await muatM2Master(true);
      tampilkanToast('Mata pelajaran berhasil dihapus.');
    }
  });
}
// ===== AKHIR BLOK: DNC_M2_MASTER =====

// ===== BLOK: DNC_M3_BANK_SOAL =====
async function muatM3BankSoal(paksa = false) {
  if (!sudahDimuat['DNC-M3'] || paksa) {
    await Promise.all([muatDataDasar(), muatDataBankSoal()]);
    sudahDimuat['DNC-M3'] = true;
  }
  const mapelOpsi = daftarMapelDiizinkan().map(m => ({ value: m.id, label: `${m.kodeMapel} - ${m.namaMapel}` }));
  isiSelectOpsi('filter-mapel-soal', mapelOpsi, 'Semua Mapel');
  renderTabelSoal();
}

function renderTabelSoal() {
  const q = teks(document.getElementById('cari-soal')?.value || '');
  const fMapel = document.getElementById('filter-mapel-soal')?.value || '';
  const fTingkat = document.getElementById('filter-tingkat-soal')?.value || '';
  const fTipe = document.getElementById('filter-tipe-soal')?.value || '';
  const fStatus = document.getElementById('filter-status-soal')?.value || '';

  const data = stateMemori.bankSoal.filter(s => {
    if (fMapel && s.mapelId !== fMapel) return false;
    if (fTingkat && s.tingkat !== fTingkat) return false;
    if (fTipe && s.tipeSoal !== fTipe) return false;
    if (fStatus === 'aktif' && !s.statusAktif) return false;
    if (fStatus === 'nonaktif' && s.statusAktif) return false;
    if (q && !`${teks(s.kodeSoal)} ${teks(s.pertanyaan)} ${teks(s.kunciJawaban)}`.includes(q)) return false;
    return true;
  });

  renderTabelDnc('tbody-soal', data, [
    { label: 'Kode Soal', render: s => `<span class="dnc-mono">${esc(s.kodeSoal)}</span>` },
    { label: 'Mata Pelajaran', render: s => esc(namaMapelById(s.mapelId)) },
    { label: 'Tingkat', render: s => `<span class="dnc-badge dnc-badge-biru">${esc(s.tingkat)}</span>` },
    { label: 'Tipe Soal', render: s => badgeTipeSoal(s.tipeSoal) },
    { label: 'Pertanyaan', render: s => `<div class="dnc-teks-potong" title="${esc(s.pertanyaan)}">${esc(s.pertanyaan)}</div>` },
    {
      label: 'Kunci Jawaban',
      render: s => s.tipeSoal === 'Pilihan Ganda' || s.tipeSoal === 'Pilihan Ganda Kompleks'
        ? `<strong class="dnc-mono">${esc(s.kunciJawaban || '-')}</strong>`
        : `<div class="dnc-teks-potong" style="max-width:160px" title="${esc(s.kunciJawaban || '')}">${esc(s.kunciJawaban || 'Rubrik')}</div>`
    },
    { label: 'Bobot', render: s => `<strong>${esc(s.bobotNilai)}</strong>` },
    { label: 'Status', render: s => badgeStatus(s.statusAktif ? 'Aktif' : 'Nonaktif') },
    {
      label: 'Aksi', aksi: true,
      render: s => `<div class="dnc-aksi-baris">
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-pratinjau-soal="${esc(s.id)}">Lihat</button>
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-duplikat-soal="${esc(s.id)}">Duplikat</button>
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-ubah-soal="${esc(s.id)}">Ubah</button>
        <button type="button" class="dnc-tombol dnc-tombol-bahaya dnc-tombol-kecil" data-hapus-soal="${esc(s.id)}">Hapus</button>
      </div>`
    }
  ], 'Belum ada butir soal');
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
  const mapelList = daftarMapelDiizinkan();
  if (!mapelList.length) {
    tampilkanToast('Tambahkan mata pelajaran terlebih dahulu sebelum membuat soal.', 'error');
    return;
  }
  const opsi = opsiMapToObj(item?.opsiJawaban);
  const tipeAwal = item?.tipeSoal || 'Pilihan Ganda';
  const kunciSet = parseKunciKompleksSet(item?.kunciJawaban);

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
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="f-pertanyaan">Pertanyaan *</label>
          <textarea id="f-pertanyaan" class="dnc-textarea" placeholder="Tulis pertanyaan soal secara lengkap..." required>${esc(item?.pertanyaan || '')}</textarea>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="f-urlGambar">URL Gambar Pendukung (Opsional)</label>
          <input id="f-urlGambar" class="dnc-input" type="text" placeholder="https://... atau hasil ekstraksi Word" value="${esc(item?.urlGambar || '')}">
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
        <div id="wadah-kunci-teks" class="dnc-form-grup ${tipeAwal === 'Pilihan Ganda Kompleks' ? 'dnc-disembunyikan' : ''}">
          <label class="dnc-label" for="f-kunciJawaban">Kunci Jawaban / Rubrik</label>
          <input id="f-kunciJawaban" class="dnc-input" type="text" placeholder="A-E untuk PG, teks untuk Isian (pisah | jika lebih dari 1), rubrik Uraian" value="${esc(item?.kunciJawaban || '')}">
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-bobotNilai">Bobot / Skor Soal *</label>
          <input id="f-bobotNilai" class="dnc-input" type="number" min="0.5" step="0.5" value="${esc(item?.bobotNilai ?? 10)}" required>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-check-label">
            <input id="f-statusAktifSoal" type="checkbox" ${(item ? item.statusAktif : true) ? 'checked' : ''}>
            <span>Status Aktif (tersedia untuk dipilih pada Paket ASAS)</span>
          </label>
        </div>
      </div>`,
    onMount: () => {
      const selTipe = document.getElementById('f-tipeSoal');
      const perbaruiTampilanTipe = () => {
        const tp = selTipe.value;
        document.getElementById('wadah-opsi-pg').classList.toggle('dnc-disembunyikan', !adalahTipeBeropsi(tp));
        document.getElementById('wadah-kunci-kompleks').classList.toggle('dnc-disembunyikan', tp !== 'Pilihan Ganda Kompleks');
        document.getElementById('wadah-kunci-teks').classList.toggle('dnc-disembunyikan', tp === 'Pilihan Ganda Kompleks');
      };
      selTipe.addEventListener('change', perbaruiTampilanTipe);
      perbaruiTampilanTipe();
    },
    onSubmit: async () => {
      const tipeSoal = document.getElementById('f-tipeSoal').value;
      const kodeSoal = document.getElementById('f-kodeSoal').value.trim();
      const mapelId = document.getElementById('f-mapelId').value;
      const tingkat = document.getElementById('f-tingkatSoal').value;
      const pertanyaan = document.getElementById('f-pertanyaan').value.trim();
      const urlGambar = document.getElementById('f-urlGambar').value.trim();
      let kunciJawaban = document.getElementById('f-kunciJawaban').value.trim();
      const bobotNilai = Number(document.getElementById('f-bobotNilai').value);
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
      } else if (tipeSoal === 'Isian Singkat' && !kunciJawaban) {
        throw new Error('Soal Isian Singkat wajib memiliki kunci jawaban.');
      }

      if (!(await cekUnik(COLLECTIONS.bankSoal, 'kodeSoal', kodeSoal, item?.id))) {
        throw new Error(`Kode soal "${kodeSoal}" sudah digunakan.`);
      }

      const payload = {
        kodeSoal, mapelId, tingkat, tipeSoal, pertanyaan, urlGambar,
        opsiJawaban, kunciJawaban, bobotNilai, statusAktif,
        dibuatOleh: item?.dibuatOleh || penggunaAktif.id
      };
      if (item) await dbUpdate(COLLECTIONS.bankSoal, item.id, payload);
      else await dbCreate(COLLECTIONS.bankSoal, payload);

      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M3', 'DNC-M4']);
      await muatM3BankSoal(true);
      tampilkanToast(item ? 'Butir soal berhasil diperbarui.' : 'Butir soal berhasil disimpan.');
    }
  });
}

function bukaPratinjauSoal(id) {
  const s = cariById('bankSoal', id);
  if (!s) return;
  const kunciSet = parseKunciKompleksSet(s.kunciJawaban);
  const opsiHtml = adalahTipeBeropsi(s.tipeSoal)
    ? `<div class="dnc-opsi-list dnc-mt-12">${(s.opsiJawaban || []).map(o => `
        <div class="dnc-opsi-item ${kunciSet.has(o.kode) ? 'terpilih' : ''}">
          <span class="dnc-opsi-kode">${esc(o.kode)}</span>
          <span>${esc(o.teks)}</span>
        </div>`).join('')}</div>`
    : `<div class="dnc-jawaban-box dnc-mt-12"><strong>Kunci / Rubrik (${esc(s.tipeSoal)}):</strong>\n${esc(s.kunciJawaban || 'Belum diisi')}</div>`;

  bukaModalFormDnc({
    judul: `Pratinjau Soal — ${s.kodeSoal}`,
    tampilSimpan: false,
    labelBatal: 'Tutup',
    htmlKonten: `
      <div class="dnc-pratinjau-soal">
        <div class="dnc-flex-between dnc-mb-12">
          <span class="dnc-badge dnc-badge-biru">${esc(namaMapelById(s.mapelId))} • ${esc(labelTingkat(s.tingkat))}</span>
          <div class="dnc-flex-gap">${badgeTipeSoal(s.tipeSoal)}<span class="dnc-badge dnc-badge-abu">Bobot ${esc(s.bobotNilai)}</span></div>
        </div>
        ${s.urlGambar ? `<img src="${esc(s.urlGambar)}" alt="Gambar soal" class="dnc-soal-gambar">` : ''}
        <div class="dnc-soal-teks">${esc(s.pertanyaan)}</div>
        ${opsiHtml}
      </div>`
  });
}

async function duplikatSoal(id) {
  const s = cariById('bankSoal', id);
  if (!s) return;
  const kodeBaru = `${s.kodeSoal}-CPY${Math.floor(10 + Math.random() * 89)}`;
  await dbCreate(COLLECTIONS.bankSoal, {
    kodeSoal: kodeBaru,
    mapelId: s.mapelId,
    tingkat: s.tingkat,
    tipeSoal: s.tipeSoal,
    pertanyaan: `${s.pertanyaan} (Salinan)`,
    urlGambar: s.urlGambar || '',
    opsiJawaban: s.opsiJawaban || [],
    kunciJawaban: s.kunciJawaban || '',
    bobotNilai: s.bobotNilai,
    statusAktif: s.statusAktif,
    dibuatOleh: penggunaAktif.id
  });
  resetCacheMenu(['DNC-M1', 'DNC-M3']);
  await muatM3BankSoal(true);
  tampilkanToast(`Soal berhasil diduplikasi dengan kode ${kodeBaru}.`);
}

function hapusSoalDenganProteksi(id) {
  const s = cariById('bankSoal', id);
  if (!s) return;
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
      resetCacheMenu(['DNC-M1', 'DNC-M3', 'DNC-M4']);
      await muatM3BankSoal(true);
      tampilkanToast('Butir soal berhasil dihapus.');
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
    'TEMPLAT SOAL ASAS LENGKAP (KUNCI & PEDOMAN PENSKORAN) - DIGITALNETCARE',
    '',
    'A. PILIHAN GANDA (Skor @10)',
    '1. Hasil dari 24 x 5 adalah ...',
    'A. 100',
    'B. 120',
    'C. 125',
    'D. 140',
    '',
    'B. PILIHAN GANDA KOMPLEKS (Skor @20)',
    '2. Pilih lebih dari satu bilangan prima di bawah ini:',
    'A. 2',
    'B. 9',
    'C. 11',
    'D. 15',
    '',
    'C. ISIAN SINGKAT (Skor @20)',
    '3. Ibukota Provinsi Daerah Istimewa Yogyakarta adalah ....',
    '',
    'D. URAIAN (Skor @50)',
    '4. Jelaskan mengapa tumbuhan hijau memerlukan cahaya matahari dalam proses fotosintesis!',
    '',
    'KUNCI JAWABAN DAN PEDOMAN PENSKORAN',
    '1. B (Skor: 10)',
    '2. A, C (Skor: 20)',
    '3. Yogyakarta (Skor: 20)',
    '4. Cahaya matahari digunakan sebagai sumber energi untuk mengubah air dan karbon dioksida menjadi glukosa dan oksigen. (Skor: 50)'
  ], 'Templat_Soal_Lengkap_ASAS_DigitalNetCare.docx');
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

function kompresDataGambar(dataUrl, maksLebar = 640, kualitas = 0.72) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const skala = img.width > maksLebar ? maksLebar / img.width : 1;
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * skala));
      c.height = Math.max(1, Math.round(img.height * skala));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const hasil = c.toDataURL('image/jpeg', kualitas);
      resolve(hasil.length < 240000 ? hasil : '');
    };
    img.onerror = () => resolve('');
    img.src = dataUrl;
  });
}

// --- Mesin Parser Pintar Bank Soal (Word, PDF, Excel) ---
function deteksiTipeDariTeks(teksRaw, opsiCount, kunciRaw, pertanyaanRaw) {
  const t = teks(teksRaw || '');
  const p = teks(pertanyaanRaw || '');
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
  const masalah = [];
  if (!item.pertanyaan || !item.pertanyaan.trim()) masalah.push('Pertanyaan kosong');
  if (!Number(item.bobotNilai) || Number(item.bobotNilai) <= 0) masalah.push('Bobot/skor tidak valid');

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
  } else if (item.tipeSoal === 'Isian Singkat') {
    if (!String(item.kunciJawaban || '').trim()) masalah.push('Kunci Isian Singkat kosong');
  }

  item.valid = masalah.length === 0;
  item.catatanValidasi = masalah.length ? masalah.join('; ') : 'Terdeteksi otomatis & siap disimpan';
  return item;
}

function pecahOpsiSejajar(teksBaris) {
  const regex = /(?:^|\s{2,}|\t)([A-Ea-e])[\.\)]\s+/g;
  const posisi = [];
  let m;
  while ((m = regex.exec(teksBaris)) !== null) {
    const startHuruf = m.index + m[0].search(/[A-Ea-e]/);
    posisi.push({ kode: m[1].toUpperCase(), start: startHuruf, isiMulai: regex.lastIndex });
  }
  if (posisi.length < 2) return null;
  const hasil = [];
  for (let i = 0; i < posisi.length; i++) {
    const akhir = i + 1 < posisi.length ? posisi[i + 1].start : teksBaris.length;
    const isi = teksBaris.slice(posisi[i].isiMulai, akhir).trim();
    if (isi) hasil.push({ kode: posisi[i].kode, teks: isi });
  }
  return hasil.length >= 2 ? hasil : null;
}

function ubahHtmlWordKeBarisTerstruktur(htmlStr) {
  const doc = new DOMParser().parseFromString(htmlStr, 'text/html');
  const hasilBaris = [];
  const tabelTerpisah = [];
  const hurufOpsi = ['A', 'B', 'C', 'D', 'E'];

  const teksLangsungLi = li => {
    const klon = li.cloneNode(true);
    klon.querySelectorAll('ol, ul').forEach(sub => sub.remove());
    return klon.textContent.replace(/\s+/g, ' ').trim();
  };

  const prosesDaftar = (listEl, level) => {
    let nomor = Number(listEl.getAttribute('start') || 1);
    const tipeList = listEl.getAttribute('type') || '';
    const isHuruf = tipeList === 'a' || tipeList === 'A' || level > 0;
    let idxHuruf = 0;

    [...listEl.children].forEach(child => {
      if (child.tagName !== 'LI') return;
      const imgEl = child.querySelector(':scope > img, :scope > p > img');
      const imgSrc = imgEl ? imgEl.getAttribute('src') || '' : '';
      const boldKuat = Boolean(child.querySelector(':scope > strong, :scope > b, :scope > p > strong, :scope > p > b'));
      const txt = teksLangsungLi(child);

      if (txt) {
        const sudahBernomor = /^\d+[\.\)]\s/.test(txt);
        const sudahBerhuruf = /^[A-Ea-e][\.\)]\s/.test(txt);
        const adalahMeta = /^(?:kunci|jawaban|tipe|jenis|bobot|skor|nilai|kode)/i.test(txt);
        if (sudahBernomor || sudahBerhuruf || adalahMeta) {
          hasilBaris.push({ teks: txt, img: imgSrc, bold: boldKuat });
        } else if (isHuruf && idxHuruf < hurufOpsi.length) {
          hasilBaris.push({ teks: `${hurufOpsi[idxHuruf]}. ${txt}`, img: imgSrc, bold: boldKuat });
          idxHuruf++;
        } else {
          hasilBaris.push({ teks: `${nomor}. ${txt}`, img: imgSrc, bold: boldKuat });
          nomor++;
        }
      } else if (imgSrc) {
        hasilBaris.push({ teks: '', img: imgSrc, bold: false });
      }

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
        [...tr.querySelectorAll('th,td')].map(td => ({
          teks: td.textContent.replace(/\s+/g, ' ').trim(),
          img: td.querySelector('img')?.getAttribute('src') || ''
        }))
      );
      tabelTerpisah.push(rows);
    } else if (tag === 'OL' || tag === 'UL') {
      prosesDaftar(el, 0);
    } else {
      const imgEl = el.querySelector('img');
      const imgSrc = imgEl ? imgEl.getAttribute('src') || '' : '';
      const txt = el.textContent.replace(/\s+/g, ' ').trim();
      const boldKuat = Boolean(el.querySelector('strong, b')) && el.textContent.trim().length < 90;
      if (txt || imgSrc) {
        hasilBaris.push({ teks: txt, img: imgSrc, bold: boldKuat });
      }
    }
  });

  return { baris: hasilBaris, tabel: tabelTerpisah };
}

function ekstraksiSoalDariTabel(rows, kodeMapelPrefix, cap) {
  if (!rows || rows.length < 2) return { soal: [], kunciMap: {}, bobotBagian: {} };
  const header = rows[0].map(c => teks(c.teks));
  const idxTanya = header.findIndex(h => h.includes('pertanyaan') || h.includes('butir soal') || h === 'soal');
  const idxKunci = header.findIndex(h => h.includes('kunci') || h.includes('jawaban'));
  const idxNo = header.findIndex(h => h === 'no' || h === 'no.' || h.includes('nomor'));
  const idxBobot = header.findIndex(h => h.includes('bobot') || h.includes('skor') || h.includes('nilai') || h.includes('poin'));
  const idxTipe = header.findIndex(h => h.includes('tipe') || h.includes('jenis') || h.includes('bentuk'));

  if (idxTanya >= 0) {
    const idxKode = header.findIndex(h => h.includes('kode'));
    const soal = [];
    for (let r = 1; r < rows.length; r++) {
      const sel = rows[r];
      const ambil = i => (i >= 0 && sel[i] ? sel[i].teks.trim() : '');
      const pertanyaan = ambil(idxTanya);
      if (!pertanyaan) continue;
      const opsiJawaban = [];
      ['a', 'b', 'c', 'd', 'e'].forEach(hrf => {
        const io = header.findIndex(h => h === hrf || h === `opsi ${hrf}` || h === `pilihan ${hrf}` || h === `opsi_${hrf}` || h === `opsi${hrf}`);
        const v = ambil(io);
        if (v) opsiJawaban.push({ kode: hrf.toUpperCase(), teks: v });
      });
      const kunciRaw = ambil(idxKunci);
      const tipeSoal = deteksiTipeDariTeks(ambil(idxTipe), opsiJawaban.length, kunciRaw, pertanyaan);
      const bobotNilai = Number(ambil(idxBobot).replace(',', '.')) || 10;
      soal.push(validasiItemSoalPintar({
        dipilih: true,
        nomorAsli: Number(ambil(idxNo)) || (soal.length + 1),
        kodeSoal: ambil(idxKode) || `${kodeMapelPrefix}-S${cap}-${String(soal.length + 1).padStart(2, '0')}`,
        tipeSoal,
        pertanyaan,
        urlGambar: sel[idxTanya]?.img || '',
        opsiJawaban: adalahTipeBeropsi(tipeSoal) ? opsiJawaban : [],
        kunciJawaban: kunciRaw,
        bobotNilai
      }));
    }
    return { soal, kunciMap: {}, bobotBagian: {} };
  }

  const kunciMap = {};
  const bobotBagian = {};
  if (idxKunci >= 0 || idxBobot >= 0) {
    for (let r = 1; r < rows.length; r++) {
      const sel = rows[r];
      const ambil = i => (i >= 0 && sel[i] ? sel[i].teks.trim() : '');
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
  }
  return { soal: [], kunciMap, bobotBagian };
}

function ekstrakSoalPintarDariSumber({ baris, tabel }, kodeMapelPrefix) {
  const cap = Date.now().toString().slice(-4);
  let daftarSoal = [];
  const kunciGlobal = {};
  const kunciPerBagian = {};
  const bobotDefaultTipe = {};

  (tabel || []).forEach(rows => {
    const res = ekstraksiSoalDariTabel(rows, kodeMapelPrefix, cap);
    if (res.soal.length) daftarSoal.push(...res.soal);
    Object.entries(res.kunciMap).forEach(([k, v]) => {
      kunciGlobal[k] = { ...(kunciGlobal[k] || {}), ...v };
    });
    Object.assign(bobotDefaultTipe, res.bobotBagian);
  });

  if (daftarSoal.length && (!baris || baris.length < 4)) {
    return daftarSoal.map(s => terapkanKunciDanBobot(s, kunciGlobal, kunciPerBagian, bobotDefaultTipe));
  }

  let modeKunci = false;
  let bagianAktif = '';
  let bagianKunciAktif = '';
  let aktif = null;
  let nomorUrut = 0;

  const dorongAktif = () => {
    if (!aktif) return;
    if (!aktif.pertanyaan.trim()) { aktif = null; return; }
    daftarSoal.push(aktif);
    aktif = null;
  };

  (baris || []).forEach(item => {
    const txt = String(item.teks || '').replace(/\s+/g, ' ').trim();
    const imgSrc = item.img || '';

    if (!txt && imgSrc && aktif && !aktif.urlGambar) {
      aktif.urlGambar = imgSrc;
      return;
    }
    if (!txt) return;

    if (/^(?:(?:[IVX]+|[A-E])[\.\)]\s*)?(?:kunci\s+jawaban|pedoman\s+penskoran|rubrik\s+penilaian|pembahasan\s+dan\s+kunci)/i.test(txt)) {
      dorongAktif();
      modeKunci = true;
      bagianKunciAktif = '';
      const skorHead = ekstrakAngkaSkorTeks(txt);
      const tipeHead = deteksiHeadingBagianSoal(txt);
      if (tipeHead && skorHead) bobotDefaultTipe[tipeHead] = skorHead;
      return;
    }

    if (modeKunci) {
      const headBagian = deteksiHeadingBagianSoal(txt);
      if (headBagian) {
        bagianKunciAktif = headBagian;
        const skorHead = ekstrakAngkaSkorTeks(txt);
        if (skorHead > 0) bobotDefaultTipe[headBagian] = skorHead;
        return;
      }

      const tipeAturan = deteksiHeadingBagianSoal(txt.replace(/^[-•*]\s*/, ''));
      const skorAturan = ekstrakAngkaSkorTeks(txt);
      if (tipeAturan && skorAturan > 0 && !/^\d+[\.\)]/.test(txt)) {
        bobotDefaultTipe[tipeAturan] = skorAturan;
        return;
      }

      const mRentang = txt.match(/(?:no\.?\s*)?(\d+)\s*[-–]\s*(\d+)/i);
      if (mRentang && skorAturan > 0) {
        for (let n = Number(mRentang[1]); n <= Number(mRentang[2]); n++) {
          kunciGlobal[String(n)] = { ...(kunciGlobal[String(n)] || {}), bobot: skorAturan };
        }
        return;
      }

      const multiMatch = [...txt.matchAll(/(?:^|\s)(\d+)[\.\)]\s*([A-Ea-e](?:\s*(?:,|dan|&|;)\s*[A-Ea-e])*)(?=\s+\d+[\.\)]|\s*$)/g)];
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

      const mSatu = txt.match(/^(?:no\.?\s*)?(\d+)[\.\):\-]\s*(.+)$/i);
      if (mSatu) {
        const noKey = String(Number(mSatu[1]));
        let isiKunci = mSatu[2].trim();
        const skorInline = ekstrakAngkaSkorTeks(isiKunci);
        isiKunci = isiKunci.replace(/\s*[\(\[]?\s*(?:bobot|skor|poin|nilai)\s*(?:maks(?:imal)?)?\s*[:=@]?\s*\d+(?:[\.,]\d+)?\s*(?:poin|skor)?\s*[\)\]]?$/i, '').trim();
        const entri = {
          ...(kunciGlobal[noKey] || {}),
          ...(isiKunci ? { kunci: isiKunci } : {}),
          ...(skorInline > 0 ? { bobot: skorInline } : {})
        };
        kunciGlobal[noKey] = entri;
        if (bagianKunciAktif) kunciPerBagian[`${bagianKunciAktif}#${noKey}`] = entri;
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

    if (!aktif && /^(?:templat|petunjuk|soal\s+asas|asesmen\s+sumatif|mata\s+pelajaran|kelas\s*:|waktu\s*:|semester\s*:)/i.test(txt)) {
      return;
    }

    const mNomor = txt.match(/^(\d+)[\.\)]\s*(.+)$/);
    const mOpsiTunggal = txt.match(/^([A-Ea-e])[\.\)]\s*(.+)$/);
    const opsiSejajar = pecahOpsiSejajar(txt);
    const mKunci = txt.match(/^(?:kunci\s+jawaban|kunci|jawaban\s+benar|jawaban)\s*[:=]\s*(.+)$/i);
    const mTipe = txt.match(/^(?:tipe\s+soal|jenis\s+soal|tipe|jenis)\s*[:=]\s*(.+)$/i);
    const mBobot = txt.match(/^(?:bobot\s+nilai|bobot|skor\s+maks(?:imal)?|skor|poin|nilai)\s*[:=]\s*(\d+(?:[\.,]\d+)?)/i);
    const mKode = txt.match(/^(?:kode\s+soal|kode)\s*[:=]\s*([A-Za-z0-9_\-]+)/i);

    if (mNomor) {
      dorongAktif();
      nomorUrut++;
      const noAsli = Number(mNomor[1]);
      let teksPertanyaan = mNomor[2].trim();
      const skorDiSoal = ekstrakAngkaSkorTeks(teksPertanyaan);
      if (skorDiSoal > 0) {
        teksPertanyaan = teksPertanyaan.replace(/\s*[\(\[]\s*(?:bobot|skor|poin|nilai)\s*[:=@]?\s*\d+(?:[\.,]\d+)?\s*[\)\]]/i, '').trim();
      }
      aktif = {
        dipilih: true,
        nomorAsli: noAsli,
        urutanGlobal: nomorUrut,
        bagianAsal: bagianAktif,
        kodeSoal: `${kodeMapelPrefix}-W${cap}-${String(nomorUrut).padStart(2, '0')}`,
        tipeSoal: bagianAktif || '',
        pertanyaan: teksPertanyaan,
        urlGambar: imgSrc,
        opsiJawaban: [],
        kunciJawaban: '',
        bobotNilai: skorDiSoal || 0
      };
    } else if (aktif) {
      if (imgSrc && !aktif.urlGambar) aktif.urlGambar = imgSrc;
      if (opsiSejajar) {
        opsiSejajar.forEach(o => {
          const ada = aktif.opsiJawaban.find(x => x.kode === o.kode);
          if (ada) ada.teks = o.teks;
          else aktif.opsiJawaban.push(o);
        });
      } else if (mOpsiTunggal) {
        const kode = mOpsiTunggal[1].toUpperCase();
        let isiOpsi = mOpsiTunggal[2].trim();
        const tandaBenar = /\(\s*benar\s*\)|\*\s*$/i.test(isiOpsi);
        if (tandaBenar) {
          isiOpsi = isiOpsi.replace(/\s*\(\s*benar\s*\)|\s*\*\s*$/i, '').trim();
          aktif.kunciJawaban = aktif.kunciJawaban ? `${aktif.kunciJawaban}, ${kode}` : kode;
        }
        const ada = aktif.opsiJawaban.find(x => x.kode === kode);
        if (ada) ada.teks = isiOpsi;
        else aktif.opsiJawaban.push({ kode, teks: isiOpsi });
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
      } else if (!aktif.opsiJawaban.length && !aktif.kunciJawaban) {
        aktif.pertanyaan += `\n${txt}`;
      }
    }
  });
  dorongAktif();

  return daftarSoal.map(s => terapkanKunciDanBobot(s, kunciGlobal, kunciPerBagian, bobotDefaultTipe));
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

  if (!s.bobotNilai || s.bobotNilai <= 0) {
    s.bobotNilai = sumberKunci?.bobot || bobotDefaultTipe[s.tipeSoal] || (s.tipeSoal === 'Uraian' ? 20 : (s.tipeSoal === 'Pilihan Ganda Kompleks' ? 15 : 10));
  }

  if (!adalahTipeBeropsi(s.tipeSoal)) s.opsiJawaban = [];
  return validasiItemSoalPintar(s);
}

// --- Modal Impor Pintar Bank Soal (Word .docx, PDF .pdf, Excel .xlsx/.xls) ---
function bukaModalImporWord() {
  const mapelList = daftarMapelDiizinkan();
  if (!mapelList.length) {
    tampilkanToast('Tambahkan mata pelajaran terlebih dahulu sebelum mengimpor soal.', 'error');
    return;
  }

  let daftarEkstrak = [];

  const renderPratinjauWord = () => {
    const wadah = document.getElementById('wadah-pratinjau-word');
    const info = document.getElementById('info-ringkas-word');
    if (!wadah) return;

    const jmlValid = daftarEkstrak.filter(x => x.valid).length;
    const totalBobot = bulatDua(daftarEkstrak.filter(x => x.dipilih && x.valid).reduce((acc, x) => acc + Number(x.bobotNilai || 0), 0));
    const hitungTipe = tp => daftarEkstrak.filter(x => x.tipeSoal === tp).length;

    info.textContent = daftarEkstrak.length
      ? `Terdeteksi ${daftarEkstrak.length} butir soal (${jmlValid} Valid, ${daftarEkstrak.length - jmlValid} Perlu Perbaikan).`
      : 'Unggah file .docx, .pdf, atau .xlsx/.xls untuk deteksi otomatis soal, jenis soal, kunci jawaban, dan penskoran.';

    if (!daftarEkstrak.length) {
      wadah.innerHTML = '';
      return;
    }

    wadah.innerHTML = `
      <div class="dnc-ringkasan-impor">
        <div>
          <strong>Deteksi Jenis Soal:</strong>
          PG: ${hitungTipe('Pilihan Ganda')} | PG Kompleks: ${hitungTipe('Pilihan Ganda Kompleks')} | Isian: ${hitungTipe('Isian Singkat')} | Uraian: ${hitungTipe('Uraian')}
        </div>
        <div><strong>Total Bobot Terpilih: ${totalBobot}</strong></div>
      </div>
      <div class="dnc-pembungkus-tabel dnc-mt-12">
        <table class="dnc-tabel dnc-tabel-padat">
          <thead>
            <tr>
              <th>Pilih</th>
              <th>Kode & Tipe Soal</th>
              <th>Pertanyaan & Opsi</th>
              <th>Kunci Otomatis & Bobot</th>
              <th>Status Validasi</th>
            </tr>
          </thead>
          <tbody>
            ${daftarEkstrak.map((it, idx) => `
              <tr>
                <td data-label="Pilih">
                  <input type="checkbox" data-w-pilih="${idx}" ${it.dipilih && it.valid ? 'checked' : ''} ${!it.valid ? 'disabled' : ''}>
                </td>
                <td data-label="Kode & Tipe">
                  <input class="dnc-input" style="height:30px;margin-bottom:4px" data-w-kode="${idx}" value="${esc(it.kodeSoal)}">
                  <select class="dnc-select" style="height:30px" data-w-tipe="${idx}">
                    ${TIPE_SOAL_LIST.map(tp => `<option value="${tp}" ${it.tipeSoal === tp ? 'selected' : ''}>${tp}</option>`).join('')}
                  </select>
                </td>
                <td data-label="Pertanyaan">
                  <textarea class="dnc-textarea" style="min-height:54px" data-w-tanya="${idx}">${esc(it.pertanyaan)}</textarea>
                  ${it.urlGambar ? '<div class="dnc-form-bantuan">Memuat gambar terkompresi dari dokumen</div>' : ''}
                  ${adalahTipeBeropsi(it.tipeSoal) ? `<div class="dnc-form-bantuan">${esc((it.opsiJawaban || []).map(o => `${o.kode}. ${o.teks}`).join(' | '))}</div>` : ''}
                </td>
                <td data-label="Kunci & Bobot">
                  <input class="dnc-input" style="height:30px;margin-bottom:4px" data-w-kunci="${idx}" placeholder="Kunci (mis. B / A, C)" value="${esc(it.kunciJawaban)}">
                  <input class="dnc-input" style="height:30px" type="number" min="0.5" step="0.5" data-w-bobot="${idx}" value="${esc(it.bobotNilai)}">
                </td>
                <td data-label="Validasi">
                  ${badgeStatus(it.valid ? 'Valid' : 'Perlu Perbaikan')}
                  <div class="dnc-form-bantuan">${esc(it.catatanValidasi)}</div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    wadah.querySelectorAll('[data-w-pilih]').forEach(el => {
      el.addEventListener('change', () => {
        daftarEkstrak[Number(el.dataset.wPilih)].dipilih = el.checked;
        renderPratinjauWord();
      });
    });
    const ikatEdit = (attr, field, numerik = false) => {
      wadah.querySelectorAll(`[${attr}]`).forEach(el => {
        el.addEventListener('change', () => {
          const i = Number(el.getAttribute(attr));
          daftarEkstrak[i][field] = numerik ? Number(el.value) : el.value.trim();
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
  };

  bukaModalFormDnc({
    judul: 'Impor Pintar Bank Soal (Word, PDF, atau Excel)',
    lebar: true,
    labelSimpan: 'Simpan Massal ke Bank Soal',
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup">
          <label class="dnc-label" for="w-mapelId">Mata Pelajaran Sasaran *</label>
          <select id="w-mapelId" class="dnc-select">${mapelList.map(m => `<option value="${esc(m.id)}">${esc(m.kodeMapel)} - ${esc(m.namaMapel)}</option>`).join('')}</select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="w-tingkat">Tingkat Kelas *</label>
          <select id="w-tingkat" class="dnc-select">${TINGKAT_LIST.map(t => `<option value="${t}" ${t === 'VI' ? 'selected' : ''}>${esc(labelTingkat(t))}</option>`).join('')}</select>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <div class="dnc-flex-between dnc-mb-12">
            <label class="dnc-label" for="w-file-docx">Dokumen Soal + Kunci + Penskoran (.docx, .pdf, .xlsx, .xls) *</label>
            <button type="button" id="btn-unduh-templat-word" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil">
              <svg class="dnc-ikon"><use href="#icon-download"></use></svg>
              <span>Unduh Templat Word Lengkap</span>
            </button>
          </div>
          <div class="dnc-file-drop">
            <input id="w-file-docx" class="dnc-input" type="file" accept=".docx,.pdf,.xlsx,.xls" style="padding-top:7px">
            <div id="info-ringkas-word" class="dnc-form-bantuan dnc-mt-12">Otomatis mendeteksi PG, PG Kompleks, Isian Singkat, Uraian, kunci jawaban (inline maupun halaman akhir), serta bobot pedoman penskoran.</div>
          </div>
        </div>
      </div>
      <div id="wadah-pratinjau-word"></div>`,
    onMount: () => {
      document.getElementById('btn-unduh-templat-word').addEventListener('click', () => {
        unduhTemplatWordDocx();
        tampilkanToast('Templat Word lengkap (4 tipe soal + kunci + penskoran) berhasil diunduh.');
      });
      document.getElementById('w-file-docx').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        const info = document.getElementById('info-ringkas-word');
        const ext = teks(file.name.split('.').pop());
        info.textContent = `Menganalisis struktur soal, kunci jawaban, dan pedoman penskoran dari ${file.name}...`;
        try {
          const mapelObj = cariById('mataPelajaran', document.getElementById('w-mapelId').value);
          const prefix = (mapelObj?.kodeMapel || 'SOAL').replace(/[^A-Za-z0-9]/g, '').slice(0, 8);

          if (ext === 'docx') {
            const mammothLib = await muatMammothJs();
            const hasilHtml = await mammothLib.convertToHtml(
              { arrayBuffer: await file.arrayBuffer() },
              {
                convertImage: mammothLib.images.imgElement(async image => {
                  const b64 = await image.read('base64');
                  const dataUrl = `data:${image.contentType};base64,${b64}`;
                  const terkompres = await kompresDataGambar(dataUrl);
                  return { src: terkompres };
                })
              }
            );
            const sumber = ubahHtmlWordKeBarisTerstruktur(hasilHtml.value);
            daftarEkstrak = ekstrakSoalPintarDariSumber(sumber, prefix);
          } else if (ext === 'pdf') {
            const barisPdf = await ekstrakTeksBarisPdf(file);
            daftarEkstrak = ekstrakSoalPintarDariSumber({
              baris: barisPdf.map(t => ({ teks: t, img: '', bold: false })),
              tabel: []
            }, prefix);
          } else if (ext === 'xlsx' || ext === 'xls') {
            const XLSX = await muatSheetJs();
            const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
              .map(r => r.map(c => ({ teks: String(c ?? '').trim(), img: '' })));
            daftarEkstrak = ekstrakSoalPintarDariSumber({ baris: [], tabel: [rows] }, prefix);
          } else {
            throw new Error('Gunakan file Word (.docx), PDF (.pdf), atau Excel (.xlsx/.xls).');
          }

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
      const mapelId = document.getElementById('w-mapelId').value;
      const tingkat = document.getElementById('w-tingkat').value;
      if (!bolehAksesMapel(mapelId)) throw new Error('Anda tidak memiliki akses pada mata pelajaran tersebut.');

      let tersimpan = 0;
      for (const it of terpilih) {
        let kodeUnik = it.kodeSoal.trim();
        if (!(await cekUnik(COLLECTIONS.bankSoal, 'kodeSoal', kodeUnik))) {
          kodeUnik = `${kodeUnik}-${Math.floor(10 + Math.random() * 89)}`;
        }
        await dbCreate(COLLECTIONS.bankSoal, {
          kodeSoal: kodeUnik,
          mapelId,
          tingkat,
          tipeSoal: it.tipeSoal,
          pertanyaan: it.pertanyaan.trim(),
          urlGambar: it.urlGambar || '',
          opsiJawaban: adalahTipeBeropsi(it.tipeSoal) ? it.opsiJawaban : [],
          kunciJawaban: it.tipeSoal === 'Pilihan Ganda'
            ? String(it.kunciJawaban).toUpperCase().slice(0, 1)
            : (it.tipeSoal === 'Pilihan Ganda Kompleks' ? normalisasiKunciKompleks(it.kunciJawaban) : it.kunciJawaban),
          bobotNilai: Number(it.bobotNilai),
          statusAktif: true,
          dibuatOleh: penggunaAktif.id
        });
        tersimpan++;
      }
      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M3', 'DNC-M4']);
      await muatM3BankSoal(true);
      tampilkanToast(`${tersimpan} butir soal beserta kunci jawaban & bobotnya berhasil disimpan.`);
    }
  });
}

function bukaModalImporCsvSoal() {
  const mapelList = daftarMapelDiizinkan();
  if (!mapelList.length) { tampilkanToast('Belum ada mata pelajaran tersedia.', 'error'); return; }

  bukaModalFormDnc({
    judul: 'Impor Bank Soal dari CSV',
    lebar: true,
    labelSimpan: 'Impor Soal CSV',
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup">
          <label class="dnc-label" for="csv-mapelId">Mata Pelajaran Sasaran *</label>
          <select id="csv-mapelId" class="dnc-select">${mapelList.map(m => `<option value="${esc(m.id)}">${esc(m.kodeMapel)} - ${esc(m.namaMapel)}</option>`).join('')}</select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="csv-tingkat">Tingkat Kelas *</label>
          <select id="csv-tingkat" class="dnc-select">${TINGKAT_LIST.map(t => `<option value="${t}" ${t === 'VI' ? 'selected' : ''}>${esc(labelTingkat(t))}</option>`).join('')}</select>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <div class="dnc-flex-between">
            <label class="dnc-label" for="csv-file-soal">Pilih File CSV (.csv)</label>
            <button type="button" id="btn-unduh-templat-csv" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil">Unduh Templat CSV</button>
          </div>
          <input id="csv-file-soal" class="dnc-input" type="file" accept=".csv,text/csv" style="padding-top:7px">
          <span class="dnc-form-bantuan">Header kolom: kodeSoal,tipeSoal,pertanyaan,opsiA,opsiB,opsiC,opsiD,opsiE,kunciJawaban,bobotNilai</span>
        </div>
      </div>`,
    onMount: () => {
      document.getElementById('btn-unduh-templat-csv').addEventListener('click', () => {
        const isi = 'kodeSoal,tipeSoal,pertanyaan,opsiA,opsiB,opsiC,opsiD,opsiE,kunciJawaban,bobotNilai\n' +
          'SOAL-01,Pilihan Ganda,"Hasil dari 12 x 5 adalah ...",50,55,60,65,,C,10\n' +
          'SOAL-02,Pilihan Ganda Kompleks,"Pilih bilangan prima berikut:",2,9,11,15,,"A, C",20\n' +
          'SOAL-03,Isian Singkat,"Ibukota Provinsi DIY adalah ....",,,,,,Yogyakarta,20\n' +
          'SOAL-04,Uraian,"Jelaskan pengertian gagasan utama dalam paragraf!",,,,,,Ide pokok inti pembahasan paragraf.,50\n';
        unduhBlobFile(new Blob([isi], { type: 'text/csv;charset=utf-8' }), 'Templat_Bank_Soal_ASAS_DNC.csv');
      });
    },
    onSubmit: async () => {
      const file = document.getElementById('csv-file-soal').files[0];
      if (!file) throw new Error('Pilih file CSV terlebih dahulu.');
      const mapelId = document.getElementById('csv-mapelId').value;
      const tingkat = document.getElementById('csv-tingkat').value;
      const mapelObj = cariById('mataPelajaran', mapelId);
      const baris = parseCsvBaris(await file.text());
      if (baris.length < 2) throw new Error('File CSV tidak berisi baris soal.');

      let tersimpan = 0;
      const waktuTag = Date.now().toString().slice(-4);
      for (let i = 1; i < baris.length; i++) {
        const [kodeRaw, tipeRaw, pertanyaan, a, b, c, d, e, kunciRaw, bobotRaw] = baris[i];
        if (!pertanyaan) continue;
        const opsiTemp = [['A', a], ['B', b], ['C', c], ['D', d], ['E', e]].filter(([, v]) => v).map(([kode, teksOpsi]) => ({ kode, teks: teksOpsi }));
        const tipeSoal = deteksiTipeDariTeks(tipeRaw, opsiTemp.length, kunciRaw, pertanyaan);
        const opsiJawaban = adalahTipeBeropsi(tipeSoal) ? opsiTemp : [];
        const kodeSoal = kodeRaw || `${(mapelObj?.kodeMapel || 'SL')}-${waktuTag}-${String(i).padStart(2, '0')}`;
        const bobotNilai = Number(bobotRaw) > 0 ? Number(bobotRaw) : 10;
        const kunciJawaban = tipeSoal === 'Pilihan Ganda'
          ? String(kunciRaw || 'A').trim().toUpperCase().slice(0, 1)
          : (tipeSoal === 'Pilihan Ganda Kompleks' ? normalisasiKunciKompleks(kunciRaw) : String(kunciRaw || '').trim());
        if (adalahTipeBeropsi(tipeSoal) && opsiJawaban.length < 2) continue;
        await dbCreate(COLLECTIONS.bankSoal, {
          kodeSoal, mapelId, tingkat, tipeSoal, pertanyaan, urlGambar: '',
          opsiJawaban, kunciJawaban, bobotNilai, statusAktif: true, dibuatOleh: penggunaAktif.id
        });
        tersimpan++;
      }
      if (!tersimpan) throw new Error('Tidak ada baris soal yang valid untuk diimpor.');
      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M3', 'DNC-M4']);
      await muatM3BankSoal(true);
      tampilkanToast(`${tersimpan} butir soal berhasil diimpor dari CSV.`);
    }
  });
}
// ===== AKHIR BLOK: DNC_M3_BANK_SOAL =====
// ===== BLOK: DNC_M4_PAKET_ASAS =====
async function muatM4PaketAsas(paksa = false) {
  if (!sudahDimuat['DNC-M4'] || paksa) {
    await Promise.all([muatDataDasar(), muatDataBankSoal(), muatDataPaket()]);
    sudahDimuat['DNC-M4'] = true;
  }
  isiSelectOpsi('filter-mapel-paket', daftarMapelDiizinkan().map(m => ({ value: m.id, label: m.namaMapel })), 'Semua Mapel');
  isiSelectOpsi('filter-kelas-paket', stateMemori.kelas.map(k => ({ value: k.id, label: `${k.kodeKelas} - ${k.namaKelas}` })), 'Semua Kelas');
  renderTabelPaket();
}

function hitungTotalBobotPaket(daftarSoalIds) {
  return bulatDua((daftarSoalIds || []).reduce((total, sid) => {
    const s = cariById('bankSoal', sid);
    return total + Number(s?.bobotNilai || 0);
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
    { label: 'Soal & Bobot', render: p => `${(p.daftarSoalIds || []).length} soal<div class="dnc-form-bantuan">Total Bobot: ${hitungTotalBobotPaket(p.daftarSoalIds)}</div>` },
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
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-token-paket="${esc(p.id)}">Token Baru</button>
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-ubah-paket="${esc(p.id)}">Ubah</button>
        <button type="button" class="dnc-tombol dnc-tombol-bahaya dnc-tombol-kecil" data-hapus-paket="${esc(p.id)}">Hapus</button>
      </div>`
    }
  ], 'Belum ada jadwal dan paket ASAS');
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
  const mapelList = daftarMapelDiizinkan();
  if (!mapelList.length) { tampilkanToast('Tambahkan mata pelajaran terlebih dahulu.', 'error'); return; }
  if (!stateMemori.kelas.length) { tampilkanToast('Tambahkan data kelas terlebih dahulu.', 'error'); return; }

  const mapelAwal = item?.mapelId || mapelList[0].id;
  const mulaiDefault = item?.waktuMulai ? keInputDatetimeLocal(item.waktuMulai) : keInputDatetimeLocal(new Date());
  const selesaiDefault = item?.waktuSelesai ? keInputDatetimeLocal(item.waktuSelesai) : keInputDatetimeLocal(new Date(Date.now() + 2 * 3600000));
  const kelasTerpilih = new Set(item?.kelasIds || []);
  const soalTerpilih = new Set(item?.daftarSoalIds || []);

  const renderChecklistSoal = (mapelId, modeTipe = 'pg_pgk') => {
    const wadah = document.getElementById('f-paket-soal-list');
    const infoBobot = document.getElementById('f-paket-info-bobot');
    if (!wadah) return;

    const soalTersedia = stateMemori.bankSoal.filter(s => {
      if (s.mapelId !== mapelId || s.statusAktif === false) return false;
      if (modeTipe === 'pg_pgk') return adalahTipeBeropsi(s.tipeSoal);
      return true;
    });

    if (!soalTersedia.length) {
      wadah.innerHTML = '<div class="dnc-teks-muted" style="padding:8px">Belum ada butir soal aktif sesuai filter tipe untuk mata pelajaran ini.</div>';
      infoBobot.textContent = '0 soal dipilih • Total Bobot: 0';
      return;
    }

    wadah.innerHTML = soalTersedia.map(s => `
      <label class="dnc-checklist-item">
        <input type="checkbox" name="f-soal-id" value="${esc(s.id)}" data-bobot="${Number(s.bobotNilai || 0)}" ${soalTerpilih.has(s.id) ? 'checked' : ''}>
        <div style="flex:1">
          <div class="dnc-flex-between">
            <strong>${esc(s.kodeSoal)}</strong>
            <span class="dnc-form-bantuan">${esc(s.tipeSoal)} • ${esc(labelTingkat(s.tingkat))} • Bobot ${esc(s.bobotNilai)}</span>
          </div>
          <div class="dnc-form-bantuan">${esc(s.pertanyaan.slice(0, 95))}${s.pertanyaan.length > 95 ? '...' : ''}</div>
        </div>
      </label>`).join('');

    const perbaruiRingkasan = () => {
      const checked = [...wadah.querySelectorAll('input[name="f-soal-id"]:checked')];
      const total = bulatDua(checked.reduce((acc, el) => acc + Number(el.dataset.bobot || 0), 0));
      infoBobot.textContent = `${checked.length} soal dipilih • Total Bobot: ${total}`;
    };
    wadah.querySelectorAll('input[name="f-soal-id"]').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) soalTerpilih.add(cb.value);
        else soalTerpilih.delete(cb.value);
        perbaruiRingkasan();
      });
    });
    perbaruiRingkasan();
  };

  bukaModalFormDnc({
    judul: item ? 'Ubah Paket ASAS' : 'Buat Jadwal & Paket ASAS',
    lebar: true,
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-label" for="f-judulPaket">Judul Paket *</label>
          <input id="f-judulPaket" class="dnc-input" type="text" placeholder="Contoh: ASAS Ganjil Matematika Kelas VI" value="${esc(item?.judulPaket || '')}" required>
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
            ${stateMemori.kelas.map(k => `
              <label class="dnc-checklist-item">
                <input type="checkbox" name="f-kelas-id" value="${esc(k.id)}" ${kelasTerpilih.has(k.id) ? 'checked' : ''}>
                <span><strong>${esc(k.kodeKelas)}</strong> — ${esc(k.namaKelas)} (${esc(labelTingkat(k.tingkat))})</span>
              </label>`).join('')}
          </div>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <div class="dnc-flex-between">
            <label class="dnc-label">Daftar Butir Soal *</label>
            <div class="dnc-flex-gap">
              <select id="f-filter-tipe-paket" class="dnc-select" style="height:28px;font-size:11px;width:auto">
                <option value="pg_pgk">PG & PG Kompleks (Utama)</option>
                <option value="semua">Semua Jenis Soal (PG, PGK, Isian, Uraian)</option>
              </select>
              <button type="button" id="btn-pilih-semua-soal-paket" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" style="height:28px">Pilih Semua</button>
              <span id="f-paket-info-bobot" class="dnc-badge dnc-badge-biru">0 soal dipilih</span>
            </div>
          </div>
          <div id="f-paket-soal-list" class="dnc-checklist-box"></div>
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
      const adaNonOpsi = (item?.daftarSoalIds || []).some(sid => {
        const s = cariById('bankSoal', sid);
        return s && !adalahTipeBeropsi(s.tipeSoal);
      });
      if (adaNonOpsi) selFilterTipe.value = 'semua';

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
        const checked = [...document.querySelectorAll('#f-paket-soal-list input[name="f-soal-id"]:checked')];
        const total = bulatDua(checked.reduce((acc, el) => acc + Number(el.dataset.bobot || 0), 0));
        document.getElementById('f-paket-info-bobot').textContent = `${checked.length} soal dipilih • Total Bobot: ${total}`;
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
      if (!daftarSoalIds.length) throw new Error('Pilih minimal satu butir soal untuk paket ASAS.');
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
    judul: 'Hapus Paket ASAS',
    pesan: `Yakin ingin menghapus paket "${p.judulPaket}"?`,
    labelYa: 'Ya, Hapus',
    onYa: async () => {
      const hasils = await dbList(COLLECTIONS.hasilUjian);
      if (hasils.some(h => h.paketId === id)) {
        throw new Error('Paket ASAS tidak dapat dihapus karena sudah memiliki rekaman hasil ujian peserta didik.');
      }
      await dbDelete(COLLECTIONS.paketAsas, id);
      resetCacheMenu(['DNC-M1', 'DNC-M4', 'DNC-M5', 'DNC-M6']);
      await muatM4PaketAsas(true);
      tampilkanToast('Paket ASAS berhasil dihapus.');
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

async function muatM5RuangUjian(paksa = false) {
  if (sesiUjianAktif) return;
  if (!sudahDimuat['DNC-M5'] || paksa) {
    await Promise.all([muatDataDasar(), muatDataBankSoal(), muatDataPaket(), muatDataHasil()]);
    sudahDimuat['DNC-M5'] = true;
  }
  document.getElementById('m5-daftar-view').classList.remove('dnc-disembunyikan');
  document.getElementById('m5-lembar-view').classList.add('dnc-disembunyikan');
  document.getElementById('subjudul-m5').textContent = `Kelas Anda: ${namaKelasById(penggunaAktif.kelasId)}. Ujian hanya bisa dimulai ketika Guru menekan tombol Mulai Ujian.`;

  renderGridUjianSiswa();
  pasangListenerDaftarPaketSiswa();
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
    judul: 'Verifikasi Token Ujian ASAS',
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

      if (paketTerbaru.statusPaket !== 'Aktif') throw new Error('Paket ASAS ini tidak berstatus Aktif.');
      if (!paketTerbaru.ujianDibuka) throw new Error('Guru belum menekan tombol Mulai Ujian atau sesi telah dihentikan.');
      if (sekarang < tMulai) throw new Error(`Jadwal ujian belum dimulai. Mulai pada ${formatTanggal(paketTerbaru.waktuMulai, true)}.`);
      if (sekarang > tSelesai) throw new Error('Rentang jadwal ujian untuk paket ini telah berakhir.');
      if (tokenInput !== String(paketTerbaru.tokenUjian || '').toUpperCase()) throw new Error('Token ujian tidak cocok. Periksa kembali token dari pengawas.');

      if (!stateMemori.bankSoal.length) await muatDataBankSoal();

      const hasilId = `${paketTerbaru.id}_${penggunaAktif.id}`;
      let hasil = await dbGetById(COLLECTIONS.hasilUjian, hasilId);
      if (hasil && hasil.statusUjian !== 'Sedang Dikerjakan') {
        throw new Error('Anda sudah menyelesaikan paket ASAS ini.');
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
    if (!adalahTipeBeropsi(s.tipeSoal)) return { ...s, opsiTampil: [] };

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

    return { ...s, opsiTampil };
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

  const batasMulaiPlusDurasi = (keDate(hasil.waktuMulaiKerja)?.getTime() || Date.now()) + Number(paket.durasiMenit || 60) * 60000;
  const batasJadwal = keDate(paket.waktuSelesai)?.getTime() || batasMulaiPlusDurasi;
  const batasAkhirMs = Math.min(batasMulaiPlusDurasi, batasJadwal);

  sesiUjianAktif = {
    paket,
    hasilId: hasil.id,
    daftarSoal,
    petaJawaban,
    indeks: 0,
    batasAkhirMs
  };
  sedangSubmitUjian = false;

  document.getElementById('m5-daftar-view').classList.add('dnc-disembunyikan');
  document.getElementById('m5-lembar-view').classList.remove('dnc-disembunyikan');
  document.getElementById('m5-judul-ujian').textContent = paket.judulPaket;
  document.getElementById('m5-info-mapel').textContent = `${namaMapelById(paket.mapelId)} • ${daftarSoal.length} soal`;
  const badgeLive = document.getElementById('m5-status-live');
  if (badgeLive) {
    badgeLive.className = 'dnc-badge dnc-badge-hijau';
    badgeLive.innerHTML = '<span class="dnc-dot-live"></span>Sesi Dibuka Guru';
  }

  renderSoalAktifM5();
  mulaiCountdownUjian();
  pasangListenerPaketUjianBerjalan(paket.id);
}

function mulaiCountdownUjian() {
  hentikanTimerUjian();
  const updateTimer = () => {
    if (!sesiUjianAktif) { hentikanTimerUjian(); return; }
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

  document.getElementById('m5-nomor-label').textContent = `Soal ${indeks + 1} dari ${daftarSoal.length} (Bobot ${soal.bobotNilai})`;
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
      ${soal.urlGambar ? `<img src="${esc(soal.urlGambar)}" alt="Gambar soal" class="dnc-soal-gambar">` : ''}
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
      ${soal.urlGambar ? `<img src="${esc(soal.urlGambar)}" alt="Gambar soal" class="dnc-soal-gambar">` : ''}
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
  } else if (soal.tipeSoal === 'Isian Singkat') {
    konten.innerHTML = `
      <div class="dnc-opsi-petunjuk">Isian Singkat — Tuliskan jawaban singkat dan tepat pada kolom di bawah.</div>
      ${soal.urlGambar ? `<img src="${esc(soal.urlGambar)}" alt="Gambar soal" class="dnc-soal-gambar">` : ''}
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
      ${soal.urlGambar ? `<img src="${esc(soal.urlGambar)}" alt="Gambar soal" class="dnc-soal-gambar">` : ''}
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

  renderNavigasiNomorM5();
}

function hitungSkorButirOtomatis(soal, jawabanSiswaRaw) {
  const bobot = Number(soal.bobotNilai || 0);
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
    let benar = 0;
    let salah = 0;
    jwbSet.forEach(k => {
      if (kunciSet.has(k)) benar++;
      else salah++;
    });
    const rasio = Math.max(0, (benar - salah) / kunciSet.size);
    return bulatDua(rasio * bobot);
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
    judul: 'Kumpulkan Lembar Ujian ASAS',
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
    const bobot = Number(s.bobotNilai || 0);
    totalBobot += bobot;
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
  resetCacheMenu(['DNC-M1', 'DNC-M5', 'DNC-M6']);
  await muatM5RuangUjian(true);
  if (alasan === 'manual') tampilkanToast('Lembar ujian ASAS berhasil dikumpulkan.');
  else if (alasan === 'waktu_habis') tampilkanToast('Ujian selesai otomatis karena waktu habis.');
}
// ===== AKHIR BLOK: DNC_M5_RUANG_UJIAN =====

// ===== BLOK: DNC_M6_HASIL_NILAI =====
let dataHasilTersaring = [];

async function muatM6HasilNilai(paksa = false) {
  if (!sudahDimuat['DNC-M6'] || paksa) {
    await Promise.all([muatDataDasar(), muatDataPengguna(), muatDataBankSoal(), muatDataPaket(), muatDataHasil()]);
    sudahDimuat['DNC-M6'] = true;
  }

  const adalahSiswa = penggunaAktif.role === 'Siswa';
  document.getElementById('btn-ekspor-csv-nilai').classList.toggle('dnc-disembunyikan', adalahSiswa);
  document.getElementById('btn-cetak-nilai').classList.toggle('dnc-disembunyikan', adalahSiswa);
  document.getElementById('filter-kelas-hasil').classList.toggle('dnc-disembunyikan', adalahSiswa);
  document.getElementById('subjudul-m6').textContent = adalahSiswa
    ? 'Riwayat nilai pribadi untuk paket ASAS yang mengaktifkan penampilan nilai.'
    : 'Pantau pengerjaan ujian, koreksi jawaban, perhitungan skor otomatis dari bobot file soal, dan ekspor daftar nilai ASAS.';

  isiSelectOpsi('filter-paket-hasil', stateMemori.paketAsas.map(p => ({ value: p.id, label: p.judulPaket })), 'Semua Paket');
  isiSelectOpsi('filter-mapel-hasil', daftarMapelDiizinkan().map(m => ({ value: m.id, label: m.namaMapel })), 'Semua Mapel');
  isiSelectOpsi('filter-kelas-hasil', stateMemori.kelas.map(k => ({ value: k.id, label: `${k.kodeKelas} - ${k.namaKelas}` })), 'Semua Kelas');
  renderTabelHasil();
}

function renderTabelHasil() {
  const q = teks(document.getElementById('cari-hasil')?.value || '');
  const fPaket = document.getElementById('filter-paket-hasil')?.value || '';
  const fMapel = document.getElementById('filter-mapel-hasil')?.value || '';
  const fKelas = document.getElementById('filter-kelas-hasil')?.value || '';
  const fStatus = document.getElementById('filter-status-hasil')?.value || '';
  const fTuntas = document.getElementById('filter-tuntas-hasil')?.value || '';
  const adalahSiswa = penggunaAktif.role === 'Siswa';

  dataHasilTersaring = stateMemori.hasilUjian.filter(h => {
    const paket = cariById('paketAsas', h.paketId);
    if (adalahSiswa && (!paket || !paket.tampilkanNilai)) return false;
    if (fPaket && h.paketId !== fPaket) return false;
    if (fMapel && h.mapelId !== fMapel) return false;
    if (fKelas && h.kelasId !== fKelas) return false;
    if (fStatus && h.statusUjian !== fStatus) return false;
    if (fTuntas && h.statusKetuntasan !== fTuntas) return false;
    const siswa = cariById('pengguna', h.penggunaId);
    const teksCari = `${teks(siswa?.namaLengkap)} ${teks(siswa?.nomorInduk)} ${teks(paket?.judulPaket)}`;
    if (q && !teksCari.includes(q)) return false;
    return true;
  });

  renderTabelDnc('tbody-hasil', dataHasilTersaring, [
    {
      label: 'Peserta Didik',
      render: h => {
        const s = cariById('pengguna', h.penggunaId) || (h.penggunaId === penggunaAktif.id ? penggunaAktif : null);
        return `<strong>${esc(s?.namaLengkap || h.penggunaId)}</strong><div class="dnc-form-bantuan">${esc(s?.nomorInduk || '-')}</div>`;
      }
    },
    { label: 'Kelas', render: h => esc(cariById('kelas', h.kelasId)?.kodeKelas || '-') },
    {
      label: 'Paket & Mapel',
      render: h => {
        const p = cariById('paketAsas', h.paketId);
        return `${esc(p?.judulPaket || '-')}<div class="dnc-form-bantuan">${esc(namaMapelById(h.mapelId))}</div>`;
      }
    },
    { label: 'Status Ujian', render: h => badgeStatus(h.statusUjian) },
    { label: 'Skor Otomatis / Manual', render: h => `${esc(h.skorPg ?? 0)} / ${esc(h.skorUraian ?? 0)}` },
    { label: 'Skor Akhir', render: h => `<strong style="font-size:15px">${esc(h.skorAkhir ?? 0)}</strong>` },
    { label: 'Ketuntasan', render: h => badgeStatus(h.statusKetuntasan || 'Menunggu Koreksi') },
    {
      label: 'Aksi', aksi: true,
      render: h => adalahSiswa
        ? `<button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-rinci-hasil="${esc(h.id)}">Rincian</button>`
        : `<div class="dnc-aksi-baris">
            <button type="button" class="dnc-tombol dnc-tombol-primer dnc-tombol-kecil" data-koreksi-hasil="${esc(h.id)}">Koreksi / Rincian</button>
            <button type="button" class="dnc-tombol dnc-tombol-bahaya dnc-tombol-kecil" data-reset-hasil="${esc(h.id)}">Reset Sesi</button>
          </div>`
    }
  ], adalahSiswa ? 'Belum ada hasil nilai yang ditampilkan untuk Anda' : 'Belum ada data hasil ujian');
}

function bukaModalKoreksiHasil(hasilId, hanyaBaca = false) {
  const hasil = cariById('hasilUjian', hasilId);
  if (!hasil) return;
  const paket = cariById('paketAsas', hasil.paketId);
  const siswa = cariById('pengguna', hasil.penggunaId) || penggunaAktif;
  const mapel = cariById('mataPelajaran', hasil.mapelId);
  const kkm = Number(mapel?.kkm ?? 75);

  const daftarSoalPaket = (paket?.daftarSoalIds || []).map(id => cariById('bankSoal', id)).filter(Boolean);
  const totalBobotPaket = bulatDua(daftarSoalPaket.reduce((s, x) => s + Number(x.bobotNilai || 0), 0));

  const itemsHtml = (hasil.jawabanSiswa || []).map((j, idx) => {
    const soal = cariById('bankSoal', j.soalId);
    if (!soal) return '';

    if (soal.tipeSoal === 'Pilihan Ganda' || soal.tipeSoal === 'Pilihan Ganda Kompleks') {
      const skorButir = Number(j.skor ?? hitungSkorButirOtomatis(soal, j.jawaban));
      const badgeNilai = skorButir >= soal.bobotNilai
        ? badgeStatus(`Benar (+${skorButir}/${soal.bobotNilai})`)
        : (skorButir > 0 ? `<span class="dnc-badge dnc-badge-amber">Parsial (+${skorButir}/${soal.bobotNilai})</span>` : badgeStatus('Salah (0)'));
      return `
        <div class="dnc-koreksi-item">
          <div class="dnc-koreksi-header">
            <strong>Soal #${idx + 1} (${esc(soal.kodeSoal)}) — ${esc(soal.tipeSoal)}</strong>
            ${badgeNilai}
          </div>
          <div style="font-size:13px;margin-bottom:6px">${esc(soal.pertanyaan)}</div>
          <div class="dnc-form-bantuan">Jawaban Siswa (kode asli): <strong>${esc(j.jawaban || '-')}</strong> | Kunci: <strong>${esc(soal.kunciJawaban)}</strong></div>
        </div>`;
    }

    if (soal.tipeSoal === 'Isian Singkat') {
      const skorButir = Number(j.skor ?? hitungSkorButirOtomatis(soal, j.jawaban));
      return `
        <div class="dnc-koreksi-item">
          <div class="dnc-koreksi-header">
            <strong>Soal #${idx + 1} (${esc(soal.kodeSoal)}) — Isian Singkat (Bobot ${esc(soal.bobotNilai)})</strong>
            ${badgeStatus(skorButir > 0 ? `Terpenuhi (+${skorButir})` : 'Perlu Cek (0)')}
          </div>
          <div style="font-size:13px">${esc(soal.pertanyaan)}</div>
          <div class="dnc-jawaban-box"><strong>Jawaban Siswa:</strong> ${esc(j.jawaban || '(Tidak dijawab)')}</div>
          <div class="dnc-form-bantuan dnc-mb-12"><strong>Kunci Isian:</strong> ${esc(soal.kunciJawaban || '-')}</div>
          ${!hanyaBaca ? `
            <div class="dnc-form-grup" style="margin-bottom:0">
              <label class="dnc-label" for="skor-manual-${esc(soal.id)}">Penyesuaian Skor Isian (0 – ${esc(soal.bobotNilai)})</label>
              <input id="skor-manual-${esc(soal.id)}" data-koreksi-soal="${esc(soal.id)}" data-tipe="Isian Singkat" data-maks="${esc(soal.bobotNilai)}" class="dnc-input" type="number" min="0" max="${esc(soal.bobotNilai)}" step="0.5" value="${esc(skorButir)}">
            </div>` : ''}
        </div>`;
    }

    return `
      <div class="dnc-koreksi-item">
        <div class="dnc-koreksi-header">
          <strong>Soal #${idx + 1} (${esc(soal.kodeSoal)}) — Uraian (Maks Bobot ${esc(soal.bobotNilai)})</strong>
          <span class="dnc-badge dnc-badge-amber">Koreksi Manual</span>
        </div>
        <div style="font-size:13px">${esc(soal.pertanyaan)}</div>
        <div class="dnc-jawaban-box"><strong>Jawaban Siswa:</strong>\n${esc(j.jawaban || '(Tidak dijawab)')}</div>
        ${!hanyaBaca ? `<div class="dnc-form-bantuan dnc-mb-12"><strong>Rubrik/Kunci:</strong> ${esc(soal.kunciJawaban || '-')}</div>` : ''}
        <div class="dnc-form-grup" style="margin-bottom:0">
          <label class="dnc-label" for="skor-manual-${esc(soal.id)}">Skor Uraian (0 – ${esc(soal.bobotNilai)})</label>
          <input id="skor-manual-${esc(soal.id)}" data-koreksi-soal="${esc(soal.id)}" data-tipe="Uraian" data-maks="${esc(soal.bobotNilai)}" class="dnc-input" type="number" min="0" max="${esc(soal.bobotNilai)}" step="0.5" value="${esc(j.skor ?? 0)}" ${hanyaBaca ? 'disabled' : ''}>
        </div>
      </div>`;
  }).join('');

  bukaModalFormDnc({
    judul: hanyaBaca ? 'Rincian Hasil Ujian' : 'Koreksi & Rincian Lembar Jawaban',
    lebar: true,
    tampilSimpan: !hanyaBaca,
    labelSimpan: 'Simpan Koreksi & Hitung Skor',
    labelBatal: hanyaBaca ? 'Tutup' : 'Batal',
    htmlKonten: `
      <div class="dnc-pratinjau-soal dnc-mb-12">
        <strong>${esc(siswa?.namaLengkap || '-')} (${esc(siswa?.nomorInduk || '-')})</strong>
        <div class="dnc-form-bantuan">${esc(paket?.judulPaket || '-')} • ${esc(mapel?.namaMapel || '-')} (KKM: ${kkm}) • Total Bobot Paket: ${totalBobotPaket}</div>
        <div class="dnc-form-bantuan">Skor Otomatis (PG/PGK/Isian): ${esc(hasil.skorPg)} | Skor Uraian: ${esc(hasil.skorUraian)} | Skor Akhir: <strong>${esc(hasil.skorAkhir)}</strong> (${esc(hasil.statusKetuntasan)})</div>
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
            throw new Error(`Skor koreksi harus berada di rentang 0 sampai ${maks}.`);
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
      tampilkanToast(`Koreksi tersimpan. Skor akhir: ${skorAkhir} (${statusKetuntasan}).`);
    }
  });
}

function resetSesiHasilUjian(hasilId) {
  const h = cariById('hasilUjian', hasilId);
  if (!h) return;
  const siswa = cariById('pengguna', h.penggunaId);
  bukaKonfirmasi({
    judul: 'Reset Sesi Ujian Peserta Didik',
    pesan: `Menghapus rekaman sesi ujian milik ${siswa?.namaLengkap || h.penggunaId} agar dapat mengulang ujian dengan token aktif. Lanjutkan?`,
    labelYa: 'Ya, Reset Sesi',
    onYa: async () => {
      await dbDelete(COLLECTIONS.hasilUjian, hasilId);
      resetCacheMenu(['DNC-M1', 'DNC-M5', 'DNC-M6']);
      await muatM6HasilNilai(true);
      tampilkanToast('Sesi ujian berhasil direset. Siswa dapat masuk kembali menggunakan token.');
    }
  });
}

function eksporRekapNilaiCsv() {
  if (!dataHasilTersaring.length) {
    tampilkanToast('Tidak ada data hasil ujian untuk diekspor.', 'error');
    return;
  }
  const header = ['NomorInduk', 'NamaLengkap', 'Kelas', 'PaketASAS', 'MataPelajaran', 'StatusUjian', 'SkorOtomatis', 'SkorUraian', 'SkorAkhir', 'Ketuntasan'];
  const qCsv = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const baris = [header.join(',')];
  dataHasilTersaring.forEach(h => {
    const s = cariById('pengguna', h.penggunaId);
    const p = cariById('paketAsas', h.paketId);
    const k = cariById('kelas', h.kelasId);
    baris.push([
      s?.nomorInduk || '', s?.namaLengkap || '', k?.kodeKelas || '',
      p?.judulPaket || '', namaMapelById(h.mapelId), h.statusUjian || '',
      h.skorPg ?? 0, h.skorUraian ?? 0, h.skorAkhir ?? 0, h.statusKetuntasan || ''
    ].map(qCsv).join(','));
  });
  unduhBlobFile(new Blob([baris.join('\n')], { type: 'text/csv;charset=utf-8' }), `Rekap_Nilai_ASAS_${formatTanggal(new Date()).replace(/\//g, '-')}.csv`);
  tampilkanToast('Rekap nilai CSV berhasil diunduh.');
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

function renderTabelPengguna() {
  const q = teks(document.getElementById('cari-pengguna')?.value || '');
  const fRole = document.getElementById('filter-role-pengguna')?.value || '';
  const fKelas = document.getElementById('filter-kelas-pengguna')?.value || '';
  const fMapel = document.getElementById('filter-mapel-pengguna')?.value || '';
  const fStatus = document.getElementById('filter-status-pengguna')?.value || '';

  const data = stateMemori.pengguna.filter(u => {
    if (fRole && u.role !== fRole) return false;
    if (fKelas && u.kelasId !== fKelas) return false;
    if (fMapel && !(u.mapelIds || []).includes(fMapel)) return false;
    if (fStatus === 'aktif' && u.statusAktif === false) return false;
    if (fStatus === 'nonaktif' && u.statusAktif !== false) return false;
    if (q && !`${teks(u.namaLengkap)} ${teks(u.nomorInduk)} ${teks(u.email)}`.includes(q)) return false;
    return true;
  });

  renderTabelDnc('tbody-pengguna', data, [
    { label: 'Nomor Induk', render: u => `<span class="dnc-mono">${esc(u.nomorInduk)}</span>` },
    { label: 'Nama Lengkap', render: u => `<strong>${esc(u.namaLengkap)}</strong>` },
    { label: 'Email', key: 'email' },
    { label: 'Role', render: u => `<span class="dnc-badge dnc-badge-biru">${esc(u.role)}</span>` },
    {
      label: 'Kelas / Mapel Ampu',
      render: u => {
        if (u.role === 'Siswa') return esc(namaKelasById(u.kelasId));
        if (u.role === 'Guru') return esc((u.mapelIds || []).map(id => namaMapelById(id)).join(', ') || '-');
        return '<span class="dnc-teks-muted">Semua Cakupan</span>';
      }
    },
    { label: 'Status', render: u => badgeStatus(u.statusAktif !== false ? 'Aktif' : 'Nonaktif') },
    {
      label: 'Aksi', aksi: true,
      render: u => `<div class="dnc-aksi-baris">
        <button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil" data-ubah-user="${esc(u.id)}">Ubah</button>
        <button type="button" class="dnc-tombol ${u.statusAktif !== false ? 'dnc-tombol-bahaya' : 'dnc-tombol-sukses'} dnc-tombol-kecil" data-toggle-user="${esc(u.id)}">${u.statusAktif !== false ? 'Nonaktifkan' : 'Aktifkan'}</button>
      </div>`
    }
  ], 'Belum ada data pengguna');
}

function bukaFormPengguna(item = null) {
  const roleAwal = item?.role || 'Siswa';
  const mapelSet = new Set(item?.mapelIds || []);

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
            <option value="Siswa" ${roleAwal === 'Siswa' ? 'selected' : ''}>Siswa</option>
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-nomorInduk">Nomor Induk (NIS/NISN/NIP) *</label>
          <input id="f-nomorInduk" class="dnc-input" type="text" placeholder="Contoh: 202610002" value="${esc(item?.nomorInduk || '')}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-namaLengkap">Nama Lengkap *</label>
          <input id="f-namaLengkap" class="dnc-input" type="text" placeholder="Nama lengkap pengguna" value="${esc(item?.namaLengkap || '')}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-emailUser">Email Login *</label>
          <input id="f-emailUser" class="dnc-input" type="email" placeholder="nama@sekolah.id" value="${esc(item?.email || '')}" ${item && item.role === 'Admin' ? 'disabled' : ''} required>
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
          <label class="dnc-label" for="f-kelasUser">Penempatan Kelas Siswa *</label>
          <select id="f-kelasUser" class="dnc-select">
            <option value="">-- Pilih Kelas --</option>
            ${stateMemori.kelas.map(k => `<option value="${esc(k.id)}" ${item?.kelasId === k.id ? 'selected' : ''}>${esc(k.kodeKelas)} - ${esc(k.namaKelas)}</option>`).join('')}
          </select>
        </div>
        <div id="grup-mapel-user" class="dnc-form-grup dnc-form-full ${roleAwal !== 'Guru' ? 'dnc-disembunyikan' : ''}">
          <label class="dnc-label">Mata Pelajaran yang Diampu Guru * (minimal 1)</label>
          <div class="dnc-checklist-box" style="max-height:130px">
            ${stateMemori.mataPelajaran.map(m => `
              <label class="dnc-checklist-item">
                <input type="checkbox" name="f-mapel-guru" value="${esc(m.id)}" ${mapelSet.has(m.id) ? 'checked' : ''}>
                <span><strong>${esc(m.kodeMapel)}</strong> — ${esc(m.namaMapel)}</span>
              </label>`).join('')}
          </div>
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
        document.getElementById('grup-mapel-user').classList.toggle('dnc-disembunyikan', r !== 'Guru');
      });
    },
    onSubmit: async () => {
      const role = item ? item.role : document.getElementById('f-roleUser').value;
      const nomorInduk = document.getElementById('f-nomorInduk').value.trim();
      const namaLengkap = document.getElementById('f-namaLengkap').value.trim();
      const email = document.getElementById('f-emailUser').value.trim();
      const password = document.getElementById('f-passwordUser').value;
      const kelasId = role === 'Siswa' ? document.getElementById('f-kelasUser').value : '';
      const mapelIds = role === 'Guru' ? [...document.querySelectorAll('input[name="f-mapel-guru"]:checked')].map(el => el.value) : [];
      const statusAktif = document.getElementById('f-statusUser').checked;

      if (!nomorInduk || !namaLengkap || !email) throw new Error('Nomor induk, nama lengkap, dan email wajib diisi.');
      if (role === 'Siswa' && !kelasId) throw new Error('Siswa wajib ditempatkan pada satu kelas.');
      if (role === 'Guru' && !mapelIds.length) throw new Error('Guru wajib mengampu minimal satu mata pelajaran.');
      if (!item && password.length < 6) throw new Error('Password akun baru minimal 6 karakter.');
      if (item && password && password.length < 6) throw new Error('Password baru minimal 6 karakter.');

      if (!(await cekUnik(COLLECTIONS.pengguna, 'nomorInduk', nomorInduk, item?.id))) {
        throw new Error(`Nomor Induk "${nomorInduk}" sudah terdaftar.`);
      }
      if (!(await cekUnik(COLLECTIONS.pengguna, 'email', email, item?.id))) {
        throw new Error(`Email "${email}" sudah terdaftar.`);
      }

      const payload = { email, namaLengkap, nomorInduk, role, kelasId, mapelIds, statusAktif };
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
// ===== AKHIR BLOK: DNC_M7_PENGGUNA =====

// ===== BLOK: DNC_BOOT =====
async function inisialisasiAplikasiDnc() {
  inisialisasiPwaDnc();
  if (IS_PREVIEW) {
    await inisialisasiDataPreview();
  }
  renderSlotPreviewLogin();
  setRoleLogin('Admin');

  document.querySelectorAll('[data-login-role]').forEach(btn => {
    btn.addEventListener('click', () => setRoleLogin(btn.getAttribute('data-login-role')));
  });

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
  document.getElementById('btn-tambah-soal')?.addEventListener('click', () => bukaFormSoal());
  document.getElementById('btn-impor-word')?.addEventListener('click', bukaModalImporWord);
  document.getElementById('btn-impor-csv-soal')?.addEventListener('click', bukaModalImporCsvSoal);
  document.getElementById('cari-soal')?.addEventListener('input', debounceDnc(renderTabelSoal, 250));
  ['filter-mapel-soal', 'filter-tingkat-soal', 'filter-tipe-soal', 'filter-status-soal'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', renderTabelSoal);
  });
  document.getElementById('tbody-soal')?.addEventListener('click', e => {
    const bLihat = e.target.closest('[data-pratinjau-soal]');
    if (bLihat) bukaPratinjauSoal(bLihat.dataset.pratinjauSoal);
    const bDup = e.target.closest('[data-duplikat-soal]');
    if (bDup) duplikatSoal(bDup.dataset.duplikatSoal);
    const bUbah = e.target.closest('[data-ubah-soal]');
    if (bUbah) bukaFormSoal(cariById('bankSoal', bUbah.dataset.ubahSoal));
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
    document.getElementById('cetak-sub-m6').textContent = `Dicetak pada ${formatTanggal(new Date(), true)} oleh ${penggunaAktif?.namaLengkap || '-'}`;
    window.print();
  });
  document.getElementById('cari-hasil')?.addEventListener('input', debounceDnc(renderTabelHasil, 250));
  ['filter-paket-hasil', 'filter-mapel-hasil', 'filter-kelas-hasil', 'filter-status-hasil', 'filter-tuntas-hasil'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', renderTabelHasil);
  });
  document.getElementById('tbody-hasil')?.addEventListener('click', e => {
    const bKor = e.target.closest('[data-koreksi-hasil]');
    if (bKor) bukaModalKoreksiHasil(bKor.dataset.koreksiHasil, false);
    const bRinci = e.target.closest('[data-rinci-hasil]');
    if (bRinci) bukaModalKoreksiHasil(bRinci.dataset.rinciHasil, true);
    const bRes = e.target.closest('[data-reset-hasil]');
    if (bRes) resetSesiHasilUjian(bRes.dataset.resetHasil);
  });

  // --- Event DNC-M7 ---
  document.getElementById('btn-muat-ulang-m7')?.addEventListener('click', () => muatM7Pengguna(true));
  document.getElementById('btn-tambah-pengguna')?.addEventListener('click', () => bukaFormPengguna());
  document.getElementById('cari-pengguna')?.addEventListener('input', debounceDnc(renderTabelPengguna, 250));
  ['filter-role-pengguna', 'filter-kelas-pengguna', 'filter-mapel-pengguna', 'filter-status-pengguna'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', renderTabelPengguna);
  });
  document.getElementById('tbody-pengguna')?.addEventListener('click', e => {
    const bUbah = e.target.closest('[data-ubah-user]');
    if (bUbah) bukaFormPengguna(cariById('pengguna', bUbah.dataset.ubahUser));
    const bTog = e.target.closest('[data-toggle-user]');
    if (bTog) toggleStatusPengguna(bTog.dataset.toggleUser);
  });

  if (!IS_PREVIEW) {
    try {
      const { auth, authMod } = await muatFirebaseSdk();
      authMod.onAuthStateChanged(auth, async fbUser => {
        if (fbUser && !penggunaAktif) {
          let profil = await dbGetById(COLLECTIONS.pengguna, fbUser.uid);
          if (!profil) {
            profil = {
              id: fbUser.uid,
              email: fbUser.email || '',
              namaLengkap: fbUser.displayName || 'Administrator ASAS',
              nomorInduk: 'ADMIN-01',
              role: 'Admin',
              kelasId: '',
              mapelIds: [],
              statusAktif: true
            };
          }
          if (profil.role === 'Admin' && profil.statusAktif !== false) {
            await masukKeAplikasi(profil);
          }
        }
      });
    } catch (err) {
      tampilkanToast('Periksa firebaseConfig di app.js sebelum mode produksi.', 'error');
    }
  }
}

document.addEventListener('DOMContentLoaded', inisialisasiAplikasiDnc);
// ===== AKHIR BLOK: DNC_BOOT =====
