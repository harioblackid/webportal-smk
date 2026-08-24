<?php

namespace App\Http\Resources;

use App\Models\Major;
use Illuminate\Http\Request;

/**
 * FR4-16a — the detail payload: full description plus the optional extra
 * block (kompetensi/prospek).
 *
 * @mixin Major
 */
class MajorResource extends MajorCardResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'description' => $this->description,
            'extra' => $this->extra,
        ];
    }
}
