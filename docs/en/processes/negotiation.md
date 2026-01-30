# Negotiation

Offer, counteroffer, and closing flow.

## Prerequisites

- Verified profile.
- Property visited (recommended) before offering.
- To create counteroffers: be the property’s seller or the buyer who received the counteroffer.

---

## Create an offer (buyer)

### 1. Open the form

On the property page, use "Make an offer" or the negotiation section. The offer form (SmartOfferForm) opens.

### 2. Fill in details

- **Price**: Amount in COP. The system validates against list price, minimum price, and negotiation rules. Visual indicators show whether the offer is in range, at the limit, or too low.
- **Payment method**: Cash, financing, crypto, or mixed. If financing, provide down payment, term, and optionally lender.
- **Closing date**: Target closing date. Must respect the seller’s maximum period; otherwise the offer may be rejected.
- **Conditions**: Additional conditions (text or structured per the conditions model). Optional.

### 3. Review and submit

Check automatic validation and system messages. Submit the offer. It moves to "pending". The seller is notified.

---

## Manage offers and counteroffers (seller)

### 1. Receive and review offer

Notification by email and in-app. Review under "Offers received" or on the property page: price, payment method, timeline, conditions, buyer profile.

### 2. Choose an action

- **Accept**: Offer and conditions are acceptable. Legal process starts; a lawyer is assigned and a case is created. All parties are notified.
- **Reject**: No interest in negotiating. Optionally add a reason. The buyer is notified.
- **Counteroffer**: Adjust price, conditions, or timeline. Create a counteroffer with the new terms. The buyer is notified and can accept, reject, or counter again.

### 3. Successive counteroffers

The cycle can repeat until agreement or rejection. Each counteroffer is recorded in the offer history.

---

## Respond to a counteroffer (buyer)

### 1. Receive counteroffer

Notification with the seller’s new terms.

### 2. Decide

- **Accept**: Agreement reached. Legal process starts (case, lawyer, documents).
- **Reject**: Negotiation ends for that offer.
- **New counteroffer**: Send another proposal. The seller evaluates again.

---

## Closing and legal process

When an offer or counteroffer is accepted:

- A **legal case** is created, linked to the offer, property, buyer, and seller.
- A **lawyer** is assigned (automatically or manually per configuration).
- A **chat** for the case is created and parties are notified.
- **Documents** (contracts, letters of intent, etc.) are started. See [Legal closing](legal-closing).

---

## Result

Negotiation ends by acceptance or rejection. If accepted, the flow continues in the legal process through signing and transaction closing.

## Related

- [Legal closing](legal-closing)
- [API — Offers](../reference/api/offers)
- [Concepts](../../guide/concepts)
