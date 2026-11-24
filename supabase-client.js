/* =========================================================
   Supabase browser client
   ========================================================= */
(function () {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase JS library failed to load.');
    return;
  }

  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'trackday.auth',
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  });
})();
