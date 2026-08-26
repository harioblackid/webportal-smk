<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$base = null;
$dir = __DIR__;

for ($level = 0; $level < 5 && $base === null; $level++) {
    foreach ([$dir, $dir.'/laravel'] as $candidate) {
        if (is_file($candidate.'/vendor/autoload.php')) {
            $base = $candidate;

            break;
        }
    }

    $dir = dirname($dir);
}

if ($base === null) {
    http_response_code(500);

    exit('Aplikasi tidak dapat dimuat.');
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $base.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $base.'/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $base.'/bootstrap/app.php';

$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
