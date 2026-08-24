<?php

namespace App\Enums;

/**
 * The two roles from prd-05 §2.
 *
 * Enforcement lives in middleware and policies (FR5-2) — this enum only names
 * the roles; it does not grant anything on its own.
 */
enum UserRole: string
{
    case Superadmin = 'superadmin';
    case Editor = 'editor';

    public function label(): string
    {
        return match ($this) {
            self::Superadmin => 'Superadmin',
            self::Editor => 'Editor',
        };
    }
}
