# MOSAIQ Pre-API Frontend Checklist

This checklist tracks frontend work that can be completed before the remaining Laravel APIs are available. Existing dashboard tab code must remain unchanged until dashboard integration is explicitly approved.

## Status Key

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed and verified
- `[!]` Waiting for backend confirmation

## Implementation Order

### 1. Authentication form hardening

- [x] Shared email and password validation
- [x] Field-level validation messages
- [x] Laravel validation-error mapping
- [x] Password requirement feedback
- [x] Invitation expiry display
- [x] Safe internal post-login redirect
- [x] Authentication-screen browser QA

### 2. Mock authentication mode

- [x] Environment-controlled mock API switch
- [x] Mock successful and failed login
- [x] Mock new-user invitation
- [x] Mock existing-user invitation
- [x] Mock expired invitation and access denied
- [x] Mock forgot/reset-password responses
- [x] Simulated loading and server failures

### 3. Session and route protection

- [x] Authentication provider and current-user state
- [x] Initial session loading state
- [x] Protected route wrapper
- [x] Unauthenticated redirect to login
- [x] Safe return URL after login
- [x] Logout action and redirect
- [x] Role and workspace access helpers

### 4. Shared application states

- [x] Full-page loader
- [x] Inline loader and button progress
- [x] Empty-state component
- [x] API-error and retry component
- [x] Permission-denied component
- [x] Offline/network-error state
- [x] Form-success state
- [x] Card and table skeletons

### 5. Frontend data contracts

- [x] Current user and membership
- [x] Agency and workspace
- [x] Dashboard summary and metrics
- [x] Campaigns, channels and audiences
- [x] Creative and reports
- [x] Marketing Intelligence
- [x] Media Mix Model results

### 6. Dashboard adapter layer

- [x] API response normalization
- [x] Reporting adapters
- [x] Marketing Intelligence adapters
- [x] MMM adapters
- [x] Invalid and incomplete data handling

### 7. Mock dashboard datasets

- [x] Multiple workspaces
- [x] Multiple date ranges
- [x] Reporting fixtures
- [x] Marketing Intelligence fixtures
- [x] MMM fixtures
- [x] Empty and partially populated fixtures

### 8. Responsive and accessibility QA

- [x] Mobile and tablet authentication layouts
- [x] Keyboard-only navigation
- [x] Focus visibility
- [x] Labels and error announcements
- [x] Color contrast
- [x] Long agency names and email addresses

### 9. Testing infrastructure

- [x] Validation tests
- [x] API error-mapping tests
- [x] Invitation-flow tests
- [x] Authentication redirect tests
- [x] Adapter transformation tests

### 10. Environment and deployment preparation

- [x] `.env.example`
- [x] Development and staging API URL handling
- [x] Mock-mode documentation
- [x] Sanctum and CORS checklist
- [x] Production build and deployment notes

## Backend Confirmations Required

- [!] Forgot-password endpoint and response contract
- [!] Reset-password endpoint and response contract
- [!] Whether invitation acceptance creates a session
- [!] Final HTTPS API base URL
- [!] Allowed Sanctum/CORS frontend domains
- [!] Email verification requirements
- [!] Resend-invitation behavior
