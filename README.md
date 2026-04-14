# InvoiceVerify

An AI-powered invoice verification and reconciliation system that uses **Google Gemini Vision** to extract data from invoices (including handwritten ones), then automatically reconciles them against Purchase Orders (POs) and Goods Receipt Notes (GRNs).

## Features

### 🔍 AI Invoice Extraction
- Upload invoice images (JPEG, PNG, WebP) or PDFs
- Powered by **Gemini 2.5 Flash** for OCR and structured data extraction
- Handles both printed and handwritten invoices
- Extracts vendor, line items, totals, tax rates, PO references, and more
- Per-field confidence scoring

### 📊 Three-Way Reconciliation
- **Invoice ↔ PO Matching** — Automatically matches invoices to POs by reference number
- **Invoice ↔ GRN Matching** — Cross-references quantities received against quantities invoiced
- **Line-by-line comparison** — Qty, unit price, and amount verified for every line item

### 🧮 Mathematical Verification
- Independent recalculation of all arithmetic (qty × rate, subtotals, GST, grand totals)
- Flags discrepancies between invoice-stated values and computed values
- Catches common errors: wrong tax calculations, mismatched totals, rounding issues

### 📋 Business Rules Engine
- Configurable GST rate validation
- Approved vendor list checking
- Payment terms policy enforcement (Net 30/45/60)
- Maximum unit price thresholds
- Invoice date vs PO date validation

### 🚨 Anomaly Detection
- Suspiciously round total amounts
- Abnormally high unit prices
- Missing PO references
- Duplicate invoice detection (session-based)

### 📑 Purchase Order & GRN Management
- Create and manage POs with line items directly in the app
- Record GRNs against existing POs
- Data persisted in SQLite database (per-user)

### 📤 Export
- One-click PDF report generation with full reconciliation details
- Includes match scores, discrepancies, math verification results, and business rule checks

### 🔐 Authentication
- User registration and login with JWT-based auth
- Per-user data isolation (POs, GRNs, settings, vendor lists)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS with custom design tokens |
| AI/OCR | Google Gemini 2.5 Flash (Vision API) |
| Backend | Express.js (Node.js) |
| Database | SQLite via better-sqlite3 |
| Auth | JWT + bcryptjs |
| PDF Export | jsPDF + jspdf-autotable |

## Project Structure

```
invoiceverify/
├── src/
│   ├── components/
│   │   ├── auth/           # Login/Register pages
│   │   ├── export/         # PDF report generation
│   │   ├── extraction/     # Invoice data display after AI extraction
│   │   ├── layout/         # Header, navigation
│   │   ├── po/             # Purchase Order & GRN management UI
│   │   ├── reconciliation/ # Match score, dashboard, discrepancy tables
│   │   ├── settings/       # Business rules & vendor list config
│   │   └── upload/         # File upload & sample scenario loader
│   ├── engine/
│   │   ├── mathVerifier.js      # Independent arithmetic verification
│   │   ├── businessRules.js     # Configurable policy checks
│   │   ├── anomalyDetector.js   # Fraud/anomaly pattern detection
│   │   └── duplicateDetector.js # Session-based duplicate tracking
│   ├── hooks/
│   │   ├── useInvoiceProcessor.js  # AI extraction + PO/GRN matching
│   │   ├── useReconciliation.js    # Orchestrates all verification engines
│   │   ├── usePOStore.js           # PO & GRN CRUD operations
│   │   ├── useAuth.js              # Authentication state
│   │   └── useSettings.js          # User settings/rules
│   ├── services/
│   │   ├── geminiVision.js    # Gemini API client
│   │   ├── poService.js       # PO API client
│   │   └── settingsService.js # Settings API client
│   ├── data/
│   │   ├── sampleInvoices.js  # Demo invoice scenarios
│   │   ├── samplePOs.js       # Demo purchase orders
│   │   └── sampleGRNs.js      # Demo goods receipt notes
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   ├── index.js          # Express server + Gemini API proxy
│   ├── db.js             # SQLite schema & seed data
│   ├── middleware/
│   │   └── auth.js       # JWT authentication middleware
│   └── routes/
│       ├── auth.js       # Register/Login endpoints
│       ├── pos.js        # Purchase Order CRUD API
│       ├── grns.js       # GRN CRUD API
│       └── settings.js   # Business rules & vendor API
└── package.json
```

## Getting Started

### Prerequisites
- **Node.js** v18 or later
- A **Google Gemini API key** ([get one here](https://aistudio.google.com/apikey))

### 1. Clone the repository
```bash
git clone https://github.com/your-username/invoiceverify.git
cd invoiceverify
```

### 2. Install dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 3. Configure environment variables

```bash
# Frontend (.env)
cp .env.example .env
# Default is fine: VITE_SERVER_URL=http://localhost:3001

# Backend (server/.env)
cp server/.env.example server/.env
# Add your Gemini API key:
# GEMINI_API_KEY=your_key_here
# PORT=3001
```

### 4. Start the application

```bash
# Terminal 1 — Backend server
cd server
npm start

# Terminal 2 — Frontend dev server
npm run dev
```

The app will be available at **http://localhost:5173**.

## How It Works

### Verification Pipeline

```
Invoice Image → Gemini Vision AI → Structured Data Extraction
                                           │
                    ┌──────────────────────┤
                    ▼                      ▼
            PO/GRN Matching     Mathematical Verification
                    │                      │
                    ▼                      ▼
           Line-by-Line          Subtotal/Tax/Total
            Comparison              Recalculation
                    │                      │
                    └──────────┬───────────┘
                               ▼
                     Business Rules Engine
                               │
                               ▼
                     Anomaly Detection
                               │
                               ▼
                    Match Score (0-100%)
                    + Detailed Report
```

### Match Score Calculation

The reconciliation score is computed from:
- **Line item matches** — qty and rate compared against PO (partial credit for partial matches)
- **Math verification** — each arithmetic check that passes
- **Business rule checks** — each policy rule that passes

### Demo Scenarios

The app includes 4 built-in demo scenarios to showcase different verification outcomes:
1. **Clean Match** — Everything matches perfectly
2. **Price Mismatch** — Unit prices differ from PO
3. **Quantity Discrepancy** — Invoiced quantity ≠ PO / GRN quantity
4. **Missing PO** — Invoice without a purchase order reference

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `POST` | `/api/extract` | Send invoice image to Gemini for extraction |
| `GET` | `/api/pos` | List all POs for authenticated user |
| `POST` | `/api/pos` | Create a new PO |
| `GET` | `/api/pos/:poNumber` | Get a specific PO by number |
| `DELETE` | `/api/pos/:id` | Delete a PO |
| `GET` | `/api/grns` | List all GRNs for authenticated user |
| `POST` | `/api/grns` | Create a new GRN |
| `GET` | `/api/grns/po/:poNumber` | Get GRN by PO number |
| `GET/PUT` | `/api/settings/rules` | Get or update business rules |
| `GET/POST/DELETE` | `/api/settings/vendors` | Manage approved vendor list |

All endpoints (except auth) require `Authorization: Bearer <token>` header.

## License

MIT