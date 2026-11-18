import React from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';

import i18n from './i18n';
import { WidgetApp } from './WidgetApp';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <I18nextProvider i18n={i18n}>
      <WidgetApp />
    </I18nextProvider>,
  );
}
