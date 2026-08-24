export type UserRole = 'superadmin' | 'editor';

export type User = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
};

export type Auth = {
    /** null for guests — every public page shares this prop. */
    user: User | null;
};
