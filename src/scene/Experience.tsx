import { Suspense, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { analyzeModel, frameFor } from '../lib/parts';
import { DRACO_DECODER_PATH } from '../lib/model';
import { OVERVIEW, type FocusId, type ModelDef } from '../lib/fleet';
import { recordPointerDown, wasDrag } from '../lib/dragGuard';
import { SatelliteScene } from './SatelliteScene';
import { CameraRig } from './CameraRig';

export interface ExperienceProps {
    model: ModelDef;
    focus: FocusId;
    wireframe: boolean;
    autoRotate: boolean;
    onPick: (id: FocusId) => void;
}

export function Experience(props: ExperienceProps) {
    // Remember where every press started so a drag that ends over empty space
    // is not mistaken for a "click blank to return to overview" gesture.
    useEffect(() => {
        const onDown = (e: PointerEvent) => recordPointerDown(e);
        window.addEventListener('pointerdown', onDown, true);
        return () => window.removeEventListener('pointerdown', onDown, true);
    }, []);

    return (
        <Canvas
            dpr={[1, 2]}
            camera={{ position: [86, 52, 104], fov: 42, near: 0.5, far: 3000 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            style={{ position: 'absolute', inset: 0 }}
            onPointerMissed={(e) => {
                if (wasDrag(e)) return;
                props.onPick(OVERVIEW);
            }}
        >
            <color attach="background" args={['#04060b']} />

            {/* Lighting rig: warm key (sun), cold fill, cyan rim. */}
            <ambientLight intensity={0.42} />
            <directionalLight position={[60, 50, 40]} intensity={2.6} color="#fff6e8" />
            <directionalLight position={[-70, -25, -55]} intensity={0.55} color="#4d8cff" />
            <directionalLight position={[-30, 35, -70]} intensity={0.4} color="#00f7ff" />

            <Stars radius={600} depth={80} count={4500} factor={6} saturation={0} fade speed={0.6} />

            <Suspense fallback={null}>
                <SceneContent {...props} />
            </Suspense>

            <OrbitControls
                makeDefault
                enablePan={false}
                enableDamping
                dampingFactor={0.06}
                rotateSpeed={0.55}
                zoomSpeed={0.8}
                minDistance={4}
                maxDistance={400}
            />

            <EffectComposer>
                <Bloom
                    intensity={0.75}
                    luminanceThreshold={0.72}
                    luminanceSmoothing={0.3}
                    mipmapBlur
                />
                <Vignette offset={0.22} darkness={0.82} />
            </EffectComposer>
        </Canvas>
    );
}

function SceneContent({ model, focus, wireframe, autoRotate, onPick }: ExperienceProps) {
    const { scene } = useGLTF(model.url, DRACO_DECODER_PATH);
    const analysis = useMemo(() => analyzeModel(scene, model), [scene, model]);
    const frame = useMemo(
        () => (analysis ? frameFor(analysis, model, focus) : null),
        [analysis, model, focus],
    );

    if (!analysis || !frame) return null;

    return (
        <>
            <SatelliteScene
                scene={scene}
                analysis={analysis}
                model={model}
                focus={focus}
                wireframe={wireframe}
                autoRotate={autoRotate}
                onPick={onPick}
            />
            <CameraRig frame={frame} />
        </>
    );
}
