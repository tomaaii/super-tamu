# SUPER TAMU — Panduan Pemasangan (Backend GAS + Frontend GitHub Pages)

Pembagian tugas baru:
- **Backend** (data, PIN, foto, email) tetap di **Google Apps Script** dan Google Sheets Anda. Sekarang hanya melayani data (API), tidak lagi menampilkan halaman.
- **Frontend** (semua tampilan) pindah ke **GitHub Pages**. Alamat GitHub Pages inilah yang dibagikan ke tamu lewat link atau QR.

Data lama di Google Sheets **tidak hilang** dan tidak perlu diubah.

---

## A. Perbarui backend (Apps Script)

1. Buka proyek Apps Script SUPER TAMU yang sudah ada.
2. Buka berkas **Kode** → hapus seluruh isinya → tempel isi **Kode.gs** yang baru.
3. Buka **appsscript.json** (Project Settings → centang "Show appsscript.json"), isi dengan berkas **appsscript.json** yang disertakan.
4. Berkas **Index**, **Stylesheet**, dan **JavaScript** di proyek Apps Script sudah tidak dipakai. Hapus ketiganya.
5. **Jangan** menjalankan `setupAppEnvironment` lagi. Spreadsheet dan PIN Anda sudah ada.
6. Deploy: **Deploy → Kelola deployment → ikon pensil → Versi: Versi baru → Deploy**.
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Salin **URL Web App** (berakhiran `/exec`).
8. Cek: buka URL itu di browser. Harus muncul teks JSON yang memuat `"API SUPER TAMU aktif."`.

Proyek baru dari nol: tempel Kode.gs, jalankan `setupAppEnvironment` **sekali**, lalu deploy seperti di atas.

## B. Isi alamat backend di frontend

Buka **js/config.js** dengan Notepad, ganti `ISI_URL_EXEC_DI_SINI` dengan URL `/exec` tadi. Simpan.

```js
window.APP_CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec'
};
```

## C. Pasang frontend di GitHub Pages

Folder kerja: **hasil ekstrak ZIP `super-tamu-frontend`**. Di dalamnya langsung terlihat `index.html`, folder `css` dan `js`. Itulah folder yang di-`git init`. Jangan masuk lebih dalam dan jangan naik satu level.

Langkah umum (kita kerjakan satu per satu di chat):
1. Pasang Git, buat akun GitHub, atur `git config`.
2. Buat repository **Public** baru, misalnya `super-tamu`. Jangan centang README.
3. Di folder frontend, pastikan `dir` menampilkan `index.html`, lalu:
   ```
   git init
   git add .
   git commit -m "Upload pertama"
   git branch -M main
   git remote add origin https://github.com/USERNAME/super-tamu.git
   git push -u origin main
   ```
   Saat diminta password, tempel **Personal Access Token** (scope `repo`). Layar tidak menampilkan apa pun saat Anda menempel. Itu normal.
4. Di GitHub: **Settings → Pages → Deploy from a branch → main / (root) → Save**, centang **Enforce HTTPS**.
5. Tunggu 1–2 menit. Alamat situs: `https://USERNAME.github.io/super-tamu/`

## D. Uji

1. Buka alamat GitHub Pages di HP. Beranda tamu tampil dan dropdown PLU terisi.
2. Isi satu kunjungan contoh sampai minta verifikasi.
3. Masuk sebagai tuan rumah dengan PIN, lalu setujui. Cek baris baru di Google Sheets.
4. Bila ada masalah, buka Console browser (F12). Pesan yang umum:
   - *GAS_URL belum diisi* → ulangi langkah B.
   - *Server tidak mengembalikan data yang benar* → deploy belum "Anyone", atau belum versi baru.
   - Gagal menghubungi server → sinyal, atau URL `/exec` salah.

## E. Update berikutnya

- Ubah tampilan: edit berkas di folder frontend, lalu `git add .` → `git commit -m "ubah"` → `git push`. Tekan Ctrl+Shift+R di browser.
- Ubah backend: tempel Kode.gs baru → **Deploy versi baru** (URL `/exec` tetap sama).

## F. Catatan keamanan

- Repository GitHub bersifat publik. Isinya hanya tampilan dan alamat API, **tidak ada PIN atau kunci rahasia**. PIN tersimpan di Google Sheets Anda dalam bentuk hash.
- Daftar fungsi yang boleh dipanggil dari luar dibatasi di Kode.gs (`apiTable_`). Fungsi setup dan reset PIN darurat tidak bisa dipanggil lewat internet.
- Seluruh fitur tuan rumah dan Super Admin tetap dijaga token sesi di server.
