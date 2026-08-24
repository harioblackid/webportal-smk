import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import Button from '@/components/ui/button';
import Field from '@/components/ui/field';
import Input from '@/components/ui/input';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { request } from '@/routes/password';

type LoginProps = {
    canResetPassword: boolean;
    status?: string;
};

export default function Login({ canResetPassword, status }: LoginProps) {
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post(login.url(), {
            onFinish: () => form.reset('password'),
        });
    }

    return (
        <AuthLayout
            title="Masuk"
            description="Gunakan email dan kata sandi akun admin sekolah."
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

                <Field
                    id="password"
                    label="Kata sandi"
                    error={form.errors.password}
                >
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        invalid={Boolean(form.errors.password)}
                        value={form.data.password}
                        onChange={(event) =>
                            form.setData('password', event.target.value)
                        }
                    />
                </Field>

                <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        name="remember"
                        className="size-4 accent-brand"
                        checked={form.data.remember}
                        onChange={(event) =>
                            form.setData('remember', event.target.checked)
                        }
                    />
                    <span className="text-charcoal">Ingat saya</span>
                </label>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={form.processing}
                >
                    {form.processing ? 'Memproses…' : 'Masuk'}
                </Button>

                {canResetPassword ? (
                    <p className="text-center text-sm">
                        <Link
                            href={request()}
                            className="font-medium text-brand underline underline-offset-4 hover:text-brand-accent"
                        >
                            Lupa kata sandi?
                        </Link>
                    </p>
                ) : null}
            </form>
        </AuthLayout>
    );
}
