import React from 'react';
import { Slider } from '@/components/ui/slider';

interface KeyAdjusterProps {
  semitones: number;
  onSemitonesChange: (semitones: number) => void;
}

const KeyAdjuster: React.FC<KeyAdjusterProps> = ({ semitones, onSemitonesChange }) => {
  const predefinedValues = [-12, -6, 0, 6, 12];
  
  const handleSliderChange = (value: number[]) => {
    onSemitonesChange(value[0]);
  };
  
  const handlePresetClick = (value: number) => {
    onSemitonesChange(value);
  };
  
  return (
    <div className="bg-zinc-800 rounded-xl shadow-sm p-6 mb-4">
      <h3 className="font-medium mb-5 text-center text-neutral-200">Change Key by Semitones</h3>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-neutral-400">-12</span>
          <span className="text-xs font-medium text-neutral-300">
            Current: <span className="text-primary">{semitones > 0 ? `+${semitones}` : semitones}</span>
          </span>
          <span className="text-xs text-neutral-400">+12</span>
        </div>
        <Slider
          value={[semitones]}
          min={-12}
          max={12}
          step={1}
          onValueChange={handleSliderChange}
          className="w-full"
        />
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {predefinedValues.map((value) => (
          <button 
            key={value}
            className={`text-center py-2 border rounded-lg text-sm transition-colors ${
              value === semitones 
                ? 'border-primary text-primary bg-primary/10' 
                : 'border-zinc-700 text-neutral-300 hover:bg-zinc-700'
            }`}
            onClick={() => handlePresetClick(value)}
          >
            {value > 0 ? `+${value}` : value}
          </button>
        ))}
      </div>
    </div>
  );
};

export default KeyAdjuster;
