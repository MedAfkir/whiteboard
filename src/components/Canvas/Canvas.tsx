/**
 * Main Canvas component - handles rendering and user interactions
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useWhiteboardStore } from '../../stores/whiteboardStore';
import {
    setupCanvas,
    applyViewportTransform,
    resetTransform,
    getViewportBounds,
    isElementVisible,
} from '../../lib/canvas-utils';
import { renderElement, renderGrid } from '../../lib/renderer';
import { useViewport } from './useViewport';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { FPSCounter } from './FPSCounter';
import { DirtyRectManager } from '../../lib/dirty-rect';
import { selectTool } from '../../tools/SelectTool';
import { rectangleTool } from '../../tools/RectangleTool';
import { ellipseTool } from '../../tools/EllipseTool';
import { lineTool } from '../../tools/LineTool';
import { arrowTool } from '../../tools/ArrowTool';
import { penTool } from '../../tools/PenTool';
import { textTool } from '../../tools/TextTool';

export function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>(0);
    const dirtyRectManager = useRef(new DirtyRectManager());

    // Performance monitoring (enabled in development)
    const [showFPS, setShowFPS] = useState(import.meta.env.DEV);
    const performanceMetrics = usePerformanceMonitor({
        enabled: showFPS,
        sampleSize: 60
    });

    // Get state from store
    const viewport = useWhiteboardStore((state) => state.viewport);
    const elements = useWhiteboardStore((state) => state.elements);
    const elementOrder = useWhiteboardStore((state) => state.elementOrder);
    const selectedElementIds = useWhiteboardStore((state) => state.selectedElementIds);
    const hoveredElementId = useWhiteboardStore((state) => state.hoveredElementId);
    const activeTool = useWhiteboardStore((state) => state.activeTool);
    const gridEnabled = useWhiteboardStore((state) => state.gridEnabled);
    const gridSize = useWhiteboardStore((state) => state.gridSize);

    // Set up viewport controls (pan and zoom)
    useViewport({ canvasRef });

    /**
     * Handle pointer down - delegate to active tool
     */
    const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        switch (activeTool) {
            case 'select':
                selectTool.onPointerDown(event.nativeEvent, canvas, viewport);
                break;
            case 'rectangle':
                rectangleTool.onPointerDown(event.nativeEvent, canvas, viewport);
                break;
            case 'ellipse':
                ellipseTool.onPointerDown(event.nativeEvent, canvas, viewport);
                break;
            case 'line':
                lineTool.onPointerDown(event.nativeEvent, canvas, viewport);
                break;
            case 'arrow':
                arrowTool.onPointerDown(event.nativeEvent, canvas, viewport);
                break;
            case 'pen':
                penTool.onPointerDown(event.nativeEvent, canvas, viewport);
                break;
            case 'text':
                textTool.onPointerDown(event.nativeEvent, canvas, viewport);
                break;
        }
    }, [activeTool, viewport]);

    /**
     * Handle pointer move - delegate to active tool
     */
    const handlePointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        switch (activeTool) {
            case 'select':
                selectTool.onPointerMove(event.nativeEvent, canvas, viewport);
                break;
            case 'rectangle':
                rectangleTool.onPointerMove(event.nativeEvent, canvas, viewport);
                break;
            case 'ellipse':
                ellipseTool.onPointerMove(event.nativeEvent, canvas, viewport);
                break;
            case 'line':
                lineTool.onPointerMove(event.nativeEvent, canvas, viewport);
                break;
            case 'arrow':
                arrowTool.onPointerMove(event.nativeEvent, canvas, viewport);
                break;
            case 'pen':
                penTool.onPointerMove(event.nativeEvent, canvas, viewport);
                break;
            case 'text':
                textTool.onPointerMove(event.nativeEvent, canvas, viewport);
                break;
        }
    }, [activeTool, viewport]);

    /**
     * Handle pointer up - delegate to active tool
     */
    const handlePointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        switch (activeTool) {
            case 'select':
                selectTool.onPointerUp(event.nativeEvent, canvas, viewport);
                break;
            case 'rectangle':
                rectangleTool.onPointerUp(event.nativeEvent, canvas, viewport);
                break;
            case 'ellipse':
                ellipseTool.onPointerUp(event.nativeEvent, canvas, viewport);
                break;
            case 'line':
                lineTool.onPointerUp(event.nativeEvent, canvas, viewport);
                break;
            case 'arrow':
                arrowTool.onPointerUp(event.nativeEvent, canvas, viewport);
                break;
            case 'pen':
                penTool.onPointerUp(event.nativeEvent, canvas, viewport);
                break;
            case 'text':
                textTool.onPointerUp(event.nativeEvent, canvas, viewport);
                break;
        }
    }, [activeTool, viewport]);

    /**
     * Handle keyboard events
     */
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (activeTool === 'select') {
                selectTool.onKeyDown(event);
            }
            // TODO: Handle other tools in future phases
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTool]);

    // Mark full redraw when viewport or selection changes
    useEffect(() => {
        dirtyRectManager.current.markFullRedraw();
    }, [viewport, selectedElementIds, hoveredElementId]);

    // Mark elements as dirty when they change
    useEffect(() => {
        // On any element change, mark full redraw for simplicity
        // In a more advanced system, track specific element changes
        dirtyRectManager.current.markFullRedraw();
    }, [elements, elementOrder]);

    /**
     * Main render function with dirty rectangle optimization
     */
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dirty = dirtyRectManager.current;

        // Skip render if nothing changed (optimization for static scenes)
        if (!dirty.needsRedraw()) {
            return;
        }

        const needsFullRedraw = dirty.needsFullRedraw();

        // Clear canvas
        resetTransform(ctx);
        const dpr = window.devicePixelRatio || 1;
        ctx.scale(dpr, dpr);

        if (needsFullRedraw) {
            // Full redraw
            ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        } else {
            // Clear only dirty regions
            const dirtyRegions = dirty.getDirtyRegions();
            dirtyRegions.forEach(region => {
                ctx.clearRect(region.x, region.y, region.width, region.height);
            });
        }

        // Draw background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        // Apply viewport transform
        ctx.save();
        applyViewportTransform(ctx, viewport);

        // Get viewport bounds for culling
        const viewportBounds = getViewportBounds(
            canvas.clientWidth,
            canvas.clientHeight,
            viewport
        );

        // Optionally render grid (in world coordinates)
        if (gridEnabled) {
            renderGrid(ctx, viewportBounds.minX, viewportBounds.minY, viewportBounds.width, viewportBounds.height, gridSize);
        }

        // Render elements in order (respecting z-index)
        let renderedCount = 0;
        for (const elementId of elementOrder) {
            const element = elements.get(elementId);
            if (!element || element.isDeleted) continue;

            // Viewport culling: skip elements outside view
            if (!isElementVisible(element, viewportBounds)) continue;

            // Dirty rectangle optimization: skip elements not in dirty regions
            if (!needsFullRedraw && !dirty.isElementInDirtyRegion(element)) {
                continue;
            }

            // Render element with decorations
            renderElement(ctx, canvas, element, {
                isSelected: selectedElementIds.has(element.id),
                isHovered: hoveredElementId === element.id,
                showHandles: selectedElementIds.has(element.id),
            });

            renderedCount++;
        }

        // Render drag selection box if active
        const dragSelectionBox = selectTool.getDragSelectionBox();
        if (dragSelectionBox) {
            ctx.strokeStyle = '#3b82f6';
            ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.fillRect(dragSelectionBox.x, dragSelectionBox.y, dragSelectionBox.width, dragSelectionBox.height);
            ctx.strokeRect(dragSelectionBox.x, dragSelectionBox.y, dragSelectionBox.width, dragSelectionBox.height);
            ctx.setLineDash([]);
        }

        ctx.restore();

        // Clear dirty state after render
        dirty.clear();

        // Log render stats in development
        if (import.meta.env.DEV) {
            if (renderedCount !== elementOrder.length) {
                // Only log when optimization kicked in
                // console.log(`Rendered ${renderedCount}/${elementOrder.length} elements`);
            }
        }
    }, [viewport, elements, elementOrder, selectedElementIds, hoveredElementId]);

    /**
     * Animation loop for continuous rendering
     */
    const animate = useCallback(() => {
        render();
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [render]);

    /**
     * Handle canvas resize
     */
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const { clientWidth, clientHeight } = container;
        setupCanvas(canvas, clientWidth, clientHeight);
        render();
    }, [render]);

    /**
     * Initialize canvas and start animation loop
     */
    useEffect(() => {
        handleResize();

        // Start animation loop
        animationFrameRef.current = requestAnimationFrame(animate);

        // Listen for window resize
        window.addEventListener('resize', handleResize);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [animate, handleResize]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden"
            style={{ touchAction: 'none' }}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            />

            {showFPS && (
                <FPSCounter
                    fps={performanceMetrics.fps}
                    frameTime={performanceMetrics.frameTime}
                    renderCount={performanceMetrics.renderCount}
                    avgFrameTime={performanceMetrics.avgFrameTime}
                />
            )}

            {import.meta.env.DEV && (
                <button
                    onClick={() => setShowFPS(!showFPS)}
                    className="fixed top-4 left-4 bg-black/80 text-white px-2 py-1 rounded text-xs font-mono hover:bg-black/90 z-50"
                    title="Toggle FPS Counter"
                >
                    FPS: {showFPS ? 'ON' : 'OFF'}
                </button>
            )}
        </div>
    );
}
