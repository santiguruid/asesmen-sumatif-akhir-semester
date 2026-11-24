// DigitalNetCare@copyright
// ===== BLOK: DNC_CONFIG =====
const IS_PREVIEW = false; // Ubah menjadi false SAAT DEPLOY PRODUKSI agar terhubung murni ke Firebase tanpa data dummy

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

const TINGKAT_LIST = ['VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
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
      navigator.serviceWorker.register(blobUrl).catch(() => { });
    }
  } catch (_) { }
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
  }, 3400);
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

let _chartJsPromise = null;
function muatChartJs() {
  if (window.Chart) return Promise.resolve(window.Chart);
  if (_chartJsPromise) return _chartJsPromise;
  _chartJsPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';
    s.onload = () => resolve(window.Chart);
    s.onerror = () => reject(new Error('Gagal memuat pustaka grafik.'));
    document.head.appendChild(s);
  });
  return _chartJsPromise;
}

let _mammothPromise = null;
function muatMammothJs() {
  if (window.mammoth) return Promise.resolve(window.mammoth);
  if (_mammothPromise) return _mammothPromise;
  _mammothPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js';
    s.onload = () => resolve(window.mammoth);
    s.onerror = () => reject(new Error('Gagal memuat pembaca dokumen Word (.docx).'));
    document.head.appendChild(s);
  });
  return _mammothPromise;
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
  if (s === 'aktif' || s === 'tuntas' || s === 'selesai' || s === 'valid') {
    return `<span class="dnc-badge dnc-badge-hijau">${esc(teksStatus)}</span>`;
  }
  if (s === 'sedang dikerjakan' || s === 'menunggu koreksi' || s === 'perlu perbaikan') {
    return `<span class="dnc-badge dnc-badge-amber">${esc(teksStatus)}</span>`;
  }
  if (s === 'belum tuntas' || s === 'nonaktif') {
    return `<span class="dnc-badge dnc-badge-merah">${esc(teksStatus)}</span>`;
  }
  return `<span class="dnc-badge dnc-badge-abu">${esc(teksStatus)}</span>`;
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
      { id: 'kls_1', dibuat: sekarang.toISOString(), kodeKelas: 'X-IPA-1', namaKelas: 'Sepuluh IPA 1', tingkat: 'X', tahunAjaran: '2026/2027', waliKelas: 'Dra. Sri Wahyuni' },
      { id: 'kls_2', dibuat: sekarang.toISOString(), kodeKelas: 'X-IPS-1', namaKelas: 'Sepuluh IPS 1', tingkat: 'X', tahunAjaran: '2026/2027', waliKelas: 'Bambang Sutrisno, S.Pd.' }
    ],
    [COLLECTIONS.mataPelajaran]: [
      { id: 'mpl_1', dibuat: sekarang.toISOString(), kodeMapel: 'MTK-10', namaMapel: 'Matematika', kkm: 75 },
      { id: 'mpl_2', dibuat: sekarang.toISOString(), kodeMapel: 'BIN-10', namaMapel: 'Bahasa Indonesia', kkm: 78 }
    ],
    [COLLECTIONS.pengguna]: [
      { id: 'usr_admin', dibuat: sekarang.toISOString(), email: 'admin@asas-sekolah.id', namaLengkap: 'Hendra Wijaya, S.Kom.', nomorInduk: '198801012015031001', role: 'Admin', kelasId: '', mapelIds: [], statusAktif: true },
      { id: 'usr_guru', dibuat: sekarang.toISOString(), email: 'guru@asas-sekolah.id', namaLengkap: 'Siti Rahmawati, S.Pd.', nomorInduk: '199105142018022004', role: 'Guru', kelasId: '', mapelIds: ['mpl_1'], statusAktif: true, passwordHash: hashGuru },
      { id: 'usr_siswa', dibuat: sekarang.toISOString(), email: 'siswa@asas-sekolah.id', namaLengkap: 'Raka Pratama Putra', nomorInduk: '202610001', role: 'Siswa', kelasId: 'kls_1', mapelIds: [], statusAktif: true, passwordHash: hashSiswa }
    ],
    [COLLECTIONS.bankSoal]: [
      {
        id: 'soal_1', dibuat: sekarang.toISOString(), kodeSoal: 'MTK10-001', mapelId: 'mpl_1', tingkat: 'X',
        tipeSoal: 'Pilihan Ganda', pertanyaan: 'Jika f(x) = 3x - 5, maka nilai dari f(4) adalah ...', urlGambar: '',
        opsiJawaban: [
          { kode: 'A', teks: '5' }, { kode: 'B', teks: '7' }, { kode: 'C', teks: '9' }, { kode: 'D', teks: '12' }
        ],
        kunciJawaban: 'B', bobotNilai: 50, statusAktif: true, dibuatOleh: 'usr_guru'
      },
      {
        id: 'soal_2', dibuat: sekarang.toISOString(), kodeSoal: 'MTK10-002', mapelId: 'mpl_1', tingkat: 'X',
        tipeSoal: 'Uraian', pertanyaan: 'Jelaskan langkah menyelesaikan sistem persamaan linear dua variabel dengan metode eliminasi!', urlGambar: '',
        opsiJawaban: [], kunciJawaban: 'Samakan koefisien salah satu variabel, lalu kurangkan atau jumlahkan kedua persamaan untuk mendapatkan nilai variabel lainnya.',
        bobotNilai: 50, statusAktif: true, dibuatOleh: 'usr_guru'
      }
    ],
    [COLLECTIONS.paketAsas]: [
      {
        id: 'pkt_1', dibuat: sekarang.toISOString(), judulPaket: 'ASAS Ganjil Matematika Kelas X', semester: 'Ganjil',
        tahunAjaran: '2026/2027', mapelId: 'mpl_1', kelasIds: ['kls_1', 'kls_2'], daftarSoalIds: ['soal_1', 'soal_2'],
        waktuMulai: mulai.toISOString(), waktuSelesai: selesai.toISOString(), durasiMenit: 60,
        tokenUjian: 'MTK26A', acakSoal: true, acakOpsi: true, tampilkanNilai: true, statusPaket: 'Aktif', dibuatOleh: 'usr_guru'
      }
    ],
    [COLLECTIONS.hasilUjian]: [
      {
        id: 'pkt_1_usr_siswa_lama', dibuat: sekarang.toISOString(), paketId: 'pkt_1', penggunaId: 'usr_siswa',
        kelasId: 'kls_1', mapelId: 'mpl_1', waktuMulaiKerja: mulai.toISOString(), waktuSelesaiKerja: sekarang.toISOString(),
        statusUjian: 'Menunggu Koreksi',
        jawabanSiswa: [
          { soalId: 'soal_1', jawaban: 'B', ragu: false, skor: 50 },
          { soalId: 'soal_2', jawaban: 'Menyamakan koefisien x lalu mengurangkan kedua persamaan.', ragu: false, skor: 0 }
        ],
        skorPg: 50, skorUraian: 0, skorAkhir: 50, statusKetuntasan: 'Menunggu Koreksi', catatanKoreksi: '', dikoreksiOleh: ''
      }
    ]
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

