/**
 * Serialization and deserialization utilities for whiteboard elements
 */

import type { WhiteboardElement, ElementStyle } from '../types/whiteboard.types';

// ============================================================================
// Serialization
// ============================================================================

/**
 * Serialize a single element to JSON-compatible object
 */
export function serializeElement(element: WhiteboardElement): Record<string, any> {
    return {
        id: element.id,
        type: element.type,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation,
        zIndex: element.zIndex,
        style: { ...element.style },
        locked: element.locked,
        isDeleted: element.isDeleted,
        // Type-specific properties
        ...('startX' in element && { startX: element.startX }),
        ...('startY' in element && { startY: element.startY }),
        ...('endX' in element && { endX: element.endX }),
        ...('endY' in element && { endY: element.endY }),
        ...('arrowHeadSize' in element && { arrowHeadSize: element.arrowHeadSize }),
        ...('points' in element && { points: element.points }),
        ...('pressures' in element && { pressures: element.pressures }),
        ...('text' in element && { text: element.text }),
        ...('fontSize' in element && { fontSize: element.fontSize }),
        ...('fontFamily' in element && { fontFamily: element.fontFamily }),
        ...('textAlign' in element && { textAlign: element.textAlign }),
        ...('verticalAlign' in element && { verticalAlign: element.verticalAlign }),
    };
}

/**
 * Serialize multiple elements to JSON string
 */
export function serializeElements(elements: WhiteboardElement[]): string {
    const serialized = elements.map(serializeElement);
    return JSON.stringify(serialized, null, 2);
}

/**
 * Serialize elements Map to JSON string
 */
export function serializeElementsMap(elementsMap: Map<string, WhiteboardElement>): string {
    const elements = Array.from(elementsMap.values());
    return serializeElements(elements);
}

// ============================================================================
// Deserialization
// ============================================================================

/**
 * Validate that an object has the required element properties
 */
function validateElement(obj: any): boolean {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'string' &&
        typeof obj.type === 'string' &&
        typeof obj.x === 'number' &&
        typeof obj.y === 'number' &&
        typeof obj.width === 'number' &&
        typeof obj.height === 'number' &&
        typeof obj.rotation === 'number' &&
        typeof obj.zIndex === 'number' &&
        typeof obj.style === 'object' &&
        typeof obj.locked === 'boolean' &&
        typeof obj.isDeleted === 'boolean'
    );
}

/**
 * Deserialize a single element from JSON object
 */
export function deserializeElement(data: any): WhiteboardElement | null {
    if (!validateElement(data)) {
        console.error('Invalid element data:', data);
        return null;
    }

    try {
        const baseElement = {
            id: data.id,
            type: data.type,
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height,
            rotation: data.rotation,
            zIndex: data.zIndex,
            style: data.style as ElementStyle,
            locked: data.locked,
            isDeleted: data.isDeleted,
        };

        // Add type-specific properties
        switch (data.type) {
            case 'line':
                return {
                    ...baseElement,
                    type: 'line',
                    startX: data.startX,
                    startY: data.startY,
                    endX: data.endX,
                    endY: data.endY,
                };

            case 'arrow':
                return {
                    ...baseElement,
                    type: 'arrow',
                    startX: data.startX,
                    startY: data.startY,
                    endX: data.endX,
                    endY: data.endY,
                    arrowHeadSize: data.arrowHeadSize ?? 10,
                };

            case 'freedraw':
                return {
                    ...baseElement,
                    type: 'freedraw',
                    points: data.points || [],
                    pressures: data.pressures,
                };

            case 'text':
                return {
                    ...baseElement,
                    type: 'text',
                    text: data.text || '',
                    fontSize: data.fontSize || 16,
                    fontFamily: data.fontFamily || 'Arial, sans-serif',
                    textAlign: data.textAlign || 'left',
                    verticalAlign: data.verticalAlign || 'top',
                };

            case 'rectangle':
                return {
                    ...baseElement,
                    type: 'rectangle',
                };

            case 'ellipse':
                return {
                    ...baseElement,
                    type: 'ellipse',
                };

            default:
                console.error('Unknown element type:', data.type);
                return null;
        }
    } catch (error) {
        console.error('Error deserializing element:', error);
        return null;
    }
}

/**
 * Deserialize multiple elements from JSON string
 */
export function deserializeElements(json: string): WhiteboardElement[] {
    try {
        const data = JSON.parse(json);

        if (!Array.isArray(data)) {
            console.error('Expected array of elements');
            return [];
        }

        return data
            .map(deserializeElement)
            .filter((el): el is WhiteboardElement => el !== null);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return [];
    }
}

/**
 * Deserialize elements into a Map
 */
export function deserializeElementsToMap(json: string): Map<string, WhiteboardElement> {
    const elements = deserializeElements(json);
    const map = new Map<string, WhiteboardElement>();

    for (const element of elements) {
        map.set(element.id, element);
    }

    return map;
}

// ============================================================================
// Clipboard Utilities
// ============================================================================

/**
 * Copy elements to clipboard
 */
export async function copyElementsToClipboard(elements: WhiteboardElement[]): Promise<boolean> {
    try {
        const json = serializeElements(elements);
        await navigator.clipboard.writeText(json);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Paste elements from clipboard
 */
export async function pasteElementsFromClipboard(): Promise<WhiteboardElement[]> {
    try {
        const text = await navigator.clipboard.readText();
        return deserializeElements(text);
    } catch (error) {
        console.error('Failed to paste from clipboard:', error);
        return [];
    }
}

// ============================================================================
// Local Storage Utilities
// ============================================================================

const STORAGE_KEY = 'whiteboard-elements';
const STORAGE_VERSION = 1;

interface StorageData {
    version: number;
    timestamp: number;
    elements: ReturnType<typeof serializeElement>[];
}

/**
 * Save elements to localStorage
 */
export function saveToLocalStorage(elements: WhiteboardElement[]): boolean {
    try {
        const data: StorageData = {
            version: STORAGE_VERSION,
            timestamp: Date.now(),
            elements: elements.map(serializeElement),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        return false;
    }
}

/**
 * Load elements from localStorage
 */
export function loadFromLocalStorage(): WhiteboardElement[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const data: StorageData = JSON.parse(stored);

        // Check version compatibility
        if (data.version !== STORAGE_VERSION) {
            console.warn('Storage version mismatch, clearing data');
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }

        return data.elements
            .map(deserializeElement)
            .filter((el): el is WhiteboardElement => el !== null);
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return [];
    }
}

/**
 * Clear localStorage
 */
export function clearLocalStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
}

// ============================================================================
// File Export/Import
// ============================================================================

/**
 * Export elements to downloadable JSON file
 */
export function exportToFile(elements: WhiteboardElement[], filename: string = 'whiteboard.json'): void {
    const json = serializeElements(elements);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}

/**
 * Import elements from JSON file
 */
export function importFromFile(): Promise<WhiteboardElement[]> {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) {
                reject(new Error('No file selected'));
                return;
            }

            try {
                const text = await file.text();
                const elements = deserializeElements(text);
                resolve(elements);
            } catch (error) {
                reject(error);
            }
        };

        input.click();
    });
}
