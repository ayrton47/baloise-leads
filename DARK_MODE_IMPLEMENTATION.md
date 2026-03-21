# Dark Mode Implementation - Baloise Leads

## Summary
Full dark mode support has been added to the Baloise Leads application with comprehensive styling across all UI components. Users can toggle between light and dark themes with automatic persistence and system preference detection.

## New Files Created

### 1. `lib/useTheme.ts` - Theme Hook
React hook for managing dark mode state:
- **State management**: `isDark` boolean state
- **localStorage persistence**: Saves theme preference with key `'theme'`
- **System preference detection**: Falls back to `prefers-color-scheme` media query
- **toggle()**: Function to switch between light/dark modes
- **isMounted**: Prevents hydration mismatch issues

### 2. `components/ThemeToggle.tsx` - Theme Switch Button
Interactive button in the header to toggle dark mode:
- **Icons**: Sun icon (light mode) / Moon icon (dark mode)
- **Styling**: Subtle hover effect with gray-100/gray-800 backgrounds
- **Accessibility**: Full ARIA labels and keyboard support
- **Visibility**: Hidden until component is mounted (prevents hydration issues)

### 3. `components/ThemeProvider.tsx` - Theme Initialization
Client component that initializes theme on app startup:
- Runs on mount before rendering children
- Checks localStorage for saved theme preference
- Falls back to system preference if not saved
- Applies theme via `document.documentElement.classList`
- Prevents flash of unstyled content (FOUC)

## Updated Files

### Configuration
- **tailwind.config.js**: Added `darkMode: 'class'` for class-based dark mode

### Layout & Main Pages
- **app/layout.tsx**: 
  - Added ThemeProvider wrapper
  - Added `suppressHydrationWarning` to html
  - Added body styles: `bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`

- **components/layout/LeadsHeader.tsx**:
  - Dark backgrounds: `dark:bg-gray-900`
  - Dark borders: `dark:border-gray-800`
  - Dark text: `dark:text-white`
  - Added ThemeToggle button in header

### Hero & Filters
- **components/layout/LeadsHeroSection.tsx**:
  - Dark gradients: `dark:from-blue-950 dark:to-blue-900`
  - Dark stat boxes: `dark:bg-blue-600/30`

- **components/layout/LeadsFiltersBar.tsx**:
  - Dark backgrounds: `dark:bg-gray-900`
  - Dark form inputs: `dark:bg-gray-800 dark:border-gray-700 dark:text-white`

### Lead Components
- **components/leads/EnhancedLeadRow.tsx**:
  - Dark cards: `dark:bg-gray-800 dark:border-gray-700`
  - Dark hover states: `dark:hover:bg-gray-700/50`
  - Smooth transitions on all color changes

- **components/leads/StatusBadge.tsx**:
  - Dark variants for all 6 statuses (NEW, IN_PROGRESS, TO_CONTACT, QUOTED, REFUSED, CONVERTED)
  - Format: `dark:bg-[color]-900/20 dark:text-[color]-300 dark:border-[color]-700`

- **components/leads/EmptyState.tsx**:
  - Dark backgrounds: `dark:bg-gray-900`
  - Dark buttons: `dark:bg-blue-700 dark:hover:bg-blue-800`

### Forms & Actions
- **components/LeadActionPanel.tsx**:
  - Dark panel: `dark:bg-blue-900/20 dark:border-blue-700`
  - Dark form controls: `dark:bg-gray-800 dark:border-gray-600`
  - Dark buttons: `dark:bg-blue-700 dark:hover:bg-blue-800`

- **components/AddLeadModal.tsx**:
  - Dark modal: `dark:bg-gray-800`
  - Dark inputs/selects: `dark:bg-gray-700 dark:border-gray-600`
  - Dark buttons: `dark:bg-blue-700`

### Authentication
- **components/pages/LoginPage.tsx**:
  - Dark gradient background: `dark:from-gray-950 dark:to-gray-900`
  - Dark card: `dark:bg-gray-800 dark:border-gray-700`
  - Dark form inputs: Full dark styling

### Notifications
- **components/Toast.tsx**:
  - Dark notification backgrounds: `dark:bg-[color]-900/20`
  - Dark border/text colors
  - Color variants for success, error, and info toasts

## Color Scheme

### Dark Mode Palette
| Element | Light | Dark | Hex |
|---------|-------|------|-----|
| Background | white | gray-900 | #111827 |
| Card/Panel | white | gray-800 | #1F2937 |
| Border | gray-300 | gray-700 | #374151 |
| Text Primary | gray-900 | gray-100 | #F3F4F6 |
| Text Secondary | gray-600 | gray-400 | #9CA3AF |

### Status Colors (Dark Mode)
- **NEW**: `dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700`
- **IN_PROGRESS**: `dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700`
- **TO_CONTACT**: `dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700`
- **QUOTED**: `dark:bg-green-900/20 dark:text-green-300 dark:border-green-700`
- **REFUSED**: `dark:bg-red-900/20 dark:text-red-300 dark:border-red-700`
- **CONVERTED**: `dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700`

## Features

### 1. User Preferences
- **Manual toggle**: Sun/Moon button in header
- **Persistent**: Theme saved to localStorage
- **System preference**: Auto-detects `prefers-color-scheme: dark`
- **Default**: System preference if no manual selection

### 2. Smooth Transitions
- All color changes use `transition-colors`
- 300ms duration for smooth theme switching
- No jarring visual changes

### 3. Accessibility
- Full ARIA labels on theme toggle button
- High contrast ratios maintained in both themes
- Keyboard accessible toggle button

### 4. Hydration Safe
- ThemeProvider handles hydration mismatch
- ThemeToggle only renders after mount
- `suppressHydrationWarning` on html element

## Usage

### For Users
1. Click the Sun/Moon icon in the header to toggle dark mode
2. Theme preference is automatically saved
3. Next visit will use the same theme

### For Developers
```tsx
// Access theme in components
import { useTheme } from '@/lib/useTheme'

function MyComponent() {
  const { isDark, isMounted, toggle } = useTheme()
  
  return (
    <button onClick={toggle}>
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  )
}
```

### Styling New Components
Use Tailwind's `dark:` prefix for dark mode variants:
```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors">
  Your content
</div>
```

## Testing Checklist

- [x] Theme toggle button appears in header
- [x] Clicking button switches between light/dark modes
- [x] Theme persists on page reload
- [x] System preference is detected on first visit
- [x] All components have dark mode styles
- [x] Text is readable in both modes (contrast ratio)
- [x] Transitions are smooth
- [x] No hydration warnings in console
- [x] Works on mobile (responsive)
- [x] Status badges display correctly in dark mode

## Browser Support
- All modern browsers supporting CSS class-based dark mode
- Requires CSS custom properties support (all modern browsers)
- localStorage support required for persistence

## Performance
- No performance overhead (uses CSS classes, not inline styles)
- No JavaScript executed on every theme change (uses CSS)
- Minimal bundle size increase (minimal new code)

## Future Enhancements
- Add more theme variants (e.g., system, light, dark, auto)
- Add custom color scheme selection
- Add theme transition animation
- Store user theme preference in database (if authenticated)
