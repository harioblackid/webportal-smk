import { Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import {
    create as createHero,
    destroy as destroyHero,
    edit as editHero,
} from '@/routes/admin/heroes';
import type { HeroRow } from '@/types';

type HeroesIndexProps = {
    heroes: HeroRow[];
    /** Hero::MAX_ACTIVE — the carousel's slide budget. */
    maxActive: number;
    activeCount: number;
};

/**
 * Daftar hero. Yang aktif menjadi slide carousel di halaman depan, diurutkan
 * menurut kolom urutan.
 */
export default function HeroesIndex({
    heroes,
    maxActive,
    activeCount,
}: HeroesIndexProps) {
    return (
        <AdminLayout
            title="Hero halaman depan"
            actions={
                <Link href={createHero()} className={buttonVariants()}>
                    <Plus className="size-4" aria-hidden="true" />
                    Tambah hero
                </Link>
            }
        >
            <p className="text-sm text-muted-foreground">
                Hero yang aktif tampil sebagai slide carousel di halaman depan,
                diurutkan menurut kolom urutan. Maksimal {maxActive} hero boleh
                aktif bersamaan — saat ini {activeCount} aktif. Perubahan
                langsung tampil, tanpa deploy ulang.
            </p>

            {heroes.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                    Belum ada hero — halaman depan memakai tampilan bawaan.
                </p>
            ) : (
                <ul className="mt-6 space-y-3">
                    {heroes.map((hero) => (
                        <li
                            key={hero.id}
                            className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-4"
                        >
                            {hero.thumbUrl === null ? (
                                <div className="size-16 shrink-0 rounded-lg bg-muted" />
                            ) : (
                                <img
                                    src={hero.thumbUrl}
                                    alt=""
                                    className="size-16 shrink-0 rounded-lg object-cover"
                                />
                            )}

                            <div className="min-w-40 flex-1">
                                <p className="font-medium text-foreground">
                                    <span className="mr-2 text-muted-foreground">
                                        #{hero.sortOrder}
                                    </span>
                                    {hero.title}
                                </p>
                                {hero.subtitle === null ? null : (
                                    <p className="text-sm text-muted-foreground">
                                        {hero.subtitle}
                                    </p>
                                )}
                                {hero.postTitle === null ? null : (
                                    <p className="text-xs text-muted-foreground">
                                        Tertaut ke berita: {hero.postTitle}
                                    </p>
                                )}
                            </div>

                            <Badge
                                variant={
                                    hero.isActive ? 'default' : 'secondary'
                                }
                            >
                                {hero.isActive ? 'Aktif' : 'Nonaktif'}
                            </Badge>

                            <div className="flex items-center gap-1">
                                <Link
                                    href={editHero(hero.id)}
                                    aria-label={`Edit ${hero.title}`}
                                    className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
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
