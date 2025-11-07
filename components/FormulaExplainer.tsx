
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import * as geminiService from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

// katex is global
declare const katex: any;

interface FormulaExplainerProps {
  formula: string;
  explanation: string;
}

const FormulaExplainer: React.FC<FormulaExplainerProps> = ({ formula, explanation }) => {
  const [simplifiedExplanation, setSimplifiedExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isKaTeXLoaded, setIsKaTeXLoaded] = useState(typeof katex !== 'undefined');

  useEffect(() => {
    if (typeof katex !== 'undefined') {
        if (!isKaTeXLoaded) setIsKaTeXLoaded(true);
        return;
    }
    const intervalId = setInterval(() => {
      if (typeof katex !== 'undefined') {
        setIsKaTeXLoaded(true);
        clearInterval(intervalId);
      }
    }, 100);
    return () => clearInterval(intervalId);
  }, [isKaTeXLoaded]);

  const handleSimplify = async () => {
    setIsLoading(true);
    setError(null);
    setSimplifiedExplanation(null);
    try {
      const result = await geminiService.simplifyExplanation(formula, explanation);
      setSimplifiedExplanation(result);
    } catch (err) {
      console.error(err);
      setError('Sorry, I was unable to simplify this explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormula = () => {
    if (!isKaTeXLoaded) {
      return <code className="font-mono block p-2 bg-gray-200 dark:bg-gray-900 rounded overflow-x-auto">{`$$${formula}$$`}</code>;
    }
    try {
      const html = katex.renderToString(formula, {
        throwOnError: true,
        displayMode: true,
      });
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (e) {
      return <code className="text-red-600 dark:text-red-400 font-mono block p-2 bg-red-100 dark:bg-gray-800 rounded overflow-x-auto">{`Error rendering LaTeX: $$${formula}$$`}</code>;
    }
  };

  return (
    <div className="my-6 p-4 border border-cyan-300 bg-cyan-50/40 dark:border-cyan-700/50 dark:bg-gray-900/40 rounded-lg">
      {renderFormula()}
      <MarkdownRenderer content={explanation} disableFormulaExplainer={true} />

      {!simplifiedExplanation && !isLoading && (
        <div className="mt-4 text-center">
          <button
            onClick={handleSimplify}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            <SparklesIcon className="h-5 w-5" />
            <span>Explain Like I'm 5</span>
          </button>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 text-center">
             <button
                disabled={true}
                className="inline-flex items-center gap-2 bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors opacity-70 cursor-wait"
            >
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Simplifying...</span>
            </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {simplifiedExplanation && (
        <div className="mt-4 p-4 bg-green-100/40 border border-green-300 dark:bg-green-900/40 dark:border-green-700/60 rounded-lg">
          <h4 className="flex items-center gap-2 text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
            <SparklesIcon className="h-6 w-6" />
            Simplified Explanation
          </h4>
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
             <MarkdownRenderer content={simplifiedExplanation} disableFormulaExplainer={true} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FormulaExplainer;