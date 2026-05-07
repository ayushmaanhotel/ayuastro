# Task 3: Fix Kundali Recreation Flow

## Summary
Fixed the kundali recreation flow so users can easily create a new kundali after already having one.

## Changes Made

### 1. InsightsView.tsx
- Added "New Kundali" button with RotateCcw icon in the header area (right side of "Last Updated" / "Live" badges row)
- Implemented confirmation Dialog with:
  - Title: "Create New Kundali?"
  - Description: "This will clear your current chart data. You can always create a new one."
  - Cancel button
  - "Create New" button (gold-dark bg) that calls reset() then setView('onboarding')
- Added imports: DialogDescription, DialogFooter, RotateCcw
- Added state: newKundaliDialogOpen
- Destructured reset from useAyuAstroStore

### 2. ayuastro-store.ts
- Enhanced reset() function to explicitly clear localStorage ('ayuastro-storage') before calling set(initialState)
- This ensures no stale data can persist even if persist middleware has issues
- The subsequent set(initialState) call triggers persist to save clean initial state

### 3. page.tsx
- Added userId to the auto-redirect condition check
- Changed: `if (birthDetails && astrologyData && currentView === 'landing')`
- To: `if (birthDetails && astrologyData && userId && currentView === 'landing')`
- This prevents auto-redirect after reset when userId is null

### 4. OnboardingView.tsx
- Added useEffect that clears all local state variables when birthDetails becomes null
- Resets: localName, localDob, localTob, localPlace, localGender, localRelationship
- Ensures fresh start when entering onboarding after a reset

## Flow Verification
1. User on Insights view clicks "New Kundali" button
2. Confirmation dialog appears
3. User clicks "Create New"
4. reset() clears all store data and localStorage
5. setView('onboarding') navigates to onboarding
6. OnboardingView mounts fresh with empty local state
7. page.tsx auto-redirect does NOT trigger (userId is null)
8. User completes new onboarding, new userId is stored

## Lint Status
Zero errors
