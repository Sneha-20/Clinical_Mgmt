# Bill API Documentation

## Endpoint: Get Bill Details by Visit ID

### URL
```
GET /api/clinical/bill/visit/<visit_id>/
```

### Authentication
- Requires authentication token
- Requires `ReceptionistPermission` or appropriate permission

### Request Example
```bash
GET /api/clinical/bill/visit/123/
Authorization: Bearer <your_token>
```

### Response Structure

```json
{
  "status": 200,
  "data": {
    // ========== BILL BASIC INFORMATION ==========
    "id": 1,
    "bill_number": "BILL-20250115-0001",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:35:00Z",
    "payment_status": "Pending",
    "notes": "Optional notes about the bill",
    
    // ========== PATIENT INFORMATION ==========
    "patient_id": 5,
    "patient_name": "John Doe",
    "patient_phone": "9876543210",
    "patient_email": "john.doe@example.com",
    "patient_address": "123 Main Street",
    "patient_city": "Mumbai",
    
    // ========== VISIT INFORMATION ==========
    "visit_id": 123,
    "visit_type": "New",
    "visit_date": "2025-01-15T09:00:00Z",
    "appointment_date": "2025-01-15",
    "service_type": "Clinic",
    
    // ========== CLINIC INFORMATION ==========
    "clinic_name": "ABC Hearing Clinic",
    "clinic_address": "456 Clinic Road, Mumbai",
    "clinic_phone": "02212345678",
    
    // ========== BILL ITEMS (Tests & Trials) ==========
    "bill_items": [
      {
        "id": 1,
        "item_type": "Test",
        "test_type": 1,
        "test_type_name": "PTA",
        "test_type_code": "PTA",
        "trial": null,
        "trial_brand": null,
        "trial_model": null,
        "description": "PTA",
        "cost": "500.00",
        "quantity": 1,
        "item_total": 500.0,
        "created_at": "2025-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "item_type": "Test",
        "test_type": 3,
        "test_type_name": "OAE",
        "test_type_code": "OAE",
        "trial": null,
        "trial_brand": null,
        "trial_model": null,
        "description": "OAE",
        "cost": "600.00",
        "quantity": 1,
        "item_total": 600.0,
        "created_at": "2025-01-15T10:30:00Z"
      },
      {
        "id": 3,
        "item_type": "Trial",
        "test_type": null,
        "test_type_name": null,
        "test_type_code": null,
        "trial": 2,
        "trial_brand": "Phonak",
        "trial_model": "Audeo P90",
        "description": "Hearing Aid Trial - Phonak Audeo P90",
        "cost": "5000.00",
        "quantity": 1,
        "item_total": 5000.0,
        "created_at": "2025-01-15T10:32:00Z"
      }
    ],
    
    // ========== SUMMARY INFORMATION ==========
    "items_count": 3,
    "total_amount": "6100.00",
    "discount_amount": "500.00",
    "final_amount": "5600.00",
    "subtotal": 6100.0
  }
}
```

### Response Fields Explanation

#### Bill Basic Information
- `id`: Bill database ID
- `bill_number`: Auto-generated unique bill number (format: `BILL-YYYYMMDD-####`)
- `created_at`: Bill creation timestamp
- `updated_at`: Last update timestamp
- `payment_status`: One of: `"Pending"`, `"Partially Paid"`, `"Paid"`
- `notes`: Optional notes about the bill

#### Patient Information
- `patient_id`: Patient database ID
- `patient_name`: Full name of the patient
- `patient_phone`: Primary phone number
- `patient_email`: Email address (may be null)
- `patient_address`: Full address
- `patient_city`: City name

#### Visit Information
- `visit_id`: Visit database ID
- `visit_type`: Type of visit (e.g., "New", "Follow-up")
- `visit_date`: Visit creation timestamp
- `appointment_date`: Scheduled appointment date
- `service_type`: Service type (e.g., "Clinic", "Home")

#### Clinic Information
- `clinic_name`: Name of the clinic
- `clinic_address`: Clinic address
- `clinic_phone`: Clinic phone number

#### Bill Items Array
Each item in `bill_items` represents a test or trial:

