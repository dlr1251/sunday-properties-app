import React from 'react';

import { SUNNY_CHAT_WIDGET_ENABLED } from '../../lib/sunny/widget-flag';

const SunnyChatPanel = React.lazy(() => import('./SunnyChatPanel'));

/** Public-site widget. Off unless VITE_SUNNY_CHAT_ENABLED is set at build time. */
export function SunnyChatWidget() {
  if (!SUNNY_CHAT_WIDGET_ENABLED) return null;
  return (
    <React.Suspense fallback={null}>
      <SunnyChatPanel />
    </React.Suspense>
  );
}
