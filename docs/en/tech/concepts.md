# Concepts

Domain model of Sunday Properties: main entities, relationships, and flows.

## Overview

The platform connects **properties**, **users** (with roles), **offers and negotiations**, **visits**, and **legal cases**. All interaction goes through verifiable profiles and explicit business rules.

## Users and profiles

- **auth.users**: Identity and session (Supabase Auth).
- **profiles**: Extended profile (name, phone, role, status, verification).

Roles: `user`, `agent`, `lawyer`, `admin`, `super_admin`. Role determines permissions and views.

Identity verification is required to schedule visits, make offers, and publish properties.

## Properties

A **property** is a listed real-estate unit (sale or rent). It includes:

- Basics: title, description, address, type, price, area, bedrooms, etc.
- Media: images, virtual tour, video, floor plan.
- Status: `draft`, `pending`, `published`, `sold`, `rented`, `archived`.
- Links to `owner_id` and optionally `agent_id`.

**property_availability**: Weekly slots when visits can be scheduled.

**negotiation_rules**: Rules per property (minimum price, default conditions, etc.) used to validate offers.

## Offers and negotiation

- **offers**: Purchase offer on a property. Includes price, payment method, financing, conditions, desired closing date, and status (`pending`, `accepted`, `rejected`, `countered`, `expired`, `cancelled`).
- **counter_offers**: Counteroffers tied to an offer. Price, conditions, and timelines are negotiated.
- **offer_conditions**: Structured conditions per offer (typed, versioned) with NPV impact.

Typical flow: offer → automatic validation → counteroffer(s) → agreement → legal closing.

## Visits

- **visits**: Scheduled visit to a property. Includes date, time, status, and optionally payment (e.g. 49,000 COP) and NDA acceptance.
- **property_availability** and **blocked_dates** define available slots.

Only verified users can schedule. The seller or agent manages confirmations and reminders.

## Legal cases and documents

- **cases**: Legal case linked to a negotiation (or other source). Groups documents and tasks.
- **case_documents**: Case documents (contracts, deeds, etc.).
- **contracts**: Contracts generated or linked to the flow.

Lawyers manage assigned cases; the system supports document generation and review.

## Communication and notifications

- **chat_messages**: Messaging between users (by conversation or context).
- **notifications**: In-app notifications (and email when applicable) for offers, visits, status changes, and messages.

## Audit and configuration

- **audit_logs**: Record of relevant actions for traceability and support.
- **platform_settings**: Global configuration (feature flags, business parameters).

## Related

- [Architecture](architecture) — Tech stack and design
- [Database schema](db-schema) — Tables and relationships
- [API — Offers](api-offers) — Offer flow and closing
