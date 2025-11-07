
import React, { useState, useMemo } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon, AcademicCapIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

interface ExamModeDisplayProps {
  questions: QuizQuestion[];
}

const ExamModeDisplay: React.FC<ExamModeDisplayProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(Array(questions.length).fill(null));
  const [showAnswer, setShowAnswer] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = selectedAnswers[currentQuestionIndex];
  
  const quizFinished = currentQuestionIndex === questions.length;
  
  const score = useMemo(() => {
    return selectedAnswers.reduce((acc, selected, index) => {
      if (selected !== null && selected === questions[index].answer) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }, [selectedAnswers, questions]);

  const handleSelectOption = (option: string) => {
    if (selectedOption) return; // Prevent changing answer
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = option;
    setSelectedAnswers(newSelectedAnswers);
    setShowAnswer(true);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(Array(questions.length).fill(null));
    setShowAnswer(false);
  };

  if (quizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    let feedbackColor = 'text-green-500 dark:text-green-400';
    if (percentage < 75) feedbackColor = 'text-yellow-500 dark:text-yellow-400';
    if (percentage < 40) feedbackColor = 'text-red-500 dark:text-red-400';

    return (
      <div className="text-center p-2 sm:p-6 flex flex-col items-center justify-center w-full">
        <AcademicCapIcon className={`w-16 h-16 mb-4 ${feedbackColor}`} />
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Complete!</h3>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">You scored</p>
        <p className={`text-6xl font-bold mb-6 ${feedbackColor}`}>{score} / {questions.length}</p>

        <div className="w-full text-left mt-8 mb-8">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Review Your Answers</h4>
            <div className="space-y-6">
                {questions.map((q, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === q.answer;
                return (
                    <div key={index} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-400 bg-green-50 dark:border-green-600/70 dark:bg-gray-800/50' : 'border-red-400 bg-red-50 dark:border-red-600/70 dark:bg-gray-800/50'}`}>
                        <p className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-3">Q{index + 1}: {q.question}</p>
                        <p className={`flex items-center gap-2 mb-2 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isCorrect ? <CheckCircleIcon className="w-5 h-5 flex-shrink-0"/> : <XCircleIcon className="w-5 h-5 flex-shrink-0"/>}
                            Your answer: <span className="font-medium truncate">{userAnswer || "Not answered"}</span>
                        </p>
                        {!isCorrect && (
                            <p className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-2">
                                <InformationCircleIcon className="w-5 h-5 flex-shrink-0"/>
                                Correct answer: <span className="font-medium">{q.answer}</span>
                            </p>
                        )}
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm">Explanation:</p>
                            <p className="text-gray-700 dark:text-gray-300">{q.reason}</p>
                        </div>
                    </div>
                );
                })}
            </div>
        </div>

        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Try Again
        </button>
      </div>
    );
  }

  const getOptionClasses = (option: string) => {
    if (!showAnswer) {
      return 'bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600';
    }
    const isCorrect = option === currentQuestion.answer;
    const isSelected = option === selectedOption;

    if (isCorrect) {
      return 'bg-green-100 border-green-500 dark:bg-green-800/80';
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-100 border-red-500 dark:bg-red-800/80';
    }
    return 'bg-white dark:bg-gray-700 opacity-60';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-amber-600 dark:text-amber-300">Question {currentQuestionIndex + 1} of {questions.length}</h4>
        <div className="text-lg font-bold text-gray-800 dark:text-gray-200">Score: {score}</div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg mb-6">
        <p className="text-xl leading-relaxed text-gray-800 dark:text-gray-200">{currentQuestion.question}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelectOption(option)}
            disabled={showAnswer}
            className={`p-4 rounded-lg border-2 border-transparent text-left transition-all duration-300 ${getOptionClasses(option)}`}
          >
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                    {String.fromCharCode(65 + index)}
                </div>
                <span className="flex-grow text-gray-800 dark:text-gray-200 text-lg">{option}</span>
                {showAnswer && option === currentQuestion.answer && <CheckCircleIcon className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0" />}
                {showAnswer && selectedOption === option && option !== currentQuestion.answer && <XCircleIcon className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0" />}
            </div>
          </button>
        ))}
      </div>

      {showAnswer && (
        <>
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-900/70 rounded-lg border border-amber-400/50 dark:border-amber-500/50">
                <p className="text-amber-600 dark:text-amber-400 font-semibold mb-2">Explanation:</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentQuestion.reason}</p>
            </div>
            <div className="text-center mt-6">
                <button 
                    onClick={handleNext}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
                >
                    {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
            </div>
        </>
      )}
    </div>
  );
};

export default ExamModeDisplay;