import { useEffect, useMemo, useState } from 'react';
import { metricsOf, type MetricDef, type ModelDef } from './fleet';

export type TelemetryValues = Record<string, number>;

const TICK_MS = 750;

function clampToMetric(v: number, m: MetricDef): number {
    const lo = m.base - m.spread * 3;
    const hi = m.base + m.spread * 3;
    return Math.min(hi, Math.max(lo, v));
}

/**
 * Simulated telemetry for the active model: every channel performs a random
 * walk biased back to its nominal value, which reads like live housekeeping
 * data. Channels that have not ticked yet fall back to their base value.
 */
export function useTelemetry(model: ModelDef): TelemetryValues {
    const metrics = useMemo(() => metricsOf(model), [model]);
    const [values, setValues] = useState<TelemetryValues>({});

    useEffect(() => {
        const id = window.setInterval(() => {
            setValues((prev) => {
                const next: TelemetryValues = { ...prev };
                for (const m of metrics) {
                    const cur = prev[m.key] ?? m.base;
                    const pull = (m.base - cur) * 0.1;
                    const noise = (Math.random() - 0.5) * m.spread;
                    next[m.key] = clampToMetric(cur + pull + noise, m);
                }
                return next;
            });
        }, TICK_MS);
        return () => window.clearInterval(id);
    }, [metrics]);

    return values;
}

/** Normalize a value into 0..100 over the metric's expected envelope. */
export function metricPercent(m: MetricDef, value: number): number {
    const lo = m.base - m.spread * 3;
    const hi = m.base + m.spread * 3;
    if (hi === lo) return 50;
    return Math.min(100, Math.max(0, ((value - lo) / (hi - lo)) * 100));
}
