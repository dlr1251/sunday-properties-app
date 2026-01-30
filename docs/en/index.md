# Sunday Properties — Documentation

Technical and operational documentation for the Sunday Properties real-estate platform.

---

## Language

| [English](guide/quick-start) | [Español](../es/guia/inicio-rapido) |

---

## Main sections

### Guide

Concepts, setup, and system architecture.

| Document | Description |
|----------|-------------|
| [Quick start](guide/quick-start) | Set up your environment in about ten minutes. |
| [Concepts](guide/concepts) | Domain model: properties, offers, negotiations. |
| [Architecture](guide/architecture) | Tech stack, design decisions, diagrams. |

### Reference

API, database, and components.

| Document | Description |
|----------|-------------|
| [API — Authentication](reference/api/authentication) | Auth and session. |
| [API — Properties](reference/api/properties) | Property CRUD and search. |
| [API — Offers](reference/api/offers) | Offers and conditions. |
| [API — Visits](reference/api/visits) | Visit scheduling and management. |
| [Database — Schema](reference/database/schema) | Tables, relationships, types. |
| [Database — RLS policies](reference/database/rls-policies) | Row Level Security. |
| [Database — Functions](reference/database/functions) | SQL functions and triggers. |
| [Components — Design system](reference/components/design-system) | UI, tokens, patterns. |
| [Components — Forms](reference/components/forms) | Forms and validation. |
| [Components — Navigation](reference/components/navigation) | Routes and layout. |

### Processes

Step-by-step workflows.

| Document | Description |
|----------|-------------|
| [Publish property](processes/publish-property) | Publication wizard. |
| [Manage visits](processes/manage-visits) | Visits for sellers and buyers. |
| [Negotiation](processes/negotiation) | Offer, counteroffers, and closing. |
| [Legal closing](processes/legal-closing) | Cases and documents. |

### Decisions (ADR)

Architecture Decision Records.

| Document | Description |
|----------|-------------|
| [ADR-001 — Structured conditions](decisions/adr-001-structured-conditions) | Typed conditions model. |
| [ADR-002 — NPV calculation](decisions/adr-002-npv-calculation) | NPV calculation approach. |
| [ADR-003 — Backward compatibility](decisions/adr-003-compatibility) | Migration strategy. |

### Operations

Deployment, migrations, and monitoring.

| Document | Description |
|----------|-------------|
| [Deployment](operations/deployment) | Build, env vars, and Vercel. |
| [Migrations](operations/migrations) | Supabase migrations and seeds. |
| [Monitoring](operations/monitoring) | Logs, errors, and health. |

### Legal

Terms and privacy.

| Document | Description |
|----------|-------------|
| [Terms and conditions](legal/terms-and-conditions) | Terms of use. |
| [Privacy](legal/privacy) | Data and cookies. |

---

## Project status

| Field | Value |
|-------|--------|
| Version | 1.0.0 |
| Last updated | January 2025 |

---

## Links

- [Repository](https://github.com/dlr1251/sunday-properties-app)
- [Support](mailto:soporte@sundayproperties.com)

---

**Español:** [Inicio rápido](../es/guia/inicio-rapido) · [Conceptos](../es/guia/conceptos) · [Arquitectura](../es/guia/arquitectura)
