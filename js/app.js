/**
 * ============================================================
 * SUPER TAMU — Frontend (JavaScript.html)
 * SPA: tamu (wizard 4 langkah) + tuan rumah (PIN). Master PLU dimuat sekali
 * ke memori perangkat sehingga pencarian PLU instan tanpa panggilan server.
 * ============================================================
 */

// ════════════════════════════════════════════════════════
// BAGIAN 1: STATE, UTILITAS, IKON
// ════════════════════════════════════════════════════════

const $ = (id) => document.getElementById(id);
const S = {
  pluMap: new Map(), pluList: [], pluVersion: 0, pluHit: null,
  ref: { perusahaan: [], tamu: [], lokasi: [], ceklist: [] }, lokMap: new Map(),
  cfg: { namaToko: 'Super Indo', logo: '', bg: '' },
  today: '', view: 'home', draft: null, visit: null, host: null,
  editIdx: -1, prdFoto: null, fotoTarget: null, pollTimer: null, verifTimer: null, booted: false
};
const H = { tab: 'verif', pending: [], kunj: [], kunjPeriod: 'bulan', exp: null, expChip: 'all', expLimit: 100, dataKey: 'KUN', dataQ: '', dataPage: 1, data: null, dashPeriod: '30',
  dash: null, charts: [], setTab: 'ident', master: null, defEmail: '', users: [] };


// ── Teks antarmuka yang bisa diubah admin (Pengaturan → Teks & panduan) ──
const LBL = [
  ['Halaman awal', [
    ['home_title', 'Selamat datang', 'Judul halaman awal'],
    ['home_lead', 'Isi data kunjungan Anda: ceklist toko dan produk yang mendekati expired. Selesai setelah diverifikasi tuan rumah.', 'Kalimat di bawah judul'],
    ['guide_title', 'Panduan', 'Judul kotak panduan'],
    ['how1_t', 'Data diri', 'Langkah 1: judul'], ['how1_s', 'Nama, perusahaan, dan nomor HP', 'Langkah 1: penjelasan'],
    ['how2_t', 'Ceklist', 'Langkah 2: judul'], ['how2_s', 'Kebersihan dan label rak', 'Langkah 2: penjelasan'],
    ['how3_t', 'Produk expired', 'Langkah 3: judul'], ['how3_s', 'Cukup isi PLU, deskripsi muncul otomatis', 'Langkah 3: penjelasan'],
    ['how4_t', 'Verifikasi', 'Langkah 4: judul'], ['how4_s', 'Minta tuan rumah menyetujui sebelum pulang', 'Langkah 4: penjelasan'],
    ['btn_start', 'Mulai Kunjungan', 'Tombol utama'], ['btn_start_new', 'Mulai Kunjungan Baru', 'Tombol utama bila ada data sebelumnya'],
    ['btn_host', 'Tuan rumah', 'Tombol pojok kanan atas']
  ]],
  ['Pengisian oleh tamu', [
    ['stp', 'Langkah', 'Kata "Langkah" (Langkah 1 dari 4)'], ['btn_back', 'Kembali', 'Tombol kembali'],
    ['s1_title', 'Data diri', 'Langkah 1: judul'], ['f_prs', 'Perusahaan', 'Kolom perusahaan'], ['f_prs_h', '(pilih atau ketik baru)', 'Petunjuk kolom perusahaan'],
    ['f_nama', 'Nama tamu', 'Kolom nama'], ['f_nama_h', '(pilih atau ketik baru)', 'Petunjuk kolom nama'], ['f_hp', 'Nomor HP', 'Kolom nomor HP'], ['btn_g1', 'Lanjut ke Ceklist', 'Tombol lanjut langkah 1'],
    ['s2_title', 'Ceklist toko', 'Langkah 2: judul'], ['s2_lead', 'Jawab setiap butir. Semua wajib dijawab.', 'Langkah 2: kalimat petunjuk'],
    ['ya', 'Ya', 'Tombol jawaban Ya'], ['tidak', 'Tidak', 'Tombol jawaban Tidak'], ['btn_g2', 'Lanjut ke Data Produk', 'Tombol lanjut langkah 2'],
    ['s3_title', 'Produk mendekati expired', 'Langkah 3: judul'], ['s3_lead', 'Cukup isi PLU, deskripsi muncul otomatis.', 'Langkah 3: kalimat petunjuk'],
    ['f_plu', 'PLU produk', 'Kolom PLU'], ['f_tgl', 'Expired terdekat', 'Kolom tanggal expired'], ['f_lok', 'Kode lokasi', 'Kolom kode lokasi'],
    ['btn_add', 'Tambah ke daftar', 'Tombol tambah produk'], ['sec_didata', 'Sudah didata', 'Judul daftar produk'],
    ['chk_tanpa', 'Tidak ada produk mendekati expired', 'Kotak centang "tidak ada produk"'], ['btn_g3', 'Lanjut ke Ringkasan', 'Tombol lanjut langkah 3'],
    ['s4_title', 'Ringkasan kunjungan', 'Langkah 4: judul'], ['s4_lead', 'Periksa kembali, lalu minta verifikasi tuan rumah.', 'Langkah 4: kalimat petunjuk'],
    ['s4_note', 'Kunjungan baru selesai setelah tuan rumah menyetujui. Tunggu verifikasi sebelum pulang.', 'Langkah 4: catatan'],
    ['btn_submit', 'Ajukan Verifikasi', 'Tombol ajukan verifikasi'], ['s5_title', 'Status kunjungan', 'Judul halaman status']
  ]],
  ['Menu tuan rumah', [
    ['login_title', 'Masuk tuan rumah', 'Judul halaman login'], ['f_pin', 'PIN', 'Kolom PIN'], ['btn_login', 'Masuk', 'Tombol masuk'], ['btn_logout', 'Keluar', 'Tombol keluar'], ['btn_refresh', 'Segarkan', 'Tombol segarkan'],
    ['nav_verif', 'Verifikasi', 'Menu bawah: verifikasi'], ['nav_kunj', 'Kunjungan', 'Menu bawah: kunjungan'], ['nav_exp', 'Expired', 'Menu bawah: expired'],
    ['nav_dash', 'Dasbor', 'Menu bawah: dasbor'], ['nav_data', 'Data', 'Menu bawah: data (Super Admin)'], ['nav_set', 'Pengaturan', 'Menu bawah: pengaturan'],
    ['t_verif', 'Verifikasi', 'Judul halaman verifikasi'], ['t_kunj', 'Hasil kunjungan', 'Judul halaman kunjungan'], ['t_exp', 'Mendekati expired', 'Judul halaman expired'],
    ['t_dash', 'Dasbor', 'Judul halaman dasbor'], ['t_data', 'Data (Super Admin)', 'Judul halaman data'], ['t_set', 'Pengaturan', 'Judul halaman pengaturan'],
    ['chip_all', 'Semua tanggal', 'Filter expired: semua tanggal'], ['btn_tarik', 'Tarik', 'Tombol tandai ditarik'], ['btn_batal', 'Batal', 'Tombol batal tarik'], ['btn_ubah', 'Ubah', 'Tombol ubah']
  ]]
];
const DEF = {};
LBL.forEach((g) => g[1].forEach((x) => { DEF[x[0]] = x[1]; }));
const DEF_PANDUAN = 'Selamat datang di toko kami.\n1. Tekan tombol Mulai Kunjungan.\n2. Isi perusahaan, nama, dan nomor HP.\n3. Jawab ceklist, lalu isi produk yang mendekati expired.\n4. Minta tuan rumah memverifikasi sebelum Anda pulang.';
const T = (k) => (S.cfg && S.cfg.labels && S.cfg.labels[k]) || DEF[k] || k;
function applyLabels() {
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = T(el.dataset.t); });
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const p2 = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s === null || s === undefined ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const normKey = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

const dUTC = (iso) => { const p = iso.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5; };
const dayDiff = (a, b) => Math.round(dUTC(b) - dUTC(a));
const addDays = (iso, n) => { const d = new Date((dUTC(iso) + n) * 864e5); return d.getUTCFullYear() + '-' + p2(d.getUTCMonth() + 1) + '-' + p2(d.getUTCDate()); };
const fmtDate = (iso) => iso ? (+iso.slice(8, 10)) + ' ' + BULAN[+iso.slice(5, 7) - 1] + ' ' + iso.slice(0, 4) : '';
const fmtDT = (dt) => dt ? fmtDate(dt.slice(0, 10)) + ', ' + dt.slice(11, 16) : '';
const todayIso = () => {
  if (S.today) return S.today;
  const d = new Date();
  return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
};
const validIso = (iso) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return false;
  const p = iso.split('-').map(Number);
  const d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  return d.getUTCFullYear() === p[0] && d.getUTCMonth() === p[1] - 1 && d.getUTCDate() === p[2];
};

const ICONS = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14M9 7V4.5h6V7M7 7l.8 12h8.4L17 7"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3.5 8A1.5 1.5 0 015 6.5h2l1.3-2h7.4l1.3 2h2A1.5 1.5 0 0120.5 8v9a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 17z"/><circle cx="12" cy="12.5" r="3.2"/></svg>',
  wait: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="M12 3l7 2.7v5.3c0 4.3-3 7.500-7 9-4-1.500-7-4.700-7-9V5.700z"/><path d="M8.500 12l2.500 2.500 4.500-5"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3 2"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 19v-7M12 19V5M18 19v-4"/></svg>',
  db: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.700 3.100 3 7 3s7-1.300 7-3V6M5 12v6c0 1.700 3.100 3 7 3s7-1.300 7-3v-6"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.400 15a1.700 1.700 0 00.3 1.800l.1.1a2 2 0 11-2.800 2.800l-.1-.1a1.700 1.700 0 00-1.800-.3 1.700 1.700 0 00-1 1.500V21a2 2 0 11-4 0v-.1a1.700 1.700 0 00-1.100-1.500 1.700 1.700 0 00-1.800.3l-.1.1a2 2 0 11-2.800-2.800l.1-.1a1.700 1.700 0 00.3-1.800 1.700 1.700 0 00-1.500-1H3a2 2 0 110-4h.1a1.700 1.700 0 001.500-1.100 1.700 1.700 0 00-.3-1.800l-.1-.1a2 2 0 112.800-2.800l.1.1a1.700 1.700 0 001.800.3H9a1.700 1.700 0 001-1.500V3a2 2 0 114 0v.1a1.700 1.700 0 001 1.500 1.700 1.700 0 001.800-.3l.1-.1a2 2 0 112.800 2.800l-.1.1a1.700 1.700 0 00-.3 1.800V9a1.700 1.700 0 001.500 1H21a2 2 0 110 4h-.1a1.700 1.700 0 00-1.500 1z"/></svg>'
};
const icon = (n) => ICONS[n] || '';

// ── localStorage aman (bisa gagal di mode privat) ──
const lsGet = (k, def) => { try { const v = localStorage.getItem('stm_' + k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } };
const lsSet = (k, v) => { try { localStorage.setItem('stm_' + k, JSON.stringify(v)); } catch (e) { /* abaikan */ } };
const lsDel = (k) => { try { localStorage.removeItem('stm_' + k); } catch (e) { /* abaikan */ } };
const lsRawGet = (k) => { try { return localStorage.getItem('stm_' + k); } catch (e) { return null; } };
const lsRawSet = (k, v) => { try { localStorage.setItem('stm_' + k, v); } catch (e) { /* abaikan */ } };

function toast(msg, type) {
  const el = document.createElement('div');
  el.className = 'toast ' + (type || '');
  el.textContent = msg;
  $('toasts').appendChild(el);
  setTimeout(() => el.remove(), type === 'err' ? 5000 : 3200);
}

let barCount = 0;
function bar(on) {
  barCount = Math.max(0, barCount + (on ? 1 : -1));
  $('topProgress').classList.toggle('on', barCount > 0);
}

/* call() ada di js/api.js */

/** Tombol sibuk: tampilkan spinner & nonaktifkan selama proses */
async function busy(btn, label, fn) {
  const old = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner sm"></span>' + esc(label);
  try { return await fn(); } finally { btn.disabled = false; btn.innerHTML = old; }
}

function openModal(id) { const m = $(id); m.hidden = false; }
function closeModal(id) { $(id).hidden = true; }
function confirmDialog(msg, yes) {
  return new Promise((resolve) => {
    $('mConfirmMsg').textContent = msg;
    $('mConfirmYes').textContent = yes || 'Ya';
    const done = (v) => { closeModal('mConfirm'); $('mConfirmYes').onclick = null; $('mConfirmNo').onclick = null; resolve(v); };
    $('mConfirmYes').onclick = () => done(true);
    $('mConfirmNo').onclick = () => done(false);
    openModal('mConfirm');
  });
}

function badgeCls(st) {
  return st === 'Disetujui' ? 'b-ok' : st === 'Ditolak' ? 'b-bad' : 'b-warn';
}

// ════════════════════════════════════════════════════════
// BAGIAN 2: TEMA, KONFIGURASI, NAVIGASI SPA
// ════════════════════════════════════════════════════════

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  lsSet('theme', t);
  $('btnTheme').innerHTML = icon(t === 'dark' ? 'sun' : 'moon');
  if (S.view === 'host' && H.tab === 'dash' && H.dash) renderDash(H.dash);
}

