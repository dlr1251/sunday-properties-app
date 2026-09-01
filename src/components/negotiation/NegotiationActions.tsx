import React from 'react';
import { useTranslation } from 'react-i18next';

export type NegotiationActionsProps = {
  canEdit: boolean;
  generating: boolean;
  exporting: boolean;
  showLegalSection: boolean;
  onGenerate: () => void;
  onExport: () => void;
  onToggleLegal: () => void;
  className?: string;
};

export const NegotiationActions: React.FC<NegotiationActionsProps> = ({
  canEdit,
  generating,
  exporting,
  showLegalSection,
  onGenerate,
  onExport,
  onToggleLegal,
  className
}) => {
  const { t } = useTranslation();
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ''}`}>
      <button
        onClick={onGenerate}
        disabled={generating || !canEdit}
        className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        {generating && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {generating ? t('negotiations.generating') : t('negotiations.generatePromise')}
      </button>
      <button
        onClick={onExport}
        disabled={exporting || !canEdit}
        className="inline-flex items-center px-4 py-2 rounded-md bg-brand-navy text-primary-foreground text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-navy/90 transition-colors"
      >
        {exporting && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {exporting ? t('negotiations.exporting') : t('negotiations.exportDocx')}
      </button>
      <button
        onClick={onToggleLegal}
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
          showLegalSection
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-card border border-border text-muted-foreground hover:bg-muted/30'
        }`}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2V9a6 6 0 00-12 0v4.394" />
        </svg>
        {showLegalSection ? t('negotiations.hideLegal') : t('negotiations.showLegal')}
      </button>
      {!canEdit && (
        <div className="text-sm text-muted-foreground flex items-center">
          <svg className="w-4 h-4 mr-1 text-muted-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          {t('negotiations.readOnly')}
        </div>
      )}
    </div>
  );
};

