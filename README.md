# FactoryMind AI - AI Decision Intelligence Platform for MSMEs

An AI-powered Decision Intelligence Platform specifically designed for Micro, Small and Medium Manufacturing Enterprises (MSMEs). This platform helps factory owners make smarter operational decisions using Artificial Intelligence.

## 🚀 Features

- **AI Factory Copilot** - ChatGPT-style interface for natural language queries about factory operations
- **Production Management** - Track orders, machine allocation, and production planning
- **Inventory Management** - Monitor raw materials, finished goods, and stock levels
- **Maintenance Management** - Predictive maintenance, machine health scores, and repair scheduling
- **Energy Management** - Track consumption, costs, and carbon footprint
- **Sales Management** - Orders, customers, revenue, and profit tracking
- **Worker Management** - Attendance, productivity, and shift planning
- **Reports & Analytics** - Generate reports and analyze performance metrics
- **Role-Based Access** - Different permissions for Factory Owner, Production Manager, Maintenance Engineer, etc.

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn UI** - UI components
- **Framer Motion** - Animations
- **Recharts** - Charts and graphs
- **React Query** - Data fetching and caching
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Supabase** - Database and authentication
- **Gemini API** - AI capabilities

### Database
- **Supabase PostgreSQL** - Relational database

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account (for database and auth)
- Google Gemini API key (for AI features)

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd MSME-6
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

### 3. Environment Setup

#### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Backend (.env)
```env
PORT=3001
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-jwt-secret
```

### 4. Database Setup

1. Create a Supabase project
2. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
3. Set up authentication in Supabase

## 🚀 Running the Application

### Start Backend
```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:3001`

### Start Frontend
```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
MSME-6/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/
│   │   │   └── dashboard/
│   │   │       ├── ai-copilot/
│   │   │       ├── production/
│   │   │       ├── inventory/
│   │   │       ├── maintenance/
│   │   │       ├── energy/
│   │   │       ├── sales/
│   │   │       ├── workers/
│   │   │       ├── reports/
│   │   │       ├── analytics/
│   │   │       └── settings/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── ui/
│   │   │   ├── auth/
│   │   │   └── notifications/
│   │   └── lib/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── types/
│   │   ├── utils/
│   │   └── data/
│   └── package.json
├── supabase/
│   └── schema.sql
└── README.md
```

## 🎨 Design System

### Colors
- **Background**: #F8F9FA
- **Primary**: #1F3A5F
- **Secondary**: #4F6D7A
- **Accent**: #2E8B57
- **Warning**: #F4B400
- **Danger**: #D93025
- **Text**: #1A1A1A
- **Border**: #E5E7EB

### Typography
- **Headings**: Poppins
- **Body**: Inter
- **Numbers**: IBM Plex Sans

## 🔐 Authentication

The application uses Supabase Authentication with role-based access control:

- **Factory Owner**: Full access to all modules
- **Production Manager**: Production, inventory, maintenance, energy, workers, reports
- **Maintenance Engineer**: Maintenance, energy, reports
- **Inventory Manager**: Inventory, production, reports, analytics
- **Worker**: Dashboard, production, maintenance
- **Admin**: Full access

## 🤖 AI Features

The AI Copilot uses Google's Gemini API to provide:
- Natural language queries about factory data
- Predictive maintenance alerts
- Demand forecasting
- Energy optimization suggestions
- Production recommendations
- Cost reduction insights

## 📊 Sample Data

The backend includes a sample data generator (`backend/src/data/sample-data-generator.ts`) that generates:
- 50 Machines
- 100 Workers
- 50 Inventory Items
- 25 Production Orders
- 30 Sales Orders

## 🚢 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Backend (Render/Railway)

1. Push code to GitHub
2. Import project in Render/Railway
3. Set environment variables
4. Deploy

### Database (Supabase)

1. Use Supabase cloud hosting
2. Run schema migrations
3. Configure authentication

## 📝 Environment Variables

### Frontend
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Backend
- `PORT` - Server port (default: 3001)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GEMINI_API_KEY` - Google Gemini API key
- `JWT_SECRET` - JWT secret for authentication

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- Built for MSME Industry 4.0 & 5.0 Hackathon

## 🙏 Acknowledgments

- Supabase for database and authentication
- Google for Gemini AI
- Vercel for hosting platform
- Shadcn UI for component library

## 📞 Support

For support, email support@factorymind.ai or open an issue in the repository.

---

**Built with ❤️ for Modern Manufacturing**