function applyCfg() {
  $('brandStore').textContent = S.cfg.namaToko || 'Super Indo';
  applyLabels();
  if (S.view === 'home') renderHome();
  const img = $('brandLogo');
  if (S.cfg.logo) {
    img.onerror = () => { img.hidden = true; $('brandMark').hidden = false; };
    img.src = S.cfg.logo; img.hidden = false; $('brandMark').hidden = true;
  } else { img.hidden = true; $('brandMark').hidden = false; }
  const bg = $('bgLayer');
  if (S.cfg.bg) { bg.style.backgroundImage = 'url("' + S.cfg.bg.replace(/"/g, '%22') + '")'; bg.classList.add('img'); }
  else { bg.style.backgroundImage = ''; bg.classList.remove('img'); }
}

const VIEWS = ['home', 'g1', 'g2', 'g3', 'g4', 'g5', 'hlogin', 'host'];
function show(id) {
  VIEWS.forEach((v) => { $('v-' + v).hidden = v !== id; });
  S.view = id;
  $('wrap').classList.toggle('wide', id === 'host');
  window.scrollTo(0, 0);
  if (id !== 'g5') stopPoll();
  if (id !== 'host') stopVerifTimer();
  if (id === 'home') renderHome();
  if (id === 'g5') { renderStatus(); startPoll(); }
}

function hideOverlay() {
  const o = $('loadingOverlay');
  o.classList.add('gone');
  setTimeout(() => { o.hidden = true; }, 320);
}

// ════════════════════════════════════════════════════════
// BAGIAN 3: DATA MASTER DI PERANGKAT (PLU INSTAN)
// ════════════════════════════════════════════════════════

function buildPluIndex(rows) {
  S.pluMap = new Map();
  S.pluList = rows.map((r) => {
    S.pluMap.set(String(r[0]).toUpperCase(), { d: r[1], k: r[2] });
    return { p: String(r[0]), d: r[1], pl: String(r[0]).toLowerCase(), dl: String(r[1]).toLowerCase() };
  });
}
function setRef(ref) {
  S.ref = ref;
  S.lokMap = new Map(ref.lokasi.map((l) => [compactLok(l[0]), l[0]]));
}
function loadCaches() {
  const v = lsGet('plu_v', 0);
  const json = lsRawGet('plu_json');
  if (v && json) {
    try { buildPluIndex(JSON.parse(json)); S.pluVersion = v; } catch (e) { S.pluVersion = 0; }
  }
  const ref = lsGet('ref', null);
  if (ref) setRef(ref);
  const cfg = lsGet('cfg', null);
  if (cfg) S.cfg = Object.assign(S.cfg, cfg);
  return S.pluVersion > 0 && S.pluMap.size > 0;
}

/** Satu panggilan: server hanya mengirim PLU bila versinya berbeda dari yang tersimpan */
async function refreshBootstrap() {
  const d = await call('getBootstrap', S.pluVersion || 0);
  if (d.pluJson) {
    buildPluIndex(JSON.parse(d.pluJson));
    lsRawSet('plu_json', d.pluJson);
  }
  S.pluVersion = d.pluVersion; lsSet('plu_v', d.pluVersion);
  setRef(d.ref); lsSet('ref', d.ref);
  S.cfg = d.cfg; lsSet('cfg', d.cfg);
  S.today = d.today;
  applyCfg();
  fillLists();
  if (S.view === 'g3') onPluInput();
  return d;
}

function fillLists() {
  /* Pilihan perusahaan, nama, dan lokasi dibaca langsung oleh dropdown kustom (lihat BAGIAN 4A) */
}

/** Saran PLU: awalan PLU lebih dulu, lalu yang mengandung PLU/nama. Dicari di perangkat. */
function suggest(q) {
  q = q.toLowerCase();
  const a = [], b = [];
  for (let i = 0; i < S.pluList.length; i++) {
    const it = S.pluList[i];
    if (it.pl.startsWith(q)) { a.push(it); if (a.length >= 8) break; }
    else if (b.length < 8 && (it.pl.includes(q) || it.dl.includes(q))) b.push(it);
  }
  return a.concat(b).slice(0, 8);
}

// ════════════════════════════════════════════════════════
// BAGIAN 4: TAMU — DRAFT & BERANDA
// ════════════════════════════════════════════════════════

const newDraft = () => ({ perusahaan: '', nama: '', hp: '', ck: {}, produk: [], tanpa: false });
const hasDraft = () => !!(S.draft && (S.draft.perusahaan || S.draft.nama || S.draft.produk.length));
function saveDraft() { lsSet('draft', JSON.parse(JSON.stringify(S.draft, (k, v) => (k === '_f' ? undefined : v)))); }
function saveVisit() { if (S.visit) lsSet('visit', S.visit); else lsDel('visit'); }
function resetAll() { S.draft = newDraft(); S.visit = null; S.prdFoto = null; S.editIdx = -1; saveDraft(); saveVisit(); }

function renderHome() {
  let h = '';
  if (S.visit) {
    h = '<div class="card glass"><div class="card-h"><h3>Kunjungan Anda</h3><span class="badge ' + badgeCls(S.visit.status) + '">' + esc(S.visit.status) + '</span></div>' +
      '<p class="muted small">' + esc(S.visit.id) + '</p><button id="btnSeeStatus" class="btn tint block" type="button" style="margin-top:10px">Lihat status</button></div>';
  } else if (hasDraft()) {
    h = '<div class="card glass"><div class="card-h"><h3>Pengisian belum selesai</h3></div><p class="muted small">Data Anda tersimpan di perangkat ini.</p>' +
      '<button id="btnResume" class="btn tint block" type="button" style="margin-top:10px">Lanjutkan pengisian</button></div>';
  }
  $('homeStatus').innerHTML = h;
  $('btnStart').textContent = (S.visit || hasDraft()) ? T('btn_start_new') : T('btn_start');
  const pan = S.cfg && typeof S.cfg.panduan === 'string' ? S.cfg.panduan : DEF_PANDUAN;
  $('homePanduan').hidden = !pan.trim();
  $('homePanduanText').textContent = pan;
}

async function startNew() {
  if (S.visit && S.visit.status !== 'Disetujui') {
    if (!(await confirmDialog('Kunjungan sebelumnya belum selesai. Mulai kunjungan baru?', 'Mulai baru'))) return;
  } else if (hasDraft() && !S.visit) {
    if (!(await confirmDialog('Data yang sudah diisi akan dihapus. Mulai kunjungan baru?', 'Mulai baru'))) return;
  }
  resetAll();
  openG1();
}

// ── Langkah 1: data diri ──
function openG1() {
  $('inPrs').value = S.draft.perusahaan; $('inNama').value = S.draft.nama; $('inHp').value = S.draft.hp;
  $('errG1').textContent = '';
  updateNamaList();
  show('g1');
}
function updateNamaList() { /* saran nama menyesuaikan perusahaan saat dibuka */ }

// ── BAGIAN 4A: saran isian (tampil tepat di bawah kolom, tidak tertutup keyboard) ──
const compactTxt = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const compactLok = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/([A-Z])0+(\d)/g, '$1$2');
const lokOk = (raw) => /^[A-Z0-9][A-Z0-9\-\/.]{0,19}$/.test(String(raw || '').toUpperCase().replace(/\s+/g, ''));
/** Kode lokasi ketikan -> kode baku di daftar; bila di luar daftar dan diizinkan, dipakai apa adanya */
function resolveLokClient(v) {
  const hit = S.lokMap.get(compactLok(v));
  if (hit) return hit;
  const up = String(v || '').toUpperCase().replace(/\s+/g, '');
  return (S.cfg.lokManual !== false && lokOk(up)) ? up : '';
}
function cbItems(kind, raw, all) {
  const q = normKey(raw);
  const qc = kind === 'lok' ? compactLok(raw).toLowerCase() : compactTxt(raw);
  let list = [];
  if (kind === 'prs') list = S.ref.perusahaan.map((p) => ({ v: p, k: normKey(p), kc: compactTxt(p) }));
  else if (kind === 'lok') list = S.ref.lokasi.map((l) => ({ v: l[0], sub: l[1], k: normKey(l[0]), kc: compactLok(l[0]).toLowerCase(), k2: normKey(l[1]) }));
  else if (kind === 'nama') {
    const p = normKey($('inPrs').value), seen = {};
    S.ref.tamu.forEach((t) => {
      if (p && normKey(t.p) !== p) return;
      const key = normKey(t.n) + '|' + normKey(t.p);
      if (seen[key]) return; seen[key] = 1;
      list.push({ v: t.n, sub: p ? '' : t.p, p: t.p, k: normKey(t.n), kc: compactTxt(t.n), k2: normKey(t.p) });
    });
  }
  if (q) {
    const a = [], b = [];
    list.forEach((x) => {
      if (x.k.indexOf(q) === 0 || (qc && x.kc.indexOf(qc) === 0)) a.push(x);
      else if (x.k.indexOf(q) >= 0 || (qc && x.kc.indexOf(qc) >= 0) || (x.k2 && x.k2.indexOf(q) >= 0)) b.push(x);
    });
    list = a.concat(b);
  }
  const exact = list.some((x) => x.k === q || (qc && x.kc === qc));
  list = list.slice(0, all ? 300 : 6);
  if (q && !exact) {
    if (kind === 'lok') { if (S.cfg.lokManual !== false && lokOk(raw)) list.push({ v: String(raw).toUpperCase().replace(/\s+/g, ''), sub: 'Pakai kode ini (di luar daftar)', nw: true }); }
    else list.push({ v: String(raw).replace(/\s+/g, ' ').trim(), sub: 'Pakai sebagai data baru', nw: true });
  }
  return list;
}
const CB_CLOSERS = [];
document.addEventListener('pointerdown', (e) => { CB_CLOSERS.forEach((f) => f(e.target)); });
function attachCombo(input, kind) {
  if (!input || input._cb) return;
  input._cb = true;
  const wrap = document.createElement('div'); wrap.className = 'cb';
  input.parentNode.insertBefore(wrap, input); wrap.appendChild(input);
  input.removeAttribute('list');
  input.setAttribute('autocomplete', 'off'); input.setAttribute('autocorrect', 'off'); input.setAttribute('spellcheck', 'false');
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cb-btn'; btn.tabIndex = -1; btn.setAttribute('aria-label', 'Lihat semua pilihan'); btn.innerHTML = icon('chev');
  const box = document.createElement('div'); box.className = 'sg'; box.hidden = true;
  wrap.appendChild(btn); wrap.appendChild(box);
  let items = [], picked = false, isAll = false;
  const render = () => {
    box.innerHTML = items.length ? items.map((x, i) => '<button type="button" data-i="' + i + '"' + (x.nw ? ' class="nw"' : '') + '>' + esc(x.v) + (x.sub ? '<small>' + esc(x.sub) + '</small>' : '') + '</button>').join('') : '<div class="sg-empty">Tidak ada pilihan yang cocok.</div>';
  };
  const toView = () => {
    setTimeout(() => {
      const mb = input.closest('.modal-b');
      const r = input.getBoundingClientRect();
      if (mb) { mb.scrollTop += r.top - mb.getBoundingClientRect().top - 12; return; }
      if (r.top > 150 || r.top < 70) window.scrollBy(0, r.top - 90);
    }, 320);
  };
  const open = (all) => {
    isAll = !!all;
    items = cbItems(kind, input.value, isAll); render();
    box.hidden = false; wrap.classList.toggle('all', isAll);
  };
  const close = () => { box.hidden = true; wrap.classList.remove('all'); isAll = false; };
  const pick = (x) => {
    picked = true;
    input.value = x.v;
    if (kind === 'nama' && x.p && $('inPrs') && !$('inPrs').value.trim()) $('inPrs').value = x.p;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    picked = false; close();
  };
  input.addEventListener('focus', () => { open(false); toView(); });
  input.addEventListener('click', () => { if (box.hidden) open(false); });
  input.addEventListener('input', () => { if (!picked) open(false); });
  input.addEventListener('blur', () => { setTimeout(() => { if (!wrap.contains(document.activeElement)) close(); }, 250); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) { e.stopPropagation(); close(); } });
  btn.addEventListener('click', () => { if (!box.hidden && isAll) close(); else { open(true); toView(); } });
  box.addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) pick(items[+b.dataset.i]); });
  CB_CLOSERS.push((t) => { if (!box.hidden && !wrap.contains(t)) close(); });
}

function normHpClient(v) {
  let d = String(v || '').replace(/[\s\-.()]/g, '');
  if (/^\+62/.test(d)) d = '0' + d.slice(3); else if (/^62/.test(d)) d = '0' + d.slice(2);
  return /^08\d{8,12}$/.test(d) ? d : '';
}
function submitG1(e) {
  e.preventDefault();
  const prs = $('inPrs').value.replace(/\s+/g, ' ').trim();
  const nama = $('inNama').value.replace(/\s+/g, ' ').trim();
  const hp = normHpClient($('inHp').value);
  let err = '';
  if (!prs) err = 'Perusahaan wajib diisi.';
  else if (!nama) err = 'Nama tamu wajib diisi.';
  else if (!hp) err = 'Nomor HP tidak valid (contoh: 081234567890).';
  $('errG1').textContent = err;
  if (err) return;
  S.draft.perusahaan = prs; S.draft.nama = nama; S.draft.hp = hp;
  saveDraft();
  openG2();
}

