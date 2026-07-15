'use client';

import React from 'react';

interface ColorPickerProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  maxColors?: number;
}

export function ColorPicker({
  colors = [],
  onChange,
  maxColors = 5,
}: ColorPickerProps) {
  const addColor = () => {
    if (colors.length < maxColors) {
      onChange([...colors, '#8B5CF6']); // Default new color: violet
    }
  };

  const removeColor = (index: number) => {
    const updated = colors.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateColorValue = (index: number, value: string) => {
    const updated = [...colors];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
        Brand Colors (Max {maxColors})
      </label>
      <div className="flex flex-wrap gap-3 items-center mt-1">
        {colors.map((color, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 p-1 bg-white/5 border border-border-subtle rounded-lg group hover:border-white/20 transition-all duration-150"
          >
            <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/10">
              <input
                type="color"
                value={color}
                onChange={(e) => updateColorValue(index, e.target.value)}
                className="absolute inset-0 w-full h-full scale-150 cursor-pointer border-none bg-transparent p-0"
              />
            </div>
            <input
              type="text"
              value={color.toUpperCase()}
              onChange={(e) => updateColorValue(index, e.target.value)}
              placeholder="#FFFFFF"
              maxLength={7}
              className="w-16 bg-transparent border-none text-xs font-mono font-medium p-0 focus:ring-0 text-text-primary text-center outline-none"
            />
            <button
              type="button"
              onClick={() => removeColor(index)}
              className="text-text-muted hover:text-red-400 p-1 rounded-md transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {colors.length < maxColors && (
          <button
            type="button"
            onClick={addColor}
            className="w-10 h-10 rounded-lg border-2 border-dashed border-border-subtle hover:border-accent-purple/50 flex items-center justify-center text-text-secondary hover:text-accent-purple transition-all duration-150 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
