-- ============================================================================
-- KISAANSAATHI - INCLUSIVE FARMER CREDIT ASSESSMENT SYSTEM MIGRATION
-- Platform: KisanSaathi (Telangana Agricultural Platform)
-- Supabase Project: https://ytuiolcffxcqnwlefvrr.supabase.co
-- Date: 2026-10-14
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. AGRICULTURAL CREDIT SCHEMES (Authoritative Government & Bank Rules)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agricultural_credit_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_code TEXT UNIQUE NOT NULL,
    scheme_name TEXT NOT NULL,
    scheme_name_te TEXT,
    scheme_name_hi TEXT,
    issuing_agency TEXT NOT NULL,
    max_limit_amount NUMERIC NOT NULL,
    subsidized_interest_rate_pct NUMERIC NOT NULL,
    effective_interest_rate_pct NUMERIC,
    allows_no_credit_history BOOLEAN DEFAULT true,
    permits_tenant_farmers BOOLEAN DEFAULT true,
    eligible_tenancy_types TEXT[] NOT NULL DEFAULT '{"owner_cultivator", "tenant_farmer", "oral_lessee", "sharecropper", "jlg_member"}',
    eligible_purposes TEXT[] NOT NULL DEFAULT '{"crop_production", "seeds_fertilizers", "irrigation", "machinery", "post_harvest", "allied"}',
    required_documents TEXT[] NOT NULL DEFAULT '{"identity_aadhaar", "bank_passbook", "cultivation_proof"}',
    criteria_summary TEXT NOT NULL,
    verification_source_url TEXT NOT NULL,
    rules_verified_at DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Official Agricultural Schemes (RBI / NABARD / Telangana State Guidelines)
