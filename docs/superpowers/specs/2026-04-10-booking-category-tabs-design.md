# Booking Modal — Category Tabs Design

**Date:** 2026-04-10  
**Status:** Approved

## Problem

The booking modal step 1 ("Choose your service") shows all ~46 services in a single flat scrollable list, making it hard to find the right service quickly.

## Solution

Add a horizontal tab bar above the service list that filters by category. Only one category is shown at a time.

## Design

### Tab Bar
- Displayed at the top of the left column in the "service" step, above the service list
- One tab per unique category, ordered by `category.order` (already provided in service data)
- On open: first category selected by default
- On mobile: tabs scroll horizontally with `overflow-x-auto`
- Active tab: filled pill style using `bg-secondary text-primary`
- Inactive tab: outlined pill style using `border-beige-200 text-beige-600`

### Filtered List
- Only services matching `selectedCategory` are shown
- Everything else (click handler, layout, styling) stays unchanged

## Files Changed

- `src/components/CalBookingOverlay.tsx` only

## State Added

- `selectedCategory: string | null` — title of the active category tab; initialized to the first category on mount/open

## No Changes To
- Sanity schema
- Service data fetching
- Add-ons, therapist, review, or calendar steps
