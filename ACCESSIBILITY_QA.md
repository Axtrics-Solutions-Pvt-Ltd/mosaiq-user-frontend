# MOSAIQ Authentication Accessibility QA

**Reviewed:** 2026-09-18  
**Scope:** `/login`, `/forgot-password`, `/reset-password`, `/invite/[token]`, `/invite-invalid`, and `/access-denied`

## Responsive coverage

The authentication shell was checked at:

- Desktop: `1440 × 900`
- Tablet: `768 × 1024`
- Narrow mobile: `320 × 568`

At 900px and below, the decorative marketing panel is removed and the authentication card becomes the primary full-width layout. At 480px and below, metadata uses a resilient two-column grid, actions wrap, long text can break safely, and the page remains vertically scrollable without horizontal overflow.

Use `/invite/long-content-demo` in mock mode to repeat the long workspace-name and email test.

## Keyboard and focus

The verified login focus order is:

1. MOSAIQ home link
2. Email
3. Password
4. Show/hide password
5. Remember me
6. Forgot password
7. Sign in

Links, buttons, checkboxes, and inputs have visible `:focus-visible` indicators. Password visibility is a keyboard-operable pressed-state button with a changing accessible label.

## Labels and announcements

- Every authentication input has an explicit label.
- Required fields expose the native `required` attribute.
- Invalid fields expose `aria-invalid` and reference their message through `aria-describedby`.
- Field errors and request failures use alert semantics.
- Success, loading, and password-requirement changes use polite status announcements.
- Busy forms expose `aria-busy` while requests are in progress.
- Invitation metadata uses a labelled definition list.
- Access denied exposes a page-level `h1`.

## Contrast and user preferences

Measured text contrast ratios include:

| Element | Ratio |
|---|---:|
| Brand links | 5.19:1 |
| Muted body text | 4.81:1 |
| Primary button text | 5.37:1 |
| Notice text | 6.51:1 |
| Error text | 5.69:1 |
| Marketing-panel body text | 5.75:1 |
| Marketing-panel copyright | 6.92:1 |

These exceed the WCAG AA 4.5:1 requirement for normal text. Authentication and shared-state animations respect `prefers-reduced-motion`, and forced-colors mode receives explicit borders and focus treatment.

