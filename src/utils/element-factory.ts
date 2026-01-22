/**
 * Factory functions for creating whiteboard elements
 */

import { nanoid } from 'nanoid';
import type {
    WhiteboardElement,
    RectangleElement,
    EllipseElement,
    LineElement,
    ArrowElement,
    FreedrawElement,
    TextElement,
    ElementStyle,
} from '../types/whiteboard.types';

// Default style for new elements
const DEFAULT_STYLE: ElementStyle = {
    strokeColor: '#000000',
    fillColor: 'transparent',
    strokeWidth: 2,
    opacity: 1,
    roughness: 0,
    fillStyle: 'solid',
};

/**
 * Create a new rectangle element
 */
export function createRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    style: Partial<ElementStyle> = {}
): RectangleElement {
    return {
        id: nanoid(),
        type: 'rectangle',
        x,
        y,
        width,
        height,
        rotation: 0,
        zIndex: Date.now(), // Use timestamp for initial z-index
        style: { ...DEFAULT_STYLE, ...style },
        locked: false,
        isDeleted: false,
    };
}

/**
 * Create a new ellipse element
 */
export function createEllipse(
    x: number,
    y: number,
    width: number,
    height: number,
    style: Partial<ElementStyle> = {}
): EllipseElement {
    return {
        id: nanoid(),
        type: 'ellipse',
        x,
        y,
        width,
        height,
        rotation: 0,
        zIndex: Date.now(),
        style: { ...DEFAULT_STYLE, ...style },
        locked: false,
        isDeleted: false,
    };
}

/**
 * Create a new line element
 */
export function createLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    style: Partial<ElementStyle> = {}
): LineElement {
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    return {
        id: nanoid(),
        type: 'line',
        x,
        y,
        width,
        height,
        startX,
        startY,
        endX,
        endY,
        rotation: 0,
        zIndex: Date.now(),
        style: { ...DEFAULT_STYLE, ...style },
        locked: false,
        isDeleted: false,
    };
}

/**
 * Create a new arrow element
 */
export function createArrow(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    style: Partial<ElementStyle> = {},
    arrowHeadSize: number = 10
): ArrowElement {
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    return {
        id: nanoid(),
        type: 'arrow',
        x,
        y,
        width,
        height,
        startX,
        startY,
        endX,
        endY,
        arrowHeadSize,
        rotation: 0,
        zIndex: Date.now(),
        style: { ...DEFAULT_STYLE, ...style },
        locked: false,
        isDeleted: false,
    };
}

/**
 * Create a new freedraw element
 */
export function createFreedraw(
    points: [number, number][],
    style: Partial<ElementStyle> = {},
    pressures?: number[]
): FreedrawElement {
    // Calculate bounding box from points
    if (points.length === 0) {
        return {
            id: nanoid(),
            type: 'freedraw',
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            points: [],
            rotation: 0,
            zIndex: Date.now(),
            style: { ...DEFAULT_STYLE, ...style },
            locked: false,
            isDeleted: false,
        };
    }

    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    return {
        id: nanoid(),
        type: 'freedraw',
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        points,
        pressures,
        rotation: 0,
        zIndex: Date.now(),
        style: { ...DEFAULT_STYLE, ...style },
        locked: false,
        isDeleted: false,
    };
}

/**
 * Create a new text element
 */
export function createText(
    x: number,
    y: number,
    text: string = '',
    fontSize: number = 16,
    fontFamily: string = 'Arial, sans-serif',
    style: Partial<ElementStyle> = {}
): TextElement {
    // Estimate initial size (will be adjusted when text is added)
    const width = Math.max(100, text.length * fontSize * 0.6);
    const height = fontSize * 1.5;

    return {
        id: nanoid(),
        type: 'text',
        x,
        y,
        width,
        height,
        text,
        fontSize,
        fontFamily,
        textAlign: 'left',
        verticalAlign: 'top',
        rotation: 0,
        zIndex: Date.now(),
        style: { ...DEFAULT_STYLE, ...style },
        locked: false,
        isDeleted: false,
    };
}

/**
 * Duplicate an element with a new ID and offset position
 */
export function duplicateElement(
    element: WhiteboardElement,
    offsetX: number = 20,
    offsetY: number = 20
): WhiteboardElement {
    return {
        ...element,
        id: nanoid(),
        x: element.x + offsetX,
        y: element.y + offsetY,
        zIndex: Date.now(),
        isDeleted: false,
    };
}

/**
 * Create an element with custom style from current tool options
 */
export function createElementWithStyle(
    type: WhiteboardElement['type'],
    x: number,
    y: number,
    width: number,
    height: number,
    toolStyle: Partial<ElementStyle>
): WhiteboardElement {
    switch (type) {
        case 'rectangle':
            return createRectangle(x, y, width, height, toolStyle);
        case 'ellipse':
            return createEllipse(x, y, width, height, toolStyle);
        default:
            return createRectangle(x, y, width, height, toolStyle);
    }
}
