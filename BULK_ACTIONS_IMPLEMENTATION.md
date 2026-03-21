# Bulk Selection & Actions Implementation

## Overview
Added comprehensive bulk selection and actions for managing multiple leads simultaneously. Users can now select individual leads or all leads on a page, then perform bulk actions like refusing or deleting them.

## Files Created

### 1. `/components/leads/LeadBulkActions.tsx` (222 lines)
**Purpose:** Sticky action bar displaying at the bottom when leads are selected.

**Features:**
- Fixed bottom sticky bar with shadow (z-40, shadow-2xl)
- Selected leads counter with singular/plural handling
- Clear selection button
- Action buttons: "Refuse All" (yellow) and "Delete" (red)
- Built-in confirmation dialogs for destructive actions
- Toast notifications for success/error feedback
- Disabled state during processing

**Components:**
- `ConfirmDialog`: Reusable modal for confirming destructive actions
- `Toast`: Toast notification component
- Main `LeadBulkActions` component

**Styling:**
- Fixed position sticky bar
- Responsive padding and gap
- Danger colors (red/yellow) for destructive actions
- Blue accent for checkboxes (accent-blue-900)

## Files Updated

### 2. `/components/leads/EnhancedLeadRow.tsx` (147 lines)
**Changes:**
- Added `isSelected` prop (boolean, default false)
- Added `onToggleSelection` prop (function, optional)
- Checkbox rendered at start of grid (md:col-span-1)
- Adjusted other columns to accommodate checkbox:
  - Name & Contact: 4 → 3 cols
  - Product: 2 cols (unchanged)
  - Status: 2 cols (unchanged)
  - Last Action: 3 cols (unchanged)
  - Actions: 1 col (unchanged)
- Selected row styling: `bg-blue-50 border-blue-300 shadow-md`
- Checkbox handler with event.stopPropagation() to prevent row click
- Checkbox styling: `accent-blue-900` with cursor-pointer

**New Handler:**
```typescript
const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  e.stopPropagation()
  onToggleSelection?.(lead.id)
}
```

### 3. `/components/pages/LeadsPageV2.tsx` (234 lines)
**Changes:**
- Added `selectedLeads` state as `Set<string>` for efficient tracking
- Imported `LeadBulkActions` component
- Added `toggleLeadSelection(leadId)` function
- Added `toggleSelectAll()` function for page-level selection
- Added `clearSelection()` function
- Added `paginatedLeads` calculation
- Added `allPaginatedLeadsSelected` check for header checkbox state
- Modified main container to add padding-bottom when selections exist
- Added "Select all on page" checkbox in pagination header
- Pass selection props to `EnhancedLeadRow`:
  - `isSelected={selectedLeads.has(lead.id)}`
  - `onToggleSelection={toggleLeadSelection}`
- Conditional rendering of `LeadBulkActions` when `selectedLeads.size > 0`

## Features Implemented

### 1. Individual Selection
- Click checkbox on any lead row to select/deselect
- Checkbox click stops propagation (doesn't trigger row click)
- Visual feedback: selected row highlighted with blue background
- Cursor indicates clickability

### 2. Page-Level Selection
- "Select all on page" checkbox in pagination header
- Automatically checked when all visible leads are selected
- Clicking toggles selection of all leads on current page
- Works with any pagination size (20, 50, 100 items)

### 3. Bulk Actions
- **Refuse All**: Marks selected leads as REFUSED with bulk reason
- **Delete**: Removes selected leads from database
- Both actions show confirmation dialogs before executing
- Processing state disables buttons during execution

### 4. User Experience
- Selection count displayed dynamically ("X leads selected")
- Clear button to quickly deselect all
- Toast notifications for success/error feedback
- Sticky bar remains visible while scrolling
- Selection clears after successful action
- Responsive layout on mobile (checkboxes maintain clickability)

## Technical Implementation

### State Management
```typescript
const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
```
Using `Set<string>` for O(1) lookup and efficient duplicate prevention.

### Selection Logic
```typescript
const toggleLeadSelection = (leadId: string) => {
  setSelectedLeads((prev) => {
    const newSet = new Set(prev)
    if (newSet.has(leadId)) {
      newSet.delete(leadId)
    } else {
      newSet.add(leadId)
    }
    return newSet
  })
}
```

### Bulk Operations
```typescript
await Promise.all(
  Array.from(selectedLeadIds).map((leadId) =>
    api.post(`/leads/${leadId}/refuse`, {...})
  )
)
```
Parallel API calls for maximum performance.

## Styling Details

### Selected Row
- Background: `bg-blue-50` (light blue)
- Dark mode: `dark:bg-blue-900/20`
- Border: `border-blue-300`
- Shadow: `shadow-md`

### Checkbox Styling
- Size: `w-5 h-5`
- Border radius: `rounded`
- Accent color: `accent-blue-900`
- Cursor: `cursor-pointer`

### Bulk Actions Bar
- Position: Fixed at bottom (z-40)
- Background: White with top border
- Shadow: `shadow-2xl`
- Padding: `p-4` with `px-4 py-4`
- Responsive: Full width with gap management

### Action Buttons
- Refuse All: Yellow (`bg-yellow-600 hover:bg-yellow-700`)
- Delete: Red (`bg-red-600 hover:bg-red-700`)
- Disabled opacity: `disabled:opacity-50`
- Font: Medium weight, white text

## API Integration
- Uses existing `api` client from `@/lib/api`
- Endpoints called:
  - `POST /leads/:id/refuse` - Bulk refuse
  - `DELETE /leads/:id` - Bulk delete
- Parallel Promise.all() for concurrent requests
- Error handling with user-friendly messages

## Responsive Behavior
- Desktop: Full grid layout with all columns visible
- Mobile: Grid adapts, checkbox remains accessible
- Bulk actions bar: Full width with responsive padding
- "Select all on page": Only shown when leads exist

## Future Enhancements
- Bulk assign to agent (if user field exists)
- Bulk update status (in-progress, quoted, etc.)
- Bulk add notes/comments
- Export selected leads
- Undo functionality for recent bulk actions
- Keyboard shortcuts (Ctrl+A for select all)

## Files Involved
```
/Users/ayrton/Documents/Travail/Suivi des leads/
├── components/
│   ├── leads/
│   │   ├── LeadBulkActions.tsx          [NEW]
│   │   └── EnhancedLeadRow.tsx          [UPDATED]
│   └── pages/
│       └── LeadsPageV2.tsx              [UPDATED]
```

## Testing Checklist
- [ ] Click checkbox on individual lead
- [ ] Select multiple leads across page
- [ ] "Select all on page" checkbox works
- [ ] Selected row highlights in blue
- [ ] Bulk action buttons appear when selection > 0
- [ ] Confirmation dialog shows correct count
- [ ] Refuse All successfully marks as REFUSED
- [ ] Delete successfully removes leads
- [ ] Toast notifications display
- [ ] Selection clears after action
- [ ] Clear button works
- [ ] Responsive on mobile
- [ ] Works with pagination
