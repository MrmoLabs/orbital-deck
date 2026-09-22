import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import type { CameraFrame } from '../lib/parts';

interface ControlsLike {
    target: THREE.Vector3;
    update: () => void;
}

interface CameraRigProps {
    frame: CameraFrame;
}

/**
 * Cinematic camera choreography: GSAP flies the camera to the framing of the
 * currently focused subsystem while OrbitControls keeps following its target.
 *
 * Skips the tween entirely when the camera already sits on the requested
 * frame — remounts of the controls (or re-renders with an identical frame)
 * must never yank a manually orbited camera back anywhere.
 */
export function CameraRig({ frame }: CameraRigProps) {
    const camera = useThree((s) => s.camera);
    const controls = useThree((s) => s.controls) as unknown as ControlsLike | null;
    const targetRef = useRef(new THREE.Vector3());
    const lastRef = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);

    useEffect(() => {
        const last = lastRef.current;
        const frameUnchanged =
            last !== null &&
            last.pos.distanceToSquared(frame.position) < 1e-6 &&
            last.target.distanceToSquared(frame.target) < 1e-6;
        const alreadyThere =
            camera.position.distanceToSquared(frame.position) < 0.25 &&
            (!controls || controls.target.distanceToSquared(frame.target) < 0.25);
        if (frameUnchanged && alreadyThere) return;

        lastRef.current = { pos: frame.position.clone(), target: frame.target.clone() };

        const target = targetRef.current;
        if (controls) target.copy(controls.target);

        gsap.killTweensOf(camera.position);
        gsap.killTweensOf(target);

        gsap.to(camera.position, {
            x: frame.position.x,
            y: frame.position.y,
            z: frame.position.z,
            duration: 1.6,
            ease: 'power3.inOut',
        });

        gsap.to(target, {
            x: frame.target.x,
            y: frame.target.y,
            z: frame.target.z,
            duration: 1.6,
            ease: 'power3.inOut',
            onUpdate: () => {
                if (controls) controls.target.copy(target);
            },
        });

        return () => {
            gsap.killTweensOf(camera.position);
            gsap.killTweensOf(target);
        };
    }, [frame, camera, controls]);

    return null;
}
