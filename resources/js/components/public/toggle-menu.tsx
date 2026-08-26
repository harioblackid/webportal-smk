import { cn } from '@/lib/utils';

type ToggleMenuProps = {
    expanded: boolean;
    onToggle: () => void;
};

/**
 * AstroWind's common/ToggleMenu — two bars that rotate into a cross.
 *
 * The transform is the template's, moved from its `[data-aw-toggle-menu]` CSS
 * onto the paths themselves so the state stays in React.
 */
export default function ToggleMenu({ expanded, onToggle }: ToggleMenuProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label="Menu utama"
            className="ml-2 flex size-12 items-center justify-center rounded-lg transition"
        >
            <svg
                className="size-6 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <g>
                    <path
                        className={cn(
                            'origin-center transition',
                            expanded &&
                                '-translate-x-[3px] translate-y-[5px] -rotate-45',
                        )}
                        d="M4 7h16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        className={cn(
                            'origin-center transition',
                            expanded &&
                                'translate-x-[3px] -translate-y-[5px] rotate-45',
                        )}
                        d="M4 17h16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </g>
            </svg>
        </button>
    );
}
