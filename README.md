# 🏆 Sports Portal (বার্ষিক ক্রীড়া প্রতিযোগিতা)

A responsive, bilingual sports meet portal for managing schools, students, events, games and results. The app uses Supabase Auth, PostgreSQL Row Level Security and Realtime updates.

---

## 📖 Overview

**Sports Portal** is an all-in-one sports meet management system built with high-performance vanilla web technologies. It eliminates manual paperwork by providing a centralized digital platform to register participants, schedule events, record match results, track records, and generate real-time leaderboards with podium standings.

The application is tailored for educational institutions and annual tournaments, with Bengali and English support. A Supabase project and static HTTP hosting are required for multi-user authentication, shared data and realtime updates.

---

## ✨ Key Features

### 1. 📅 Event Management & Scheduling
- **Diverse Metrics Support**: Track results by time (seconds/milliseconds), distance (meters/cm), or points/scores.
- **Categorization**: Group events by age brackets, divisions (Senior, Junior, Sub-Junior), and gender categories.
- **Event Lifecycle Tracking**: Clear status indicators (`Pending`, `In Progress`, `Completed`).
- **Interactive Event Detail**: Dedicated drill-down view for participant rosters, heats, and live result inputs.

### 2. 🏃 Participant & Student Directory
- **Athlete Profiling**: Maintain athlete details, chest/bib numbers, age, gender, and school/house affiliations.
- **Group Assignments**: Automatic grouping into age/class brackets.
- **Instant Search & Filters**: Search participants by name, chest number, or filter by school/house.

### 3. 🥇 Results, Scoring & Live Podium
- **Real-Time Score Calculation**: Automatically rank participants based on recorded metric scores.
- **Winner Declaration**: Instant generation of 1st, 2nd, and 3rd place podium finishes (Gold, Silver, Bronze).
- **Medal Tally & House Points**: Consolidated school and house points scoreboard for overall championship tracking.
- **Tournament Records**: Track and display meet records with historic benchmarks.

### 4. 🏫 School & House Management
- Configure participating schools, houses, or clubs with custom colors and emblems.
- Aggregate points by institution to determine overall winners.

### 5. 🌐 Fully Bilingual Interface
- Seamless one-click switching between **Bengali (বাংলা)** and **English**.
- Fully localized labels, notifications, metric units, and date formatting.

### 6. 📱 Modern Mobile-First UX
- Native app feel with sticky bottom navigation and top app bars.
- High-contrast visual design, fluid touch controls, and dark-accented highlights.
- Optimized for mobile viewports, tablets, and desktop displays.

### 7. 🔐 Multi-user access
- One login portal for the Super Admin, school teachers and temporary admins.
- Super Admin provisions teacher accounts and links one teacher to each school.
- Teachers can create students for their linked school; student lists across schools, schools, events, games and results are read-only.
- Temporary admins have time-limited admin permissions. Only the Super Admin can grant/change temporary admin powers; database policies protect role grants and prevent deletion of the Super Admin.
- PostgreSQL RLS enforces permissions server-side; hiding UI controls is not treated as a security boundary.

### 8. ⚡ Shared, live data
- Supabase PostgreSQL is the source of truth; authenticated clients receive Realtime changes without refreshing.
- JSON export is available from Settings for authorized admins.

---

## 🗂 Project Structure

```plaintext
sports-portal/
├── index.html           # Main application structure and SVG icon sprites
├── styles.css           # Modern design system, CSS variables, layouts, and responsive rules
├── app.js               # Application logic, role-aware UI, I18N and controllers
├── auth.js              # Supabase login, session and password flows
├── data.js              # Supabase data access
├── realtime.js          # Realtime subscriptions
├── config.js            # Supabase URL and publishable/anon key (never service-role)
├── supabase/            # SQL migrations and admin-teachers Edge Function
├── vendor/supabase.js   # Supabase browser client
├── sports-portal.html   # Legacy standalone bundle; not the current multi-user app
└── README.md
```

