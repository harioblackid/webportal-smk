---
name: refactori-skill
description: Use this skill whenever the user asks to build a new feature or fix/modify/refactor an existing feature inside this project — routes in routes/web.php, Controllers under app/Http/Controllers, Inertia/Vue pages under resources/js/Pages, and migrations. Trigger on phrases like "buatkan fitur baru", "perbaiki fitur X", "modifikasi halaman Y", "refactor bagian Z", or any request to add or change functionality in the codebase — even if the user doesn't mention a specific file. Always start by asking whether this is a new feature or a modification to an existing one, and never write code from a vague request without first confirming scope, logic flow, and UI approach.
---

# Refactor & Fitur Skill

Skill ini menstandarkan cara menangani dua jenis permintaan pada project yang sudah berjalan: **membuat fitur baru** atau **memperbaiki/memodifikasi fitur yang sudah ada**. Tujuannya supaya coding tidak dimulai sebelum scope, logic, dan UI-nya jelas — karena revisi besar di tengah jalan jauh lebih mahal daripada lima menit tanya di awal.

Semua langkah di bawah dieksekusi langsung terhadap project nyata lewat filesystem, git, dan terminal — bukan disimulasikan. Semua path relatif terhadap root project (`c:\laragon\www\laravel-project\spp-sekolah`).

**Stack yang sebenarnya di sini:** Laravel + **Inertia + Vue 3 SFC**, bukan Blade. Satu-satunya Blade adalah root `resources/views/app.blade.php` dan template PDF di `resources/views/pdf/`. "View" pada skill ini artinya `resources/js/Pages/**/*.vue`; komponen bersarang datang lewat `import ... from '@/...'`, bukan `@include`.

## Langkah 0 — Tentukan jenis tugas

Setiap kali skill ini dipicu, tanyakan dulu ke user:

> "Ini untuk membuat **fitur baru**, atau **memperbaiki/memodifikasi fitur yang sudah ada**?"

Jangan mulai menelusuri kode atau menulis rencana sebelum ini terjawab — jenis tugas menentukan alur pertanyaan berikutnya.

---

## A. Fitur Baru

Kumpulkan empat hal berikut sebelum menulis rencana apa pun. Boleh ditanyakan sekaligus dalam satu pesan jika user tampak sudah punya gambaran jelas, tapi jangan lewati satupun:

1. **Deskripsi fitur** — apa fungsinya, siapa yang memakainya (role apa: admin, kasir, siswa, publik), dan di halaman/bagian mana fitur ini muncul.
2. **Migrasi** — apakah butuh migration baru, atau skema yang ada sudah cukup. Kalau user tidak yakin, lihat sendiri migration yang relevan lalu usulkan opsi dengan alasannya, dan minta konfirmasi — jangan memutuskan sepihak.
3. **Alur logic** — minta user menjelaskan alurnya sesederhana apapun ("user pilih X → sistem hitung Y → simpan Z"). Ini jadi dasar step-by-step implementasi.
4. **UI** — apakah user punya referensi (link, screenshot, komponen yang sudah ada di project) atau menyerahkan desainnya ke Claude.

Untuk menemukan skema yang sudah ada sebelum mengusulkan migration:

```bash
ls database/migrations | tail -20
php artisan migrate:status
```

## B. Modifikasi Fitur

### B.1 — Trace dari URL (pakai tracer, jangan grep manual)

Minta user menyebutkan **URL**-nya saja. Jangan minta nama Controller atau View — itu tugas tracer:

```bash
node .claude/skills/refactori-skill/trace-route.mjs admin/cashier/checkout
```

Satu perintah ini mengeluarkan, dari `php artisan route:list --json` dan pembacaan file:

- semua route (GET/POST/DELETE) yang cocok dengan URL itu, beserta nama route dan middleware;
- file + baris Controller untuk tiap method, plus semua `use App\...`-nya (Model, FormRequest, Action, Service yang ikut tersentuh);
- nama Inertia page yang di-render, dan file `.vue`-nya;
- pohon komponen di bawah page itu (default 2 level, atur dengan `--depth 3`);
- **daftar komponen yang juga dipakai halaman lain** — ini yang mencegah perubahan "UI saja" diam-diam mengubah lima halaman.

