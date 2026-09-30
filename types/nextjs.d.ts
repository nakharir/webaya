// nextjs.d.ts

// Deklarasi untuk next/image
declare module 'next/image' {
  import type { ComponentProps } from 'react';

  type NextImageProps = ComponentProps<'img'> & {
    src: string;
    width?: number;
    height?: number;
    alt: string;
    fill?: boolean;
    unoptimized?: boolean;
    className?: string;
    priority?: boolean;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
  };

  const Image: (props: NextImageProps) => JSX.Element;
  export default Image;
}

// Deklarasi untuk next/link
declare module 'next/link' {
  import type { ComponentPropsWithRef, AnchorHTMLAttributes } from 'react';

  type NextLinkProps = ComponentPropsWithRef<'a'> &
    AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string | URL;
      replace?: boolean;
      scroll?: boolean;
      shallow?: boolean;
      passHref?: boolean;
      prefetch?: boolean;
      legacyBehavior?: boolean;
      locale?: string | false;
    };

  const Link: (props: NextLinkProps) => JSX.Element;
  export default Link;
}