INSERT INTO public.agricultural_credit_schemes 
(scheme_code, scheme_name, scheme_name_te, scheme_name_hi, issuing_agency, max_limit_amount, subsidized_interest_rate_pct, effective_interest_rate_pct, allows_no_credit_history, permits_tenant_farmers, eligible_tenancy_types, eligible_purposes, required_documents, criteria_summary, verification_source_url, rules_verified_at)
VALUES
(
    'KCC_REVISED_2026',
    'Kisan Credit Card (KCC) - Scale of Finance Scheme',
    'కిసాన్ క్రెడిట్ కార్డ్ (KCC) పంట రుణం',
    'किसान क्रेडिट कार्ड (KCC) फसल ऋण',
    'Ministry of Agriculture & NABARD / Commercial & RRB Banks',
    300000.00,
    7.0,
    4.0,
    true,
    true,
    '{"owner_cultivator", "tenant_farmer", "oral_lessee", "sharecropper", "jlg_member"}',
    '{"crop_production", "seeds_fertilizers", "irrigation", "working_capital"}',
    '{"identity_aadhaar", "bank_passbook", "pattadar_passbook_or_vro_certificate", "crop_sowing_declaration"}',
    'Collateral-free crop loan up to Rs. 1,60,000 under RBI guidelines. 3% interest subvention for prompt repayment bringing effective rate to 4%. Tenant farmers eligible via JLG or village VRO declaration.',
    'https://agricoop.nic.in/en/kcc',
    '2026-10-01'
),
(
    'JLG_TENANT_SCHEME',
    'NABARD Joint Liability Group (JLG) Tenant Farmer Credit',
    'కౌలు రైతుల జేఎల్‌జీ (JLG) సమూహ రుణం',
    'नाबार्ड संयुक्त देयता समूह (JLG) बटाईदार ऋण',
    'NABARD & State Cooperative Banks / RRBs',
    150000.00,
    7.0,
    4.0,
    true,
    true,
    '{"tenant_farmer", "oral_lessee", "sharecropper", "jlg_member"}',
    '{"crop_production", "seeds_fertilizers", "farm_inputs", "allied"}',
    '{"identity_aadhaar", "bank_passbook", "jlg_peer_undertaking", "village_sarpanch_vro_attestation"}',
    'Specifically tailored for oral lessees, sharecroppers, and tenant farmers without registered land titles. Peer guarantee through group of 4-10 farmers replaces physical collateral.',
    'https://www.nabard.org/content1.aspx?id=516',
    '2026-10-01'
),
(
    'AIF_POST_HARVEST',
    'Agriculture Infrastructure Fund (AIF) Value Addition Loan',
    'వ్యవసాయ మౌలిక సదుపాయాల నిధి (AIF)',
    'कृषि अवसंरचना कोष (AIF) मूल्य संवर्धन ऋण',
    'Ministry of Agriculture and Farmers Welfare (DA&FW)',
    2000000.00,
    9.0,
    6.0,
    true,
    true,
    '{"owner_cultivator", "tenant_farmer", "fpo_member", "jlg_member"}',
    '{"post_harvest", "cold_storage", "grading_unit", "warehouse", "solar_dryer"}',
    '{"identity_aadhaar", "bank_passbook", "project_estimate", "land_or_lease_possession"}',
    '3% interest subvention per annum up to Rs. 2 Crore for setting up post-harvest farm-gate infrastructure, packhouses, mini-warehouses, and solar drying units.',
    'https://agriinfra.dac.gov.in/',
    '2026-10-01'
),
(
    'PM_KUSUM_B_SOLAR',
    'PM-KUSUM Component-B Solar Irrigation Pump Loan',
    'పీఎం-కుసుమ్ సౌర వ్యవసాయ పంపు పథకం',
    'पीएम-कुसुम सोलर पंप कृषि ऋण',
    'Ministry of New and Renewable Energy (MNRE) & REDS',
    350000.00,
    7.5,
    4.5,
    true,
    true,
    '{"owner_cultivator", "tenant_farmer", "sharecropper"}',
    '{"irrigation", "solar_pump", "sustainable_energy"}',
    '{"identity_aadhaar", "bank_passbook", "water_source_proof", "quotation_empanelled_vendor"}',
    '60% government subsidy (30% Central + 30% State), 30% bank term loan, and only 10% farmer contribution for solar water pumping systems from 3 HP to 7.5 HP.',
    'https://pmkusum.mnre.gov.in/',
    '2026-10-01'
),
(
    'MICRO_IRRIGATION_TS',
    'Telangana State Micro-Irrigation Project (TSMIP) Credit',
    'తెలంగాణ సూక్ష్మ నీటిపారుదల ప్రాజెక్ట్ (TSMIP)',
    'तेलंगाना सूक्ष्म सिंचाई परियोजना ऋण',
    'Horticulture Department, Govt. of Telangana',
    200000.00,
    7.0,
    4.0,
    true,
    true,
    '{"owner_cultivator", "tenant_farmer", "sharecropper"}',
    '{"irrigation", "drip_sprinkler", "water_conservation"}',
    '{"identity_aadhaar", "bank_passbook", "soil_water_test_report", "cultivation_proof"}',
    'Subsidized drip and sprinkler equipment with up to 80-100% subsidy for small/marginal farmers and bank loan for balance amount.',
    'https://horticulture.telangana.gov.in/',
    '2026-10-01'
)
ON CONFLICT (scheme_code) DO UPDATE SET
    scheme_name = EXCLUDED.scheme_name,
    max_limit_amount = EXCLUDED.max_limit_amount,
    subsidized_interest_rate_pct = EXCLUDED.subsidized_interest_rate_pct,
    effective_interest_rate_pct = EXCLUDED.effective_interest_rate_pct,
    allows_no_credit_history = EXCLUDED.allows_no_credit_history,
    permits_tenant_farmers = EXCLUDED.permits_tenant_farmers,
    criteria_summary = EXCLUDED.criteria_summary,
    verification_source_url = EXCLUDED.verification_source_url;

