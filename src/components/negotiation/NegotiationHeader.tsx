import React from 'react';

export type NegotiationHeaderProps = {
  negotiationId: string;
  title?: string;
  className?: string;
};

export const NegotiationHeader: React.FC<NegotiationHeaderProps> = ({
  negotiationId,
  title,
  className
}) => {
  return (
    <div className={`${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Negociación</h1>
          {title && (
            <p className="text-lg text-gray-700 font-medium">{title}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">ID: {negotiationId}</p>
        </div>
      </div>
    </div>
  );
};

