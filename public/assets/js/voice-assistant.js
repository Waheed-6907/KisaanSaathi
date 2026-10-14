/**
 * KisanSaathi: Comprehensive Multilingual Voice Assistant & Voice Navigation System
 * Natural Spoken Commands in: Telugu, Hindi, Urdu, English
 * Automatic Language Detection, Persistent Floating Mic, Page Read-Aloud, and Form Filling Safety
 */

(function (window, document) {
  'use strict';

  // 1. Language Configurations & Conversational Feedback
  const VOICE_ASSISTANT_CONFIG = {
    te: {
      langCode: 'te-IN',
      langName: 'తెలుగు (Telugu)',
      listeningPrompt: 'వింటున్నాను... మీ ప్రశ్న లేదా పేజీ పేరు చెప్పండి',
      readyPrompt: 'మాట్లాడటానికి మైక్ నొక్కండి',
      processingPrompt: 'ఆలోచిస్తోంది...',
      speakingPrompt: 'సమాధానం చెబుతున్నాను...',
      micDenied: 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి సెట్టింగ్స్‌లో మైక్ అనుమతించండి.',
      noSpeech: 'ఏ శబ్దమూ వినపడలేదు. దయచేసి మళ్లీ మాట్లాడండి.',
      unsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు. దయచేసి Chrome లేదా కింద ఉన్న బటన్లను వాడండి.',
      readPageTitle: 'ఈ పేజీ సారాంశం చదువుతున్నాను:',
      confirmActionPrompt: 'మీరు ఈ సమాచారాన్ని ధృవీకరిస్తున్నారా? దయచేసి బటన్ నొక్కండి.',
      quickCommands: [
        { label: '📦 నా పంటల ఇన్వెంటరీ', cmd: 'నా పంటల ఇన్వెంటరీ తెరవండి' },
        { label: '📈 నేటి మార్కెట్ ధరలు', cmd: 'ఈరోజు మార్కెట్ ధరలు చూపించు' },
        { label: '➕ కొత్త పంట జోడించండి', cmd: 'కొత్త పంట జోడించండి' },
        { label: '🤝 ధర సంప్రదింపులు', cmd: 'ధర సంప్రదింపులు తెరవండి' },
        { label: '💰 నా వాలెట్ & సంపాదన', cmd: 'నా వాలెట్ చూపించు' },
        { label: '📢 ఈ పేజీ చదవండి', cmd: 'ఈ పేజీని చదవండి' }
      ]
    },

    hi: {
      langCode: 'hi-IN',
      langName: 'हिंदी (Hindi)',
      listeningPrompt: 'सुन रहा हूँ... अपना सवाल या पेज का नाम बोलें',
      readyPrompt: 'बोलने के लिए माइक दबाएं',
      processingPrompt: 'सोच रहा है...',
      speakingPrompt: 'उत्तर सुना रहा हूँ...',
      micDenied: 'माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक ऑन करें।',
      noSpeech: 'कोई आवाज़ नहीं आई। कृपया माइक दबाकर दोबारा बोलें।',
      unsupported: 'इस ब्राउज़र में वॉयस इनपुट समर्थित नहीं है। कृपया Chrome या नीचे दिए गए बटन का उपयोग करें।',
      readPageTitle: 'इस पेज का विवरण पढ़कर सुना रहा हूँ:',
      confirmActionPrompt: 'क्या आप इस जानकारी की पुष्टि करते हैं? कृपया स्क्रीन पर बटन दबाएं।',
      quickCommands: [
        { label: '📦 मेरी फसल इन्वेंटरी', cmd: 'मेरी इन्वेंटरी खोलो' },
        { label: '📈 आज के मंडी भाव', cmd: 'आज के मंडी भाव दिखाओ' },
        { label: '➕ नई फसल जोड़ें', cmd: 'नई फसल बिक्री के लिए जोड़ें' },
        { label: '🤝 खरीदार बातचीत', cmd: 'मूल्य बातचीत दिखाओ' },
        { label: '💰 किसान बटुआ / वॉलेट', cmd: 'मेरा वॉलेट दिखाओ' },
        { label: '📢 यह पेज पढ़कर सुनाएं', cmd: 'यह पेज पढ़कर सुनाओ' }
      ]
    },

    ur: {
      langCode: 'ur-IN',
      langName: 'اردو (Urdu)',
      listeningPrompt: 'سن رہا ہوں... اپنا سوال یا صفحہ کا نام بولیں',
      readyPrompt: 'بولنے کے لیے مائیک دبائیں',
      processingPrompt: 'سوچ رہا ہے...',
      speakingPrompt: 'جواب سنا رہا ہوں...',
      micDenied: 'مائیکروفون کی اجازت نہیں ملی۔ براہ کرم براؤزر کی سیٹنگز میں مائیک آن کریں۔',
      noSpeech: 'کوئی آواز سنائی نہیں دی۔ براہ کرم دوبارہ بولیں۔',
      unsupported: 'اس براؤزر میں وائس ان پٹ کی سہولت نہیں ہے۔ براہ کرم Chrome استعمال کریں۔',
      readPageTitle: 'اس صفحے کا خلاصہ پڑھ کر سنا رہا ہوں:',
      confirmActionPrompt: 'کیا آپ اس تفصیل کی تصدیق کرتے ہیں؟ براہ کرم اسکرین پر بٹن دبائیں۔',
      quickCommands: [
        { label: '📦 میری فصلوں کی فہرست', cmd: 'میری انوینٹری کھولیں' },
        { label: '📈 منڈی کے ریٹس', cmd: 'آج کے منڈی کے ریٹس دکھائیں' },
        { label: '➕ نئی فصل شامل کریں', cmd: 'نئی فصل شامل کریں' },
        { label: '🤝 خریداروں کی تجاویز', cmd: 'قیمتوں کے مذاکرات دکھائیں' },
        { label: '💰 کسان بٹوہ (والٹ)', cmd: 'میرا والٹ کھولیں' },
        { label: '📢 یہ صفحہ پڑھیں', cmd: 'یہ صفحہ پڑھ کر سنائیں' }
      ]
    },

    en: {
      langCode: 'en-IN',
      langName: 'English',
      listeningPrompt: 'Listening... Speak a command or page name',
      readyPrompt: 'Tap microphone to speak',
      processingPrompt: 'Processing command...',
      speakingPrompt: 'Speaking response...',
      micDenied: 'Microphone permission denied. Please allow microphone access in settings.',
      noSpeech: 'No speech detected. Please tap the microphone and speak again.',
      unsupported: 'Voice input is not supported in this browser. Please use Google Chrome or Edge.',
      readPageTitle: 'Reading page summary aloud:',
      confirmActionPrompt: 'Please confirm this consequential action by tapping the button.',
      quickCommands: [
        { label: '📦 Open Inventory', cmd: 'Open my inventory' },
        { label: '📈 Today Mandi Prices', cmd: 'Show today mandi prices' },
        { label: '➕ Add New Crop', cmd: 'Add a new crop' },
        { label: '🤝 Negotiations Desk', cmd: 'Open price negotiations' },
        { label: '💰 Earnings Wallet', cmd: 'Open my wallet' },
        { label: '📢 Read This Page', cmd: 'Read this page aloud' }
      ]
    }
  };

  // 2. Assistant State
  let activeLang = localStorage.getItem('kisan_lang') || 'te';
  let isListening = false;
  let isSpeaking = false;
  let recognitionInstance = null;
  let currentUtterance = null;
  let isMuted = localStorage.getItem('kisan_voice_muted') === 'true';
  let speechRate = parseFloat(localStorage.getItem('kisan_voice_rate')) || 0.95;
  let lastSpokenText = '';

  // 3. Automatic Language Detector from Transcript Script & Phonetics
  function detectSpokenLanguage(transcript) {
    if (!transcript) return activeLang;
    const text = transcript.trim();

    // 1. Unicode Script Range checks
    const hasTelugu = /[\u0C00-\u0C7F]/.test(text);
    if (hasTelugu) return 'te';

    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    if (hasDevanagari) return 'hi';

    const hasUrduArabic = /[\u0600-\u06FF]/.test(text);
    if (hasUrduArabic) return 'ur';

    // 2. Transliteration / Romanized Phonetic hints
    const lower = text.toLowerCase();
    if (lower.includes('kholo') || lower.includes('dikhao') || lower.includes('bhav') || lower.includes('daam') || lower.includes('fasal') || lower.includes('jodo')) {
      return 'hi';
    }
    if (lower.includes('teravandi') || lower.includes('chupinchu') || lower.includes('dharalu') || lower.includes('panta') || lower.includes('cheyandi')) {
      return 'te';
    }
    if (lower.includes('kholein') || lower.includes('kholiye') || lower.includes('bataiye') || lower.includes('shamil')) {
      return 'ur';
    }

    // Default to active selected language
    return activeLang || 'en';
  }

  // 4. Centralized Command Registry
  const COMMAND_REGISTRY = [
    // Dashboard / Inventory
    {
      action: 'inventory',
      patterns: [
        'inventory', 'crop', 'crops', 'stock', 'harvest', 'dashboard', 'home',
        'ఇన్వెంటరీ', 'పంటలు', 'స్టాక్', 'ధాన్యం', 'హోమ్',
        'इन्वेंटरी', 'फसल', 'स्टॉक', 'डैशबोर्ड', 'होम',
        'انوینٹری', 'فصلیں', 'اسٹاک', 'ڈیش بورڈ', 'ہوم'
      ],
      execute: () => {
        if (typeof window.navigateTo === 'function') window.navigateTo('inventory');
        return {
          te: 'మీ పంట నిల్వల ఇన్వెంటరీ తెరవబడింది.',
          hi: 'आपकी फसल इन्वेंटरी खोल दी गई है।',
          ur: 'آپ کی فصلوں کی انوینٹری کھول دی گئی ہے۔',
          en: 'Opening your farmer inventory.'
        };
      }
    },

    // Add Crop to Sell
    {
      action: 'upload',
      patterns: [
        'add crop', 'sell crop', 'upload', 'new crop', 'list crop', 'add produce',
        'కొత్త పంట', 'పంట జోడించండి', 'అమ్మకం', 'అప్‌లోడ్',
        'नई फसल', 'फसल जोड़ें', 'बेचें', 'अपलोड',
        'نئی فصل', 'فصل شامل کریں', 'فروخت', 'اپ لوڈ'
      ],
      execute: () => {
        if (typeof window.navigateTo === 'function') window.navigateTo('upload');
        return {
          te: 'కొత్త పంటను అమ్మకానికి జోడించే పేజీ తెరవబడింది.',
          hi: 'नई फसल बिक्री हेतु जोड़ने का पेज खोल दिया गया है।',
          ur: 'نئی فصل فروخت کیلئے شامل کرنے کا صفحہ کھول دیا گیا ہے۔',
          en: 'Opening Add Crop to Sell page.'
        };
      }
    },

    // Daily Market Prices
    {
      action: 'market-dashboard',
      patterns: [
        'mandi', 'market', 'price', 'prices', 'rate', 'rates', 'today price', 'market price',
        'మార్కెట్', 'మండి', 'ధరలు', 'రేట్లు', 'ఈరోజు ధర',
        'मंडी', 'बाजार', 'भाव', 'रेट', 'दाम', 'आज का भाव',
        'منڈی', 'مارکیٹ', 'بھاؤ', 'ریٹ', 'قیمت'
      ],
      execute: () => {
        if (typeof window.navigateTo === 'function') window.navigateTo('market-dashboard');
        return {
          te: 'తెలంగాణ రోజువారీ మార్కెట్ ధరల పేజీ తెరవబడింది.',
          hi: 'तेलंगाना दैनिक मंडी भाव पेज खोल दिया गया है।',
          ur: 'تلنگانہ روزانہ منڈی کے بھاؤ کا صفحہ کھول دیا گیا ہے۔',
          en: 'Opening Daily Market Prices dashboard.'
        };
      }
    },

    // Price Negotiations
    {
      action: 'negotiate',
      patterns: [
        'negotiate', 'negotiation', 'negotiations', 'offer', 'offers', 'buyer offer', 'deal', 'bargain',
        'సంప్రదింపులు', 'బేరం', 'ఆఫర్లు', 'కొనుగోలుదారు',
        'बातचीत', 'सौदा', 'ऑफर', 'मोलभाव',
        'مذاکرات', 'سودا', 'آفرز', 'خریدار'
      ],
      execute: () => {
        if (typeof window.navigateTo === 'function') window.navigateTo('negotiate');
        return {
          te: 'కొనుగోలుదారులతో ధర సంప్రదింపుల పేజీ తెరవబడింది.',
          hi: 'खरीदारों के साथ मूल्य बातचीत का पेज खोल दिया गया है।',
          ur: 'خریداروں کے ساتھ قیمتوں کے مذاکرات کا صفحہ کھول دیا گیا ہے۔',
          en: 'Opening Price Negotiations desk.'
        };
      }
    },

    // Orders & Deliveries
    {
      action: 'orders',
      patterns: [
        'order', 'orders', 'delivery', 'deliveries', 'dispatch', 'shipment', 'tracking',
        'ఆర్డర్లు', 'రవాణా', 'డెలివరీ', 'ట్రాకింగ్',
        'ऑर्डर', 'आपूर्ति', 'डिलीवरी', 'ट्रैकिंग',
        'آرڈرز', 'ترسیل', 'ڈلیوری', 'ٹریکنگ'
      ],
      execute: () => {
        if (typeof window.navigateTo === 'function') window.navigateTo('orders');
        return {
          te: 'మీ విక్రయ ఆర్డర్ల వివరాలు తెరవబడ్డాయి.',
          hi: 'आपके विक्रय ऑर्डर की सूची खोल दी गई है।',
          ur: 'آپ کے فروخت شدہ آرڈرز کی تفصیلات کھول دی گئی ہیں۔',
          en: 'Opening Orders and Deliveries tracking.'
        };
      }
    },

    // Payment Tracking & Wallet
    {
      action: 'wallet',
      patterns: [
        'wallet', 'payment', 'payments', 'earning', 'earnings', 'money', 'balance', 'dbt',
        'వాలెట్', 'డబ్బులు', 'సంపాదన', 'చెల్లింపులు', 'ఖాతా',
        'वॉलेट', 'बटुआ', 'कमाई', 'भुगतान', 'रुपये', 'खाता',
        'والٹ', 'بٹوہ', 'کمائی', 'ادائیگی', 'پیسے'
      ],
      execute: () => {
        if (typeof window.navigateTo === 'function') window.navigateTo('wallet');
        return {
          te: 'రైతు చెల్లింపుల ట్రాకింగ్ వాలెట్ తెరవబడింది.',
          hi: 'किसान भुगतान ट्रैकिंग वॉलेट खोल दिया गया है।',
          ur: 'کسان ادائیگی ٹریکنگ بٹوہ کھول دیا گیا ہے۔',
          en: 'Opening Payment Tracking System and Wallet.'
        };
      }
    },

    // Blockchain Loans & Schemes
    {
      action: 'blockchain',
      patterns: [
        'loan', 'loans', 'blockchain', 'credit', 'scheme', 'kcc', 'subsidy',
        'రుణాలు', 'లోన్', 'సబ్సిడీ', 'బ్లాక్‌చెయిన్', 'క్రెడిట్',
        'ऋण', 'लोन', 'सब्सिडी', 'ब्लॉकचेन', 'क्रेडिट',
        'قرض', 'قرضے', 'سبسڈی', 'بلاک چین'
      ],
      execute: () => {
        if (typeof window.navigateTo === 'function') window.navigateTo('blockchain');
        return {
          te: 'రైతు పంట రుణాలు మరియు క్రెడిట్ లెడ్జర్ తెరవబడింది.',
          hi: 'किसान फसली ऋण एवं क्रेडिट बहीखाता खोल दिया गया है।',
          ur: 'کسان زرعی قرضہ جات کا کھاتہ کھول دیا گیا ہے۔',
          en: 'Opening Blockchain Loan Ledger.'
        };
      }
    },

    // Soil Testing Labs
    {
      action: 'soil',
      patterns: [
        'soil', 'soil lab', 'soil testing', 'soil health', 'earth', 'npk',
        'నేల పరీక్ష', 'మట్టి పరీక్ష', 'ల్యాబ్', 'సాయిల్ కార్డ్',
        'मिट्टी जांच', 'मृदा परीक्षण', 'प्रयोगशाला', 'लैब',
        'مٹی ٹیسٹنگ', 'مٹی لیب', 'سوائل کارڈ'
      ],
      execute: () => {
        if (typeof window.navigateTo === 'function') window.navigateTo('soil');
        return {
          te: 'తెలంగాణ నేల పరీక్ష కేంద్రాల డైరెక్టరీ తెరవబడింది.',
          hi: 'तेलंगाना मृदा परीक्षण प्रयोगशाला सूची खोल दी गई है।',
          ur: 'تلنگانہ مٹی ٹیسٹنگ لیبز کی فہرست کھول دی گئی ہے۔',
          en: 'Opening Soil Testing Laboratories directory.'
        };
      }
    },

    // Godowns & Warehouses
    {
      action: 'godowns',
      patterns: [
        'godown', 'godowns', 'warehouse', 'warehouses', 'storage', 'cold storage',
        'గోదాములు', 'స్టోరేజ్', 'కోల్డ్ స్టోరేజ్', 'గిడ్డంగులు',
        'गोदाम', 'भंडार गृह', 'कोल्ड स्टोरेज', 'वेयरहाउस',
        'گودام', 'اسٹوریج', 'کولڈ اسٹوریج'
      ],
      execute: () => {
        if (typeof window.navigateTo === 'function') window.navigateTo('godowns');
        return {
          te: 'ప్రభుత్వ గిడ్డంగులు మరియు గోదాముల జాబితా తెరవబడింది.',
          hi: 'सरकारी वेयरहाउस एवं गोदामों की सूची खोल दी गई है।',
          ur: 'سرکاری گوداموں اور ویئر ہاؤسز کی فہرست کھول دی گئی ہے۔',
          en: 'Opening Godowns and Warehouses directory.'
        };
      }
    },

    // Logistics Network
    {
      action: 'logistics',
      patterns: [
        'logistics', 'transport', 'vehicle', 'truck', 'tractor', 'carrier',
        'లాజిస్టిక్స్', 'రవాణా', 'ట్రాక్టర్', 'లారీ', 'వాహనాలు',
        'लॉजिस्टिक्स', 'परिवहन', 'गाड़ी', 'ट्रैक्टर', 'ट्रक',
        'لاجسٹکس', 'ٹرانسپورٹ', 'گاڑیاں', 'ٹریکٹر'
      ],
      execute: () => {
        if (typeof window.navigateTo === 'function') window.navigateTo('logistics');
        return {
          te: 'వ్యవసాయ రవాణా వాహనాల నెట్‌వర్క్ తెరవబడింది.',
          hi: 'कृषि परिवहन व वाहन नेटवर्क खोल दिया गया है।',
          ur: 'زرعی ٹرانسپورٹ گاڑیوں کا نیٹ ورک کھول دیا گیا ہے۔',
          en: 'Opening Logistics Network.'
        };
      }
    },

    // AI Kisan Assistant
    {
      action: 'chat',
      patterns: [
        'chat', 'assistant', 'saathi', 'bot', 'ask', 'question', 'mitra',
        'చాట్', 'సహాయకుడు', 'ప్రశ్న', 'కిసాన్ మిత్ర',
        'चैट', 'सहायक', 'सवाल', 'पूछें', 'किसान मित्र',
        'چیٹ', 'معاون', 'سوال', 'کسان مترا'
      ],
      execute: () => {
        if (typeof window.navigateTo === 'function') window.navigateTo('chat');
        return {
          te: 'కిసాన్ మిత్ర AI సంభాషణ కేంద్రం తెరవబడింది.',
          hi: 'किसान मित्र AI चैट केंद्र खोल दिया गया है।',
          ur: 'کسان مترا AI چیٹ سینٹر کھول دیا گیا ہے۔',
          en: 'Opening AI Kisan Assistant.'
        };
      }
    },

    // Farmer Profile
    {
      action: 'profile',
      patterns: [
        'profile', 'account', 'my name', 'details', 'identity',
        'ప్రొఫైల్', 'ఖాతా', 'నా వివరాలు',
        'प्रोफाइल', 'खाता', 'मेरा विवरण',
        'پروفائل', 'اکاؤنٹ', 'میری تفصیلات'
      ],
      execute: () => {
        if (typeof window.navigateTo === 'function') window.navigateTo('profile');
        return {
          te: 'మీ రైతు ప్రొఫైల్ తెరవబడింది.',
          hi: 'आपकी किसान प्रोफ़ाइल खोल दी गई है।',
          ur: 'آپ کی کسان پروفائل کھول دی گئی ہے۔',
          en: 'Opening your Farmer Profile.'
        };
      }
    },

    // Tutorial / Help
    {
      action: 'tutorial',
      patterns: [
        'tutorial', 'help', 'guide', 'teach', 'how to use',
        'ట్యుటోరియల్', 'సహాయం', 'నేర్పించు',
        'ट्यूटोरियल', 'मदद', 'सिखाओ', 'मार्गदर्शन',
        'ٹیوٹوریل', 'مدد', 'رہنمائی'
      ],
      execute: () => {
        if (window.KisanTutorial && typeof window.KisanTutorial.startTutorial === 'function') {
          window.KisanTutorial.startTutorial(activeLang);
        }
        return {
          te: 'కిసాన్ సాథి ఇంటరాక్టివ్ ట్యుటోరియల్ ప్రారంభించబడింది.',
          hi: 'किसान साथी इंटरएक्टिव ट्यूटोरियल शुरू कर दिया गया है।',
          ur: 'کسان ساتھی انٹرایکٹو ٹیوٹوریل شروع کیا جا رہا ہے۔',
          en: 'Starting KisanSaathi Interactive Tutorial.'
        };
      }
    },

    // Change Language to Telugu
    {
      action: 'lang_te',
      patterns: ['telugu', 'change language to telugu', 'telugu bhasha', 'తెలుగు', 'తెలుగు భాష'],
      execute: () => {
        setAssistantLanguage('te');
        if (typeof window.applyLanguage === 'function') window.applyLanguage('te');
        return {
          te: 'భాష తెలుగుకి మార్చబడింది. నేను ఇప్పుడు తెలుగులో మాట్లాడుతాను.',
          hi: 'भाषा बदलकर तेलुगु कर दी गई है।',
          ur: 'زبان تیلگو میں تبدیل کر دی گئی ہے۔',
          en: 'Language switched to Telugu.'
        };
      }
    },

    // Change Language to Hindi
    {
      action: 'lang_hi',
      patterns: ['hindi', 'change language to hindi', 'hindi bhasha', 'हिंदी', 'हिन्दी', 'हिंदी भाषा'],
      execute: () => {
        setAssistantLanguage('hi');
        if (typeof window.applyLanguage === 'function') window.applyLanguage('hi');
        return {
          te: 'భాష హిందీకి మార్చబడింది.',
          hi: 'भाषा बदलकर हिंदी कर दी गई है। अब मैं हिंदी में बात करूँगा।',
          ur: 'زبان ہندی میں تبدیل کر دی گئی ہے۔',
          en: 'Language switched to Hindi.'
        };
      }
    },

    // Change Language to Urdu
    {
      action: 'lang_ur',
      patterns: ['urdu', 'change language to urdu', 'urdu zuban', 'اردو', 'اردو زبان'],
      execute: () => {
        setAssistantLanguage('ur');
        if (typeof window.applyLanguage === 'function') window.applyLanguage('ur');
        return {
          te: 'భాష ఉర్దూకి మార్చబడింది.',
          hi: 'भाषा बदलकर उर्दू कर दी गई है।',
          ur: 'زبان اردو میں تبدیل کر دی گئی ہے۔ اب میں اردو میں بات کروں گا۔',
          en: 'Language switched to Urdu.'
        };
      }
    },

    // Change Language to English
    {
      action: 'lang_en',
      patterns: ['english', 'change language to english', 'english bhasha'],
      execute: () => {
        setAssistantLanguage('en');
        if (typeof window.applyLanguage === 'function') window.applyLanguage('en');
        return {
          te: 'Language switched to English.',
          hi: 'भाषा बदलकर अंग्रेजी कर दी गई है।',
          ur: 'زبان انگریزی میں تبدیل کر دی گئی ہے۔',
          en: 'Language switched to English. I will now guide you in English.'
        };
      }
    },

    // Stop / Quiet
    {
      action: 'stop',
      patterns: [
        'stop', 'quiet', 'silent', 'hush', 'shut up',
        'ఆపండి', 'ఆపు', 'నిశ్శబ్దం',
        'रुको', 'रोकें', 'चुप', 'बंद करो',
        'روکیں', 'روکو', 'خاموش'
      ],
      execute: () => {
        stopSpeaking();
        return {
          te: 'ఆడియో ఆపబడింది.',
          hi: 'आवाज रोक दी गई है।',
          ur: 'آواز روک دی گئی ہے۔',
          en: 'Audio paused.'
        };
      }
    },

    // Read this page aloud
    {
      action: 'read_page',
      patterns: [
        'read', 'read this page', 'read page', 'read aloud', 'explain page',
        'చదవండి', 'ఈ పేజీని చదవండి', 'వివరించండి',
        'पढ़ो', 'पढ़कर सुनाओ', 'यह पेज सुनाओ',
        'پڑھیں', 'یہ صفحہ پڑھیں', 'پڑھ کر سنائیں'
      ],
      execute: () => {
        readCurrentPageAloud();
        return null; // Handled directly in readCurrentPageAloud
      }
    }
  ];

  // 5. Match Spoken Input to Command Registry
  function matchVoiceCommand(rawTranscript) {
    if (!rawTranscript) return null;
    const clean = rawTranscript.toLowerCase().trim();

    // Check every registered pattern
    for (const entry of COMMAND_REGISTRY) {
      for (const pat of entry.patterns) {
        if (clean === pat || clean.includes(pat)) {
          return entry;
        }
      }
    }

    // Check search intent: e.g. "search for tomato" or "టమాటా వెతకండి"
    if (clean.includes('search') || clean.includes('వెతకండి') || clean.includes('खोजें') || clean.includes('تلاش')) {
      const query = clean.replace(/(search for|search|find|వెతకండి|ఖోజ్|खोजें|تلاش کریں)/gi, '').trim();
      return {
        action: 'search',
        query: query,
        execute: () => {
          // If on mandi or inventory, populate search input
          const mktSearch = document.getElementById('marketCommoditySearchInput');
          if (mktSearch && query) {
            if (typeof window.navigateTo === 'function') window.navigateTo('market-dashboard');
            mktSearch.value = query;
            mktSearch.dispatchEvent(new Event('input'));
          }
          return {
            te: `మార్కెట్లో ${query} కోసం వెతుకుతున్నాను.`,
            hi: `मंडी में ${query} के लिए खोज की जा रही है।`,
            ur: `منڈی میں ${query} تلاش کیا جا رہا ہے۔`,
            en: `Searching for ${query} in market prices.`
          };
        }
      };
    }

    return null;
  }

  // 6. Read Current Page Aloud Summarizer
  function readCurrentPageAloud() {
    const activeSectionId = window.activeSection || 'inventory';
    const cfg = VOICE_ASSISTANT_CONFIG[activeLang] || VOICE_ASSISTANT_CONFIG.te;

    let summaryText = '';

    if (activeSectionId === 'inventory') {
      const invCount = document.getElementById('statCropCount')?.textContent || '0';
      const balance = document.getElementById('quickBalance')?.textContent || '0';
      const dispatches = document.getElementById('quickOrders')?.textContent || '0';
      const summaries = {
        te: `మీ రైతు ఇన్వెంటరీలో ప్రస్తుతం ${invCount} పంటల నిల్వలు ఉన్నాయి. అమ్మకాల బ్యాలెన్స్ ${balance} రూపాయలు, మరియు ${dispatches} ఆర్డర్లు రవాణాలో ఉన్నాయి.`,
        hi: `आपकी किसान इन्वेंटरी में वर्तमान में ${invCount} फसलें दर्ज हैं। प्राप्त भुगतान ${balance} रुपये है और ${dispatches} आपूर्ति में हैं।`,
        ur: `آپ کی کسان انوینٹری میں اس وقت ${invCount} فصلیں درج ہیں۔ کل وصولی ${balance} روپے ہے اور ${dispatches} ترسیل میں ہیں۔`,
        en: `Your inventory currently lists ${invCount} crops. Sales balance is ${balance}, with ${dispatches} active dispatches.`
      };
      summaryText = summaries[activeLang] || summaries.en;
    } else if (activeSectionId === 'market-dashboard') {
      const summaries = {
        te: `ఇది తెలంగాణ లైవ్ మార్కెట్ ధరల పేజీ. వరంగల్ ఎనుమాముల మరియు బోవెన్‌పల్లి మార్కెట్ల నుండి ధాన్యం, పత్తి మరియు కూరగాయల అధికారిక ధరలు నవీకరించబడ్డాయి.`,
        hi: `यह तेलंगाना लाइव मंडी भाव पेज है। वारंगल एनाममुला और बोवेनपल्ली मंडी के धान, कपास और सब्जियों के ताजा भाव उपलब्ध हैं।`,
        ur: `یہ تلنگانہ لائیو منڈی ریٹس کا صفحہ ہے۔ انامامولا اور بوئن پلی منڈیوں سے دھان، کپاس اور سبزیوں کے ریٹس شامل ہیں۔`,
        en: `This is the Telangana Live Market Prices dashboard with official APMC trading benchmarks for grains, cotton, and vegetables.`
      };
      summaryText = summaries[activeLang] || summaries.en;
    } else if (activeSectionId === 'wallet') {
      const bal = document.getElementById('farmerWalletBalance')?.textContent || '0';
      const summaries = {
        te: `మీ రైతు వాలెట్ మొత్తం బ్యాలెన్స్ ${bal}. ఇది మీ సొంత ఖాతాకు డీబీటీ ద్వారా బదిలీ చేయడానికి సిద్ధంగా ఉంది.`,
        hi: `आपके किसान वॉलेट में कुल शेष राशि ${bal} है। यह राशि सीधे बैंक खाते में निकालने के लिए उपलब्ध है।`,
        ur: `آپ کے کسان والٹ میں کل رقم ${bal} ہے۔ یہ رقم آپ کے بینک اکاؤنٹ میں منتقلی کے لیے تیار ہے۔`,
        en: `Your farmer wallet balance is ${bal}, available for instant DBT settlement to your bank account.`
      };
      summaryText = summaries[activeLang] || summaries.en;
    } else {
      const summaries = {
        te: `మీరు ప్రస్తుతం కిసాన్ సాథి పేజీలో ఉన్నారు. మీకు కావాల్సిన సహాయం గురించి మైక్ నొక్కి అడగవచ్చు.`,
        hi: `आप किसान साथी पोर्टल पर हैं। किसी भी सहायता के लिए माइक दबाकर बोलें।`,
        ur: `آپ کسان ساتھی پورٹل پر ہیں۔ مدد کے لیے مائیک دبا کر بولیں۔`,
        en: `You are on KisanSaathi. Tap the microphone anytime to speak a command or ask a question.`
      };
      summaryText = summaries[activeLang] || summaries.en;
    }

    displayAssistantMessage(summaryText, activeLang);
    speakAnswer(summaryText, activeLang);
  }

  // 7. Speech Synthesis
  function speakAnswer(text, langCode) {
    if (isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch (_e) {}

    const localeMap = {
      te: 'te-IN',
      hi: 'hi-IN',
      ur: 'ur-IN',
      en: 'en-IN'
    };

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = localeMap[langCode] || 'te-IN';
    utter.rate = speechRate;
    utter.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find(v => v.lang === utter.lang || v.lang.startsWith(langCode));
      if (match) utter.voice = match;
    }

    utter.onstart = () => {
      isSpeaking = true;
      setAssistantState('SPEAKING');
    };

    utter.onend = () => {
      isSpeaking = false;
      setAssistantState('READY');
    };

    utter.onerror = () => {
      isSpeaking = false;
      setAssistantState('READY');
    };

    lastSpokenText = text;
    currentUtterance = utter;
    try {
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('[VoiceAssistant] Speak exception:', e);
      setAssistantState('READY');
    }
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (_e) {}
    }
    isSpeaking = false;
    currentUtterance = null;
    setAssistantState('READY');
  }

  function repeatLastResponse() {
    if (lastSpokenText) {
      speakAnswer(lastSpokenText, activeLang);
    } else {
      const cfg = VOICE_ASSISTANT_CONFIG[activeLang] || VOICE_ASSISTANT_CONFIG.te;
      speakAnswer(cfg.readyPrompt, activeLang);
    }
  }

  // 8. Visual State Controller
  function setAssistantState(state) {
    const statusText = document.getElementById('vaStatusText');
    const micIcon = document.getElementById('vaMicIcon');
    const waveContainer = document.getElementById('vaSoundWaves');
    const floatingBtn = document.getElementById('btnFloatingVoiceAssistant');
    const cfg = VOICE_ASSISTANT_CONFIG[activeLang] || VOICE_ASSISTANT_CONFIG.te;

    if (statusText) {
      if (state === 'LISTENING') statusText.textContent = cfg.listeningPrompt;
      else if (state === 'PROCESSING') statusText.textContent = cfg.processingPrompt;
      else if (state === 'SPEAKING') statusText.textContent = cfg.speakingPrompt;
      else statusText.textContent = cfg.readyPrompt;
    }

    if (waveContainer) {
      if (state === 'LISTENING' || state === 'SPEAKING') {
        waveContainer.classList.remove('hidden');
      } else {
        waveContainer.classList.add('hidden');
      }
    }

    if (floatingBtn) {
      if (state === 'LISTENING') {
        floatingBtn.classList.add('ring-4', 'ring-emerald-300', 'animate-pulse');
      } else {
        floatingBtn.classList.remove('ring-4', 'ring-emerald-300', 'animate-pulse');
      }
    }
  }

  function displayAssistantMessage(msg, lang) {
    const respEl = document.getElementById('vaAssistantResponse');
    if (respEl) {
      respEl.textContent = msg;
      if (lang === 'ur') respEl.setAttribute('dir', 'rtl');
      else respEl.setAttribute('dir', 'ltr');
    }
  }

  function displayUserTranscript(transcript, detectedLang) {
    const transEl = document.getElementById('vaUserTranscript');
    const langBadge = document.getElementById('vaDetectedLangBadge');
    if (transEl) {
      transEl.textContent = transcript;
      if (detectedLang === 'ur') transEl.setAttribute('dir', 'rtl');
      else transEl.setAttribute('dir', 'ltr');
    }
    if (langBadge) {
      const names = { te: 'తెలుగు', hi: 'हिंदी', ur: 'اردو', en: 'English' };
      langBadge.textContent = names[detectedLang] || detectedLang;
    }
  }

  // 9. Speech Recognition Start/Stop
  function startListening() {
    if (isSpeaking) stopSpeaking();

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const cfg = VOICE_ASSISTANT_CONFIG[activeLang] || VOICE_ASSISTANT_CONFIG.te;

    if (!SpeechRec) {
      alert(cfg.unsupported);
      if (typeof window.showToast === 'function') window.showToast(cfg.unsupported);
      return;
    }

    try {
      recognitionInstance = new SpeechRec();
      recognitionInstance.lang = cfg.langCode;
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.maxAlternatives = 1;

      let accumulatedText = '';

      recognitionInstance.onstart = function () {
        isListening = true;
        setAssistantState('LISTENING');
        displayUserTranscript('...', activeLang);
      };

      recognitionInstance.onresult = function (event) {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            accumulatedText += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const live = (accumulatedText + interim).trim();
        if (live) displayUserTranscript(live, activeLang);
      };

      recognitionInstance.onerror = function (event) {
        isListening = false;
        console.warn('[VoiceAssistant] STT error:', event.error);
        if (event.error === 'not-allowed') {
          alert(cfg.micDenied);
        } else if (event.error === 'no-speech') {
          if (typeof window.showToast === 'function') window.showToast(cfg.noSpeech);
        }
        setAssistantState('READY');
      };

      recognitionInstance.onend = function () {
        isListening = false;
        const finalText = accumulatedText.trim();
        if (finalText) {
          processSpokenCommand(finalText);
        } else {
          setAssistantState('READY');
        }
      };

      recognitionInstance.start();
    } catch (err) {
      isListening = false;
      console.error('[VoiceAssistant] Exception starting recognition:', err);
      setAssistantState('READY');
    }
  }

  function stopListening() {
    if (recognitionInstance && isListening) {
      try { recognitionInstance.stop(); } catch (_e) {}
    }
    isListening = false;
    setAssistantState('READY');
  }

  function toggleListening() {
    if (isListening) stopListening();
    else startListening();
  }

  // 10. Process Spoken Input
  function processSpokenCommand(text) {
    setAssistantState('PROCESSING');

    // 1. Automatic Language Detection
    const detectedLang = detectSpokenLanguage(text);
    displayUserTranscript(text, detectedLang);

    // If language was different, adapt assistant language smoothly
    if (detectedLang !== activeLang) {
      activeLang = detectedLang;
      updateAssistantUI();
    }

    // 2. Match with Centralized Command Registry
    const matched = matchVoiceCommand(text);

    if (matched) {
      const result = matched.execute();
      if (result) {
        const spokenReply = result[activeLang] || result.en || result.te;
        displayAssistantMessage(spokenReply, activeLang);
        speakAnswer(spokenReply, activeLang);
      }
    } else {
      // 3. Fallback to Agricultural Voice Saathi API for General Farm Questions
      fallbackToVoiceSaathiApi(text, activeLang);
    }
  }

  async function fallbackToVoiceSaathiApi(userQuery, lang) {
    try {
      const res = await fetch('/api/voice-saathi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQuery,
          language: lang,
          farmerId: window.currentFarmerId || 'FARMER-TG-7721'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const spokenAnswer = data.spokenText || data.answer || data.reply;
        if (spokenAnswer) {
          displayAssistantMessage(spokenAnswer, lang);
          speakAnswer(spokenAnswer, lang);
          return;
        }
      }
    } catch (err) {
      console.warn('[VoiceAssistant] API fallback exception:', err);
    }

    // Default polite clarification
    const politeFallbacks = {
      te: 'నేను అర్థం చేసుకోలేకపోయాను. దయచేసి "ఇన్వెంటరీ", "మార్కెట్ ధరలు" లేదా "పంట అమ్మకం" అని చెప్పండి.',
      hi: 'मैं समझ नहीं पाया। कृपया "इन्वेंटरी", "मंडी भाव" या "फसल जोड़ें" बोलें।',
      ur: 'میں سمجھ نہیں سکا۔ براہ کرم "انوینٹری"، "منڈی ریٹس" یا "فصل شامل کریں" بولیں۔',
      en: "I didn't quite catch that. Would you like to open Inventory, Mandi Prices, or Add a Crop?"
    };
    const reply = politeFallbacks[lang] || politeFallbacks.te;
    displayAssistantMessage(reply, lang);
    speakAnswer(reply, lang);
  }

  // 11. Assistant Panel UI & Language Switcher
  function openAssistantPanel() {
    const modal = document.getElementById('modalVoiceAssistant');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('open');
    }
    updateAssistantUI();
  }

  function closeAssistantPanel() {
    stopSpeaking();
    stopListening();
    const modal = document.getElementById('modalVoiceAssistant');
    if (modal) {
      modal.classList.remove('open');
      modal.classList.add('hidden');
    }
  }

  function setAssistantLanguage(lang) {
    if (!['te', 'hi', 'ur', 'en'].includes(lang)) lang = 'te';
    activeLang = lang;
    localStorage.setItem('kisan_lang', lang);
    updateAssistantUI();
  }

  function updateAssistantUI() {
    const cfg = VOICE_ASSISTANT_CONFIG[activeLang] || VOICE_ASSISTANT_CONFIG.te;

    // Update Language Buttons
    document.querySelectorAll('.btn-va-lang').forEach(btn => {
      const bLang = btn.getAttribute('data-lang');
      if (bLang === activeLang) {
        btn.classList.add('bg-emerald-600', 'text-white', 'shadow-xs');
        btn.classList.remove('bg-gray-100', 'text-gray-700');
      } else {
        btn.classList.remove('bg-emerald-600', 'text-white', 'shadow-xs');
        btn.classList.add('bg-gray-100', 'text-gray-700');
      }
    });

    // Update Quick Command Chips
    const chipsContainer = document.getElementById('vaQuickCommandChips');
    if (chipsContainer) {
      chipsContainer.innerHTML = cfg.quickCommands.map(item => `
        <button type="button" 
                onclick="window.KisanVoiceAssistant.executeQuickCommand('${item.cmd.replace(/'/g, "\\'")}')" 
                class="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-400 font-bold text-xs text-gray-800 transition active:scale-95 shadow-2xs text-left flex items-center justify-between">
          <span>${item.label}</span>
          <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      `).join('');
    }

    setAssistantState(isListening ? 'LISTENING' : (isSpeaking ? 'SPEAKING' : 'READY'));
  }

  // 12. Init
  function initVoiceAssistant() {
    // Voice mute toggle
    const btnMute = document.getElementById('vaBtnMuteToggle');
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        isMuted = !isMuted;
        localStorage.setItem('kisan_voice_muted', String(isMuted));
        btnMute.innerHTML = isMuted 
          ? '<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>'
          : '<svg class="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>';
        if (typeof window.showToast === 'function') {
          window.showToast(isMuted ? 'Voice Muted' : 'Voice Enabled');
        }
      });
    }

    // Speech speed toggle
    const speedSelect = document.getElementById('vaSpeedSelect');
    if (speedSelect) {
      speedSelect.value = String(speechRate);
      speedSelect.addEventListener('change', (e) => {
        speechRate = parseFloat(e.target.value) || 0.95;
        localStorage.setItem('kisan_voice_rate', String(speechRate));
      });
    }

    // Dismiss panel when clicking backdrop
    const vaModal = document.getElementById('modalVoiceAssistant');
    if (vaModal) {
      vaModal.addEventListener('click', (e) => {
        if (e.target === vaModal) closeAssistantPanel();
      });
    }
  }

  // Export to Global namespace
  window.KisanVoiceAssistant = {
    openAssistantPanel,
    closeAssistantPanel,
    toggleListening,
    startListening,
    stopListening,
    repeatLastResponse,
    stopSpeaking,
    readCurrentPageAloud,
    setAssistantLanguage,
    executeQuickCommand: (cmd) => {
      displayUserTranscript(cmd, activeLang);
      processSpokenCommand(cmd);
    },
    init: initVoiceAssistant
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoiceAssistant);
  } else {
    initVoiceAssistant();
  }

})(window, document);
