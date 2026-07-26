# FactoryMind AI — AI Decision Intelligence Platform for MSMEs

An AI-powered Decision Intelligence Platform designed for Micro, Small and Medium Manufacturing Enterprises (MSMEs). Factory owners and managers can monitor production, inventory, energy, maintenance, sales, and workers, with an AI Copilot for natural-language factory insights.

## Features

- **AI Factory Copilot** — ChatGPT-style interface for natural language queries about factory operations
- **Production Management** — Track orders, machine allocation, and production planning
- **Inventory Management** — Monitor raw materials, finished goods, and stock levels
- **Maintenance Management** — Machine health scores, repair scheduling, and downtime tracking
- **Energy Management** — Track consumption, costs, and carbon footprint
- **Sales Management** — Orders, customers, revenue, and profit tracking
- **Worker Management** — Attendance, productivity, and shift planning
- **Reports & Analytics** — Generate reports and analyze performance metrics
- **Role-Based Access** — Factory OWNER and MANAGER roles with factory-isolated data

## Tech Stack

### Frontend
- **Next.js** — React framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Firebase Client SDK** — Authentication, Firestore (realtime listeners), Storage
- **Recharts** — Charts and graphs
- **React Query** — Data fetching and caching
- **Framer Motion** — Animations

### Backend
- **Node.js / Express** — API server
- **TypeScript** — Type safety
- **Firebase Admin SDK** — Token verification, Firestore access
- **Google Gemini API** — AI Copilot and automated briefings

### Database
- **Cloud Firestore** — NoSQL document database with realtime capabilities

## Architecture

```
┌──────────────┐     Firebase Auth     ┌──────────────────┐
│              │◄──────────────────────│                  │
│   Browser    │     ID Token          │   Firebase Auth  │
│  (Next.js)   │                       │   (Client SDK)   │
│              │──────────────────────►│                  │
│              │  Bearer ID Token      │  Express API     │
│              │                       │  (Admin SDK)     │
│              │──────────────────────►│                  │
│   UI Pages   │  Firestore onSnapshot │  Cloud Firestore │
│              │◄──────────────────────│                  │
└──────────────┘                       └──────────────────┘
```

### Authentication Flow

1. User enters email + password on `/login`
2. Firebase Auth `signInWithEmailAndPassword()` authenticates and returns an ID token
3. ID token is stored in `__session` cookie via `cookies-next`
4. Next.js middleware reads the cookie and verifies it by calling `GET /auth/me` on the backend
5. Backend uses `firebase-admin` to verify the ID token and returns the user's role (`OWNER` or `MANAGER`) and `factoryId`
6. Middleware redirects: `OWNER` → `/owner/*`, `MANAGER` → `/manager/*`
7. Protected pages use `api.ts` (which injects the Firebase ID token as a Bearer header) to call the Express API
8. Express `requireAuth` middleware verifies the token via `adminAuth.verifyIdToken()` and attaches `uid`, `role`, `factoryId`, `departmentId` to the request
9. API routes scope all Firestore queries to `factoryId` for multi-tenant isolation

### Firestore Structure

```
users/{userId}           — name, email, role, factoryId, departmentId
factories/{factoryId}    — name, location, industry
machines/{machineId}     — factoryId, machineCode, status, healthScore
workers/{workerId}       — factoryId, name, department, status
production/{docId}       — factoryId, departmentId, date, machineCode, quantities
inventory/{docId}        — factoryId, category, currentStock, abcClass
maintenance/{docId}      — factoryId, machineId, reportedDate, status
energy/{docId}           — factoryId, date, energyConsumptionKwh, energyCost
sales/{docId}            — factoryId, orderDate, orderValue, status
notifications/{docId}    — factoryId, isRead, createdAt, type, severity
```

All operational documents carry `factoryId` for multi-tenant isolation.

## Prerequisites

