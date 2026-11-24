# 🏆 Sports Portal (বার্ষিক ক্রীড়া প্রতিযোগিতা)

A comprehensive, responsive, offline-first Web Application designed for managing school and inter-institution annual sports events, athletic meets, and track & field competitions.

---

## 📖 Overview

**Sports Portal** is an all-in-one sports meet management system built with high-performance vanilla web technologies. It eliminates manual paperwork by providing a centralized digital platform to register participants, schedule events, record match results, track records, and generate real-time leaderboards with podium standings.

The application is tailored for educational institutions, sports clubs, and annual tournaments, featuring complete bilingual support (**Bengali & English**) and an offline-first design that requires zero server setup.

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

### 7. 💾 Offline-First & Data Portability
- **Zero Server Dependency**: Operates entirely in the browser using `localStorage`.
- **JSON Backup & Restore**: Export tournament data as a single JSON file and restore anytime.
- **Reset & Sample Data**: Easily reset data or prefill sample tournament data for testing.
- **Self-Contained Edition**: Includes a standalone single-file bundle (`sports-portal.html`) that can be opened anywhere without an HTTP server.

---

## 🗂 Project Structure

```plaintext
sports-portal/
├── index.html           # Main application structure and SVG icon sprites
├── styles.css           # Modern design system, CSS variables, layouts, and responsive rules
├── app.js               # Application logic, state management, I18N, and DOM controllers
├── sports-portal.html   # Bundled standalone single-file version for easy distribution
└── README.md            # Project documentation
```

---

## 🛠 Tech Stack

- **Markup & Layout**: Semantic HTML5 with SVG Sprite system
- **Styling**: Modern CSS3 (CSS Grid, Flexbox, Custom Properties / CSS Variables)
- **Scripting**: Modern Vanilla JavaScript (ES6+, Modules, LocalStorage API)
- **Typography**: 
  - *Bebas Neue* (Athletic headers & numerals)
  - *Hind Siliguri* (High-legibility Bengali script)
  - *Manrope* (Clean modern sans-serif for UI elements)
- **Dependencies**: None (100% dependency-free)

---

## 🚀 Quick Start

### Option A: Direct Browser Launch
Simply open `index.html` or `sports-portal.html` in any modern web browser (Chrome, Safari, Firefox, Edge).

### Option B: Local Web Server
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
   - In `Settings`, tap **Export Data** to save a timestamped JSON backup.

---

## 👤 Author & Maintainer

- **Developer**: Sayan Mondal ([@sansayan01](https://github.com/sansayan01))
- **Organization**: Rapid Crafters
- **Repository**: [https://github.com/sansayan01/sports-portal](https://github.com/sansayan01/sports-portal)

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
