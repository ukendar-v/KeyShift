import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  audioBuffer: AudioBuffer | null;
  currentTime: number;
  duration: number;
}

const Waveform: React.FC<WaveformProps> = ({ audioBuffer, currentTime, duration }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !audioBuffer) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw waveform from audio buffer
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;
    
    ctx.fillStyle = 'rgba(59, 130, 246, 0.5)'; // Blue with alpha
    
    for (let i = 0; i < canvas.width; i++) {
      const min = Math.min(...Array.from({length: step}, (_, j) => data[i * step + j] || 0));
      const max = Math.max(...Array.from({length: step}, (_, j) => data[i * step + j] || 0));
      
      // Draw bar
      ctx.fillRect(i, (1 + min) * amp, 1, (max - min) * amp);
    }
    
    // Show playback position
    const playbackPosition = (currentTime / duration) * canvas.width;
    ctx.fillStyle = 'rgba(59, 130, 246, 1)';
    ctx.fillRect(playbackPosition, 0, 2, canvas.height);
    
  }, [audioBuffer, currentTime, duration]);
  
  return (
    <div className="waveform-container mb-4 text-primary/50 bg-neutral-50 rounded">
      <canvas
        ref={canvasRef}
        width={300}
        height={80}
        className="w-full h-full"
      ></canvas>
    </div>
  );
};

export default Waveform;
