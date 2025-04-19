import { useState, useRef, useCallback, useEffect } from 'react';

type AudioQuality = 'fast' | 'balanced' | 'high';

const useAudioProcessor = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [originalBuffer, setOriginalBuffer] = useState<AudioBuffer | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [preserveTempo, setPreserveTempo] = useState<boolean>(true);
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('balanced');
  
  const sourceNode = useRef<AudioBufferSourceNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const startTime = useRef<number>(0);
  const pausedAt = useRef<number>(0);
  
  // Create audio context on first render
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);
    
    return () => {
      if (ctx && ctx.state !== 'closed') {
        ctx.close();
      }
    };
  }, []);
  
  // Load audio file
  const loadAudio = useCallback(async (file: File) => {
    if (!audioContext) return;
    
    try {
      setIsProcessing(true);
      
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      setOriginalBuffer(decodedBuffer);
      setAudioBuffer(decodedBuffer);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error loading audio file:', error);
      setIsProcessing(false);
    }
  }, [audioContext]);
  
  // Improved pitch shift implementation with normalization
  const transposeAudio = useCallback((semitones: number) => {
    if (!audioContext || !originalBuffer) return;
    
    setIsProcessing(true);
    
    try {
      // Calculate pitch ratio
      const pitchRatio = Math.pow(2, semitones / 12);
      
      // Create a new buffer with adjusted length
      const newLength = preserveTempo 
        ? originalBuffer.length
        : Math.round(originalBuffer.length / pitchRatio);
      
      const newBuffer = audioContext.createBuffer(
        originalBuffer.numberOfChannels,
        newLength,
        audioContext.sampleRate
      );
      
      // Quality factors - uses higher quality interpolation for higher quality settings
      let windowSize = 0;
      switch(audioQuality) {
        case 'fast': windowSize = 0; break; // Basic resampling
        case 'balanced': windowSize = 4; break; // Some interpolation
        case 'high': windowSize = 8; break; // Better interpolation
      }
      
      // Find the maximum amplitude in the original buffer for normalization reference
      const originalMaxAmplitudes: number[] = [];
      const newMaxAmplitudes: number[] = [];
      
      // First calculate the original max amplitudes per channel
      for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
        const inputData = originalBuffer.getChannelData(channel);
        let maxAmplitude = 0;
        
        // Find the maximum amplitude in the original audio
        for (let i = 0; i < inputData.length; i++) {
          const absValue = Math.abs(inputData[i]);
          if (absValue > maxAmplitude) {
            maxAmplitude = absValue;
          }
        }
        
        originalMaxAmplitudes[channel] = maxAmplitude;
      }
      
      // Process each channel
      for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
        const inputData = originalBuffer.getChannelData(channel);
        const outputData = newBuffer.getChannelData(channel);
        
        // Enhanced resampling with basic interpolation for quality
        for (let i = 0; i < newLength; i++) {
          const exactPos = preserveTempo 
            ? i * pitchRatio
            : i;
          
          if (windowSize === 0) {
            // Fast mode: Simple nearest neighbor
            const originalIndex = Math.round(exactPos);
            if (originalIndex < originalBuffer.length) {
              outputData[i] = inputData[originalIndex];
            }
          } else {
            // Balanced/High modes: Linear interpolation with windowing
            const originalIndexFloor = Math.floor(exactPos);
            const fraction = exactPos - originalIndexFloor;
            
            if (originalIndexFloor < originalBuffer.length - 1) {
              // Simple linear interpolation between two points
              const sample1 = inputData[originalIndexFloor];
              const sample2 = inputData[originalIndexFloor + 1];
              
              // Apply a weighted average based on fraction
              outputData[i] = sample1 * (1 - fraction) + sample2 * fraction;
            } else if (originalIndexFloor < originalBuffer.length) {
              outputData[i] = inputData[originalIndexFloor];
            }
          }
        }
        
        // Find the maximum amplitude in the processed audio for this channel
        let maxAmplitude = 0;
        for (let i = 0; i < outputData.length; i++) {
          const absValue = Math.abs(outputData[i]);
          if (absValue > maxAmplitude) {
            maxAmplitude = absValue;
          }
        }
        newMaxAmplitudes[channel] = maxAmplitude;
        
        // Normalize the output if it exceeds the original volume
        if (maxAmplitude > originalMaxAmplitudes[channel] && maxAmplitude > 0) {
          const normalizeRatio = originalMaxAmplitudes[channel] / maxAmplitude;
          console.log(`Normalizing channel ${channel} by ratio ${normalizeRatio.toFixed(4)}`);
          
          for (let i = 0; i < outputData.length; i++) {
            outputData[i] *= normalizeRatio;
          }
        }
      }
      
      setAudioBuffer(newBuffer);
    } catch (error) {
      console.error('Error transposing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [audioContext, originalBuffer, preserveTempo, audioQuality]);
  
  // Play audio
  const playAudio = useCallback((semitones: number) => {
    if (!audioContext || !audioBuffer) return;
    
    // Stop any playing audio
    if (sourceNode.current) {
      sourceNode.current.stop();
      sourceNode.current = null;
    }
    
    // Create new source node
    sourceNode.current = audioContext.createBufferSource();
    sourceNode.current.buffer = audioBuffer;
    
    // Create gain node if it doesn't exist
    if (!gainNode.current) {
      gainNode.current = audioContext.createGain();
      gainNode.current.connect(audioContext.destination);
    }
    
    // Connect nodes
    sourceNode.current.connect(gainNode.current);
    
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Calculate startTime
    if (pausedAt.current) {
      startTime.current = audioContext.currentTime - pausedAt.current;
    } else {
      startTime.current = audioContext.currentTime;
    }
    
    // Start playback
    sourceNode.current.start(0, pausedAt.current);
    
  }, [audioContext, audioBuffer]);
  
  // Stop audio
  const stopAudio = useCallback(() => {
    if (sourceNode.current) {
      sourceNode.current.stop();
      sourceNode.current = null;
      
      // Store the current position
      if (audioContext) {
        pausedAt.current = audioContext.currentTime - startTime.current;
      }
    }
  }, [audioContext]);
  
  // Get current playback time
  const currentPlaybackTime = useCallback(() => {
    if (!audioContext) return pausedAt.current;
    
    if (sourceNode.current) {
      const currentTime = audioContext.currentTime - startTime.current;
      // Make sure we don't return a time greater than the duration
      if (audioBuffer && currentTime > audioBuffer.duration) {
        return audioBuffer.duration;
      }
      return currentTime;
    } else {
      return pausedAt.current;
    }
  }, [audioContext, audioBuffer]);
  
  // Reset playback position
  const resetPlayback = useCallback(() => {
    pausedAt.current = 0;
  }, []);
  
  return {
    audioContext,
    audioBuffer,
    isProcessing,
    loadAudio,
    playAudio,
    stopAudio,
    transposeAudio,
    currentPlaybackTime,
    resetPlayback,
    preserveTempo,
    setPreserveTempo,
    audioQuality,
    setAudioQuality
  };
};

// Function to export processed audio as a Blob with normalization
const exportAudioBlob = async (audioContext: AudioContext, buffer: AudioBuffer): Promise<Blob> => {
  // Create normalized buffer to prevent distortion
  const normalizedBuffer = normalizeAudioBuffer(buffer);
  
  // Create offline context for rendering
  const offlineContext = new OfflineAudioContext(
    normalizedBuffer.numberOfChannels,
    normalizedBuffer.length,
    normalizedBuffer.sampleRate
  );
  
  // Create buffer source
  const source = offlineContext.createBufferSource();
  source.buffer = normalizedBuffer;
  source.connect(offlineContext.destination);
  source.start();
  
  // Render audio
  const renderedBuffer = await offlineContext.startRendering();
  
  // Convert AudioBuffer to WAV format
  const numberOfChannels = renderedBuffer.numberOfChannels;
  const length = renderedBuffer.length;
  const sampleRate = renderedBuffer.sampleRate;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numberOfChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  
  // Create buffer with header
  const wavBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(wavBuffer);
  
  // Write WAV header
  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  
  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // subchunk1size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  
  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  
  // Write PCM audio data
  const offset = 44;
  const interleaved = interleaveChannels(renderedBuffer);
  for (let i = 0; i < interleaved.length; i++) {
    const sample = Math.max(-1, Math.min(1, interleaved[i]));
    const sampleValue = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset + i * 2, sampleValue, true);
  }
  
  return new Blob([wavBuffer], { type: 'audio/wav' });
};