async function dbCreate(namaKoleksi, data, customId = null) {
  const sekarangIso = new Date().toISOString();
  if (IS_PREVIEW) {
    const id = customId || `${namaKoleksi.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const baru = { id, dibuat: sekarangIso, ...data };
    memoriPreview[namaKoleksi].unshift(baru);
    return baru;
  }
  const { db, fsMod } = await muatFirebaseSdk();
  const payload = { ...data, dibuat: fsMod.serverTimestamp() };
  if (customId) {
    await fsMod.setDoc(fsMod.doc(db, namaKoleksi, customId), { id: customId, ...payload });
    return { id: customId, dibuat: sekarangIso, ...data };
  }
  const docRef = fsMod.doc(fsMod.collection(db, namaKoleksi));
  await fsMod.setDoc(docRef, { id: docRef.id, ...payload });
  return { id: docRef.id, dibuat: sekarangIso, ...data };
}

async function dbUpdate(namaKoleksi, id, data) {
  if (IS_PREVIEW) {
    const list = memoriPreview[namaKoleksi] || [];
    const idx = list.findIndex(x => x.id === id);
    if (idx < 0) throw new Error('Dokumen tidak ditemukan.');
    list[idx] = { ...list[idx], ...data };
    return list[idx];
  }
  const { db, fsMod } = await muatFirebaseSdk();
  await fsMod.updateDoc(fsMod.doc(db, namaKoleksi, id), data);
  return { id, ...data };
}

async function dbDelete(namaKoleksi, id) {
  if (IS_PREVIEW) {
    memoriPreview[namaKoleksi] = (memoriPreview[namaKoleksi] || []).filter(x => x.id !== id);
    return true;
  }
  const { db, fsMod } = await muatFirebaseSdk();
  await fsMod.deleteDoc(fsMod.doc(db, namaKoleksi, id));
  return true;
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
  stateMemori.kelas = kelas.sort((a, b) => teks(a.kodeKelas).localeCompare(teks(b.kodeKelas)));
  stateMemori.mataPelajaran = mapel.sort((a, b) => teks(a.namaMapel).localeCompare(teks(b.namaMapel)));
}

async function muatDataPengguna() {
  stateMemori.pengguna = await dbList(COLLECTIONS.pengguna);
}

async function muatDataBankSoal() {
  const semua = await dbList(COLLECTIONS.bankSoal, { urutDesc: 'dibuat', batas: 300 });
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

  // Hybrid Auth Non-Admin (Guru & Siswa): validasi SHA-256 langsung terhadap koleksi pengguna di Firestore
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
  penggunaAktif = null;
  resetCacheMenu();
  if (!IS_PREVIEW && fb?.auth?.currentUser) {
    try { await fb.authMod.signOut(fb.auth); } catch (_) { }
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

  // Bottom Tab Bar HP (maksimal 5 item; jika > 5, tampilkan 4 + Lainnya)
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

  // Tabel jadwal ASAS aktif & daftar siswa belum selesai
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
      status: p.statusPaket
    };
  });

  renderTabelDnc('tbody-m1-jadwal', barisJadwal, [
    { label: 'Judul Paket', key: 'judulPaket' },
    { label: 'Mata Pelajaran', key: 'mapel' },
    { label: 'Kelas Sasaran', key: 'kelas' },
    { label: 'Rentang Waktu', key: 'rentang' },
    { label: 'Progres Siswa', key: 'progres' },
    { label: 'Status', render: r => badgeStatus(r.status) }
  ], 'Belum ada paket ASAS berstatus Aktif');

  const teksPeringatan = document.getElementById('teks-peringatan-m1');
  if (peringatanSiswa.length) {
    teksPeringatan.innerHTML = `<strong>Perhatian Sesi Berjalan:</strong> Peserta didik yang belum menyelesaikan ujian aktif — ${esc(peringatanSiswa.join(' | '))}`;
  } else {
    teksPeringatan.textContent = 'Seluruh peserta didik pada jadwal aktif telah menyelesaikan ujian atau belum ada sesi aktif berjalan.';
  }

  // Grafik Analitik (Lazy-load Chart.js)
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
  } catch (_) { }
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
    { label: 'Tingkat', render: k => `<span class="dnc-badge dnc-badge-biru">${esc(k.tingkat)}</span>` },
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
          <input id="f-kodeKelas" class="dnc-input" type="text" placeholder="Contoh: X-IPA-1" value="${esc(item?.kodeKelas || '')}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-namaKelas">Nama Kelas *</label>
          <input id="f-namaKelas" class="dnc-input" type="text" placeholder="Contoh: Sepuluh IPA 1" value="${esc(item?.namaKelas || '')}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-tingkat">Tingkat *</label>
          <select id="f-tingkat" class="dnc-select" required>
            ${TINGKAT_LIST.map(t => `<option value="${t}" ${item?.tingkat === t ? 'selected' : ''}>${t}</option>`).join('')}
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

function bukaFormMapel(item = null) {
  bukaModalFormDnc({
    judul: item ? 'Ubah Mata Pelajaran' : 'Tambah Mata Pelajaran',
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-kodeMapel">Kode Mata Pelajaran *</label>
          <input id="f-kodeMapel" class="dnc-input" type="text" placeholder="Contoh: MTK-10" value="${esc(item?.kodeMapel || '')}" required>
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
    if (q && !`${teks(s.kodeSoal)} ${teks(s.pertanyaan)}`.includes(q)) return false;
    return true;
  });

  renderTabelDnc('tbody-soal', data, [
    { label: 'Kode Soal', render: s => `<span class="dnc-mono">${esc(s.kodeSoal)}</span>` },
    { label: 'Mata Pelajaran', render: s => esc(namaMapelById(s.mapelId)) },
    { label: 'Tingkat', render: s => `<span class="dnc-badge dnc-badge-biru">${esc(s.tingkat)}</span>` },
    { label: 'Tipe', render: s => esc(s.tipeSoal) },
    { label: 'Pertanyaan', render: s => `<div class="dnc-teks-potong" title="${esc(s.pertanyaan)}">${esc(s.pertanyaan)}</div>` },
    { label: 'Kunci', render: s => s.tipeSoal === 'Pilihan Ganda' ? `<strong>${esc(s.kunciJawaban)}</strong>` : '<span class="dnc-teks-muted">Rubrik</span>' },
    { label: 'Bobot', render: s => esc(s.bobotNilai) },
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

function bukaFormSoal(item = null) {
  const mapelList = daftarMapelDiizinkan();
  if (!mapelList.length) {
    tampilkanToast('Tambahkan mata pelajaran terlebih dahulu sebelum membuat soal.', 'error');
    return;
  }
  const opsi = opsiMapToObj(item?.opsiJawaban);
  const tipeAwal = item?.tipeSoal || 'Pilihan Ganda';

  bukaModalFormDnc({
    judul: item ? 'Ubah Butir Soal' : 'Tambah Butir Soal',
    lebar: true,
    htmlKonten: `
      <div class="dnc-form-grid">
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-kodeSoal">Kode Soal *</label>
          <input id="f-kodeSoal" class="dnc-input" type="text" placeholder="Contoh: MTK10-003" value="${esc(item?.kodeSoal || '')}" required>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-mapelId">Mata Pelajaran *</label>
          <select id="f-mapelId" class="dnc-select" required>
            ${mapelList.map(m => `<option value="${esc(m.id)}" ${item?.mapelId === m.id ? 'selected' : ''}>${esc(m.kodeMapel)} - ${esc(m.namaMapel)}</option>`).join('')}
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-tingkatSoal">Tingkat *</label>
          <select id="f-tingkatSoal" class="dnc-select" required>
            ${TINGKAT_LIST.map(t => `<option value="${t}" ${(item?.tingkat || 'X') === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-tipeSoal">Tipe Soal *</label>
          <select id="f-tipeSoal" class="dnc-select" required>
            <option value="Pilihan Ganda" ${tipeAwal === 'Pilihan Ganda' ? 'selected' : ''}>Pilihan Ganda</option>
            <option value="Uraian" ${tipeAwal === 'Uraian' ? 'selected' : ''}>Uraian</option>
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
        <div id="wadah-opsi-pg" class="dnc-form-full ${tipeAwal === 'Uraian' ? 'dnc-disembunyikan' : ''}">
          <div class="dnc-form-grid">
            ${['A', 'B', 'C', 'D', 'E'].map(k => `
              <div class="dnc-form-grup ${k === 'E' ? 'dnc-form-full' : ''}">
                <label class="dnc-label" for="f-opsi-${k}">Opsi ${k} ${k === 'E' ? '(Opsional)' : '*'}</label>
                <input id="f-opsi-${k}" class="dnc-input" type="text" value="${esc(opsi[k])}" placeholder="Teks pilihan ${k}">
              </div>`).join('')}
          </div>
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-kunciJawaban">Kunci Jawaban / Rubrik</label>
          <input id="f-kunciJawaban" class="dnc-input" type="text" placeholder="A-E untuk PG, atau rubrik Uraian" value="${esc(item?.kunciJawaban || '')}">
        </div>
        <div class="dnc-form-grup">
          <label class="dnc-label" for="f-bobotNilai">Bobot Nilai *</label>
          <input id="f-bobotNilai" class="dnc-input" type="number" min="1" step="0.5" value="${esc(item?.bobotNilai ?? 10)}" required>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <label class="dnc-check-label">
            <input id="f-statusAktifSoal" type="checkbox" ${(item ? item.statusAktif : true) ? 'checked' : ''}>
            <span>Status Aktif (tersedia untuk dipilih pada Paket ASAS)</span>
          </label>
        </div>
      </div>`,
    onMount: () => {
      document.getElementById('f-tipeSoal').addEventListener('change', e => {
        document.getElementById('wadah-opsi-pg').classList.toggle('dnc-disembunyikan', e.target.value === 'Uraian');
      });
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
      if (isNaN(bobotNilai) || bobotNilai <= 0) throw new Error('Bobot nilai harus lebih besar dari 0.');

      let opsiJawaban = [];
      if (tipeSoal === 'Pilihan Ganda') {
        ['A', 'B', 'C', 'D', 'E'].forEach(k => {
          const val = document.getElementById(`f-opsi-${k}`).value.trim();
          if (val) opsiJawaban.push({ kode: k, teks: val });
        });
        if (opsiJawaban.length < 2) throw new Error('Soal Pilihan Ganda wajib memiliki minimal 2 opsi jawaban.');
        kunciJawaban = kunciJawaban.toUpperCase();
        if (!opsiJawaban.some(o => o.kode === kunciJawaban)) {
          throw new Error('Kunci jawaban Pilihan Ganda harus cocok dengan kode opsi yang tersedia (A–E).');
        }
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
  const opsiHtml = s.tipeSoal === 'Pilihan Ganda'
    ? `<div class="dnc-opsi-list dnc-mt-12">${(s.opsiJawaban || []).map(o => `
        <div class="dnc-opsi-item ${o.kode === s.kunciJawaban ? 'terpilih' : ''}">
          <span class="dnc-opsi-kode">${esc(o.kode)}</span>
          <span>${esc(o.teks)}</span>
        </div>`).join('')}</div>`
    : `<div class="dnc-jawaban-box dnc-mt-12"><strong>Rubrik / Kunci Uraian:</strong>\n${esc(s.kunciJawaban || 'Belum diisi')}</div>`;

  bukaModalFormDnc({
    judul: `Pratinjau Soal — ${s.kodeSoal}`,
    tampilSimpan: false,
    labelBatal: 'Tutup',
    htmlKonten: `
      <div class="dnc-pratinjau-soal">
        <div class="dnc-flex-between dnc-mb-12">
          <span class="dnc-badge dnc-badge-biru">${esc(namaMapelById(s.mapelId))} • Tingkat ${esc(s.tingkat)}</span>
          <span class="dnc-badge dnc-badge-abu">${esc(s.tipeSoal)} • Bobot ${esc(s.bobotNilai)}</span>
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

// --- DNC-F10: Impor Massal CSV Soal ---
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
          <select id="csv-tingkat" class="dnc-select">${TINGKAT_LIST.map(t => `<option value="${t}" ${t === 'X' ? 'selected' : ''}>${t}</option>`).join('')}</select>
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
          'SOAL-02,Uraian,"Jelaskan pengertian gagasan utama dalam paragraf!",,,,,,Ide pokok yang menjadi inti pembahasan paragraf.,20\n';
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
        const tipeSoal = teks(tipeRaw).includes('urai') ? 'Uraian' : 'Pilihan Ganda';
        const opsiJawaban = tipeSoal === 'Pilihan Ganda'
          ? [['A', a], ['B', b], ['C', c], ['D', d], ['E', e]].filter(([, v]) => v).map(([kode, teksOpsi]) => ({ kode, teks: teksOpsi }))
          : [];
        const kodeSoal = kodeRaw || `${(mapelObj?.kodeMapel || 'SL')}-${waktuTag}-${String(i).padStart(2, '0')}`;
        const bobotNilai = Number(bobotRaw) > 0 ? Number(bobotRaw) : 10;
        const kunciJawaban = tipeSoal === 'Pilihan Ganda' ? String(kunciRaw || 'A').trim().toUpperCase() : String(kunciRaw || '').trim();
        if (tipeSoal === 'Pilihan Ganda' && opsiJawaban.length < 2) continue;
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

// --- DNC-F27: Unggah & Impor Soal dari Dokumen Word (.docx) ---
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

function unduhTemplatWordDocx() {
  const barisTemplat = [
    'TEMPLAT BANK SOAL ASAS - DIGITALNETCARE',
    'Petunjuk: Tulis soal bernomor (1., 2., dst.). Gunakan A. sampai E. untuk opsi Pilihan Ganda, lalu lengkapi Kunci:, Tipe:, dan Bobot:. Gambar dapat ditempel langsung di bawah pertanyaan.',
    '',
    '1. Nilai dari 2x + 6 = 18 adalah ...',
    'A. 4',
    'B. 6',
    'C. 8',
    'D. 12',
    'Kunci: B',
    'Tipe: Pilihan Ganda',
    'Bobot: 25',
    '',
    '2. Jelaskan perbedaan antara teks eksposisi dan teks argumentasi secara ringkas!',
    'Tipe: Uraian',
    'Kunci: Teks eksposisi bertujuan memaparkan informasi secara objektif, sedangkan teks argumentasi bertujuan meyakinkan pembaca dengan bukti dan alasan.',
    'Bobot: 50'
  ];
  const xmlParagraf = barisTemplat.map(t => `<w:p><w:r><w:t xml:space="preserve">${esc(t)}</w:t></w:r></w:p>`).join('');
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
  unduhBlobFile(buatZipStoreBlob(entri), 'Templat_Soal_ASAS_DigitalNetCare.docx');
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

function validasiItemWord(item) {
  const masalah = [];
  if (!item.pertanyaan || !item.pertanyaan.trim()) masalah.push('Pertanyaan kosong');
  if (!Number(item.bobotNilai) || Number(item.bobotNilai) <= 0) masalah.push('Bobot tidak valid');
  if (item.tipeSoal === 'Pilihan Ganda') {
    if (!item.opsiJawaban || item.opsiJawaban.length < 2) masalah.push('Opsi PG kurang dari 2');
    const k = String(item.kunciJawaban || '').trim().toUpperCase();
    if (!k || !(item.opsiJawaban || []).some(o => o.kode === k)) masalah.push('Kunci tidak cocok dengan opsi');
  }
  item.valid = masalah.length === 0;
  item.catatanValidasi = masalah.length ? masalah.join('; ') : 'Siap disimpan';
  return item;
}

function ekstraksiSoalDariHtmlWord(htmlStr, kodeMapelPrefix) {
  const doc = new DOMParser().parseFromString(htmlStr, 'text/html');
  const hasil = [];
  const cap = Date.now().toString().slice(-4);

  // Mode 1: Deteksi format Tabel standar Word (jika terdapat tabel >= 5 kolom)
  const tabelList = [...doc.querySelectorAll('table')];
  if (tabelList.length) {
    tabelList.forEach(tbl => {
      const trList = [...tbl.querySelectorAll('tr')];
      if (trList.length < 2) return;
      const headerSel = [...trList[0].querySelectorAll('th,td')].map(c => teks(c.textContent.trim()));
      const idxTanya = headerSel.findIndex(h => h.includes('pertanyaan') || h.includes('soal'));
      if (idxTanya < 0) return;
      for (let r = 1; r < trList.length; r++) {
        const sel = [...trList[r].querySelectorAll('th,td')];
        const ambil = idx => idx >= 0 && sel[idx] ? sel[idx].textContent.trim() : '';
        const pertanyaan = ambil(idxTanya);
        if (!pertanyaan) continue;
        const imgEl = sel[idxTanya]?.querySelector('img');
        const idxTipe = headerSel.findIndex(h => h.includes('tipe'));
        const idxKunci = headerSel.findIndex(h => h.includes('kunci'));
        const idxBobot = headerSel.findIndex(h => h.includes('bobot'));
        const idxKode = headerSel.findIndex(h => h.includes('kode'));
        const tipeSoal = teks(ambil(idxTipe)).includes('urai') ? 'Uraian' : 'Pilihan Ganda';
        const opsiJawaban = [];
        ['a', 'b', 'c', 'd', 'e'].forEach(hrf => {
          const iO = headerSel.findIndex(h => h === hrf || h === `opsi ${hrf}` || h === `pilihan ${hrf}`);
          const val = ambil(iO);
          if (val) opsiJawaban.push({ kode: hrf.toUpperCase(), teks: val });
        });
        hasil.push(validasiItemWord({
          dipilih: true,
          kodeSoal: ambil(idxKode) || `${kodeMapelPrefix}-W${cap}-${String(hasil.length + 1).padStart(2, '0')}`,
          tipeSoal,
          pertanyaan,
          urlGambar: imgEl ? imgEl.getAttribute('src') || '' : '',
          opsiJawaban: tipeSoal === 'Pilihan Ganda' ? opsiJawaban : [],
          kunciJawaban: tipeSoal === 'Pilihan Ganda' ? ambil(idxKunci).toUpperCase() : ambil(idxKunci),
          bobotNilai: Number(ambil(idxBobot)) > 0 ? Number(ambil(idxBobot)) : 10
        }));
      }
    });
    if (hasil.length) return hasil;
  }

  // Mode 2: Deteksi format Paragraf Bernomor (1., A.-E., Kunci:, Tipe:, Bobot:)
  const blokNodes = [...doc.body.querySelectorAll('p, li')];
  let aktif = null;
  const dorongAktif = () => {
    if (!aktif) return;
    if (!aktif.tipeSoal) aktif.tipeSoal = aktif.opsiJawaban.length >= 2 ? 'Pilihan Ganda' : 'Uraian';
    if (aktif.tipeSoal === 'Pilihan Ganda') aktif.kunciJawaban = String(aktif.kunciJawaban || '').trim().toUpperCase();
    hasil.push(validasiItemWord(aktif));
    aktif = null;
  };

  blokNodes.forEach(node => {
    const imgEl = node.querySelector('img');
    const txt = node.textContent.replace(/\s+/g, ' ').trim();
    if (!txt && imgEl && aktif && !aktif.urlGambar) {
      aktif.urlGambar = imgEl.getAttribute('src') || '';
      return;
    }
    if (!txt) return;

    const mNomor = txt.match(/^(\d+)[\.\)]\s*(.+)$/);
    const mOpsi = txt.match(/^([A-Ea-e])[\.\)]\s*(.+)$/);
    const mKunci = txt.match(/^(?:kunci|jawaban|kunci\s+jawaban)\s*[:=]\s*(.+)$/i);
    const mTipe = txt.match(/^(?:tipe|jenis|tipe\s+soal)\s*[:=]\s*(.+)$/i);
    const mBobot = txt.match(/^(?:bobot|skor|nilai)\s*[:=]\s*(\d+(?:[\.,]\d+)?)/i);
    const mKode = txt.match(/^(?:kode|kode\s+soal)\s*[:=]\s*([A-Za-z0-9_-]+)/i);

    if (mNomor && !/^templat/i.test(txt)) {
      dorongAktif();
      aktif = {
        dipilih: true,
        kodeSoal: `${kodeMapelPrefix}-W${cap}-${String(hasil.length + 1).padStart(2, '0')}`,
        tipeSoal: '',
        pertanyaan: mNomor[2].trim(),
        urlGambar: imgEl ? imgEl.getAttribute('src') || '' : '',
        opsiJawaban: [],
        kunciJawaban: '',
        bobotNilai: 10
      };
    } else if (aktif) {
      if (imgEl && !aktif.urlGambar) aktif.urlGambar = imgEl.getAttribute('src') || '';
      if (mOpsi) {
        const kode = mOpsi[1].toUpperCase();
        const ada = aktif.opsiJawaban.find(o => o.kode === kode);
        if (ada) ada.teks = mOpsi[2].trim();
        else aktif.opsiJawaban.push({ kode, teks: mOpsi[2].trim() });
      } else if (mKunci) {
        aktif.kunciJawaban = mKunci[1].trim();
      } else if (mTipe) {
        aktif.tipeSoal = teks(mTipe[1]).includes('urai') ? 'Uraian' : 'Pilihan Ganda';
      } else if (mBobot) {
        aktif.bobotNilai = Number(mBobot[1].replace(',', '.')) || 10;
      } else if (mKode) {
        aktif.kodeSoal = mKode[1].trim();
      } else if (!aktif.opsiJawaban.length && !aktif.kunciJawaban) {
        aktif.pertanyaan += `\n${txt}`;
      }
    }
  });
  dorongAktif();
  return hasil;
}

function bukaModalImporWord() {
  const mapelList = daftarMapelDiizinkan();
  if (!mapelList.length) {
    tampilkanToast('Tambahkan mata pelajaran terlebih dahulu sebelum mengimpor soal Word.', 'error');
    return;
  }

  let daftarEkstrak = [];

  const renderPratinjauWord = () => {
    const wadah = document.getElementById('wadah-pratinjau-word');
    const info = document.getElementById('info-ringkas-word');
    if (!wadah) return;
    const jmlValid = daftarEkstrak.filter(x => x.valid).length;
    info.textContent = daftarEkstrak.length
      ? `Terdeteksi ${daftarEkstrak.length} butir soal (${jmlValid} Valid, ${daftarEkstrak.length - jmlValid} Perlu Perbaikan).`
      : 'Unggah file .docx untuk melihat pratinjau hasil ekstraksi.';

    if (!daftarEkstrak.length) {
      wadah.innerHTML = '';
      return;
    }
    wadah.innerHTML = `
      <div class="dnc-pembungkus-tabel dnc-mt-12">
        <table class="dnc-tabel dnc-tabel-padat">
          <thead>
            <tr>
              <th>Pilih</th>
              <th>Kode & Tipe</th>
              <th>Pertanyaan & Opsi</th>
              <th>Kunci & Bobot</th>
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
                    <option value="Pilihan Ganda" ${it.tipeSoal === 'Pilihan Ganda' ? 'selected' : ''}>Pilihan Ganda</option>
                    <option value="Uraian" ${it.tipeSoal === 'Uraian' ? 'selected' : ''}>Uraian</option>
                  </select>
                </td>
                <td data-label="Pertanyaan">
                  <textarea class="dnc-textarea" style="min-height:54px" data-w-tanya="${idx}">${esc(it.pertanyaan)}</textarea>
                  ${it.urlGambar ? '<div class="dnc-form-bantuan">Memuat gambar terkompresi dari dokumen Word</div>' : ''}
                  ${it.tipeSoal === 'Pilihan Ganda' ? `<div class="dnc-form-bantuan">${esc(it.opsiJawaban.map(o => `${o.kode}. ${o.teks}`).join(' | '))}</div>` : ''}
                </td>
                <td data-label="Kunci & Bobot">
                  <input class="dnc-input" style="height:30px;margin-bottom:4px" data-w-kunci="${idx}" placeholder="Kunci" value="${esc(it.kunciJawaban)}">
                  <input class="dnc-input" style="height:30px" type="number" min="1" data-w-bobot="${idx}" value="${esc(it.bobotNilai)}">
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
      el.addEventListener('change', () => { daftarEkstrak[Number(el.dataset.wPilih)].dipilih = el.checked; });
    });
    const ikatEdit = (attr, field, numerik = false) => {
      wadah.querySelectorAll(`[${attr}]`).forEach(el => {
        el.addEventListener('change', () => {
          const i = Number(el.getAttribute(attr));
          daftarEkstrak[i][field] = numerik ? Number(el.value) : el.value.trim();
          validasiItemWord(daftarEkstrak[i]);
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
    judul: 'Impor Bank Soal dari Microsoft Word (.docx)',
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
          <select id="w-tingkat" class="dnc-select">${TINGKAT_LIST.map(t => `<option value="${t}" ${t === 'X' ? 'selected' : ''}>${t}</option>`).join('')}</select>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <div class="dnc-flex-between dnc-mb-12">
            <label class="dnc-label" for="w-file-docx">Dokumen Word (.docx) *</label>
            <button type="button" id="btn-unduh-templat-word" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-kecil">
              <svg class="dnc-ikon"><use href="#icon-download"></use></svg>
              <span>Unduh Templat Word (.docx)</span>
            </button>
          </div>
          <div class="dnc-file-drop">
            <input id="w-file-docx" class="dnc-input" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style="padding-top:7px">
            <div id="info-ringkas-word" class="dnc-form-bantuan dnc-mt-12">Unggah file .docx untuk melihat pratinjau hasil ekstraksi otomatis.</div>
          </div>
        </div>
      </div>
      <div id="wadah-pratinjau-word"></div>`,
    onMount: () => {
      document.getElementById('btn-unduh-templat-word').addEventListener('click', () => {
        unduhTemplatWordDocx();
        tampilkanToast('Templat Word (.docx) berhasil diunduh.');
      });
      document.getElementById('w-file-docx').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        const info = document.getElementById('info-ringkas-word');
        info.textContent = 'Membaca dokumen Word dan mengompresi gambar pendukung...';
        try {
          const mammothLib = await muatMammothJs();
          const buf = await file.arrayBuffer();
          const hasilHtml = await mammothLib.convertToHtml(
            { arrayBuffer: buf },
            {
              convertImage: mammothLib.images.imgElement(async image => {
                const b64 = await image.read('base64');
                const dataUrl = `data:${image.contentType};base64,${b64}`;
                const terkompres = await kompresDataGambar(dataUrl);
                return { src: terkompres };
              })
            }
          );
          const mapelObj = cariById('mataPelajaran', document.getElementById('w-mapelId').value);
          const prefix = (mapelObj?.kodeMapel || 'SOAL').replace(/[^A-Za-z0-9]/g, '').slice(0, 8);
          daftarEkstrak = ekstraksiSoalDariHtmlWord(hasilHtml.value, prefix);
          renderPratinjauWord();
        } catch (err) {
          info.textContent = 'Gagal membaca file .docx. Pastikan format dokumen valid.';
          tampilkanToast(err.message || 'Gagal memproses dokumen Word.', 'error');
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
          opsiJawaban: it.tipeSoal === 'Pilihan Ganda' ? it.opsiJawaban : [],
          kunciJawaban: it.tipeSoal === 'Pilihan Ganda' ? String(it.kunciJawaban).toUpperCase() : it.kunciJawaban,
          bobotNilai: Number(it.bobotNilai),
          statusAktif: true,
          dibuatOleh: penggunaAktif.id
        });
        tersimpan++;
      }
      tutupModalFormDnc();
      resetCacheMenu(['DNC-M1', 'DNC-M3', 'DNC-M4']);
      await muatM3BankSoal(true);
      tampilkanToast(`${tersimpan} butir soal dari Word (.docx) berhasil disimpan ke Bank Soal.`);
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
  return (daftarSoalIds || []).reduce((total, sid) => {
    const s = cariById('bankSoal', sid);
    return total + Number(s?.bobotNilai || 0);
  }, 0);
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
    { label: 'Status', render: p => badgeStatus(p.statusPaket) },
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

function bukaFormPaket(item = null) {
  const mapelList = daftarMapelDiizinkan();
  if (!mapelList.length) { tampilkanToast('Tambahkan mata pelajaran terlebih dahulu.', 'error'); return; }
  if (!stateMemori.kelas.length) { tampilkanToast('Tambahkan data kelas terlebih dahulu.', 'error'); return; }

  const mapelAwal = item?.mapelId || mapelList[0].id;
  const mulaiDefault = item?.waktuMulai ? keInputDatetimeLocal(item.waktuMulai) : keInputDatetimeLocal(new Date());
  const selesaiDefault = item?.waktuSelesai ? keInputDatetimeLocal(item.waktuSelesai) : keInputDatetimeLocal(new Date(Date.now() + 2 * 3600000));
  const kelasTerpilih = new Set(item?.kelasIds || []);
  const soalTerpilih = new Set(item?.daftarSoalIds || []);

  const renderChecklistSoal = mapelId => {
    const wadah = document.getElementById('f-paket-soal-list');
    const infoBobot = document.getElementById('f-paket-info-bobot');
    if (!wadah) return;
    const soalTersedia = stateMemori.bankSoal.filter(s => s.mapelId === mapelId && s.statusAktif !== false);
    if (!soalTersedia.length) {
      wadah.innerHTML = '<div class="dnc-teks-muted" style="padding:8px">Belum ada butir soal aktif untuk mata pelajaran ini.</div>';
      infoBobot.textContent = '0 soal dipilih • Total Bobot: 0';
      return;
    }
    wadah.innerHTML = soalTersedia.map(s => `
      <label class="dnc-checklist-item">
        <input type="checkbox" name="f-soal-id" value="${esc(s.id)}" data-bobot="${Number(s.bobotNilai || 0)}" ${soalTerpilih.has(s.id) ? 'checked' : ''}>
        <div>
          <strong>${esc(s.kodeSoal)}</strong> (${esc(s.tipeSoal)}, Tingkat ${esc(s.tingkat)}, Bobot ${esc(s.bobotNilai)})
          <div class="dnc-form-bantuan">${esc(s.pertanyaan.slice(0, 95))}${s.pertanyaan.length > 95 ? '...' : ''}</div>
        </div>
      </label>`).join('');

    const perbaruiRingkasan = () => {
      const checked = [...wadah.querySelectorAll('input[name="f-soal-id"]:checked')];
      const total = checked.reduce((acc, el) => acc + Number(el.dataset.bobot || 0), 0);
      infoBobot.textContent = `${checked.length} soal dipilih • Total Bobot Paket: ${total}`;
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
          <input id="f-judulPaket" class="dnc-input" type="text" placeholder="Contoh: ASAS Ganjil Matematika Kelas X" value="${esc(item?.judulPaket || '')}" required>
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
            ${['Draft', 'Aktif', 'Selesai'].map(st => `<option value="${st}" ${(item?.statusPaket || 'Draft') === st ? 'selected' : ''}>${st}</option>`).join('')}
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
          <div class="dnc-checklist-box" style="max-height:120px">
            ${stateMemori.kelas.map(k => `
              <label class="dnc-checklist-item">
                <input type="checkbox" name="f-kelas-id" value="${esc(k.id)}" ${kelasTerpilih.has(k.id) ? 'checked' : ''}>
                <span><strong>${esc(k.kodeKelas)}</strong> — ${esc(k.namaKelas)} (Tingkat ${esc(k.tingkat)})</span>
              </label>`).join('')}
          </div>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <div class="dnc-flex-between">
            <label class="dnc-label">Daftar Butir Soal *</label>
            <span id="f-paket-info-bobot" class="dnc-badge dnc-badge-biru">0 soal dipilih</span>
          </div>
          <div id="f-paket-soal-list" class="dnc-checklist-box"></div>
        </div>
        <div class="dnc-form-grup dnc-form-full">
          <div class="dnc-flex-gap" style="gap:16px">
            <label class="dnc-check-label"><input id="f-acakSoal" type="checkbox" ${(item ? item.acakSoal : true) ? 'checked' : ''}><span>Acak Urutan Soal</span></label>
            <label class="dnc-check-label"><input id="f-acakOpsi" type="checkbox" ${(item ? item.acakOpsi : true) ? 'checked' : ''}><span>Acak Opsi Jawaban</span></label>
            <label class="dnc-check-label"><input id="f-tampilkanNilai" type="checkbox" ${item?.tampilkanNilai ? 'checked' : ''}><span>Tampilkan Nilai ke Siswa</span></label>
          </div>
        </div>
      </div>`,
    onMount: () => {
      renderChecklistSoal(mapelAwal);
      document.getElementById('f-mapelPaket').addEventListener('change', e => {
        soalTerpilih.clear();
        renderChecklistSoal(e.target.value);
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
        dibuatOleh: item?.dibuatOleh || penggunaAktif.id
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
  await dbUpdate(COLLECTIONS.paketAsas, id, { tokenUjian: tokenBaru });
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

function hentikanTimerUjian() {
  if (timerUjianInterval) {
    clearInterval(timerUjianInterval);
    timerUjianInterval = null;
  }
}

async function muatM5RuangUjian(paksa = false) {
  if (sesiUjianAktif) return;
  if (!sudahDimuat['DNC-M5'] || paksa) {
    await Promise.all([muatDataDasar(), muatDataBankSoal(), muatDataPaket(), muatDataHasil()]);
    sudahDimuat['DNC-M5'] = true;
  }
  document.getElementById('m5-daftar-view').classList.remove('dnc-disembunyikan');
  document.getElementById('m5-lembar-view').classList.add('dnc-disembunyikan');
  document.getElementById('subjudul-m5').textContent = `Kelas Anda: ${namaKelasById(penggunaAktif.kelasId)}. Masukkan token dari pengawas untuk memulai sesi.`;

  const grid = document.getElementById('grid-ujian-siswa');
  const paketAktif = stateMemori.paketAsas.filter(p => p.statusPaket === 'Aktif');
  if (!paketAktif.length) {
    grid.innerHTML = `<div class="dnc-kartu dnc-teks-tengah dnc-teks-muted" style="grid-column:1/-1">Belum ada jadwal ASAS aktif untuk kelas Anda saat ini.</div>`;
    return;
  }

  grid.innerHTML = paketAktif.map(p => {
    const hasilId = `${p.id}_${penggunaAktif.id}`;
    const hasil = stateMemori.hasilUjian.find(h => h.id === hasilId || (h.paketId === p.id && h.penggunaId === penggunaAktif.id));
    const statusLabel = !hasil ? 'Belum Dikerjakan' : (hasil.statusUjian === 'Sedang Dikerjakan' ? 'Sedang Dikerjakan' : 'Selesai');
    const tombolAksi = !hasil
      ? `<button type="button" class="dnc-tombol dnc-tombol-primer dnc-tombol-penuh" data-mulai-ujian="${esc(p.id)}">Mulai Ujian (Masukkan Token)</button>`
      : (hasil.statusUjian === 'Sedang Dikerjakan'
        ? `<button type="button" class="dnc-tombol dnc-tombol-aksen dnc-tombol-penuh" data-lanjut-ujian="${esc(p.id)}">Lanjutkan Sesi Ujian</button>`
        : `<button type="button" class="dnc-tombol dnc-tombol-sekunder dnc-tombol-penuh" disabled>Sudah Diselesaikan (${esc(hasil.statusUjian)})</button>`);

    return `
      <article class="dnc-kartu-ujian">
        <div class="dnc-flex-between">
          <span class="dnc-badge dnc-badge-biru">${esc(namaMapelById(p.mapelId))}</span>
          ${badgeStatus(statusLabel)}
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
      const sekarang = Date.now();
      const tMulai = keDate(paket.waktuMulai)?.getTime() || 0;
      const tSelesai = keDate(paket.waktuSelesai)?.getTime() || 0;

      if (paket.statusPaket !== 'Aktif') throw new Error('Paket ASAS ini tidak berstatus Aktif.');
      if (sekarang < tMulai) throw new Error(`Jadwal ujian belum dimulai. Mulai pada ${formatTanggal(paket.waktuMulai, true)}.`);
      if (sekarang > tSelesai) throw new Error('Rentang jadwal ujian untuk paket ini telah berakhir.');
      if (tokenInput !== String(paket.tokenUjian || '').toUpperCase()) throw new Error('Token ujian tidak cocok. Periksa kembali token dari pengawas.');

      const hasilId = `${paket.id}_${penggunaAktif.id}`;
      let hasil = await dbGetById(COLLECTIONS.hasilUjian, hasilId);
      if (hasil && hasil.statusUjian !== 'Sedang Dikerjakan') {
        throw new Error('Anda sudah menyelesaikan paket ASAS ini.');
      }
      if (!hasil) {
        const jawabanAwal = (paket.daftarSoalIds || []).map(sid => ({ soalId: sid, jawaban: '', ragu: false, skor: 0 }));
        hasil = await dbCreate(COLLECTIONS.hasilUjian, {
          paketId: paket.id,
          penggunaId: penggunaAktif.id,
          kelasId: penggunaAktif.kelasId,
          mapelId: paket.mapelId,
          waktuMulaiKerja: new Date().toISOString(),
          waktuSelesaiKerja: null,
          statusUjian: 'Sedang Dikerjakan',
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
      await mulaiLembarUjian(paket, hasil);
    }
  });
}

async function lanjutkanSesiUjianSiswa(paketId) {
  const paket = cariById('paketAsas', paketId);
  if (!paket) return;
  const hasilId = `${paket.id}_${penggunaAktif.id}`;
  const hasil = await dbGetById(COLLECTIONS.hasilUjian, hasilId) ||
    stateMemori.hasilUjian.find(h => h.paketId === paketId && h.penggunaId === penggunaAktif.id);
  if (!hasil || hasil.statusUjian !== 'Sedang Dikerjakan') {
    tampilkanToast('Sesi ujian sudah tidak aktif.', 'error');
    await muatM5RuangUjian(true);
    return;
  }
  await mulaiLembarUjian(paket, hasil);
}

async function mulaiLembarUjian(paket, hasil) {
  if (!stateMemori.bankSoal.length) await muatDataBankSoal();
  let daftarSoal = (paket.daftarSoalIds || []).map(id => cariById('bankSoal', id)).filter(Boolean);
  if (!daftarSoal.length) {
    tampilkanToast('Butir soal pada paket ini tidak ditemukan.', 'error');
    return;
  }

  daftarSoal = daftarSoal.map(s => ({
    ...s,
    opsiTampil: s.tipeSoal === 'Pilihan Ganda'
      ? (paket.acakOpsi ? acakArray(s.opsiJawaban || []) : [...(s.opsiJawaban || [])])
      : []
  }));
  if (paket.acakSoal) daftarSoal = acakArray(daftarSoal);

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

  renderSoalAktifM5();
  mulaiCountdownUjian();
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
      selesaikanUjianSiswa(true);
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

const autosaveUraianDebounced = debounceDnc(() => autosaveJawabanUjian(), 500);

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
  document.getElementById('m5-tipe-badge').textContent = soal.tipeSoal;
  document.getElementById('m5-btn-prev').disabled = indeks === 0;
  document.getElementById('m5-btn-next').textContent = indeks === daftarSoal.length - 1 ? 'Selesai & Kumpulkan' : 'Selanjutnya';

  const btnRagu = document.getElementById('m5-btn-ragu');
  btnRagu.textContent = jwb.ragu ? 'Hapus Tanda Ragu' : 'Tandai Ragu-ragu';
  btnRagu.className = `dnc-tombol ${jwb.ragu ? 'dnc-tombol-aksen' : 'dnc-tombol-sekunder'}`;

  const konten = document.getElementById('m5-soal-konten');
  if (soal.tipeSoal === 'Pilihan Ganda') {
    konten.innerHTML = `
      ${soal.urlGambar ? `<img src="${esc(soal.urlGambar)}" alt="Gambar soal" class="dnc-soal-gambar">` : ''}
      <div class="dnc-soal-teks">${esc(soal.pertanyaan)}</div>
      <div class="dnc-opsi-list">
        ${soal.opsiTampil.map(o => `
          <button type="button" class="dnc-opsi-item ${jwb.jawaban === o.kode ? 'terpilih' : ''}" data-pilih-opsi="${esc(o.kode)}">
            <span class="dnc-opsi-kode">${esc(o.kode)}</span>
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
  } else {
    konten.innerHTML = `
      ${soal.urlGambar ? `<img src="${esc(soal.urlGambar)}" alt="Gambar soal" class="dnc-soal-gambar">` : ''}
      <div class="dnc-soal-teks">${esc(soal.pertanyaan)}</div>
      <div class="dnc-form-grup">
        <label class="dnc-label" for="m5-input-uraian">Jawaban Uraian Anda</label>
        <textarea id="m5-input-uraian" class="dnc-textarea" style="min-height:140px" placeholder="Tulis jawaban uraian secara lengkap dan jelas...">${esc(jwb.jawaban)}</textarea>
      </div>`;
    document.getElementById('m5-input-uraian').addEventListener('input', e => {
      jwb.jawaban = e.target.value;
      renderNavigasiNomorM5();
      autosaveUraianDebounced();
    });
  }

  renderNavigasiNomorM5();
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
    onYa: () => selesaikanUjianSiswa(false)
  });
}

async function selesaikanUjianSiswa(otomatis = false) {
  if (!sesiUjianAktif || sedangSubmitUjian) return;
  sedangSubmitUjian = true;
  hentikanTimerUjian();

  const { paket, hasilId, daftarSoal, petaJawaban } = sesiUjianAktif;
  let skorPg = 0;
  let totalBobot = 0;
  let adaUraian = false;

  const jawabanFinal = daftarSoal.map(s => {
    const j = petaJawaban[s.id] || { soalId: s.id, jawaban: '', ragu: false, skor: 0 };
    const bobot = Number(s.bobotNilai || 0);
    totalBobot += bobot;
    if (s.tipeSoal === 'Pilihan Ganda') {
      const benar = String(j.jawaban || '').trim().toUpperCase() === String(s.kunciJawaban || '').trim().toUpperCase();
      const skorButir = benar ? bobot : 0;
      skorPg += skorButir;
      return { soalId: s.id, jawaban: j.jawaban || '', ragu: Boolean(j.ragu), skor: skorButir };
    }
    adaUraian = true;
    return { soalId: s.id, jawaban: j.jawaban || '', ragu: Boolean(j.ragu), skor: 0 };
  });

  const skorAkhir = totalBobot > 0 ? bulatDua((skorPg / totalBobot) * 100) : 0;
  const mapelObj = cariById('mataPelajaran', paket.mapelId);
  const kkm = Number(mapelObj?.kkm ?? 75);
  const statusUjian = adaUraian ? 'Menunggu Koreksi' : 'Selesai';
  const statusKetuntasan = adaUraian ? 'Menunggu Koreksi' : (skorAkhir >= kkm ? 'Tuntas' : 'Belum Tuntas');

  await dbUpdate(COLLECTIONS.hasilUjian, hasilId, {
    waktuSelesaiKerja: new Date().toISOString(),
    statusUjian,
    jawabanSiswa: jawabanFinal,
    skorPg,
    skorUraian: 0,
    skorAkhir,
    statusKetuntasan
  });

  sesiUjianAktif = null;
  sedangSubmitUjian = false;
  resetCacheMenu(['DNC-M1', 'DNC-M5', 'DNC-M6']);
  await muatM5RuangUjian(true);
  tampilkanToast(otomatis ? 'Ujian selesai otomatis karena waktu habis.' : 'Lembar ujian ASAS berhasil dikumpulkan.');
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
    : 'Pantau pengerjaan ujian, koreksi jawaban uraian, reset sesi bermasalah, dan ekspor daftar nilai ASAS.';

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
    { label: 'PG / Uraian', render: h => `${esc(h.skorPg ?? 0)} / ${esc(h.skorUraian ?? 0)}` },
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
  const totalBobotPaket = daftarSoalPaket.reduce((s, x) => s + Number(x.bobotNilai || 0), 0);

  const itemsHtml = (hasil.jawabanSiswa || []).map((j, idx) => {
    const soal = cariById('bankSoal', j.soalId);
    if (!soal) return '';
    if (soal.tipeSoal === 'Pilihan Ganda') {
      const benar = String(j.jawaban || '').toUpperCase() === String(soal.kunciJawaban || '').toUpperCase();
      return `
        <div class="dnc-koreksi-item">
          <div class="dnc-koreksi-header">
            <strong>Soal #${idx + 1} (${esc(soal.kodeSoal)}) — Pilihan Ganda</strong>
            ${badgeStatus(benar ? `Benar (+${soal.bobotNilai})` : 'Salah (0)')}
          </div>
          <div style="font-size:13px;margin-bottom:6px">${esc(soal.pertanyaan)}</div>
          <div class="dnc-form-bantuan">Jawaban Siswa: <strong>${esc(j.jawaban || '-')}</strong> | Kunci: <strong>${esc(soal.kunciJawaban)}</strong></div>
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
          <label class="dnc-label" for="skor-uraian-${esc(soal.id)}">Skor Uraian (0 – ${esc(soal.bobotNilai)})</label>
          <input id="skor-uraian-${esc(soal.id)}" data-uraian-soal="${esc(soal.id)}" data-maks="${esc(soal.bobotNilai)}" class="dnc-input" type="number" min="0" max="${esc(soal.bobotNilai)}" step="0.5" value="${esc(j.skor ?? 0)}" ${hanyaBaca ? 'disabled' : ''}>
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
        <div class="dnc-form-bantuan">Skor PG: ${esc(hasil.skorPg)} | Skor Uraian: ${esc(hasil.skorUraian)} | Skor Akhir: <strong>${esc(hasil.skorAkhir)}</strong> (${esc(hasil.statusKetuntasan)})</div>
      </div>
      ${itemsHtml}
      <div class="dnc-form-grup dnc-mt-12">
        <label class="dnc-label" for="f-catatan-koreksi">Catatan Koreksi Guru / Admin</label>
        <textarea id="f-catatan-koreksi" class="dnc-textarea" placeholder="Tambahkan catatan umpan balik (opsional)" ${hanyaBaca ? 'disabled' : ''}>${esc(hasil.catatanKoreksi || '')}</textarea>
      </div>`,
    onSubmit: async () => {
      let skorUraian = 0;
      const jawabanBaru = (hasil.jawabanSiswa || []).map(j => {
        const inp = document.querySelector(`[data-uraian-soal="${j.soalId}"]`);
        if (!inp) return j;
        const maks = Number(inp.dataset.maks || 0);
        const val = Number(inp.value);
        if (isNaN(val) || val < 0 || val > maks) {
          throw new Error(`Skor uraian harus berada di rentang 0 sampai ${maks}.`);
        }
        skorUraian += val;
        return { ...j, skor: val };
      });

      const skorPg = Number(hasil.skorPg || 0);
      const skorAkhir = totalBobotPaket > 0 ? bulatDua(((skorPg + skorUraian) / totalBobotPaket) * 100) : 0;
      const statusKetuntasan = skorAkhir >= kkm ? 'Tuntas' : 'Belum Tuntas';
      const catatanKoreksi = document.getElementById('f-catatan-koreksi').value.trim();

      await dbUpdate(COLLECTIONS.hasilUjian, hasil.id, {
        jawabanSiswa: jawabanBaru,
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
  const header = ['NomorInduk', 'NamaLengkap', 'Kelas', 'PaketASAS', 'MataPelajaran', 'StatusUjian', 'SkorPG', 'SkorUraian', 'SkorAkhir', 'Ketuntasan'];
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

  // Tab Pilih Role di Halaman Login
  document.querySelectorAll('[data-login-role]').forEach(btn => {
    btn.addEventListener('click', () => setRoleLogin(btn.getAttribute('data-login-role')));
  });

  // Tombol intip password Login
  document.getElementById('btn-intip-password')?.addEventListener('click', e => {
    togglePassword('input-login-password', e.currentTarget);
  });

  // Submit Login (anti page reload)
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

  // Tombol Keluar (Desktop & HP)
  document.getElementById('btn-keluar-desktop')?.addEventListener('click', keluarAplikasi);
  document.getElementById('btn-keluar-hp')?.addEventListener('click', keluarAplikasi);

  // Modal Dinamis Universal
  document.getElementById('btn-tutup-modal')?.addEventListener('click', tutupModalFormDnc);
  document.getElementById('btn-batal-modal')?.addEventListener('click', tutupModalFormDnc);
  document.getElementById('dnc-modal-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (typeof _modalSubmitHandler !== 'function') return;
    const btn = document.getElementById('btn-simpan-modal');
    await denganLoading(btn, 'Menyimpan...', () => _modalSubmitHandler());
  });

  // Modal Konfirmasi
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

  // Sheet Lainnya HP
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

  // Pemulihan sesi Admin Firebase Auth otomatis saat mode Produksi
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
