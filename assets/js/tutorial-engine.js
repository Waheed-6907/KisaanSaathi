/**
 * KisanSaathi: Multilingual Animated Interactive Tutorial Engine
 * Supports: Telugu (te-IN), Hindi (hi-IN), Urdu (ur-IN), English (en-IN)
 * Designed for low-literacy farmers with voice guidance, visual spotlights, and real-element navigation.
 */

(function (window, document) {
  'use strict';

  // 1. Multilingual Tutorial Content & Spoken Scripts
  const TUTORIAL_DATA = {
    te: {
      langName: 'తెలుగు',
      welcomeTitle: 'రైతు బంధువులకు కిసాన్ సాథికి స్వాగతం!',
      welcomeSubtitle: 'మీ పంటలకు సరైన మార్కెట్ ధర, నేరుగా కొనుగోలుదారులు మరియు ఉచిత సలహాలు అందించే వేదిక.',
      btnStart: 'ట్యుటోరియల్ ప్రారంభించండి',
      btnListenAgain: 'మళ్లీ వినండి',
      btnSkip: 'దాటవేయండి (స్కిప్)',
      btnChangeLang: 'భాష మార్చుకోండి',
      btnNext: 'తదుపరి',
      btnPrev: 'వెనుకకు',
      btnFinish: 'ముగించండి',
      btnRepeatVoice: 'వాయిస్ వినండి',
      btnPauseVoice: 'ఆపండి / కొనసాగించండి',
      btnExit: 'నిష్క్రమించు',
      stepIndicator: 'అడుగు',
      of: 'మొత్తం లో',
      steps: [
        {
          id: 'welcome_intro',
          target: '#appHeaderTitle',
          fallbackSection: 'inventory',
          title: 'కిసాన్ సాథి పరిచయం',
          caption: 'రైతులకు పూర్తి వ్యవసాయ మరియు మార్కెట్ సహకారం.',
          speech: 'నమస్కారం రైతు మిత్రమా! కిసాన్ సాథి మీ వ్యవసాయ ఉత్పత్తులను నేరుగా కొనుగోలుదారులకు సరసమైన ధరకు విక్రయించడానికి సహాయపడుతుంది. ఇక్కడ దళారుల ప్రమేయం ఉండదు.',
          actionName: 'పరిచయం'
        },
        {
          id: 'farmer_profile',
          target: 'button[data-navigate="profile"]',
          fallbackSection: 'profile',
          title: 'రైతు ప్రొఫైల్',
          caption: 'మీ భూమి, పంట వివరాలు మరియు గుర్తింపు.',
          speech: 'ఇది మీ రైతు ప్రొఫైల్. ఇక్కడ మీ పేరు, ఊరు, భూమి విస్తీర్ణం మరియు ప్రభుత్వం ధృవీకరించిన రికార్డులు సురక్షితంగా ఉంటాయి. మీ వివరాలు ఎవరికీ కనిపించవు.',
          actionName: 'ప్రొఫైల్ చూడండి'
        },
        {
          id: 'farmer_inventory',
          target: 'a[data-navigate="inventory"]',
          fallbackSection: 'inventory',
          title: 'రైతు పంట నిల్వలు (ఇన్వెంటరీ)',
          caption: 'మీ వద్ద ఉన్న ధాన్యం, పత్తి మరియు కూరగాయల నిల్వలు.',
          speech: 'మీ పంట నిల్వల జాబితా ఇక్కడ ఉంటుంది. మీ వద్ద ఎన్ని కిలోల పంట అమ్మకానికి సిద్ధంగా ఉందో, మీరు నిర్ణయించిన ధర ఎంత ఉందో సులభంగా చూడవచ్చు.',
          actionName: 'ఇన్వెంటరీ తెరవండి'
        },
        {
          id: 'add_crop',
          target: 'a[data-navigate="upload"]',
          fallbackSection: 'upload',
          title: 'పంట అమ్మకానికి జోడించండి',
          caption: 'పంట ఫోటో తీసి మార్కెట్లో అమ్మకానికి పెట్టండి.',
          speech: 'మీ పంటను అమ్మడానికి ఈ బటన్ నొక్కండి. మీ పంట ఫోటో తీసి, ఎన్ని బస్తాలు లేదా కిలోలు ఉన్నాయో నమోదు చేయండి. ఫోటో చూసి పంట రకాన్ని యాప్ స్వయంగా గుర్తిస్తుంది.',
          actionName: 'పంట జోడించండి'
        },
        {
          id: 'mandi_prices',
          target: 'a[data-navigate="market-dashboard"]',
          fallbackSection: 'market-dashboard',
          title: 'రోజువారీ మార్కెట్ ధరలు (మండి రేట్లు)',
          caption: 'తెలంగాణ ఎనుమాముల, బోవెన్‌పల్లి మార్కెట్ల నిజమైన రేట్లు.',
          speech: 'ఇది రోజువారీ మార్కెట్ ధరల పేజీ. వరంగల్ ఎనుమాముల, బోవెన్‌పల్లి తదితర మార్కెట్లలో ఈరోజు వరి, పత్తి, మిర్చి మరియు కూరగాయల అధికారిక ధరలను ఇక్కడ తనిఖీ చేయవచ్చు.',
          actionName: 'మండి రేట్లు చూడండి'
        },
        {
          id: 'price_negotiations',
          target: 'a[data-navigate="negotiate"]',
          fallbackSection: 'negotiate',
          title: 'ధర సంప్రదింపులు (బేరం)',
          caption: 'కొనుగోలుదారులు ఇచ్చిన ఆఫర్లను పరిశీలించి ఆమోదించండి.',
          speech: 'కొనుగోలుదారులు మీ పంటకు ఇచ్చిన ధరల ఆఫర్లు ఇక్కడ కనిపిస్తాయి. నచ్చితే ఆమోదించవచ్చు, లేదా సరిపడకపోతే తిరస్కరించవచ్చు. మీ అనుమతి లేకుండా ఏ డీల్ ఖరారు కాదు.',
          actionName: 'ధర చర్చలు'
        },
        {
          id: 'orders_deliveries',
          target: 'a[data-navigate="orders"]',
          fallbackSection: 'orders',
          title: 'ఆర్డర్లు & రవాణా స్థితి',
          caption: 'అమ్ముడైన పంట డెలివరీ స్థితిని ట్రాక్ చేయండి.',
          speech: 'మీరు విక్రయించిన పంటల ఆర్డర్ వివరాలు, రవాణా వాహనం సమాచారం మరియు కొనుగోలుదారు అడ్రస్ ఇక్కడ కనిపిస్తాయి.',
          actionName: 'ఆర్డర్లు చూడండి'
        },
        {
          id: 'payment_wallet',
          target: 'a[data-navigate="wallet"]',
          fallbackSection: 'wallet',
          title: 'చెల్లింపుల ట్రాకింగ్ & రైతు వాలెట్',
          caption: 'మీ పంట డబ్బులు నేరుగా మీ బ్యాంక్ ఖాతాలో జమ అవుతాయి.',
          speech: 'మీ పంట విక్రయాల ద్వారా వచ్చిన పూర్తి డబ్బుల వివరాలు ఇక్కడ ఉంటాయి. డీబీటీ ద్వారా నేరుగా మీ సొంత బ్యాంక్ ఖాతాకు డబ్బులను బదిలీ చేసుకోవచ్చు.',
          actionName: 'వాలెట్ చూడండి'
        },
        {
          id: 'blockchain_loans',
          target: 'a[data-navigate="blockchain"]',
          fallbackSection: 'blockchain',
          title: 'పంట రుణాలు & క్రెడిట్ లెడ్జర్',
          caption: 'తక్కువ వడ్డీతో ప్రభుత్వం ధృవీకరించిన వ్యవసాయ రుణాలు.',
          speech: 'ఇక్కడ ప్రభుత్వం అందించే నాలుగు శాతం వడ్డీ రాయితీ పంట రుణాలు మరియు క్రెడిట్ స్కోర్ వివరాలు నమోదై ఉంటాయి.',
          actionName: 'రుణ వివరాలు'
        },
        {
          id: 'soil_testing',
          target: 'a[data-navigate="soil"]',
          fallbackSection: 'soil',
          title: 'నేల పరీక్ష కేంద్రాలు & సాయిల్ హెల్త్ కార్డ్',
          caption: 'మీ జిల్లాలోని ఉచిత ప్రభుత్వ నేల పరీక్ష ప్రయోగశాలలు.',
          speech: 'మీ భూమి నేల పరీక్ష చేయించుకోవడానికి దగ్గరలోని ప్రభుత్వ ల్యాబ్‌ల చిరునామా మరియు ఫోన్ నంబర్లు ఇక్కడ ఉంటాయి. దీనివల్ల అనవసర ఎరువుల ఖర్చు తగ్గుతుంది.',
          actionName: 'ల్యాబ్‌లు చూడండి'
        },
        {
          id: 'godowns_storage',
          target: 'a[data-navigate="godowns"]',
          fallbackSection: 'godowns',
          title: 'గోదాములు & నిల్వ కేంద్రాలు',
          caption: 'ధాన్యం భద్రపరుచుకోవడానికి లైసెన్స్ పొందిన గిడ్డంగులు.',
          speech: 'మార్కెట్లో ధర పెరిగే వరకు పంటను భద్రపరుచుకోవడానికి తెలంగాణ రాష్ట్ర గిడ్డంగుల సంస్థ గోదాములు మరియు కోల్డ్ స్టోరేజ్ వివరాలు ఇక్కడ ఉన్నాయి.',
          actionName: 'గోదాములు'
        },
        {
          id: 'logistics_network',
          target: 'a[data-navigate="logistics"]',
          fallbackSection: 'logistics',
          title: 'రవాణా & లాజిస్టిక్స్ నెట్‌వర్క్',
          caption: 'ఖేత్ నుంచి మండి వరకు చౌకైన రవాణా వాహనాలు.',
          speech: 'మీ పొలం నుండి మార్కెట్‌కు పంటను తీసుకెళ్లడానికి ట్రాక్టర్లు, ట్రక్కులు మరియు కిసాన్ రథ్ వాహనాల సమాచారం ఇక్కడ లభిస్తుంది.',
          actionName: 'రవాణా సౌకర్యాలు'
        },
        {
          id: 'ai_assistant',
          target: '#btnFloatingVoiceSaathi',
          fallbackSection: 'chat',
          title: 'వాయిస్ సాథి & AI వ్యవసాయ సహాయకుడు',
          caption: 'నోటితో అడగండి - వాయిస్ లో సమాధానం వినండి.',
          speech: 'ఈ ఆకుపచ్చ మైక్ బటన్ నొక్కి మీరు ఏ ప్రశ్న అయినా తెలుగులో అడగవచ్చు. మార్కెట్ ధరలు, ఎరువులు, తెగుళ్ల మందులు ఏదైనా మాట్లాడి తెలుసుకోవచ్చు.',
          actionName: 'వాయిస్ సహాయకుడు'
        },
        {
          id: 'whatsapp_support',
          target: '#floatingWhatsAppBtn',
          fallbackSection: 'inventory',
          title: 'వాట్సాప్ AI సేవలు',
          caption: 'మీ ఫోన్ వాట్సాప్ ద్వారా కూడా సమాచారం పొందవచ్చు.',
          speech: 'మీరు వాట్సాప్ ద్వారా కూడా నేరుగా మెసేజ్ పంపి పంట ధరలు మరియు వ్యవసాయ సలహాలు పొందవచ్చు.',
          actionName: 'వాట్సాప్'
        },
        {
          id: 'feedback_helpline',
          target: 'a[data-navigate="feedback"]',
          fallbackSection: 'feedback',
          title: 'రైతు సహాయవాణి & ఫిర్యాదులు',
          caption: 'రైతు కాల్ సెంటర్ 1800-180-1551 ద్వారా నేరుగా మాట్లాడండి.',
          speech: 'ఏదైనా సమస్య ఉంటే వ్యవసాయ అధికారులకు ఫిర్యాదు లేదా ప్రశ్న నమోదు చేయవచ్చు. టోల్ ఫ్రీ నెంబర్ 1800-180-1551 అందుబాటులో ఉంది.',
          actionName: 'సహాయవాణి'
        }
      ]
    },

    hi: {
      langName: 'हिंदी',
      welcomeTitle: 'किसान भाइयों, किसान साथी में आपका स्वागत है!',
      welcomeSubtitle: 'फसलों के सही मंडी भाव, सीधे खरीदार और आवाज में कृषि सलाह पाने का भरोसेमंद मंच।',
      btnStart: 'ट्यूटोरियल शुरू करें',
      btnListenAgain: 'दोबारा सुनें',
      btnSkip: 'छोड़ें (स्किप)',
      btnChangeLang: 'भाषा बदलें',
      btnNext: 'आगे बढ़ें',
      btnPrev: 'पीछे जाएं',
      btnFinish: 'समाप्त करें',
      btnRepeatVoice: 'आवाज दोबारा सुनें',
      btnPauseVoice: 'रोकें / चलाएं',
      btnExit: 'बाहर निकलें',
      stepIndicator: 'चरण',
      of: 'का',
      steps: [
        {
          id: 'welcome_intro',
          target: '#appHeaderTitle',
          fallbackSection: 'inventory',
          title: 'किसान साथी परिचय',
          caption: 'किसानों के लिए संपूर्ण कृषि व बाजार मंच।',
          speech: 'नमस्ते किसान साथी! यह ऐप आपकी फसलों को सीधे सही दाम पर बेचने में मदद करता है। यहाँ कोई बिचौलिया या दलाल नहीं होता।',
          actionName: 'परिचय'
        },
        {
          id: 'farmer_profile',
          target: 'button[data-navigate="profile"]',
          fallbackSection: 'profile',
          title: 'किसान प्रोफ़ाइल',
          caption: 'आपकी भूमि, पहचान और कृषि रिकॉर्ड।',
          speech: 'यहाँ आपकी किसान प्रोफ़ाइल सुरक्षित है। आपका नाम, गाँव, और सरकारी भूमि रिकॉर्ड केवल आपको दिखते हैं और पूरी तरह गोपनीय हैं।',
          actionName: 'प्रोफ़ाइल'
        },
        {
          id: 'farmer_inventory',
          target: 'a[data-navigate="inventory"]',
          fallbackSection: 'inventory',
          title: 'किसान इन्वेंटरी (फसल भंडार)',
          caption: 'आपके पास बेचने के लिए मौजूद फसलों का स्टॉक।',
          speech: 'आपकी सभी फसलों का रिकॉर्ड यहाँ रहता है। आप कितने किलो या क्विंटल फसल किस भाव में बेचना चाहते हैं, सब यहाँ दिखता है।',
          actionName: 'इन्वेंटरी'
        },
        {
          id: 'add_crop',
          target: 'a[data-navigate="upload"]',
          fallbackSection: 'upload',
          title: 'फसल बिक्री हेतु जोड़ें',
          caption: 'फसल की फोटो खींचें और बिक्री के लिए डालें।',
          speech: 'फसल बेचने के लिए इस बटन को दबाएं। मोबाइल से फसल का फोटो लें, मात्रा डालें और दाम तय करें। ऐप फोटो देखकर फसल पहचान लेता है।',
          actionName: 'फसल जोड़ें'
        },
        {
          id: 'mandi_prices',
          target: 'a[data-navigate="market-dashboard"]',
          fallbackSection: 'market-dashboard',
          title: 'दैनिक बाजार भाव (मंडी रेट)',
          caption: 'तेलंगाना की सरकारी मंडियों के आज के ताजा भाव।',
          speech: 'यहाँ वारंगल की एनाममुला, बोवेनपल्ली आदि प्रमुख मंडियों में आज के धान, कपास, मिर्च और सब्जियों के सरकारी भाव देख सकते हैं।',
          actionName: 'मंडी भाव'
        },
        {
          id: 'price_negotiations',
          target: 'a[data-navigate="negotiate"]',
          fallbackSection: 'negotiate',
          title: 'मूल्य बातचीत (सौदा)',
          caption: 'खरीदारों के दाम प्रस्ताव देखें और फैसला लें।',
          speech: 'खरीदारों द्वारा आपकी फसल के लिए दिए गए दाम यहाँ दिखेंगे। पसंद आए तो हाँ करें, कम लगे तो मना कर दें। आपकी सहमति के बिना कुछ नहीं बिकेगा।',
          actionName: 'बातचीत'
        },
        {
          id: 'orders_deliveries',
          target: 'a[data-navigate="orders"]',
          fallbackSection: 'orders',
          title: 'ऑर्डर एवं आपूर्ति (डिलीवरी)',
          caption: 'बिकी हुई फसल का ट्रांसपोर्ट और डिलीवरी स्टेटस।',
          speech: 'आपकी बिकी हुई फसल कब पहुँचेगी और किस गाड़ी से जा रही है, उसका पूरा स्टेटस यहाँ ट्रैक करें।',
          actionName: 'ऑर्डर देखें'
        },
        {
          id: 'payment_wallet',
          target: 'a[data-navigate="wallet"]',
          fallbackSection: 'wallet',
          title: 'भुगतान ट्रैकिंग एवं वॉलेट',
          caption: 'फसल की पूरी रकम सीधे आपके बैंक खाते में।',
          speech: 'फसल बिकने पर पैसे सीधे आपके खाते में डीबीटी द्वारा चौबीस घंटे में जमा हो जाते हैं। आप अपनी कमाई यहाँ देख सकते हैं।',
          actionName: 'वॉलेट'
        },
        {
          id: 'blockchain_loans',
          target: 'a[data-navigate="blockchain"]',
          fallbackSection: 'blockchain',
          title: 'ब्लॉकचेन ऋण बहीखाता',
          caption: 'चार प्रतिशत ब्याज पर सरकारी फसली ऋण।',
          speech: 'यहाँ सरकारी किसान क्रेडिट कार्ड फसली ऋण और ब्याज सब्सिडी की जानकारी सुरक्षित दर्ज रहती है।',
          actionName: 'ऋण बहीखाता'
        },
        {
          id: 'soil_testing',
          target: 'a[data-navigate="soil"]',
          fallbackSection: 'soil',
          title: 'मृदा परीक्षण प्रयोगशालाएं',
          caption: 'सरकारी लैब में मिट्टी की मुफ्त जांच कराएं।',
          speech: 'अपने नजदीकी सरकारी मृदा परीक्षण केंद्र का पता और फोन नंबर यहाँ देखें। मिट्टी जांच से खाद की बचत होती है।',
          actionName: 'मिट्टी जांच'
        },
        {
          id: 'godowns_storage',
          target: 'a[data-navigate="godowns"]',
          fallbackSection: 'godowns',
          title: 'गोदाम एवं भंडार गृह (वेयरहाउस)',
          caption: 'फसल सुरक्षित रखने के लिए लाइसेंस प्राप्त गोदाम।',
          speech: 'अच्छा भाव मिलने तक अनाज को सुरक्षित रखने के लिए तेलंगाना वेयरहाउसिंग कॉर्पोरेशन के गोदामों की जानकारी यहाँ मौजूद है।',
          actionName: 'गोदाम खोजें'
        },
        {
          id: 'logistics_network',
          target: 'a[data-navigate="logistics"]',
          fallbackSection: 'logistics',
          title: 'लॉजिस्टिक्स व वाहन नेटवर्क',
          caption: 'खेत से मंडी तक फसल ले जाने के लिए वाहन।',
          speech: 'खेत से मंडी तक माल ले जाने के लिए ट्रैक्टर, पिकअप और ट्रकों के सरकारी रेट और संपर्क यहाँ उपलब्ध हैं।',
          actionName: 'लॉजिस्टिक्स'
        },
        {
          id: 'ai_assistant',
          target: '#btnFloatingVoiceSaathi',
          fallbackSection: 'chat',
          title: 'वॉयस साथी एवं AI किसान सहायक',
          caption: 'माइक दबाकर बोलें और आवाज में जवाब सुनें।',
          speech: 'इस हरे माइक बटन को दबाकर आप हिंदी में कोई भी कृषि सवाल बोलकर पूछ सकते हैं। मंडी भाव, खाद, या कीटनाशक सब कुछ बोलकर जानें।',
          actionName: 'वॉयस साथी'
        },
        {
          id: 'whatsapp_support',
          target: '#floatingWhatsAppBtn',
          fallbackSection: 'inventory',
          title: 'व्हाट्सएप AI चैटबॉट',
          caption: 'व्हाट्सएप पर भी सीधे बात करें।',
          speech: 'आप अपने मोबाइल व्हाट्सएप से भी किसान साथी से बात करके मंडी भाव और सलाह ले सकते हैं।',
          actionName: 'व्हाट्सएप'
        },
        {
          id: 'feedback_helpline',
          target: 'a[data-navigate="feedback"]',
          fallbackSection: 'feedback',
          title: 'किसान हेल्पलाइन एवं शिकायत',
          caption: 'टोल फ्री नंबर 1800-180-1551 पर संपर्क करें।',
          speech: 'किसी भी परेशानी के लिए कृषि विभाग को शिकायत या संदेश भेजें। टोल-फ्री नंबर अठारह सौ एक सौ अस्सी पंद्रह इक्यावन भी उपलब्ध है।',
          actionName: 'हेल्पलाइन'
        }
      ]
    },

    ur: {
      langName: 'اردو',
      welcomeTitle: 'محترم کسان بھائیو، کسان ساتھی میں خوش آمدید!',
      welcomeSubtitle: 'اپنی فصلوں کے لیے مناسب منڈی کے بھاؤ، براہ راست خریدار اور صوتی رہنمائی کا پلیٹ فارم۔',
      btnStart: 'ٹیوٹوریل شروع کریں',
      btnListenAgain: 'دوبارہ سنیں',
      btnSkip: 'چھوڑ دیں (اسکپ)',
      btnChangeLang: 'زبان تبدیل کریں',
      btnNext: 'اگلا مرحلہ',
      btnPrev: 'پیچھے جائیں',
      btnFinish: 'مکمل کریں',
      btnRepeatVoice: 'آواز دوبارہ سنیں',
      btnPauseVoice: 'روکیں / چلائیں',
      btnExit: 'باہر نکلیں',
      stepIndicator: 'مرحلہ',
      of: 'کل',
      steps: [
        {
          id: 'welcome_intro',
          target: '#appHeaderTitle',
          fallbackSection: 'inventory',
          title: 'کسان ساتھی تعارف',
          caption: 'کسانوں کے لیے مکمل زرعی اور مارکیٹ پلیٹ فارم۔',
          speech: 'السلام علیکم کسان بھائی! کسان ساتھی آپ کی فصلوں کو بغیر کسی دلال کے سیدھے خریداروں کو مناسب قیمت پر فروخت کرنے میں مدد کرتا ہے۔',
          actionName: 'تعارف'
        },
        {
          id: 'farmer_profile',
          target: 'button[data-navigate="profile"]',
          fallbackSection: 'profile',
          title: 'کسان پروفائل',
          caption: 'آپ کی زمین اور کاشتکاری کا ریکارڈ۔',
          speech: 'یہاں آپ کی کسان پروفائل ہے۔ آپ کا نام، گاؤں اور زمین کی تفصیلات مکمل محفوظ اور خفیہ ہیں۔',
          actionName: 'پروفائل'
        },
        {
          id: 'farmer_inventory',
          target: 'a[data-navigate="inventory"]',
          fallbackSection: 'inventory',
          title: 'کسان کی فصلوں کی فہرست',
          caption: 'آپ کے پاس فروخت کے لیے موجود فصلوں کا ذخیرہ۔',
          speech: 'آپ کی تمام فصلوں کا اسٹاک یہاں موجود ہے۔ آپ نے کتنی مقدار اور کیا قیمت رکھی ہے، باآسانی دیکھ سکتے ہیں۔',
          actionName: 'انوینٹری'
        },
        {
          id: 'add_crop',
          target: 'a[data-navigate="upload"]',
          fallbackSection: 'upload',
          title: 'فصل فروخت کیلئے شامل کریں',
          caption: 'فصل کی تصویر کھینچیں اور فروخت کے لیے لگائیں۔',
          speech: 'اپنی فصل فروخت کرنے کے لیے اس بٹن کو دبائیں۔ تصویر کھینچیں اور وزن درج کریں۔ ایپ خودکار طریقے سے فصل کو پہچان لیتی ہے۔',
          actionName: 'فصل شامل کریں'
        },
        {
          id: 'mandi_prices',
          target: 'a[data-navigate="market-dashboard"]',
          fallbackSection: 'market-dashboard',
          title: 'روزانہ منڈی کے بھاؤ',
          caption: 'تلنگانہ کی انامامولا اور بوئن پلی منڈیوں کے سرکاری ریٹس۔',
          speech: 'یہاں روزانہ منڈی کے سرکاری ریٹس دیکھے جا سکتے ہیں۔ دھان، کپاس، مرچ اور سبزیوں کے تازہ بھاؤ یہاں دستیاب ہیں۔',
          actionName: 'منڈی ریٹ'
        },
        {
          id: 'price_negotiations',
          target: 'a[data-navigate="negotiate"]',
          fallbackSection: 'negotiate',
          title: 'قیمتوں کے مذاکرات (سودا)',
          caption: 'خریداروں کی آفرز دیکھیں اور فیصلہ کریں۔',
          speech: 'خریداروں کی طرف سے دی گئی قیمت کی تجاویز یہاں دیکھیں۔ پسند آئے تو قبول کریں، نہ پسند آئے تو رد کر دیں۔ آپ کی منظوری کے بغیر سودا نہیں ہوگا۔',
          actionName: 'مذاکرات'
        },
        {
          id: 'orders_deliveries',
          target: 'a[data-navigate="orders"]',
          fallbackSection: 'orders',
          title: 'آرڈرز اور ترسیل',
          caption: 'فروخت شدہ فصل کی ڈلیوری کی مکمل معلومات۔',
          speech: 'آپ کے فروخت شدہ آرڈرز اور گاڑی کی معلومات یہاں درج ہوتی ہیں۔',
          actionName: 'آرڈرز'
        },
        {
          id: 'payment_wallet',
          target: 'a[data-navigate="wallet"]',
          fallbackSection: 'wallet',
          title: 'ادائیگی ٹریکنگ اور بٹوہ (والٹ)',
          caption: 'فصل کی مکمل رقم براہ راست آپ کے بینک اکاؤنٹ میں۔',
          speech: 'فصل فروخت ہونے پر تمام رقوم چوبیس گھنٹے میں آپ کے بینک اکاؤنٹ میں ڈی بی ٹی کے ذریعے منتقل ہو جاتی ہیں۔',
          actionName: 'والٹ'
        },
        {
          id: 'blockchain_loans',
          target: 'a[data-navigate="blockchain"]',
          fallbackSection: 'blockchain',
          title: 'بلاک چین قرض کا کھاتہ',
          caption: 'چار فیصد رعایتی شرح سود پر زرعی قرضے۔',
          speech: 'یہاں حکومت تلنگانہ کے رعایتی زرعی قرضوں اور کسان کریڈٹ کارڈ کی تصدیق شدہ تفصیلات موجود ہیں۔',
          actionName: 'قرض کھاتہ'
        },
        {
          id: 'soil_testing',
          target: 'a[data-navigate="soil"]',
          fallbackSection: 'soil',
          title: 'مٹی ٹیسٹ کرنے والی لیبارٹریز',
          caption: 'سرکاری لیبز میں مٹی کا مفت معائنہ کرائیں۔',
          speech: 'اپنے قریبی سرکاری مٹی ٹیسٹنگ مرکز کا پتہ اور رابطہ یہاں دیکھیں۔ مٹی ٹیسٹ سے کھاد کے غیر ضروری اخراجات بچتے ہیں۔',
          actionName: 'مٹی لیبز'
        },
        {
          id: 'godowns_storage',
          target: 'a[data-navigate="godowns"]',
          fallbackSection: 'godowns',
          title: 'گودام اور ویئر ہاؤسز',
          caption: 'فصل کو محفوظ رکھنے کے لیے منظور شدہ گودام۔',
          speech: 'بہتر قیمت ملنے تک اناج کو محفوظ رکھنے کے لیے تلنگانہ اسٹیٹ ویئرہاؤسنگ کے گوداموں کی معلومات یہاں موجود ہیں۔',
          actionName: 'گودام'
        },
        {
          id: 'logistics_network',
          target: 'a[data-navigate="logistics"]',
          fallbackSection: 'logistics',
          title: 'لاجسٹکس اور ٹرانسپورٹ نیٹ ورک',
          caption: 'کھیت سے منڈی تک فصل لے جانے والی گاڑیاں۔',
          speech: 'کھیت سے منڈی تک فصل پہنچانے کے لیے ٹریکٹر اور ٹرک ڈرائیوروں کے سرکاری رابطے یہاں حاصل کریں۔',
          actionName: 'ٹرانسپورٹ'
        },
        {
          id: 'ai_assistant',
          target: '#btnFloatingVoiceSaathi',
          fallbackSection: 'chat',
          title: 'وائس ساتھی اور AI کسان معاون',
          caption: 'مائیک دبا کر اردو میں بولیں اور آواز میں جواب سنیں۔',
          speech: 'اس سبز مائیک بٹن کو دبا کر آپ بول کر کوئی بھی سوال پوچھ سکتے ہیں۔ کھاد، بیماری اور منڈی کے بھاؤ سب آواز میں سنیں۔',
          actionName: 'وائس ساتھی'
        },
        {
          id: 'whatsapp_support',
          target: '#floatingWhatsAppBtn',
          fallbackSection: 'inventory',
          title: 'واٹس ایپ AI سروس',
          caption: 'اپنے فون کے واٹس ایپ پر بھی مدد حاصل کریں۔',
          speech: 'آپ واٹس ایپ کے ذریعے بھی کسان ساتھی سے رابطہ کر کے فوری رہنمائی اور بھاؤ حاصل کر سکتے ہیں۔',
          actionName: 'واٹس ایپ'
        },
        {
          id: 'feedback_helpline',
          target: 'a[data-navigate="feedback"]',
          fallbackSection: 'feedback',
          title: 'کسان ہیلپ لائن اور شکایات',
          caption: 'ٹول فری نمبر 1800-180-1551 پر رابطہ کریں۔',
          speech: 'کسی بھی مسئلے کی صورت میں محکمہ زراعت کو درخواست بھیجیں۔ کسان کال سینٹر اٹھارہ سو ایک سو اسی پندرہ اکیاون ہر وقت حاضر ہے۔',
          actionName: 'ہیلپ لائن'
        }
      ]
    },

    en: {
      langName: 'English',
      welcomeTitle: 'Welcome to KisanSaathi, Farmer Friend!',
      welcomeSubtitle: 'Your trusted platform for direct farm-to-buyer trade, live mandi prices, and voice guidance.',
      btnStart: 'Start Interactive Tutorial',
      btnListenAgain: 'Listen Again',
      btnSkip: 'Skip to Dashboard',
      btnChangeLang: 'Change Language',
      btnNext: 'Next Step',
      btnPrev: 'Previous',
      btnFinish: 'Finish Tutorial',
      btnRepeatVoice: 'Repeat Voice',
      btnPauseVoice: 'Pause / Resume',
      btnExit: 'Exit Tutorial',
      stepIndicator: 'Step',
      of: 'of',
      steps: [
        {
          id: 'welcome_intro',
          target: '#appHeaderTitle',
          fallbackSection: 'inventory',
          title: 'Welcome to KisanSaathi',
          caption: 'Direct farm-to-buyer marketplace with no middlemen.',
          speech: 'Welcome farmer friend! KisanSaathi empowers you to sell your produce directly to verified buyers at fair prices with fast DBT bank settlements.',
          actionName: 'Introduction'
        },
        {
          id: 'farmer_profile',
          target: 'button[data-navigate="profile"]',
          fallbackSection: 'profile',
          title: 'Farmer Profile & Identity',
          caption: 'Your verified farm records and sensitive profile details.',
          speech: 'This is your secure farmer profile. Your landholding records, village, and credit assessment are private and strictly protected.',
          actionName: 'View Profile'
        },
        {
          id: 'farmer_inventory',
          target: 'a[data-navigate="inventory"]',
          fallbackSection: 'inventory',
          title: 'Farmer Inventory',
          caption: 'View and manage all crops available on your farm.',
          speech: 'Here is your live crop stock. You can check your available quantities, current selling rates, and stock status at a single glance.',
          actionName: 'Open Inventory'
        },
        {
          id: 'add_crop',
          target: 'a[data-navigate="upload"]',
          fallbackSection: 'upload',
          title: 'Add Crop to Sell',
          caption: 'Snap a crop photo with automatic AI produce verification.',
          speech: 'Tap here to list produce for sale. Upload a crop photo, specify the quantity, and set your asking rate. Our AI verifies produce authenticity automatically.',
          actionName: 'Add Crop'
        },
        {
          id: 'mandi_prices',
          target: 'a[data-navigate="market-dashboard"]',
          fallbackSection: 'market-dashboard',
          title: 'Daily Market Prices (Mandi Rates)',
          caption: 'Real-time wholesale and retail benchmarks across Telangana.',
          speech: 'Check official daily trading prices from Enumamula, Bowenpally, and other major APMC mandis to negotiate the best possible rate.',
          actionName: 'Mandi Rates'
        },
        {
          id: 'price_negotiations',
          target: 'a[data-navigate="negotiate"]',
          fallbackSection: 'negotiate',
          title: 'Price Negotiations',
          caption: 'Review buyer offers with complete transparency.',
          speech: 'Review offers submitted by bulk buyers. You can accept, reject, or counter-offer. No transaction ever occurs without your explicit confirmation.',
          actionName: 'Negotiations'
        },
        {
          id: 'orders_deliveries',
          target: 'a[data-navigate="orders"]',
          fallbackSection: 'orders',
          title: 'Orders & Dispatches',
          caption: 'Track shipment status and delivery fulfillments.',
          speech: 'Track active buyer orders, delivery waybills, and dispatch schedules seamlessly from farmgate to buyer warehouse.',
          actionName: 'View Orders'
        },
        {
          id: 'payment_wallet',
          target: 'a[data-navigate="wallet"]',
          fallbackSection: 'wallet',
          title: 'Payment Tracking & Wallet',
          caption: 'Direct DBT settlements directly to your bank account.',
          speech: 'Your earnings are deposited into an escrow vault upon sale confirmation and transferred directly to your bank account within 24 hours.',
          actionName: 'Open Wallet'
        },
        {
          id: 'blockchain_loans',
          target: 'a[data-navigate="blockchain"]',
          fallbackSection: 'blockchain',
          title: 'Blockchain Loan Ledger',
          caption: 'Subsidized 4% interest crop loans and financial schemes.',
          speech: 'Inspect pre-approved government crop loans, Rythu Bharosa credit ledgers, and scale-of-finance subsidies backed by immutable records.',
          actionName: 'Credit Ledger'
        },
        {
          id: 'soil_testing',
          target: 'a[data-navigate="soil"]',
          fallbackSection: 'soil',
          title: 'Soil Testing Laboratories',
          caption: 'Locate authorized government soil labs across all 33 districts.',
          speech: 'Find authorized government soil labs for free testing under the Soil Health Card scheme to optimize your fertilizer application.',
          actionName: 'Soil Labs'
        },
        {
          id: 'godowns_storage',
          target: 'a[data-navigate="godowns"]',
          fallbackSection: 'godowns',
          title: 'Godowns & Warehouses',
          caption: 'Verified state warehousing and cold storage facilities.',
          speech: 'Locate licensed warehouses and cold chain storage to safeguard your harvest until market prices are most favorable.',
          actionName: 'Warehouses'
        },
        {
          id: 'logistics_network',
          target: 'a[data-navigate="logistics"]',
          fallbackSection: 'logistics',
          title: 'Logistics Network',
          caption: 'Find verified transport carriers with transparent rates.',
          speech: 'Connect with verified tractors and freight vehicles for reliable farmgate pickup and mandi transport with zero middleman deductions.',
          actionName: 'Logistics'
        },
        {
          id: 'ai_assistant',
          target: '#btnFloatingVoiceSaathi',
          fallbackSection: 'chat',
          title: 'Voice Saathi & AI Assistant',
          caption: 'Tap the mic to ask any farming question naturally.',
          speech: 'Tap the green microphone button at any time to ask farming questions, check mandi prices, or navigate by voice in your own language.',
          actionName: 'Voice Saathi'
        },
        {
          id: 'whatsapp_support',
          target: '#floatingWhatsAppBtn',
          fallbackSection: 'inventory',
          title: 'WhatsApp Helpline Channel',
          caption: 'Bilingual mobile updates straight to your WhatsApp.',
          speech: 'Stay connected through our official WhatsApp advisory channel for instant alerts, market rates, and weather advisories.',
          actionName: 'WhatsApp'
        },
        {
          id: 'feedback_helpline',
          target: 'a[data-navigate="feedback"]',
          fallbackSection: 'feedback',
          title: 'Admin Support & Grievance Helpline',
          caption: 'Direct access to Telangana Rythu Call Center 1800-180-1551.',
          speech: 'Submit any questions or grievances directly to the Agriculture Extension Officers or call the toll-free Kisan Call Center at 1800-180-1551.',
          actionName: 'Helpline'
        }
      ]
    }
  };

  // 2. Engine State
  let currentTutorialLang = localStorage.getItem('kisan_lang') || 'te';
  let isTutorialActive = false;
  let currentStepIndex = 0;
  let activeSpeechUtterance = null;
  let isVoicePaused = false;
  let overlayEl = null;
  let cardEl = null;
  let beaconEl = null;

  // 3. Audio Speech Synthesis helper
  function speakTutorialScript(text, langCode) {
    if (!('speechSynthesis' in window)) return;
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
    utter.rate = 0.95; // Slightly slower, highly clear for rural farmers
    utter.pitch = 1.0;

    // Pick best available native voice if found
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find(v => v.lang === utter.lang || v.lang.startsWith(langCode));
      if (match) utter.voice = match;
    }

    utter.onstart = () => {
      isVoicePaused = false;
      updateVoiceButtonUI(true);
    };

    utter.onend = () => {
      updateVoiceButtonUI(false);
    };

    utter.onerror = () => {
      updateVoiceButtonUI(false);
    };

    activeSpeechUtterance = utter;
    try {
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('[TutorialEngine] TTS speak notice:', e);
      updateVoiceButtonUI(false);
    }
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_e) {}
    }
    activeSpeechUtterance = null;
    isVoicePaused = false;
    updateVoiceButtonUI(false);
  }

  function updateVoiceButtonUI(isPlaying) {
    const btn = document.getElementById('btnTutorialVoiceRepeat');
    if (!btn) return;
    if (isPlaying) {
      btn.classList.add('ring-2', 'ring-emerald-400', 'bg-emerald-100');
    } else {
      btn.classList.remove('ring-2', 'ring-emerald-400', 'bg-emerald-100');
    }
  }

  // 4. Initialize DOM overlay & containers
  function ensureOverlayElements() {
    if (document.getElementById('kisanTutorialSpotlightOverlay')) return;

    // Main SVG Mask Overlay
    const overlay = document.createElement('div');
    overlay.id = 'kisanTutorialSpotlightOverlay';
    overlay.className = 'fixed inset-0 z-[9990] pointer-events-auto transition-opacity duration-300 hidden';
    overlay.innerHTML = `
      <svg id="tutorialSvgMask" class="w-full h-full absolute inset-0 pointer-events-none">
        <defs>
          <mask id="tutorialHoleMask">
            <rect width="100%" height="100%" fill="white" />
            <rect id="tutorialHoleRect" x="0" y="0" width="0" height="0" rx="16" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.78)" mask="url(#tutorialHoleMask)" />
      </svg>
      <div id="tutorialBeacon" class="absolute pointer-events-none transition-all duration-300 hidden">
        <span class="tutorial-pulse-ring"></span>
        <span class="tutorial-beacon-dot"></span>
      </div>
    `;
    document.body.appendChild(overlay);
    overlayEl = overlay;
    beaconEl = document.getElementById('tutorialBeacon');

    // Floating Instruction Card
    const card = document.createElement('div');
    card.id = 'kisanTutorialInstructionCard';
    card.className = 'fixed z-[9995] max-w-[92vw] sm:max-w-md bg-white rounded-3xl shadow-2xl border-2 border-emerald-500/80 p-4 sm:p-5 transition-all duration-300 hidden';
    card.innerHTML = `
      <div class="space-y-3">
        <!-- Header: Step & Farmer Avatar -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div class="flex items-center gap-2.5">
            <!-- Animated Farmer Avatar SVG -->
            <div class="w-11 h-11 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
              <svg class="w-9 h-9 text-emerald-800" viewBox="0 0 64 64" fill="none">
                <!-- Farmer Turban (Paghadi) -->
                <path d="M16 26C16 16 24 10 32 10C40 10 48 16 48 26C48 27 46 29 44 30C38 32 26 32 20 30C18 29 16 27 16 26Z" fill="#10B981" />
                <path d="M22 18C28 14 36 14 42 18" stroke="#34D399" stroke-width="2" stroke-linecap="round" />
                <!-- Farmer Face -->
                <circle cx="32" cy="33" r="13" fill="#FDE68A" />
                <!-- Friendly Eyes & Smile -->
                <circle cx="27" cy="32" r="1.5" fill="#1F2937" />
                <circle cx="37" cy="32" r="1.5" fill="#1F2937" />
                <path d="M28 37C29.5 39.5 34.5 39.5 36 37" stroke="#92400E" stroke-width="2" stroke-linecap="round" />
                <!-- Mustache -->
                <path d="M25 35C28 36 31 34 32 35C33 34 36 36 39 35" stroke="#4B5563" stroke-width="1.8" stroke-linecap="round" />
                <!-- Kurta Collar -->
                <path d="M20 46C20 46 25 43 32 43C39 43 44 46 44 46L48 60H16L20 46Z" fill="#047857" />
              </svg>
            </div>
            <div>
              <span id="tutorialStepBadge" class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"></span>
              <h4 id="tutorialStepTitle" class="font-extrabold text-sm sm:text-base text-gray-900 leading-tight mt-0.5"></h4>
            </div>
          </div>
          <button type="button" id="btnTutorialClose" class="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition" title="Exit">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Spoken Caption & Advice -->
        <div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100/80">
          <p id="tutorialStepCaption" class="text-xs sm:text-sm font-semibold text-emerald-950 leading-relaxed"></p>
        </div>

        <!-- Audio & Voice Control Strip -->
        <div class="flex items-center justify-between text-xs pt-0.5">
          <div class="flex items-center gap-1.5">
            <button type="button" id="btnTutorialVoiceRepeat" class="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 text-emerald-800 font-bold flex items-center gap-1 transition text-[11px] shadow-2xs">
              <svg class="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
              <span id="labelVoiceRepeat">Repeat Voice</span>
            </button>
            <button type="button" id="btnTutorialVoicePause" class="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition shadow-2xs" title="Pause / Resume">
              <svg id="iconVoicePause" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"></path></svg>
            </button>
          </div>
          <button type="button" id="btnTutorialSkip" class="text-[11px] font-bold text-gray-500 hover:text-gray-800 underline decoration-dotted">
            Skip Tutorial
          </button>
        </div>

        <!-- Navigation Buttons: Back, Next, Finish -->
        <div class="flex items-center gap-2 pt-1 border-t border-gray-100">
          <button type="button" id="btnTutorialPrev" class="flex-1 py-2.5 px-3 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-100 transition flex items-center justify-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            <span id="labelBtnPrev">Back</span>
          </button>
          <button type="button" id="btnTutorialNext" class="flex-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] font-extrabold text-xs text-white shadow-md transition flex items-center justify-center gap-1.5">
            <span id="labelBtnNext">Next</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(card);
    cardEl = card;

    // Attach control listeners
    document.getElementById('btnTutorialClose').addEventListener('click', exitTutorial);
    document.getElementById('btnTutorialSkip').addEventListener('click', exitTutorial);
    document.getElementById('btnTutorialPrev').addEventListener('click', prevStep);
    document.getElementById('btnTutorialNext').addEventListener('click', nextStep);
    document.getElementById('btnTutorialVoiceRepeat').addEventListener('click', () => {
      const data = TUTORIAL_DATA[currentTutorialLang] || TUTORIAL_DATA.te;
      const step = data.steps[currentStepIndex];
      if (step) speakTutorialScript(step.speech, currentTutorialLang);
    });
    document.getElementById('btnTutorialVoicePause').addEventListener('click', () => {
      if (!('speechSynthesis' in window)) return;
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        isVoicePaused = true;
      } else if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        isVoicePaused = false;
      } else {
        const data = TUTORIAL_DATA[currentTutorialLang] || TUTORIAL_DATA.te;
        const step = data.steps[currentStepIndex];
        if (step) speakTutorialScript(step.speech, currentTutorialLang);
      }
    });
  }

  // 5. Position spotlight over target element
  function positionSpotlight(targetEl) {
    ensureOverlayElements();
    const holeRect = document.getElementById('tutorialHoleRect');

    if (!targetEl || targetEl.offsetParent === null) {
      // Missing or hidden target: fallback center spotlight
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      if (holeRect) {
        holeRect.setAttribute('x', String(cx - 140));
        holeRect.setAttribute('y', String(cy - 70));
        holeRect.setAttribute('width', '280');
        holeRect.setAttribute('height', '140');
      }
      if (beaconEl) beaconEl.classList.add('hidden');

      // Place instruction card centrally
      cardEl.style.top = `${Math.max(20, cy - 120)}px`;
      cardEl.style.left = `${Math.max(16, (window.innerWidth - 380) / 2)}px`;
      return;
    }

    // Scroll target into center smoothly
    try {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    } catch (_e) {}

    setTimeout(() => {
      const rect = targetEl.getBoundingClientRect();
      const pad = 8;
      const x = Math.max(4, rect.left - pad);
      const y = Math.max(4, rect.top - pad);
      const w = Math.min(window.innerWidth - 8, rect.width + (pad * 2));
      const h = rect.height + (pad * 2);

      if (holeRect) {
        holeRect.setAttribute('x', String(x));
        holeRect.setAttribute('y', String(y));
        holeRect.setAttribute('width', String(w));
        holeRect.setAttribute('height', String(h));
      }

      // Position glowing beacon
      if (beaconEl) {
        beaconEl.classList.remove('hidden');
        beaconEl.style.left = `${x + (w / 2)}px`;
        beaconEl.style.top = `${y + (h / 2)}px`;
      }

      // Position instruction card so it does not obstruct the highlighted item
      const cardHeight = cardEl.offsetHeight || 220;
      const spaceBelow = window.innerHeight - (y + h);
      const spaceAbove = y;

      let topPos;
      if (spaceBelow >= cardHeight + 20) {
        topPos = y + h + 14;
      } else if (spaceAbove >= cardHeight + 20) {
        topPos = y - cardHeight - 14;
      } else {
        topPos = Math.max(16, (window.innerHeight - cardHeight) / 2);
      }

      const cardWidth = Math.min(420, window.innerWidth - 32);
      let leftPos = Math.max(16, Math.min(x, window.innerWidth - cardWidth - 16));

      // Right-to-Left alignment adjustment for Urdu
      if (currentTutorialLang === 'ur') {
        cardEl.setAttribute('dir', 'rtl');
      } else {
        cardEl.setAttribute('dir', 'ltr');
      }

      cardEl.style.top = `${topPos}px`;
      cardEl.style.left = `${leftPos}px`;
      cardEl.style.width = `${cardWidth}px`;
    }, 180);
  }

  // 6. Render current step
  function renderStep(index) {
    const data = TUTORIAL_DATA[currentTutorialLang] || TUTORIAL_DATA.te;
    const steps = data.steps;
    if (index < 0) index = 0;
    if (index >= steps.length) {
      finishTutorial();
      return;
    }

    currentStepIndex = index;
    const step = steps[index];

    // Check if target is inside drawer; if so, open the navigation drawer so farmer sees it
    if (step.target.startsWith('a[data-navigate=') || step.target.includes('drawer')) {
      const drawer = document.getElementById('drawer');
      const drawerOverlay = document.getElementById('drawerOverlay');
      if (drawer && !drawer.classList.contains('open')) {
        drawer.classList.add('open');
        if (drawerOverlay) drawerOverlay.classList.remove('hidden');
      }
    } else if (step.fallbackSection && typeof window.navigateTo === 'function') {
      // If target is in a specific section, route there
      window.navigateTo(step.fallbackSection);
    }

    // Update Card UI
    document.getElementById('tutorialStepBadge').textContent = `${data.stepIndicator} ${index + 1} ${data.of} ${steps.length}`;
    document.getElementById('tutorialStepTitle').textContent = step.title;
    document.getElementById('tutorialStepCaption').textContent = step.caption;
    document.getElementById('labelVoiceRepeat').textContent = data.btnRepeatVoice;
    document.getElementById('btnTutorialSkip').textContent = data.btnSkip;
    document.getElementById('labelBtnPrev').textContent = data.btnPrev;

    const nextBtnLabel = document.getElementById('labelBtnNext');
    if (index === steps.length - 1) {
      nextBtnLabel.textContent = data.btnFinish;
    } else {
      nextBtnLabel.textContent = data.btnNext;
    }

    // Toggle Prev button visibility
    const prevBtn = document.getElementById('btnTutorialPrev');
    if (index === 0) {
      prevBtn.classList.add('opacity-40', 'pointer-events-none');
    } else {
      prevBtn.classList.remove('opacity-40', 'pointer-events-none');
    }

    // Locate target element
    let targetEl = document.querySelector(step.target);
    if (!targetEl && step.fallbackSection) {
      targetEl = document.getElementById(`section${step.fallbackSection.charAt(0).toUpperCase() + step.fallbackSection.slice(1)}`);
    }

    positionSpotlight(targetEl);

    // Speak audio narration
    speakTutorialScript(step.speech, currentTutorialLang);
  }

  function nextStep() {
    renderStep(currentStepIndex + 1);
  }

  function prevStep() {
    if (currentStepIndex > 0) {
      renderStep(currentStepIndex - 1);
    }
  }

  function startTutorial(lang) {
    if (lang && TUTORIAL_DATA[lang]) {
      currentTutorialLang = lang;
    } else {
      currentTutorialLang = localStorage.getItem('kisan_lang') || 'te';
    }

    isTutorialActive = true;
    ensureOverlayElements();

    // Close welcome modal if open
    hideWelcomeModal();

    overlayEl.classList.remove('hidden');
    cardEl.classList.remove('hidden');

    renderStep(0);
  }

  function exitTutorial() {
    isTutorialActive = false;
    stopSpeech();
    if (overlayEl) overlayEl.classList.add('hidden');
    if (cardEl) cardEl.classList.add('hidden');
    if (beaconEl) beaconEl.classList.add('hidden');

    // Close drawer if left open
    const drawer = document.getElementById('drawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    if (drawer) drawer.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.add('hidden');

    // Mark completion in storage
    localStorage.setItem('kisan_tutorial_completed', 'true');
  }

  function finishTutorial() {
    exitTutorial();
    const msgs = {
      te: 'అభినందనలు! మీరు కిసాన్ సాథి ట్యుటోరియల్ విజయవంతంగా పూర్తి చేశారు.',
      hi: 'बधाई हो! आपने किसान साथी ट्यूटोरियल सफलतापूर्वक पूरा कर लिया है।',
      ur: 'مبارک ہو! آپ نے کسان ساتھی ٹیوٹوریل کامیابی کے ساتھ مکمل کر لیا ہے۔',
      en: 'Congratulations! You have completed the KisanSaathi tutorial.'
    };
    if (typeof window.showToast === 'function') {
      window.showToast(msgs[currentTutorialLang] || msgs.te);
    }
    speakTutorialScript(msgs[currentTutorialLang] || msgs.te, currentTutorialLang);
  }

  // 7. Contextual Feature Help: Explain a single page/feature directly
  function explainFeature(featureKey, lang) {
    const l = lang || localStorage.getItem('kisan_lang') || 'te';
    const data = TUTORIAL_DATA[l] || TUTORIAL_DATA.te;
    const stepIdx = data.steps.findIndex(s => s.id === featureKey || s.fallbackSection === featureKey);

    if (stepIdx !== -1) {
      currentTutorialLang = l;
      isTutorialActive = true;
      ensureOverlayElements();
      overlayEl.classList.remove('hidden');
      cardEl.classList.remove('hidden');
      renderStep(stepIdx);
    } else {
      startTutorial(l);
    }
  }

  // 8. First Login Welcome Modal
  function showWelcomeModal(force = false) {
    const isCompleted = localStorage.getItem('kisan_tutorial_completed');
    if (!force && isCompleted === 'true') {
      return; // Returning user, don't obstruct dashboard
    }

    let modal = document.getElementById('modalTutorialWelcome');
    if (!modal) return;

    modal.classList.add('open');
    updateWelcomeModalText(currentTutorialLang);
  }

  function hideWelcomeModal() {
    const modal = document.getElementById('modalTutorialWelcome');
    if (modal) modal.classList.remove('open');
  }

  function updateWelcomeModalText(lang) {
    currentTutorialLang = lang;
    const data = TUTORIAL_DATA[lang] || TUTORIAL_DATA.te;

    const titleEl = document.getElementById('welcomeTutorialTitle');
    const subEl = document.getElementById('welcomeTutorialSubtitle');
    const btnStartEl = document.getElementById('btnWelcomeStartTutorial');
    const btnSkipEl = document.getElementById('btnWelcomeSkipTutorial');
    const btnListenEl = document.getElementById('btnWelcomeListenIntro');

    if (titleEl) titleEl.textContent = data.welcomeTitle;
    if (subEl) subEl.textContent = data.welcomeSubtitle;
    if (btnStartEl) btnStartEl.textContent = data.btnStart;
    if (btnSkipEl) btnSkipEl.textContent = data.btnSkip;
    if (btnListenEl) btnListenEl.textContent = data.btnListenAgain;

    // Highlight selected language button
    document.querySelectorAll('.btn-welcome-lang').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('ring-4', 'ring-emerald-400', 'bg-emerald-600', 'text-white');
        btn.classList.remove('bg-white', 'text-gray-800');
      } else {
        btn.classList.remove('ring-4', 'ring-emerald-400', 'bg-emerald-600', 'text-white');
        btn.classList.add('bg-white', 'text-gray-800');
      }
    });

    if (lang === 'ur') {
      const container = document.getElementById('welcomeModalCard');
      if (container) container.setAttribute('dir', 'rtl');
    } else {
      const container = document.getElementById('welcomeModalCard');
      if (container) container.setAttribute('dir', 'ltr');
    }
  }

  // 9. Re-position on screen resize
  window.addEventListener('resize', () => {
    if (isTutorialActive) {
      const data = TUTORIAL_DATA[currentTutorialLang] || TUTORIAL_DATA.te;
      const step = data.steps[currentStepIndex];
      if (step) {
        let targetEl = document.querySelector(step.target);
        if (!targetEl && step.fallbackSection) {
          targetEl = document.getElementById(`section${step.fallbackSection.charAt(0).toUpperCase() + step.fallbackSection.slice(1)}`);
        }
        positionSpotlight(targetEl);
      }
    }
  });

  // Export to Global namespace
  window.KisanTutorial = {
    startTutorial,
    exitTutorial,
    explainFeature,
    showWelcomeModal,
    hideWelcomeModal,
    updateWelcomeModalText,
    setLanguage: (lang) => { currentTutorialLang = lang; },
    speakIntro: () => {
      const data = TUTORIAL_DATA[currentTutorialLang] || TUTORIAL_DATA.te;
      speakTutorialScript(`${data.welcomeTitle}. ${data.welcomeSubtitle}`, currentTutorialLang);
    }
  };

})(window, document);
