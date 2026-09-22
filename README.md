# ORBITAL DECK 🛰️

[中文版](./README_ZH.md)

**A high-fidelity 3D satellite visualization and inspection platform.**

ORBITAL DECK is an interactive WebGL-based visualization built with React and Three.js. It features a futuristic industrial aesthetic (FUI) with detailed 3D models, smooth camera transitions, and dynamic data overlays.

![Hero GIF: boot sequence, orbit tour, subsystem focus and theme switching](./src/assets/preview_demo.gif)

## Screenshots

**6 interface themes** — each is a full restyle with its own palette *and* its own 3D backdrop:

| FUI Classic | YoRHa |
| :---: | :---: |
| ![FUI Classic — starfield](./docs/theme-fui.png) | ![YoRHa — amber dust](./docs/theme-yorha.png) |

| CRT Phosphor | Glassmorphism |
| :---: | :---: |
| ![CRT phosphor glow](./docs/theme-crt.png) | ![Glass aurora bokeh](./docs/theme-glass.png) |

| Blueprint | Mil-Spec |
| :---: | :---: |
| ![Blueprint drafting grid](./docs/theme-blueprint.png) | ![Mil-Spec radar scope](./docs/theme-milspec.png) |

**Inspection views** — subsystem focus with dimmed surroundings, and fleet switching (Hubble):

| Subsystem focus | Fleet · HST |
| :---: | :---: |
| ![Solar array focus](./docs/focus-solar.png) | ![Hubble overview](./docs/fleet-hst.png) |

## Features

- **Unified Cockpit Layout**: Full-width top bar (logo · FLEET dropdown · clock/badges) and full-width bottom strip (toggles · hint · STYLE dropdown), with the subsystem matrix panelized as a left rail and a 1px corner-tick viewport frame around the 3D stage.
- **Fleet of 6 Real Spacecraft**: Switch between NASA 3D Resources assets via the FLEET dropdown in the top bar — SDO, Hubble (HST), TDRS, GOES, SOHO and an SSL-1300 communications bus. Each model is auto-normalized to one camera envelope.
- **6 Interface Themes**: Pick from the STYLE dropdown in the bottom bar (or cycle with the `T` key) — FUI Classic, YoRHa industrial terminal (flat sand/charcoal panels), CRT phosphor (scanlines + glow), Glassmorphism (frosted rounded panels), Blueprint (light drafting paper) and Mil-Spec radar (dashed borders + corner brackets). Each theme is a full visual restyle with its own palette — panel shapes, borders, materials and decorations all follow; choice persists across reloads.
- **Per-Theme 3D Backdrops**: The scene is not hardwired to a starfield — every theme gets a gradient sky plus its own backdrop layer: drifting starfield (FUI), floating amber dust (YoRHa), bare phosphor glow (CRT), aurora bokeh (Glass), drafting grid floor/wall (Blueprint) and a radar scope with rotating sweep (Mil-Spec).
- **Subsystem Inspection**: Click any part in 3D (raycast picking) or use the subsystem matrix — the camera flies to that module, everything else dims, and the focused part pulses with a cyan glow. Part classification is derived per-model from GLB material names.
- **Geometry-Anchored Camera Pivots**: Orbit targets use the vertex-mean centroid (snapped onto real geometry when it floats in a gap), so rotating the view always pivots around the part you see — never around a floating label.
- **Drag-Safe Gestures**: A drag that ends over empty space no longer counts as a "click blank to return to overview" — manual camera moves stay put.
- **Live FUI Telemetry**: Per-model simulated housekeeping/orbit telemetry (GEO / LEO / Sun-Earth L1 …) with animated bars, per-subsystem metric stacks and anchored HUD markers.
- **Blueprint Mode**: One click turns the whole spacecraft into the classic wireframe/holographic look.
- **Cinematic Transitions**: Smooth camera choreography powered by GSAP + OrbitControls; focusing eases the model back to its canonical orientation.
- **Boot Sequence**: Loading screen with Draco decode progress, re-armed on every fleet switch.
- **Post-Processing**: Bloom + vignette over the per-theme gradient sky.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **3D Engine**: [Three.js](https://threejs.org/) via [@react-three/fiber](https://github.com/pmndrs/react-three-fiber)
- **Component Library**: [@react-three/drei](https://github.com/pmndrs/drei)
- **Animation**: [GSAP](https://greensock.com/gsap/)
- **Styling**: [Styled-components](https://styled-components.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Post-Processing**: [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MrmoLabs/orbital-deck.git
   cd orbital-deck
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. (Optional) Headless smoke test — needs Chrome and a running dev server:
   ```bash
   npm run smoke
   ```

## Project Structure

- `public/models/`: 6 NASA glTF assets (SDO, HST, TDRS, GOES, SOHO, SSL-1300; Draco-compressed where applicable).
- `public/draco/`: Locally bundled Draco decoder (no CDN dependency).
- `docs/`: README screenshots (per-theme gallery, inspection views).
- `src/styles/`: Style-sheet split — `base.css` (default tokens + element defaults), `themes.css` (per-theme token overrides), `decorations.css` (CRT scanlines, Mil-Spec brackets), assembled by `index.css`.
- `src/lib/`: Domain logic.
  - `fleet/`: Fleet registry — `types.ts` (domain types + helpers), `models/` (one spacecraft per file: subsystem rules, camera directions, telemetry channels), `index.ts` (FLEET assembly).
  - `parts/`: `analysis.ts` (surface-attached pivots per subsystem, scale normalization) + `framing.ts` (camera framing).
  - `themes.ts`: Page theme registry — 6 interface styles (palette + panel/border/material tokens, scene gradient stops, backdrop kind), dropdown labels, persistence.
  - `telemetry.ts`: Simulated telemetry random walk.
  - `dragGuard.ts`: Distinguishes orbit drags from genuine clicks.
- `src/scene/`: 3D layer.
  - `Experience.tsx`: Canvas, lighting rig, gradient sky, post-processing (lazy-loaded via `React.lazy` so the HUD paints first).
  - `backdrops/`: Per-theme scene background — `Sky` (gradient texture), `Particles` (dust/aurora), `Geometry` (drafting grid/radar scope), `Backdrop` (kind switch).
  - `SatelliteScene.tsx`: Model rendering, per-subsystem highlight/dim, raycast picking.
  - `CameraRig.tsx`: GSAP camera choreography.
  - `PartMarker.tsx`: Anchored HUD markers.
- `src/ui/`: HUD layer (top bar with fleet dropdown, left subsystem rail, telemetry panel, bottom strip with style dropdown, dropdown primitive, boot screen).
- `scripts/smoke-test.mjs`: Headless Chrome smoke test (covers both dropdowns, all 6 themes/5 fleet models + drag-guard regression).
- `scripts/capture-readme.mjs`: Records the hero GIF — drives a scripted tour while Chrome screencast streams frames, then encodes via ffmpeg (`npm run capture`).

## Bundle Splitting

Vite `manualChunks` splits vendors (`three` / `react` / `gsap`) and the 3D layer is dynamically imported, so the initial payload is the small HUD shell (~85 kB gzipped) while the 3D engine streams in behind the boot screen.

## 3D Assets

Spacecraft models come from [NASA 3D Resources](https://github.com/nasa/NASA-3D-Resources) — *"These assets are free and without copyright."* See the NASA images/media usage guidelines for details.

## License

MIT License. See [LICENSE](LICENSE) for details.
