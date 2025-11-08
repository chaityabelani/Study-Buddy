import React, { useState, useCallback, useEffect } from 'react';
import { ActionType, VideoSuggestion, QuizQuestion } from './types';
import * as geminiService from './services/geminiService';
import FileUpload from './components/FileUpload';
import ActionTabs from './components/ActionTabs';
import ResultDisplay from './components/ResultDisplay';
import Home from './components/Home';
import TopicSearch from './components/TopicSearch';
import VideoOptions from './components/VideoOptions';
import Presentation from './components/Presentation';
import ThemeToggle from './components/ThemeToggle';
import { SparklesIcon, BookOpenIcon, AcademicCapIcon, ArrowUturnLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

type View = 'main' | 'presentation';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [view, setView] = useState<View>('main');
  const [appMode, setAppMode] = useState<'upload' | 'search' | null>(null);
  const [sourceContent, setSourceContent] = useState<string | null>(null);
  const [sourceTitle, setSourceTitle] = useState<string>('');
  const [theme, setTheme] = useState<Theme>('dark');

  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | VideoSuggestion[] | QuizQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [presentationContent, setPresentationContent] = useState<{title: string, content: string} | null>(null);

  const [preferredChannels, setPreferredChannels] = useState<string>('');
  const [videoLength, setVideoLength] = useState<string>('any');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleFileProcessed = useCallback((text: string, name: string) => {
    setSourceContent(text);
    setSourceTitle(name);
    setSelectedAction(null);
    setResult(null);
    setError(null);
  }, []);
  
  const handleTopicSearched = useCallback((topic: string) => {
    setSourceContent(topic);
    setSourceTitle(topic);
    setSelectedAction(null);
    setResult(null);
    setError(null);
  }, []);


  const handleActionSelect = async (action: ActionType) => {
    if (!sourceContent) {
      setError('Please provide a PDF or a topic first.');
      return;
    }

    setSelectedAction(action);
    setResult(null);
    setError(null);
    setIsLoading(false); // Reset loading state

    // For non-video actions, run the generation immediately.
    // For video action, we wait for the user to click the "Find Videos" button.
    if (action !== ActionType.VIDEOS) {
      setIsLoading(true);
      try {
        let apiResult: string | VideoSuggestion[] | QuizQuestion[];
        switch (action) {
          case ActionType.SUMMARY:
            apiResult = await geminiService.generateSummary(sourceContent);
            break;
          case ActionType.NOTES:
            apiResult = await geminiService.generateNotes(sourceContent);
            break;
          case ActionType.QUESTIONS:
            apiResult = await geminiService.findImportantQuestions(sourceContent);
            break;
          case ActionType.EXAM_MODE:
            apiResult = await geminiService.generateQuiz(sourceContent);
            break;
          default:
            throw new Error('Invalid action selected');
        }
        setResult(apiResult);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : `Failed to generate ${action}. Please try again.`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFindVideos = async () => {
    if (!sourceContent) {
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const apiResult = await geminiService.findVideos(sourceContent, preferredChannels, videoLength);
      setResult(apiResult);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : `Failed to generate ${ActionType.VIDEOS}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresent = (action: ActionType, content: string) => {
    setPresentationContent({ title: `${sourceTitle} - ${action}`, content });
    setView('presentation');
  };

  const resetState = () => {
    setAppMode(null);
    setSourceContent(null);
    setSourceTitle('');
    setSelectedAction(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
    setPreferredChannels('');
    setVideoLength('any');
  }

  const renderContent = () => {
    if (!appMode) {
      return <Home onModeSelect={setAppMode} />;
    }

    if (!sourceContent) {
      if (appMode === 'upload') {
        return (
          <div className="bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl shadow-cyan-500/10">
            <button onClick={() => setAppMode(null)} className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 mb-6 font-semibold">
              <ArrowUturnLeftIcon className="h-5 w-5" />
              Back
            </button>
            <h2 className="text-2xl font-semibold text-center mb-2 text-cyan-700 dark:text-cyan-300">Upload Your Document</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Upload your syllabus, notes, or question paper to begin.</p>
            <FileUpload onFileProcessed={handleFileProcessed} />
          </div>
        );
      }
      if (appMode === 'search') {
         return (
          <div>
            <button onClick={() => setAppMode(null)} className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 mb-4 font-semibold">
              <ArrowUturnLeftIcon className="h-5 w-5" />
              Back
            </button>
            <TopicSearch onTopicSearched={handleTopicSearched} />
          </div>
        );
      }
    }

    return (
       <>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <BookOpenIcon className="h-6 w-6 text-cyan-500 dark:text-cyan-400 flex-shrink-0" />
              <p className="font-medium truncate" title={sourceTitle}>{sourceTitle}</p>
            </div>
            <button
              onClick={resetState}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto"
            >
              Start Over
            </button>
          </div>

          <div className="bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl shadow-blue-500/10 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <SparklesIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300">Choose an AI Tool</h2>
              </div>
              <ActionTabs 
                onSelectAction={handleActionSelect} 
                selectedAction={selectedAction}
                hideNotes={appMode === 'upload'}
              />
            </div>
            
            {selectedAction === ActionType.VIDEOS && (
              <VideoOptions
                channels={preferredChannels}
                onChannelsChange={setPreferredChannels}
                length={videoLength}
                onLengthChange={setVideoLength}
                onFindVideos={handleFindVideos}
                isLoading={isLoading}
              />
            )}
          </div>
        </>
    );
  };

  const renderError = () => {
    if (!error) return null;

    const isApiKeyError = error.includes("Gemini API key not found");

    if (isApiKeyError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-4" role="alert">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg">Application Configuration Error</h3>
            <p className="mt-1">The Google Gemini API key is missing or invalid. The application cannot function without it. Please contact the administrator to resolve this issue.</p>
          </div>
        </div>
      );
    }

    return (
       <div className="bg-red-100 border border-red-300 text-red-700 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-4" role="alert">
         <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
         <div>
            <p className="font-bold">An Error Occurred</p>
            <p>{error}</p>
         </div>
       </div>
    );
  };

  if (view === 'presentation' && presentationContent) {
    return <Presentation title={presentationContent.title} content={presentationContent.content} onExit={() => setView('main')} />;
  }


  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8 overflow-hidden">
      {/* Decorative background gradients */}
      <div aria-hidden="true" className="absolute top-[-10rem] left-[-15rem] w-96 h-96 sm:w-[32rem] sm:h-[32rem] bg-cyan-200/40 dark:bg-cyan-600/40 rounded-full filter blur-3xl opacity-50 dark:opacity-20 animate-float"></div>
      <div aria-hidden="true" className="absolute bottom-[-5rem] right-[-10rem] w-96 h-96 sm:w-[32rem] sm:h-[32rem] bg-blue-300/40 dark:bg-blue-700/40 rounded-full filter blur-3xl opacity-50 dark:opacity-20 animate-float2"></div>

      <div className="relative w-full max-w-4xl mx-auto z-10">
        <header className="text-center mb-8 relative">
           <div className="absolute top-0 right-0">
            <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
          </div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <AcademicCapIcon className="h-10 w-10 text-cyan-400" />
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              B.Tech Study Buddy
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your AI-powered assistant for mastering engineering concepts.
          </p>
        </header>

        <main className="space-y-8">
          {renderContent()}

          {renderError()}

          {(isLoading || result) && selectedAction && (
             <ResultDisplay
                isLoading={isLoading}
                result={result}
                action={selectedAction}
                sourceTitle={sourceTitle}
                onPresent={handlePresent}
              />
          )}
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm space-y-1">
            <p>Made by Chaitya Belani</p>
        </footer>
      </div>
    </div>
  );
};

export default App;