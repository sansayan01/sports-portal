/* =========================================================
   Sports App v3 — School > Students | Event > Games > Entries
   Supabase | realtime | role-aware | bn/en
   ========================================================= */

const GROUPS = {
  A: { label: 'GROUP A', bn: 'বিভাগ-ক', range: '০১/০১/২০১৯ বা তার পর' },
  B: { label: 'GROUP B', bn: 'বিভাগ-খ', range: '০১/০১/২০১৭ – ৩১/১২/২০১৮' },
  C: { label: 'GROUP C', bn: 'বিভাগ-গ', range: '০১/০১/২০১৫ – ৩১/১২/২০১৬' },
};

const SUGGESTIONS = {
  A: ['Shuttle Race', '75 Meter Run', 'Long Jump', 'Yoga'],
  B: ['100 Meter Run', '200 Meter Run', 'Long Jump', 'High Jump', 'Yoga', 'Gymnastic'],
  C: ['100 Meter Run', '200 Meter Run', 'Long Jump', 'High Jump', 'Yoga', 'Gymnastic'],
};

/* ---------- Icons ---------- */
const IC = {
  edit: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  trash: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
  users: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>',
  medal: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="15" r="5"/><path d="M9 10.5 7 3h10l-2 7.5"/></svg>',
  chev: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
};

const icon = (name, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const MONTHS = {
  bn: ['জানু', 'ফেব', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুল', 'আগ', 'সেপ', 'অক্টো', 'নভে', 'ডিসে'],
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
};

function dateBadgeHtml(date) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return `<div class="date-badge none"><span class="db-day">--</span><span class="db-mon">${esc(t('events.noDateShort'))}</span></div>`;
  }
  const [, m, d] = date.split('-');
  const mon = (MONTHS[settings.lang] || MONTHS.bn)[parseInt(m, 10) - 1] || '';
  return `<div class="date-badge"><span class="db-day">${esc(d)}</span><span class="db-mon">${esc(mon)}</span></div>`;
}
function metricIconName(m) {
  return { time: 'clock', distance: 'ruler', height: 'height', points: 'target', manual: 'edit' }[m] || 'flag';
}
function metricBadgeHtml(m) {
  return `<span class="metric-badge">${icon(metricIconName(m))}<span>${esc(metricLabel(m))}</span></span>`;
}
function statusBadgeHtml(status) {
  if (status === 'done') return `<span class="status-pill done">${t('status.done')}</span>`;
  if (status === 'partial') return `<span class="status-pill partial">${t('status.partial')}</span>`;
  return `<span class="status-pill pending">${t('status.pending')}</span>`;
}
function fmtResultValue(score, metric) {
  const s = String(score ?? '').trim();
  if (!s) return '';
  if (metric === 'distance' || metric === 'height') return s + ' m';
  if (metric === 'points') return s + ' pts';
  return s;
}

/* ---------- i18n ---------- */
const I18N = {
  bn: {
    'app.title': 'বার্ষিক ক্রীড়া প্রতিযোগিতা',
    'app.eyebrow': 'স্কুল স্পোর্টস ডেস্ক',
    'eyebrow.home': 'মৌসুম সারসংক্ষেপ', 'eyebrow.students': 'শিক্ষার্থী তালিকা',
    'eyebrow.events': 'ইভেন্ট ক্যালেন্ডার', 'eyebrow.eventDetail': 'ইভেন্ট ডিটেইল',
    'eyebrow.results': 'পোডিয়াম', 'eyebrow.records': 'রেকর্ড শিট',
    'eyebrow.winners': 'সারসংক্ষেপ', 'eyebrow.report': 'রিপোর্ট',
    'eyebrow.more': 'সেটিংস ও আরও', 'eyebrow.schools': 'স্কুল', 'eyebrow.settings': 'পছন্দসমূহ',
    'nav.home': 'হোম', 'nav.students': 'শিক্ষার্থী', 'nav.events': 'ইভেন্ট', 'nav.results': 'ফলাফল', 'nav.more': 'আরও',
    'title.home': 'বার্ষিক ক্রীড়া প্রতিযোগিতা', 'title.students': 'শিক্ষার্থী', 'title.events': 'ইভেন্টসমূহ',
    'title.results': 'ফলাফল', 'title.more': 'আরও', 'title.schools': 'স্কুল', 'title.settings': 'সেটিংস',

    'home.heroLabel': 'মোট শিক্ষার্থী', 'home.heroSub': '{schools}টি স্কুল · {events}টি ইভেন্ট',
    'home.seasonLabel': 'মৌসুম স্কোরবোর্ড', 'home.live': 'লোকাল ডেটা',
    'home.quickActions': 'দ্রুত কাজ', 'home.addStudent': 'শিক্ষার্থী যোগ', 'home.addEvent': 'ইভেন্ট যোগ', 'home.results': 'ফলাফল',
    'home.recentEvents': 'সাম্প্রতিক ইভেন্ট', 'home.noEvents': 'এখনো কোনো ইভেন্ট নেই।',
    'dash.schools': 'স্কুল', 'dash.events': 'ইভেন্ট', 'dash.games': 'গেম', 'dash.entries': 'এন্ট্রি',

    'common.all': 'সব', 'common.save': 'সেভ করুন', 'common.cancel': 'বাতিল', 'common.auto': 'অটো',
    'common.confirm': 'নিশ্চিত', 'confirm.title': 'নিশ্চিত করো',
    'common.edit': 'সম্পাদনা', 'common.delete': 'মুছে ফেলুন', 'common.close': 'বন্ধ', 'th.name': 'নাম',

    'students.searchPh': 'নাম / Student ID দিয়ে খুঁজুন', 'students.empty': 'কোনো শিক্ষার্থী পাওয়া যায়নি।',
    'students.count': '{n} জন শিক্ষার্থী',
    'students.addTitle': 'শিক্ষার্থী যোগ', 'students.editTitle': 'শিক্ষার্থী সম্পাদনা',
    'students.school': 'স্কুল', 'students.studentId': 'Student ID', 'students.chest': 'Chest No',
    'students.name': 'শিক্ষার্থীর নাম', 'students.namePh': 'পূর্ণ নাম', 'students.dob': 'জন্মতারিখ',
    'students.gender': 'লিঙ্গ', 'students.father': 'বাবার নাম', 'students.fatherPh': 'পিতার নাম',
    'students.groupHintEmpty': 'জন্মতারিখ দিলে গ্রুপ স্বয়ংক্রিয়ভাবে নির্ধারিত হবে।',
    'students.groupHintOk': 'গ্রুপ নির্ধারিত:', 'students.groupRange': 'জন্মতারিখ সীমা',
    'students.groupHintWarn': 'এই জন্মতারিখ কোনো গ্রুপের সীমার মধ্যে পড়ছে না। সঠিক জন্মতারিখ দিন।',
    'students.note': 'গেম এখানে assign করতে হবে না। ইভেন্টের ভেতরে গেম থেকে শিক্ষার্থী assign করা যাবে।',
    'students.games': 'গেম', 'students.noSchool': 'আগে একটি স্কুল যোগ করো (আরও → স্কুল)।',

    'events.desc': 'প্রতিটা ইভেন্টের ভেতরে একাধিক গেম থাকে। ইভেন্টে ট্যাপ করে গেম ও অংশগ্রহণকারী দেখো।',
    'events.empty': 'কোনো ইভেন্ট যোগ করা হয়নি। + দিয়ে শুরু করো।',
    'events.addTitle': 'নতুন ইভেন্ট', 'events.editTitle': 'ইভেন্ট সম্পাদনা',
    'events.name': 'ইভেন্টের নাম', 'events.namePh': 'যেমন: বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬',
    'events.date': 'তারিখ', 'events.note': 'নোট (ঐচ্ছিক)', 'events.notePh': 'স্থান / বিবরণ',
    'events.noDate': 'তারিখ নেই', 'events.noDateShort': 'তারিখ', 'events.games': 'গেম', 'events.participants': 'অংশগ্রহণকারী',
    'events.searchPh': 'নাম / নোট / তারিখ দিয়ে খুঁজুন',
    'events.filters': 'ফিল্টার', 'events.filterTitle': 'অ্যাডভান্সড ফিল্টার',
    'events.upcoming': 'আসন্ন', 'events.past': 'সম্পন্ন', 'events.noGames': 'গেম নেই', 'events.hasResults': 'ফলাফল আছে',
    'events.sortNew': 'নতুন আগে', 'events.sortOld': 'পুরোনো আগে', 'events.sortName': 'নাম (ক-হ)',
    'events.sortGames': 'বেশি গেম', 'events.sortEntries': 'বেশি অংশগ্রহণ',
    'events.showing': '{n} / {total}টি ইভেন্ট',
    'events.noMatch': 'এই ফিল্টারে কোনো ইভেন্ট মেলেনি।', 'events.clearFilters': 'ফিল্টার মুছুন',
    'events.dateRange': 'তারিখের সীমা', 'events.from': 'শুরু', 'events.to': 'শেষ',
    'events.groupFilter': 'গ্রুপ', 'events.allGroups': 'সব গ্রুপ',
    'events.schoolFilter': 'স্কুল', 'events.allSchools': 'সব স্কুল',
    'events.gamesRange': 'গেম সংখ্যা', 'events.min': 'সর্বনিম্ন', 'events.max': 'সর্বোচ্চ',
    'events.minEntries': 'সর্বনিম্ন অংশগ্রহণ',
    'events.resetFilters': 'সব রিসেট', 'events.applyFilters': 'ফিল্টার দেখাও',
    'events.invalidRange': 'শুরুর তারিখ শেষ তারিখের পরে হতে পারে না।',
    'events.invalidGames': 'গেম সংখ্যার রেঞ্জ ঠিক দিন।',

    'eventDetail.eyebrow': 'ইভেন্ট', 'eventDetail.gamesTitle': 'গেমস', 'eventDetail.tapHint': 'গেমে ট্যাপ করলে রেকর্ড খুলবে',
    'eventDetail.recordsShort': 'রেকর্ড', 'eventDetail.assignShort': 'অ্যাসাইন', 'eventDetail.editShort': 'এডিট', 'eventDetail.deleteShort': 'মুছুন',
    'eventDetail.desc': 'গেম যোগ করো, তারপর শিক্ষার্থী assign করো। শুধু ওই গ্রুপের শিক্ষার্থী দেখাবে।',
    'eventDetail.empty': 'এই ইভেন্টে কোনো গেম নেই। + দিয়ে গেম যোগ করো।',
    'eventDetail.assign': 'শিক্ষার্থী assign', 'eventDetail.results': 'ফলাফল',

    'games.addTitle': 'নতুন গেম', 'games.editTitle': 'গেম সম্পাদনা',
    'games.name': 'গেমের নাম', 'games.namePh': 'যেমন: 100 Meter Run', 'games.group': 'গ্রুপ',
    'games.participants': 'জন', 'games.quickPicks': 'দ্রুত বাছাই:',
    'games.metric': 'স্কোরের ধরন',
    'metric.manual': 'ম্যানুয়াল পজিশন', 'metric.time': 'সময় — কম = ভালো', 'metric.height': 'উচ্চতা — বেশি = ভালো', 'metric.distance': 'দূরত্ব — বেশি = ভালো', 'metric.points': 'পয়েন্ট — বেশি = ভালো',
    'metric.short.manual': 'ম্যানুয়াল', 'metric.short.time': 'সময়', 'metric.short.distance': 'দূরত্ব', 'metric.short.height': 'উচ্চতা', 'metric.short.points': 'পয়েন্ট',
    'metric.ph.time': 'সেকেন্ড (যেমন 13.2)', 'metric.ph.distance': 'মিটার (যেমন 5.20)', 'metric.ph.height': 'মিটার (যেমন 1.75)', 'metric.ph.points': 'পয়েন্ট (যেমন 85)', 'metric.ph.manual': 'সময় / দূরত্ব / পয়েন্ট',
    'metric.min': 'মিনিট', 'metric.sec': 'সেকেন্ড',
    'metric.hintAuto': 'স্কোর লিখে সেভ করলে পজিশন অটো বসবে। টাই হলে একই পজিশন পাবে।',
    'metric.hintManual': 'এই গেমে পজিশন হাতে লিখতে হবে।',
    'winners.btn': 'ফলাফল সারসংক্ষেপ', 'winners.title': 'ফলাফল সারসংক্ষেপ',
    'results.title': 'ফলাফল', 'results.desc2': 'প্রতি গেমের সেরা তিনজন — রেকর্ড থেকে স্বয়ংক্রিয়ভাবে।',
    'results.event': 'ইভেন্ট', 'results.game': 'খেলা', 'results.podiumEmpty': 'এই গেমে এখনো ফলাফল নেই। রেকর্ড লিখলে পোডিয়াম তৈরি হবে।',
    'results.first': 'প্রথম', 'results.second': 'দ্বিতীয়', 'results.third': 'তৃতীয়',
    'results.stageKicker': 'গেম ফলাফল', 'results.participants': '{n} জন অংশগ্রহণকারী',
    'results.entered': '{n}টি রেকর্ড', 'results.noRecords': 'রেকর্ড বাকি',
    'results.openRecords': 'রেকর্ড লিখুন / দেখুন', 'results.more': 'আরও',
    'records.title': 'রেকর্ড', 'records.kicker': 'রেকর্ড শিট',
    'records.sub': 'স্কোর ও সময় লিখুন — পজিশন স্বয়ংক্রিয়ভাবে হিসাব হবে।',
    'records.searchPh': 'নাম / Student ID দিয়ে খুঁজুন',
    'records.progressLabel': 'রেকর্ড অগ্রগতি', 'records.progress': '{done} / {total}',
    'records.saveNote': 'স্কোর লিখলেই পজিশন স্বয়ংক্রিয়ভাবে হিসাব হবে',
    'records.posPh': 'পজিশন', 'records.posSuffix': 'স্থান',
    'records.dnf': 'DNF', 'records.noEntries': 'এই গেমে কোনো অংশগ্রহণকারী নেই। আগে শিক্ষার্থী assign করো।',
    'records.saved': 'রেকর্ড সেভ হয়েছে', 'records.autoSaved': 'পজিশন স্বয়ংক্রিয়ভাবে আপডেট হয়েছে।',
    'records.rank': 'পজিশন', 'records.pending': '—', 'records.all': 'সব',
    'winners.champion': 'স্কুল চ্যাম্পিয়ন', 'winners.noMedals': 'এখনো কোনো মেডেল দেওয়া হয়নি। ফলাফল দিলে এখানে দেখাবে।',
    'winners.medalTally': 'মেডেল ট্যালি · স্কুল', 'winners.bestAthlete': 'সেরা খেলোয়াড়', 'winners.noAthlete': 'এখনো কেউ মেডেল পায়নি।',
    'winners.gameWinners': 'গেম অনুযায়ী বিজয়ী', 'winners.pending': 'ফলাফল বাকি',
    'winners.school': 'স্কুল', 'winners.total': 'মোট',
    'status.done': 'ফলাফল শেষ', 'status.pending': 'ফলাফল বাকি', 'status.partial': 'চলমান',
    'results.doneCount': '{done}/{total} ফলাফল',
    'rep.medalTally': 'মেডেল ট্যালি', 'rep.champion': 'স্কুল চ্যাম্পিয়ন',

    'assign.title': 'শিক্ষার্থী assign', 'assign.meta': '{game} · {group} · {event}',
    'assign.selectAll': 'সব সিলেক্ট', 'assign.deselectAll': 'সব বাদ', 'assign.save': 'সেভ করুন',
    'assign.empty': 'এই গ্রুপের কোনো শিক্ষার্থী নেই। আগে শিক্ষার্থী যোগ করো।',
    'assign.count': '{n} জন সিলেক্ট করা', 'assign.saved': 'অংশগ্রহণকারী সেভ হয়েছে',

    'results.desc': 'ইভেন্ট ও গেম বেছে নিয়ে অংশগ্রহণকারীর স্কোর ও পজিশন লিখে সেভ করো।',
    'results.selectEvent': 'ইভেন্ট বেছে নিন', 'results.selectGame': 'গেম বেছে নিন',
    'results.noEvents': 'কোনো ইভেন্ট নেই। আগে ইভেন্ট ও গেম যোগ করো।',
    'results.noGames': 'এই ইভেন্টে কোনো গেম নেই।',
    'results.noEntries': 'এই গেমে কোনো অংশগ্রহণকারী নেই। ইভেন্ট থেকে শিক্ষার্থী assign করো।',
    'results.save': 'ফলাফল সেভ করুন', 'results.saveHint': 'পজিশন ১/২/৩ দিলে মেডেল দেখাবে। খালি রাখলে ফলাফল মুছে যাবে।',
    'results.scorePh': 'সময় / দূরত্ব / পয়েন্ট', 'results.posPh': 'পজিশন',
    'results.saved': 'ফলাফল সেভ হয়েছে', 'results.pickGame': 'গেম বেছে নিন',

    'profile.title': 'শিক্ষার্থীর প্রোফাইল', 'profile.school': 'স্কুল', 'profile.group': 'গ্রুপ',
    'profile.dob': 'জন্মতারিখ', 'profile.father': 'বাবার নাম', 'profile.gender': 'লিঙ্গ',
    'profile.studentId': 'Student ID', 'profile.chest': 'Chest No',
    'profile.entries': 'অংশগ্রহণ', 'profile.noEntries': 'এখনো কোনো গেমে অংশ নেয়নি।',

    'schools.empty': 'এখনো কোনো স্কুল যোগ করা হয়নি। + দিয়ে শুরু করো।',
    'schools.addTitle': 'নতুন স্কুল', 'schools.editTitle': 'স্কুল সম্পাদনা',
    'schools.name': 'বিদ্যালয়ের নাম', 'schools.namePh': 'স্কুলের নাম',
    'schools.principal': 'প্রধান শিক্ষকের নাম', 'schools.principalPh': 'প্রধান শিক্ষকের নাম',
    'schools.mobile': 'মোবাইল নম্বর', 'schools.students': 'শিক্ষার্থী',

    'more.schools': 'স্কুল', 'more.schoolsDesc': 'স্কুল যোগ ও পরিচালনা',
    'more.settings': 'সেটিংস', 'more.settingsDesc': 'ভাষা, ব্যাকআপ ও অন্যান্য',
    'more.tagline': 'সব তথ্য তোমার ফোনে সংরক্ষিত', 'more.footer': 'লোকাল-ফার্স্ট · অফলাইন রেডি',

    'settings.language': 'ভাষা / Language', 'settings.languageDesc': 'পুরো অ্যাপের ভাষা বদলাও। ডাটা অপরিবর্তিত থাকবে।',
    'settings.aboutTitle': 'অ্যাপ সম্পর্কে',
    'settings.aboutDesc': 'বার্ষিক ক্রীড়া প্রতিযোগিতা — স্কুল স্পোর্টস অ্যাপ। সব তথ্য তোমার ফোনেই সংরক্ষিত থাকে।',
    'backup.title': 'ব্যাকআপ ও রিস্টোর', 'backup.desc': 'সব তথ্য এক ফাইলে ডাউনলোড করে রাখো। ফোন বদলালে রিস্টোর করে নাও।',
    'backup.export': 'ব্যাকআপ ডাউনলোড', 'backup.import': 'ব্যাকআপ রিস্টোর',

    'report.btn': 'রিপোর্ট / প্রিন্ট', 'report.title': 'ইভেন্ট রিপোর্ট',
    'report.desc': 'রেজিস্ট্রেশন ও ফলাফল — প্রিন্ট করে PDF সেভ করো।', 'report.print': 'প্রিন্ট / PDF',
    'rep.event': 'ইভেন্ট', 'rep.date': 'তারিখ', 'rep.totalStudents': 'মোট অংশগ্রহণকারী', 'rep.totalEntries': 'মোট এন্ট্রি',
    'rep.sign': 'প্রধান / ভারপ্রাপ্ত প্রধান শিক্ষকের সাক্ষর ও সীল',
    'rep.thStudentId': 'Student ID', 'rep.thChest': 'Chest', 'rep.thName': 'নাম', 'rep.thSchool': 'স্কুল',
    'rep.thDob': 'জন্মতারিখ', 'rep.thFather': 'পিতার নাম', 'rep.thScore': 'স্কোর', 'rep.thPosition': 'পজিশন',
    'rep.noEntries': 'এই ইভেন্টে এখনো কোনো অংশগ্রহণকারী নেই।',

    'toast.schoolAdded': 'স্কুল যোগ হয়েছে', 'toast.schoolUpdated': 'স্কুল আপডেট হয়েছে', 'toast.schoolDeleted': 'স্কুল মুছে ফেলা হয়েছে',
    'toast.studentAdded': 'শিক্ষার্থী যোগ হয়েছে', 'toast.studentUpdated': 'শিক্ষার্থী আপডেট হয়েছে', 'toast.studentDeleted': 'শিক্ষার্থী মুছে ফেলা হয়েছে',
    'toast.eventAdded': 'ইভেন্ট যোগ হয়েছে', 'toast.eventUpdated': 'ইভেন্ট আপডেট হয়েছে', 'toast.eventDeleted': 'ইভেন্ট মুছে ফেলা হয়েছে',
    'toast.gameAdded': 'গেম যোগ হয়েছে', 'toast.gameUpdated': 'গেম আপডেট হয়েছে', 'toast.gameDeleted': 'গেম মুছে ফেলা হয়েছে',
    'toast.settingsSaved': 'সেটিংস সেভ হয়েছে', 'toast.backupDownloaded': 'ব্যাকআপ ডাউনলোড হয়েছে',
    'toast.backupRestored': 'ব্যাকআপ রিস্টোর হয়েছে', 'toast.backupInvalid': 'ফাইলটি সঠিক ব্যাকআপ নয়',
    'toast.needSchool': 'আগে স্কুল বেছে নিন', 'toast.needName': 'নাম দিন', 'toast.needDob': 'জন্মতারিখ দিন',
    'toast.badDob': 'জন্মতারিখ গ্রুপ A/B/C-এর কোনো সীমার মধ্যে নয়',
    'toast.needEventName': 'ইভেন্টের নাম দিন', 'toast.needGameName': 'গেমের নাম দিন',
    'toast.gameDup': 'এই ইভেন্টের এই গ্রুপে একই নামের গেম আছে', 'toast.noStudents': 'কোনো শিক্ষার্থী নেই',

    'confirm.schoolDelete': '"{name}" মুছে ফেলবেন?',
    'confirm.schoolDeleteWithStudents': '"{name}" মুছে ফেললে এর {n} জন শিক্ষার্থী ও তাদের এন্ট্রি মুছে যাবে। নিশ্চিত?',
    'confirm.studentDelete': '"{name}"-কে মুছে ফেলবেন? তার সব এন্ট্রিও মুছে যাবে।',
    'confirm.eventDelete': '"{name}" ইভেন্ট মুছে ফেলবেন?',
    'confirm.eventDeleteWithGames': '"{name}" মুছে ফেললে এর {n}টি গেম ও সব এন্ট্রি মুছে যাবে। নিশ্চিত?',
    'confirm.gameDelete': '"{name}" গেম মুছে ফেলবেন?',
    'confirm.gameDeleteWithEntries': '"{name}" মুছে ফেললে এর {n}টি এন্ট্রি মুছে যাবে। নিশ্চিত?',
    'confirm.restore': 'ব্যাকআপ রিস্টোর করবেন?\nস্কুল: {schools}, শিক্ষার্থী: {students}, ইভেন্ট: {events}\n\nবর্তমান সব তথ্য প্রতিস্থাপিত হবে।',
  },
  en: {
    'app.title': 'Annual Sports Competition',
    'app.eyebrow': 'SCHOOL SPORTS DESK',
    'eyebrow.home': 'SEASON OVERVIEW', 'eyebrow.students': 'ATHLETE ROSTER',
    'eyebrow.events': 'EVENT CALENDAR', 'eyebrow.eventDetail': 'EVENT DETAIL',
    'eyebrow.results': 'PODIUM', 'eyebrow.records': 'RECORD SHEET',
    'eyebrow.winners': 'SUMMARY', 'eyebrow.report': 'REPORT',
    'eyebrow.more': 'SETTINGS & MORE', 'eyebrow.schools': 'SCHOOLS', 'eyebrow.settings': 'PREFERENCES',
    'nav.home': 'Home', 'nav.students': 'Students', 'nav.events': 'Events', 'nav.results': 'Results', 'nav.more': 'More',
    'title.home': 'Annual Sports Competition', 'title.students': 'Students', 'title.events': 'Events',
    'title.results': 'Results', 'title.more': 'More', 'title.schools': 'Schools', 'title.settings': 'Settings',

    'home.heroLabel': 'Total Students', 'home.heroSub': '{schools} schools · {events} events',
    'home.seasonLabel': 'Season Scoreboard', 'home.live': 'Local data',
    'home.quickActions': 'Quick Actions', 'home.addStudent': 'Add Student', 'home.addEvent': 'Add Event', 'home.results': 'Results',
    'home.recentEvents': 'Recent Events', 'home.noEvents': 'No events yet.',
    'dash.schools': 'Schools', 'dash.events': 'Events', 'dash.games': 'Games', 'dash.entries': 'Entries',

    'common.all': 'All', 'common.save': 'Save', 'common.cancel': 'Cancel', 'common.auto': 'Auto',
    'common.confirm': 'Confirm', 'confirm.title': 'Confirm action',
    'common.edit': 'Edit', 'common.delete': 'Delete', 'common.close': 'Close', 'th.name': 'Name',

    'students.searchPh': 'Search by name / Student ID', 'students.empty': 'No student found.',
    'students.count': '{n} students',
    'students.addTitle': 'Add Student', 'students.editTitle': 'Edit Student',
    'students.school': 'School', 'students.studentId': 'Student ID', 'students.chest': 'Chest No',
    'students.name': 'Student Name', 'students.namePh': 'Full name', 'students.dob': 'Date of Birth',
    'students.gender': 'Gender', 'students.father': "Father's Name", 'students.fatherPh': "Father's name",
    'students.groupHintEmpty': 'Enter date of birth — group is assigned automatically.',
    'students.groupHintOk': 'Group assigned:', 'students.groupRange': 'DOB range',
    'students.groupHintWarn': 'This date of birth is outside every group range. Enter a valid date.',
    'students.note': 'No need to assign games here. Assign students from a game inside an event.',
    'students.games': 'games', 'students.noSchool': 'Add a school first (More → Schools).',

    'events.desc': 'Each event contains multiple games. Tap an event to see its games & participants.',
    'events.empty': 'No event added yet. Tap + to start.',
    'events.addTitle': 'New Event', 'events.editTitle': 'Edit Event',
    'events.name': 'Event Name', 'events.namePh': 'e.g. Annual Sports Competition 2026',
    'events.date': 'Date', 'events.note': 'Note (optional)', 'events.notePh': 'Venue / description',
    'events.noDate': 'No date', 'events.noDateShort': 'DATE', 'events.games': 'games', 'events.participants': 'participants',
    'events.searchPh': 'Search name / note / date',
    'events.filters': 'Filters', 'events.filterTitle': 'Advanced Filters',
    'events.upcoming': 'Upcoming', 'events.past': 'Past', 'events.noGames': 'No games', 'events.hasResults': 'Has results',
    'events.sortNew': 'Newest first', 'events.sortOld': 'Oldest first', 'events.sortName': 'Name (A–Z)',
    'events.sortGames': 'Most games', 'events.sortEntries': 'Most entries',
    'events.showing': '{n} of {total} events',
    'events.noMatch': 'No event matches these filters.', 'events.clearFilters': 'Clear filters',
    'events.dateRange': 'Date range', 'events.from': 'From', 'events.to': 'To',
    'events.groupFilter': 'Group', 'events.allGroups': 'All groups',
    'events.schoolFilter': 'School', 'events.allSchools': 'All schools',
    'events.gamesRange': 'Game count', 'events.min': 'Min', 'events.max': 'Max',
    'events.minEntries': 'Minimum entries',
    'events.resetFilters': 'Reset all', 'events.applyFilters': 'Show results',
    'events.invalidRange': 'Start date cannot be after end date.',
    'events.invalidGames': 'Game count range is invalid.',

    'eventDetail.eyebrow': 'EVENT', 'eventDetail.gamesTitle': 'Games', 'eventDetail.tapHint': 'Tap a game to open records',
    'eventDetail.recordsShort': 'Records', 'eventDetail.assignShort': 'Assign', 'eventDetail.editShort': 'Edit', 'eventDetail.deleteShort': 'Delete',
    'eventDetail.desc': 'Add games, then assign students. Only students of that group are shown.',
    'eventDetail.empty': 'No games in this event. Tap + to add a game.',
    'eventDetail.assign': 'Assign students', 'eventDetail.results': 'Results',

    'games.addTitle': 'New Game', 'games.editTitle': 'Edit Game',
    'games.name': 'Game Name', 'games.namePh': 'e.g. 100 Meter Run', 'games.group': 'Group',
    'games.participants': 'students', 'games.quickPicks': 'Quick picks:',
    'games.metric': 'Scoring Type',
    'metric.manual': 'Manual position', 'metric.time': 'Time — lower is better', 'metric.height': 'Height — higher is better', 'metric.distance': 'Distance — higher is better', 'metric.points': 'Points — higher is better',
    'metric.short.manual': 'Manual', 'metric.short.time': 'Time', 'metric.short.distance': 'Distance', 'metric.short.height': 'Height', 'metric.short.points': 'Points',
    'metric.ph.time': 'Seconds (e.g. 13.2)', 'metric.ph.distance': 'Meters (e.g. 5.20)', 'metric.ph.height': 'Meters (e.g. 1.75)', 'metric.ph.points': 'Points (e.g. 85)', 'metric.ph.manual': 'Time / Distance / Points',
    'metric.min': 'Min', 'metric.sec': 'Sec',
    'metric.hintAuto': 'Enter scores and save — positions are assigned automatically. Ties get the same position.',
    'metric.hintManual': 'Enter positions manually for this game.',
    'winners.btn': 'Results Summary', 'winners.title': 'Results Summary',
    'results.title': 'Results', 'results.desc2': 'The top three of every game — gathered automatically from records.',
    'results.event': 'Event', 'results.game': 'Game', 'results.podiumEmpty': 'No results for this game yet. Add records to build the podium.',
    'results.first': 'First', 'results.second': 'Second', 'results.third': 'Third',
    'results.stageKicker': 'Game result', 'results.participants': '{n} participants',
    'results.entered': '{n} records', 'results.noRecords': 'No records yet',
    'results.openRecords': 'Enter / view records', 'results.more': 'more',
    'records.title': 'Records', 'records.kicker': 'Record sheet',
    'records.sub': 'Enter scores and times — positions are calculated automatically.',
    'records.searchPh': 'Search by name / Student ID',
    'records.progressLabel': 'Record progress', 'records.progress': '{done} / {total}',
    'records.saveNote': 'Positions are calculated automatically as you type',
    'records.posPh': 'Position', 'records.posSuffix': 'POS',
    'records.dnf': 'DNF', 'records.noEntries': 'No participants in this game. Assign students first.',
    'records.saved': 'Records saved', 'records.autoSaved': 'Positions updated automatically.',
    'records.rank': 'Position', 'records.pending': '—', 'records.all': 'All',
    'winners.champion': 'School Champion', 'winners.noMedals': 'No medals awarded yet. Enter results to see them here.',
    'winners.medalTally': 'Medal Tally · Schools', 'winners.bestAthlete': 'Best Athlete', 'winners.noAthlete': 'No one has won a medal yet.',
    'winners.gameWinners': 'Winners by Game', 'winners.pending': 'Results pending',
    'winners.school': 'School', 'winners.total': 'Total',
    'status.done': 'Done', 'status.pending': 'Pending', 'status.partial': 'In progress',
    'results.doneCount': '{done}/{total} results',
    'rep.medalTally': 'Medal Tally', 'rep.champion': 'School Champion',

    'assign.title': 'Assign Students', 'assign.meta': '{game} · {group} · {event}',
    'assign.selectAll': 'Select all', 'assign.deselectAll': 'Clear all', 'assign.save': 'Save',
    'assign.empty': 'No students in this group. Add students first.',
    'assign.count': '{n} selected', 'assign.saved': 'Participants saved',

    'results.desc': 'Pick an event and game, then enter each participant’s score and position.',
    'results.selectEvent': 'Select event', 'results.selectGame': 'Select game',
    'results.noEvents': 'No events. Add an event and games first.',
    'results.noGames': 'No games in this event.',
    'results.noEntries': 'No participants in this game. Assign students from the event.',
    'results.save': 'Save Results', 'results.saveHint': 'Positions 1/2/3 show medals. Leave empty to clear.',
    'results.scorePh': 'Time / Distance / Points', 'results.posPh': 'Position',
    'results.saved': 'Results saved', 'results.pickGame': 'Select a game',

    'profile.title': 'Student Profile', 'profile.school': 'School', 'profile.group': 'Group',
    'profile.dob': 'Date of Birth', 'profile.father': "Father's Name", 'profile.gender': 'Gender',
    'profile.studentId': 'Student ID', 'profile.chest': 'Chest No',
    'profile.entries': 'Participations', 'profile.noEntries': 'Not participating in any game yet.',

    'schools.empty': 'No school added yet. Tap + to start.',
    'schools.addTitle': 'New School', 'schools.editTitle': 'Edit School',
    'schools.name': 'School Name', 'schools.namePh': 'School name',
    'schools.principal': "Head Teacher's Name", 'schools.principalPh': "Head teacher's name",
    'schools.mobile': 'Mobile Number', 'schools.students': 'students',

    'more.schools': 'Schools', 'more.schoolsDesc': 'Add & manage schools',
    'more.settings': 'Settings', 'more.settingsDesc': 'Language, backup & more',
    'more.tagline': 'Everything stays on your phone', 'more.footer': 'Local-first · Offline ready',

    'settings.language': 'Language', 'settings.languageDesc': 'Change the app language. Your data stays unchanged.',
    'settings.aboutTitle': 'About',
    'settings.aboutDesc': 'Annual Sports Competition — School Sports App. All data is stored on your phone.',
    'backup.title': 'Backup & Restore', 'backup.desc': 'Download all data into one file. Restore after switching phone.',
    'backup.export': 'Download Backup', 'backup.import': 'Restore Backup',

    'report.btn': 'Report / Print', 'report.title': 'Event Report',
    'report.desc': 'Registration & results — print to save as PDF.', 'report.print': 'Print / PDF',
    'rep.event': 'Event', 'rep.date': 'Date', 'rep.totalStudents': 'Total participants', 'rep.totalEntries': 'Total entries',
    'rep.sign': 'Head / Acting Head Teacher signature & seal',
    'rep.thStudentId': 'Student ID', 'rep.thChest': 'Chest', 'rep.thName': 'Name', 'rep.thSchool': 'School',
    'rep.thDob': 'Date of Birth', 'rep.thFather': "Father's Name", 'rep.thScore': 'Score', 'rep.thPosition': 'Position',
    'rep.noEntries': 'No participants in this event yet.',

    'toast.schoolAdded': 'School added', 'toast.schoolUpdated': 'School updated', 'toast.schoolDeleted': 'School deleted',
    'toast.studentAdded': 'Student added', 'toast.studentUpdated': 'Student updated', 'toast.studentDeleted': 'Student deleted',
    'toast.eventAdded': 'Event added', 'toast.eventUpdated': 'Event updated', 'toast.eventDeleted': 'Event deleted',
    'toast.gameAdded': 'Game added', 'toast.gameUpdated': 'Game updated', 'toast.gameDeleted': 'Game deleted',
    'toast.settingsSaved': 'Settings saved', 'toast.backupDownloaded': 'Backup downloaded',
    'toast.backupRestored': 'Backup restored', 'toast.backupInvalid': 'This file is not a valid backup',
    'toast.needSchool': 'Select a school first', 'toast.needName': 'Enter a name', 'toast.needDob': 'Enter date of birth',
    'toast.badDob': 'Date of birth is outside GROUP A/B/C ranges',
    'toast.needEventName': 'Enter event name', 'toast.needGameName': 'Enter game name',
    'toast.gameDup': 'A game with this name already exists in this group of the event', 'toast.noStudents': 'No students',

    'confirm.schoolDelete': 'Delete "{name}"?',
    'confirm.schoolDeleteWithStudents': 'Deleting "{name}" will also delete its {n} students and their entries. Continue?',
    'confirm.studentDelete': 'Delete "{name}"? All their entries will be removed.',
    'confirm.eventDelete': 'Delete event "{name}"?',
    'confirm.eventDeleteWithGames': 'Deleting "{name}" will remove its {n} games and all entries. Continue?',
    'confirm.gameDelete': 'Delete game "{name}"?',
    'confirm.gameDeleteWithEntries': 'Deleting "{name}" will remove its {n} entries. Continue?',
    'confirm.restore': 'Restore backup?\nSchools: {schools}, Students: {students}, Events: {events}\n\nAll current data will be replaced.',
  },
};