- Node.js 18+
- A Firebase project with Authentication (Email/Password) and Firestore enabled
- (Optional) Google Gemini API key for AI features

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd factorymind-msme
```

### 2. Install dependencies

#### Frontend
```bash
cd frontend
npm install
```

#### Backend
```bash
cd backend
npm install
```

### 3. Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Sign-in method → **Email/Password**
3. Create a **Cloud Firestore** database
4. Register a web app to get your Firebase config
5. Generate a **Service Account** (Project Settings → Service Accounts → Generate New Private Key)
6. Base64-encode the service account JSON:
   ```bash
   base64 -i path/to/service-account.json | pbcopy
   ```

### 4. Environment Setup

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Backend (`backend/.env`)
```env
PORT=4000
FIREBASE_SERVICE_ACCOUNT_BASE64=your-base64-encoded-service-account
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:3000
```

### 5. Firestore Security Rules

Deploy the rules from `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

Deploy indexes from `firestore.indexes.json`:
```bash
firebase deploy --only firestore:indexes
```

### 6. Seed Data

Populate Firestore with sample data (future: automated seeding script). Currently, you must add documents manually or via the API.

## Running the Application

### Start Backend
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:4000`

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

## Build Commands

### Frontend
```bash
cd frontend
npm run build    # Production build
```

### Backend
```bash
cd backend
npm run build    # Compile TypeScript
```

## Environment Variables

### Frontend
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain (`<project>.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_API_URL` | Backend API URL |

### Backend
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 4000) |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Base64-encoded Firebase Admin service account JSON |
| `GEMINI_API_KEY` | Google Gemini API key (for AI Copilot) |
| `FRONTEND_URL` | Allowed CORS origin (default: `http://localhost:3000`) |

## Roles

| Role | Access |
|------|--------|
| `OWNER` | Full access to all modules within their factory |
| `MANAGER` | Production, inventory, maintenance, energy, workers; scoped to department |

## Project Structure

```
factorymind-msme/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/          — Login page
│   │   │   ├── owner/          — OWNER pages
│   │   │   │   ├── dashboard/
│   │   │   │   ├── production/
│   │   │   │   ├── inventory/
│   │   │   │   ├── maintenance/
│   │   │   │   ├── energy/
│   │   │   │   ├── sales/
│   │   │   │   ├── workers/
│   │   │   │   ├── managers/
│   │   │   │   ├── analytics/
│   │   │   │   ├── reports/
│   │   │   │   ├── ai-copilot/
│   │   │   │   └── settings/
│   │   │   ├── manager/        — MANAGER pages
│   │   │   │   ├── dashboard/
│   │   │   │   ├── data-entry/
│   │   │   │   ├── history/
│   │   │   │   ├── uploads/
│   │   │   │   ├── notifications/
│   │   │   │   └── settings/
│   │   │   └── profile/
│   │   ├── components/
│   │   │   ├── auth/           — AuthProvider, useAuth
│   │   │   ├── layout/         — OwnerLayout, ManagerLayout
│   │   │   └── ui/             — Shadcn-style components
│   │   ├── lib/
│   │   │   ├── firebase.ts     — Firebase client init
│   │   │   └── api.ts          — Auth-helper fetch wrapper
│   │   └── middleware.ts       — Route protection via token verification
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── index.ts            — Express server entry
│   │   ├── routes/
│   │   │   ├── auth.ts         — GET /auth/me (token verification)
│   │   │   └── api.ts          — All Firestore-backed API routes
│   │   ├── middleware/
│   │   │   └── auth.ts         — requireAuth middleware
│   │   ├── services/
│   │   │   └── ai.ts           — Gemini AI + context gathering
│   │   ├── lib/
│   │   │   └── firebase-admin.ts — Admin SDK init
│   │   └── types/
│   │       └── index.ts        — Shared types
│   ├── .env.example
│   └── package.json
├── firestore.rules             — Security rules
├── firestore.indexes.json      — Composite indexes
├── vercel.json                 — Vercel deployment config
└── README.md
```

## Deployment

### Frontend + Backend (Vercel)

1. Push code to GitHub
2. Import project in Vercel (monorepo)
3. Set environment variables for both services
4. Deploy — `vercel.json` routes `/api/backend/*` to the backend service

### Database (Firestore)

1. Deploy security rules: `firebase deploy --only firestore:rules`
2. Deploy indexes: `firebase deploy --only firestore:indexes`

## Testing

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

## License

MIT

## Acknowledgments

- Firebase for authentication and database
- Google for Gemini AI
- Vercel for hosting platform
