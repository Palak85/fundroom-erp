# FundRoom Mini ERP + CRM Operations Portal

A production-quality **Mini ERP + CRM Operations Portal** engineered for wholesale and distribution enterprises. The system orchestrates client account lifecycles, catalog inventory, manual warehouse stock adjustments, and sales delivery challans with atomic stock verification and product snapshot preservation.

---

## 🔗 Project Links

- **Live Application:** https://fundroom-erp.vercel.app/login
- **Backend API:** https://fundroom-backend.onrender.com
- **GitHub Repository:** https://github.com/Palak85/fundromm-erp/
- **Documentation:** https://github.com/Palak85/fundroom-erp#readme

## 🌟 Key Highlights & Features

### 1. 🔐 Authentication & Role-Based Access Control (RBAC)
- **JWT-Based Authentication** with bcrypt password hashing (`Password@123` default for all seed accounts).
- **Enforced Backend & Frontend RBAC** across 4 core operational roles:
  - **Admin**: Full superuser privileges across CRM, Inventory, Challans, and User Management.
  - **Sales**: Customer CRM, Follow-up pipeline management, and Sales Challan creation/confirmation.
  - **Warehouse**: Product catalog management, manual Stock IN/OUT adjustments, and inventory audit logs.
  - **Accounts**: Read-only access to customer profiles, financial statements, and delivery challans.
- **1-Click Role Switcher** on the login screen for instant evaluation.

### 2. 👥 Customer CRM Module
- Complete client lifecycle management (Wholesale, Distributor, Retail).
- Status tagging (`Active`, `Lead`, `Inactive`) with search across names, phone, email, and GST numbers.
- **Interactive Follow-up Timeline**: Add follow-up discussion notes and schedule upcoming interaction dates.
- Centralized **Scheduled Client Follow-ups Pipeline** for timely renewal checks.

### 3. 📦 Product & Inventory Management
- Product catalog with unique SKU enforcement (returns `409 Conflict` on duplicate SKU).
- Category filtering (`Hardware & Tools`, `Electrical`, `Safety Gear`, `Machinery`, `Chemicals`, `Packaging`).
- **Real-Time Stock Tracking & Low-Stock Alerts** (visual badges when stock $\le$ minimum alert threshold).
- **Warehouse Adjustments (Stock IN / Stock OUT)**:
  - Stock IN increments `current_stock` and logs an `IN` movement.
  - Stock OUT decrements `current_stock` and blocks negative inventory (`current_stock < 0` returns `400 Bad Request`).
- **Complete Stock Movement Audit Trail** with timestamps, reason, and operator identity.

### 4. 📄 Sales Delivery Challan & Critical Business Logic
- **Automatic Challan Numbering**: Sequential format (`CH-2026-0001`, `CH-2026-0002`).
- **Product Snapshot Preservation**: Product name, SKU, and unit price are snapshotted into `challan_items` at creation time. Historical vouchers remain accurate even if catalog prices change later.
- **Critical Stock Validation**:
  - **DRAFT Challans**: Saved without deducting warehouse stock.
  - **CONFIRMED Challans**: Atomically verifies that all line items have sufficient inventory (`current_stock >= requested_quantity`). Deducts stock, creates `OUT` stock movements, and sets status to `CONFIRMED`.
  - **Insufficient Stock Rejection**: If ANY item exceeds current stock, the entire confirmation fails atomically (no partial stock deductions) and returns `400 Bad Request`.
  - **Challan Cancellation**: Cancelling a confirmed voucher automatically restocks inventory.
- **Printable / PDF Challan Layout**: Clean voucher invoice layout with company headers, customer GSTIN, item snapshots, grand totals, and signatory stamps.

### 5. 📊 Live Operations Dashboard
- Real-time KPI summary cards (Total Customers, Active Accounts, Low Stock Alerts, Total Confirmed Revenue).
- **Recharts Data Visualizations**:
  - Inventory Stock by Category (Bar Chart).
  - Customer Profile Breakdown by Account Type (Pie Chart).
