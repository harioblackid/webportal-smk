<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pengguna (prd-05 §3.8) — Superadmin only, gated by the route group.
 *
 * FR5-3 keeps registration out of the public site, so this is the only place
 * an account comes from.
 */
class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->value,
                    'roleLabel' => $user->role->label(),
                    'createdAtLabel' => $user->created_at?->translatedFormat('j M Y'),
                ])
                ->all(),
            'roles' => self::roles(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/form', [
            'user' => null,
            'roles' => self::roles(),
        ]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        // 'password' => 'hashed' on the model does the bcrypt (FR5-4).
        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $data['role'],
        ]);

        return to_route('admin.users.index')
            ->with('success', 'Akun "'.$user->name.'" dibuat.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/form', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                // FR5-21: the form disables the role selector for this case
                // rather than letting the server reject the save afterwards.
                'isLastSuperadmin' => $user->isSuperadmin() && self::superadminCount() <= 1,
            ],
            'roles' => self::roles(),
        ]);
    }

    public function update(UserRequest $request, User $user): RedirectResponse
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        // Demoting the only Superadmin locks everyone out of Jurusan,
        // Pengaturan, and this very page — the same failure FR5-21 guards
        // against, reached by a different button.
        if ($this->wouldLoseLastSuperadmin($user, UserRole::from((string) $data['role']))) {
            return back()->with('error', 'Superadmin terakhir tidak dapat diturunkan menjadi Editor.');
        }

        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
        ]);

        // Blank means "leave the password alone" (see UserRequest).
        $password = (string) ($data['password'] ?? '');

        if ($password !== '') {
            $user->password = $password;
        }

        $user->save();

        return to_route('admin.users.index')
            ->with('success', 'Akun "'.$user->name.'" diperbarui.');
    }

    /** FR5-21 — the last Superadmin cannot be deleted. */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($request->user()?->is($user)) {
            return back()->with('error', 'Anda tidak dapat menghapus akun yang sedang dipakai.');
        }

        if ($user->isSuperadmin() && self::superadminCount() <= 1) {
            return back()->with('error', 'Superadmin terakhir tidak dapat dihapus.');
        }

        $user->delete();

        return to_route('admin.users.index')
            ->with('success', 'Akun "'.$user->name.'" dihapus.');
    }

    private function wouldLoseLastSuperadmin(User $user, UserRole $role): bool
    {
        return $user->isSuperadmin()
            && $role !== UserRole::Superadmin
            && self::superadminCount() <= 1;
    }

    private static function superadminCount(): int
    {
        return User::query()->where('role', UserRole::Superadmin)->count();
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private static function roles(): array
    {
        return array_map(
            fn (UserRole $role) => ['value' => $role->value, 'label' => $role->label()],
            UserRole::cases(),
        );
    }
}
