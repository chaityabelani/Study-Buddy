import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/solid';
import MarkdownRenderer from './MarkdownRenderer';

interface PresentationProps {
  title: string;
  content: string;
  onExit: () => void;
}

interface Slide {
  title: string;
  content: string;
}

const Presentation: React.FC<PresentationProps> = ({ title, content, onExit }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  let controlTimeout = React.useRef<number | null>(null);

  const slides: Slide[] = useMemo(() => {
    const sections = content.split(/(?=^##\s)/m).filter(s => s.trim() !== '');
    if (sections.length === 0) {
      return [{ title: title, content: content }];
    }
    return sections.map(section => {
      const lines = section.trim().split('\n');
      const slideTitle = lines[0].replace('## ', '').trim();
      const slideContent = lines.slice(1).join('\n');
      return { title: slideTitle, content: slideContent };
    });
  }, [content, title]);

  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      } else if (e.key === 'Escape') {
        onExit();
      }
    };
    
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [goToNextSlide, goToPrevSlide, onExit]);
  
  const handleMouseMove = () => {
    setShowControls(true);
    if(controlTimeout.current) {
        clearTimeout(controlTimeout.current);
    }
    controlTimeout.current = window.setTimeout(() => {
        setShowControls(false);
    }, 3000);
  };
  
  useEffect(() => {
    handleMouseMove(); // show controls on load
    return () => {
        if(controlTimeout.current) clearTimeout(controlTimeout.current);
    }
  }, []);


  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col z-50 p-4 sm:p-8" onMouseMove={handleMouseMove}>
      {/* Header */}
      <header className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-black/30 transition-opacity duration-300 z-10 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-xl font-bold truncate" title={title}>{title}</h1>
        <div className="flex items-center gap-4">
            <button onClick={toggleFullscreen} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                {isFullscreen ? <ArrowsPointingInIcon className="w-6 h-6"/> : <ArrowsPointingOutIcon className="w-6 h-6"/>}
            </button>
            <button onClick={onExit} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Exit Presentation (Esc)">
                <XMarkIcon className="w-7 h-7" />
            </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center overflow-hidden py-16">
        <div className="w-full h-full max-w-6xl flex flex-col bg-gray-800 rounded-lg border border-gray-700 shadow-2xl shadow-cyan-500/10 p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-cyan-300 mb-6 flex-shrink-0 border-b border-gray-600 pb-4">{currentSlide.title}</h2>
            <div className="flex-grow overflow-y-auto pr-4">
              <div className="prose prose-invert prose-xl max-w-none text-gray-300 text-left">
                  <MarkdownRenderer content={currentSlide.content} />
              </div>
            </div>
        </div>
      </main>

      {/* Navigation & Footer */}
       <footer className={`absolute bottom-0 left-0 right-0 p-4 bg-black/30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-center items-center gap-8">
            <button
                onClick={goToPrevSlide}
                disabled={currentSlideIndex === 0}
                className="p-3 rounded-full bg-gray-700/50 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeftIcon className="w-7 h-7"/>
            </button>
            <span className="text-lg font-semibold tabular-nums">
                {currentSlideIndex + 1} / {slides.length}
            </span>
             <button
                onClick={goToNextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="p-3 rounded-full bg-gray-700/50 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRightIcon className="w-7 h-7"/>
            </button>
        </div>
      </footer>
    </div>
  );
};

export default Presentation;