// ── Langkah 2: ceklist ──
function openG2() {
  renderCk();
  $('errG2').textContent = '';
  show('g2');
}
function renderCk() {
  const groups = {}, order = [];
  S.ref.ceklist.forEach((c) => { if (!groups[c.k]) { groups[c.k] = []; order.push(c.k); } groups[c.k].push(c); });
  if (!order.length) { $('ckList').innerHTML = '<div class="card glass muted">Belum ada butir ceklist. Hubungi tuan rumah.</div>'; return; }
  $('ckList').innerHTML = order.map((k) => '<div class="card glass"><div class="card-h"><h3>' + esc(k) + '</h3><span class="muted small">' + groups[k].length + ' butir</span></div>' +
    groups[k].map((c) => {
      const a = S.draft.ck[c.u] || {};
      const more = !!(a.c || a._f);
      return '<div class="ck-item" id="ck' + c.u + '" data-u="' + c.u + '"><div class="ck-row"><div class="ck-q">' + esc(c.b) + '</div>' +
        '<div class="seg" role="group" aria-label="' + esc(c.b) + '">' +
        '<button type="button" class="y" data-act="ck" data-u="' + c.u + '" data-h="Ya" aria-pressed="' + (a.h === 'Ya') + '">' + esc(T('ya')) + '</button>' +
        '<button type="button" class="n" data-act="ck" data-u="' + c.u + '" data-h="Tidak" aria-pressed="' + (a.h === 'Tidak') + '">' + esc(T('tidak')) + '</button></div></div>' +
        '<button type="button" class="link" data-act="ckmore" data-u="' + c.u + '">Catatan / foto (opsional)</button>' +
        '<div class="ck-more" ' + (more ? '' : 'hidden') + '><textarea data-act="cknote" data-u="' + c.u + '" maxlength="200" placeholder="Catatan (opsional)" aria-label="Catatan">' + esc(a.c || '') + '</textarea>' +
        '<div class="foto-box" data-foto="' + c.u + '">' + (a._f ? '<img class="thumb" src="' + a._f + '" alt="Foto ceklist" data-act="ckprev" data-u="' + c.u + '">' : '') + '</div>' +
        '<button type="button" class="btn ghost sm" data-act="ckfoto" data-u="' + c.u + '">' + icon('camera') + ' Foto</button></div></div>';
    }).join('') + '</div>').join('');
}
function onCkClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const u = b.dataset.u, act = b.dataset.act;
  if (act === 'ck') {
    S.draft.ck[u] = Object.assign(S.draft.ck[u] || {}, { h: b.dataset.h });
    b.parentNode.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $('ck' + u).classList.remove('miss');
    saveDraft();
  } else if (act === 'ckmore') {
    const more = $('ck' + u).querySelector('.ck-more');
    more.hidden = !more.hidden;
  } else if (act === 'ckfoto') {
    S.fotoTarget = u; $('fileCk').value = ''; $('fileCk').click();
  } else if (act === 'ckprev') {
    openPreview(S.draft.ck[u]._f, S.draft.ck[u]._f, true);
  }
}
function onCkInput(e) {
  const t = e.target;
  if (t.dataset.act === 'cknote') {
    S.draft.ck[t.dataset.u] = Object.assign(S.draft.ck[t.dataset.u] || {}, { c: t.value });
    saveDraft();
  }
}
async function onCkFile() {
  const f = $('fileCk').files[0];
  if (!f || !S.fotoTarget) return;
  try {
    const du = await compressImage(f);
    const u = S.fotoTarget;
    S.draft.ck[u] = Object.assign(S.draft.ck[u] || {}, { _f: du });
    renderCk();
  } catch (err) { toast(err.message, 'err'); }
}
function nextG2() {
  const miss = S.ref.ceklist.filter((c) => !(S.draft.ck[c.u] && S.draft.ck[c.u].h));
  document.querySelectorAll('.ck-item.miss').forEach((x) => x.classList.remove('miss'));
  if (miss.length) {
    miss.forEach((c) => $('ck' + c.u).classList.add('miss'));
    $('errG2').textContent = miss.length + ' butir belum dijawab.';
    $('ck' + miss[0].u).scrollIntoView({ block: 'center', behavior: 'smooth' });
    return;
  }
  $('errG2').textContent = '';
  openG3();
}

// ── Foto: kompres di perangkat (maks 1280px, JPEG) ──
function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) { reject(new Error('File harus berupa gambar.')); return; }
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('Gagal membaca foto.'));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Foto tidak dapat dibuka.'));
      img.onload = () => {
        const sc = Math.min(1, 1280 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.72));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}
function dataUrlToFoto(du) {
  const m = /^data:(.+?);base64,(.*)$/.exec(du || '');
  return m ? { mime: m[1], data: m[2] } : null;
}
function openPreview(src, dl, local) {
  $('previewImg').src = src;
  const a = $('previewDl');
  a.href = dl;
  if (local) { a.setAttribute('download', 'foto.jpg'); a.removeAttribute('target'); }
  else { a.removeAttribute('download'); a.setAttribute('target', '_blank'); }
  openModal('mPreview');
}

// ── Langkah 3: produk expired ──
function openG3() {
  fillLists();
  const t = todayIso();
  $('inTgl').min = addDays(t, -365); $('inTgl').max = addDays(t, 1825);
  $('errG3').textContent = ''; $('errG3b').textContent = '';
  renderPrd(); renderPrdFoto(); onPluInput();
  show('g3');
}
function onPluInput() {
  const v = $('inPlu').value.trim();
  const box = $('pluResult');
  if (!v) { box.innerHTML = ''; S.pluHit = null; return; }
  const hit = S.pluMap.get(v.toUpperCase());
  if (hit) {
    S.pluHit = { p: v.toUpperCase(), d: hit.d };
    box.innerHTML = '<div class="res ok"><span style="color:var(--accent)">' + icon('check') + '</span><div><b>' + esc(hit.d) + '</b><span>' + esc(hit.k || 'Tanpa kategori') + ' · terisi otomatis</span></div></div>';
    return;
  }
  S.pluHit = null;
  const sg = suggest(v);
  box.innerHTML = sg.length
    ? '<ul class="sugg">' + sg.map((s) => '<li><button type="button" data-plu="' + esc(s.p) + '"><span>' + esc(s.d) + '</span><small>' + esc(s.p) + '</small></button></li>').join('') + '</ul>'
    : '<div class="res no">PLU "' + esc(v) + '" tidak ditemukan.</div>';
}
function renderPrdFoto() {
  $('prdFotoBox').innerHTML = S.prdFoto
    ? '<img class="thumb" src="' + S.prdFoto + '" alt="Foto produk" id="prdThumb"><button type="button" class="link" id="prdFotoDel">Hapus foto</button>' : '';
}
function addPrd() {
  const hit = S.pluHit;
  const tgl = $('inTgl').value;
  const lok = resolveLokClient($('inLok').value);
  let err = '';
  if (!hit) err = 'Isi PLU yang terdaftar.';
  else if (!validIso(tgl)) err = 'Isi tanggal expired terdekat.';
  else if (dayDiff(todayIso(), tgl) < -365 || dayDiff(todayIso(), tgl) > 1825) err = 'Tanggal expired di luar batas wajar.';
  else if (!lok) err = 'Kode lokasi belum benar. Ketik lalu pilih dari daftar di bawah kolom.';
  $('errG3').textContent = err;
  if (err) return;
  const old = S.editIdx >= 0 ? S.draft.produk[S.editIdx] : null;
  const item = { plu: hit.p, desc: hit.d, tgl: tgl, lok: lok };
  const f = S.prdFoto || (old && old._f);
  if (f) item._f = f;
  const dup = S.draft.produk.some((x, i) => i !== S.editIdx && x.plu === item.plu && x.lok === item.lok);
  if (S.editIdx >= 0) S.draft.produk[S.editIdx] = item; else S.draft.produk.push(item);
  S.draft.tanpa = false;
  S.editIdx = -1; S.prdFoto = null; S.pluHit = null;
  $('inPlu').value = ''; $('inTgl').value = ''; $('inLok').value = '';
  $('btnPrdAdd').textContent = T('btn_add');
  saveDraft(); renderPrd(); renderPrdFoto(); onPluInput();
  if (dup) toast('PLU dan lokasi yang sama sudah ada. Pastikan bukan data ganda.', 'warn'); else toast('Produk ditambahkan.', 'ok');
  $('inPlu').focus();
}
function renderPrd() {
  const l = S.draft.produk;
  $('prdCount').textContent = l.length ? l.length + ' produk' : '';
  $('prdList').innerHTML = l.length ? l.map((x, i) => '<div class="li"><button type="button" class="grow" data-act="edit" data-i="' + i + '" aria-label="Ubah ' + esc(x.desc) + '"><b>' + esc(x.desc) + '</b><span>PLU ' + esc(x.plu) + ' · Exp ' + esc(fmtDate(x.tgl)) + ' · ' + esc(x.lok) + '</span></button>' +
    (x._f ? '<img class="thumb" src="' + x._f + '" alt="Foto produk" data-act="prev" data-i="' + i + '">' : '') +
    '<button type="button" class="icon-btn" data-act="del" data-i="' + i + '" aria-label="Hapus ' + esc(x.desc) + '">' + icon('trash') + '</button></div>').join('')
    : '<p class="muted small">Belum ada produk didata.</p>';
  $('chkTanpa').checked = !!S.draft.tanpa && !l.length;
  $('chkTanpa').disabled = l.length > 0;
}
function onPrdClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const i = +b.dataset.i, x = S.draft.produk[i];
  if (b.dataset.act === 'del') { S.draft.produk.splice(i, 1); S.editIdx = -1; saveDraft(); renderPrd(); }
  else if (b.dataset.act === 'edit') {
    S.editIdx = i; S.prdFoto = x._f || null;
    $('inPlu').value = x.plu; $('inTgl').value = x.tgl; $('inLok').value = x.lok;
    $('btnPrdAdd').textContent = 'Simpan perubahan';
    onPluInput(); renderPrdFoto(); $('inPlu').scrollIntoView({ block: 'center', behavior: 'smooth' });
  } else if (b.dataset.act === 'prev') openPreview(x._f, x._f, true);
}
function nextG3() {
  if (!S.draft.produk.length && !S.draft.tanpa) {
    $('errG3b').textContent = 'Tambahkan produk, atau centang "Tidak ada produk mendekati expired".';
    return;
  }
  $('errG3b').textContent = '';
  openG4();
}

// ── Langkah 4: ringkasan & kirim ──
function openG4() {
  const d = S.draft;
  const tidak = S.ref.ceklist.filter((c) => d.ck[c.u] && d.ck[c.u].h === 'Tidak').length;
  const ya = S.ref.ceklist.length - tidak;
  $('sumBox').innerHTML =
    '<div class="card glass"><div class="sum-row"><span class="muted">Tamu</span><b>' + esc(d.nama) + '</b></div>' +
    '<div class="sum-row"><span class="muted">Perusahaan</span><b>' + esc(d.perusahaan) + '</b></div>' +
    '<div class="sum-row"><span class="muted">Nomor HP</span><b>' + esc(d.hp) + '</b></div></div>' +
    '<div class="card glass"><div class="card-h"><h3>Hasil ceklist</h3><span><span class="badge b-ok">' + ya + ' Ya</span> ' + (tidak ? '<span class="badge b-bad">' + tidak + ' Tidak</span>' : '') + '</span></div></div>' +
    '<div class="card glass"><div class="card-h"><h3>Produk mendekati expired</h3><span class="muted small">' + d.produk.length + ' produk</span></div>' +
    (d.produk.length ? d.produk.map((x) => '<div class="li"><div class="grow"><b>' + esc(x.desc) + '</b><span>Exp ' + esc(fmtDate(x.tgl)) + ' · ' + esc(x.lok) + '</span></div></div>').join('') : '<p class="muted small">Tidak ada produk mendekati expired.</p>') + '</div>';
  $('errG4').textContent = '';
  show('g4');
}
async function submitVisit() {
  const d = S.draft;
  const payload = {
    nama: d.nama, perusahaan: d.perusahaan, hp: d.hp, tanpaProduk: !!d.tanpa && !d.produk.length,
    ceklist: S.ref.ceklist.map((c) => ({ u: c.u, h: d.ck[c.u].h, c: d.ck[c.u].c || '', f: dataUrlToFoto(d.ck[c.u]._f) })),
    produk: d.produk.map((x) => ({ plu: x.plu, tgl: x.tgl, lok: x.lok, f: dataUrlToFoto(x._f) }))
  };
  if (S.visit && S.visit.status === 'Ditolak') { payload.id = S.visit.id; payload.token = S.visit.token; }
  try {
    const r = await busy($('btnSubmit'), 'Mengirim...', () => call('submitVisit', payload));
    S.visit = { id: r.id, token: r.token, status: r.status, catatan: '' };
    saveVisit();
    refreshBootstrap().catch(() => {});
    show('g5');
  } catch (err) { $('errG4').textContent = err.message; }
}

