import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';

type FocusState = 'overview' | 'solarArrays' | 'commDish';

interface CameraRigProps {
    focusState: FocusState;
}

export function CameraRig({ focusState }: CameraRigProps) {
    const { camera } = useThree();
    // Use a persistent ref for the "LookAt" target so we can tween it safely
    const targetRef = useRef(new THREE.Vector3(0, 0, 0));

    useEffect(() => {
        let destPos = new THREE.Vector3(8, 6, 8); // ISO-ish default
        let destTarget = new THREE.Vector3(0, 0, 0);

        if (focusState === 'solarArrays') {
            destPos.set(-6, 3, 6); // Pull back for wider shot
            destTarget.set(-1.5, 0, 0);
        } else if (focusState === 'commDish') {
            destPos.set(0, 4, 4); // Pull back and higher
            destTarget.set(0, 1.0, 0); // Keep focus on center
        } else {
            // overview
            destPos.set(8, 6, 8);
            destTarget.set(0, 0, 0);
        }

        // Animate Camera Position
        gsap.to(camera.position, {
            x: destPos.x,
            y: destPos.y,
            z: destPos.z,
            duration: 1.5,
            ease: 'power3.inOut'
        });

        // Animate LookAt Target
        gsap.to(targetRef.current, {
            x: destTarget.x,
            y: destTarget.y,
            z: destTarget.z,
            duration: 1.5,
            ease: 'power3.inOut',
            onUpdate: () => {
                camera.lookAt(targetRef.current);
            }
        });
    }, [focusState, camera]);

    return null;
}
