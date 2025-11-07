
import React from 'react';
import { ActionType, VideoSuggestion, QuizQuestion } from '../types';
import { YoutubeIcon } from './Icons';
import ExamModeDisplay from './ExamModeDisplay';
import SlideshowDisplay from './SlideshowDisplay';
import MarkdownRenderer from './MarkdownRenderer';

interface ResultDisplayProps {
  isLoading: boolean;
  result: string | VideoSuggestion[] | QuizQuestion[] | null;
  action: ActionType;
  sourceTitle: string;
  onPresent: (action: ActionType, content: string) => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4 h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 dark:border-cyan-400"></div>
    <p className="text-lg text-cyan-600 dark:text-cyan-300">AI is thinking...</p>
    <p className="text-gray-600 dark:text-gray-400 text-center">Generating your content. This might take a few seconds.</p>
  </div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, result, action, sourceTitle, onPresent }) => {
  
  const isQuizQuestionArray = (res: any): res is QuizQuestion[] => {
    return Array.isArray(res) && res.length > 0 && typeof res[0].question === 'string';
  };

  const renderContent = () => {
    if (!result) return null;

    if (action === ActionType.EXAM_MODE && isQuizQuestionArray(result)) {
      return <ExamModeDisplay questions={result} />;
    }

    if (
      (action === ActionType.SUMMARY || action === ActionType.NOTES || action === ActionType.QUESTIONS) 
      && typeof result === 'string'
    ) {
      return <SlideshowDisplay content={result} action={action} onPresent={() => onPresent(action, result as string)} />;
    }

    if (action === ActionType.VIDEOS && Array.isArray(result)) {
        return (
            <div className="space-y-6">
                {(result as VideoSuggestion[]).map((video, index) => {
                    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(video.title)}`;
                    return (
                        <div key={index} className="bg-gray-100/70 dark:bg-gray-800/70 p-5 rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10">
                            <h4 className="text-lg font-semibold text-cyan-600 dark:text-cyan-300">{video.topic}</h4>
                            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{video.title}</p>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{video.description}</p>
                            <a 
                                href={youtubeSearchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                <YoutubeIcon className="h-5 w-5"/>
                                Search on YouTube
                            </a>
                        </div>
                    );
                })}
            </div>
        );
    }
    
    // Fallback for any other string results
    if (typeof result === 'string') {
        return (
          <div className="prose dark:prose-invert prose-lg max-w-none text-gray-700 dark:text-gray-300">
            <MarkdownRenderer content={result} />
          </div>
        );
    }

    return null;
  };

  const resultTitle = action === ActionType.EXAM_MODE ? 'Exam Mode Quiz' : `${action} Result`;

  return (
    <div className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl shadow-cyan-500/10 min-h-[200px] flex flex-col">
        <h3 className="text-2xl font-semibold mb-6 text-center text-cyan-600 dark:text-cyan-300">{resultTitle}</h3>
        <div className="bg-white/50 dark:bg-gray-900/50 p-6 sm:p-8 rounded-lg flex-grow">
            {isLoading ? <LoadingSpinner /> : renderContent()}
        </div>
    </div>
  );
};

export default ResultDisplay;