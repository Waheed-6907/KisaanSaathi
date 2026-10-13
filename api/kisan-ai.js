/**
 * KisanSaathi AI Assistant Engine
 * Powering both Web Chatbot and Twilio WhatsApp Sandbox for Telangana Farmers
 */

const https = require('https');

// Core Domain Knowledge Base (Telangana Agriculture)
const KISAN_KNOWLEDGE = {
  en: [
    {
      keywords: ['rate', 'price', 'mandi', 'bhav', 'market', 'cost', 'paddy', 'rice', 'cotton', 'turmeric', 'chilli', 'mirchi', 'maize'],
      reply: "*🌾 Today's Mandi Rates (Telangana Mandis)*\n\n" +
             "• *Telangana Sona (RNR 15048)*: ₹2,650 - ₹2,750 / Quintal (Enumamula Mandi, Warangal)\n" +
             "• *Sona Masoori (BPT 5204)*: ₹2,200 - ₹2,350 / Qtl (Bowenpally Mandi, Secunderabad)\n" +
             "• *Premium Cotton*: ₹7,450 / Qtl\n" +
             "• *Nizamabad Turmeric*: ₹13,800 / Qtl\n" +
             "• *Red Gram (Tandur)*: ₹9,800 / Qtl\n\n" +
             "💡 *Tip:* Selling directly through KisanSaathi guarantees direct DBT settlement within 24 hours."
    },
    {
      keywords: ['pest', 'disease', 'spray', 'neem', 'fungus', 'leaf', 'worm', 'insect', 'organic', 'treatment', 'neemastra', 'aphid', 'borer'],
      reply: "*🌿 Organic Pest Management: Neemastra Formulation*\n\n" +
             "For stem borers, aphids, and whiteflies in paddy and cotton:\n" +
             "1. Take 5 kg fresh neem leaves, 5 liters cow urine, and 2 kg desi cow dung.\n" +
             "2. Ferment in a shaded container for 48 hours, stirring twice daily.\n" +
             "3. Filter through cloth. Spray *200 ml per 15L pump*.\n\n" +
             "✅ 100% organic, zero soil degradation, and saves ₹800/acre in pesticide expenses."
    },
    {
      keywords: ['insurance', 'pmfby', 'claim', 'loss', 'flood', 'rain', 'drought', 'damage', 'unseasonal'],
      reply: "*📋 PMFBY Crop Insurance & Disaster Relief*\n\n" +
             "If crops are damaged due to unseasonal rain, hail, or drought in Telangana:\n" +
             "• *Deadline:* File your claim within *72 hours* of incident.\n" +
             "• *Toll-Free Helpline:* 1800-180-1551 (Kisan Call Center)\n" +
             "• *PMFBY Support:* 1800-200-5142\n" +
             "• You can also report damage directly on the KisanSaathi portal with geotagged field photos."
    },
    {
      keywords: ['cluster', 'fpo', 'warangal', 'group', 'aggregation', 'transport', 'freight', 'truck', 'pool'],
      reply: "*📦 Warangal Agri-Cluster #12 (Shared Logistics)*\n\n" +
             "Connects 480+ smallholder farmers across Geesugonda, Atmakur, and Wardhannapet.\n" +
             "• Pooling sub-500kg batches reduces freight costs by *38%*.\n" +
             "• Unlocks direct wholesale contracts with Hyderabad food processors.\n" +
             "• Daily transport runs to Bowenpally and Enumamula Mandis."
    },
    {
      keywords: ['loan', 'credit', 'kcc', 'interest', 'money', 'bank', 'score', 'kisan credit'],
      reply: "*💳 Agri-Credit & Subsidized Crop Loans*\n\n" +
             "• *Pre-approved Limit:* Up to ₹3,00,000 crop loan via Telangana State Cooperative Bank.\n" +
             "• *Effective Interest Rate:* 4% subsidized annual rate (with prompt repayment).\n" +
             "• *Kisan Credit Score:* 785/900 based on verified harvest history and Soil Health records."
    },
    {
      keywords: ['soil', 'lab', 'testing', 'card', 'npk', 'ph', 'fertilizer', 'urea', 'dap'],
      reply: "*🧪 Telangana Soil Health Testing Labs*\n\n" +
             "Testing is *FREE* under the National Soil Health Card scheme:\n" +
             "• *Warangal:* RARS Mulugu Road & AMC Paidipally\n" +
             "• *Hyderabad:* PJTSAU Rajendranagar\n" +
             "• *Medchal:* Kandlakoi AMC\n" +
             "• *Nizamabad:* Shradhanand Gunj\n\n" +
             "Optimal pH for Telangana red sandy loams is 6.5 - 7.5."
    },
    {
      keywords: ['seed', 'variety', 'sona', 'rnr', 'bpt', 'paddy', 'masoori', 'red gram', 'seeds'],
      reply: "*🌱 Certified High-Yielding Seeds (PJTSAU)*\n\n" +
             "• *Telangana Sona (RNR 15048):* Low Glycemic Index (GI 51), high blast resistance.\n" +
             "• *Samba Mahsuri (BPT 5204):* Premium fine grain variety.\n" +
             "• *Tandur Red Gram:* GI-tagged pulse variety suited for drylands.\n" +
             "Certified seeds available at AMC Warangal & PJTSAU Seed Centers."
    },
    {
      keywords: ['rythu', 'bandhu', 'bharosa', 'scheme', 'subsidy', 'government', 'dbt'],
      reply: "*🏛️ Telangana Rythu Bharosa / Rythu Bandhu Scheme*\n\n" +
             "• Provides financial investment assistance of *₹10,000 per acre per year* directly into farmer DBT accounts.\n" +
             "• Verifiable via your Pattadar Passbook and Aadhaar link.\n" +
             "• For grievance status, contact your local Mandal Agricultural Officer (MAO)."
    }
  ],
  hi: [
    {
      keywords: ['भाव', 'rate', 'price', 'mandi', 'दाम', 'धान', 'कपास', 'हल्दी', 'बाजार', 'मंडी', 'रेट'],
      reply: "*🌾 आज के ताजा मंडी भाव (तेलंगाना मंडियां)*\n\n" +
             "• *तेलंगाना सोना धान (RNR 15048):* ₹2,650 - ₹2,750 / क्विंटल (एनाममुला मंडी, वारंगल)\n" +
             "• *सोना मसूरी (BPT 5204):* ₹2,200 - ₹2,350 / क्विंटल (बोवेनपल्ली मंडी, सिकंदराबाद)\n" +
             "• *उच्च गुणवत्ता कपास:* ₹7,450 / क्विंटल\n" +
             "• *निजामाबाद हल्दी:* ₹13,800 / क्विंटल\n\n" +
             "💡 *किसान साथी से सीधा बेचने पर 24 घंटे में बैंक खाते में DBT भुगतान प्राप्त होता है।*"
    },
    {
      keywords: ['कीटनाशक', 'pest', 'disease', 'neem', 'स्प्रे', 'रोग', 'कीड़ा', 'फफूंद', 'दवा', 'नीमास्त्र'],
      reply: "*🌿 जैविक कीटनाशक: नीमास्त्र बनाने की विधि*\n\n" +
             "धान और कपास में तना छेदक व रस चूसक कीड़ों की रोकथाम:\n" +
             "1. 5 किग्रा ताजा नीम के पत्ते, 5 लीटर गोमूत्र और 2 किग्रा देसी गाय का गोबर लें।\n" +
             "2. छायादार स्थान पर 48 घंटे सड़ाएं और दिन में 2 बार डंडे से घुमाएं।\n" +
             "3. कपड़े से छानकर *200 मिली प्रति 15 लीटर स्प्रे पंप* में छिड़कें।\n\n" +
             "✅ 100% जैविक सुरक्षा, मिट्टी को कोई नुकसान नहीं, प्रति एकड़ ₹800 की बचत।"
    },
    {
      keywords: ['बीमा', 'claim', 'pmfby', 'क्लेम', 'नुकसान', 'बारिश', 'मुआवजा', 'ओलावृष्टि', 'सूखा'],
      reply: "*📋 प्रधानमंत्री फसल बीमा योजना (PMFBY) सहायता*\n\n" +
             "बेमौसम बारिश या सूखे से फसल नुकसान होने पर:\n" +
             "• नुकसान के *72 घंटे* के भीतर क्लेम दर्ज कराना अनिवार्य है।\n" +
             "• *टोल-फ्री किसान कॉल सेंटर:* 1800-180-1551\n" +
             "• *PMFBY हेल्पलाइन:* 1800-200-5142\n" +
             "• किसान साथी पोर्टल पर भी खेत की फोटो अपलोड कर क्लेम सहायता पा सकते हैं।"
    },
    {
      keywords: ['क्लस्टर', 'cluster', 'वारंगल', 'समूह', 'fpo', 'गाड़ी', 'परिवहन', 'भाड़ा'],
      reply: "*📦 वारंगल एग्री-क्लस्टर #12 (साझा परिवहन)*\n\n" +
             "गीसुगोंडा, आत्माकुर और वर्धन्नापेट के 480+ किसानों का समूह:\n" +
             "• 500 किग्रा से कम फसल को साझा गाड़ी से भेजने पर भाड़े में *38% की बचत* होती है।\n" +
             "• हैदराबाद के बड़े व्यापारियों से सीधा कांट्रैक्ट मिलता है।"
    },
    {
      keywords: ['ऋण', 'kcc', 'क्रेडिट', 'लोन', 'पैसा', 'बैंक', 'स्कोर', 'ब्याज'],
      reply: "*💳 किसान क्रेडिट एवं 4% फसली ऋण*\n\n" +
             "• फसल रिकॉर्ड और सॉइल हेल्थ के आधार पर क्रेडिट स्कोर: *785/900*।\n" +
             "• तेलंगाना राज्य सहकारी बैंक से *4% रियायती ब्याज दर* पर ₹3,00,000 तक का फसली ऋण उपलब्ध है।"
    },
    {
      keywords: ['मिट्टी', 'मृदा', 'soil', 'जांच', 'लैब', 'एनपीके', 'पीएच', 'खाद', 'यूरिया'],
      reply: "*🧪 सरकारी मृदा परीक्षण प्रयोगशालाएं (निःशुल्क)*\n\n" +
             "सॉइल हेल्थ कार्ड योजना के तहत जांच मुफ्त है:\n" +
             "• *वारंगल:* RARS मुलुगु रोड एवं AMC पैडीपल्ली\n" +
             "• *हैदराबाद:* PJTSAU राजेंद्रनगर\n" +
             "• *मेदचल:* कंदलाकोयी AMC\n" +
             "• *निजामाबाद:* श्रद्धानंद गंज"
    },
    {
      keywords: ['बीज', 'किस्म', 'सोना', 'rnr', 'धान', 'वैरायटी', 'चना'],
      reply: "*🌱 प्रमाणित उन्नत बीज किस्में (PJTSAU)*\n\n" +
             "• *तेलंगाना सोना (RNR 15048):* कम ग्लाइसेमिक इंडेक्स (GI 51), ब्लास्ट रोग प्रतिरोधी।\n" +
             "• *सांभा महसूरी (BPT 5204):* महीन चावल की लोकप्रिय किस्म।\n" +
             "• *तांदूर लाल चना (GI टैग):* कम पानी में अधिक उपज।"
    },
    {
      keywords: ['रायथू', 'बंधु', 'भरोसा', 'योजना', 'सब्सिडी', 'सरकारी', 'dbt'],
      reply: "*🏛️ तेलंगाना रायथू भरोसा / रायथू बंधु योजना*\n\n" +
             "• किसानों को प्रति एकड़ *₹10,000 प्रति वर्ष* की प्रत्यक्ष निवेश सहायता (DBT) दी जाती है।\n" +
             "• स्थिति जांचने के लिए अपने पट्टा पासबुक एवं आधार लिंक का उपयोग करें।"
    }
  ],
  te: [
    {
      keywords: ['రేటు', 'ధర', 'మండి', 'ధాన్యం', 'వరి', 'పత్తి', 'పసుపు', 'రేట్లు', 'ధరలు', 'rate', 'price', 'mandi'],
      reply: "*🌾 ఈరోజు మండి ధరలు (తెలంగాణ మండీలు)*\n\n" +
             "• *తెలంగాణ సోనా (RNR 15048):* క్వింటాలుకు ₹2,650 - ₹2,750 (ఎనుమాముల మండి, వరంగల్)\n" +
             "• *సోనా మసూరి (BPT 5204):* క్వింటాలుకు ₹2,200 - ₹2,350 (బోవెన్‌పల్లి మండి, సికింద్రాబాద్)\n" +
             "• *ఉత్తమ పత్తి (Cotton):* క్వింటాలుకు ₹7,450\n" +
             "• *నిజామాబాద్ పసుపు:* క్వింటాలుకు ₹13,800\n" +
             "• *తాండూర్ కంది:* క్వింటాలుకు ₹9,800\n\n" +
             "💡 *కిసాన్ సాథి ద్వారా నేరుగా విక్రయిస్తే 24 గంటల్లో DBT ద్వారా బ్యాంకు ఖాతాలో జమ అవుతుంది.*"
    },
    {
      keywords: ['పురుగు', 'తెగులు', 'స్ప్రే', 'వేప', 'నీమాస్త్రం', 'మందు', 'సేంద్రీయ', 'pest', 'spray', 'neem'],
      reply: "*🌿 సేంద్రీయ పురుగుమందు: నీమాస్త్రం తయారీ విధానం*\n\n" +
             "వరి మరియు పత్తిలో కాండం తొలుచు పురుగు, రసం పీల్చే పురుగుల నివారణకు:\n" +
             "1. 5 కిలోల తాజా వేప ఆకులు, 5 లీటర్ల ఆవు మూత్రం, 2 కిలోల దేశీ ఆవు పేడ.\n" +
             "2. నీడలో 48 గంటలు పులియబెట్టి, రోజుకు 2 సార్లు కర్రతో కలపండి.\n" +
             "3. వడకట్టి, *15 లీటర్ల స్ప్రే పంపుకు 200 మి.లీ* కలిపి పిచికారీ చేయండి.\n\n" +
             "✅ 100% సేంద్రీయ రక్షణ, ఎకరానికి ₹800 పురుగుమందుల ఖర్చు ఆదా."
    },
    {
      keywords: ['బీమా', 'క్లెయిమ్', 'నష్టం', 'వర్షం', 'వరద', 'pmfby', 'insurance', 'claim'],
      reply: "*📋 ప్రధానమంత్రి ఫసల్ బీమా యోజన (PMFBY)*\n\n" +
             "అకాల వర్షాలు లేదా తెగుళ్ల వల్ల పంట నష్టం జరిగితే:\n" +
             "• నష్టం జరిగిన *72 గంటల్లోపు* క్లెయిమ్ నమోదు చేయాలి.\n" +
             "• *టోల్ ఫ్రీ కిసాన్ కాల్ సెంటర్:* 1800-180-1551\n" +
             "• *PMFBY హెల్ప్‌లైన్:* 1800-200-5142\n" +
             "• కిసాన్ సాథి పోర్టల్ ద్వారా పొలం ఫోటో అప్‌లోడ్ చేసి కూడా క్లెయిమ్ చేయవచ్చు."
    },
    {
      keywords: ['రుణం', 'లోన్', 'వడ్డీ', 'క్రెడిట్', 'బ్యాంకు', 'స్కోర్', 'డబ్బు', 'loan', 'credit', 'kcc'],
      reply: "*💳 కిసాన్ క్రెడిట్ మరియు 4% సబ్సిడీ పంట రుణం*\n\n" +
             "• మీ పంట రికార్డు ఆధారంగా క్రెడిట్ స్కోర్: *785/900*.\n" +
             "• తెలంగాణ రాష్ట్ర సహకార బ్యాంకు (TSCAB) ద్వారా *4% రాయితీ వడ్డీతో* ₹3,00,000 వరకు తక్షణ పంట రుణం పొందవచ్చు."
    },
    {
      keywords: ['నేల', 'మట్టి', 'పరీక్ష', 'ల్యాబ్', 'ఎరువులు', 'యూరియా', 'soil', 'lab'],
      reply: "*🧪 ఉచిత నేల ఆరోగ్య పరీక్ష కేంద్రాలు (తెలంగాణ)*\n\n" +
             "నేల ఆరోగ్య కార్డు పథకం కింద పరీక్ష ఉచితం:\n" +
             "• *వరంగల్:* RARS ములుగు రోడ్డు మరియు AMC పైడిపల్లి\n" +
             "• *హైదరాబాద్:* PJTSAU రాజేంద్రనగర్\n" +
             "• *మేడ్చల్:* కండ్లకోయి AMC\n" +
             "• *నిజామాబాద్:* శ్రద్ధానంద్ గంజ్\n\n" +
             "తెలంగాణ ఎర్ర నేలలకు 6.5 నుండి 7.5 pH అనుకూలం."
    },
    {
      keywords: ['విత్తనాలు', 'రకాలు', 'సోనా', 'rnr', 'వరి', 'seeds', 'variety'],
      reply: "*🌱 ధృవీకరించబడిన విత్తన రకాలు (PJTSAU)*\n\n" +
             "• *తెలంగాణ సోనా (RNR 15048):* తక్కువ గ్లైసెమిక్ ఇండెక్స్ (GI 51), అగ్గి తెగులు తట్టుకుంటుంది.\n" +
             "• *సాంబా మసూరి (BPT 5204):* సన్న బియ్యం రకం.\n" +
             "• *తాండూర్ కంది (GI ట్యాగ్):* వర్షాధార నేలలకు అనువైన రకం."
    },
    {
      keywords: ['రైతు', 'బంధు', 'భరోసా', 'పథకం', 'సబ్సిడీ', 'rythu', 'bandhu', 'bharosa'],
      reply: "*🏛️ తెలంగాణ రైతు భరోసా / రైతు బంధు పథకం*\n\n" +
             "• రైతులకు ఎకరానికి ఏటా *₹10,000* పెట్టుబడి సహాయం నేరుగా బ్యాంక్ ఖాతాల్లో (DBT) జమ చేయబడుతుంది.\n" +
             "• మీ పట్టాదారు పాస్‌బుక్ వివరాలతో స్థితిని తనిఖీ చేసుకోండి."
    }
  ]
};

