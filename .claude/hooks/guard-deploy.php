<?php

declare(strict_types=1);

/*
 * PreToolUse guard for Bash / PowerShell.
 *
 * FR8-4: deployment runs ONLY on explicit instruction from the school. FR8-13
 * defines the release sequence (git pull -> build SSR -> migrate --force ->
 * caches -> restart SSR). This makes "never run it proactively" structural
 * rather than something that has to be remembered every session.
 *
 * It also blocks destructive migration commands, which drop the local database.
 *
 * When the school HAS given the instruction, the user runs these themselves in a
 * terminal — the guard is intentionally not something Claude can switch off.
 *
 * SCOPE: these rules exist to protect the SCHOOL'S SERVER, and a developer laptop
 * is not it. On APP_ENV=local the rules are skipped entirely, so building an SSR
 * bundle or reseeding a scratch database is ordinary local work rather than a
 * blocked "release". Anywhere APP_ENV is not local — staging, production, or a
 * missing/unreadable .env — every rule below applies exactly as before, which is
 * what keeps FR8-4 structural where it actually matters.
 */

$input = json_decode((string) stream_get_contents(STDIN), true);

if (! is_array($input)) {
    exit(0);
}

$command = $input['tool_input']['command'] ?? '';

if (! is_string($command) || trim($command) === '') {
    exit(0);
}

/**
 * Reads APP_ENV straight from .env rather than getenv(): the hook runs as its own
 * process and never boots the framework, so the shell it inherits knows nothing
 * about the project. Absent or unreadable .env deliberately reads as "not local",
 * because failing closed is the only safe direction here.
 */
$isLocal = static function (string $root): bool {
    $file = rtrim($root, '/\\').DIRECTORY_SEPARATOR.'.env';

    if (! is_readable($file)) {
        return false;
    }

    $contents = file_get_contents($file);

    if ($contents === false) {
        return false;
    }

    if (preg_match('/^\s*APP_ENV\s*=\s*["\']?([A-Za-z0-9_-]+)/m', $contents, $matches) !== 1) {
        return false;
    }

    return strtolower($matches[1]) === 'local';
};

if ($isLocal((string) ($input['cwd'] ?? getcwd()))) {
    exit(0);
}

$release = <<<'TXT'
    This is part of the FR8-13 release sequence. FR8-4 locks deployment to explicit
    instruction from the school, so it must never run proactively — not to "verify"
    a change, and not as cleanup after one.

    If the school has asked for a release, tell the user and let them run it.
    TXT;

$destructive = <<<'TXT'
    This drops or rewrites the database. Run a forward migration instead, or ask the
    user before destroying local data.
    TXT;

$rules = [
    '#\bmigrate\b[^|;&]*--force#i' => $release,
    '#\bmigrate:(fresh|refresh|reset)\b#i' => $destructive,
    '#\bdb:wipe\b#i' => $destructive,
    '#\bbuild:ssr\b#i' => $release,
    '#\binertia:start-ssr\b#i' => $release,
    '#\bartisan\s+optimize\b(?!:clear)#i' => $release,
    '#\bartisan\s+(config|route|view|event):cache\b#i' => $release,
];

foreach ($rules as $pattern => $reason) {
    if (preg_match($pattern, $command) === 1) {
        fwrite(STDERR, "Blocked: {$command}\n\n".trim($reason));
        exit(2);
    }
}

exit(0);
