import React, { useRef, useState } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-8">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 hover:border-primary ${
          isDragging ? 'border-primary bg-primary/10' : 'border-zinc-700 bg-zinc-800'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto w-12 h-12 text-neutral-400 mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        <h3 className="font-medium mb-1 text-neutral-200">Drop your MP3 file here</h3>
        <p className="text-sm text-neutral-400 mb-4">or click to browse</p>
        <button className="bg-primary text-white py-2 px-6 rounded-full text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors">
          Select File
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          id="file-input" 
          accept=".mp3"
          className="hidden" 
          onChange={handleFileInputChange} 
        />
      </div>
      <p className="text-xs text-neutral-500 text-center mt-2">Only MP3 files are supported</p>
    </div>
  );
};

export default FileUploader;
