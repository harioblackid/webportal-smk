<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Baris Bahasa Validasi
    |--------------------------------------------------------------------------
    |
    | Terjemahan penuh berkas validasi bawaan Laravel (FR2-2). Diterjemahkan
    | seluruhnya, bukan sebagian, agar tidak ada pesan yang tiba-tiba muncul
    | dalam Bahasa Inggris di tengah antarmuka berbahasa Indonesia.
    |
    | Nama kolom yang ramah dibaca diatur pada bagian `attributes` di bawah.
    |
    */

    'accepted' => 'Kolom :attribute harus disetujui.',
    'accepted_if' => 'Kolom :attribute harus disetujui bila :other bernilai :value.',
    'active_url' => 'Kolom :attribute harus berupa URL yang aktif.',
    'after' => 'Kolom :attribute harus berisi tanggal setelah :date.',
    'after_or_equal' => 'Kolom :attribute harus berisi tanggal setelah atau sama dengan :date.',
    'alpha' => 'Kolom :attribute hanya boleh berisi huruf.',
    'alpha_dash' => 'Kolom :attribute hanya boleh berisi huruf, angka, tanda hubung, dan garis bawah.',
    'alpha_num' => 'Kolom :attribute hanya boleh berisi huruf dan angka.',
    'any_of' => 'Kolom :attribute tidak valid.',
    'array' => 'Kolom :attribute harus berupa larik.',
    'array_keys' => 'Kolom :attribute hanya boleh memuat kunci berikut: :values.',
    'ascii' => 'Kolom :attribute hanya boleh berisi karakter dan simbol alfanumerik satu byte.',
    'base64' => 'Kolom :attribute harus berupa teks Base64 yang valid.',
    'before' => 'Kolom :attribute harus berisi tanggal sebelum :date.',
    'before_or_equal' => 'Kolom :attribute harus berisi tanggal sebelum atau sama dengan :date.',
    'between' => [
        'array' => 'Kolom :attribute harus berisi antara :min sampai :max item.',
        'file' => 'Berkas :attribute harus berukuran antara :min sampai :max kilobita.',
        'numeric' => 'Kolom :attribute harus bernilai antara :min sampai :max.',
        'string' => 'Kolom :attribute harus terdiri dari :min sampai :max karakter.',
    ],
    'boolean' => 'Kolom :attribute harus bernilai benar atau salah.',
    'can' => 'Kolom :attribute memuat nilai yang tidak diizinkan.',
    'confirmed' => 'Konfirmasi :attribute tidak cocok.',
    'contains' => 'Kolom :attribute belum memuat nilai yang diwajibkan.',
    'current_password' => 'Kata sandi salah.',
    'date' => 'Kolom :attribute harus berisi tanggal yang valid.',
    'date_equals' => 'Kolom :attribute harus berisi tanggal yang sama dengan :date.',
    'date_format' => 'Kolom :attribute harus sesuai format :format.',
    'decimal' => 'Kolom :attribute harus memiliki :decimal angka di belakang koma.',
    'declined' => 'Kolom :attribute harus ditolak.',
    'declined_if' => 'Kolom :attribute harus ditolak bila :other bernilai :value.',
    'different' => 'Kolom :attribute dan :other harus berbeda.',
    'digits' => 'Kolom :attribute harus terdiri dari :digits angka.',
    'digits_between' => 'Kolom :attribute harus terdiri dari :min sampai :max angka.',
    'dimensions' => 'Dimensi gambar pada :attribute tidak valid.',
    'distinct' => 'Kolom :attribute memuat nilai yang sama dua kali.',
    'doesnt_contain' => 'Kolom :attribute tidak boleh memuat salah satu dari: :values.',
    'doesnt_end_with' => 'Kolom :attribute tidak boleh diakhiri salah satu dari: :values.',
    'doesnt_start_with' => 'Kolom :attribute tidak boleh diawali salah satu dari: :values.',
    'email' => 'Kolom :attribute harus berupa alamat email yang valid.',
    'encoding' => 'Kolom :attribute harus memakai enkode :encoding.',
    'ends_with' => 'Kolom :attribute harus diakhiri salah satu dari: :values.',
    'enum' => 'Pilihan :attribute tidak valid.',
    'exists' => 'Pilihan :attribute tidak valid.',
    'extensions' => 'Berkas :attribute harus berekstensi salah satu dari: :values.',
    'file' => 'Kolom :attribute harus berupa berkas.',
    'filled' => 'Kolom :attribute wajib diisi.',
    'gt' => [
        'array' => 'Kolom :attribute harus berisi lebih dari :value item.',
        'file' => 'Berkas :attribute harus lebih besar dari :value kilobita.',
        'numeric' => 'Kolom :attribute harus bernilai lebih dari :value.',
        'string' => 'Kolom :attribute harus terdiri dari lebih dari :value karakter.',
    ],
    'gte' => [
        'array' => 'Kolom :attribute harus berisi :value item atau lebih.',
        'file' => 'Berkas :attribute harus berukuran :value kilobita atau lebih.',
        'numeric' => 'Kolom :attribute harus bernilai :value atau lebih.',
        'string' => 'Kolom :attribute harus terdiri dari :value karakter atau lebih.',
    ],
    'hex_color' => 'Kolom :attribute harus berupa kode warna heksadesimal yang valid.',
    'image' => 'Kolom :attribute harus berupa gambar.',
    'in' => 'Pilihan :attribute tidak valid.',
    'in_array' => 'Kolom :attribute harus ada di dalam :other.',
    'in_array_keys' => 'Kolom :attribute harus memuat sedikitnya satu kunci berikut: :values.',
    'integer' => 'Kolom :attribute harus berupa bilangan bulat.',
    'ip' => 'Kolom :attribute harus berupa alamat IP yang valid.',
    'ipv4' => 'Kolom :attribute harus berupa alamat IPv4 yang valid.',
    'ipv6' => 'Kolom :attribute harus berupa alamat IPv6 yang valid.',
    'json' => 'Kolom :attribute harus berupa teks JSON yang valid.',
    'list' => 'Kolom :attribute harus berupa daftar.',
    'lowercase' => 'Kolom :attribute harus ditulis dengan huruf kecil.',
    'lt' => [
        'array' => 'Kolom :attribute harus berisi kurang dari :value item.',
        'file' => 'Berkas :attribute harus lebih kecil dari :value kilobita.',
        'numeric' => 'Kolom :attribute harus bernilai kurang dari :value.',
        'string' => 'Kolom :attribute harus terdiri dari kurang dari :value karakter.',
    ],
    'lte' => [
        'array' => 'Kolom :attribute tidak boleh berisi lebih dari :value item.',
        'file' => 'Berkas :attribute tidak boleh lebih besar dari :value kilobita.',
        'numeric' => 'Kolom :attribute tidak boleh bernilai lebih dari :value.',
        'string' => 'Kolom :attribute tidak boleh lebih dari :value karakter.',
    ],
    'mac_address' => 'Kolom :attribute harus berupa alamat MAC yang valid.',
    'max' => [
        'array' => 'Kolom :attribute tidak boleh berisi lebih dari :max item.',
        'file' => 'Berkas :attribute tidak boleh lebih besar dari :max kilobita.',
        'numeric' => 'Kolom :attribute tidak boleh bernilai lebih dari :max.',
        'string' => 'Kolom :attribute tidak boleh lebih dari :max karakter.',
    ],
    'max_digits' => 'Kolom :attribute tidak boleh terdiri dari lebih dari :max angka.',
    'mimes' => 'Kolom :attribute harus berupa berkas bertipe: :values.',
    'mimetypes' => 'Kolom :attribute harus berupa berkas bertipe: :values.',
    'min' => [
        'array' => 'Kolom :attribute harus berisi sedikitnya :min item.',
        'file' => 'Berkas :attribute harus berukuran sedikitnya :min kilobita.',
        'numeric' => 'Kolom :attribute harus bernilai sedikitnya :min.',
        'string' => 'Kolom :attribute harus terdiri dari sedikitnya :min karakter.',
    ],
    'min_digits' => 'Kolom :attribute harus terdiri dari sedikitnya :min angka.',
    'missing' => 'Kolom :attribute tidak boleh ada.',
    'missing_if' => 'Kolom :attribute tidak boleh ada bila :other bernilai :value.',
    'missing_unless' => 'Kolom :attribute tidak boleh ada kecuali :other bernilai :value.',
    'missing_with' => 'Kolom :attribute tidak boleh ada bila :values terisi.',
    'missing_with_all' => 'Kolom :attribute tidak boleh ada bila :values semuanya terisi.',
    'multiple_of' => 'Kolom :attribute harus merupakan kelipatan :value.',
    'not_in' => 'Pilihan :attribute tidak valid.',
    'not_regex' => 'Format kolom :attribute tidak valid.',
    'numeric' => 'Kolom :attribute harus berupa angka.',
    'password' => [
        'letters' => 'Kolom :attribute harus memuat sedikitnya satu huruf.',
        'mixed' => 'Kolom :attribute harus memuat sedikitnya satu huruf besar dan satu huruf kecil.',
        'numbers' => 'Kolom :attribute harus memuat sedikitnya satu angka.',
        'symbols' => 'Kolom :attribute harus memuat sedikitnya satu simbol.',
        'uncompromised' => 'Kolom :attribute pernah muncul dalam kebocoran data. Silakan pilih nilai lain.',
    ],
    'present' => 'Kolom :attribute harus ada.',
    'present_if' => 'Kolom :attribute harus ada bila :other bernilai :value.',
    'present_unless' => 'Kolom :attribute harus ada kecuali :other bernilai :value.',
    'present_with' => 'Kolom :attribute harus ada bila :values terisi.',
    'present_with_all' => 'Kolom :attribute harus ada bila :values semuanya terisi.',
    'prohibited' => 'Kolom :attribute tidak diizinkan.',
    'prohibited_if' => 'Kolom :attribute tidak diizinkan bila :other bernilai :value.',
    'prohibited_if_accepted' => 'Kolom :attribute tidak diizinkan bila :other disetujui.',
    'prohibited_if_declined' => 'Kolom :attribute tidak diizinkan bila :other ditolak.',
    'prohibited_unless' => 'Kolom :attribute tidak diizinkan kecuali :other bernilai salah satu dari :values.',
    'prohibits' => 'Kolom :attribute membuat :other tidak boleh diisi.',
    'regex' => 'Format kolom :attribute tidak valid.',
    'required' => 'Kolom :attribute wajib diisi.',
    'required_array_keys' => 'Kolom :attribute harus memuat entri untuk: :values.',
    'required_if' => 'Kolom :attribute wajib diisi bila :other bernilai :value.',
    'required_if_accepted' => 'Kolom :attribute wajib diisi bila :other disetujui.',
    'required_if_declined' => 'Kolom :attribute wajib diisi bila :other ditolak.',
    'required_unless' => 'Kolom :attribute wajib diisi kecuali :other bernilai salah satu dari :values.',
    'required_with' => 'Kolom :attribute wajib diisi bila :values terisi.',
    'required_with_all' => 'Kolom :attribute wajib diisi bila :values semuanya terisi.',
    'required_without' => 'Kolom :attribute wajib diisi bila :values tidak terisi.',
    'required_without_all' => 'Kolom :attribute wajib diisi bila tidak satu pun dari :values terisi.',
    'same' => 'Kolom :attribute harus sama dengan :other.',
    'size' => [
        'array' => 'Kolom :attribute harus berisi tepat :size item.',
        'file' => 'Berkas :attribute harus berukuran tepat :size kilobita.',
        'numeric' => 'Kolom :attribute harus bernilai tepat :size.',
        'string' => 'Kolom :attribute harus terdiri dari tepat :size karakter.',
    ],
    'starts_with' => 'Kolom :attribute harus diawali salah satu dari: :values.',
    'string' => 'Kolom :attribute harus berupa teks.',
    'timezone' => 'Kolom :attribute harus berupa zona waktu yang valid.',
    'unique' => ':attribute sudah digunakan.',
    'uploaded' => 'Berkas :attribute gagal diunggah.',
    'uppercase' => 'Kolom :attribute harus ditulis dengan huruf besar.',
    'url' => 'Kolom :attribute harus berupa URL yang valid.',
    'ulid' => 'Kolom :attribute harus berupa ULID yang valid.',
    'uuid' => 'Kolom :attribute harus berupa UUID yang valid.',

    /*
    |--------------------------------------------------------------------------
    | Pesan Validasi Khusus
    |--------------------------------------------------------------------------
    |
    | Konvensi penamaannya "nama-kolom.nama-aturan".
    |
    */

    'custom' => [],

    /*
    |--------------------------------------------------------------------------
    | Nama Kolom yang Ramah Dibaca
    |--------------------------------------------------------------------------
    |
    | Menggantikan nama kolom mentah pada pesan di atas, sehingga muncul
    | "Kolom kata sandi wajib diisi", bukan "Kolom password wajib diisi".
    |
    */

    'attributes' => [
        'email' => 'email',
        'password' => 'kata sandi',
        'password_confirmation' => 'konfirmasi kata sandi',
        'name' => 'nama',
        'role' => 'role',
        'title' => 'judul',
        'slug' => 'slug',
        'excerpt' => 'ringkasan',
        'body' => 'isi',
        'category_id' => 'kategori',
        'status' => 'status',
        'published_at' => 'tanggal terbit',
        'alt' => 'teks alternatif',
        'sort_order' => 'urutan',
        'is_active' => 'status aktif',
    ],

];
