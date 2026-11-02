# RIDGELINE

A 2D hill-climbing game for the browser. One HTML file, zero external dependencies, works completely offline.

🎮 **Play Live:** [https://kapilkaithwas05.github.io/ridgeline/](https://kapilkaithwas05.github.io/ridgeline/)

## Run Locally
Open `index.html` in any browser, or serve the folder:

```bash
cd ridgeline && python3 -m http.server 8000
# open http://localhost:8000
```

## Flow
Loading screen -> Garage: vehicle selection & tuning upgrades -> Weather & Time of Day -> Terrain Biome & Terrain Parameters -> Start Drive!

## Controls
- **Gas:** Right arrow / D (or on-screen Gas pedal)
- **Brake & reverse:** Left arrow / A / Space (or on-screen Brake pedal)
- **Nitro Boost:** Shift / W / Up arrow (or on-screen Nitro button)
- **Air Stunts:** Rotate mid-air using Gas/Brake to land Backflips & Frontflips!
- **Pause:** Esc | **Restart:** R
- **Garage / Menus:** Left/right arrow keys or swipe to change vehicles, Enter for next

## Features
- **Interactive Terrain Parameters:** Customize **Scale** (0.5–2.0), **Height** (10–100), **Octaves** (1–6), and **Seed** (1–999 or 🎲 Randomize) directly on the Terrain selection screen.
- **Buttery-Smooth Physics:** Enhanced suspension spring-damper modeling, softened bumper collision impulses, smoothed surface normal interpolation, and predictive camera tracking.
- **Vehicle Tuning Upgrades:** Upgrade Speed, Grip, Power, and Stability across 4 tiers for owned cars using collected coins.
- **Seeded Perlin-noise Terrain:** Multi-octave procedural elevation, cached in samples with elevation-based gradient coloring.
- **Nitro Overdrive System:** Dual-exhaust plasma particles with auto-recharging boost on checkpoints and stunts.
- **Acrobatic Stunts & Rewards:** Dynamic flip & hangtime detection awarding bonus coins and instant nitro refills.
- **Rally Checkpoint Arches:** Glowing gateways every 500m with celebratory confetti bursts, bonus coins, and full nitro recovery.
- **Rope Bridges:** Swaying suspension bridges with dynamic wave equations that flex and snap under excessive speed.
- **11 Unique Biomes:** Green Hills, Rocky Hills, Jungle, Autumn Forest, Desert Dunes, Arctic, Boggy Swamp, Red Canyon, Neon City, Volcano, and Moon.
- **9 Distinct Vehicles:** Speedster, Truck, Sedan, XUV, Bike, Sport Sedan, Superbike, Monster Truck, and Formula Racer.
- **Top 5 Leaderboard & Reset:** Client-side high-score ranking and quick-reset option.
- **100% Pure Vanilla Web Stack:** Pure HTML5 Canvas + CSS + JS, zero libraries, works on desktop and mobile.
