<?php

namespace App\Support;

use App\Models\SchoolIdentity;
use Illuminate\Validation\Rule;

/**
 * The catalogue of `school_id` fields — one declaration that the admin form,
 * the validator, and the public page all read.
 *
 * Written down once on purpose: a field added here appears in the form, gets
 * validated, and shows up on /profil/identitas without touching three places
 * that could then disagree about which keys exist.
 */
class SchoolIdentityFields
{
    /**
     * Fields whose values read as one line on the public page.
     *
     * head => [partner, combined label]. When both are filled they render as
     * "NPSN / NSS: 12345 / 678"; when only one is, it keeps its own label.
     *
     * @var array<string, array{string, string}>
     */
    private const PAIRS = [
        'npsn' => ['nss', 'NPSN / NSS'],
        'rt' => ['rw', 'RT / RW'],
        'lintang' => ['bujur', 'Lintang / Bujur'],
    ];

    /**
     * @var array<string, array{label: string, fields: array<string, array<string, mixed>>}>
     */
    private const GROUPS = [
        'identitas' => [
            'label' => 'A. Identitas Sekolah',
            'fields' => [
                'nama_sekolah' => ['label' => 'Nama Sekolah', 'required' => true, 'max' => 120],
                'npsn' => ['label' => 'NPSN', 'max' => 20],
                'nss' => ['label' => 'NSS', 'max' => 20],
                'jenjang_pendidikan' => [
                    'label' => 'Jenjang Pendidikan',
                    'required' => true,
                    'type' => 'select',
                    'options' => ['SD', 'SMP', 'SMA', 'SMK'],
                ],
                'status_sekolah' => [
                    'label' => 'Status Sekolah',
                    'required' => true,
                    'type' => 'select',
                    'options' => ['Negeri', 'Swasta'],
                ],
            ],
        ],
        'lokasi' => [
            'label' => 'B. Lokasi Sekolah',
            'fields' => [
                'alamat' => ['label' => 'Alamat', 'required' => true, 'type' => 'textarea', 'max' => 300],
                'rt' => ['label' => 'RT', 'max' => 5],
                'rw' => ['label' => 'RW', 'max' => 5],
                'desa_kelurahan' => ['label' => 'Desa/Kelurahan', 'max' => 100],
                'kode_pos' => ['label' => 'Kode Pos', 'max' => 10],
                'kecamatan' => ['label' => 'Kecamatan', 'max' => 100],
                'kabupaten_kota' => ['label' => 'Kabupaten/Kota', 'max' => 100],
                'lintang' => [
                    'label' => 'Lintang',
                    'max' => 30,
                    'hint' => 'Contoh: -6.284712. Dipakai peta halaman Kontak bila mode koordinat dipilih.',
                ],
                'bujur' => ['label' => 'Bujur', 'max' => 30, 'hint' => 'Contoh: 107.406319.'],
            ],
        ],
        'pelengkap' => [
            'label' => 'C. Data Pelengkap Sekolah',
            'fields' => [
                'status_kepemilikan' => [
                    'label' => 'Status Kepemilikan',
                    'required' => true,
                    'type' => 'select',
                    'options' => ['Pemerintah Daerah', 'Yayasan'],
                ],
                'sk_izin_operasional' => ['label' => 'SK Izin Operasional', 'max' => 100],
                'tgl_sk_izin_operasional' => ['label' => 'Tgl SK Izin Operasional', 'type' => 'date'],
                'sk_akreditasi' => ['label' => 'SK Akreditasi', 'max' => 100],
                'tgl_sk_akreditasi' => ['label' => 'Tgl SK Akreditasi', 'type' => 'date'],
                'luas_tanah' => ['label' => 'Luas Tanah', 'type' => 'number', 'max' => 20, 'suffix' => 'm2'],
                'status_tanah' => ['label' => 'Status Tanah', 'max' => 100],
            ],
        ],
        'kontak' => [
            'label' => 'D. Kontak Sekolah',
            'fields' => [
                'nomor_telepon' => ['label' => 'Nomor Telepon', 'required' => true, 'type' => 'tel', 'max' => 40],
                'email' => ['label' => 'Email', 'required' => true, 'type' => 'email', 'max' => 120],
            ],
        ],
        'periodik' => [
            'label' => 'E. Data Periodik',
            'fields' => [
                'daya_listrik' => ['label' => 'Daya Listrik', 'max' => 50],
                'akses_internet' => ['label' => 'Akses Internet', 'max' => 100],
                'akreditasi' => ['label' => 'Akreditasi', 'max' => 10, 'hint' => 'Peringkat saja, mis. A.'],
                'waktu_penyelenggaraan' => [
                    'label' => 'Waktu Penyelenggaraan',
                    'required' => true,
                    'type' => 'select',
                    'options' => ['Full Time', '2 Shift'],
                ],
                'sumber_listrik' => ['label' => 'Sumber Listrik', 'max' => 50],
            ],
        ],
    ];

    /**
     * Every key the form owns, in declaration order.
     *
     * @return list<string>
     */
    public static function keys(): array
    {
        $keys = [];

        foreach (self::GROUPS as $group) {
            foreach (array_keys($group['fields']) as $key) {
                $keys[] = $key;
            }
        }

        return $keys;
    }

