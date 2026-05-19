# SalesMS — Sales Management System

A production-ready sales management system built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **PostgreSQL**.

---

## Features

- **Admin Authentication** — Secure login with iron-session
- **Business Capital Tracking** — Initial Capital, Net Profit, Present Value
- **Product Management** — CRUD with category filtering and search
- **Sales Recording** — Multi-item sales with auto profit calculation
- **Sales History** — Full filter suite (date, product, profit, month, year)
- **Per-Product Analytics** — Units sold, revenue, profit, sales chart
- **Dashboard** — Revenue/profit charts, top products, recent sales
- **CSV Export** — Export filtered sales records
- **Pagination** — All tables paginated
- **Dark Mode** — Full dark editorial UI (Sora + Instrument Serif)
- **Toast Notifications** — All actions notify via react-hot-toast

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | iron-session (cookie-based) |
| Charts | Recharts |
| Validation | Zod |
| Notifications | react-hot-toast |

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo>
cd sales-mgmt
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/salesms"
SESSION_SECRET="your-super-secret-session-key-min-32-chars-long!!"
```

### 3. Set up the database

Make sure PostgreSQL is running, then:

```bash
# Create and push the schema
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed with demo data
npm run db:seed
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Default Credentials

```
Email:    admin@salesms.com
Password: admin123
```

---

## Project Structure

```
sales-mgmt/
├── prisma/
│   ├── schema.prisma          # Database models
│   └── seed.ts                # Demo data seeder
├── app/
│   ├── api/
│   │   ├── auth/              # login, logout, me
│   │   ├── products/          # CRUD + [id]
│   │   ├── sales/             # CRUD + [id]
│   │   ├── stats/             # Business capital
│   │   └── dashboard/         # Aggregated dashboard data
│   ├── dashboard/
│   │   ├── page.tsx           # Dashboard overview
│   │   ├── layout.tsx         # Authenticated layout with sidebar
│   │   ├── products/          # Product management pages
│   │   ├── sales/             # Sale creation + detail
│   │   ├── history/           # Sales history with filters
│   │   └── settings/          # Business capital settings
│   ├── login/                 # Login page
│   └── layout.tsx             # Root layout
├── components/
│   ├── layout/                # Sidebar, TopBar
│   └── ui/                    # Button, Input, Select, Card, Badge, etc.
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   ├── session.ts             # iron-session config
│   └── utils.ts               # Formatters, helpers, CSV export
└── types/
    └── index.ts               # TypeScript interfaces
```

---

## Database Models

```prisma
Admin          — id, email, password, name
Product        — id, name, category
Sale           — id, totalAmount, totalProfit, createdAt
SaleItem       — id, saleId, productId, quantity, costPrice, sellingPrice, profit
BusinessStats  — id, initialCapital, totalNetProfit, presentValue
```

### Business Logic

```
Item Profit    = (Selling Price - Cost Price) × Quantity
Sale Profit    = Σ Item Profits
Net Profit     += Sale Profit  (updated on every sale)
Present Value  = Initial Capital + Total Net Profit
```

---

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current session |
| GET | `/api/products` | List products (paginated, filterable) |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Product detail + stats |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/sales` | List sales (paginated, filterable) |
| POST | `/api/sales` | Create sale (updates net profit) |
| GET | `/api/sales/:id` | Sale detail |
| GET | `/api/stats` | Business stats |
| PUT | `/api/stats` | Update initial capital |
| GET | `/api/dashboard` | Dashboard aggregate data |

---

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio (DB GUI)
```

---

## Customization

- **Currency**: Change `NGN` in `lib/utils.ts` → `formatCurrency()`
- **Categories**: Edit `CATEGORIES` array in `lib/utils.ts`
- **Colors**: Brand color is orange (`brand-500`). Change in `tailwind.config.js`
- **Fonts**: Sora + Instrument Serif. Change in `app/globals.css`
