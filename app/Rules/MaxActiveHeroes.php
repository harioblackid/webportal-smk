<?php

namespace App\Rules;

use App\Models\Hero;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Caps how many hero slides may be active at once (Hero::MAX_ACTIVE).
 *
 * Enforced on the server, not by disabling the checkbox: the limit exists to
 * protect the LCP budget on the front page, and a budget that only a form
 * respects is not a budget.
 */
class MaxActiveHeroes implements ValidationRule
{
    /** @param  int|null  $ignoreId  the hero being edited, which is counted once */
    public function __construct(private readonly ?int $ignoreId = null) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! filter_var($value, FILTER_VALIDATE_BOOLEAN)) {
            return;
        }

        $others = Hero::query()
            ->active()
            ->when($this->ignoreId !== null, fn ($query) => $query->whereKeyNot($this->ignoreId))
            ->count();

        if ($others >= Hero::MAX_ACTIVE) {
            $fail(
                'Maksimal '.Hero::MAX_ACTIVE.' hero yang boleh aktif bersamaan. '
                .'Nonaktifkan salah satu lebih dulu.'
            );
        }
    }
}
