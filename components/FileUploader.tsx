import React from 'react';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  label: string;
  onDataLoaded: (text: string, filename: string) => void;
  accept: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ label, onDataLoaded, accept }) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        onDataLoaded(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative group w-full h-full min-h-[100px]">
      <input 
        type="file" 
        accept={accept}
        onChange={handleFile}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="h-full border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center group-hover:border-indigo-400 transition-colors bg-slate-50">
        <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-indigo-500" />
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>
    </div>
  );
};

export default FileUploader;