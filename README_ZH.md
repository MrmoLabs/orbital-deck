# Rogue Station (盗贼控制中心) 🛰️

[English Version](./README.md)

**全保真 3D 卫星可视化与巡检平台。**

Rogue Station 是一套基于 WebGL 的交互式可视化系统，采用 React 和 Three.js 构建。它融合了工业级未来主义（FUI）美学，包含高精度的 3D 模型、流畅的摄像机转场以及动态数据覆盖层。

![Hero Image](./src/assets/preview_demo.gif)

## ✨ 核心特性

- **6 款真实航天器机队**：顶部 FLEET 栏可切换 NASA 3D Resources 资产——SDO、哈勃（HST）、TDRS、GOES、SOHO 与 SSL-1300 通信卫星平台；所有模型自动归一化到统一的相机尺度。
- **部件级巡检**：直接点击 3D 模型部件（射线拾取）或使用左侧子系统矩阵，摄像机将飞向对应舱段，其余部件自动压暗，目标部件青色辉光脉冲。子系统按各模型的 GLB 材质名自动分类。
- **几何体锚定的相机枢轴**：轨道中心取部件顶点均值质心（质心悬空时自动吸附到最近的真实顶点），旋转视角始终围绕你看到的部件，而不是悬浮的标签节点。
- **拖拽安全手势**：拖拽旋转后落在空白处的松手动作不再被判定为"点击空白返回总览"，手动视角不会被重置。
- **实时 FUI 遥测**：按模型区分的模拟遥测/轨道数据（地球静止轨道 / 近地轨道 / 日地 L1 点……），带动态条形图、分系统指标栈与锚定式 HUD 标记。
- **蓝图模式**：一键将整星切换为经典线框全息外观。
- **电影级转场**：GSAP + OrbitControls 协同的平滑摄像机编排；聚焦时模型缓动回标准朝向。
- **启动序列**：带 Draco 解码进度的加载屏幕，切换机队时自动重新武装。
- **后期处理**：星空背景上的 Bloom 与暗角效果。

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
   git clone https://github.com/Mrmo072/rogue-station.git
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

4. （可选）无头冒烟测试——需要本机 Chrome 且开发服务器已启动：
   ```bash
   npm run smoke
   ```

## 📁 项目结构

- `public/models/`：6 个 NASA glTF 资产（SDO、HST、TDRS、GOES、SOHO、SSL-1300，按需 Draco 压缩）。
- `public/draco/`：本地内置的 Draco 解码器（不依赖外网 CDN）。
- `src/lib/`：领域逻辑。
  - `fleet.ts`：机队注册表——每个模型的子系统划分规则、相机取向、遥测通道。
  - `parts.ts`：网格分析（分系统表面吸附枢轴、尺度归一化）与相机取景。
  - `telemetry.ts`：模拟遥测随机游走。
  - `dragGuard.ts`：区分轨道拖拽与真实点击。
- `src/scene/`：3D 层。
  - `Experience.tsx`：Canvas、灯光阵列、星空、后期处理。
  - `SatelliteScene.tsx`：模型渲染、分系统高亮/压暗、射线拾取。
  - `CameraRig.tsx`：GSAP 摄像机编排。
  - `PartMarker.tsx`：锚定式 HUD 标记。
- `src/ui/`：HUD 层（顶栏、机队选择器、子系统矩阵、遥测面板、底栏、启动屏）。
- `scripts/smoke-test.mjs`：无头 Chrome 冒烟测试（覆盖机队切换 + 拖拽守卫回归）。

## 📦 3D 模型来源

航天器模型来自 [NASA 3D Resources](https://github.com/nasa/NASA-3D-Resources)，官方声明 *“These assets are free and without copyright.”*，可自由使用；具体请参考 NASA 图像与媒体使用指南。

## 📜 开源协议

MIT License. 详见 [LICENSE](LICENSE)。
