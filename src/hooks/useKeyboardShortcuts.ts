/**
 * Keyboard shortcuts hook for tool switching and common actions
 */

import { useEffect } from 'react';
import { useWhiteboardStore } from '../stores/whiteboardStore';
import type { ToolType } from '../types/whiteboard.types';

export function useKeyboardShortcuts() {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in input fields
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            const state = useWhiteboardStore.getState();
            const { setActiveTool } = state;

            // Tool switching shortcuts (no modifiers needed)
            const toolMap: Record<string, ToolType> = {
                'v': 'select',
                'r': 'rectangle',
                'o': 'ellipse',
                'l': 'line',
                'a': 'arrow',
                'p': 'pen',
                't': 'text',
            };

            const key = event.key.toLowerCase();

            // Check if it's a tool shortcut (and no modifiers except shift)
            if (key in toolMap && !event.ctrlKey && !event.metaKey && !event.altKey) {
                setActiveTool(toolMap[key]);
                event.preventDefault();
                return;
            }

            // Escape to switch back to select tool
            if (key === 'escape') {
                setActiveTool('select');
                event.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
}
