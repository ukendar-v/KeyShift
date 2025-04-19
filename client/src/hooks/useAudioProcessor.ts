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
  
  // Simple pitch shift implementation
  // In a real app, this would use a more sophisticated algorithm
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
      
      // Process each channel
      for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
        const inputData = originalBuffer.getChannelData(channel);
        const outputData = newBuffer.getChannelData(channel);
        
        // Simple resampling - in a real app we'd use a better algorithm
        for (let i = 0; i < newLength; i++) {
          const originalIndex = preserveTempo 
            ? Math.round(i * pitchRatio)
            : i;
            
          if (originalIndex < originalBuffer.length) {
            outputData[i] = inputData[originalIndex];
          }
        }
      }
      
      setAudioBuffer(newBuffer);
    } catch (error) {
      console.error('Error transposing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [audioContext, originalBuffer, preserveTempo]);
  
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
      return audioContext.currentTime - startTime.current;
    } else {
      return pausedAt.current;
    }
  }, [audioContext]);
  
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

export default useAudioProcessor;