/* ---------- v3 additions / overrides ---------- */
Object.assign(I18N.bn, {
  'home.live': 'লাইভ',
  'home.liveOn': 'লাইভ ডেটা',
  'home.liveOff': 'সংযোগ নেই',
  'more.tagline': 'Supabase-এ সংরক্ষিত · সবাই একসাথে',
  'more.footer': 'Supabase · রিয়েলটাইম',
  'settings.aboutDesc': 'বার্ষিক ক্রীড়া প্রতিযোগিতা — স্কুল স্পোর্টস অ্যাপ। তথ্য Supabase-এ সংরক্ষিত থাকে এবং সব ডিভাইসে রিয়েলটাইমে আপডেট হয়।',
  'backup.title': 'ডেটা এক্সপোর্ট',
  'backup.desc': 'বর্তমান ডেটা JSON ফাইলে ডাউনলোড করুন।',
  'backup.export': 'JSON ডাউনলোড',
  'toast.backupDownloaded': 'ডেটা ডাউনলোড হয়েছে',
  'toast.noPermission': 'এই কাজ করার অনুমতি নেই',
  'toast.schoolTaken': 'এই স্কুলে ইতিমধ্যে একজন শিক্ষক আছে',
  'toast.chestDup': 'এই Chest No এই স্কুলে আগেই ব্যবহার হয়েছে',
  'toast.alreadyAssigned': 'এই শিক্ষার্থী ইতিমধ্যে এই গেমে আছে',
  'toast.emailTaken': 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে',
  'toast.teacherCreated': 'শিক্ষক অ্যাকাউন্ট তৈরি হয়েছে',
  'toast.teacherUpdated': 'শিক্ষক তথ্য আপডেট হয়েছে',
  'toast.teacherDeleted': 'অ্যাকাউন্ট মুছে ফেলা হয়েছে',
  'toast.passwordReset': 'নতুন টেম্প পাসওয়ার্ড সেট হয়েছে',
  'toast.dataError': 'ডেটা লোড বা সেভ করা যায়নি',
  'toast.adminExpired': 'Temp Admin মেয়াদ শেষ — এখন শুধু পড়া যাবে',
  'toast.signedOut': 'লগআউট হয়েছে',
  'auth.brandSub': 'স্কুল স্পোর্টস ডেস্ক',
  'auth.eyebrow': 'নিরাপদ প্রবেশ',
  'auth.title': 'সাইন ইন করুন',
  'auth.subtitle': 'স্কুল স্পোর্টস পোর্টালে প্রবেশ করুন',
  'auth.email': 'ইমেইল',
  'auth.password': 'পাসওয়ার্ড',
  'auth.signIn': 'সাইন ইন',
  'auth.signingIn': 'সাইন ইন হচ্ছে…',
  'auth.pleaseWait': 'অপেক্ষা করুন…',
  'auth.foot': 'শুধুমাত্র অনুমোদিত ব্যবহারকারীরা প্রবেশ করতে পারবেন',
  'auth.invalid': 'ইমেইল বা পাসওয়ার্ড সঠিক নয়',
  'auth.notConfirmed': 'ইমেইল নিশ্চিত করা হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন',
  'auth.tooMany': 'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন',
  'auth.network': 'ইন্টারনেট সংযোগ পাওয়া যাচ্ছে না',
  'auth.failed': 'সাইন ইন করা যায়নি',
  'auth.noProfile': 'এই অ্যাকাউন্টের প্রোফাইল নেই। অ্যাডমিনের সাথে যোগাযোগ করুন',
  'auth.disabled': 'এই অ্যাকাউন্ট বন্ধ আছে। অ্যাডমিনের সাথে যোগাযোগ করুন',
  'auth.needFields': 'ইমেইল ও পাসওয়ার্ড দিন',
  'auth.security': 'নিরাপত্তা',
  'auth.forceTitle': 'নতুন পাসওয়ার্ড দিন',
  'auth.forceSub': 'প্রথমবার লগইন করেছেন — চালিয়ে যেতে পাসওয়ার্ড বদলাতে হবে।',
  'auth.changeTitle': 'পাসওয়ার্ড বদলান',
  'auth.changeSub': '{email} — নতুন পাসওয়ার্ড দিন',
  'auth.newPassword': 'নতুন পাসওয়ার্ড',
  'auth.confirmPassword': 'আবার লিখুন',
  'auth.savePassword': 'পাসওয়ার্ড সেভ করুন',
  'auth.saving': 'সেভ হচ্ছে…',
  'auth.passwordShort': 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে',
  'auth.passwordMismatch': 'দুইবার লেখা পাসওয়ার্ড মিলছে না',
  'auth.passwordSaved': 'পাসওয়ার্ড বদলানো হয়েছে',
  'teachers.title': 'শিক্ষক ও অ্যাডমিন',
  'teachers.desc': 'প্রতিটি স্কুলে একজন শিক্ষক লিংক করুন। Temp Admin সব কাজ করতে পারে, শুধু Super Admin পরিবর্তন করতে পারে না।',
  'teachers.addTitle': 'নতুন শিক্ষক / অ্যাডমিন',
  'teachers.editTitle': 'অ্যাকাউন্ট সম্পাদনা',
  'teachers.name': 'পূর্ণ নাম',
  'teachers.email': 'ইমেইল',
  'teachers.role': 'অ্যাকাউন্টের ধরন',
  'teachers.roleTeacher': 'শিক্ষক',
  'teachers.roleTemp': 'Temp Admin',
  'teachers.school': 'স্কুল',
  'teachers.expiry': 'মেয়াদ শেষের তারিখ',
  'teachers.tempPassword': 'টেম্প পাসওয়ার্ড',
  'teachers.active': 'অ্যাকাউন্ট চালু',
  'teachers.notes': 'শিক্ষক প্রথম লগইনে পাসওয়ার্ড বদলাতে বাধ্য হবেন। পাসওয়ার্ড কোথাও সংরক্ষণ করা হয় না।',
  'teachers.empty': 'এখনো কোনো শিক্ষক বা Temp Admin নেই।',
  'teachers.count': '{n}টি অ্যাকাউন্ট',
  'teachers.you': 'আপনি',
  'teachers.super': 'Super Admin',
  'teachers.temp': 'Temp Admin',
  'teachers.teacher': 'শিক্ষক',
  'teachers.expired': 'মেয়াদ শেষ',
  'teachers.expires': 'মেয়াদ: {date}',
  'teachers.noSchool': 'স্কুল লিংক নেই',
  'teachers.generate': 'তৈরি করুন',
  'teachers.resetTitle': 'পাসওয়ার্ড রিসেট',
  'teachers.resetSub': '{email} — নতুন টেম্প পাসওয়ার্ড দিন',
  'teachers.reset': 'পাসওয়ার্ড সেট করুন',
  'teachers.deleteConfirm': '"{name}" ({email}) এর অ্যাকাউন্ট মুছে ফেলবেন?',
  'teachers.schoolHint': 'একটি স্কুলে শুধু একজন শিক্ষক লিংক করা যাবে।',
  'teachers.emailHint': 'এই ইমেইলেই লগইন করবেন।',
  'teachers.passwordHint': 'কমপক্ষে ৮ অক্ষর।',
  'teachers.locked': 'সুরক্ষিত',
  'account.title': 'অ্যাকাউন্ট',
  'account.change': 'পাসওয়ার্ড বদলান',
  'account.logout': 'লগআউট',
  'account.email': 'ইমেইল',
  'account.role': 'রোল',
  'account.school': 'স্কুল',
  'account.expiry': 'Temp Admin মেয়াদ',
  'account.name': 'নাম',
  'account.secure': 'সেশনটি Supabase Auth দ্বারা সুরক্ষিত।',
  'role.teacherBanner': 'শিক্ষক অ্যাক্সেস: নিজের স্কুলের শিক্ষার্থী যোগ করতে পারবেন। অন্য স্কুলের শিক্ষার্থী, ইভেন্ট, গেম ও ফলাফল শুধু দেখতে পারবেন।',
  'role.adminBanner': 'অ্যাডমিন অ্যাক্সেস: সব স্কুল, শিক্ষার্থী, ইভেন্ট, গেম ও ফলাফল পরিচালনা করতে পারবেন।',
  'records.readOnly': 'শিক্ষকরা ফলাফল সম্পাদনা করতে পারেন না — শুধু দেখতে পারেন।',
  'common.loading': 'লোড হচ্ছে…',
  'common.readOnly': 'শুধু পড়ুন',
  'schools.desc': 'সব স্কুলের তালিকা। অ্যাডমিন স্কুল যোগ, সম্পাদনা ও মুছে ফেলতে পারেন।',
  'more.teachersDesc': 'শিক্ষক অ্যাকাউন্ট ও স্কুল লিংক',
  'more.accountDesc': 'নিজের প্রোফাইল, পাসওয়ার্ড ও সেশন',
  'teachers.inactive': 'নিষ্ক্রিয়',
  'teachers.self': 'আপনি',
  'teachers.roleLocked': 'অ্যাকাউন্টের ধরন পরে বদলানো যায় না।',
  'teachers.selfLocked': 'নিজের অ্যাকাউন্টের স্কুল, মেয়াদ বা সক্রিয় অবস্থা বদলানো যাবে না।',
  'teachers.currentSchool': 'বর্তমান স্কুল',
  'teachers.expiryHint': 'মেয়াদ শেষ হলে Temp Admin স্বয়ংক্রিয়ভাবে শুধু-পাঠক হয়ে যাবে।',
  'toast.accountUpdated': 'অ্যাকাউন্ট আপডেট হয়েছে',
  'toast.invalidExpiry': 'মেয়াদ ভবিষ্যতের তারিখে হতে হবে',
  'toast.teacherSelfEdit': 'শুধু নাম ও পাসওয়ার্ড পরিবর্তন করা যাবে',
  'confirm.signOut': 'লগআউট করবেন?',
  'confirm.signOutMsg': 'লগআউট করলে আবার সাইন ইন করতে হবে।',
  'account.tempNote': 'Temp Admin মেয়াদ শেষ হলে অ্যাডমিন ক্ষমতা বন্ধ হয়ে যাবে।',
  'account.teacherNote': 'আপনি শুধু নিজের স্কুলের শিক্ষার্থী যোগ করতে পারবেন। অন্যান্য তথ্য শুধু পড়তে পারবেন।',
  'account.sessionNote': 'Supabase Auth সেশন সক্রিয়।',
  'account.unknownSchool': 'স্কুল লিংক নেই',
});

