# MOSAIQ 13 Day Developer Alignment

**Launch target:** 3 October 2026  
**Delivery window:** 13 full-time working days  
**Team:** 2 developers  
**Current release:** Frontend tool with a database-backed Admin Panel  
**Next phase:** Real third-party API integrations and production hardening

## 1. Shared Objective

Deliver a polished, interactive MOSAIQ tool using the existing MVP designs. The release must provide:

- Reporting Dashboard
- Marketing Intelligence
- Media Mix Model
- React Admin Panel
- Laravel internal APIs
- Database-backed admin records
- CSV import for reporting, intelligence, and MMM data
- Seeded fallback data for demo and setup records

This release is a client-ready tool and pilot foundation. It is not the full production platform or the real third-party API integration phase.

## 2. Architecture Decision

```text
User React Frontend
        |
        | HTTPS JSON API
        v
Laravel API + Database
        ^
        | HTTPS JSON API
        |
Admin React Frontend
```

### Frontend

- Existing React/Vite prototype and current MVP designs remain the visual baseline.
- The user frontend displays Reporting, Marketing Intelligence, and MMM data.
- The Admin frontend manages users, agencies, clients/workspaces, roles, settings, imports, and audit records.
- Neither frontend connects directly to the database.

### Backend

- Laravel owns authentication, authorization, validation, CRUD, CSV processing, database access, and audit logs.
- PostgreSQL or the agreed project database stores the data.
- The API is deployed to the development server and exposed through an HTTPS development URL.
- The API URL is configured through environment variables and never hardcoded.

Example frontend environment variable:

```env
VITE_API_BASE_URL=https://api-dev.example.com/api
```

## 3. Data Strategy

Use a hybrid data model.

### Seeders Are Used For

- Admin user
- Roles and permissions
- Agencies and workspaces
- Default settings
- Demo fallback records
- Static configuration values

### CSV Import Is Used For

- Reporting campaign/channel data
- Marketing Intelligence audience and demographic data
- MMM media and business-outcome data

### Third-Party APIs Are Not Included

Do not build Meta, Google, YouTube, DV360, Campaign Manager, TikTok, LinkedIn, Pinterest, CRM, or research API integrations in this 13-day release. These are next-phase work.

## 4. CSV Import Contract

The Admin Panel will provide a basic Data Import screen.

### Import Flow

1. Admin selects the dataset type.
2. Admin downloads the correct template.
3. Admin uploads a CSV.
4. Laravel validates required columns and basic data types.
5. Admin previews valid rows and errors.
6. Admin confirms the import.
7. Laravel stores the records and import batch.
8. React reads the updated data through APIs.

### Reporting CSV

Required or supported columns:

```text
date,campaign,channel,spend,impressions,clicks,conversions,revenue,creative,status
```

Used by:

- Executive Summary
- Detailed Metrics
- Channels
- Audience summaries
- Creative
- Reports

### Marketing Intelligence CSV

```text
section,metric,value,category,geography,source,planning_implication
```

Used by:

- Audience Profile
- Demographic Profile
- Geographic Insights
- Behaviour
- Media and Brand Intelligence
- Insights and Comparison

### MMM CSV

```text
date,channel,spend,impressions,clicks,conversions,revenue,promotion,seasonality
```

Used by:

- MMM input
- Data readiness
- Channel contribution
- ROAS
- Scenario planning
- AI readout

### CSV Rules

- Use predefined templates only.
- Do not support arbitrary CSV structures in this release.
- Do not build automatic column mapping for every possible file format.
- Reject missing required columns.
- Show row-level errors where practical.
- Track `import_batch_id`, source type, uploaded by, uploaded date, and status.
- Keep the original uploaded file when storage is available.
- Do not silently overwrite data.
- Use a clear append or replace decision per dataset.
- Seeded demo data must remain available as a fallback.

## 5. Admin Panel Scope

### Include

- Admin login and protected access
- User list
- Create/edit/deactivate users
- Role assignment
- Agency list and basic create/edit
- Client/workspace list and basic create/edit
- Basic settings
- Connector status placeholders
- KPI configuration display
- Data Import screen
- CSV template download
- CSV preview and validation result
- Import history
- Audit log

### Do Not Include

- External platform OAuth
- Live connector setup
- Scheduled connector synchronization
- Enterprise permission builder
- Custom domains
- Full white-labeling
- Advanced billing
- Full organization governance
- Advanced audit search/export

## 6. User Frontend Scope

### Reporting Dashboard

Keep the existing sub-tabs:

- Executive Summary
- Detailed Metrics
- Channels
- Audience
- Creative
- Reports

The frontend must read data through Laravel APIs. It must support the current MVP interactions: workspace switching, date range, search, filters, sorting, charts, report states, and AI summary display.

### Marketing Intelligence

Keep the existing sub-tabs:

- Audience Profile
- Demographic Profile
- Geographic Insights
- Behaviour
- Media and Brand Intelligence
- Insights and Comparison

The sections can use seeded or CSV-imported data. They do not require live research APIs in this release.

### Media Mix Model

Keep the existing single-page design:

- Model input
- Data readiness
- Mapping preview
- Model settings
- Outcome story
- Channel diagnosis
- ROAS and contribution
- Carryover and diminishing returns explanation
- Budget planning
- What-if scenario
- AI readout

Use one agreed demo/model calculation approach. Do not build production statistical modeling in this release.

## 7. Developer Ownership

### Developer 1: User Frontend

Owns:

- Reporting Dashboard
- Marketing Intelligence
- MMM frontend
- Shared user layout and navigation
- API client and frontend data adapters
- Loading, empty, and error states
- Responsive behavior
- Client demo flow

