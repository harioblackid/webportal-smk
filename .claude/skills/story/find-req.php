<?php

declare(strict_types=1);

/*
 * Locate a PRD requirement by ID and print its definition plus every
 * cross-reference to it.
 *
 * Usage: php .claude/skills/story/find-req.php US-018
 *        php .claude/skills/story/find-req.php FR5-2
 *
 * prd/ is gitignored and spread across eight Indonesian-language documents, so
 * resolving an ID by hand means re-reading the set every session. This does it
 * deterministically.
 */

$id = strtoupper(trim($argv[1] ?? ''));

if (preg_match('/^(FR\d+-\d+[A-Z]?|US-\d+)$/', $id) !== 1) {
    fwrite(STDERR, "Usage: php .claude/skills/story/find-req.php <FR5-2|US-018>\n");
    exit(1);
}

$files = glob('prd/*.md') ?: [];

if ($files === []) {
    fwrite(STDERR, "No prd/*.md files found. Run this from the project root.\n");
    exit(1);
}

$isUserStory = str_starts_with($id, 'US-');
$quoted = preg_quote($id, '/');

$definition = null;
$references = [];

foreach ($files as $file) {
    $lines = file($file, FILE_IGNORE_NEW_LINES);

    if ($lines === false) {
        continue;
    }

    foreach ($lines as $index => $line) {
        if (preg_match('/\b'.$quoted.'\b/i', $line) !== 1) {
            continue;
        }

        $definesHere = $isUserStory
            ? preg_match('/^#{1,6}\s*'.$quoted.'\b/i', $line) === 1
            : preg_match('/^\s*[-*]\s*\*\*'.$quoted.':?\*\*/i', $line) === 1;

        if ($definesHere && $definition === null) {
            $definition = [
                'file' => $file,
                'line' => $index + 1,
                'body' => extractBlock($lines, $index, $isUserStory),
            ];

            continue;
        }

        $references[] = [
            'file' => $file,
            'line' => $index + 1,
            'text' => trim($line),
        ];
    }
}

if ($definition === null) {
    fwrite(STDERR, "{$id} is not defined in prd/. Check the ID, or search prd/prd-00-index.md for the right one.\n");

    if ($references !== []) {
        fwrite(STDERR, "\nIt is mentioned here though:\n");

        foreach ($references as $reference) {
            fwrite(STDERR, "  {$reference['file']}:{$reference['line']}  {$reference['text']}\n");
        }
    }

    exit(1);
}

echo "=== {$id} — defined at {$definition['file']}:{$definition['line']} ===\n\n";
echo $definition['body']."\n";

$checkboxes = preg_match_all('/^\s*-\s*\[[ x]\]/mi', $definition['body']);

if ($checkboxes > 0) {
    echo "\n=== Acceptance checkboxes: {$checkboxes} ===\n";
    echo "Every one of these must be verified before this requirement is called done.\n";
} else {
    echo "\n=== No acceptance checkboxes ===\n";
    echo "This is a functional requirement, not a user story. Find the user stories that\n";
    echo "implement it — their checkboxes are what gets verified.\n";
}

if ($references !== []) {
    echo "\n=== Cross-references (".count($references).") ===\n";

    foreach ($references as $reference) {
        echo "{$reference['file']}:{$reference['line']}\n  {$reference['text']}\n";
    }
}

/**
 * Pull the requirement's own block out of the document.
 *
 * User stories are `### US-018: Title` headings and run until the next heading.
 * Functional requirements are `- **FR5-2:** …` list items that may wrap onto
 * indented continuation lines, and run until the next requirement or heading.
 *
 * @param  list<string>  $lines
 */
function extractBlock(array $lines, int $start, bool $isUserStory): string
{
    $block = [$lines[$start]];
    $total = count($lines);

    for ($i = $start + 1; $i < $total; $i++) {
        $line = $lines[$i];

        if ($isUserStory) {
            if (preg_match('/^#{1,6}\s/', $line) === 1) {
                break;
            }
        } else {
            $nextRequirement = preg_match('/^\s*[-*]\s*\*\*(FR|US)[\d-]/i', $line) === 1;
            $nextHeading = preg_match('/^#{1,6}\s/', $line) === 1;

            if ($nextRequirement || $nextHeading) {
                break;
            }
        }

        $block[] = $line;
    }

    return rtrim(implode("\n", $block));
}
