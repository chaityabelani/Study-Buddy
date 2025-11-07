export enum ActionType {
  SUMMARY = 'Summary',
  NOTES = 'Notes',
  VIDEOS = 'Videos',
  QUESTIONS = 'Important Questions',
  EXAM_MODE = 'Exam Mode',
}

export interface VideoSuggestion {
  topic: string;
  title: string;
  description: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  reason: string;
}