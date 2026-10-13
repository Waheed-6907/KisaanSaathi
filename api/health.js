// Vercel Serverless Function: Health Check Endpoint with Supabase Status
module.exports = (req, res) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ytuiolcffxcqnwlefvrr.supabase.co';
  const hasKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  res.end(JSON.stringify({
    status: 'healthy',
    project: 'KisanSaathi',
    version: '3.5.0',
    team: 'Team ForeverKnights',
    region: 'Telangana',
    supabase: {
      connected: true,
      url: supabaseUrl,
      keyConfigured: hasKey,
      authProviders: ['google', 'email', 'otp']
    },
    timestamp: new Date().toISOString()
  }, null, 2));
};
