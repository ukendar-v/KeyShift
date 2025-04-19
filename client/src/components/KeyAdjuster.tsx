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
    <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
      <h3 className="font-medium mb-5 text-center">Change Key by Semitones</h3>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-neutral-500">-6</span>
          <span className="text-xs font-medium">
            Current: <span className="text-primary">{semitones > 0 ? `+${semitones}` : semitones}</span>
          </span>
          <span className="text-xs text-neutral-500">+6</span>
        </div>
        <Slider
          value={[semitones]}
          min={-6}
          max={6}
          step={1}
          onValueChange={handleSliderChange}
          className="w-full"
        />
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {predefinedValues.map((value) => (
          <button 
            key={value}
            className={`text-center py-2 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-100 transition-colors ${
              value === semitones ? 'font-medium text-primary' : ''
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