### Developer 2: Laravel API and Admin Frontend

Owns:

- Laravel project and development deployment
- Database migrations and seeders
- Authentication and permission policies
- Admin CRUD APIs
- CSV import APIs
- Admin React frontend
- Audit logging
- API documentation
- Development database consistency

### Shared Ownership

Both developers review:

- API request/response shapes
- Database field meaning
- Permissions
- Client-facing wording
- Release readiness
- Bugs crossing frontend and backend boundaries

## 8. API Contract

Every endpoint must be documented before frontend integration.

Suggested response format:

```json
{
  "data": {},
  "message": "Request completed successfully",
  "errors": null
}
```

Suggested endpoints:

```text
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}

GET    /api/admin/agencies
POST   /api/admin/agencies
PUT    /api/admin/agencies/{id}

GET    /api/admin/workspaces
POST   /api/admin/workspaces
PUT    /api/admin/workspaces/{id}

GET    /api/admin/roles
PUT    /api/admin/users/{id}/role

GET    /api/admin/settings
PUT    /api/admin/settings

GET    /api/admin/audit-logs

POST   /api/admin/imports/preview
POST   /api/admin/imports/commit
GET    /api/admin/imports

GET    /api/dashboard/summary
GET    /api/dashboard/metrics
GET    /api/campaigns
GET    /api/channels
GET    /api/audience
GET    /api/creative
GET    /api/reports
GET    /api/marketing-intelligence
GET    /api/mmm/results
```

## 9. Git and Codex Workflow

Recommended repositories:

```text
mosaiq-user-frontend
mosaiq-admin-frontend
mosaiq-laravel-api
```

If the team keeps one repository temporarily, use clear top-level folders and the same ownership boundaries.

Branches:

```text
main
develop
codex/user-reporting
codex/user-intelligence-mmm
codex/admin-users-workspaces
codex/api-auth-imports
```

Rules:

- Never commit directly to `main`.
- Merge feature branches into `develop` through review.
- Keep commits small and focused.
- Pull or rebase from `develop` every morning.
- Do not edit another developer's owned files without coordination.
- Do not commit `.env` files or secrets.
- Test every merged feature in the browser.
- Tag the final launch commit.

### Codex Rules

Codex may be used for:

- Component scaffolding
- Laravel models, migrations, and CRUD boilerplate
- CSV parsing and validation scaffolding
- API client code
- Test and smoke-check generation
- Documentation
- Refactoring suggestions

Every generated change must be reviewed, run locally, and checked against the agreed scope. Codex must not decide permissions, data meaning, security rules, or client commitments without developer review.

## 10. 13 Day Delivery Schedule

| Day | User Frontend Developer | Laravel/Admin Developer |
|---|---|---|
| 1 | Freeze screen scope, set up API client, confirm data shapes | Set up Laravel, database, authentication, and API contract |
| 2 | Build frontend data adapters and shared API states | Create migrations, models, seeders, roles, users, agencies, and workspaces |
| 3 | Connect login and current-user state | Implement auth, policies, user, agency, and workspace APIs |
| 4 | Bind Executive Summary and Detailed Metrics | Build Admin user/workspace lists and forms |
| 5 | Bind Channels, Audience, Creative, and Reports | Add roles, settings, connector status, and validation |
| 6 | Polish Reporting filters, charts, and responsive behavior | Build CSV preview, validation, import batch, and import history APIs |
| 7 | Bind Audience Profile, Demographic Profile, and Geographic Insights | Build Admin Data Import screen and deploy development API |
| 8 | Bind Behaviour, Media/Brand, and Insights/Comparison | Complete Admin CRUD, permissions, and audit log |
| 9 | Bind MMM input, readiness, mapping, settings, and results | Complete MMM/demo data endpoints and resolve integration issues |
| 10 | Bind MMM planning, scenarios, AI readout, and navigation | Finalize seeders, imports, validation, and deployment configuration |
| 11 | Full frontend walkthrough and responsive fixes | Full API/Admin walkthrough and authorization checks |
| 12 | Client walkthrough fixes and demo-data cleanup | API/admin fixes, migration verification, and handover notes |
| 13 | Final build and demo preparation | Final API deployment, database seed/import, and launch support |

## 11. Definition of Done

The release is complete when:

- The three main product areas open correctly.
- Existing MVP navigation and retained sections render without broken routes.
- Admin users can manage core users, agencies, workspaces, roles, and settings.
- Admin changes persist through Laravel APIs and the database.
- CSV templates can be uploaded, previewed, validated, and imported for the agreed datasets.
- User-facing tables and charts read seeded or imported data through internal APIs.
- Loading, empty, success, and error states are implemented for API-backed screens.
- The app works at agreed desktop and mobile sizes.
- The API is deployed to the development URL.
- The final walkthrough uses known seeded/imported data.
- Third-party integrations are documented as next-phase work.

## 12. Out of Scope

- Real advertising platform API integrations
- Live research APIs
- Live CRM, ecommerce, or sales integrations
- Production MMM statistical model
- Scheduled data synchronization
- Multi-file reconciliation
- Automatic CSV column mapping
- Advanced data warehouse integration
- Production security hardening and penetration testing
- Full UAT and extended post-launch support
- PowerPoint reporting
- Automated platform write-back

## 13. Daily Alignment Checklist

At the end of each day, both developers confirm:

- What was completed
- What is currently blocked
- Which API endpoints changed
- Which database migrations changed
- Which frontend screens changed
- Which items moved to next phase
- Whether the development server is updated
- Whether the client demo path still works

This file is the shared source of truth. Any scope change must be added here before implementation begins.
