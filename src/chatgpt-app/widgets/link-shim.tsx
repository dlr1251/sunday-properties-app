import React from 'react';

import { SITE_ORIGIN } from '../../lib/siteOrigin';

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
};

function absoluteHref(to: string): string {
  if (/^https?:\/\//i.test(to)) return to;
  const path = to.startsWith('/') ? to : `/${to}`;
  return `${SITE_ORIGIN}${path}`;
}

export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const href = absoluteHref(to);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        onClick?.(event);
        const openai = (window as Window & { openai?: { openExternal?: (opts: { href: string; redirectUrl?: boolean }) => void } }).openai;
        if (!event.defaultPrevented && openai?.openExternal) {
          event.preventDefault();
          openai.openExternal({ href, redirectUrl: false });
        }
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
