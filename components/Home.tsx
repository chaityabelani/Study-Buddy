import React from 'react';
import { ArrowUpTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface HomeProps {
  onModeSelect: (mode: 'upload' | 'search') => void;
}

const Home: React.FC<HomeProps> = ({ onModeSelect }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl shadow-cyan-500/10">
      <h2 className="text-2xl font-semibold text-center mb-2 text-cyan-300">How would you like to start?</h2>
      <p className="text-center text-gray-400 mb-8">Choose an option below to begin your study session.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => onModeSelect('upload')}
          className="group flex flex-col items-center justify-center text-center p-8 rounded-lg border-2 border-gray-600 bg-gray-700/50 hover:border-cyan-500 hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
        >
          <ArrowUpTrayIcon className="h-12 w-12 mb-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
          <h3 className="font-semibold text-xl text-gray-200 group-hover:text-white">Upload Notes & Papers</h3>
          <p className="text-sm text-gray-400 mt-2">Analyze existing PDFs for summaries, video ideas, and important questions.</p>
        </button>
        <button
          onClick={() => onModeSelect('search')}
          className="group flex flex-col items-center justify-center text-center p-8 rounded-lg border-2 border-gray-600 bg-gray-700/50 hover:border-blue-500 hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
        >
          <MagnifyingGlassIcon className="h-12 w-12 mb-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
          <h3 className="font-semibold text-xl text-gray-200 group-hover:text-white">Explore a Topic</h3>
          <p className="text-sm text-gray-400 mt-2">Get detailed notes, summaries, and more for any B.Tech subject or topic.</p>
        </button>
      </div>
    </div>
  );
};

export default Home;
