import { Edges } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';

// Use a type alias instead of interface to extend ThreeElements['group']
type BlueprintMeshProps = ThreeElements['group'] & {
    geometry?: THREE.BufferGeometry;
    lineColor?: string;
    occlusionColor?: string;
    focused?: boolean;
};

export function BlueprintMesh({
    geometry,
    lineColor = '#00f7ff',
    occlusionColor = '#0a0a12', // Match background for "invisibility" cloak
    children,
    focused = false,
    ...props // pass remaining props (position, rotation, etc.) to the group
}: BlueprintMeshProps) {

    const edgesMaterialRef = useRef<THREE.LineBasicMaterial>(null);
    // Separate color object to tween or lerp
    const baseColor = new THREE.Color(lineColor);
    const activeColor = new THREE.Color('#ffffff'); // Flash white when focused

    useFrame((state, delta) => {
        if (edgesMaterialRef.current) {
            if (focused) {
                // Breathing animation: sine wave on opacity or brightness
                const t = (Math.sin(state.clock.elapsedTime * 4) + 1) / 2; // 0 to 1
                // Lerp color
                edgesMaterialRef.current.color.lerpColors(baseColor, activeColor, t * 0.5);
                edgesMaterialRef.current.opacity = 0.5 + t * 0.5; // Pulse opacity
                edgesMaterialRef.current.transparent = true;
            } else {
                // Return to base
                edgesMaterialRef.current.color.lerp(baseColor, delta * 2);
                edgesMaterialRef.current.opacity = THREE.MathUtils.lerp(edgesMaterialRef.current.opacity, 0.4, delta * 2);
            }
        }
    });

    return (
        <group {...props}>
            {/* Pass 1: The Occluder
          This mesh renders in black (or background color) to hide lines behind it.
          It writes to the depth buffer so sorting works correctly.
      */}
            <mesh geometry={geometry}>
                <meshBasicMaterial color={occlusionColor} polygonOffset polygonOffsetFactor={1} />
            </mesh>

            {/* Pass 2: The Wireframe / Edges
          This renders the glowing lines on top.
      */}
            <mesh geometry={geometry}>
                <meshBasicMaterial color={occlusionColor} visible={false} />
                <Edges
                    threshold={15} // Angle threshold to draw edges
                >
                    <lineBasicMaterial ref={edgesMaterialRef} color={lineColor} transparent opacity={0.4} toneMapped={false} />
                </Edges>
            </mesh>

            {children}
        </group>
    );
}
