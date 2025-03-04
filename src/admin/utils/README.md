# API Migration Guide: From JavaScript to TypeScript with Supabase

This document outlines the migration process from the old JavaScript API to the new TypeScript Supabase API.

## Overview

We've created a compatibility layer that allows for a gradual migration from the old API to the new Supabase API. This approach ensures that:

1. Existing code continues to work without modification
2. New code can be written against the new API
3. The transition can happen incrementally, reducing risk

## File Structure

- `api.ts` - The original JavaScript API implementation
- `api-supabase.ts` - The new TypeScript Supabase API implementation
- `api-compat.ts` - The compatibility layer that routes requests to either the old or new API
- `migration-helper.ts` - Helper functions for converting between old and new data formats
- `supabase.ts` - TypeScript types and Supabase client initialization

## How to Use the Compatibility Layer

The compatibility layer in `api-compat.ts` provides the same interface as the original API but can route requests to either the old or new implementation based on a feature flag.

### Import the Compatibility Layer

Instead of importing directly from `api.ts`, import from `api-compat.ts`:

```typescript
// Before
import { authAPI, bookingsAPI, carsAPI, statsAPI } from './utils/api';

// After
import { authAPI, bookingsAPI, carsAPI, statsAPI, settingsAPI } from './utils/api-compat';
```

### Enabling the Supabase API

To switch to the Supabase API, change the `USE_SUPABASE_API` flag in `api-compat.ts`:

```typescript
// Set this to true to use the new Supabase API
const USE_SUPABASE_API = true;
```

## Migration Process

1. **Phase 1: Setup (Completed)**
   - Create Supabase database schema
   - Implement TypeScript types
   - Create the new API implementation
   - Create the compatibility layer

2. **Phase 2: Testing**
   - Test the new API implementation with sample data
   - Verify that data conversion works correctly
   - Fix any issues found during testing

3. **Phase 3: Gradual Rollout**
   - Enable the Supabase API for non-critical features first
   - Monitor for issues
   - Gradually enable for more critical features

4. **Phase 4: Complete Migration**
   - Once all features are working with Supabase, set `USE_SUPABASE_API = true` permanently
   - Remove the old API implementation and compatibility layer
   - Update all imports to use the new API directly

## Data Conversion

The `migration-helper.ts` file contains functions to convert between the old and new data formats:

- `convertOldBookingToSupabase`: Converts an old booking object to the new Supabase format
- `convertSupabaseBookingToOld`: Converts a Supabase booking object back to the old format
- `convertOldCarToSupabase`: Converts an old car object to the new Supabase format
- `convertSupabaseCarToOld`: Converts a Supabase car object back to the old format

## Environment Variables

The Supabase API requires the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Make sure these are set in your `.env.local` file or deployment environment.

## Troubleshooting

If you encounter issues during the migration:

1. Check the browser console for error messages
2. Verify that the Supabase environment variables are set correctly
3. Ensure that the data conversion functions are handling all fields correctly
4. Try switching back to the old API by setting `USE_SUPABASE_API = false`

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) 