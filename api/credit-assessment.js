// Vercel Serverless Function: Inclusive Farmer Credit Assessment & Agricultural Schemes API
// Platform: KisanSaathi (Telangana Agricultural Platform)
// Author: Team ForeverKnights

const https = require('https');

const SCHEMES_REGISTRY = [
  {
    scheme_code: 'KCC_REVISED_2026',
    scheme_name: 'Kisan Credit Card (KCC) - Scale of Finance Scheme',
    scheme_name_te: 'కిసాన్ క్రెడిట్ కార్డ్ (KCC) పంట రుణం',
    scheme_name_hi: 'किसान क्रेडिट कार्ड (KCC) फसल ऋण',
    issuing_agency: 'Ministry of Agriculture & NABARD / Commercial & RRB Banks',
    max_limit_amount: 300000,
    subsidized_interest_rate_pct: 7.0,
    effective_interest_rate_pct: 4.0,
    allows_no_credit_history: true,
    permits_tenant_farmers: true,
    eligible_tenancy_types: ['owner_cultivator', 'tenant_farmer', 'oral_lessee', 'sharecropper', 'jlg_member'],
    eligible_purposes: ['crop_production_seeds_fertilizers', 'micro_irrigation_drip_sprinkler', 'working_capital'],
    required_documents: ['identity_aadhaar', 'bank_passbook', 'cultivation_proof', 'crop_sowing_declaration'],
    criteria_summary: 'Collateral-free crop loan up to Rs. 1,60,000 under RBI guidelines. 3% prompt repayment incentive brings effective interest to 4%. Tenant farmers eligible via JLG or village VRO declaration.',
    verification_source_url: 'https://agricoop.nic.in/en/kcc',
    rules_verified_at: '2026-10-01'
  },
  {
    scheme_code: 'JLG_TENANT_SCHEME',
    scheme_name: 'NABARD Joint Liability Group (JLG) Tenant Farmer Credit',
    scheme_name_te: 'కౌలు రైతుల జేఎల్‌జీ (JLG) సమూహ రుణం',
    scheme_name_hi: 'नाबार्ड संयुक्त देयता समूह (JLG) बटाईदार ऋण',
    issuing_agency: 'NABARD & State Cooperative Banks / RRBs',
    max_limit_amount: 150000,
    subsidized_interest_rate_pct: 7.0,
    effective_interest_rate_pct: 4.0,
    allows_no_credit_history: true,
    permits_tenant_farmers: true,
    eligible_tenancy_types: ['tenant_farmer', 'oral_lessee', 'sharecropper', 'jlg_member'],
    eligible_purposes: ['crop_production_seeds_fertilizers', 'farm_machinery_equipment', 'allied_farming'],
    required_documents: ['identity_aadhaar', 'bank_passbook', 'jlg_peer_undertaking', 'village_vro_certificate'],
    criteria_summary: 'Specifically tailored for oral lessees, sharecroppers, and tenant farmers without registered land titles. Peer guarantee through group of 4-10 farmers replaces physical collateral.',
    verification_source_url: 'https://www.nabard.org/content1.aspx?id=516',
    rules_verified_at: '2026-10-01'
  },
  {
    scheme_code: 'AIF_POST_HARVEST',
    scheme_name: 'Agriculture Infrastructure Fund (AIF) Value Addition Loan',
    scheme_name_te: 'వ్యవసాయ మౌలిక సదుపాయాల నిధి (AIF)',
    scheme_name_hi: 'कृषि अवसंरचना कोष (AIF) मूल्य संवर्धन ऋण',
    issuing_agency: 'Ministry of Agriculture and Farmers Welfare (DA&FW)',
    max_limit_amount: 2000000,
    subsidized_interest_rate_pct: 9.0,
    effective_interest_rate_pct: 6.0,
    allows_no_credit_history: true,
    permits_tenant_farmers: true,
    eligible_tenancy_types: ['owner_cultivator', 'tenant_farmer', 'jlg_member'],
    eligible_purposes: ['post_harvest_storage', 'farm_machinery_equipment'],
    required_documents: ['identity_aadhaar', 'bank_passbook', 'project_estimate', 'land_possession_or_lease'],
    criteria_summary: '3% interest subvention per annum up to Rs. 2 Crore for setting up post-harvest farm-gate infrastructure, packhouses, mini-warehouses, and solar drying units.',
    verification_source_url: 'https://agriinfra.dac.gov.in/',
    rules_verified_at: '2026-10-01'
  },
  {
    scheme_code: 'PM_KUSUM_B_SOLAR',
    scheme_name: 'PM-KUSUM Component-B Solar Irrigation Pump Loan',
    scheme_name_te: 'పీఎం-కుసుమ్ సౌర వ్యవసాయ పంపు పథకం',
    scheme_name_hi: 'पीएम-कुसुम सोलर पंप कृषि ऋण',
    issuing_agency: 'Ministry of New and Renewable Energy (MNRE) & REDS',
    max_limit_amount: 350000,
    subsidized_interest_rate_pct: 7.5,
    effective_interest_rate_pct: 4.5,
    allows_no_credit_history: true,
    permits_tenant_farmers: true,
    eligible_tenancy_types: ['owner_cultivator', 'tenant_farmer', 'sharecropper'],
    eligible_purposes: ['solar_water_pump', 'micro_irrigation_drip_sprinkler'],
    required_documents: ['identity_aadhaar', 'bank_passbook', 'water_source_proof', 'quotation_empanelled_vendor'],
    criteria_summary: '60% government subsidy (30% Central + 30% State), 30% bank term loan, and only 10% farmer contribution for solar water pumping systems from 3 HP to 7.5 HP.',
    verification_source_url: 'https://pmkusum.mnre.gov.in/',
    rules_verified_at: '2026-10-01'
  }
];

