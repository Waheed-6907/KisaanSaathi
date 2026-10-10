const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// Color Palette
const COLORS = {
  bgDark: '0F172A',      // Slate 900
  cardBg: '1E293B',      // Slate 800
  cardBorder: '334155',  // Slate 700
  primary: '8A2BE2',     // BlueViolet / Purple
  primaryLight: 'C084FC',// Purple 400
  accent: '10B981',      // Emerald 500
  accentLight: '34D399', // Emerald 400
  cyan: '06B6D4',        // Cyan 500
  textWhite: 'FFFFFF',
  textMuted: '94A3B8',
  textDim: '64748B'
};

// ============================================================================
// SLIDE 1: TITLE & TEAM DETAILS
// ============================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgDark };

  // Event Header Banner
  slide.addText('HACK-X 2026 · 35-HOUR HACKATHON · MJCET', {
    x: 0.8, y: 0.5, w: 11.5, h: 0.35,
    fontSize: 11, fontFace: 'Calibri', color: COLORS.primaryLight, bold: true, charSpacing: 1.5
  });

  // Main Title
  slide.addText('KisanSaathi (किसान साथी)', {
    x: 0.8, y: 0.9, w: 7.5, h: 0.9,
    fontSize: 34, fontFace: 'Calibri', color: COLORS.textWhite, bold: true
  });

  // Tagline
  slide.addText('Empowering Farmers with Direct Mandi Access, Computer Vision Quality Grading & Cluster Logistics.', {
    x: 0.8, y: 1.8, w: 7.5, h: 0.55,
    fontSize: 13, fontFace: 'Calibri', color: COLORS.textMuted
  });

  // Problem Box (Left Card)
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 2.6, w: 7.2, h: 1.7,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 }
  });
  slide.addText('PROBLEM STATEMENT', {
    x: 1.0, y: 2.75, w: 6.8, h: 0.25,
    fontSize: 10, fontFace: 'Calibri', color: COLORS.accentLight, bold: true, charSpacing: 1
  });
  slide.addText('Smallholder farmers in Telangana lose 15–20% of produce value to intermediary commissions, face arbitrary quality grading cuts at mandis, and incur unaffordable freight costs for sub-500kg harvests.', {
    x: 1.0, y: 3.05, w: 6.8, h: 1.1,
    fontSize: 11.5, fontFace: 'Calibri', color: COLORS.textWhite
  });

  // Metadata Grid (Left Bottom)
  const metaItems = [
    { label: 'THEME', val: 'Agriculture, FoodTech & Rural Innovation' },
    { label: 'REGION', val: 'Telangana (Warangal, Medchal, Hyderabad, Secunderabad, Nizamabad)' },
    { label: 'PROTOTYPE', val: 'Full-Stack PWA · Bilingual Voice AI · Leaflet GPS Tracking' }
  ];
  metaItems.forEach((m, idx) => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 4.5 + idx * 0.75, w: 7.2, h: 0.65,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 }
    });
    slide.addText(`${m.label}:  ${m.val}`, {
      x: 1.0, y: 4.65 + idx * 0.75, w: 6.8, h: 0.35,
      fontSize: 10.5, fontFace: 'Calibri', color: COLORS.textWhite, bold: false
    });
  });

  // Team Card (Right Side)
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 8.3, y: 0.9, w: 4.2, h: 5.9,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.primary, width: 2 }
  });

  slide.addText('TEAM DETAILS', {
    x: 8.6, y: 1.15, w: 3.6, h: 0.3,
    fontSize: 11, fontFace: 'Calibri', color: COLORS.primaryLight, bold: true, charSpacing: 1.5
  });
  slide.addText('Team ForeverKnights', {
    x: 8.6, y: 1.45, w: 3.6, h: 0.45,
    fontSize: 20, fontFace: 'Calibri', color: COLORS.textWhite, bold: true
  });

  const members = [
    { name: 'Gulam Waheed Mujtaba', role: 'Lead Architect & Full Stack Lead', desc: 'PWA Architecture · Escrow Engine · Leaflet GIS' },
    { name: 'Shaik Mohammed Ateeq', role: 'Cloud Infra & AI Systems Engineer', desc: 'Bilingual NLP Assistant · Speech APIs · Cloud DevOps' },
    { name: 'Malik Samiullah Khan', role: 'UI/UX & Agri-Tech Specialist', desc: 'Farmer-Centric UX · Quality Grading Models · Agri Research' }
  ];

  members.forEach((mem, idx) => {
    const yOff = 2.2 + idx * 1.45;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.55, y: yOff, w: 3.7, h: 1.3,
      fill: { color: COLORS.bgDark },
      line: { color: COLORS.cardBorder, width: 1 }
    });
    slide.addText(mem.name, {
      x: 8.7, y: yOff + 0.1, w: 3.4, h: 0.3,
      fontSize: 12, fontFace: 'Calibri', color: COLORS.accentLight, bold: true
    });
    slide.addText(mem.role, {
      x: 8.7, y: yOff + 0.4, w: 3.4, h: 0.3,
      fontSize: 10, fontFace: 'Calibri', color: COLORS.textWhite, bold: true
    });
    slide.addText(mem.desc, {
      x: 8.7, y: yOff + 0.7, w: 3.4, h: 0.45,
      fontSize: 9, fontFace: 'Calibri', color: COLORS.textMuted
    });
  });
}

