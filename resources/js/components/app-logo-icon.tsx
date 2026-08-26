import type { ImgHTMLAttributes } from 'react';

/** The school crest, used wherever the starter kit shows its own mark. */
export default function AppLogoIcon(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    return <img src="/logo-smk.png" alt="" width={40} height={40} {...props} />;
}
