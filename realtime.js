/* =========================================================
   Realtime — refresh caches whenever core tables change
   ========================================================= */
(function () {
  const sb = window.sb;
  let channel = null;
  let timer = null;
  let running = false;

  function scheduleRefresh() {
    if (!running) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (typeof window.refreshWorkspace === 'function') {
        window.refreshWorkspace({ silent: true, reason: 'realtime' });
      }
    }, 350);
  }

  function startRealtime() {
    stopRealtime();
    running = true;
    channel = sb.channel('trackday-workspace');

    ['schools', 'students', 'events', 'games', 'entries', 'profiles'].forEach(table => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, scheduleRefresh);
    });

    channel.subscribe(status => {
      if (status === 'SUBSCRIBED') {
        if (typeof window.onRealtimeStatus === 'function') window.onRealtimeStatus(true);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        if (typeof window.onRealtimeStatus === 'function') window.onRealtimeStatus(false);
      }
    });
  }

  function stopRealtime() {
    running = false;
    clearTimeout(timer);
    timer = null;
    if (channel) {
      try { sb.removeChannel(channel); } catch (_) { /* noop */ }
      channel = null;
    }
    if (typeof window.onRealtimeStatus === 'function') window.onRealtimeStatus(false);
  }

  function isRunning() { return running; }

  window.Realtime = { startRealtime, stopRealtime, isRunning };
})();