// ============================================================================
// SLIDE 2: PROPOSED SOLUTION & UNIQUE VALUE PROPOSITION
// ============================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgDark };

  slide.addText('KISANSAATHI · 02', {
    x: 0.8, y: 0.4, w: 6.0, h: 0.25,
    fontSize: 10, fontFace: 'Calibri', color: COLORS.primaryLight, bold: true, charSpacing: 1.5
  });
  slide.addText('Proposed Solution & Workflow', {
    x: 0.8, y: 0.65, w: 10.0, h: 0.6,
    fontSize: 26, fontFace: 'Calibri', color: COLORS.textWhite, bold: true
  });

  // 5 Process Steps Horizontal Cards
  const steps = [
    { num: '1', title: 'Crop Listing', desc: 'Farmer captures crop photo or sample specs via 1-tap mobile PWA' },
    { num: '2', title: 'AI Quality Grading', desc: 'Computer Vision predicts grain uniformity, Elite/Premium grade & fair price' },
    { num: '3', title: 'Cluster Pooling', desc: 'Sub-500kg yields auto-pooled into Warangal Cluster #12 for 38% freight savings' },
    { num: '4', title: 'Direct Negotiation', desc: 'Transparent counter-offer desk connects directly with wholesale buyers' },
    { num: '5', title: 'Escrow Payout', desc: 'Verified 24h DBT bank transfer with Leaflet live GPS transit navigation' }
  ];

  steps.forEach((st, idx) => {
    const xPos = 0.8 + idx * 2.32;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: xPos, y: 1.35, w: 2.18, h: 2.0,
      fill: { color: COLORS.cardBg },
      line: { color: idx === 1 ? COLORS.primary : COLORS.cardBorder, width: idx === 1 ? 2 : 1 }
    });
    slide.addText(st.num, {
      x: xPos + 0.15, y: 1.45, w: 0.4, h: 0.4,
      fontSize: 14, fontFace: 'Calibri', color: COLORS.accentLight, bold: true
    });
    slide.addText(st.title, {
      x: xPos + 0.15, y: 1.85, w: 1.9, h: 0.45,
      fontSize: 11, fontFace: 'Calibri', color: COLORS.textWhite, bold: true
    });
    slide.addText(st.desc, {
      x: xPos + 0.15, y: 2.3, w: 1.9, h: 0.95,
      fontSize: 9.5, fontFace: 'Calibri', color: COLORS.textMuted
    });
  });

  // Comparison Matrix Header
  slide.addText('Traditional Mandi System vs KisanSaathi Model', {
    x: 0.8, y: 3.55, w: 7.5, h: 0.35,
    fontSize: 13, fontFace: 'Calibri', color: COLORS.textWhite, bold: true
  });

  // Comparison Table
  const tableData = [
    [
      { text: 'EVALUATION PARAMETER', options: { bold: true, color: COLORS.primaryLight, fill: '1E293B', fontSize: 9.5 } },
      { text: 'TRADITIONAL MANDI CHANNEL', options: { bold: true, color: 'F87171', fill: '1E293B', fontSize: 9.5 } },
      { text: 'KISANSAATHI PLATFORM', options: { bold: true, color: COLORS.accentLight, fill: '1E293B', fontSize: 9.5 } }
    ],
    [
      { text: 'Intermediary Commissions', options: { color: COLORS.textWhite, fill: '0F172A', fontSize: 9 } },
      { text: '12% – 18% cut taken by brokers & commission agents', options: { color: COLORS.textMuted, fill: '0F172A', fontSize: 9 } },
      { text: '0% Middleman cut; direct buyer-to-farmer trade', options: { color: COLORS.accentLight, bold: true, fill: '0F172A', fontSize: 9 } }
    ],
    [
      { text: 'Produce Quality Grading', options: { color: COLORS.textWhite, fill: '1E293B', fontSize: 9 } },
      { text: 'Subjective visual inspection favoring buyers', options: { color: COLORS.textMuted, fill: '1E293B', fontSize: 9 } },
      { text: 'Automated Computer Vision defect ratio & grade check', options: { color: COLORS.accentLight, bold: true, fill: '1E293B', fontSize: 9 } }
    ],
    [
      { text: 'Freight & Transportation', options: { color: COLORS.textWhite, fill: '0F172A', fontSize: 9 } },
      { text: 'High individual freight rate (₹3.80 / Kg)', options: { color: COLORS.textMuted, fill: '0F172A', fontSize: 9 } },
      { text: 'Cluster Pooling cuts freight to ₹2.35 / Kg (38% savings)', options: { color: COLORS.accentLight, bold: true, fill: '0F172A', fontSize: 9 } }
    ],
    [
      { text: 'Payment Settlement', options: { color: COLORS.textWhite, fill: '1E293B', fontSize: 9 } },
      { text: 'Delayed 15–45 days via paper chits & informal debt', options: { color: COLORS.textMuted, fill: '1E293B', fontSize: 9 } },
      { text: 'Escrow guaranteed DBT transfer within 24 hours', options: { color: COLORS.accentLight, bold: true, fill: '1E293B', fontSize: 9 } }
    ]
  ];

  slide.addTable(tableData, {
    x: 0.8, y: 3.95, w: 7.6, h: 2.7,
    border: { pt: 1, color: COLORS.cardBorder }
  });

  // Right USP Card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 8.65, y: 3.55, w: 3.85, h: 3.1,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.primary, width: 2 }
  });
  slide.addText('CORE VALUE PROPOSITION', {
    x: 8.85, y: 3.75, w: 3.45, h: 0.25,
    fontSize: 10, fontFace: 'Calibri', color: COLORS.primaryLight, bold: true, charSpacing: 1.5
  });
  slide.addText('"Don\'t just list crops. Guarantee fair grading, shared logistics & verified payment."', {
    x: 8.85, y: 4.1, w: 3.45, h: 0.8,
    fontSize: 13, fontFace: 'Calibri', color: COLORS.textWhite, bold: true
  });

  const uspPoints = [
    '• Telangana Sona (RNR 15048) Premium Market Realization',
    '• Warangal Agri-Cluster #12 Local Aggregation',
    '• Soil Health Card Integration for Soil-Tested Pricing',
    '• Pre-approved 4% Subsidized Loan based on Agri Credit Score'
  ];
  uspPoints.forEach((pt, idx) => {
    slide.addText(pt, {
      x: 8.85, y: 4.95 + idx * 0.4, w: 3.45, h: 0.38,
      fontSize: 9.5, fontFace: 'Calibri', color: COLORS.textMuted
    });
  });
}

