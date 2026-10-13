# 🐴 Donkr — The #1 Dating App for Donkeys 🔥

> *"Swipe right on your dream Jack, Jenny, or Hinny. Because every donkey deserves someone who appreciates a 3 AM serenade."*

**Donkr** is a lightweight, mobile-first Tinder-style dating web application designed exclusively for donkeys. It features static client-side storage, custom vector artwork, realistic Web Audio equine sound effects, smooth touch/mouse gesture physics, interactive donkey matchmaking, and personality-driven donkey bots.

Designed to be served cleanly from **Nginx** with zero runtime backend dependencies.

---

## 🌟 Key Features

### 🎴 1. Tinder-Style Card Swiping Physics
- **Multi-Touch & Mouse Drag Physics**: Smooth rotation and drag velocity scaling.
- **Dynamic Stamp Badges**:
  - Drag Right: `HEE-HAW! 💚` (Like)
  - Drag Left: `NOPE ❌` (Dislike / Stubborn)
  - Drag Up: `SUPER BRAY ⭐` (Super Like)
- **3D Depth Deck**: Renders stacked cards with scale and depth offsets.
- **Action Controls**:
  - ↺ **Rewind**: Undo your last swipe mistake!
  - ✖ **Nope**: Pass on the current donkey.
  - ⭐ **Super Bray**: Guaranteed match with celestial chime!
  - 💚 **Like**: Bray with mutual attraction.
  - ⚡ **Carrot Boost**: Illuminates your profile across the meadow.

### 🐴 2. Hilarious Donkey Personas & Custom Vector Avatars
Includes 12 distinct donkey bachelors and bachelorettes with hand-crafted SVG portraits:
- **Barnaby** (Poitou Donkey) — Existential French philosopher with shaggy cadenette dreadlocks and a beret.
- **Penelope** (Miniature Mediterranean) — 32 inches of pure pocket dynamite, apple burglar with a daisy behind her ear.
- **Fernando** (Andalusian Burro) — Spanish heartthrob with 42cm aerodynamic ears and a flamenco rose.
- **Daisy** (Standard American Donkey) — Sweet country farm girl, herd guardian, and dust bath enthusiast.
- **Jasper** (Mammoth Jackstock) — 15.2 hands tall gentle giant rocking gold aviators.
- **Clementine** (Wild Burro) — Red bandana desert rebel who jumps 4-foot pasture fences.
- **Ziggy** (Hinny) — Rare indie rocker with zebra hock striping and avant-garde braying.
- **Bella** (Sicilian Donkey) — High maintenance drama queen with St. Andrew's cross marking.
- **Rusty** (Irish Pack Donkey) — Connemara rainproof gentleman who loves warm bran mash.
- **Winston** (English Heritage Donkey) — Blackpool promenade aristocrat with a custom gold monocle.
- **Gretel** (Alpine Brousse) — Fearless mountain climber with a brass Valais cowbell.
- **Bartholomew** (Ancient Wisdom Donkey) — Zen master of the 6-hour motionless standstill.

### 📢 3. Zero-Asset Web Audio Synthesizer
- Generates rich, realistic harmonic donkey brays (`HEEEE-HAWWWW!`) dynamically using Web Audio API oscillators and formant bandpass filters.
- Triumphant match fanfare chimes, card swishes, and tactile pop sounds.
- Full sound toggle / mute control.

### 💬 4. Matchmaking & Interactive Donkey Chat
- **Celebration Modal**: "IT'S A HEE-HAW!" popup with animated carrot/confetti bursts and nuzzling donkey avatars.
- **Carrot Pickup Lines**: Quick one-tap donkey icebreakers (*"Are you an electric fence? Because you just shocked my heart! ⚡"*).
- **Personality AI Responses**: Each donkey has custom bot responses, typing indicators (*"Barnaby is chewing cud..."*), and contextual reactions to keywords like *carrot, apple, ears, bray, dirt, rain*.

### 💾 5. Static Storage & Profile Customization
- **100% Client-Side Persistence**: Saves likes, dislikes, superlikes, matches, chat histories, custom profile data, and pasture filter preferences directly in `localStorage`.
- **Persona Editor**: Customize your donkey's name, age, breed, ear length (cm), bray volume (dB), favorite snack, bio, and portrait accessories.
- **Pasture Discovery Filters**: Filter prospective mates by maximum distance (miles), minimum ear length (cm), and specific breeds.
- **Data Controls**: Export your data as JSON or reset the pasture memory anytime.

---

## 🚀 Hosting with Nginx

Donkr comes with standalone configuration scripts that run unprivileged on port `8080`, as well as a production template for standard system Nginx on port `80`.

### Quick Start (Standalone Port 8080)

To start the server:
```bash
/opt/donkr/start.sh
```

To verify the status and health check:
```bash
/opt/donkr/status.sh
```

To stop the server:
```bash
/opt/donkr/stop.sh
```

Once started, open your browser to:
👉 **`http://localhost:8080`**

### Healthcheck Endpoint
```bash
curl http://localhost:8080/health
```
Response:
```json
{"status":"ok","app":"Donkr","bray":"HEE-HAW!","port":8080}
```

---

## 🌐 Deploying to System Nginx (Port 80)

If you have root access and want to run Donkr as the default system web server:

1. Copy the configuration template:
   ```bash
   sudo cp /opt/donkr/donkr-system-nginx.conf /etc/nginx/sites-available/donkr
   ```
2. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/donkr /etc/nginx/sites-enabled/
   ```
3. Test and reload Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 📁 Project Directory Structure

```text
/opt/donkr/
├── nginx.conf                 # Standalone Nginx config (runs on port 8080)
├── donkr-system-nginx.conf    # Production system Nginx template (port 80)
├── start.sh                   # Server startup script
├── stop.sh                    # Server shutdown script
├── status.sh                  # Server status & health check script
├── README.md                  # Documentation
├── logs/                      # Nginx access and error logs, PID file
├── temp/                      # Nginx temp buffers (body, proxy, fastcgi)
├── scripts/
│   ├── generate_assets.py     # Script that generates SVG avatars & logo
│   └── test_app.js            # Automated E2E test suite
└── public/
    ├── index.html             # Single Page Application
    ├── css/
    │   └── style.css          # Responsive styling & animations
    ├── js/
    │   ├── app.js             # Main application controller
    │   ├── cards.js           # Gesture physics & card deck manager
    │   ├── chat.js            # Match modal & donkey bot chat engine
    │   ├── sound.js           # Web Audio API sound synthesizer
    │   ├── storage.js         # LocalStorage static storage manager
    │   ├── profile.js         # Profile editor & pasture filters
    │   └── donkeys.js         # Offline fallback dataset
    ├── data/
    │   └── donkeys.json       # Donkey profiles database
    └── assets/
        ├── logo.svg           # Donkr flame + donkey ears logo
        └── avatars/           # Hand-crafted vector donkey portraits
            ├── barnaby.svg
            ├── penelope.svg
            ├── fernando.svg
            ├── daisy.svg
            ├── jasper.svg
            ├── clementine.svg
            ├── ziggy.svg
            ├── bella.svg
            ├── rusty.svg
            ├── winston.svg
            ├── gretel.svg
            ├── bartholomew.svg
            └── user-default.svg
```

---

## 🧪 Testing

Run the automated simulation test suite:
```bash
node /opt/donkr/scripts/test_app.js
```

All modules (database loading, Web Audio synthesis, LocalStorage operations, rewind history, matchmaking, and chat bot keywords) are verified!

