/**
 * SUPER TAMU — Penghubung ke backend (Google Apps Script sebagai REST API)
 * call(nama, ...argumen) -> Promise berisi data; respons server {success,data,message}.
 *  - Semua panggilan memakai POST text/plain (tanpa preflight CORS).
 *  - Pembacaan data: batas waktu 45 detik dan 1x ulang otomatis bila jaringan putus.
 *  - Penulisan: TANPA batas waktu & TANPA ulang otomatis, agar data tidak terkirim ganda.
 */
const READ_FN = /^(getBootstrap|getVisitStatus|hostGet|adminGet)/;

async function callOnce(fn, args, timeoutMs) {
  const url = (window.APP_CONFIG || {}).GAS_URL || '';
  if (!/^https:\/\/script\.google\.com\//.test(url)) throw new Error('GAS_URL belum diisi. Buka js/config.js lalu tempel URL /exec dari Apps Script.');
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctl && timeoutMs ? setTimeout(() => ctl.abort(), timeoutMs) : 0;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ fn: fn, args: args }),
      signal: ctl ? ctl.signal : undefined,
      redirect: 'follow'
    });
    const txt = await res.text();
    let json;
    try { json = JSON.parse(txt); } catch (e) { const err = new Error('Server tidak mengembalikan data yang benar. Pastikan Web App di-deploy dengan akses "Anyone".'); err.fatal = true; throw err; }
    return json;
  } finally { clearTimeout(timer); }
}

/** Ubah galat jaringan menjadi pesan ramah; galat yang sudah ramah (fatal/GAS_URL) dibiarkan */
function netErr(e) {
  if (e.fatal || /GAS_URL/.test(e.message)) return e;
  return new Error(e.name === 'AbortError' ? 'Koneksi lambat. Periksa sinyal lalu coba lagi.' : 'Gagal menghubungi server. Periksa sinyal internet.');
}

async function call(fn, ...args) {
  bar(true);
  try {
    const isRead = READ_FN.test(fn);
    let json;
    try { json = await callOnce(fn, args, isRead ? 45000 : 0); }
    catch (e) {
      const err = netErr(e);
      if (!isRead || err.fatal || /GAS_URL/.test(err.message)) throw err;
      await new Promise((r) => setTimeout(r, 1200));   // satu kali ulang untuk pembacaan
      try { json = await callOnce(fn, args, 45000); } catch (e2) { throw netErr(e2); }
    }
    if (json && json.success) return json.data;
    throw new Error((json && json.message) || 'Terjadi kesalahan.');
  } finally { bar(false); }
}
