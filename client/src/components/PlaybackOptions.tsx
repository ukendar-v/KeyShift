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
    <div className="bg-zinc-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-neutral-200">Playback Options</h3>
        <a 
          href="#" 
          className="flex items-center text-primary hover:text-primary/90 text-sm font-medium"
          onClick={(e) => {
            e.preventDefault();
            if (!audioQuality) return;
            
            // We need to get the processed audio data from the audio context
            // For now, this is a placeholder. In a real implementation, 
            // we would get the processed audio buffer and convert it to an MP3
            alert("Download feature will be implemented in the next version");
            // const downloadLink = document.createElement('a');
            // downloadLink.href = window.URL.createObjectURL(new Blob());
            // downloadLink.download = 'processed-audio.mp3';
            // document.body.appendChild(downloadLink);
            // downloadLink.click();
            // document.body.removeChild(downloadLink);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download
        </a>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="preserve-tempo" className="text-sm text-neutral-300">Preserve Tempo</Label>
          <Switch
            id="preserve-tempo"
            checked={preserveTempo}
            onCheckedChange={onPreserveTempoChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="audio-quality" className="text-sm text-neutral-300">Processing Quality</Label>
          <Select value={audioQuality} onValueChange={onAudioQualityChange}>
            <SelectTrigger className="w-36 h-9 bg-zinc-700 border-0 text-neutral-200" id="audio-quality">
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-700 border-zinc-600">
              <SelectItem value="fast" className="text-neutral-200">Fast (Lower CPU)</SelectItem>
              <SelectItem value="balanced" className="text-neutral-200">Balanced</SelectItem>
              <SelectItem value="high" className="text-neutral-200">High (Better Sound)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PlaybackOptions;
