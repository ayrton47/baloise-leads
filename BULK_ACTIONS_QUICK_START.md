# Bulk Actions - Quick Start Guide

## What Was Added

Bulk selection and actions for leads. Users can now:
1. Click checkboxes to select individual leads
2. Use "Select all on page" to select all visible leads
3. Perform bulk actions: Refuse All, Delete
4. See a sticky action bar at the bottom with selected count

## How It Works

### Individual Selection
```
User clicks checkbox → toggleLeadSelection(leadId) → updates Set
Selected row highlights in blue (bg-blue-50)
```

### Page Selection
```
User clicks "Select all on page" → toggleSelectAll()
→ toggles all leads on current page
```

### Bulk Actions
```
User clicks action button → shows confirmation dialog
→ Promise.all() for parallel API calls
→ Toast notification on success/error
→ Selection clears after action
```

## Key Components

### LeadBulkActions.tsx
- Sticky bar at bottom (fixed position, z-40)
- Shows selected count
- Action buttons with confirmation dialogs
- Toast notifications

### EnhancedLeadRow.tsx (Updated)
- Checkbox at start (col-span-1)
- isSelected prop for styling
- onToggleSelection handler
- Blue highlight when selected

### LeadsPageV2.tsx (Updated)
- selectedLeads state (Set<string>)
- Selection handlers
- Passes selection props to rows
- Conditionally renders bulk actions bar

## Files Modified

```
/Users/ayrton/Documents/Travail/Suivi des leads/
├── components/leads/
│   ├── LeadBulkActions.tsx      [NEW - 222 lines]
│   └── EnhancedLeadRow.tsx      [UPDATED - 147 lines]
└── pages/
    └── LeadsPageV2.tsx          [UPDATED - 234 lines]
```

## Features at a Glance

| Feature | Status |
|---------|--------|
| Individual selection | ✓ Checkbox per row |
| Visual feedback | ✓ Blue highlight |
| Select all page | ✓ In pagination header |
| Bulk refuse | ✓ With confirmation |
| Bulk delete | ✓ With confirmation |
| Toast notifications | ✓ Success/error |
| Auto-clear selection | ✓ After action |
| Responsive layout | ✓ Mobile-friendly |
| Dark mode support | ✓ Classes included |

## Usage

1. Click checkbox to select individual leads
2. Click "Select all on page" to select entire page
3. Click action button (Refuse All/Delete)
4. Confirm action in dialog
5. Watch toast notification
6. Selection auto-clears

## Styling Applied

- **Selected row**: `bg-blue-50 dark:bg-blue-900/30`
- **Checkbox**: `accent-blue-900`
- **Danger buttons**: Yellow (refuse) & Red (delete)
- **Sticky bar**: Fixed bottom with shadow-2xl
- **Responsive**: Works on all screen sizes

## API Endpoints Used

- `POST /leads/:id/refuse` - Refuse action
- `DELETE /leads/:id` - Delete action

Both support parallel execution via Promise.all().

## Performance Notes

- Uses `Set<string>` for O(1) selection lookup
- Parallel API calls with Promise.all()
- Efficient pagination with slicing
- No unnecessary re-renders with React best practices

## Testing Tips

1. Select a few leads → see blue highlight
2. Click "Select all on page" → all should highlight
3. Click action button → confirm dialog appears
4. Confirm → toast shows success/error
5. Page updates and selection clears
6. Try with different pagination sizes

## Future Enhancements

- Bulk assign to agent
- Bulk status update
- Bulk notes/comments
- Export selected leads
- Undo recent actions
- Keyboard shortcuts (Ctrl+A)
