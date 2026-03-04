import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { BlueprintMesh } from './BlueprintMesh';
import { SolarPanelArray } from './SolarPanelArray';
import * as THREE from 'three';

type FocusState = 'overview' | 'solarArrays' | 'commDish';

interface SatelliteProps {
    focusState: FocusState;
}

export function Satellite({ focusState }: SatelliteProps) {
    const solarGroupRef = useRef<Group>(null);
    const dishRef = useRef<Group>(null);

    // Reusable geometries optimized with useMemo
    const { busGeo, solarPanelGeo, connectorGeo, dishSupportGeo, dishMainGeo } = useMemo(() => {
        return {
            busGeo: new THREE.BoxGeometry(2, 2, 2),
            solarPanelGeo: new THREE.BoxGeometry(0.1, 4, 1.5),
            connectorGeo: new THREE.CylinderGeometry(0.1, 0.1, 1, 8),
            dishSupportGeo: new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8),
            dishMainGeo: new THREE.ConeGeometry(0.6, 0.5, 16, 1, true)
        };
    }, []);

    useFrame((state, delta) => {
        // Animation: Solar Arrays
        if (solarGroupRef.current) {
            if (focusState === 'solarArrays') {
                // Active rotation
                solarGroupRef.current.rotation.x += delta * 0.5;
            } else {
                // Return to neutral or slow idle
                solarGroupRef.current.rotation.x += delta * 0.05;
            }
        }

        // Animation: Comm Dish Pulse
        if (dishRef.current) {
            if (focusState === 'commDish') {
                // Subtle scanning motion
                dishRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.3;
            } else {
                dishRef.current.rotation.y = THREE.MathUtils.lerp(dishRef.current.rotation.y, 0, 0.1);
            }
        }
    });

    return (
        <group>
            {/* MAIN BUS */}
            <BlueprintMesh geometry={busGeo} focused={focusState === 'overview'} />

            {/* SOLAR ARRAYS GROUP */}
            <group ref={solarGroupRef}>
                {/* Left Wing */}
                <group position={[-1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <BlueprintMesh geometry={connectorGeo} position={[0, 0.5, 0]} />
                    <BlueprintMesh
                        geometry={solarPanelGeo}
                        position={[0, 2.5, 0]}
                        focused={focusState === 'solarArrays'}
                    >
                        <group position={[0, 0, 0.06]} rotation={[0, 0, 0]}>
                            <SolarPanelArray focused={focusState === 'solarArrays'} />
                        </group>
                        <group position={[0, 0, -0.06]} rotation={[0, Math.PI, 0]}>
                            <SolarPanelArray focused={focusState === 'solarArrays'} />
                        </group>
                    </BlueprintMesh>
                </group>

                {/* Right Wing */}
                <group position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                    <BlueprintMesh geometry={connectorGeo} position={[0, 0.5, 0]} />
                    <BlueprintMesh
                        geometry={solarPanelGeo}
                        position={[0, 2.5, 0]}
                        focused={focusState === 'solarArrays'}
                    >
                        <group position={[0, 0, 0.06]} rotation={[0, 0, 0]}>
                            <SolarPanelArray focused={focusState === 'solarArrays'} />
                        </group>
                        <group position={[0, 0, -0.06]} rotation={[0, Math.PI, 0]}>
                            <SolarPanelArray focused={focusState === 'solarArrays'} />
                        </group>
                    </BlueprintMesh>
                </group>
            </group>

            {/* COMM DISH */}
            <group position={[0, 1, 0]} ref={dishRef}>
                <BlueprintMesh geometry={dishSupportGeo} position={[0, 0.25, 0]} />
                <group position={[0, 0.5, 0]} rotation={[0, 0, 0]}>
                    {/* Dish points up initially */}
                    <BlueprintMesh
                        geometry={dishMainGeo}
                        rotation={[Math.PI, 0, 0]}
                        position={[0, 0.25, 0]}
                        focused={focusState === 'commDish'}
                    />
                </group>
            </group>
        </group>
    );
}
