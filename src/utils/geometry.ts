/**
 * Geometry utilities for element calculations and hit detection
 */

import type {
    WhiteboardElement,
    Point,
    Bounds,
    LineElement,
    ArrowElement,
    FreedrawElement,
} from '../types/whiteboard.types';

// ============================================================================
// Bounding Box Calculations
// ============================================================================

/**
 * Get the bounding box of an element
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
 * Get the center point of an element
 */
export function getElementCenter(element: WhiteboardElement): Point {
    return {
        x: element.x + element.width / 2,
        y: element.y + element.height / 2,
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
 * Update element bounds based on new position/size
 */
export function updateElementBounds(
    element: WhiteboardElement,
    bounds: Partial<Bounds>
): Partial<WhiteboardElement> {
    const updates: Partial<WhiteboardElement> = {};

    if (bounds.minX !== undefined && bounds.minY !== undefined) {
        updates.x = bounds.minX;
        updates.y = bounds.minY;
    }

    if (bounds.width !== undefined) {
        updates.width = bounds.width;
    }

    if (bounds.height !== undefined) {
        updates.height = bounds.height;
    }

    return updates;
}

// ============================================================================
// Hit Detection
// ============================================================================

/**
 * Check if a point is inside a bounding box
 */
export function isPointInBounds(point: Point, bounds: Bounds, padding: number = 0): boolean {
    return (
        point.x >= bounds.minX - padding &&
        point.x <= bounds.maxX + padding &&
        point.y >= bounds.minY - padding &&
        point.y <= bounds.maxY + padding
    );
}

/**
 * Check if a point is inside a rectangle (accounting for rotation)
 */
export function isPointInRectangle(
    point: Point,
    element: WhiteboardElement,
    padding: number = 0
): boolean {
    const { x, y, width, height, rotation } = element;

    // If no rotation, simple bounds check
    if (rotation === 0) {
        return (
            point.x >= x - padding &&
            point.x <= x + width + padding &&
            point.y >= y - padding &&
            point.y <= y + height + padding
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
        localX >= x - padding &&
        localX <= x + width + padding &&
        localY >= y - padding &&
        localY <= y + height + padding
    );
}

/**
 * Check if a point is inside an ellipse
 */
export function isPointInEllipse(
    point: Point,
    element: WhiteboardElement,
    padding: number = 0
): boolean {
    const { x, y, width, height } = element;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radiusX = width / 2 + padding;
    const radiusY = height / 2 + padding;

    const dx = point.x - centerX;
    const dy = point.y - centerY;

    return (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1;
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

/**
 * Check if a point is inside a freedraw path
 */
export function isPointInFreedrawPath(
    point: Point,
    element: FreedrawElement,
    threshold: number = 5
): boolean {
    const points = element.points;

    if (points.length < 2) return false;

    // Check if point is close to any segment of the path
    for (let i = 0; i < points.length - 1; i++) {
        const start = { x: points[i][0], y: points[i][1] };
        const end = { x: points[i + 1][0], y: points[i + 1][1] };

        if (isPointNearLine(point, start, end, threshold)) {
            return true;
        }
    }

    return false;
}

/**
 * Main hit detection function - checks if point is inside any element
 */
export function hitTestElement(
    point: Point,
    element: WhiteboardElement,
    threshold: number = 5
): boolean {
    // Quick bounds check first
    const bounds = getElementBounds(element);
    if (!isPointInBounds(point, bounds, threshold)) {
        return false;
    }

    // Type-specific hit detection
    switch (element.type) {
        case 'rectangle':
            return isPointInRectangle(point, element, threshold);

        case 'ellipse':
            return isPointInEllipse(point, element, threshold);

        case 'line':
            if ('startX' in element && 'startY' in element && 'endX' in element && 'endY' in element) {
                const lineEl = element as LineElement;
                return isPointNearLine(
                    point,
                    { x: lineEl.startX, y: lineEl.startY },
                    { x: lineEl.endX, y: lineEl.endY },
                    threshold
                );
            }
            return false;

        case 'arrow':
            if ('startX' in element && 'startY' in element && 'endX' in element && 'endY' in element) {
                const arrowEl = element as ArrowElement;
                return isPointNearLine(
                    point,
                    { x: arrowEl.startX, y: arrowEl.startY },
                    { x: arrowEl.endX, y: arrowEl.endY },
                    threshold
                );
            }
            return false;

        case 'freedraw':
            if ('points' in element) {
                return isPointInFreedrawPath(point, element as FreedrawElement, threshold);
            }
            return false;

        case 'text':
            return isPointInRectangle(point, element);

        default:
            return false;
    }
}

// ============================================================================
// Bounds Intersection
// ============================================================================

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
 * Check if element intersects with a selection box
 */
export function elementIntersectsBox(
    element: WhiteboardElement,
    selectionBox: Bounds
): boolean {
    const elementBounds = getElementBounds(element);
    return boundsIntersect(elementBounds, selectionBox);
}

// ============================================================================
// Distance & Angle Calculations
// ============================================================================

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
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
export function rotatePoint(point: Point, center: Point, angle: number): Point {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return {
        x: dx * cos - dy * sin + center.x,
        y: dx * sin + dy * cos + center.y,
    };
}

// ============================================================================
// Constraint Helpers
// ============================================================================

/**
 * Constrain dimensions to maintain aspect ratio
 */
export function constrainAspectRatio(
    width: number,
    height: number,
    originalWidth: number,
    originalHeight: number
): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    if (Math.abs(width / height - aspectRatio) > 0.01) {
        // Adjust based on which dimension changed more
        if (Math.abs(width - originalWidth) > Math.abs(height - originalHeight)) {
            height = width / aspectRatio;
        } else {
            width = height * aspectRatio;
        }
    }

    return { width, height };
}

/**
 * Snap angle to 45-degree increments
 */
export function snapAngle(angle: number, snapIncrement: number = Math.PI / 4): number {
    return Math.round(angle / snapIncrement) * snapIncrement;
}

/**
 * Snap point to grid
 */
export function snapToGrid(point: Point, gridSize: number): Point {
    return {
        x: Math.round(point.x / gridSize) * gridSize,
        y: Math.round(point.y / gridSize) * gridSize,
    };
}
