/**
 * KissanSathi Voice Saathi: AI Voice Assistant Engine
 * Powering speech-optimized agricultural advisory in English, Hindi, and Telugu
 */

const https = require('https');

// Strict Language Codes Allowed
const SUPPORTED_LANGUAGES = ['en', 'hi', 'te', 'ur'];

// Spoken Friendly Greetings for Low-Literacy Farmers
const VOICE_GREETINGS = {
  en: (name) => `Namaste ${name || 'Farmer Friend'}! I am KissanSathi Voice Assistant. Speak your question about crop care, fertilizers, mandi rates, or pest control, and I will guide you.`,
  hi: (name) => `नमस्ते ${name || 'किसान साथी'}! मैं किसान साथी वॉयस सहायक हूँ। फसल की देखभाल, खाद, मंडी भाव या कीट नियंत्रण के बारे में बोलकर पूछें, मैं आपकी मदद करूँगा।`,
  te: (name) => `నమస్కారం ${name || 'రైతు మిత్రమా'}! నేను కిసాన్ సాథి వాయిస్ సహాయకుడిని. పంటల సంరక్షణ, ఎరువులు, మండి ధరలు లేదా తెగుళ్ల నివారణ గురించి అడగండి, నేను సమాధానం చెబుతాను.`,
  ur: (name) => `السلام علیکم ${name || 'کسان بھائی'}! میں کسان ساتھی وائس اسسٹنٹ ہوں۔ فصل کی دیکھ بھال، کھاد، منڈی کے بھاؤ یا بیماری کے بارے میں بول کر پوچھیں، میں آپ کی رہنمائی کروں گا۔`
};

