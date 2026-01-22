/**
 * Ellipse Tool - Draw ellipses on the canvas
 */

import type { Point } from '../types/whiteboard.types';
import { screenToWorld } from '../lib/canvas-utils';
import { useWhiteboardStore } from '../stores/whiteboardStore';
import { createEllipse } from '../utils/element-factory';

export class EllipseTool {
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

        const element = createEllipse(
            worldPoint.x,
            worldPoint.y,
            0,
            0,
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

        const worldPoint = screenToWorld(screenX, screenY, viewport);

        let x = Math.min(this.startPoint.x, worldPoint.x);
        let y = Math.min(this.startPoint.y, worldPoint.y);
        let width = Math.abs(worldPoint.x - this.startPoint.x);
        let height = Math.abs(worldPoint.y - this.startPoint.y);

        // Hold Shift for circle
        if (event.shiftKey) {
            const size = Math.max(width, height);
            width = size;
            height = size;
        }

        // Hold Alt to draw from center
        if (event.altKey) {
            x = this.startPoint.x - width / 2;
            y = this.startPoint.y - height / 2;
        }

        const state = useWhiteboardStore.getState();
        state.updateElement(this.previewElementId, { x, y, width, height });
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

            if (element && (element.width < 3 || element.height < 3)) {
                state.deleteElement(this.previewElementId);
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

export const ellipseTool = new EllipseTool();
