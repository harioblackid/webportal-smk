import HeroText from '@/components/public/hero-text';
import WidgetWrapper from '@/components/public/widget-wrapper';
import PublicLayout from '@/layouts/public-layout';
import type { IdentitySection, Seo } from '@/types';

type IdentitasProps = {
    /**
     * Already filtered server-side: a blank field never arrives, and a group
     * whose fields are all blank is absent rather than empty.
     */
    groups: IdentitySection[];
    seo: Seo;
};

export default function Identitas({ groups, seo }: IdentitasProps) {
    return (
        <PublicLayout seo={seo}>
            <HeroText
                tagline="Profil Sekolah"
                title="Identitas sekolah"
                subtitle="Data resmi sekolah sebagaimana tercatat pada Data Pokok Pendidikan."
            />

            <WidgetWrapper containerClass="max-w-4xl">
                {groups.length === 0 ? (
                    <p className="rounded-md bg-gray-100 p-6 text-lg text-aw-muted dark:bg-slate-800">
                        Data identitas sekolah belum diisi.
                    </p>
                ) : (
                    <div className="space-y-10">
                        {groups.map((group) => (
                            <section key={group.label}>
                                <h2 className="mb-4 font-heading text-2xl font-bold tracking-tighter">
                                    {group.label}
                                </h2>

                                <dl className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                                    {group.rows.map((row) => (
                                        <div
                                            key={row.label}
                                            className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4 sm:px-6"
                                        >
                                            <dt className="text-sm font-medium text-aw-muted">
                                                {row.label}
                                            </dt>
                                            <dd className="text-aw-default sm:col-span-2">
                                                {row.value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                        ))}
                    </div>
                )}
            </WidgetWrapper>
        </PublicLayout>
    );
}