Object.assign(I18N.en, {
  'home.live': 'Live',
  'home.liveOn': 'Live data',
  'home.liveOff': 'Offline',
  'more.tagline': 'Stored in Supabase · shared by everyone',
  'more.footer': 'Supabase · Realtime',
  'settings.aboutDesc': 'Annual Sports Competition — School Sports App. Data lives in Supabase and updates on every device in realtime.',
  'backup.title': 'Data export',
  'backup.desc': 'Download the current data as a JSON file.',
  'backup.export': 'Download JSON',
  'toast.backupDownloaded': 'Data downloaded',
  'toast.noPermission': 'You do not have permission for this action',
  'toast.schoolTaken': 'This school already has a teacher',
  'toast.chestDup': 'This chest number is already used in this school',
  'toast.alreadyAssigned': 'This student is already in this game',
  'toast.emailTaken': 'An account with this email already exists',
  'toast.teacherCreated': 'Teacher account created',
  'toast.teacherUpdated': 'Teacher account updated',
  'toast.teacherDeleted': 'Account deleted',
  'toast.passwordReset': 'New temporary password set',
  'toast.dataError': 'Could not load or save data',
  'toast.adminExpired': 'Temp Admin access expired — now read-only',
  'toast.signedOut': 'Signed out',
  'auth.brandSub': 'SCHOOL SPORTS DESK',
  'auth.eyebrow': 'SECURE ACCESS',
  'auth.title': 'Sign in',
  'auth.subtitle': 'Enter the school sports portal',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.signIn': 'Sign in',
  'auth.signingIn': 'Signing in…',
  'auth.pleaseWait': 'Please wait…',
  'auth.foot': 'Authorised users only',
  'auth.invalid': 'Email or password is incorrect',
  'auth.notConfirmed': 'Email is not confirmed. Contact an admin',
  'auth.tooMany': 'Too many attempts. Try again later',
  'auth.network': 'No internet connection',
  'auth.failed': 'Could not sign in',
  'auth.noProfile': 'This account has no profile. Contact an admin',
  'auth.disabled': 'This account is disabled. Contact an admin',
  'auth.needFields': 'Enter email and password',
  'auth.security': 'SECURITY',
  'auth.forceTitle': 'Set a new password',
  'auth.forceSub': 'First login detected — change your password to continue.',
  'auth.changeTitle': 'Change password',
  'auth.changeSub': '{email} — set a new password',
  'auth.newPassword': 'New password',
  'auth.confirmPassword': 'Confirm password',
  'auth.savePassword': 'Save password',
  'auth.saving': 'Saving…',
  'auth.passwordShort': 'Password must be at least 8 characters',
  'auth.passwordMismatch': 'Passwords do not match',
  'auth.passwordSaved': 'Password changed',
  'teachers.title': 'Teachers & admins',
  'teachers.desc': 'Link one teacher to each school. A Temp Admin can do everything except change the Super Admin.',
  'teachers.addTitle': 'New teacher / admin',
  'teachers.editTitle': 'Edit account',
  'teachers.name': 'Full name',
  'teachers.email': 'Email',
  'teachers.role': 'Account type',
  'teachers.roleTeacher': 'Teacher',
  'teachers.roleTemp': 'Temp Admin',
  'teachers.school': 'School',
  'teachers.expiry': 'Expiry date',
  'teachers.tempPassword': 'Temporary password',
  'teachers.active': 'Account active',
  'teachers.notes': 'Teachers must change their password on first login. Passwords are never stored.',
  'teachers.empty': 'No teachers or Temp Admins yet.',
  'teachers.count': '{n} accounts',
  'teachers.you': 'You',
  'teachers.super': 'Super Admin',
  'teachers.temp': 'Temp Admin',
  'teachers.teacher': 'Teacher',
  'teachers.expired': 'Expired',
  'teachers.expires': 'Expires: {date}',
  'teachers.noSchool': 'No school linked',
  'teachers.generate': 'Generate',
  'teachers.resetTitle': 'Reset password',
  'teachers.resetSub': '{email} — set a new temporary password',
  'teachers.reset': 'Set password',
  'teachers.deleteConfirm': 'Delete the account for "{name}" ({email})?',
  'teachers.schoolHint': 'Only one teacher can be linked to a school.',
  'teachers.emailHint': 'They will sign in with this email.',
  'teachers.passwordHint': 'At least 8 characters.',
  'teachers.locked': 'Protected',
  'account.title': 'Account',
  'account.change': 'Change password',
  'account.logout': 'Sign out',
  'account.email': 'Email',
  'account.role': 'Role',
  'account.school': 'School',
  'account.expiry': 'Temp Admin expiry',
  'account.name': 'Name',
  'account.secure': 'Your session is protected by Supabase Auth.',
  'role.teacherBanner': 'Teacher access: add students for your own school. Other schools’ students, events, games, and results are read-only.',
  'role.adminBanner': 'Admin access: manage every school, student, event, game and result.',
  'records.readOnly': 'Teachers cannot edit results — read-only view.',
  'common.loading': 'Loading…',
  'common.readOnly': 'Read only',
  'schools.desc': 'All registered schools. Admins can add, edit and delete schools.',
  'more.teachersDesc': 'Teacher accounts and school links',
  'more.accountDesc': 'Your profile, password and session',
  'teachers.inactive': 'Disabled',
  'teachers.self': 'You',
  'teachers.roleLocked': 'Account type cannot be changed later.',
  'teachers.selfLocked': 'You cannot change your own school, expiry or active state.',
  'teachers.currentSchool': 'Current school',
  'teachers.expiryHint': 'When the expiry passes, the Temp Admin becomes read-only automatically.',
  'toast.accountUpdated': 'Account updated',
  'toast.invalidExpiry': 'Expiry must be in the future',
  'toast.teacherSelfEdit': 'Only your name and password can be changed',
  'confirm.signOut': 'Sign out?',
  'confirm.signOutMsg': 'You will need to sign in again.',
  'account.tempNote': 'Admin powers stop automatically when the Temp Admin expiry passes.',
  'account.teacherNote': 'You can only add students for your own school. All other data is read-only.',
  'account.sessionNote': 'Supabase Auth session is active.',
  'account.unknownSchool': 'No school linked',
});

/* ---------- State (loaded from Supabase after login) ---------- */
const LANG_KEY = 'sportsApp.lang';
let schools  = [];
let students = [];
let events   = [];
let games    = [];
let entries  = [];
let profiles = [];
let currentProfile = null;
let currentSession = null;
let settings = { lang: localStorage.getItem(LANG_KEY) || 'bn' };
if (!['bn', 'en'].includes(settings.lang)) settings.lang = 'bn';

let editingSchool = null, editingStudent = null, editingEvent = null, editingGame = null;
let editingTeacher = null;
let resetPasswordUserId = null;
let appBooted = false;
let realtimeLive = false;
let roleTimer = null;
let currentScreen = 'home';
let openEventId = null;
let assignSelected = new Set();
let stuGroupVal = '', stuSchoolVal = '', stuSearchVal = '';
const EVENT_FILTER_DEFAULT = {
  q: '', status: 'all', sort: 'date-desc',
  dateFrom: '', dateTo: '', group: '', school: '',
  minGames: '', maxGames: '', minEntries: '',
};
let eventFilter = { ...EVENT_FILTER_DEFAULT };
let eventFilterGroupDraft = '';

const SECONDARY = ['schools', 'settings', 'teachers', 'eventDetail', 'report', 'winners', 'records'];
const BACK = { schools: 'more', settings: 'more', teachers: 'more', eventDetail: 'events', report: 'eventDetail', winners: 'eventDetail', records: 'eventDetail' };
const NAV_FOR = { schools: 'more', settings: 'more', teachers: 'more', eventDetail: 'events', report: 'events', winners: 'events', records: 'events' };
const TITLES = {
  home: 'title.home', students: 'title.students', events: 'title.events', results: 'title.results',
  more: 'title.more', schools: 'title.schools', settings: 'title.settings', teachers: 'teachers.title',
  report: 'report.title', winners: 'winners.title', records: 'records.title',
};
const EYEBROW = {
  home: 'eyebrow.home', students: 'eyebrow.students', events: 'eyebrow.events', results: 'eyebrow.results',
  more: 'eyebrow.more', schools: 'eyebrow.schools', settings: 'eyebrow.settings', teachers: 'teachers.title',
  report: 'eyebrow.report', winners: 'eyebrow.winners', records: 'eyebrow.records', eventDetail: 'eyebrow.eventDetail',
};

/* ---------- Role helpers ---------- */
function isSuperAdmin() {
  return !!currentProfile && currentProfile.role === 'super_admin';
}
function isTempAdminActive() {
  if (!currentProfile || currentProfile.role !== 'teacher' || !currentProfile.isTempAdmin) return false;
  if (!currentProfile.tempAdminUntil) return true;
  return new Date(currentProfile.tempAdminUntil).getTime() > Date.now();
}
function isAdminUser() {
  return isSuperAdmin() || isTempAdminActive();
}
function isTeacherUser() {
  return !!currentProfile && currentProfile.role === 'teacher' && !isAdminUser() && !!currentProfile.schoolId;
}
function ownSchoolId() {
  return currentProfile && currentProfile.schoolId ? currentProfile.schoolId : null;
}
function canEditStudent(student) {
  return !!student && isAdminUser();
}
function showError(err) {
  console.error(err);
  const msg = err && err.friendlyKey ? t(err.friendlyKey) : (err && err.message) || t('toast.dataError');
  toast(msg, true);
}
async function withBusy(btn, fn) {
  if (btn) btn.disabled = true;
  try { return await fn(); } finally { if (btn) btn.disabled = false; }
}

/* ---------- Auth / session state ---------- */
window.AppState = { profile: null, session: null, isAdmin: false, isTeacher: false };

function isProfileAdmin(p) {
  if (!p || !p.isActive) return false;
  if (p.role === 'super_admin') return true;
  if (!p.isTempAdmin) return false;
  return !p.tempAdminUntil || new Date(p.tempAdminUntil).getTime() > Date.now();
}
function profileRoleLabel(p) {
  if (!p) return '';
  if (p.role === 'super_admin') return t('teachers.super');
  if (p.isTempAdmin) return isProfileAdmin(p) ? t('teachers.temp') : t('teachers.expired');
  return t('teachers.teacher');
}
function isSelfProfile(p) {
  return !!currentProfile && !!p && p.id === currentProfile.id;
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  try {
    return d.toLocaleString(settings.lang === 'bn' ? 'bn-BD' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  } catch (_) {
    return d.toLocaleString();
  }
}
function updateRoleGates() {
  const admin = isAdminUser();
  const teacher = isTeacherUser();
  document.body.classList.toggle('admin-user', admin);
  document.body.classList.toggle('teacher-user', teacher);
  updateFabVisibility();

  const p = currentProfile;
  if (!p) return;
  const name = p.fullName || p.email || '';
  const ini = initials(name);
  ['appbarAvatar', 'moreAvatar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = ini;
  });
  const moreName = document.getElementById('moreName');
  if (moreName) moreName.textContent = name || t('account.title');
  const moreEmail = document.getElementById('moreEmail');
  if (moreEmail) moreEmail.textContent = p.email || '';

  const banner = document.getElementById('roleBanner');
  if (banner) {
    banner.hidden = false;
    const roleLabel = profileRoleLabel(p);
    const isTemp = p.role === 'teacher' && p.isTempAdmin;
    const note = admin ? t('role.adminBanner') : t('role.teacherBanner');
    const expiry = isTemp ? ` · ${t('teachers.expires', { date: fmtDateTime(p.tempAdminUntil) })}` : '';
    banner.className = 'role-banner ' + (admin ? 'admin' : 'teacher');
    banner.innerHTML = `<span class="role-banner-ico">${icon(admin ? 'shield' : 'info')}</span>
      <span class="role-banner-txt"><strong>${esc(roleLabel)}${esc(expiry)}</strong><span>${esc(note)}</span></span>`;
  }
}
function updateAccountUI() {
  updateRoleGates();
  const body = document.getElementById('accountBody');
  if (!body) return;
  const p = currentProfile;
  if (!p) { body.innerHTML = ''; return; }
  const school = p.schoolId ? schoolById(p.schoolId) : null;
  const isTemp = p.role === 'teacher' && p.isTempAdmin;
  const roleLabel = profileRoleLabel(p);
  const note = p.role === 'super_admin'
    ? t('role.adminBanner')
    : isTemp
      ? t('account.tempNote')
      : t('account.teacherNote');
  const rows = [
    `<div class="account-row"><span>${t('account.email')}</span><strong>${esc(p.email || '—')}</strong></div>`,
    `<div class="account-row"><span>${t('account.role')}</span><strong>${esc(roleLabel)}</strong></div>`,
  ];
  if (p.role === 'teacher' && !isTemp) {
    rows.push(`<div class="account-row"><span>${t('account.school')}</span><strong>${esc(school ? school.name : t('account.unknownSchool'))}</strong></div>`);
  }
  if (isTemp) {
    rows.push(`<div class="account-row"><span>${t('account.expiry')}</span><strong>${esc(fmtDateTime(p.tempAdminUntil))}</strong></div>`);
  }
  body.innerHTML = `
    <div class="account-hero">
      <div class="account-avatar">${esc(initials(p.fullName || p.email))}</div>
      <div class="account-id">
        <div class="account-name">${esc(p.fullName || p.email || '')}</div>
        <div class="account-mail">${esc(p.email || '')}</div>
      </div>
      <span class="role-pill ${p.role === 'super_admin' ? 'super' : isTemp ? 'temp' : 'teacher'}">${esc(roleLabel)}</span>
    </div>
    <div class="account-rows">${rows.join('')}</div>
    <p class="account-note">${icon(p.role === 'super_admin' || isTemp ? 'shield' : 'info')}<span>${esc(note)}</span></p>
    <div class="account-actions">
      <button class="btn btn-ghost" type="button" id="btnChangePassword">${icon('key')}<span>${t('account.change')}</span></button>
      <button class="btn btn-danger" type="button" id="btnAccountSignOut">${icon('logout')}<span>${t('account.logout')}</span></button>
    </div>
    <p class="account-secure">${icon('shield')}<span>${t('account.sessionNote')}</span></p>`;
}

