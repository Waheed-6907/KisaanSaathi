-- ==============================================================================
-- KISAN SATHI MARKET INTELLIGENCE SCHEMA MIGRATION 001
-- Authentic Agricultural Pricing Database for Telangana & Pan-India
-- Compatible with PostgreSQL 14+ / Supabase
-- ==============================================================================

-- 1. Source Registry
CREATE TABLE IF NOT EXISTS public.source_registry (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    portal_url TEXT NOT NULL,
    api_endpoint TEXT,
    auth_type VARCHAR(20) DEFAULT 'public', -- 'api_key', 'public', 'oauth'
    refresh_cadence_hours INTEGER DEFAULT 24,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'degraded', 'offline'
    last_successful_sync_at TIMESTAMPTZ,
    last_attempt_at TIMESTAMPTZ,
    total_records_ingested BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Geographic Hierarchy: States, Districts, Markets (APMC Mandis)
CREATE TABLE IF NOT EXISTS public.states (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.districts (
    id VARCHAR(50) PRIMARY KEY,
    state_id VARCHAR(50) NOT NULL REFERENCES public.states(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(state_id, name)
);

CREATE TABLE IF NOT EXISTS public.markets (
    id VARCHAR(50) PRIMARY KEY,
    district_id VARCHAR(50) NOT NULL REFERENCES public.districts(id) ON DELETE RESTRICT,
    state_id VARCHAR(50) NOT NULL REFERENCES public.states(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    market_type VARCHAR(50) DEFAULT 'APMC Mandi',
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(district_id, name)
);

-- 3. Commodity Taxonomy: Commodities & Varieties
CREATE TABLE IF NOT EXISTS public.commodities (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    telugu_name TEXT,
    hindi_name TEXT,
    category VARCHAR(50) NOT NULL, -- 'Cereals', 'Commercial Crops', 'Spices', 'Pulses', 'Oilseeds'
    default_unit VARCHAR(20) DEFAULT 'Quintal',
    msp_inr_per_quintal NUMERIC(10, 2), -- Minimum Support Price where officially notified
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.commodity_varieties (
    id VARCHAR(100) PRIMARY KEY,
    commodity_id VARCHAR(50) NOT NULL REFERENCES public.commodities(id) ON DELETE CASCADE,
    variety_name TEXT NOT NULL,
    standard_grade VARCHAR(50) DEFAULT 'FAQ', -- 'FAQ' (Fair Average Quality), 'Grade A', 'Common'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(commodity_id, variety_name, standard_grade)
);

-- 4. Market Price Observations (Immutable historical records with idempotent upsert)
CREATE TABLE IF NOT EXISTS public.market_price_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id VARCHAR(50) NOT NULL REFERENCES public.source_registry(id) ON DELETE RESTRICT,
    source_record_id TEXT,
    commodity_id VARCHAR(50) NOT NULL REFERENCES public.commodities(id) ON DELETE RESTRICT,
    commodity_name TEXT NOT NULL,
    variety TEXT NOT NULL DEFAULT 'Other',
    grade TEXT NOT NULL DEFAULT 'FAQ',
    state_id VARCHAR(50) NOT NULL REFERENCES public.states(id) ON DELETE RESTRICT,
    district_id VARCHAR(50) NOT NULL REFERENCES public.districts(id) ON DELETE RESTRICT,
    market_id VARCHAR(50) NOT NULL REFERENCES public.markets(id) ON DELETE RESTRICT,
    
    -- Crucial Separation: Observation Date vs. Ingestion Timestamp
    observation_date DATE NOT NULL,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Authentic Price Points (Indian Rupees)
    min_price NUMERIC(10, 2) NOT NULL CHECK (min_price >= 0),
    max_price NUMERIC(10, 2) NOT NULL CHECK (max_price >= min_price),
    modal_price NUMERIC(10, 2) NOT NULL CHECK (modal_price >= min_price AND modal_price <= max_price),
    
    -- Normalized Unit Equivalents (1 Quintal = 100 Kilograms)
    min_price_per_kg NUMERIC(10, 2) GENERATED ALWAYS AS (min_price / 100.0) STORED,
    max_price_per_kg NUMERIC(10, 2) GENERATED ALWAYS AS (max_price / 100.0) STORED,
    modal_price_per_kg NUMERIC(10, 2) GENERATED ALWAYS AS (modal_price / 100.0) STORED,
    
    price_unit VARCHAR(30) DEFAULT 'Rs/Quintal',
    arrivals_quantity NUMERIC(12, 2) DEFAULT 0,
    arrivals_unit VARCHAR(30) DEFAULT 'Quintal',
    
    raw_payload JSONB,
    data_quality_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_stale BOOLEAN DEFAULT FALSE,
    
    -- Strict Idempotency Constraint to prevent duplicate records
    CONSTRAINT uq_market_observation_source UNIQUE (source_id, market_id, commodity_id, variety, grade, observation_date)
);

-- Indexes for lightning fast lookups & time-series aggregation
CREATE INDEX IF NOT EXISTS idx_obs_commodity_market_date 
    ON public.market_price_observations(commodity_id, market_id, observation_date DESC);
CREATE INDEX IF NOT EXISTS idx_obs_district_date 
    ON public.market_price_observations(district_id, observation_date DESC);
CREATE INDEX IF NOT EXISTS idx_obs_date 
    ON public.market_price_observations(observation_date DESC);
CREATE INDEX IF NOT EXISTS idx_obs_source 
    ON public.market_price_observations(source_id);

-- 5. Ingestion Pipeline Job Logs
CREATE TABLE IF NOT EXISTS public.ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id VARCHAR(50) NOT NULL REFERENCES public.source_registry(id) ON DELETE RESTRICT,
    job_type VARCHAR(50) DEFAULT 'DAILY_SYNC',
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'success', 'failed', 'partial'
    records_retrieved INTEGER DEFAULT 0,
    records_upserted INTEGER DEFAULT 0,
    records_rejected INTEGER DEFAULT 0,
    error_message TEXT,
    execution_time_ms INTEGER DEFAULT 0,
    triggered_by VARCHAR(50) DEFAULT 'scheduled_cron', -- 'scheduled_cron', 'admin_manual', 'webhook'
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    sync_summary JSONB
);

-- 6. Data Quality Issues Registry
CREATE TABLE IF NOT EXISTS public.data_quality_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id VARCHAR(50) REFERENCES public.source_registry(id) ON DELETE SET NULL,
    observation_id UUID REFERENCES public.market_price_observations(id) ON DELETE CASCADE,
    issue_type VARCHAR(50) NOT NULL, -- 'MIN_EXCEEDS_MAX', 'NEGATIVE_PRICE', 'ABNORMAL_SPIKE', 'STALE_DATA', 'MISSING_MANDATORY_FIELD'
    severity VARCHAR(20) NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'error', 'critical'
    details JSONB NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT
);

-- 7. Farmer Crop Inventory & Valuation
CREATE TABLE IF NOT EXISTS public.farmer_crop_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id TEXT NOT NULL,
    commodity_id VARCHAR(50) NOT NULL REFERENCES public.commodities(id) ON DELETE RESTRICT,
    quantity_quintals NUMERIC(10, 2) NOT NULL CHECK (quantity_quintals > 0),
    preferred_market_id VARCHAR(50) REFERENCES public.markets(id) ON DELETE SET NULL,
    harvest_date DATE,
    storage_type VARCHAR(50) DEFAULT 'On-Farm Godown',
    transport_cost_per_quintal NUMERIC(10, 2) DEFAULT 45.0,
    bagging_labor_cost_per_quintal NUMERIC(10, 2) DEFAULT 25.0,
    mandi_cess_percent NUMERIC(5, 2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Audit Events & Access Logs
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL, -- 'INGESTION_TRIGGERED', 'MANUAL_OVERRIDE', 'AGENT_QUERY', 'EXPORT_DATA'
    actor_id TEXT NOT NULL,
    ip_address TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
-- ==============================================================================
ALTER TABLE public.source_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commodity_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_price_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_crop_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Read policies: Open public access for farmers to verify authentic market prices
CREATE POLICY "Public Read Source Registry" ON public.source_registry FOR SELECT USING (true);
CREATE POLICY "Public Read Geography States" ON public.states FOR SELECT USING (true);
CREATE POLICY "Public Read Geography Districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Public Read Geography Markets" ON public.markets FOR SELECT USING (true);
CREATE POLICY "Public Read Commodities" ON public.commodities FOR SELECT USING (true);
CREATE POLICY "Public Read Varieties" ON public.commodity_varieties FOR SELECT USING (true);
CREATE POLICY "Public Read Market Price Observations" ON public.market_price_observations FOR SELECT USING (true);
CREATE POLICY "Public Read Ingestion Jobs" ON public.ingestion_jobs FOR SELECT USING (true);
CREATE POLICY "Public Read Quality Issues" ON public.data_quality_issues FOR SELECT USING (true);

-- Least Privilege Write Policies:
-- Only backend service role or authorized admin can write to official market price observations
CREATE POLICY "Service Role Write Market Observations" ON public.market_price_observations 
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Write Ingestion Jobs" ON public.ingestion_jobs 
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Write Quality Issues" ON public.data_quality_issues 
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==============================================================================
-- SEED FOUNDATIONAL OFFICIAL REGISTRIES & TELANGANA MANDI GEOGRAPHY
-- ==============================================================================
INSERT INTO public.source_registry (id, name, portal_url, api_endpoint, auth_type, refresh_cadence_hours, status)
VALUES
    ('AGMARKNET', 'Agricultural Marketing Information Network (DMI, GoI)', 'https://agmarknet.gov.in', 'https://agmarknet.gov.in/SearchCmmMkt.aspx', 'public', 24, 'active'),
    ('DATA_GOV_IN', 'Open Government Data Platform India (OGD)', 'https://data.gov.in', 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070', 'api_key', 24, 'active'),
    ('ENAM', 'National Agriculture Market (e-NAM, SFAC)', 'https://www.enam.gov.in', 'https://www.enam.gov.in/web/dashboard/agmarknet', 'public', 24, 'active'),
    ('TG_MARKETING', 'Telangana State Agricultural Marketing Dept', 'https://tgmarketing.gov.in', 'https://tgmarketing.gov.in', 'public', 24, 'active')
ON CONFLICT (id) DO NOTHING;

-- States
INSERT INTO public.states (id, name, code)
VALUES ('TELANGANA', 'Telangana', 'TG')
ON CONFLICT (id) DO NOTHING;

-- Telangana Agricultural Districts
INSERT INTO public.districts (id, state_id, name)
VALUES 
    ('TG_WARANGAL', 'TELANGANA', 'Warangal'),
    ('TG_NIZAMABAD', 'TELANGANA', 'Nizamabad'),
    ('TG_RANGAREDDY', 'TELANGANA', 'Rangareddy'),
    ('TG_KHAMMAM', 'TELANGANA', 'Khammam'),
    ('TG_KARIMNAGAR', 'TELANGANA', 'Karimnagar'),
    ('TG_SURYAPET', 'TELANGANA', 'Suryapet'),
    ('TG_NALGONDA', 'TELANGANA', 'Nalgonda'),
    ('TG_MAHABUBNAGAR', 'TELANGANA', 'Mahabubnagar'),
    ('TG_ADILABAD', 'TELANGANA', 'Adilabad'),
    ('TG_MEDAK', 'TELANGANA', 'Medak')
ON CONFLICT (id) DO NOTHING;

-- Key Telangana APMC Mandis
INSERT INTO public.markets (id, district_id, state_id, name, market_type, latitude, longitude)
VALUES
    ('TG_MKT_ENUMAMULA', 'TG_WARANGAL', 'TELANGANA', 'Enumamula (Warangal)', 'APMC Major Mandi (Asia 2nd Largest)', 17.9863, 79.6231),
    ('TG_MKT_BOWENPALLY', 'TG_RANGAREDDY', 'TELANGANA', 'Bowenpally (Secunderabad)', 'Modern Terminal Market Yard', 17.4720, 78.4878),
    ('TG_MKT_NIZAMABAD', 'TG_NIZAMABAD', 'TELANGANA', 'Nizamabad APMC', 'Major Turmeric & Paddy Mandi', 18.6725, 78.0941),
    ('TG_MKT_KHAMMAM', 'TG_KHAMMAM', 'TELANGANA', 'Khammam Mandi', 'Major Red Chilli Hub', 17.2473, 80.1514),
    ('TG_MKT_SURYAPET', 'TG_SURYAPET', 'TELANGANA', 'Suryapet APMC Yard', 'Regional Grain Mandi', 17.1439, 79.6239),
    ('TG_MKT_BADEPALLY', 'TG_MAHABUBNAGAR', 'TELANGANA', 'Badepally (Jadcherla)', 'Oilseeds & Maize Mandi', 16.7661, 78.1408),
    ('TG_MKT_KARIMNAGAR', 'TG_KARIMNAGAR', 'TELANGANA', 'Karimnagar APMC', 'Paddy & Maize Mandi', 18.4386, 79.1288),
    ('TG_MKT_GAJWEL', 'TG_MEDAK', 'TELANGANA', 'Gajwel Integrated Market Yard', 'Model Integrated Market', 17.8541, 78.6811)
ON CONFLICT (id) DO NOTHING;

-- Key Telangana Agricultural Commodities
INSERT INTO public.commodities (id, name, telugu_name, hindi_name, category, default_unit, msp_inr_per_quintal)
VALUES
    ('PADDY_COMMON', 'Paddy(Dhan)(Common)', 'వరి (ధాన్యం - సాధారణ)', 'धान (सामान्य)', 'Cereals', 'Quintal', 2300.00),
    ('PADDY_GRADE_A', 'Paddy(Dhan)(Grade A)', 'వరి (ధాన్యం - గ్రేడ్ ఎ)', 'धान (ग्रेड ए)', 'Cereals', 'Quintal', 2320.00),
    ('COTTON', 'Cotton(Kapas)', 'పత్తి', 'कपास', 'Commercial Crops', 'Quintal', 7121.00),
    ('TURMERIC', 'Turmeric(Raw/Finger)', 'పసుపు', 'हल्दी', 'Spices', 'Quintal', NULL),
    ('CHILLI_RED', 'Chilli Red(Dry)', 'ఎండు మిర్చి', 'लाल मिर्च', 'Spices', 'Quintal', NULL),
    ('MAIZE', 'Maize(Makka)', 'మొక్కజొన్న', 'मक्का', 'Cereals', 'Quintal', 2225.00),
    ('BENGAL_GRAM', 'Bengal Gram(Gram)(Whole)', 'శనగలు', 'चना', 'Pulses', 'Quintal', 5650.00),
    ('RED_GRAM', 'Red Gram(Arhar/Tur)', 'కందులు', 'अरहर / तूर', 'Pulses', 'Quintal', 7550.00),
    ('SOYABEAN', 'Soyabean', 'సోయాబీన్', 'सोयाबीन', 'Oilseeds', 'Quintal', 4892.00)
ON CONFLICT (id) DO NOTHING;
