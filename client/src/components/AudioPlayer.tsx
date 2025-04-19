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
        setCurrentTime(currentPlaybackTime());
      }, 100);
    } else if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
    }
    
    return () => {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, currentPlaybackTime]);

  const togglePlayback = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      playAudio(semitones);
      setIsPlaying(true);
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

  const skipBackward = () => {
    if (audioContext) {
      stopAudio();
      setIsPlaying(false);
      setCurrentTime(0);
      setTimeout(() => {
        playAudio(semitones);
        setIsPlaying(true);
      }, 100);
    }
  };

  const skipForward = () => {
    if (audioContext && duration) {
      stopAudio();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  return (
    <div>
      {/* File Info & Player */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium text-neutral-700 mb-1 truncate pr-4">{audioFile.file.name}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                <i className="ri-music-line mr-1"></i>
                Original Key: <span className="ml-1 font-semibold">{audioFile.originalKey}</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                <i className="ri-equalizer-line mr-1"></i>
                New Key: <span className="ml-1 font-semibold">{transposedKey}</span>
              </span>
            </div>
          </div>
          <button 
            onClick={onReset}
            className="text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <i className="ri-refresh-line text-lg"></i>
          </button>
        </div>
        
        {/* Waveform Visualization */}
        <Waveform audioBuffer={audioBuffer} currentTime={currentTime} duration={duration} />
        
        {/* Playback Progress */}
        <div className="mb-6">
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Playback Controls */}
        <div className="flex justify-center items-center gap-4">
          <button 
            className="w-10 h-10 flex items-center justify-center text-neutral-700 hover:text-primary transition-colors" 
            onClick={skipBackward}
          >
            <i className="ri-skip-back-line text-xl"></i>
          </button>
          <button 
            className={`w-14 h-14 rounded-full ${isProcessing ? 'bg-neutral-300' : 'bg-primary'} text-white flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors`}
            onClick={togglePlayback}
            disabled={isProcessing}
          >
            <i className={`${isPlaying ? 'ri-pause-fill' : 'ri-play-fill'} text-2xl`}></i>
          </button>
          <button 
            className="w-10 h-10 flex items-center justify-center text-neutral-700 hover:text-primary transition-colors" 
            onClick={skipForward}
          >
            <i className="ri-skip-forward-line text-xl"></i>
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
        onAudioQualityChange={setAudioQuality}
      />
    </div>
  );
};

export default AudioPlayer;