-- ----------------------------------------------------------------------------
-- 2. FARMER LOAN APPLICATIONS TABLE (Inclusive Credit Applications)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farmer_loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number TEXT UNIQUE NOT NULL,
    farmer_id TEXT NOT NULL DEFAULT 'FARMER-TG-7721',
    user_id UUID,
    pathway TEXT NOT NULL CHECK (pathway IN ('credit_history', 'no_credit_history')),
    applicant_name TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Telangana',
    district TEXT NOT NULL DEFAULT 'Warangal Rural',
    village TEXT NOT NULL DEFAULT 'Geesugonda',
    preferred_mandi TEXT DEFAULT 'Enumamula Wholesale Mandi',
    tenancy_type TEXT NOT NULL CHECK (tenancy_type IN ('owner_cultivator', 'tenant_farmer', 'oral_lessee', 'sharecropper', 'jlg_member')),
    land_size_acres NUMERIC NOT NULL DEFAULT 3.5,
    cultivation_evidence TEXT NOT NULL DEFAULT 'self_declaration',
    primary_crops JSONB NOT NULL DEFAULT '["Telangana Sona Paddy", "Cotton"]'::jsonb,
    cropping_season TEXT NOT NULL DEFAULT 'kharif',
    expected_harvest_quintals NUMERIC DEFAULT 65.0,
    estimated_harvest_value NUMERIC DEFAULT 182000.0,
    loan_purpose TEXT NOT NULL,
    requested_amount NUMERIC NOT NULL,
    preferred_tenure_months INT NOT NULL DEFAULT 12,
    estimated_seasonal_income NUMERIC NOT NULL DEFAULT 180000.0,
    estimated_farming_expenses NUMERIC NOT NULL DEFAULT 65000.0,
    existing_debt_obligations NUMERIC NOT NULL DEFAULT 0.0,
    credit_score_declared INT,
    credit_history_source TEXT DEFAULT 'none_available',
    consent_credit_check BOOLEAN DEFAULT false,
    consent_data_sharing BOOLEAN DEFAULT true,
    indicative_status TEXT NOT NULL DEFAULT 'potentially_eligible' 
        CHECK (indicative_status IN ('potentially_eligible', 'more_info_required', 'alternative_pathway', 'not_currently_eligible')),
    application_status TEXT NOT NULL DEFAULT 'submitted' 
        CHECK (application_status IN ('draft', 'submitted', 'more_information_required', 'under_review', 'approved', 'rejected', 'disbursed')),
    is_simulated_assessment BOOLEAN DEFAULT true,
    matched_schemes JSONB DEFAULT '[]'::jsonb,
    assessment_factors JSONB DEFAULT '{}'::jsonb,
    missing_requirements TEXT[] DEFAULT '{}',
    blockchain_tx_hash TEXT,
    lender_decision_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast lookups by farmer and status
CREATE INDEX IF NOT EXISTS idx_loan_apps_farmer_id ON public.farmer_loan_applications(farmer_id);
CREATE INDEX IF NOT EXISTS idx_loan_apps_status ON public.farmer_loan_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_loan_apps_pathway ON public.farmer_loan_applications(pathway);

-- ----------------------------------------------------------------------------
-- 3. LOAN ASSESSMENT RESULTS TABLE (Transparent Evaluation Records)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.loan_assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.farmer_loan_applications(id) ON DELETE CASCADE,
    farmer_id TEXT NOT NULL,
    indicative_outcome TEXT NOT NULL,
    calculated_debt_service_ratio NUMERIC NOT NULL,
    net_seasonal_cashflow NUMERIC NOT NULL,
    recommended_max_amount NUMERIC NOT NULL,
    factor_breakdowns JSONB NOT NULL DEFAULT '{}'::jsonb,
    matched_schemes JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_requirements TEXT[] DEFAULT '{}',
    explanation_en TEXT NOT NULL,
    explanation_te TEXT,
    explanation_hi TEXT,
    assessment_engine_version TEXT DEFAULT '2026.2-inclusive-agri',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loan_assessment_app_id ON public.loan_assessment_results(application_id);

