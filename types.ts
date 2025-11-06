
export enum ActionType {
  SUMMARY = 'Summary',
  NOTES = 'Notes',
  VIDEOS = 'Videos',
  QUESTIONS = 'Important Questions',
}

export interface VideoSuggestion {
  topic: string;
  title: string;
  description: string;
}
