import Image from '@tiptap/extension-image';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Heading2,
    Heading3,
    ImagePlus,
    Italic,
    Link2,
    Link2Off,
    List,
    ListOrdered,
    Quote,
    Redo2,
    Undo2,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useState } from 'react';

import MediaGrid from '@/components/admin/media-grid';
import Modal from '@/components/admin/modal';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/types';

type RichTextEditorProps = {
    id: string;
    label: string;
    value: string;
    library: MediaItem[];
    error?: string;
    hint?: string;
    onChange: (html: string) => void;
};

type ToolbarButtonProps = {
    icon: ComponentType<{ className?: string }>;
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
};

function ToolbarButton({
    icon: Icon,
    label,
    active = false,
    disabled = false,
    onClick,
}: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={cn(
                'inline-flex size-11 items-center justify-center rounded-lg',
                'disabled:pointer-events-none disabled:opacity-40',
                active
                    ? 'bg-brand text-white'
                    : 'text-charcoal hover:bg-mist hover:text-onyx',
            )}
        >
            <Icon className="size-4" />
        </button>
    );
}

/**
 * The rich text editor from FR5-9 — heading, bold/italic, list, link, image
 * from the media library, and blockquote, and deliberately nothing else.
 *
 * What comes out of here is still run through App\Support\HtmlSanitizer on the
 * way into the database: this toolbar decides what an editor can produce, not
 * what the application will accept.
 */
