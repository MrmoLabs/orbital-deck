# Rogue Station 🛰️

[中文版](./README_ZH.md)

**A high-fidelity 3D satellite visualization and inspection platform.**

Rogue Station is an interactive WebGL-based visualization built with React and Three.js. It features a futuristic industrial aesthetic (FUI) with detailed 3D models, smooth camera transitions, and dynamic data overlays.

![Hero Image](./src/assets/preview_demo.gif)

## ✨ Features

- **Interactive 3D Inspection**: Seamlessly focus on specific satellite modules (e.g., Solar Arrays, High-Gain Antenna).
- **Cinematic Transitions**: Smooth camera movement powered by GSAP for a professional browsing experience.
- **Dynamic FUI Overlays**: Real-time data labels providing system status and telemetry information.
- **Blueprint Aesthetic**: High-contrast, wireframe-style rendering for a holographic industrial look.
- **Post-Processing**: Enhanced visual quality with Bloom effects and cinematic color grading.

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

## 📁 Project Structure

- `src/components/`: Core 3D and UI components.
  - `Satellite.tsx`: The primary satellite model and logic.
  - `Experience.tsx`: Scene environment and canvas setup.
  - `UIOverlay.tsx`: Interactive control panel.
  - `DataLabel.tsx`: Holographic data markers.
  - `CameraRig.tsx`: Camera animation logic.
- `src/assets/`: 3D models and textures.

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.
