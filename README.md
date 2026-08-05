# FactoryMind AI — AI Decision Intelligence Platform for MSME Manufacturing

**An AI-powered Decision Intelligence Platform purpose-built for Micro, Small, and Medium Manufacturing Enterprises (MSMEs).** Factory owners and floor managers get live visibility into production, inventory, energy, maintenance, sales, quality, and workforce — plus an AI Copilot that answers natural-language questions using real, live factory data.

Built as a **full-stack production system**: a Next.js 16 web application, an Express/TypeScript REST API, Google Gemini-powered AI features, and a realtime Cloud Firestore database secured with role-based, factory-isolated access.

---

## Why This Project Stands Out

- **AI Copilot grounded in live data** — not a generic chatbot. The AI pulls real-time production, inventory, BOM, and order records and performs constraint-based "max buildable / bottleneck component" calculations before answering.
- **Full full-stack ownership** — authentication, authorization, realtime data sync, AI integration, analytics, and deployment are all engineered end-to-end by a single system.
- **Enterprise-grade security** — JWT-verified request flows, multi-tenant `factoryId` data isolation, and a hardened Express API (Helmet, CORS, rate limiting, input validation).
- **Scalable, testable architecture** — typed TypeScript on both sides, Jest test suites, Zod validation, and clean separation of routes, middleware, and services.

---

## Features

### AI & Intelligence
- **AI Factory Copilot** — Ask questions in plain language; receive structured answers with `summary`, `key_findings`, `risk_level`, `recommended_actions`, and `confidence`.
- **BOM Intelligence** — Calculates **maximum buildable assemblies** and identifies the **bottleneck component** using real component stock vs. required quantities.
- **Order Feasibility** — Assesses whether incoming customer orders can be fulfilled from current inventory.
- **Automated Daily Briefings & Weekly Summaries** — AI-generated, plain-language performance digests.
- **AI Alerts** — Proactive notifications based on recorded factory telemetry.

### Factory Operations Modules
- **Production** — Target vs. actual output, machine-wise breakdown, rejected quantity, and downtime tracking.
- **Inventory & Components** — Stock levels, low-stock alerts, ABC classification, and reserved stock for BOM planning.
- **Maintenance** — Machine health scores, issue priority (`CRITICAL`/`HIGH`/etc.), repair scheduling, and downtime tracking.
- **Energy** — Consumption (kWh), cost in INR, power factor, and carbon footprint per machine.
- **Sales & Orders** — Customer orders, revenue, profit, and fulfillment status.
- **Quality** — Inspections, pass rate, and defect-pattern breakdown.
- **Workforce** — Attendance, productivity, and shift planning.
- **Machine Production & Suggestions** — Per-machine output logging with AI-powered improvement suggestions and telegram-style owner↔manager messaging.

### Data & UX
- **Excel Import/Export** — Bulk-upload data via `.xlsx` parsing; export to Excel for reporting.
- **Realtime Dashboard** — Live Firestore listeners; charts, trends, and KPIs via Recharts and React Query.
- **Reports & Analytics** — Filterable reports, manufacturing KPIs, and trend analysis.

### Access Control & Security
- **Role-Based Access** — `OWNER` (full factory access) and `MANAGER` (department-scoped) roles.
- **Multi-Tenant Isolation** — Every operational document carries a `factoryId`; all backend queries are scoped to the authenticated user's factory.
- **Secure Auth** — Firebase Email/Password auth; JWT verified by the backend on every API call; Next.js middleware protects routes.

---

## Tech Stack

### Frontend
| Technology | Use |
|-----------|-----|
| **Next.js 16** (App Router) | React framework, server & client rendering |
| **TypeScript** | End-to-end type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Firebase Client SDK** | Auth, Firestore realtime listeners, Storage |
| **Recharts** | Visualizations & dashboards |
| **TanStack React Query** | Server-state fetching & caching |
| **Framer Motion** | UI animations |
| **xlsx** | Excel import/export |

