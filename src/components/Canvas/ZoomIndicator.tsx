/**
 * Zoom indicator component - displays current zoom level
 */

import { useWhiteboardStore } from '../../stores/whiteboardStore';

export function ZoomIndicator() {
    const zoom = useWhiteboardStore((state) => state.viewport.zoom);
    const setZoom = useWhiteboardStore((state) => state.setZoom);
    const resetViewport = useWhiteboardStore((state) => state.resetViewport);

    const zoomPercentage = Math.round(zoom * 100);

    const handleZoomIn = () => {
        setZoom(Math.min(10, zoom * 1.2));
    };

    const handleZoomOut = () => {
        setZoom(Math.max(0.1, zoom / 1.2));
    };

    const handleReset = () => {
        resetViewport();
    };

    return (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-lg px-3 py-2 border border-gray-200">
            <button
                onClick={handleZoomOut}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                title="Zoom out"
                aria-label="Zoom out"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M3 8H13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </button>

            <button
                onClick={handleReset}
                className="min-w-[60px] h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors text-sm font-medium"
                title="Reset zoom (100%)"
                aria-label="Reset zoom"
            >
                {zoomPercentage}%
            </button>

            <button
                onClick={handleZoomIn}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                title="Zoom in"
                aria-label="Zoom in"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M8 3V13M3 8H13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </button>
        </div>
    );
}
