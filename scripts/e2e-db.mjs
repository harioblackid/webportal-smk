/**
 * Creates, migrates and seeds the database the browser suite runs against.
 *
 * Run once, and again whenever a migration lands:
 *
 *     npm run test:e2e:db
 *
 * The suite must not touch `laravel_portal`. admin.spec creates a Post and
 * deletes it again, and `Post` soft-deletes — so on the developer's real
 * database the row stays in the table forever, the listing paginates
 * differently on the next run, and the search test picks a different term than
 * it did last time. A scratch database keeps every run starting from the same
 * place.
 *
 * `php artisan` reads its connection from the environment, and Laravel loads
 * .env immutably, so a variable already present in the process wins. That is
 * why DB_DATABASE is passed through `env` here rather than edited into .env.
 */

import { execFileSync } from 'node:child_process';
import process from 'node:process';

const database = process.env.E2E_DB ?? 'laravel_portal_e2e';
const host = process.env.DB_HOST ?? '127.0.0.1';
const port = process.env.DB_PORT ?? '3306';
const username = process.env.DB_USERNAME ?? 'root';
const password = process.env.DB_PASSWORD ?? '';

/*
 * `migrate:fresh` below drops every table, which is exactly right for a scratch
 * database and catastrophic for any other. A misspelt E2E_DB is the only way to
 * point it somewhere real, so refuse anything that is not named like a scratch
 * database rather than trusting the spelling.
 */
if (!database.endsWith('_e2e')) {
    console.error(
        `[e2e-db] Menolak: nama database '${database}' tidak berakhiran '_e2e'.\n` +
            `Skrip ini menjalankan migrate:fresh (menghapus seluruh tabel), jadi ia\n` +
            `hanya boleh menunjuk database khusus pengujian.`,
    );
    process.exit(1);
}

const run = (args, env) =>
    execFileSync('php', args, {
        stdio: 'inherit',
        env: { ...process.env, ...env },
    });

// Laravel has no `db:create`, so the database itself is made over PDO. Quoted
// with backticks because a name is an identifier, not a bindable value.
run([
    '-r',
    `$pdo = new PDO('mysql:host=${host};port=${port}', '${username}', '${password}');` +
        `$pdo->exec('CREATE DATABASE IF NOT EXISTS \`${database}\`');`,
]);

console.log(`\n[e2e-db] ${database} siap. Menjalankan migrate + seed…\n`);

run(['artisan', 'migrate:fresh', '--force'], { DB_DATABASE: database });
run(['artisan', 'db:seed', '--force'], { DB_DATABASE: database });