// ── Status & polling ──
function renderStatus() {
  const v = S.visit;
  if (!v) { $('statusBox').innerHTML = '<p class="muted center">Belum ada kunjungan.</p>'; return; }
  let ico = 'wait', cls = 'wait', h = 'Menunggu verifikasi', p = 'Mohon tunggu. Tuan rumah akan memeriksa data Anda. Jangan pulang sebelum disetujui.', btn = '';
  if (v.status === 'Disetujui') { ico = 'check'; cls = 'good'; h = 'Kunjungan disetujui'; p = 'Terima kasih. Kunjungan Anda selesai dan boleh pulang.'; btn = '<button id="btnNewVisit" class="btn primary block" type="button">Kunjungan baru</button>'; }
  else if (v.status === 'Ditolak') { ico = 'close'; cls = 'bad'; h = 'Perlu diperbaiki'; p = 'Catatan tuan rumah: ' + esc(v.catatan || '-'); btn = '<button id="btnFix" class="btn primary block" type="button">Perbaiki dan ajukan ulang</button>'; }
  else btn = '<button id="btnRefStatus" class="btn tint block" type="button">Segarkan status</button>';
  $('statusBox').innerHTML = '<div class="status-big"><div class="ico ' + cls + '">' + icon(ico) + '</div><h2>' + h + '</h2><p>' + (v.status === 'Ditolak' ? p : esc(p)) + '</p><p class="small" style="margin-top:8px">' + esc(v.id) + '</p></div>' + btn;
}
async function refreshStatus(silent) {
  if (!S.visit) return;
  try {
    const r = await call('getVisitStatus', S.visit.id, S.visit.token);
    const changed = r.status !== S.visit.status;
    S.visit.status = r.status; S.visit.catatan = r.catatan; saveVisit();
    if (S.view === 'g5') renderStatus();
    if (changed) { toast('Status: ' + r.status, r.status === 'Disetujui' ? 'ok' : 'warn'); if (r.status !== 'Menunggu Verifikasi') stopPoll(); }
  } catch (e) {
    if (/tidak ditemukan/i.test(e.message)) { resetAll(); show('home'); }
    else if (!silent) toast(e.message, 'err');
  }
}
function startPoll() { stopPoll(); if (S.visit && S.visit.status === 'Menunggu Verifikasi') S.pollTimer = setInterval(() => refreshStatus(true), 15000); }
function stopPoll() { if (S.pollTimer) { clearInterval(S.pollTimer); S.pollTimer = null; } }

// ════════════════════════════════════════════════════════
// BAGIAN 5: TUAN RUMAH — LOGIN & NAVIGASI
// ════════════════════════════════════════════════════════

const NAV_BASE = [['verif', 'nav_verif', 'shield'], ['kunj', 'nav_kunj', 'list'], ['exp', 'nav_exp', 'clock'], ['dash', 'nav_dash', 'chart'], ['set', 'nav_set', 'gear']];
const isAdmin = () => !!(S.host && S.host.peran === 'Super Admin');
const navItems = () => (isAdmin() ? NAV_BASE.slice(0, 4).concat([['data', 'nav_data', 'db']], NAV_BASE.slice(4)) : NAV_BASE);

/** Panggilan khusus tuan rumah (menyertakan token; sesi habis -> kembali ke login) */
async function hcall(fn, ...args) {
  if (!S.host) throw new Error('SESI');
  try { return await call(fn, S.host.token, ...args); }
  catch (e) {
    if (e.message === 'SESI_HABIS') { hostLocalLogout(); toast('Sesi berakhir. Silakan masuk lagi.', 'warn'); show('hlogin'); throw new Error('SESI'); }
    throw e;
  }
}
function onErr(e) { if (e && e.message !== 'SESI') toast(e.message || 'Terjadi kesalahan.', 'err'); }
/** Cache stale-while-revalidate untuk data tuan rumah: tampil seketika dari memori, lalu segarkan di latar belakang.
 *  Panggilan identik yang sedang berjalan digabung; data < 4 detik dianggap segar (tidak diulang). */
const SWR = {}, SWF = {};
function swrDrop(prefix) { Object.keys(SWR).forEach((k) => { if (!prefix || k.indexOf(prefix) === 0) delete SWR[k]; }); }
function swr(key, fn, args, onData) {
  const c = SWR[key];
  if (c) { onData(c.d, true); if (Date.now() - c.t < 4000) return Promise.resolve(c.d); }
  if (!SWF[key]) {
    SWF[key] = hcall(fn, ...args).then((d) => { SWR[key] = { d, t: Date.now() }; return d; }).finally(() => { delete SWF[key]; });
  }
  return SWF[key].then((d) => { onData(d, false); return d; }, (e) => { if (!c) throw e; onErr(e); });
}
const skel = (n) => new Array(n || 3).fill('<div class="skeleton"></div>').join('');

