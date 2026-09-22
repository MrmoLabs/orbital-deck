import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { BackdropKind, ThemeDef } from '../lib/themes';

/**
 * Per-theme scene backdrops. The terminal showcases the model + camera work,
 * so the background is not hardwired to a starfield: every theme gets a
 * gradient sky (sceneTop -> sceneDeep) plus its own backdrop layer
 * (starfield / floating dust / bare phosphor dark / aurora bokeh /
 * drafting grid / radar scope).
 */

/** Deterministic pseudo-random in [0,1) — keeps geometry builds pure/idempotent. */
function rand(i: number): number {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
}

/** Paint the theme's gradient sky into a texture (fullscreen background). */
function makeSkyTexture(theme: ThemeDef): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext('2d');
    if (ctx) {
        if (theme.sceneGrad === 'linear') {
            const g = ctx.createLinearGradient(0, 0, 0, c.height);
            g.addColorStop(0, theme.sceneTop);
            g.addColorStop(1, theme.sceneDeep);
            ctx.fillStyle = g;
        } else {
            const g = ctx.createRadialGradient(
                c.width * 0.5,
                c.height * 0.42,
                40,
                c.width * 0.5,
                c.height * 0.5,
                c.width * 0.62,
            );
            g.addColorStop(0, theme.sceneTop);
            g.addColorStop(1, theme.sceneDeep);
            ctx.fillStyle = g;
        }
        ctx.fillRect(0, 0, c.width, c.height);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

/** Applies the theme gradient as the WebGL scene background (replaces flat black). */
export function SceneBackground({ theme }: { theme: ThemeDef }) {
    const texture = useMemo(() => makeSkyTexture(theme), [theme]);

    // free the canvas texture when the theme swaps it out
    useEffect(() => {
        return () => {
            texture.dispose();
        };
    }, [texture]);

    // same attach mechanism as <color attach="background">, but with a texture
    return <primitive object={texture} attach="background" />;
}

/** Sparse slow-drifting motes (YoRHa: dusty industrial air, no stars). */
function Dust({ accent }: { accent: string }) {
    const ref = useRef<THREE.Points>(null);
    const geometry = useMemo(() => {
        const N = 900;
        const pos = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
            const r = 90 + rand(i * 4) * 330;
            const th = rand(i * 4 + 1) * Math.PI * 2;
            const ph = Math.acos(2 * rand(i * 4 + 2) - 1);
            pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
            pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6;
            pos[i * 3 + 2] = r * Math.cos(ph);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        return g;
    }, []);

    useFrame((_, dt) => {
        if (ref.current) ref.current.rotation.y += dt * 0.008;
    });

    return (
        <points ref={ref} geometry={geometry}>
            <pointsMaterial
                size={2.6}
                sizeAttenuation
                color={accent}
                transparent
                opacity={0.55}
                depthWrite={false}
            />
        </points>
    );
}

/** Big soft additive bokeh blobs (Glass: aurora depth, no pin-point stars). */
function Aurora({ accent }: { accent: string }) {
    const ref = useRef<THREE.Points>(null);
    const geometry = useMemo(() => {
        const N = 24;
        const pos = new Float32Array(N * 3);
        const col = new Float32Array(N * 3);
        const a = new THREE.Color(accent);
        const b = new THREE.Color('#b48aff');
        const c = new THREE.Color('#5ef0b5');
        for (let i = 0; i < N; i++) {
            pos[i * 3] = (rand(i * 3) - 0.5) * 900;
            pos[i * 3 + 1] = (rand(i * 3 + 1) - 0.5) * 460;
            pos[i * 3 + 2] = -150 - rand(i * 3 + 2) * 420;
            const col3 = a.clone().lerp(i % 2 === 0 ? b : c, i / N);
            col[i * 3] = col3.r;
            col[i * 3 + 1] = col3.g;
            col[i * 3 + 2] = col3.b;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        return g;
    }, [accent]);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime * 0.12;
        ref.current.position.y = Math.sin(t) * 16;
        ref.current.rotation.z = Math.sin(t * 0.4) * 0.04;
    });

    return (
        <points ref={ref} geometry={geometry}>
            <pointsMaterial
                vertexColors
                size={190}
                sizeAttenuation
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

/** Blueprint drafting grid: floor + back wall construction lines. */
function Draft({ accent }: { accent: string }) {
    const bright = useMemo(() => new THREE.Color(accent).multiplyScalar(1.2), [accent]);
    const faint = useMemo(() => new THREE.Color(accent).multiplyScalar(0.55), [accent]);
    return (
        <group>
            {/* floor grid just below the model */}
            <gridHelper args={[1400, 56, bright, faint]} position={[0, -110, 0]} />
            {/* back wall grid */}
            <group position={[0, 0, -430]}>
                <gridHelper args={[1400, 56, bright, faint]} rotation={[Math.PI / 2, 0, 0]} />
            </group>
        </group>
    );
}

/** Radar scope: horizontal range rings + faint grid + slow sweep spoke. */
function Radar({ accent }: { accent: string }) {
    const sweep = useRef<THREE.Group>(null);
    const faint = useMemo(() => new THREE.Color(accent).multiplyScalar(0.5), [accent]);
    const rings = [55, 105, 155, 205, 255, 305];

    useFrame((_, dt) => {
        if (sweep.current) sweep.current.rotation.y -= dt * 0.4;
    });

    return (
        <group position={[0, -95, 0]}>
            <gridHelper args={[700, 34, faint, faint.clone().multiplyScalar(0.6)]} />
            {rings.map((r) => (
                <mesh key={r} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[r, r + 0.9, 128]} />
                    <meshBasicMaterial
                        color={accent}
                        transparent
                        opacity={0.55}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
            {/* rotating sweep spoke (pivot at scope center) */}
            <group ref={sweep}>
                <mesh position={[153, 0, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[300, 3.5]} />
                    <meshBasicMaterial
                        color={accent}
                        transparent
                        opacity={0.6}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>
        </group>
    );
}

export function Backdrop({ kind, accent }: { kind: BackdropKind; accent: string }) {
    switch (kind) {
        case 'stars':
            return (
                <Stars
                    radius={600}
                    depth={80}
                    count={4500}
                    factor={6}
                    saturation={0}
                    fade
                    speed={0.6}
                />
            );
        case 'dust':
            return <Dust accent={accent} />;
        case 'aurora':
            return <Aurora accent={accent} />;
        case 'draft':
            return <Draft accent={accent} />;
        case 'radar':
            return <Radar accent={accent} />;
        case 'none':
        default:
            return null;
    }
}