// Spoken Fallback Responses for Core Agricultural Topics (Clean Conversational Sentences, No Markdown)
const VOICE_KNOWLEDGE = {
  en: [
    {
      keywords: ['rate', 'price', 'mandi', 'bhav', 'market', 'cost', 'paddy', 'rice', 'cotton', 'turmeric'],
      reply: "Namaste! In Telangana mandis today, Telangana Sona paddy is trading around 2,650 to 2,750 rupees per quintal at Enumamula Mandi, and Sona Masoori is around 2,300 rupees at Bowenpally. Selling directly through KissanSathi ensures direct DBT bank settlement within 24 hours. For live mandi updates, call the Kisan Call Center at 1800-180-1551."
    },
    {
      keywords: ['pest', 'disease', 'spray', 'neem', 'fungus', 'leaf', 'worm', 'insect', 'organic', 'neemastra', 'borer'],
      reply: "For safe organic pest control against stem borers and sucking pests, you can prepare Neemastra. Mix five kilograms of fresh neem leaves, five liters of cow urine, and two kilograms of desi cow dung in water, ferment for forty-eight hours, and spray two hundred milliliters per fifteen-liter pump. For chemical pesticide dosages, always consult your local agricultural extension officer."
    },
    {
      keywords: ['insurance', 'pmfby', 'claim', 'loss', 'rain', 'flood', 'drought', 'damage'],
      reply: "If your crops are damaged due to unseasonal rainfall or weather disasters, you must file a PMFBY crop insurance claim within seventy-two hours of the incident. You can call the toll-free Kisan Call Center at 1800-180-1551 or register your claim with your Mandal Agriculture Officer."
    },
    {
      keywords: ['soil', 'testing', 'card', 'npk', 'fertilizer', 'urea', 'dap', 'lab'],
      reply: "Soil testing is completely free under the National Soil Health Card scheme at the Regional Agricultural Research Station in Mulugu Road Warangal and PJTSAU Rajendranagar. Testing helps you apply only the required urea and DAP, saving fertilizer expenses."
    },
    {
      keywords: ['loan', 'credit', 'kcc', 'money', 'bank', 'interest', 'rythu'],
      reply: "Under the Telangana State Cooperative Bank, pre-approved subsidized crop loans are available at four percent annual interest with prompt repayment. Also, Rythu Bharosa investment support provides ten thousand rupees per acre per year directly into farmer bank accounts."
    }
  ],
  hi: [
    {
      keywords: ['भाव', 'rate', 'price', 'mandi', 'दाम', 'धान', 'कपास', 'हल्दी', 'बाजार', 'मंडी', 'रेट'],
      reply: "नमस्ते किसान साथी! आज वारंगल की एनाममुला मंडी में तेलंगाना सोना धान दो हजार छह सौ पचास से दो हजार सात सौ पचास रुपये प्रति क्विंटल और बोवेनपल्ली मंडी में सोना मसूरी बाईस सौ रुपये प्रति क्विंटल बिक रहा है। किसान साथी से सीधा बेचने पर चौबीस घंटे में आपके बैंक खाते में भुगतान मिल जाता है। अधिक जानकारी के लिए किसान कॉल सेंटर अठारह सौ एक सौ अस्सी पंद्रह इक्यावन पर फोन करें।"
    },
    {
      keywords: ['कीटनाशक', 'pest', 'disease', 'neem', 'स्प्रे', 'रोग', 'कीड़ा', 'फफूंद', 'दवा', 'नीमास्त्र'],
      reply: "धान और कपास में रसचूसक कीड़ों की रोकथाम के लिए जैविक नीमास्त्र बहुत उपयोगी है। पांच किलो नीम की पत्तियां, पांच लीटर गोमूत्र और दो किलो देशी गाय का गोबर मिलाकर अड़तालीस घंटे सड़ाएं, फिर छानकर प्रति पंद्रह लीटर पंप में दो सौ मिलीलीटर मिलाकर छिड़कें। रासायनिक दवाओं के लिए हमेशा कृषि अधिकारी से सलाह लें।"
    },
    {
      keywords: ['बीमा', 'claim', 'pmfby', 'क्लेम', 'नुकसान', 'बारिश', 'मुआवजा'],
      reply: "बेमौसम बारिश या सूखे से फसल का नुकसान होने पर बहत्तर घंटे के भीतर प्रधानमंत्री फसल बीमा योजना में क्लेम दर्ज करना जरूरी है। इसके लिए आप टोल-फ्री नंबर अठारह सौ एक सौ अस्सी पंद्रह इक्यावन पर कॉल कर सकते हैं या अपने कृषि अधिकारी से संपर्क करें।"
    },
    {
      keywords: ['मिट्टी', 'मृदा', 'soil', 'जांच', 'लैब', 'खाद', 'यूरिया'],
      reply: "मृदा स्वास्थ्य कार्ड योजना के तहत मिट्टी की जांच सरकारी लैब में बिल्कुल मुफ्त होती है। वारंगल और हैदराबाद की सरकारी प्रयोगशालाओं में जांच करवाकर आप यूरिया और खाद की सही मात्रा डाल सकते हैं, जिससे पैसे की बचत होगी।"
    },
    {
      keywords: ['ऋण', 'लोन', 'kcc', 'क्रेडिट', 'पैसा', 'बैंक', 'ब्याज', 'रायथू'],
      reply: "सहकारी बैंक से चार प्रतिशत रियायती ब्याज दर पर किसान क्रेडिट कार्ड फसली ऋण उपलब्ध है। साथ ही तेलंगाना रायथू भरोसा योजना के तहत प्रति एकड़ दस हजार रुपये सालाना सीधे आपके बैंक खाते में जमा होते हैं।"
    }
  ],
  te: [
    {
      keywords: ['రేటు', 'ధర', 'మండి', 'ధాన్యం', 'వరి', 'పత్తి', 'పసుపు', 'రేట్లు', 'ధరలు'],
      reply: "నమస్కారం రైతు మిత్రమా! ఈరోజు వరంగల్ ఎనుమాముల మార్కెట్లో తెలంగాణ సోనా వరి క్వింటాలుకు రెండు వేల ఏడు వందల రూపాయల వరకు పలుకుతోంది. బోవెన్‌పల్లిలో సోనా మసూరి సుమారు ఇరవై మూడు వందల రూపాయలు ఉంది. కిసాన్ సాథి ద్వారా నేరుగా విక్రయిస్తే ఇరవై నాలుగు గంటల్లో మీ బ్యాంక్ ఖాతాలో డబ్బులు జమ అవుతాయి. మరిన్ని వివరాలకు టోల్ ఫ్రీ నెంబర్ పద్దెనిమిది వందల నూట ఎనభై పదిహేను యాభై ఒకటి కి కాల్ చేయండి."
    },
    {
      keywords: ['పురుగు', 'తెగులు', 'స్ప్రే', 'వేప', 'నీమాస్త్రం', 'మందు', 'సేంద్రీయ'],
      reply: "వరి మరియు పత్తిలో కాండం తొలుచు పురుగు నివారణకు సేంద్రీయ నీమాస్త్రం చాలా మంచిది. ఐదు కిలోల వేప ఆకులు, ఐదు లీటర్ల ఆవు మూత్రం, రెండు కిలోల ఆవు పేడను నలభై ఎనిమిది గంటలు నానబెట్టి, వడకట్టి, పదిహేను లీటర్ల పంపుకు రెండు వందల మిల్లీలీటర్లు కలిపి పిచికారీ చేయండి. రసాయన మందుల కోసం వ్యవసాయ అధికారి సలహా తీసుకోండి."
    },
    {
      keywords: ['బీమా', 'క్లెయిమ్', 'నష్టం', 'వర్షం', 'వరద', 'pmfby'],
      reply: "అకాల వర్షాల వల్ల పంట నష్టం జరిగితే డెబ్బై రెండు గంటల్లోపు ప్రధానమంత్రి ఫసల్ బీమా యోజన కింద క్లెయిమ్ నమోదు చేసుకోవాలి. ఉచిత సమాచారం కోసం కిసాన్ కాల్ సెంటర్ పద్దెనిమిది వందల నూట ఎనభై పదిహేను యాభై ఒకటి కి ఫోన్ చేయండి."
    },
    {
      keywords: ['నేల', 'మట్టి', 'పరీక్ష', 'ల్యాబ్', 'ఎరువులు', 'యూరియా'],
      reply: "వరంగల్ ములుగు రోడ్డు వ్యవసాయ పరిశోధనా కేంద్రంలో మరియు రాజేంద్రనగర్ ల్యాబ్‌లో మట్టి పరీక్ష ఉచితంగా చేస్తారు. నేల పరీక్ష చేయించడం వల్ల అనవసర ఎరువుల ఖర్చు తగ్గుతుంది."
    },
    {
      keywords: ['రుణం', 'లోన్', 'వడ్డీ', 'క్రెడిట్', 'బ్యాంకు', 'రైతు', 'బంధు', 'భరోసా'],
      reply: "సహకార బ్యాంకు ద్వారా నాలుగు శాతం తక్కువ వడ్డీతో మూడు లక్షల రూపాయల వరకు పంట రుణం లభిస్తుంది. అలాగే రైతు భరోసా ద్వారా ఎకరానికి ఏడాదికి పది వేల రూపాయలు నేరుగా మీ ఖాతాలో జమ అవుతాయి."
    }
  ],
  ur: [
    {
      keywords: ['بھاؤ', 'rate', 'price', 'mandi', 'ریٹ', 'دھان', 'کپاس', 'منڈی', 'قیمت'],
      reply: "السلام علیکم کسان بھائی! آج وارنگل کی انامامولا منڈی میں تلنگانہ سونا دھان دو ہزار چھ سو پچاس سے دو ہزار سات سو پچاس روپے فی کوئنٹل بک رہا ہے۔ کسان ساتھی کے ذریعے سیدھا بیچنے پر چوبیس گھنٹے میں ادائیگی آپ کے بینک اکاؤنٹ میں ہو جاتی ہے۔ مزید معلومات کے لیے کسان کال سینٹر 1800-180-1551 پر رابطہ کریں۔"
    },
    {
      keywords: ['کیڑے', 'کیڑے مار', 'pest', 'disease', 'neem', 'بیماری', 'سپرے', 'نیم'],
      reply: "دھان اور کپاس میں کیڑوں کی روک تھام کے لیے قدرتی نیماسترا بہت مفید ہے۔ پانچ کلو نیم کے پتے، پانچ لیٹر گائے کا پیشاب اور دو کلو دیسی گائے کا گوبر ملا کر دو دن رکھیں، پھر پندرہ لیٹر پمپ میں دو سو ملی لیٹر ملا کر سپرے کریں۔"
    },
    {
      keywords: ['انشورنس', 'بیما', 'claim', 'pmfby', 'نقصان', 'بارش', 'معاوضہ'],
      reply: "بے وقت بارش یا قدرتی آفت سے فصل کا نقصان ہونے پر بہتر گھنٹے کے اندر اندر پردھان منتری فصل بیما یوجنا میں کلیم درج کرنا ضروری ہے۔ مفت کسان کال سینٹر 1800-180-1551 پر فوری رابطہ کریں۔"
    },
    {
      keywords: ['مٹی', 'soil', 'ٹیسٹ', 'لیب', 'کھاد', 'یوریا'],
      reply: "مٹی صحت کارڈ اسکیم کے تحت سرکاری لیب میں مٹی کا معائنہ بالکل مفت ہوتا ہے۔ معائنے سے ضرورت کے مطابق کھاد ڈالنے سے اخراجات میں بڑی بچت ہوتی ہے۔"
    },
    {
      keywords: ['قرض', 'قرضہ', 'loan', 'kcc', 'بینک', 'سود', 'رائیتھو'],
      reply: "کوآپریٹو بینک سے چار فیصد رعایتی شرح سود پر کسان کریڈٹ کارڈ فصلی قرضہ دستیاب ہے۔ تلنگانہ رائیتھو بھروسا کے تحت دس ہزار روپے فی ایکڑ سالانہ براہ راست کسانوں کے کھاتے میں منتقل ہوتے ہیں۔"
    }
  ]
};

