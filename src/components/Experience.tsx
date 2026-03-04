import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Satellite } from './Satellite';
import { CameraRig } from './CameraRig';
import { DataLabel } from './DataLabel';

interface ExperienceProps {
    focusState: 'overview' | 'solarArrays' | 'commDish';
}

export function Experience({ focusState }: ExperienceProps) {
    return (
        <Canvas
            dpr={[1, 2]} // Support high DPI
            camera={{ position: [6, 4, 8], fov: 45 }}
            style={{ background: '#0a0a12' }} // Deep space dark background
        >
            <fog attach="fog" args={['#0a0a12', 10, 40]} />

            {/* Lighting - subtle to show occlusion if we used standard materials,
          but for BasicMaterial it matters less. We add it for depth if we change mats.
      */}
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />

            {/* Background Ambience */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/* The Content */}
            <group position={[0, 0, 0]}>
                <Satellite focusState={focusState} />

                {/* FUI Labels */}
                <DataLabel
                    text={`[ SYSTEM: SOLAR ARRAYS ]\n[ STATUS: TRACKING ]\n[ OUTPUT: 450W ]`}
                    position={[-2.0, 2.5, 0]} // Higher up
                    visible={focusState === 'solarArrays'}
                    side="left"
                />

                <DataLabel
                    text={`[ SYSTEM: HIGH-GAIN ANTENNA ]\n[ BAND: Ka-BAND ]\n[ LINK: STABLE ]`}
                    position={[0.5, 2.5, 0]} // Shifted right and up
                    visible={focusState === 'commDish'}
                    side="right"
                />
            </group>

            {/* Post-Processing */}
            <EffectComposer>
                <Bloom
                    intensity={1.5}
                    luminanceThreshold={0.1}
                    luminanceSmoothing={0.9}
                    mipmapBlur={false}
                />
            </EffectComposer>

            {/* Controls */}
            <CameraRig focusState={focusState} />
            {/* We can leave OrbitControls enabled but dampened for "freelook" when not animating,
          or disable them. For this demo, we might want to let user look around a bit?
          Conflicts with GSAP tweening potentially.
          Let's disable standard OrbitControls to let GSAP rule the camera.
      */}
        </Canvas>
    );
}