function setAppLoading(busy) {
  const el = document.getElementById('appLoading');
  if (el) el.hidden = !busy;
}

let refreshPromise = null;
async function refreshWorkspace(opts = {}) {
  if (!currentProfile) return;
  if (refreshPromise) return refreshPromise;
  const silent = !!opts.silent;
  refreshPromise = (async () => {
    if (!silent) setAppLoading(true);
    try {
      const ws = await Data.fetchWorkspace(currentProfile);
      schools = ws.schools || [];
      students = ws.students || [];
      events = ws.events || [];
      games = ws.games || [];
      entries = ws.entries || [];
      profiles = ws.profiles && ws.profiles.length ? ws.profiles : [currentProfile];
      const fresh = profiles.find(p => p.id === currentProfile.id);
      if (fresh) {
        currentProfile = fresh;
        window.AppState.profile = fresh;
        if (!fresh.isActive) {
          await AppAuth.signOut();
          return;
        }
        if (['bn', 'en'].includes(fresh.language) && fresh.language !== settings.lang) {
          settings.lang = fresh.language;
          localStorage.setItem(LANG_KEY, settings.lang);
        }
      } else {
        await AppAuth.signOut();
        return;
      }
      window.AppState.isAdmin = isAdminUser();
      window.AppState.isTeacher = isTeacherUser();
      applyStaticI18n();
      updateRoleGates();
      refreshSchoolSelects();
      if (currentScreen === 'teachers' && !isAdminUser()) {
        showScreen('home');
      } else if (appBooted) {
        renderForScreen(currentScreen);
      }
      updateAccountUI();
    } catch (err) {
      if (!silent) showError(err);
      else console.error('[refresh]', err);
    } finally {
      if (!silent) setAppLoading(false);
    }
  })();
  try { await refreshPromise; } finally { refreshPromise = null; }
}
window.refreshWorkspace = refreshWorkspace;

function startRoleWatch() {
  clearInterval(roleTimer);
  let lastAdmin = isAdminUser();
  roleTimer = setInterval(() => {
    if (!currentProfile) return;
    const nowAdmin = isAdminUser();
    updateRoleGates();
    if (nowAdmin !== lastAdmin) {
      lastAdmin = nowAdmin;
      window.AppState.isAdmin = nowAdmin;
      if (!nowAdmin) {
        toast(t('toast.adminExpired'), true);
        if (currentScreen === 'teachers') showScreen('home');
      }
      renderForScreen(currentScreen);
      updateAccountUI();
    }
  }, 30000);
}

async function onAuthenticated(profile, session) {
  currentProfile = profile;
  currentSession = session;
  window.AppState = { profile, session, isAdmin: isProfileAdmin(profile), isTeacher: false };
  window.AppState.isTeacher = profile.role === 'teacher' && !window.AppState.isAdmin && !!profile.schoolId;
  if (profile.language && ['bn', 'en'].includes(profile.language)) settings.lang = profile.language;
  localStorage.setItem(LANG_KEY, settings.lang);
  document.body.classList.remove('auth-locked', 'password-locked');
  document.body.classList.add('authed');
  appBooted = true;
  applyStaticI18n();
  updateRoleGates();
  showScreen('home');
  setAppLoading(true);
  await refreshWorkspace({ silent: true });
  setAppLoading(false);
  if (typeof Realtime !== 'undefined') Realtime.startRealtime();
  startRoleWatch();
}
window.onAuthenticated = onAuthenticated;

function onSignedOut() {
  currentProfile = null;
  currentSession = null;
  window.AppState = { profile: null, session: null, isAdmin: false, isTeacher: false };
  schools = []; students = []; events = []; games = []; entries = []; profiles = [];
  appBooted = false;
  realtimeLive = false;
  clearInterval(roleTimer);
  roleTimer = null;
  if (typeof Realtime !== 'undefined') Realtime.stopRealtime();
  document.body.classList.remove('authed', 'admin-user', 'teacher-user');
  updateFabVisibility();
  document.querySelectorAll('.sheet-overlay.open').forEach(el => el.classList.remove('open'));
  setAppLoading(false);
  applyStaticI18n();
}
window.onSignedOut = onSignedOut;

function onPasswordChanged() {
  if (currentProfile) currentProfile.mustChangePassword = false;
  updateAccountUI();
}
window.onPasswordChanged = onPasswordChanged;

function onRealtimeStatus(live) {
  realtimeLive = !!live;
  const liveWrap = document.getElementById('liveIndicator');
  if (liveWrap) liveWrap.classList.toggle('offline', !realtimeLive);
  const liveLabel = document.getElementById('liveLabel');
  if (liveLabel) liveLabel.textContent = t(realtimeLive ? 'home.liveOn' : 'home.liveOff');
  const dot = document.getElementById('appbarLive');
  if (dot) dot.classList.toggle('off', !realtimeLive);
}
window.onRealtimeStatus = onRealtimeStatus;

/* ---------- Teachers / admins ---------- */
function canManageProfile(p) {
  return !!p && p.role !== 'super_admin';
}
function teacherSchoolName(p) {
  if (!p || !p.schoolId) return null;
  const s = schoolById(p.schoolId);
  return s ? s.name : null;
}
function renderTeachers() {
  if (!isAdminUser()) return;
  const list = document.getElementById('teacherList');
  const empty = document.getElementById('teacherEmpty');
  const meta = document.getElementById('teacherMeta');
  if (!list || !empty) return;
  const rows = [...profiles].sort((a, b) => {
    const rank = p => p.role === 'super_admin' ? 0 : p.isTempAdmin ? 1 : 2;
    return rank(a) - rank(b) || String(a.fullName || a.email).localeCompare(String(b.fullName || b.email));
  });
  if (meta) meta.textContent = t('teachers.count', { n: rows.length });
  if (!rows.length) { list.innerHTML = ''; empty.hidden = false; return; }
  empty.hidden = true;
  list.innerHTML = rows.map(p => {
    const self = isSelfProfile(p);
    const superAdmin = p.role === 'super_admin';
    const temp = p.role === 'teacher' && p.isTempAdmin;
    const active = isProfileAdmin(p);
    const schoolName = teacherSchoolName(p);
    const roleClass = superAdmin ? 'super' : temp ? 'temp' : 'teacher';
    const roleText = superAdmin
      ? t('teachers.super')
      : temp
        ? (active ? t('teachers.temp') : t('teachers.expired'))
        : t('teachers.teacher');
    const tags = [`<span class="pill role ${roleClass}">${esc(roleText)}</span>`];
    if (schoolName) tags.push(`<span class="pill count">${icon('school')}${esc(schoolName)}</span>`);
    if (temp) tags.push(`<span class="pill count">${icon('clock')}${esc(fmtDateTime(p.tempAdminUntil))}</span>`);
    if (!p.isActive) tags.push(`<span class="pill off">${esc(t('teachers.inactive'))}</span>`);
    const manage = canManageProfile(p);
    const actions = manage ? `
      <button class="icon-btn edit" data-action="edit-teacher" data-id="${p.id}" aria-label="${t('common.edit')}" title="${t('common.edit')}">${icon('edit')}</button>
      <button class="icon-btn key" data-action="reset-password" data-id="${p.id}" aria-label="${t('teachers.resetTitle')}" title="${t('teachers.resetTitle')}">${icon('key')}</button>
      ${self ? '' : `<button class="icon-btn danger" data-action="delete-teacher" data-id="${p.id}" aria-label="${t('common.delete')}" title="${t('common.delete')}">${icon('trash')}</button>`}
    ` : `<span class="protected-pill">${icon('shield')}<span>${t('teachers.locked')}</span></span>`;
    return `<div class="pcard teacher-card">
      <div class="pcard-top">
        <div class="avatar teacher ${roleClass}">${esc(initials(p.fullName || p.email))}</div>
        <div class="pcard-info">
          <div class="pcard-name">${esc(p.fullName || p.email || '—')}${self ? ` <span class="you-pill">${t('teachers.self')}</span>` : ''}</div>
          <div class="pcard-sub">${esc(p.email || '')}</div>
          <div class="pcard-tags">${tags.join('')}</div>
        </div>
        <div class="pcard-actions">${actions}</div>
      </div>
    </div>`;
  }).join('');
}
function buildSchoolOptions(selectedId, editingId) {
  const linked = new Set(profiles
    .filter(p => p.schoolId && p.id !== editingId)
    .map(p => p.schoolId));
  return `<option value="">${t('teachers.school')}…</option>` + schools.map(s => {
    const taken = linked.has(s.id);
    return `<option value="${s.id}" ${taken ? 'disabled' : ''} ${s.id === selectedId ? 'selected' : ''}>${esc(s.name)}${taken ? ' — ' + t('teachers.locked') : ''}</option>`;
  }).join('');
}
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function generatePassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*';
  const all = upper + lower + digits + symbols;
  const pick = set => set[Math.floor(Math.random() * set.length)];
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  const arr = new Uint32Array(8);
  if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(arr);
  else for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 4294967296);
  for (let i = 0; i < arr.length; i++) chars.push(all[arr[i] % all.length]);
  return chars.sort(() => Math.random() - 0.5).join('');
}
function updateTeacherFormFields() {
  const role = document.getElementById('teacherRole').value;
  const editing = !!editingTeacher;
  const target = editing ? profileById(editingTeacher) : null;
  const self = !!target && isSelfProfile(target);
  document.getElementById('teacherSchoolWrap').hidden = role !== 'teacher';
  document.getElementById('teacherExpiryWrap').hidden = role !== 'temp_admin';
  document.getElementById('teacherExpiry').disabled = editing && !isSuperAdmin();
  document.getElementById('teacherPasswordWrap').hidden = editing;
  document.getElementById('teacherEmailWrap').hidden = editing;
  document.getElementById('teacherRoleWrap').hidden = editing && (!isSuperAdmin() || self);
  const tempAdminOption = document.querySelector('#teacherRole option[value="temp_admin"]');
  if (tempAdminOption) tempAdminOption.disabled = !editing && !isSuperAdmin();
  const activeWrap = document.getElementById('teacherActiveWrap');
  activeWrap.hidden = !editing || self;
}
function openTeacherSheet(id) {
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  editingTeacher = id || null;
  document.getElementById('teacherForm').reset();
  document.getElementById('teacherUserId').value = id || '';
  const schoolSel = document.getElementById('teacherSchool');
  schoolSel.innerHTML = buildSchoolOptions('', id || null);
  const roleSel = document.getElementById('teacherRole');
  roleSel.disabled = !!id && !isSuperAdmin();
  document.getElementById('teacherEmail').disabled = !!id;
  document.getElementById('teacherActive').checked = true;

  if (id) {
    const p = profileById(id);
    if (!p || p.role === 'super_admin') { toast(t('toast.noPermission'), true); return; }
    const self = isSelfProfile(p);
    document.getElementById('sheetTeacherTitle').textContent = t('teachers.editTitle');
    document.getElementById('teacherName').value = p.fullName || '';
    document.getElementById('teacherEmail').value = p.email || '';
    roleSel.value = p.isTempAdmin ? 'temp_admin' : 'teacher';
    schoolSel.innerHTML = buildSchoolOptions(p.schoolId, p.id);
    if (p.isTempAdmin) {
      document.getElementById('teacherExpiry').value = toLocalInput(p.tempAdminUntil);
    }
    document.getElementById('teacherActive').checked = !!p.isActive;
    if (self) {
      document.getElementById('teacherActiveWrap').hidden = true;
    }
  } else {
    document.getElementById('sheetTeacherTitle').textContent = t('teachers.addTitle');
    roleSel.value = 'teacher';
    document.getElementById('teacherExpiry').value = toLocalInput(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString());
    document.getElementById('teacherPassword').value = generatePassword();
  }
  updateTeacherFormFields();
  openSheet('sheetTeacher');
}
async function submitTeacher(e) {
  e.preventDefault();
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const id = document.getElementById('teacherUserId').value;
  const name = document.getElementById('teacherName').value.trim();
  const role = document.getElementById('teacherRole').value;
  const schoolId = document.getElementById('teacherSchool').value;
  const password = document.getElementById('teacherPassword').value;
  const active = document.getElementById('teacherActive').checked;
  const expiryRaw = document.getElementById('teacherExpiry').value;
  if (!name) return;
  const btn = e.target.querySelector('button[type="submit"]');
  await withBusy(btn, async () => {
    try {
      if (id) {
        const target = profileById(id);
        if (!target || target.role === 'super_admin') { toast(t('toast.noPermission'), true); return; }
        const self = isSelfProfile(target);
        const patch = { fullName: name };
        const wantsTempAdmin = role === 'temp_admin';
        if (!self) {
          if (wantsTempAdmin && !target.isTempAdmin && !isSuperAdmin()) {
            toast(t('toast.noPermission'), true); return;
          }
          if (!wantsTempAdmin && target.isTempAdmin && !isSuperAdmin()) {
            toast(t('toast.noPermission'), true); return;
          }
          if (wantsTempAdmin) {
            if (!isSuperAdmin() && target.isTempAdmin) {
              // Temp admins may manage teacher data but cannot grant or extend admin powers.
            } else {
              if (!expiryRaw) { toast(t('toast.invalidExpiry'), true); return; }
              const until = new Date(expiryRaw);
              if (Number.isNaN(until.getTime()) || until.getTime() <= Date.now()) { toast(t('toast.invalidExpiry'), true); return; }
              patch.schoolId = null;
              patch.isTempAdmin = true;
              patch.tempAdminUntil = until.toISOString();
            }
          } else {
            if (!schoolId) { toast(t('toast.needSchool'), true); return; }
            patch.schoolId = schoolId;
            if (target.isTempAdmin) {
              patch.isTempAdmin = false;
              patch.tempAdminUntil = null;
            }
          }
          patch.isActive = active;
        } else {
          toast(t('toast.teacherSelfEdit'));
        }
        await Data.updateProfile(id, patch);
        toast(t('toast.accountUpdated'));
      } else {
        if (role === 'teacher') {
          if (!schoolId) { toast(t('toast.needSchool'), true); return; }
        } else if (!expiryRaw) {
          toast(t('toast.invalidExpiry'), true); return;
        }
        const until = expiryRaw ? new Date(expiryRaw) : null;
        if (role === 'temp_admin' && (!until || Number.isNaN(until.getTime()) || until.getTime() <= Date.now())) {
          toast(t('toast.invalidExpiry'), true); return;
        }
        if (!password || password.length < 8) { toast(t('auth.passwordShort'), true); return; }
        await Data.invokeAdminTeachers('create', {
          email: document.getElementById('teacherEmail').value.trim(),
          password,
          full_name: name,
          role: role === 'temp_admin' ? 'temp_admin' : 'teacher',
          school_id: role === 'teacher' ? schoolId : null,
          temp_admin_until: role === 'temp_admin' ? until.toISOString() : null,
        });
        toast(t('toast.teacherCreated'));
      }
      resetTeacherForm();
      closeSheet('sheetTeacher');
      await refreshWorkspace({ silent: true });
    } catch (err) { showError(err); }
  });
}
function resetTeacherForm() {
  editingTeacher = null;
  document.getElementById('teacherForm').reset();
  document.getElementById('teacherUserId').value = '';
}
async function deleteTeacher(id) {
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const p = profileById(id);
  if (!p) return;
  if (p.role === 'super_admin' || isSelfProfile(p)) { toast(t('toast.noPermission'), true); return; }
  if (!(await askConfirm(t('teachers.deleteConfirm', { name: p.fullName || p.email, email: p.email }), { okText: t('common.delete') }))) return;
  try {
    await Data.invokeAdminTeachers('delete', { user_id: id });
    toast(t('toast.teacherDeleted'));
    await refreshWorkspace({ silent: true });
  } catch (err) { showError(err); }
}
function openResetPasswordSheet(id) {
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const p = profileById(id);
  if (!p || p.role === 'super_admin') { toast(t('toast.noPermission'), true); return; }
  resetPasswordUserId = id;
  document.getElementById('resetUserId').value = id;
  document.getElementById('resetPasswordSub').textContent = t('teachers.resetSub', { email: p.email });
  document.getElementById('resetPassword').value = generatePassword();
  openSheet('sheetResetPassword');
}
function resetResetPasswordForm() {
  resetPasswordUserId = null;
  document.getElementById('resetPasswordForm').reset();
  document.getElementById('resetUserId').value = '';
}
async function submitResetPassword(e) {
  e.preventDefault();
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const id = document.getElementById('resetUserId').value || resetPasswordUserId;
  const password = document.getElementById('resetPassword').value;
  if (!id) return;
  if (!password || password.length < 8) { toast(t('auth.passwordShort'), true); return; }
  const btn = e.target.querySelector('button[type="submit"]');
  await withBusy(btn, async () => {
    try {
      await Data.invokeAdminTeachers('reset_password', { user_id: id, password });
      toast(t('toast.passwordReset'));
      resetResetPasswordForm();
      closeSheet('sheetResetPassword');
    } catch (err) { showError(err); }
  });
}
async function requestSignOut() {
  if (!(await askConfirm(t('confirm.signOutMsg'), { okText: t('account.logout'), iconName: 'logout' }))) return;
  await AppAuth.signOut();
  toast(t('toast.signedOut'));
}
function openAccountSheet() {
  updateAccountUI();
  openSheet('sheetAccount');
}


/* ---------- i18n ---------- */
function t(key, vars) {
  let s = (I18N[settings.lang] && I18N[settings.lang][key]);
  if (s === undefined) s = I18N.bn[key];
  if (s === undefined) s = key;
  if (vars) Object.keys(vars).forEach(k => { s = s.replaceAll('{' + k + '}', vars[k]); });
  return s;
}
function applyStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.documentElement.lang = settings.lang;
  document.title = t('app.title');
  document.querySelectorAll('#langSeg button, #authLangSeg button').forEach(b => b.classList.toggle('active', b.dataset.lang === settings.lang));
  const live = document.getElementById('liveLabel');
  if (live) live.textContent = t(realtimeLive ? 'home.liveOn' : 'home.liveOff');
  const liveWrap = document.getElementById('liveIndicator');
  if (liveWrap) liveWrap.classList.toggle('offline', !realtimeLive);
}
function groupName(g) { return settings.lang === 'bn' ? `${GROUPS[g].label} (${GROUPS[g].bn})` : GROUPS[g].label; }

/* ---------- Helpers ---------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function initials(name) { const p = String(name || '?').trim().split(/\s+/); return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || '?'; }
function groupForDob(dob) {
  if (!dob) return null;
  if (dob >= '2019-01-01') return 'A';
  if (dob >= '2017-01-01' && dob <= '2018-12-31') return 'B';
  if (dob >= '2015-01-01' && dob <= '2016-12-31') return 'C';
  return null;
}
function fmtDate(d) { if (!d) return '—'; const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}`; }
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const schoolById = id => schools.find(s => s.id === id) || null;
const studentById = id => students.find(s => s.id === id) || null;
const eventById = id => events.find(e => e.id === id) || null;
const gameById = id => games.find(g => g.id === id) || null;
const profileById = id => profiles.find(p => p.id === id) || null;
const gamesOfEvent = eid => games.filter(g => g.eventId === eid);
const entriesOfGame = gid => entries.filter(e => e.gameId === gid);
const entriesOfStudent = sid => entries.filter(e => e.studentId === sid);

function nextStudentId() {
  let max = 0;
  students.forEach(s => { const m = /^STU-(\d+)$/.exec(s.studentId || ''); if (m) max = Math.max(max, parseInt(m[1], 10)); });
  let seq = max + 1, id;
  do { id = 'STU-' + String(seq).padStart(4, '0'); seq++; } while (students.some(s => s.studentId === id));
  return id;
}
function suggestChest(schoolId) {
  if (!schoolId) return '';
  const nums = students.filter(s => s.schoolId === schoolId).map(s => parseInt(s.chestNo, 10)).filter(n => !isNaN(n));
  return String(nums.length ? Math.max(...nums) + 1 : 1).padStart(2, '0');
}
function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.toggle('error', isError); el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ---------- Results / medals helpers ---------- */
function gameMetric(gm) { return (gm && gm.metric) || 'manual'; }
function metricLabel(m) { return t('metric.short.' + m); }
function scorePlaceholder(m) { return t('metric.ph.' + m); }

