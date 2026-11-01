# RIDGELINE

A 2D hill-climbing game for the browser. One HTML file, no dependencies, works offline.

## Run it
Open `index.html` in a modern desktop browser, or serve the folder:

    cd ridgeline && python3 -m http.server 8000
    # then open http://localhost:8000

## Flow
Loading screen (click anywhere to start) -> garage: pick vehicle -> weather and time -> terrain -> Start.

## Controls
- Gas: Right arrow / D (or the on-screen Gas pedal)
- Brake and reverse: Left arrow / A / Space (or the Brake pedal)
- Nitro Boost: Shift / W / Up arrow (or the on-screen Nitro button)
- Air Stunts: Rotate mid-air using Gas/Brake to land Backflips & Frontflips!
- Pause: Esc, Restart: R
- Garage: left/right arrows or swipe to change vehicle, Enter for next

## Features
- Seeded Perlin-noise terrain (4 octaves), cached in 10 px samples, with elevation-based colour mapping
- Custom fixed-step vehicle physics: spring suspension, traction, air control, rollover and landing crashes
- Nitro Overdrive boost with glowing dual exhaust plasma flame particles
- Acrobatic air-stunt system: detects backflips, frontflips, and hangtime to award bonus coins and nitro refill
- Rally Checkpoint Gateways every 500m with celebratory confetti bursts, bonus coins, and nitro refills
- Swaying rope bridges with elastic tension that snap if crossed too fast
- 9 vehicles (4 locked, unlocked with diamonds earned by riding 250 / 600 / 1200 m in one run)
- 8 terrains (unlocked by lifetime distance: 10, 20, 30, 40, 50, 60 km), 3 times of day, 4 weather types
- Top 5 Local High Score Leaderboard and one-click Progress Reset for easy testing
- 100% pure client-side vanilla JavaScript, zero external libraries, works completely offline

## Tuning
Vehicle stats and prices: the `VEH` table at the top of the script. Terrain and unlock km: `BIO`.
Diamond milestones: `GM`. Title font: the `--title` CSS variable.