// Quick Greeting Templates
const GREETINGS = {
  en: (name) => `🌾 *Namaste ${name || 'Farmer Friend'}!* Welcome to *KisanSaathi AI Assistant* (Telangana).\n\n` +
                "How can I help you today? You can ask me about:\n" +
                "• *Mandi Rates* (Warangal Enumamula, Hyderabad Bowenpally)\n" +
                "• *Organic Pest Sprays* (Neemastra recipe)\n" +
                "• *PMFBY Crop Insurance* (Damage claims within 72 hrs)\n" +
                "• *Subsidized 4% Crop Loans* & Soil Health Testing\n" +
                "• *Telangana Sona Seeds* & Rythu Bharosa\n\n" +
                "Just reply with your query in English, Hindi, or Telugu!",
  hi: (name) => `🌾 *नमस्ते ${name || 'किसान साथी'}!* *किसान साथी AI सहायक* (तेलंगाना) में आपका स्वागत है।\n\n` +
                "आज मैं आपकी क्या सहायता कर सकता हूँ? आप पूछ सकते हैं:\n" +
                "• *ताजा मंडी भाव* (वारंगल एनाममुला, बोवेनपल्ली)\n" +
                "• *जैविक कीटनाशक* (नीमास्त्र बनाने की विधि)\n" +
                "• *फसल बीमा क्लेम* (PMFBY 72 घंटे में सूचना)\n" +
                "• *4% फसली ऋण (KCC)* एवं निःशुल्क मिट्टी जांच\n" +
                "• *तेलंगाना सोना बीज* एवं रायथू भरोसा योजना\n\n" +
                "कृपया अपना प्रश्न हिंदी या अंग्रेजी में लिखकर भेजें!",
  te: (name) => `🌾 *నమస్కారం ${name || 'రైతు మిత్రమా'}!* *కిసాన్ సాథి AI సహాయకుడికి* స్వాగతం (తెలంగాణ).\n\n` +
                "నేను మీకు ఎలా సహాయపడగలను? మీరు వీటి గురించి అడగవచ్చు:\n" +
                "• *తాజా మండి ధరలు* (వరంగల్ ఎనుమాముల, హైదరాబాద్ బోవెన్‌పల్లి)\n" +
                "• *సేంద్రీయ పురుగుమందు* (నీమాస్త్రం తయారీ విధానం)\n" +
                "• *PMFBY పంట బీమా* (72 గంటల్లో క్లెయిమ్ నమోదు)\n" +
                "• *4% సబ్సిడీ పంట రుణం* & ఉచిత నేల పరీక్ష కేంద్రాలు\n" +
                "• *తెలంగాణ సోనా విత్తనాలు* & రైతు భరోసా పథకం\n\n" +
                "మీ ప్రశ్నను తెలుగు, హిందీ లేదా ఇంగ్లీషులో పంపండి!"
};

