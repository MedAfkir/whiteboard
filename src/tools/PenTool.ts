/**
 * Pen Tool - Draw freehand paths on the canvas
 */

import { screenToWorld } from '../lib/canvas-utils';
import { useWhiteboardStore } from '../stores/whiteboardStore';
import { createFreedraw } from '../utils/element-factory';

export class PenTool {
    private isDrawing: boolean = false;
    private points: [number, number][] = [];
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
        this.points = [[worldPoint.x, worldPoint.y]];

        const element = createFreedraw(
            this.points,
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
        if (!this.isDrawing || !this.previewElementId) return;

        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;

        const worldPoint = screenToWorld(screenX, screenY, viewport);

        // Add point to path
        this.points.push([worldPoint.x, worldPoint.y]);

        // Calculate bounding box
        const xs = this.points.map(p => p[0]);
        const ys = this.points.map(p => p[1]);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);

        const state = useWhiteboardStore.getState();
        state.updateElement(this.previewElementId, {
            points: this.points,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        });
    }

    public onPointerUp(
        _event: PointerEvent,
        _canvas: HTMLCanvasElement,
        _viewport: { zoom: number; panX: number; panY: number }
    ): void {
        if (!this.isDrawing) return;

        if (this.previewElementId && this.points.length < 2) {
            // Delete if path is too short
            const state = useWhiteboardStore.getState();
            state.deleteElement(this.previewElementId);
        }

        this.isDrawing = false;
        this.points = [];
        this.previewElementId = null;
    }

    public reset(): void {
        this.isDrawing = false;
        this.points = [];
        this.previewElementId = null;
    }
}

export const penTool = new PenTool();
