/* =========================================================
   Data layer — Supabase is the single source of truth
   ========================================================= */
(function () {
  const sb = window.sb;

  const PAGE_SIZE = 1000;

  function friendly(error, fallbackKey) {
    const err = new Error((error && error.message) || 'Request failed');
    err.code = error && error.code;
    err.details = error && error.details;
    err.hint = error && error.hint;
    const msg = String(err.message || '');
    if (error && error.code === '42501' || msg.includes('row-level security')) {
      err.friendlyKey = 'toast.noPermission';
    } else if (msg.includes('profiles_school_id_key')) {
      err.friendlyKey = 'toast.schoolTaken';
    } else if (msg.includes('students_school_chest_unique')) {
      err.friendlyKey = 'toast.chestDup';
    } else if (msg.includes('games_event_group_name_ci')) {
      err.friendlyKey = 'toast.gameDup';
    } else if (msg.includes('entries_game_id_student_id_key')) {
      err.friendlyKey = 'toast.alreadyAssigned';
    } else if (fallbackKey) {
      err.friendlyKey = fallbackKey;
    }
    return err;
  }

  function mapSchool(r) {
    return {
      id: r.id,
      name: r.name,
      principal: r.principal || '',
      mobile: r.mobile || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  function mapProfile(r) {
    return {
      id: r.id,
      email: r.email,
      fullName: r.full_name || '',
      role: r.role,
      schoolId: r.school_id || null,
      isTempAdmin: !!r.is_temp_admin,
      tempAdminUntil: r.temp_admin_until || null,
      isActive: !!r.is_active,
      mustChangePassword: !!r.must_change_password,
      language: r.language || 'bn',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  function mapStudent(r) {
    return {
      id: r.id,
      schoolId: r.school_id,
      studentId: r.student_id,
      chestNo: r.chest_no || '',
      name: r.name,
      dob: r.dob,
      gender: r.gender,
      fatherName: r.father_name || '',
      group: r.group_code || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  function mapEvent(r) {
    return {
      id: r.id,
      name: r.name,
      date: r.date || '',
      note: r.note || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  function mapGame(r) {
    return {
      id: r.id,
      eventId: r.event_id,
      name: r.name,
      group: r.group_code,
      metric: r.metric,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  function mapEntry(r) {
    return {
      id: r.id,
      gameId: r.game_id,
      studentId: r.student_id,
      score: r.score_text || '',
      scoreNum: r.score_num,
      dnf: !!r.dnf,
      position: r.position == null ? null : r.position,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async function fetchAll(table) {
    const rows = [];
    let start = 0;
    for (;;) {
      const { data, error } = await sb
        .from(table)
        .select('*')
        .order('created_at', { ascending: true })
        .range(start, start + PAGE_SIZE - 1);
      if (error) throw friendly(error);
      rows.push(...(data || []));
      if (!data || data.length < PAGE_SIZE) break;
      start += PAGE_SIZE;
    }
    return rows;
  }

  function isAdminProfile(profile) {
    if (!profile) return false;
    if (profile.role === 'super_admin') return true;
    if (!profile.isTempAdmin) return false;
    if (!profile.tempAdminUntil) return true;
    return new Date(profile.tempAdminUntil).getTime() > Date.now();
  }

  async function fetchWorkspace(profile) {
    const [schoolRows, studentRows, eventRows, gameRows, entryRows] = await Promise.all([
      fetchAll('schools'),
      fetchAll('students'),
      fetchAll('events'),
      fetchAll('games'),
      fetchAll('entries'),
    ]);

    let profileRows = [];
    if (isAdminProfile(profile)) {
      profileRows = await fetchAll('profiles');
    }

    return {
      schools: schoolRows.map(mapSchool),
      students: studentRows.map(mapStudent),
      events: eventRows.map(mapEvent),
      games: gameRows.map(mapGame),
      entries: entryRows.map(mapEntry),
      profiles: profileRows.length ? profileRows.map(mapProfile) : [profile],
    };
  }

  /* ---------- Schools ---------- */
  async function createSchool(payload) {
    const { data, error } = await sb.from('schools').insert({
      name: payload.name,
      principal: payload.principal || null,
      mobile: payload.mobile || null,
    }).select().single();
    if (error) throw friendly(error);
    return mapSchool(data);
  }

  async function updateSchool(id, payload) {
    const { data, error } = await sb.from('schools').update({
      name: payload.name,
      principal: payload.principal || null,
      mobile: payload.mobile || null,
    }).eq('id', id).select().single();
    if (error) throw friendly(error);
    return mapSchool(data);
  }

  async function deleteSchool(id) {
    const { error } = await sb.from('schools').delete().eq('id', id);
    if (error) throw friendly(error);
  }

  /* ---------- Students ---------- */
  async function createStudent(payload) {
    const { data, error } = await sb.from('students').insert({
      school_id: payload.schoolId,
      chest_no: payload.chestNo || null,
      name: payload.name,
      dob: payload.dob,
      gender: payload.gender,
      father_name: payload.fatherName || null,
    }).select().single();
    if (error) throw friendly(error);
    return mapStudent(data);
  }

  async function updateStudent(id, payload) {
    const { data, error } = await sb.from('students').update({
      school_id: payload.schoolId,
      chest_no: payload.chestNo || null,
      name: payload.name,
      dob: payload.dob,
      gender: payload.gender,
      father_name: payload.fatherName || null,
    }).eq('id', id).select().single();
    if (error) throw friendly(error);
    return mapStudent(data);
  }

  async function deleteStudent(id) {
    const { error } = await sb.from('students').delete().eq('id', id);
    if (error) throw friendly(error);
  }

  /* ---------- Events ---------- */
  async function createEvent(payload) {
    const { data, error } = await sb.from('events').insert({
      name: payload.name,
      date: payload.date || null,
      note: payload.note || null,
    }).select().single();
    if (error) throw friendly(error);
    return mapEvent(data);
  }

  async function updateEvent(id, payload) {
    const { data, error } = await sb.from('events').update({
      name: payload.name,
      date: payload.date || null,
      note: payload.note || null,
    }).eq('id', id).select().single();
    if (error) throw friendly(error);
    return mapEvent(data);
  }

  async function deleteEvent(id) {
    const { error } = await sb.from('events').delete().eq('id', id);
    if (error) throw friendly(error);
  }

  /* ---------- Games ---------- */
  async function createGame(payload) {
    const { data, error } = await sb.from('games').insert({
      event_id: payload.eventId,
      name: payload.name,
      group_code: payload.group,
      metric: payload.metric,
    }).select().single();
    if (error) throw friendly(error);
    return mapGame(data);
  }

  async function updateGame(id, payload) {
    const { data, error } = await sb.from('games').update({
      name: payload.name,
      group_code: payload.group,
      metric: payload.metric,
    }).eq('id', id).select().single();
    if (error) throw friendly(error);
    return mapGame(data);
  }

  async function deleteGame(id) {
    const { error } = await sb.from('games').delete().eq('id', id);
    if (error) throw friendly(error);
  }

  /* ---------- Entries ---------- */
  async function assignStudents(gameId, studentIds) {
    const { error } = await sb.rpc('set_game_assignments', {
      p_game_id: gameId,
      p_student_ids: studentIds,
    });
    if (error) throw friendly(error);
  }

  async function saveGameEntries(gameId, items) {
    const payload = items.map(item => ({
      id: item.id,
      score: item.score == null ? '' : String(item.score),
      dnf: !!item.dnf,
    }));
    const { error } = await sb.rpc('save_game_entries', {
      p_game_id: gameId,
      p_items: payload,
    });
    if (error) throw friendly(error);
  }

  /* ---------- Profiles ---------- */
  async function updateProfile(id, patch) {
    const row = {};
    if (Object.prototype.hasOwnProperty.call(patch, 'fullName')) row.full_name = patch.fullName || null;
    if (Object.prototype.hasOwnProperty.call(patch, 'schoolId')) row.school_id = patch.schoolId || null;
    if (Object.prototype.hasOwnProperty.call(patch, 'isTempAdmin')) row.is_temp_admin = !!patch.isTempAdmin;
    if (Object.prototype.hasOwnProperty.call(patch, 'isActive')) row.is_active = !!patch.isActive;
    if (Object.prototype.hasOwnProperty.call(patch, 'tempAdminUntil')) row.temp_admin_until = patch.tempAdminUntil || null;
    if (Object.prototype.hasOwnProperty.call(patch, 'language')) row.language = patch.language;
    if (Object.prototype.hasOwnProperty.call(patch, 'mustChangePassword')) row.must_change_password = !!patch.mustChangePassword;
    const { data, error } = await sb.from('profiles').update(row).eq('id', id).select().single();
    if (error) throw friendly(error);
    return mapProfile(data);
  }

  async function invokeAdminTeachers(action, payload) {
    const { data, error } = await sb.functions.invoke('admin-teachers', {
      body: Object.assign({ action }, payload || {}),
    });
    if (error) {
      let message = error.message || 'Function request failed';
      try {
        const ctx = await error.context.json();
        if (ctx && ctx.error) message = ctx.error;
      } catch (_) { /* noop */ }
      const err = new Error(message);
      err.friendlyKey = 'toast.noPermission';
      if (/already/i.test(message)) err.friendlyKey = 'toast.emailTaken';
      if (/teacher is already linked|school/i.test(message) && /linked|taken/i.test(message)) err.friendlyKey = 'toast.schoolTaken';
      throw err;
    }
    if (data && data.error) {
      const err = new Error(data.error);
      err.friendlyKey = /already/i.test(data.error) ? 'toast.emailTaken' : 'toast.noPermission';
      throw err;
    }
    return data;
  }

  window.Data = {
    fetchWorkspace,
    createSchool,
    updateSchool,
    deleteSchool,
    createStudent,
    updateStudent,
    deleteStudent,
    createEvent,
    updateEvent,
    deleteEvent,
    createGame,
    updateGame,
    deleteGame,
    assignStudents,
    saveGameEntries,
    updateProfile,
    invokeAdminTeachers,
    mapProfile,
    isAdminProfile,
    friendly,
  };
})();
