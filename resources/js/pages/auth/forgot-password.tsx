import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import Button from '@/components/ui/button';
import Field from '@/components/ui/field';
import Input from '@/components/ui/input';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email as passwordEmail } from '@/routes/password';

type ForgotPasswordProps = {
    status?: string;
};

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const form = useForm({ email: '' });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post(passwordEmail.url());
    }

    return (
        <AuthLayout
            title="Lupa kata sandi"
            description="Masukkan email akun Anda. Kami kirimkan tautan untuk membuat kata sandi baru."
        >
            {status ? (
                <p
                    role="status"
                    className="mb-4 rounded-lg border-l-4 border-brand bg-mist p-3 text-sm text-onyx"
                >
                    {status}
                </p>
            ) : null}

            <form onSubmit={submit} className="space-y-5">
                <Field id="email" label="Email" error={form.errors.email}>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="username"
                        required
                        autoFocus
                        invalid={Boolean(form.errors.email)}
                        value={form.data.email}
                        onChange={(event) =>
                            form.setData('email', event.target.value)
                        }
                    />
                </Field>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={form.processing}
                >
                    {form.processing ? 'Mengirim…' : 'Kirim tautan reset'}
                </Button>

                <p className="text-center text-sm">
                    <Link
                        href={login()}
                        className="font-medium text-brand underline underline-offset-4 hover:text-brand-accent"
                    >
                        Kembali ke halaman masuk
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