    /**
     * The group/field tree the admin form renders.
     *
     * @return list<array{key: string, label: string, fields: list<array<string, mixed>>}>
     */
    public static function formGroups(): array
    {
        $groups = [];

        foreach (self::GROUPS as $groupKey => $group) {
            $fields = [];

            foreach ($group['fields'] as $key => $field) {
                $fields[] = self::describe($key, $field);
            }

            $groups[] = ['key' => $groupKey, 'label' => $group['label'], 'fields' => $fields];
        }

        return $groups;
    }

    /**
     * The current values keyed by field, blanks normalised to null.
     *
     * @return array<string, string|null>
     */
    public static function all(): array
    {
        $values = SchoolIdentity::values();
        $result = [];

        foreach (self::keys() as $key) {
            $result[$key] = self::clean($values[$key] ?? null);
        }

        return $result;
    }

    /**
     * The public page's payload: only fields that actually have a value.
     *
     * This is where "jika terdapat field yang kosong jangan tampilkan pada
     * public" is enforced — once, rather than as a conditional per row in the
     * page component. A group whose fields are all blank disappears entirely.
     *
     * @return list<array{label: string, rows: list<array{label: string, value: string}>}>
     */
    public static function publicGroups(): array
    {
        $values = self::all();
        $groups = [];

        foreach (self::GROUPS as $group) {
            $rows = [];
            $skip = [];

            foreach ($group['fields'] as $key => $field) {
                if (in_array($key, $skip, true)) {
                    continue;
                }

                $value = $values[$key] ?? null;
                $suffix = isset($field['suffix']) ? ' '.$field['suffix'] : '';

                if (isset(self::PAIRS[$key])) {
                    [$partner, $pairLabel] = self::PAIRS[$key];
                    $partnerValue = $values[$partner] ?? null;
                    $skip[] = $partner;

                    if ($value !== null && $partnerValue !== null) {
                        $rows[] = ['label' => $pairLabel, 'value' => $value.' / '.$partnerValue];

                        continue;
                    }

                    if ($value === null && $partnerValue !== null) {
                        $partnerField = $group['fields'][$partner] ?? [];
                        $rows[] = [
                            'label' => (string) ($partnerField['label'] ?? $partner),
                            'value' => $partnerValue,
                        ];
                    }
                }

                if ($value === null) {
                    continue;
                }

                $rows[] = ['label' => $field['label'], 'value' => $value.$suffix];
            }

            if ($rows !== []) {
                $groups[] = ['label' => $group['label'], 'rows' => $rows];
            }
        }

        return $groups;
    }

    /**
     * Lintang/bujur as floats, or null when either is missing or not a number.
     *
     * @return array{lat: float, lng: float}|null
     */
    public static function coordinates(): ?array
    {
        $values = self::all();
        $lat = $values['lintang'] ?? null;
        $lng = $values['bujur'] ?? null;

        if ($lat === null || $lng === null || ! is_numeric($lat) || ! is_numeric($lng)) {
            return null;
        }

        return ['lat' => (float) $lat, 'lng' => (float) $lng];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        $rules = [];

        foreach (self::GROUPS as $group) {
            foreach ($group['fields'] as $key => $field) {
                $described = self::describe($key, $field);
                $presence = $described['required'] ? 'required' : 'nullable';

                if ($described['options'] !== []) {
                    $rules[$key] = [$presence, 'string', Rule::in($described['options'])];

                    continue;
                }

                $rule = [$presence];

                $rule[] = match ($described['type']) {
                    'email' => 'email',
                    'date' => 'date',
                    'number' => 'numeric',
                    default => 'string',
                };

                if ($described['type'] !== 'date') {
                    $rule[] = 'max:'.$described['max'];
                }

                $rules[$key] = $rule;
            }
        }

        return $rules;
    }

    /**
     * Indonesian names so validation messages read like the form does.
     *
     * @return array<string, string>
     */
    public static function attributes(): array
    {
        $attributes = [];

        foreach (self::GROUPS as $group) {
            foreach ($group['fields'] as $key => $field) {
                $attributes[$key] = mb_strtolower($field['label']);
            }
        }

        return $attributes;
    }

    /**
     * @param  array<string, mixed>  $field
     * @return array{key: string, label: string, type: string, required: bool, max: int, options: list<string>, suffix: string|null, hint: string|null}
     */
    private static function describe(string $key, array $field): array
    {
        /** @var list<string> $options */
        $options = array_values(array_map(strval(...), (array) ($field['options'] ?? [])));

        return [
            'key' => $key,
            'label' => (string) ($field['label'] ?? $key),
            'type' => (string) ($field['type'] ?? 'text'),
            'required' => (bool) ($field['required'] ?? false),
            'max' => (int) ($field['max'] ?? 255),
            'options' => $options,
            'suffix' => isset($field['suffix']) ? (string) $field['suffix'] : null,
            'hint' => isset($field['hint']) ? (string) $field['hint'] : null,
        ];
    }

    private static function clean(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
