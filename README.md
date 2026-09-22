# Rogue Station 🛰️

[中文版](./README_ZH.md)

**A high-fidelity 3D satellite visualization and inspection platform.**

Rogue Station is an interactive WebGL-based visualization built with React and Three.js. It features a futuristic industrial aesthetic (FUI) with detailed 3D models, smooth camera transitions, and dynamic data overlays.

![Hero Image](./src/assets/preview_demo.gif)

## ✨ Features

- **Fleet of 6 Real Spacecraft**: Switch between NASA 3D Resources assets from the top FLEET bar — SDO, Hubble (HST), TDRS, GOES, SOHO and an SSL-1300 communications bus. Each model is auto-normalized to one camera envelope.
- **Subsystem Inspection**: Click any part in 3D (raycast picking) or use the subsystem matrix — the camera flies to that module, everything else dims, and the focused part pulses with a cyan glow. Part classification is derived per-model from GLB material names.
- **Geometry-Anchored Camera Pivots**: Orbit targets use the vertex-mean centroid (snapped onto real geometry when it floats in a gap), so rotating the view always pivots around the part you see — never around a floating label.
- **Drag-Safe Gestures**: A drag that ends over empty space no longer counts as a "click blank to return to overview" — manual camera moves stay put.
- **Live FUI Telemetry**: Per-model simulated housekeeping/orbit telemetry (GEO / LEO / Sun-Earth L1 …) with animated bars, per-subsystem metric stacks and anchored HUD markers.
- **Blueprint Mode**: One click turns the whole spacecraft into the classic wireframe/holographic look.
- **Cinematic Transitions**: Smooth camera choreography powered by GSAP + OrbitControls; focusing eases the model back to its canonical orientation.
- **Boot Sequence**: Loading screen with Draco decode progress, re-armed on every fleet switch.
- **Post-Processing**: Bloom + vignette over a starfield.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **3D Engine**: [Three.js](https://threejs.org/) via [@react-three/fiber](https://github.com/pmndrs/react-three-fiber)
- **Component Library**: [@react-three/drei](https://github.com/pmndrs/drei)
- **Animation**: [GSAP](https://greensock.com/gsap/)
- **Styling**: [Styled-components](https://styled-components.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Post-Processing**: [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mrmo072/rogue-station.git
   cd rogue-station
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

## 📁 Project Structure

- `public/models/`: 6 NASA glTF assets (SDO, HST, TDRS, GOES, SOHO, SSL-1300; Draco-compressed where applicable).
- `public/draco/`: Locally bundled Draco decoder (no CDN dependency).
- `src/lib/`: Domain logic.
  - `fleet.ts`: Fleet registry — per-model subsystem rules, camera directions, telemetry channels.
  - `parts.ts`: Mesh analysis (surface-attached pivots per subsystem, scale normalization) and camera framing.
  - `telemetry.ts`: Simulated telemetry random walk.
  - `dragGuard.ts`: Distinguishes orbit drags from genuine clicks.
- `src/scene/`: 3D layer.
  - `Experience.tsx`: Canvas, lighting rig, starfield, post-processing.
  - `SatelliteScene.tsx`: Model rendering, per-subsystem highlight/dim, raycast picking.
  - `CameraRig.tsx`: GSAP camera choreography.
  - `PartMarker.tsx`: Anchored HUD markers.
- `src/ui/`: HUD layer (top bar, fleet selector, subsystem matrix, telemetry panel, bottom bar, boot screen).
- `scripts/smoke-test.mjs`: Headless Chrome smoke test (covers fleet switching + drag-guard regression).

## 📦 3D Assets

Spacecraft models come from [NASA 3D Resources](https://github.com/nasa/NASA-3D-Resources) — *"These assets are free and without copyright."* See the NASA images/media usage guidelines for details.

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.
