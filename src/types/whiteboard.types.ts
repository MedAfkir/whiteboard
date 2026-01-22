/**
 * Core type definitions for the whiteboard application
 */

// ============================================================================
// Tool Types
// ============================================================================

export type ToolType =
    | 'select'
    | 'rectangle'
    | 'ellipse'
    | 'line'
    | 'arrow'
    | 'pen'
    | 'text'
    | 'eraser';

// ============================================================================
// Element Types
// ============================================================================

export type ElementType =
    | 'rectangle'
    | 'ellipse'
    | 'line'
    | 'arrow'
    | 'freedraw'
    | 'text';

// ============================================================================
// Style Properties
// ============================================================================

export interface ElementStyle {
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
    opacity: number;
    roughness?: number; // For Rough.js hand-drawn style (0 = smooth, 2 = very rough)
    fillStyle?: 'solid' | 'hachure' | 'cross-hatch' | 'dots';
}

// ============================================================================
// Base Element Interface
// ============================================================================

export interface BaseElement {
    id: string;
    type: ElementType;
    x: number; // World coordinates
    y: number; // World coordinates
    width: number;
    height: number;
    rotation: number; // In radians
    zIndex: number;
    style: ElementStyle;
    locked: boolean;
    isDeleted: boolean; // Soft delete for collaboration
}

// ============================================================================
// Specific Element Types
// ============================================================================

export interface RectangleElement extends BaseElement {
    type: 'rectangle';
}

export interface EllipseElement extends BaseElement {
    type: 'ellipse';
}

export interface LineElement extends BaseElement {
    type: 'line';
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export interface ArrowElement extends BaseElement {
    type: 'arrow';
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    arrowHeadSize?: number;
}

export interface FreedrawElement extends BaseElement {
    type: 'freedraw';
    points: [number, number][]; // Array of [x, y] points
    pressures?: number[]; // Optional pressure sensitivity
}

export interface TextElement extends BaseElement {
    type: 'text';
    text: string;
    fontSize: number;
    fontFamily: string;
    textAlign: 'left' | 'center' | 'right';
    verticalAlign: 'top' | 'middle' | 'bottom';
}

// Union type of all element types
export type WhiteboardElement =
    | RectangleElement
    | EllipseElement
    | LineElement
    | ArrowElement
    | FreedrawElement
    | TextElement;

// ============================================================================
// Canvas Transformation Types
// ============================================================================

export interface ViewportTransform {
    zoom: number; // Scale factor (1 = 100%, 2 = 200%, 0.5 = 50%)
    panX: number; // Horizontal offset in pixels
    panY: number; // Vertical offset in pixels
}

export interface Point {
    x: number;
    y: number;
}

export interface Bounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
}

// ============================================================================
// Selection & Interaction Types
// ============================================================================

export type ResizeHandle =
    | 'nw' // North-west
    | 'n'  // North
    | 'ne' // North-east
    | 'e'  // East
    | 'se' // South-east
    | 's'  // South
    | 'sw' // South-west
    | 'w'  // West
    | 'rotation'; // Rotation handle

export interface Selection {
    elementIds: string[];
    bounds: Bounds | null;
    rotation: number;
}

// ============================================================================
// App State
// ============================================================================

export interface AppState {
    // Canvas state
    viewport: ViewportTransform;

    // Elements
    elements: Map<string, WhiteboardElement>;
    elementOrder: string[]; // Array of IDs in z-index order

    // Current tool
    activeTool: ToolType;
    toolOptions: {
        strokeColor: string;
        fillColor: string;
        strokeWidth: number;
        opacity: number;
    };

    // Selection
    selectedElementIds: Set<string>;
    hoveredElementId: string | null;

    // Interaction state
    isDragging: boolean;
    isDrawing: boolean;
    isPanning: boolean;

    // Grid
    gridEnabled: boolean;
    gridSize: number;

    // History
    canUndo: boolean;
    canRedo: boolean;
}

// ============================================================================
// History Types
// ============================================================================

export interface HistorySnapshot {
    elements: Map<string, WhiteboardElement>;
    elementOrder: string[];
    timestamp: number;
}

// ============================================================================
// Collaboration Types (for future use)
// ============================================================================

export interface User {
    id: string;
    name: string;
    color: string;
    cursorPosition: Point | null;
    selectedElementIds: string[];
}

// ============================================================================
// Rendering Types
// ============================================================================

export interface RenderContext {
    ctx: CanvasRenderingContext2D;
    viewport: ViewportTransform;
    dpr: number; // Device pixel ratio
    selectedIds: Set<string>;
    hoveredId: string | null;
}

export type RenderMode = 'normal' | 'draft' | 'export';
