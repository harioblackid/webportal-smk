import type { Flash } from '@/types/admin';
import type { Auth } from '@/types/auth';
import type { Site } from '@/types/site';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            site: Site;
            auth: Auth;
            flash: Flash;
            /** Admin requests only — the public pages have no sidebar. */
            sidebarOpen?: boolean;
            [key: string]: unknown;
        };
    }
}
