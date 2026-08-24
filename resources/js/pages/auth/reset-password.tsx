import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import Button from '@/components/ui/button';
import Field from '@/components/ui/field';
import Input from '@/components/ui/input';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password';

type ResetPasswordProps = {
    email: string;
    token: string;
};

export default function ResetPassword({ email, token }: ResetPasswordProps) {
    const form = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post(store.url(), {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    }

    return (
        <AuthLayout
            title="Atur kata sandi baru"
            description="Pilih kata sandi baru untuk akun Anda."
        >
            <form onSubmit={submit} className="space-y-5">
                <Field id="email" label="Email" error={form.errors.email}>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="username"
                        required
                        invalid={Boolean(form.errors.email)}
                        value={form.data.email}
                        onChange={(event) =>
                            form.setData('email', event.target.value)
                        }
                    />
                </Field>

                <Field
                    id="password"
                    label="Kata sandi baru"
                    error={form.errors.password}
                >
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        autoFocus
                        invalid={Boolean(form.errors.password)}
                        value={form.data.password}
                        onChange={(event) =>
                            form.setData('password', event.target.value)
                        }
                    />
                </Field>

                <Field
                    id="password_confirmation"
                    label="Ulangi kata sandi baru"
                    error={form.errors.password_confirmation}
                >
                    <Input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        autoComplete="new-password"
                        required
                        invalid={Boolean(form.errors.password_confirmation)}
                        value={form.data.password_confirmation}
                        onChange={(event) =>
                            form.setData(
                                'password_confirmation',
                                event.target.value,
                            )
                        }
                    />
                </Field>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={form.processing}
                >
                    {form.processing ? 'Menyimpan…' : 'Simpan kata sandi'}
                </Button>
            </form>
        </AuthLayout>
    );
}
