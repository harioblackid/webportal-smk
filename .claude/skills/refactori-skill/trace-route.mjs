#!/usr/bin/env node
/**
 * trace-route.mjs — dari URL ke seluruh file yang menanganinya.
 *
 * Dipakai di Langkah B.1 skill `refactori-skill`: user cuma menyebut URL, dan
 * tugas Claude adalah menemukan sendiri route → Controller@method → Inertia page
 * → komponen-komponen Vue di bawahnya. Skrip ini melakukan penelusuran itu dalam
 * satu perintah, termasuk bagian yang paling gampang terlewat: menandai komponen
 * yang juga dipakai halaman lain, supaya perubahan "UI saja" tidak diam-diam
 * mengubah lima halaman sekaligus.
 *
 * Pemakaian:
 *   node .claude/skills/refactori-skill/trace-route.mjs <url-atau-path> [--depth N]
 *
 * Contoh:
 *   node .claude/skills/refactori-skill/trace-route.mjs /admin/cashier/checkout
 *   node .claude/skills/refactori-skill/trace-route.mjs http://localhost:8000/admin/cashier
 *   node .claude/skills/refactori-skill/trace-route.mjs admin/cashier/transactions/5/receipt
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(skillDir, '..', '..', '..');
const jsRoot = path.join(root, 'resources', 'js');
const pagesRoot = path.join(jsRoot, 'Pages');

const args = process.argv.slice(2);
const depthFlag = args.indexOf('--depth');
const maxDepth = depthFlag === -1 ? 2 : Number(args[depthFlag + 1] ?? 2);
const depthValueIndex = depthFlag === -1 ? -1 : depthFlag + 1;
const target = args.filter((a, i) => !a.startsWith('--') && i !== depthValueIndex)[0];

if (!target) {
    console.error('Pakai: node .claude/skills/refactori-skill/trace-route.mjs <url-atau-path> [--depth N]');
    process.exit(2);
}

/** `http://localhost:8000/admin/cashier?x=1` → `admin/cashier` */
function normalize(input) {
    let uri = input.trim();
    uri = uri.replace(/^https?:\/\/[^/]+/i, '');
    /*
    | Git Bash (MSYS) menerjemahkan argumen yang diawali `/` menjadi path Windows,
    | jadi `/admin/cashier` sampai di sini sebagai `C:/Program Files/Git/admin/cashier`.
    | Dikembalikan lagi di sini supaya perintah yang sama jalan di PowerShell maupun bash.
    */
    uri = uri.replace(/\\/g, '/').replace(/^[A-Za-z]:\/(?:.*\/)?Git\//i, '');
    uri = uri.split('?')[0].split('#')[0];
    return uri.replace(/^\/+/, '').replace(/\/+$/, '') || '/';
}

const uri = normalize(target);

/*
| `route:list --json` mengembalikan seluruh route; memfilter di sini (bukan lewat
| --path) supaya URL berisi id nyata seperti `transactions/5/receipt` tetap cocok
| dengan pola `transactions/{payment_transaction}/receipt`.
*/
let routes;
try {
    const raw = execFileSync('php', ['artisan', 'route:list', '--json'], {
        cwd: root,
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
    });
    routes = JSON.parse(raw);
} catch (error) {
    console.error('Gagal menjalankan `php artisan route:list --json` di', root);
    console.error(String(error.stderr || error.message).trim());
    process.exit(1);
}

function uriToRegex(pattern) {
    const escaped = pattern
        .split('/')
        .map((segment) =>
            /^\{.+\}$/.test(segment)
                ? (segment.endsWith('?}') ? '(?:[^/]+)?' : '[^/]+')
                : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        )
        .join('/');
    return new RegExp(`^${escaped}$`);
}

const matches = routes.filter((r) => r.uri === uri || uriToRegex(r.uri).test(uri));

if (matches.length === 0) {
    console.log(`TIDAK DITEMUKAN: tidak ada route yang cocok dengan "${uri}".`);
    const guess = routes
        .filter((r) => r.uri.includes(uri.split('/').pop() ?? ''))
        .slice(0, 10);
    if (guess.length) {
        console.log('\nRoute yang mirip (mungkin salah ketik):');
        for (const r of guess) console.log(`  ${r.method.padEnd(11)} ${r.uri}  → ${r.action}`);
    }
    console.log('\nJangan menebak. Laporkan ini ke user dan minta URL yang benar.');
    process.exit(1);
}

console.log(`URI cocok: ${uri}`);
console.log('');
console.log('=== ROUTE ===');
for (const r of matches) {
    console.log(`  ${r.method.padEnd(11)} ${r.uri}`);
    console.log(`    name       : ${r.name ?? '(tanpa nama)'}`);
    console.log(`    action     : ${r.action}`);
    console.log(`    middleware : ${(r.middleware ?? []).join(', ') || '-'}`);
}

/** `App\Http\Controllers\Admin\FooController@bar` → path file + nama method */
function resolveAction(action) {
    const [fqcn, method] = action.split('@');
    if (!fqcn || !fqcn.startsWith('App\\')) return null;
    const rel = fqcn.replace(/^App\\/, '').split('\\').join(path.sep) + '.php';
    const file = path.join(root, 'app', rel);
    return existsSync(file) ? { fqcn, method: method ?? '__invoke', file } : null;
}

/** Ambil badan satu method PHP dengan brace-matching sederhana. */
function extractMethod(source, method) {
    const signature = new RegExp(`function\\s+${method}\\s*\\(`);
    const start = source.search(signature);
    if (start === -1) return null;
    const open = source.indexOf('{', start);
    if (open === -1) return null;
    let depth = 0;
    for (let i = open; i < source.length; i++) {
        if (source[i] === '{') depth++;
        else if (source[i] === '}') {
            depth--;
            if (depth === 0) {
                return {
                    body: source.slice(start, i + 1),
                    line: source.slice(0, start).split('\n').length,
                };
            }
        }
    }
    return null;
}

const pageNames = new Set();
const seenControllers = new Set();

console.log('');
console.log('=== CONTROLLER ===');
for (const r of matches) {
    const resolved = resolveAction(r.action);
    if (!resolved) {
        console.log(`  ${r.action} — bukan controller App\\ (closure / vendor), lewati.`);
        continue;
    }
    const key = `${resolved.file}@${resolved.method}`;
    if (seenControllers.has(key)) continue;
    seenControllers.add(key);

    const source = readFileSync(resolved.file, 'utf8');
    const method = extractMethod(source, resolved.method);
    const relFile = path.relative(root, resolved.file).split(path.sep).join('/');
    console.log(`  ${relFile}${method ? `:${method.line}` : ''}  →  ${resolved.method}()`);

    // `use App\...` memberi model / FormRequest / service yang ikut tersentuh.
    const uses = [...source.matchAll(/^use\s+(App\\[^;]+);/gm)].map((m) => m[1]);
    if (uses.length) {
        console.log('    dependensi App\\:');
        for (const u of uses) console.log(`      - ${u}`);
    }

    const body = method?.body ?? source;
    const rendered = [
        ...body.matchAll(/inertia\(\s*['"]([^'"]+)['"]/g),
        ...body.matchAll(/Inertia::render\(\s*['"]([^'"]+)['"]/g),
    ].map((m) => m[1]);

    if (rendered.length === 0) {
        const redirects = [...body.matchAll(/(?:redirect|to_route)[^;]{0,120};/g)].map((m) =>
            m[0].replace(/\s+/g, ' ').trim(),
        );
        console.log(
            redirects.length
                ? `    tidak me-render page (redirect): ${redirects[0]}`
                : '    tidak me-render Inertia page (kemungkinan JSON / download / redirect)',
        );
    }
    for (const name of rendered) {
        pageNames.add(name);
        console.log(`    inertia page: ${name}`);
    }
}

/* --- Peta import: siapa mengimpor apa, untuk mendeteksi komponen bersama. --- */
function walk(dir, out = []) {
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else if (/\.(vue|ts|js)$/.test(entry)) out.push(full);
    }
    return out;
}

const allJsFiles = existsSync(jsRoot) ? walk(jsRoot) : [];

/** `@/components/ui/Card.vue` → path absolut; tambahkan .vue/.ts bila perlu. */
function resolveAlias(spec) {
    if (!spec.startsWith('@/')) return null;
    const base = path.join(jsRoot, spec.slice(2));
    for (const candidate of [base, `${base}.vue`, `${base}.ts`, `${base}.js`, path.join(base, 'index.ts')]) {
        if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
    return null;
}

function importsOf(file) {
    const source = readFileSync(file, 'utf8');
    return [...source.matchAll(/from\s+['"](@\/[^'"]+)['"]/g)]
        .map((m) => resolveAlias(m[1]))
        .filter(Boolean);
}

// Berapa banyak file lain yang mengimpor sebuah komponen → penanda "dipakai bersama".
const importerCount = new Map();
for (const file of allJsFiles) {
    for (const dep of importsOf(file)) {
        if (!importerCount.has(dep)) importerCount.set(dep, new Set());
        importerCount.get(dep).add(file);
    }
}

const rel = (f) => path.relative(root, f).split(path.sep).join('/');
const shared = [];

console.log('');
console.log('=== VIEW / KOMPONEN ===');
if (pageNames.size === 0) {
    console.log('  (tidak ada Inertia page pada route ini)');
}

for (const name of pageNames) {
    const pageFile = path.join(pagesRoot, `${name}.vue`);
    if (!existsSync(pageFile)) {
        console.log(`  ${name} → resources/js/Pages/${name}.vue TIDAK ADA (periksa nama page di controller)`);
        continue;
    }
    console.log(`  ${rel(pageFile)}`);

    const visited = new Set([pageFile]);
    const queue = [[pageFile, 0]];
    while (queue.length) {
        const [file, depth] = queue.shift();
        if (depth >= maxDepth) continue;
        for (const dep of importsOf(file)) {
            if (visited.has(dep)) continue;
            visited.add(dep);
            const users = importerCount.get(dep) ?? new Set();
            const flag = users.size > 1 ? `  ⚠ dipakai ${users.size} file lain` : '';
            if (users.size > 1) shared.push({ file: dep, users });
            console.log(`  ${'  '.repeat(depth + 1)}└─ ${rel(dep)}${flag}`);
            queue.push([dep, depth + 1]);
        }
    }
}

/*
| Komponen yang dipakai 30 halaman jelas primitif bersama dan tidak perlu
| diperingatkan — yang berbahaya justru yang dipakai dua sampai enam halaman:
| cukup sedikit untuk terlihat "milik halaman ini", cukup banyak untuk ikut
| berubah tanpa disadari. Yang itu didaftar lengkap; sisanya diringkas.
*/
const WIDE = 6;
const unique = [...new Map(shared.map((s) => [s.file, s])).values()];
const sneaky = unique.filter((s) => s.users.size <= WIDE).sort((a, b) => a.file.localeCompare(b.file));
const primitives = unique.filter((s) => s.users.size > WIDE).sort((a, b) => b.users.size - a.users.size);

if (sneaky.length || primitives.length) {
    console.log('');
    console.log('=== PERINGATAN: KOMPONEN BERSAMA ===');
}
if (sneaky.length) {
    console.log('Dipakai beberapa halaman lain — mengubahnya ikut mengubah mereka. Beri tahu user dulu:');
    for (const { file, users } of sneaky) {
        console.log(`  ${rel(file)}`);
        for (const u of [...users].sort()) console.log(`      ${rel(u)}`);
    }
}
if (primitives.length) {
    console.log(`Primitif bersama (>${WIDE} pemakai) — ubah hanya kalau memang niat mengubah seluruh app:`);
    for (const { file, users } of primitives) console.log(`  ${rel(file)} (${users.size} pemakai)`);
}

console.log('');
console.log('=== LANGKAH BERIKUTNYA ===');
console.log('Baca Controller + page di atas, lalu tanyakan ke user: UI saja, atau ada perubahan prosedur?');
