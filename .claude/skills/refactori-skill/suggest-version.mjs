#!/usr/bin/env node
/**
 * suggest-version.mjs — dari daftar file yang berubah ke usulan versi berikutnya.
 *
 * Dipakai di langkah "Setelah Pengujian — Commit & Tag" skill `refactori-skill`.
 * Tabel keputusan SemVer di SKILL.md menjawab "kalau breaking, naik berapa"; yang
 * susah justru pertanyaan sebelumnya — "perubahan yang barusan saya buat ini
 * breaking atau bukan". Skrip ini menjawab itu dengan mencocokkan file yang
 * berubah ke 10 pemicu yang memang ada di project ini, lalu mengambil level
 * tertinggi dan menghitung versi berikutnya sesuai semver.org.
 *
 * Skrip ini HANYA MEMBACA. Ia tidak menyentuh package.json/composer.json dan
 * tidak menjalankan `git tag` — angkanya rekomendasi. Bump dan tag baru boleh
 * dieksekusi setelah user bilang "rilis versi ini".
 *
 * Pemakaian:
 *   node .claude/skills/refactori-skill/suggest-version.mjs [base]
 *
 * Contoh:
 *   node .claude/skills/refactori-skill/suggest-version.mjs           # base: master
 *   node .claude/skills/refactori-skill/suggest-version.mjs develop
 *
 * Catatan: commit rilis sendiri menyentuh package.json + composer.json, yang
 * termasuk pemicu #10. Skrip dijalankan SEBELUM bump, jadi itu tidak
 * mengganggu — tapi kalau dijalankan ulang sesudahnya, #10 akan ikut menyala
 * karena bump-nya sendiri. Abaikan yang itu.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(skillDir, '..', '..', '..');

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));

/*
| Sepuluh pemicu versi, urut sesuai tabel di SKILL.md. Kalau ada pemicu baru di
| project, ubah DUA-DUANYA — tabel di SKILL.md dan array ini — supaya dokumentasi
| tidak pernah menjanjikan pengecekan yang tidak dijalankan.
|
| `level` adalah level TERTINGGI yang mungkin dari sebuah path; `periksa` adalah
| apa yang harus dilihat di isi diff untuk memastikannya. Path saja tidak bisa
| membedakan `dropColumn` dari `addColumn`->nullable, jadi baris `periksa` bukan
| hiasan — itu bagian dari keputusannya.
*/
const TRIGGERS = [
    {
        id: 1,
        nama: 'Skema database',
        level: 'BREAKING',
        pola: [/^database\/migrations\//],
        periksa: 'dropColumn / renameColumn / ->change() / drop tabel = breaking. Kolom baru nullable = MINOR.',
    },
    {
        id: 2,
        nama: 'Kontrak route & URL',
        level: 'BREAKING',
        pola: [/^routes\/web\.php$/],
        periksa: 'Route dihapus, di-rename, atau ganti middleware = breaking (bookmark, link kwitansi, spec e2e ikut mati). Route baru = MINOR.',
    },
    {
        id: 3,
        nama: 'Aturan hitung uang',
        level: 'BREAKING',
        pola: [/^app\/Services\/(BillGeneration|AutoMonthlyBill|ReceiptNumber|PeriodActivation)Service\.php$/],
        periksa: 'Breaking walau UI identik: angka yang keluar ke bendahara berubah. Bandingkan hasil sebelum/sesudah pada data nyata.',
    },
    {
        id: 4,
        nama: 'Format dokumen keluaran',
        level: 'BREAKING',
        pola: [
            /^app\/Services\/(Receipt|StudentIdCard|Report)Service\.php$/,
            /^resources\/views\/pdf\//,
        ],
        periksa: 'Konsumennya di luar aplikasi (arsip sekolah, bendahara). Nomor kwitansi, layout cetak, atau kolom export yang berubah = breaking.',
    },
    {
        id: 5,
        nama: 'Fitur backward-compatible',
        level: 'MINOR',
        pola: [
            /^resources\/js\/(Pages|Layouts|components)\//,
            /^app\/Http\/Controllers\//,
        ],
        periksa: 'Halaman/filter/menu baru = MINOR. Kalau ada halaman atau aksi yang DIHAPUS, naikkan sendiri ke breaking.',
    },
    {
        id: 6,
        nama: 'Izin & akses',
        level: 'BREAKING',
        pola: [
            /^app\/Policies\//,
            /^app\/Http\/Middleware\//,
            /^app\/Models\/User\.php$/,
            /^database\/seeders\/(Role|User)Seeder\.php$/,
        ],
        periksa: 'Memperluas akses = MINOR. Mempersempit = breaking bagi role yang tadinya bisa — sebut role mana di badan commit.',
    },
    {
        id: 7,
        nama: 'Config & environment',
        level: 'MINOR',
        pola: [/^config\//, /^\.env\.example$/],
        periksa: 'Key baru yang WAJIB diisi = breaking untuk deploy. Ada default = MINOR. Cek juga apakah config:cache perlu di-clear saat rilis.',
    },
    {
        id: 8,
        nama: 'Command & scheduled job',
        level: 'BREAKING',
        pola: [/^app\/Console\//, /^routes\/console\.php$/],
        periksa: 'Nama command, signature, atau jadwal yang berubah = breaking untuk crontab di server. Command baru = MINOR.',
    },
    {
        id: 10,
        nama: 'Dependency & runtime',
        level: 'PATCH',
        pola: [/^(composer|package)\.json$/, /^(composer|package)-?lock\.json$/, /\.lock$/],
        periksa: 'Naik minimum PHP/Node = breaking untuk lingkungan (cek "require" di composer.json / "engines" di package.json). Sisanya PATCH.',
    },
    /*
    | #9 sengaja terakhir: ia penampung sisa, bukan pola spesifik. Apa pun kode
    | project yang tidak kena sembilan pemicu di atas jatuh ke sini sebagai PATCH,
    | supaya tidak ada perubahan kode yang lolos tanpa terlihat.
    */
    {
        id: 9,
        nama: 'Sisa perubahan kode',
        level: 'PATCH',
        pola: [/^(app|resources|routes|database)\//],
        periksa: 'Default-nya bug fix (PATCH). Kalau ternyata ada perilaku baru yang dijanjikan ke user, naikkan sendiri ke MINOR.',
    },
];

/*
| Dicek SEBELUM daftar pemicu, kalau tidak semuanya akan jatuh ke #9 dan setiap
| perbaikan test atau typo dokumentasi akan menghasilkan tag baru.
*/
const NETRAL = [
    { label: 'test', pola: /^(tests|e2e)\// },
    { label: 'dokumentasi', pola: /\.md$/i },
    { label: 'skill & tooling agent', pola: /^\.claude\// },
    { label: 'CI', pola: /^\.github\// },
    { label: 'tooling build', pola: /(^|\/)[\w.-]*\.config\.(js|ts|mjs|cjs)$/ },
    { label: 'housekeeping repo', pola: /(^|\/)(\.gitignore|\.gitattributes|\.editorconfig)$/ },
    { label: 'artefak build', pola: /\.tsbuildinfo$/ },
];

const PERINGKAT = { PATCH: 1, MINOR: 2, BREAKING: 3 };

/*
| `trimEnd`, bukan `trim`: baris pertama `git status --porcelain` untuk file yang
| belum di-stage diawali spasi (` M path`). Memangkas awalnya menggeser kolom
| status dan membuat karakter pertama path ikut terpotong — `.claude/x` jadi
| `claude/x`, cocok ke pola yang salah tanpa error apa pun.
*/
function git(gitArgs) {
    return execFileSync('git', gitArgs, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).trimEnd();
}

function refAda(ref) {
    try {
        git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]);
        return true;
    } catch {
        return false;
    }
}

/*
| Base default adalah TAG TERAKHIR, bukan branch utama. Pertanyaannya "apa yang
| belum dirilis", dan itu diukur dari rilis terakhir — kalau diukur dari master,
| pekerjaan yang sudah keluar sebagai v0.10.0 ikut terhitung lagi dan skrip
| merekomendasikan kenaikan kedua untuk perubahan yang sama.
|
| Repo tanpa tag sama sekali jatuh ke branch utama; `main` atau `master`
| dideteksi, bukan di-hardcode, karena repo ini pakai `master`.
*/
function tentukanBase() {
    if (args[0]) return args[0];
    try {
        const tag = git(['describe', '--tags', '--abbrev=0']);
        if (tag) return tag;
    } catch {
        /* belum ada tag — pakai branch utama sebagai baseline pertama. */
    }
    const kandidat = ['main', 'master', 'origin/main', 'origin/master'].filter(refAda);
    if (kandidat.length === 0) {
        console.error('Tidak menemukan tag maupun branch base (main/master). Sebutkan sendiri:');
        console.error('  node .claude/skills/refactori-skill/suggest-version.mjs <branch-atau-tag>');
        process.exit(1);
    }
    return kandidat[0];
}

const base = tentukanBase();

/** Semua path dinormalkan ke posix sebelum dicocokkan; pola di atas menganggapnya begitu. */
const toPosix = (p) => p.replace(/\\/g, '/').replace(/^\.\//, '');

let mergeBase;
let committed = [];
let uncommitted = [];
try {
    mergeBase = git(['merge-base', base, 'HEAD']);
    committed = git(['diff', '--name-only', mergeBase, 'HEAD']).split('\n').filter(Boolean).map(toPosix);
    uncommitted = git(['status', '--porcelain'])
        .split('\n')
        .filter(Boolean)
        /*
        | Format porcelain: 2 kolom status, spasi, lalu path. Rename tampil sebagai
        | `R  lama -> baru`; yang relevan untuk versi adalah sisi tujuannya.
        */
        .map((line) => line.slice(3).trim())
        .map((p) => (p.includes(' -> ') ? p.split(' -> ')[1] : p))
        .map((p) => toPosix(p.replace(/^"|"$/g, '')));
} catch (error) {
    console.error(`Gagal membaca perubahan git terhadap base "${base}" di ${root}`);
    console.error(String(error.stderr || error.message).trim());
    console.error('');
    console.error('Kalau branch base-nya bukan main/master, sebutkan sendiri:');
    console.error('  node .claude/skills/refactori-skill/suggest-version.mjs <branch>');
    process.exit(1);
}

const belumCommit = new Set(uncommitted);
const files = [...new Set([...committed, ...uncommitted])].sort();

/* --- Versi sekarang: dua file yang harus selalu sama. --- */
function bacaVersi(manifest) {
    const file = path.join(root, manifest);
    if (!existsSync(file)) return null;
    try {
        return JSON.parse(readFileSync(file, 'utf8')).version ?? null;
    } catch {
        return null;
    }
}

const versiNpm = bacaVersi('package.json');
const versiComposer = bacaVersi('composer.json');
let tagTerakhir = '(belum ada tag)';
try {
    tagTerakhir = git(['describe', '--tags', '--abbrev=0']) || tagTerakhir;
} catch {
    /* repo tanpa tag sama sekali — bukan error. */
}

console.log('=== VERSI SEKARANG ===');
console.log(`  package.json  : ${versiNpm ?? '(tidak ada field version)'}`);
console.log(`  composer.json : ${versiComposer ?? '(tidak ada field version)'}`);
console.log(`  tag terakhir  : ${tagTerakhir}`);

if (versiNpm && versiComposer && versiNpm !== versiComposer) {
    console.log('');
    console.log('  ⚠ PERINGATAN: package.json dan composer.json berbeda.');
    console.log('    config/spp.php membaca composer.json, jadi footer menampilkan yang itu.');
    console.log('    Samakan dulu sebelum rilis — jangan menumpuk selisih ini dengan bump baru.');
}

const versiSekarang = versiComposer ?? versiNpm;

console.log('');
console.log('=== FILE YANG BERUBAH ===');
console.log(`  base        : ${base}${args[0] ? '' : ' (default: rilis terakhir)'}  ·  merge-base ${mergeBase.slice(0, 7)}`);
console.log(`  sudah commit: ${committed.length} file`);
console.log(`  belum commit: ${uncommitted.length} file`);

if (files.length === 0) {
    console.log('');
    console.log(`  Tidak ada perbedaan terhadap ${base}. Tidak ada yang bisa dirilis.`);
    process.exit(0);
}

/* --- Klasifikasi. --- */
const kena = new Map();
const netral = [];
const takDikenal = [];

for (const file of files) {
    const netralHit = NETRAL.find((n) => n.pola.test(file));
    if (netralHit) {
        netral.push({ file, label: netralHit.label });
        continue;
    }
    const trigger = TRIGGERS.find((t) => t.pola.some((p) => p.test(file)));
    if (!trigger) {
        takDikenal.push(file);
        continue;
    }
    if (!kena.has(trigger.id)) kena.set(trigger.id, { trigger, files: [] });
    kena.get(trigger.id).files.push(file);
}

const tandai = (f) => `${f}${belumCommit.has(f) ? '   (belum di-commit)' : ''}`;
const cocok = [...kena.values()].sort((a, b) => a.trigger.id - b.trigger.id);

console.log('');
console.log('=== TRIGGER YANG COCOK ===');
if (cocok.length === 0) {
    console.log(`  Tidak ada. ${TRIGGERS.length} pemicu dicek, 0 cocok.`);
} else {
    for (const { trigger, files: hit } of cocok) {
        console.log(`  #${trigger.id} ${trigger.nama}  [${trigger.level}]`);
        for (const f of hit) console.log(`     ${tandai(f)}`);
        console.log(`     periksa: ${trigger.periksa}`);
        console.log('');
    }
}

if (netral.length) {
    console.log('=== TIDAK NAIK VERSI ===');
    for (const { file, label } of netral) console.log(`  (${label}) ${tandai(file)}`);
    console.log('');
}

if (takDikenal.length) {
    console.log('=== TIDAK TERKLASIFIKASI ===');
    console.log('  Tidak cocok pola mana pun — nilai sendiri, jangan diabaikan:');
    for (const f of takDikenal) console.log(`  ${tandai(f)}`);
    console.log('');
}

/* --- Usulan. --- */
function versiBerikut(sekarang, level) {
    const [maj, min, pat] = String(sekarang).split(/[-+]/)[0].split('.').map((n) => Number(n) || 0);
    if (level === 'BREAKING') return maj === 0 ? `${maj}.${min + 1}.0` : `${maj + 1}.0.0`;
    if (level === 'MINOR') return `${maj}.${min + 1}.0`;
    return `${maj}.${min}.${pat + 1}`;
}

console.log('=== USULAN ===');

if (cocok.length === 0) {
    console.log(`  ${TRIGGERS.length} pemicu dicek, 0 cocok — semua yang terklasifikasi masuk kategori netral.`);
    if (takDikenal.length) {
        console.log(`  Tapi ada ${takDikenal.length} file TIDAK TERKLASIFIKASI di atas: baca dulu, baru simpulkan.`);
    }
    console.log('  Rekomendasi: TIDAK perlu rilis. Commit saja, versi dibiarkan.');
    console.log('');
    console.log('  Wajib dilaporkan ke user (jangan didiamkan hanya karena tidak ada perubahan):');
    console.log(`    Versi saat ini: ${versiSekarang} (tetap)`);
    console.log('    Rekomendasi   : tidak perlu rilis — semua perubahan masuk kategori netral');
    process.exit(0);
}

const tertinggi = cocok.reduce((a, b) => (PERINGKAT[b.trigger.level] > PERINGKAT[a.trigger.level] ? b : a));
const level = tertinggi.trigger.level;
const target = versiBerikut(versiSekarang, level);
const [majSekarang] = String(versiSekarang).split('.').map(Number);

console.log(`  level tertinggi : ${level}  (dari #${tertinggi.trigger.id} ${tertinggi.trigger.nama})`);
if (level === 'BREAKING' && majSekarang === 0) {
    console.log('  project masih 0.y.z (semver.org poin 4) → breaking turun jadi kenaikan MINOR,');
    console.log('  tapi breaking-nya WAJIB ditulis eksplisit di badan commit.');
}
console.log(`  ${versiSekarang} → ${target}`);
console.log('');
console.log('  Wajib dilaporkan ke user — sebagai REKOMENDASI, bukan sebagai hal yang sudah dikerjakan:');
console.log(`    Versi saat ini: ${versiSekarang} (belum diubah)`);
console.log(`    Rekomendasi   : naik ke ${target} (${level}) — bilang "rilis versi ini" kalau setuju`);
console.log(`    Pemicu        : #${tertinggi.trigger.id} ${tertinggi.trigger.nama}`);

console.log('');
console.log('  BARU setelah user bilang "rilis versi ini", bump di KEDUA file lalu:');
console.log(`    git commit -m "chore(release): set project version to ${target}"`);
console.log(`    git tag -a v${target} -F -   # note rilis lewat heredoc, lihat SKILL.md`);

console.log('');
console.log('=== LANGKAH BERIKUTNYA ===');
console.log('Angka di atas usulan awal — pertajam dengan membaca baris `periksa:` tiap trigger');
console.log('yang kena; path tidak bisa membedakan drop kolom dari tambah kolom nullable.');
console.log('Sampaikan hasilnya sebagai rekomendasi, lalu BERHENTI: package.json, composer.json,');
console.log('dan git tag tidak disentuh sampai user memintanya. Push menunggu permintaan terpisah.');
