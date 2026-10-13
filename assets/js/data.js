// KisanSaathi Application Data & Content Store
// Telangana Agricultural Platform - Team ForeverKnights

const KISAN_DATA = {
  // Farmer Profile (Telangana)
  farmer: {
    id: "FARMER-TG-7721",
    name: "K. Ramarao Reddy",
    name_hi: "के. रामाराव रेड्डी",
    phone: "9848022334",
    email: "ramarao.reddy@kisansaathi.telangana.gov.in",
    district: "Warangal",
    district_hi: "वारंगल",
    address: "Village Geesugonda, Warangal Rural",
    address_hi: "ग्राम गीसुगोंडा, वारंगल ग्रामीण",
    state: "Telangana",
    state_hi: "तेलंगाना",
    creditScore: 785,
    eligibleLoan: 300000,
    rating: 4.8,
    activeOrders: 3,
    totalCropsListed: 4,
    totalEarnings: 74200
  },

  // Farmer Inventory (Sona Masoori, Telangana Sona, Warangal Chilli, Arhar)
  inventory: [
    {
      id: "INV-101",
      title: "Telangana Sona Rice (RNR 15048 / तेलंगाना सोना)",
      title_hi: "तेलंगाना सोना धान (RNR 15048)",
      category: "grain",
      quality: "Elite",
      quantity: 1400,
      price: 52,
      description: "Super fine low-glycemic index (GI: 51) paddy developed by PJTSAU Hyderabad. Premium table rice with high export value.",
      description_hi: "PJTSAU हैदराबाद द्वारा विकसित लो-ग्लाइसेमिक (शुगर फ्री) धान। उच्च गुणवत्ता वाले बारीक दाने।",
      image: "assets/raw/paddy.png",
      dateAdded: "2026-10-02",
      reviews: [
        { name: "Hyderabad Organic Mart (Bowenpally)", rating: 5.0, date: "05 Oct 2026", comment: "Elite low-GI grain quality. Customers love Telangana Sona." },
        { name: "Secunderabad Grain Wholesale", rating: 4.8, date: "28 Sep 2026", comment: "Excellent moisture level below 11%. Prompt delivery." }
      ]
    },
    {
      id: "INV-102",
      title: "Sona Masoori Paddy (BPT 5204 / सोना मसूरी)",
      title_hi: "सोना मसूरी धान (BPT 5204)",
      category: "grain",
      quality: "Premium",
      quantity: 1100,
      price: 46,
      description: "Traditional aromatic Warangal Sona Masoori grain. Well-matured, pest-free harvest with excellent elongation.",
      description_hi: "वारंगल का पारंपरिक सुगंधित सोना मसूरी धान। पूर्ण परिपक्व, कीटमुक्त एवं चमकदार दाने।",
      image: "assets/raw/paddy.png",
      dateAdded: "2026-10-04",
      reviews: [
        { name: "Enumamula APMC Trader", rating: 4.7, date: "06 Oct 2026", comment: "Clean and uniform paddy. Good milling outturn." }
      ]
    },
    {
      id: "INV-103",
      title: "Red Gram / Arhar Dal (उन्नत अरहर दाल - तंदूर वैरायटी)",
      title_hi: "अरहर दाल (तंदूर लाल चना)",
      category: "grain",
      quality: "Premium",
      quantity: 480,
      price: 115,
      description: "GI-tagged Tandur Red Gram from Telangana black cotton soils. Rich in protein (24%), bold grains with delicious aroma.",
      description_hi: "तेलंगाना की प्रसिद्ध जीआई-टैग तंदूर लाल अरहर दाल। उच्च प्रोटीन और लाजवाब स्वाद।",
      image: "assets/raw/arhar.png",
      dateAdded: "2026-10-06",
      reviews: [
        { name: "Medchal Food Distributors", rating: 4.9, date: "08 Oct 2026", comment: "Authentic Tandur dal taste, premium unpolished quality." }
      ]
    },
    {
      id: "INV-104",
      title: "Telangana Organic Guava (सफेदा अमरूद)",
      title_hi: "अमरूद (सफेदा अमृत)",
      category: "fruit",
      quality: "Classic",
      quantity: 650,
      price: 42,
      description: "Crispy and sweet organic white flesh guavas from Medchal-Malkajgiri fruit orchards. Vitamin-C rich.",
      description_hi: "मेदचल-मलकाजगिरि के बागानों का ताजा, मीठा एवं विटामिन-सी से भरपूर सफेदा अमरूद।",
      image: "assets/raw/horticulture_main.jpg",
      dateAdded: "2026-10-07",
      reviews: [
        { name: "Malakpet Fruit Mandi, Hyderabad", rating: 4.5, date: "08 Oct 2026", comment: "Fresh delivery with minimal bruising." }
      ]
    }
  ],

  // Buyer Negotiations in Telangana Mandis
  negotiations: [
    {
      id: "NEGO-501",
      buyer: {
        name: "Enumamula Agro Trading, Warangal",
        phone: "+91 98480 33412",
        location: "Enumamula Market Yard, Warangal"
      },
      itemTitle: "Telangana Sona Rice (RNR 15048)",
      actualPrice: 52,
      proposedPrice: 49,
      quantity: 800,
      image: "assets/raw/paddy.png",
      status: "pending",
      note: "Ready to pick up 800 Kg bulk stock from Geesugonda farm gate if you agree to ₹49/Kg with immediate RTGS."
    },
    {
      id: "NEGO-502",
      buyer: {
        name: "Hyderabad Mega Rice Mills Ltd",
        phone: "+91 94401 88920",
        location: "Bowenpally Wholesale Yard, Secunderabad"
      },
      itemTitle: "Sona Masoori Paddy (BPT 5204)",
      actualPrice: 46,
      proposedPrice: 44,
      quantity: 500,
      image: "assets/raw/paddy.png",
      status: "accepted",
      note: "Agreed at ₹44/Kg. Transport scheduled via Truck Suvidha Telangana."
    },
    {
      id: "NEGO-503",
      buyer: {
        name: "Nizamabad Pulse Processing Hub",
        phone: "+91 97011 44550",
        location: "Shradhanand Gunj, Nizamabad"
      },
      itemTitle: "Tandur Red Gram / Arhar Dal",
      actualPrice: 115,
      proposedPrice: 110,
      quantity: 300,
      image: "assets/raw/arhar.png",
      status: "pending",
      note: "Prompt UPI payment upon warehouse drop-off at Nizamabad godown."
    }
  ],

  // Orders in Telangana
  orders: [
    {
      id: "ORD-77101",
      receiptNumber: "KS-TG-2026-77101",
      date: "08-Oct-2026",
      amount: 22000,
      completed: true,
      status: "Delivered",
      buyer: {
        first_name: "Sri Srinivasa Agro Corp",
        phone: "9848011223",
        address: "Shop 24, Bowenpally Agriculture Market, Secunderabad / Hyderabad"
      },
      items: [
        { name: "Sona Masoori Paddy (BPT 5204)", quantity: 500, pricePerKg: 44, total: 22000 }
      ],
      route: {
        origin: "Geesugonda, Warangal (17.9689, 79.5941)",
        destination: "Bowenpally Mandi, Secunderabad (17.4721, 78.4878)",
        distanceKm: 146,
        logisticsPartner: "Rivigo Telangana Relay Express"
      }
    },
    {
      id: "ORD-77102",
      receiptNumber: "KS-TG-2026-77102",
      date: "09-Oct-2026",
      amount: 28600,
      completed: false,
      status: "In Transit",
      buyer: {
        first_name: "K. Venkateshwarlu Traders",
        phone: "9989055443",
        address: "Kandlakoi Modern Market Yard, Medchal District, Telangana"
      },
      items: [
        { name: "Telangana Sona Rice (RNR 15048)", quantity: 550, pricePerKg: 52, total: 28600 }
      ],
      route: {
        origin: "Geesugonda, Warangal (17.9689, 79.5941)",
        destination: "Kandlakoi Market Yard, Medchal (17.5849, 78.4725)",
        distanceKm: 154,
        logisticsPartner: "Truck Suvidha Telangana"
      }
    },
    {
      id: "ORD-77103",
      receiptNumber: "KS-TG-2026-77103",
      date: "09-Oct-2026",
      amount: 23600,
      completed: false,
      status: "Ordered",
      buyer: {
        first_name: "Nizamabad Food Processors",
        phone: "9440566778",
        address: "Shradhanand Gunj Mandi, Nizamabad, Telangana"
      },
      items: [
        { name: "Tandur Red Gram / Arhar Dal", quantity: 180, pricePerKg: 115, total: 20700 },
        { name: "Telangana Organic Guava", quantity: 69, pricePerKg: 42, total: 2900 }
      ],
      route: {
        origin: "Geesugonda, Warangal (17.9689, 79.5941)",
        destination: "Shradhanand Gunj, Nizamabad (18.6725, 78.0941)",
        distanceKm: 218,
        logisticsPartner: "Transin Telangana Logistics"
      }
    }
  ],

  // Payment Tracking System (Consumer Payments Received)
  wallet: {
    balance: 104200,
    transactions: [
      { 
        id: "PAY-9901", 
        buyer: "Bowenpally Bulk Millers", 
        amount: 27500, 
        type: "credit", 
        time: "Today, 02:45 PM", 
        cropName: "Telangana Sona Paddy (1,000 Kg)",
        deliveryLocation: "Bowenpally Modern Market Yard, Secunderabad",
        status: "Payment Received (DBT Credited)",
        desc: "Counter offer accepted & produce dispatched" 
      },
      { 
        id: "PAY-9902", 
        buyer: "Hyderabad Organic Wholesale Mart", 
        amount: 35000, 
        type: "credit", 
        time: "10-Oct-2026 16:40", 
        cropName: "Organic Bhendi & Chillies (650 Kg)",
        deliveryLocation: "Gudimalkapur Wholesale Mandi, Hyderabad",
        status: "Payment Received (DBT Credited)",
        desc: "Direct bulk procurement payment received" 
      },
      { 
        id: "PAY-9903", 
        buyer: "Sri Srinivasa Agro Corp", 
        amount: 22000, 
        type: "credit", 
        time: "08-Oct-2026 14:22", 
        cropName: "Tandur Red Gram (400 Kg)",
        deliveryLocation: "Enumamula Agriculture Market, Warangal",
        status: "Payment Received (DBT Credited)",
        desc: "Escrow deal settled upon terminal arrival" 
      },
      { 
        id: "PAY-9904", 
        buyer: "Kandlakoi Agro Processing Terminal", 
        amount: 19700, 
        type: "credit", 
        time: "03-Oct-2026 11:30", 
        cropName: "Premium Cotton (250 Kg)",
        deliveryLocation: "Kandlakoi Agro Terminal, Medchal",
        status: "Payment Received (DBT Credited)",
        desc: "Automated biometric Mandi DBT credit" 
      }
    ]
  },

  // Blockchain Loan Ledger
  blockchainLedger: [
    {
      blockNumber: 0,
      isGenesis: true,
      hash: "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
      timestamp: "2026-01-01 00:00:00",
      data: "Genesis Block - KisanSaathi Telangana Agricultural Credit Registry"
    },
    {
      blockNumber: 1,
      id: "BLK-882101-PMFBY",
      hash: "00007a8b9f123c5d6e7f8019a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1",
      provider: "PM Fasal Bima Yojana (PMFBY Telangana)",
      amount: 150000,
      timestamp: "2026-08-15 11:20:14",
      status: "Approved and Disbursed",
      creditScore: 785,
      interestRate: "4.0% Subsidized",
      purpose: "Kharif Paddy Crop Protection"
    },
    {
      blockNumber: 2,
      id: "BLK-882102-NABARD",
      hash: "00003c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      provider: "NABARD Telangana State Cooperative Bank (TSCAB)",
      amount: 100000,
      timestamp: "2026-09-02 16:45:30",
      status: "Approved and Received",
      creditScore: 790,
      interestRate: "6.5% P.A.",
      purpose: "Drip Irrigation & Soil Enrichment Infrastructure"
    },
    {
      blockNumber: 3,
      id: "BLK-882103-SBI",
      hash: "00008e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d",
      provider: "State Bank of India (SBI Kisan Credit Card - Warangal)",
      amount: 50000,
      timestamp: "2026-09-29 09:15:00",
      status: "Loan to be repaid",
      creditScore: 785,
      interestRate: "7.0% Subsidized (3% subvention)",
      purpose: "Certified Bio-Fertilizer & Seed Procurement"
    }
  ],

  // Inclusive Agricultural Credit Schemes Registry
  agriculturalCreditSchemes: [
    {
      scheme_code: 'KCC_REVISED_2026',
      scheme_name: 'Kisan Credit Card (KCC) - Scale of Finance',
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
      scheme_name: 'NABARD Joint Liability Group (JLG) Tenant Credit',
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
      scheme_name: 'Agriculture Infrastructure Fund (AIF) Value Addition',
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
  ],

  // Seed Farmer Loan Applications
  farmerLoanApplications: [
    {
      id: "APP-KCC-2026-7821",
      application_number: "APP-KCC-2026-7821",
      farmer_id: "FARMER-TG-7721",
      pathway: "no_credit_history",
      applicant_name: "K. Ramarao Reddy",
      applicant_phone: "9848022334",
      state: "Telangana",
      district: "Warangal Rural",
      village: "Geesugonda",
      preferred_mandi: "Enumamula Wholesale Mandi",
      tenancy_type: "tenant_farmer",
      land_size_acres: 4.0,
      cultivation_evidence: "village_vro_certificate",
      primary_crops: ["Telangana Sona Paddy", "Tandur Red Gram"],
      cropping_season: "kharif",
      expected_harvest_quintals: 80,
      estimated_harvest_value: 224000,
      loan_purpose: "crop_production_seeds_fertilizers",
      requested_amount: 120000,
      preferred_tenure_months: 12,
      estimated_seasonal_income: 220000,
      estimated_farming_expenses: 75000,
      existing_debt_obligations: 15000,
      indicative_status: "potentially_eligible",
      application_status: "submitted",
      is_simulated_assessment: true,
      matched_schemes: [
        {
          scheme_code: "KCC_REVISED_2026",
          scheme_name: "Kisan Credit Card (KCC) - Scale of Finance",
          effective_interest_rate: 4.0,
          max_limit_amount: 300000
        },
        {
          scheme_code: "JLG_TENANT_SCHEME",
          scheme_name: "NABARD Joint Liability Group (JLG) Tenant Credit",
          effective_interest_rate: 4.0,
          max_limit_amount: 150000
        }
      ],
      factor_breakdowns: {
        tenancy_status: { type: "tenant_farmer", recognized_under_rbi: true, collateral_free_eligible: true },
        cashflow_capacity: { gross_seasonal_income: 220000, operating_farming_expenses: 75000, net_seasonal_surplus: 145000, debt_service_ratio: 2.18, status: "Strong" },
        scale_of_finance: { acres_cultivated: 4.0, scale_limit_benchmark: 168000, requested_amount: 120000 },
        credit_history_mode: "Assessed exclusively on farm production & cash flow (Zero CIBIL requirement)"
      },
      missing_requirements: [
        "Village Panchayat VRO Cultivation Certificate OR Tenancy Undertaking",
        "Aadhaar Card (e-KYC verified)",
        "Bank Passbook Copy (DBT Active)"
      ],
      blockchain_tx_hash: "0x7c91a4b8e23f0051d98a2e7c419e0b82f63a87d1",
      created_at: "Today, 10:30 AM"
    }
  ],

  // Real Soil Testing Labs across Telangana Districts
  soilLabs: [
    // Hyderabad
    { id: "TL-HYD-01", state: "TELANGANA", district: "HYDERABAD", name: "Soil Health Unit, ARI Campus, PJTSAU, Rajendranagar, Hyderabad", contact: "040-24015011", address: "Prof. Jayashankar Telangana State Agricultural University, Rajendranagar - 500030" },
    { id: "TL-HYD-02", state: "TELANGANA", district: "HYDERABAD", name: "ICAR-CRIDA Central Research Institute for Dryland Agriculture, Santoshnagar, Hyderabad", contact: "040-24530161", address: "Santoshnagar, Hyderabad - 500059" },
    { id: "TL-HYD-03", state: "TELANGANA", district: "HYDERABAD", name: "State Agriculture Chemistry & Soil Testing Laboratory, Malakpet", contact: "040-24552100", address: "Agriculture Complex, Malakpet, Hyderabad - 500036" },

    // Secunderabad
    { id: "TL-SEC-01", state: "TELANGANA", district: "SECUNDERABAD", name: "Bowenpally AMC Soil Testing Laboratory, Secunderabad", contact: "040-27751234", address: "Bowenpally Agricultural Market Yard, Secunderabad - 500011" },
    { id: "TL-SEC-02", state: "TELANGANA", district: "SECUNDERABAD", name: "Cantonment Agriculture Extension & Soil Testing Unit", contact: "040-27801122", address: "Bolarum Road, Secunderabad - 500010" },

    // Warangal
    { id: "TL-WGL-01", state: "TELANGANA", district: "WARANGAL", name: "Regional Agricultural Research Station (RARS) Zonal Referral Soil Testing Lab", contact: "0870-2442224", address: "Mulugu Road, Hanamkonda / Warangal - 506007" },
    { id: "TL-WGL-02", state: "TELANGANA", district: "WARANGAL", name: "District Soil Testing Laboratory, FTC Campus, Paidipally", contact: "0870-2441180", address: "Mulugu Road, Paidipally, Warangal - 506015" },
    { id: "TL-WGL-03", state: "TELANGANA", district: "WARANGAL", name: "Enumamula Agricultural Market Committee (AMC) Soil Testing Cell", contact: "0870-2577890", address: "Enumamula Grain Market Yard, Warangal - 506005" },

    // Medchal-Malkajgiri
    { id: "TL-MED-01", state: "TELANGANA", district: "MEDCHAL", name: "Soil Testing Laboratory, Agriculture Market Committee (AMC), Kandlakoi", contact: "08418-220140", address: "NH-44, Kandlakoi, Medchal District - 501401" },
    { id: "TL-MED-02", state: "TELANGANA", district: "MEDCHAL", name: "District Soil Analysis & Water Testing Unit, Keesara", contact: "08418-245120", address: "Collectorate Complex, Keesara, Medchal-Malkajgiri - 501301" },

    // Nizamabad
    { id: "TL-NZB-01", state: "TELANGANA", district: "NIZAMABAD", name: "District Soil Testing Laboratory, Shradhanand Gunj, Nizamabad", contact: "08462-224150", address: "Shradhanand Gunj Market Yard, Nizamabad - 503001" },
    { id: "TL-NZB-02", state: "TELANGANA", district: "NIZAMABAD", name: "Agriculture Market Committee (AMC) Soil Testing Lab, Bodhan", contact: "08467-222340", address: "Main Road, Bodhan, Nizamabad District - 503185" },
    { id: "TL-NZB-03", state: "TELANGANA", district: "NIZAMABAD", name: "Regional Soil Health & Turmeric Quality Testing Center, Armoor", contact: "08463-221080", address: "Armoor Market Complex, Nizamabad - 503224" },

    // Rangareddy & Others
    { id: "TL-RNG-01", state: "TELANGANA", district: "RANGAREDDY", name: "Ranga Reddy District Soil Testing Laboratory, ARI Campus", contact: "040-24015240", address: "Rajendranagar, Ranga Reddy District - 500030" },
    { id: "TL-KHM-01", state: "TELANGANA", district: "KHAMMAM", name: "District Soil Testing Laboratory, Wyra Road, Khammam", contact: "08742-223450", address: "Near AMC Yard, Khammam - 507001" },
    { id: "TL-KRN-01", state: "TELANGANA", district: "KARIMNAGAR", name: "District Soil Testing Laboratory, Jagtial Road, Karimnagar", contact: "0878-2245110", address: "Agriculture Complex, Collectorate, Karimnagar - 505001" }
  ],

  // Godowns and Warehouses in Telangana
  godowns: [
    { city: "Enumamula (Asia's Largest Mandi)", district: "WARANGAL", manager: "Shri K. Chandrasekhar Rao", phone: "9848021145", capacity: 45000, available: 12500 },
    { city: "Bowenpally Modern Market Yard", district: "SECUNDERABAD", manager: "Shri M. Venkataramana", phone: "9440188234", capacity: 28000, available: 6200 },
    { city: "Kandlakoi Central Storage", district: "MEDCHAL", manager: "Shri T. Srinivas Goud", phone: "9849156789", capacity: 22000, available: 7400 },
    { city: "Shradhanand Gunj Warehouses", district: "NIZAMABAD", manager: "Shri P. Rajeshwar Reddy", phone: "9440523120", capacity: 35000, available: 9800 },
    { city: "Malakpet State Cold Storage", district: "HYDERABAD", manager: "Shri B. Sanjeeva Rao", phone: "9848977112", capacity: 18000, available: 4100 },
    { city: "Bodhan Sugar & Grain Godown", district: "NIZAMABAD", manager: "Shri D. Gangadhar", phone: "9440933410", capacity: 16000, available: 5200 },
    { city: "Geesugonda Rural Storage Hub", district: "WARANGAL", manager: "Shri V. Prabhakar", phone: "9989012345", capacity: 12000, available: 4800 },
    { city: "Keesara State Warehouse", district: "MEDCHAL", manager: "Shri N. Suresh Kumar", phone: "9848123980", capacity: 14000, available: 3900 },
    { city: "Miryalaguda Mega Rice Storage", district: "NALGONDA", manager: "Shri A. Lingaiah", phone: "9848033890", capacity: 42000, available: 11200 },
    { city: "Khammam Cotton & Grain Yard", district: "KHAMMAM", manager: "Shri S. Ramakrishna", phone: "9440267812", capacity: 26000, available: 8500 }
  ],

  // Logistics Partners in Telangana
  logistics: [
    {
      name: "Rivigo Services Telangana",
      url: "relay.rivigo.com",
      phone: "1800 120 7484",
      desc: "Fast relay trucking connecting Warangal, Nizamabad and Medchal farmlands directly with Hyderabad, Bengaluru and Chennai wholesale APMC mandis.",
      fleet: "3,000+ Relay Trucks",
      coverage: "All 33 Telangana Districts & Inter-state"
    },
    {
      name: "Truck Suvidha Telangana",
      url: "www.trucksuvidha.com",
      phone: "8882080808",
      desc: "Instant farm-gate pickup for Paddy, Cotton and Red Gram. Connects over 25,000 local truck fleet owners with FPOs and Rythu Sanghams across Telangana.",
      fleet: "45,000+ Verified Trucks",
      coverage: "Warangal, Medchal, Nizamabad & Hyderabad"
    },
    {
      name: "Transin Logistics South Hub",
      url: "www.transin.in",
      phone: "1800 270 0300",
      desc: "Specialized in bulk agriculture transport from Telangana market yards. GPS live tracking and insured dispatch for grains, pulses and spices.",
      fleet: "13,000+ Trucks",
      coverage: "South India Agricultural Corridors"
    },
    {
      name: "BlackBuck Telangana Freight",
      url: "www.blackbuck.com",
      phone: "+91 80 46481838",
      desc: "Matches trucks within 20 minutes from Enumamula, Kandlakoi and Bowenpally market yards with competitive freight tariffs.",
      fleet: "3,50,000+ Network Trucks",
      coverage: "Pan Telangana & Pan India"
    }
  ],

  // Telangana & National Schemes
  policies: [
    {
      id: "POL-1",
      title: "Rythu Bandhu Scheme (రైతు బంధు)",
      title_hi: "रायथु बंधु योजना (कृषि निवेश सहायता)",
      desc: "Telangana Government's pioneering investment support scheme providing direct financial assistance per acre per season to farmers for purchase of seeds, bio-fertilizers, and farm labor.",
      link: "https://rythubandhu.telangana.gov.in/",
      category: "Direct Benefit"
    },
    {
      id: "POL-2",
      title: "Rythu Bima (రైతు బీమా - Farmer Group Life Insurance)",
      title_hi: "रायथु बीमा (किसान जीवन सुरक्षा योजना)",
      desc: "100% state-funded life insurance coverage providing ₹5,00,000 direct financial relief to nominee families within 10 days of unforeseen loss, irrespective of natural causes.",
      link: "https://rythubima.telangana.gov.in/",
      category: "Social Security"
    },
    {
      id: "POL-3",
      title: "Pradhan Mantri Fasal Bima Yojana (PMFBY Telangana)",
      title_hi: "प्रधानमंत्री फसल बीमा योजना",
      desc: "Comprehensive crop insurance cover against flood, drought, pests and unseasonal rain with nominal 1.5% - 2% premium.",
      link: "https://pmfby.gov.in/",
      category: "Crop Insurance"
    },
    {
      id: "POL-4",
      title: "Subsidized 3 Lakh Agricultural Loan at 7% Interest (KCC)",
      title_hi: "किसानों को 7% ब्याज पर 3 लाख का ऋण (KCC)",
      desc: "Short-term crop production loan at 7% p.a., reduced to 4% effective interest for farmers repaying promptly through Telangana State Cooperative Bank (TSCAB).",
      link: "https://www.nabard.org/",
      category: "Subsidized Credit"
    },
    {
      id: "POL-5",
      title: "Telangana Micro Irrigation Project (TSMIP)",
      title_hi: "तेलंगाना सूक्ष्म सिंचाई परियोजना (ड्रिप एवं स्प्रिंकलर)",
      desc: "Up to 100% subsidy for SC/ST farmers and 90% subsidy for small/marginal farmers for installing drip and sprinkler systems across Warangal, Nizamabad and Medchal.",
      link: "https://horticulture.telangana.gov.in/",
      category: "Micro Irrigation"
    },
    {
      id: "POL-6",
      title: "PJTSAU Organic Farming & Telangana Sona Seeds Mission",
      title_hi: "PJTSAU जैविक खेती एवं तेलंगाना सोना बीज मिशन",
      desc: "Subsidized distribution of certified RNR 15048 breeder seeds and organic certification grants under Telangana Agriculture Department.",
      link: "https://pjtsau.edu.in/",
      category: "Certified Seeds"
    }
  ],

  // Production Guides
  cropProductionGuides: {
    wheat: {
      crop: "Paddy & Telangana Sona Rice (धान एवं तेलंगाना सोना)",
      image: "assets/raw/paddy.png",
      chapters: [
        {
          title: "1. परिचय (Introduction)",
          content: "तेलंगाना सोना (RNR 15048) प्रोफेसर जयशंकर तेलंगाना राज्य कृषि विश्वविद्यालय (PJTSAU) द्वारा विकसित एक विशेष कम ग्लाइसेमिक इंडेक्स (GI 51) वाली धान की किस्म है। यह शुगर के मरीजों के लिए उत्तम मानी जाती है और बाजार में इसका भाव सामान्य धान से 25-30% अधिक मिलता है।"
        },
        {
          title: "2. उपयुक्त जलवायु एवं भूमि (Climate & Soil)",
          content: "तेलंगाना के वारंगल, निज़ामाबाद, मेदचल और करीमनगर की काली कपासी एवं दोमट मिट्टी धान की खेती के लिए सबसे उपयुक्त है। उचित जल निकास और पर्याप्त सिंचाई की व्यवस्था होनी चाहिए।"
        },
        {
          title: "3. उन्नत किस्में (Varieties)",
          content: "1. तेलंगाना सोना (RNR 15048): कम अवधि (120-125 दिन), ब्लास्ट रोग प्रतिरोधी, बारीक दाने।\n2. सोना मसूरी (BPT 5204): मध्यम अवधि (145-150 दिन), उच्च गुणवत्ता एवं बेहतरीन स्वाद।\n3. कुंजम (KNM 118): कम पानी में अधिक पैदावार देने वाली किस्म।"
        },
        {
          title: "4. बीज दर एवं नर्सरी प्रबंधन (Seed Rate & Nursery)",
          content: "प्रति एकड़ 20 से 25 किग्रा प्रमाणित बीज की आवश्यकता होती है। नर्सरी में 20 से 25 दिन के स्वस्थ पौधों की रोपाई करें। रोपाई के समय प्रति हिल 2-3 पौधे 20×15 सेमी की दूरी पर लगायें।"
        },
        {
          title: "5. खाद एवं उर्वरक प्रबंधन (Fertilizer Management)",
          content: "खेत की तैयारी के समय 5 टन सड़ी गोबर खाद या कंपोस्ट मिलायें। नत्रजन, फास्फोरस एवं पोटाश 100:60:40 किग्रा/हेक्टेयर के अनुपात में दें। जिंक सल्फेट 25 किग्रा/हेक्टेयर डालने से पैदावार में 15% की वृद्धि होती है।"
        },
        {
          title: "6. कटाई एवं पैदावार (Harvesting & Yield)",
          content: "जब बालियों के दाने सुनहरे हो जाएं और नमी 18-20% रहे, तब कटाई करें। तेलंगाना सोना से औसतन 28 से 32 क्विंटल प्रति एकड़ पैदावार प्राप्त होती है।"
        }
      ]
    },
    paddy: {
      crop: "Red Gram / Tandur Arhar Dal (तंदूर लाल अरहर दाल)",
      image: "assets/raw/arhar.png",
      chapters: [
        {
          title: "1. परिचय (Introduction)",
          content: "तेलंगाना की तंदूर लाल चना (अरहर दाल) को भौगोलिक संकेतक (GI Tag) प्राप्त है। यह दाल अपनी उच्च प्रोटीन (24%) और पकने में कम समय लेने के लिए जानी जाती है।"
        },
        {
          title: "2. जलवायु एवं बुवाई का समय (Climate & Sowing)",
          content: "जून के अंतिम सप्ताह से जुलाई के प्रथम पखवाड़े तक मानसून की पहली बारिश के बाद बुवाई करें। बलुई दोमट एवं गहरी काली मिट्टी सबसे उपयुक्त है।"
        },
        {
          title: "3. उन्नत प्रजातियाँ (Improved Varieties)",
          content: "आशा (ICPL 87119), मारुति (ICP 8863), पीआरजी 176 प्रमुख किस्में हैं जो उकठा एवं बांझपन रोग प्रतिरोधी हैं।"
        },
        {
          title: "4. रोग एवं कीट नियंत्रण (Pest Control)",
          content: "फली वेधक (Helicoverpa) कीट नियंत्रण के लिए नीम अर्क 5% का फूल आने के समय छिड़काव करें। फेरोमोन ट्रैप 5 प्रति एकड़ लगाएं।"
        }
      ]
    },
    arhar: {
      crop: "Warangal Red Chilli & Cotton (वारंगल मिर्च एवं कपास)",
      image: "assets/raw/crop_production_opt.jpg",
      chapters: [
        {
          title: "1. परिचय (Introduction)",
          content: "वारंगल की लाल मिर्च (चपाटा व तेजा किस्म) अपने गहरे लाल रंग और तीखेपन के लिए एशिया भर में प्रसिद्ध है। एनुमामुला मंडी मिर्च का सबसे बड़ा व्यापारिक केंद्र है।"
        },
        {
          title: "2. रोपण एवं ड्रिप तकनीक (Planting & Drip)",
          content: "ड्रिप सिंचाई और प्लास्टिक मल्चिंग का उपयोग करने से 40% पानी की बचत होती है और थ्रिप्स कीटों का प्रकोप काफी कम हो जाता है।"
        }
      ]
    }
  },

  // Disease remedies
  problems: [
    {
      id: "PROB-1",
      title: "तेलंगाना जैविक कीटनाशक (गोमूत्र, नीम एवं लहसुन स्प्रे)",
      summary: "देशी गाय के गोमूत्र, गोबर, हल्दी, लहसुन और नीम का पूर्ण जैविक कीटनाशक।",
      image: "assets/raw/treat.jpg",
      materials: [
        "देशी गाय का गोमूत्र: 10 लीटर",
        "ताजा गाय का गोबर: 5 किग्रा",
        "हल्दी पाउडर: 250 ग्राम",
        "लहसुन पेस्ट: 250 ग्राम",
        "पानी: 5 लीटर"
      ],
      method: "सभी सामग्री को मिलाकर 25 दिन प्लास्टिक के ड्रम में सड़ाएं। 200 लीटर पानी में 1 लीटर घोल मिलाकर धान व मिर्च पर छिड़कें। रस चूसक कीड़ों एवं फफूंद से पूर्ण सुरक्षा मिलती है।"
    },
    {
      id: "PROB-2",
      title: "नीम अर्क - प्राकृतिक कीट नियंत्रक (Neem Astra)",
      summary: "300 से अधिक कीट प्रजातियों का बिना रासायनिक दवा के प्राकृतिक नियंत्रण।",
      image: "assets/raw/cropquality.jpeg",
      materials: [
        "ताजा नीम की पत्तियां व निंबोली: 5 किग्रा",
        "गोमूत्र: 5 लीटर",
        "पानी: 100 लीटर"
      ],
      method: "धान के तना छेदक और मिर्च के थ्रिप्स के नियंत्रण हेतु 5% नीम अर्क का छिड़काव 15 दिन के अंतराल पर करें।"
    },
    {
      id: "PROB-3",
      title: "धान का शीथ ब्लाइट एवं ब्लास्ट रोग नियंत्रण",
      summary: "स्यूडोमोनास एवं ट्राइकोडरमा द्वारा जैविक फफूंद नियंत्रण।",
      image: "assets/raw/crop_production_opt.jpg",
      materials: [
        "स्यूडोमोनास फ्लोरीसेंस: 2.5 किग्रा/हेक्टेयर",
        "गोबर की सड़ी खाद: 50 किग्रा"
      ],
      method: "रोपाई के 30 दिन बाद गोबर खाद में स्यूडोमोनास मिलाकर खेत में बिखेरें।"
    },
    {
      id: "PROB-4",
      title: "दीमक एवं जड़ कीटों से बचाव (जैविक मटका विधि)",
      summary: "मक्के के भुट्टे व मटके द्वारा जैविक दीमक जाल।",
      image: "assets/raw/treat.jpg",
      materials: [
        "मिट्टी का घड़ा",
        "मक्के के भुट्टे की गिल्लियां: 8-10",
        "छिद्र युक्त सूती कपड़ा",
        "नीम तेल: 50 मिली"
      ],
      method: "मटके को खेत में गाड़कर दीमकों को आकर्षित करें और जैविक तरीके से नष्ट करें।"
    }
  ],

  // Horticulture in Telangana
  horticulture: {
    mango: {
      crop: "Mango - Banganapalli (बंगनापल्ली आम की वैज्ञानिक खेती)",
      image: "assets/raw/horticulture_main.jpg",
      stages: [
        { title: "1. परिचय एवं किस्में", detail: "बंगनापल्ली (सफेदा), हिमायत और दशेहरी तेलंगाना के प्रमुख आम हैं। बंगनापल्ली का फल बड़ा, मीठा और गूदेदार होता है।" },
        { title: "2. रोपण विधि", detail: "10×10 मीटर दूरी पर 1×1×1 मीटर आकार के गड्ढे खोदकर 50 किग्रा गोबर खाद और सुपरफास्फेट मिलाकर भरें।" },
        { title: "3. जल एवं पोषक तत्व प्रबंधन", detail: "ड्रिप सिंचाई द्वारा पानी दें। फूल आने के समय सिंचाई रोक दें ताकि अच्छे फल बैठें।" },
        { title: "4. तुड़ाई एवं ग्रेडिंग", detail: "डंठल सहित कैंची से फल तोड़ें और लकड़ी के बक्सों में सुरक्षित पैक करें।" }
      ]
    },
    banana: {
      crop: "Banana - Grand Naine (जी-9 केले की टिशू कल्चर खेती)",
      image: "assets/raw/horticulture_main.jpg",
      stages: [
        { title: "1. किस्में एवं रोपण", detail: "ग्रैंड नैन (जी-9) टिशू कल्चर 1.8×1.8 मीटर अंतरण पर लगाएं।" },
        { title: "2. ड्रिप एवं फर्टिगेशन", detail: "प्रति पौधा प्रतिदिन 15-20 लीटर पानी ड्रिप द्वारा दें।" },
        { title: "3. उपज", detail: "प्रति पौधा 25-30 किग्रा का घौद (बंच) प्राप्त होता है।" }
      ]
    },
    guava: {
      crop: "Guava - Taiwan Pink & Safeda (ताइवान पिंक एवं सफेदा अमरूद)",
      image: "assets/raw/horticulture_main.jpg",
      stages: [
        { title: "1. सघन बागवानी", detail: "मेदचल व वारंगल में 3×2 मीटर सघन बागवानी पद्धति से अमरूद लगाएं।" },
        { title: "2. कैनोपी कटाई-छंटाई", detail: "पौधे को 90 सेमी ऊंचाई पर शीर्ष काटकर मजबूत ढांचा तैयार करें।" },
        { title: "3. उत्पादन", detail: "सघन बागवानी से प्रति एकड़ 12 से 15 टन उच्च गुणवत्ता फल प्राप्त होते हैं।" }
      ]
    }
  },

  // Team ForeverKnights
  about: {
    event: "KisanSaathi Agricultural Innovation Initiative",
    problemStatement: "Technology-driven Direct Farm-to-Buyer Marketplace, Crop Quality AI Grading & Value Addition for Farmers",
    organization: "Department of Agriculture & Farmers Welfare, Telangana",
    sourceRepo: "https://github.com/shivamkumard107/KisanSeva2",
    teamName: "Team ForeverKnights",
    team: [
      {
        name: "Gulam Waheed Mujtaba",
        role: "Lead Architect & Full Stack Lead"
      },
      {
        name: "Shaik Mohammed Ateeq",
        role: "Cloud Infrastructure & AI Systems Engineer"
      },
      {
        name: "Malik Samiullah Khan",
        role: "UI/UX & Agricultural Tech Specialist"
      }
    ]
  },

  // Screenshots
  screenshots: [
    { file: "assets/images/ss1.png", title: "Farmer's Inventory", desc: "Real-time crop stock, prices, quality badges and actions" },
    { file: "assets/images/ss2.png", title: "Add Crops to Sell", desc: "Crop upload with AI price estimation and cluster aggregation" },
    { file: "assets/images/ss3.png", title: "Crop Quality Prediction", desc: "Category selection and image input for CV quality test" },
    { file: "assets/images/ss4.png", title: "Grain Quality Grading", desc: "Inspection metrics, moisture and defect ratios" },
    { file: "assets/images/ss5.png", title: "Farmer's Profile", desc: "Identity, land records, rating and direct wallet shortcuts" },
    { file: "assets/images/ss6.png", title: "Predicted Quality by ML Model", desc: "Instant automated grading (Elite / Premium / Classic)" },
    { file: "assets/images/ss7.png", title: "Inclusive Credit Assessment", desc: "NABARD scale of finance and cash flow loan assessment" },
    { file: "assets/images/ss8.png", title: "Feature Search Grid", desc: "Instant access to all modules and advisory tools" },
    { file: "assets/images/ss9.png", title: "Information Section", desc: "Production methods, pest solutions and govt schemes" },
    { file: "assets/images/ss10.png", title: "Farmer's Earning Wallet", desc: "Crop sale earnings, recent transactions and bank transfer" },
    { file: "assets/images/ss11.png", title: "Navigation Drawer", desc: "Side drawer menu with language switch and order tracker" },
    { file: "assets/images/ss12.png", title: "Loan Ledger", desc: "Blockchain-backed immutable credit and subsidy ledger" },
    { file: "assets/images/ss13.png", title: "Soil Testing Labs", desc: "Telangana district-wise directory of authorized soil testing labs" },
    { file: "assets/images/ss14.png", title: "Farmer's Credit Score", desc: "Credit score computation based on yield and soil data" },
    { file: "assets/images/ss15.png", title: "Buyer-Seller Route Map", desc: "Connecting local farmer to wholesale mandi with route navigation" }
  ]
};

if (typeof window !== 'undefined') {
  window.KISAN_DATA = KISAN_DATA;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = KISAN_DATA;
}
