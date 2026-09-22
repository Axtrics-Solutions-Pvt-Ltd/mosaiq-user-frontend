# MOSAIQ Shared Frontend States

Import shared states from:

```jsx
import {
  FullPageLoader,
  InlineLoader,
  ButtonProgress,
  EmptyState,
  ApiErrorState,
  PermissionDeniedState,
  OfflineState,
  SuccessState,
  NetworkStatusBanner,
  CardSkeleton,
  TableSkeleton,
} from '@/app/components/states';
```

## Loading

```jsx
<FullPageLoader title="Loading reports" message="Preparing campaign results." />
<InlineLoader label="Refreshing metrics…" />
<button disabled><ButtonProgress label="Saving…" /></button>
```

## Empty and error states

```jsx
<EmptyState
  title="No campaigns found"
  message="Change the date range or clear the active filters."
  actionLabel="Clear filters"
  onAction={clearFilters}
/>

<ApiErrorState
  title="Reports are unavailable"
  message={error.message}
  onRetry={reload}
/>
```

Pass `compact` when a state belongs inside an existing card, modal, or authentication shell.

## Permission, offline and success

```jsx
<PermissionDeniedState compact />
<OfflineState onRetry={reload} />
<SuccessState compact title="Import completed" message="124 rows were added." />
```

`NetworkStatusBanner` is mounted globally and appears automatically when the browser reports that it is offline.

## Skeletons

```jsx
<CardSkeleton count={3} />
<TableSkeleton rows={6} columns={5} label="Loading campaign table" />
```

Skeletons are visual placeholders and are hidden from assistive technology. The table skeleton includes a screen-reader loading label.
