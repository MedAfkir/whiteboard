/**
 * PropertiesPanel Component - Left sidebar for editing selected element properties
 */

import {
    Lock,
    Unlock
} from 'lucide-react';
import { useWhiteboardStore } from '../../stores/whiteboardStore';
import type { ElementStyle } from '../../types/whiteboard.types';

interface PropertyControlProps {
    label: string;
    children: React.ReactNode;
}

function PropertyControl({ label, children }: PropertyControlProps) {
    return (
        <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            {children}
        </div>
    );
}

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    label: string;
}

function ColorPicker({ value, onChange, label }: ColorPickerProps) {
    return (
        <div className="relative group">
            <div className="flex items-center gap-2">
                <div
                    className="w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer overflow-hidden shadow-sm hover:border-gray-400 transition-colors"
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'color';
                        input.value = value;
                        input.onchange = (e) => onChange((e.target as HTMLInputElement).value);
                        input.click();
                    }}
                >
                    <div
                        className="w-full h-full"
                        style={{ backgroundColor: value }}
                    />
                </div>
                <span className="text-xs text-gray-500 font-mono">{value}</span>
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-50">
                {label}
            </div>
        </div>
    );
}

interface SelectProps {
    value: string | number;
    onChange: (value: string | number) => void;
    options: { value: string | number; label: string }[];
    label: string;
}

function Select({ value, onChange, options, label }: SelectProps) {
    return (
        <div className="relative group">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-8 px-2 rounded border border-gray-300 text-sm bg-white hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 appearance-none pr-8"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-400"></div>
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-50">
                {label}
            </div>
        </div>
    );
}

interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    label: string;
    showValue?: boolean;
}

function Slider({ value, onChange, min, max, step, label, showValue = true }: SliderProps) {
    return (
        <div className="relative group">
            <div className="flex items-center gap-2">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="flex-1 h-1 cursor-pointer accent-blue-500"
                />
                {showValue && (
                    <span className="text-xs text-gray-600 font-medium w-8 text-right">
                        {value}
                    </span>
                )}
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-50">
                {label}
            </div>
        </div>
    );
}

export function PropertiesPanel() {
    const selectedElementIds = useWhiteboardStore((state) => state.selectedElementIds);
    const elements = useWhiteboardStore((state) => state.elements);
    const updateElement = useWhiteboardStore((state) => state.updateElement);

    // Only show panel if elements are selected
    if (selectedElementIds.size === 0) {
        return null;
    }

    // Get the first selected element (for now, we handle single selection)
    const selectedId = Array.from(selectedElementIds)[0];
    const element = elements.get(selectedId);

    if (!element) {
        return null;
    }

    const updateStyle = (styleUpdates: Partial<ElementStyle>) => {
        updateElement(selectedId, {
            style: {
                ...element.style,
                ...styleUpdates
            }
        });
    };

    const toggleLock = () => {
        updateElement(selectedId, { locked: !element.locked });
    };

    return (
        <div className="fixed left-4 top-20 w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 p-4 z-30">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
                    <button
                        onClick={toggleLock}
                        className={`p-1.5 rounded-lg transition-colors ${element.locked
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                        title={element.locked ? 'Unlock element' : 'Lock element'}
                    >
                        {element.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                </div>

                {/* Element Type */}
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
                </div>

                {/* Stroke Color */}
                <PropertyControl label="Stroke">
                    <ColorPicker
                        value={element.style.strokeColor}
                        onChange={(color) => updateStyle({ strokeColor: color })}
                        label="Stroke Color"
                    />
                </PropertyControl>

                {/* Fill Color */}
                <PropertyControl label="Fill">
                    <ColorPicker
                        value={element.style.fillColor}
                        onChange={(color) => updateStyle({ fillColor: color })}
                        label="Fill Color"
                    />
                </PropertyControl>

                {/* Stroke Width */}
                <PropertyControl label="Stroke Width">
                    <Select
                        value={element.style.strokeWidth}
                        onChange={(value) => updateStyle({ strokeWidth: Number(value) })}
                        options={[
                            { value: 1, label: '1px' },
                            { value: 2, label: '2px' },
                            { value: 3, label: '3px' },
                            { value: 4, label: '4px' },
                            { value: 6, label: '6px' },
                            { value: 8, label: '8px' },
                            { value: 12, label: '12px' },
                            { value: 16, label: '16px' }
                        ]}
                        label="Stroke Width"
                    />
                </PropertyControl>

                {/* Opacity */}
                <PropertyControl label="Opacity">
                    <Slider
                        value={element.style.opacity}
                        onChange={(value) => updateStyle({ opacity: value })}
                        min={0}
                        max={1}
                        step={0.1}
                        label="Opacity"
                        showValue={false}
                    />
                    <span className="text-xs text-gray-600 font-medium ml-2">
                        {Math.round(element.style.opacity * 100)}%
                    </span>
                </PropertyControl>

                {/* Fill Style */}
                <PropertyControl label="Fill Style">
                    <Select
                        value={element.style.fillStyle || 'solid'}
                        onChange={(value) => updateStyle({ fillStyle: value as ElementStyle['fillStyle'] })}
                        options={[
                            { value: 'solid', label: 'Solid' },
                            { value: 'hachure', label: 'Hachure' },
                            { value: 'cross-hatch', label: 'Cross-hatch' },
                            { value: 'dots', label: 'Dots' }
                        ]}
                        label="Fill Style"
                    />
                </PropertyControl>

                {/* Roughness (Hand-drawn style) */}
                <PropertyControl label="Roughness">
                    <Slider
                        value={element.style.roughness || 1}
                        onChange={(value) => updateStyle({ roughness: value })}
                        min={0}
                        max={2}
                        step={0.1}
                        label="Hand-drawn Style (0 = smooth, 2 = rough)"
                        showValue={false}
                    />
                    <span className="text-xs text-gray-600 font-medium ml-2">
                        {(element.style.roughness || 1).toFixed(1)}
                    </span>
                </PropertyControl>

                {/* Element-specific properties */}
                {element.type === 'text' && (
                    <>
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Text Properties</h4>

                            <PropertyControl label="Font Size">
                                <Select
                                    value={element.fontSize}
                                    onChange={(value) => updateElement(selectedId, { fontSize: Number(value) })}
                                    options={[
                                        { value: 12, label: '12px' },
                                        { value: 14, label: '14px' },
                                        { value: 16, label: '16px' },
                                        { value: 18, label: '18px' },
                                        { value: 24, label: '24px' },
                                        { value: 32, label: '32px' },
                                        { value: 48, label: '48px' },
                                        { value: 64, label: '64px' }
                                    ]}
                                    label="Font Size"
                                />
                            </PropertyControl>

                            <PropertyControl label="Font Family">
                                <Select
                                    value={element.fontFamily}
                                    onChange={(value) => updateElement(selectedId, { fontFamily: String(value) })}
                                    options={[
                                        { value: 'Arial', label: 'Arial' },
                                        { value: 'Helvetica', label: 'Helvetica' },
                                        { value: 'Times New Roman', label: 'Times New Roman' },
                                        { value: 'Georgia', label: 'Georgia' },
                                        { value: 'Verdana', label: 'Verdana' },
                                        { value: 'Courier New', label: 'Courier New' }
                                    ]}
                                    label="Font Family"
                                />
                            </PropertyControl>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}