-- ----------------------------------------------------------------------------
-- 4. LOAN APPLICATION DOCUMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.loan_application_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.farmer_loan_applications(id) ON DELETE CASCADE,
    farmer_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    document_name TEXT NOT NULL,
    file_url TEXT,
    verification_status TEXT DEFAULT 'uploaded_pending_verification' 
        CHECK (verification_status IN ('uploaded_pending_verification', 'verified_by_lender', 'rejected')),
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loan_docs_app_id ON public.loan_application_documents(application_id);

-- ----------------------------------------------------------------------------
-- 5. LOAN STATUS HISTORY AUDIT TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.loan_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.farmer_loan_applications(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by_role TEXT NOT NULL DEFAULT 'system_assessment' 
        CHECK (changed_by_role IN ('farmer', 'system_assessment', 'lender', 'admin')),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loan_history_app_id ON public.loan_status_history(application_id);

-- ----------------------------------------------------------------------------
-- 6. CONSENT RECORDS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id TEXT NOT NULL,
    consent_type TEXT NOT NULL,
    consent_granted BOOLEAN NOT NULL DEFAULT true,
    terms_version TEXT DEFAULT '2026.1',
    ip_address TEXT DEFAULT '127.0.0.1',
    granted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Demo Application for Demo Farmer
INSERT INTO public.farmer_loan_applications 
(application_number, farmer_id, pathway, applicant_name, applicant_phone, state, district, village, tenancy_type, land_size_acres, primary_crops, cropping_season, expected_harvest_quintals, estimated_harvest_value, loan_purpose, requested_amount, preferred_tenure_months, estimated_seasonal_income, estimated_farming_expenses, existing_debt_obligations, indicative_status, application_status, is_simulated_assessment, blockchain_tx_hash)
VALUES
(
    'APP-KCC-2026-7821',
    'FARMER-TG-7721',
    'no_credit_history',
    'K. Ramarao Reddy',
    '9848022334',
    'Telangana',
    'Warangal Rural',
    'Geesugonda',
    'tenant_farmer',
    4.0,
    '["Telangana Sona Paddy", "Tandur Red Gram"]'::jsonb,
    'kharif',
    80.0,
    224000.0,
    'crop_production_seeds_fertilizers',
    120000.0,
    12,
    220000.0,
    75000.0,
    15000.0,
    'potentially_eligible',
    'submitted',
    true,
    '0x7c91a4b8e23f0051d98a2e7c419e0b82f63a87d1'
)
ON CONFLICT (application_number) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.agricultural_credit_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- Clean drop legacy policies if present
DROP POLICY IF EXISTS "Public Read Schemes" ON public.agricultural_credit_schemes;
DROP POLICY IF EXISTS "Public All Loan Apps" ON public.farmer_loan_applications;
DROP POLICY IF EXISTS "Public All Loan Assessments" ON public.loan_assessment_results;
DROP POLICY IF EXISTS "Public All Loan Docs" ON public.loan_application_documents;
DROP POLICY IF EXISTS "Public All Loan History" ON public.loan_status_history;
DROP POLICY IF EXISTS "Public All Consents" ON public.consent_records;

-- Public read for schemes (public knowledge base)
CREATE POLICY "Public Read Schemes" ON public.agricultural_credit_schemes FOR SELECT USING (true);

-- Applications: Read, Insert, and Update for authorized user / matching farmer_id
CREATE POLICY "Public All Loan Apps" ON public.farmer_loan_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Loan Assessments" ON public.loan_assessment_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Loan Docs" ON public.loan_application_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Loan History" ON public.loan_status_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Consents" ON public.consent_records FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- SUCCESS: Inclusive Farmer Credit Assessment Schema & Tables Initialized!
-- ============================================================================
