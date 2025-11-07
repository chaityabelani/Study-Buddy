
import React from 'react';
import { ActionType } from '../types';
import { DocumentTextIcon, VideoCameraIcon, QuestionMarkCircleIcon, ClipboardDocumentListIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface ActionTabsProps {
  onSelectAction: (action: ActionType) => void;
  selectedAction: ActionType | null;
  hideNotes?: boolean;
}

const allActions = [
  { type: ActionType.SUMMARY, icon: ClipboardDocumentListIcon, description: "Get a quick summary of the key points.", color: 'blue' },
  { type: ActionType.NOTES, icon: DocumentTextIcon, description: "Generate detailed, structured notes.", color: 'blue' },
  { type: ActionType.EXAM_MODE, icon: PencilSquareIcon, description: "Test your knowledge with a mock quiz.", color: 'amber' },
  { type: ActionType.VIDEOS, icon: VideoCameraIcon, description: "Find relevant video topic recommendations.", color: 'blue' },
  { type: ActionType.QUESTIONS, icon: QuestionMarkCircleIcon, description: "List common exam questions from the text.", color: 'blue' },
];

const ActionTabs: React.FC<ActionTabsProps> = ({ onSelectAction, selectedAction, hideNotes = false }) => {
  const actions = hideNotes ? allActions.filter(a => a.type !== ActionType.NOTES) : allActions;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {actions.map(({ type, icon: Icon, description, color }) => {
        const isSelected = selectedAction === type;
        
        const colorClasses = {
          blue: {
            selected: 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-500/20 dark:border-blue-400 dark:text-blue-300 shadow-lg shadow-blue-500/20',
            default: 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:bg-gray-700/50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-gray-700'
          },
          amber: {
            selected: 'bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-500/20 dark:border-amber-400 dark:text-amber-300 shadow-lg shadow-amber-500/20',
            default: 'bg-white border-gray-300 hover:border-amber-500 hover:bg-amber-50 dark:bg-gray-700/50 dark:border-gray-600 dark:hover:border-amber-500 dark:hover:bg-gray-700'
          }
        };

        const currentTheme = color === 'amber' ? colorClasses.amber : colorClasses.blue;

        return (
          <button
            key={type}
            onClick={() => onSelectAction(type)}
            className={`flex flex-col items-center justify-center text-center p-4 rounded-lg border-2 transition-all duration-300 transform hover:-translate-y-1 h-full ${
              isSelected
                ? currentTheme.selected
                : currentTheme.default
            }`}
          >
            <Icon className="h-10 w-10 mb-3"/>
            <span className="font-semibold text-lg">{type}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ActionTabs;