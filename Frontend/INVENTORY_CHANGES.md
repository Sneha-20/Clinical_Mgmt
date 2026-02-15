# Inventory Management - Add Brand & Model Feature

## Overview
Enhanced the Add Product Modal to allow users to dynamically add new brands and models during product creation.

## Changes Made

### 1. **Routes Configuration** (`lib/utils/constants/route.js`)
Added new API endpoints:
- `inventoryBrandCreate: "api/clinical/inventory/brands/create/"`
- `inventoryModelCreate: "api/clinical/inventory/models/create/"`

### 2. **Service Functions** (`lib/services/inventory.js`)
Added two new functions:

#### `createBrand(data)`
- **Parameters**: `{ name: string, category: string }`
- **Purpose**: Create a new brand for a selected category
- **Returns**: Brand object with id and name

#### `createModel(data)`
- **Parameters**: `{ name: string, category: string, brand_id: number }`
- **Purpose**: Create a new model for a selected category and brand
- **Returns**: Model object with id and name

### 3. **Hook Updates** (`lib/hooks/useInventory.js`)
Enhanced the hook with new capabilities:

#### `createNewBrand(brandName, category)`
- Creates a new brand and automatically refetches the brands list
- Shows success/error toast notifications
- Returns the created brand object or null on failure

#### `createNewModel(modelName, category, brandId)`
- Creates a new model and automatically refetches the models list
- Shows success/error toast notifications
- Returns the created model object or null on failure

#### `fetchModels` Enhancement
- Now handles brand IDs: converts ID to brand name for API call
- Maintains backward compatibility with brand names

### 4. **AddProductModal Updates** (`components/modules/InventoryManagement/AddProductModal.jsx`)
Major enhancements to the modal:

#### UI Changes:
- **Add New Brand Button**: Appears below the Brand dropdown when a category is selected
- **Brand Input Field**: Shows when "Add New Brand" button is clicked
- **Add New Model Button**: Appears below the Model dropdown when a brand is selected
- **Model Input Field**: Shows when "Add New Model" button is clicked

#### Data Structure:
- Brand/Model dropdowns now use **IDs** as values instead of names
- Product payload now sends:
  - `brand`: numeric ID (e.g., `5`)
  - `model_type`: numeric ID (e.g., `11`)

#### New Form Fields:
- `quantity_in_stock`: Initial stock quantity
- `reorder_level`: Reorder threshold

#### Auto-Selection:
- After creating a new brand, it's automatically selected in the dropdown
- After creating a new model, it's automatically selected in the dropdown

### 5. **Parent Component** (`components/modules/InventoryManagement/inventory-management.jsx`)
- Added `createNewBrand` and `createNewModel` to extracted hooks
- Passed these functions as `onCreateBrand` and `onCreateModel` props to AddProductModal

## Workflow Example

1. User selects **Category** → Brands list is fetched and displayed
2. User can:
   - Select existing brand from dropdown, OR
   - Click "Add New Brand" button
   - Enter brand name and click "Add"
   - Brand is created and auto-selected
3. User selects **Brand** → Models list is fetched
4. User can:
   - Select existing model from dropdown, OR
   - Click "Add New Model" button
   - Enter model name and click "Add"
   - Model is created and auto-selected
5. User fills remaining fields and creates product with brand ID and model ID

## Form Validation
The component validates:
- ✓ Category is required
- ✓ Brand is required
- ✓ Model is required
- ✓ Product name is required
- ✓ Location is required
- ✓ Unit price is required
- ✓ Serial numbers required (for Serialized stock only, on creation)

## API Payload Structure
```javascript
{
  "category": "Battery",
  "product_name": "Battery Rayonac Size 13",
  "brand": 5,              // Brand ID
  "model_type": 11,        // Model ID
  "description": "Battery",
  "stock_type": "Non-Serialized",
  "quantity_in_stock": 20,
  "reorder_level": 10,
  "location": "Drawer 3",
  "unit_price": "3500.00",
  "use_in_trial": false
}
```

## Error Handling
- Toast notifications for success/error messages
- Loading states during brand/model creation
- Form validation with error messages
- All API errors are caught and displayed to user

## UX Improvements
- Loading indicators show "Creating..." during async operations
- Buttons disabled during submission to prevent double-clicks
- Smooth transition between Add form appearance
- Auto-selection of newly created items reduces user friction
- Clear validation messages for required fields
