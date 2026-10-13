# 🌾 Kisan Sathi Market Intelligence

> **Production-Oriented AI Agent & Real-time Agricultural Market Pricing Platform for Telangana & Pan-India Farmers.**

Kisan Sathi Market Intelligence is a modern, full-stack, deployable web application engineered to collect authentic agricultural market-price data from official Government of India sources, maintain an immutable historical database with idempotent upserts, and deliver evidence-grounded price intelligence for farmers.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Next.js Route Handlers (`/api/...`) with strict **Zod** schema validation.
- **Database**: PostgreSQL (Supabase compatible) with migrations, indexes, constraints, and Row Level Security (RLS).
- **Data Connectors**:
  - **AGMARKNET**: Directorate of Marketing & Inspection (DMI), Ministry of Agriculture & Farmers Welfare, GoI.
  - **data.gov.in (OGD)**: Open Government Data Platform India (`api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`).
  - **e-NAM**: National Agriculture Market (SFAC).
  - **TG Marketing**: Telangana State Agricultural Marketing Department (`tgmarketing.gov.in`).
- **Data Ingestion Pipeline**:
  - Resilient connector requests with exponential backoff and circuit breaking.
  - Strict separation between **Observation Date** and **Ingestion Timestamp**.
  - Idempotent upserts keyed on `(source_id, market_id, commodity_id, variety, observation_date)`.
  - Automated Data Quality Auditor flagging boundary violations (`min > max`, negative prices, out-of-bounds modal values, stale data).
- **Pricing & Analytics Engine**:
  - Deterministic calculations: min, max, modal prices per quintal and per kg.
  - Inter-mandi price spreads and transport haulage thresholds.
  - 7-day and 30-day percentage changes and trend directions (`UP`, `DOWN`, `STABLE`).
  - Farmer Net Return Calculator: `Gross Estimated Value - (Transport + Bagging/Labor + Mandi Cess + Other Costs)`.
- **Strictly Grounded AI Agent (Kisan Sathi Pricing Agent)**:
  - Tool-calling architecture with 9 read-only pricing tools.
  - LLM serves as interpreter and explainer, **never** a price generator.
  - Fail-closed protocols: zero hallucinations, refusing to invent missing prices.

---

## 📁 Project Directory Structure

```text
kisan-sathi-market-intelligence/
├── migrations/
│   └── 001_market_intelligence_schema.sql  # Normalized PostgreSQL schema with RLS & indexes
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # Root layout with responsive metadata
│   │   ├── page.tsx                        # Main dashboard wiring all 8 interactive tabs
│   │   ├── globals.css                     # Tailwind styling & animations
│   │   └── api/
│   │       ├── health/route.ts             # Health check & connector status
│   │       ├── prices/latest/route.ts      # Paginated market price query
│   │       ├── prices/history/route.ts     # Time-series trend records
│   │       ├── prices/compare/route.ts     # Cross-mandi comparison & spread
│   │       ├── pricing/calculate/route.ts  # Deterministic net return calculation
│   │       ├── agent/chat/route.ts         # Grounded AI agent chat endpoint
│   │       ├── ingestion/trigger/route.ts  # Admin manual sync trigger
│   │       └── data-quality/issues/route.ts# Quality issue logs
│   ├── components/
│   │   ├── Navbar.tsx                      # Responsive top navigation
│   │   ├── OverviewDashboard.tsx           # KPIs, top crop highlights, trust notice
│   │   ├── LiveMarketPrices.tsx            # Filterable, paginated mandi table
│   │   ├── MarketComparison.tsx            # Side-by-side mandi arbitrage analysis
│   │   ├── HistoricalTrends.tsx            # Time-series trajectory visualizer
│   │   ├── CropInventoryValuation.tsx      # Interactive net return calculator
│   │   ├── AskKisanSathiAgent.tsx          # Grounded AI chat with tool log inspector
│   │   ├── DataSourcesAndFreshness.tsx     # Official sources registry & policies
│   │   └── AdminDataHealth.tsx             # Ingestion trigger & quality audit logs
│   └── lib/
│       ├── types/index.ts                  # Domain models & Zod validation schemas
│       ├── connectors/                     # Government API connectors (Agmarknet, OGD, e-NAM)
│       ├── ingestion/                      # Normalizer, pipeline orchestrator & baseline
│       ├── db/repository.ts                # Resilient data repository with idempotent upsert
│       ├── pricing/engine.ts               # Deterministic gross value & net return engine
│       ├── agent/                          # Pricing Agent & 9 read-only tool definitions
│       └── quality/validator.ts            # Data quality sanity checker
├── tests/
│   ├── pricing.test.ts                     # Unit tests for conversions & calculations
│   ├── normalizer.test.ts                  # Unit tests for date parsing & anomaly handling
│   ├── agent.test.ts                       # AI Agent tool execution & fail-closed tests
│   └── ingestion.test.ts                   # Ingestion pipeline & idempotency tests
├── .env.example
├── vitest.config.ts
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## 🚀 Quickstart & Local Setup

### 1. Installation
```bash
cd C:\Users\HP\.gemini\antigravity\scratch\kisan-sathi-market-intelligence
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Optional: Provide `DATA_GOV_IN_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, or `GEMINI_API_KEY`). The application includes a resilient verified Telangana baseline and in-memory repository to guarantee zero crashes even before API keys are configured.*

### 3. Run Automated Tests
```bash
npm test
```
*(Runs 14 unit and integration tests across normalizer, pricing engine, AI agent, and ingestion idempotency).*

### 4. Build for Production
```bash
npm run build
```

### 5. Start Production Server
```bash
npm start
```
Access the application at `http://localhost:3000`.

