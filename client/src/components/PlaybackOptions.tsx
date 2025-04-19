import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportAudioBlob } from '@/hooks/useAudioProcessor';

interface PlaybackOptionsProps {
  preserveTempo: boolean;
  onPreserveTempoChange: (value: boolean) => void;
  audioQuality: string;
  onAudioQualityChange: (value: string) => void;
  audioContext?: AudioContext | null;
  audioBuffer?: AudioBuffer | null;
}

const PlaybackOptions: React.FC<PlaybackOptionsProps> = ({
  preserveTempo,
  onPreserveTempoChange,
  audioQuality,
  onAudioQualityChange,
  audioContext,
  audioBuffer
}) => {
  return (
    <div className="bg-zinc-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-neutral-200">Playback Options</h3>
        <a 
          href="#" 
          className="flex items-center text-primary hover:text-primary/90 text-sm font-medium"
          onClick={async (e) => {
            e.preventDefault();
            
            // Make sure we have all the required data
            if (!audioBuffer || !audioContext) {
              alert("No audio loaded to download!");
              return;
            }
            
            try {
              // Show processing state
              const button = e.currentTarget;
              const originalContent = button.innerHTML;
              button.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing
              `;
              
              // Convert the audio buffer to a downloadable blob
              const audioBlob = await exportAudioBlob(audioContext, audioBuffer);
                            
              // Create the download link
              const filename = 'keyshift-processed-audio.wav';
              const downloadUrl = URL.createObjectURL(audioBlob);
              
              const downloadLink = document.createElement('a');
              downloadLink.href = downloadUrl;
              downloadLink.download = filename;
              downloadLink.style.display = 'none';
              document.body.appendChild(downloadLink);
              
              // Trigger download
              downloadLink.click();
              
              // Clean up
              document.body.removeChild(downloadLink);
              window.URL.revokeObjectURL(downloadUrl);
              
              // Restore button
              setTimeout(() => {
                button.innerHTML = originalContent;
              }, 1000);
              
            } catch (error: any) {
              console.error('Error exporting audio:', error);
              alert(`Error creating download: ${error.message || 'Unknown error'}`);
            }
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
