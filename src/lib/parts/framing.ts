import * as THREE from 'three';
import { OVERVIEW, type FocusId, type ModelDef } from '../fleet';
import type { Analysis } from './analysis';

export interface CameraFrame {
    position: THREE.Vector3;
    target: THREE.Vector3;
}

/** Compute where the camera should fly for a given focus state. */
export function frameFor(analysis: Analysis, model: ModelDef, focus: FocusId): CameraFrame {
    if (focus !== OVERVIEW) {
        const b = analysis.parts[focus];
        const def = model.parts.find((p) => p.id === focus);
        if (b && def) {
            const dir = new THREE.Vector3(...def.dir).normalize();
            const dist = Math.max(b.radius * 3.4, analysis.bounds.radius * 0.15);
            return {
                position: b.center.clone().addScaledVector(dir, dist),
                target: b.center.clone(),
            };
        }
    }
    const dir = new THREE.Vector3(0.85, 0.42, 1.1).normalize();
    const dist = analysis.bounds.radius * 2.7;
    return {
        position: analysis.bounds.center.clone().addScaledVector(dir, dist),
        target: analysis.bounds.center.clone(),
    };
}
