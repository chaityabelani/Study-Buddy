import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

interface TopicSearchProps {
  onTopicSearched: (topic: string) => void;
}

const TopicSearch: React.FC<TopicSearchProps> = ({ onTopicSearched }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onTopicSearched(topic.trim());
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl shadow-cyan-500/10">
      <h2 className="text-2xl font-semibold text-center mb-2 text-cyan-300">Explore a Topic</h2>
      <p className="text-center text-gray-400 mb-6">Enter an engineering topic, subject, or concept you want to learn about.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., 'Thermodynamics basics', 'Data Structures in C++'"
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors"
          required
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          disabled={!topic.trim()}
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
          <span>Analyze Topic</span>
        </button>
      </form>
    </div>
  );
};

export default TopicSearch;
