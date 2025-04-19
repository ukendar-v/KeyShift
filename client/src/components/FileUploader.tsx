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
          isDragging ? 'border-primary bg-primary/5' : 'border-neutral-300 bg-neutral-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <i className="ri-upload-cloud-line text-4xl text-neutral-400 mb-3 block"></i>
        <h3 className="font-medium mb-1">Drop your MP3 file here</h3>
        <p className="text-sm text-neutral-500 mb-4">or click to browse</p>
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
