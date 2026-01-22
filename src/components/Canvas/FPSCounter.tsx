/**
 * FPS Counter overlay component for development
 */

interface FPSCounterProps {
    fps: number;
    frameTime: number;
    renderCount: number;
    avgFrameTime: number;
}

export function FPSCounter({ fps, frameTime, renderCount, avgFrameTime }: FPSCounterProps) {
    // Color coding based on performance
    const getFpsColor = () => {
        if (fps >= 55) return 'text-green-500';
        if (fps >= 30) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="fixed top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono space-y-1 z-50 pointer-events-none select-none">
            <div className="flex items-center gap-2">
                <span className="text-gray-400">FPS:</span>
                <span className={`font-bold ${getFpsColor()}`}>{fps}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-gray-400">Frame:</span>
                <span className="text-white">{frameTime.toFixed(2)}ms</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-gray-400">Avg:</span>
                <span className="text-white">{avgFrameTime.toFixed(2)}ms</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-gray-400">Renders:</span>
                <span className="text-white">{renderCount}</span>
            </div>
        </div>
    );
}