### Backend
| Technology | Use |
|-----------|-----|
| **Node.js / Express 5** | REST API server |
| **TypeScript** | Type safety across all services |
| **Firebase Admin SDK** | Token verification & Firestore access |
| **Google Gemini API** | AI Copilot, briefings, summaries |
| **Helmet** | Security headers |
| **CORS** | Controlled cross-origin access |
| **express-rate-limit** | API rate limiting |
| **Zod** | Request/input validation |
| **Jest + Supertest** | Unit & integration tests |
| **ws** | WebSocket support |

### Database & Infrastructure
- **Cloud Firestore** — NoSQL document database with realtime capabilities.
- **Firebase Authentication** — Email/Password sign-in.
- **Vercel** — Frontend + backend hosting.
- **Firebase** — Security rules & composite-index deployment.

---

## Architecture

```
┌──────────────┐      Firebase Auth       ┌──────────────────┐
│   Browser     │◄────────────────────────│  Firebase Auth   │
│  (Next.js)    │      ID Token           │  (Client SDK)    │
│              │─────────────────────────►│                  │
│   UI Pages    │   Bearer ID Token       │   Express API    │
│  (Owner/      │                          │  (Admin SDK)    │
│   Manager)    │─────────────────────────►│                  │
│              │  Firestore onSnapshot    │  Cloud Firestore │
│              │◄────────────────────────│                  │
└──────────────┘                          └──────────────────┘
```

### Authentication & Authorization Flow
1. User signs in with email + password on `/login`.
2. Firebase Auth returns an ID token, stored in a `__session` cookie.
3. Next.js middleware verifies the session and redirects by role.
4. Protected pages call the Express API with the token as a Bearer header.
5. The backend `requireAuth` middleware verifies via Firebase Admin and attaches `uid`, `role`, `factoryId`, `departmentId`.
6. Every Firestore query is scoped to `factoryId` — guaranteeing **multi-tenant data isolation**.

### AI Copilot Data Flow
1. Owner asks a natural-language question.
2. The backend `gatherContext()` selectively fetches relevant live Firestore data (production, inventory, maintenance, energy, sales, workforce, quality, BOM, orders).
3. BOM intelligence runs constraint math to compute **max buildable units** and the **bottleneck component**.
4. Gemini returns a strict, structured JSON answer (`summary`, `key_findings`, `risk_level`, `recommended_actions`, `data_sources`, `confidence`).
5. The frontend renders the structured result with a risk badge and action list.

### Firestore Collection Structure
```
users/{userId}            — name, email, role, factoryId, departmentId
factories/{factoryId}     — name, location, industry
machines/{machineId}      — factoryId, machineCode, status, healthScore
components/{componentId}  — factoryId, componentName, currentStock, reservedStock
products/{productId}      — factoryId, productName, productCode
bill_of_materials/{docId} — factoryId, productId, componentId, quantityRequired
customer_orders/{docId}   — factoryId, orderNumber, quantity, status
production/{docId}        — factoryId, date, machineCode, target/actual/rejected
inventory/{docId}         — factoryId, category, currentStock, abcClass
maintenance/{docId}       — factoryId, machineId, priority, status
energy/{docId}            — factoryId, date, consumptionKwh, cost
sales/{docId}             — factoryId, orderDate, orderValue, status
quality_inspections/{docId} — factoryId, inspected/passed/rejected, defectType
workers/{workerId}        — factoryId, name, department, status
notifications/{docId}     — factoryId, isRead, type, severity
messages/{docId}          — factoryId, sender, receiver, text, createdAt
```

All operational documents carry `factoryId` for multi-tenant isolation.

---

## Getting Started

### Prerequisites
- **Node.js 18+** (20+ recommended)
- A Firebase project with **Authentication** (Email/Password) and **Cloud Firestore** enabled
- *(Optional)* A **Google Gemini API key** for AI features

### 1. Clone & Install

```bash
git clone <repository-url>
cd factorymind-msme

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 2. Firebase Setup
1. Create a project in the [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create a **Cloud Firestore** database.
4. Register a web app to obtain your Firebase config.
5. In **Project Settings → Service Accounts**, generate a private key and base64-encode the JSON:
   ```bash
   base64 -i path/to/service-account.json | pbcopy
   ```

### 3. Environment Configuration

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_API_URL=http://localhost:4000
GEMINI_API_KEY=your-gemini-api-key
```