// General fallback advisories
const FALLBACKS = {
  en: "🌾 *KisanSaathi AI Advisory*\n\n" +
      "Thank you for reaching out! To give you the most accurate agricultural advisory for Telangana, could you please specify if your query relates to:\n" +
      "1. *Mandi Rates* (e.g. 'Paddy price in Warangal')\n" +
      "2. *Pest & Disease Control* (e.g. 'Organic spray for stem borer')\n" +
      "3. *PMFBY Crop Insurance Claims*\n" +
      "4. *Soil Testing Labs or Seeds*\n\n" +
      "📞 *Kisan Call Center (Toll-Free):* 1800-180-1551",
  hi: "🌾 *किसान साथी कृषि सलाह*\n\n" +
      "आपके प्रश्न के लिए धन्यवाद! तेलंगाना की कृषि सलाह हेतु कृपया बताएं कि आपका प्रश्न किस विषय पर है:\n" +
      "1. *मंडी भाव* (जैसे 'वारंगल में धान का रेट')\n" +
      "2. *कीटनाशक व रोग नियंत्रण* (जैसे 'नीमास्त्र स्प्रे')\n" +
      "3. *फसल बीमा क्लेम*\n" +
      "4. *मिट्टी जांच या बीज किस्में*\n\n" +
      "📞 *टोल-फ्री किसान कॉल सेंटर:* 1800-180-1551",
  te: "🌾 *కిసాన్ సాథి వ్యవసాయ సలహా*\n\n" +
      "మీ సందేశానికి ధన్యవాదాలు! తెలంగాణ వ్యవసాయ సలహా కోసం దయచేసి మీ ప్రశ్న దేనికి సంబంధించినదో తెలపండి:\n" +
      "1. *మండి ధరలు* (ఉదా: 'వరి ధర ఎంత')\n" +
      "2. *తెగుళ్ల నివారణ* (ఉదా: 'నీమాస్త్రం స్ప్రే')\n" +
      "3. *PMFBY పంట బీమా క్లెయిమ్*\n" +
      "4. *నేల పరీక్ష లేదా విత్తన రకాలు*\n\n" +
      "📞 *టోల్-ఫ్రీ కిసాన్ కాల్ సెంటర్:* 1800-180-1551"
};

