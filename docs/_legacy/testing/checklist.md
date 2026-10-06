# End-to-End Testing Checklist

## Test Setup
- [x] Vitest configured with React Testing Library
- [x] Test setup file with mocks
- [x] Package.json test scripts added

## User Authentication & Registration Flow
- [ ] Registration form validation
  - [ ] Password requirements (8+ chars, number, letter)
  - [ ] Email format validation
  - [ ] Terms & privacy acceptance required
  - [ ] Duplicate email prevention
- [ ] Email verification flow
  - [ ] Verification banner displays for unverified users
  - [ ] Resend verification email functionality
  - [ ] Email confirmation status updates
- [ ] Login functionality
  - [ ] Valid credentials login
  - [ ] Invalid credentials error handling
  - [ ] Password reset flow
- [ ] Protected routes
  - [ ] Unauthenticated users redirected to login
  - [ ] Role-based access control
  - [ ] Email verification requirements

## Identity Verification Flow
- [ ] Document upload wizard
  - [ ] Document type selection
  - [ ] File upload validation (size, type)
  - [ ] Image preview functionality
  - [ ] Form submission and status tracking
- [ ] Admin verification review
  - [ ] Document viewing by admins
  - [ ] Approve/reject functionality
  - [ ] Notification sending to users
- [ ] Status updates and restrictions
  - [ ] Verified users can access premium features
  - [ ] Unverified users see appropriate restrictions

## Property Upload & Management Flow
- [ ] Property creation wizard
  - [ ] Step-by-step form validation
  - [ ] Photo upload and reordering
  - [ ] Document attachment
  - [ ] Draft saving functionality
- [ ] Property approval workflow
  - [ ] Admin review interface
  - [ ] Approval/rejection notifications
  - [ ] Status updates and visibility
- [ ] Property editing and management
  - [ ] Owner can edit their properties
  - [ ] Status progression (draft → pending → published)

## Property Discovery & Search Flow
- [ ] Property listing display
  - [ ] Property cards show correct information
  - [ ] Filtering and sorting functionality
  - [ ] Pagination works correctly
- [ ] Property details view
  - [ ] Complete property information display
  - [ ] Image gallery functionality
  - [ ] Contact/schedule visit buttons
- [ ] Favorites system
  - [ ] Add/remove from favorites
  - [ ] Favorites list display
  - [ ] Favorites persistence
- [ ] Property comparison
  - [ ] Multiple property selection
  - [ ] Side-by-side comparison table
  - [ ] Comparison export functionality

## Visit Management Flow
- [ ] Visit scheduling
  - [ ] Available time slots display
  - [ ] Form validation and submission
  - [ ] Email verification requirement
  - [ ] Notification sending
- [ ] Visit management (sellers)
  - [ ] Visit request acceptance/rejection
  - [ ] Status updates and notifications
  - [ ] Internal notes functionality
- [ ] Visit management (buyers)
  - [ ] Scheduled visits display
  - [ ] Visit cancellation (with time restrictions)
  - [ ] Rescheduling functionality
- [ ] Visit feedback system
  - [ ] Post-visit survey display
  - [ ] Rating and comment submission
  - [ ] Anonymous submission option

## Negotiation Flow
- [ ] Offer creation
  - [ ] Form validation against rules
  - [ ] Real-time price validation
  - [ ] Document attachment
  - [ ] Notification sending
- [ ] Counter-offer flow
  - [ ] Counter-offer creation and validation
  - [ ] Message and terms modification
  - [ ] Notification to original buyer
- [ ] Offer management
  - [ ] Offer listing and filtering
  - [ ] Status updates (accept/reject)
  - [ ] History tracking
- [ ] Negotiation closing
  - [ ] Offer acceptance closes other offers
  - [ ] Property status update to sold
  - [ ] Contract generation trigger
  - [ ] Notification to all parties

## Admin Dashboard Flow
- [ ] Dashboard overview
  - [ ] Real-time statistics display
  - [ ] Data accuracy verification
  - [ ] Refresh functionality
- [ ] User management
  - [ ] User listing with filters
  - [ ] Role modification
  - [ ] Verification status changes
  - [ ] User suspension/deletion
  - [ ] Bulk operations
- [ ] Property management
  - [ ] Property approval/rejection
  - [ ] Bulk approval functionality
  - [ ] Property editing access
  - [ ] Status updates and notifications
- [ ] Verification review
  - [ ] Document viewing and review
  - [ ] Approval/rejection workflow
  - [ ] User notifications
- [ ] Reports management
  - [ ] Report viewing and investigation
  - [ ] Resolution tracking
  - [ ] User sanctions when appropriate

## Notification System
- [ ] Real-time notifications
  - [ ] WebSocket connection stability
  - [ ] Notification display and updates
  - [ ] Unread count accuracy
- [ ] Notification types
  - [ ] All notification types trigger correctly
  - [ ] Notification content accuracy
  - [ ] User-specific notifications
- [ ] Notification management
  - [ ] Mark as read functionality
  - [ ] Bulk read operations
  - [ ] Notification persistence

## Permission System
- [ ] Route protection
  - [ ] Authentication requirements
  - [ ] Role-based access
  - [ ] Feature-specific permissions
- [ ] UI restrictions
  - [ ] Button visibility based on permissions
  - [ ] Form field access control
  - [ ] Feature availability
- [ ] API security
  - [ ] RLS policy enforcement
  - [ ] Permission checking in API calls

## Data Integrity & Performance
- [ ] Database constraints
  - [ ] Foreign key relationships
  - [ ] Data validation rules
  - [ ] Unique constraints
- [ ] Performance testing
  - [ ] Page load times
  - [ ] Database query performance
  - [ ] Image loading optimization
- [ ] Error handling
  - [ ] Graceful error display
  - [ ] Fallback states
  - [ ] Error recovery

## Security Testing
- [ ] Authentication security
  - [ ] Password requirements enforcement
  - [ ] Session management
  - [ ] CSRF protection
- [ ] Authorization checks
  - [ ] API endpoint protection
  - [ ] Data access restrictions
  - [ ] Admin function security
- [ ] Input validation
  - [ ] XSS prevention
  - [ ] SQL injection protection
  - [ ] File upload security

## Mobile & Responsive Testing
- [ ] Mobile layout
  - [ ] Touch interactions
  - [ ] Responsive design
  - [ ] Mobile navigation
- [ ] Tablet optimization
  - [ ] Intermediate screen sizes
  - [ ] Touch and mouse compatibility
- [ ] Cross-browser compatibility
  - [ ] Modern browser support
  - [ ] CSS and JS compatibility

## Integration Testing
- [ ] Supabase integration
  - [ ] Database connections
  - [ ] Real-time subscriptions
  - [ ] File storage operations
- [ ] Email system
  - [ ] Email template rendering
  - [ ] Email sending functionality
- [ ] Third-party services
  - [ ] Payment integrations (future)
  - [ ] Document verification (future)
  - [ ] Analytics (future)