// ============================================================================
// SLIDE 3: TECHNICAL APPROACH & SYSTEM ARCHITECTURE
// ============================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgDark };

  slide.addText('KISANSAATHI · 03', {
    x: 0.8, y: 0.4, w: 6.0, h: 0.25,
    fontSize: 10, fontFace: 'Calibri', color: COLORS.primaryLight, bold: true, charSpacing: 1.5
  });
  slide.addText('Technical Approach & Architecture', {
    x: 0.8, y: 0.65, w: 10.0, h: 0.6,
    fontSize: 26, fontFace: 'Calibri', color: COLORS.textWhite, bold: true
  });

  // Pipeline Flow Diagram
  const pipeNodes = [
    { title: 'Mobile PWA Input', sub: 'Photo / Crop Specs' },
    { title: 'CV Quality Engine', sub: 'Defect & Grade Check' },
    { title: 'Cluster Optimizer', sub: 'Sub-500kg Grouping' },
    { title: 'Direct Escrow Desk', sub: 'Counter-Offers & Bids' },
    { title: 'GIS Transit Router', sub: 'Leaflet GPS Tracking' }
  ];

  pipeNodes.forEach((node, idx) => {
    const xPos = 0.8 + idx * 2.32;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: xPos, y: 1.35, w: 2.18, h: 1.05,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 }
    });
    slide.addText(node.title, {
      x: xPos + 0.1, y: 1.48, w: 1.98, h: 0.35,
      fontSize: 10.5, fontFace: 'Calibri', color: COLORS.accentLight, bold: true
    });
    slide.addText(node.sub, {
      x: xPos + 0.1, y: 1.83, w: 1.98, h: 0.45,
      fontSize: 9, fontFace: 'Calibri', color: COLORS.textMuted
    });
  });

  // Left Table: Tech Stack Breakdown
  const techTableData = [
    [
      { text: 'SYSTEM LAYER', options: { bold: true, color: COLORS.primaryLight, fill: '1E293B', fontSize: 9.5 } },
      { text: 'TECHNOLOGY STACK', options: { bold: true, color: COLORS.textWhite, fill: '1E293B', fontSize: 9.5 } },
      { text: 'OPERATIONAL FUNCTIONALITY', options: { bold: true, color: COLORS.accentLight, fill: '1E293B', fontSize: 9.5 } }
    ],
    [
      { text: 'Frontend UI', options: { color: COLORS.textWhite, fill: '0F172A', fontSize: 9 } },
      { text: 'PWA, HTML5, Tailwind CSS, Lucide', options: { color: COLORS.textMuted, fill: '0F172A', fontSize: 9 } },
      { text: 'Dual view: Native Mobile frame & Desktop portal mode', options: { color: COLORS.textWhite, fill: '0F172A', fontSize: 9 } }
    ],
    [
      { text: 'Backend Server', options: { color: COLORS.textWhite, fill: '1E293B', fontSize: 9 } },
      { text: 'Node.js, Zero-dependency HTTP server', options: { color: COLORS.textMuted, fill: '1E293B', fontSize: 9 } },
      { text: 'Static asset serving, OTP auth, escrow simulation', options: { color: COLORS.textWhite, fill: '1E293B', fontSize: 9 } }
    ],
    [
      { text: 'AI & Quality CV', options: { color: COLORS.textWhite, fill: '0F172A', fontSize: 9 } },
      { text: 'OpenCV / Browser CV Inference', options: { color: COLORS.textMuted, fill: '0F172A', fontSize: 9 } },
      { text: 'Instant grain ratio grading (Elite/Premium/Classic)', options: { color: COLORS.textWhite, fill: '0F172A', fontSize: 9 } }
    ],
    [
      { text: 'Conversational NLP', options: { color: COLORS.textWhite, fill: '1E293B', fontSize: 9 } },
      { text: 'Kisan Mitra (Web Speech API)', options: { color: COLORS.textMuted, fill: '1E293B', fontSize: 9 } },
      { text: 'Bilingual voice synthesis (en-IN & hi-IN) with live advice', options: { color: COLORS.textWhite, fill: '1E293B', fontSize: 9 } }
    ],
    [
      { text: 'GIS Navigation', options: { color: COLORS.textWhite, fill: '0F172A', fontSize: 9 } },
      { text: 'Leaflet.js & OpenStreetMap', options: { color: COLORS.textMuted, fill: '0F172A', fontSize: 9 } },
      { text: 'Interactive farm-to-mandi route (Geesugonda-Bowenpally)', options: { color: COLORS.textWhite, fill: '0F172A', fontSize: 9 } }
    ]
  ];

  slide.addTable(techTableData, {
    x: 0.8, y: 2.6, w: 7.6, h: 3.9,
    border: { pt: 1, color: COLORS.cardBorder }
  });

  // Right Cards: Technical Highlights
  const techCards = [
    {
      title: 'Bilingual Voice Engine',
      points: ['• Dynamic En/Hi toggle on login & header', '• Instant agro-advisory for Warangal mandis', '• Natural voice synthesis in English & Hindi']
    },
    {
      title: 'Blockchain Credit Ledger',
      points: ['• Cryptographic hash verification', '• 785/900 Agri Credit Score evaluation', '• Pre-approved 4% KCC subsidized loan']
    },
    {
      title: 'Real-Time Geo-Routing',
      points: ['• Leaflet transit polyline across Telangana', '• Coordinates: Warangal (17.96, 79.59)', '• Bowenpally Wholesale Mandi (17.47, 78.48)']
    }
  ];

  techCards.forEach((tc, idx) => {
    const yPos = 2.6 + idx * 1.33;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.65, y: yPos, w: 3.85, h: 1.25,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 }
    });
    slide.addText(tc.title, {
      x: 8.85, y: yPos + 0.1, w: 3.45, h: 0.25,
      fontSize: 10.5, fontFace: 'Calibri', color: COLORS.cyan, bold: true
    });
    tc.points.forEach((pt, pIdx) => {
      slide.addText(pt, {
        x: 8.85, y: yPos + 0.38 + pIdx * 0.26, w: 3.45, h: 0.24,
        fontSize: 9, fontFace: 'Calibri', color: COLORS.textWhite
      });
    });
  });
}

