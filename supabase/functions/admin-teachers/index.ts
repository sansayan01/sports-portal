// =========================================================
// Edge Function: admin-teachers
// Create / delete teacher & temp-admin accounts, reset passwords.
// Uses the service role; callers must be active admins.
// =========================================================
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !serviceKey || !anonKey) {
    return json({ error: 'Function is not configured' }, 500);
  }

  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Missing authorization token' }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData?.user) {
    return json({ error: 'Invalid or expired session' }, 401);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: caller, error: callerError } = await admin
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (callerError || !caller) {
    return json({ error: 'Profile not found' }, 403);
  }

  const isSuper = caller.role === 'super_admin' && caller.is_active;
  const isTemp = caller.is_active
    && caller.role === 'teacher'
    && caller.is_temp_admin
    && (!caller.temp_admin_until || new Date(caller.temp_admin_until).getTime() > Date.now());

  if (!isSuper && !isTemp) {
    return json({ error: 'Admin access required' }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const action = clean(body.action);

  try {
    if (action === 'create') {
      const email = clean(body.email).toLowerCase();
      const password = String(body.password || '');
      const fullName = clean(body.full_name);
      const accountType = clean(body.role) || 'teacher';
      const schoolId = clean(body.school_id) || null;
      let tempUntil = clean(body.temp_admin_until) || null;

      if (!isValidEmail(email)) return json({ error: 'Enter a valid email address' }, 400);
      if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);
      if (!fullName) return json({ error: 'Full name is required' }, 400);
      if (!['teacher', 'temp_admin'].includes(accountType)) {
        return json({ error: 'Invalid account type' }, 400);
      }

      if (accountType === 'teacher') {
        if (!schoolId) return json({ error: 'Select a school for this teacher' }, 400);
        const { data: school, error: schoolError } = await admin
          .from('schools').select('id, name').eq('id', schoolId).maybeSingle();
        if (schoolError || !school) return json({ error: 'School not found' }, 404);

        const { data: existing } = await admin
          .from('profiles').select('id, email').eq('school_id', schoolId).maybeSingle();
        if (existing) {
          return json({ error: `This school already has a teacher (${existing.email})` }, 409);
        }
      } else {
        if (!isSuper) return json({ error: 'Only the super admin can grant temporary admin access' }, 403);
        if (schoolId) return json({ error: 'Temp admins are not linked to a school' }, 400);
        if (!tempUntil) {
          const d = new Date();
          d.setDate(d.getDate() + 30);
          tempUntil = d.toISOString();
        }
        if (Number.isNaN(new Date(tempUntil).getTime())) {
          return json({ error: 'Invalid expiry date' }, 400);
        }
        if (new Date(tempUntil).getTime() <= Date.now()) {
          return json({ error: 'Expiry must be in the future' }, 400);
        }
      }

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

      if (createError || !created?.user) {
        const duplicate = /already|registered|exists/i.test(createError?.message || '');
        return json({ error: duplicate ? 'A user with this email already exists' : (createError?.message || 'Could not create user') }, 400);
      }

      const { data: profile, error: profileError } = await admin
        .from('profiles')
        .insert({
          id: created.user.id,
          email,
          full_name: fullName,
          role: 'teacher',
          school_id: accountType === 'teacher' ? schoolId : null,
          is_temp_admin: accountType === 'temp_admin',
          temp_admin_until: accountType === 'temp_admin' ? tempUntil : null,
          is_active: true,
          must_change_password: true,
          language: 'bn',
        })
        .select()
        .single();

      if (profileError) {
        await admin.auth.admin.deleteUser(created.user.id);
        const duplicate = /profiles_school_id_key|duplicate|unique/i.test(profileError.message);
        return json({ error: duplicate ? 'This school already has a teacher' : profileError.message }, 400);
      }

      await admin.from('audit_log').insert({
        actor_id: caller.id,
        actor_email: caller.email,
        action: accountType === 'teacher' ? 'teacher_created' : 'temp_admin_created',
        target_type: 'profile',
        target_id: created.user.id,
        details: { email, full_name: fullName, school_id: schoolId, temp_admin_until: tempUntil },
      });

      return json({ profile });
    }

    if (action === 'delete') {
      const userId = clean(body.user_id);
      if (!userId) return json({ error: 'Missing user id' }, 400);

      const { data: target, error: targetError } = await admin
        .from('profiles').select('*').eq('id', userId).maybeSingle();
      if (targetError || !target) return json({ error: 'User not found' }, 404);
      if (target.role === 'super_admin') {
        return json({ error: 'The super admin account cannot be deleted' }, 403);
      }
      if (target.id === caller.id) {
        return json({ error: 'You cannot delete your own account' }, 403);
      }

      const { error: deleteError } = await admin.auth.admin.deleteUser(target.id);
      if (deleteError) return json({ error: deleteError.message }, 400);

      await admin.from('audit_log').insert({
        actor_id: caller.id,
        actor_email: caller.email,
        action: 'account_deleted',
        target_type: 'profile',
        target_id: target.id,
        details: { email: target.email, role: target.role, is_temp_admin: target.is_temp_admin },
      });

      return json({ ok: true });
    }

    if (action === 'reset_password') {
      const userId = clean(body.user_id);
      const password = String(body.password || '');
      if (!userId) return json({ error: 'Missing user id' }, 400);
      if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);

      const { data: target, error: targetError } = await admin
        .from('profiles').select('*').eq('id', userId).maybeSingle();
      if (targetError || !target) return json({ error: 'User not found' }, 404);
      if (target.role === 'super_admin') {
        return json({ error: 'The super admin password cannot be reset here' }, 403);
      }
      const { error: updateError } = await admin.auth.admin.updateUserById(target.id, { password });
      if (updateError) return json({ error: updateError.message }, 400);

      const { error: flagError } = await admin
        .from('profiles')
        .update({ must_change_password: true })
        .eq('id', target.id);
      if (flagError) return json({ error: flagError.message }, 500);

      await admin.from('audit_log').insert({
        actor_id: caller.id,
        actor_email: caller.email,
        action: 'password_reset',
        target_type: 'profile',
        target_id: target.id,
        details: { email: target.email },
      });

      return json({ ok: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('[admin-teachers]', error);
    return json({ error: 'Unexpected server error' }, 500);
  }
});