/**
 * Detect language of incoming message
 */
function detectLanguage(text) {
  // Contains Telugu Unicode range
  if (/[\u0C00-\u0C7F]/.test(text)) {
    return 'te';
  }
  // Contains Devanagari Unicode range
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }
  const lower = (text || '').toLowerCase().trim();
  const teluguPhrases = ['dharalu', 'mandi dharalu', 'enta', 'ela cheyali', 'neemastram', 'namaskaram', 'telangana sona', 'pasupu'];
  if (teluguPhrases.some(p => lower.includes(p))) {
    return 'te';
  }
  const hindiPhrases = ['kya hai', 'bhav kya', 'kaise banaye', 'kripya', 'namaskar', 'kitna hai', 'bataye', 'bataiye', 'keeda'];
  if (hindiPhrases.some(p => lower.includes(p))) {
    return 'hi';
  }
  return 'en';
}

/**
 * Check if the query is a friendly greeting or menu request
 */
function isGreeting(text) {
  const clean = (text || '').toLowerCase().trim().replace(/[^\w\s]/g, '');
  const greetingWords = ['hi', 'hello', 'hey', 'namaste', 'namaskar', 'start', 'help', 'menu', 'kisan', 'kisaan', 'test', 'info'];
  return greetingWords.includes(clean) || (clean.length > 0 && clean.length <= 3 && !['rate', 'crop', 'pest', 'seed', 'urea'].includes(clean));
}

