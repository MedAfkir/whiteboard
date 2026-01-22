/**
 * Text Tool - Add text elements to the canvas
 */

import type { Point } from '../types/whiteboard.types';
import { screenToWorld } from '../lib/canvas-utils';
import { useWhiteboardStore } from '../stores/whiteboardStore';
import { createText } from '../utils/element-factory';

export class TextTool {
    private clickedPoint: Point | null = null;

    public onPointerDown(
        event: PointerEvent,
        canvas: HTMLCanvasElement,
        viewport: { zoom: number; panX: number; panY: number }
    ): void {
        // Don't create text while panning
        const state = useWhiteboardStore.getState();
        if (state.isPanning) return;

        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;

        const worldPoint = screenToWorld(screenX, screenY, viewport);

        this.clickedPoint = worldPoint;
    }

    public onPointerMove(
        _event: PointerEvent,
        _canvas: HTMLCanvasElement,
        _viewport: { zoom: number; panX: number; panY: number }
    ): void {
        // Text tool doesn't need pointer move
    }

    public onPointerUp(
        event: PointerEvent,
        canvas: HTMLCanvasElement,
        viewport: { zoom: number; panX: number; panY: number }
    ): void {
        if (!this.clickedPoint) return;

        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;

        const worldPoint = screenToWorld(screenX, screenY, viewport);

        // Check if it was a click (not a drag)
        const dx = worldPoint.x - this.clickedPoint.x;
        const dy = worldPoint.y - this.clickedPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
            // Create text element
            const state = useWhiteboardStore.getState();
            const element = createText(
                this.clickedPoint.x,
                this.clickedPoint.y,
                'Text',
                16,
                'Arial, sans-serif',
                state.toolOptions
            );
            state.addElement(element);

            // TODO: In a future phase, open an inline text editor
            // For now, users can edit text properties via a panel
        }

        this.clickedPoint = null;
    }

    public reset(): void {
        this.clickedPoint = null;
    }
}

export const textTool = new TextTool();
