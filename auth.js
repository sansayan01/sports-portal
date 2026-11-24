/* =========================================================
   Authentication, session and password flows
   ========================================================= */
(function () {
  const sb = window.sb;

  let pendingSession = null;
  let activeUserId = null;
  let handling = false;
  let forcedPassword = false;
  let lastError = '';

  const $ = id => document.getElementById(id);

  function tr(key) {
    return typeof window.t === 'function' ? window.t(key) : key;
  }

  function setBusy(btn, busy, busyKey) {
    if (!btn) return;
    if (busy) {
      btn.dataset.original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span class="btn-spinner"></span><span>${tr(busyKey || 'auth.pleaseWait')}</span>`;
    } else {
      btn.disabled = false;
      if (btn.dataset.original) btn.innerHTML = btn.dataset.original;
    }
  }

  function showLogin(message) {
    lastError = message || '';
    if (typeof window.onSignedOut === 'function') {
      try { window.onSignedOut(); } catch (error) { console.error('[auth] clear session UI', error); }
    }
    const auth = $('authScreen');
    const pwd = $('passwordScreen');
    if (auth) auth.hidden = false;
    if (pwd) pwd.hidden = true;
    document.body.classList.remove('authed', 'password-locked');
    document.body.classList.add('auth-locked');
    const err = $('authError');
    if (err) {
      err.hidden = !message;
      err.textContent = message || '';
    }
    const badge = $('loginSubmit');
    setBusy(badge, false);
  }

  function hideLogin() {
    const auth = $('authScreen');
    if (auth) auth.hidden = true;
    document.body.classList.remove('auth-locked');
  }

  function showPasswordScreen(forced, profile) {
    forcedPassword = !!forced;
    const screen = $('passwordScreen');
    const title = $('passwordTitle');
    const sub = $('passwordSub');
    const cancel = $('passwordCancel');
    if (screen) screen.hidden = false;
    document.body.classList.add('password-locked');
    if (title) title.textContent = tr(forced ? 'auth.forceTitle' : 'auth.changeTitle');
    if (sub) {
      sub.textContent = forced
        ? tr('auth.forceSub')
        : tr('auth.changeSub', { email: (profile && profile.email) || '' });
    }
    if (cancel) cancel.hidden = !!forced;
    const err = $('passwordError');
    if (err) { err.hidden = true; err.textContent = ''; }
    $('passwordForm')?.reset();
    setTimeout(() => $('newPassword')?.focus(), 60);
  }

  function hidePasswordScreen() {
    const screen = $('passwordScreen');
    if (screen) screen.hidden = true;
    document.body.classList.remove('password-locked');
  }

  function friendlyAuthError(error) {
    const msg = String((error && error.message) || '');
    if (/invalid login credentials/i.test(msg)) return tr('auth.invalid');
    if (/email not confirmed/i.test(msg)) return tr('auth.notConfirmed');
    if (/rate limit|too many/i.test(msg)) return tr('auth.tooMany');
    if (/failed to fetch|network/i.test(msg)) return tr('auth.network');
    return msg || tr('auth.failed');
  }

  async function loadProfile(userId) {
    const { data, error } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data ? window.Data.mapProfile(data) : null;
  }

  async function handleSession(session) {
    if (!session || !session.user) { await handleSignedOut(); return; }
    if (handling) return;
    if (activeUserId === session.user.id && window.__appStarted) return;
    handling = true;
    try {
      pendingSession = session;
      const profile = await loadProfile(session.user.id);
      if (!profile) {
        await sb.auth.signOut({ scope: 'local' });
        showLogin(tr('auth.noProfile'));
        return;
      }
      if (!profile.isActive) {
        await sb.auth.signOut({ scope: 'local' });
        showLogin(tr('auth.disabled'));
        return;
      }
      if (profile.mustChangePassword) {
        activeUserId = null;
        hideLogin();
        showPasswordScreen(true, profile);
        return;
      }
      activeUserId = session.user.id;
      hideLogin();
      hidePasswordScreen();
      if (typeof window.onAuthenticated === 'function') {
        await window.onAuthenticated(profile, session);
        window.__appStarted = true;
      }
    } catch (error) {
      console.error('[auth]', error);
      activeUserId = null;
      showLogin(friendlyAuthError(error));
    } finally {
      handling = false;
    }
  }

  async function handleSignedOut() {
    const wasActive = !!activeUserId || !!window.__appStarted;
    activeUserId = null;
    pendingSession = null;
    window.__appStarted = false;
    hidePasswordScreen();
    if (wasActive && typeof window.onSignedOut === 'function') {
      try { window.onSignedOut(); } catch (error) { console.error(error); }
    }
    showLogin('');
  }

  async function signIn(email, password) {
    const btn = $('loginSubmit');
    const errBox = $('authError');
    if (errBox) { errBox.hidden = true; errBox.textContent = ''; }
    setBusy(btn, true, 'auth.signingIn');
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await handleSession(data.session);
    } catch (error) {
      showLogin(friendlyAuthError(error));
    } finally {
      setBusy(btn, false);
    }
  }

  async function signOut() {
    try {
      await sb.auth.signOut();
    } catch (error) {
      console.error('[auth] signOut', error);
    }
    await handleSignedOut();
  }

  function openChangePassword() {
    if (!pendingSession && !activeUserId) return;
    showPasswordScreen(false, window.AppState?.profile || null);
  }

  async function submitPassword(event) {
    if (event) event.preventDefault();
    const pass = ($('newPassword') || {}).value || '';
    const confirm = ($('confirmPassword') || {}).value || '';
    const errBox = $('passwordError');
    const btn = $('passwordSubmit');
    const showError = msg => {
      if (errBox) { errBox.hidden = false; errBox.textContent = msg; }
    };
    if (errBox) { errBox.hidden = true; errBox.textContent = ''; }
    if (pass.length < 8) { showError(tr('auth.passwordShort')); return; }
    if (pass !== confirm) { showError(tr('auth.passwordMismatch')); return; }
    setBusy(btn, true, 'auth.saving');
    try {
      const { error } = await sb.auth.updateUser({ password: pass });
      if (error) throw error;
      const userId = (pendingSession && pendingSession.user && pendingSession.user.id) || activeUserId;
      if (userId) {
        const { error: profileError } = await sb.from('profiles')
          .update({ must_change_password: false })
          .eq('id', userId);
        if (profileError) throw profileError;
      }
      const wasForced = forcedPassword;
      hidePasswordScreen();
      if (wasForced) {
        const session = pendingSession || (await sb.auth.getSession()).data.session;
        activeUserId = null;
        await handleSession(session);
      } else {
        if (typeof window.onPasswordChanged === 'function') window.onPasswordChanged();
        if (typeof window.toast === 'function') window.toast(tr('auth.passwordSaved'));
      }
    } catch (error) {
      showError(friendlyAuthError(error));
    } finally {
      setBusy(btn, false);
    }
  }

  function bindUI() {
    const loginForm = $('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', event => {
        event.preventDefault();
        const email = ($('loginEmail') || {}).value?.trim() || '';
        const password = ($('loginPassword') || {}).value || '';
        if (!email || !password) {
          showLogin(tr('auth.needFields'));
          return;
        }
        signIn(email, password);
      });
    }
    const pwdForm = $('passwordForm');
    if (pwdForm) pwdForm.addEventListener('submit', submitPassword);
    const cancel = $('passwordCancel');
    if (cancel) cancel.addEventListener('click', () => hidePasswordScreen());

    document.querySelectorAll('[data-pw-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = $(btn.dataset.pwToggle);
        if (!input) return;
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.classList.toggle('on', show);
      });
    });
  }

  async function bootstrap() {
    bindUI();
    if (!sb) {
      showLogin('Supabase client configuration failed to load.');
      return;
    }
    try {
      const { data, error } = await sb.auth.getSession();
      if (error) throw error;
      if (data && data.session) {
        await handleSession(data.session);
      } else {
        showLogin('');
      }
    } catch (error) {
      console.error('[auth] bootstrap', error);
      showLogin(friendlyAuthError(error));
    }

    sb.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setTimeout(handleSignedOut, 0);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (activeUserId && session && activeUserId === session.user.id && window.__appStarted) return;
        setTimeout(() => handleSession(session), 0);
      }
    });
  }

  window.AppAuth = {
    bootstrap,
    signIn,
    signOut,
    openChangePassword,
    getSession: () => pendingSession || sb.auth.getSession().then(r => r.data.session),
    handleSession,
    showLogin,
  };
})();
