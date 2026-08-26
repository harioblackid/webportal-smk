import { ImageIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Image } from '@/types';

type SiteImageProps = {
    image: Image | null;
    /** Tailwind aspect-ratio class — the guard against layout shift. */
    ratio?: string;
    className?: string;
    /** Above-the-fold images opt out of lazy loading. */
    eager?: boolean;
    /** Cards read the thumbnail; detail headers read the full file. */
    thumb?: boolean;
};

/**
 * Every content image on the public site goes through here.
 *
 * The box reserves its space with an aspect ratio instead of width/height
 * attributes: the media table stores no intrinsic dimensions, and a reserved
 * box holds the layout still just as well.
 *
 * A null image is a normal state, not an error — the CMS is empty until the
 * school uploads photos, and a page must still look deliberate meanwhile.
 */
export default function SiteImage({
    image,
    ratio = 'aspect-[16/10]',
    className,
    eager = false,
    thumb = false,
}: SiteImageProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden bg-gray-400 dark:bg-slate-700',
                ratio,
                className,
            )}
        >
            {image === null ? (
                <span className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-slate-800">
                    <ImageIcon
                        className="size-8 text-aw-muted"
                        aria-hidden="true"
                    />
                </span>
            ) : (
                <img
                    src={thumb ? image.thumbUrl : image.url}
                    alt={image.alt}
                    loading={eager ? 'eager' : 'lazy'}
                    decoding="async"
                    className="absolute inset-0 size-full object-cover"
                />
            )}
        </div>
    );
}
