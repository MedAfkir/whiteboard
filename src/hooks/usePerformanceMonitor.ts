/**
 * Performance monitoring hook - tracks FPS and render times
 */

import { useRef, useEffect, useState } from 'react';

interface PerformanceMetrics {
    fps: number;
    frameTime: number;
    renderCount: number;
    avgFrameTime: number;
}

interface UsePerformanceMonitorOptions {
    enabled?: boolean;
    sampleSize?: number; // Number of frames to average
}

export function usePerformanceMonitor(
    options: UsePerformanceMonitorOptions = {}
): PerformanceMetrics {
    const { enabled = true, sampleSize = 60 } = options;

    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        fps: 0,
        frameTime: 0,
        renderCount: 0,
        avgFrameTime: 0,
    });

    const frameTimesRef = useRef<number[]>([]);
    const lastFrameTimeRef = useRef<number>(performance.now());
    const renderCountRef = useRef<number>(0);
    const updateIntervalRef = useRef<number>(0);

    useEffect(() => {
        if (!enabled) return;

        let animationFrameId: number;

        const measureFrame = () => {
            const now = performance.now();
            const frameTime = now - lastFrameTimeRef.current;
            lastFrameTimeRef.current = now;

            // Record frame time
            frameTimesRef.current.push(frameTime);
            if (frameTimesRef.current.length > sampleSize) {
                frameTimesRef.current.shift();
            }

            renderCountRef.current++;

            // Update metrics every ~500ms
            if (now - updateIntervalRef.current > 500) {
                updateIntervalRef.current = now;

                // Calculate average frame time
                const avgFrameTime =
                    frameTimesRef.current.reduce((a, b) => a + b, 0) /
                    frameTimesRef.current.length;

                // Calculate FPS
                const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;

                setMetrics({
                    fps: Math.round(fps),
                    frameTime: Math.round(frameTime * 100) / 100,
                    renderCount: renderCountRef.current,
                    avgFrameTime: Math.round(avgFrameTime * 100) / 100,
                });
            }

            animationFrameId = requestAnimationFrame(measureFrame);
        };

        animationFrameId = requestAnimationFrame(measureFrame);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [enabled, sampleSize]);

    return metrics;
}

/**
 * Mark the start of a render operation
 */
export function markRenderStart(): number {
    return performance.now();
}

/**
 * Mark the end of a render operation and return duration
 */
export function markRenderEnd(startTime: number, label: string = 'render'): number {
    const duration = performance.now() - startTime;

    // Log slow renders in development
    if (import.meta.env.DEV && duration > 16.67) {
        console.warn(`[Performance] Slow ${label}: ${duration.toFixed(2)}ms (target: 16.67ms)`);
    }

    return duration;
}