// competition ranking (ties share position, next skips): returns map id -> position|null
function rankEntries(metric, items) {
  const valid = items
    .filter(it => !it.dnf)
    .map(it => ({ id: it.id, val: parseScore(it.score, metric) }))
    .filter(it => !isNaN(it.val) && it.val !== '');
  valid.sort((a, b) => metric === 'time' ? a.val - b.val : b.val - a.val);
  const map = {};
  items.forEach(it => { map[it.id] = null; });
  let prevVal = null, prevRank = 0;
  valid.forEach((it, idx) => {
    const rank = (it.val === prevVal) ? prevRank : idx + 1;
    map[it.id] = rank; prevVal = it.val; prevRank = rank;
  });
  return map;
}

function gameResultStatus(gm) {
  const ents = entriesOfGame(gm.id).filter(e => !e.dnf);
  if (!ents.length) return 'pending';
  const ranked = ents.filter(e => e.position != null);
  if (!ranked.length) return 'pending';
  if (ranked.length === ents.length) return 'done';
  return 'partial';
}
function gameWinner(gm) {
  const win = entriesOfGame(gm.id).filter(e => !e.dnf && e.position === 1).map(e => studentById(e.studentId)).filter(Boolean);
  return win;
}

function eventMedalTally(eventId) {
  const gids = new Set(gamesOfEvent(eventId).map(g => g.id));
  const tally = {}, studentMedals = {};
  entries.forEach(en => {
    if (!gids.has(en.gameId) || en.dnf) return;
    const pos = en.position;
    if (pos !== 1 && pos !== 2 && pos !== 3) return;
    const s = studentById(en.studentId); if (!s) return;
    const key = pos === 1 ? 'gold' : pos === 2 ? 'silver' : 'bronze';
    tally[s.schoolId] = tally[s.schoolId] || { gold: 0, silver: 0, bronze: 0 };
    tally[s.schoolId][key]++;
    studentMedals[s.id] = studentMedals[s.id] || { gold: 0, silver: 0, bronze: 0 };
    studentMedals[s.id][key]++;
  });
  const medalSort = (a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze;
  const schoolRows = Object.keys(tally).map(sid => ({ school: schoolById(sid), ...tally[sid] }))
    .filter(r => r.school).sort(medalSort);
  const athleteRows = Object.keys(studentMedals).map(sid => ({ student: studentById(sid), ...studentMedals[sid] }))
    .filter(r => r.student).sort(medalSort);
  return { schoolRows, athleteRows };
}

/* =========================================================
   NAVIGATION
   ========================================================= */
function showScreen(name) {
  if (name === 'teachers' && !isAdminUser()) {
    toast(t('toast.noPermission'), true);
    name = 'home';
  }
  if (name === 'schools' && !isAdminUser() && !isTeacherUser()) {
    toast(t('toast.noPermission'), true);
    name = 'home';
  }
  if (name === 'settings' && !isAdminUser() && !isTeacherUser()) {
    toast(t('toast.noPermission'), true);
    name = 'home';
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + name));
  const navTarget = NAV_FOR[name] || name;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.screen === navTarget));

  let title;
  if (name === 'eventDetail') { const ev = eventById(openEventId); title = ev ? ev.name : t('title.events'); }
  else title = t(TITLES[name] || 'app.title');
  document.getElementById('appBarTitle').textContent = title;
  document.getElementById('appBarEyebrow').textContent = t(EYEBROW[name] || 'app.eyebrow');

  document.getElementById('btnBack').hidden = !SECONDARY.includes(name);
  currentScreen = name;
  updateFabVisibility();
  renderForScreen(name);
  document.getElementById('appContent').scrollTop = 0;
}
function updateFabVisibility() {
  const fab = document.getElementById('fab');
  if (!fab) return;
  const admin = isAdminUser();
  const canAddStudent = admin || isTeacherUser();
  const show = (currentScreen === 'students' && canAddStudent)
    || (admin && ['events', 'eventDetail', 'schools', 'teachers'].includes(currentScreen));
  fab.hidden = !show;
}
function renderForScreen(name) {
  if (name === 'home') renderHome();
  else if (name === 'students') renderStudents();
  else if (name === 'events') renderEvents();
  else if (name === 'eventDetail') renderEventDetail();
  else if (name === 'results') renderResultsTab();
  else if (name === 'schools') renderSchools();
  else if (name === 'teachers') renderTeachers();
  else if (name === 'report') renderReport();
  else if (name === 'winners') renderWinners();
  else if (name === 'records') renderRecords();
}
function openSheet(id) { document.getElementById(id).classList.add('open'); }
function closeSheet(id) { document.getElementById(id).classList.remove('open'); }

/* =========================================================
   HOME
   ========================================================= */
function renderHome() {
  document.getElementById('heroStudents').textContent = students.length;
  document.getElementById('heroSub').textContent = t('home.heroSub', { schools: schools.length, events: events.length });
  document.getElementById('statSchools').textContent = schools.length;
  document.getElementById('statEvents').textContent = events.length;
  document.getElementById('statGames').textContent = games.length;
  document.getElementById('statEntries').textContent = entries.length;

  const recent = [...events].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 5);
  const box = document.getElementById('recentEvents');
  if (!recent.length) { box.innerHTML = `<p class="empty">${t('home.noEvents')}</p>`; return; }
  box.innerHTML = recent.map(ev => {
    const gc = gamesOfEvent(ev.id).length;
    const ec = entries.filter(e => gamesOfEvent(ev.id).some(g => g.id === e.gameId)).length;
    return `<div class="pcard event-card" data-open-event="${ev.id}">
      ${dateBadgeHtml(ev.date)}
      <div class="pcard-info">
        <div class="event-info-name">${esc(ev.name)}</div>
        <div class="event-info-sub">${esc(ev.note || (ev.date ? fmtDate(ev.date) : t('events.noDate')))}</div>
        <div class="event-info-tags"><span class="pill count">${gc} ${t('events.games')}</span><span class="pill count">${ec} ${t('events.participants')}</span></div>
      </div>
      ${icon('chev', 'card-chev')}
    </div>`;
  }).join('');
}

/* =========================================================
   SCHOOLS
   ========================================================= */
function renderSchools() {
  const list = document.getElementById('schoolList');
  const empty = document.getElementById('schoolEmpty');
  if (!schools.length) { list.innerHTML = ''; empty.hidden = false; return; }
  empty.hidden = true;
  list.innerHTML = schools.map(s => {
    const count = students.filter(x => x.schoolId === s.id).length;
    return `<div class="pcard">
      <div class="pcard-top">
        <div class="avatar school">${icon('school')}</div>
        <div class="pcard-info"><div class="pcard-name">${esc(s.name)}</div>
          <div class="pcard-sub">${esc(s.principal || '—')} · ${esc(s.mobile || '—')}</div></div>
        <div class="pcard-actions" data-admin-only>
          <button class="icon-btn edit" data-action="edit" data-id="${s.id}" aria-label="${t('common.edit')}" title="${t('common.edit')}">${icon('edit')}</button>
          <button class="icon-btn danger" data-action="delete" data-id="${s.id}" aria-label="${t('common.delete')}" title="${t('common.delete')}">${icon('trash')}</button>
        </div>
      </div>
      <div class="pcard-tags"><span class="pill count">${count} ${t('schools.students')}</span></div>
    </div>`;
  }).join('');
}
function refreshSchoolSelects() {
  const opts = `<option value="">${t('students.school')}…</option>` + schools.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  const st = document.getElementById('stSchool'); const k1 = st.value; st.innerHTML = opts; if (k1 && schoolById(k1)) st.value = k1;
  const sf = document.getElementById('stuSchoolFilter');
  sf.innerHTML = `<option value="">${t('common.all')} ${t('schools.students')}</option>` + schools.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  sf.value = stuSchoolVal && schoolById(stuSchoolVal) ? stuSchoolVal : '';
  const af = document.getElementById('assignSchoolFilter');
  if (af) {
    const k2 = af.value;
    af.innerHTML = `<option value="">${t('common.all')}</option>` + schools.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
    if (k2 && schoolById(k2)) af.value = k2;
  }
}
function resetSchoolForm() { editingSchool = null; document.getElementById('schoolForm').reset(); document.getElementById('schoolEditId').value = ''; }
function openSchoolSheet(id) {
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  if (id) {
    const s = schoolById(id); if (!s) return;
    editingSchool = id;
    document.getElementById('schoolEditId').value = id;
    document.getElementById('schoolName').value = s.name;
    document.getElementById('schoolPrincipal').value = s.principal || '';
    document.getElementById('schoolMobile').value = s.mobile || '';
    document.getElementById('sheetSchoolTitle').textContent = t('schools.editTitle');
  } else { resetSchoolForm(); document.getElementById('sheetSchoolTitle').textContent = t('schools.addTitle'); }
  openSheet('sheetSchool');
}
async function submitSchool(e) {
  e.preventDefault();
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const name = document.getElementById('schoolName').value.trim(); if (!name) return;
  const data = { name, principal: document.getElementById('schoolPrincipal').value.trim(), mobile: document.getElementById('schoolMobile').value.trim() };
  const btn = e.target.querySelector('button[type="submit"]');
  await withBusy(btn, async () => {
    try {
      if (editingSchool) { await Data.updateSchool(editingSchool, data); toast(t('toast.schoolUpdated')); }
      else { await Data.createSchool(data); toast(t('toast.schoolAdded')); }
      resetSchoolForm(); closeSheet('sheetSchool');
      await refreshWorkspace({ silent: true });
    } catch (err) { showError(err); }
  });
}
async function deleteSchool(id) {
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const s = schoolById(id); if (!s) return;
  const studs = students.filter(x => x.schoolId === id);
  const msg = studs.length ? t('confirm.schoolDeleteWithStudents', { name: s.name, n: studs.length }) : t('confirm.schoolDelete', { name: s.name });
  if (!(await askConfirm(msg, { okText: t('common.delete') }))) return;
  try {
    await Data.deleteSchool(id);
    toast(t('toast.schoolDeleted'));
    await refreshWorkspace({ silent: true });
  } catch (err) { showError(err); }
}

/* =========================================================
   STUDENTS
   ========================================================= */
function renderGroupHint() {
  const dob = document.getElementById('stDob').value;
  const hint = document.getElementById('stGroupHint');
  const g = groupForDob(dob);
  if (!dob) { hint.className = 'group-hint'; hint.innerHTML = `<span class="muted">${t('students.groupHintEmpty')}</span>`; return; }
  if (g) { hint.className = 'group-hint ok'; hint.innerHTML = `${t('students.groupHintOk')} <span class="badge">${groupName(g)}</span> — ${t('students.groupRange')}: ${GROUPS[g].range}`; }
  else { hint.className = 'group-hint warn'; hint.innerHTML = t('students.groupHintWarn'); }
}
function refreshStudentIdPreview() {
  const el = document.getElementById('stStudentId');
  if (!el) return;
  if (editingStudent) {
    const s = studentById(editingStudent);
    el.value = s ? s.studentId || '' : '';
  } else {
    el.value = '';
    el.placeholder = t('common.auto');
  }
}
function updateChestSuggestion() {
  if (editingStudent) return;
  const sid = document.getElementById('stSchool').value;
  document.getElementById('stChestNo').value = sid ? suggestChest(sid) : '';
}
function resetStudentForm() {
  editingStudent = null;
  document.getElementById('studentForm').reset();
  document.getElementById('studentEditId').value = '';
  renderGroupHint(); refreshStudentIdPreview(); updateChestSuggestion();
}
function openStudentSheet(id) {
  if (id && !canEditStudent(studentById(id))) { toast(t('toast.noPermission'), true); return; }
  if (!isAdminUser() && !isTeacherUser()) { toast(t('toast.noPermission'), true); return; }
  if (!schools.length) { toast(t('students.noSchool'), true); if (isAdminUser()) showScreen('schools'); return; }
  refreshSchoolSelects();
  const schoolSel = document.getElementById('stSchool');
  if (isTeacherUser()) {
    if (!ownSchoolId()) { toast(t('students.noSchool'), true); return; }
    schoolSel.value = ownSchoolId();
    schoolSel.disabled = true;
  } else {
    schoolSel.disabled = false;
  }
  if (id) {
    const s = studentById(id); if (!s) return;
    editingStudent = id;
    document.getElementById('studentEditId').value = id;
    document.getElementById('stSchool').value = s.schoolId;
    document.getElementById('stStudentId').value = s.studentId || '';
    document.getElementById('stChestNo').value = s.chestNo || '';
    document.getElementById('stName').value = s.name || '';
    document.getElementById('stDob').value = s.dob || '';
    document.getElementById('stGender').value = s.gender || 'boys';
    document.getElementById('stFather').value = s.fatherName || '';
    renderGroupHint();
    document.getElementById('sheetStudentTitle').textContent = t('students.editTitle');
  } else { resetStudentForm(); document.getElementById('sheetStudentTitle').textContent = t('students.addTitle'); }
  if (isTeacherUser()) {
    document.getElementById('stSchool').value = ownSchoolId();
    document.getElementById('stSchool').disabled = true;
  }
  openSheet('sheetStudent');
}
async function submitStudent(e) {
  e.preventDefault();
  const teacher = isTeacherUser();
  const schoolId = teacher ? ownSchoolId() : document.getElementById('stSchool').value;
  const name = document.getElementById('stName').value.trim();
  const dob = document.getElementById('stDob').value;
  if (!schoolId) { toast(t('toast.needSchool'), true); return; }
  if (!name) { toast(t('toast.needName'), true); return; }
  if (!dob) { toast(t('toast.needDob'), true); return; }
  const group = groupForDob(dob);
  if (!group) { toast(t('toast.badDob'), true); return; }

  if (editingStudent && !canEditStudent(studentById(editingStudent))) {
    toast(t('toast.noPermission'), true); return;
  }

  const data = {
    schoolId,
    chestNo: document.getElementById('stChestNo').value.trim(),
    name,
    dob,
    fatherName: document.getElementById('stFather').value.trim(),
    gender: document.getElementById('stGender').value,
  };
  const btn = e.target.querySelector('button[type="submit"]');
  await withBusy(btn, async () => {
    try {
      if (editingStudent) { await Data.updateStudent(editingStudent, data); toast(t('toast.studentUpdated')); }
      else { await Data.createStudent(data); toast(t('toast.studentAdded')); }
      resetStudentForm(); closeSheet('sheetStudent');
      await refreshWorkspace({ silent: true });
    } catch (err) { showError(err); }
  });
}
async function deleteStudent(id) {
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const s = studentById(id); if (!s) return;
  if (!(await askConfirm(t('confirm.studentDelete', { name: s.name }), { okText: t('common.delete') }))) return;
  try {
    await Data.deleteStudent(id);
    toast(t('toast.studentDeleted'));
    await refreshWorkspace({ silent: true });
  } catch (err) { showError(err); }
}
function renderStudents() {
  const list = students.filter(s => {
    if (stuSchoolVal && s.schoolId !== stuSchoolVal) return false;
    if (stuGroupVal && s.group !== stuGroupVal) return false;
    if (stuSearchVal) {
      const hay = `${s.name || ''} ${s.studentId || ''} ${s.chestNo || ''}`.toLowerCase();
      if (!hay.includes(stuSearchVal)) return false;
    }
    return true;
  });
  const box = document.getElementById('studentList');
  const empty = document.getElementById('studentEmpty');
  const meta = document.getElementById('studentMeta');
  if (meta) meta.textContent = t('students.count', { n: list.length });
  if (!list.length) { box.innerHTML = ''; empty.hidden = false; return; }
  empty.hidden = true;
  box.innerHTML = list.map(s => {
    const sc = schoolById(s.schoolId);
    const gc = entriesOfStudent(s.id).length;
    const groupPill = s.group ? `<span class="pill ${s.group}">GROUP ${s.group}</span>` : '<span class="pill none">—</span>';
    return `<div class="pcard">
      <div class="pcard-top">
        <div class="avatar ${s.gender}" data-action="profile" data-id="${s.id}">${esc(initials(s.name))}</div>
        <div class="pcard-info" data-action="profile" data-id="${s.id}">
          <div class="pcard-name">${esc(s.name)}</div>
          <div class="pcard-sub"><span class="id-code">${esc(s.studentId || '—')}</span> · Chest ${esc(s.chestNo || '—')} · ${esc(sc ? sc.name : '—')}</div>
        </div>
        <div class="pcard-actions">
          ${canEditStudent(s) ? `<button class="icon-btn edit" data-action="edit" data-id="${s.id}" aria-label="${t('common.edit')}" title="${t('common.edit')}">${icon('edit')}</button>` : ''}
          ${isAdminUser() ? `<button class="icon-btn danger" data-action="delete" data-id="${s.id}" aria-label="${t('common.delete')}" title="${t('common.delete')}">${icon('trash')}</button>` : ''}
        </div>
      </div>
      <div class="pcard-tags">${groupPill}<span class="pill ${s.gender}">${s.gender === 'girls' ? 'GIRLS' : 'BOYS'}</span>
        <span class="pill date">${fmtDate(s.dob)}</span><span class="pill count">${gc} ${t('students.games')}</span></div>
    </div>`;
  }).join('');
}
function openProfile(id) {
  const s = studentById(id); if (!s) return;
  const sc = schoolById(s.schoolId);
  const ents = entriesOfStudent(id);
  const medalCount = { 1: 0, 2: 0, 3: 0 };
  ents.forEach(en => { if (en.position >= 1 && en.position <= 3) medalCount[en.position]++; });

  let entriesHtml = '';
  if (!ents.length) entriesHtml = `<p class="empty">${t('profile.noEntries')}</p>`;
  else {
    const byEvent = {};
    ents.forEach(en => {
      const g = gameById(en.gameId); if (!g) return;
      (byEvent[g.eventId] = byEvent[g.eventId] || []).push({ g, en });
    });
    Object.keys(byEvent).forEach(eid => {
      const ev = eventById(eid);
      entriesHtml += `<div class="profile-section-title">${esc(ev ? ev.name : '—')}</div>`;
      byEvent[eid].forEach(({ g, en }) => {
        const metric = gameMetric(g);
        const rank = en.position >= 1 && en.position <= 3 ? en.position : null;
        entriesHtml += `<div class="profile-entry">
          <span class="profile-rank ${rank ? 'p' + rank : ''}">${rank || '–'}</span>
          <div class="pe-info"><div class="pe-game">${esc(g.name)}</div><div class="pe-event">${groupName(g.group)}</div></div>
          <div class="pe-res">${esc(fmtResultValue(en.score, metric)) || '—'}</div>
        </div>`;
      });
    });
  }

  document.getElementById('profileBody').innerHTML = `
    <div class="profile-head">
      <div class="avatar ${s.gender}">${esc(initials(s.name))}</div>
      <div class="profile-head-txt">
        <div class="profile-name">${esc(s.name)}</div>
        <div class="profile-sub">${esc(sc ? sc.name : '—')}</div>
        <div class="profile-pills"><span class="pill ${s.group || 'none'}">${s.group ? 'GROUP ' + s.group : '—'}</span><span class="pill ${s.gender}">${s.gender === 'girls' ? 'GIRLS' : 'BOYS'}</span></div>
      </div>
    </div>
    <div class="profile-medals">
      <div class="profile-medal"><span class="medal-dot gold"></span><b>${medalCount[1]}</b><span>${t('results.first')}</span></div>
      <div class="profile-medal"><span class="medal-dot silver"></span><b>${medalCount[2]}</b><span>${t('results.second')}</span></div>
      <div class="profile-medal"><span class="medal-dot bronze"></span><b>${medalCount[3]}</b><span>${t('results.third')}</span></div>
    </div>
    <div class="profile-grid">
      <div class="profile-field"><div class="k">${t('profile.studentId')}</div><div class="v">${esc(s.studentId || '—')}</div></div>
      <div class="profile-field"><div class="k">${t('profile.chest')}</div><div class="v">${esc(s.chestNo || '—')}</div></div>
      <div class="profile-field"><div class="k">${t('profile.dob')}</div><div class="v">${fmtDate(s.dob)}</div></div>
      <div class="profile-field"><div class="k">${t('profile.father')}</div><div class="v">${esc(s.fatherName || '—')}</div></div>
    </div>
    <div class="profile-section-title">${t('profile.entries')} (${ents.length})</div>
    ${entriesHtml}`;
  openSheet('sheetProfile');
}

