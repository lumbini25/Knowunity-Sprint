import type { ReactNode } from 'react';
import { RecallSessionProvider } from '../../lib/recall/session';
import { ExitOverlayHost } from '../../lib/recall/ExitOverlayHost';

/**
 * The session lives here, not in each page.
 *
 * Every route under /recall is its own React tree, so a provider per page would
 * reset the session on every `router.push` — the student would be returned to
 * term 1, rung 1, on every tap. A layout persists across pushes, which is the
 * whole reason `lib/recall/session.tsx` was written expecting one.
 *
 * This file is a server component; `RecallSessionProvider` carries its own
 * 'use client'. Keeping the boundary here rather than on the layout means the
 * routes stay statically prerendered.
 */
export default function RecallLayout({ children }: { children: ReactNode }) {
  return (
    <RecallSessionProvider>
      {children}
      {/* The exit sheet, raised over whatever turn is showing. Here rather
          than in each page for the same reason the provider is: it has to
          outlive the route beneath it. */}
      <ExitOverlayHost />
    </RecallSessionProvider>
  );
}
