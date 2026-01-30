import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StructuredConditionsEditor } from '../StructuredConditionsEditor';
import * as offerConditionsService from '../../../services/offerConditions.service';

// Mock the service
vi.mock('../../../services/offerConditions.service', () => ({
  offerConditionsService: {
    getConditionsByOffer: vi.fn(() => Promise.resolve({
      ok: true,
      data: []
    })),
    createCondition: vi.fn(() => Promise.resolve({
      ok: true,
      data: {
        id: 'test-condition-1',
        offer_id: 'test-offer-1',
        condition_type: 'inspection_contingency',
        status: 'proposed'
      }
    })),
    acceptCondition: vi.fn(),
    rejectCondition: vi.fn()
  }
}));

// Mock auth
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-1' },
    profile: { role: 'buyer' }
  })
}));

describe('StructuredConditionsEditor', () => {
  const mockOffer = {
    id: 'test-offer-1',
    property_id: 'test-property-1',
    buyer_id: 'test-user-1',
    offer_price: 500000000,
    payment_method: 'cash',
    status: 'pending'
  };

  it('renders without crashing', () => {
    render(<StructuredConditionsEditor offerId="test-offer-1" offer={mockOffer} />);
    expect(screen.getByText(/condiciones de la oferta/i)).toBeInTheDocument();
  });

  it('loads conditions on mount', async () => {
    render(<StructuredConditionsEditor offerId="test-offer-1" offer={mockOffer} />);
    
    await waitFor(() => {
      expect(offerConditionsService.offerConditionsService.getConditionsByOffer).toHaveBeenCalledWith('test-offer-1');
    });
  });

  it('displays add condition button for authorized users', () => {
    render(<StructuredConditionsEditor offerId="test-offer-1" offer={mockOffer} />);
    const addButton = screen.queryByRole('button', { name: /agregar condición/i });
    expect(addButton).toBeInTheDocument();
  });
});

