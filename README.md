# StockFlux - Inventory Management System

A modern, full-stack inventory management system with real-time updates and multi-user support.

## 🚀 Features

### Core Functionality
- **Product Management** - Add, edit, and track products with SKU, categories, and reorder levels
- **Stock Operations**
  - Receipts - Incoming stock from vendors
  - Deliveries - Outgoing stock to customers
  - Transfers - Move stock between warehouses
  - Adjustments - Manual stock corrections
- **Warehouse Management** - Multi-location inventory tracking
- **Real-time Dashboard** - Live stock updates using Socket.IO
- **Stock Ledger** - Complete transaction history for all products

### User Features
- **Multi-tenant Architecture** - Each user sees only their own data
- **User Authentication** - Secure JWT-based authentication
- **Password Management** - Email-based password reset with OTP
- **Real-time Updates** - Instant UI updates when stock changes

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Socket.IO** - WebSocket server
- **JSON File Storage** - Simple data persistence

## 📁 Project Structure

```
stockFlux-oddo/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Context providers
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── vite.config.js
│
└── server/                 # Backend Node.js server
    ├── index.js            # Main server file
    ├── store.js            # JSON file database handler
    ├── store.json          # Data storage
    ├── validate.js         # Validation middleware
    ├── schemas.js          # Validation schemas
    └── package.json
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
```bash
cd server
npm install
node index.js
```
Backend runs on: `http://localhost:4000`

### Frontend Setup
```bash
cd client
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

## 🔐 Authentication

The system uses JWT-based authentication with the following endpoints:

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login and get token
- `POST /auth/request-otp` - Request password reset OTP
- `POST /auth/reset-password` - Reset password with OTP
- `GET /auth/me` - Get current user info

## 📊 API Endpoints

### Products
- `GET /api/products` - Get all products (filtered by user)
- `POST /api/products` - Create new product
- `GET /api/products/:sku` - Get product by SKU
- `PUT /api/products/:sku` - Update product
- `DELETE /api/products/:sku` - Delete product

### Stock Operations
- `POST /api/receipts` - Create receipt
- `POST /api/receipts/:id/validate` - Validate and apply receipt
- `POST /api/deliveries` - Create delivery
- `POST /api/deliveries/:id/validate` - Validate and apply delivery
- `POST /api/transfers` - Create transfer
- `POST /api/transfers/:id/validate` - Validate and apply transfer
- `POST /api/adjustments` - Create adjustment
- `POST /api/adjustments/:id/validate` - Validate and apply adjustment

### Other
- `GET /api/warehouses` - Get all warehouses
- `POST /api/warehouses` - Create warehouse
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `GET /api/ledger` - Get stock ledger
- `GET /api/dashboard` - Get dashboard data

## 🔒 Security Features

- **Password Hashing** - bcrypt with 10 salt rounds
- **JWT Tokens** - 8-hour expiration
- **User Isolation** - All data filtered by userId
- **Authorization Middleware** - Protected routes require valid token

## 💾 Data Model

### User
```javascript
{
  id: "uuid",
  name: "string",
  email: "string",
  password: "hashed",
  createdAt: "timestamp"
}
```

### Product
```javascript
{
  id: "uuid",
  userId: "uuid",
  name: "string",
  sku: "string",
  category: "string",
  uom: "string",
  reorderLevel: "number"
}
```

### Ledger Entry
```javascript
{
  id: "uuid",
  userId: "uuid",
  sku: "string",
  qty_change: "number",
  location: "string",
  reason: "string",
  ref_type: "string",
  ref_id: "string",
  timestamp: "number"
}
```

## 🎯 Key Implementation Details

### User Isolation
All API endpoints filter data by `req.user.id` from JWT token:
```javascript
app.get('/api/products', authMiddleware, (req, res) => {
  const products = store.getAll('products')
    .filter(p => p.userId === req.user.id)
  res.json(products)
})
```

### Real-time Updates
Socket.IO broadcasts stock changes to all connected clients:
```javascript
io.emit('stock-update', { sku, newStock })
```

### Stock Calculation
Stock totals computed from ledger entries:
```javascript
function computeStockTotals(userId) {
  const ledger = store.getAll('ledger')
    .filter(e => e.userId === userId)
  // Aggregate qty_change by SKU and location
}
```

## 🧪 Testing

### Test User Isolation
1. Create two users with different credentials
2. User A creates products
3. Login as User B
4. Verify User B cannot see User A's products

### Test Stock Operations
1. Create a product
2. Create a receipt to add stock
3. Validate the receipt
4. Check dashboard shows updated stock
5. Create delivery to reduce stock
6. Verify ledger shows all transactions

## 📝 Environment Variables

Create `.env` file in server directory:
```
PORT=4000
JWT_SECRET=your-secret-key
```

