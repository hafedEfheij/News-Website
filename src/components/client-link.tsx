'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

type ClientLinkProps = {
  href: string;
  target?: string;
  rel?: string;
  className?: string;
  children: React.ReactNode;
};

// This component wraps anchor tags to prevent hydration mismatches
// caused by browser extensions that add attributes like "previewlistener"
export default function ClientLink({
  href,
  target,
  rel,
  className,
  children,
}: ClientLinkProps) {
  const router = useRouter();

  // Check if the link is external
  const isExternalLink = href.startsWith('http') || href.startsWith('https');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If it's an external link and target is _blank, let the browser handle it
    if (isExternalLink && target === '_blank') {
      // Don't prevent default - let the browser open in new tab
      return;
    }

    // If it's an external link but not opening in a new tab
    if (isExternalLink) {
      e.preventDefault();
      window.location.href = href; // Use direct browser navigation
    }

    // For internal links, let Next.js router handle it
    // No need to do anything as the default behavior will work
  };

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      onClick={handleClick}
      // Using suppressHydrationWarning to prevent hydration mismatches
      // for attributes that might be added by browser extensions
      suppressHydrationWarning
    >
      {children}
    </a>
  );
}