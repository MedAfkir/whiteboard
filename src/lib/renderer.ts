/**
 * Rendering functions for whiteboard elements
 * 
 * This module provides both standard and Rough.js (hand-drawn) rendering.
 * 
 * Standard rendering:
 *   - Use renderElement() for automatic rendering with decorations
 *   - Use individual render functions (renderRectangle, renderEllipse, etc.) for basic shapes
 * 
 * Rough.js rendering (hand-drawn style):
 *   - Set element.style.roughness > 0 to enable rough rendering
 *   - Use renderRectangleWithRough(), renderEllipseWithRough(), etc.
 *   - These functions automatically choose rough vs standard based on roughness value
 * 
 * Example:
 *   const element = createRectangle(0, 0, 100, 100, {
 *     strokeColor: '#000',
 *     fillColor: '#fff',
 *     roughness: 1.5  // Enable hand-drawn style
 *   });
 */

import rough from 'roughjs';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import type {
    WhiteboardElement,
    RectangleElement,
    EllipseElement,
    LineElement,
    ArrowElement,
    FreedrawElement,
    TextElement,
} from '../types/whiteboard.types';

// Rough.js instance (lazy initialized)
let roughCanvas: RoughCanvas | null = null;

/**
 * Get or initialize rough canvas instance
 */
function getRoughCanvas(canvas: HTMLCanvasElement): RoughCanvas {
    if (!roughCanvas) {
        roughCanvas = rough.canvas(canvas);
    }
    return roughCanvas;
}

// ============================================================================
// Core Rendering Functions
// ============================================================================

/**
 * Apply element style to canvas context
 */
