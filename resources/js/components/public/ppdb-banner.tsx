import { usePage } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import { buttonClasses } from '@/components/public/button';
import CallToAction from '@/components/public/call-to-action';

/**
 * The PPDB call-out, on AstroWind's CallToAction widget.
 *
 * The portal hosts no registration form; this only hands the visitor over to
 * the school's external PPDB application. Renders nothing at all when the
 * Setting is off or has no URL, so the page below simply closes up.
 */
export default function PpdbBanner() {
    const ppdb = usePage().props.site.ppdb;

    if (!ppdb.enabled || ppdb.url === null) {
        return null;
    }

    return (
        <CallToAction
            id="ppdb"
            tagline="Penerimaan Peserta Didik Baru"
            title="Daftar sekarang dan mulai perjalananmu di sini."
            subtitle="Pendaftaran dilakukan melalui aplikasi PPDB resmi di laman terpisah."
            actions={
                <div className="flex w-full sm:w-auto">
                    <a
                        href={ppdb.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonClasses('primary', 'w-full sm:mb-0')}
                    >
                        Buka pendaftaran PPDB
                        <ArrowUpRight
                            className="-mr-1.5 ml-1 inline-block size-5"
                            aria-hidden="true"
                        />
                    </a>
                </div>
            }
        />
    );
}
