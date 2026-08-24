import { usePage } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import { buttonClasses } from '@/components/ui/button';

/**
 * FR4-14 — the PPDB call-out.
 *
 * The portal hosts no registration form (NG-1); this only hands the visitor
 * over to the school's external PPDB application. Renders nothing at all when
 * the Setting is off or has no URL, so the page below simply closes up.
 */
export default function PpdbBanner() {
    const ppdb = usePage().props.site.ppdb;

    if (!ppdb.enabled || ppdb.url === null) {
        return null;
    }

    return (
        <section
            aria-labelledby="ppdb"
            className="relative overflow-hidden rounded-2xl bg-brand text-white"
        >
            {ppdb.image !== null && (
                <img
                    src={ppdb.image.url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover opacity-25"
                />
            )}

            <span
                className="absolute -top-16 -right-16 hidden size-56 rounded-full bg-brand-accent/30 sm:block"
                aria-hidden="true"
            />

            <div className="relative px-5 py-8 sm:px-8 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
                <div className="max-w-xl">
                    <p className="text-xs font-semibold tracking-[0.18em] uppercase">
                        Penerimaan Peserta Didik Baru
                    </p>

                    <h2
                        id="ppdb"
                        className="mt-2 font-display text-2xl leading-tight font-semibold sm:text-3xl"
                    >
                        Daftar sekarang dan mulai perjalananmu di sini.
                    </h2>

                    <p className="mt-3 text-[15px] text-white/85">
                        Pendaftaran dilakukan melalui aplikasi PPDB resmi di
                        laman terpisah.
                    </p>
                </div>

                <a
                    href={ppdb.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses(
                        'primary',
                        'mt-6 bg-white text-brand hover:bg-brand-accent hover:text-white lg:mt-0 lg:shrink-0',
                    )}
                >
                    Buka pendaftaran PPDB
                    <ArrowUpRight className="size-5" aria-hidden="true" />
                </a>
            </div>
        </section>
    );
}
