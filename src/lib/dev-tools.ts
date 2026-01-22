/**
 * Development utilities for testing the whiteboard
 */

import { useWhiteboardStore } from '../stores/whiteboardStore';
import {
    createRectangle,
    createEllipse,
    createLine,
    createArrow,
    createFreedraw,
    createText
} from '../utils/element-factory';

/**
 * Add sample shapes to the canvas for testing
 */
export function addSampleShapes(): void {
    const store = useWhiteboardStore.getState();

    // Create some rectangles
    const rect1 = createRectangle(100, 100, 150, 100, {
        strokeColor: '#1e40af',
        fillColor: '#3b82f6',
        strokeWidth: 2,
        opacity: 1,
    });

    const rect2 = createRectangle(300, 150, 120, 120, {
        strokeColor: '#7c2d12',
        fillColor: '#f97316',
        strokeWidth: 3,
        opacity: 0.8,
    });

    const rect3 = createRectangle(650, 100, 100, 150, {
        strokeColor: '#0f172a',
        fillColor: 'transparent',
        strokeWidth: 4,
        opacity: 1,
    });

    // Create some ellipses
    const ellipse1 = createEllipse(500, 200, 100, 80, {
        strokeColor: '#166534',
        fillColor: '#22c55e',
        strokeWidth: 2,
        opacity: 1,
    });

    const ellipse2 = createEllipse(200, 350, 140, 90, {
        strokeColor: '#831843',
        fillColor: '#ec4899',
        strokeWidth: 2,
        opacity: 0.7,
    });

    const ellipse3 = createEllipse(450, 350, 60, 60, {
        strokeColor: '#fbbf24',
        fillColor: '#fef3c7',
        strokeWidth: 3,
        opacity: 1,
    });

    // Create some lines
    const line1 = createLine(150, 500, 350, 550, {
        strokeColor: '#1e293b',
        strokeWidth: 3,
        opacity: 1,
    });

    const line2 = createLine(100, 600, 300, 600, {
        strokeColor: '#dc2626',
        strokeWidth: 5,
        opacity: 0.8,
    });

    // Create some arrows
    const arrow1 = createArrow(400, 500, 600, 480, {
        strokeColor: '#7c3aed',
        strokeWidth: 3,
        opacity: 1,
    }, 12);

    const arrow2 = createArrow(650, 400, 750, 500, {
        strokeColor: '#0891b2',
        strokeWidth: 4,
        opacity: 1,
    }, 15);

    const arrow3 = createArrow(500, 550, 650, 600, {
        strokeColor: '#059669',
        strokeWidth: 2,
        opacity: 0.9,
    }, 10);

    // Create text elements
    const text1 = createText(100, 50, 'Hello World!', 20, 'Arial, sans-serif', {
        strokeColor: '#1e293b',
        opacity: 1,
    });

    const text2 = createText(350, 300, 'Whiteboard Demo', 24, 'Arial, sans-serif', {
        strokeColor: '#7c3aed',
        opacity: 1,
    });

    const text3 = createText(550, 50, 'Click to Select', 18, 'Arial, sans-serif', {
        strokeColor: '#dc2626',
        opacity: 1,
    });

    // Create freedraw paths (simulated pen strokes)
    const freedraw1 = createFreedraw([
        [80, 250],
        [85, 255],
        [95, 265],
        [110, 275],
        [130, 280],
        [150, 282],
        [170, 280],
        [185, 275],
        [195, 268],
        [200, 260],
    ], {
        strokeColor: '#dc2626',
        strokeWidth: 3,
        opacity: 1,
    });

    const freedraw2 = createFreedraw([
        [600, 270],
        [605, 275],
        [615, 285],
        [625, 295],
        [635, 300],
        [645, 300],
        [655, 295],
        [665, 285],
        [675, 270],
        [680, 260],
        [682, 250],
    ], {
        strokeColor: '#16a34a',
        strokeWidth: 4,
        opacity: 1,
    });

    const freedraw3 = createFreedraw([
        [350, 600],
        [355, 595],
        [365, 590],
        [380, 588],
        [400, 590],
        [420, 595],
        [435, 605],
        [445, 615],
        [450, 625],
    ], {
        strokeColor: '#f59e0b',
        strokeWidth: 2,
        opacity: 0.9,
    });

    // Add all elements to store
    store.addElement(rect1);
    store.addElement(rect2);
    store.addElement(rect3);
    store.addElement(ellipse1);
    store.addElement(ellipse2);
    store.addElement(ellipse3);
    store.addElement(line1);
    store.addElement(line2);
    store.addElement(arrow1);
    store.addElement(arrow2);
    store.addElement(arrow3);
    store.addElement(text1);
    store.addElement(text2);
    store.addElement(text3);
    store.addElement(freedraw1);
    store.addElement(freedraw2);
    store.addElement(freedraw3);

    console.log('✅ Added 20 sample shapes to canvas!');
    console.log('   - 3 rectangles (filled, semi-transparent, outline)');
    console.log('   - 3 ellipses (various colors)');
    console.log('   - 2 lines');
    console.log('   - 3 arrows');
    console.log('   - 3 text elements');
    console.log('   - 3 freedraw paths (pen strokes)');
}

/**
 * Clear all elements from canvas
 */
export function clearCanvas(): void {
    const store = useWhiteboardStore.getState();
    store.clearElements();
}

/**
 * Add development controls to window for easy testing
 */
export function setupDevTools(): void {
    if (import.meta.env.DEV) {
        (window as any).__whiteboard = {
            addSampleShapes,
            clearCanvas,
            store: useWhiteboardStore,
            getState: () => useWhiteboardStore.getState(),
        };

        console.log(
            '%c🎨 Whiteboard Dev Tools Ready!',
            'color: #3b82f6; font-weight: bold; font-size: 16px; padding: 4px;'
        );
        console.log(
            '%cTo test the whiteboard, run:',
            'color: #059669; font-weight: bold; font-size: 14px;'
        );
        console.log(
            '%c  __whiteboard.addSampleShapes()',
            'color: #6366f1; font-size: 13px; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;'
        );
        console.log('');
        console.log('%cOther commands:', 'color: #6b7280; font-weight: bold;');
        console.log('  __whiteboard.clearCanvas() - Clear all shapes');
        console.log('  __whiteboard.getState() - Get current state');
        console.log('');
        console.log('%cKeyboard shortcuts:', 'color: #6b7280; font-weight: bold;');
        console.log('  Click - Select element');
        console.log('  Shift+Click - Multi-select');
        console.log('  Delete/Backspace - Delete selected');
        console.log('  Escape - Clear selection');
        console.log('  Ctrl+A - Select all');
    }
}
