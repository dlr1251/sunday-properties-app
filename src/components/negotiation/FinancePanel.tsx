import React, { useMemo, useState } from 'react';

export type FinancePanelProps = {
  negotiationId: string;
  className?: string;
};

type FinanceInputs = {
  price: number;
  downPayment: number;
  annualRate: number; // 0.12 → 12%
  termMonths: number;
};

function computeMonthlyPayment({ price, downPayment, annualRate, termMonths }: FinanceInputs) {
  const principal = Math.max(price - downPayment, 0);
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0 || termMonths === 0) return principal / Math.max(termMonths, 1);
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  return principal * (numerator / denominator);
}

export const FinancePanel: React.FC<FinancePanelProps> = ({ negotiationId, className }) => {
  const [inputs, setInputs] = useState<FinanceInputs>({ price: 350_000_000, downPayment: 70_000_000, annualRate: 0.12, termMonths: 180 });

  const monthlyPayment = useMemo(() => computeMonthlyPayment(inputs), [inputs]);
  const principal = Math.max(inputs.price - inputs.downPayment, 0);

  return (
    <section className={`bg-card border border-border rounded-xl shadow-sm p-4 lg:p-6 ${className ?? ''}`}>
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Análisis financiero</h2>
        <p className="text-sm text-muted-foreground">Negociación: {negotiationId}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Precio</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-border focus:border-blue-500 focus:ring-blue-500"
            value={inputs.price}
            onChange={(e) => setInputs((s) => ({ ...s, price: Number(e.target.value || 0) }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Cuota inicial</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-border focus:border-blue-500 focus:ring-blue-500"
            value={inputs.downPayment}
            onChange={(e) => setInputs((s) => ({ ...s, downPayment: Number(e.target.value || 0) }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Tasa anual</label>
          <input
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border-border focus:border-blue-500 focus:ring-blue-500"
            value={inputs.annualRate}
            onChange={(e) => setInputs((s) => ({ ...s, annualRate: Number(e.target.value || 0) }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Plazo (meses)</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-border focus:border-blue-500 focus:ring-blue-500"
            value={inputs.termMonths}
            onChange={(e) => setInputs((s) => ({ ...s, termMonths: Number(e.target.value || 0) }))}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <div className="text-sm text-muted-foreground">Principal</div>
          <div className="text-xl font-semibold text-foreground">{principal.toLocaleString('es-CO')}</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <div className="text-sm text-muted-foreground">Cuota mensual</div>
          <div className="text-xl font-semibold text-foreground">{Math.round(monthlyPayment).toLocaleString('es-CO')}</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <div className="text-sm text-muted-foreground">Tasa anual</div>
          <div className="text-xl font-semibold text-foreground">{(inputs.annualRate * 100).toFixed(2)}%</div>
        </div>
      </div>
    </section>
  );
};

export default FinancePanel;


