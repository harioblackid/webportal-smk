# Search Console & GA4 — langkah operasional

Dokumen ini melengkapi **US-020 / FR6-17, FR6-18**. Semua langkah di bawah dikerjakan setelah
situs live di `https://smkpgritelagasari.sch.id` (lihat prd-08 untuk urutan rilis — rilis hanya
dijalankan atas instruksi sekolah, FR8-4).

Yang perlu disiapkan sekolah: satu akun Google yang akan menjadi pemilik properti Search Console
dan properti GA4. Sebaiknya akun sekolah, bukan akun pribadi staf (OQ6-2).

## 1. Verifikasi kepemilikan di Search Console

Situs memakai metode **HTML tag**, karena kodenya tersimpan sebagai Setting — tidak perlu deploy
ulang saat properti berganti.

1. Buka <https://search.google.com/search-console> → **Add property** → pilih **URL prefix** →
   isi `https://smkpgritelagasari.sch.id/`.
2. Pada daftar metode verifikasi, pilih **HTML tag**. Google menampilkan baris seperti:

   ```html
   <meta name="google-site-verification" content="AbC123…" />
   ```

3. Salin baris itu (tombol *Copy* menyalin seluruh tag — itu tidak masalah).
4. Login ke `/admin` sebagai **Superadmin** → **Pengaturan** → bagian *Google Analytics &
   Search Console* → tempel pada **Kode verifikasi Search Console** → **Simpan pengaturan**.
   Kode diambil otomatis dari tag; hanya token `A–Z a–z 0–9 _ -` yang diterima.
5. Cek dengan **View Source** pada beranda bahwa `<meta name="google-site-verification">` sudah
   tampil, lalu klik **Verify** di Search Console.

> Tag ini terpasang di seluruh halaman, bukan hanya beranda, supaya properti tetap terverifikasi
> URL mana pun yang dicek ulang Google. Menghapus isi field akan mencabut verifikasi.

## 2. Mendaftarkan sitemap

`sitemap.xml` di-generate langsung dari database (FR6-9) — tidak ada berkas statis yang perlu
di-upload, dan berita/jurusan baru langsung masuk tanpa build ulang.

1. Di Search Console properti tersebut → **Sitemaps**.
2. Pada *Add a new sitemap*, isi `sitemap.xml` → **Submit**.
3. Status akan berubah menjadi *Success* dalam beberapa menit sampai beberapa jam.
4. Pantau **Pages** (dulu *Coverage*) selama 4 minggu pertama — target SM: seluruh halaman utama
   berstatus *Valid/Terindeks*.

Sanity check sebelum submit (boleh dari browser mana pun):

- <https://smkpgritelagasari.sch.id/robots.txt> memuat `Disallow: /admin` dan baris `Sitemap:`.
- <https://smkpgritelagasari.sch.id/sitemap.xml> terbuka sebagai XML, memuat beranda, `/profil`,
  `/kontak`, `/berita`, `/jurusan`, seluruh berita terbit, dan seluruh jurusan aktif — dan tidak
  memuat draf, jurusan nonaktif, atau `/admin`.

## 3. Mengaktifkan GA4

1. <https://analytics.google.com> → **Admin** → **Create property** (zona waktu *Jakarta*, mata
   uang *IDR*) → **Web** data stream untuk `https://smkpgritelagasari.sch.id`.
2. Salin **Measurement ID** (bentuknya `G-XXXXXXXXXX`).
3. `/admin` → **Pengaturan** → **Measurement ID** → **Simpan pengaturan**.
4. Buka beranda di jendela baru, lalu cek **Reports → Realtime** di GA4: kunjungan tersebut harus
   muncul sebagai `page_view` dalam ±30 detik.

Skrip GA4 hanya dimuat di halaman publik. Aktivitas staf di `/admin` sengaja tidak dihitung
(`App\Support\Analytics`), dan tidak ada tag yang dimuat selama field Measurement ID kosong.

## 4. Menautkan GA4 ke Search Console (opsional)

GA4 → **Admin** → **Product links** → **Search Console links** → pilih properti di atas. Setelah
tertaut, laporan *Queries* muncul di dalam GA4.

## Catatan

- **Cookie consent (OQ6-1):** belum dipasang; disepakati tidak wajib pada rilis pertama. Bila
  kelak diperlukan, tag GA4 di `resources/views/app.blade.php` adalah satu-satunya titik yang
  perlu dibungkus.
- Kedua nilai di atas adalah Setting biasa, jadi berlaku seketika tanpa deploy maupun `cache:clear`
  (FR5-19).