// Friendly General Fallbacks for Unmatched Queries
const VOICE_FALLBACKS = {
  en: "Namaste! For detailed assistance on your specific crop question, I recommend consulting your local Agricultural Officer or calling the national Kisan Call Center toll-free at 1800-180-1551. How else can I assist your farm today?",
  hi: "नमस्ते! आपकी फसल के इस सवाल के लिए नजदीकी कृषि विस्तार अधिकारी से संपर्क करें या टोल-फ्री किसान कॉल सेंटर अठारह सौ एक सौ अस्सी पंद्रह इक्यावन पर बात करें। क्या मैं किसी अन्य काम में आपकी सहायता कर सकता हूँ?",
  te: "నమస్కారం! మీ పంటకు సంబంధించిన ఈ ప్రశ్నకు మీ స్థానిక వ్యవసాయ విస్తరణ అధికారిని సంప్రదించండి లేదా జాతీయ కిసాన్ కాల్ సెంటర్ పద్దెనిమిది వందల నూట ఎనభై పదిహేను యాభై ఒకటి కి కాల్ చేయండి.",
  ur: "السلام علیکم! اپنی فصل کے اس سوال کے لیے اپنے مقامی زرعی افسر سے رابطہ کریں یا ٹول فری کسان کال سینٹر اٹھارہ سو ایک سو اسی پندرہ اکیاون پر کال کریں۔ کیا میں کسی اور چیز میں آپ کی مدد کر سکتا ہوں؟"
};

