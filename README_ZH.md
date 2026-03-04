# Rogue Station (盗贼控制中心) 🛰️

[English Version](./README.md)

**全保真 3D 卫星可视化与巡检平台。**

Rogue Station 是一套基于 WebGL 的交互式可视化系统，采用 React 和 Three.js 构建。它融合了工业级未来主义（FUI）美学，包含高精度的 3D 模型、流畅的摄像机转场以及动态数据覆盖层。

![Hero Image](./src/assets/preview_demo.gif)

## ✨ 核心特性

- **交互式 3D 巡检**：无缝切换视角，精准聚焦卫星特定组件（如太阳能电池阵列、高增益天线）。
- **电影级转场**：基于 GSAP 构建的平滑摄像机动画，提供专业级的浏览体验。
- **动态 FUI 浮层**：实时显示系统状态与遥测数据的全息标签。
- **蓝图工业美学**：高对比度、线框风格的渲染，呈现极具科技感的工业蓝图外观。
- **后期处理特效**：通过 Bloom（辉光）效果和电影级调色提升视觉品质。

## 🛠️ 技术栈

- **前端框架**: [React 19](https://react.dev/)
- **3D 引擎**: [Three.js](https://threejs.org/) (通过 [@react-three/fiber](https://github.com/pmndrs/react-three-fiber))
- **组件库**: [@react-three/drei](https://github.com/pmndrs/drei)
- **动画库**: [GSAP](https://greensock.com/gsap/)
- **样式方案**: [Styled-components](https://styled-components.com/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **后期处理**: [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing)

## 🚀 快速上手

### 环境准备

- [Node.js](https://nodejs.org/) (v18 或更高版本)
- npm 或 yarn

### 安装步骤

1. 克隆仓库：
   ```bash
   git clone [repository-url]
   cd rogue-station
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

## 📁 项目结构

- `src/components/`: 核心 3D 与 UI 组件目录。
  - `Satellite.tsx`: 卫星主体模型及其逻辑。
  - `Experience.tsx`: 场景环境与 Canvas 渲染配置。
  - `UIOverlay.tsx`: 交互式操作面板。
  - `DataLabel.tsx`: 全息数据标记组件。
  - `CameraRig.tsx`: 摄像机动画逻辑。
- `src/assets/`: 3D 模型、纹理等资源。

## 📜 开源协议

MIT License. 详见 [LICENSE](LICENSE)。