**For Test Items:**
- `item_type`: `"Test"`
- `test_type`: TestType ID
- `test_type_name`: Name of the test (e.g., "PTA", "OAE")
- `test_type_code`: Short code for the test
- `trial`: `null`
- `description`: Test description
- `cost`: Cost per unit
- `quantity`: Quantity (usually 1)
- `item_total`: Total cost for this item (cost × quantity)

**For Trial Items:**
- `item_type`: `"Trial"`
- `test_type`: `null`
- `trial`: Trial ID
- `trial_brand`: Brand name (e.g., "Phonak")
- `trial_model`: Model name (e.g., "Audeo P90")
- `description`: Trial description
- `cost`: Cost of the trial
- `quantity`: Quantity (usually 1)
- `item_total`: Total cost for this item

#### Summary Information
- `items_count`: Total number of items in the bill
- `total_amount`: Subtotal before discount (sum of all items)
- `discount_amount`: Total discount applied
- `final_amount`: Final amount after discount (total_amount - discount_amount)
- `subtotal`: Same as `total_amount` (for convenience)

### Error Responses

#### Visit Not Found
```json
{
  "status": 404,
  "detail": "Visit not found"
}
```

#### Unauthorized
```json
{
  "status": 401,
  "detail": "Authentication credentials were not provided."
}
```

#### Permission Denied
```json
{
  "status": 403,
  "detail": "You do not have permission to perform this action."
}
```

### Frontend Usage Example

```javascript
// Fetch bill details for a visit
async function getBillDetails(visitId) {
  try {
    const response = await fetch(`/api/clinical/bill/visit/${visitId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (result.status === 200) {
      const bill = result.data;
      
      // Display bill information
      console.log('Bill Number:', bill.bill_number);
      console.log('Patient:', bill.patient_name);
      console.log('Total Items:', bill.items_count);
      console.log('Subtotal:', bill.total_amount);
      console.log('Discount:', bill.discount_amount);
      console.log('Final Amount:', bill.final_amount);
      
      // Display bill items
      bill.bill_items.forEach(item => {
        console.log(`${item.description}: ₹${item.item_total}`);
      });
      
      return bill;
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// Usage
getBillDetails(123);
```

### Notes

1. **Auto-Creation**: If a bill doesn't exist for the visit, it will be automatically created when you call this endpoint.

2. **Auto-Calculation**: Bill totals are automatically recalculated when you fetch the bill to ensure they're up to date.

3. **Bill Number**: Bill numbers are auto-generated in the format `BILL-YYYYMMDD-####` (e.g., `BILL-20250115-0001`).

4. **Filtering**: Bills are automatically filtered by the user's clinic. Users can only see bills from their own clinic.

5. **Decimal Precision**: All monetary values are returned as strings with 2 decimal places to avoid floating-point precision issues.

### Example Frontend Display Structure

```html
<!-- Bill Header -->
<div class="bill-header">
  <h2>Bill #{{ bill_number }}</h2>
  <p>Date: {{ created_at }}</p>
  <p>Status: {{ payment_status }}</p>
</div>

<!-- Patient Info -->
<div class="patient-info">
  <h3>Patient Details</h3>
  <p>{{ patient_name }}</p>
  <p>{{ patient_phone }}</p>
  <p>{{ patient_address }}, {{ patient_city }}</p>
</div>

<!-- Bill Items Table -->
<table class="bill-items">
  <thead>
    <tr>
      <th>Item</th>
      <th>Type</th>
      <th>Quantity</th>
      <th>Unit Price</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
    {{#each bill_items}}
    <tr>
      <td>{{ description }}</td>
      <td>{{ item_type }}</td>
      <td>{{ quantity }}</td>
      <td>₹{{ cost }}</td>
      <td>₹{{ item_total }}</td>
    </tr>
    {{/each}}
  </tbody>
</table>

<!-- Bill Summary -->
<div class="bill-summary">
  <p>Subtotal: ₹{{ total_amount }}</p>
  <p>Discount: ₹{{ discount_amount }}</p>
  <h3>Final Amount: ₹{{ final_amount }}</h3>
</div>
```

