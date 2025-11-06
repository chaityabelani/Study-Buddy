import React from 'react';
import { ActionType, VideoSuggestion } from '../types';
import { YoutubeIcon } from './Icons';

interface ResultDisplayProps {
  isLoading: boolean;
  result: string | VideoSuggestion[] | null;
  action: ActionType;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4 h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400"></div>
    <p className="text-lg text-cyan-300">AI is thinking...</p>
    <p className="text-gray-400 text-center">Generating your content. This might take a few seconds.</p>
  </div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, result, action }) => {
  
  const renderContent = () => {
    if (!result) return null;

    if (action === ActionType.VIDEOS && Array.isArray(result)) {
        return (
            <div className="space-y-6">
                {result.map((video, index) => {
                    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(video.title)}`;
                    return (
                        <div key={index} className="bg-gray-800/70 p-5 rounded-lg border border-gray-700 transition-all hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10">
                            <h4 className="text-lg font-semibold text-cyan-300 mb-1">{video.topic}</h4>
                            <p className="text-xl font-bold text-gray-100 mb-2">{video.title}</p>
                            <p className="text-gray-400 mb-4">{video.description}</p>
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
    
    if (typeof result === 'string') {
        const formattedResult = result.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-6 mb-3 text-cyan-300 border-b border-gray-600 pb-2">{line.substring(3)}</h2>;
            if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-semibold mt-4 mb-2 text-blue-300">{line.substring(4)}</h3>;
            if (line.startsWith('* ')) return <li key={i} className="ml-6 list-disc">{line.substring(2)}</li>;
            if (line.startsWith('- ')) return <li key={i} className="ml-6 list-disc">{line.substring(2)}</li>;
            if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-6" style={{listStyleType: 'decimal'}}>{line.replace(/^\d+\.\s/, '')}</li>;

            if (line.trim() === '') return <br key={i} />;

            const parts = line.split(/(\*\*.*?\*\*|`.*?`|_.*?_)/g).filter(Boolean);
            const styledParts = parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                 if (part.startsWith('_') && part.endsWith('_')) {
                    return <em key={index}>{part.slice(1, -1)}</em>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={index} className="bg-gray-900 rounded px-1.5 py-1 text-sm font-mono text-cyan-300">{part.slice(1, -1)}</code>;
                }
                return part;
            });
            return <p key={i} className="my-3 leading-relaxed">{styledParts}</p>;
        });

        return <div className="prose prose-invert prose-lg max-w-none text-gray-300">{formattedResult}</div>;
    }

    return null;
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-2xl border border-gray-700 shadow-2xl shadow-cyan-500/10 min-h-[200px] flex flex-col">
        <h3 className="text-2xl font-semibold mb-6 text-center text-cyan-300">{action} Result</h3>
        <div className="bg-gray-900/50 p-6 sm:p-8 rounded-lg flex-grow">
            {isLoading ? <LoadingSpinner /> : renderContent()}
        </div>
    </div>
  );
};

export default ResultDisplay;
