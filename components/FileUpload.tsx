
import React, { useState, useCallback, useRef } from 'react';

// pdfjs is loaded from CDN in index.html
declare const pdfjsLib: any;

interface FileUploadProps {
  onFileProcessed: (text: string, fileName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const processPdf = useCallback(async (file: File) => {
    if (!file) {
      setError('No file selected.');
      return;
    }
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const pdfjs = await pdfjsLib;
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      }
      
      const fileReader = new FileReader();
      fileReader.onload = async function() {
        if (this.result instanceof ArrayBuffer) {
          const typedarray = new Uint8Array(this.result);
          const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
          }
          onFileProcessed(fullText, file.name);
        }
      };
      fileReader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      setError('Failed to process PDF. It may be corrupted or protected.');
      setIsProcessing(false);
    }
  }, [onFileProcessed]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      processPdf(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processPdf(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="flex flex-col items-center">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`w-full max-w-lg cursor-pointer p-10 border-2 border-dashed rounded-lg text-center transition-colors duration-300 ${isDragging ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-900/20' : 'border-gray-400 hover:border-cyan-500 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-cyan-500 dark:hover:bg-gray-700/50'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-cyan-500 dark:text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-lg font-semibold text-cyan-600 dark:text-cyan-300">Analyzing PDF...</p>
            <p className="text-gray-600 dark:text-gray-400">This may take a moment.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Drag & Drop PDF here or <span className="text-cyan-500 dark:text-cyan-400">Click to Upload</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">Maximum file size: 10MB</p>
          </div>
        )}
      </div>
      {error && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default FileUpload;