URL boleh berisi id nyata; pola route dicocokkan otomatis:

```bash
node .claude/skills/refactori-skill/trace-route.mjs admin/cashier/transactions/5/receipt
# → cocok ke admin/cashier/transactions/{payment_transaction}/receipt
```

Kalau tidak ada route yang cocok, tracer keluar dengan status 1 dan mencetak kandidat yang mirip. **Jangan menebak** — laporkan ke user, minta URL yang benar, atau konfirmasi apakah fiturnya memang belum punya route.

### B.2 — Tentukan cakupan

Setelah Controller dan page-nya terlihat, tanyakan ke user: apakah perubahan ini **UI saja**, atau ada **perubahan prosedur** yang mengharuskan logic dan UI disusun ulang bersama.

Kalau bagian "KOMPONEN BERSAMA" di output tracer berisi file yang perlu disentuh, **sebutkan itu ke user sebelum lanjut** — lengkap dengan daftar halaman yang ikut terpengaruh.

### B.3 — UI reference

Selalu tanyakan apakah user punya referensi untuk perubahan UI-nya (link, screenshot, komponen lain di project), sama seperti alur fitur baru.

### B.4 — Kalau menyentuh logic

Minta user menjelaskan step-by-step logic sederhananya **sendiri** — bukan Claude yang menebak dari kode lama. Perubahan harus match dengan maksud user, bukan hanya match dengan kode yang sudah ada.

---

## Setelah Analisa (berlaku untuk kedua alur)