function applyElementStyle(
    ctx: CanvasRenderingContext2D,
    element: WhiteboardElement
): void {
    const { style } = element;

    ctx.strokeStyle = style.strokeColor;
    ctx.fillStyle = style.fillColor;
    ctx.lineWidth = style.strokeWidth;
    ctx.globalAlpha = style.opacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

/**
 * Apply rotation transform for an element
 */
function applyRotation(
    ctx: CanvasRenderingContext2D,
    element: WhiteboardElement
): void {
    if (element.rotation !== 0) {
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(element.rotation);
        ctx.translate(-centerX, -centerY);
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Determine if an element should use rough (hand-drawn) rendering
 */
function shouldUseRough(element: WhiteboardElement): boolean {
    return (element.style.roughness ?? 0) > 0;
}

/**
 * Render a rectangle element
 */
export function renderRectangle(
    ctx: CanvasRenderingContext2D,
    element: RectangleElement
): void {
    const { x, y, width, height, style } = element;

    ctx.save();
    applyRotation(ctx, element);
    applyElementStyle(ctx, element);

    // Draw rectangle
    ctx.beginPath();
    ctx.rect(x, y, width, height);

    // Fill if not transparent
    if (style.fillColor !== 'transparent') {
        ctx.fill();
    }

    // Always stroke
    ctx.stroke();

    ctx.restore();
}

/**
 * Render an ellipse element
 */
export function renderEllipse(
    ctx: CanvasRenderingContext2D,
    element: EllipseElement
): void {
    const { x, y, width, height, style } = element;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radiusX = width / 2;
    const radiusY = height / 2;

    ctx.save();
    applyRotation(ctx, element);
    applyElementStyle(ctx, element);

    // Draw ellipse
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);

    // Fill if not transparent
    if (style.fillColor !== 'transparent') {
        ctx.fill();
    }

    // Always stroke
    ctx.stroke();

    ctx.restore();
}

/**
 * Render a line element
 */
export function renderLine(
    ctx: CanvasRenderingContext2D,
    element: LineElement
): void {
    const { startX, startY, endX, endY } = element;

    ctx.save();
    applyElementStyle(ctx, element);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.restore();
}

/**
 * Render an arrow element
 */
export function renderArrow(
    ctx: CanvasRenderingContext2D,
    element: ArrowElement
): void {
    const { startX, startY, endX, endY, arrowHeadSize = 10 } = element;

    ctx.save();
    applyElementStyle(ctx, element);

    // Draw main line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Calculate arrow angle
    const angle = Math.atan2(endY - startY, endX - startX);

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - arrowHeadSize * Math.cos(angle - Math.PI / 6),
        endY - arrowHeadSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - arrowHeadSize * Math.cos(angle + Math.PI / 6),
        endY - arrowHeadSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();

    ctx.restore();
}

/**
 * Render a freedraw element
 */
export function renderFreedraw(
    ctx: CanvasRenderingContext2D,
    element: FreedrawElement
): void {
    const { points } = element;

    if (points.length === 0) return;

    ctx.save();
    applyElementStyle(ctx, element);

    // Draw path through all points
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }

    ctx.stroke();
    ctx.restore();
}

/**
 * Render a text element
 */
export function renderText(
    ctx: CanvasRenderingContext2D,
    element: TextElement
): void {
    const { x, y, text, fontSize, fontFamily, textAlign, style } = element;

    if (!text) return;

    ctx.save();
    applyRotation(ctx, element);

    // Set text style
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'top';
    ctx.fillStyle = style.strokeColor; // Use stroke color for text
    ctx.globalAlpha = style.opacity;

    // Draw text
    ctx.fillText(text, x, y);

    ctx.restore();
}

// ============================================================================
// Rough.js Rendering Functions (Hand-drawn Style)
// ============================================================================

/**
 * Render rectangle with Rough.js
 */
function renderRectangleRough(
    canvas: HTMLCanvasElement,
    element: RectangleElement
): void {
    const { x, y, width, height, style } = element;
    const rc = getRoughCanvas(canvas);

    const options = {
        stroke: style.strokeColor,
        strokeWidth: style.strokeWidth,
        fill: style.fillColor !== 'transparent' ? style.fillColor : undefined,
        roughness: style.roughness ?? 1,
        fillStyle: (style.fillStyle as 'solid' | 'hachure' | 'cross-hatch' | 'dots') ?? 'hachure',
    };

    rc.rectangle(x, y, width, height, options);
}

/**
 * Render ellipse with Rough.js
 */
function renderEllipseRough(
    canvas: HTMLCanvasElement,
    element: EllipseElement
): void {
    const { x, y, width, height, style } = element;
    const rc = getRoughCanvas(canvas);

    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const options = {
        stroke: style.strokeColor,
        strokeWidth: style.strokeWidth,
        fill: style.fillColor !== 'transparent' ? style.fillColor : undefined,
        roughness: style.roughness ?? 1,
        fillStyle: (style.fillStyle as 'solid' | 'hachure' | 'cross-hatch' | 'dots') ?? 'hachure',
    };

    rc.ellipse(centerX, centerY, width, height, options);
}

/**
 * Render line with Rough.js
 */
function renderLineRough(
    canvas: HTMLCanvasElement,
    element: LineElement
): void {
    const { startX, startY, endX, endY, style } = element;
    const rc = getRoughCanvas(canvas);

    const options = {
        stroke: style.strokeColor,
        strokeWidth: style.strokeWidth,
        roughness: style.roughness ?? 1,
    };

    rc.line(startX, startY, endX, endY, options);
}

/**
 * Render arrow with Rough.js
 */
function renderArrowRough(
    canvas: HTMLCanvasElement,
    element: ArrowElement
): void {
    const { startX, startY, endX, endY, style } = element;
    const rc = getRoughCanvas(canvas);

    const options = {
        stroke: style.strokeColor,
        strokeWidth: style.strokeWidth,
        roughness: style.roughness ?? 1,
    };

    rc.line(startX, startY, endX, endY, options);
}

/**
 * Enhanced arrow renderer with rough support
 */
export function renderArrowWithRough(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    element: ArrowElement
): void {
    if (shouldUseRough(element)) {
        ctx.save();
        ctx.globalAlpha = element.style.opacity;
        renderArrowRough(canvas, element);
        ctx.restore();
    } else {
        renderArrow(ctx, element);
    }
}

/**
 * Enhanced rectangle renderer with rough support
 */
export function renderRectangleWithRough(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    element: RectangleElement
): void {
    if (shouldUseRough(element)) {
        ctx.save();
        applyRotation(ctx, element);
        ctx.globalAlpha = element.style.opacity;
        renderRectangleRough(canvas, element);
        ctx.restore();
    } else {
        renderRectangle(ctx, element);
    }
}

/**
 * Enhanced ellipse renderer with rough support
 */
export function renderEllipseWithRough(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    element: EllipseElement
): void {
    if (shouldUseRough(element)) {
        ctx.save();
        applyRotation(ctx, element);
        ctx.globalAlpha = element.style.opacity;
        renderEllipseRough(canvas, element);
        ctx.restore();
    } else {
        renderEllipse(ctx, element);
    }
}

/**
 * Enhanced line renderer with rough support
 */
export function renderLineWithRough(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    element: LineElement
): void {
    if (shouldUseRough(element)) {
        ctx.save();
        ctx.globalAlpha = element.style.opacity;
        renderLineRough(canvas, element);
        ctx.restore();
    } else {
        renderLine(ctx, element);
    }
}

// ============================================================================
// Selection & Decoration Rendering
// ============================================================================

/**
 * Render selection indicator around an element
 */
export function renderSelectionBox(
    ctx: CanvasRenderingContext2D,
    element: WhiteboardElement,
    color: string = '#3b82f6',
    lineWidth: number = 2
): void {
    const { x, y, width, height } = element;
    const padding = 4;

    ctx.save();
    applyRotation(ctx, element);

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash([5, 5]);

    ctx.strokeRect(
        x - padding,
        y - padding,
        width + padding * 2,
        height + padding * 2
    );

    ctx.setLineDash([]);
    ctx.restore();
}

/**
 * Render hover indicator around an element
 */
export function renderHoverBox(
    ctx: CanvasRenderingContext2D,
    element: WhiteboardElement
): void {
    renderSelectionBox(ctx, element, '#60a5fa', 1.5);
}

/**
 * Render resize handles around selected element
 */
export function renderResizeHandles(
    ctx: CanvasRenderingContext2D,
    element: WhiteboardElement,
    handleSize: number = 8
): void {
    const { x, y, width, height } = element;
    const half = handleSize / 2;

    ctx.save();
    applyRotation(ctx, element);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;

    // 8 resize handles (corners + midpoints)
    const handles = [
        [x, y], // Top-left
        [x + width / 2, y], // Top-center
        [x + width, y], // Top-right
        [x + width, y + height / 2], // Right-center
        [x + width, y + height], // Bottom-right
        [x + width / 2, y + height], // Bottom-center
        [x, y + height], // Bottom-left
        [x, y + height / 2], // Left-center
    ];

    handles.forEach(([hx, hy]) => {
        ctx.fillRect(hx - half, hy - half, handleSize, handleSize);
        ctx.strokeRect(hx - half, hy - half, handleSize, handleSize);
    });

    ctx.restore();
}

/**
 * Render rotation handle above selected element
 */
export function renderRotationHandle(
    ctx: CanvasRenderingContext2D,
    element: WhiteboardElement,
    handleSize: number = 10
): void {
    const { x, y, width } = element;
    const handleY = y - 30; // Position above element in local space
    const handleX = x + width / 2;

    ctx.save();
    // Rotate the context so the handle is positioned relative to the rotated element
    applyRotation(ctx, element);

    // Draw line from element to handle (coords are now in element-local, rotated space)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(handleX, y);
    ctx.lineTo(handleX, handleY);
    ctx.stroke();

    // Draw circular handle
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(handleX, handleY, handleSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

// ============================================================================
// Main Render Function
// ============================================================================

/**
 * Render a single element with all decorations
 */
export function renderElement(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    element: WhiteboardElement,
    options: {
        isSelected?: boolean;
        isHovered?: boolean;
        showHandles?: boolean;
    } = {}
): void {
    const { isSelected = false, isHovered = false, showHandles = false } = options;

    // Skip deleted elements
    if (element.isDeleted) return;

    // Render the element based on type
    switch (element.type) {
        case 'rectangle':
            renderRectangleWithRough(canvas, ctx, element as RectangleElement);
            break;
        case 'ellipse':
            renderEllipseWithRough(canvas, ctx, element as EllipseElement);
            break;
        case 'line':
            renderLineWithRough(canvas, ctx, element as LineElement);
            break;
        case 'arrow':
            renderArrowWithRough(canvas, ctx, element as ArrowElement);
            break;
        case 'freedraw':
            renderFreedraw(ctx, element as FreedrawElement);
            break;
        case 'text':
            renderText(ctx, element as TextElement);
            break;
    }

    // Render decorations
    if (isHovered && !isSelected) {
        renderHoverBox(ctx, element);
    }

    if (isSelected) {
        renderSelectionBox(ctx, element);

        if (showHandles) {
            renderResizeHandles(ctx, element);
            renderRotationHandle(ctx, element);
        }
    }
}

/**
 * Render multiple elements in order
 * @deprecated This function is deprecated. Use renderElement directly with canvas parameter.
 */
export function renderElements(
    ctx: CanvasRenderingContext2D,
    elements: WhiteboardElement[]
): void {
    // Render each element (basic rendering only, no selection/hover support)
    for (const element of elements) {
        // This is a simplified fallback - use renderElement with canvas for full features
        switch (element.type) {
            case 'rectangle':
                renderRectangle(ctx, element as RectangleElement);
                break;
            case 'ellipse':
                renderEllipse(ctx, element as EllipseElement);
                break;
            case 'line':
                renderLine(ctx, element as LineElement);
                break;
            case 'arrow':
                renderArrow(ctx, element as ArrowElement);
                break;
            case 'freedraw':
                renderFreedraw(ctx, element as FreedrawElement);
                break;
            case 'text':
                renderText(ctx, element as TextElement);
                break;
        }
    }
}

// ============================================================================
// Grid Rendering (Utility)
// ============================================================================

/**
 * Render grid on canvas
 */
export function renderGrid(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    width: number,
    height: number,
    gridSize: number = 20,
    color: string = '#e5e7eb'
): void {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    const endX = startX + width;
    const endY = startY + height;

    // Vertical lines
    for (let x = Math.floor(startX / gridSize) * gridSize; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = Math.floor(startY / gridSize) * gridSize; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }

    ctx.restore();
}

// ============================================================================
// Background Rendering
// ============================================================================

/**
 * Render canvas background
 */
export function renderBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    color: string = '#ffffff'
): void {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
}
