export type Screen =
  | "home"
  | "login"
  | "avatar"
  | "mode"
  | "game"
  | "results";

export type QuestionResponse = {
  question: string;
  answer: number;
};

export type NumpadKey = `${number}` | "clear" | "submit";

export type AnswerStatus = "idle" | "correct" | "wrong" | "timeout";

export type SessionState = {
  studentName: string;
  selectedAvatar: string;
  selectedMode: string;
};
