import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { rand } from './rand';

/** Sparse slow-drifting motes (YoRHa: dusty industrial air, no stars). */
export function Dust({ accent }: { accent: string }) {
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
export function Aurora({ accent }: { accent: string }) {
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
