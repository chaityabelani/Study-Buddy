import React from 'react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';

interface VideoOptionsProps {
  channels: string;
  onChannelsChange: (value: string) => void;
  length: string;
  onLengthChange: (value: string) => void;
}

const VideoOptions: React.FC<VideoOptionsProps> = ({ channels, onChannelsChange, length, onLengthChange }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg shadow-purple-500/10">
      <div className="flex items-center gap-3 mb-4">
        <AdjustmentsHorizontalIcon className="h-7 w-7 text-purple-400" />
        <h3 className="text-xl font-semibold text-purple-300">Video Search Options (Optional)</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="channels" className="block text-sm font-medium text-gray-300 mb-2">
            Preferred YouTube Channels
          </label>
          <input
            id="channels"
            type="text"
            value={channels}
            onChange={(e) => onChannelsChange(e.target.value)}
            placeholder="e.g., NPTEL, 3Blue1Brown, freeCodeCamp"
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-colors"
          />
           <p className="text-xs text-gray-500 mt-1">Separate channel names with commas.</p>
        </div>
        <div>
          <label htmlFor="video-length" className="block text-sm font-medium text-gray-300 mb-2">
            Preferred Video Length
          </label>
          <select
            id="video-length"
            value={length}
            onChange={(e) => onLengthChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-colors"
          >
            <option value="any">Any Length</option>
            <option value="short">Short (&lt; 10 min)</option>
            <option value="medium">Medium (10-30 min)</option>
            <option value="long">Long (&gt; 30 min)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default VideoOptions;
