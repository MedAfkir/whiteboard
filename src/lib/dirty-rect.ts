/**
 * Dirty rectangle optimization for canvas rendering
 * Only redraws regions that have changed
 */

import type { WhiteboardElement } from '../types/whiteboard.types';
import { getElementBounds } from '../utils/geometry';

export interface DirtyRegion {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class DirtyRectManager {
    private dirtyRegions: DirtyRegion[] = [];
    private isDirty: boolean = false;
    private fullRedrawNeeded: boolean = true;

    /**
     * Mark an element as dirty (needs redraw)
     */
    markElementDirty(element: WhiteboardElement, padding: number = 10): void {
        const bounds = getElementBounds(element);
        this.markRegionDirty(
            bounds.minX - padding,
            bounds.minY - padding,
            bounds.maxX - bounds.minX + padding * 2,
            bounds.maxY - bounds.minY + padding * 2
        );
    }

    /**
     * Mark a specific region as dirty
     */
    markRegionDirty(x: number, y: number, width: number, height: number): void {
        this.dirtyRegions.push({ x, y, width, height });
        this.isDirty = true;
    }

    /**
     * Mark entire canvas for redraw
     */
    markFullRedraw(): void {
        this.fullRedrawNeeded = true;
        this.isDirty = true;
    }

    /**
     * Check if any redraw is needed
     */
    needsRedraw(): boolean {
        return this.isDirty || this.fullRedrawNeeded;
    }

    /**
     * Check if full redraw is needed
     */
    needsFullRedraw(): boolean {
        return this.fullRedrawNeeded;
    }

    /**
     * Get all dirty regions (merged/optimized)
     */
    getDirtyRegions(): DirtyRegion[] {
        if (this.fullRedrawNeeded) {
            return [];
        }

        // Merge overlapping regions for efficiency
        return this.mergeRegions(this.dirtyRegions);
    }

    /**
     * Check if an element intersects any dirty region
     */
    isElementInDirtyRegion(element: WhiteboardElement): boolean {
        if (this.fullRedrawNeeded) {
            return true;
        }

        const bounds = getElementBounds(element);

        return this.dirtyRegions.some(region =>
            this.boundsIntersect(
                bounds.minX,
                bounds.minY,
                bounds.maxX - bounds.minX,
                bounds.maxY - bounds.minY,
                region.x,
                region.y,
                region.width,
                region.height
            )
        );
    }

    /**
     * Clear all dirty regions
     */
    clear(): void {
        this.dirtyRegions = [];
        this.isDirty = false;
        this.fullRedrawNeeded = false;
    }

    /**
     * Merge overlapping dirty regions
     */
    private mergeRegions(regions: DirtyRegion[]): DirtyRegion[] {
        if (regions.length === 0) return [];
        if (regions.length === 1) return regions;

        // Simple merge: if we have many small regions, just do a full redraw
        if (regions.length > 10) {
            this.fullRedrawNeeded = true;
            return [];
        }

        const merged: DirtyRegion[] = [];
        const sorted = [...regions].sort((a, b) => a.x - b.x);

        let current = sorted[0];

        for (let i = 1; i < sorted.length; i++) {
            const next = sorted[i];

            if (this.regionsOverlap(current, next)) {
                // Merge regions
                const minX = Math.min(current.x, next.x);
                const minY = Math.min(current.y, next.y);
                const maxX = Math.max(current.x + current.width, next.x + next.width);
                const maxY = Math.max(current.y + current.height, next.y + next.height);

                current = {
                    x: minX,
                    y: minY,
                    width: maxX - minX,
                    height: maxY - minY,
                };
            } else {
                merged.push(current);
                current = next;
            }
        }

        merged.push(current);
        return merged;
    }

    /**
     * Check if two regions overlap
     */
    private regionsOverlap(a: DirtyRegion, b: DirtyRegion): boolean {
        return this.boundsIntersect(
            a.x, a.y, a.width, a.height,
            b.x, b.y, b.width, b.height
        );
    }

    /**
     * Check if two bounding boxes intersect
     */
    private boundsIntersect(
        x1: number, y1: number, w1: number, h1: number,
        x2: number, y2: number, w2: number, h2: number
    ): boolean {
        return !(
            x1 + w1 < x2 ||
            x2 + w2 < x1 ||
            y1 + h1 < y2 ||
            y2 + h2 < y1
        );
    }
}

/**
 * Hook for managing dirty rectangles in canvas rendering
 */
export function useDirtyRectManager(): DirtyRectManager {
    // Create a singleton instance that persists across renders
    const managerRef = { current: new DirtyRectManager() };
    return managerRef.current;
}
