/**
 * Custom hook for managing viewport controls (pan and zoom)
 */

import { useCallback, useEffect, useRef } from 'react';
import { useWhiteboardStore } from '../../stores/whiteboardStore';
import { screenToWorld } from '../../lib/canvas-utils';

interface UseViewportOptions {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function useViewport({ canvasRef }: UseViewportOptions) {
    const viewport = useWhiteboardStore((state) => state.viewport);
    const setZoom = useWhiteboardStore((state) => state.setZoom);
    const setPan = useWhiteboardStore((state) => state.setPan);
    const isPanning = useWhiteboardStore((state) => state.isPanning);
    const setIsPanning = useWhiteboardStore((state) => state.setIsPanning);
    const activeTool = useWhiteboardStore((state) => state.activeTool);

    const lastPanPosition = useRef<{ x: number; y: number } | null>(null);
    const isSpacePressed = useRef(false);

    /**
     * Handle mouse wheel zoom
     * Zooms towards the cursor position
     */
    const handleWheel = useCallback(
        (event: WheelEvent) => {
            event.preventDefault();

            const canvas = canvasRef.current;
            if (!canvas) return;

            // Get mouse position in screen coordinates
            const rect = canvas.getBoundingClientRect();
            const screenX = event.clientX - rect.left;
            const screenY = event.clientY - rect.top;

            // Get world position before zoom (where mouse is pointing in world space)
            const worldBeforeZoom = screenToWorld(screenX, screenY, viewport);

            // Calculate new zoom level
            const zoomDelta = -event.deltaY * 0.001;
            const newZoom = Math.max(0.1, Math.min(10, viewport.zoom * (1 + zoomDelta)));

            // Calculate new pan to keep mouse position fixed in world space
            // After zoom, the mouse should still point to the same world position
            const newPanX = screenX - worldBeforeZoom.x * newZoom;
            const newPanY = screenY - worldBeforeZoom.y * newZoom;

            setZoom(newZoom);
            setPan(newPanX, newPanY);
        },
        [canvasRef, viewport, setZoom, setPan]
    );

    /**
     * Handle pointer down - start panning
     */
    const handlePointerDown = useCallback(
        (event: PointerEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            // Pan with middle mouse button or spacebar + left click
            const shouldPan =
                event.button === 1 || // Middle mouse button
                (event.button === 0 && isSpacePressed.current); // Left click + spacebar

            if (shouldPan) {
                event.preventDefault();
                setIsPanning(true);
                lastPanPosition.current = { x: event.clientX, y: event.clientY };
                canvas.style.cursor = 'grabbing';
            }
        },
        [canvasRef, setIsPanning]
    );

    /**
     * Handle pointer move - pan the canvas
     */
    const handlePointerMove = useCallback(
        (event: PointerEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            // Update cursor when spacebar is pressed
            // Do not override cursor when the Select tool is active; SelectTool manages handle cursors.
            if (activeTool === 'select') {
                // Only update cursor for panning state when space is pressed or actively panning
                if (isSpacePressed.current && !isPanning) {
                    canvas.style.cursor = 'grab';
                }
            } else if (isSpacePressed.current && !isPanning) {
                canvas.style.cursor = 'grab';
            } else if (!isPanning) {
                canvas.style.cursor = 'crosshair';
            }

            if (isPanning && lastPanPosition.current) {
                const dx = event.clientX - lastPanPosition.current.x;
                const dy = event.clientY - lastPanPosition.current.y;

                setPan(viewport.panX + dx, viewport.panY + dy);

                lastPanPosition.current = { x: event.clientX, y: event.clientY };
            }
        },
        [canvasRef, isPanning, viewport, setPan]
    );

    /**
     * Handle pointer up - stop panning
     */
    const handlePointerUp = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (isPanning) {
            setIsPanning(false);
            lastPanPosition.current = null;
            if (activeTool === 'select') {
                // Let SelectTool or other handlers restore cursor; do not force default here.
            } else {
                canvas.style.cursor = isSpacePressed.current ? 'grab' : 'crosshair';
            }
        }
    }, [canvasRef, isPanning, setIsPanning]);

    /**
     * Handle keyboard events for spacebar panning
     */
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.code === 'Space' && !isSpacePressed.current) {
                event.preventDefault();
                isSpacePressed.current = true;
                const canvas = canvasRef.current;
                if (canvas && !isPanning) {
                    if (activeTool === 'select') {
                        // When using select tool, do not override cursor here; SelectTool handles it.
                    } else {
                        canvas.style.cursor = 'grab';
                    }
                }
            }
        },
        [canvasRef, isPanning]
    );

    const handleKeyUp = useCallback(
        (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault();
                isSpacePressed.current = false;
                const canvas = canvasRef.current;
                if (canvas && !isPanning) {
                    if (activeTool === 'select') {
                        // Let SelectTool manage cursor
                    } else {
                        canvas.style.cursor = 'crosshair';
                    }
                }
            }
        },
        [canvasRef, isPanning]
    );

    /**
     * Set up event listeners
     */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Wheel events (zoom)
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        // Pointer events (pan)
        canvas.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        // Keyboard events (spacebar for pan)
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [
        canvasRef,
        handleWheel,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleKeyDown,
        handleKeyUp,
    ]);

    return {
        viewport,
        isPanning,
    };
}
