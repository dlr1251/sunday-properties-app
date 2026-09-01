# Property Verification System Implementation

## Overview
This document describes the complete property verification workflow, from user submission to admin approval and automated chat creation.

## Database Changes

### Migration: `20250102000000_property_verifications_table.sql`

Created the `property_verifications` table with the following structure:

- **id**: UUID primary key
- **property_id**: References properties table
- **user_id**: Owner who submitted the property
- **status**: `pending`, `approved`, `rejected`, or `requires_changes`
- **reviewed_by**: Admin who reviewed
- **reviewed_at**: Timestamp of review
- **rejection_reason**: Text field for rejection reasons
- **changes_requested**: Notes for required changes
- **submitted_data**: JSONB containing full property data
- **visit_availability_configured**: Boolean flag
- Timestamps: `submitted_at`, `created_at`, `updated_at`

### RLS Policies
- Users can view their own verifications
- Admins/lawyers can view all verifications
- Users can insert their own verifications
- Admins/lawyers can update verifications

## User Flow

### 1. Property Upload Wizard

**Steps:**
1. Documents (CLYT required)
2. Basic Info (title, description, address, neighborhood)
3. Characteristics (bedrooms, bathrooms, area, property type)
4. Images (1-20 photos)
5. Selling Conditions (price, payment methods)
6. Negotiation Rules (optional)
7. **Visit Availability (REQUIRED)** ✓
8. Final Review (terms and privacy acceptance)

**Key Changes:**
- Step 7 now requires `draftId` to be set (visit availability configured)
- Submission saves to `property_verifications` table
- Visit availability is marked as configured
- Property status updated to `pending`

### 2. Success Modal

After submission:
- Shows animated success icon
- Displays confirmation message
- Offers to redirect to dashboard or close
- User can view submission status immediately

### 3. User Dashboard Integration

Added `PropertyVerificationStatus` component to overview tab:
- Shows all user's property verification submissions
- Displays status (Pending, Approved, Rejected, Requires Changes)
- Shows rejection reasons if available
- Shows change requests if applicable
- Displays submission date

## Admin Flow

### 1. SuperAdmin Dashboard

New tab: **"Prop. Verifications"** in the superadmin profile page.

### 2. PropertyVerificationManagementPanel

**Features:**
- View all property verifications
- Filter by status (all, pending, approved, rejected)
- Statistics cards showing:
  - Total submissions
  - Pending count
  - Approved count
  - Rejected count

**Actions:**
- **Approve**: 
  - Updates verification status to `approved`
  - Updates property status to `published`
  - Sets `verified` to `true`
  - **Creates chat conversation** between admin and owner
  - Sends welcome message
  
- **Reject**:
  - Updates verification status to `rejected`
  - Updates property status to `rejected`
  - Requires rejection reason
  - Can add additional notes

### 3. Chat Creation on Approval

When an admin approves a property:

1. `createPropertyApprovalConversation` function is called
2. Checks if conversation already exists
3. Creates new conversation with:
   - Type: `verification`
   - Participants: [owner_id, admin_id]
   - Subject: "Propiedad Aprobada: {property_title}"
   - Links to property_id
4. Sends initial welcome message from admin to owner

**Welcome Message:**
> "¡Hola! Tu propiedad "{property_title}" ha sido aprobada y publicada. Puedes gestionarla desde tu dashboard. ¿Tienes alguna pregunta?"

## File Structure

```
src/
├── components/
│   ├── properties/
│   │   └── PropertyVerificationStatus.tsx (User dashboard component)
│   ├── dashboards/
│   │   └── PropertyVerificationManagementPanel.tsx (Admin panel)
│   ├── ui/
│   │   └── success-modal.tsx (Success confirmation)
│   └── PropertyUploadWizard.tsx (Updated wizard)
├── hooks/
│   └── usePropertyVerifications.ts (Fetch verifications)
└── utils/
    └── createPropertyApprovalConversation.ts (Chat creation)
supabase/
└── migrations/
    └── 20250102000000_property_verifications_table.sql
```

## Usage

### For Users:
1. Complete property upload wizard
2. Check dashboard for verification status
3. Receive chat notification when approved
4. Answer any admin questions via chat

### For Admins:
1. Go to SuperAdmin Profile → "Prop. Verifications" tab
2. Review pending property submissions
3. Approve or reject with notes
4. Automatic chat created on approval
5. Continue conversation with property owner

## Migration Instructions

To enable this system:

```bash
# Apply the migration
supabase migration up

# Or manually run the SQL in Supabase dashboard
# File: supabase/migrations/20250102000000_property_verifications_table.sql
```

## Status States

- **pending**: Waiting for admin review
- **approved**: Approved and published
- **rejected**: Rejected with reason
- **requires_changes**: Needs modifications before approval

## Integration Points

### Chat System
Uses existing `conversations` and `chat_messages` tables with:
- Type: `verification`
- Automatic welcome message
- Links to property for context

### Property Status Flow
1. `draft` → User editing
2. `pending` → Submitted for review
3. `published` → Approved and live
4. `rejected` → Rejected by admin

## Benefits

1. **Trackability**: Complete history of all property submissions
2. **Transparency**: Users can see review status and notes
3. **Communication**: Automatic chat bridges admin-owner gap
4. **Accountability**: All actions tracked with timestamps
5. **Workflow**: Structured approval process prevents errors

