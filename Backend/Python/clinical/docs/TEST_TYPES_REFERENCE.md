# TestType Reference - Standard Hearing Tests

This document lists all the test types that need to be added to the `TestType` table for the billing system to work correctly.

## Required Test Types

The following test types are automatically mapped from `VisitTestPerformed` boolean fields to `TestType` names:

| TestType Name | Code | Default Cost (₹) | Description |
|--------------|------|------------------|-------------|
| **PTA** | PTA | 500.00 | Pure Tone Audiometry - Measures hearing sensitivity at different frequencies |
| **Immittance** | IMP | 400.00 | Immittance Testing - Evaluates middle ear function and eardrum mobility |
| **OAE** | OAE | 600.00 | Otoacoustic Emissions - Tests inner ear (cochlea) function |
| **BERA/ASSR** | BERA | 1500.00 | Brainstem Evoked Response Audiometry / Auditory Steady State Response - Objective hearing assessment |
| **SRT** | SRT | 300.00 | Speech Reception Threshold - Minimum level at which speech is understood |
| **SDS** | SDS | 300.00 | Speech Discrimination Score - Ability to understand speech at comfortable listening levels |
| **UCL** | UCL | 300.00 | Uncomfortable Loudness Level - Maximum comfortable listening level |
| **Free Field** | FF | 400.00 | Free Field Testing - Hearing assessment in an open sound field |

## Important Notes

1. **Exact Name Matching**: The `TestType.name` field must match exactly (case-insensitive) with the names listed above. The serializer uses `TestType.objects.get(name__iexact=testtype_name)`.

2. **Costs**: The costs shown above are example/default values. Adjust them according to your clinic's pricing.

3. **Clinic-Specific Pricing**: You can create clinic-specific test types by setting the `clinic` field. If `clinic` is `NULL`, the test type applies to all clinics.

4. **Other Test**: If patients have custom tests entered in the `other_test` field, you'll need to create corresponding `TestType` records with matching names for billing to work.

## How to Populate Test Types

### Option 1: Using Django Management Command (Recommended)

```bash
# Create all test types with default costs (global/clinic=None)
python manage.py populate_test_types

# Create test types for a specific clinic
python manage.py populate_test_types --clinic-id 1

# Update existing test types with new costs
python manage.py populate_test_types --update
```

### Option 2: Using Django Admin

1. Go to Django Admin → Clinical → Test Types
2. Add each test type manually with the exact names listed above
3. Set appropriate costs

### Option 3: Using Django Shell

```python
from clinical.models import TestType

test_types = [
    {'name': 'PTA', 'code': 'PTA', 'cost': 500.00, 'description': 'Pure Tone Audiometry'},
    {'name': 'Immittance', 'code': 'IMP', 'cost': 400.00, 'description': 'Immittance Testing'},
    {'name': 'OAE', 'code': 'OAE', 'cost': 600.00, 'description': 'Otoacoustic Emissions'},
    {'name': 'BERA/ASSR', 'code': 'BERA', 'cost': 1500.00, 'description': 'Brainstem Evoked Response Audiometry'},
    {'name': 'SRT', 'code': 'SRT', 'cost': 300.00, 'description': 'Speech Reception Threshold'},
    {'name': 'SDS', 'code': 'SDS', 'cost': 300.00, 'description': 'Speech Discrimination Score'},
    {'name': 'UCL', 'code': 'UCL', 'cost': 300.00, 'description': 'Uncomfortable Loudness Level'},
    {'name': 'Free Field', 'code': 'FF', 'cost': 400.00, 'description': 'Free Field Testing'},
]

for test_data in test_types:
    TestType.objects.get_or_create(
        name=test_data['name'],
        defaults=test_data
    )
```

## Verification

After populating test types, verify they exist:

```python
from clinical.models import TestType

# List all test types
for tt in TestType.objects.all():
    print(f"{tt.name} - ₹{tt.cost}")
```

## Field Mapping Reference

The mapping from `VisitTestPerformed` fields to `TestType` names is:

- `pta` → `PTA`
- `immittance` → `Immittance`
- `oae` → `OAE`
- `bera_assr` → `BERA/ASSR`
- `srt` → `SRT`
- `sds` → `SDS`
- `ucl` → `UCL`
- `free_field` → `Free Field`
- `other_test` → (must match `TestType.name` exactly)