**Backend** (`backend/.env`):
```env
PORT=4000
FIREBASE_SERVICE_ACCOUNT_BASE64=your-base64-encoded-service-account
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:3000
```

### 4. Deploy Firestore Rules & Indexes

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 5. Seed Data (Optional)

```bash
cd backend
npm run seed          # baseline sample data
npm run seed:demo     # demo records
npm run seed:complete # full dataset
npm run seed:owner    # owner account
```

---

## Running the Application

| Service | Command | URL |
|---------|---------|-----|
| Backend | `cd backend && npm run dev` | `http://localhost:4000` |
| Frontend | `cd frontend && npm run dev` | `http://localhost:3000` |

### Production Builds

```bash
cd frontend && npm run build   # Next.js production build
cd backend  && npm run build   # TypeScript compile -> dist/
```

---

## Testing

The project includes Jest unit and integration test suites with Supertest, covering the API, auth flow, and routes.

```bash
# Backend tests
cd backend && npm test
```

---

## Deployment

### Web Application (Vercel)
1. Push the repository to GitHub.
2. Import the project in Vercel as a monorepo.
3. Configure environment variables for both frontend and backend services.
4. Deploy — `vercel.json` routes `/api/backend/*` to the backend service.

### Database (Firebase)
1. Deploy security rules and indexes (see step 4 above).

---

## Role Permissions

| Role | Access |
|------|--------|
| **OWNER** | Full access to all modules (production, inventory, maintenance, energy, sales, quality, workforce, analytics, reports, AI Copilot, manager & messaging management) within their factory |
| **MANAGER** | Department-scoped access: data entry, production, inventory, maintenance, energy, workforce, quality, orders, uploads, and notifications |

---

## Project Structure

```
factorymind-msme/
├── frontend/                    # Next.js 16 web application
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/           # Authentication
│   │   │   ├── owner/           # OWNER dashboard, modules, AI Copilot, reports
│   │   │   ├── manager/         # MANAGER data entry, uploads, history
│   │   │   ├── api/backend/ai/  # AI Copilot chat API route
│   │   │   └── profile/         # User profile
│   │   ├── components/          # auth, layout, notifications, ui (design system)
│   │   ├── lib/                 # firebase, api, auth helpers
│   │   ├── utils/excel/         # .xlsx parse/export
│   │   └── middleware.ts        # Route protection
│   └── package.json
├── backend/                     # Express + TypeScript API
│   ├── src/
│   │   ├── index.ts             # Server entry
│   │   ├── routes/              # auth.ts, api.ts (all REST endpoints)
│   │   ├── middleware/auth.ts   # requireAuth (JWT verification)
│   │   ├── services/ai.ts       # Gemini AI + context gathering
│   │   ├── lib/firebase-admin.ts
│   │   ├── scripts/             # Seeding scripts
│   │   ├── __tests__/           # Jest test suites
│   │   └── types/               # Shared types
│   └── package.json
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Composite indexes
├── vercel.json                  # Vercel deployment config
└── README.md
```

---

## Highlights for Developers & Recruiters

**What this project demonstrates:**
- ✅ Full-stack TypeScript development (Next.js + Node.js/Express)
- ✅ Realtime applications with Google Cloud Firestore
- ✅ AI integration (Google Gemini) with structured, grounded, live-data responses
- ✅ Secure multi-tenant SaaS-style architecture (JWT auth, RBAC, data isolation)
- ✅ Production-grade hardening (Helmet, CORS, rate limiting, Zod validation)
- ✅ Test-driven development (Jest, Supertest)
- ✅ CI/cloud deployment (Firebase + Vercel)

---

## License

MIT

## Acknowledgments

- **Firebase** — authentication, Firestore database, and hosting
- **Google Gemini** — AI Copilot and intelligence features
- **Next.js & Vercel** — application framework and hosting