// ============================================================================
// SLIDE 4: FEASIBILITY AND VIABILITY
// ============================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgDark };

  slide.addText('KISANSAATHI · 04', {
    x: 0.8, y: 0.4, w: 6.0, h: 0.25,
    fontSize: 10, fontFace: 'Calibri', color: COLORS.primaryLight, bold: true, charSpacing: 1.5
  });
  slide.addText('Feasibility and Viability', {
    x: 0.8, y: 0.65, w: 10.0, h: 0.6,
    fontSize: 26, fontFace: 'Calibri', color: COLORS.textWhite, bold: true
  });

  // 3 Viability Pillars Top Cards
  const pillars = [
    { title: 'Technical Viability', icon: '⚙', desc: 'Zero-install PWA running directly in browser; client-side CV execution minimizes rural bandwidth requirements' },
    { title: 'Economic Viability', icon: '₹', desc: '100% free listing for farmers; sustainable 1.5% convenience fee charged to corporate bulk buyers on settled trades' },
    { title: 'Operational Scalability', icon: '📈', desc: 'Built around Telangana warehousing corridors, state marketing committees & authorized District Soil Testing Labs' }
  ];

  pillars.forEach((p, idx) => {
    const xPos = 0.8 + idx * 3.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: xPos, y: 1.35, w: 3.75, h: 1.45,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 }
    });
    slide.addText(`${p.icon}  ${p.title}`, {
      x: xPos + 0.15, y: 1.5, w: 3.45, h: 0.35,
      fontSize: 12, fontFace: 'Calibri', color: COLORS.accentLight, bold: true
    });
    slide.addText(p.desc, {
      x: xPos + 0.15, y: 1.9, w: 3.45, h: 0.8,
      fontSize: 10, fontFace: 'Calibri', color: COLORS.textWhite
    });
  });

  // Challenge vs Mitigation Table (Bottom Left)
  slide.addText('Risk & Challenge Mitigation Matrix', {
    x: 0.8, y: 3.0, w: 7.5, h: 0.3,
    fontSize: 12.5, fontFace: 'Calibri', color: COLORS.textWhite, bold: true
  });

  const challengeTableData = [
    [
      { text: 'IDENTIFIED RISK / CHALLENGE', options: { bold: true, color: 'F87171', fill: '1E293B', fontSize: 9.5 } },
      { text: 'KISANSAATHI MITIGATION STRATEGY', options: { bold: true, color: COLORS.accentLight, fill: '1E293B', fontSize: 9.5 } }
    ],
    [
      { text: 'Digital Literacy & Language Gaps', options: { color: COLORS.textWhite, fill: '0F172A', fontSize: 9 } },
      { text: 'Bilingual voice assistant (Hindi & English) + 1-tap OTP and Quick Demo access', options: { color: COLORS.textMuted, fill: '0F172A', fontSize: 9 } }
    ],
    [
      { text: 'Fragmented Harvests (<500 Kg)', options: { color: COLORS.textWhite, fill: '1E293B', fontSize: 9 } },
      { text: 'Automated cluster recommendation pooling local farmers for shared freight', options: { color: COLORS.textMuted, fill: '1E293B', fontSize: 9 } }
    ],
    [
      { text: 'Farmer Payment Distrust', options: { color: COLORS.textWhite, fill: '0F172A', fontSize: 9 } },
      { text: 'Verified escrow release upon physical mandi receipt + immutable blockchain logs', options: { color: COLORS.textMuted, fill: '0F172A', fontSize: 9 } }
    ],
    [
      { text: 'Unreliable Rural Connectivity', options: { color: COLORS.textWhite, fill: '1E293B', fontSize: 9 } },
      { text: 'Client-side state persistence (localStorage) with background network sync', options: { color: COLORS.textMuted, fill: '1E293B', fontSize: 9 } }
    ]
  ];

  slide.addTable(challengeTableData, {
    x: 0.8, y: 3.35, w: 7.6, h: 3.1,
    border: { pt: 1, color: COLORS.cardBorder }
  });

  // Development Roadmap (Bottom Right)
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 8.65, y: 3.0, w: 3.85, h: 3.5,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.primary, width: 2 }
  });

  slide.addText('DEVELOPMENT STATUS', {
    x: 8.85, y: 3.2, w: 3.45, h: 0.25,
    fontSize: 10, fontFace: 'Calibri', color: COLORS.primaryLight, bold: true, charSpacing: 1.5
  });

  slide.addText('Built in 35-Hour Hackathon', {
    x: 8.85, y: 3.5, w: 3.45, h: 0.3,
    fontSize: 11.5, fontFace: 'Calibri', color: COLORS.accentLight, bold: true
  });
  const hackDone = [
    '✓ Functional PWA with mobile app simulation',
    '✓ Computer Vision quality grading simulator',
    '✓ Real-time price negotiation desk',
    '✓ Escrow wallet & bank payout module',
    '✓ Telangana Soil Labs & Warehouses directory'
  ];
  hackDone.forEach((h, idx) => {
    slide.addText(h, {
      x: 8.85, y: 3.82 + idx * 0.26, w: 3.45, h: 0.24,
      fontSize: 8.5, fontFace: 'Calibri', color: COLORS.textWhite
    });
  });

  slide.addText('Next Phase Roadmap', {
    x: 8.85, y: 5.25, w: 3.45, h: 0.3,
    fontSize: 11.5, fontFace: 'Calibri', color: COLORS.cyan, bold: true
  });
  const roadmapItems = [
    '➔ Government e-NAM API integration',
    '➔ Satellite NDVI crop health monitoring',
    '➔ Direct UPI 2.0 automatic mandates'
  ];
  roadmapItems.forEach((r, idx) => {
    slide.addText(r, {
      x: 8.85, y: 5.57 + idx * 0.26, w: 3.45, h: 0.24,
      fontSize: 8.5, fontFace: 'Calibri', color: COLORS.textMuted
    });
  });
}

