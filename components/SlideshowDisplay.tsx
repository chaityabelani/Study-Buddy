
import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PresentationChartBarIcon } from '@heroicons/react/24/solid';
import MarkdownRenderer from './MarkdownRenderer';
import { ActionType } from '../types';

interface SlideshowDisplayProps {
  content: string;
  action: ActionType;
  onPresent: () => void;
}

interface Slide {
  title: string;
  content: string;
}

const SlideshowDisplay: React.FC<SlideshowDisplayProps> = ({ content, action, onPresent }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides: Slide[] = useMemo(() => {
    // Split content by '## ' headings, keeping the delimiter
    const sections = content.split(/(?=^##\s)/m).filter(s => s.trim() !== '');
    if (sections.length === 0) {
      // Handle content with no '##' headings by treating it as a single slide
      return [{
        title: action,
        content: content
      }];
    }

    return sections.map(section => {
      const lines = section.trim().split('\n');
      const title = lines[0].replace('## ', '').trim();
      const slideContent = lines.slice(1).join('\n');
      return {
        title: title,
        content: slideContent,
      };
    });
  }, [content, action]);

  const goToNextSlide = () => {
    setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
  };

  const goToPrevSlide = () => {
    setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
  };

  const currentSlide = slides[currentSlideIndex];

  if (!currentSlide) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No content to display.</p>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow bg-gray-100 dark:bg-gray-800 p-6 rounded-lg min-h-[300px] flex flex-col">
        <h2 className="text-2xl font-bold text-cyan-600 dark:text-cyan-300 border-b border-gray-200 dark:border-gray-600 pb-3 mb-4">{currentSlide.title}</h2>
        <div className="prose dark:prose-invert prose-lg max-w-none text-gray-700 dark:text-gray-300 flex-grow overflow-y-auto">
            <MarkdownRenderer content={currentSlide.content} />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onPresent}
            className="flex items-center gap-2 px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
            title="Enter Presentation Mode"
          >
            <PresentationChartBarIcon className="w-5 h-5"/>
            Present
          </button>
        </div>
        <div className="flex items-center gap-4">
            <button
            onClick={goToPrevSlide}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-2 px-4 py-2 font-bold text-white bg-gray-500 dark:bg-gray-600 rounded-md hover:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
            <ChevronLeftIcon className="w-5 h-5"/>
            Previous
            </button>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Slide {currentSlideIndex + 1} of {slides.length}
            </span>
            <button
            onClick={goToNextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            className="flex items-center gap-2 px-4 py-2 font-bold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
            Next
            <ChevronRightIcon className="w-5 h-5"/>
            </button>
        </div>
      </div>
    </div>
  );
};

export default SlideshowDisplay;