---

## 🗄️ Database Schema & Supabase Setup

The schema is defined in [`migrations/001_market_intelligence_schema.sql`](./migrations/001_market_intelligence_schema.sql).

### Key Tables:
1. `source_registry`: Metadata for AGMARKNET, DATA_GOV_IN, ENAM, and TG_MARKETING.
2. `states`, `districts`, `markets`: Geographic hierarchy covering Telangana APMC yards (Enumamula, Bowenpally, Nizamabad, Khammam, Suryapet, Badepally, Karimnagar, Gajwel).
3. `commodities`, `commodity_varieties`: Telangana Sona Paddy, Cotton, Turmeric, Chilli Red, Maize, Bengal Gram, Red Gram.
4. `market_price_observations`: Immutable historical observations with generated columns for `min_price_per_kg`, `max_price_per_kg`, and `modal_price_per_kg`.
   - **Unique Idempotency Constraint**: `(source_id, market_id, commodity_id, variety, grade, observation_date)`.
5. `ingestion_jobs`: Execution tracking and duration metrics.
6. `data_quality_issues`: Audit trail of flagged anomalies.
7. `farmer_crop_inventory`: Farmer storage records.
8. `audit_events`: Security and administrative action logs.

To apply migrations on Supabase:
1. Open your Supabase Studio project dashboard.
2. Navigate to **SQL Editor**.
3. Paste and run the contents of [`migrations/001_market_intelligence_schema.sql`](./migrations/001_market_intelligence_schema.sql).

---

## 🤖 Kisan Sathi Pricing Agent: Read-Only Tools

| Tool Name | Parameters | Purpose |
| :--- | :--- | :--- |
| `search_market_prices` | `commodityId, districtId, marketId, startDate, endDate, limit` | Filter stored observations |
| `get_latest_available_price` | `commodityId, marketId` | Latest verified observation |
| `get_historical_prices` | `commodityId, marketId, limit` | Chronological time series |
| `compare_markets` | `commodityId, date` | Side-by-side inter-mandi comparison & price spread |
| `get_price_trend` | `commodityId, marketId` | Deterministic 7-day trend, direction, volatility |
| `calculate_gross_value` | `commodityId, marketId, quantity, unit` | Deterministic Quantity × Price |
| `calculate_estimated_net_return` | `commodityId, marketId, quantity, unit, transport, labor, cess` | Net realization after logistics deductions |
| `get_data_freshness` | `commodityId, marketId` | Observation date vs. ingestion timestamp audit |
| `get_source_provenance` | `sourceId` | Official authority, portal URL, and verification details |

---

## 🛡️ Strict Zero-Hallucination Governance

1. **Deterministic Calculations Only**: All price conversions, gross valuations, transport deductions, and percentage changes run in TypeScript backend logic &mdash; never generated mentally by an LLM.
2. **Explicit Citations**: Every response lists the reporting source, APMC yard, and exact observation date.
3. **Fail-Closed Stance**: If data is missing for a commodity or date, the agent returns an honest no-data notice rather than fabricating a figure.
4. **Logistics Caveat**: Farmers are cautioned that a higher price at a distant yard does not ensure profit if haulage exceeds the price spread.
