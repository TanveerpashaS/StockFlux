# StockFlux IMS - Complete Testing Guide

## 🚀 System Status
- **Backend Server**: Running on http://localhost:4000
- **Frontend Server**: Running on http://localhost:5173
- **Test Account**: 786tanveers786786@gmail.com / Password: tanveer

---

## 📋 Complete Feature Checklist

### ✅ **1. AUTHENTICATION SYSTEM**

#### **Login Page** (/)
**What to Test:**
- [ ] Navigate to http://localhost:5173
- [ ] Enter email: `786tanveers786786@gmail.com`
- [ ] Enter password: `tanveer`
- [ ] Click "Login" button
- [ ] Should redirect to Dashboard

**Expected Result:** ✓ Successful login with token stored in localStorage

#### **Signup Page**
**What to Test:**
- [ ] Click "Sign Up" link on login page
- [ ] Enter: Name, Email, Password
- [ ] Click "Sign Up"
- [ ] Should create account and redirect to login

**Expected Result:** ✓ New account created, can login with new credentials

#### **Reset Password**
**What to Test:**
- [ ] Click "Forgot Password?" on login page
- [ ] Enter email address
- [ ] Receive OTP (check console/email)
- [ ] Enter OTP and new password
- [ ] Login with new password

**Expected Result:** ✓ Password reset successfully

---

### ✅ **2. DASHBOARD** (Main Overview)

**What to Test:**
- [ ] After login, you should see 5 KPI cards in a single row:
  1. **Total Products** - Shows count of all products
  2. **Total Stock Value** - Sum of all inventory value
  3. **Low Stock Alerts** - Products below reorder level
  4. **Pending Receipts** - Receipts not yet Done/Canceled
  5. **Pending Deliveries** - Deliveries not yet Done/Canceled

- [ ] **Filters Section:**
  - [ ] Date range filter (From/To dates)
  - [ ] Warehouse dropdown filter
  - [ ] Category dropdown filter
  - [ ] Apply filters and see data update

- [ ] **Recent Activity Table:**
  - [ ] Shows recent ledger movements
  - [ ] Displays: Date, Reference, Type, Product, Quantity, Location
  - [ ] Color coded: Green (+), Red (-)
  - [ ] Scrollable with max 10 items

**Expected Result:** ✓ Dashboard loads with correct KPIs, filters work, recent activity shows movements

---

### ✅ **3. PRODUCTS** (Inventory Catalog)

**What to Test:**

#### **View Products**
- [ ] Click "Products" in sidebar
- [ ] See table with columns: SKU, Name, Category, UOM, Stock, Reorder Level, Actions
- [ ] Stats cards show: Total Products, Total Stock Units, Low Stock Items, Categories

#### **Add New Product**
- [ ] Click "+ Add Product" button
- [ ] Fill in form:
  - Name: "Test Laptop"
  - SKU: "LAP-999"
  - Category: "Electronics"
  - UOM: "pcs"
  - Reorder Level: "5"
- [ ] Click "Save"
- [ ] Product appears in table

