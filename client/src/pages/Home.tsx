import React, { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import AudioPlayer from '@/components/AudioPlayer';
import { useToast } from '@/hooks/use-toast';

interface AudioFile {
  file: File;
  originalKey: string;
  transposedKey: string;
}

const Home: React.FC = () => {
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.includes('audio/mpeg')) {
      toast({
        title: "Invalid file type",
        description: "Please select an MP3 file.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Simulate key detection (would use a real audio analysis library)
    setTimeout(() => {
      const keys = ['C Major', 'A Minor', 'G Major', 'E Minor', 'D Major', 'B Minor'];
      const detectedKey = keys[Math.floor(Math.random() * keys.length)];
      
      setAudioFile({
        file,
        originalKey: detectedKey,
        transposedKey: detectedKey,
      });
      setIsLoading(false);
    }, 2000);
  };

  const handleReset = () => {
    setAudioFile(null);
  };

  return (
    <div className="bg-zinc-900 text-neutral-100 min-h-screen">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">KeyShift</h1>
          <p className="text-lg text-neutral-400">Upload a song. Change the key. Hear the difference.</p>
          <p className="text-sm text-neutral-500 mt-1">No account needed. Works right from your phone.</p>
        </header>

        {/* Main Content */}
        {!audioFile && !isLoading && (
          <FileUploader onFileSelect={handleFileSelect} />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-zinc-800 rounded-xl shadow-sm p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
            <h3 className="font-medium text-neutral-200 mb-2">
              {audioFile?.file.name || "Uploading..."}
            </h3>
            <p className="text-sm text-neutral-400">Analyzing audio and detecting key...</p>
          </div>
        )}

        {/* Audio Player */}
        {audioFile && !isLoading && (
          <AudioPlayer 
            audioFile={audioFile}
            onReset={handleReset}
          />
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-neutral-500">
          <p>KeyShift processes all audio directly in your browser.</p>
          <p className="mt-1">No files are uploaded to any server.</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