1. **Analisa dulu, jangan langsung coding.** Baca ulang semua jawaban sebelum menyentuh kode.
2. **Konfirmasi rencana.** Ringkas scope, migration, logic, dan UI approach, lalu minta konfirmasi eksplisit. Kalau ada bagian yang user sendiri tidak bisa jelaskan secara teknis, berikan rekomendasi Claude — tapi tetap konfirmasi dulu sebelum dipakai sebagai dasar implementasi.
3. **Buat branch baru.** Kalau working tree masih kotor, commit dulu sisanya di branch aktif (lihat [Izin commit dan rilis](#izin-commit-dan-rilis)) supaya perubahan lama tidak ikut terbawa — sebutkan ke user file apa saja yang ikut ter-commit. Lalu branch dari branch aktif:

   ```bash
   git status --short
   git branch --show-current
   git checkout -b nama-branch-deskriptif
   ```

   Nama branch ditentukan Claude sendiri, deskriptif dan singkat  dalam dua kata kebab-case sesuai isi tugas (`payment-gateway`, `fix-invoice-print`) — bukan `update` atau `fix-1`. Lihat riwayat branch di repo ini untuk gaya penamaan (`cashier-payment`).
4. **Susun langkah-langkah step-by-step** — daftar file yang disentuh dan urutan kerjanya — sebelum kode ditulis.
5. **Eksekusi sesuai rencana**, tapi tetap terbuka menyesuaikan. Kalau rencana perlu berubah, beri tahu user; jangan diam-diam menyimpang. **Commit tiap langkah yang selesai** — jangan menumpuk semua pekerjaan jadi satu commit di akhir (lihat [Izin commit dan rilis](#izin-commit-dan-rilis)).
6. **Uji.** Lihat bagian [Pengujian](#pengujian).
7. **Commit sisa pekerjaan, lalu rekomendasikan versi.** Tag dan bump versi **tidak** dikerjakan di sini — itu menunggu user bilang "rilis versi ini". Lihat bagian [Setelah Pengujian — Commit & Rekomendasi Rilis](#setelah-pengujian--commit--rekomendasi-rilis).

## Izin commit dan rilis

**Commit otomatis; rilis tidak.** User memberi izin permanen untuk commit setiap pekerjaan — jangan bertanya "boleh saya commit?", langsung commit lalu laporkan. Tapi **menaikkan versi dan memberi tag adalah tindakan rilis, dan itu milik user.** Tugas Claude hanya **merekomendasikan**: sebutkan versi berapa yang pantas dan kenapa, lalu berhenti.

Aba-abanya eksplisit: **`"rilis versi ini"`** (atau permintaan setara yang jelas — "tag sekarang", "naikkan versinya"). Sebelum kalimat itu keluar dari user, `package.json`, `composer.json`, dan `git tag` tidak disentuh sama sekali.

| Tindakan | Boleh sendiri? |
|---|---|
| `git add` + `git commit` di branch kerja | **Ya**, tanpa bertanya |
| `git checkout -b` branch baru | **Ya** (namanya ditentukan Claude, lihat langkah 3) |
| Menaikkan versi di `package.json` / `composer.json` | **Tidak** — rekomendasikan, tunggu aba-aba rilis |
| `git tag -a` | **Tidak** — rekomendasikan, tunggu aba-aba rilis |
| `git push` / `git push --tags` | Tidak — sampai user memintanya eksplisit |
| `git reset --hard`, `git checkout -- <file>`, hapus branch | Tidak — ini membuang pekerjaan, bukan menyimpannya |

### Wajib: laporkan status versi di akhir setiap tugas

Selalu tutup pekerjaan dengan satu blok status versi — **baik saat ada rekomendasi naik maupun saat memang tidak ada**. Jangan pernah diam soal ini; user butuh info itu untuk memutuskan kapan merilis.

Ada yang layak dirilis:

```
Versi saat ini: 0.9.0 (belum diubah)
Rekomendasi   : naik ke 0.10.0 (MINOR) — bilang "rilis versi ini" kalau setuju
Pemicu        : #6 izin & akses (app/Http/Middleware/HandleInertiaRequests.php)
```

Tidak ada yang perlu naik:

```
Versi saat ini: 0.9.0 (tetap)
Rekomendasi   : tidak perlu rilis — semua perubahan masuk kategori netral (dokumentasi + test)
```

Ada yang layak, tapi tertahan:

```
Versi saat ini: 0.9.0 (tetap)
Rekomendasi   : TAHAN dulu — php artisan test --filter=Checkout masih merah (2 gagal)
Kalau sudah hijau, kandidatnya 0.10.0 (MINOR) dari #3 aturan hitung uang
```

Bedakan ketiganya dengan jujur: "tidak ada yang perlu naik" dan "ada, tapi test merah" terlihat sama-sama diam kalau tidak disebutkan.

### Saat user bilang "rilis versi ini"

Baru di titik ini `package.json`, `composer.json`, dan `git tag` boleh disentuh. Kerjakan berurutan, lihat [langkah 3 rilis](#3-eksekusi-rilis-saat-user-memintanya):

1. Pastikan pengujian hijau. Kalau merah, **jangan** tag — laporkan test mana yang gagal dan tunggu.
2. Bump di kedua manifest, commit `chore(release): ...`.
3. Tag anotasi berisi **note rilis**, lalu laporkan isinya ke user.
4. Berhenti. Push tetap menunggu permintaan terpisah.

Aturan main auto-commit:

- **Satu commit per perubahan logis**, bukan satu commit per keystroke dan bukan satu commit raksasa di akhir. Migration + Controller + page untuk satu fitur boleh jadi satu commit; tiga fitur berbeda tidak.
- **`git add` file yang memang disentuh**, jangan `git add -A`. Working tree di repo ini sering berisi file lain yang tidak ada hubungannya (dokumen, gambar, artefak build).
- **Commit boleh walau test belum hijau** — itu justru gunanya checkpoint. Yang tertahan saat test merah adalah rekomendasi rilisnya; laporkan sebagai "TAHAN dulu", jangan didiamkan.
- **Laporkan tiap commit secara ringkas** (`git log --oneline -1`), supaya user tetap tahu apa yang masuk tanpa harus bertanya.
- Pesan commit tetap Conventional Commits — lihat [langkah 1 rilis](#1-commit-pekerjaannya).

## Pengujian

Urutannya dari yang paling cepat memberi sinyal:

```bash
# 1. Type check Vue/TS — paling cepat menangkap prop & import yang salah
npm run type-check

# 2. Test PHP untuk area yang disentuh (filter agar cepat; 16 test ≈ 10 detik)
php artisan test --filter=Checkout

# 3. Playwright terhadap fitur yang diubah
npx playwright test e2e/cashier --project=chromium --reporter=line
```

Playwright di sini **menempel ke server yang sudah jalan** — tidak ada blok `webServer` di `playwright.config.ts`. Pastikan app hidup dulu:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/admin/login   # harus 200
```

Kalau belum hidup, jalankan `composer run dev` (menyalakan `php artisan serve` + Vite lewat concurrently), atau arahkan ke host lain dengan `E2E_BASE_URL`.

Login e2e ditangani sekali oleh `e2e/auth.setup.ts` (admin seed `admin@smk.com`), hasilnya disimpan ke `playwright/.auth/admin.json` dan dipakai ulang semua project. Jangan menulis login manual di tiap spec.

Suite e2e cashier lengkap (10 test, chromium) memakan **± 2 menit** — itu normal, bukan hang. Set timeout minimal 5 menit saat menjalankannya.

---

## Setelah Pengujian — Commit & Rekomendasi Rilis

Langkah 1–2 dikerjakan sendiri setiap tugas. **Langkah 3 hanya dijalankan kalau user bilang "rilis versi ini"** — sampai itu terjadi, hasil langkah 2 disampaikan sebagai rekomendasi, bukan dieksekusi.

**Syarat masuk:** semua langkah di [Pengujian](#pengujian) yang relevan sudah dijalankan dan hijau. Kalau ada test yang gagal atau sengaja dilewati, katakan itu ke user dan **jangan** merekomendasikan rilis — commit boleh, rilis tidak.

Panggil skill **`/versioning-skills`** untuk bagian git-nya, dan ikuti konvensi pesan commit di sana (`Add:` / `Fix:` / `Update:` / `Refactor:` / `Remove:`). Catatan: contoh path di skill itu menunjuk ke sandbox pengembangan skill (`/home/claude/skill-name`) — di sini semua perintah git dijalankan di root project.

### 1. Commit pekerjaannya

Sisa perubahan yang belum masuk checkpoint di-commit di sini, terpisah dari commit rilis. Langsung kerjakan — [izinnya sudah diberikan](#izin-commit-dan-rilis), tidak perlu bertanya lagi:

```bash
git status --short
git add <file-yang-memang-disentuh>     # jangan `git add -A` membabi buta
git commit -m "feat(cashier): ..."      # atau fix(...), refactor(...)
```

Repo ini memakai Conventional Commits (`feat(ui):`, `chore(build):`, `chore(release):`) — ikuti gaya yang sudah ada, dengan badan pesan yang menjelaskan *kenapa*, bukan mengulang diff.

### 2. Tentukan versi baru (SemVer)

Versi project ada di **dua** file yang harus selalu sama: `package.json` dan `composer.json`. `config/spp.php` membaca `composer.json` (bukan literal terpisah) dan footer menampilkannya — jadi kalau keduanya beda, footer akan mengklaim versi yang salah.

Jangan mengira-ngira dari ingatan soal file apa saja yang berubah — jalankan:

```bash
node .claude/skills/refactori-skill/suggest-version.mjs
git tag --list | tail -5
```

Skrip itu mengambil daftar file yang berubah **sejak rilis terakhir** (tag terakhir yang terjangkau dari HEAD, plus yang belum di-commit), mencocokkannya ke 10 pemicu di bawah, mengambil level tertinggi, dan menghitung versi berikutnya.

Baseline-nya tag, bukan `master`, karena pertanyaannya "apa yang **belum** dirilis" — diukur dari `master`, pekerjaan yang sudah keluar sebagai `v0.10.0` ikut terhitung lagi dan skrip merekomendasikan kenaikan kedua untuk perubahan yang sama. Base bisa disebut sendiri kalau perlu: `suggest-version.mjs master` atau `suggest-version.mjs v0.9.0`.

Aturan dari [semver.org](https://semver.org), diterapkan pada kondisi project **saat ini yang masih `0.y.z`** (SemVer poin 4 — API publik belum dinyatakan stabil, cutover CI3 → Laravel belum jalan):

| Isi perubahan | Pre-1.0 (sekarang) | Setelah 1.0.0 |
|---|---|---|
| Bug fix, tidak ada perilaku baru | PATCH — `0.9.0` → `0.9.1` | PATCH |
| Fitur baru / halaman baru / kolom baru yang backward-compatible | MINOR — `0.9.0` → `0.10.0` | MINOR |
| Breaking: route/kontrak berubah, kolom dihapus, alur lama tidak jalan lagi | MINOR — `0.9.0` → `0.10.0` (tetap MINOR selama 0.y.z), **dan** tulis breaking-nya eksplisit di badan commit | MAJOR |
| Refactor internal, dokumentasi, test, tooling — tidak ada perubahan yang terlihat user | **tidak naik versi**, cukup commit | idem |

#### Top 10 pemicu — inilah yang dicocokkan skrip

Tabel di bawah adalah isi `TRIGGERS` di `suggest-version.mjs`, diurutkan dari yang paling sering memaksa versi naik tinggi. **Kalau ada pemicu baru di project, ubah dua-duanya** — tabel ini dan array di skrip — supaya dokumentasi tidak pernah menjanjikan pengecekan yang tidak dijalankan.

| # | Pemicu | Pola path | Level |
|---|---|---|---|
| 1 | Skema database | `database/migrations/**` | BREAKING |
| 2 | Kontrak route & URL | `routes/web.php` | BREAKING |
| 3 | Aturan hitung uang | `app/Services/{BillGeneration,AutoMonthlyBill,ReceiptNumber,PeriodActivation}Service.php` | BREAKING |
| 4 | Format dokumen keluaran | `app/Services/{Receipt,StudentIdCard,Report}Service.php`, `resources/views/pdf/**` | BREAKING |
| 5 | Fitur backward-compatible | `resources/js/{Pages,Layouts,components}/**`, `app/Http/Controllers/**` | MINOR |
| 6 | Izin & akses | `app/Policies/**`, `app/Http/Middleware/**`, `app/Models/User.php`, `RoleSeeder`/`UserSeeder` | BREAKING |
| 7 | Config & environment | `config/**`, `.env.example` | MINOR |
| 8 | Command & scheduled job | `app/Console/**`, `routes/console.php` | BREAKING |
| 9 | Sisa perubahan kode | `app/**`, `resources/**`, `routes/**`, `database/**` yang tidak kena pemicu lain | PATCH |
| 10 | Dependency & runtime | `composer.json`, `package.json`, lockfile | PATCH |

**Tidak menaikkan versi** (dicek lebih dulu supaya tidak jatuh ke #9): `tests/**`, `e2e/**`, `**/*.md`, `.claude/**`, `.github/**`, `*.config.{js,ts,mjs,cjs}`, `.gitignore`, `*.tsbuildinfo`.

Skrip **mengusulkan, tidak memutuskan**:

- **Baca baris `periksa:`** untuk setiap trigger yang menyala. Path tidak bisa membedakan `dropColumn` dari kolom baru nullable, atau route yang dihapus dari route yang ditambah — level di tabel adalah level *tertinggi yang mungkin*, dan isi diff yang menentukan level sebenarnya. Turunkan atau naikkan sendiri kalau isinya berkata lain, lalu sebutkan alasannya ke user.
- **Blok `TIDAK TERKLASIFIKASI` wajib dibaca.** File yang tidak cocok pola mana pun tidak otomatis aman — ia cuma belum punya aturan.
- **Kalau 0 trigger cocok**, tidak ada yang perlu dirilis — tapi jangan diam: laporkan "tidak perlu rilis" beserta alasannya, sesuai format di [Izin commit dan rilis](#izin-commit-dan-rilis).

Aturan turunan yang gampang keliru:

- **`0.10.0` lebih baru dari `0.9.0`.** Angka SemVer bukan desimal; jangan "membulatkan" ke `1.0.0` hanya karena minor sudah dua digit.
- **Naik ke `1.0.0` bukan keputusan Claude.** Itu terjadi saat go-live disetujui (lihat `CATATAN-CUTOVER.md`). Kalau user memintanya, konfirmasi dulu bahwa cutover memang sudah disetujui.
- **Satu rilis = satu kenaikan.** Kalau satu tugas berisi fitur baru + bug fix sekaligus, ambil bagian yang paling tinggi (MINOR), jangan menaikkan dua kali.
- Angka yang di bawah di-reset: naik MINOR → PATCH kembali ke `0`.

**Sampaikan angkanya sebagai rekomendasi, lalu BERHENTI.** Jangan menyentuh `package.json`, `composer.json`, atau `git tag`. Pakai format blok status versi di [Izin commit dan rilis](#izin-commit-dan-rilis), sertakan alasan satu kalimat ("fitur baru, backward-compatible → `0.10.0`") dan kalimat penutup bahwa user tinggal bilang "rilis versi ini".

Rekomendasi tetap disampaikan walau user belum tentu mau merilis sekarang — menumpuk beberapa tugas dalam satu rilis itu sah, dan justru itu alasan keputusannya ada di user.

### 3. Eksekusi rilis (saat user memintanya)

**Prasyarat: user sudah bilang "rilis versi ini" atau setara.** Tanpa itu, langkah ini tidak ada.

```bash
# bump di kedua file (Edit tool, bukan sed) lalu:
git add package.json composer.json
git commit -m "chore(release): set project version to 0.10.0"

git tag -a v0.10.0 -F -    # note rilis lewat stdin; heredoc, bukan -m satu baris
git tag -n99 v0.10.0       # verifikasi isi tag
```

- Tag **selalu anotasi** (`-a`), tidak pernah lightweight — supaya ada penulis, tanggal, dan pesan. Format nama: `v<major>.<minor>.<patch>`, dengan prefix `v` (ikut `v0.9.0`).
- Tag dipasang di commit rilis, bukan di commit fitur.
- Versi yang dipakai adalah yang direkomendasikan di langkah 2. Kalau user menyebut angka lain, pakai angka user — tapi katakan kalau angka itu melanggar SemVer, sekali, lalu jalankan.

#### Isi note rilis

Note rilis ditulis di badan tag anotasi, bukan di file CHANGELOG terpisah. Gaya mengikuti `git tag -n99 v0.9.0` — baca itu dulu sebagai contoh. Empat bagian:

1. **Baris pertama**: `v0.10.0 - <ringkasan satu baris>`, lalu baris kosong.
2. **Cakupan** — apa yang masuk rilis ini, dalam kalimat manusia, bukan daftar commit mentah. Ambil dari `git log --oneline <tag-sebelumnya>..HEAD`.
3. **Breaking / catatan deploy** — kalau ada pemicu breaking yang menyala (migration, route, aturan hitung uang, format dokumen, izin akses, config wajib, jadwal cron), tulis eksplisit apa yang harus dilakukan operator saat naik versi. Ini bagian yang paling sering dilewatkan dan paling mahal kalau hilang.
4. **Apa yang membuatnya belum layak versi berikutnya** — khususnya selama masih `0.y.z`, sebutkan apa yang masih menahan `1.0.0` (lihat `CATATAN-CUTOVER.md`).

Setelah tag dibuat, cetak isinya ke user dengan `git tag -n99` — jangan hanya bilang "tag sudah dibuat".

### 4. Jangan push sendiri

Berhenti setelah tag lokal dibuat. Laporkan ke user: nama branch, daftar commit (`git log --oneline -3`), nama tag, dan isi note rilisnya. `git push` dan `git push --tags` hanya dijalankan kalau user memintanya secara eksplisit — permintaan "rilis versi ini" **tidak** termasuk izin push.

Kalau ternyata tag salah (versi keliru, dipasang di commit yang salah) dan **belum dipush**, perbaiki dengan `git tag -d v0.10.0` lalu buat ulang. Kalau sudah terlanjur dipush, jangan hapus diam-diam — tanyakan ke user, karena tag yang sudah tersebar tidak boleh berpindah.

---

## Gotchas

- **`php artisan route:list --columns=...` tidak ada di versi Laravel ini** — perintahnya gagal. Pakai `--json` (dipakai tracer) atau `--path=<fragmen>` untuk melihat cepat.
- **Git Bash memangsa argumen yang diawali `/`.** `trace-route.mjs /admin/cashier` sampai ke script sebagai `C:/Program Files/Git/admin/cashier`. Tracer sudah membersihkan prefix itu, tapi untuk perintah lain: tulis path tanpa slash depan (`admin/cashier`) atau jalankan lewat PowerShell.
- **Playwright dikunci ke 1 worker** (`workers: Number(process.env.E2E_WORKERS ?? 1)`) karena `php artisan serve` melayani satu request pada satu waktu; menaikkannya bikin navigasi timeout padahal halamannya tidak lambat. Lewat Apache Laragon, `E2E_WORKERS` boleh dinaikkan.
- **Hampir semua komponen UI di sini dipakai bersama.** `Button.vue` 34 pemakai, `PageHeader.vue` 28, `AdminLayout.vue` 27. Tracer memisahkan "primitif bersama (>6 pemakai)" dari yang dipakai 2–6 halaman — yang kedua justru lebih berbahaya, karena terlihat seperti milik satu halaman padahal bukan.
- **Controller bisa punya method yang tidak me-render page** (`store`, `destroy` → redirect). Tracer menandainya; jangan mencari file `.vue` untuk method itu.
- **Jangan membuat migration "untuk jaga-jaga".** Kalau ragu skema lama cukup, tunjukkan skema yang ada ke user dan biarkan mereka yang memutuskan.

## Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| `TIDAK DITEMUKAN: tidak ada route yang cocok` | URL salah, atau fitur belum punya route. Lihat daftar "route yang mirip" di output; kalau kosong, tanyakan user. |
| Tracer: `Gagal menjalankan php artisan route:list --json` | `php` tidak ada di PATH shell tersebut, atau ada error boot Laravel. Jalankan `php artisan route:list --path=admin` langsung untuk melihat pesan aslinya. |
| `resources/js/Pages/X/Y.vue TIDAK ADA` | Nama page di `inertia('...')` tidak cocok dengan file. Perbaiki salah satunya. |
| Playwright gagal di step `sign in as administrator` | Server mati, atau kredensial admin beda. Cek `curl` ke `/admin/login`, atau set `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`. |
| Test e2e timeout di navigasi | Biasanya worker >1 melawan `php artisan serve`. Kembalikan ke `E2E_WORKERS=1`. |
| Footer masih menampilkan versi lama setelah bump | `config/spp.php` membaca `composer.json` saat boot. Kalau config sedang di-cache, jalankan `php artisan config:clear`. Cek juga `SPP_APP_VERSION` di `.env` — env menang atas manifest. |
| `fatal: tag 'v0.10.0' already exists` | Versi itu sudah dirilis. Jangan pakai `-f`; tentukan versi berikutnya yang benar, atau tanyakan ke user apakah tag lama memang salah dan belum dipush. |
| `suggest-version.mjs`: `⚠ package.json dan composer.json berbeda` | Bereskan dulu sebelum bump. `config/spp.php` membaca `composer.json`, jadi itu yang tampil di footer; menumpuk bump baru di atas selisih ini bikin dua-duanya salah. |
| `suggest-version.mjs`: `Gagal membaca perubahan git terhadap base "main"` | Repo ini branch utamanya `master`; skrip mencoba `main` → `master` → `origin/*` otomatis. Kalau base-nya lain (mis. `develop`), sebutkan sebagai argumen. |
