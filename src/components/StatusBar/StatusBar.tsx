/**
 * Status bar showing current tool and helpful hints
 */

import { useWhiteboardStore } from '../../stores/whiteboardStore';

const toolNames: Record<string, string> = {
    select: 'Select Tool',
    rectangle: 'Rectangle Tool',
    ellipse: 'Ellipse Tool',
    line: 'Line Tool',
    arrow: 'Arrow Tool',
    pen: 'Pen Tool',
    text: 'Text Tool',
};

const toolHints: Record<string, string> = {
    select: 'Click to select • Shift+Click for multi-select • Delete to remove',
    rectangle: 'Click and drag to draw • Hold Shift for square • Hold Alt for center',
    ellipse: 'Click and drag to draw • Hold Shift for circle • Hold Alt for center',
    line: 'Click and drag to draw • Hold Shift for straight angles',
    arrow: 'Click and drag to draw • Hold Shift for straight angles',
    pen: 'Click and drag to draw freehand',
    text: 'Click to add text',
};

export function StatusBar() {
    const activeTool = useWhiteboardStore((state) => state.activeTool);
    const selectedCount = useWhiteboardStore((state) => state.selectedElementIds.size);
    const elementCount = useWhiteboardStore((state) => state.elementOrder.length);

    return (
        <div className="fixed bottom-4 left-4 right-4 pointer-events-none z-30">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 px-4 py-2 
                max-w-2xl mx-auto pointer-events-auto">
                <div className="flex items-center justify-between gap-4 text-sm">
                    {/* Current Tool */}
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">
                            {toolNames[activeTool]}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 text-xs">
                            {toolHints[activeTool]}
                        </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        {selectedCount > 0 && (
                            <>
                                <span className="font-medium text-blue-600">
                                    {selectedCount} selected
                                </span>
                                <span className="text-gray-300">|</span>
                            </>
                        )}
                        <span>
                            {elementCount} {elementCount === 1 ? 'element' : 'elements'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
