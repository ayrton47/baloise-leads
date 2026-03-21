# Toast Notification System

A reusable toast notification system for the Baloise Leads app, built with React Context and Tailwind CSS.

## Components

### 1. **lib/toast.ts** - Toast Service & Context
- Exports `ToastProvider` component to wrap your app
- Exports `useToast()` hook for accessing toast functionality
- Exports types: `Toast`, `ToastType`

### 2. **components/ToastContainer.tsx** - Display Container
- Fixed position at top-right corner (z-50)
- Maps over toast list from context
- Auto-dismisses based on duration
- Accessible with ARIA live region

### 3. **components/Toast.tsx** - Individual Toast Item
- Compact card design with icon and close button
- Color-coded by type:
  - **success** (green): ✓ checkmark icon
  - **error** (red): ✗ X icon
  - **info** (blue): ℹ info icon
- Smooth animations: slide in from right, fade out on close
- Auto-dismiss after duration (default: 3000ms)

### 4. **app/layout.tsx** - Integration
- Wrapped with `ToastProvider`
- `ToastContainer` rendered inside provider

## Usage

### Basic Usage

```typescript
'use client'

import { useToast } from '@/lib/toast'

export function MyComponent() {
  const { showToast } = useToast()

  const handleSuccess = () => {
    showToast('Operation completed successfully!', 'success')
  }

  const handleError = () => {
    showToast('Something went wrong', 'error', 5000)
  }

  const handleInfo = () => {
    showToast('This is an informational message', 'info')
  }

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  )
}
```

### API

#### `useToast()` Hook

Returns an object with:
- `toasts: Toast[]` - Array of current toasts
- `showToast(message, type?, duration?)` - Display a toast
- `removeToast(id)` - Manually remove a toast

#### `showToast(message, type?, duration?)`

Parameters:
- `message` (string): The toast message
- `type` (ToastType): 'success' | 'error' | 'info' (default: 'info')
- `duration` (number): Time in milliseconds before auto-dismiss (default: 3000)

Examples:
```typescript
// Success toast (auto-dismiss in 3 seconds)
showToast('Lead created successfully', 'success')

// Error toast (auto-dismiss in 5 seconds)
showToast('Failed to update lead', 'error', 5000)

// Info toast that doesn't auto-dismiss
showToast('Processing your request...', 'info', 0)
```

## Features

- **Type-safe**: Full TypeScript support
- **Accessible**: ARIA live region for screen readers
- **Auto-dismiss**: Configurable duration per toast
- **Smooth animations**: Slide in/out transitions
- **Stacked**: Multiple toasts displayed in a queue
- **Manual close**: X button to dismiss immediately
- **No external dependencies**: Uses React Context and Tailwind CSS

## Styling

Tailwind classes used:
- **Position**: `fixed top-4 right-4 z-50`
- **Animation**: `duration-300` with `translate-x-full` for exit
- **Colors**: `bg-{color}-50`, `border-{color}-200`, `text-{color}-800`
- **Icons**: Checkmark, X, and info icons using SVG

## Integration Points

1. **Login/Register flows**: Show success/error on auth actions
2. **Lead operations**: Success on create, update, refuse, quote, callback
3. **API errors**: Display error messages from failed requests
4. **Validations**: Show info/warning messages

Example in API integration:
```typescript
const { showToast } = useToast()

try {
  await createLead(leadData)
  showToast('Lead created successfully', 'success')
} catch (error) {
  showToast('Failed to create lead', 'error')
}
```

## Performance

- Uses `React.useState` for toast state management
- Context prevents unnecessary re-renders
- Animations use CSS transforms (GPU-accelerated)
- Auto-cleanup of expired toasts