---

## 🛠 Tech Stack

- **Markup & Layout**: Semantic HTML5 with SVG Sprite system
- **Styling**: Modern CSS3 (CSS Grid, Flexbox, Custom Properties / CSS Variables)
- **Scripting**: Modern Vanilla JavaScript (ES6+)
- **Backend**: Supabase Auth, PostgreSQL, Row Level Security, Realtime and Edge Functions
- **Typography**: 
  - *Bebas Neue* (Athletic headers & numerals)
  - *Hind Siliguri* (High-legibility Bengali script)
  - *Manrope* (Clean modern sans-serif for UI elements)
- **Dependencies**: Supabase JavaScript browser client is vendored in `vendor/supabase.js`

---

## 🚀 Quick Start

### 1. Configure Supabase

1. Create/choose the intended Supabase project and confirm its project URL/reference.
2. Put that project's **publishable key** (or legacy anon key) and URL in `config.js`. Never put a service-role key, personal access token, or account password in browser files or Git.
3. Apply the SQL migrations in `supabase/migrations/` in filename order using the Supabase CLI linked to the correct project or the SQL Editor. The local Supabase CLI requires Docker Desktop or Podman for local database commands.
4. Deploy `supabase/functions/admin-teachers/` as the `admin-teachers` Edge Function with JWT verification enabled. Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` to deployed Edge Functions; the service-role key must remain server-side.
5. In Supabase Auth, create the Super Admin user with the reserved address `msayan9733@gmail.com`, using a strong password entered directly in the dashboard. Do not hardcode the password. Then run this once in the SQL Editor to provision its protected profile:

```sql
insert into public.profiles (id, email, full_name, role, is_active, language)
select id, lower(email), coalesce(raw_user_meta_data->>'full_name', 'Super Admin'),
       'super_admin', true, 'bn'
from auth.users
where lower(email) = 'msayan9733@gmail.com'
on conflict (id) do update
set email = excluded.email, role = 'super_admin', school_id = null,
    is_temp_admin = false, temp_admin_until = null, is_active = true;
```

6. Serve the app over HTTP. Create schools, then provision each teacher from the Super Admin's Teachers section. Self-signup is not available.

### 2. Run the app locally

Use the local web server below; opening `index.html` via `file://` is not supported for Supabase Auth.

### Option A: Local Web Server
You can serve the project using any lightweight static server:

Using Python:
```bash
python3 -m http.server 8080
```

Using Node (`npx` / `pnpm`):
```bash
npx serve .
# or
pnpm dlx serve .
```

Open `http://localhost:8080` in your browser.

---

## 📋 User Guide

1. **Setup Schools / Houses**:
   - Go to `More` > `Schools & Houses` and enter the competing institutions or house names.
2. **Register Athletes**:
   - Navigate to the `Students` tab and add participants with their chest numbers and categories.
3. **Configure Events**:
   - Open the `Events` tab to view preloaded sports events or create custom track & field competitions.
4. **Enter Scores**:
   - Select an event to open its detail page, record participant timings or scores, and finalize results.
5. **View Leaderboard & Winners**:
   - Check the `Results` and `Winners` screens for real-time podium standings and house tallies.
6. **Backup Tournament Data**:
   - An admin can open `Settings` and tap **Export Data** to save a timestamped JSON backup.

## Supabase project note

Before deployment, verify that `SUPABASE_URL` in `config.js` is the project you intend to use. The app's URL must match the Supabase project where migrations are applied and the Edge Function is deployed. Do not paste personal access tokens, service-role keys, or passwords into chat or frontend files.

---

## 👤 Author & Maintainer

- **Developer**: Sayan Mondal ([@sansayan01](https://github.com/sansayan01))
- **Organization**: Rapid Crafters
- **Repository**: [https://github.com/sansayan01/sports-portal](https://github.com/sansayan01/sports-portal)

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
