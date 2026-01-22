/**
 * Selection Tool - Handle element selection, multi-selection, and interaction
 */

import type { WhiteboardElement, Point } from '../types/whiteboard.types';
import { hitTestElement, getElementCenter } from '../utils/geometry';
import { screenToWorld, rotatePoint } from '../lib/canvas-utils';
import { useWhiteboardStore } from '../stores/whiteboardStore';

export interface SelectToolOptions {
    threshold?: number; // Hit detection threshold in pixels
}

type HandleType =
    | 'nw' | 'n' | 'ne'
    | 'e' | 'se' | 's'
    | 'sw' | 'w'
    | 'rotation'
    | null;

type TransformMode = 'move' | 'resize' | 'rotate' | 'drag-select' | null;

export class SelectTool {
    private threshold: number;
    private transformMode: TransformMode = null;
    private activeHandle: HandleType = null;
    private dragStartPoint: Point | null = null;
    private dragCurrentPoint: Point | null = null;
    private elementStartBounds: Map<string, { x: number; y: number; width: number; height: number; rotation: number }> = new Map();

    constructor(options: SelectToolOptions = {}) {
        this.threshold = options.threshold ?? 5;
    }

    /**
     * Find element at given world coordinates
     * Returns the topmost element that contains the point
     */
    public findElementAtPoint(
        point: Point,
        elements: Map<string, WhiteboardElement>,
        elementOrder: string[]
    ): WhiteboardElement | null {
        // Check elements in reverse order (top to bottom) for correct z-index handling
        for (let i = elementOrder.length - 1; i >= 0; i--) {
            const elementId = elementOrder[i];
            const element = elements.get(elementId);

            if (!element || element.isDeleted) continue;

            // Skip locked elements
            if (element.locked) continue;

            // Hit test
            if (hitTestElement(point, element, this.threshold)) {
                return element;
            }
        }

        return null;
    }

    /**
     * Get handle positions for an element (accounting for rotation)
     */
    private getHandlePositions(element: WhiteboardElement): Map<HandleType, Point> {
        const { x, y, width, height } = element;
        const handles = new Map<HandleType, Point>();

        // 8 resize handles
        handles.set('nw', { x, y });
        handles.set('n', { x: x + width / 2, y });
        handles.set('ne', { x: x + width, y });
        handles.set('e', { x: x + width, y: y + height / 2 });
        handles.set('se', { x: x + width, y: y + height });
        handles.set('s', { x: x + width / 2, y: y + height });
        handles.set('sw', { x, y: y + height });
        handles.set('w', { x, y: y + height / 2 });

        // Rotation handle (above top-center)
        handles.set('rotation', { x: x + width / 2, y: y - 30 });

        // If element is rotated, rotate handle coordinates around element center
        if (element.rotation && element.rotation !== 0) {
            const center = getElementCenter(element);
            for (const [handleType, pos] of Array.from(handles.entries())) {
                const rotated = rotatePoint(pos, center, element.rotation);
                handles.set(handleType, rotated);
            }
        }

        return handles;
    }

    /**
     * Find which handle (if any) is at the given point
     */
    private findHandleAtPoint(
        point: Point,
        element: WhiteboardElement,
        handleSize: number = 8
    ): HandleType {
        const handles = this.getHandlePositions(element);
        const threshold = handleSize + 2; // Slightly larger hit area

        for (const [handleType, handlePos] of handles) {
            const dx = point.x - handlePos.x;
            const dy = point.y - handlePos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= threshold) {
                return handleType;
            }
        }