// ============================================================================
// SLIDE 5: IMPACT AND BENEFITS
// ============================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgDark };

  slide.addText('KISANSAATHI · 05', {
    x: 0.8, y: 0.4, w: 6.0, h: 0.25,
    fontSize: 10, fontFace: 'Calibri', color: COLORS.primaryLight, bold: true, charSpacing: 1.5
  });
  slide.addText('Impact and Benefits', {
    x: 0.8, y: 0.65, w: 10.0, h: 0.6,
    fontSize: 26, fontFace: 'Calibri', color: COLORS.textWhite, bold: true
  });

  // 3 Stakeholder Columns
  const stakeholders = [
    {
      title: 'Smallholder Farmers',
      badge: 'PRODUCER LEVEL',
      color: COLORS.accentLight,
      items: [
        '• 20% to 28% Net Income Uplift via middleman elimination',
        '• Zero Arbitrary Deductions with objective CV grading',
        '• 38% Freight Cost Reduction via Warangal Cluster pooling',
        '• Access to 4% Subsidized Credit backed by 785 credit score'
      ]
    },
    {
      title: 'Bulk Buyers & Millers',
      badge: 'MARKET DEMAND',
      color: COLORS.cyan,
      items: [
        '• Direct Farm-Gate Sourcing from verified Telangana farmers',
        '• Verified Quality Certificates reducing dispute risks',
        '• Automated Logistics Dispatch across highway corridors',
        '• Transparent Invoicing and scheduled delivery timelines'
      ]
    },
    {
      title: 'Government & Agri Dept',
      badge: 'POLICY & GOVERNANCE',
      color: COLORS.primaryLight,
      items: [
        '• Real-Time Crop Yield Data across Telangana districts',
        '• Soil Health Card Adoption via automated lab locator',
        '• Direct DBT Transparency with digital escrow audit trail',
        '• Reduced Post-Harvest Losses through swift market linkages'
      ]
    }
  ];

  stakeholders.forEach((sh, idx) => {
    const xPos = 0.8 + idx * 3.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: xPos, y: 1.35, w: 3.75, h: 3.1,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 }
    });

    slide.addText(sh.badge, {
      x: xPos + 0.2, y: 1.5, w: 3.35, h: 0.25,
      fontSize: 9, fontFace: 'Calibri', color: sh.color, bold: true, charSpacing: 1.5
    });
    slide.addText(sh.title, {
      x: xPos + 0.2, y: 1.75, w: 3.35, h: 0.4,
      fontSize: 15, fontFace: 'Calibri', color: COLORS.textWhite, bold: true
    });

    sh.items.forEach((it, iIdx) => {
      slide.addText(it, {
        x: xPos + 0.2, y: 2.25 + iIdx * 0.52, w: 3.35, h: 0.48,
        fontSize: 10, fontFace: 'Calibri', color: COLORS.textMuted
      });
    });
  });

  // Quantitative Metric Callout Strip (Bottom)
  const metrics = [
    { num: '₹5,200', label: 'Avg Extra Income per MT of Paddy' },
    { num: '38%', label: 'Logistics Cost Reduction' },
    { num: '24 Hrs', label: 'Guaranteed DBT Escrow Payout' },
    { num: '5 Districts', label: 'Telangana Deep Agricultural Coverage' }
  ];

  metrics.forEach((met, idx) => {
    const xPos = 0.8 + idx * 2.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: xPos, y: 4.75, w: 2.8, h: 1.75,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.primary, width: 1.5 }
    });
    slide.addText(met.num, {
      x: xPos + 0.1, y: 4.95, w: 2.6, h: 0.6,
      fontSize: 24, fontFace: 'Calibri', color: COLORS.accentLight, bold: true, align: 'center'
    });
    slide.addText(met.label, {
      x: xPos + 0.1, y: 5.6, w: 2.6, h: 0.65,
      fontSize: 10, fontFace: 'Calibri', color: COLORS.textWhite, align: 'center'
    });
  });
}

