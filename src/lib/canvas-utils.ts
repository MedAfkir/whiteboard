/**
 * Canvas utility functions for coordinate transformations and geometry calculations
 */

import type { Point, Bounds, ViewportTransform, WhiteboardElement } from '../types/whiteboard.types';

// ============================================================================
// Coordinate Transformations
// ============================================================================

/**
 * Convert screen coordinates to world coordinates
 * Used when processing mouse/pointer events
 */
export function screenToWorld(
    screenX: number,
    screenY: number,
    viewport: ViewportTransform
): Point {
    return {
        x: (screenX - viewport.panX) / viewport.zoom,
        y: (screenY - viewport.panY) / viewport.zoom,
    };
}

/**
 * Convert world coordinates to screen coordinates
 * Used when rendering elements
 */
export function worldToScreen(
    worldX: number,
    worldY: number,
    viewport: ViewportTransform
): Point {
    return {
        x: worldX * viewport.zoom + viewport.panX,
        y: worldY * viewport.zoom + viewport.panY,
    };
}

/**
 * Apply viewport transform to canvas context
 * Call this before rendering elements
 */
export function applyViewportTransform(
    ctx: CanvasRenderingContext2D,
    viewport: ViewportTransform
): void {
    ctx.translate(viewport.panX, viewport.panY);
    ctx.scale(viewport.zoom, viewport.zoom);
}

/**
 * Reset canvas transform to identity
 */
export function resetTransform(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// ============================================================================
// Device Pixel Ratio (DPR) Handling
// ============================================================================

/**
 * Get the device pixel ratio for sharp rendering on high-DPI displays
 */
export function getDevicePixelRatio(): number {
    return window.devicePixelRatio || 1;
}

/**
 * Set up canvas for high-DPI rendering
 * Scales the canvas backing store while maintaining CSS size
 */
export function setupCanvas(
    canvas: HTMLCanvasElement,
    width: number,
    height: number
): CanvasRenderingContext2D | null {
    const dpr = getDevicePixelRatio();

    // Set canvas internal size (scaled for DPR)
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Set canvas display size (CSS pixels)
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Scale context to account for DPR
    ctx.scale(dpr, dpr);

    return ctx;
}

// ============================================================================
// Geometry Calculations
// ============================================================================

/**
 * Calculate the bounding box of an element
 */
export function getElementBounds(element: WhiteboardElement): Bounds {
    const { x, y, width, height } = element;

    return {
        minX: x,
        minY: y,
        maxX: x + width,
        maxY: y + height,
        width,
        height,
    };
}

/**
 * Calculate combined bounds for multiple elements
 */
export function getCombinedBounds(elements: WhiteboardElement[]): Bounds | null {
    if (elements.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const element of elements) {
        const bounds = getElementBounds(element);
        minX = Math.min(minX, bounds.minX);
        minY = Math.min(minY, bounds.minY);
        maxX = Math.max(maxX, bounds.maxX);
        maxY = Math.max(maxY, bounds.maxY);
    }

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

/**
 * Check if a point is inside a bounding box
 */
export function isPointInBounds(point: Point, bounds: Bounds): boolean {
    return (
        point.x >= bounds.minX &&
        point.x <= bounds.maxX &&
        point.y >= bounds.minY &&
        point.y <= bounds.maxY
    );
}

/**
 * Check if two bounding boxes intersect
 */
export function boundsIntersect(a: Bounds, b: Bounds): boolean {
    return !(
        a.maxX < b.minX ||
        a.minX > b.maxX ||
        a.maxY < b.minY ||
        a.minY > b.maxY
    );
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate distance from point to line segment
 */
export function distanceToLine(
    point: Point,
    lineStart: Point,
    lineEnd: Point
): number {
    const { x, y } = point;
    const { x: x1, y: y1 } = lineStart;
    const { x: x2, y: y2 } = lineEnd;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
        param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;

    return Math.sqrt(dx * dx + dy * dy);
}

// ============================================================================
// Hit Detection
// ============================================================================

/**
 * Check if a point is inside a rectangle (accounting for rotation)
 */
export function isPointInRectangle(
    point: Point,
    element: WhiteboardElement
): boolean {
    const { x, y, width, height, rotation } = element;

    // If no rotation, simple bounds check
    if (rotation === 0) {
        return (
            point.x >= x &&
            point.x <= x + width &&
            point.y >= y &&
            point.y <= y + height
        );
    }

    // With rotation, transform point to element's local space
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);

    const dx = point.x - centerX;
    const dy = point.y - centerY;

    const localX = dx * cos - dy * sin + centerX;
    const localY = dx * sin + dy * cos + centerY;

    return (
        localX >= x &&
        localX <= x + width &&
        localY >= y &&
        localY <= y + height
    );
}

/**
 * Check if a point is inside an ellipse
 */
export function isPointInEllipse(
    point: Point,
    element: WhiteboardElement
): boolean {
    const { x, y, width, height } = element;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radiusX = width / 2;
    const radiusY = height / 2;

    const dx = point.x - centerX;
    const dy = point.y - centerY;

    return (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1;
}

/**
 * Check if point is near a line (within threshold distance)
 */
export function isPointNearLine(
    point: Point,
    lineStart: Point,
    lineEnd: Point,
    threshold: number = 5
): boolean {
    return distanceToLine(point, lineStart, lineEnd) <= threshold;
}

// ============================================================================
// Viewport Utilities
// ============================================================================

/**
 * Calculate viewport bounds in world coordinates
 */
export function getViewportBounds(
    canvasWidth: number,
    canvasHeight: number,
    viewport: ViewportTransform
): Bounds {
    const topLeft = screenToWorld(0, 0, viewport);
    const bottomRight = screenToWorld(canvasWidth, canvasHeight, viewport);

    return {
        minX: topLeft.x,
        minY: topLeft.y,
        maxX: bottomRight.x,
        maxY: bottomRight.y,
        width: bottomRight.x - topLeft.x,
        height: bottomRight.y - topLeft.y,
    };
}

/**
 * Check if element is visible in viewport (viewport culling)
 */
export function isElementVisible(
    element: WhiteboardElement,
    viewportBounds: Bounds
): boolean {
    const elementBounds = getElementBounds(element);
    return boundsIntersect(elementBounds, viewportBounds);
}

// ============================================================================
// Math Utilities
// ============================================================================

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

/**
 * Calculate angle between two points in radians
 */
export function angleBetweenPoints(p1: Point, p2: Point): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Rotate a point around a center
 */
export function rotatePoint(
    point: Point,
    center: Point,
    angle: number
): Point {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return {
        x: dx * cos - dy * sin + center.x,
        y: dx * sin + dy * cos + center.y,
    };
}
