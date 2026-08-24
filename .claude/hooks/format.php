<?php

declare(strict_types=1);

/*
 * PostToolUse formatter for Edit / Write.
 *
 * `composer ci:check` runs eslint + prettier + phpstan before the test suite, so
 * a formatting deviation breaks CI exactly like a failing test. This applies the
 * project's own formatters to the one file that just changed.
 *
 * Binaries are invoked through their real entrypoints rather than npx/vendor
 * shims so the hook behaves the same on Windows, macOS, and CI.
 */

$input = json_decode((string) stream_get_contents(STDIN), true);

if (! is_array($input)) {
    exit(0);
}

$path = $input['tool_input']['file_path'] ?? '';

if (! is_string($path) || $path === '' || ! is_file($path)) {
    exit(0);
}

$normalise = static fn (string $p): string => str_replace('\\', '/', $p);

$path = $normalise($path);
$root = rtrim($normalise((string) ($input['cwd'] ?? getcwd())), '/');

// Only touch files inside the project — scratchpad and temp files are not ours.
if (! str_starts_with(strtolower($path), strtolower($root).'/')) {
    exit(0);
}

$pint = $root.'/vendor/laravel/pint/builds/pint';
$prettier = $root.'/node_modules/prettier/bin/prettier.cjs';
$eslint = $root.'/node_modules/eslint/bin/eslint.js';

/**
 * @param  list<string>  $parts
 * @return array{0: int, 1: string}
 */
$run = static function (array $parts) use ($root): array {
    $cmd = implode(' ', array_map(escapeshellarg(...), $parts));
    $output = [];
    $code = 0;

    $previous = getcwd();
    chdir($root);
    exec($cmd.' 2>&1', $output, $code);

    if (is_string($previous)) {
        chdir($previous);
    }

    return [$code, implode("\n", $output)];
};

$extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
$isBlade = str_ends_with(strtolower($path), '.blade.php');

$problems = [];

if ($extension === 'php' && ! $isBlade && is_file($pint)) {
    // Blade is deliberately excluded — Pint is a PHP formatter and will mangle it.
    $run(['php', $pint, $path]);
}

if (in_array($extension, ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'css', 'json'], true)) {
    if (is_file($prettier)) {
        $run(['node', $prettier, '--write', '--ignore-unknown', $path]);
    }

    if (is_file($eslint) && $extension !== 'css' && $extension !== 'json') {
        // Prettier runs first so ESLint only reports what formatting cannot fix.
        [$code, $output] = $run(['node', $eslint, '--fix', $path]);

        if ($code !== 0 && $output !== '') {
            $problems[] = $output;
        }
    }
}

if ($problems === []) {
    exit(0);
}

// Surface what auto-fix could not resolve; CI will fail on these otherwise.
$report = implode("\n", $problems);
$lines = explode("\n", $report);

if (count($lines) > 40) {
    $lines = array_slice($lines, 0, 40);
    $lines[] = '… (truncated)';
}

fwrite(STDERR, "ESLint problems remain after --fix:\n\n".implode("\n", $lines));
exit(2);
