import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Solar Panel Array using InstancedMesh
// Renders a grid of cells on a panel surface
interface SolarPanelArrayProps {
    rows?: number;
    cols?: number;
    cellSize?: number;
    gap?: number;
    focused?: boolean;
}

export function SolarPanelArray({
    rows = 10,
    cols = 4,
    cellSize = 0.3,
    gap = 0.05,
    focused = false
}: SolarPanelArrayProps) {
    // Use 'Instances' from Drei which simplifies InstancedMesh management
    // We can animate color of instances if needed, or use a custom shader.
    // For 'Blueprint' look, we want simple glowing quads.

    const meshRef = useRef<THREE.InstancedMesh>(null);

    // Create data for positions
    const instancesData = useMemo(() => {
        const data = [];
        const width = cols * (cellSize + gap) - gap;
        const height = rows * (cellSize + gap) - gap;

        const startX = -width / 2 + cellSize / 2;
        const startY = -height / 2 + cellSize / 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                data.push({
                    position: [startX + c * (cellSize + gap), startY + r * (cellSize + gap), 0.05], // slightly raised
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                });
            }
        }
        return data;
    }, [rows, cols, cellSize, gap]);

    return (
        <Instances range={100} limit={rows * cols}>
            <planeGeometry args={[cellSize, cellSize]} />
            <meshBasicMaterial
                color={focused ? "#00f7ff" : "#005577"}
                side={THREE.DoubleSide}
                toneMapped={false}
            />

            {instancesData.map((data, i) => (
                <Instance
                    key={i}
                    position={data.position as [number, number, number]}
                />
            ))}
        </Instances>
    );
}
