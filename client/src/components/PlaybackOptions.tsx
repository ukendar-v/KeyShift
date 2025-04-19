import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PlaybackOptionsProps {
  preserveTempo: boolean;
  onPreserveTempoChange: (value: boolean) => void;
  audioQuality: string;
  onAudioQualityChange: (value: string) => void;
}

const PlaybackOptions: React.FC<PlaybackOptionsProps> = ({
  preserveTempo,
  onPreserveTempoChange,
  audioQuality,
  onAudioQualityChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-medium mb-4">Playback Options</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="preserve-tempo" className="text-sm">Preserve Tempo</Label>
          <Switch
            id="preserve-tempo"
            checked={preserveTempo}
            onCheckedChange={onPreserveTempoChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="audio-quality" className="text-sm">Processing Quality</Label>
          <Select value={audioQuality} onValueChange={onAudioQualityChange}>
            <SelectTrigger className="w-36 h-9 bg-neutral-100 border-0" id="audio-quality">
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fast">Fast (Lower CPU)</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="high">High (Better Sound)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PlaybackOptions;