/* =========================================================
   EVENTS
   ========================================================= */
function filteredEventsData() {
  const q = eventFilter.q.trim().toLowerCase();
  const today = todayISO();
  const f = eventFilter;
  if (f.school && !schoolById(f.school)) f.school = '';

  const rows = events.map(ev => {
    const gs = gamesOfEvent(ev.id);
    const gids = new Set(gs.map(g => g.id));
    const evEntries = entries.filter(en => gids.has(en.gameId));
    const schoolIds = new Set();
    evEntries.forEach(en => {
      const st = studentById(en.studentId);
      if (st && st.schoolId) schoolIds.add(st.schoolId);
    });
    const hasResults = evEntries.some(en => en.dnf || en.position != null || String(en.score || '').trim() !== '');
    return { ev, gs, evEntries, schoolIds, hasResults };
  });

  const filtered = rows.filter(({ ev, gs, evEntries, schoolIds, hasResults }) => {
    if (q) {
      const hay = `${ev.name || ''} ${ev.note || ''} ${ev.date || ''} ${fmtDate(ev.date)}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.status === 'upcoming' && !(ev.date && ev.date >= today)) return false;
    if (f.status === 'past' && !(ev.date && ev.date < today)) return false;
    if (f.status === 'noGames' && gs.length) return false;
    if (f.status === 'results' && !hasResults) return false;
    if (f.dateFrom && !(ev.date && ev.date >= f.dateFrom)) return false;
    if (f.dateTo && !(ev.date && ev.date <= f.dateTo)) return false;
    if (f.group && !gs.some(g => g.group === f.group)) return false;
    if (f.school && !schoolIds.has(f.school)) return false;
    const minG = parseInt(f.minGames, 10);
    if (!isNaN(minG) && gs.length < minG) return false;
    const maxG = parseInt(f.maxGames, 10);
    if (!isNaN(maxG) && gs.length > maxG) return false;
    const minE = parseInt(f.minEntries, 10);
    if (!isNaN(minE) && evEntries.length < minE) return false;
    return true;
  });

  const byLatest = (a, b) => (b.ev.date || '0000-00-00').localeCompare(a.ev.date || '0000-00-00');
  const byOldest = (a, b) => (a.ev.date || '9999-99-99').localeCompare(b.ev.date || '9999-99-99');
  const byName = (a, b) => (a.ev.name || '').localeCompare(b.ev.name || '');
  const sorters = {
    'date-desc': byLatest,
    'date-asc': byOldest,
    'name-asc': byName,
    'games-desc': (a, b) => b.gs.length - a.gs.length || byLatest(a, b),
    'entries-desc': (a, b) => b.evEntries.length - a.evEntries.length || byLatest(a, b),
  };
  return filtered.sort(sorters[f.sort] || byLatest);
}

function activeEventFilterCount() {
  const f = eventFilter;
  let n = 0;
  if (f.dateFrom || f.dateTo) n++;
  if (f.group) n++;
  if (f.school) n++;
  if (f.minGames !== '' || f.maxGames !== '') n++;
  if (f.minEntries !== '') n++;
  return n;
}

function populateEventFilterSchools(selected) {
  const sel = document.getElementById('evFilterSchool'); if (!sel) return;
  const list = [...schools].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  sel.innerHTML = `<option value="">${esc(t('events.allSchools'))}</option>` +
    list.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  sel.value = selected && schoolById(selected) ? selected : '';
}

function openEventFilterSheet() {
  eventFilterGroupDraft = eventFilter.group;
  populateEventFilterSchools(eventFilter.school);
  document.getElementById('evFilterFrom').value = eventFilter.dateFrom || '';
  document.getElementById('evFilterTo').value = eventFilter.dateTo || '';
  document.getElementById('evFilterMinGames').value = eventFilter.minGames || '';
  document.getElementById('evFilterMaxGames').value = eventFilter.maxGames || '';
  document.getElementById('evFilterMinEntries').value = eventFilter.minEntries || '';
  document.querySelectorAll('#evFilterGroupChips .chip').forEach(c => c.classList.toggle('active', c.dataset.group === eventFilterGroupDraft));
  openSheet('sheetEventFilter');
}

function applyEventFilterSheet(e) {
  if (e) e.preventDefault();
  const from = document.getElementById('evFilterFrom').value;
  const to = document.getElementById('evFilterTo').value;
  if (from && to && from > to) { toast(t('events.invalidRange'), true); return; }
  const numVal = id => {
    const raw = document.getElementById(id).value.trim();
    if (raw === '') return '';
    const n = parseInt(raw, 10);
    return (!isNaN(n) && n >= 0) ? String(n) : '';
  };
  const minGames = numVal('evFilterMinGames');
  const maxGames = numVal('evFilterMaxGames');
  if (minGames !== '' && maxGames !== '' && parseInt(minGames, 10) > parseInt(maxGames, 10)) {
    toast(t('events.invalidGames'), true); return;
  }
  eventFilter = {
    ...eventFilter,
    dateFrom: from,
    dateTo: to,
    group: eventFilterGroupDraft,
    school: document.getElementById('evFilterSchool').value,
    minGames,
    maxGames,
    minEntries: numVal('evFilterMinEntries'),
  };
  closeSheet('sheetEventFilter');
  renderEvents();
}

function resetEventFilters(closeSheetToo = false) {
  eventFilter = { ...EVENT_FILTER_DEFAULT };
  eventFilterGroupDraft = '';
  const search = document.getElementById('eventSearch');
  if (search) search.value = '';
  const sort = document.getElementById('eventSort');
  if (sort) sort.value = EVENT_FILTER_DEFAULT.sort;
  if (closeSheetToo) closeSheet('sheetEventFilter');
  renderEvents();
}

function clearEventFilterKey(key) {
  if (key === 'all') { resetEventFilters(); return; }
  if (key === 'date') { eventFilter.dateFrom = ''; eventFilter.dateTo = ''; }
  else if (key === 'group') { eventFilter.group = ''; eventFilterGroupDraft = ''; }
  else if (key === 'school') { eventFilter.school = ''; }
  else if (key === 'games') { eventFilter.minGames = ''; eventFilter.maxGames = ''; }
  else if (key === 'entries') { eventFilter.minEntries = ''; }
  renderEvents();
}

function renderEventActiveFilters() {
  const box = document.getElementById('eventActiveFilters');
  if (!box) return;
  const f = eventFilter;
  const chips = [];
  const chip = (key, ico, label) =>
    `<button type="button" class="ev-filter-chip" data-clear="${key}">${icon(ico)}<span>${esc(label)}</span>${icon('close')}</button>`;

  if (f.dateFrom || f.dateTo) {
    let label;
    if (f.dateFrom && f.dateTo) label = `${fmtDate(f.dateFrom)} – ${fmtDate(f.dateTo)}`;
    else if (f.dateFrom) label = `${fmtDate(f.dateFrom)} →`;
    else label = `→ ${fmtDate(f.dateTo)}`;
    chips.push(chip('date', 'calendar', label));
  }
  if (f.group) chips.push(chip('group', 'flag', `GROUP ${f.group}`));
  if (f.school) {
    const sc = schoolById(f.school);
    if (sc) chips.push(chip('school', 'school', sc.name));
  }
  if (f.minGames !== '' || f.maxGames !== '') {
    let label;
    if (f.minGames !== '' && f.maxGames !== '') label = `${f.minGames}–${f.maxGames} ${t('events.games')}`;
    else if (f.minGames !== '') label = `${f.minGames}+ ${t('events.games')}`;
    else label = `≤ ${f.maxGames} ${t('events.games')}`;
    chips.push(chip('games', 'list', label));
  }
  if (f.minEntries !== '') chips.push(chip('entries', 'users', `${f.minEntries}+ ${t('events.participants')}`));
  if (chips.length) {
    chips.push(`<button type="button" class="ev-filter-chip clear-all" data-clear="all">${icon('close')}<span>${esc(t('events.clearFilters'))}</span></button>`);
  }
  box.hidden = !chips.length;
  box.innerHTML = chips.join('');
}

function renderEvents() {
  const box = document.getElementById('eventList');
  const empty = document.getElementById('eventEmpty');
  const noMatch = document.getElementById('eventNoMatch');
  if (!box || !empty || !noMatch) return;

  const filtered = filteredEventsData();

  const searchEl = document.getElementById('eventSearch');
  if (searchEl && searchEl.value !== eventFilter.q) searchEl.value = eventFilter.q;
  const sortEl = document.getElementById('eventSort');
  if (sortEl) sortEl.value = eventFilter.sort;
  document.querySelectorAll('#eventStatusChips .chip').forEach(c => c.classList.toggle('active', c.dataset.status === eventFilter.status));

  const activeCount = activeEventFilterCount();
  const badge = document.getElementById('eventFilterBadge');
  const filterBtn = document.getElementById('btnEventFilters');
  if (badge) { badge.hidden = !activeCount; badge.textContent = activeCount; }
  if (filterBtn) filterBtn.classList.toggle('has-active', activeCount > 0);
  renderEventActiveFilters();

  document.getElementById('eventMeta').textContent = events.length
    ? t('events.showing', { n: filtered.length, total: events.length })
    : '';

  if (!events.length) {
    box.innerHTML = '';
    empty.hidden = false;
    noMatch.hidden = true;
    return;
  }
  empty.hidden = true;

  if (!filtered.length) {
    box.innerHTML = '';
    noMatch.hidden = false;
    return;
  }
  noMatch.hidden = true;

  box.innerHTML = filtered.map(({ ev, gs, evEntries, hasResults }) => {
    return `<div class="pcard event-card" data-open-event="${ev.id}">
      ${dateBadgeHtml(ev.date)}
      <div class="pcard-info">
        <div class="event-info-name">${esc(ev.name)}</div>
        <div class="event-info-sub">${ev.date ? fmtDate(ev.date) : t('events.noDate')}${ev.note ? ' · ' + esc(ev.note) : ''}</div>
        <div class="event-info-tags">
          <span class="pill count">${gs.length} ${t('events.games')}</span>
          <span class="pill count">${evEntries.length} ${t('events.participants')}</span>
          ${!gs.length ? `<span class="pill none">${t('events.noGames')}</span>` : hasResults ? `<span class="pill ok-pill">${t('events.hasResults')}</span>` : ''}
        </div>
      </div>
      <div class="pcard-actions" data-admin-only>
        <button class="icon-btn edit" data-action="edit" data-id="${ev.id}" aria-label="${t('common.edit')}" title="${t('common.edit')}">${icon('edit')}</button>
        <button class="icon-btn danger" data-action="delete" data-id="${ev.id}" aria-label="${t('common.delete')}" title="${t('common.delete')}">${icon('trash')}</button>
      </div>
    </div>`;
  }).join('');
}
function resetEventForm() { editingEvent = null; document.getElementById('eventForm').reset(); document.getElementById('eventEditId').value = ''; }
function openEventSheet(id) {
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  if (id) {
    const ev = eventById(id); if (!ev) return;
    editingEvent = id;
    document.getElementById('eventEditId').value = id;
    document.getElementById('evName').value = ev.name;
    document.getElementById('evDate').value = ev.date || '';
    document.getElementById('evNote').value = ev.note || '';
    document.getElementById('sheetEventTitle').textContent = t('events.editTitle');
  } else { resetEventForm(); document.getElementById('sheetEventTitle').textContent = t('events.addTitle'); }
  openSheet('sheetEvent');
}
async function submitEvent(e) {
  e.preventDefault();
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const name = document.getElementById('evName').value.trim();
  if (!name) { toast(t('toast.needEventName'), true); return; }
  const data = { name, date: document.getElementById('evDate').value, note: document.getElementById('evNote').value.trim() };
  const btn = e.target.querySelector('button[type="submit"]');
  await withBusy(btn, async () => {
    try {
      if (editingEvent) { await Data.updateEvent(editingEvent, data); toast(t('toast.eventUpdated')); }
      else { await Data.createEvent(data); toast(t('toast.eventAdded')); }
      resetEventForm(); closeSheet('sheetEvent');
      await refreshWorkspace({ silent: true });
    } catch (err) { showError(err); }
  });
}
async function deleteEvent(id) {
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const ev = eventById(id); if (!ev) return;
  const gs = gamesOfEvent(id);
  const msg = gs.length ? t('confirm.eventDeleteWithGames', { name: ev.name, n: gs.length }) : t('confirm.eventDelete', { name: ev.name });
  if (!(await askConfirm(msg, { okText: t('common.delete') }))) return;
  try {
    await Data.deleteEvent(id);
    toast(t('toast.eventDeleted'));
    await refreshWorkspace({ silent: true });
  } catch (err) { showError(err); }
}
function openEvent(id) { openEventId = id; showScreen('eventDetail'); }

/* =========================================================
   EVENT DETAIL / GAMES
   ========================================================= */
function renderEventDetail() {
  const ev = eventById(openEventId);
  if (!ev) { showScreen('events'); return; }
  document.getElementById('edName').textContent = ev.name;
  document.getElementById('edDate').textContent = (ev.date ? fmtDate(ev.date) : t('events.noDate')) + (ev.note ? ' · ' + ev.note : '');
  const gs = gamesOfEvent(ev.id);
  const ec = entries.filter(e => gs.some(g => g.id === e.gameId)).length;
  const doneCount = gs.filter(g => gameResultStatus(g) === 'done').length;
  document.getElementById('edStats').innerHTML = `<span>${gs.length} ${t('events.games')}</span><span>${ec} ${t('events.participants')}</span><span>${t('results.doneCount', { done: doneCount, total: gs.length })}</span>`;

  const box = document.getElementById('edGames');
  const empty = document.getElementById('edEmpty');
  if (!gs.length) { box.innerHTML = ''; empty.hidden = false; return; }
  empty.hidden = true;
  let html = '';
  ['A', 'B', 'C'].forEach(g => {
    const list = gs.filter(x => x.group === g).sort((a, b) => a.name.localeCompare(b.name));
    if (!list.length) return;
    html += `<div class="list-section-title">${groupName(g)}</div>`;
    list.forEach(gm => {
      const count = entriesOfGame(gm.id).length;
      const status = gameResultStatus(gm);
      const winners = gameWinner(gm);
      const metric = gameMetric(gm);
      const winnerLine = winners.length
        ? `<div class="game-winner">${icon('medal')}<span>${winners.map(w => esc(w.name)).join(', ')}</span></div>` : '';
      html += `<div class="pcard game-card">
        <div class="game-main" data-open-game="${gm.id}">
          <div class="game-avatar">${icon(metricIconName(metric))}</div>
          <div class="game-info">
            <div class="game-name">${esc(gm.name)}</div>
            <div class="game-sub"><span>${count} ${t('games.participants')}</span><span class="dot-sep"></span><span>${esc(metricLabel(metric))}</span></div>
          </div>
          ${icon('chev', 'card-chev')}
        </div>
        <div class="game-tags"><span class="pill ${g}">GROUP ${g}</span>${statusBadgeHtml(status)}</div>
        ${winnerLine}
        <div class="game-tools">
          <button class="game-tool records" data-action="records" data-id="${gm.id}">${icon('list')}<span>${t('eventDetail.recordsShort')}</span></button>
          <button class="game-tool" data-action="assign" data-id="${gm.id}" data-admin-only>${icon('users')}<span>${t('eventDetail.assignShort')}</span></button>
          <button class="game-tool" data-action="edit" data-id="${gm.id}" data-admin-only>${icon('edit')}<span>${t('eventDetail.editShort')}</span></button>
          <button class="game-tool danger" data-action="delete" data-id="${gm.id}" data-admin-only>${icon('trash')}<span>${t('eventDetail.deleteShort')}</span></button>
        </div>
      </div>`;
    });
  });
  box.innerHTML = html;
}
function renderQuickPicks() {
  const g = document.getElementById('gmGroup').value;
  const box = document.getElementById('gmQuickPicks');
  box.innerHTML = `<span class="muted" style="font-size:.72rem;align-self:center">${t('games.quickPicks')}</span>` +
    SUGGESTIONS[g].map(n => `<button type="button" class="qp" data-name="${esc(n)}">${esc(n)}</button>`).join('');
  box.querySelectorAll('.qp').forEach(b => b.addEventListener('click', () => { document.getElementById('gmName').value = b.dataset.name; }));
}
function resetGameForm() { editingGame = null; document.getElementById('gameForm').reset(); document.getElementById('gameEditId').value = ''; }
function openGameSheet(eventId, gameId) {
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  document.getElementById('gameEventId').value = eventId;
  if (gameId) {
    const gm = gameById(gameId); if (!gm) return;
    editingGame = gameId;
    document.getElementById('gameEditId').value = gameId;
    document.getElementById('gmName').value = gm.name;
    document.getElementById('gmGroup').value = gm.group;
    document.getElementById('gmMetric').value = gameMetric(gm);
    document.getElementById('sheetGameTitle').textContent = t('games.editTitle');
  } else {
    resetGameForm();
    document.getElementById('gameEventId').value = eventId;
    document.getElementById('sheetGameTitle').textContent = t('games.addTitle');
  }
  renderQuickPicks();
  openSheet('sheetGame');
}
async function submitGame(e) {
  e.preventDefault();
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const eventId = document.getElementById('gameEventId').value;
  const name = document.getElementById('gmName').value.trim();
  const group = document.getElementById('gmGroup').value;
  const metric = document.getElementById('gmMetric').value;
  if (!name) { toast(t('toast.needGameName'), true); return; }
  const dup = games.find(g => g.eventId === eventId && g.group === group && g.name.toLowerCase() === name.toLowerCase() && g.id !== editingGame);
  if (dup) { toast(t('toast.gameDup'), true); return; }
  const btn = e.target.querySelector('button[type="submit"]');
  await withBusy(btn, async () => {
    try {
      if (editingGame) { await Data.updateGame(editingGame, { name, group, metric }); toast(t('toast.gameUpdated')); }
      else { await Data.createGame({ eventId, name, group, metric }); toast(t('toast.gameAdded')); }
      resetGameForm(); closeSheet('sheetGame');
      await refreshWorkspace({ silent: true });
    } catch (err) { showError(err); }
  });
}
async function deleteGame(id) {
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const gm = gameById(id); if (!gm) return;
  const count = entriesOfGame(id).length;
  const msg = count ? t('confirm.gameDeleteWithEntries', { name: gm.name, n: count }) : t('confirm.gameDelete', { name: gm.name });
  if (!(await askConfirm(msg, { okText: t('common.delete') }))) return;
  try {
    await Data.deleteGame(id);
    toast(t('toast.gameDeleted'));
    await refreshWorkspace({ silent: true });
  } catch (err) { showError(err); }
}

/* =========================================================
   ASSIGN
   ========================================================= */
function openAssign(gameId) {
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const gm = gameById(gameId); if (!gm) return;
  const ev = eventById(gm.eventId);
  document.getElementById('assignGameId').value = gameId;
  document.getElementById('assignTitle').textContent = t('assign.title');
  document.getElementById('assignMeta').textContent = t('assign.meta', { game: gm.name, group: groupName(gm.group), event: ev ? ev.name : '' });
  document.getElementById('assignSearch').value = '';
  refreshSchoolSelects();
  const af = document.getElementById('assignSchoolFilter');
  if (isTeacherUser()) {
    af.value = ownSchoolId() || '';
    af.disabled = true;
  } else {
    af.value = '';
    af.disabled = false;
  }
  const own = isTeacherUser() ? ownSchoolId() : null;
  assignSelected = new Set(entriesOfGame(gameId)
    .filter(e => !own || (studentById(e.studentId) || {}).schoolId === own)
    .map(e => e.studentId));
  renderAssignList();
  openSheet('sheetAssign');
}
function renderAssignList() {
  const gameId = document.getElementById('assignGameId').value;
  const gm = gameById(gameId); if (!gm) return;
  const search = document.getElementById('assignSearch').value.trim().toLowerCase();
  const schoolF = document.getElementById('assignSchoolFilter').value;
  const teacher = isTeacherUser();
  const own = ownSchoolId();
  const eligible = students.filter(s => {
    if (s.group !== gm.group) return false;
    if (teacher && s.schoolId !== own) return false;
    if (!teacher && schoolF && s.schoolId !== schoolF) return false;
    if (search) { const hay = `${s.name} ${s.studentId || ''} ${s.chestNo || ''}`.toLowerCase(); if (!hay.includes(search)) return false; }
    return true;
  });
  const box = document.getElementById('assignList');
  const empty = document.getElementById('assignEmpty');
  if (!eligible.length) { box.innerHTML = ''; empty.hidden = false; }
  else {
    empty.hidden = true;
    box.innerHTML = eligible.map(s => {
      const checked = assignSelected.has(s.id);
      const sc = schoolById(s.schoolId);
      return `<label class="assign-row ${checked ? 'checked' : ''}" data-sid="${s.id}">
        <input type="checkbox" ${checked ? 'checked' : ''}>
        <div class="avatar ${s.gender}">${esc(initials(s.name))}</div>
        <div class="assign-info"><div class="assign-name">${esc(s.name)}</div>
          <div class="assign-sub"><span class="id-code">${esc(s.studentId || '')}</span> · ${esc(sc ? sc.name : '—')}</div></div>
      </label>`;
    }).join('');
    box.querySelectorAll('.assign-row').forEach(row => {
      const cb = row.querySelector('input');
      cb.addEventListener('change', () => {
        const sid = row.dataset.sid;
        if (cb.checked) assignSelected.add(sid); else assignSelected.delete(sid);
        row.classList.toggle('checked', cb.checked);
        updateAssignCount();
      });
    });
  }
  updateAssignCount();
  updateToggleAllLabel();
}
function updateAssignCount() {
  document.getElementById('assignCount').textContent = t('assign.count', { n: assignSelected.size });
}
function updateToggleAllLabel() {
  const rows = document.querySelectorAll('#assignList .assign-row');
  const allChecked = rows.length > 0 && [...rows].every(r => r.querySelector('input').checked);
  document.getElementById('btnAssignToggleAll').textContent = allChecked ? t('assign.deselectAll') : t('assign.selectAll');
}
function toggleAssignAll() {
  const rows = document.querySelectorAll('#assignList .assign-row');
  const allChecked = rows.length > 0 && [...rows].every(r => r.querySelector('input').checked);
  rows.forEach(r => {
    const cb = r.querySelector('input'); const sid = r.dataset.sid;
    cb.checked = !allChecked;
    if (cb.checked) assignSelected.add(sid); else assignSelected.delete(sid);
    r.classList.toggle('checked', cb.checked);
  });
  updateAssignCount(); updateToggleAllLabel();
}
async function saveAssign() {
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const gameId = document.getElementById('assignGameId').value;
  const gm = gameById(gameId); if (!gm) return;
  const btn = document.getElementById('btnSaveAssign');
  await withBusy(btn, async () => {
    try {
      await Data.assignStudents(gameId, [...assignSelected]);
      closeSheet('sheetAssign');
      toast(t('assign.saved'));
      await refreshWorkspace({ silent: true });
    } catch (err) { showError(err); }
  });
}

/* =========================================================
   RESULTS
   ========================================================= */
function renderResultsTab() {
  const resEvent = document.getElementById('resEvent');
  const prevE = resEvent.value;
  if (!events.length) {
    resEvent.innerHTML = `<option value="">${t('results.selectEvent')}</option>`;
    document.getElementById('resGame').innerHTML = `<option value="">${t('results.selectGame')}</option>`;
    document.getElementById('resultsArea').innerHTML = `<p class="empty">${t('results.noEvents')}</p>`;
    return;
  }
  const sorted = [...events].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  resEvent.innerHTML = sorted.map(ev => `<option value="${ev.id}">${esc(ev.name)}${ev.date ? ' · ' + fmtDate(ev.date) : ''}</option>`).join('');
  if (prevE && eventById(prevE)) resEvent.value = prevE;
  rebuildResGame();
}
function rebuildResGame() {
  const eid = document.getElementById('resEvent').value;
  const resGame = document.getElementById('resGame');
  const prevG = resGame.value;
  const gs = gamesOfEvent(eid);
  if (!gs.length) {
    resGame.innerHTML = `<option value="">${t('results.noGames')}</option>`;
    document.getElementById('resultsArea').innerHTML = `<p class="empty">${t('results.noGames')}</p>`;
    return;
  }
  resGame.innerHTML = gs.map(g => `<option value="${g.id}">${esc(g.name)} (${g.group})</option>`).join('');
  if (prevG && gameById(prevG) && gameById(prevG).eventId === eid) resGame.value = prevG;
  renderResultsList();
}
function renderResultsList() {
  const area = document.getElementById('resultsArea');
  const gid = document.getElementById('resGame').value;
  const gm = gameById(gid);
  if (!gm) { area.innerHTML = `<div class="podium-empty">${t('results.podiumEmpty')}</div>`; return; }

  const metric = gameMetric(gm);
  const ev = eventById(gm.eventId);
  const all = entriesOfGame(gid)
    .map(e => ({ e, s: studentById(e.studentId) }))
    .filter(x => x.s);
  const ranked = all
    .filter(x => !x.e.dnf && x.e.position != null && x.e.position >= 1 && x.e.position <= 3)
    .sort((a, b) => a.e.position - b.e.position || (a.s.name || '').localeCompare(b.s.name || ''));
  const byPos = { 1: [], 2: [], 3: [] };
  ranked.forEach(x => { if (byPos[x.e.position]) byPos[x.e.position].push(x); });
  const entered = all.filter(x => String(x.e.score || '').trim() !== '').length;

  const personHtml = x => {
    const sc = schoolById(x.s.schoolId);
    return `<div class="podium-person">
      <div class="podium-avatar">${esc(initials(x.s.name))}</div>
      <div class="podium-person-name">${esc(x.s.name)}</div>
      <div class="podium-person-school">${esc(sc ? sc.name : '—')}</div>
      <span class="podium-person-value">${esc(fmtResultValue(x.e.score, metric)) || '—'}</span>
      ${x.e.dnf ? `<div class="podium-tie">DNF</div>` : ''}
    </div>`;
  };

  let cols = '';
  [
    { pos: 2, cls: 'p2' },
    { pos: 1, cls: 'p1' },
    { pos: 3, cls: 'p3' },
  ].forEach(slot => {
    const list = byPos[slot.pos] || [];
    const people = list.slice(0, 2).map(personHtml).join('');
    const extra = list.length > 2 ? `<div class="podium-tie">+${list.length - 2} ${t('results.more')}</div>` : '';
    const empty = `<div class="podium-empty-slot"><div class="podium-avatar">–</div><div class="podium-person-name">${t('records.pending')}</div></div>`;
    cols += `<div class="podium-col ${slot.cls}">
      ${list.length ? people + extra : empty}
      <div class="pedestal">
        <span class="pedestal-num">${slot.pos}</span>
        <span class="pedestal-label">${t(slot.pos === 1 ? 'results.first' : slot.pos === 2 ? 'results.second' : 'results.third')}</span>
      </div>
    </div>`;
  });

  area.innerHTML = `<div class="podium-stage">
    <div class="podium-stage-head">
      <div class="podium-kicker">${t('results.stageKicker')}</div>
      <div class="podium-game-name">${esc(gm.name)}</div>
      <div class="podium-event-name">${esc(ev ? ev.name : '')}</div>
      <div class="podium-meta">
        <span class="stage-tag">GROUP ${esc(gm.group)}</span>
        <span class="stage-tag">${icon(metricIconName(metric))}${esc(metricLabel(metric))}</span>
        <span class="stage-tag">${t('results.participants', { n: all.length })}</span>
        <span class="stage-tag ${entered ? 'live' : ''}">${entered ? t('results.entered', { n: entered }) : t('results.noRecords')}</span>
      </div>
    </div>
    <div class="podium-grid">${cols}</div>
    <div class="stage-footer">
      <button class="btn" id="btnOpenRecords">${icon('list')}<span>${t('results.openRecords')}</span></button>
    </div>
  </div>
  ${ranked.length ? '' : `<p class="podium-empty">${t('results.podiumEmpty')}</p>`}`;
}

/* ===== Records portal (game click) ===== */
function openRecords(gameId) {
  const gm = gameById(gameId); if (!gm) return;
  BACK.records = currentScreen === 'results' ? 'results' : 'eventDetail';
  document.getElementById('recordsGameId').value = gameId;
  showScreen('records');
  renderRecords();
}
function parseScore(score, metric) {
  const raw = String(score ?? '').trim();
  if (!raw) return NaN;
  if (metric === 'time') {
    if (raw.includes(':')) {
      const [m, s] = raw.split(':');
      const mm = parseFloat(m || '0');
      const ss = parseFloat(s);
      if (!isNaN(mm) && !isNaN(ss)) return mm * 60 + ss;
      return NaN;
    }
    return parseFloat(raw);
  }
  return parseFloat(raw);
}
function fmtScore(score, metric) { return score || ''; }
function readRecordScore(row, metric) {
  if (!row) return '';
  if (metric === 'time') {
    const mmEl = row.querySelector('.rec-mm');
    const ssEl = row.querySelector('.rec-ss');
    const mm = mmEl ? mmEl.value.trim() : '';
    const ss = ssEl ? ssEl.value.trim() : '';
    if (!mm && !ss) return '';
    return (mm || '0') + ':' + (ss || '0');
  }
  const el = row.querySelector('.rec-score');
  return el ? el.value.trim() : '';
}
function manualRanks(items) {
  const map = {};
  items.forEach(it => {
    if (it.dnf) { map[it.id] = null; return; }
    const p = parseInt(it.score, 10);
    map[it.id] = (!isNaN(p) && p > 0) ? p : null;
  });
  return map;
}
function updateRecProgress(rows, items) {
  const fill = document.getElementById('recProgressFill');
  const text = document.getElementById('recProgressText');
  if (!fill && !text) return;
  const done = items.filter(it => it.dnf || String(it.score || '').trim() !== '').length;
  const total = rows.length;
  if (fill) fill.style.width = total ? Math.round((done / total) * 100) + '%' : '0%';
  if (text) text.textContent = t('records.progress', { done, total });
}

function renderRecords() {
  const area = document.getElementById('recordsArea');
  const gid = document.getElementById('recordsGameId') ? document.getElementById('recordsGameId').value : '';
  const gm = gameById(gid);
  if (!gm) { area.innerHTML = `<p class="empty">${t('records.noEntries')}</p>`; return; }
  const metric = gameMetric(gm);
  const ev = eventById(gm.eventId);
  const readOnly = !isAdminUser();
  const ents = entriesOfGame(gid).map(en => ({ en, s: studentById(en.studentId) })).filter(x => x.s);
  const rankSource = metric === 'manual'
    ? manualRanks(ents.map(x => ({ id: x.en.id, score: x.en.score || (x.en.position != null ? x.en.position : ''), dnf: x.en.dnf })))
    : rankEntries(metric, ents.map(x => ({ id: x.en.id, score: x.en.score, dnf: x.en.dnf })));
  const entered = ents.filter(x => x.en.dnf || String(x.en.score || '').trim() !== '').length;
  const pct = ents.length ? Math.round((entered / ents.length) * 100) : 0;

  let html = `<div class="rec-layout">
    <aside class="rec-aside">
    <div class="rec-hero">
    <div class="rec-kicker">${t('records.kicker')}</div>
    <button class="rec-results-link" data-action="view-results">${icon('trophy')}<span>${t('results.title')}</span>${icon('arrow-up-right')}</button>
    <h2>${esc(gm.name)}</h2>
    <div class="rec-sub">${esc(ev ? ev.name : '')}</div>
    <div class="rec-tags">
      <span>${icon('users')}GROUP ${esc(gm.group)}</span>
      <span>${icon(metricIconName(metric))}${esc(metricLabel(metric))}</span>
      <span>${icon('flag')}${ents.length} ${t('games.participants')}</span>
    </div>
    <div class="rec-progress">
      <div class="rec-progress-top"><span>${t('records.progressLabel')}</span><span id="recProgressText">${t('records.progress', { done: entered, total: ents.length })}</span></div>
      <div class="rec-progress-bar"><div class="rec-progress-fill" id="recProgressFill" style="width:${pct}%"></div></div>
    </div>
  </div>
  <p class="screen-desc">${t('records.sub')}</p>
  ${readOnly ? `<p class="readonly-note">${icon('info')}<span>${t('records.readOnly')}</span></p>` : ''}
  </aside>
  <div class="rec-main">
  <div class="rec-toolbar">
    <div class="searchbar">${icon('search')}<input id="recSearch" placeholder="${t('records.searchPh')}"></div>
    <select id="recSort">
      <option value="rank">${t('records.rank')}</option>
      <option value="name">${t('th.name')}</option>
    </select>
  </div>`;

  if (!ents.length) {
    area.innerHTML = html + `<p class="empty">${t('records.noEntries')}</p></div></div>`;
    return;
  }

  const sorted = [...ents].sort((a, b) => {
    const ra = rankSource[a.en.id], rb = rankSource[b.en.id];
    if (ra == null && rb == null) return (a.s.name || '').localeCompare(b.s.name || '');
    if (ra == null) return 1;
    if (rb == null) return -1;
    return ra - rb || (a.s.name || '').localeCompare(b.s.name || '');
  });

  html += `<div class="rec-list">`;
  sorted.forEach(({ en, s }) => {
    const rank = rankSource[en.id];
    const rankCls = rank === 1 ? 'p1' : rank === 2 ? 'p2' : rank === 3 ? 'p3' : '';
    const sc = schoolById(s.schoolId);
    let inputHtml = '';
    if (metric === 'time') {
      const rawScore = String(en.score || '');
      let mm = '', ss = '';
      if (rawScore.includes(':')) { const parts = rawScore.split(':'); mm = parts[0] || ''; ss = parts[1] || ''; }
      else ss = rawScore;
      inputHtml = `<div class="score-shell"><div class="time-parts">
        <input class="rec-mm" inputmode="decimal" value="${esc(mm)}" placeholder="${t('metric.min')}" ${readOnly ? 'disabled' : ''}>
        <span class="time-sep">:</span>
        <input class="rec-ss" inputmode="decimal" value="${esc(ss)}" placeholder="${t('metric.sec')}" ${readOnly ? 'disabled' : ''}>
      </div></div>`;
    } else if (metric === 'manual') {
      inputHtml = `<div class="score-shell"><input class="rec-score" type="number" min="1" value="${esc(en.score || (en.position != null ? en.position : ''))}" placeholder="${t('records.posPh')}" ${readOnly ? 'disabled' : ''}><span class="score-suffix">${t('records.posSuffix')}</span></div>`;
    } else {
      const suffix = metric === 'points' ? 'PTS' : 'M';
      inputHtml = `<div class="score-shell"><input class="rec-score" inputmode="decimal" value="${esc(en.score || '')}" placeholder="${scorePlaceholder(metric)}" ${readOnly ? 'disabled' : ''}><span class="score-suffix">${suffix}</span></div>`;
    }
    html += `<div class="rec-row" data-eid="${en.id}">
      <div class="rec-row-top">
        <div class="rec-rank ${rankCls}">${rank != null ? rank : '–'}</div>
        <div class="rec-info"><div class="rec-name">${esc(s.name)}</div>
          <div class="rec-school">${esc(sc ? sc.name : '—')} · ${esc(s.studentId || '')}</div></div>
        <div class="rec-pos">${rank != null ? rank : t('records.pending')}</div>
      </div>
      <div class="rec-inputs">
        ${inputHtml}
        ${readOnly ? (en.dnf ? `<span class="pill none">DNF</span>` : '') : `<label class="rec-dnf"><input type="checkbox" class="rec-dnf-cb" ${en.dnf ? 'checked' : ''}><span class="switch-track"></span><span>${t('records.dnf')}</span></label>`}
      </div>
    </div>`;
  });
  html += `</div>`;

  if (!readOnly) {
    html += `<div class="rec-save-bar">
      <button class="btn" id="btnSaveRecords">${icon('check')}<span>${t('common.save')}</span></button>
      <div class="save-note">${t('records.saveNote')}</div>
    </div>`;
  }
  html += `</div></div>`;
  area.innerHTML = html;
}

function readRecordsItems(metric) {
  const rows = [...document.querySelectorAll('#recordsArea .rec-row[data-eid]')];
  const items = rows.map(row => ({
    id: row.dataset.eid,
    score: readRecordScore(row, metric),
    dnf: !!(row.querySelector('.rec-dnf-cb') && row.querySelector('.rec-dnf-cb').checked),
  }));
  return { rows, items };
}

function applyRecordsPreview() {
  const gid = document.getElementById('recordsGameId').value;
  const gm = gameById(gid); if (!gm) return;
  const metric = gameMetric(gm);
  const { rows, items } = readRecordsItems(metric);
  const ranks = metric === 'manual' ? manualRanks(items) : rankEntries(metric, items);
  rows.forEach(row => {
    const rank = ranks[row.dataset.eid];
    const badge = row.querySelector('.rec-rank');
    if (!badge) return;
    badge.textContent = rank != null ? rank : '–';
    badge.className = 'rec-rank ' + (rank === 1 ? 'p1' : rank === 2 ? 'p2' : rank === 3 ? 'p3' : '');
    const pos = row.querySelector('.rec-pos');
    if (pos) pos.textContent = rank != null ? rank : t('records.pending');
  });
  updateRecProgress(rows, items);
}

function sortRecordsDom() {
  const gid = document.getElementById('recordsGameId').value;
  const gm = gameById(gid); if (!gm) return;
  const metric = gameMetric(gm);
  const { rows, items } = readRecordsItems(metric);
  const ranks = metric === 'manual' ? manualRanks(items) : rankEntries(metric, items);
  const mode = (document.getElementById('recSort') || {}).value || 'rank';
  const nameOf = row => (row.querySelector('.rec-name') || {}).textContent || '';
  rows.sort((a, b) => {
    if (mode === 'name') return nameOf(a).localeCompare(nameOf(b));
    const ra = ranks[a.dataset.eid], rb = ranks[b.dataset.eid];
    if (ra == null && rb == null) return nameOf(a).localeCompare(nameOf(b));
    if (ra == null) return 1;
    if (rb == null) return -1;
    return ra - rb || nameOf(a).localeCompare(nameOf(b));
  });
  const list = document.querySelector('#recordsArea .rec-list');
  if (list) rows.forEach(r => list.appendChild(r));
  applyRecordsPreview();
}

async function saveRecords() {
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const gid = document.getElementById('recordsGameId').value;
  const gm = gameById(gid); if (!gm) return;
  const metric = gameMetric(gm);
  const { items } = readRecordsItems(metric);
  const btn = document.getElementById('btnSaveRecords');
  await withBusy(btn, async () => {
    try {
      await Data.saveGameEntries(gid, items);
      toast(t('records.saved'));
      await refreshWorkspace({ silent: true });
    } catch (err) { showError(err); }
  });
}

function openResultsForGame(gameId) {
  const gm = gameById(gameId); if (!gm) return;
  showScreen('results');
  document.getElementById('resEvent').value = gm.eventId;
  rebuildResGame();
  document.getElementById('resGame').value = gameId;
  renderResultsList();
}

/* =========================================================
   REPORT
   ========================================================= */
function renderReport() {
  const ev = eventById(openEventId);
  const area = document.getElementById('reportArea');
  if (!ev) { area.innerHTML = `<p class="empty">${t('results.noEvents')}</p>`; return; }
  const gs = gamesOfEvent(ev.id);
  const evEntries = entries.filter(e => gs.some(g => g.id === e.gameId));
  const uniqueStudents = new Set(evEntries.map(e => e.studentId)).size;

  let html = `<div class="rep-head">
    <div class="rep-kicker">${t('app.eyebrow')}</div>
    <h2>${esc(ev.name)}</h2>
    <p class="rep-sub">${t('rep.event')} · ${ev.date ? fmtDate(ev.date) : t('events.noDate')}${ev.note ? ' · ' + esc(ev.note) : ''}</p></div>`;

  if (!evEntries.length) { area.innerHTML = html + `<p class="empty">${t('rep.noEntries')}</p>`; return; }

  // medal tally + champion
  const { schoolRows } = eventMedalTally(ev.id);
  if (schoolRows.length) {
    const c = schoolRows[0];
    html += `<div class="rep-group rep-champ"><h3>${t('rep.champion')}: ${esc(c.school.name)}</h3>
      <p class="rep-champ-medals">${t('results.first')} ${c.gold} · ${t('results.second')} ${c.silver} · ${t('results.third')} ${c.bronze}</p>
      <table class="rep-table"><thead><tr><th>#</th><th>${t('winners.school')}</th><th>${t('results.first')}</th><th>${t('results.second')}</th><th>${t('results.third')}</th><th>${t('winners.total')}</th></tr></thead><tbody>`;
    schoolRows.forEach((r, i) => {
      html += `<tr><td>${i + 1}</td><td>${esc(r.school.name)}</td><td>${r.gold}</td><td>${r.silver}</td><td>${r.bronze}</td><td>${r.gold + r.silver + r.bronze}</td></tr>`;
    });
    html += `</tbody></table></div>`;
  }

  ['A', 'B', 'C'].forEach(g => {
    const gGames = gs.filter(x => x.group === g).sort((a, b) => a.name.localeCompare(b.name));
    const hasEntries = gGames.some(gm => entriesOfGame(gm.id).length);
    if (!hasEntries) return;
    html += `<div class="rep-group"><h3>${groupName(g)} <span class="rep-range">(${GROUPS[g].range})</span></h3>`;
    gGames.forEach(gm => {
      const ents = entriesOfGame(gm.id).map(en => ({ en, s: studentById(en.studentId) })).filter(x => x.s);
      if (!ents.length) return;
      ents.sort((a, b) => (a.en.position ?? 9999) - (b.en.position ?? 9999) || (a.s.name || '').localeCompare(b.s.name || ''));
      html += `<h4>${esc(gm.name)}</h4><table class="rep-table"><thead><tr>
        <th>${t('rep.thPosition')}</th><th>${t('rep.thStudentId')}</th><th>${t('rep.thChest')}</th><th>${t('rep.thName')}</th>
        <th>${t('rep.thSchool')}</th><th>${t('rep.thDob')}</th><th>${t('rep.thFather')}</th><th>${t('rep.thScore')}</th>
      </tr></thead><tbody>`;
      ents.forEach(({ en, s }) => {
        html += `<tr><td>${en.position != null ? en.position : '—'}</td><td>${esc(s.studentId || '')}</td><td>${esc(s.chestNo || '')}</td>
          <td>${esc(s.name)}</td><td>${esc(schoolById(s.schoolId)?.name || '')}</td><td>${fmtDate(s.dob)}</td>
          <td>${esc(s.fatherName || '')}</td><td>${esc(en.score || '')}</td></tr>`;
      });
      html += `</tbody></table>`;
    });
    html += `</div>`;
  });

  html += `<div class="rep-footer">
    <div>${t('rep.totalStudents')}: <b>${uniqueStudents}</b> · ${t('rep.totalEntries')}: <b>${evEntries.length}</b></div>
    <div class="sign">${t('rep.sign')}</div></div>`;
  area.innerHTML = html;
}

/* =========================================================
   WINNERS / SUMMARY
   ========================================================= */
function renderWinners() {
  const ev = eventById(openEventId);
  const area = document.getElementById('winnersArea');
  if (!ev) { area.innerHTML = `<p class="empty">${t('results.noEvents')}</p>`; return; }
  const { schoolRows, athleteRows } = eventMedalTally(ev.id);
  const medalSet = (gold, silver, bronze) => `<span class="medal-stat"><span class="medal-dot gold"></span>${gold}</span>
    <span class="medal-stat"><span class="medal-dot silver"></span>${silver}</span>
    <span class="medal-stat"><span class="medal-dot bronze"></span>${bronze}</span>`;

  let html = '';
  if (schoolRows.length) {
    const c = schoolRows[0];
    html += `<div class="champion-banner">
      <div class="cb-label">${icon('trophy')}<span>${t('winners.champion')}</span></div>
      <div class="cb-name">${esc(c.school.name)}</div>
      <div class="cb-medals">${medalSet(c.gold, c.silver, c.bronze)}</div>
    </div>`;
  } else {
    html += `<div class="champion-banner none">
      <div class="cb-label">${icon('trophy')}<span>${t('winners.champion')}</span></div>
      <div class="cb-name">${t('winners.noMedals')}</div>
    </div>`;
  }

  if (schoolRows.length) {
    html += `<div class="card"><div class="card-head"><h2>${t('winners.medalTally')}</h2></div>
      <div class="table-scroll"><table class="medal-table"><thead><tr>
        <th>${t('winners.school')}</th>
        <th><span class="medal-dot gold" title="${t('results.first')}"></span></th>
        <th><span class="medal-dot silver" title="${t('results.second')}"></span></th>
        <th><span class="medal-dot bronze" title="${t('results.third')}"></span></th>
        <th>${t('winners.total')}</th>
      </tr></thead><tbody>`;
    schoolRows.forEach((r, i) => {
      const total = r.gold + r.silver + r.bronze;
      html += `<tr class="${i === 0 ? 'champ' : ''}">
        <td><span class="rank-badge">${i + 1}</span><span class="school-name">${esc(r.school.name)}</span></td>
        <td>${r.gold}</td><td>${r.silver}</td><td>${r.bronze}</td><td><b>${total}</b></td></tr>`;
    });
    html += `</tbody></table></div></div>`;
  }

  html += `<div class="card"><div class="card-head"><h2>${t('winners.bestAthlete')}</h2></div>`;
  if (athleteRows.length) {
    const a = athleteRows[0]; const sc = schoolById(a.student.schoolId);
    html += `<div class="best-athlete">
      <div class="avatar ${a.student.gender}">${esc(initials(a.student.name))}</div>
      <div class="ba-info"><div class="ba-name">${esc(a.student.name)}</div><div class="ba-sub">${esc(sc ? sc.name : '—')}</div></div>
      <div class="ba-medals">
        <span><span class="medal-dot gold"></span>${a.gold}</span>
        <span><span class="medal-dot silver"></span>${a.silver}</span>
        <span><span class="medal-dot bronze"></span>${a.bronze}</span>
      </div></div>`;
  } else html += `<p class="empty">${t('winners.noAthlete')}</p>`;
  html += `</div>`;

  html += `<div class="card"><div class="card-head"><h2>${t('winners.gameWinners')}</h2></div>`;
  const gs = gamesOfEvent(ev.id);
  ['A', 'B', 'C'].forEach(g => {
    const list = gs.filter(x => x.group === g).sort((a, b) => a.name.localeCompare(b.name));
    if (!list.length) return;
    html += `<div class="list-section-title">${groupName(g)}</div>`;
    const groupHtml = list.map(gm => {
      const ents = entriesOfGame(gm.id).map(en => ({ en, s: studentById(en.studentId) })).filter(x => x.s && !x.en.dnf && x.en.position != null);
      let inner = `<div class="win-game"><div class="win-game-head">
        <span class="win-game-name">${esc(gm.name)}</span>${metricBadgeHtml(gameMetric(gm))}</div>`;
      if (!ents.length) inner += `<div class="win-pending">${icon('clock')}<span>${t('winners.pending')}</span></div>`;
      else {
        ents.sort((a, b) => a.en.position - b.en.position || (a.s.name || '').localeCompare(b.s.name || ''));
        inner += `<div class="podium">`;
        ents.forEach(({ en, s }) => {
          const cls = en.position === 1 ? 'gold' : en.position === 2 ? 'silver' : en.position === 3 ? 'bronze' : '';
          const sc = schoolById(s.schoolId);
          inner += `<div class="podium-row ${cls}">
            <span class="podium-medal">${en.position}</span>
            <div class="podium-name">${esc(s.name)}<div class="podium-school">${esc(sc ? sc.name : '')}</div></div>
            <span class="podium-score">${esc(fmtResultValue(en.score, gameMetric(gm)) || '—')}</span></div>`;
        });
        inner += `</div>`;
      }
      inner += `</div>`;
      return inner;
    }).join('');
    html += groupHtml;
  });
  html += `</div>`;
  area.innerHTML = html;
}

/* =========================================================
   CONFIRM DIALOG
   ========================================================= */
let confirmResolver = null;
function askConfirm(message, opts = {}) {
  const { okText = t('common.confirm'), iconName = 'trash', danger = true } = opts;
  const ov = document.getElementById('dialogConfirm');
  const iconBox = document.getElementById('confirmIcon');
  iconBox.className = 'dialog-ico' + (danger ? ' danger' : '');
  iconBox.innerHTML = icon(iconName);
  document.getElementById('confirmTitle').textContent = t('confirm.title');
  document.getElementById('confirmMsg').textContent = message;
  const ok = document.getElementById('confirmOk');
  ok.textContent = okText;
  ok.className = danger ? 'btn btn-danger' : 'btn';
  document.getElementById('confirmCancel').textContent = t('common.cancel');
  ov.classList.add('open');
  setTimeout(() => document.getElementById('confirmCancel').focus(), 50);
  return new Promise(resolve => { confirmResolver = resolve; });
}
function closeConfirm(value) {
  const ov = document.getElementById('dialogConfirm');
  if (!ov.classList.contains('open')) return;
  ov.classList.remove('open');
  const r = confirmResolver; confirmResolver = null;
  if (r) r(value);
}

/* =========================================================
   DATA EXPORT
   ========================================================= */
function exportBackup() {
  if (!isAdminUser()) { toast(t('toast.noPermission'), true); return; }
  const data = {
    app: 'sports-app',
    version: 3,
    exportedAt: new Date().toISOString(),
    settings: { lang: settings.lang },
    schools,
    students,
    events,
    games,
    entries,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sports-app-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast(t('toast.backupDownloaded'));
}

/* ---------- Language ---------- */
async function changeLanguage(lang) {
  if (!['bn', 'en'].includes(lang)) return;
  settings.lang = lang;
  localStorage.setItem(LANG_KEY, lang);
  if (currentProfile && currentProfile.language !== lang) {
    currentProfile.language = lang;
    if (window.AppState) window.AppState.profile = currentProfile;
    try {
      await Data.updateProfile(currentProfile.id, { language: lang });
    } catch (err) {
      showError(err);
    }
  }
  applyStaticI18n();
  if (appBooted) {
    refreshSchoolSelects();
    renderForScreen(currentScreen);
    updateAccountUI();
  }
}

/* =========================================================
   INIT
   ========================================================= */
function init() {
  // nav
  document.querySelectorAll('.nav-item').forEach(n => n.addEventListener('click', () => showScreen(n.dataset.screen)));
  document.getElementById('btnBack').addEventListener('click', () => showScreen(BACK[currentScreen] || 'home'));
  document.querySelectorAll('.menu-row[data-screen]').forEach(m => m.addEventListener('click', () => showScreen(m.dataset.screen)));
  document.getElementById('btnAccount').addEventListener('click', openAccountSheet);
  document.getElementById('btnAccountRow').addEventListener('click', openAccountSheet);

  // FAB
  document.getElementById('fab').addEventListener('click', () => {
    if (currentScreen === 'students') openStudentSheet();
    else if (currentScreen === 'events') openEventSheet();
    else if (currentScreen === 'eventDetail') openGameSheet(openEventId);
    else if (currentScreen === 'schools') openSchoolSheet();
    else if (currentScreen === 'teachers') openTeacherSheet();
  });

  // quick actions
  document.getElementById('qaAddStudent').addEventListener('click', () => openStudentSheet());
  document.getElementById('qaAddEvent').addEventListener('click', () => openEventSheet());
  document.getElementById('qaResults').addEventListener('click', () => showScreen('results'));

  // teachers / account
  document.getElementById('btnAddTeacher').addEventListener('click', () => openTeacherSheet());
  document.getElementById('teacherRole').addEventListener('change', updateTeacherFormFields);
  document.getElementById('btnGeneratePassword').addEventListener('click', () => {
    document.getElementById('teacherPassword').value = generatePassword();
  });
  document.getElementById('btnGenerateResetPassword').addEventListener('click', () => {
    document.getElementById('resetPassword').value = generatePassword();
  });
  document.getElementById('teacherForm').addEventListener('submit', submitTeacher);
  document.getElementById('resetPasswordForm').addEventListener('submit', submitResetPassword);
  document.getElementById('teacherList').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]'); if (!btn) return;
    if (btn.dataset.action === 'edit-teacher') openTeacherSheet(btn.dataset.id);
    else if (btn.dataset.action === 'reset-password') openResetPasswordSheet(btn.dataset.id);
    else if (btn.dataset.action === 'delete-teacher') deleteTeacher(btn.dataset.id);
  });
  document.getElementById('accountBody').addEventListener('click', e => {
    if (e.target.closest('#btnChangePassword')) {
      closeSheet('sheetAccount');
      AppAuth.openChangePassword();
    } else if (e.target.closest('#btnAccountSignOut')) {
      requestSignOut();
    }
  });
  document.getElementById('btnSettingsAccount').addEventListener('click', openAccountSheet);
  document.getElementById('btnSettingsLogout').addEventListener('click', requestSignOut);

  // sheets close
  document.querySelectorAll('.sheet-close').forEach(b => b.addEventListener('click', () => closeSheet(b.dataset.close)));
  document.querySelectorAll('.sheet-overlay').forEach(ov => ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('open'); }));

  // forms
  document.getElementById('schoolForm').addEventListener('submit', submitSchool);
  document.getElementById('studentForm').addEventListener('submit', submitStudent);
  document.getElementById('eventForm').addEventListener('submit', submitEvent);
  document.getElementById('gameForm').addEventListener('submit', submitGame);
  document.getElementById('stDob').addEventListener('change', renderGroupHint);
  document.getElementById('stDob').addEventListener('input', renderGroupHint);
  document.getElementById('stSchool').addEventListener('change', updateChestSuggestion);
  document.getElementById('gmGroup').addEventListener('change', renderQuickPicks);

  // school list
  document.getElementById('schoolList').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]'); if (!btn) return;
    if (btn.dataset.action === 'edit') openSchoolSheet(btn.dataset.id);
    else if (btn.dataset.action === 'delete') deleteSchool(btn.dataset.id);
  });

  // student list
  document.getElementById('studentList').addEventListener('click', e => {
    const act = e.target.closest('[data-action]'); if (!act) return;
    const id = act.dataset.id;
    if (act.dataset.action === 'edit') openStudentSheet(id);
    else if (act.dataset.action === 'delete') deleteStudent(id);
    else if (act.dataset.action === 'profile') openProfile(id);
  });
  document.querySelectorAll('#stuGroupChips .chip').forEach(c => c.addEventListener('click', () => {
    stuGroupVal = c.dataset.group;
    document.querySelectorAll('#stuGroupChips .chip').forEach(x => x.classList.toggle('active', x === c));
    renderStudents();
  }));
  document.getElementById('stuSchoolFilter').addEventListener('change', e => { stuSchoolVal = e.target.value; renderStudents(); });
  document.getElementById('studentSearch').addEventListener('input', e => { stuSearchVal = e.target.value.trim().toLowerCase(); renderStudents(); });

  // events list (open / edit / delete)
  document.getElementById('eventList').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (btn) {
      if (btn.dataset.action === 'edit') openEventSheet(btn.dataset.id);
      else if (btn.dataset.action === 'delete') deleteEvent(btn.dataset.id);
      return;
    }
    const card = e.target.closest('[data-open-event]');
    if (card) openEvent(card.dataset.openEvent);
  });

  // events search & advanced filters
  document.getElementById('eventSearch').addEventListener('input', e => {
    eventFilter.q = e.target.value;
    renderEvents();
  });
  document.getElementById('eventSort').addEventListener('change', e => {
    eventFilter.sort = e.target.value;
    renderEvents();
  });
  document.querySelectorAll('#eventStatusChips .chip').forEach(c => c.addEventListener('click', () => {
    eventFilter.status = c.dataset.status;
    renderEvents();
  }));
  document.getElementById('btnEventFilters').addEventListener('click', openEventFilterSheet);
  document.getElementById('eventFilterForm').addEventListener('submit', applyEventFilterSheet);
  document.getElementById('btnResetEventFilters').addEventListener('click', () => resetEventFilters(true));
  document.getElementById('btnResetEventFiltersEmpty').addEventListener('click', () => resetEventFilters());
  document.querySelectorAll('#evFilterGroupChips .chip').forEach(c => c.addEventListener('click', () => {
    eventFilterGroupDraft = c.dataset.group;
    document.querySelectorAll('#evFilterGroupChips .chip').forEach(x => x.classList.toggle('active', x === c));
  }));
  document.getElementById('eventActiveFilters').addEventListener('click', e => {
    const btn = e.target.closest('[data-clear]');
    if (btn) clearEventFilterKey(btn.dataset.clear);
  });
  // home recent events
  document.getElementById('recentEvents').addEventListener('click', e => {
    const card = e.target.closest('[data-open-event]'); if (card) openEvent(card.dataset.openEvent);
  });

  // event detail games
  document.getElementById('edGames').addEventListener('click', e => {
    const open = e.target.closest('[data-open-game]');
    if (open) { openRecords(open.dataset.openGame); return; }
    const btn = e.target.closest('button[data-action]'); if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'records') openRecords(id);
    else if (btn.dataset.action === 'assign') openAssign(id);
    else if (btn.dataset.action === 'results') openResultsForGame(id);
    else if (btn.dataset.action === 'edit') openGameSheet(openEventId, id);
    else if (btn.dataset.action === 'delete') deleteGame(id);
  });
  document.getElementById('btnEventReport').addEventListener('click', () => showScreen('report'));
  document.getElementById('btnEventWinners').addEventListener('click', () => showScreen('winners'));

  // assign
  document.getElementById('assignSearch').addEventListener('input', renderAssignList);
  document.getElementById('assignSchoolFilter').addEventListener('change', renderAssignList);
  document.getElementById('btnAssignToggleAll').addEventListener('click', toggleAssignAll);
  document.getElementById('btnSaveAssign').addEventListener('click', saveAssign);

  // results
  document.getElementById('resEvent').addEventListener('change', rebuildResGame);
  document.getElementById('resGame').addEventListener('change', renderResultsList);
  document.getElementById('resultsArea').addEventListener('click', e => {
    if (e.target.closest('#btnOpenRecords')) {
      const gid = document.getElementById('resGame').value;
      if (gid) openRecords(gid);
    }
  });

  // records portal
  document.getElementById('recordsArea').addEventListener('input', e => {
    if (e.target.matches('.rec-mm, .rec-ss, .rec-score, .rec-dnf-cb')) applyRecordsPreview();
    if (e.target.id === 'recSearch') {
      const v = e.target.value.trim().toLowerCase();
      document.querySelectorAll('#recordsArea .rec-row').forEach(row => {
        row.hidden = v && !row.textContent.toLowerCase().includes(v);
      });
    }
  });
  document.getElementById('recordsArea').addEventListener('change', e => {
    if (e.target.matches('.rec-dnf-cb')) applyRecordsPreview();
    if (e.target.id === 'recSort') sortRecordsDom();
  });
  document.getElementById('recordsArea').addEventListener('click', e => {
    if (e.target.closest('#btnSaveRecords')) saveRecords();
    if (e.target.closest('[data-action="view-results"]')) {
      const gid = document.getElementById('recordsGameId').value;
      if (gid) openResultsForGame(gid);
    }
  });

  // report print
  document.getElementById('btnPrintReport').addEventListener('click', () => { renderReport(); setTimeout(() => window.print(), 100); });

  // confirm dialog
  document.getElementById('confirmOk').addEventListener('click', () => closeConfirm(true));
  document.getElementById('confirmCancel').addEventListener('click', () => closeConfirm(false));
  document.getElementById('dialogConfirm').addEventListener('click', e => { if (e.target.id === 'dialogConfirm') closeConfirm(false); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('dialogConfirm').classList.contains('open')) { closeConfirm(false); return; }
    const openSheet = document.querySelector('.sheet-overlay.open');
    if (openSheet) { openSheet.classList.remove('open'); return; }
    if (SECONDARY.includes(currentScreen)) showScreen(BACK[currentScreen] || 'home');
  });

  // backup
  document.getElementById('btnExport').addEventListener('click', exportBackup);

  // language
  document.querySelectorAll('#langSeg button, #authLangSeg button').forEach(b => b.addEventListener('click', () => changeLanguage(b.dataset.lang)));

  // initial
  applyStaticI18n();
  refreshSchoolSelects();
  showScreen('home');
  if (window.AppAuth) AppAuth.bootstrap();
  else console.error('Auth module failed to load');
}

window.t = t;
window.toast = toast;
document.addEventListener('DOMContentLoaded', init);