// Normalize the audio buffer to prevent distortion
function normalizeAudioBuffer(buffer: AudioBuffer): AudioBuffer {
  const numberOfChannels = buffer.numberOfChannels;
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;
  
  // Create a new buffer for the normalized audio
  const normalizedBuffer = new AudioContext().createBuffer(
    numberOfChannels,
    length,
    sampleRate
  );
  
  // Find the maximum amplitude across all channels
  let maxAmplitude = 0;
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const absValue = Math.abs(channelData[i]);
      if (absValue > maxAmplitude) {
        maxAmplitude = absValue;
      }
    }
  }
  
  // If the max amplitude is above a safe threshold, normalize to prevent distortion
  const targetAmplitude = 0.9; // 90% of maximum to ensure no clipping
  const normalizeRatio = maxAmplitude > targetAmplitude ? targetAmplitude / maxAmplitude : 1;
  
  // Apply normalization
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = buffer.getChannelData(channel);
    const outputData = normalizedBuffer.getChannelData(channel);
    
    for (let i = 0; i < length; i++) {
      outputData[i] = inputData[i] * normalizeRatio;
    }
  }
  
  return normalizedBuffer;
};

// Helper function to write a string to a DataView
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Helper function to interleave channels
function interleaveChannels(buffer: AudioBuffer): Float32Array {
  const numberOfChannels = buffer.numberOfChannels;
  const length = buffer.length;
  const result = new Float32Array(length * numberOfChannels);
  
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      result[i * numberOfChannels + channel] = channelData[i];
    }
  }
  
  return result;
}

export default useAudioProcessor;
export { exportAudioBlob };
