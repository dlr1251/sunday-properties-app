import React, { useState } from 'react';
import { ChatPanel } from '../chat/ChatPanel';
import { NegotiationDocument, NegotiationParticipant } from '../../hooks/negotiations/useNegotiationData';

export type NegotiationLegalSectionProps = {
  negotiationId: string;
  buyer?: NegotiationParticipant;
  seller?: NegotiationParticipant;
  lawyer?: NegotiationParticipant;
  agent?: NegotiationParticipant;
  documents?: NegotiationDocument[];
  className?: string;
};

type TabType = 'chat' | 'documents' | 'contracts';

export const NegotiationLegalSection: React.FC<NegotiationLegalSectionProps> = ({
  negotiationId,
  buyer,
  seller,
  lawyer,
  agent,
  documents = [],
  className
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');

  const tabs = [
    { id: 'chat' as TabType, label: 'Chat Legal', icon: '💬' },
    { id: 'documents' as TabType, label: 'Documentos', icon: '📄' },
    { id: 'contracts' as TabType, label: 'Contratos', icon: '📋' }
  ];

  const renderChatTab = () => {
    if (!lawyer) {
      return (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-muted-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div className="text-sm font-medium text-foreground mt-2">No hay abogado asignado</div>
          <div className="text-sm text-muted-foreground mt-1">
            Un abogado será asignado para asistir en esta negociación
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Información del abogado */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2V9a6 6 0 00-12 0v4.394" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-blue-900">
                Abogado asignado: {lawyer.name || 'Sin nombre'}
              </div>
              <div className="text-sm text-blue-700">{lawyer.email}</div>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="border border-border rounded-lg overflow-hidden">
          <ChatPanel
            conversationId={`legal-${negotiationId}`}
            title="Chat Legal de la Negociación"
            participants={[buyer?.id, seller?.id, lawyer?.id, agent?.id].filter(Boolean) as string[]}
          />
        </div>
      </div>
    );
  };

  const renderDocumentsTab = () => {
    const legalDocuments = documents.filter(doc => doc.kind !== 'legal');

    if (legalDocuments.length === 0) {
      return (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-muted-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="text-sm font-medium text-foreground mt-2">No hay documentos legales</div>
          <div className="text-sm text-muted-foreground mt-1">
            Los documentos legales aparecerán aquí cuando sean generados
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {legalDocuments.map((document) => (
          <div key={document.id} className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getDocumentIcon(document.kind)}</span>
                  <h3 className="font-medium text-foreground">{document.document_name || getDocumentTypeLabel(document.kind)}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    document.status === 'finalized' ? 'bg-green-100 text-green-800' :
                    document.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-muted text-foreground'
                  }`}>
                    {document.status === 'finalized' ? 'Finalizado' :
                     document.status === 'review' ? 'En revisión' :
                     document.status === 'draft' ? 'Borrador' : document.status}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  Versión {document.version} • Actualizado {new Date(document.updated_at).toLocaleDateString('es-CO')}
                </div>

                {document.document_url && (
                  <div className="flex gap-2">
                    <a
                      href={document.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver documento
                    </a>
                    <button className="inline-flex items-center px-3 py-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-md transition-colors">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Descargar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContractsTab = () => {
    const contractDocuments = documents.filter(doc => ['promise_of_sale', 'promesa', 'escritura'].includes(doc.kind));

    if (contractDocuments.length === 0) {
      return (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-muted-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="text-sm font-medium text-foreground mt-2">No hay contratos</div>
          <div className="text-sm text-muted-foreground mt-1">
            Los contratos aparecerán aquí cuando sean generados
          </div>
          <div className="mt-4">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generar Promesa de Compraventa
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {contractDocuments.map((document) => (
          <div key={document.id} className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getDocumentIcon(document.kind)}</span>
                  <h3 className="font-medium text-foreground">{document.document_name || getDocumentTypeLabel(document.kind)}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    document.status === 'signed' ? 'bg-green-100 text-green-800' :
                    document.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-muted text-foreground'
                  }`}>
                    {document.status === 'signed' ? 'Firmado' :
                     document.status === 'review' ? 'En revisión' :
                     document.status === 'draft' ? 'Borrador' : document.status}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground mb-3">
                  Versión {document.version} • Actualizado {new Date(document.updated_at).toLocaleDateString('es-CO')}
                </div>

                {/* Acciones del contrato */}
                <div className="flex flex-wrap gap-2">
                  {document.document_url && (
                    <a
                      href={document.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver contrato
                    </a>
                  )}

                  <button className="inline-flex items-center px-3 py-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-md transition-colors">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Descargar PDF
                  </button>

                  {document.status === 'draft' && (
                    <button className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Firmar digitalmente
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Botón para generar nuevo contrato */}
        <div className="border-t border-border pt-4">
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generar nuevo contrato
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className={`bg-card border border-border rounded-xl shadow-sm p-6 ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Parte Legal</h2>
        <div className="text-sm text-muted-foreground">
          Asistencia jurídica para la negociación
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:border-border'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'documents' && renderDocumentsTab()}
        {activeTab === 'contracts' && renderContractsTab()}
      </div>
    </section>
  );
};

// Funciones auxiliares
const getDocumentIcon = (kind: string) => {
  switch (kind) {
    case 'promise_of_sale':
    case 'promesa':
      return '📝';
    case 'escritura':
      return '🏠';
    case 'oferta':
      return '💰';
    case 'legal':
      return '⚖️';
    default:
      return '📄';
  }
};

const getDocumentTypeLabel = (kind: string) => {
  switch (kind) {
    case 'promise_of_sale':
      return 'Promesa de Compraventa';
    case 'promesa':
      return 'Promesa';
    case 'escritura':
      return 'Escritura';
    case 'oferta':
      return 'Oferta';
    case 'legal':
      return 'Documento Legal';
    case 'other':
      return 'Otro Documento';
    default:
      return kind;
  }
};

export default NegotiationLegalSection;