#### **Warehouse Stock Breakdown** ⭐ (IMPORTANT)
- [ ] Find any product with stock > 0
- [ ] Click on the stock number (it's clickable)
- [ ] Modal opens showing:
  - Total Stock
  - Breakdown by warehouse (Main Warehouse: X, Warehouse A: Y, etc.)
  - Color-coded warehouse names
- [ ] Click outside to close modal

#### **Edit Product**
- [ ] Click "Edit" button on any product
- [ ] Modify name or category
- [ ] Click "Save"
- [ ] Changes reflected in table

#### **Delete Product**
- [ ] Click "Delete" on a product (warning: permanent)
- [ ] Confirm deletion
- [ ] Product removed from table

**Expected Result:** ✓ Full CRUD operations work, warehouse breakdown shows per-location stock

---

### ✅ **4. RECEIPTS** (Incoming Stock - Purchase Orders)

**What to Test:**

#### **View Receipts**
- [ ] Click "Operations" → "Receipts" in sidebar
- [ ] See stats cards: Total, Draft, Waiting, Ready, Done
- [ ] Table shows: Reference, Supplier, Warehouse, Date, Items, Status, Actions

#### **Create New Receipt**
- [ ] Click "+ New Receipt"
- [ ] Fill form:
  - Supplier: "ABC Suppliers"
  - Warehouse: Select from dropdown (e.g., "Main Warehouse")
  - Expected Date: Pick a date
  - Status: "Draft"
- [ ] **Add Products:**
  - Click "+ Add Item"
  - Select Product from dropdown
  - Enter Quantity: 50
  - Enter Unit Price: 100
  - See Line Total auto-calculate (50 × 100 = 5000)
- [ ] Add multiple products if needed
- [ ] Check Total Amount at bottom
- [ ] Click "Save Receipt"

#### **Change Status**
- [ ] Find the receipt you created
- [ ] Click status dropdown: Draft → Waiting → Ready
- [ ] Status updates in real-time

#### **Validate Receipt** ⭐ (IMPORTANT - This adds stock!)
- [ ] Set receipt status to "Ready"
- [ ] Click "✓ Validate" button
- [ ] Confirm validation
- [ ] Status changes to "Done"
- [ ] **CHECK**: Go to Products page
- [ ] Click on product stock number
- [ ] Warehouse stock should have INCREASED by the receipt quantity

**Expected Result:** ✓ Receipt created, validated, stock increased in correct warehouse

---

### ✅ **5. DELIVERIES** (Outgoing Stock - Sales Orders)

**What to Test:**

#### **View Deliveries**
- [ ] Click "Operations" → "Deliveries"
- [ ] Stats cards: Total, Draft, Picking, Packing, Done
- [ ] Table shows deliveries with status workflow

#### **Create New Delivery**
- [ ] Click "+ New Delivery"
- [ ] Fill form:
  - Customer: "XYZ Company"
  - Warehouse: Select warehouse (must have stock!)
  - Delivery Date: Pick date
  - Status: "Draft"
- [ ] **Add Products:**
  - Select product (ensure it has stock in selected warehouse)
  - Enter Quantity: 20
  - Enter Unit Price: 150
  - Line Total auto-calculates
- [ ] Save Delivery

#### **Change Status**
- [ ] Update status: Draft → Picking → Packing → Ready

#### **Validate Delivery** ⭐ (IMPORTANT - This removes stock!)
- [ ] Set status to "Ready"
- [ ] Click "✓ Validate"
- [ ] Status → "Done"
- [ ] **CHECK**: Go to Products
- [ ] Click stock number
- [ ] Warehouse stock should have DECREASED by delivery quantity

**Expected Result:** ✓ Delivery created, validated, stock decreased from correct warehouse

---

### ✅ **6. INTERNAL TRANSFERS** (Move Stock Between Warehouses)

**What to Test:**

#### **View Transfers**
- [ ] Click "Operations" → "Internal Transfers"
- [ ] Stats: Total, Draft, In Transit, Completed

#### **Create Transfer**
- [ ] Click "+ New Transfer"
- [ ] Fill form:
  - **From Warehouse**: "Main Warehouse" (must have stock)
  - **To Warehouse**: "Warehouse A" (different from source!)
  - Transfer Date: Pick date
  - Status: "Draft"
- [ ] **Add Products:**
  - Select product with stock in source warehouse
  - Enter Quantity: 10
  - Notes: "Moving to Warehouse A"
- [ ] Save Transfer

#### **Validate Transfer** ⭐ (IMPORTANT - Moves stock between locations!)
- [ ] Set status to "In Transit"
- [ ] Click "✓ Validate"
- [ ] Status → "Done"
- [ ] **CHECK**: Go to Products
- [ ] Click stock number on transferred product
- [ ] **From Warehouse stock should DECREASE by 10**
- [ ] **To Warehouse stock should INCREASE by 10**
- [ ] Total stock stays the same!

**Expected Result:** ✓ Stock moved between warehouses, breakdown shows correct distribution

---

### ✅ **7. INVENTORY ADJUSTMENTS** (Fix Count Discrepancies)

**What to Test:**

#### **View Adjustments**
- [ ] Click "Operations" → "Inventory Adjustments"
- [ ] Stats: Total, Draft, Pending Review, Done

#### **Create Adjustment**
- [ ] Click "+ New Adjustment"
- [ ] Select Warehouse: "Main Warehouse"
- [ ] Status: "Draft"
- [ ] **Add Products:**
  - Select a product
  - **System Qty**: Shows current stock (auto-filled, read-only)
  - **Counted Qty**: Enter what you physically counted (e.g., if system shows 100, enter 95)
  - **Difference**: Auto-calculates (-5 in this example, shown in RED)
  - If counted > system, difference is GREEN (+)
  - If counted = system, difference is GRAY (0)
- [ ] Reason: "Physical count discrepancy"
- [ ] Save Adjustment

#### **Validate Adjustment** ⭐ (IMPORTANT - Applies difference to stock!)
- [ ] Set status to "Pending Review"
- [ ] Click "✓ Validate"
- [ ] Status → "Done"
- [ ] **CHECK**: Go to Products
- [ ] Click stock number
- [ ] Warehouse stock should match the "Counted Qty" you entered
- [ ] Difference was applied to ledger

**Expected Result:** ✓ Stock adjusted to match physical count, system qty updated

---

### ✅ **8. MOVE HISTORY** (Complete Ledger View)

**What to Test:**

#### **View All Movements**
- [ ] Click "Operations" → "Move History"
- [ ] Stats cards show counts by type:
  - Total Movements
  - Receipts (📥)
  - Deliveries (📤)
  - Transfers (🔄)
  - Adjustments (📊)

#### **Filter Movements**
- [ ] **Document Type**: Select "Receipt" - shows only receipts
- [ ] **Status**: Select "Done" - shows only completed
- [ ] **Warehouse**: Select warehouse - shows movements for that location
- [ ] **Category**: Select category - shows products in that category
- [ ] **Date Range**: Set From/To dates
- [ ] **Search**: Enter SKU or product name
- [ ] Click "Apply Filters"
- [ ] Results update, counter shows "Showing X of Y movements"

#### **View Details**
- [ ] Table columns: Date, Reference, Type (with icon), Product, SKU, Quantity (color-coded), Location, Status
- [ ] Green quantities = positive (receipts, incoming)
- [ ] Red quantities = negative (deliveries, outgoing)
- [ ] Scrollable table with all ledger entries

**Expected Result:** ✓ Complete history of all stock movements with powerful filtering

---

### ✅ **9. SETTINGS** (Warehouse & Category Management)

**What to Test:**

#### **Warehouses Tab**
- [ ] Click "Settings" in sidebar
- [ ] Default tab: "🏢 Warehouses"
- [ ] Click "+ Add Warehouse"
- [ ] Fill form:
  - Name: "Warehouse B"
  - Type: "Secondary" (dropdown: Main/Secondary/Production/Retail)
  - Address: "123 Storage Lane, City"
- [ ] Save
- [ ] Warehouse appears as card with type badge
- [ ] **Edit**: Click "Edit" button, modify name, save
- [ ] **Delete**: Click "Delete", confirm, warehouse removed

#### **Categories Tab**
- [ ] Click "📂 Categories" tab
- [ ] Click "+ Add Category"
- [ ] Fill form:
  - Name: "Office Supplies"
  - Description: "Pens, paper, desk items"
- [ ] Save
- [ ] Category appears as card
- [ ] Edit/Delete works same as warehouses

#### **System Tab**
- [ ] Click "⚙️ System" tab
- [ ] Shows:
  - Application Name: StockFlux IMS
  - Version: 1.0.0
  - Environment: Development
- [ ] Info banner: "System Settings Coming Soon"

**Expected Result:** ✓ Full CRUD for warehouses and categories, used across the system

---

### ✅ **10. PROFILE** (User Account Management)

**What to Test:**

#### **View Profile**
- [ ] Click "Profile" in sidebar
- [ ] **Profile Card:**
  - Banner gradient (teal)
  - Avatar circle with initials (e.g., "TP")
  - Name: Your full name
  - Email: Your email address
  - Badges: "👤 Active User", "✓ Verified"
  - Account info: Created date, Last login

#### **Change Password**
- [ ] Click "Change Password" button
- [ ] Form appears:
  - Current Password: Enter current password
  - New Password: Enter new password (min 6 chars)
  - Confirm New Password: Re-enter new password
- [ ] Click "Update Password"
- [ ] Success message: "Password changed successfully!"
- [ ] **TEST**: Logout and login with NEW password

#### **Logout**
- [ ] Click "🚪 Logout" button in Account Actions
- [ ] Confirm logout
- [ ] Redirected to login page
- [ ] Token cleared from localStorage

**Expected Result:** ✓ Profile displays correctly, password change works, logout clears session

---

## 🎯 **COMPLETE WORKFLOW TEST**

Follow this end-to-end scenario to test the entire system:

### **Scenario: Complete Stock Management Cycle**

1. **Login** → Use test account

2. **Setup Master Data:**
   - Settings → Add Warehouse: "Main Warehouse" (Main)
   - Settings → Add Warehouse: "Warehouse A" (Secondary)
   - Settings → Add Category: "Electronics"

3. **Create Product:**
   - Products → Add Product:
     - Name: "Test Laptop"
     - SKU: "TEST-001"
     - Category: "Electronics"
     - UOM: "pcs"
     - Reorder Level: 10

4. **Receive Stock (Purchase):**
   - Receipts → New Receipt:
     - Supplier: "Dell Inc"
     - Warehouse: "Main Warehouse"
     - Product: "Test Laptop", Qty: 50, Price: 800
   - Status: Draft → Waiting → Ready
   - **Validate Receipt**
   - Check Products: Stock should be 50 in Main Warehouse

5. **Deliver Stock (Sale):**
   - Deliveries → New Delivery:
     - Customer: "ABC Corp"
     - Warehouse: "Main Warehouse"
     - Product: "Test Laptop", Qty: 10, Price: 1200
   - Status: Draft → Picking → Packing → Ready
   - **Validate Delivery**
   - Check Products: Stock should be 40 in Main Warehouse

6. **Transfer Stock:**
   - Transfers → New Transfer:
     - From: "Main Warehouse"
     - To: "Warehouse A"
     - Product: "Test Laptop", Qty: 15
   - Status: Draft → In Transit
   - **Validate Transfer**
   - Check Products: 
     - Main Warehouse: 25
     - Warehouse A: 15
     - Total: 40

7. **Adjust Stock (Count Correction):**
   - Adjustments → New Adjustment:
     - Warehouse: "Main Warehouse"
     - Product: "Test Laptop"
     - System Qty: 25 (auto-filled)
     - Counted Qty: 23 (enter manually)
     - Difference: -2 (auto-calculated, RED)
     - Reason: "Damaged units"
   - **Validate Adjustment**
   - Check Products: Main Warehouse now shows 23

8. **Review History:**
   - Move History → Should show 4 entries:
     - ✅ Receipt: +50 (Main Warehouse)
     - ✅ Delivery: -10 (Main Warehouse)
     - ✅ Transfer: -15 (Main Warehouse), +15 (Warehouse A)
     - ✅ Adjustment: -2 (Main Warehouse)

9. **Dashboard Check:**
   - Go to Dashboard
   - Total Products: 1
   - Total Stock: 38 units (23 + 15)
   - Pending Receipts: 0
   - Pending Deliveries: 0
   - Recent Activity shows all 4 movements

10. **Profile Test:**
    - Change password
    - Logout
    - Login with new password

---

## ✅ **VERIFICATION CHECKLIST**

Mark each as you verify:

### **Core Features:**
- [ ] Login/Signup/Reset Password works
- [ ] Dashboard shows correct KPIs
- [ ] Products CRUD operations work
- [ ] Warehouse breakdown modal shows per-location stock
- [ ] Receipts create and validate (increases stock)
- [ ] Deliveries create and validate (decreases stock)
- [ ] Transfers create and validate (moves stock between warehouses)
- [ ] Adjustments create and validate (corrects stock counts)
- [ ] Move History shows all movements with filters
- [ ] Settings: Warehouses CRUD works
- [ ] Settings: Categories CRUD works
- [ ] Profile displays user info correctly
- [ ] Change password works
- [ ] Logout clears session

### **Stock Accuracy:**
- [ ] Receipt validation increases warehouse stock
- [ ] Delivery validation decreases warehouse stock
- [ ] Transfer validation moves stock (source -, destination +)
- [ ] Adjustment validation applies difference
- [ ] Total stock across all warehouses is accurate
- [ ] Dashboard KPIs match actual data

### **UI/UX:**
- [ ] All pages load without errors
- [ ] Navigation sidebar works
- [ ] Modals open/close properly
- [ ] Forms validate input
- [ ] Tables are scrollable
- [ ] Filters apply correctly
- [ ] Color coding is correct (green +, red -)
- [ ] Responsive design (try resizing browser)

---

## 🐛 **COMMON ISSUES & SOLUTIONS**

### **Issue: Login fails**
- **Check**: Backend running on port 4000?
- **Solution**: Restart backend: `cd server; node index.js`

### **Issue: Frontend not loading**
- **Check**: Frontend running on port 5173?
- **Solution**: Restart frontend: `cd client; npm run dev`

### **Issue: Stock not updating**
- **Check**: Did you click "✓ Validate" button?
- **Solution**: Validation is what applies changes to ledger

### **Issue: Warehouse dropdown empty**
- **Check**: Have you added warehouses in Settings?
- **Solution**: Settings → Warehouses → Add at least one warehouse

### **Issue: Product dropdown empty in receipts**
- **Check**: Have you created products?
- **Solution**: Products → Add Product first

### **Issue: Transfer validation fails**
- **Check**: Source warehouse has enough stock?
- **Check**: From and To warehouses are different?
- **Solution**: Ensure sufficient stock and different warehouses

---

## 📊 **EXPECTED SYSTEM STATE AFTER FULL TEST**

After completing the workflow test above:

**Database (store.json) should contain:**
- 1 User (your account)
- 1 Product (Test Laptop - TEST-001)
- 2 Warehouses (Main Warehouse, Warehouse A)
- 1 Category (Electronics)
- 4 Ledger entries (receipt, delivery, transfer, adjustment)
- 1 Receipt (Done status)
- 1 Delivery (Done status)
- 1 Transfer (Done status)
- 1 Adjustment (Done status)

**Stock Totals:**
- Test Laptop: 38 units total
  - Main Warehouse: 23 units
  - Warehouse A: 15 units

**Dashboard KPIs:**
- Total Products: 1
- Total Stock Value: (calculated from prices)
- Low Stock Alerts: 0 (since 38 > reorder level of 10)
- Pending Receipts: 0
- Pending Deliveries: 0

---

## 🎉 **SUCCESS CRITERIA**

Your system is fully functional if:
1. ✅ All authentication flows work
2. ✅ All CRUD operations complete successfully
3. ✅ Stock movements are accurately tracked
4. ✅ Warehouse-specific stock is maintained correctly
5. ✅ Validations apply changes to ledger
6. ✅ Dashboard reflects accurate data
7. ✅ Filters and search work properly
8. ✅ No console errors during normal operation
9. ✅ User can complete full workflow without issues
10. ✅ Profile and settings management works

---

## 📝 **TESTING NOTES**

**Record any issues here:**
- Issue 1: _________________________________
- Issue 2: _________________________________
- Issue 3: _________________________________

**Observations:**
- _________________________________
- _________________________________
- _________________________________

---

**Last Updated:** November 22, 2025
**System Version:** 1.0.0
**Tested By:** ___________________
**Test Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL
