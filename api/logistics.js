// Vercel Serverless Function: Kisaan Saathi Logistics Network API
// Zero-hallucination verified directory, OSRM road routing engine, and shipment tracking portal integration
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Locate logistics dataset
function getLogisticsData() {
  const candidates = [
    path.join(__dirname, '..', 'assets', 'data', 'logistics.json'),
    path.join(process.cwd(), 'assets', 'data', 'logistics.json'),
    path.join(__dirname, 'assets', 'data', 'logistics.json')
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        return JSON.parse(raw);
      } catch (_e) {}
    }
  }
  return [];
}

// Known coordinates for Telangana Mandis & Agricultural Centers for Genuine Road Routing
const MANDI_COORDINATES = {
  'enumamula': { name: "Enumamula Wholesale Mandi (Warangal)", lat: 17.9689, lon: 79.5941, district: "Warangal" },
  'bowenpally': { name: "Bowenpally Modern Market Yard (Secunderabad)", lat: 17.4728, lon: 78.4839, district: "Hyderabad" },
  'kandlakoi': { name: "Kandlakoi Market Yard (Medchal)", lat: 17.5892, lon: 78.4901, district: "Medchal" },
  'nizamabad': { name: "Shradhanand Gunj Mandi (Nizamabad)", lat: 18.6725, lon: 78.0941, district: "Nizamabad" },
  'miryalaguda': { name: "Miryalaguda Mega Rice Market (Nalgonda)", lat: 16.8718, lon: 79.5635, district: "Nalgonda" },
  'khammam': { name: "Khammam Cotton & Grain Yard", lat: 17.2473, lon: 80.1514, district: "Khammam" },
  'karimnagar': { name: "Karimnagar Agriculture Market", lat: 18.4386, lon: 79.1328, district: "Karimnagar" },
  'malakpet': { name: "Malakpet Market Yard (Hyderabad)", lat: 17.3753, lon: 78.4983, district: "Hyderabad" },
  'geesugonda': { name: "Geesugonda Farm Cluster (Warangal Rural)", lat: 17.9542, lon: 79.6841, district: "Warangal Rural" },
  'kothawada': { name: "Kothawada Storage Hub (Warangal)", lat: 17.9784, lon: 79.5941, district: "Warangal" }
};

// Great-circle Haversine distance formula (in km)
function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

// Request real road routing from OpenStreetMap OSRM Service
function fetchOsrmRoute(originCoord, destCoord) {
  return new Promise((resolve) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${originCoord.lon},${originCoord.lat};${destCoord.lon},${destCoord.lat}?overview=false`;
    const req = https.get(url, { headers: { 'User-Agent': 'KisaanSaathi-AgriLogistics/3.5' }, timeout: 4500 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.code === 'Ok' && parsed.routes && parsed.routes.length > 0) {
            const route = parsed.routes[0];
            const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
            const durationMin = Math.round(route.duration / 60);
            return resolve({
              success: true,
              engine: 'osrm_real_driving',
              distanceKm: distanceKm,
              durationMinutes: durationMin,
              durationFormatted: `${Math.floor(durationMin / 60)} hrs ${durationMin % 60} mins`,
              disclaimer: 'Calculated using OpenStreetMap/OSRM road network routing engine based on actual highway alignment.'
            });
          }
        } catch (_e) {}
        resolve({ success: false });
      });
    });

    req.on('error', () => resolve({ success: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false });
    });
  });
}

module.exports = async (req, res) => {
  // CORS & Response Headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = urlObj.searchParams.get('action') || 'list';

  // Read body if POST
  let body = {};
  if (req.method === 'POST') {
    try {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const dataStr = Buffer.concat(buffers).toString('utf8');
      if (dataStr) {
        body = JSON.parse(dataStr);
      }
    } catch (_e) {}
  }

  const providers = getLogisticsData();

  // 1. ACTION: ROUTE PLANNER (Genuine Road Routing via OSRM with Geodesic Fallback)
  if (action === 'route') {
    const originKey = (urlObj.searchParams.get('origin') || body.origin || '').toLowerCase().trim();
    const destKey = (urlObj.searchParams.get('destination') || body.destination || '').toLowerCase().trim();

    let originCoord = MANDI_COORDINATES[originKey];
    let destCoord = MANDI_COORDINATES[destKey];

    // If explicit lat/lon passed
    if (!originCoord && body.origin_lat && body.origin_lon) {
      originCoord = { name: body.origin_name || 'Pickup Location', lat: parseFloat(body.origin_lat), lon: parseFloat(body.origin_lon) };
    }
    if (!destCoord && body.dest_lat && body.dest_lon) {
      destCoord = { name: body.dest_name || 'Destination Mandi', lat: parseFloat(body.dest_lat), lon: parseFloat(body.dest_lon) };
    }

    if (!originCoord || !destCoord) {
      res.statusCode = 400;
      return res.end(JSON.stringify({
        error: "Missing or invalid origin/destination",
        available_presets: Object.keys(MANDI_COORDINATES).map(k => ({ key: k, name: MANDI_COORDINATES[k].name }))
      }));
    }

    // Attempt real OSRM road routing
    let routeResult = await fetchOsrmRoute(originCoord, destCoord);

    // If OSRM fails or times out, calculate geodesic distance
    if (!routeResult.success) {
      const haversineKm = calculateHaversine(originCoord.lat, originCoord.lon, destCoord.lat, destCoord.lon);
      const estimatedRoadKm = Math.round((haversineKm * 1.22) * 10) / 10; // Standard 22% road-winding factor
      const estimatedDurationMin = Math.round((estimatedRoadKm / 45) * 60); // 45 km/h truck speed
      routeResult = {
        success: true,
        engine: 'geodesic_haversine',
        distanceKm: estimatedRoadKm,
        durationMinutes: estimatedDurationMin,
        durationFormatted: `${Math.floor(estimatedDurationMin / 60)} hrs ${estimatedDurationMin % 60} mins`,
        disclaimer: `Estimated using geodesic coordinates with a 22% highway winding factor (${haversineKm} km direct line). OSRM online highway service unreachable.`
      };
    }

    res.statusCode = 200;
    return res.end(JSON.stringify({
      status: "success",
      origin: originCoord,
      destination: destCoord,
      routing: routeResult,
      anti_hallucination_notice: "Prices cannot be fixed automatically without a provider quote. Farmers should enter their negotiated truck rate or refer to indicative benchmark rates."
    }));
  }

  // 2. ACTION: TRACKING (Official Provider Web Portal & Status Validation)
  if (action === 'track') {
    const providerId = urlObj.searchParams.get('provider_id') || body.provider_id || '';
    const trackingId = (urlObj.searchParams.get('tracking_id') || body.tracking_id || '').trim();

    const provider = providers.find(p => p.provider_id === providerId);
    if (!provider) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: "Provider not found in verified registry" }));
    }

    if (!trackingId) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "Tracking ID / Waybill Number is required" }));
    }

    // Zero-hallucination: We do not invent fake GPS locations. We direct the farmer to the genuine carrier portal.
    res.statusCode = 200;
    return res.end(JSON.stringify({
      status: "verified_portal_redirect",
      provider_name: provider.business_name,
      tracking_id: trackingId,
      official_tracking_url: provider.tracking_url,
      verification_status: provider.verification_status,
      tracking_api_status: provider.tracking_api_status,
      instructions: `Please enter '${trackingId}' into the official ${provider.business_name} tracking portal. Direct carrier enterprise API integration requires an active corporate B2B agreement. Live status cannot be simulated without authentic carrier authentication.`,
      disclaimer: "Zero-hallucination compliance: Live carrier tracking coordinates are never fabricated."
    }));
  }

  // 3. ACTION: MIDDLEMAN & COST TRANSPARENCY CALCULATOR
  if (action === 'transparency') {
    const grossSale = parseFloat(body.gross_sale || urlObj.searchParams.get('gross_sale') || 0);
    const quantityKg = parseFloat(body.quantity_kg || urlObj.searchParams.get('quantity_kg') || 0);
    const transportCharge = parseFloat(body.transport_charge || urlObj.searchParams.get('transport_charge') || 0);
    const commissionRatePercent = parseFloat(body.commission_rate_percent || urlObj.searchParams.get('commission_rate_percent') || 0);
    const handlingCharge = parseFloat(body.handling_charge || urlObj.searchParams.get('handling_charge') || 0);
    const mandiFeePercent = parseFloat(body.mandi_fee_percent || urlObj.searchParams.get('mandi_fee_percent') || 0);
    const otherDeductions = parseFloat(body.other_deductions || urlObj.searchParams.get('other_deductions') || 0);

    const commissionAmount = Math.round((grossSale * (commissionRatePercent / 100)) * 100) / 100;
    const mandiFeeAmount = Math.round((grossSale * (mandiFeePercent / 100)) * 100) / 100;
    const totalDeductions = Math.round((transportCharge + commissionAmount + handlingCharge + mandiFeeAmount + otherDeductions) * 100) / 100;
    const netReceived = Math.round((grossSale - totalDeductions) * 100) / 100;
    const deductionsPercent = grossSale > 0 ? Math.round((totalDeductions / grossSale * 100) * 10) / 10 : 0;
    const netPerKg = quantityKg > 0 ? Math.round((netReceived / quantityKg) * 100) / 100 : 0;

    // Direct Buyer Comparison (0% commission, 50% handling reduction)
    const directBuyerNet = Math.round((grossSale - (transportCharge + (handlingCharge * 0.5))) * 100) / 100;
    const directBenefit = Math.round((directBuyerNet - netReceived) * 100) / 100;

    res.statusCode = 200;
    return res.end(JSON.stringify({
      status: "success",
      input_charges: {
        gross_sale: grossSale,
        quantity_kg: quantityKg,
        transport_charge: transportCharge,
        commission_amount: commissionAmount,
        commission_rate_percent: commissionRatePercent,
        handling_charge: handlingCharge,
        mandi_fee_amount: mandiFeeAmount,
        other_deductions: otherDeductions
      },
      results: {
        total_deductions: totalDeductions,
        net_received_by_farmer: netReceived,
        deductions_percentage_of_gross: deductionsPercent,
        net_realized_price_per_kg: netPerKg,
        direct_to_buyer_potential_net: directBuyerNet,
        estimated_savings_via_direct_or_fpo: directBenefit
      },
      transparency_label: "Farmer-Entered Transaction Audit. Not an official state-mandated tariff."
    }));
  }

  // 4. ACTION: LIST & FILTER PROVIDERS
  const search = (urlObj.searchParams.get('search') || '').toLowerCase().trim();
  const service = (urlObj.searchParams.get('service') || '').toLowerCase().trim();
  const district = (urlObj.searchParams.get('district') || '').toLowerCase().trim();
  const state = (urlObj.searchParams.get('state') || '').toLowerCase().trim();
  const pin = (urlObj.searchParams.get('pin') || '').trim();

  let filtered = providers.filter(p => p.is_active !== false);

  if (search) {
    filtered = filtered.filter(p =>
      p.business_name.toLowerCase().includes(search) ||
      p.address.toLowerCase().includes(search) ||
      p.district.toLowerCase().includes(search) ||
      p.service_areas.toLowerCase().includes(search) ||
      (p.service_categories && p.service_categories.some(c => c.toLowerCase().includes(search))) ||
      p.notes.toLowerCase().includes(search) ||
      p.pin_code.includes(search)
    );
  }

  if (district) {
    filtered = filtered.filter(p => p.district.toLowerCase().includes(district) || p.district.toLowerCase().includes('multiple'));
  }

  if (state) {
    filtered = filtered.filter(p => p.state.toLowerCase().includes(state) || p.state.toLowerCase().includes('pan-india'));
  }

  if (pin) {
    filtered = filtered.filter(p => p.pin_code.includes(pin));
  }

  if (service) {
    if (service === 'cold_storage') filtered = filtered.filter(p => p.cold_storage_available);
    else if (service === 'warehouse') filtered = filtered.filter(p => p.warehouse_available);
    else if (service === 'reefer') filtered = filtered.filter(p => p.reefer_available);
    else if (service === 'bulk') filtered = filtered.filter(p => p.bulk_transport_available);
    else if (service === 'small_load') filtered = filtered.filter(p => p.small_load_available);
    else if (service === 'transport') filtered = filtered.filter(p => p.bulk_transport_available || p.small_load_available || p.reefer_available);
  }

  res.statusCode = 200;
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end(JSON.stringify({
    status: "success",
    total_verified_records: providers.length,
    matched_records: filtered.length,
    filters_applied: { search, service, district, state, pin },
    source_authorities: [
      "National Agriculture Market (e-NAM) Portal - https://enam.gov.in",
      "Central Warehousing Corporation (CWC) - https://cewacor.nic.in",
      "Telangana State Warehousing Corporation (TGSWC) - https://tgswc.telangana.gov.in",
      "Department of Agricultural Marketing, Telangana - https://eagrimarket.telangana.gov.in",
      "Container Corporation of India (CONCOR) - https://www.concorindia.co.in",
      "Official Corporate Logistics Carriers (TCI Freight, V-Trans, Allcargo Gati, Safexpress)"
    ],
    providers: filtered
  }));
};