        return null;
    }

    /**
     * Get cursor style for a handle type
     */
    private getCursorForHandle(handleType: HandleType, rotation: number = 0): string {
        if (!handleType) return 'default';

        // Rotation handle uses grab cursor
        if (handleType === 'rotation') {
            return 'grab';
        }

        // Base angles for each handle in degrees (canvas Y+ is down)
        const baseAngles: Record<string, number> = {
            'e': 0,
            'ne': -45,
            'n': -90,
            'nw': -135,
            'w': 180,
            'sw': 135,
            's': 90,
            'se': 45,
        };

        const base = baseAngles[handleType];
        if (base === undefined) return 'default';

        // Compute rotated angle (degrees)
        const deg = ((base + (rotation * 180) / Math.PI) % 180 + 180) % 180; // normalize to [0,180)

        // Snap to nearest 45deg step
        const snapped = Math.round(deg / 45) * 45 % 180;

        switch (snapped) {
            case 0:
                return 'ew-resize';
            case 45:
                return 'nwse-resize';
            case 90:
                return 'ns-resize';
            case 135:
                return 'nesw-resize';
            default:
                return 'default';
        }
    }

    /**
     * Find all elements intersecting with a rectangle
     */
    private findElementsIntersectingRect(
        rectStart: Point,
        rectEnd: Point,
        elements: Map<string, WhiteboardElement>,
        elementOrder: string[]
    ): string[] {
        const minX = Math.min(rectStart.x, rectEnd.x);
        const minY = Math.min(rectStart.y, rectEnd.y);
        const maxX = Math.max(rectStart.x, rectEnd.x);
        const maxY = Math.max(rectStart.y, rectEnd.y);

        const intersectingIds: string[] = [];

        for (const elementId of elementOrder) {
            const element = elements.get(elementId);
            if (!element || element.isDeleted || element.locked) continue;

            // Check if element bounding box intersects with selection rectangle
            const elemMinX = element.x;
            const elemMinY = element.y;
            const elemMaxX = element.x + element.width;
            const elemMaxY = element.y + element.height;

            // Check for intersection (not just containment)
            const intersects = !(
                elemMaxX < minX ||
                elemMinX > maxX ||
                elemMaxY < minY ||
                elemMinY > maxY
            );

            if (intersects) {
                intersectingIds.push(elementId);
            }
        }

        return intersectingIds;
    }

    /**
     * Handle pointer down event
     */
    public onPointerDown(
        event: PointerEvent,
        canvas: HTMLCanvasElement,
        viewport: { zoom: number; panX: number; panY: number }
    ): void {
        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;

        // Convert to world coordinates
        const worldPoint = screenToWorld(screenX, screenY, viewport);

        // Get store state
        const state = useWhiteboardStore.getState();
        const { elements, elementOrder, selectedElementIds } = state;

        // Check if clicking on a handle of a selected element
        if (selectedElementIds.size > 0) {
            // For now, only support single selection transforms
            if (selectedElementIds.size === 1) {
                const selectedId = Array.from(selectedElementIds)[0];
                const selectedElement = elements.get(selectedId);

                if (selectedElement) {
                    const handle = this.findHandleAtPoint(worldPoint, selectedElement);

                    if (handle) {
                        // Start transform operation
                        this.activeHandle = handle;
                        this.dragStartPoint = worldPoint;

                        if (handle === 'rotation') {
                            this.transformMode = 'rotate';
                        } else {
                            this.transformMode = 'resize';
                        }

                        // Store initial element state
                        this.elementStartBounds.set(selectedId, {
                            x: selectedElement.x,
                            y: selectedElement.y,
                            width: selectedElement.width,
                            height: selectedElement.height,
                            rotation: selectedElement.rotation || 0,
                        });

                        // Set appropriate cursor immediately
                        const cursor = this.getCursorForHandle(handle, selectedElement.rotation || 0);
                        canvas.style.cursor = cursor;

                        return;
                    }
                }
            }
        }

        // Find element at cursor
        const clickedElement = this.findElementAtPoint(worldPoint, elements, elementOrder);

        const isShiftPressed = event.shiftKey;

        if (clickedElement) {
            // Element clicked
            if (isShiftPressed) {
                // Multi-select: toggle element in selection
                if (selectedElementIds.has(clickedElement.id)) {
                    // Remove from selection
                    const newSelection = new Set(selectedElementIds);
                    newSelection.delete(clickedElement.id);
                    state.selectElements(Array.from(newSelection));
                } else {
                    // Add to selection
                    state.addToSelection(clickedElement.id);
                }
            } else {
                // Single select
                if (!selectedElementIds.has(clickedElement.id)) {
                    state.selectElement(clickedElement.id);
                }
            }

            // Start move operation
            this.transformMode = 'move';
            this.dragStartPoint = worldPoint;

            // Store initial positions of all selected elements
            selectedElementIds.forEach(id => {
                const element = elements.get(id);
                if (element) {
                    this.elementStartBounds.set(id, {
                        x: element.x,
                        y: element.y,
                        width: element.width,
                        height: element.height,
                        rotation: element.rotation || 0,
                    });
                }
            });
        } else {
            // Canvas clicked (no element)
            if (!isShiftPressed) {
                // Clear selection when clicking on empty canvas
                state.clearSelection();
            }

            // Start drag-to-select operation
            this.transformMode = 'drag-select';
            this.dragStartPoint = worldPoint;
            this.dragCurrentPoint = worldPoint;
            this.elementStartBounds.clear();
        }
    }

    /**
     * Handle pointer move event
     */
    public onPointerMove(
        event: PointerEvent,
        canvas: HTMLCanvasElement,
        viewport: { zoom: number; panX: number; panY: number }
    ): void {
        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;

        // Convert to world coordinates
        const worldPoint = screenToWorld(screenX, screenY, viewport);

        // Get store state
        const state = useWhiteboardStore.getState();
        const { elements, elementOrder, selectedElementIds } = state;

        // Handle active transform operations
        if (this.transformMode && this.dragStartPoint) {
            const dx = worldPoint.x - this.dragStartPoint.x;
            const dy = worldPoint.y - this.dragStartPoint.y;

            if (this.transformMode === 'move') {
                // Move all selected elements
                selectedElementIds.forEach(id => {
                    const startBounds = this.elementStartBounds.get(id);
                    if (startBounds) {
                        state.updateElement(id, {
                            x: startBounds.x + dx,
                            y: startBounds.y + dy,
                        });
                    }
                });
                canvas.style.cursor = 'move';
            } else if (this.transformMode === 'resize' && this.activeHandle) {
                // Resize single selected element
                const selectedId = Array.from(selectedElementIds)[0];
                const startBounds = this.elementStartBounds.get(selectedId);

                if (startBounds) {
                    this.performResize(selectedId, startBounds, dx, dy, this.activeHandle, event.shiftKey);
                }
                // Update cursor based on the element's rotation
                const element = state.elements.get(selectedId);
                canvas.style.cursor = this.getCursorForHandle(this.activeHandle, element?.rotation || 0);
            } else if (this.transformMode === 'rotate') {
                // Rotate single selected element
                const selectedId = Array.from(selectedElementIds)[0];
                const element = elements.get(selectedId);
                const startBounds = this.elementStartBounds.get(selectedId);

                if (element && startBounds) {
                    const center = getElementCenter(element);
                    const startAngle = Math.atan2(
                        this.dragStartPoint.y - center.y,
                        this.dragStartPoint.x - center.x
                    );
                    const currentAngle = Math.atan2(
                        worldPoint.y - center.y,
                        worldPoint.x - center.x
                    );
                    const deltaAngle = currentAngle - startAngle;

                    state.updateElement(selectedId, {
                        rotation: startBounds.rotation + deltaAngle,
                    });
                }
                canvas.style.cursor = 'grabbing';
            } else if (this.transformMode === 'drag-select') {
                // Update drag selection rectangle
                this.dragCurrentPoint = worldPoint;
                canvas.style.cursor = 'crosshair';
            }

            return;
        }

        // Update hover state and cursor
        let cursor = 'default';

        // Check if hovering over a handle of a selected element
        if (selectedElementIds.size === 1) {
            const selectedId = Array.from(selectedElementIds)[0];
            const selectedElement = elements.get(selectedId);

            if (selectedElement) {
                const handle = this.findHandleAtPoint(worldPoint, selectedElement);
                if (handle) {
                    cursor = this.getCursorForHandle(handle, selectedElement.rotation || 0);
                    state.setHoveredElement(selectedId);
                    canvas.style.cursor = cursor;
                    return;
                }
            }
        }

        // Check if hovering over an element
        const hoveredElement = this.findElementAtPoint(worldPoint, elements, elementOrder);
        state.setHoveredElement(hoveredElement?.id ?? null);

        if (hoveredElement) {
            cursor = 'move';
        }

        canvas.style.cursor = cursor;
    }

    /**
     * Perform resize operation based on handle and drag delta
     */
    private performResize(
        elementId: string,
        startBounds: { x: number; y: number; width: number; height: number },
        dx: number,
        dy: number,
        handle: HandleType,
        maintainAspectRatio: boolean
    ): void {
        const state = useWhiteboardStore.getState();
        let newX = startBounds.x;
        let newY = startBounds.y;
        let newWidth = startBounds.width;
        let newHeight = startBounds.height;

        // Calculate new dimensions based on handle
        switch (handle) {
            case 'nw':
                newX = startBounds.x + dx;
                newY = startBounds.y + dy;
                newWidth = startBounds.width - dx;
                newHeight = startBounds.height - dy;
                break;
            case 'n':
                newY = startBounds.y + dy;
                newHeight = startBounds.height - dy;
                break;
            case 'ne':
                newY = startBounds.y + dy;
                newWidth = startBounds.width + dx;
                newHeight = startBounds.height - dy;
                break;
            case 'e':
                newWidth = startBounds.width + dx;
                break;
            case 'se':
                newWidth = startBounds.width + dx;
                newHeight = startBounds.height + dy;
                break;
            case 's':
                newHeight = startBounds.height + dy;
                break;
            case 'sw':
                newX = startBounds.x + dx;
                newWidth = startBounds.width - dx;
                newHeight = startBounds.height + dy;
                break;
            case 'w':
                newX = startBounds.x + dx;
                newWidth = startBounds.width - dx;
                break;
        }

        // Maintain aspect ratio if Shift is pressed
        if (maintainAspectRatio) {
            const aspectRatio = startBounds.width / startBounds.height;

            // Use the dimension that changed more
            if (Math.abs(newWidth - startBounds.width) > Math.abs(newHeight - startBounds.height)) {
                newHeight = newWidth / aspectRatio;
                // Adjust Y position for top handles
                if (handle === 'nw' || handle === 'n' || handle === 'ne') {
                    newY = startBounds.y + startBounds.height - newHeight;
                }
            } else {
                newWidth = newHeight * aspectRatio;
                // Adjust X position for left handles
                if (handle === 'nw' || handle === 'w' || handle === 'sw') {
                    newX = startBounds.x + startBounds.width - newWidth;
                }
            }
        }

        // Prevent negative dimensions
        if (newWidth < 1) newWidth = 1;
        if (newHeight < 1) newHeight = 1;

        state.updateElement(elementId, {
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
        });
    }

    /**
     * Handle pointer up event
     */
    public onPointerUp(
        event: PointerEvent,
        canvas: HTMLCanvasElement,
        _viewport: { zoom: number; panX: number; panY: number }
    ): void {
        // Handle drag-select completion
        if (this.transformMode === 'drag-select' && this.dragStartPoint && this.dragCurrentPoint) {
            const state = useWhiteboardStore.getState();
            const { elements, elementOrder } = state;

            // Find all elements intersecting with the selection rectangle
            const intersectingIds = this.findElementsIntersectingRect(
                this.dragStartPoint,
                this.dragCurrentPoint,
                elements,
                elementOrder
            );

            // Update selection
            if (intersectingIds.length > 0) {
                if (event.shiftKey) {
                    // Add to existing selection
                    const newSelection = new Set(state.selectedElementIds);
                    intersectingIds.forEach(id => newSelection.add(id));
                    state.selectElements(Array.from(newSelection));
                } else {
                    // Replace selection
                    state.selectElements(intersectingIds);
                }
            }
        }

        // End transform operation
        this.transformMode = null;
        this.activeHandle = null;
        this.dragStartPoint = null;
        this.dragCurrentPoint = null;
        this.elementStartBounds.clear();

        // Reset cursor
        canvas.style.cursor = 'default';
    }

    /**
     * Handle key down event
     */
    public onKeyDown(event: KeyboardEvent): void {
        const state = useWhiteboardStore.getState();

        // Delete selected elements
        if (event.key === 'Delete' || event.key === 'Backspace') {
            const selectedIds = Array.from(state.selectedElementIds);
            if (selectedIds.length > 0) {
                state.deleteElements(selectedIds);
                event.preventDefault();
            }
        }

        // Escape to clear selection
        if (event.key === 'Escape') {
            state.clearSelection();
            event.preventDefault();
        }

        // Select all (Ctrl+A / Cmd+A)
        if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
            const allIds = state.elementOrder.filter(id => {
                const element = state.elements.get(id);
                return element && !element.isDeleted && !element.locked;
            });
            state.selectElements(allIds);
            event.preventDefault();
        }
    }

    /**
     * Reset tool state
     */
    public reset(): void {
        this.transformMode = null;
        this.activeHandle = null;
        this.dragStartPoint = null;
        this.dragCurrentPoint = null;
        this.elementStartBounds.clear();
    }

    /**
     * Check if currently performing a transform
     */
    public getIsTransforming(): boolean {
        return this.transformMode !== null;
    }

    /**
     * Get the current drag selection box (for rendering)
     * Returns null if not in drag-select mode
     */
    public getDragSelectionBox(): { x: number; y: number; width: number; height: number } | null {
        if (this.transformMode === 'drag-select' && this.dragStartPoint && this.dragCurrentPoint) {
            const minX = Math.min(this.dragStartPoint.x, this.dragCurrentPoint.x);
            const minY = Math.min(this.dragStartPoint.y, this.dragCurrentPoint.y);
            const maxX = Math.max(this.dragStartPoint.x, this.dragCurrentPoint.x);
            const maxY = Math.max(this.dragStartPoint.y, this.dragCurrentPoint.y);

            return {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY,
            };
        }
        return null;
    }
}

// Create singleton instance
export const selectTool = new SelectTool();
