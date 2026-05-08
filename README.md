# FIPAFI 2026 — AR Experience
An augmented reality web application built with A-Frame and MindAR that immerses users in the FIFA World Cup 2026 experience across Mexico, USA, and Canada.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Sections](#sections)
  - [Main Menu](#main-menu)
  - [Football Minigame (dns.html)](#football-minigame-dnshtml)
  - [World Map (world.html)](#world-map-worldhtml)
  - [AR Players (stars.html)](#ar-players-starshtml)
  - [Trivia (trivia.html)](#trivia-triviahtml)
  - [City Videos (video.html)](#city-videos-videohtml)
- [Progression System](#progression-system)
- [localStorage Keys](#localstorage-keys)
- [AR Markers](#ar-markers)
- [Configuration](#configuration)
- [Getting Started](#getting-started)

---

## Overview
FIPAFI AR Experience is a browser-based mobile AR application. No app installation required — it runs directly in the mobile browser via WebXR. Users scan printed AR markers to interact with 3D scenes, play a football shooting minigame, explore host cities, and discover player profiles.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [A-Frame](https://aframe.io) | 1.4.0 | WebXR 3D rendering |
| [MindAR.js](https://hiukim.github.io/mind-ar-js-doc/) | 1.2.2 | Image-based AR tracking |
| [aframe-extras](https://github.com/c-frame/aframe-extras) | 6.1.1 | GLTF animation mixer |
| [Font Awesome](https://fontawesome.com) | 6.5.1 | UI icons |
| [Google Fonts](https://fonts.google.com) | — | Grandstander, Bungee, Pangolin |
| [Flaticon](https://www.flaticon.es)| — | Image icons |
| localStorage | — | Client-side progress persistence |

---

## Project Structure

```
/
├── index.html              # Redirects by default to menu.html
├── menu.html               # Main menu / hub
├── dns.html                # Football minigame
├── world.html              # Interactive world map
├── stars.html              # AR player viewer
├── trivia.html             # Trivia module
├── video.html              # City venue videos
│
├── css/
│   ├── dns.css
│   ├── world.css
│   ├── stars.css
│   └── menu.css
│
├── js/
│   ├── dns.js              # Minigame logic
│   ├── ascene.js           # World map logic
│   ├── player.js           # Player viewer logic
│   ├── stars.js            # Particle effects (shared)
│   └── audio.js            # SFX system (shared)
│
├── models/
│   ├── earth.glb           # Globe model
│   ├── FootBall.glb        # Football model
│   ├── net.glb             # Goal net model
│   ├── playerfix.glb       # Animated player model
│   └── textures/           # Player kit textures (PNG)
│       ├── mexico.png
│       ├── brasil.png
│       └── ...
│
├── targets/
│   ├── tns.mind            # AR marker — minigame
│   ├── worldmap.mind       # AR marker — world map
│   ├── countries.mind          # AR marker — player viewer
│   └── planes/             # Country flag images for globe
│       ├── mexico.png
│       ├── usa.png
│       └── canada.png
│   └── countries/          # AR marker — Soccer teams logos
│
└── resources/
    ├── UI/                 # Icons and UI graphics
    │   └── paises/         # Country flag images
    └── sfx/                # Sound effects
        └── 1.wav           # Button
        └── 2.wav           # Win sound
        └── 3.wav           # Button
        └── 4.wav           # Win sound
        └── 5.wav           # Wrong sound
        └── 6.wav           # Button
        └── bg_music.wav    # Backgorund music
```

## Sections

### Main Menu
Central hub that connects all sections. Also controls the global SFX toggle.

**Links to:** `dns.html` · `world.html` · `stars.html`

---

### Football Minigame (dns.html)
The core progression engine. Users scan the AR marker and a 3D goal appears, swinging left and right. Tap the screen to shoot footballs at the goal.

**How it works:**
- First tap starts a 30-second countdown
- Each tap fires a ball (with customizable delay)
- Up to 10 balls can be in flight simultaneously (object pool)
- A goal is registered when a ball gets within 3 units of the goal
- Score accumulates in `localStorage`

**Checkpoint system:**
- If the user doesn't reach the next unlock threshold by the end of a round, their score resets to the last reached checkpoint
- Example: if `totalGoals = 145` but the next threshold is 200, score resets to 100 after the round

**Unlock thresholds:**

| Goals | Unlock           |
|-------|------------------|
| 0     | Mexico (default) |
| 100   | USA              |
| 200   | Canada           |

**Key constants in `dns.js`:**

```js
const SHOOT_SPEED    = 1.5;   // Ball launch speed
const SHOOT_UP       = 0.4;   // Vertical angle
const GRAVITY        = 0.02;  // Per-frame gravity
const DAMPING        = 0.995; // Air friction
const NET_SWING      = 5;     // Goal lateral amplitude
const NET_SPEED      = 0.05;  // Goal movement speed
const SHOOT_DELAY    = 500;   // ms between shots
const BALL_POOL_SIZE = 10;    // Max simultaneous balls
const ROUND_DURATION = 30;    // Seconds per round
const GOAL_THRESHOLDS = { USA: 100, CANADA: 200 };
```

**Writes to localStorage:** `totalGoals`, `unlocked_USA`, `unlocked_CANADA`

---

### World Map (world.html)
An interactive AR globe showing the three 2026 World Cup host countries. Drag to rotate. Tap a country to explore its host cities.

**Countries & venues:**

| Country   | Venues                                                 |
|-----------|--------------------------------------------------------|
| Mexico    | GDL (Guadalajara), CDMX (Mexico City), MTY (Monterrey) |
| USA       | NY (New York), LA (Los Angeles), KSC (Kansas City)     |
| Canada    | VAN (Vancouver), TO (Toronto)                          |

**Features:**
- Country lock/unlock based on `totalGoals` in localStorage
- Locked countries show a "X more goals to unlock" message with a link to the minigame
- Tap a city to navigate to `video.html?pais=COUNTRY&ciudad=CITY`
- 💡 Info button toggles 3 country info cards (also locked/unlocked per country)
- All UI panels auto-close when opening another (no overlay stacking)

**Reads from localStorage:** `totalGoals`, `unlocked_USA`, `unlocked_CANADA`

---

### AR Players (stars.html)

A 3D animated player viewer. Scan the AR marker to see a footballer model. Navigate between 12 international players — each with their own kit texture, stats, and profile cards.

**Available players:**

| Player | Country | Position |
|---|---|---|
| Santiago Gimenez | Mexico | Striker |
| Percy Tau | South Africa | Forward |
| Son Heung-min | South Korea | Forward |
| Patrik Schick | Czech Republic | Striker |
| Alphonso Davies | Canada | Left Back |
| Edin Dzeko | Bosnia & Herzegovina | Striker |
| Akram Afif | Qatar | Winger |
| Granit Xhaka | Switzerland | Midfielder |
| Vinicius Jr | Brazil | Winger |
| Achraf Hakimi | Morocco | Right Back |
| Duckens Nazon | Haiti | Striker |
| Andrew Robertson | Scotland | Left Back |

**Features:**
- Prev/Next navigation (only active when AR marker is detected)
- Touch-rotate the 3D model
- Tap the player's country flag to open 2 profile cards:
  - Card 1: Performance analysis
  - Card 2: Strength profile
- Cards close automatically when switching players
- 4 unlockable animations (via Trivia):

| Animation | Trivia answers required |
|---|---|
| Pass | 5 |
| Block | 10 |
| Sad | 15 |
| Wave | 20 |

**Reads from localStorage:** `triviaAnswered`

---

### Trivia (trivia.html)
Football quiz. Correct answers accumulate and unlock player animations in `stars.html`. Every 5 correct answers unlocks the next animation.

**Writes to localStorage:** `triviaAnswered`

---

### City Videos (video.html)
Destination page for city venue content. Receives country and city via URL parameters.

**URL format:**
```
video.html?pais=MEXICO&ciudad=GDL
video.html?pais=USA&ciudad=NY
video.html?pais=CANADA&ciudad=VAN
```

---

## Progression System

```
dns.html  ──► totalGoals ──► world.html  (unlocks countries + cards)
                         └──► dns.html   (checkpoint reset on fail)

trivia.html ──► triviaAnswered ──► stars.html (unlocks animations)

world.html ──► video.html (city selection via URL params)
```

---

## localStorage Keys

| Key | Type | Description |
|---|---|---|
| `totalGoals` | `number` | Cumulative goals scored. Resets to last checkpoint if round fails. |
| `unlocked_USA` | `"true"` | Set permanently when 100 goals reached. |
| `unlocked_CANADA` | `"true"` | Set permanently when 200 goals reached. |
| `triviaAnswered` | `number` | Cumulative correct trivia answers. Never resets. |

> **Note:** All progress is stored locally on the device/browser. Clearing browser data will reset all progress.

---

## AR Markers

| File | Used in | Description |
|---|---|---|
| `targets/tns.mind` | dns.html | Football minigame scene |
| `targets/worldmap.mind` | world.html | Interactive globe |
| `targets/countries.mind` | stars.html | Animated player viewer |

Markers must be printed or displayed on screen. Good lighting and a flat, wrinkle-free surface improve tracking accuracy.

---

## Configuration

**Minigame physics** — edit constants at the top of `js/dns.js`:

```js
const NET_SWING  = 5;     // ↑ harder   ↓ easier
const NET_SPEED  = 0.05;  // ↑ faster   ↓ slower
const SHOOT_DELAY = 500;  // ↑ slower tap rate
```

**Unlock thresholds** — same file:

```js
const GOAL_THRESHOLDS = { USA: 100, CANADA: 200 };
```

**Round duration:**

```js
const ROUND_DURATION = 30; // seconds
```

---

## Getting Started
This is a static web project — no build step required.

**Local development:**

```bash
# Option 1: Python
python -m http.server 8080

# Option 2: Node
npx serve .

# Option 3: VS Code
# Install Live Server extension → right-click index.html → Open with Live Server
```

Then open `http://localhost:8080/menu.html` on your mobile device (must be on the same network) or use a tunneling tool like [ngrok](https://ngrok.com) for external access.

Another option is by accesing the proyect on github [GitHub](https://mona0603.github.io/AR/)

> ⚠️ Camera access requires HTTPS or localhost. For remote testing use ngrok or deploy to a server with SSL.

---

## Audio
The `audio.js` script is loaded globally across all pages. Elements marked with `data-sfx` trigger sound effects on interaction. The unlock sound (`resources/sfx/2.wav`) plays automatically when a country threshold is reached and (`resources/sfx/5.wav`) for a failed trivia section.

Check SFX state anywhere with:

```js
window.isSfxOn() // returns true/false
```

---

*FIPAFI 2026 AR Experience — v1.0*
