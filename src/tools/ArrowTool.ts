/**
 * Arrow Tool - Draw arrows on the canvas
 */

import type { Point } from '../types/whiteboard.types';
import { screenToWorld } from '../lib/canvas-utils';
import { useWhiteboardStore } from '../stores/whiteboardStore';
import { createArrow } from '../utils/element-factory';

export class ArrowTool {
    private isDrawing: boolean = false;
    private startPoint: Point | null = null;
    private previewElementId: string | null = null;

    public onPointerDown(
        event: PointerEvent,
        canvas: HTMLCanvasElement,
        viewport: { zoom: number; panX: number; panY: number }
    ): void {
        // Don't draw while panning
        const state = useWhiteboardStore.getState();
        if (state.isPanning) return;

        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;

        const worldPoint = screenToWorld(screenX, screenY, viewport);

        this.isDrawing = true;
        this.startPoint = worldPoint;

        const element = createArrow(
            worldPoint.x,
            worldPoint.y,
            worldPoint.x,
            worldPoint.y,
            state.toolOptions
        );

        this.previewElementId = element.id;
        state.addElement(element);
    }

    public onPointerMove(
        event: PointerEvent,
        canvas: HTMLCanvasElement,
        viewport: { zoom: number; panX: number; panY: number }
    ): void {
        if (!this.isDrawing || !this.startPoint || !this.previewElementId) return;

        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;

        let worldPoint = screenToWorld(screenX, screenY, viewport);

        // Hold Shift for angle constraints (0°, 45°, 90°, etc.)
        if (event.shiftKey) {
            const dx = worldPoint.x - this.startPoint.x;
            const dy = worldPoint.y - this.startPoint.y;
            const angle = Math.atan2(dy, dx);
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Snap to 45-degree increments
            const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);

            worldPoint = {
                x: this.startPoint.x + Math.cos(snappedAngle) * distance,
                y: this.startPoint.y + Math.sin(snappedAngle) * distance,
            };
        }

        const state = useWhiteboardStore.getState();
        state.updateElement(this.previewElementId, {
            startX: this.startPoint.x,
            startY: this.startPoint.y,
            endX: worldPoint.x,
            endY: worldPoint.y,
            x: Math.min(this.startPoint.x, worldPoint.x),
            y: Math.min(this.startPoint.y, worldPoint.y),
            width: Math.abs(worldPoint.x - this.startPoint.x),
            height: Math.abs(worldPoint.y - this.startPoint.y),
        });
    }

    public onPointerUp(
        _event: PointerEvent,
        _canvas: HTMLCanvasElement,
        _viewport: { zoom: number; panX: number; panY: number }
    ): void {
        if (!this.isDrawing) return;

        if (this.previewElementId) {
            const state = useWhiteboardStore.getState();
            const element = state.elements.get(this.previewElementId);

            // Delete if arrow is too short
            if (element && element.type === 'arrow') {
                const dx = element.endX - element.startX;
                const dy = element.endY - element.startY;
                const length = Math.sqrt(dx * dx + dy * dy);

                if (length < 3) {
                    state.deleteElement(this.previewElementId);
                }
            }
        }

        this.isDrawing = false;
        this.startPoint = null;
        this.previewElementId = null;
    }

    public reset(): void {
        this.isDrawing = false;
        this.startPoint = null;
        this.previewElementId = null;
    }
}

export const arrowTool = new ArrowTool();