/**
 * Clean text for Speech Synthesis TTS (Removes markdown, asterisks, brackets, symbols)
 */
function cleanTextForSpeech(rawText) {
  if (!rawText) return '';
  return rawText
    .replace(/[*#_~`>]/g, '')                // Remove markdown symbols
    .replace(/\[.*?\]/g, '')                 // Remove bracketed text
    .replace(/\(.*?\)/g, '')                 // Remove parentheses if any
    .replace(/https?:\/\/\S+/g, '')          // Remove URLs
    .replace(/[•–—]/g, ', ')                 // Convert bullet points to pauses
    .replace(/\s+/g, ' ')                    // Normalize spaces
    .trim();
}

/**
 * Call Gemini Generative Language API with strict voice-optimized instructions
 */
function callGeminiVoiceAPI(apiKey, prompt, lang, profileName, model = 'gemini-3.6-flash') {
  return new Promise((resolve, reject) => {
    const langInstructions = lang === 'te'
      ? 'Respond strictly in natural, grammatically correct Telugu (తెలుగు) using conversational sentences.'
      : (lang === 'hi'
        ? 'Respond strictly in natural, polite Hindi (हिन्दी, Devanagari script) using simple conversational sentences.'
        : (lang === 'ur'
          ? 'Respond strictly in natural, polite Urdu (اردو, Urdu script) using simple conversational sentences.'
          : 'Respond strictly in simple, polite Indian English.'));

    const systemPrompt = `You are KissanSathi, a friendly agricultural assistant for Indian farmers.
You support English, Hindi, Telugu, and Urdu.
Reply in the user's selected language: ${langInstructions}
The farmer's name is "${profileName || 'Farmer Friend'}".

STRICT VOICE AUDIO RULES:
1. Your answer will be read ALOUD to the farmer through a voice synthesizer.
2. Keep answers concise, practical, and under 3 to 4 short, simple conversational sentences (maximum 80 words).
3. Do NOT use markdown symbols, asterisks, bullet points, numbered lists, hashtags, tables, or emojis. Write plain, fluent conversational sentences.
4. Help with crop care, irrigation, soil health, fertilizers, pest management, and general farming questions.
5. Never invent live data or market prices. Never provide guessing pesticide dosages or unsafe chemical recipes.
6. For uncertain disease symptoms, politely recommend consulting a local Agricultural Extension Officer (MAO) or calling the Kisan Call Center toll-free at 1800-180-1551.
7. Speak in a warm, encouraging, respectful tone.`;

    const payload = JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\nFarmer's Spoken Question: "${prompt}"` }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.2
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
      timeout: 7000
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
              return resolve(cleanTextForSpeech(text));
            }
          }
          reject(new Error(`Gemini Voice API (${model}) returned status ${res.statusCode}: ${data.slice(0, 100)}`));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Gemini Voice API (${model}) timed out`));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Multi-model fallback for Voice Saathi
 */
async function callVoiceWithFallback(apiKey, prompt, lang, profileName) {
  const models = ['gemini-3.6-flash', 'gemini-3.5-flash'];
  let lastErr = null;
  for (const m of models) {
    try {
      const res = await callGeminiVoiceAPI(apiKey, prompt, lang, profileName, m);
      if (res) return { text: res, model: m };
    } catch (e) {
      lastErr = e;
      console.warn(`[VoiceSaathi] Model ${m} notice:`, e.message);
    }
  }
  throw lastErr || new Error('Voice models unavailable');
}

/**
 * Generate Voice Saathi Response
 */
async function generateVoiceSaathiResponse(query, { language = 'en', profileName = '', apiKey = '' } = {}) {
  const cleanQuery = (query || '').trim();
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : 'en';

  // 1. Check for greeting or empty question
  if (!cleanQuery) {
    const greetingFunc = VOICE_GREETINGS[lang] || VOICE_GREETINGS.en;
    return {
      reply: greetingFunc(profileName),
      provider: 'voice_greeting',
      language: lang,
      geminiConnected: false
    };
  }

  // 2. Check for Gemini Key (from request or process.env)
  const activeKey = apiKey || process.env.GEMINI_API_KEY;
  if (activeKey) {
    try {
      const geminiResult = await callVoiceWithFallback(activeKey, cleanQuery, lang, profileName);
      if (geminiResult && geminiResult.text) {
        return {
          reply: geminiResult.text,
          provider: geminiResult.model,
          language: lang,
          geminiConnected: true
        };
      }
    } catch (err) {
      console.warn('[VoiceSaathi] Gemini API failed, using verified voice knowledge:', err.message);
    }
  }

  // 3. Fallback to Local Verified Voice Knowledge Base
  const lower = cleanQuery.toLowerCase();
  const list = VOICE_KNOWLEDGE[lang] || VOICE_KNOWLEDGE.en;
  for (const item of list) {
    if (item.keywords.some(k => lower.includes(k.toLowerCase()))) {
      return {
        reply: item.reply,
        provider: 'verified_voice_knowledge',
        language: lang,
        geminiConnected: false
      };
    }
  }

  // 4. Fallback default advisory
  const fallbackText = VOICE_FALLBACKS[lang] || VOICE_FALLBACKS.en;
  return {
    reply: fallbackText,
    provider: 'verified_voice_advisory',
    language: lang,
    geminiConnected: false
  };
}

/**
 * Parse incoming HTTP body safely
 */
async function parseBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (_e) { return {}; }
  }
  return new Promise((resolve) => {
    let buf = '';
    req.on('data', c => { buf += c; });
    req.on('end', () => {
      try { resolve(buf ? JSON.parse(buf) : {}); } catch (_e) { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

/**
 * Serverless Route Handler: /api/voice-saathi
 */
async function voiceSaathiHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-key');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      status: 'active',
      service: 'KissanSathi Voice Saathi Engine',
      version: '3.6.0',
      languages: ['en', 'hi', 'te'],
      languageLabels: {
        en: 'English',
        hi: 'हिन्दी',
        te: 'తెలుగు'
      },
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      ttsOptimized: true,
      timestamp: new Date().toISOString()
    }, null, 2));
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    const body = await parseBody(req);
    const query = (body.message || body.query || body.transcript || '').trim();
    const language = (body.language || body.lang || 'en').toLowerCase();
    const profileName = body.profileName || body.farmerName || '';
    const headers = req.headers || {};
    const customKey = (body.apiKey || headers['x-gemini-key'] || '').trim();

    // Prevent oversized audio queries
    if (query.length > 500) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        error: 'Question is too long. Please speak a concise farming question.'
      }));
    }

    const result = await generateVoiceSaathiResponse(query, {
      language,
      profileName,
      apiKey: customKey
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      reply: result.reply,
      spokenText: cleanTextForSpeech(result.reply),
      language: result.language,
      provider: result.provider,
      geminiConnected: result.geminiConnected,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('[VoiceSaathi Error]', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      error: error.message,
      reply: 'An error occurred while generating spoken response. Please call Kisan Call Center 1800-180-1551.'
    }));
  }
}

module.exports = voiceSaathiHandler;
module.exports.generateVoiceSaathiResponse = generateVoiceSaathiResponse;
module.exports.cleanTextForSpeech = cleanTextForSpeech;
module.exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
module.exports.VOICE_GREETINGS = VOICE_GREETINGS;
module.exports.VOICE_KNOWLEDGE = VOICE_KNOWLEDGE;