/**
 * Optional: Call Google Gemini API if GEMINI_API_KEY is configured
 */
function callGeminiAPI(apiKey, prompt, lang, profileName, model = 'gemini-1.5-flash') {
  return new Promise((resolve, reject) => {
    const systemPrompt = `You are KisanSaathi AI, an expert agricultural assistant specifically dedicated to Telangana farmers (districts: Warangal, Hyderabad, Secunderabad, Medchal, Nizamabad).
The farmer's name is "${profileName || 'Farmer'}".
Key Knowledge:
- Telangana Sona (RNR 15048) Paddy: ₹2,650 - ₹2,750 / Quintal.
- Sona Masoori (BPT 5204): ₹2,200 - ₹2,350 / Quintal.
- Warangal Enumamula Mandi & Bowenpally Mandi prices.
- Organic Neemastra: 5kg neem leaves, 5L cow urine, 2kg desi cow dung fermented 48 hrs, spray 200ml/15L pump.
- PMFBY Crop Insurance: File claim within 72 hours, toll-free 1800-180-1551.
- Warangal Agri-Cluster #12: 38% logistics savings.
- Agri-Credit score 785/900: 4% subsidized crop loan pre-approved up to ₹3,00,000 via TSCAB.
- Soil Health Card labs: Warangal RARS, PJTSAU Rajendranagar, Kandlakoi AMC.
- Rythu Bharosa / Rythu Bandhu: ₹10,000/acre/year DBT.
Format instructions:
- Output with clear headings, bullet points, and practical steps.
- Keep response helpful, concise and well structured (under 1200 characters).
- Tone: Respectful, practical, clear, encouraging.
- Language: Respond in ${lang === 'te' ? 'Telugu (తెలుగు)' : (lang === 'hi' ? 'Hindi (Devanagari)' : 'English')}.
- Always end with Kisan Call Center Helpline: 1800-180-1551.`;

    const payload = JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\nFarmer Query: ${prompt}` }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.3
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(data);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim()) {
              return resolve(text.trim());
            }
          }
          reject(new Error(`Gemini API (${model}) returned status ${res.statusCode}: ${data.slice(0, 150)}`));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Gemini API (${model}) request timed out`));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.8-flash'
];

