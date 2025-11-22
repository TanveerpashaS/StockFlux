# 🎯 Inventra Flow — Premium Inventory Management System

**A complete, polished, hackathon-winning Inventory Management System with real-time updates, premium UI, and robust validation.**

---

## 🌟 Features

### Core Functionality
- **Real-time Updates**: WebSocket-powered live stock updates across all clients
- **Complete Auth System**: Signup, login, password reset with OTP (simulated), JWT sessions
- **Product Management**: Full CRUD operations with SKU tracking, categories, reorder levels
- **Warehouse Operations**:
  - 📦 **Goods Receipts**: Record incoming stock from suppliers
  - 🚚 **Delivery Orders**: Manage outgoing shipments to customers
  - 🔄 **Internal Transfers**: Move stock between locations
  - 📊 **Stock Adjustments**: Reconcile physical counts with system records
- **Movement History**: Complete audit trail of all stock movements
- **Dashboard**: Real-time KPIs (Total Products, Low Stock Alerts, Pending Operations)

### Technical Highlights
- **Premium Design System**:
  - 🎨 Deep Indigo (#312E81), Teal Glow (#2DD4BF), Soft Amber (#FBBF24) color palette
  - ✨ Glassmorphism effects on modals and cards
  - 🌊 Smooth animations and transitions
  - 📱 Fully responsive layout
  - 🔤 Plus Jakarta Sans/Poppins for headings, Inter for body text
- **Robust Validation**: Server-side validation for all operations
- **Protected Routes**: JWT-based authentication middleware
- **Pure JavaScript Storage**: JSON file store (no native dependencies)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

1. **Install server dependencies**:
```powershell
cd server
npm install
```

2. **Install client dependencies**:
```powershell
cd client
npm install
```

### Running the Application

1. **Start the backend server** (Terminal 1):
```powershell
$env:PORT='4100'; cd server; node index.js
```
Server will run on **http://localhost:4100**

2. **Start the frontend dev server** (Terminal 2):
```powershell
cd client; npm run dev
```
Frontend will run on **http://localhost:5173**

3. **Open in browser**: Navigate to `http://localhost:5173`

---

## 🎨 User Flow

### Phase 1: Authentication (No Sidebar)
1. **Login** — Email/password authentication
2. **Signup** — Create new account with name, email, password, role
3. **Reset Password** — OTP-based password recovery (OTP printed to server console)

### Phase 2: Main Application (With Sidebar)
After login, users see the Deep Indigo sidebar with:

1. **Dashboard** 📊
   - 5 KPI cards: Total Products, Low Stock, Pending Receipts/Deliveries, Scheduled Transfers
   - Recent Activity table with color-coded quantity changes

2. **Products** 📦
   - Search and filter products
   - Add/Edit products with SKU, category, stock levels, reorder points
   - Color-coded stock status (green = healthy, red = low stock)

3. **Goods Receipts** 📥
   - Create receipts with supplier info
   - Multi-row item entry (SKU, quantity, location)
   - Status badges (pending/validated)

4. **Delivery Orders** 🚚
   - Create deliveries with customer info
   - Multi-row item entry
   - Status tracking

5. **Stock Transfers** 🔄
   - Transfer items between locations
   - From/To location tracking
   - Status management

6. **Stock Adjustments** 📊
   - Physical count reconciliation
   - Counted quantity vs. system quantity
   - Automatic ledger updates

7. **Movement History** 📜
   - Complete audit trail
   - Type, SKU, quantity changes, locations, references
   - Color-coded increases/decreases

8. **Settings** ⚙️
   - Warehouse management (placeholder)
   - Product categories (placeholder)

9. **Profile** 👤
   - View user info (name, email, role)
   - Change password (simulated)
   - Logout

---

## 🏗️ Architecture

### Backend (`server/`)
- **Express.js** API server with Socket.io
- **JSON File Store** (`store.json`) — pure JS, no native dependencies
- **JWT Authentication** with bcrypt password hashing
- **Validation Layer** for all inputs
- **Real-time Broadcasts** on stock changes

**Key Endpoints**:
- Auth: `/auth/signup`, `/auth/login`, `/auth/request-otp`, `/auth/reset-password`, `/auth/me`
- Products: `/api/products` (GET, POST, PUT)
- Operations: `/api/receipts`, `/api/deliveries`, `/api/transfers`, `/api/adjustments`
- Dashboard: `/api/dashboard` (KPIs)
- Ledger: `/api/ledger` (movement history)

### Frontend (`client/`)
- **React 18** with Vite
- **Socket.io Client** for real-time updates
- **Axios** with automatic JWT headers
- **Component Structure**:
  - Pages: Login, Signup, Reset, Dashboard, Products, Receipts, Deliveries, Transfers, Adjustments, History, Settings, Profile
  - Components: Sidebar, Modal (glassmorphism), MultiRowForm, LedgerView, Sparkline
  - Icons: Custom SVG icons for navigation

---

## 🎯 Design System

### Colors
- **Primary (Deep Indigo)**: `#312E81` — Sidebar, headings, accents
- **Secondary (Teal Glow)**: `#2DD4BF` — Highlights, active states, success indicators
- **Accent (Soft Amber)**: `#FBBF24` — Pending/warning states
- **Success (Emerald)**: `#10B981` — Positive stock changes, validated status
- **Danger (Rose Red)**: `#EF4444` — Low stock, negative changes, errors
- **Background (Cloud White)**: `#F9FAFB` — Main background
- **Card Background**: `#FFFFFF` — Elevated surfaces
- **Muted (Charcoal)**: `#1F2937` — Secondary text, borders

### Typography
- **Headings**: Plus Jakarta Sans, Poppins (700 weight)
- **Body**: Inter, Nunito (400/600 weight)
- **Font sizes**: 13-32px with responsive scaling

### Spacing & Layout
- **Large white space**: 18-28px gaps between sections
- **Rounded corners**: 12-20px border radius on cards/modals
- **Soft shadows**: Layered box-shadows for depth
- **Grid layouts**: Auto-fit responsive grids

---

## 📦 Data Models

### User
```js
{ id, name, email, password_hash, role, created }
```

### Product
```js
{ sku, name, category, uom, stock, reorderLevel, created }
```

### Receipt/Delivery/Transfer/Adjustment
```js
{ 
  id, 
  items: [{sku, qty, location}], 
  status: 'pending'|'validated',
  supplier/customer/fromLocation/toLocation,
  ts 
}
```

### Ledger Entry
```js
{ 
  id, type, sku, qty_change, 
  location, from, ref, ts 
}
```

---

## 🔐 Authentication

- **Password Hashing**: bcrypt (10 rounds)
- **Sessions**: JWT tokens (8-hour expiry)
- **Token Storage**: localStorage (client-side)
- **Protected Routes**: `authMiddleware` validates JWT on write operations
- **OTP Reset**: Simulated (OTP printed to server console for demo)

---

## 🎬 Demo Script

1. **Signup**: Create account as "admin" role
2. **Dashboard**: Show live KPIs and recent activity
3. **Add Product**: SKU "WIDGET-001", set reorder level
4. **Create Receipt**: Add 50 units from "Acme Suppliers", location "MAIN-A1"
5. **Real-time Update**: Watch stock update in Products table (socket.io broadcast)
6. **Create Delivery**: Ship 20 units to "Customer XYZ"
7. **Movement History**: Show complete audit trail with color-coded changes
8. **Stock Adjustment**: Reconcile physical count
9. **Low Stock Alert**: Dashboard shows alert when stock < reorder level

---

## 🛠️ Development Notes

### Why JSON Store?
Chose pure-JS JSON file store over better-sqlite3 to avoid native build dependencies (requires Visual Studio C++ on Windows). This ensures:
- ✅ Zero build tool requirements
- ✅ Cross-platform compatibility
- ✅ Fast development iteration
- ✅ Simple deployment

### Port Configuration
- Backend: Port 4100 (configurable via `$env:PORT`)
- Frontend: Port 5173 (Vite default)

### Real-time Implementation
- Socket.io broadcasts `stock_update` events when ledger changes
- Clients listen and refetch affected data
- Function: `broadcastStockUpdate(sku)` in `server/index.js`

---

## 📋 Roadmap / Future Enhancements

- [ ] Add charts to Dashboard (incoming/outgoing trends, activity timeline)
- [ ] Implement warehouse/category CRUD in Settings
- [ ] Add toast notifications for operation feedback
- [ ] Wire Profile password change to backend
- [ ] Add filters to Movement History page
- [ ] Implement actual email OTP (Nodemailer/SendGrid)
- [ ] Add batch operations (bulk receipts/deliveries)
- [ ] Export reports to CSV/PDF
- [ ] Role-based permissions (admin/staff/viewer)

---

## 🏆 Hackathon Checklist

✅ **Real-time or dynamic data sources** — Socket.io live updates  
✅ **Responsive and clean UI** — Premium design system with glassmorphism  
✅ **Robust validation** — Server-side validation on all inputs  
✅ **Consistent color scheme** — Deep Indigo + Teal Glow palette  
✅ **Proper version control** — Ready for git init/commit/push  
✅ **Complete user flow** — Auth → Dashboard → Operations → History  
✅ **Professional polish** — Large spacing, shadows, animations, minimalism  

---

## 📄 License

MIT License — Built for educational/hackathon purposes.

---

## 👥 Credits

**Inventra Flow** — Premium Inventory Management System  
Built with ❤️ using React, Express, Socket.io, and lots of attention to detail.

---

## 🚨 Quick Troubleshooting

**Port already in use?**
```powershell
Get-Process -Name node | Stop-Process -Force
```

**Reset database?**
```powershell
Remove-Item server/store.json
```

**OTP not working?**
Check server console output — OTP is printed to logs for demo purposes.

---

**🎉 Ready to win that hackathon! Good luck!** 🚀