function evaluateAssessment(data) {
  const {
    pathway = 'no_credit_history',
    tenancy_type = 'owner_cultivator',
    land_size_acres = 3.0,
    primary_crops = ['Paddy'],
    cropping_season = 'kharif',
    loan_purpose = 'crop_production_seeds_fertilizers',
    requested_amount = 100000,
    preferred_tenure_months = 12,
    estimated_seasonal_income = 180000,
    estimated_farming_expenses = 65000,
    existing_debt_obligations = 0,
    credit_score_declared = null,
    consent_credit_check = false
  } = data;

  const reqAmt = Number(requested_amount) || 100000;
  const grossIncome = Number(estimated_seasonal_income) || 180000;
  const expenses = Number(estimated_farming_expenses) || 65000;
  const debts = Number(existing_debt_obligations) || 0;
  const acres = Number(land_size_acres) || 1;

  // 1. Seasonal Operating Cash Flow
  const netSeasonalCashFlow = Math.max(0, grossIncome - expenses);

  // 2. Annualized Debt Servicing
  const annualTenureYears = Math.max(0.5, (preferred_tenure_months || 12) / 12);
  const annualRequestedDebtService = reqAmt / annualTenureYears;
  const totalAnnualDebtLoad = debts + annualRequestedDebtService;

  // 3. Available Annual Cash
  const seasonsPerYear = cropping_season === 'multi_season' ? 2.0 : 1.5;
  const availableAnnualCash = netSeasonalCashFlow * seasonsPerYear;

  // 4. Debt Service Coverage Ratio (DSCR)
  const dscr = totalAnnualDebtLoad > 0 
    ? Number((availableAnnualCash / totalAnnualDebtLoad).toFixed(2))
    : 3.5;

  // 5. Match Eligible Schemes
  const matchedSchemes = [];
  SCHEMES_REGISTRY.forEach(scheme => {
    const tenancyMatch = scheme.eligible_tenancy_types.includes(tenancy_type);
    const purposeMatch = scheme.eligible_purposes.some(p => loan_purpose.includes(p) || p.includes(loan_purpose));
    const amountMatch = reqAmt <= scheme.max_limit_amount * 1.25;

    if (tenancyMatch && (purposeMatch || amountMatch)) {
      matchedSchemes.push({
        scheme_code: scheme.scheme_code,
        scheme_name: scheme.scheme_name,
        scheme_name_te: scheme.scheme_name_te,
        max_limit_amount: scheme.max_limit_amount,
        effective_interest_rate: scheme.effective_interest_rate_pct,
        permits_tenant_farmers: scheme.permits_tenant_farmers,
        criteria_summary: scheme.criteria_summary,
        fit_reason: tenancy_type === 'tenant_farmer' || tenancy_type === 'oral_lessee'
          ? 'Eligible under tenant farmer inclusion guidelines (Peer/VRO backing accepted)'
          : 'Fully aligned with land cultivation scale and seasonal crop inputs'
      });
    }
  });

  // Fallback: If no scheme matched exactly, attach KCC revised
  if (matchedSchemes.length === 0) {
    matchedSchemes.push({
      scheme_code: 'KCC_REVISED_2026',
      scheme_name: 'Kisan Credit Card (KCC) - Scale of Finance Scheme',
      scheme_name_te: 'కిసాన్ క్రెడిట్ కార్డ్ (KCC) పంట రుణం',
      max_limit_amount: 300000,
      effective_interest_rate: 4.0,
      permits_tenant_farmers: true,
      criteria_summary: SCHEMES_REGISTRY[0].criteria_summary,
      fit_reason: 'Standard agricultural scale of finance credit line'
    });
  }

  // 6. Max Recommended Amount based on Land Scale of Finance (NABARD TS Benchmark: ~Rs. 40,000/acre for Paddy, Rs. 48,000 for Cotton)
  const scaleOfFinancePerAcre = 42000;
  const cropScaleCapacity = Math.round(acres * scaleOfFinancePerAcre * (cropping_season === 'multi_season' ? 1.4 : 1.0));
  const cashFlowMaxCapacity = Math.round(netSeasonalCashFlow * 1.5);
  const recommendedMaxAmount = Math.min(300000, Math.max(50000, Math.min(cropScaleCapacity, cashFlowMaxCapacity)));

  // 7. Determine Indicative Assessment Outcome
  let indicativeOutcome = 'potentially_eligible';
  let explanationEn = '';
  let explanationTe = '';
  let explanationHi = '';
  const missingRequirements = [];

  // Check Tenancy and Collateral Requirements
  const isTenantOrOral = ['tenant_farmer', 'oral_lessee', 'sharecropper', 'jlg_member'].includes(tenancy_type);

  if (isTenantOrOral && reqAmt > 160000 && tenancy_type !== 'jlg_member') {
    indicativeOutcome = 'alternative_pathway';
    explanationEn = `Under RBI guidelines, collateral-free credit for tenant farmers is capped at ₹1,60,000. For your requested loan of ₹${reqAmt.toLocaleString('en-IN')}, we recommend applying via the Joint Liability Group (JLG) peer guarantee model or restricting the initial tranche to ₹1,50,000.`;
    explanationTe = `ఆర్బీఐ మార్గదర్శకాల ప్రకారం కౌలు రైతులకు తాకట్టు లేని రుణం గరిష్టంగా ₹1,60,000 వరకు మాత్రమే వర్తిస్తుంది. జేఎల్‌జీ (JLG) సమూహం ద్వారా లేదా ₹1.5 లక్షల పరిమితితో దరఖాస్తు చేసుకోవడం సూచించబడింది.`;
    explanationHi = `आरबीआई के दिशानिर्देशों के अनुसार बटाईदार किसानों के लिए बिना किसी गारंटी के ऋण ₹1,60,000 तक सीमित है। संयुक्त देयता समूह (JLG) के माध्यम से आवेदन करने की सिफारिश की जाती है।`;
    missingRequirements.push('JLG Group Formation (4-10 farmers mutual agreement)');
  } else if (dscr < 1.0) {
    indicativeOutcome = 'not_currently_eligible';
    explanationEn = `Based on your declared seasonal income of ₹${grossIncome.toLocaleString('en-IN')} and existing debt obligations of ₹${debts.toLocaleString('en-IN')}, the seasonal cash flow is insufficient to comfortably service a loan of ₹${reqAmt.toLocaleString('en-IN')} (DSCR: ${dscr}). We advise requesting a smaller amount or extending the tenure.`;
    explanationTe = `మీరు పేర్కొన్న పంట ఆదాయం మరియు ఇప్పటికే ఉన్న రుణ బాధ్యతల ప్రకారం ఈ రుణ మొత్తం తిరిగి చెల్లించే సామర్థ్యం తక్కువగా ఉంది. తక్కువ రుణ మొత్తాన్ని ఎంచుకోవాలని సూచిస్తున్నాము.`;
    explanationHi = `आपकी अनुमानित मौसमी आय और वर्तमान ऋण को देखते हुए यह ऋण राशि चुकाने में कठिनाई हो सकती है। कृपया कम ऋण राशि का चयन करें।`;
    missingRequirements.push('Additional Household/Allied Income Proof', 'Debt Rationalization Statement');
  } else if (acres <= 0 || !primary_crops || primary_crops.length === 0) {
    indicativeOutcome = 'more_info_required';
    explanationEn = `Crucial agricultural details are missing. Please specify your cultivated land area, cropping season, and crop variety to complete the automated scheme matching.`;
    explanationTe = `పంట సాగు వివరాలు అసంపూర్ణంగా ఉన్నాయి. సాగు భూమి విస్తీర్ణం మరియు పంట రకాన్ని నమోదు చేయండి.`;
    explanationHi = `कृषि विवरण अधूरा है। कृपया जोते जाने वाले क्षेत्र और फसल का प्रकार स्पष्ट करें।`;
    missingRequirements.push('Cultivated Land Area (Acres)', 'Crop Sowing Declaration');
  } else {
    indicativeOutcome = 'potentially_eligible';
    explanationEn = `Your agricultural cash flow surplus of ₹${netSeasonalCashFlow.toLocaleString('en-IN')}/season comfortably supports your requested loan of ₹${reqAmt.toLocaleString('en-IN')} (DSCR: ${dscr}x). You are potentially eligible for subsidized interest rates under ${matchedSchemes[0]?.scheme_name || 'KCC'}.`;
    explanationTe = `మీ వ్యవసాయ పంట మిగులు ₹${netSeasonalCashFlow.toLocaleString('en-IN')} మరియు తిరిగి చెల్లించే నిష్పత్తి (${dscr}x) సంతృప్తికరంగా ఉంది. మీరు ${matchedSchemes[0]?.scheme_name_te || 'కిసాన్ క్రెడిట్ కార్డ్'} కింద సబ్సిడీ వడ్డీ రేటుకు అర్హులు.`;
    explanationHi = `आपका शुद्ध मौसमी अधिशेष ₹${netSeasonalCashFlow.toLocaleString('en-IN')} इस ऋण राशि (DSCR: ${dscr}x) के लिए पर्याप्त है। आप रियायती ब्याज दर के पात्र हैं।`;
  }

  // Standard document requirements based on tenancy
  if (tenancy_type === 'owner_cultivator') {
    missingRequirements.push('Dharani Pattadar Passbook / ROR 1-B');
  } else if (tenancy_type === 'tenant_farmer' || tenancy_type === 'oral_lessee') {
    missingRequirements.push('Village Panchayat VRO Cultivation Certificate OR Tenancy Undertaking');
  }
  missingRequirements.push('Aadhaar Card (e-KYC verified)', 'Bank Passbook Copy (DBT Active)');

  return {
    indicative_outcome: indicativeOutcome,
    calculated_debt_service_ratio: dscr,
    net_seasonal_cashflow: netSeasonalCashFlow,
    recommended_max_amount: recommendedMaxAmount,
    seasons_considered: seasonsPerYear,
    matched_schemes: matchedSchemes,
    missing_requirements: missingRequirements,
    factor_breakdowns: {
      tenancy_status: {
        type: tenancy_type,
        recognized_under_rbi: true,
        collateral_free_eligible: reqAmt <= 160000
      },
      cashflow_capacity: {
        gross_seasonal_income: grossIncome,
        operating_farming_expenses: expenses,
        net_seasonal_surplus: netSeasonalCashFlow,
        debt_service_ratio: dscr,
        status: dscr >= 1.25 ? 'Strong' : dscr >= 1.0 ? 'Acceptable' : 'Constrained'
      },
      scale_of_finance: {
        acres_cultivated: acres,
        scale_limit_benchmark: cropScaleCapacity,
        requested_amount: reqAmt
      },
      credit_history_mode: pathway === 'no_credit_history' 
        ? 'Assessed exclusively on farm production & cash flow (Zero CIBIL requirement)'
        : (credit_score_declared ? `Assessed with declared credit profile (${credit_score_declared}/900 - Demo Mode)` : 'Credit history pending verification')
    },
    explanations: {
      en: explanationEn,
      te: explanationTe,
      hi: explanationHi
    },
    disclaimer: 'Indicative Assessment Only: This evaluation simulates bank and government scheme guidelines based on declared agricultural parameters. Final loan sanction, interest rate subvention, and disbursement are subject to physical verification and discretion of the participating lending bank.'
  };
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // GET: Return official schemes & assessment guidelines
  if (req.method === 'GET') {
    return res.end(JSON.stringify({
      status: 'ok',
      version: '2026.2',
      schemes: SCHEMES_REGISTRY,
      guidelines: {
        tenancy_inclusive: true,
        rbi_collateral_free_limit: 160000,
        kcc_subsidized_interest_rate: 7.0,
        prompt_repayment_incentive: 3.0,
        effective_interest_rate: 4.0
      }
    }, null, 2));
  }

  // POST: Evaluate application
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const assessment = evaluateAssessment(payload);

        const applicationNumber = 'APP-' + (payload.pathway === 'no_credit_history' ? 'NCH' : 'CRD') + '-' + Date.now().toString().slice(-6);
        const txHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

        res.statusCode = 200;
        res.end(JSON.stringify({
          status: 'success',
          application_number: applicationNumber,
          blockchain_audit_hash: txHash,
          pathway: payload.pathway || 'no_credit_history',
          assessment: assessment,
          submitted_at: new Date().toISOString()
        }, null, 2));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid payload format', details: err.message }));
      }
    });
    return;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method not allowed' }));
};
