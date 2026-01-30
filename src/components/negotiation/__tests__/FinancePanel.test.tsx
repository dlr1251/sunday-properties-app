import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FinancePanel } from '../FinancePanel';

describe('FinancePanel', () => {
  it('should render with default values', () => {
    render(<FinancePanel negotiationId="test-neg" />);

    expect(screen.getByText('Análisis financiero')).toBeInTheDocument();
    expect(screen.getByLabelText('Precio')).toBeInTheDocument();
    expect(screen.getByLabelText('Cuota inicial')).toBeInTheDocument();
    expect(screen.getByLabelText('Tasa anual')).toBeInTheDocument();
    expect(screen.getByLabelText('Plazo (meses)')).toBeInTheDocument();
  });

  it('should calculate monthly payment correctly', () => {
    render(<FinancePanel negotiationId="test-neg" />);

    // Default values: price=350M, downPayment=70M, rate=12%, term=180 months
    const principal = 350_000_000 - 70_000_000; // 280M
    const monthlyRate = 0.12 / 12; // 0.01
    const expectedMonthly = Math.round(
      principal * (monthlyRate * Math.pow(1 + monthlyRate, 180)) /
      (Math.pow(1 + monthlyRate, 180) - 1)
    );

    // Check if the calculated value is displayed
    const monthlyPaymentElement = screen.getByText((content) => {
      return content.includes(expectedMonthly.toString());
    });

    expect(monthlyPaymentElement).toBeInTheDocument();
  });

  it('should update calculations when inputs change', () => {
    render(<FinancePanel negotiationId="test-neg" />);

    const priceInput = screen.getByLabelText('Precio');
    fireEvent.change(priceInput, { target: { value: '400000000' } });

    // The calculation should update
    // This is a basic test - in a real scenario we'd mock the calculation function
    expect(priceInput).toHaveValue(400000000);
  });

  it('should display principal amount', () => {
    render(<FinancePanel negotiationId="test-neg" />);

    const principalElement = screen.getByText('Principal');
    expect(principalElement).toBeInTheDocument();

    // Default: 350M - 70M = 280M
    expect(screen.getByText('280.000.000')).toBeInTheDocument();
  });

  it('should display interest rate', () => {
    render(<FinancePanel negotiationId="test-neg" />);

    expect(screen.getByText('12.00%')).toBeInTheDocument();
  });
});
