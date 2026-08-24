import { Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import { buttonClasses } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import {
    create as createHero,
    destroy as destroyHero,
    edit as editHero,
} from '@/routes/admin/heroes';
import type { HeroRow } from '@/types';

type HeroesIndexProps = {
    heroes: HeroRow[];
};

/** US-013 — daftar hero; yang aktif adalah yang tampil di halaman depan. */
export default function HeroesIndex({ heroes }: HeroesIndexProps) {
    return (
        <AdminLayout
            title="Hero halaman depan"
            actions={
                <Link href={createHero()} className={buttonClasses()}>
                    <Plus className="size-4" aria-hidden="true" />
                    Tambah hero
                </Link>
            }
        >
            <p className="text-sm text-charcoal">
                Hanya satu hero yang aktif. Mengaktifkan satu hero otomatis
                menonaktifkan yang lain, dan perubahannya langsung tampil di
                halaman depan.
            </p>

            {heroes.length === 0 ? (
                <p className="mt-6 text-sm text-charcoal">
                    Belum ada hero — halaman depan memakai tampilan bawaan.
                </p>
            ) : (
                <ul className="mt-6 space-y-3">
                    {heroes.map((hero) => (
                        <li
                            key={hero.id}
                            className="flex flex-wrap items-center gap-4 rounded-xl border border-charcoal/15 p-4"
                        >
                            {hero.thumbUrl === null ? (
                                <div className="size-16 shrink-0 rounded-lg bg-mist" />
                            ) : (
                                <img
                                    src={hero.thumbUrl}
                                    alt=""
                                    className="size-16 shrink-0 rounded-lg object-cover"
                                />
                            )}

                            <div className="min-w-40 flex-1">
                                <p className="font-medium text-onyx">
                                    {hero.title}
                                </p>
                                {hero.subtitle === null ? null : (
                                    <p className="text-sm text-charcoal">
                                        {hero.subtitle}
                                    </p>
                                )}
                            </div>

                            <span
                                className={
                                    hero.isActive
                                        ? 'rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand'
                                        : 'rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-charcoal'
                                }
                            >
                                {hero.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>

                            <div className="flex items-center gap-1">
                                <Link
                                    href={editHero(hero.id)}
                                    aria-label={`Edit ${hero.title}`}
                                    className="inline-flex size-11 items-center justify-center rounded-lg text-charcoal hover:bg-mist hover:text-onyx"
                                >
                                    <Pencil
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </Link>

                                <ConfirmDelete
                                    url={destroyHero.url(hero.id)}
                                    label={hero.title}
                                    title="Hapus hero ini?"
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </AdminLayout>
    );
}
