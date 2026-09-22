/**
 * Distinguishes a real click from the pointer-up at the end of an orbit drag.
 * A drag that ends over empty canvas would otherwise fire onPointerMissed and
 * yank the camera back to the overview.
 */

let downX = Number.NaN;
let downY = Number.NaN;

export function recordPointerDown(e: { clientX: number; clientY: number }): void {
    downX = e.clientX;
    downY = e.clientY;
}

export function wasDrag(
    e: { clientX?: number; clientY?: number },
    threshold = 6,
): boolean {
    if (Number.isNaN(downX)) return false;
    if (e.clientX === undefined || e.clientY === undefined) return false;
    return Math.hypot(e.clientX - downX, e.clientY - downY) > threshold;
}
