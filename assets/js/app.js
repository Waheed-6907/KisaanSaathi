// KisanSaathi Web Portal & Mobile Application Controller
// Safe for client browser execution and Node.js evaluation

function initKisanSaathi() {
  // Initialize State
  let currentLanguage = localStorage.getItem('kisan_lang') || 'en'; // 'en' or 'hi'
  let currentViewMode = localStorage.getItem('kisan_view_mode') || 'mobile'; // 'mobile' or 'desktop'
  let activeSection = 'inventory';
  let activeLeafletMap = null;
  let currentFarmerId = null;
  let currentFarmerName = null;

  // Local state clone of KISAN_DATA
  let inventory = JSON.parse(localStorage.getItem('kisan_inventory')) || [...KISAN_DATA.inventory];
  let negotiations = JSON.parse(localStorage.getItem('kisan_negotiations')) || [...KISAN_DATA.negotiations];
  let orders = JSON.parse(localStorage.getItem('kisan_orders')) || [...KISAN_DATA.orders];
  let wallet = JSON.parse(localStorage.getItem('kisan_wallet')) || { ...KISAN_DATA.wallet };
  let blockchainLedger = JSON.parse(localStorage.getItem('kisan_blockchain')) || [...KISAN_DATA.blockchainLedger];
  let voiceEnabled = false;

  // Dictionary for Localization (Matching strings.xml & strings-hi-rIN.xml)
  // Dictionary for Localization (Matching strings.xml & strings-hi-rIN.xml)
  const I18N = {
    en: {
      app_name: "KisanSaathi",
      tagline: "Direct Farm-to-Buyer with Value Addition & Packaging",
      nav_inventory: "Farmer's Inventory",
      nav_upload: "Add Crop to Sell",
      nav_quality: "Crop Quality Prediction (AI)",
      nav_negotiate: "Price Negotiations",
      nav_orders: "Orders & Deliveries",
      nav_wallet: "Farmer's Earning Wallet",
      nav_loan: "Blockchain Loan Ledger",
      nav_soil: "Soil Testing Labs & Card",
      nav_info: "Advisory & Information Hub",
      nav_godowns: "Godowns & Warehouses",
      nav_logistics: "Logistics Network",
      nav_weather: "Weather Forecast",
      nav_chat: "AI Kisan Assistant (Chatbot)",
      nav_feedback: "Contact Admin / Grievance",
      nav_about: "About Project & Team",
      title_home: "Home",
      title_info: "Info",
      title_quality: "Quality",
      title_chat: "Chat",
      title_profile: "Profile",
      wallet_earning: "Earnings",
      negotiations_title: "Negotiations",
      orders_title: "Orders",
      your_inventory: "Your Crop Inventory",
      total_crops: "Crops Listed",
      add_in_inventory: "Add Inventory Item",
      upload_image_hint: "Tap to take photo or upload crop sample",
      enter_product_name: "Item / Crop Name",
      quality: "Quality Grade",
      quantity_available_in_stock: "Quantity (Kg)",
      price_rs_kg: "Price (₹ / Kg)",
      description: "Crop Description & Harvesting Details",
      submit_crop: "Publish to Telangana Marketplace",
      quality_prediction: "AI Crop Quality Prediction",
      select_category: "Select Crop Category",
      negotiated_prices: "Negotiated Prices by Buyers",
      all_orders: "All Buyer Orders",
      available_balance: "Earning from Crop Selling",
      send_money_to_bank: "Send Money to Bank",
      request_statement: "Statement",
      recents_transactions: "Recent Transactions",
      labs_heading: "Soil Testing Laboratories",
      soil_test_lab: "Find nearest authorized soil testing laboratory in Telangana",
      select_state: "State",
      select_district: "District",
      crop_production_card_title: "Crop Production Methods",
      treatment_card_title: "Crop Disease Remedies",
      horticulture_card_title: "Horticulture Methods",
      policy_card_title: "Government Schemes",
      godown: "Godowns & Warehouses",
      storage_card_title: "Soil Health Card",
      logistics: "Logistics",
      wallet: "Farmer's Earning Wallet",
      about_us: "About Application & Team",
      kisan_mitra_title: "Kisan Mitra AI Assistant",
      tab1_item_details: "Item Details",
      tab2_reviews: "Buyer Reviews",
      edit_details: "Edit Details",
      order_details: "Order Details",
      reach_buyer: "Open Route in Google Maps",
      price: "Price (₹/Kg)",
      quantity: "Stock Available"
    },
    hi: {
      app_name: "किसान साथी",
      tagline: "मूल्य संवर्धन एवं पैकेजिंग के साथ किसान से सीधे खरीदार तक",
      nav_inventory: "किसान इन्वेंटरी",
      nav_upload: "फसल बिक्री हेतु जोड़ें",
      nav_quality: "फसल गुणवत्ता परीक्षण (AI)",
      nav_negotiate: "मूल्य बातचीत (सौदा)",
      nav_orders: "ऑर्डर एवं आपूर्ति",
      nav_wallet: "किसान कमाई वॉलेट",
      nav_loan: "ब्लॉकचेन ऋण बहीखाता",
      nav_soil: "मृदा परीक्षण प्रयोगशालाएं",
      nav_info: "कृषि सलाह एवं सूचना केंद्र",
      nav_godowns: "गोदाम एवं वेयरहाउस",
      nav_logistics: "लॉजिस्टिक्स व वाहन",
      nav_weather: "मौसम पूर्वानुमान",
      nav_chat: "AI किसान सहायक (चैट)",
      nav_feedback: "शिकायत निवारण / संपर्क",
      nav_about: "परियोजना एवं टीम",
      title_home: "होम",
      title_info: "जानकारी",
      title_quality: "गुणवत्ता",
      title_chat: "चैट",
      title_profile: "प्रोफ़ाइल",
      wallet_earning: "कुल कमाई",
      negotiations_title: "बातचीत",
      orders_title: "ऑर्डर",
      your_inventory: "आपकी फसल इन्वेंटरी",
      total_crops: "सूचीबद्ध फसलें",
      add_in_inventory: "इन्वेंटरी में फसल जोड़ें",
      upload_image_hint: "फोटो लें या फसल का नमूना अपलोड करें",
      enter_product_name: "फसल / उत्पाद का नाम",
      quality: "गुणवत्ता श्रेणी",
      quantity_available_in_stock: "उपलब्ध मात्रा (किग्रा)",
      price_rs_kg: "मूल्य (₹ प्रति किग्रा)",
      description: "फसल विवरण एवं कटाई की जानकारी",
      submit_crop: "तेलंगाना मंडी पोर्टल पर प्रकाशित करें",
      quality_prediction: "AI फसल गुणवत्ता परीक्षण",
      select_category: "फसल श्रेणी चुनें",
      negotiated_prices: "खरीदारों द्वारा प्रस्तावित मूल्य",
      all_orders: "सभी खरीदार ऑर्डर",
      available_balance: "फसल बिक्री से अर्जित कमाई",
      send_money_to_bank: "बैंक खाते में पैसे भेजें",
      request_statement: "विवरण पत्र",
      recents_transactions: "हाल के लेनदेन",
      labs_heading: "मृदा परीक्षण प्रयोगशालाएं",
      soil_test_lab: "निकटतम अधिकृत मृदा परीक्षण प्रयोगशाला खोजें",
      select_state: "राज्य",
      select_district: "जिला",
      crop_production_card_title: "फसल उत्पादन विधियाँ",
      treatment_card_title: "फसल रोग एवं जैविक निदान",
      horticulture_card_title: "बागवानी विधियाँ",
      policy_card_title: "सरकारी योजनाएं",
      godown: "गोदाम एवं भंडार गृह",
      storage_card_title: "मृदा स्वास्थ्य कार्ड",
      logistics: "परिवहन व लॉजिस्टिक्स",
      wallet: "किसान कमाई वॉलेट",
      about_us: "एप्लिकेशन एवं टीम परिचय",
      kisan_mitra_title: "किसान मित्र AI सहायक",
      tab1_item_details: "उत्पाद विवरण",
      tab2_reviews: "खरीदार समीक्षाएं",
      edit_details: "विवरण संपादित करें",
      order_details: "ऑर्डर विवरण",
      reach_buyer: "गूगल मैप पर मार्ग देखें",
      price: "मूल्य (₹/किग्रा)",
      quantity: "उपलब्ध स्टॉक"
    }
  };

  // Setup Clock
  function updateClock() {
    const clockEl = document.getElementById('phoneClock');
    if (!clockEl) return;
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hrs}:${mins}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Toast Notification Helper
  function showToast(message, icon = 'check-circle') {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100');
    setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0', 'pointer-events-none');
    }, 3200);
  }

  // =========================================================================
  // AUTHENTICATION & SUPABASE INTEGRATION CONTROLLER
  // =========================================================================
  function updateSupabaseBadge(isConnected = true) {
    const badge = document.getElementById('headerSupabaseStatus');
    if (!badge) return;
    if (isConnected) {
      badge.classList.remove('hidden');
      badge.classList.add('inline-flex');
    }
  }

  function hideLoginScreen() {
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) {
      loginScreen.style.display = 'none';
      loginScreen.classList.add('hidden');
      loginScreen.classList.remove('flex');
    }
    const oauthLoading = document.getElementById('loginOAuthLoading');
    if (oauthLoading) {
      oauthLoading.classList.add('hidden');
    }
  }

  function showLoginScreen() {
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) {
      loginScreen.style.display = 'flex';
      loginScreen.classList.remove('hidden');
      loginScreen.classList.add('flex');
    }
    const oauthLoading = document.getElementById('loginOAuthLoading');
    if (oauthLoading) {
      oauthLoading.classList.add('hidden');
    }
  }

  // Update farmer identity across the app (drawer, profile screen, headers, wallet)
  function applyFarmerProfileUI(farmerName, email, phone, district = 'Warangal Rural', farmerId = '', walletBalance = null, creditScore = null, preApprovedLoan = null) {
    if (farmerName) {
      const drawerFarmerName = document.getElementById('drawerFarmerName');
      if (drawerFarmerName) drawerFarmerName.textContent = farmerName;
      const profileFarmerName = document.getElementById('profileFarmerName');
      if (profileFarmerName) profileFarmerName.textContent = farmerName;
    }

    const locText = (district || 'Warangal Rural') + ', Telangana';
    const drawerFarmerPlace = document.getElementById('drawerFarmerPlace');
    if (drawerFarmerPlace) drawerFarmerPlace.textContent = locText;
    const profileFarmerPlace = document.getElementById('profileFarmerPlace');
    if (profileFarmerPlace) profileFarmerPlace.textContent = locText;

    const contactText = email || (phone ? '+91 ' + phone : '');
    const profileFarmerEmail = document.getElementById('profileFarmerEmail');
    if (profileFarmerEmail && contactText) profileFarmerEmail.textContent = contactText;

    if (farmerId) {
      const profileBadgeId = document.getElementById('profileFarmerIdBadge');
      if (profileBadgeId) profileBadgeId.textContent = 'Verified Farmer (ID: ' + farmerId + ')';
    }

    if (walletBalance !== null && !isNaN(walletBalance)) {
      wallet.balance = Number(walletBalance);
      const walletEl = document.getElementById('walletTotalBalance');
      if (walletEl) walletEl.textContent = '₹' + Number(walletBalance).toLocaleString('en-IN');
    }

    if (creditScore !== null) {
      const csEl = document.getElementById('profileCreditScoreValue');
      if (csEl) csEl.textContent = creditScore;
      const drawerCsEl = document.getElementById('drawerCreditScoreBadge');
      if (drawerCsEl) drawerCsEl.textContent = 'Agri Credit Score: ' + creditScore;
    }

    if (preApprovedLoan !== null) {
      const loanEl = document.getElementById('profileLoanAmountValue');
      if (loanEl) loanEl.textContent = '₹' + Number(preApprovedLoan).toLocaleString('en-IN');
    }
  }

  // Record user login into Supabase database (profiles table + user_logins audit table)
  async function recordLoginInDatabase(farmerProfile, farmerName, provider = 'credentials') {
    if (!window.supabaseClient) return;
    try {
      console.log('📡 Recording login in Supabase database for:', farmerName, farmerProfile?.email || farmerProfile?.phone);

      // 1. Update / Record in public.profiles table
      if (farmerProfile.farmer_id) {
        await window.supabaseClient
          .from('profiles')
          .update({
            user_id: farmerProfile.user_id || null,
            updated_at: new Date().toISOString()
          })
          .eq('farmer_id', farmerProfile.farmer_id);
      }

      // 2. Insert into user_logins audit table
      try {
        await window.supabaseClient
          .from('user_logins')
          .insert([
            {
              user_id: farmerProfile.user_id || null,
              farmer_id: farmerProfile.farmer_id || null,
              email: farmerProfile.email || '',
              full_name: farmerName,
              provider: provider,
              logged_in_at: new Date().toISOString(),
              user_agent: navigator.userAgent
            }
          ]);
        console.log('✔ Successfully recorded login audit in user_logins table!');
      } catch (e) {
        // user_logins audit insert is non-blocking
      }
    } catch (e) {
      console.warn('Database login recording notice:', e.message);
    }
  }

  // Set active farmer session across storage, UI, and navigation
  async function setActiveFarmerSession(farmerProfile, provider = 'credentials') {
    const farmerId = farmerProfile.farmer_id || 'FARMER-TG-7721';
    const farmerName = farmerProfile.full_name || 'Farmer';
    const email = farmerProfile.email || '';
    const phone = farmerProfile.phone || '';
    const district = farmerProfile.district || 'Warangal Rural';
    const state = farmerProfile.state || 'Telangana';
    const walletBalance = Number(farmerProfile.wallet_balance || 25000);
    const creditScore = Number(farmerProfile.agri_credit_score || 780);
    const preApprovedLoan = Number(farmerProfile.pre_approved_loan || 250000);

    // Isolate user session: if switching farmers or new account, reset arrays
    if (currentFarmerId !== farmerId) {
      inventory = [];
      orders = [];
      negotiations = [];
      wallet.balance = walletBalance;
      wallet.transactions = [];
      localStorage.removeItem('kisan_inventory');
      localStorage.removeItem('kisan_orders');
      localStorage.removeItem('kisan_negotiations');
    }

    const localSession = {
      authenticated: true,
      farmerId: farmerId,
      farmerName: farmerName,
      email: email,
      phone: phone,
      district: district,
      state: state,
      walletBalance: walletBalance,
      creditScore: creditScore,
      preApprovedLoan: preApprovedLoan,
      supabaseId: farmerProfile.user_id || null,
      provider: provider,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('kisan_auth', JSON.stringify(localSession));

    // Update global references
    currentFarmerId = farmerId;
    currentFarmerName = farmerName;

    // Update UI elements
    applyFarmerProfileUI(farmerName, email, phone, district, farmerId, walletBalance, creditScore, preApprovedLoan);
    updateSupabaseBadge(true);

    // Completely dismiss login screen and redirect to homepage
    hideLoginScreen();
    navigateTo('inventory');

    // Clean URL query and hash (remove ?code=... or #access_token=...)
    if (window.location.search.includes('code=') || window.location.hash.includes('access_token=')) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    // Record login in database & sync user-scoped data
    await recordLoginInDatabase(farmerProfile, farmerName, provider);
    await syncWithSupabase();
  }

  // Handle Google OAuth callback & profile resolution
  async function handleUserAuthenticated(user, provider = 'google') {
    const email = user.email || '';
    const googleName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       (user.email ? user.email.split('@')[0] : 'Farmer');

    console.log('Handling Google User Authentication in Supabase:', email);
    let activeProfile = null;

    if (window.supabaseClient) {
      try {
        // 1. Look up existing profile by email or user_id
        const { data: existingProfiles, error: fetchErr } = await window.supabaseClient
          .from('profiles')
          .select('*')
          .or(`user_id.eq.${user.id},email.eq.${email}`);

        if (!fetchErr && existingProfiles && existingProfiles.length > 0) {
          activeProfile = existingProfiles[0];
          console.log('✔ Found existing Supabase profile for Google user:', activeProfile.farmer_id);
        } else {
          // 2. First-time Google login: Automatically create verified profile in Supabase
          const newFarmerId = 'FARMER-TG-' + (user.id ? user.id.slice(0, 4).toUpperCase() : Math.floor(1000 + Math.random() * 9000));
          const newProfile = {
            user_id: user.id,
            farmer_id: newFarmerId,
            full_name: googleName,
            email: email,
            phone: user.phone || '98' + Math.floor(10000000 + Math.random() * 90000000),
            village: 'Telangana Farmlands',
            district: 'Warangal Rural',
            state: 'Telangana',
            wallet_balance: 25000.00,
            agri_credit_score: 780,
            pre_approved_loan: 250000.00,
            updated_at: new Date().toISOString()
          };

          const { data: inserted, error: insErr } = await window.supabaseClient
            .from('profiles')
            .insert([newProfile])
            .select();

          if (!insErr && inserted && inserted.length > 0) {
            activeProfile = inserted[0];
            console.log('✔ Auto-registered new Google farmer profile in Supabase:', newFarmerId);
          } else {
            activeProfile = newProfile;
          }
        }
      } catch (e) {
        console.warn('Google profile lookup notice:', e);
      }
    }

    if (!activeProfile) {
      activeProfile = {
        farmer_id: 'FARMER-TG-' + (user.id ? user.id.slice(0, 4).toUpperCase() : '7721'),
        full_name: googleName,
        email: email,
        wallet_balance: 25000,
        agri_credit_score: 780,
        pre_approved_loan: 250000
      };
    }

    await setActiveFarmerSession(activeProfile, provider);
    showToast(`Welcome, ${googleName}! Logged in via Google.`);
  }

  async function checkAuthStatus() {
    const loginScreen = document.getElementById('loginScreen');
    const oauthLoading = document.getElementById('loginOAuthLoading');
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const authError = urlParams.get('error') || urlParams.get('error_description');
    const hasHash = window.location.hash && window.location.hash.includes('access_token');

    // 1. Check for OAuth callback error
    if (authError) {
      console.error('Google OAuth URL Error:', authError);
      showToast('OAuth Error: ' + authError);
      showLoginScreen();
      return;
    }

    // 2. If OAuth callback params detected in URL (?code=... or #access_token=...)
    if (authCode || hasHash) {
      console.log('🔑 Detected OAuth redirect in URL. Initializing session exchange...');
      if (oauthLoading) oauthLoading.classList.remove('hidden');

      // If PKCE authorization code in URL, explicitly exchange it
      if (authCode && window.supabaseClient) {
        try {
          const { data, error } = await window.supabaseClient.auth.exchangeCodeForSession(authCode);
          if (!error && data && data.session && data.session.user) {
            console.log('✔ Auth code exchanged successfully for user:', data.session.user.email);
            await handleUserAuthenticated(data.session.user, 'google');
            return;
          } else if (error) {
            console.warn('Supabase exchangeCodeForSession notice:', error.message);
          }
        } catch (err) {
          console.warn('Exception during code exchange:', err);
        }
      }
    }

    // 3. Check live Supabase Auth session
    if (window.supabaseClient) {
      try {
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        if (!error && session && session.user) {
          console.log('✔ Found active Supabase session for user:', session.user.email);
          await handleUserAuthenticated(session.user, 'google');
          return;
        }
      } catch (e) {
        console.warn('Supabase getSession notice:', e);
      }
    }

    // 4. Check local storage session
    const authData = localStorage.getItem('kisan_auth');
    if (authData) {
      try {
        const localSession = JSON.parse(authData);
        if (localSession && localSession.authenticated) {
          currentFarmerId = localSession.farmerId || 'FARMER-TG-7721';
          currentFarmerName = localSession.farmerName || 'Farmer';
          applyFarmerProfileUI(
            localSession.farmerName,
            localSession.email,
            localSession.phone,
            localSession.district,
            localSession.farmerId,
            localSession.walletBalance,
            localSession.creditScore,
            localSession.preApprovedLoan
          );
          hideLoginScreen();
          updateSupabaseBadge(true);
          syncWithSupabase();
          navigateTo('inventory');
          return;
        }
      } catch (e) {
        console.warn('Corrupted local auth data');
      }
    }

    // 5. If no active session, show login screen
    showLoginScreen();
  }

  // Register realtime Supabase Auth state listener
  if (window.supabaseClient) {
    try {
      window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
        console.log('⚡ Supabase onAuthStateChange:', event, session?.user?.email);
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session && session.user) {
          await handleUserAuthenticated(session.user, session.user.app_metadata?.provider || 'google');
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('kisan_auth');
          showLoginScreen();
        }
      });
    } catch (e) {
      console.warn('Supabase auth state listener error:', e);
    }
  }

  // Supabase Data Sync: Fetch user-scoped crops, negotiations, orders, and wallet
  async function syncWithSupabase() {
    if (!window.supabaseClient) return;

    // Resolve active farmer ID
    let activeFarmerId = currentFarmerId || 'FARMER-TG-7721';
    const authData = localStorage.getItem('kisan_auth');
    if (authData) {
      try {
        const sess = JSON.parse(authData);
        if (sess.farmerId) activeFarmerId = sess.farmerId;
      } catch (e) {}
    }

    try {
      console.log('🔄 Syncing user progress with Supabase for Farmer ID:', activeFarmerId);

      // 1. Fetch THIS farmer's crops from Supabase `crops` table
      let { data: cropsData, error: cropsErr } = await window.supabaseClient
        .from('crops')
        .select('*')
        .eq('farmer_id', activeFarmerId)
        .order('created_at', { ascending: false });

      // If demo farmer with 0 crops, fallback to seed crops
      if ((!cropsData || cropsData.length === 0) && activeFarmerId === 'FARMER-TG-7721') {
        const { data: allCrops } = await window.supabaseClient
          .from('crops')
          .select('*')
          .order('created_at', { ascending: false });
        cropsData = allCrops;
      }

      if (!cropsErr && cropsData) {
        console.log('✔ Loaded', cropsData.length, 'crops from Supabase for farmer:', activeFarmerId);
        inventory = cropsData.map(c => ({
          id: c.id,
          title: c.crop_name,
          title_hi: c.crop_name,
          category: c.category || 'grain',
          quality: c.ai_grade || 'Elite',
          quantity: Number(c.quantity_kg),
          price: Number(c.price_per_kg),
          description: c.description || 'Certified produce from Telangana farmlands.',
          description_hi: c.description || 'तेलंगाना कृषि भूमि से प्रमाणित उत्पाद।',
          defect: Number(c.defect_ratio || 2.1),
          dateAdded: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          image: c.image_url || 'assets/raw/paddy.png',
          reviews: []
        }));
        localStorage.setItem('kisan_inventory', JSON.stringify(inventory));
        renderInventory();
      } else if (!cropsErr && (!cropsData || cropsData.length === 0) && activeFarmerId !== 'FARMER-TG-7721') {
        inventory = [];
        localStorage.setItem('kisan_inventory', JSON.stringify(inventory));
        renderInventory();
      }

      // 2. Fetch negotiations scoped to this farmer
      let { data: negData, error: negErr } = await window.supabaseClient
        .from('negotiations')
        .select('*')
        .eq('farmer_id', activeFarmerId)
        .order('created_at', { ascending: false });

      if ((!negData || negData.length === 0) && activeFarmerId === 'FARMER-TG-7721') {
        const { data: allNeg } = await window.supabaseClient
          .from('negotiations')
          .select('*')
          .order('created_at', { ascending: false });
        negData = allNeg;
      }

      if (!negErr && negData) {
        if (negData.length > 0) {
          negotiations = negData.map(n => ({
            id: n.id,
            buyer: {
              name: n.buyer_name,
              phone: "+91 98480 33412",
              location: n.mandi_location || "Bowenpally Modern Market Yard"
            },
            itemTitle: n.crop_name,
            actualPrice: Number(n.counter_price_per_kg || (n.offer_price_per_kg * 1.1).toFixed(0)),
            proposedPrice: Number(n.offer_price_per_kg),
            quantity: Number(n.offered_quantity_kg),
            image: "assets/raw/paddy.png",
            status: n.status || "pending",
            note: `Offer from ${n.buyer_company || n.buyer_name} at ₹${n.offer_price_per_kg}/Kg for ${n.offered_quantity_kg} Kg.`
          }));
        } else if (activeFarmerId !== 'FARMER-TG-7721') {
          negotiations = [];
        }
        localStorage.setItem('kisan_negotiations', JSON.stringify(negotiations));
        if (activeSection === 'negotiate') renderNegotiations();
      }

      // 3. Fetch orders scoped to this farmer
      try {
        let { data: ordersData, error: ordersErr } = await window.supabaseClient
          .from('orders')
          .select('*')
          .eq('farmer_id', activeFarmerId)
          .order('created_at', { ascending: false });

        if ((!ordersData || ordersData.length === 0) && activeFarmerId === 'FARMER-TG-7721') {
          const { data: allOrders } = await window.supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
          ordersData = allOrders;
        }

        if (!ordersErr && ordersData) {
          if (ordersData.length > 0) {
            orders = ordersData.map(o => ({
              id: o.id,
              receiptNumber: `KS-TG-2026-${o.id ? o.id.slice(0, 5).toUpperCase() : Math.floor(10000 + Math.random()*90000)}`,
              date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
              amount: Number(o.total_amount),
              completed: o.escrow_status === 'escrow_released',
              status: o.escrow_status === 'escrow_released' ? 'Delivered' : 'In Transit',
              buyer: {
                first_name: o.buyer_name,
                phone: '+91 98480 33412',
                address: 'Bowenpally Modern Market Yard, Secunderabad, Telangana'
              },
              items: [
                { name: o.crop_name, quantity: Number(o.quantity_kg), pricePerKg: Number(o.price_per_kg || 28), total: Number(o.total_amount) }
              ],
              route: {
                origin: "Geesugonda, Warangal (17.9689, 79.5941)",
                destination: "Bowenpally Mandi, Secunderabad (17.4770, 78.4870)",
                distanceKm: 148,
                logisticsPartner: "VRL Telangana Agri-Freight"
              }
            }));
          } else if (activeFarmerId !== 'FARMER-TG-7721') {
            orders = [];
          }
          localStorage.setItem('kisan_orders', JSON.stringify(orders));
          if (activeSection === 'orders') renderOrders();
        }
      } catch (ordErr) {
        console.warn('Orders fetch notice:', ordErr);
      }

      // 4. Fetch wallet transactions scoped to this farmer
      try {
        const { data: txData, error: txErr } = await window.supabaseClient
          .from('wallet_transactions')
          .select('*')
          .eq('farmer_id', activeFarmerId)
          .order('created_at', { ascending: false });

        if (!txErr && txData && txData.length > 0) {
          wallet.transactions = txData.map(t => ({
            id: t.id,
            buyer: t.title,
            amount: t.type === 'debit' ? -Number(t.amount) : Number(t.amount),
            type: t.type,
            time: new Date(t.created_at).toLocaleString(),
            desc: t.tx_hash ? `Tx: ${t.tx_hash.slice(0, 10)}...` : 'Direct Escrow Settlement'
          }));
          localStorage.setItem('kisan_wallet', JSON.stringify(wallet));
          if (activeSection === 'wallet') renderWallet();
        }
      } catch (txEx) {}

      // 5. Fetch latest profile stats
      const { data: profData } = await window.supabaseClient
        .from('profiles')
        .select('*')
        .eq('farmer_id', activeFarmerId)
        .maybeSingle();

      if (profData) {
        applyFarmerProfileUI(
          profData.full_name,
          profData.email,
          profData.phone,
          profData.district,
          profData.farmer_id,
          profData.wallet_balance,
          profData.agri_credit_score,
          profData.pre_approved_loan
        );
      }

    } catch (err) {
      console.warn('Supabase data sync notice:', err.message);
    }
  }

  // Switch between Login and Registration tabs
  function switchLoginTab(tab) {
    const loginSec = document.getElementById('loginFormSection');
    const regSec = document.getElementById('registerFormSection');
    const btnLogin = document.getElementById('tabBtnLogin');
    const btnReg = document.getElementById('tabBtnRegister');

    if (tab === 'login') {
      if (loginSec) loginSec.classList.remove('hidden');
      if (regSec) regSec.classList.add('hidden');
      if (btnLogin) btnLogin.className = 'flex-1 pb-2.5 border-b-2 border-purple-700 text-purple-700 font-bold';
      if (btnReg) btnReg.className = 'flex-1 pb-2.5 text-gray-500 hover:text-gray-800 font-medium';
    } else {
      if (loginSec) loginSec.classList.add('hidden');
      if (regSec) regSec.classList.remove('hidden');
      if (btnLogin) btnLogin.className = 'flex-1 pb-2.5 text-gray-500 hover:text-gray-800 font-medium';
      if (btnReg) btnReg.className = 'flex-1 pb-2.5 border-b-2 border-purple-700 text-purple-700 font-bold';
    }
  }
  window.switchLoginTab = switchLoginTab;

  async function handleSignOut() {
    if (window.supabaseClient) {
      try {
        await window.supabaseClient.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout notice:', e);
      }
    }
    localStorage.removeItem('kisan_auth');
    localStorage.removeItem('kisan_inventory');
    localStorage.removeItem('kisan_orders');
    localStorage.removeItem('kisan_negotiations');
    localStorage.removeItem('kisan_wallet');
    currentFarmerId = null;
    currentFarmerName = null;
    showLoginScreen();
    showToast(currentLanguage === 'hi' ? 'सफलतापूर्वक लॉगआउट किया गया' : 'Logged out successfully');
  }
  window.handleSignOut = handleSignOut;

  // Bind Registration Form Button
  const btnSubmitRegister = document.getElementById('btnSubmitRegister');
  if (btnSubmitRegister) {
    btnSubmitRegister.addEventListener('click', async () => {
      const nameInput = document.getElementById('regFullName');
      const phoneInput = document.getElementById('regPhoneNumber');
      const pinInput = document.getElementById('regPinCode');
      const distInput = document.getElementById('regDistrict');
      const villageInput = document.getElementById('regVillage');

      const fullName = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const pin = pinInput ? pinInput.value.trim() : '1234';
      const district = distInput ? distInput.value : 'Warangal Rural';
      const village = villageInput ? villageInput.value.trim() : 'Geesugonda';

      if (!fullName || fullName.length < 2) {
        alert('Please enter your full name (at least 2 letters).');
        return;
      }
      if (!phone || phone.length < 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }

      showToast('Registering farmer profile in Supabase...');

      if (window.supabaseClient) {
        try {
          // 1. Check if mobile already exists in Supabase profiles
          const { data: existing, error: checkErr } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('phone', phone);

          if (!checkErr && existing && existing.length > 0) {
            alert('⚠️ A farmer account with mobile +91 ' + phone + ' already exists!\n\nSwitching to Login tab so you can log in.');
            switchLoginTab('login');
            const loginPhone = document.getElementById('loginPhoneNumber');
            if (loginPhone) loginPhone.value = phone;
            return;
          }

          // 2. Generate unique farmer ID
          const farmerId = 'FARMER-TG-' + Math.floor(1000 + Math.random() * 9000);

          // 3. Insert profile into Supabase
          const profileData = {
            farmer_id: farmerId,
            full_name: fullName,
            phone: phone,
            village: village || 'Geesugonda',
            district: district || 'Warangal Rural',
            state: 'Telangana',
            wallet_balance: 10000.00,
            agri_credit_score: 750,
            pre_approved_loan: 200000.00,
            updated_at: new Date().toISOString()
          };

          // Try inserting with password_pin
          let insertRes = await window.supabaseClient.from('profiles').insert([{
            ...profileData,
            password_pin: pin
          }]).select();

          if (insertRes.error) {
            console.warn('Retrying insert without password_pin column:', insertRes.error.message);
            insertRes = await window.supabaseClient.from('profiles').insert([profileData]).select();
          }

          if (insertRes.error) {
            alert('Registration error: ' + insertRes.error.message);
            return;
          }

          console.log('✔ Farmer registered successfully in Supabase:', farmerId);

          // 4. Auto-login the newly registered farmer
          const createdProfile = (insertRes.data && insertRes.data[0]) ? insertRes.data[0] : profileData;
          await setActiveFarmerSession(createdProfile, 'registered');
          showToast(`Welcome to KisanSaathi, ${fullName}! Your Farmer ID is ${farmerId}`);

        } catch (err) {
          console.error('Registration exception:', err);
          alert('Registration error: ' + err.message);
        }
      } else {
        alert('Supabase client is offline. Please check your internet connection.');
      }
    });
  }

  // Bind Registered Farmer Login Button
  const btnSubmitLogin = document.getElementById('btnSubmitLogin');
  if (btnSubmitLogin) {
    btnSubmitLogin.addEventListener('click', async () => {
      const phoneInput = document.getElementById('loginPhoneNumber');
      const pinInput = document.getElementById('loginPinCode');
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const pin = pinInput ? pinInput.value.trim() : '';

      if (!phone || phone.length < 10) {
        alert('Please enter your 10-digit registered mobile number.');
        return;
      }

      showToast('Verifying registered farmer in Supabase...');

      if (window.supabaseClient) {
        try {
          const { data, error } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('phone', phone);

          if (error) {
            console.error('Login query error:', error);
            alert('Login query error: ' + error.message);
            return;
          }

          if (!data || data.length === 0) {
            alert('❌ Mobile number +91 ' + phone + ' is NOT registered!\n\nPlease click "New Registration" to create your account first.');
            switchLoginTab('register');
            const regPhone = document.getElementById('regPhoneNumber');
            if (regPhone) regPhone.value = phone;
            return;
          }

          const farmerProfile = data[0];

          // If password_pin is present on profile, verify PIN
          if (farmerProfile.password_pin && pin && farmerProfile.password_pin !== pin) {
            alert('❌ Incorrect PIN entered! Please enter your valid 4-digit PIN.');
            return;
          }

          // Successful login
          await setActiveFarmerSession(farmerProfile, 'credentials');
          showToast(`Welcome back, ${farmerProfile.full_name}!`);

        } catch (err) {
          console.error('Login exception:', err);
          alert('Login error: ' + err.message);
        }
      } else {
        alert('Supabase client offline.');
      }
    });
  }

  const btnGoogleLogin = document.getElementById('btnGoogleLogin');
  if (btnGoogleLogin) {
    btnGoogleLogin.addEventListener('click', async () => {
      // 1. Check if running on local file:// protocol
      if (window.location.protocol === 'file:') {
        alert(
          "⚠️ Google OAuth Notice:\n\n" +
          "Google does not permit OAuth callbacks to local 'file://' URLs for security.\n\n" +
          "To use real Google / Gmail Login:\n" +
          "• Start your local server: run 'npm start' in terminal\n" +
          "• Open: http://localhost:3000 in your browser\n\n" +
          "For testing right now without a server, use 'Quick Farmer Login' or 'Mobile OTP Login'!"
        );
        return;
      }

      if (window.supabaseClient) {
        const oauthLoading = document.getElementById('loginOAuthLoading');
        if (oauthLoading) oauthLoading.classList.remove('hidden');
        showToast(currentLanguage === 'hi' ? 'Google / Gmail लॉगिन शुरू हो रहा है...' : 'Connecting to Google OAuth...');
        try {
          const redirectUrl = window.location.origin + window.location.pathname;
          console.log('Initiating Supabase Google OAuth with callback:', redirectUrl);

          const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl
            }
          });

          if (error) {
            console.error('Supabase Google OAuth error:', error);
            if (oauthLoading) oauthLoading.classList.add('hidden');
            alert(
              "Google Sign-In Error: " + error.message + "\n\n" +
              "Check that '" + window.location.origin + "/*' is added under:\n" +
              "Supabase Dashboard > Authentication > URL Configuration > Redirect URLs"
            );
          } else if (data && data.url) {
            // Explicitly redirect browser window to Google OAuth screen
            console.log('Redirecting to Google:', data.url);
            window.location.href = data.url;
          }
        } catch (err) {
          console.error('OAuth redirect exception:', err);
          const oauthLoading = document.getElementById('loginOAuthLoading');
          if (oauthLoading) oauthLoading.classList.add('hidden');
          alert('OAuth Error: ' + err.message);
        }
      } else {
        alert('Supabase client is not loaded. Please verify internet connectivity.');
      }
    });
  }

  const btnLoginLangToggle = document.getElementById('btnLoginLangToggle');
  if (btnLoginLangToggle) {
    btnLoginLangToggle.addEventListener('click', () => {
      applyLanguage(currentLanguage === 'en' ? 'hi' : 'en');
    });
  }

  const btnSignOutHeader = document.getElementById('btnSignOutHeader');
  if (btnSignOutHeader) {
    btnSignOutHeader.addEventListener('click', () => {
      handleSignOut();
    });
  }

  // Apply Language
  function applyLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('kisan_lang', lang);

    const langLabel = document.getElementById('currentLangLabel');
    if (langLabel) {
      langLabel.textContent = lang === 'en' ? 'English (En)' : 'हिंदी (Hindi)';
    }

    const loginLangLabel = document.getElementById('loginLangLabel');
    if (loginLangLabel) {
      loginLangLabel.textContent = lang === 'en' ? 'हिंदी' : 'English';
    }

    const loginSubText = document.getElementById('loginSubText');
    if (loginSubText) {
      loginSubText.textContent = lang === 'hi'
        ? 'कृषि एवं किसान कल्याण विभाग, तेलंगाना सरकार'
        : 'Department of Agriculture & Farmers Welfare, Telangana';
    }

    const dict = I18N[lang] || I18N.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    const appHeaderTitle = document.getElementById('appHeaderTitle');
    if (appHeaderTitle) {
      appHeaderTitle.textContent = dict.app_name;
    }

    // Refresh bilingual chat
    if (typeof initOrUpdateChat === 'function') {
      initOrUpdateChat(lang);
    }

    // Refresh active section data rendering
    renderActiveSection();
    showToast(lang === 'hi' ? 'भाषा बदलकर हिंदी कर दी गई है' : 'Language switched to English');
  }

  // View Mode Switcher
  function applyViewMode(mode) {
    currentViewMode = mode;
    localStorage.setItem('kisan_view_mode', mode);
    const appContainer = document.getElementById('appContainer');
    const phoneShell = document.getElementById('phoneShell');
    const phoneStatusBar = document.getElementById('phoneStatusBar');
    const viewModeLabel = document.getElementById('viewModeLabel');
    const viewModeIcon = document.getElementById('viewModeIcon');

    if (mode === 'desktop') {
      appContainer.className = 'mode-desktop px-4 py-6';
      phoneShell.className = 'w-full min-h-[820px] bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col border border-gray-200';
      phoneStatusBar.style.display = 'none';
      viewModeLabel.textContent = '💻 View: Desktop Portal Mode';
      viewModeIcon.setAttribute('data-lucide', 'monitor');
    } else {
      appContainer.className = 'mode-mobile-wrapper';
      phoneShell.className = 'phone-frame';
      phoneStatusBar.style.display = 'flex';
      viewModeLabel.textContent = '📱 View: Mobile App View';
      viewModeIcon.setAttribute('data-lucide', 'smartphone');
    }
    if (window.lucide) lucide.createIcons();
  }

  // Navigation Controller
  function navigateTo(sectionId) {
    activeSection = sectionId;

    // Hide all sections
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.add('hidden'));

    // Highlight active drawer item
    document.querySelectorAll('.drawer-item').forEach(item => {
      if (item.getAttribute('data-navigate') === sectionId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Highlight bottom navigation items
    document.querySelectorAll('.phone-bottom-nav .nav-item').forEach(btn => {
      if (btn.getAttribute('data-navigate') === sectionId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Map section IDs to DOM elements
    const sectionMap = {
      inventory: 'sectionInventory',
      upload: 'sectionUpload',
      quality: 'sectionQuality',
      negotiate: 'sectionNegotiations',
      orders: 'sectionOrders',
      wallet: 'sectionWallet',
      blockchain: 'sectionBlockchain',
      soil: 'sectionSoil',
      info: 'sectionInfo',
      godowns: 'sectionGodowns',
      logistics: 'sectionLogistics',
      weather: 'sectionWeather',
      chat: 'sectionChat',
      profile: 'sectionProfile',
      about: 'sectionAbout',
      screenshots: 'sectionScreenshots',
      feedback: 'sectionFeedback'
    };

    const targetId = sectionMap[sectionId] || 'sectionInventory';
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.classList.remove('hidden');
    }

    // Close drawer
    closeDrawer();

    // Render data for this section
    renderActiveSection();

    // Scroll to top
    document.getElementById('mainContent').scrollTop = 0;
  }
  window.navigateTo = navigateTo;

  // Drawer Controls
  const navDrawer = document.getElementById('navDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');

  function openDrawer() {
    navDrawer.classList.add('open');
    drawerBackdrop.classList.add('open');
  }

  function closeDrawer() {
    navDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('open');
  }

  document.getElementById('btnOpenDrawer').addEventListener('click', openDrawer);
  document.getElementById('btnCloseDrawer').addEventListener('click', closeDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);

  // Bind drawer navigation links
  document.querySelectorAll('.drawer-item').forEach(link => {
    link.addEventListener('click', () => {
      const target = link.getAttribute('data-navigate');
      if (target) navigateTo(target);
    });
  });

  // Bind bottom nav links
  document.querySelectorAll('.phone-bottom-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-navigate');
      if (target) navigateTo(target);
    });
  });

  // Global header controls
  document.getElementById('btnLangToggle').addEventListener('click', () => {
    applyLanguage(currentLanguage === 'en' ? 'hi' : 'en');
  });

  document.getElementById('btnViewModeToggle').addEventListener('click', () => {
    applyViewMode(currentViewMode === 'mobile' ? 'desktop' : 'mobile');
  });

  document.getElementById('btnQuickWeather').addEventListener('click', () => navigateTo('weather'));
  document.getElementById('btnQuickProfile').addEventListener('click', () => navigateTo('profile'));
  document.getElementById('btnOpenSearch').addEventListener('click', () => openSearchModal());

  // Render Engine for Active Section
  function renderActiveSection() {
    switch (activeSection) {
      case 'inventory':
        renderInventory();
        break;
      case 'negotiate':
        renderNegotiations();
        break;
      case 'orders':
        renderOrders();
        break;
      case 'wallet':
        renderWallet();
        break;
      case 'blockchain':
        renderBlockchain();
        break;
      case 'soil':
        renderSoilLabs();
        break;
      case 'godowns':
        renderGodowns();
        break;
      case 'logistics':
        renderLogistics();
        break;
      case 'about':
        renderAboutTeam();
        break;
      case 'screenshots':
        renderScreenshots();
        break;
      default:
        break;
    }
    if (window.lucide) lucide.createIcons();
  }

  // =========================================================================
  // SECTION 1: INVENTORY RENDERING (HomeFragment & FarmerInventoryAdapter)
  // =========================================================================
  function renderInventory(filterCategory = 'all') {
    const container = document.getElementById('inventoryContainer');
    const countEl = document.getElementById('statCropCount');
    const quickBalance = document.getElementById('quickBalance');
    const quickNegotiations = document.getElementById('quickNegotiations');
    const quickOrders = document.getElementById('quickOrders');

    countEl.textContent = inventory.length;
    quickBalance.textContent = `₹${wallet.balance.toLocaleString('en-IN')}`;
    quickNegotiations.textContent = `${negotiations.filter(n => n.status === 'pending').length} Active`;
    quickOrders.textContent = `${orders.length} Dispatches`;

    const filtered = filterCategory === 'all'
      ? inventory
      : inventory.filter(item => item.category === filterCategory);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm space-y-2">
          <i data-lucide="package-open" class="w-12 h-12 text-gray-300 mx-auto"></i>
          <h4 class="font-bold text-gray-700">No Crops in this Category</h4>
          <p class="text-xs text-gray-500">Tap the "+" button below to upload your harvest produce.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = filtered.map(item => {
      const badgeClass = item.quality === 'Elite' ? 'badge-elite' : item.quality === 'Premium' ? 'badge-premium' : 'badge-classic';
      const title = (currentLanguage === 'hi' && item.title_hi) ? item.title_hi : item.title;
      const desc = (currentLanguage === 'hi' && item.description_hi) ? item.description_hi : item.description;

      return `
        <div class="kisan-card p-3.5 flex gap-3 cursor-pointer relative" onclick="openItemDetailsModal('${item.id}')">
          <div class="w-24 h-24 rounded-2xl overflow-hidden bg-purple-50 flex-shrink-0 border border-purple-100">
            <img src="${item.image}" alt="${title}" class="w-full h-full object-cover" onerror="this.src='assets/raw/wheat.png'" />
          </div>

          <div class="flex-1 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start gap-1">
                <h4 class="font-bold text-sm text-gray-900 leading-snug">${title}</h4>
                <span class="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-extrabold ${badgeClass}">
                  ${item.quality}
                </span>
              </div>
              <p class="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">${desc}</p>
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-gray-50 mt-1">
              <span class="text-xs font-bold text-purple-700">₹${item.price} <span class="text-[10px] text-gray-500 font-normal">/ Kg</span></span>
              <span class="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-lg">${item.quantity} Kg</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  }

  // Filter Buttons
  document.querySelectorAll('.inv-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.inv-filter-btn').forEach(b => {
        b.className = 'inv-filter-btn px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 text-xs';
      });
      btn.className = 'inv-filter-btn px-2.5 py-1 rounded-full bg-purple-600 text-white font-semibold text-xs';
      renderInventory(btn.getAttribute('data-filter'));
    });
  });

  // =========================================================================
  // ITEM DETAILS & REVIEWS MODAL (InventoryItemDetailsActivity)
  // =========================================================================
  let currentViewingItemId = null;

  window.openItemDetailsModal = function(itemId) {
    currentViewingItemId = itemId;
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('modalItemImage').src = item.image;
    document.getElementById('modalItemTitle').textContent = (currentLanguage === 'hi' && item.title_hi) ? item.title_hi : item.title;
    document.getElementById('modalItemDesc').textContent = (currentLanguage === 'hi' && item.description_hi) ? item.description_hi : item.description;
    document.getElementById('modalItemPrice').textContent = `₹${item.price} / Kg`;
    document.getElementById('modalItemQuantity').textContent = `${item.quantity} Kg in Stock`;

    const badge = document.getElementById('modalItemQualityBadge');
    badge.textContent = `${item.quality} Quality`;
    badge.className = `absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${item.quality === 'Elite' ? 'badge-elite' : item.quality === 'Premium' ? 'badge-premium' : 'badge-classic'}`;

    // Render Reviews
    const reviewsList = document.getElementById('modalItemReviewsList');
    if (item.reviews && item.reviews.length > 0) {
      reviewsList.innerHTML = item.reviews.map(r => `
        <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-gray-800">${r.name}</span>
            <div class="flex items-center text-amber-500 font-bold">
              ★ ${r.rating} <span class="text-gray-400 font-normal ml-1">(${r.date})</span>
            </div>
          </div>
          <p class="text-xs text-gray-600">${r.comment}</p>
        </div>
      `).join('');
    } else {
      reviewsList.innerHTML = `<p class="text-xs text-gray-500 italic">No buyer reviews yet.</p>`;
    }

    switchItemDetailTab('details');
    document.getElementById('modalItemDetails').classList.add('open');
  };

  window.switchItemDetailTab = function(tab) {
    const detailsBody = document.getElementById('itemTabDetailsBody');
    const reviewsBody = document.getElementById('itemTabReviewsBody');
    const tabBtnDetails = document.getElementById('tabBtnDetails');
    const tabBtnReviews = document.getElementById('tabBtnReviews');

    if (tab === 'details') {
      detailsBody.classList.remove('hidden');
      reviewsBody.classList.add('hidden');
      tabBtnDetails.className = 'flex-1 py-3 border-b-2 border-purple-600 text-purple-700 font-semibold';
      tabBtnReviews.className = 'flex-1 py-3 text-gray-500 hover:text-gray-800 font-semibold';
    } else {
      detailsBody.classList.add('hidden');
      reviewsBody.classList.remove('hidden');
      tabBtnReviews.className = 'flex-1 py-3 border-b-2 border-purple-600 text-purple-700 font-semibold';
      tabBtnDetails.className = 'flex-1 py-3 text-gray-500 hover:text-gray-800 font-semibold';
    }
  };

  document.getElementById('btnCloseItemDetails').addEventListener('click', () => {
    document.getElementById('modalItemDetails').classList.remove('open');
  });

  document.getElementById('btnDeleteItem').addEventListener('click', async () => {
    if (confirm('Are you sure you want to remove this crop from your inventory?')) {
      const idToDelete = currentViewingItemId;
      inventory = inventory.filter(i => i.id !== idToDelete);
      localStorage.setItem('kisan_inventory', JSON.stringify(inventory));
      document.getElementById('modalItemDetails').classList.remove('open');
      renderInventory();
      showToast('Crop removed successfully');

      // Sync deletion with Supabase crops table
      if (window.supabaseClient && idToDelete) {
        try {
          const { error } = await window.supabaseClient.from('crops').delete().eq('id', idToDelete);
          if (!error) console.log('✔ Deleted crop from Supabase:', idToDelete);
        } catch (e) {
          console.warn('Supabase delete notice:', e);
        }
      }
    }
  });

  document.getElementById('btnOpenEditCrop').addEventListener('click', async () => {
    const item = inventory.find(i => i.id === currentViewingItemId);
    if (!item) return;
    const newPrice = prompt('Enter new price (₹ / Kg):', item.price);
    if (newPrice && !isNaN(newPrice)) {
      item.price = Number(newPrice);
      localStorage.setItem('kisan_inventory', JSON.stringify(inventory));
      document.getElementById('modalItemDetails').classList.remove('open');
      renderInventory();
      showToast('Crop price updated!');

      // Sync updated price with Supabase crops table
      if (window.supabaseClient && item.id) {
        try {
          const { error } = await window.supabaseClient.from('crops').update({ price_per_kg: item.price }).eq('id', item.id);
          if (!error) console.log('✔ Updated price in Supabase:', item.id, item.price);
        } catch (e) {
          console.warn('Supabase price update notice:', e);
        }
      }
    }
  });

  // =========================================================================
  // SECTION 2: ADD CROP TO INVENTORY (UploadInventoryActivity)
  // With simulated CV Quality & Price Estimation + Almora Cluster 15 Trigger
  // =========================================================================
  let uploadedCropImageUrl = 'assets/raw/wheat.png';

  const uploadDropArea = document.getElementById('uploadDropArea');
  const inputCropImage = document.getElementById('inputCropImage');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const uploadImagePreview = document.getElementById('uploadImagePreview');
  const aiScanningIndicator = document.getElementById('aiScanningIndicator');

  uploadDropArea.addEventListener('click', () => inputCropImage.click());

  inputCropImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        uploadedCropImageUrl = ev.target.result;
        triggerMLAnalysis(uploadedCropImageUrl);
      };
      reader.readAsDataURL(file);
    }
  });

  // Sample pickers
  document.querySelectorAll('.btn-sample-pick').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sample = btn.getAttribute('data-sample');
      const name = btn.getAttribute('data-name');
      const cat = btn.getAttribute('data-cat');
      uploadedCropImageUrl = sample;
      document.getElementById('inputItemName').value = name;
      document.getElementById('selectItemType').value = cat;
      triggerMLAnalysis(sample);
    });
  });

  function triggerMLAnalysis(imgSrc) {
    uploadPlaceholder.classList.add('hidden');
    uploadImagePreview.src = imgSrc;
    uploadImagePreview.classList.remove('hidden');
    aiScanningIndicator.classList.remove('hidden');

    // Simulate 2.5s CV inference pipeline
    setTimeout(() => {
      aiScanningIndicator.classList.add('hidden');
      const qualities = ['Premium', 'Elite', 'Classic'];
      const pickedQuality = qualities[Math.floor(Math.random() * qualities.length)];
      document.getElementById('selectItemQuality').value = pickedQuality;

      const basePrice = pickedQuality === 'Elite' ? 65 : pickedQuality === 'Premium' ? 48 : 38;
      document.getElementById('inputItemPrice').value = basePrice;
      document.getElementById('predictedPriceHint').textContent = `✓ ML Predicted Fair Price: ₹${basePrice - 4} - ₹${basePrice + 5} / Kg (${pickedQuality} Grade)`;
      showToast(`AI Detected: ${pickedQuality} Quality Crop! Price auto-filled.`);
    }, 2200);
  }

  // Handle Form Submission with Cluster Recommendation
  let pendingCropToSave = null;

  document.getElementById('formAddCrop').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('inputItemName').value.trim();
    const type = document.getElementById('selectItemType').value;
    const quality = document.getElementById('selectItemQuality').value;
    const quantity = Number(document.getElementById('inputItemQuantity').value);
    const price = Number(document.getElementById('inputItemPrice').value);
    const desc = document.getElementById('inputItemDesc').value.trim();

    if (!name || isNaN(quantity) || isNaN(price)) {
      alert('Please fill out all required fields.');
      return;
    }

    const newCrop = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      title: name,
      title_hi: name,
      category: type,
      quality: quality,
      quantity: quantity,
      price: price,
      description: desc || 'Certified high-quality produce from Telangana agricultural farmlands.',
      description_hi: desc || 'तेलंगाना कृषि भूमि से प्रमाणित उच्च गुणवत्ता उत्पाद।',
      image: uploadedCropImageUrl,
      dateAdded: new Date().toISOString().split('T')[0],
      reviews: []
    };

    // If quantity is < 500 Kg, trigger authentic Warangal Cluster recommendation dialog!
    if (quantity < 500) {
      pendingCropToSave = newCrop;
      document.getElementById('modalClusterMessage').textContent =
        `Your uploaded quantity is ${quantity} Kg (less than 500 Kg). We strongly recommend you join the nearby WARANGAL Agri-Cluster #12 for aggregated logistics, bulk packaging and collective bargaining!`;
      document.getElementById('modalCluster').classList.add('open');
      return;
    }

    // Save directly if quantity is 500 Kg or more
    saveCropToInventory(newCrop);
  });

  async function saveCropToInventory(crop) {
    let activeFarmerId = currentFarmerId || 'FARMER-TG-7721';
    const authData = localStorage.getItem('kisan_auth');
    if (authData) {
      try {
        const sess = JSON.parse(authData);
        if (sess.farmerId) activeFarmerId = sess.farmerId;
      } catch (e) {}
    }

    inventory.unshift(crop);
    localStorage.setItem('kisan_inventory', JSON.stringify(inventory));
    renderInventory();

    // Save to Supabase `crops` table
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient.from('crops').insert([{
          crop_name: crop.title,
          category: crop.category || 'grain',
          variety: crop.title.includes('Paddy') || crop.title.includes('Rice') ? 'Telangana Sona (RNR 15048)' : 'Certified Hybrid',
          ai_grade: crop.quality || 'Elite',
          quantity_kg: crop.quantity,
          price_per_kg: crop.price,
          description: crop.description,
          image_url: crop.image,
          farmer_id: activeFarmerId,
          cluster_id: 'Warangal Agri-Cluster #12',
          mandi: 'Enumamula Wholesale Mandi (Warangal)',
          status: 'listed'
        }]).select();

        if (!error && data && data.length > 0) {
          console.log('✔ Crop saved to Supabase database table `crops` with ID:', data[0].id);
          crop.id = data[0].id;
          localStorage.setItem('kisan_inventory', JSON.stringify(inventory));
          showToast('Crop synced to Supabase database successfully!');
        } else if (error) {
          console.warn('Supabase crop insert error:', error.message);
          showToast('Crop saved locally (' + error.message + ')');
        }
      } catch (e) {
        console.warn('Supabase crop save notice:', e);
      }
    } else {
      showToast('Crop successfully listed in marketplace!');
    }

    document.getElementById('formAddCrop').reset();
    uploadPlaceholder.classList.remove('hidden');
    uploadImagePreview.classList.add('hidden');
    navigateTo('inventory');
  }

  document.getElementById('btnAcceptCluster').addEventListener('click', () => {
    document.getElementById('modalCluster').classList.remove('open');
    if (pendingCropToSave) {
      pendingCropToSave.title += ' (Warangal Cluster #12)';
      saveCropToInventory(pendingCropToSave);
      pendingCropToSave = null;
      showToast('Joined Warangal Cluster #12! Collective logistics enabled.');
    }
  });

  document.getElementById('btnDeclineCluster').addEventListener('click', () => {
    document.getElementById('modalCluster').classList.remove('open');
    if (pendingCropToSave) {
      saveCropToInventory(pendingCropToSave);
      pendingCropToSave = null;
    }
  });

  // =========================================================================
  // SECTION 3: CROP QUALITY PREDICTION (QualityTesting & QualityTestResultActivity)
  // =========================================================================
  let qualityTestImage = 'assets/raw/wheat.png';
  const qualityDropArea = document.getElementById('qualityDropArea');
  const qualityImageInput = document.getElementById('qualityImageInput');
  const qualityPreviewImg = document.getElementById('qualityPreviewImg');
  const qualityUploadPrompt = document.getElementById('qualityUploadPrompt');

  qualityDropArea.addEventListener('click', () => qualityImageInput.click());

  qualityImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        qualityTestImage = ev.target.result;
        qualityUploadPrompt.classList.add('hidden');
        qualityPreviewImg.src = qualityTestImage;
        qualityPreviewImg.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  document.querySelectorAll('.btn-quality-sample').forEach(btn => {
    btn.addEventListener('click', () => {
      qualityTestImage = btn.getAttribute('data-img');
      const cat = btn.getAttribute('data-cat');
      document.getElementById('qualitySelectCategory').value = cat;
      qualityUploadPrompt.classList.add('hidden');
      qualityPreviewImg.src = qualityTestImage;
      qualityPreviewImg.classList.remove('hidden');
    });
  });

  document.getElementById('btnRunQualityTest').addEventListener('click', () => {
    const category = document.getElementById('qualitySelectCategory').value;
    const btn = document.getElementById('btnRunQualityTest');
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader" class="w-5 h-5 animate-spin"></i> Processing Grain Scan...`;
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="sparkles" class="w-5 h-5 text-cyan-300"></i> Run Automated Quality Inspection`;
      if (window.lucide) lucide.createIcons();

      const grades = ['Elite', 'Premium', 'Classic'];
      const picked = grades[Math.floor(Math.random() * grades.length)];
      const ratio = Math.floor(Math.random() * (95 - 84) + 84);

      document.getElementById('resCropName').textContent = `${category} Test Analysis`;
      document.getElementById('resRatio').textContent = `${ratio} / 100`;

      const badge = document.getElementById('resBadgeGrade');
      badge.textContent = `${picked} Grade`;
      badge.className = `px-3 py-1 rounded-full text-xs font-bold ${picked === 'Elite' ? 'badge-elite' : picked === 'Premium' ? 'badge-premium' : 'badge-classic'}`;

      const price = picked === 'Elite' ? '₹72 - ₹80 / Kg' : picked === 'Premium' ? '₹48 - ₹55 / Kg' : '₹38 - ₹44 / Kg';
      document.getElementById('resPriceRange').textContent = price;

      document.getElementById('qualityResultCard').classList.remove('hidden');
      document.getElementById('qualityResultCard').scrollIntoView({ behavior: 'smooth' });
      showToast('Quality testing completed successfully!');

      // Sync scan result to Supabase quality_gradings table
      if (window.supabaseClient) {
        let activeFarmerId = currentFarmerId || 'FARMER-TG-7721';
        const authData = localStorage.getItem('kisan_auth');
        if (authData) {
          try {
            const sess = JSON.parse(authData);
            if (sess.farmerId) activeFarmerId = sess.farmerId;
          } catch (e) {}
        }
        try {
          window.supabaseClient.from('quality_gradings').insert([{
            farmer_id: activeFarmerId,
            crop_name: `${category} Sample`,
            grade: picked,
            moisture_percent: 12.4,
            defect_percent: Number((100 - ratio).toFixed(1)),
            purity_score: ratio
          }]).then();
        } catch (e) {}
      }
    }, 2000);
  });

  document.getElementById('btnPushToInventory').addEventListener('click', () => {
    const category = document.getElementById('qualitySelectCategory').value;
    const autoCrop = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      title: `${category} (Certified Tested)`,
      title_hi: `${category} (प्रमाणित गुणवत्ता)`,
      category: category.toLowerCase().includes('rice') ? 'grain' : 'grain',
      quality: 'Premium',
      quantity: 500,
      price: 50,
      description: 'Tested and certified by KisanSeva2 AI grading engine. High grain ratio.',
      description_hi: 'किसान सेवा एआई ग्रेडिंग इंजन द्वारा प्रमाणित। उच्च गुणवत्ता दाने।',
      image: qualityTestImage,
      dateAdded: new Date().toISOString().split('T')[0],
      reviews: []
    };
    saveCropToInventory(autoCrop);
  });

  document.getElementById('btnShareCertificate').addEventListener('click', () => {
    window.print();
  });

  // =========================================================================
  // SECTION 4: NEGOTIATIONS (NegotiatedActivity)
  // =========================================================================
  function renderNegotiations() {
    const container = document.getElementById('negotiationsContainer');
    const badgeCount = document.getElementById('badgeNegoCount');
    const pendingCount = negotiations.filter(n => n.status === 'pending').length;
    badgeCount.textContent = pendingCount;

    if (negotiations.length === 0) {
      container.innerHTML = `<p class="text-xs text-gray-500 italic">No buyer negotiation offers.</p>`;
      return;
    }

    container.innerHTML = negotiations.map(n => {
      const isPending = n.status === 'pending';
      const isAccepted = n.status === 'accepted';

      return `
        <div class="kisan-card p-4 space-y-3 border-l-4 ${isPending ? 'border-amber-500' : isAccepted ? 'border-emerald-500' : 'border-gray-400'}">
          <div class="flex gap-3">
            <img src="${n.image}" alt="Crop" class="w-16 h-16 rounded-xl object-cover border" onerror="this.src='assets/raw/wheat.png'" />
            <div class="flex-1">
              <div class="flex justify-between items-start">
                <h4 class="font-bold text-sm text-gray-900">${n.buyer.name}</h4>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full ${isPending ? 'bg-amber-100 text-amber-800' : isAccepted ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}">
                  ${isPending ? 'Pending Action' : isAccepted ? 'Agreed & Settled' : 'Declined'}
                </span>
              </div>
              <p class="text-[11px] text-gray-500">${n.buyer.location} | ${n.buyer.phone}</p>
              <p class="text-xs font-semibold text-gray-700 mt-0.5">${n.itemTitle} (${n.quantity} Kg)</p>
            </div>
          </div>

          <div class="bg-gray-50 p-2.5 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span class="text-gray-500 block">Your Price</span>
              <span class="font-bold text-gray-700 line-through">₹${n.actualPrice} / Kg</span>
            </div>
            <div class="text-right">
              <span class="text-gray-500 block">Buyer Counter Offer</span>
              <span class="font-extrabold text-amber-700 text-sm">₹${n.proposedPrice} / Kg</span>
            </div>
            <div class="text-right">
              <span class="text-gray-500 block">Total Deal</span>
              <span class="font-extrabold text-emerald-700 text-sm">₹${(n.proposedPrice * n.quantity).toLocaleString('en-IN')}</span>
            </div>
          </div>

          ${isPending ? `
            <div class="flex gap-2 pt-1">
              <button onclick="handleNegotiation('${n.id}', 'accept')" class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition">
                Accept ₹${n.proposedPrice}/Kg
              </button>
              <button onclick="handleNegotiation('${n.id}', 'reject')" class="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-xs transition">
                Decline
              </button>
            </div>
          ` : `
            <p class="text-[11px] text-gray-500 italic">${n.note}</p>
          `}
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  }

  window.handleNegotiation = function(negoId, action) {
    const nego = negotiations.find(n => n.id === negoId);
    if (!nego) return;

    if (action === 'accept') {
      nego.status = 'accepted';
      nego.note = `Accepted at ₹${nego.proposedPrice}/Kg. Dispatched via Telangana Logistics.`;

      // Auto generate order and credit wallet!
      const totalAmount = nego.proposedPrice * nego.quantity;
      orders.unshift({
        id: `ORD-${Date.now().toString().slice(-5)}`,
        receiptNumber: `KS-TG-2026-${Math.floor(Math.random() * 90000 + 10000)}`,
        date: new Date().toLocaleDateString('en-GB'),
        amount: totalAmount,
        completed: false,
        status: 'In Transit',
        buyer: {
          first_name: nego.buyer.name,
          phone: nego.buyer.phone,
          address: `${nego.buyer.location}, Telangana`
        },
        items: [
          { name: nego.itemTitle, quantity: nego.quantity, pricePerKg: nego.proposedPrice, total: totalAmount }
        ],
        route: {
          origin: "Geesugonda, Warangal (17.9689, 79.5941)",
          destination: `${nego.buyer.location} (17.4770, 78.4870)`,
          distanceKm: 148,
          logisticsPartner: "VRL Telangana Agri-Freight"
        }
      });

      // Update wallet
      wallet.balance += totalAmount;
      wallet.transactions.unshift({
        id: `TXN-${Date.now().toString().slice(-4)}`,
        buyer: nego.buyer.name,
        amount: totalAmount,
        type: "credit",
        time: new Date().toLocaleString(),
        desc: `Accepted negotiation: ${nego.itemTitle}`
      });

      localStorage.setItem('kisan_orders', JSON.stringify(orders));
      localStorage.setItem('kisan_wallet', JSON.stringify(wallet));
      localStorage.setItem('kisan_negotiations', JSON.stringify(negotiations));

      // Sync with Supabase negotiations, orders, profiles, and wallet_transactions tables
      if (window.supabaseClient) {
        let activeFarmerId = currentFarmerId || 'FARMER-TG-7721';
        const authData = localStorage.getItem('kisan_auth');
        if (authData) {
          try {
            const sess = JSON.parse(authData);
            if (sess.farmerId) activeFarmerId = sess.farmerId;
          } catch (e) {}
        }

        const txHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

        try {
          if (nego.id && !nego.id.startsWith('NEGO-')) {
            window.supabaseClient.from('negotiations').update({ status: 'accepted' }).eq('id', nego.id).then();
          }
          window.supabaseClient.from('orders').insert([{
            farmer_id: activeFarmerId,
            crop_name: nego.itemTitle,
            buyer_name: nego.buyer.name,
            quantity_kg: nego.quantity,
            price_per_kg: nego.proposedPrice,
            total_amount: totalAmount,
            freight_savings_percent: 38.0,
            escrow_status: 'escrow_locked',
            blockchain_tx_hash: txHash,
            dbt_payout_within_hours: 24
          }]).then();

          // Sync new balance to profiles table
          window.supabaseClient.from('profiles').update({
            wallet_balance: wallet.balance,
            updated_at: new Date().toISOString()
          }).eq('farmer_id', activeFarmerId).then();

          // Sync credit transaction to wallet_transactions
          window.supabaseClient.from('wallet_transactions').insert([{
            farmer_id: activeFarmerId,
            title: `Escrow Sale: ${nego.itemTitle}`,
            type: 'credit',
            amount: totalAmount,
            status: 'completed',
            tx_hash: txHash
          }]).then();
        } catch (e) {
          console.warn('Supabase order/wallet sync notice:', e);
        }
      }

      showToast(`Offer accepted! ₹${totalAmount.toLocaleString('en-IN')} added to Escrow.`);
    } else {
      nego.status = 'rejected';
      nego.note = `Declined offer. Asking price maintained.`;
      localStorage.setItem('kisan_negotiations', JSON.stringify(negotiations));

      if (window.supabaseClient && nego.id && !nego.id.startsWith('NEGO-')) {
        try {
          window.supabaseClient.from('negotiations').update({ status: 'rejected' }).eq('id', nego.id).then();
        } catch (e) {}
      }

      showToast('Counter offer declined.');
    }

    renderNegotiations();
  };

  // =========================================================================
  // SECTION 5: ORDERS & DELIVERIES (OrdersInfoActivity & OrderDetailsActivity)
  // =========================================================================
  function renderOrders() {
    const container = document.getElementById('ordersContainer');
    if (orders.length === 0) {
      container.innerHTML = `<p class="text-xs text-gray-500 italic">No active orders.</p>`;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="kisan-card p-4 space-y-3 cursor-pointer hover:border-purple-300 transition" onclick="openOrderDetailsModal('${order.id}')">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-[10px] text-gray-500 font-mono">${order.receiptNumber}</span>
            <h4 class="font-bold text-sm text-gray-900">${order.buyer.first_name}</h4>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
            ${order.status}
          </span>
        </div>

        <p class="text-xs text-gray-600">${order.buyer.address}</p>

        <div class="bg-gray-50 p-2.5 rounded-xl flex justify-between items-center text-xs">
          <div>
            <span class="text-gray-500">Items: </span>
            <span class="font-semibold text-gray-800">${order.items.map(i => `${i.name} (${i.quantity}Kg)`).join(', ')}</span>
          </div>
          <div class="font-bold text-purple-700 text-sm">
            ₹${order.amount.toLocaleString('en-IN')}
          </div>
        </div>

        <div class="flex justify-between items-center text-[11px] text-gray-500 pt-1 border-t">
          <span>Date: ${order.date}</span>
          <span class="text-purple-600 font-semibold flex items-center gap-1">
            <i data-lucide="map-pin" class="w-3 h-3"></i> View Route & Transit &rarr;
          </span>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  // Interactive Map & Order Details Modal
  window.openOrderDetailsModal = function(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('modalOrderReceiptId').textContent = order.receiptNumber;
    document.getElementById('modalOrderBuyerName').textContent = order.buyer.first_name;
    document.getElementById('modalOrderAmount').textContent = `Total: ₹${order.amount.toLocaleString('en-IN')}`;
    document.getElementById('modalOrderBuyerAddress').textContent = order.buyer.address;
    document.getElementById('modalOrderCallLink').href = `tel:${order.buyer.phone}`;
    document.getElementById('modalOrderStatusBadge').textContent = order.status;
    document.getElementById('modalOrderDistance').textContent = `${order.route.distanceKm} Km (${order.route.logisticsPartner})`;

    // Google Maps link with exact GPS coordinates (Warangal to Bowenpally Secunderabad)
    document.getElementById('modalOrderGoogleMapsBtn').href =
      `https://www.google.com/maps/dir/?api=1&origin=17.9689,79.5941&destination=17.4770,78.4870`;

    document.getElementById('modalOrderDetails').classList.add('open');

    // Initialize Leaflet Interactive Route Map
    setTimeout(() => {
      const mapContainer = document.getElementById('orderRouteMap');
      if (!mapContainer) return;

      if (activeLeafletMap) {
        activeLeafletMap.remove();
        activeLeafletMap = null;
      }

      // Center map in Telangana agro-corridor (Warangal - Hyderabad)
      activeLeafletMap = L.map('orderRouteMap').setView([17.72, 79.05], 9);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(activeLeafletMap);

      // Farm Marker (Geesugonda, Warangal)
      const farmMarker = L.marker([17.9689, 79.5941]).addTo(activeLeafletMap)
        .bindPopup('<b>Farmer Origin:</b> Geesugonda, Warangal')
        .openPopup();

      // Buyer Mandi Marker (Bowenpally / Hyderabad Mandi)
      const buyerMarker = L.marker([17.4770, 78.4870]).addTo(activeLeafletMap)
        .bindPopup(`<b>Buyer Mandi:</b> ${order.buyer.first_name}`);

      // Route Polyline
      const routeCoordinates = [
        [17.9689, 79.5941], // Warangal Geesugonda
        [17.8340, 79.4500], // Kazipet Junction
        [17.7225, 79.1764], // Jangaon
        [17.6528, 78.9669], // Aler
        [17.5110, 78.8893], // Bhongir
        [17.4527, 78.6835], // Ghatkesar / Uppal
        [17.4770, 78.4870]  // Bowenpally Wholesale Mandi, Secunderabad
      ];

      const polyline = L.polyline(routeCoordinates, {
        color: '#8a2be2',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8'
      }).addTo(activeLeafletMap);

      activeLeafletMap.fitBounds(polyline.getBounds(), { padding: [25, 25] });
    }, 250);
  };

  document.getElementById('btnCloseOrderDetails').addEventListener('click', () => {
    document.getElementById('modalOrderDetails').classList.remove('open');
  });

  // =========================================================================
  // SECTION 6: FARMER WALLET (WalletSectionActivity)
  // =========================================================================
  function renderWallet() {
    document.getElementById('walletTotalBalance').textContent = `₹${wallet.balance.toLocaleString('en-IN')}`;
    const txList = document.getElementById('walletTransactionsList');

    txList.innerHTML = wallet.transactions.map(tx => `
      <div class="kisan-card p-3 flex justify-between items-center text-xs">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold ${tx.type === 'credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">
            ${tx.type === 'credit' ? '↓' : '↑'}
          </div>
          <div>
            <span class="font-bold text-gray-800 block">${tx.buyer}</span>
            <span class="text-[11px] text-gray-500">${tx.time} | ${tx.desc}</span>
          </div>
        </div>
        <div class="font-extrabold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}">
          ${tx.type === 'credit' ? '+' : ''}₹${Math.abs(tx.amount).toLocaleString('en-IN')}
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  // Withdraw Modal
  document.getElementById('btnOpenWithdraw').addEventListener('click', () => {
    document.getElementById('modalWithdraw').classList.add('open');
  });

  document.getElementById('btnCloseWithdraw').addEventListener('click', () => {
    document.getElementById('modalWithdraw').classList.remove('open');
  });

  document.getElementById('formWithdraw').addEventListener('submit', (e) => {
    e.preventDefault();
    const amt = Number(document.getElementById('inputWithdrawAmount').value);
    if (amt > wallet.balance || amt <= 0) {
      alert('Invalid withdrawal amount');
      return;
    }

    wallet.balance -= amt;
    const debitTxn = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      buyer: "State Bank of India (IMPS Transfer)",
      amount: -amt,
      type: "debit",
      time: new Date().toLocaleString(),
      desc: "Instant payout to A/C **4521"
    };
    wallet.transactions.unshift(debitTxn);

    localStorage.setItem('kisan_wallet', JSON.stringify(wallet));
    document.getElementById('modalWithdraw').classList.remove('open');
    renderWallet();
    showToast(`Transferred ₹${amt.toLocaleString('en-IN')} to SBI account successfully!`);

    // Sync with Supabase profiles and wallet_transactions
    if (window.supabaseClient) {
      let activeFarmerId = currentFarmerId || 'FARMER-TG-7721';
      const authData = localStorage.getItem('kisan_auth');
      if (authData) {
        try {
          const sess = JSON.parse(authData);
          if (sess.farmerId) activeFarmerId = sess.farmerId;
        } catch (e) {}
      }

      try {
        window.supabaseClient.from('profiles').update({
          wallet_balance: wallet.balance,
          updated_at: new Date().toISOString()
        }).eq('farmer_id', activeFarmerId).then();

        window.supabaseClient.from('wallet_transactions').insert([{
          farmer_id: activeFarmerId,
          title: 'IMPS Bank Transfer (SBI A/C **4521)',
          type: 'debit',
          amount: amt,
          status: 'completed'
        }]).then();
      } catch (err) {
        console.warn('Supabase withdrawal sync notice:', err);
      }
    }
  });

  document.getElementById('btnRequestStatement').addEventListener('click', () => {
    showToast('Official sales statement downloaded (CSV/PDF)');
  });

  // =========================================================================
  // SECTION 7: BLOCKCHAIN LOAN LEDGER (BlockchainActivity)
  // =========================================================================
  function renderBlockchain() {
    const container = document.getElementById('blockchainLedgerContainer');

    container.innerHTML = blockchainLedger.map(b => {
      if (b.isGenesis) {
        return `
          <div class="bg-gray-900 text-white p-4 rounded-2xl shadow-sm space-y-1 font-mono text-xs">
            <div class="flex justify-between text-cyan-400 font-bold">
              <span>Block #0 (GENESIS)</span>
              <span>Timestamp: ${b.timestamp}</span>
            </div>
            <p class="text-gray-300">${b.data}</p>
            <div class="text-[10px] text-gray-500 truncate">Hash: ${b.hash}</div>
          </div>
        `;
      }

      return `
        <div class="kisan-card p-4 space-y-2 border-l-4 border-purple-600">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs font-mono text-purple-700 font-bold">Block #${b.blockNumber} [${b.id}]</span>
              <h4 class="font-bold text-sm text-gray-900">${b.provider}</h4>
            </div>
            <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              ${b.status}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl text-xs">
            <div>
              <span class="text-gray-500 block">Sanctioned Amount</span>
              <span class="font-extrabold text-purple-700 text-sm">₹${b.amount.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span class="text-gray-500 block">Subsidized Interest</span>
              <span class="font-bold text-gray-800">${b.interestRate}</span>
            </div>
          </div>

          <div class="flex justify-between text-[11px] text-gray-500 pt-1">
            <span>Credit Score: <b class="text-emerald-600">${b.creditScore}</b></span>
            <span>Date: ${b.timestamp}</span>
          </div>
          <div class="text-[10px] font-mono text-gray-400 truncate">Hash: ${b.hash}</div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  }

  // Credit Score Modal
  function showCreditScoreModal() {
    document.getElementById('modalCreditScore').classList.add('open');
  }
  window.showCreditScoreModal = showCreditScoreModal;
  document.getElementById('btnCloseCreditModal').addEventListener('click', () => {
    document.getElementById('modalCreditScore').classList.remove('open');
  });
  document.getElementById('btnViewCreditScore').addEventListener('click', showCreditScoreModal);

  document.getElementById('btnApplyLoan').addEventListener('click', () => {
    const loanAmt = prompt('Enter required loan amount (up to ₹3,00,000):', '100000');
    if (loanAmt && !isNaN(loanAmt)) {
      const amt = Number(loanAmt);
      const newBlock = {
        blockNumber: blockchainLedger.length,
        id: `BLK-${Date.now().toString().slice(-6)}-KCC`,
        hash: `0000${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
        provider: "Pradhan Mantri Interest Subvention (7% Crop Loan)",
        amount: amt,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        status: "Approved and Disbursed",
        creditScore: 785,
        interestRate: "4.0% Effective Subsidized Rate",
        purpose: "Organic Agriculture Working Capital"
      };
      blockchainLedger.push(newBlock);
      localStorage.setItem('kisan_blockchain', JSON.stringify(blockchainLedger));
      renderBlockchain();
      showToast(`Loan of ₹${amt.toLocaleString('en-IN')} approved via Smart Contract!`);
    }
  });

  // =========================================================================
  // SECTION 8: SOIL TESTING LABS (SoilHealthActivity)
  // =========================================================================
  let allSoilLabs = [];

  async function loadSoilLabsData() {
    try {
      const res = await fetch('assets/data/labs.json');
      if (res.ok) {
        allSoilLabs = await res.json();
      }
    } catch (e) {
      console.warn('Fallback soil labs');
    }

    if (!allSoilLabs || allSoilLabs.length === 0) {
      allSoilLabs = [
        { id: 'TG-HYD-01', state: 'TELANGANA', district: 'HYDERABAD', name: 'Soil Health Unit, ARI Campus, PJTSAU, Rajendranagar, Hyderabad', contact: '040-24015011' },
        { id: 'TG-SEC-01', state: 'TELANGANA', district: 'SECUNDERABAD', name: 'Bowenpally AMC Soil Testing Laboratory, Secunderabad', contact: '040-27751234' },
        { id: 'TG-WGL-01', state: 'TELANGANA', district: 'WARANGAL', name: 'Regional Agricultural Research Station (RARS) Referral Soil Testing Lab, Mulugu Road, Warangal', contact: '0870-2442224' },
        { id: 'TG-WGL-02', state: 'TELANGANA', district: 'WARANGAL', name: 'District Soil Testing Laboratory, FTC Campus, Paidipally, Warangal', contact: '0870-2441180' },
        { id: 'TG-MED-01', state: 'TELANGANA', district: 'MEDCHAL', name: 'AMC Soil Testing Laboratory, Kandlakoi, Medchal District', contact: '08418-220140' },
        { id: 'TG-NZB-01', state: 'TELANGANA', district: 'NIZAMABAD', name: 'District Soil Testing Laboratory, Shradhanand Gunj, Nizamabad', contact: '08462-224150' }
      ];
    }

    populateDistrictOptions('TELANGANA');
  }

  function populateDistrictOptions(selectedState) {
    const districtSelect = document.getElementById('soilDistrictSelect');
    const filteredLabs = allSoilLabs.filter(l => l.state === selectedState);
    const districts = Array.from(new Set(filteredLabs.map(l => l.district))).sort();

    districtSelect.innerHTML = `<option value="ALL">All Districts in ${selectedState}</option>` +
      districts.map(d => `<option value="${d}">${d}</option>`).join('');

    renderSoilLabs();
  }

  document.getElementById('soilStateSelect').addEventListener('change', (e) => {
    populateDistrictOptions(e.target.value);
  });

  document.getElementById('soilDistrictSelect').addEventListener('change', () => {
    renderSoilLabs();
  });

  function renderSoilLabs() {
    const container = document.getElementById('soilLabsListContainer');
    const state = document.getElementById('soilStateSelect').value;
    const dist = document.getElementById('soilDistrictSelect').value;

    let labs = allSoilLabs.filter(l => l.state === state);
    if (dist && dist !== 'ALL') {
      labs = labs.filter(l => l.district === dist);
    }

    if (labs.length === 0) {
      container.innerHTML = `<p class="text-xs text-gray-500 italic p-4 text-center">No lab listed for this filter.</p>`;
      return;
    }

    container.innerHTML = labs.map(lab => `
      <div class="kisan-card p-3.5 space-y-1">
        <div class="flex justify-between items-start">
          <h4 class="font-bold text-xs md:text-sm text-gray-900">${lab.name}</h4>
          <span class="text-[10px] bg-teal-100 text-teal-800 font-mono font-bold px-2 py-0.5 rounded-full">${lab.district}</span>
        </div>
        <p class="text-[11px] text-gray-500">Authorized Testing Facility | Code: ${lab.id}</p>
        <div class="flex justify-between items-center pt-1 text-xs">
          <span class="text-teal-700 font-medium">Free under Soil Health Mission</span>
          <a href="tel:${lab.contact || '05962-230142'}" class="text-purple-700 font-bold hover:underline flex items-center gap-1">
            <i data-lucide="phone" class="w-3 h-3"></i> Call Lab
          </a>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  document.getElementById('btnUploadSoilCard').addEventListener('click', () => {
    showToast('Soil Health Card scanned! Nitrogen: Normal, Phosphorus: Optimal, pH: 6.8');
  });

  // =========================================================================
  // SECTION 9: ADVISORY ARTICLES (InformationFragment)
  // =========================================================================
  window.showInfoSubSection = function(type) {
    const subContainer = document.getElementById('infoSubArticleContainer');
    subContainer.classList.remove('hidden');

    if (type === 'cropProduction') {
      const g = KISAN_DATA.cropProductionGuides.wheat;
      subContainer.innerHTML = `
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-base text-gray-900">${g.crop} - संपूर्ण उत्पादन निर्देशिका</h3>
          <button class="text-xs text-purple-700 font-semibold" onclick="document.getElementById('infoSubArticleContainer').classList.add('hidden')">✕ Close</button>
        </div>
        <div class="space-y-3 max-h-96 overflow-y-auto pr-1">
          ${g.chapters.map(c => `
            <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
              <h4 class="font-bold text-xs text-purple-800">${c.title}</h4>
              <p class="text-xs text-gray-700 leading-relaxed whitespace-pre-line">${c.content}</p>
            </div>
          `).join('')}
        </div>
      `;
    } else if (type === 'cropTreatment') {
      subContainer.innerHTML = `
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-base text-gray-900">फसल रोग एवं जैविक उपचार</h3>
          <button class="text-xs text-purple-700 font-semibold" onclick="document.getElementById('infoSubArticleContainer').classList.add('hidden')">✕ Close</button>
        </div>
        <div class="space-y-3 max-h-96 overflow-y-auto pr-1">
          ${KISAN_DATA.problems.map(p => `
            <div class="kisan-card p-3.5 space-y-2 border">
              <h4 class="font-bold text-sm text-gray-900">${p.title}</h4>
              <p class="text-xs text-gray-600">${p.summary}</p>
              <div class="bg-purple-50 p-2.5 rounded-xl text-xs space-y-1 text-purple-950">
                <span class="font-bold block text-purple-800">आवश्यक सामग्री:</span>
                <ul class="list-disc pl-4 space-y-0.5">
                  ${p.materials.map(m => `<li>${m}</li>`).join('')}
                </ul>
              </div>
              <p class="text-xs text-gray-700 leading-relaxed"><b>प्रयोग विधि:</b> ${p.method}</p>
            </div>
          `).join('')}
        </div>
      `;
    } else if (type === 'horticulture') {
      const h = KISAN_DATA.horticulture.mango;
      subContainer.innerHTML = `
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-base text-gray-900">${h.crop}</h3>
          <button class="text-xs text-purple-700 font-semibold" onclick="document.getElementById('infoSubArticleContainer').classList.add('hidden')">✕ Close</button>
        </div>
        <div class="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          ${h.stages.map(s => `
            <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
              <span class="font-bold text-purple-800 block">${s.title}</span>
              <p class="text-gray-700 mt-0.5 leading-relaxed">${s.detail}</p>
            </div>
          `).join('')}
        </div>
      `;
    } else if (type === 'policies') {
      subContainer.innerHTML = `
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-base text-gray-900">सरकारी योजनाएं एवं सब्सिडी (Government Schemes)</h3>
          <button class="text-xs text-purple-700 font-semibold" onclick="document.getElementById('infoSubArticleContainer').classList.add('hidden')">✕ Close</button>
        </div>
        <div class="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          ${KISAN_DATA.policies.map(pol => `
            <div class="kisan-card p-3.5 space-y-1.5 border">
              <div class="flex justify-between items-start">
                <h4 class="font-bold text-xs md:text-sm text-gray-900">${pol.title}</h4>
                <span class="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">${pol.category}</span>
              </div>
              <p class="text-xs text-gray-600 leading-relaxed">${pol.desc}</p>
              <a href="${pol.link}" target="_blank" class="inline-flex items-center gap-1 text-xs text-purple-700 font-bold hover:underline pt-1">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Visit Official Portal &rarr;
              </a>
            </div>
          `).join('')}
        </div>
      `;
    }

    subContainer.scrollIntoView({ behavior: 'smooth' });
    if (window.lucide) lucide.createIcons();
  };

  // =========================================================================
  // SECTION 10: GODOWNS & LOGISTICS
  // =========================================================================
  function renderGodowns() {
    const container = document.getElementById('godownsListContainer');
    container.innerHTML = KISAN_DATA.godowns.map(g => `
      <div class="kisan-card p-3.5 space-y-1">
        <div class="flex justify-between items-start">
          <h4 class="font-bold text-sm text-gray-900">${g.city} (${g.district})</h4>
          <span class="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">${g.capacity} MT</span>
        </div>
        <p class="text-xs text-gray-600">In-Charge: <b>${g.manager}</b></p>
        <div class="flex justify-between items-center pt-1 text-xs">
          <span class="text-emerald-700 font-medium">Available: ${g.available} MT Space</span>
          <a href="tel:${g.phone}" class="text-purple-700 font-bold flex items-center gap-1 hover:underline">
            <i data-lucide="phone" class="w-3.5 h-3.5"></i> ${g.phone}
          </a>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  function renderLogistics() {
    const container = document.getElementById('logisticsListContainer');
    container.innerHTML = KISAN_DATA.logistics.map(l => `
      <div class="kisan-card p-4 space-y-2 border">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-bold text-sm text-gray-900">${l.name}</h4>
            <span class="text-[11px] text-gray-500">${l.url}</span>
          </div>
          <span class="text-xs bg-cyan-100 text-cyan-800 font-bold px-2.5 py-0.5 rounded-full">${l.fleet}</span>
        </div>
        <p class="text-xs text-gray-600 leading-relaxed">${l.desc}</p>
        <div class="flex justify-between items-center pt-1 text-xs">
          <span class="text-gray-500">${l.coverage}</span>
          <a href="tel:${l.phone}" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm transition">
            <i data-lucide="phone" class="w-3 h-3"></i> Book Truck
          </a>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  // =========================================================================
  // SECTION 11: WEATHER ADVISORY (WeatherActivity)
  // =========================================================================
  // =========================================================================
  // SECTION 11: WEATHER ADVISORY (WeatherActivity)
  // =========================================================================
  const weatherPresets = {
    warangal: { temp: "33 °C", condition: "Sunny & Warm (Enumamula Basin)", humidity: "55%", pressure: "1011 hPa", advisory: "Optimal condition for paddy harvesting and red gram pod development." },
    hyderabad: { temp: "32 °C", condition: "Clear Skies (Rajendranagar Agro-Belt)", humidity: "50%", pressure: "1012 hPa", advisory: "Ideal weather for vegetable marketing and polyhouse floriculture." },
    secunderabad: { temp: "31 °C", condition: "Partly Cloudy (Bowenpally Terminal)", humidity: "52%", pressure: "1013 hPa", advisory: "Dry weather favorable for bulk grain loading and mandi transport." },
    medchal: { temp: "30 °C", condition: "Pleasant & Breezy (Kandlakoi)", humidity: "58%", pressure: "1014 hPa", advisory: "Good time for soil moisture conservation and micro-irrigation." },
    nizamabad: { temp: "34 °C", condition: "Sunny & Dry (Shradhanand Gunj)", humidity: "48%", pressure: "1009 hPa", advisory: "Suitable for turmeric curing and seed drying operations." }
  };

  const weatherDistrictSelect = document.getElementById('weatherDistrictSelect');
  if (weatherDistrictSelect) {
    weatherDistrictSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      const w = weatherPresets[val] || weatherPresets.warangal;
      document.getElementById('weatherTemp').textContent = w.temp;
      document.getElementById('weatherCondition').textContent = w.condition;
      document.getElementById('weatherHumidity').textContent = `Humidity: ${w.humidity}`;
      document.getElementById('weatherPressure').textContent = `Pressure: ${w.pressure}`;
      const advEl = document.querySelector('#sectionWeather p.text-xs.text-gray-600');
      if (advEl) advEl.textContent = w.advisory;
    });
  }

  // =========================================================================
  // SECTION 12: AI KISAN ASSISTANT CHATBOT (Bilingual: English & Hindi)
  // =========================================================================
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatQuickPromptsContainer = document.getElementById('chatQuickPromptsContainer');

  const botKnowledge = {
    en: [
      {
        keywords: ['rate', 'price', 'mandi', 'bhav', 'market', 'cost', 'paddy', 'rice', 'cotton', 'turmeric', 'chilli'],
        reply: "Today at Enumamula Mandi (Warangal) & Bowenpally Mandi (Secunderabad): Telangana Sona (RNR 15048) is ₹2,650 - ₹2,750 / Quintal (₹27.50/Kg). Sona Masoori (BPT 5204) is ₹2,200 - ₹2,350 / Qtl. Premium Cotton is ₹7,450 / Qtl, and Nizamabad Turmeric is ₹13,800 / Qtl. Selling directly via KisanSaathi guarantees direct DBT credit within 24 hours."
      },
      {
        keywords: ['pest', 'disease', 'spray', 'neem', 'fungus', 'leaf', 'worm', 'insect', 'organic', 'treatment'],
        reply: "For pest control in Telangana paddy and pulse crops: Prepare 100% organic Neemastra by fermenting 5 kg fresh neem leaves, 5 liters cow urine, and 2 kg cow dung in a shaded container for 48 hours. Spray 200 ml per 15L pump. It provides complete protection against stem borers, aphids, and whiteflies without soil degradation."
      },
      {
        keywords: ['insurance', 'pmfby', 'claim', 'loss', 'flood', 'rain', 'drought', 'crop insurance'],
        reply: "Under PMFBY & Telangana State Disaster Relief: For localized damage from unseasonal rain, hail, or pests, submit your claim within 72 hours via the KisanSaathi portal or call the Kisan Call Center toll-free at 1800-180-1551 (PMFBY helpline: 1800-200-5142)."
      },
      {
        keywords: ['cluster', 'fpo', 'warangal', 'farmer', 'group', 'aggregation'],
        reply: "Warangal Agri-Cluster #12 connects 480+ local farmers across Geesugonda, Atmakur, and Wardhannapet. Aggregating produce reduces logistics cost by 38% and unlocks bulk buying contracts from Hyderabad food processors."
      },
      {
        keywords: ['loan', 'credit', 'kcc', 'interest', 'money', 'bank', 'score'],
        reply: "Your KisanSaathi Agri Credit Score is 785/900 based on verified harvest history and Soil Health Card records. You are pre-approved for a ₹3,00,000 crop loan at a subsidized 4% effective interest rate through Telangana State Cooperative Bank."
      },
      {
        keywords: ['soil', 'lab', 'testing', 'card', 'npk', 'ph', 'fertilizer'],
        reply: "Authorized Telangana Soil Testing Labs are active in Warangal (RARS Mulugu Road & Paidipally), Hyderabad (PJTSAU Rajendranagar), Medchal (Kandlakoi AMC), and Nizamabad (Shradhanand Gunj). Testing is free under the Soil Health Card scheme."
      },
      {
        keywords: ['seed', 'variety', 'sona', 'rnr', 'paddy', 'masoori'],
        reply: "Recommended high-yielding varieties for Telangana: Telangana Sona (RNR 15048) with low Glycemic Index, BPT 5204 (Samba Mahsuri), and Tandur Red Gram (GI Tagged). Certified seeds are available at AMC Warangal & PJTSAU Seed Distribution Center."
      },
      {
        keywords: ['rythu', 'bandhu', 'bharosa', 'scheme', 'subsidy', 'government'],
        reply: "Telangana Rythu Bharosa / Rythu Bandhu provides financial investment support of ₹10,000 per acre annually directly to farmer DBT accounts. You can check your status in the profile section."
      }
    ],
    hi: [
      {
        keywords: ['भाव', 'rate', 'price', 'mandi', 'दाम', 'धान', 'कपास', 'हल्दी', 'बाजार'],
        reply: "आज एनाममुला मंडी (वारंगल) और बोवेनपल्ली मंडी (सिकंदराबाद) में 'तेलंगाना सोना' धान ₹2,550 - ₹2,750 प्रति क्विंटल (लगभग ₹27.50/किग्रा) बिक रहा है। उच्च गुणवत्ता कपास ₹7,450/क्विंटल और निजामाबाद हल्दी ₹13,800/क्विंटल पर चल रही है। किसान साथी से सीधा बेचने पर 24 घंटे में बैंक खाते में DBT भुगतान प्राप्त होता है।"
      },
      {
        keywords: ['कीटनाशक', 'pest', 'disease', 'neem', 'स्प्रे', 'रोग', 'कीड़ा', 'फफूंद', 'दवा'],
        reply: "धान व कपास की फसलों के लिए: 5 किग्रा नीम के पत्ते, 5 लीटर गोमूत्र और 2 किग्रा देशी गोबर को 48 घंटे सड़ाकर 'नीमास्त्र' जैविक स्प्रे तैयार करें। 15 लीटर पंप में 200 मिली मिलाकर छिड़कें। यह तना छेदक और रसचूसक कीड़ों से 100% जैविक सुरक्षा देता है।"
      },
      {
        keywords: ['बीमा', 'claim', 'pmfby', 'क्लेम', 'नुकसान', 'बारिश', 'मुआवजा'],
        reply: "प्रधानमंत्री फसल बीमा योजना (PMFBY) एवं राज्य आपदा सहायता के अंतर्गत बेमौसम बारिश या ओलावृष्टि से नुकसान होने पर 72 घंटे के भीतर टोल-फ्री 1800 200 5142 या किसान साथी ऐप से सीधा क्लेम दर्ज करें। सहायता नंबर: 1800-425-3502।"
      },
      {
        keywords: ['क्लस्टर', 'cluster', 'वारंगल', 'समूह', 'fpo'],
        reply: "वारंगल क्लस्टर #12 में गीसुगोंडा, आत्माकुर के 480 से अधिक किसान जुड़े हैं। क्लस्टर के माध्यम से फसल बेचने पर परिवहन खर्च 38% कम हो जाता है और हैदराबाद के बड़े खरीदारों से सीधा कांट्रैक्ट मिलता है।"
      },
      {
        keywords: ['loan', 'ऋण', 'kcc', 'क्रेडिट', 'लोन', 'पैसा', 'बैंक', 'स्कोर'],
        reply: "आपकी फसल गुणवत्ता और सॉइल हेल्थ रिकॉर्ड के आधार पर आपका किसान क्रेडिट स्कोर 785/900 है। आप 4% रियायती ब्याज दर पर ₹3,00,000 तक का तत्काल फसली ऋण (KCC) प्राप्त कर सकते हैं।"
      },
      {
        keywords: ['मिट्टी', 'मृदा', 'soil', 'जांच', 'लैब', 'एनपीके', 'पीएच', 'खाद'],
        reply: "वारंगल (RARS मुलुगु रोड व पैडीपल्ली), हैदराबाद (PJTSAU राजेंद्रनगर), मेदचल (कंदलाकोयी), और निजामाबाद (श्रद्धानंद गंज) प्रयोगशालाओं में निःशुल्क मृदा परीक्षण उपलब्ध है। तेलंगाना की लाल दोमट मिट्टी के लिए 6.5 से 7.5 pH सर्वोत्तम है।"
      },
      {
        keywords: ['बीज', 'किस्म', 'सोना', 'rnr', 'धान'],
        reply: "तेलंगाना के लिए प्रमुख अनुशंसित किस्में: 'तेलंगाना सोना' (RNR 15048 कम ग्लाइसेमिक इंडेक्स), सांभा महसूरी (BPT 5204), और तांदूर लाल चना (GI टैग)। प्रमाणित बीज AMC वारंगल और PJTSAU केंद्र पर उपलब्ध हैं।"
      },
      {
        keywords: ['रायथू', 'बंधु', 'भरोसा', 'योजना', 'सब्सिडी', 'सरकारी'],
        reply: "रायथू बंधु / रायथू भरोसा योजना के तहत प्रति एकड़ ₹10,000 सालाना सीधे किसान के बैंक खाते (DBT) में जमा किए जाते हैं। अपने पट्टा पासबुक की स्थिति प्रोफ़ाइल मेनू में जांच सकते हैं।"
      }
    ]
  };

  const quickPromptsByLang = {
    en: [
      { label: "🌾 Mandi Rates (Warangal)", query: "What are today's mandi prices for paddy and cotton in Warangal?" },
      { label: "🐛 Organic Pest Spray", query: "How to prepare organic neem pest control spray?" },
      { label: "📋 PMFBY Insurance Claim", query: "How to file crop insurance claim under PMFBY?" },
      { label: "💰 4% Crop Loan & Credit", query: "Check my eligible credit score and loan limit" },
      { label: "🌱 Telangana Sona Seeds", query: "Tell me about Telangana Sona RNR 15048 seed variety" },
      { label: "🧪 Soil Testing Labs", query: "Where is the nearest soil testing lab in Warangal?" }
    ],
    hi: [
      { label: "🌾 वारंगल मंडी भाव", query: "वारंगल एनाममुला मंडी में आज धान और कपास का भाव क्या है?" },
      { label: "🐛 जैविक कीटनाशक स्प्रे", query: "धान में रस चूसक कीड़ों के लिए जैविक स्प्रे कैसे बनाएं?" },
      { label: "📋 फसल बीमा क्लेम", query: "फसल नुकसान पर बीमा क्लेम कैसे दर्ज करें?" },
      { label: "💰 4% फसली ऋण (KCC)", query: "मेरा क्रेडिट स्कोर और ऋण पात्रता क्या है?" },
      { label: "🌱 तेलंगाना सोना बीज", query: "तेलंगाना सोना RNR 15048 बीज की जानकारी दें" },
      { label: "🧪 मृदा परीक्षण लैब", query: "वारंगल में नजदीकी सरकारी मिट्टी जांच लैब कहाँ है?" }
    ]
  };

  function appendChatMessage(sender, text) {
    if (!chatMessages) return;
    const isBot = sender === 'bot';
    const msgEl = document.createElement('div');
    msgEl.className = `flex gap-2.5 items-start ${isBot ? '' : 'justify-end'}`;
    msgEl.innerHTML = `
      ${isBot ? '<div class="w-7 h-7 rounded-full bg-purple-700 text-white flex items-center justify-center flex-shrink-0 text-xs">🌾</div>' : ''}
      <div class="${isBot ? 'bg-purple-50 text-gray-800 rounded-tl-none' : 'bg-purple-700 text-white rounded-tr-none'} p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-xs">
        ${text}
      </div>
    `;
    chatMessages.appendChild(msgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function initOrUpdateChat(lang) {
    if (!chatQuickPromptsContainer) return;
    const prompts = quickPromptsByLang[lang] || quickPromptsByLang.en;
    chatQuickPromptsContainer.innerHTML = prompts.map(p => `
      <button type="button" class="chat-quick-btn whitespace-nowrap px-3 py-1.5 rounded-full font-medium border text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 transition flex-shrink-0" data-msg="${p.query}">
        ${p.label}
      </button>
    `).join('');

    // Re-bind quick button clicks
    chatQuickPromptsContainer.querySelectorAll('.chat-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-msg');
        if (chatInput && chatForm) {
          chatInput.value = q;
          chatForm.dispatchEvent(new Event('submit'));
        }
      });
    });

    // Update input placeholder
    if (chatInput) {
      chatInput.placeholder = lang === 'hi'
        ? 'यहाँ अपना कृषि प्रश्न लिखें (जैसे वारंगल मंडी भाव, कीटनाशक)...'
        : 'Type your farming query here (e.g. Warangal mandi rate, pest spray)...';
    }

    // Update status text
    const statusText = document.getElementById('chatStatusText');
    if (statusText) {
      statusText.textContent = lang === 'hi'
        ? '● ऑनलाइन | हिंदी एवं अंग्रेजी वॉयस समर्थित'
        : '● Online | English & Hindi Voice Supported';
    }

    // Populate welcome greeting if empty or if language changed
    if (chatMessages && (chatMessages.children.length === 0 || chatMessages.dataset.activeLang !== lang)) {
      chatMessages.innerHTML = '';
      chatMessages.dataset.activeLang = lang;
      const farmerGreetingName = currentFarmerName || 'Farmer';
      const welcomeMsg = lang === 'hi'
        ? `नमस्ते ${farmerGreetingName} जी! मैं तेलंगाना का आपका किसान साथी (KisanSaathi) AI सहायक हूँ। मुझसे एनाममुला व बोवेनपल्ली मंडी के ताजा भाव, जैविक कीटनाशक, रायथू बंधु, या वारंगल व अन्य जिलों में मृदा परीक्षण के बारे में पूछें।`
        : `Namaste ${farmerGreetingName}! I am your KisanSaathi AI Assistant for Telangana. Ask me about mandi rates (Enumamula, Bowenpally), organic fertilizers, PMFBY crop insurance, or soil health testing in Warangal and surrounding districts.`;
      appendChatMessage('bot', welcomeMsg);
    }
    // Refresh WhatsApp Channel Prompts
    if (typeof window.initOrUpdateWhatsApp === 'function') {
      window.initOrUpdateWhatsApp(lang);
    }
  }
  window.initOrUpdateChat = initOrUpdateChat;

  // =========================================================================
  // WHATSAPP AI ASSISTANT CHATBOT CHANNEL INTEGRATION (Bilingual Indian Languages)
  // =========================================================================
  const waPromptsByLang = {
    en: [
      { label: "🌾 Mandi Rates (Warangal)", query: "What are today's mandi prices for paddy and cotton in Warangal?" },
      { label: "🐛 Neemastra Pest Spray", query: "How to prepare organic neem pest control spray?" },
      { label: "📋 PMFBY Crop Insurance", query: "How to file crop insurance claim under PMFBY?" },
      { label: "💳 4% Subsidized Crop Loan", query: "Check my eligible credit score and loan limit" },
      { label: "🌱 Telangana Sona Seeds", query: "Tell me about Telangana Sona RNR 15048 seed variety" },
      { label: "🧪 Soil Testing Labs", query: "Where is the nearest soil testing lab in Warangal?" }
    ],
    hi: [
      { label: "🌾 वारंगल मंडी भाव", query: "वारंगल एनाममुला मंडी में आज धान और कपास का भाव क्या है?" },
      { label: "🐛 जैविक कीटनाशक नीमास्त्र", query: "धान में रस चूसक कीड़ों के लिए जैविक नीमास्त्र स्प्रे कैसे बनाएं?" },
      { label: "📋 PMFBY फसल बीमा क्लेम", query: "फसल नुकसान पर PMFBY बीमा क्लेम कैसे दर्ज करें?" },
      { label: "💰 4% फसली ऋण (KCC)", query: "मेरा किसान क्रेडिट स्कोर और ऋण पात्रता क्या है?" },
      { label: "🌱 तेलंगाना सोना बीज", query: "तेलंगाना सोना RNR 15048 बीज की जानकारी दें" },
      { label: "🧪 मृदा परीक्षण लैब", query: "वारंगल में नजदीकी सरकारी मिट्टी जांच लैब कहाँ है?" }
    ],
    te: [
      { label: "🌾 వరంగల్ మండి ధరలు", query: "వరంగల్ ఎనుమాముల మండిలో ఈరోజు వరి మరియు పత్తి ధరలు ఎంత?" },
      { label: "🐛 సేంద్రీయ నీమాస్త్రం", query: "తెగుళ్ల నివారణకు సేంద్రీయ నీమాస్త్రం తయారీ విధానం తెలపండి" },
      { label: "📋 PMFBY పంట బీమా", query: "అకాల వర్షాల పంట నష్టానికి PMFBY బీమా క్లెయిమ్ ఎలా చేయాలి?" },
      { label: "💳 4% సబ్సిడీ పంట రుణం", query: "నా క్రెడిట్ స్కోర్ మరియు 4% పంట రుణ పరిమితి తెలపండి" },
      { label: "🌱 తెలంగాణ సోనా విత్తనాలు", query: "తెలంగాణ సోనా RNR 15048 విత్తన రకం గురించి తెలపండి" },
      { label: "🧪 ఉచిత నేల పరీక్ష", query: "వరంగల్‌లో సమీప ప్రభుత్వ నేల పరీక్ష కేంద్రం ఎక్కడ ఉంది?" }
    ]
  };

  const WA_DEFAULT_GREETINGS = {
    en: "Namaste, I want agricultural advisory from KisanSaathi AI",
    hi: "नमस्ते, मुझे किसान साथी AI से कृषि सलाह चाहिए",
    te: "నమస్కారం, నాకు కిసాన్ సాథి AI నుండి వ్యవసాయ సలహా కావాలి"
  };

  const WA_PHONE_NUMBER = "14155238886"; // Twilio WhatsApp Sandbox Number

  window.initOrUpdateWhatsApp = function(activeLang) {
    const lang = ['en', 'hi', 'te'].includes(activeLang) ? activeLang : (activeLang === 'hi' ? 'hi' : 'en');
    const container = document.getElementById('waQuickChipsContainer');
    const defaultText = WA_DEFAULT_GREETINGS[lang] || WA_DEFAULT_GREETINGS.en;
    const defaultUrl = `https://wa.me/${WA_PHONE_NUMBER}?text=${encodeURIComponent(defaultText)}`;

    // Update Banner, Floating, and Drawer Buttons
    const btnBanner = document.getElementById('btnBannerWhatsApp');
    if (btnBanner) btnBanner.href = defaultUrl;
    const btnFloat = document.getElementById('floatingWhatsAppBtn');
    if (btnFloat) btnFloat.href = defaultUrl;
    const btnDrawer = document.getElementById('drawerWhatsAppBtn');
    if (btnDrawer) btnDrawer.href = defaultUrl;

    // Render Quick Action Chips for Selected Indian Language
    if (container) {
      const prompts = waPromptsByLang[lang] || waPromptsByLang.en;
      container.innerHTML = prompts.map(p => `
        <a href="https://wa.me/${WA_PHONE_NUMBER}?text=${encodeURIComponent(p.query)}"
           target="_blank"
           rel="noopener noreferrer"
           class="whitespace-nowrap px-3 py-1.5 rounded-full font-bold border text-xs bg-white text-emerald-950 hover:bg-emerald-50 border-emerald-300 shadow-xs transition flex-shrink-0 flex items-center gap-1 active:scale-95">
          <svg class="w-3.5 h-3.5 fill-[#25D366] flex-shrink-0" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.004.577 1.764.846 2.806.847h.002c3.182 0 5.768-2.587 5.768-5.766.001-3.182-2.585-5.63-5.77-5.63zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.025-.078-.584-.195-1.378-.583-2.316-1.424-.925-.828-1.523-1.848-1.748-2.235-.226-.388-.024-.597.108-.729.117-.117.26-.301.39-.452.129-.151.172-.258.258-.43.086-.172.043-.323-.021-.452-.065-.129-.582-1.402-.8-1.921-.211-.505-.427-.436-.584-.444-.151-.008-.324-.01-.496-.01-.172 0-.452.065-.689.323-.237.258-.905.884-.905 2.155s.926 2.499 1.055 2.671c.129.172 1.821 2.782 4.412 3.899 2.591 1.117 2.591.744 3.064.698.473-.046 1.527-.624 1.743-1.226.215-.602.215-1.118.151-1.226-.065-.108-.237-.172-.452-.28z"/>
          </svg>
          <span>${p.label}</span>
        </a>
      `).join('');
    }

    // Update active tab styling
    document.querySelectorAll('.wa-lang-tab').forEach(tab => {
      const tabLang = tab.getAttribute('data-walang');
      if (tabLang === lang) {
        tab.className = 'wa-lang-tab px-2 py-0.5 rounded-full bg-white text-emerald-900 font-extrabold transition shadow-xs';
      } else {
        tab.className = 'wa-lang-tab px-2 py-0.5 rounded-full bg-emerald-800/80 hover:bg-emerald-800 text-white font-extrabold transition';
      }
    });
  };

  // Bind tab click events
  document.querySelectorAll('.wa-lang-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const selected = tab.getAttribute('data-walang');
      window.initOrUpdateWhatsApp(selected);
    });
  });

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = chatInput ? chatInput.value.trim() : '';
      if (!msg) return;

      appendChatMessage('user', msg);
      if (chatInput) chatInput.value = '';

      // Bot Processing
      setTimeout(() => {
        const lower = msg.toLowerCase();
        
        // Detect English query: English characters or currently active English language
        const isAsciiOnly = /^[\x00-\x7F\s.,?!'"-:;()0-9]+$/.test(msg);
        const queryLang = isAsciiOnly ? (currentLanguage || 'en') : 'hi';
        const knowledge = botKnowledge[queryLang] || botKnowledge[currentLanguage] || botKnowledge.en;
        
        let botReply = queryLang === 'hi'
          ? 'धन्यवाद! आपके प्रश्न का उत्तर तैयार किया जा रहा है। तेलंगाना कृषि विशेषज्ञ सलाह के लिए आप किसान कॉल सेंटर टोल-फ्री 1800-180-1551 पर भी सीधे संपर्क कर सकते हैं।'
          : 'Thank you! For expert agricultural advisories in Telangana, you can also reach the Kisan Call Center toll-free at 1800-180-1551 or the Warangal District Agriculture Office.';

        // Search in primary knowledge base
        let found = false;
        for (const item of knowledge) {
          if (item.keywords.some(k => lower.includes(k.toLowerCase()))) {
            botReply = item.reply;
            found = true;
            break;
          }
        }

        // If not found, cross-search other language keywords
        if (!found) {
          const altLang = queryLang === 'en' ? 'hi' : 'en';
          const altKnowledge = botKnowledge[altLang];
          for (const item of altKnowledge) {
            if (item.keywords.some(k => lower.includes(k.toLowerCase()))) {
              botReply = item.reply;
              break;
            }
          }
        }

        appendChatMessage('bot', botReply);

        // Speech synthesis voice
        if (voiceEnabled && 'speechSynthesis' in window) {
          const utter = new SpeechSynthesisUtterance(botReply);
          utter.lang = queryLang === 'hi' ? 'hi-IN' : 'en-IN';
          window.speechSynthesis.speak(utter);
        }
      }, 500);
    });
  }

  const btnVoiceToggle = document.getElementById('btnVoiceToggle');
  if (btnVoiceToggle) {
    btnVoiceToggle.addEventListener('click', () => {
      voiceEnabled = !voiceEnabled;
      if (voiceEnabled) {
        btnVoiceToggle.className = 'p-2 rounded-xl bg-purple-700 text-white transition';
        showToast(currentLanguage === 'hi' ? 'वॉयस प्लेबैक चालू किया गया' : 'Voice playback enabled');
      } else {
        btnVoiceToggle.className = 'p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition';
        showToast(currentLanguage === 'hi' ? 'वॉयस म्यूट किया गया' : 'Voice muted');
      }
    });
  }

  // =========================================================================
  // SECTION 13: ABOUT TEAM & CONTRIBUTORS (About_us.java)
  // =========================================================================
  function renderAboutTeam() {
    const container = document.getElementById('teamGrid');
    container.innerHTML = KISAN_DATA.about.team.map(member => `
      <div class="kisan-card p-4 text-center rounded-2xl bg-white border border-purple-100 shadow-sm hover:border-purple-300 transition-all flex flex-col justify-center min-h-[90px]">
        <h4 class="font-bold text-sm text-gray-900">${member.name}</h4>
        <p class="text-xs text-purple-700 font-medium mt-1">${member.role}</p>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  // =========================================================================
  // SECTION 14: SCREENSHOTS SHOWCASE (ss1.png to ss15.png)
  // =========================================================================
  function renderScreenshots() {
    const container = document.getElementById('screenshotsGrid');
    container.innerHTML = KISAN_DATA.screenshots.map(s => `
      <div class="kisan-card p-2 space-y-1.5">
        <div class="rounded-xl overflow-hidden bg-gray-900 border">
          <img src="${s.file}" alt="${s.title}" class="w-full h-56 object-contain" />
        </div>
        <h4 class="font-bold text-xs text-gray-900 truncate">${s.title}</h4>
        <p class="text-[10px] text-gray-500 leading-snug">${s.desc}</p>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  // =========================================================================
  // SECTION 15: SEARCH FEATURE MATRIX (SearchFragment)
  // =========================================================================
  const featuresList = [
    { title: "Inventory Crops", icon: "package", target: "inventory" },
    { title: "Add Crop to Sell", icon: "plus-circle", target: "upload" },
    { title: "Quality Check (AI)", icon: "scan-line", target: "quality" },
    { title: "Price Negotiations", icon: "handshake", target: "negotiate" },
    { title: "View Your Orders", icon: "truck", target: "orders" },
    { title: "Earnings & Wallet", icon: "wallet", target: "wallet" },
    { title: "Blockchain Loans", icon: "blocks", target: "blockchain" },
    { title: "Soil Testing Labs", icon: "test-tube", target: "soil" },
    { title: "Crop Production", icon: "book-open", target: "info" },
    { title: "Godowns & Storage", icon: "warehouse", target: "godowns" },
    { title: "Logistics Network", icon: "navigation", target: "logistics" },
    { title: "Weather Forecast", icon: "cloud-sun", target: "weather" },
    { title: "AI Kisan Chat", icon: "bot", target: "chat" },
    { title: "About Application", icon: "info", target: "about" }
  ];

  function openSearchModal() {
    renderSearchGrid(featuresList);
    document.getElementById('modalSearchGrid').classList.add('open');
  }

  document.getElementById('btnCloseSearch').addEventListener('click', () => {
    document.getElementById('modalSearchGrid').classList.remove('open');
  });

  function renderSearchGrid(list) {
    const container = document.getElementById('searchGridContainer');
    container.innerHTML = list.map(f => `
      <div class="bg-gray-50 hover:bg-purple-50 p-3 rounded-2xl text-center border border-gray-100 cursor-pointer transition flex flex-col items-center justify-center space-y-1" onclick="selectSearchFeature('${f.target}')">
        <i data-lucide="${f.icon}" class="w-6 h-6 text-purple-700"></i>
        <span class="text-[11px] font-bold text-gray-800 leading-tight">${f.title}</span>
      </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
  }

  window.selectSearchFeature = function(target) {
    document.getElementById('modalSearchGrid').classList.remove('open');
    navigateTo(target);
  };

  document.getElementById('inputSearchFeature').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = featuresList.filter(f => f.title.toLowerCase().includes(query));
    renderSearchGrid(filtered);
  });

  // Grievance / Feedback form submit
  document.getElementById('formFeedback').addEventListener('submit', async (e) => {
    e.preventDefault();
    const subjectEl = document.querySelector('#formFeedback input[type="text"]');
    const msgEl = document.querySelector('#formFeedback textarea');
    const catEl = document.querySelector('#formFeedback select');

    const subject = subjectEl ? subjectEl.value.trim() : 'Mandi / Soil Inquiry';
    const message = msgEl ? msgEl.value.trim() : 'Grievance submitted by farmer';
    const category = catEl ? catEl.value : 'mandi_rate';
    const ticketNo = 'TG-2026-' + Math.floor(1000 + Math.random() * 9000);

    let activeFarmerId = currentFarmerId || 'FARMER-TG-7721';
    const authData = localStorage.getItem('kisan_auth');
    if (authData) {
      try {
        const sess = JSON.parse(authData);
        if (sess.farmerId) activeFarmerId = sess.farmerId;
      } catch (e) {}
    }

    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from('grievance_tickets').insert([{
          farmer_id: activeFarmerId,
          ticket_number: ticketNo,
          subject: subject || 'Farmer Support Ticket',
          category: category,
          description: message,
          status: 'in_review'
        }]);
      } catch (err) {
        console.warn('Grievance ticket sync notice:', err);
      }
    }

    document.getElementById('formFeedback').reset();
    showToast(`Grievance ticket #${ticketNo} registered with Agriculture Dept!`);
    navigateTo('inventory');
  });

  // Sign Out Demo Data Button
  const btnSignOutDemo = document.getElementById('btnSignOutDemo');
  if (btnSignOutDemo) {
    btnSignOutDemo.addEventListener('click', () => {
      handleSignOut();
    });
  }

  // Initial Bootup
  checkAuthStatus();
  applyViewMode(currentViewMode);
  applyLanguage(currentLanguage);
  if (typeof initOrUpdateChat === 'function') {
    initOrUpdateChat(currentLanguage);
  }
  loadSoilLabsData();
  navigateTo('inventory');
}

// Client-side initialization: Execute only when running in a browser environment with DOM
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKisanSaathi);
  } else {
    initKisanSaathi();
  }
}

// Node.js environment export (safely handles any server-side evaluation/bundling)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { name: 'KisanSaathi', client: true };
}
