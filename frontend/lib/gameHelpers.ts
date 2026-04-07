import type { AnswerStatus, NumpadKey } from "@/types/game";

export const avatars = ["🦁", "🐼", "🐯", "🦊", "🐸", "🐵"];

export const speedNames = [
  "Rocket Ray",
  "Flash Fox",
  "Turbo Tiger",
  "Speedy Panda",
  "Lightning Leo",
];

export const GARAGE_TIME_LIMIT = 60;
export const SESSION_STORAGE_KEY = "multiplyx-session";
export const QUESTION_API_URL = "http://127.0.0.1:5001/question";

export const NUMPAD_KEYS: NumpadKey[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "clear",
  "0",
  "submit",
];

export const getQuestionColorClass = (answerStatus: AnswerStatus) => {
  switch (answerStatus) {
    case "correct":
      return "text-green-600";
    case "wrong":
      return "text-red-600";
    case "timeout":
      return "text-orange-500";
    default:
      return "text-blue-700";
  }
};

export const getFeedbackPanelClass = (answerStatus: AnswerStatus) => {
  switch (answerStatus) {
    case "correct":
      return "bg-green-100 text-green-700";
    case "wrong":
      return "bg-red-100 text-red-700";
    case "timeout":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-yellow-100 text-gray-700";
  }
};

export const getQuestionAnimationClass = (answerStatus: AnswerStatus) => {
  switch (answerStatus) {
    case "correct":
      return "animate-answer-pop";
    case "wrong":
      return "animate-answer-shake";
    case "timeout":
      return "animate-answer-pulse";
    default:
      return "";
  }
};

export const getFeedbackAnimationClass = (answerStatus: AnswerStatus) => {
  switch (answerStatus) {
    case "correct":
      return "animate-feedback-success";
    case "wrong":
      return "animate-feedback-error";
    case "timeout":
      return "animate-feedback-timeout";
    default:
      return "";
  }
};
