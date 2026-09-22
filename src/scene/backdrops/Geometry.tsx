import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Blueprint drafting grid: floor + back wall construction lines. */
export function Draft({ accent }: { accent: string }) {
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
export function Radar({ accent }: { accent: string }) {
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