function hostLocalLogout() { swrDrop(); H.pending = null; S.host = null; lsDel('host'); stopVerifTimer(); }
function openHost() {
  if (S.host) enterHost();
  else { $('errLogin').textContent = ''; $('inPin').value = ''; show('hlogin'); $('inPin').focus(); }
}
async function submitLogin(e) {
  e.preventDefault();
  const pin = $('inPin').value.trim();
  if (!/^\d{4,8}$/.test(pin)) { $('errLogin').textContent = 'PIN terdiri dari 4 sampai 8 angka.'; return; }
  try {
    const r = await busy(e.target.querySelector('button[type=submit]'), 'Memeriksa...', () => call('loginHost', pin));
    S.host = { token: r.token, nama: r.nama, peran: r.peran }; lsSet('host', S.host);
    $('inPin').value = ''; $('errLogin').textContent = '';
    enterHost();
  } catch (err) { $('errLogin').textContent = err.message; $('inPin').select(); }
}
function enterHost() {
  $('hostName').textContent = S.host.nama + (isAdmin() ? ' · Super Admin' : '');
  $('hostNav').innerHTML = navItems().map((n) => '<button type="button" data-tab="' + n[0] + '">' + icon(n[2]) + '<span data-t="' + n[1] + '">' + esc(T(n[1])) + '</span></button>').join('');
  show('host');
  applyLabels();
  setTab(H.tab || 'verif');
  hcall('hostGetSettings').then((s) => { H.defEmail = s.email; H.users = s.users; }).catch(onErr);
  // Prefetch senyap: tab berikutnya terbuka tanpa menunggu server
  setTimeout(() => {
    const [f, t] = periodRange(H.kunjPeriod, 'kFrom', 'kTo');
    if (H.tab !== 'exp') swr('exp', 'hostGetProdukExpired', [], () => {}).catch(() => {});
    if (H.tab !== 'kunj') swr('kunj' + f + '_' + t, 'hostGetKunjungan', [{ from: f, to: t }], () => {}).catch(() => {});
  }, 600);
}
function setTab(t) {
  H.tab = t;
  if (t === 'data' && !isAdmin()) t = H.tab = 'verif';
  ['verif', 'kunj', 'exp', 'dash', 'data', 'set'].forEach((n) => { $('h-' + n).hidden = n !== t; });
  $('hostNav').querySelectorAll('button').forEach((b) => { if (b.dataset.tab === t) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  stopVerifTimer();
  window.scrollTo(0, 0);
  if (t === 'verif') { loadVerif(); S.verifTimer = setInterval(() => loadVerif(true), 30000); }
  else if (t === 'kunj') initKunj();
  else if (t === 'exp') loadExp();
  else if (t === 'dash') initDash();
  else if (t === 'data') initData();
  else if (t === 'set') renderSetTabs();
}
function stopVerifTimer() { if (S.verifTimer) { clearInterval(S.verifTimer); S.verifTimer = null; } }
async function hostLogout() {
  try { if (S.host) await call('logoutHost', S.host.token); } catch (e) { /* abaikan */ }
  hostLocalLogout(); show('home');
}
function setNavBadge(n) {
  const b = $('hostNav').querySelector('[data-tab="verif"]');
  if (!b) return;
  const old = b.querySelector('.dot'); if (old) old.remove();
  if (n > 0) b.insertAdjacentHTML('beforeend', '<span class="dot">' + n + '</span>');
}

// ════════════════════════════════════════════════════════
// BAGIAN 6: TUAN RUMAH — VERIFIKASI & DETAIL
// ════════════════════════════════════════════════════════

const waitText = (dt) => {
  const t = new Date(dt.replace(' ', 'T') + ':00+07:00').getTime();
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  return m < 1 ? 'baru saja' : m < 60 ? m + ' menit lalu' : m < 1440 ? Math.floor(m / 60) + ' jam lalu' : fmtDate(dt.slice(0, 10));
};

async function loadVerif(silent) {
  if (!silent && !SWR.pend) $('verifList').innerHTML = skel(3);
  try {
    await swr('pend', 'hostGetKunjungan', [{ status: 'Menunggu Verifikasi' }], (d) => { H.pending = d; paintVerif(); });
    H.pending.slice(0, 4).forEach((v) => { if (!SWR['det' + v.id]) swr('det' + v.id, 'hostGetDetail', [v.id], () => {}).catch(() => {}); });
  } catch (e) { onErr(e); if (!silent && !H.pending) $('verifList').innerHTML = '<div class="card glass center muted">Gagal memuat. Tekan Segarkan.</div>'; }
}
function paintVerif() {
  setNavBadge(H.pending.length);
  {
    $('verifList').innerHTML = H.pending.length
      ? H.pending.map((v) => '<button type="button" class="vcard glass" data-id="' + esc(v.id) + '"><div class="grow"><b>' + esc(v.nama) + '</b><span>' + esc(v.prs) + '</span><span>' + esc(v.nProd) + ' produk · ' + (v.nTidak ? esc(v.nTidak) + ' jawaban Tidak · ' : '') + esc(waitText(v.dt)) + '</span></div><span class="badge b-warn">Periksa</span></button>').join('')
      : '<div class="card glass center muted">Tidak ada kunjungan yang menunggu verifikasi.</div>';
  }
}

function sisaBadge(s) {
  if (s < 0) return '<span class="badge b-bad">Lewat ' + (-s) + ' hari</span>';
  if (s === 0) return '<span class="badge b-bad">Hari ini</span>';
  const c = s <= 7 ? 'b-bad' : s <= 14 ? 'b-orange' : s <= 30 ? 'b-warn' : 'b-mute';
  return '<span class="badge ' + c + '">' + s + ' hari</span>';
}
function fotoThumb(f) {
  return f ? '<img class="thumb" src="' + esc(f.thumb) + '" alt="Foto" data-prev="' + esc(f.thumb) + '" data-dl="' + esc(f.dl) + '">' : '';
}

async function openDetail(id) {
  const hit = SWR['det' + id];
  if (hit) renderDetail(hit.d); else $('mDetailBody').innerHTML = skel(3);
  openModal('mDetail');
  try { await swr('det' + id, 'hostGetDetail', [id], (d, stale) => { if (!stale && hit && document.activeElement && $('mDetailBody').contains(document.activeElement)) return; if (!stale || !hit) renderDetail(d); }); }
  catch (e) { closeModal('mDetail'); onErr(e); }
}
function renderDetail(d) {
  const v = d.v, pending = v.status === 'Menunggu Verifikasi';
  $('mDetailTitle').textContent = v.id;
  const today = d.today || todayIso();
  let h = '<div class="kv"><b>' + esc(v.nama) + '</b> · ' + esc(v.prs) + '<br>' + esc(v.hp) + ' · ' + esc(fmtDT(v.dt)) + '<br><span class="badge ' + badgeCls(v.status) + '">' + esc(v.status) + '</span>' +
    (v.oleh ? ' oleh ' + esc(v.oleh) + ' · ' + esc(fmtDT(v.wv)) : '') + (v.cat ? '<br>Catatan: ' + esc(v.cat) : '') + '</div>';
  h += '<div class="sect">Ceklist</div>' + d.ceklist.map((c) => '<div class="ckrow"><div>' + esc(c.butir) + (c.cat ? '<br><span class="muted small">' + esc(c.cat) + '</span>' : '') + '</div><div>' + fotoThumb(c.foto) + ' <span class="badge ' + (c.hasil === 'Ya' ? 'b-ok' : 'b-bad') + '">' + esc(c.hasil) + '</span></div></div>').join('');
  h += '<div class="sect">Produk mendekati expired (' + d.produk.length + ')</div>';
  h += d.produk.length ? d.produk.map((x) => '<div class="pcard glass"><div class="grow"><div class="nm"><b>' + esc(x.desk) + '</b>' + sisaBadge(dayDiff(today, x.tgl)) + '</div><span>PLU ' + esc(x.plu) + (x.status === 'Sudah Ditarik' ? ' · sudah ditarik' : '') + '</span>' +
    '<div class="mini" data-pid="' + esc(x.id) + '"><input type="date" value="' + esc(x.tgl) + '" data-f="tgl" aria-label="Tanggal expired"><input value="' + esc(x.lok) + '" data-f="lok" aria-label="Kode lokasi" autocapitalize="characters" autocomplete="off"><button type="button" class="btn tint sm" data-act="saveprd">Simpan</button></div></div>' + fotoThumb(x.foto) + '</div>').join('')
    : '<p class="muted small">Tidak ada produk yang didata.</p>';
  if (pending) {
    h += '<div class="sect">Keputusan</div><div class="field"><label for="vCat">Catatan tuan rumah <small>(wajib bila menolak)</small></label><textarea id="vCat" maxlength="300"></textarea></div>' +
      '<label class="check"><input id="vMail" type="checkbox"> Kirim rekap via email (opsional)</label>' +
      '<div class="field" id="vMailBox" hidden><label for="vMailTo">Email tujuan</label><input id="vMailTo" type="email" value="' + esc(lsGet('rekapEmail', H.defEmail || '')) + '"></div>' +
      '<div id="vErr" class="err" role="alert"></div>' +
      '<div class="row-btns"><button type="button" class="btn danger" data-act="decide" data-k="Ditolak">Tolak</button><button type="button" class="btn primary" data-act="decide" data-k="Disetujui">Setujui</button></div>';
  } else {
    h += '<div class="sect">Kirim rekap via email (opsional)</div><div class="field"><label for="vMailTo">Email tujuan</label><input id="vMailTo" type="email" value="' + esc(lsGet('rekapEmail', H.defEmail || '')) + '"></div>' +
      '<div id="vErr" class="err" role="alert"></div><button type="button" class="btn tint block" data-act="sendrekap">Kirim Rekap via Email</button>';
  }
  $('mDetailBody').innerHTML = h;
  $('mDetailBody').dataset.id = v.id;
  $('mDetailBody').querySelectorAll('[data-f=lok]').forEach((i) => attachCombo(i, 'lok'));
  const chk = $('vMail');
  if (chk) chk.onchange = () => { $('vMailBox').hidden = !chk.checked; };
}
async function onDetailClick(e) {
  const img = e.target.closest('[data-prev]');
  if (img) { openPreview(img.dataset.prev, img.dataset.dl, false); return; }
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const id = $('mDetailBody').dataset.id;
  try {
    if (b.dataset.act === 'saveprd') {
      const row = b.closest('.mini');
      await busy(b, '...', () => hcall('hostUpdateProduk', row.dataset.pid, row.querySelector('[data-f=tgl]').value, row.querySelector('[data-f=lok]').value));
      toast('Koreksi tersimpan.', 'ok');
      swrDrop();
    } else if (b.dataset.act === 'decide') {
      const k = b.dataset.k, cat = $('vCat').value.trim(), mail = $('vMail').checked, to = $('vMailTo') ? $('vMailTo').value.trim() : '';
      if (k === 'Ditolak' && !cat) { $('vErr').textContent = 'Catatan wajib diisi saat menolak.'; return; }
      if (mail && !to) { $('vErr').textContent = 'Isi email tujuan atau matikan opsi kirim email.'; return; }
      $('vErr').textContent = '';
      // Optimistis: tutup dialog & keluarkan dari antrean seketika; simpan di latar belakang, kembalikan bila gagal
      const prevPend = H.pending ? H.pending.slice() : null;
      if (mail) lsSet('rekapEmail', to);
      closeModal('mDetail');
      if (H.pending) { H.pending = H.pending.filter((x) => x.id !== id); SWR.pend && (SWR.pend.d = H.pending); paintVerif(); }
      toast(k === 'Disetujui' ? 'Kunjungan disetujui.' : 'Kunjungan ditolak.', 'ok');
      hcall('hostVerify', id, k, cat, mail, to).then((r) => {
        if (r && r.email) toast(r.email, /gagal/i.test(r.email) ? 'err' : 'ok');
        swrDrop('det' + id); swrDrop('kunj'); if (H.tab === 'verif') loadVerif(true);
      }).catch((er) => {
        if (prevPend) { H.pending = prevPend; if (SWR.pend) SWR.pend.d = prevPend; if (H.tab === 'verif') paintVerif(); }
        onErr(er); toast('Keputusan belum tersimpan. Coba lagi.', 'err');
      });
    } else if (b.dataset.act === 'sendrekap') {
      const to = $('vMailTo').value.trim();
      if (!to) { $('vErr').textContent = 'Isi email tujuan.'; return; }
      $('vErr').textContent = '';
      const msg = await busy(b, 'Mengirim...', () => hcall('hostSendRekap', id, to));
      lsSet('rekapEmail', to); toast(msg, 'ok');
    }
  } catch (err) { if (err.message !== 'SESI') { const ve = $('vErr'); if (ve) ve.textContent = err.message; toast(err.message, 'err'); } }
}

// ════════════════════════════════════════════════════════
// BAGIAN 7: TUAN RUMAH — HASIL KUNJUNGAN (TABEL)
// ════════════════════════════════════════════════════════

function weekStart(iso) { const dow = (new Date(dUTC(iso) * 864e5).getUTCDay() + 6) % 7; return addDays(iso, -dow); }
function periodRange(p, fromId, toId) {
  const t = todayIso();
  if (p === 'hari') return [t, t];
  if (p === 'minggu') return [weekStart(t), t];
  if (p === 'bulan') return [t.slice(0, 8) + '01', t];
  if (p === '7') return [addDays(t, -6), t];
  if (p === '30') return [addDays(t, -29), t];
  return [$(fromId).value || addDays(t, -29), $(toId).value || t];
}
function chipsHtml(items, cur) {
  return items.map((i) => '<button type="button" class="chip" data-v="' + i[0] + '" aria-pressed="' + (i[0] === cur) + '">' + i[1] + '</button>').join('');
}

function initKunj() {
  $('kunjPeriod').innerHTML = chipsHtml([['hari', 'Hari ini'], ['minggu', 'Minggu ini'], ['bulan', 'Bulan ini'], ['custom', 'Kustom']], H.kunjPeriod);
  $('kunjCustom').hidden = H.kunjPeriod !== 'custom';
  if (!$('kFrom').value) { $('kFrom').value = addDays(todayIso(), -29); $('kTo').value = todayIso(); }
  fetchKunj();
}
async function fetchKunj() {
  const [from, to] = periodRange(H.kunjPeriod, 'kFrom', 'kTo');
  const key = 'kunj' + from + '_' + to;
  if (!SWR[key]) $('kunjList').innerHTML = '<div style="padding:12px">' + skel(3) + '</div>';
  try {
    await swr(key, 'hostGetKunjungan', [{ from, to }], (d) => {
      H.kunj = d;
      const cur = $('kPrs').value;
      const set = Array.from(new Set(H.kunj.map((x) => x.prs))).sort();
      $('kPrs').innerHTML = '<option value="">Semua perusahaan</option>' + set.map((p) => '<option' + (p === cur ? ' selected' : '') + '>' + esc(p) + '</option>').join('');
      renderKunj();
    });
  } catch (e) { onErr(e); $('kunjList').innerHTML = '<p class="muted center" style="padding:16px">Gagal memuat data.</p>'; }
}
function renderKunj() {
  const q = $('kSearch').value.trim().toLowerCase(), st = $('kStatus').value, pr = $('kPrs').value;
  const rows = H.kunj.filter((v) => (!st || v.status === st) && (!pr || v.prs === pr) &&
    (!q || (v.nama + ' ' + v.prs + ' ' + v.id + ' ' + v.hp).toLowerCase().includes(q)));
  $('kunjInfo').textContent = rows.length + ' kunjungan';
  $('kunjList').innerHTML = rows.length
    ? '<table><thead><tr><th>Waktu datang</th><th>Tamu</th><th>Perusahaan</th><th>Status</th><th>Produk</th><th>Tidak</th></tr></thead><tbody>' +
      rows.slice(0, 300).map((v) => '<tr><td><button type="button" class="rowbtn" data-id="' + esc(v.id) + '">' + esc(fmtDT(v.dt)) + '</button></td><td>' + esc(v.nama) + '<br><span class="muted small">' + esc(v.hp) + '</span></td><td>' + esc(v.prs) + '</td><td><span class="badge ' + badgeCls(v.status) + '">' + esc(v.status) + '</span></td><td>' + esc(v.nProd) + '</td><td>' + esc(v.nTidak) + '</td></tr>').join('') + '</tbody></table>'
    : '<p class="muted center" style="padding:16px">Tidak ada kunjungan pada filter ini.</p>';
}

// ════════════════════════════════════════════════════════
// BAGIAN 8: TUAN RUMAH — PRODUK MENDEKATI EXPIRED
// ════════════════════════════════════════════════════════

const expChips = () => [['7', 'H-7'], ['14', 'H-14'], ['30', 'H-30'], ['all', T('chip_all')]];
async function loadExp() {
  if (!SWR.exp) $('expList').innerHTML = skel(4);
  try {
    await swr('exp', 'hostGetProdukExpired', [], (d) => {
      H.exp = d;
      S.today = H.exp.today;
      $('expChips').innerHTML = chipsHtml(expChips(), H.expChip);
      const fill = (id, label, vals) => { const cur = $(id).value; $(id).innerHTML = '<option value="">' + label + '</option>' + vals.map((v) => '<option' + (v === cur ? ' selected' : '') + '>' + esc(v) + '</option>').join(''); };
      fill('ePrs', 'Semua perusahaan', Array.from(new Set(H.exp.rows.map((x) => x.prs))).sort());
      fill('eLok', 'Semua lokasi', Array.from(new Set(H.exp.rows.map((x) => x.lok))).sort());
      H.expLimit = 100;
      renderExp();
    });
  } catch (e) { onErr(e); $('expList').innerHTML = '<div class="card glass center muted">Gagal memuat data.</div>'; }
}
function renderExp() {
  if (!H.exp) return;
  const t = H.exp.today, all = H.expChip === 'all', lim = +H.expChip;
  const st = $('eStatus').value, pr = $('ePrs').value, lk = $('eLok').value;
  const rows = H.exp.rows.filter((x) => (all || dayDiff(t, x.tgl) <= lim) && (!st || x.status === st) && (!pr || x.prs === pr) && (!lk || x.lok === lk));
  $('expInfo').textContent = rows.length + ' produk · ' + (all ? 'semua tanggal expired yang diinput tamu' : 'expired dalam ' + lim + ' hari (termasuk yang sudah lewat)');
  const shown = rows.slice(0, H.expLimit);
  $('expList').innerHTML = rows.length ? shown.map((x) => {
    const done = x.status === 'Sudah Ditarik';
    return '<div class="pcard glass' + (done ? ' done' : '') + '"><div class="grow"><div class="nm"><b>' + esc(x.desk) + '</b>' + sisaBadge(dayDiff(t, x.tgl)) + '</div>' +
      '<span>PLU ' + esc(x.plu) + ' · ' + esc(x.prs) + '</span><span>Exp ' + esc(fmtDate(x.tgl)) + ' · Lokasi ' + esc(x.lok) + '</span></div>' + fotoThumb(x.foto) +
      '<div style="display:flex;flex-direction:column;gap:6px">' +
      '<button type="button" class="btn ' + (done ? 'ghost' : 'tint') + ' sm" data-id="' + esc(x.id) + '" data-act="tarik">' + esc(done ? T('btn_batal') : T('btn_tarik')) + '</button>' +
      '<button type="button" class="btn ghost sm" data-id="' + esc(x.id) + '" data-act="editexp">' + esc(T('btn_ubah')) + '</button></div></div>';
  }).join('') + (rows.length > shown.length ? '<button type="button" class="btn ghost block" data-act="moreexp">Tampilkan lebih banyak (' + (rows.length - shown.length) + ' lagi)</button>' : '')
    : '<div class="card glass center muted">Tidak ada produk pada filter ini.</div>';
}
function openExpForm(r) {
  $('mFormTitle').textContent = 'Ubah data produk';
  $('mFormBody').dataset.kind = 'prd'; $('mFormBody').dataset.orig = r.id;
  $('mFormBody').innerHTML = '<p class="muted small" style="margin-bottom:10px">' + esc(r.desk) + ' · PLU ' + esc(r.plu) + '</p>' +
    '<div class="field"><label for="pTgl">Tanggal expired</label><input id="pTgl" type="date" value="' + esc(r.tgl) + '" required></div>' +
    '<div class="field"><label for="pLok">Kode lokasi</label><input id="pLok" value="' + esc(r.lok) + '" autocomplete="off" autocapitalize="characters" required></div>' +
    '<div id="mfErr" class="err" role="alert"></div><button class="btn primary block" type="submit">Simpan</button>';
  attachCombo($('pLok'), 'lok');
  openModal('mForm');
}
async function toggleTarik(id) {
  const r = H.exp.rows.find((x) => x.id === id);
  if (!r) return;
  const was = r.status;
  r.status = was === 'Sudah Ditarik' ? 'Baru' : 'Sudah Ditarik';
  renderExp();
  try { await hcall('hostTandaiDitarik', [id], r.status === 'Sudah Ditarik'); swrDrop('dash'); toast(r.status === 'Sudah Ditarik' ? 'Ditandai sudah ditarik.' : 'Tanda tarik dibatalkan.', 'ok'); }
  catch (e) { r.status = was; renderExp(); onErr(e); }
}

// ════════════════════════════════════════════════════════
// BAGIAN 9: TUAN RUMAH — DASBOR (GRAFIK)
// ════════════════════════════════════════════════════════

function initDash() {
  $('dashPeriod').innerHTML = chipsHtml([['7', '7 hari'], ['30', '30 hari'], ['bulan', 'Bulan ini'], ['custom', 'Kustom']], H.dashPeriod);
  $('dashCustom').hidden = H.dashPeriod !== 'custom';
  if (!$('dFrom').value) { $('dFrom').value = addDays(todayIso(), -29); $('dTo').value = todayIso(); }
  loadDash();
}
async function loadDash() {
  const [from, to] = periodRange(H.dashPeriod, 'dFrom', 'dTo');
  const key = 'dash' + from + '_' + to;
  if (!SWR[key]) $('dashBody').innerHTML = skel(4);
  try { await swr(key, 'hostGetDashboard', [from, to], (d) => { H.dash = d; renderDash(d); }); }
  catch (e) { onErr(e); $('dashBody').innerHTML = '<div class="card glass center muted">Gagal memuat dasbor.</div>'; }
}
const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function renderDash(d) {
  H.charts.forEach((c) => c.destroy()); H.charts = [];
  const k = d.kpi;
  const tiles = [['Kunjungan', k.kunjungan], ['Menunggu verifikasi', k.menunggu], ['Produk terdata', k.produk], ['Sudah ditarik', k.ditarik],
    ['Belum ditarik H-7', k.h7], ['Belum ditarik H-8 s.d. H-14', k.h14], ['Belum ditarik H-15 s.d. H-30', k.h30], ['Ceklist jawaban Ya', k.ckYa + '%']];
  const box = (id, title, has) => '<div class="chart-card glass"><h3>' + title + '</h3>' + (has ? '<div class="chart-box"><canvas id="' + id + '" role="img" aria-label="' + title + '"></canvas></div>' : '<p class="muted small">Belum ada data pada periode ini.</p>') + '</div>';
  $('dashBody').innerHTML = '<div class="muted small" style="margin-bottom:8px">' + esc(fmtDate(d.from)) + ' s.d. ' + esc(fmtDate(d.to)) + '</div>' +
    '<div class="kpis">' + tiles.map((t) => '<div class="kpi glass"><span>' + t[0] + '</span><b>' + t[1] + '</b></div>').join('') + '</div>' +
    '<div class="insight"><h3>Ringkasan otomatis</h3><ul>' + d.insights.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul></div>' +
    '<div class="charts">' + box('cVisit', 'Kunjungan per periode', d.bucket.labels.length) + box('cStatus', 'Status verifikasi', k.kunjungan > 0) +
    box('cPrs', 'Temuan produk per perusahaan (5 teratas)', d.topPrs.labels.length) + box('cCk', 'Jawaban "Ya" per butir ceklist (%)', d.ckButir.labels.length) + '</div>';
  const draw = () => {
  if (S.view !== 'host' || H.tab !== 'dash') return;
  H.charts.forEach((c) => c.destroy()); H.charts = [];
  Chart.defaults.color = cssVar('--text'); Chart.defaults.borderColor = cssVar('--grid'); Chart.defaults.font.family = 'system-ui, sans-serif';
  const acc = cssVar('--accent'), warn = cssVar('--warn'), bad = cssVar('--bad');
  const mk = (id, cfg) => { const el = $(id); if (el) H.charts.push(new Chart(el, cfg)); };
  const noLeg = { legend: { display: false } };
  mk('cVisit', { type: 'bar', data: { labels: d.bucket.labels, datasets: [{ data: d.bucket.values, backgroundColor: acc, borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: noLeg, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } } });
  mk('cStatus', { type: 'doughnut', data: { labels: d.status.labels, datasets: [{ data: d.status.values, backgroundColor: [warn, acc, bad], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } });
  mk('cPrs', { type: 'bar', data: { labels: d.topPrs.labels, datasets: [{ data: d.topPrs.values, backgroundColor: acc, borderRadius: 6 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: noLeg, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } } });
  mk('cCk', { type: 'bar', data: { labels: d.ckButir.labels.map((l) => l.length > 30 ? l.slice(0, 29) + '…' : l), datasets: [{ data: d.ckButir.values, backgroundColor: acc, borderRadius: 6 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: noLeg, scales: { x: { beginAtZero: true, max: 100 } } } });
  };
  if (typeof Chart === 'undefined') {
    $('dashBody').insertAdjacentHTML('beforeend', '<p id="chartWait" class="muted small">Memuat grafik...</p>');
    loadChartLib().then(draw).then(() => { const w = $('chartWait'); if (w) w.remove(); })
      .catch(() => { const w = $('chartWait'); if (w) w.textContent = 'Grafik tidak dapat dimuat. Periksa koneksi internet lalu buka lagi tab ini.'; });
  } else draw();
}
let chartPromise = null;
/** Chart.js dimuat hanya saat dasbor dibuka, agar halaman tamu tidak menunggu CDN */
function loadChartLib() {
  if (typeof Chart !== 'undefined') return Promise.resolve();
  if (chartPromise) return chartPromise;
  chartPromise = new Promise((resolve, reject) => {
    const sc = document.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js';
    sc.onload = () => resolve();
    sc.onerror = () => { chartPromise = null; reject(new Error('gagal')); };
    document.head.appendChild(sc);
  });
  return chartPromise;
}

// ════════════════════════════════════════════════════════
// BAGIAN 10: TUAN RUMAH — PENGATURAN, MASTER DATA, AKUN
// ════════════════════════════════════════════════════════

const MASTER_UI = {
  PLU: { label: 'PLU', cols: [{ h: 'PLU', t: 'text', max: 20, req: 1 }, { h: 'Deskripsi', t: 'text', max: 120, req: 1 }, { h: 'Kategori', t: 'text', max: 40 }, { h: 'Aktif', t: 'aktif' }] },
  PRS: { label: 'Perusahaan', cols: [{ h: 'ID', t: 'ro' }, { h: 'Nama Perusahaan', t: 'text', max: 80, req: 1 }, { h: 'Tanggal Pertama Muncul', t: 'hide' }] },
  LOK: { label: 'Lokasi', cols: [{ h: 'Kode Lokasi', t: 'text', max: 20, req: 1 }, { h: 'Keterangan', t: 'text', max: 80 }] },
  CKM: { label: 'Ceklist', cols: [{ h: 'Kategori', t: 'text', max: 40, req: 1 }, { h: 'Butir Pertanyaan', t: 'text', max: 200, req: 1 }, { h: 'Urutan', t: 'num', req: 1 }, { h: 'Aktif', t: 'aktif' }] }
};

function renderSetTabs() {
  $('setTabs').innerHTML = chipsHtml([['ident', 'Identitas'], ['teks', 'Teks & panduan'], ['master', 'Master data'], ['akun', 'Akun'], ['alat', 'Alat']], H.setTab);
  renderSetBody();
}
async function renderSetBody() {
  const t = H.setTab, body = $('setBody');
  if (t === 'ident') {
    body.innerHTML = skel(2);
    try {
      const s = await hcall('hostGetSettings');
      H.defEmail = s.email;
      body.innerHTML = '<form id="formSet" class="card glass" novalidate><div class="field"><label for="sNama">Nama toko</label><input id="sNama" maxlength="60" value="' + esc(s.namaToko) + '"></div>' +
        '<div class="field"><label for="sBatas">Batas hari mendekati expired (1 sampai 365)</label><input id="sBatas" type="number" min="1" max="365" value="' + esc(s.batas) + '"></div>' +
        '<div class="field"><label for="sEmail">Email tujuan default rekap <small>(opsional)</small></label><input id="sEmail" type="email" value="' + esc(s.email) + '"></div>' +
        '<div class="field"><label for="sLogo">Logo <small>(ID file Drive atau URL gambar)</small></label><input id="sLogo" value="' + esc(s.logo) + '"></div>' +
        '<div class="field"><label for="sBg">Background <small>(ID file Drive atau URL gambar, opsional)</small></label><input id="sBg" value="' + esc(s.bg) + '"></div>' +
        '<div class="field"><label for="sLokM">Kode lokasi di luar daftar</label><select id="sLokM"><option value="1"' + (s.lokManual ? ' selected' : '') + '>Boleh diketik manual oleh tamu</option><option value="0"' + (!s.lokManual ? ' selected' : '') + '>Hanya dari daftar lokasi</option></select></div>' +
        '<p class="hint" style="margin-bottom:10px">File Drive harus dibagikan "Siapa saja yang memiliki link" agar tampil di HP tamu.</p><div id="errSet" class="err" role="alert"></div>' +
        '<button class="btn primary block" type="submit">Simpan pengaturan</button></form>';
    } catch (e) { onErr(e); body.innerHTML = ''; }
  } else if (t === 'teks') {
    body.innerHTML = skel(3);
    try {
      const st = await hcall('hostGetSettings');
      S.cfg.labels = st.labels; S.cfg.panduan = st.panduan; applyLabels();
      body.innerHTML = '<form id="formTeks" novalidate><div class="card glass"><div class="field"><label for="tPan">Kalimat panduan di halaman awal</label>' +
        '<textarea id="tPan" maxlength="800" rows="7" style="padding-top:12px">' + esc(st.panduan) + '</textarea>' +
        '<span class="hint">Tampil di halaman awal untuk tamu. Setiap baris baru tampil sebagai baris baru. Kosongkan untuk menyembunyikan.</span></div>' +
        '<button type="button" class="btn ghost sm" data-act="panduandef">Pakai teks panduan bawaan</button></div>' +
        '<p class="lead" style="margin:6px 0 10px">Ubah kata pada menu, tombol, dan kolom agar mudah dipahami. Kosongkan kolom untuk memakai kata bawaan.</p>' +
        LBL.map((g, gi) => '<details class="grp"' + (gi === 0 ? ' open' : '') + '><summary>' + esc(g[0]) + '</summary><div class="grp-b">' +
          g[1].map((x) => '<div class="field"><label for="tl_' + x[0] + '">' + esc(x[2]) + '</label><input id="tl_' + x[0] + '" data-k="' + x[0] + '" maxlength="' + (x[1].length > 40 ? 120 : 40) + '" value="' + esc((st.labels && st.labels[x[0]]) || x[1]) + '" placeholder="' + esc(x[1]) + '"></div>').join('') + '</div></details>').join('') +
        '<div id="errTeks" class="err" role="alert"></div>' +
        '<div class="row-btns"><button type="button" class="btn ghost" data-act="teksreset">Kembalikan semua ke bawaan</button><button class="btn primary grow" type="submit">Simpan</button></div></form>';
    } catch (e) { onErr(e); body.innerHTML = ''; }
  } else if (t === 'master') {
    renderMasterShell();
  } else if (t === 'akun') {
    body.innerHTML = skel(2);
    try {
      const s = await hcall('hostGetSettings');
      H.users = s.users;
      body.innerHTML = '<div class="card glass"><div class="card-h"><h3>Akun tuan rumah</h3><button type="button" class="btn tint sm" data-act="adduser">Tambah akun</button></div>' +
        s.users.map((u, i) => '<div class="li"><div class="grow"><b>' + esc(u.nama) + '</b><span>' + esc(u.email || 'tanpa email') + ' · ' + (u.aktif ? 'aktif' : 'nonaktif') + ' · ' + esc(u.peran) + '</span></div><button type="button" class="btn ghost sm" data-act="edituser" data-i="' + i + '">Ubah</button></div>').join('') +
        '</div><p class="hint">PIN tidak pernah ditampilkan. Kosongkan kolom PIN saat mengubah bila tidak ingin menggantinya.</p>';
    } catch (e) { onErr(e); body.innerHTML = ''; }
  } else {
    body.innerHTML = '<div class="card glass"><div class="card-h"><h3>Segarkan master PLU di perangkat tamu</h3></div><p class="muted small" style="margin-bottom:10px">Dipakai bila Anda mengubah Master_PLU langsung di Google Sheets dan perangkat tamu belum memperbarui datanya. Perubahan lewat aplikasi ini otomatis.</p>' +
      '<button type="button" class="btn tint block" data-act="refplu">Segarkan sekarang</button></div>';
  }
}
async function saveTeks(e) {
  e.preventDefault();
  const labels = {};
  document.querySelectorAll('#formTeks [data-k]').forEach((el) => {
    const v = el.value.replace(/\s+/g, ' ').trim();
    if (v && v !== DEF[el.dataset.k]) labels[el.dataset.k] = v;
  });
  try {
    await busy(e.target.querySelector('button[type=submit]'), 'Menyimpan...', () => hcall('hostSaveTeks', { panduan: $('tPan').value, labels }));
    $('errTeks').textContent = '';
    S.cfg.labels = labels; S.cfg.panduan = $('tPan').value.trim(); lsSet('cfg', S.cfg);
    applyLabels(); toast('Teks tersimpan. Tamu melihat perubahan saat membuka ulang halaman.', 'ok');
  } catch (err) { if (err.message !== 'SESI') $('errTeks').textContent = err.message; }
}
async function saveSettings(e) {
  e.preventDefault();
  const s = { namaToko: $('sNama').value, batas: $('sBatas').value, email: $('sEmail').value, logo: $('sLogo').value, bg: $('sBg').value, lokManual: $('sLokM').value === '1' };
  try {
    await busy(e.target.querySelector('button[type=submit]'), 'Menyimpan...', () => hcall('hostSaveSettings', s));
    $('errSet').textContent = ''; toast('Pengaturan tersimpan.', 'ok');
    swrDrop(); refreshBootstrap().catch(() => {});
  } catch (err) { if (err.message !== 'SESI') $('errSet').textContent = err.message; }
}

function renderMasterShell() {
  const k = H.master ? H.master.k : 'PLU';
  $('setBody').innerHTML = '<div class="chips">' + chipsHtml(Object.keys(MASTER_UI).map((x) => [x, MASTER_UI[x].label]), k) + '</div><div id="masterBox"></div>';
  loadMaster(k);
}
async function loadMaster(k) {
  $('masterBox').innerHTML = skel(3);
  try {
    const m = await hcall('hostGetMaster', k);
    H.master = { k, headers: m.headers, rows: m.rows, keyIdx: m.keyIdx, q: H.master && H.master.k === k ? H.master.q : '' };
    renderMaster();
  } catch (e) { onErr(e); $('masterBox').innerHTML = ''; }
}
function renderMaster() {
  const m = H.master, ui = MASTER_UI[m.k];
  const q = (m.q || '').toLowerCase();
  const cols = ui.cols.map((c, i) => [c, i]).filter((x) => x[0].t !== 'hide');
  const rows = m.rows.map((r, i) => [r, i]).filter((x) => !q || x[0].join(' ').toLowerCase().includes(q));
  $('masterBox').innerHTML = '<div class="filters" style="grid-template-columns:1fr auto"><input id="mSearch" type="search" placeholder="Cari di ' + esc(ui.label) + '" value="' + esc(m.q || '') + '" aria-label="Cari master"><button type="button" class="btn tint sm" data-act="addmaster">Tambah</button></div>' +
    '<div class="muted small" style="margin-bottom:8px">' + rows.length + ' baris' + (rows.length > 100 ? ' (menampilkan 100 pertama, gunakan pencarian)' : '') + '</div>' +
    '<div class="card glass table-wrap"><table><thead><tr>' + cols.map((c) => '<th>' + esc(c[0].h) + '</th>').join('') + '<th></th></tr></thead><tbody>' +
    rows.slice(0, 100).map((x) => '<tr>' + cols.map((c) => '<td>' + esc(x[0][c[1]]) + '</td>').join('') + '<td style="white-space:nowrap"><button type="button" class="rowbtn" data-act="editmaster" data-i="' + x[1] + '">Ubah</button> &nbsp; <button type="button" class="rowbtn" style="color:var(--bad)" data-act="delmaster" data-i="' + x[1] + '">Hapus</button></td></tr>').join('') +
    '</tbody></table></div>' +
    (m.k === 'PLU' ? '<div class="card glass" style="margin-top:12px"><div class="card-h"><h3>Impor PLU massal</h3></div><p class="muted small" style="margin-bottom:8px">Salin dari Excel: PLU, Deskripsi, Kategori (dipisah tab), satu produk per baris. PLU yang sudah ada akan diperbarui.</p><textarea id="impText" placeholder="100001&#9;Susu UHT Coklat 200ml&#9;Minuman" style="min-height:110px" aria-label="Data PLU"></textarea><div id="impErr" class="err"></div><button type="button" class="btn primary block" data-act="import" style="margin-top:8px">Impor</button></div>' : '');
  const s = $('mSearch');
  if (m.q) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
}
function openMasterForm(row) {
  const m = H.master, ui = MASTER_UI[m.k];
  $('mFormTitle').textContent = (row ? 'Ubah ' : 'Tambah ') + ui.label;
  $('mFormBody').dataset.kind = 'master'; $('mFormBody').dataset.orig = row ? String(row[m.keyIdx]) : '';
  $('mFormBody').innerHTML = ui.cols.map((c, i) => {
    const v = row ? row[i] : '';
    if (c.t === 'hide') return '';
    if (c.t === 'ro') return '<div class="field"><label>' + esc(c.h) + '</label><input value="' + esc(v || 'Otomatis') + '" disabled><input type="hidden" data-i="' + i + '" value="' + esc(v) + '"></div>';
    if (c.t === 'aktif') return '<div class="field"><label for="mf' + i + '">' + esc(c.h) + '</label><select id="mf' + i + '" data-i="' + i + '"><option' + (v !== 'Tidak' ? ' selected' : '') + '>Ya</option><option' + (v === 'Tidak' ? ' selected' : '') + '>Tidak</option></select></div>';
    return '<div class="field"><label for="mf' + i + '">' + esc(c.h) + '</label><input id="mf' + i + '" data-i="' + i + '" ' + (c.t === 'num' ? 'type="number" min="1"' : 'maxlength="' + (c.max || 100) + '"') + ' value="' + esc(v) + '"' + (c.req ? ' required' : '') + '></div>';
  }).join('') + '<div id="mfErr" class="err" role="alert"></div><button class="btn primary block" type="submit">Simpan</button>';
  openModal('mForm');
}
function openUserForm(u) {
  $('mFormTitle').textContent = u ? 'Ubah akun' : 'Tambah akun';
  $('mFormBody').dataset.kind = 'user'; $('mFormBody').dataset.orig = u ? u.nama : '';
  $('mFormBody').innerHTML = '<div class="field"><label for="uNama">Nama</label><input id="uNama" maxlength="60" required value="' + esc(u ? u.nama : '') + '"></div>' +
    '<div class="field"><label for="uEmail">Email <small>(opsional)</small></label><input id="uEmail" type="email" value="' + esc(u ? u.email : '') + '"></div>' +
    '<div class="field"><label for="uPin">PIN ' + (u ? '<small>(kosongkan bila tidak diganti)</small>' : '<small>(4 sampai 8 angka)</small>') + '</label><input id="uPin" type="password" inputmode="numeric" maxlength="8" autocomplete="new-password"></div>' +
    (isAdmin() ? '<div class="field"><label for="uPeran">Peran</label><select id="uPeran"><option value="Tuan Rumah"' + (!u || u.peran !== 'Super Admin' ? ' selected' : '') + '>Tuan Rumah</option><option value="Super Admin"' + (u && u.peran === 'Super Admin' ? ' selected' : '') + '>Super Admin (lihat, ubah, hapus semua data)</option></select></div>' : '') +
    '<div class="field"><label for="uAktif">Status</label><select id="uAktif"><option value="1"' + (!u || u.aktif ? ' selected' : '') + '>Aktif</option><option value="0"' + (u && !u.aktif ? ' selected' : '') + '>Nonaktif</option></select></div>' +
    '<div id="mfErr" class="err" role="alert"></div><button class="btn primary block" type="submit">Simpan</button>';
  openModal('mForm');
}
async function submitForm(e) {
  e.preventDefault();
  const f = $('mFormBody'), btn = f.querySelector('button[type=submit]');
  try {
    if (f.dataset.kind === 'prd') {
      const id = f.dataset.orig, tgl = $('pTgl').value, lok = $('pLok').value.trim();
      await busy(btn, 'Menyimpan...', () => hcall('hostUpdateProduk', id, tgl, lok));
      const r = H.exp && H.exp.rows.find((x) => x.id === id);
      if (r) { r.tgl = tgl; r.lok = (resolveLokClient(lok) || lok); H.exp.rows.sort((a, b) => (a.tgl < b.tgl ? -1 : a.tgl > b.tgl ? 1 : 0)); }
      closeModal('mForm'); toast('Data produk diperbarui.', 'ok'); renderExp();
    } else if (f.dataset.kind === 'admin') {
      const d = H.data, vals = d.edit.c.slice();
      f.querySelectorAll('[data-c]').forEach((el) => { vals[+el.dataset.c] = el.value; });
      await busy(btn, 'Menyimpan...', () => hcall('adminSaveRow', d.key, d.edit.n, d.edit.sig, vals));
      closeModal('mForm'); toast('Perubahan tersimpan.', 'ok'); loadData();
      if (d.key === 'PLU' || d.key === 'LOK' || d.key === 'PRS' || d.key === 'TAMU' || d.key === 'CKM') refreshBootstrap().catch(() => {});
      swrDrop();
    } else if (f.dataset.kind === 'master') {
      const m = H.master, ui = MASTER_UI[m.k], row = new Array(ui.cols.length).fill('');
      f.querySelectorAll('[data-i]').forEach((el) => { row[+el.dataset.i] = el.value; });
      await busy(btn, 'Menyimpan...', () => hcall('hostSaveMaster', m.k, row, f.dataset.orig));
      closeModal('mForm'); toast('Tersimpan.', 'ok');
      loadMaster(m.k); refreshBootstrap().catch(() => {});
    } else {
      const usr = { nama: $('uNama').value, email: $('uEmail').value, pin: $('uPin').value, aktif: $('uAktif').value === '1', orig: f.dataset.orig, peran: $('uPeran') ? $('uPeran').value : '' };
      await busy(btn, 'Menyimpan...', () => hcall('hostSaveUser', usr));
      closeModal('mForm'); toast('Akun tersimpan.', 'ok'); renderSetBody();
    }
  } catch (err) { if (err.message !== 'SESI') $('mfErr').textContent = err.message; }
}
async function onSetClick(e) {
  const chip = e.target.closest('.chip');
  if (chip && chip.closest('#setBody')) {
    const m = chip.closest('.chips') && chip.dataset.v;
    if (MASTER_UI[m]) { H.master = { k: m, q: '' }; renderMasterShell(); }
    return;
  }
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  try {
    if (a === 'addmaster') openMasterForm(null);
    else if (a === 'editmaster') openMasterForm(H.master.rows[+b.dataset.i]);
    else if (a === 'delmaster') {
      const r = H.master.rows[+b.dataset.i];
      if (await confirmDialog('Hapus "' + r[H.master.keyIdx] + '" dari ' + MASTER_UI[H.master.k].label + '?', 'Hapus')) {
        await hcall('hostDeleteMaster', H.master.k, String(r[H.master.keyIdx]));
        toast('Dihapus.', 'ok'); loadMaster(H.master.k); refreshBootstrap().catch(() => {});
      }
    } else if (a === 'import') {
      const txt = $('impText').value;
      const r = await busy(b, 'Mengimpor...', () => hcall('hostImportPlu', txt));
      $('impErr').textContent = r.galat.length ? r.galat.join(' | ') : '';
      toast(r.baru + ' baru, ' + r.diperbarui + ' diperbarui, ' + r.dilewati + ' dilewati.', r.dilewati ? 'warn' : 'ok');
      loadMaster('PLU'); refreshBootstrap().catch(() => {});
    } else if (a === 'panduandef') { $('tPan').value = DEF_PANDUAN;
    } else if (a === 'teksreset') {
      if (await confirmDialog('Semua teks menu kembali ke kata bawaan?', 'Kembalikan')) {
        document.querySelectorAll('#formTeks [data-k]').forEach((el) => { el.value = DEF[el.dataset.k]; });
        $('tPan').value = DEF_PANDUAN;
        toast('Tekan Simpan untuk menerapkan.', 'ok');
      }
    } else if (a === 'adduser') openUserForm(null);
    else if (a === 'edituser') openUserForm(H.users[+b.dataset.i]);
    else if (a === 'refplu') { await busy(b, 'Memproses...', () => hcall('hostRefreshPlu')); toast('Master PLU akan dimuat ulang di semua perangkat.', 'ok'); refreshBootstrap().catch(() => {}); }
  } catch (err) { onErr(err); }
}

// ════════════════════════════════════════════════════════
// BAGIAN 10A: SUPER ADMIN — LIHAT, UBAH, HAPUS SEMUA DATA
// ════════════════════════════════════════════════════════

const DATA_TABS = [['KUN', 'Kunjungan'], ['CKL', 'Ceklist'], ['PRD', 'Produk expired'], ['TAMU', 'Tamu'], ['PRS', 'Perusahaan'], ['PLU', 'PLU'], ['LOK', 'Lokasi'], ['CKM', 'Master ceklist'], ['AUD', 'Audit log']];
let dataT = 0;
function initData() {
  $('dataTabs').innerHTML = chipsHtml(DATA_TABS, H.dataKey);
  $('dataSearch').value = H.dataQ;
  loadData();
}
async function loadData() {
  const box = $('dataBody');
  box.innerHTML = skel(3);
  try {
    const d = await hcall('adminGetTable', H.dataKey, { q: H.dataQ, page: H.dataPage });
    H.data = Object.assign(d, { edit: null });
    H.dataPage = d.page;
    renderData();
  } catch (e) { onErr(e); box.innerHTML = '<div class="card glass center muted">Gagal memuat data.</div>'; }
}
function renderData() {
  const d = H.data, m = d.meta, hide = m.hide || [];
  const cols = d.headers.map((h, i) => i).filter((i) => hide.indexOf(i) < 0);
  const ro = m.readOnly;
  $('dataBody').innerHTML = '<div class="muted small" style="margin-bottom:8px">' + d.total + ' baris' + (H.dataQ ? ' cocok dengan pencarian' : '') + ' · halaman ' + d.page + ' dari ' + d.pages + '</div>' +
    '<div class="card glass table-wrap"><table class="dtable"><thead><tr>' + (ro ? '' : '<th></th>') + cols.map((i) => '<th>' + esc(d.headers[i]) + '</th>').join('') + '</tr></thead><tbody>' +
    (d.rows.length ? d.rows.map((r, ri) => '<tr>' + (ro ? '' : '<td class="act"><button type="button" class="rowbtn" data-act="dedit" data-i="' + ri + '">Ubah</button> &nbsp; <button type="button" class="rowbtn" style="color:var(--bad)" data-act="ddel" data-i="' + ri + '">Hapus</button></td>') +
      cols.map((i) => '<td title="' + esc(r.c[i]) + '">' + esc(r.c[i]) + '</td>').join('') + '</tr>').join('') : '<tr><td colspan="' + (cols.length + 1) + '" class="muted" style="text-align:center;padding:18px">Tidak ada data.</td></tr>') +
    '</tbody></table></div>' +
    '<div class="pager"><button type="button" class="btn ghost" data-act="dprev"' + (d.page <= 1 ? ' disabled' : '') + '>Sebelumnya</button><span class="muted small">' + d.page + ' / ' + d.pages + '</span><button type="button" class="btn ghost" data-act="dnext"' + (d.page >= d.pages ? ' disabled' : '') + '>Berikutnya</button></div>' +
    (ro ? '<p class="hint">Tabel ini hanya bisa dilihat.</p>' : '<p class="hint">Perubahan dan penghapusan tercatat di Audit log. Menghapus kunjungan ikut menghapus ceklist dan produk miliknya.</p>');
}
function openDataForm(r) {
  const d = H.data, m = d.meta;
  d.edit = r;
  $('mFormTitle').textContent = 'Ubah ' + m.label;
  $('mFormBody').dataset.kind = 'admin';
  $('mFormBody').innerHTML = d.headers.map((h, i) => {
    if ((m.hide || []).indexOf(i) >= 0) return '';
    const v = r.c[i], id = 'df' + i, lbl = '<label for="' + id + '">' + esc(h) + '</label>';
    if (m.ro.indexOf(i) >= 0) return '<div class="field">' + lbl + '<input id="' + id + '" value="' + esc(v) + '" disabled></div>';
    if (m.enums && m.enums[i]) return '<div class="field">' + lbl + '<select id="' + id + '" data-c="' + i + '">' + m.enums[i].map((o) => '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select></div>';
    if (m.dt.indexOf(i) >= 0) return '<div class="field">' + lbl + '<input id="' + id + '" type="datetime-local" data-c="' + i + '" value="' + esc(String(v).replace(' ', 'T')) + '"></div>';
    if (m.d.indexOf(i) >= 0) return '<div class="field">' + lbl + '<input id="' + id + '" type="date" data-c="' + i + '" value="' + esc(String(v).slice(0, 10)) + '"></div>';
    if (m.num.indexOf(i) >= 0) return '<div class="field">' + lbl + '<input id="' + id + '" type="number" min="0" data-c="' + i + '" value="' + esc(v) + '"></div>';
    return '<div class="field">' + lbl + '<input id="' + id + '" data-c="' + i + '" maxlength="300" value="' + esc(v) + '" autocomplete="off"' + (d.key === 'PRD' && i === 6 ? ' autocapitalize="characters"' : '') + '></div>';
  }).join('') + '<div id="mfErr" class="err" role="alert"></div><button class="btn primary block" type="submit">Simpan perubahan</button>';
  if (d.key === 'PRD') attachCombo($('df6'), 'lok');
  openModal('mForm');
}
async function onDataClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act, d = H.data;
  try {
    if (a === 'dedit') openDataForm(d.rows[+b.dataset.i]);
    else if (a === 'ddel') {
      const r = d.rows[+b.dataset.i];
      const extra = d.key === 'KUN' ? ' Ceklist dan produk milik kunjungan ini ikut terhapus.' : '';
      if (await confirmDialog('Hapus baris "' + (r.c[0] || r.c[1]) + '" dari ' + d.meta.label + '?' + extra + ' Tindakan ini tidak bisa dibatalkan.', 'Hapus')) {
        await hcall('adminDeleteRow', d.key, r.n, r.sig);
        toast('Data dihapus.', 'ok'); swrDrop(); loadData();
        if (d.key === 'PLU' || d.key === 'LOK' || d.key === 'PRS' || d.key === 'TAMU' || d.key === 'CKM') refreshBootstrap().catch(() => {});
      }
    } else if (a === 'dprev' && d.page > 1) { H.dataPage = d.page - 1; loadData(); }
    else if (a === 'dnext' && d.page < d.pages) { H.dataPage = d.page + 1; loadData(); }
  } catch (err) { onErr(err); if (err.message && /berubah/.test(err.message)) loadData(); }
}

// ════════════════════════════════════════════════════════
// BAGIAN 11: PASANG EVENT & INISIALISASI
// ════════════════════════════════════════════════════════

function bindEvents() {
  document.querySelectorAll('.steps').forEach((el) => { const n = +el.dataset.step; el.innerHTML = [1, 2, 3, 4].map((i) => '<i class="' + (i <= n ? 'on' : '') + '"></i>').join(''); });
  document.querySelectorAll('[data-close]').forEach((b) => { b.innerHTML = b.classList.contains('icon-btn') ? icon('close') : b.innerHTML; b.addEventListener('click', () => closeModal(b.dataset.close)); });
  document.querySelectorAll('.modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m && m.id !== 'mConfirm') closeModal(m.id); }));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = Array.from(document.querySelectorAll('.modal')).filter((m) => !m.hidden).pop();
    if (open) { if (open.id === 'mConfirm') $('mConfirmNo').click(); else closeModal(open.id); }
  });
  $('btnPrdFoto').innerHTML = icon('camera');

  $('btnTheme').addEventListener('click', () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
  $('brandBtn').addEventListener('click', () => show('home'));
  $('btnHost').addEventListener('click', openHost);
  $('btnRetry').addEventListener('click', () => { $('btnRetry').hidden = true; $('loadingText').textContent = 'Memuat SUPER TAMU...'; boot(); });

  $('btnStart').addEventListener('click', startNew);
  $('homeStatus').addEventListener('click', (e) => {
    if (e.target.id === 'btnSeeStatus') show('g5');
    if (e.target.id === 'btnResume') openG1();
  });
  attachCombo($('inPrs'), 'prs'); attachCombo($('inNama'), 'nama'); attachCombo($('inLok'), 'lok');
  $('formG1').addEventListener('submit', submitG1);

  $('ckList').addEventListener('click', onCkClick);
  $('ckList').addEventListener('input', onCkInput);
  $('fileCk').addEventListener('change', onCkFile);
  $('btnBack2').addEventListener('click', openG1);
  $('btnNext2').addEventListener('click', nextG2);

  $('inPlu').addEventListener('input', onPluInput);            // tanpa debounce: pencarian di memori
  $('pluResult').addEventListener('click', (e) => {
    const b = e.target.closest('[data-plu]');
    if (b) { $('inPlu').value = b.dataset.plu; onPluInput(); $('inTgl').focus(); }
  });
  $('btnPrdFoto').addEventListener('click', () => { $('filePrd').value = ''; $('filePrd').click(); });
  $('filePrd').addEventListener('change', async () => {
    try { S.prdFoto = await compressImage($('filePrd').files[0]); renderPrdFoto(); } catch (err) { toast(err.message, 'err'); }
  });
  $('prdFotoBox').addEventListener('click', (e) => {
    if (e.target.id === 'prdFotoDel') { S.prdFoto = null; renderPrdFoto(); }
    if (e.target.id === 'prdThumb') openPreview(S.prdFoto, S.prdFoto, true);
  });
  $('btnPrdAdd').addEventListener('click', addPrd);
  $('prdList').addEventListener('click', onPrdClick);
  $('chkTanpa').addEventListener('change', (e) => { S.draft.tanpa = e.target.checked; saveDraft(); });
  $('btnBack3').addEventListener('click', openG2);
  $('btnNext3').addEventListener('click', nextG3);
  $('btnBack4').addEventListener('click', openG3);
  $('btnSubmit').addEventListener('click', submitVisit);
  $('statusBox').addEventListener('click', async (e) => {
    if (e.target.id === 'btnRefStatus') busy(e.target, 'Memeriksa...', () => refreshStatus(false));
    if (e.target.id === 'btnNewVisit') { resetAll(); show('home'); }
    if (e.target.id === 'btnFix') openG1();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && S.view === 'g5') refreshStatus(true); });
  window.addEventListener('offline', () => toast('Tidak ada koneksi. Data tetap tersimpan di perangkat.', 'warn'));

  // Tuan rumah
  $('formLogin').addEventListener('submit', submitLogin);
  $('btnLogout').addEventListener('click', hostLogout);
  $('hostNav').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); });
  $('btnRefVerif').addEventListener('click', () => { if (SWR.pend) SWR.pend.t = 0; loadVerif(); });
  $('verifList').addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) openDetail(b.dataset.id); });
  $('mDetailBody').addEventListener('click', onDetailClick);
  $('kunjPeriod').addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    H.kunjPeriod = b.dataset.v; $('kunjCustom').hidden = H.kunjPeriod !== 'custom';
    $('kunjPeriod').innerHTML = chipsHtml([['hari', 'Hari ini'], ['minggu', 'Minggu ini'], ['bulan', 'Bulan ini'], ['custom', 'Kustom']], H.kunjPeriod);
    fetchKunj();
  });
  ['kFrom', 'kTo'].forEach((id) => $(id).addEventListener('change', fetchKunj));
  ['kSearch', 'kStatus', 'kPrs'].forEach((id) => $(id).addEventListener('input', renderKunj));
  $('kunjList').addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) openDetail(b.dataset.id); });
  $('expChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    H.expChip = b.dataset.v;
    $('expChips').innerHTML = chipsHtml(expChips(), H.expChip);
    H.expLimit = 100;
    renderExp();
  });
  ['eStatus', 'ePrs', 'eLok'].forEach((id) => $(id).addEventListener('input', renderExp));
  $('expList').addEventListener('click', (e) => {
    const img = e.target.closest('[data-prev]');
    if (img) { openPreview(img.dataset.prev, img.dataset.dl, false); return; }
    const b = e.target.closest('[data-act=tarik]'); if (b) { toggleTarik(b.dataset.id); return; }
    const ed = e.target.closest('[data-act=editexp]');
    if (ed) { const r = H.exp.rows.find((x) => x.id === ed.dataset.id); if (r) openExpForm(r); return; }
    if (e.target.closest('[data-act=moreexp]')) { H.expLimit += 100; renderExp(); }
  });
  $('dataTabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    H.dataKey = b.dataset.v; H.dataPage = 1; H.dataQ = ''; $('dataSearch').value = '';
    $('dataTabs').innerHTML = chipsHtml(DATA_TABS, H.dataKey); loadData();
  });
  $('dataSearch').addEventListener('input', (e) => {
    clearTimeout(dataT); const v = e.target.value;
    dataT = setTimeout(() => { H.dataQ = v; H.dataPage = 1; loadData(); }, 300);
  });
  $('dataBody').addEventListener('click', onDataClick);
  $('dashPeriod').addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    H.dashPeriod = b.dataset.v; $('dashCustom').hidden = H.dashPeriod !== 'custom';
    $('dashPeriod').innerHTML = chipsHtml([['7', '7 hari'], ['30', '30 hari'], ['bulan', 'Bulan ini'], ['custom', 'Kustom']], H.dashPeriod);
    loadDash();
  });
  ['dFrom', 'dTo'].forEach((id) => $(id).addEventListener('change', loadDash));
  $('setTabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    H.setTab = b.dataset.v; renderSetTabs();
  });
  $('setBody').addEventListener('click', onSetClick);
  $('setBody').addEventListener('submit', (e) => { if (e.target.id === 'formSet') saveSettings(e); else if (e.target.id === 'formTeks') saveTeks(e); });
  $('setBody').addEventListener('input', (e) => { if (e.target.id === 'mSearch') { H.master.q = e.target.value; renderMaster(); } });
  $('mFormBody').addEventListener('submit', submitForm);
}

/** Muat dari cache perangkat (instan), lalu sinkron di latar belakang */
async function boot() {
  const cached = loadCaches();
  applyCfg(); fillLists();
  if (cached) hideOverlay();
  try {
    try { await refreshBootstrap(); }
    catch (e1) { await new Promise((r) => setTimeout(r, 2500)); await refreshBootstrap(); }
    S.booted = true;
    if (!cached) hideOverlay();
  } catch (e) {
    if (cached) { toast('Mode tanpa koneksi: memakai data tersimpan di perangkat.', 'warn'); }
    else {
      $('loadingText').textContent = 'Gagal memuat: ' + e.message;
      $('btnRetry').hidden = false;
      $('loadingOverlay').querySelector('.spinner').hidden = true;
    }
  }
}

function init() {
  applyTheme(lsGet('theme', 'light'));
  S.draft = lsGet('draft', null) || newDraft();
  S.draft.produk = Array.isArray(S.draft.produk) ? S.draft.produk : [];
  S.draft.ck = S.draft.ck || {};
  S.visit = lsGet('visit', null);
  S.host = lsGet('host', null);
  bindEvents();
  show('home');
  boot();
}
document.addEventListener('DOMContentLoaded', init);
