import {
    MousePointer2,
    Square,
    Circle,
    Minus,
    ArrowRight,
    Pen,
    Type
} from 'lucide-react';
import { useWhiteboardStore } from '../../stores/whiteboardStore';
import type { ToolType } from '../../types/whiteboard.types';

interface ToolButtonProps {
    tool: ToolType;
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
}

function ToolButton({ tool, icon, label, shortcut = 'A' }: ToolButtonProps) {
    const activeTool = useWhiteboardStore((state) => state.activeTool);
    const setActiveTool = useWhiteboardStore((state) => state.setActiveTool);

    const isActive = activeTool === tool;

    return (
        <button
            onClick={() => setActiveTool(tool)}
            className={`
                relative flex flex-col items-center justify-center gap-1
                w-16 h-14 rounded-lg
                transition-all duration-200
                ${isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
                group
            `}
            title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
        >
            <div className="w-5 h-5">{icon}</div>
            <span className="text-xs font-medium tracking-wide uppercase opacity-90" style={{ fontSize: '10px' }}>{label}</span>

            {/* Tooltip with keyboard shortcut */}
            {shortcut && (
                <div
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 
                    opacity-0 group-hover:opacity-100 transition-opacity delay-300 duration-200
                    bg-gray-950 text-white text-xs px-2 py-1.5 rounded-md
                    whitespace-nowrap pointer-events-none z-50 border border-gray-800"
                >
                    <div className="flex items-center gap-2">
                        <span>{label}</span>
                        <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700" style={{ fontSize: '10px' }}>{shortcut}</kbd>
                    </div>
                </div>
            )}
        </button>
    );
}

export function Toolbar() {
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-800/50 p-4">
                <div className="flex items-start gap-6">
                    {/* Tool Selection */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <ToolButton
                                tool="select"
                                icon={<MousePointer2 className="w-full h-full" />}
                                label="Select"
                                shortcut="V"
                            />
                            <ToolButton tool="rectangle" icon={<Square className="w-full h-full" />} label="Box" shortcut="R" />
                            <ToolButton tool="ellipse" icon={<Circle className="w-full h-full" />} label="Circle" shortcut="O" />
                            <ToolButton tool="line" icon={<Minus className="w-full h-full" />} label="Line" shortcut="L" />
                            <ToolButton tool="arrow" icon={<ArrowRight className="w-full h-full" />} label="Arrow" shortcut="A" />
                            <ToolButton tool="pen" icon={<Pen className="w-full h-full" />} label="Pen" shortcut="P" />
                            <ToolButton tool="text" icon={<Type className="w-full h-full" />} label="Text" shortcut="T" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