- Live activity feeds for recent challans, stock audit movements, and low stock warnings.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (JavaScript, Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with Bearer token interceptors
- **Icons**: Lucide React
- **Data Visualizations**: Recharts

### Backend
- **Runtime**: Node.js & Express.js (JavaScript)
- **Architecture**: Layered MVC (`Routes` $\to$ `Controllers` $\to$ `Services` $\to$ `Database`)
- **Authentication**: JSON Web Token (JWT) & bcryptjs
- **Validation**: Joi
- **Security & Logging**: Helmet, CORS, Morgan

### Database
- **Database Engine**: Supabase PostgreSQL
- **Relational Integrity**: Foreign keys, unique constraints, and PostgreSQL RPC stored procedure `confirm_sales_challan` for row-locking atomic transactions.
- **Dual-Mode Adapter**: Built-in test store with immediate seed data support for zero-friction local/offline development and evaluation.

---

## 📂 Project Structure

```text
FundRoom/
│
├── frontend/
│   ├── src/
│   │   ├── components/common/   # Badges, StatCards, Modals, Pagination, Toasts, Skeletons
│   │   ├── context/             # AuthContext, ToastContext
│   │   ├── layouts/             # DashboardLayout, Header, Sidebar with RBAC
│   │   ├── pages/
│   │   │   ├── auth/            # LoginPage with 1-click role demo switcher
│   │   │   ├── dashboard/       # DashboardPage with KPIs & Recharts
│   │   │   ├── customers/       # CustomersPage, CustomerDetailPage, FollowupsPage
│   │   │   ├── products/        # ProductsPage, ProductDetailPage, StockMovementsPage
│   │   │   ├── challans/        # ChallansPage, CreateChallanPage, ChallanDetailPage (Printable)
│   │   │   └── users/           # UsersPage (Admin only)
│   │   ├── routes/              # AppRoutes with ProtectedRoute role guards
│   │   ├── utils/               # Axios API client, currency/date formatters
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/
│   ├── database/
│   │   ├── schema.sql           # Complete PostgreSQL schema, indexes, and atomic RPC function
│   │   └── seed.sql             # SQL seed dataset (Users, Products, Customers, Movements, Challans)
│   ├── scripts/
│   │   └── test_workflow.js     # End-to-end automated verification test suite
│   ├── src/
│   │   ├── config/              # Supabase & DB adapter config
│   │   ├── controllers/         # REST API Controllers
│   │   ├── middleware/          # JWT auth, RBAC authorization, validator, errorHandler
│   │   ├── routes/              # Modular Express routes
│   │   ├── services/            # Business logic (Stock, Challans, CRM, Dashboard)
│   │   ├── utils/               # Seed runner
│   │   ├── validators/          # Joi schemas
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Server entry point
│   ├── package.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend server runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server runs on `http://localhost:5173`.

---

## 🔑 Demo Login Accounts

All accounts share the master test password: `Password@123`

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Password@123` | Full superuser access (CRM, Inventory, Challans, Users) |
| **Sales** | `sales@example.com` | `Password@123` | CRM, Follow-ups, Create & Confirm Challans |
| **Warehouse** | `warehouse@example.com` | `Password@123` | Product Catalog, Stock IN/OUT, Inventory Movements |
| **Accounts** | `accounts@example.com` | `Password@123` | Read-only access to CRM, Challans, & Financial summaries |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_minierp_crm_2026
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a new project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and run the contents of [`backend/database/schema.sql`](file:///Users/palaksingh/Desktop/FundRoom/backend/database/schema.sql).
4. Paste and run the seed script [`backend/database/seed.sql`](file:///Users/palaksingh/Desktop/FundRoom/backend/database/seed.sql).
5. Copy your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` into `backend/.env`.

---

## 🧪 Automated Testing

Run the end-to-end backend test suite:
```bash
cd backend
npm test
```
The verification suite tests:
- Login authentication and invalid credential rejection (401).
- RBAC permission guards (403 for unauthorized access).
- Customer creation and search filtering.
- Product creation and duplicate SKU prevention (409).
- Stock IN and Stock OUT logic.
- **Draft Challans**: Confirms stock is untouched.
- **Insufficient Stock**: Confirms confirmation is rejected with 400 Bad Request and stock remains intact.
- **Atomic Confirmation**: Confirms stock is decremented and `OUT` movement is recorded.
- Dashboard analytics aggregation.

---

## 🚢 Deployment Guide

- **Frontend**: Deploy to **Vercel** with build command `npm run build` and output directory `dist`. Set environment variable `VITE_API_URL`.
- **Backend**: Deploy to **Render** or **Railway** with start command `npm start`. Set environment variables `PORT`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `CLIENT_URL`.
- **Database**: Hosted on **Supabase PostgreSQL**.
