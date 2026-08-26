import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

type AuthLayoutProps = {
    title: string;
    description?: string;
    children: ReactNode;
};

export default function AuthLayout({
    title,
    description = '',
    children,
}: AuthLayoutProps) {
    return (
        <AuthLayoutTemplate title={title} description={description}>
            <Head title={title} />

            {children}
        </AuthLayoutTemplate>
    );
}
