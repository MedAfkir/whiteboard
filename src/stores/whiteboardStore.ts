/**
 * Zustand store for whiteboard state management
 */

import { create } from 'zustand';
import type {
    AppState,
    WhiteboardElement,
    ToolType,
    ViewportTransform,
} from '../types/whiteboard.types';

interface WhiteboardStore extends AppState {
    // Viewport actions
    setZoom: (zoom: number) => void;
    setPan: (panX: number, panY: number) => void;
    resetViewport: () => void;

    // Element actions
    addElement: (element: WhiteboardElement) => void;
    updateElement: (id: string, updates: Partial<WhiteboardElement>) => void;
    deleteElement: (id: string) => void;
    deleteElements: (ids: string[]) => void;
    clearElements: () => void;

    // Selection actions
    selectElement: (id: string) => void;
    selectElements: (ids: string[]) => void;
    addToSelection: (id: string) => void;
    clearSelection: () => void;
    setHoveredElement: (id: string | null) => void;

    // Tool actions
    setActiveTool: (tool: ToolType) => void;
    setToolOptions: (options: Partial<AppState['toolOptions']>) => void;

    // Interaction state
    setIsDragging: (isDragging: boolean) => void;
    setIsDrawing: (isDrawing: boolean) => void;
    setIsPanning: (isPanning: boolean) => void;

    // Grid
    setGridEnabled: (enabled: boolean) => void;
    setGridSize: (size: number) => void;

    // Z-index management
    bringToFront: (id: string) => void;
    sendToBack: (id: string) => void;
    bringForward: (id: string) => void;
    sendBackward: (id: string) => void;
}

const DEFAULT_VIEWPORT: ViewportTransform = {
    zoom: 1,
    panX: 0,
    panY: 0,
};

const DEFAULT_TOOL_OPTIONS = {
    strokeColor: '#000000',
    fillColor: 'transparent',
    strokeWidth: 2,
    opacity: 1,
};

export const useWhiteboardStore = create<WhiteboardStore>((set) => ({
    // Initial state
    viewport: DEFAULT_VIEWPORT,
    elements: new Map(),
    elementOrder: [],
    activeTool: 'select',
    toolOptions: DEFAULT_TOOL_OPTIONS,
    selectedElementIds: new Set(),
    hoveredElementId: null,
    isDragging: false,
    isDrawing: false,
    isPanning: false,
    gridEnabled: false,
    gridSize: 15,
    canUndo: false,
    canRedo: false,

    // Viewport actions
    setZoom: (zoom: number) => {
        set((state) => ({
            viewport: {
                ...state.viewport,
                zoom: Math.max(0.1, Math.min(10, zoom)), // Clamp between 0.1x and 10x
            },
        }));
    },

    setPan: (panX: number, panY: number) => {
        set((state) => ({
            viewport: {
                ...state.viewport,
                panX,
                panY,
            },
        }));
    },

    resetViewport: () => {
        set({ viewport: DEFAULT_VIEWPORT });
    },

    // Element actions
    addElement: (element: WhiteboardElement) => {
        set((state) => {
            const newElements = new Map(state.elements);
            newElements.set(element.id, element);
            return {
                elements: newElements,
                elementOrder: [...state.elementOrder, element.id],
            };
        });
    },

    updateElement: (id: string, updates: Partial<WhiteboardElement>) => {
        set((state) => {
            const element = state.elements.get(id);
            if (!element) return state;

            const newElements = new Map(state.elements);
            newElements.set(id, { ...element, ...updates } as WhiteboardElement);
            return { elements: newElements };
        });
    },

    deleteElement: (id: string) => {
        set((state) => {
            const newElements = new Map(state.elements);
            newElements.delete(id);
            return {
                elements: newElements,
                elementOrder: state.elementOrder.filter((eid) => eid !== id),
                selectedElementIds: new Set(
                    Array.from(state.selectedElementIds).filter((eid) => eid !== id)
                ),
            };
        });
    },

    deleteElements: (ids: string[]) => {
        set((state) => {
            const newElements = new Map(state.elements);
            ids.forEach((id) => newElements.delete(id));

            const deletedSet = new Set(ids);
            return {
                elements: newElements,
                elementOrder: state.elementOrder.filter((id) => !deletedSet.has(id)),
                selectedElementIds: new Set(
                    Array.from(state.selectedElementIds).filter((id) => !deletedSet.has(id))
                ),
            };
        });
    },

    clearElements: () => {
        set({
            elements: new Map(),
            elementOrder: [],
            selectedElementIds: new Set(),
        });
    },

    // Selection actions
    selectElement: (id: string) => {
        set({ selectedElementIds: new Set([id]) });
    },

    selectElements: (ids: string[]) => {
        set({ selectedElementIds: new Set(ids) });
    },

    addToSelection: (id: string) => {
        set((state) => {
            const newSelection = new Set(state.selectedElementIds);
            newSelection.add(id);
            return { selectedElementIds: newSelection };
        });
    },

    clearSelection: () => {
        set({ selectedElementIds: new Set() });
    },

    setHoveredElement: (id: string | null) => {
        set({ hoveredElementId: id });
    },

    // Tool actions
    setActiveTool: (tool: ToolType) => {
        set({ activeTool: tool });
    },

    setToolOptions: (options: Partial<AppState['toolOptions']>) => {
        set((state) => ({
            toolOptions: { ...state.toolOptions, ...options },
        }));
    },

    // Interaction state
    setIsDragging: (isDragging: boolean) => {
        set({ isDragging });
    },

    setIsDrawing: (isDrawing: boolean) => {
        set({ isDrawing });
    },

    setIsPanning: (isPanning: boolean) => {
        set({ isPanning });
    },

    // Grid actions
    setGridEnabled: (enabled: boolean) => {
        set({ gridEnabled: enabled });
    },

    setGridSize: (size: number) => {
        set({ gridSize: Math.max(4, size) });
    },

    // Z-index management
    bringToFront: (id: string) => {
        set((state) => {
            const currentIndex = state.elementOrder.indexOf(id);
            if (currentIndex === -1 || currentIndex === state.elementOrder.length - 1) {
                return state;
            }

            const newOrder = state.elementOrder.filter((eid) => eid !== id);
            newOrder.push(id);

            return { elementOrder: newOrder };
        });
    },

    sendToBack: (id: string) => {
        set((state) => {
            const currentIndex = state.elementOrder.indexOf(id);
            if (currentIndex === -1 || currentIndex === 0) {
                return state;
            }

            const newOrder = state.elementOrder.filter((eid) => eid !== id);
            newOrder.unshift(id);

            return { elementOrder: newOrder };
        });
    },

    bringForward: (id: string) => {
        set((state) => {
            const currentIndex = state.elementOrder.indexOf(id);
            if (currentIndex === -1 || currentIndex === state.elementOrder.length - 1) {
                return state;
            }

            const newOrder = [...state.elementOrder];
            [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
                newOrder[currentIndex + 1],
                newOrder[currentIndex],
            ];

            return { elementOrder: newOrder };
        });
    },

    sendBackward: (id: string) => {
        set((state) => {
            const currentIndex = state.elementOrder.indexOf(id);
            if (currentIndex === -1 || currentIndex === 0) {
                return state;
            }

            const newOrder = [...state.elementOrder];
            [newOrder[currentIndex], newOrder[currentIndex - 1]] = [
                newOrder[currentIndex - 1],
                newOrder[currentIndex],
            ];

            return { elementOrder: newOrder };
        });
    },
}));
