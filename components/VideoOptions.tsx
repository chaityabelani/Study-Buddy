
import React from 'react';
import { AdjustmentsHorizontalIcon, VideoCameraIcon } from '@heroicons/react/24/solid';

interface VideoOptionsProps {
  channels: string;
  onChannelsChange: (value: string) => void;
  length: string;
  onLengthChange: (value: string) => void;
  onFindVideos: () => void;
  isLoading: boolean;
}

const VideoOptions: React.FC<VideoOptionsProps> = ({ channels, onChannelsChange, length, onLengthChange, onFindVideos, isLoading }) => {
  return (
    <div className="bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg shadow-purple-500/10">
      <div className="flex items-center gap-3 mb-4">
        <AdjustmentsHorizontalIcon className="h-7 w-7 text-purple-600 dark:text-purple-400" />
        <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300">Video Search Options (Optional)</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="channels" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preferred YouTube Channels
          </label>
          <input
            id="channels"
            type="text"
            value={channels}
            onChange={(e) => onChannelsChange(e.target.value)}
            placeholder="e.g., NPTEL, 3Blue1Brown, freeCodeCamp"
            className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-colors"
          />
           <p className="text-xs text-gray-500 mt-1">Separate channel names with commas.</p>
        </div>
        <div>
          <label htmlFor="video-length" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preferred Video Length
          </label>
          <select
            id="video-length"
            value={length}
            onChange={(e) => onLengthChange(e.target.value)}
            className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-colors"
          >
            <option value="any">Any Length</option>
            <option value="short">Short (&lt; 10 min)</option>
            <option value="medium">Medium (10-30 min)</option>
            <option value="long">Long (&gt; 30 min)</option>
          </select>
        </div>
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={onFindVideos}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Finding...</span>
            </>
          ) : (
            <>
              <VideoCameraIcon className="h-5 w-5" />
              <span>Find Videos</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VideoOptions;