// ============================================================================
// SLIDE 6: RESEARCH AND REFERENCES
// ============================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgDark };

  slide.addText('KISANSAATHI · 06', {
    x: 0.8, y: 0.4, w: 6.0, h: 0.25,
    fontSize: 10, fontFace: 'Calibri', color: COLORS.primaryLight, bold: true, charSpacing: 1.5
  });
  slide.addText('Research and References', {
    x: 0.8, y: 0.65, w: 10.0, h: 0.6,
    fontSize: 26, fontFace: 'Calibri', color: COLORS.textWhite, bold: true
  });

  // 3 Research Category Cards
  const researchPillars = [
    {
      title: 'Problem Evidence & Market Data',
      icon: '📊',
      citations: [
        '1. NITI Aayog: Agricultural Marketing and Farmer Friendly Reforms Index (Intermediary margin losses in mandis).',
        '2. Directorate of Economics and Statistics, Telangana: Annual Crop Productivity Report for Warangal & Nizamabad.',
        '3. Ministry of Agriculture & Farmers Welfare: Soil Health Card Scheme & PMFBY operational guidelines.'
      ]
    },
    {
      title: 'Agronomic Research & Crop Standards',
      icon: '🌱',
      citations: [
        '4. PJTSAU Rajendranagar: Telangana Sona (RNR 15048) glycemic index & seed yield standards.',
        '5. ICAR-CRIDA Hyderabad: Nutrient threshold norms and organic pest control remedies.',
        '6. Telangana State Warehousing Corporation: Godown storage capacities & preservation norms.'
      ]
    },
    {
      title: 'Technology & Architecture Foundation',
      icon: '💻',
      citations: [
        '7. IEEE / ScienceDirect: Computer Vision in automated grain quality inspection and defect estimation.',
        '8. W3C Web Speech API: Bilingual voice synthesis protocols for rural accessibility.',
        '9. Leaflet.js & OpenStreetMap: Routing engines for transit distance computation.'
      ]
    }
  ];

  researchPillars.forEach((rp, idx) => {
    const xPos = 0.8 + idx * 3.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: xPos, y: 1.35, w: 3.75, h: 3.6,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 }
    });

    slide.addText(`${rp.icon}  ${rp.title}`, {
      x: xPos + 0.2, y: 1.5, w: 3.35, h: 0.45,
      fontSize: 11.5, fontFace: 'Calibri', color: COLORS.primaryLight, bold: true
    });

    rp.citations.forEach((cit, cIdx) => {
      slide.addText(cit, {
        x: xPos + 0.2, y: 2.1 + cIdx * 0.9, w: 3.35, h: 0.85,
        fontSize: 9.5, fontFace: 'Calibri', color: COLORS.textWhite
      });
    });
  });

  // Strategic Positioning Banner (Bottom)
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 5.25, w: 11.65, h: 1.3,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.accent, width: 2 }
  });

  slide.addText('STRATEGIC POSITIONING', {
    x: 1.1, y: 5.4, w: 11.0, h: 0.25,
    fontSize: 10, fontFace: 'Calibri', color: COLORS.accentLight, bold: true, charSpacing: 1.5
  });

  slide.addText('"Traditional portals merely list phone numbers. KisanSaathi standardizes quality with Computer Vision, eliminates freight barriers through cluster pooling, and guarantees payment with verified escrow."', {
    x: 1.1, y: 5.7, w: 11.0, h: 0.65,
    fontSize: 12.5, fontFace: 'Calibri', color: COLORS.textWhite, italic: true
  });
}

// Write Presentation
const outputPath1 = path.join(__dirname, 'KisanSaathi_HACK-X_Pitch_Deck.pptx');
const outputPath2 = 'C:\\Users\\Waheed Mujtaba\\Downloads\\KisanSaathi_HACK-X_Pitch_Deck.pptx';

pptx.writeFile({ fileName: outputPath1 }).then(() => {
  console.log(`Saved to: ${outputPath1}`);
  try {
    fs.copyFileSync(outputPath1, outputPath2);
    console.log(`Saved to Downloads: ${outputPath2}`);
  } catch (err) {
    console.error('Copy to downloads failed:', err.message);
  }
}).catch(err => {
  console.error('Failed to generate presentation:', err);
});
