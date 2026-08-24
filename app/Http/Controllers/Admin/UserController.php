<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Superadmin-only surface (prd-05 §2). Full CRUD is US-016 — this listing
 * exists so the role boundary from FR5-2 is real and testable today.
 */
class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->select(['id', 'name', 'email', 'role', 'created_at'])
                ->orderBy('name')
                ->get(),
        ]);
    }
}
