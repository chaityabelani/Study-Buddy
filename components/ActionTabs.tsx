import React from 'react';
import { ActionType } from '../types';
import { DocumentTextIcon, VideoCameraIcon, QuestionMarkCircleIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

interface ActionTabsProps {
  onSelectAction: (action: ActionType) => void;
  selectedAction: ActionType | null;
  hideNotes?: boolean;
}

const allActions = [
  { type: ActionType.SUMMARY, icon: ClipboardDocumentListIcon, description: "Get a quick summary of the key points." },
  { type: ActionType.NOTES, icon: DocumentTextIcon, description: "Generate detailed, structured notes." },
  { type: ActionType.VIDEOS, icon: VideoCameraIcon, description: "Find relevant video topic recommendations." },
  { type: ActionType.QUESTIONS, icon: QuestionMarkCircleIcon, description: "List common exam questions from the text." },
];

const ActionTabs: React.FC<ActionTabsProps> = ({ onSelectAction, selectedAction, hideNotes = false }) => {
  const actions = hideNotes ? allActions.filter(a => a.type !== ActionType.NOTES) : allActions;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map(({ type, icon: Icon, description }) => {
        const isSelected = selectedAction === type;
        return (
          <button
            key={type}
            onClick={() => onSelectAction(type)}
            className={`flex flex-col items-center justify-center text-center p-4 rounded-lg border-2 transition-all duration-300 transform hover:-translate-y-1 h-full ${
              isSelected
                ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-lg shadow-blue-500/20'
                : 'bg-gray-700/50 border-gray-600 hover:border-blue-500 hover:bg-gray-700'
            }`}
          >
            <Icon className="h-10 w-10 mb-3"/>
            <span className="font-semibold text-lg">{type}</span>
            <span className="text-sm text-gray-400 mt-1">{description}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ActionTabs;