/**
 * Call Gemini with multi-model fallback across available Google AI models
 */
async function callGeminiWithFallback(apiKey, prompt, lang, profileName) {
  let lastError = null;
  for (const model of GEMINI_MODELS) {
    try {
      const result = await callGeminiAPI(apiKey, prompt, lang, profileName, model);
      if (result) {
        return { text: result, model };
      }
    } catch (err) {
      lastError = err;
      console.warn(`[KisanAI] Model ${model} notice:`, err.message);
    }
  }
  throw lastError || new Error('All candidate Gemini models exhausted');
}

/**
 * Optional: Call OpenAI API if OPENAI_API_KEY is configured
 */
function callOpenAIAPI(apiKey, prompt, lang, profileName) {
  return new Promise((resolve, reject) => {
    const systemPrompt = `You are KisanSaathi AI, an expert agricultural assistant dedicated to Telangana farmers.
Farmer's name: "${profileName || 'Farmer'}".
Provide accurate Telangana farming advisory (Mandi rates in Enumamula/Bowenpally, Organic Neemastra spray, PMFBY insurance 72h, 4% crop loan, Rythu Bharosa).
Respond in ${lang === 'te' ? 'Telugu' : (lang === 'hi' ? 'Hindi' : 'English')} with WhatsApp markdown (*bold*, bullets), max 1200 chars. Helpline: 1800-180-1551.`;

    const payload = JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 7000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(data);
            const text = parsed?.choices?.[0]?.message?.content;
            if (text && text.trim()) {
              return resolve(text.trim());
            }
          }
          reject(new Error(`OpenAI API status ${res.statusCode}`));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('OpenAI API request timed out'));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Parse incoming HTTP request body safely
 */
async function parseRequestBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (_e) {
      return {};
    }
  }
  return new Promise((resolve) => {
    let rawData = '';
    req.on('data', chunk => { rawData += chunk; });
    req.on('end', () => {
      try {
        resolve(rawData ? JSON.parse(rawData) : {});
      } catch (_e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

/**
 * Primary KisanSaathi AI Response Generator
 * Resolves farmer queries using Telangana Knowledge Engine with optional Gemini LLM enhancement
 */
async function getKisanAiResponse(rawMessage, { profileName = '', fromNumber = '', customApiKey = '', preferredLanguage = '' } = {}) {
  const query = (rawMessage || '').trim();
  const lang = preferredLanguage || detectLanguage(query);

  // 1. Check for greetings or menu commands
  if (!query || isGreeting(query)) {
    const greetingFunc = GREETINGS[lang] || GREETINGS.en;
    return greetingFunc(profileName);
  }

  // 2. Check for optional Gemini LLM enhancement (customApiKey or process.env.GEMINI_API_KEY)
  const geminiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const geminiReply = await callGeminiWithFallback(geminiKey, query, lang, profileName);
      if (geminiReply && geminiReply.text) return geminiReply.text;
    } catch (err) {
      console.warn('[KisanAI] Gemini API failed, falling back to core knowledge engine:', err.message);
    }
  } else if (process.env.OPENAI_API_KEY) {
    try {
      const openaiReply = await callOpenAIAPI(process.env.OPENAI_API_KEY, query, lang, profileName);
      if (openaiReply) return openaiReply;
    } catch (err) {
      console.warn('[KisanAI] OpenAI API failed, falling back to core knowledge engine:', err.message);
    }
  }

  // 3. Core Knowledge Base Search
  const lower = query.toLowerCase();
  const primaryList = KISAN_KNOWLEDGE[lang] || KISAN_KNOWLEDGE.en;
  for (const item of primaryList) {
    if (item.keywords.some(k => lower.includes(k.toLowerCase()))) {
      return `${item.reply}\n\n📞 *Kisan Helpline:* 1800-180-1551`;
    }
  }

  // 4. Cross-language search (e.g. Hindi user typing English keyword like 'rate' or vice-versa)
  const secondaryLang = lang === 'en' ? 'hi' : 'en';
  const secondaryList = KISAN_KNOWLEDGE[secondaryLang] || [];
  for (const item of secondaryList) {
    if (item.keywords.some(k => lower.includes(k.toLowerCase()))) {
      return `${item.reply}\n\n📞 *Kisan Helpline:* 1800-180-1551`;
    }
  }

  // 5. Fallback response with guidance
  const fallback = FALLBACKS[lang] || FALLBACKS.en;
  return fallback;
}

/**
 * Vercel Serverless Function & Local Dev Handler
 * Route: /api/kisan-ai
 * Methods: GET (Health & Status), POST (Farmer Query with Gemini AI)
 */
async function kisanAiHandler(req, res) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-key');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const serverGeminiConfigured = Boolean(process.env.GEMINI_API_KEY);

  // 1. GET: Status and diagnostic endpoint
  if (req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      status: 'active',
      service: 'KisanSaathi AI Assistant API',
      version: '3.5.0',
      gemini: {
        configured: serverGeminiConfigured,
        model: 'gemini-1.5-flash',
        fallbackModel: 'gemini-2.0-flash'
      },
      supportedLanguages: ['en', 'hi', 'te'],
      region: 'Telangana',
      timestamp: new Date().toISOString()
    }, null, 2));
  }

  // 2. Only allow POST for queries
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method Not Allowed', allowed: ['GET', 'POST'] }));
  }

  try {
    const body = await parseRequestBody(req);
    const message = (body.message || body.query || '').trim();
    const profileName = body.profileName || body.farmerName || '';
    const preferredLang = body.language || body.lang || '';
    const headers = req.headers || {};
    const customKey = (body.apiKey || headers['x-gemini-key'] || '').trim();

    const activeGeminiKey = customKey || process.env.GEMINI_API_KEY || '';

    let reply = '';
    let provider = 'knowledge_base';

    if (activeGeminiKey) {
      const lang = preferredLang || detectLanguage(message);
      if (!message || isGreeting(message)) {
        const greetingFunc = GREETINGS[lang] || GREETINGS.en;
        reply = greetingFunc(profileName);
        provider = 'greeting';
      } else {
        try {
          const geminiResult = await callGeminiWithFallback(activeGeminiKey, message, lang, profileName);
          reply = geminiResult.text;
          provider = geminiResult.model;
        } catch (err) {
          console.warn('[KisanAI API] Gemini call error:', err.message);
          reply = await getKisanAiResponse(message, { profileName, preferredLanguage: lang });
          provider = 'core_knowledge_fallback';
        }
      }
    } else {
      reply = await getKisanAiResponse(message, { profileName, preferredLanguage: preferredLang });
      provider = 'core_knowledge';
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      reply,
      provider,
      geminiConnected: provider.startsWith('gemini'),
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('[KisanAI Handler Error]', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      error: error.message,
      reply: 'An error occurred while connecting to KisanSaathi AI. Please contact the Telangana Kisan Call Center: 1800-180-1551.'
    }));
  }
}

// Support both serverless invocation (default export) and module imports
module.exports = kisanAiHandler;
module.exports.kisanAiHandler = kisanAiHandler;
module.exports.getKisanAiResponse = getKisanAiResponse;
module.exports.detectLanguage = detectLanguage;
module.exports.isGreeting = isGreeting;
module.exports.callGeminiAPI = callGeminiAPI;
module.exports.callGeminiWithFallback = callGeminiWithFallback;
module.exports.KISAN_KNOWLEDGE = KISAN_KNOWLEDGE;