export default function RichTextEditor({
    id,
    label,
    value,
    library,
    error,
    hint,
    onChange,
}: RichTextEditorProps) {
    const [linkOpen, setLinkOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [imageOpen, setImageOpen] = useState(false);

    const editor = useEditor({
        // SSR renders this page too (prd-06 keeps one entrypoint), and TipTap
        // must not touch the DOM during that pass.
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                // FR5-9 lists h2/h3 only: h1 belongs to the page title.
                heading: { levels: [2, 3] },
                link: {
                    openOnClick: false,
                    // Matches the schemes HtmlSanitizer keeps.
                    protocols: ['http', 'https', 'mailto', 'tel'],
                },
            }),
            Image.configure({ inline: false }),
        ],
        content: value,
        editorProps: {
            attributes: {
                id,
                class: 'rich-text min-h-64 px-4 py-3 focus:outline-none',
            },
        },
        onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
    });

    // useEditor does not re-render on transactions in TipTap 3, so the toolbar
    // subscribes to just the flags it paints.
    const state = useEditorState({
        editor,
        selector: ({ editor: instance }) => ({
            bold: instance?.isActive('bold') ?? false,
            italic: instance?.isActive('italic') ?? false,
            h2: instance?.isActive('heading', { level: 2 }) ?? false,
            h3: instance?.isActive('heading', { level: 3 }) ?? false,
            bulletList: instance?.isActive('bulletList') ?? false,
            orderedList: instance?.isActive('orderedList') ?? false,
            blockquote: instance?.isActive('blockquote') ?? false,
            link: instance?.isActive('link') ?? false,
            canUndo: instance?.can().undo() ?? false,
            canRedo: instance?.can().redo() ?? false,
        }),
    });

    function openLinkDialog() {
        setLinkUrl(String(editor?.getAttributes('link').href ?? ''));
        setLinkOpen(true);
    }

    function applyLink() {
        const href = linkUrl.trim();

        if (href === '') {
            editor?.chain().focus().unsetLink().run();
        } else {
            editor
                ?.chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href })
                .run();
        }

        setLinkOpen(false);
    }

    return (
        <div className="space-y-1.5">
            <label
                htmlFor={id}
                className="block text-sm font-semibold text-onyx"
            >
                {label}
            </label>

            <div
                className={cn(
                    'overflow-hidden rounded-lg border bg-white',
                    error ? 'border-red-600' : 'border-charcoal/30',
                )}
            >
                <div
                    role="toolbar"
                    aria-label="Format teks"
                    className="flex flex-wrap items-center gap-0.5 border-b border-charcoal/15 bg-mist/60 px-1.5 py-1"
                >
                    <ToolbarButton
                        icon={Bold}
                        label="Tebal"
                        active={state?.bold}
                        onClick={() =>
                            editor?.chain().focus().toggleBold().run()
                        }
                    />
                    <ToolbarButton
                        icon={Italic}
                        label="Miring"
                        active={state?.italic}
                        onClick={() =>
                            editor?.chain().focus().toggleItalic().run()
                        }
                    />
                    <ToolbarButton
                        icon={Heading2}
                        label="Judul bagian"
                        active={state?.h2}
                        onClick={() =>
                            editor
                                ?.chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
                    />
                    <ToolbarButton
                        icon={Heading3}
                        label="Sub judul"
                        active={state?.h3}
                        onClick={() =>
                            editor
                                ?.chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run()
                        }
                    />
                    <ToolbarButton
                        icon={List}
                        label="Daftar berpoin"
                        active={state?.bulletList}
                        onClick={() =>
                            editor?.chain().focus().toggleBulletList().run()
                        }
                    />
                    <ToolbarButton
                        icon={ListOrdered}
                        label="Daftar bernomor"
                        active={state?.orderedList}
                        onClick={() =>
                            editor?.chain().focus().toggleOrderedList().run()
                        }
                    />
                    <ToolbarButton
                        icon={Quote}
                        label="Kutipan"
                        active={state?.blockquote}
                        onClick={() =>
                            editor?.chain().focus().toggleBlockquote().run()
                        }
                    />
                    <ToolbarButton
                        icon={Link2}
                        label="Tautan"
                        active={state?.link}
                        onClick={openLinkDialog}
                    />
                    <ToolbarButton
                        icon={Link2Off}
                        label="Hapus tautan"
                        disabled={!state?.link}
                        onClick={() =>
                            editor?.chain().focus().unsetLink().run()
                        }
                    />
                    <ToolbarButton
                        icon={ImagePlus}
                        label="Sisipkan gambar"
                        onClick={() => setImageOpen(true)}
                    />

                    <span className="ml-auto flex items-center gap-0.5">
                        <ToolbarButton
                            icon={Undo2}
                            label="Batalkan"
                            disabled={!state?.canUndo}
                            onClick={() => editor?.chain().focus().undo().run()}
                        />
                        <ToolbarButton
                            icon={Redo2}
                            label="Ulangi"
                            disabled={!state?.canRedo}
                            onClick={() => editor?.chain().focus().redo().run()}
                        />
                    </span>
                </div>

                <EditorContent editor={editor} />
            </div>

            {hint ? <p className="text-sm text-charcoal">{hint}</p> : null}

            {error ? (
                <p role="alert" className="text-sm text-red-700">
                    {error}
                </p>
            ) : null}

            <Modal
                open={linkOpen}
                title="Tautan"
                description="Kosongkan lalu simpan untuk menghapus tautan."
                onClose={() => setLinkOpen(false)}
            >
                <div className="space-y-4">
                    <Input
                        type="url"
                        inputMode="url"
                        placeholder="https://"
                        value={linkUrl}
                        onChange={(event) => setLinkUrl(event.target.value)}
                    />

                    <div className="flex flex-wrap justify-end gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setLinkOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button onClick={applyLink}>Simpan tautan</Button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={imageOpen}
                size="lg"
                title="Sisipkan gambar"
                description="Gambar diambil dari pustaka media, jadi alt text-nya ikut terbawa."
                onClose={() => setImageOpen(false)}
            >
                <MediaGrid
                    library={library}
                    onSelect={(item) => {
                        editor
                            ?.chain()
                            .focus()
                            .setImage({ src: item.url, alt: item.alt })
                            .run();
                        setImageOpen(false);
                    }}
                />
            </Modal>
        </div>
    );
}
