import React, { useState, useRef, useEffect } from 'react';
import KeyAdjuster from './KeyAdjuster';
import PlaybackOptions from './PlaybackOptions';
import Waveform from './Waveform';
import useAudioProcessor from '@/hooks/useAudioProcessor';

interface AudioPlayerProps {
  audioFile: {
    file: File;
    originalKey: string;
    transposedKey: string;
  };
  onReset: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioFile, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [transposedKey, setTransposedKey] = useState(audioFile.originalKey);
  const [semitones, setSemitones] = useState(0);
  
  const {
    audioContext,
    audioBuffer,
    loadAudio,
    playAudio,
    stopAudio,
    transposeAudio,
    currentPlaybackTime,
    isProcessing,
    preserveTempo,
    setPreserveTempo,
    audioQuality,
    setAudioQuality
  } = useAudioProcessor();

  const progressInterval = useRef<number | null>(null);
  const pausedAt = useRef<number>(0);

  useEffect(() => {
    loadAudio(audioFile.file);
    
    return () => {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
      stopAudio();
    };
  }, [audioFile, loadAudio, stopAudio]);

  useEffect(() => {
    if (audioBuffer) {
      setDuration(audioBuffer.duration);
    }
  }, [audioBuffer]);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = window.setInterval(() => {
        const currentPlaybackTimeValue = currentPlaybackTime();
        setCurrentTime(currentPlaybackTimeValue);
        
        // Reset playback when audio reaches the end so it can be played again
        if (duration > 0 && currentPlaybackTimeValue >= duration - 0.1) {
          stopAudio();
          setIsPlaying(false);
          setCurrentTime(0);
          pausedAt.current = 0;
        }
      }, 100);
    } else if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
    }
    
    return () => {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, currentPlaybackTime, duration, stopAudio]);

  const togglePlayback = () => {
    // If playing, stop playback
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
      return;
    }
    
    // Otherwise, start playback
    if (audioContext && audioBuffer) {
      // If we reached the end or almost at the end, reset to beginning
      if (currentTime >= duration - 0.1) {
        pausedAt.current = 0;
        setCurrentTime(0);
      }
      
      // Short delay to ensure UI updates before playback
      setTimeout(() => {
        playAudio(semitones);
        setIsPlaying(true);
      }, 50);
    }
  };

  const handleKeyChange = (newSemitones: number) => {
    setSemitones(newSemitones);
    
    // Update transposed key based on the semitone shift
    const keyMap: Record<string, string[]> = {
      'C Major': ['C Major', 'C♯/D♭ Major', 'D Major', 'E♭ Major', 'E Major', 'F Major', 
                 'F♯/G♭ Major', 'G Major', 'A♭ Major', 'A Major', 'B♭ Major', 'B Major'],
      'A Minor': ['A Minor', 'B♭ Minor', 'B Minor', 'C Minor', 'C♯/D♭ Minor', 'D Minor', 
                 'E♭ Minor', 'E Minor', 'F Minor', 'F♯/G♭ Minor', 'G Minor', 'G♯/A♭ Minor'],
      'G Major': ['G Major', 'A♭ Major', 'A Major', 'B♭ Major', 'B Major', 'C Major', 
                 'C♯/D♭ Major', 'D Major', 'E♭ Major', 'E Major', 'F Major', 'F♯/G♭ Major'],
      'E Minor': ['E Minor', 'F Minor', 'F♯/G♭ Minor', 'G Minor', 'G♯/A♭ Minor', 'A Minor', 
                 'B♭ Minor', 'B Minor', 'C Minor', 'C♯/D♭ Minor', 'D Minor', 'E♭ Minor'],
      'D Major': ['D Major', 'E♭ Major', 'E Major', 'F Major', 'F♯/G♭ Major', 'G Major', 
                 'A♭ Major', 'A Major', 'B♭ Major', 'B Major', 'C Major', 'C♯/D♭ Major'],
      'B Minor': ['B Minor', 'C Minor', 'C♯/D♭ Minor', 'D Minor', 'E♭ Minor', 'E Minor', 
                 'F Minor', 'F♯/G♭ Minor', 'G Minor', 'G♯/A♭ Minor', 'A Minor', 'B♭ Minor']
    };
    
    const baseKey = keyMap[audioFile.originalKey];
    if (baseKey) {
      const newKeyIndex = ((newSemitones % 12) + 12) % 12;
      setTransposedKey(baseKey[newKeyIndex]);
    }
    
    if (isPlaying) {
      stopAudio();
      playAudio(newSemitones);
    } else {
      transposeAudio(newSemitones);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Reset to beginning and play button
  const skipBackward = () => {
    if (audioContext && audioBuffer) {
      // Stop current playback and reset to beginning
      if (isPlaying) {
        stopAudio();
      }
      
      // Reset position
      setCurrentTime(0);
      pausedAt.current = 0;
      
      // Start playback from beginning after a short delay
      setTimeout(() => {
        playAudio(semitones);
        setIsPlaying(true);
      }, 50);
    }
  };

  // Reset to end button - stops playback and resets position
  const skipForward = () => {
    if (audioContext && audioBuffer && duration) {
      // Stop current playback
      if (isPlaying) {
        stopAudio();
      }
      
      // Reset position to beginning
      setCurrentTime(0);
      pausedAt.current = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* File Info & Player */}
      <div className="bg-zinc-800 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium text-neutral-200 mb-1 truncate pr-4">{audioFile.file.name}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-700 text-neutral-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                Original Key: <span className="ml-1 font-semibold">{audioFile.originalKey}</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
                New Key: <span className="ml-1 font-semibold">{transposedKey}</span>
              </span>
            </div>
          </div>
          <button 
            onClick={onReset}
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>
          </button>
        </div>
        
        {/* Waveform Visualization */}
        <Waveform audioBuffer={audioBuffer} currentTime={currentTime} duration={duration} />
        
        {/* Playback Progress */}
        <div className="mb-6">
          <div 
            className="h-2 bg-zinc-700 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              if (audioBuffer && duration > 0) {
                // Calculate click position as percentage of scrubber width
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                
                // Convert to time value (clamped to valid range)
                const newTime = Math.max(0, Math.min(duration, clickPos * duration));
                
                // Stop current playback
                if (isPlaying) {
                  stopAudio();
                }
                
                // Update position
                setCurrentTime(newTime);
                pausedAt.current = newTime;
                
                // Restart from new position if we were playing
                if (isPlaying) {
                  setTimeout(() => {
                    playAudio(semitones);
                  }, 50);
                }
              }
            }}
          >
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Playback Controls */}
        <div className="flex justify-center items-center gap-4">
          <button 
            className="w-10 h-10 flex items-center justify-center text-neutral-300 hover:text-primary transition-colors" 
            onClick={skipBackward}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
          </button>
          <button 
            className={`w-14 h-14 rounded-full ${isProcessing ? 'bg-zinc-600' : 'bg-primary'} text-white flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors`}
            onClick={togglePlayback}
            disabled={isProcessing}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            )}
          </button>
          <button 
            className="w-10 h-10 flex items-center justify-center text-neutral-300 hover:text-primary transition-colors" 
            onClick={skipForward}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
          </button>
        </div>
      </div>
      
      {/* Key Adjustment Controls */}
      <KeyAdjuster 
        semitones={semitones} 
        onSemitonesChange={handleKeyChange} 
      />
      
      {/* Additional Options */}
      <PlaybackOptions 
        preserveTempo={preserveTempo}
        onPreserveTempoChange={setPreserveTempo}
        audioQuality={audioQuality}
        onAudioQualityChange={(value: string) => setAudioQuality(value as 'fast' | 'balanced' | 'high')}
        audioContext={audioContext}
        audioBuffer={audioBuffer}
      />
    </div>
  );
};

export default AudioPlayer;
