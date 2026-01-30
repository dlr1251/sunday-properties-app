# Legal closing

Legal cases, lawyer assignment, and documents after offer acceptance.

## Prerequisites

- Offer or counteroffer accepted.
- Property, buyer, and seller defined.
- Lawyers available on the platform (for automatic assignment).

---

## Process trigger

When an offer or counteroffer is accepted:

1. A **case** is created in `cases`, linked to the property, buyer, seller, and offer.
2. A **lawyer** is assigned (e.g. by availability and workload).
3. A **chat** for the case is created.
4. **Notifications** are sent to buyer, seller, and lawyer.

The case moves to "active". Parties can communicate via the case chat.

---

## Case management (lawyer)

### Access

In the lawyer dashboard, "My cases" or equivalent. List of assigned cases (active, pending, closed).

### Case information

- **Overview**: Property, parties, accepted offer, deadlines, status.
- **Documents**: Contracts, letters of intent, certificates, deeds. Upload, generate, or link documents per case type.
- **Chat**: Conversation with buyer and seller.
- **Tasks**: Track milestones (review, signing, notary, etc.).

### Documents

- Common types: contract, promise, power of attorney, certificate, other.
- States: draft, pending review, approved, rejected, signed.
- Versioning when applicable. Signatures recorded in `signed_by`, `signed_at`.

### Case closure

When procedures, signatures, and delivery are complete per the defined flow, the case can be marked "completed". If the transaction is cancelled, "cancelled".

---

## For buyer and seller

- Receive notifications of progress and documents.
- Review and sign documents as instructed by the lawyer.
- Use the case chat for questions and coordination.

---

## Result

Legal case processed to closure or cancellation. Documents generated, reviewed, and signed as applicable. Traceability in `case_documents`, `audit_logs`, and notifications.

## Related

- [Negotiation](negotiation)
- [API — Offers](../reference/api/offers)
- [Database — Schema](../reference/database/schema)
- [Concepts](../../guide/concepts)
