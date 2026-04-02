"use client";
import { useCallback, useEffect, useState } from "react";

type Screen =
  | "home"
  | "login"
  | "avatar"
  | "mode"
  | "game"
  | "results";

type QuestionResponse = {
  question: string;
  answer: number;
};

type NumpadKey = `${number}` | "clear" | "next";

type AnswerStatus = "idle" | "correct" | "wrong" | "timeout";

type SessionState = {
  studentName: string;
  selectedAvatar: string;
  selectedMode: string;
};

const avatars = ["🦁", "🐼", "🐯", "🦊", "🐸", "🐵"];
const speedNames = [
  "Rocket Ray",
  "Flash Fox",
  "Turbo Tiger",
  "Speedy Panda",
  "Lightning Leo",
];
const GARAGE_TIME_LIMIT = 60;
const SESSION_STORAGE_KEY = "multiplyx-session";
const QUESTION_API_URL = "http://127.0.0.1:5001/question";
const NUMPAD_KEYS: NumpadKey[] = [
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
  "next",
];

const getQuestionColorClass = (answerStatus: AnswerStatus) => {
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

const getFeedbackPanelClass = (answerStatus: AnswerStatus) => {
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

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [studentName, setStudentName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [nextQuestion, setNextQuestion] = useState<QuestionResponse | null>(
    null,
  );
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(GARAGE_TIME_LIMIT);
  const [round, setRound] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>("idle");
  const [comingSoonMessage, setComingSoonMessage] = useState("");
  const [hasLoadedSession, setHasLoadedSession] = useState(false);

  const resetGameStats = () => {
    setScore(0);
    setCoins(0);
    setStreak(0);
    setFeedback("");
    setTimeLeft(GARAGE_TIME_LIMIT);
    setRound(1);
    setQuestionsAnswered(0);
    setUserAnswer("");
    setQuestion("");
    setCorrectAnswer(null);
    setNextQuestion(null);
    setIsAnswerLocked(false);
    setAnswerStatus("idle");
  };

  const resetPlayerSession = () => {
    resetGameStats();
    setStudentName("");
    setSelectedAvatar("");
    setSelectedMode("");
    setComingSoonMessage("");
    setScreen("home");
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const finishGame = (finalFeedback: string) => {
    setFeedback(finalFeedback);
    setScreen("results");
  };

  const showComingSoon = (role: "Teacher" | "Parent") => {
    setComingSoonMessage(
      `${role} mode is coming soon. We’ll add dashboards and controls in the next phase ✨`,
    );
  };

  const fetchQuestion = useCallback(async () => {
    const res = await fetch(QUESTION_API_URL);
    const data: QuestionResponse = await res.json();

    return data;
  }, []);

  const preloadUpcomingQuestion = useCallback(async () => {
    const data = await fetchQuestion();
    setNextQuestion(data);
  }, [fetchQuestion]);

  const showQuestion = useCallback(
    async (currentQuestion: QuestionResponse) => {
      setQuestion(currentQuestion.question);
      setCorrectAnswer(currentQuestion.answer);
      setUserAnswer("");
      setFeedback("");
      setIsAnswerLocked(false);
      setAnswerStatus("idle");
      setScreen("game");

      void preloadUpcomingQuestion();
    },
    [preloadUpcomingQuestion],
  );

  const getQuestion = useCallback(async () => {
    const data = await fetchQuestion();
    await showQuestion(data);
  }, [fetchQuestion, showQuestion]);

  const moveToNextQuestion = useCallback(
    async (nextRound: number) => {
      setRound(nextRound);

      if (nextQuestion) {
        const queuedQuestion = nextQuestion;
        setNextQuestion(null);
        await showQuestion(queuedQuestion);
        return;
      }

      await getQuestion();
    },
    [getQuestion, nextQuestion, showQuestion],
  );

  const finishOrAdvance = (nextAnsweredCount: number, nextRound: number) => {
    void moveToNextQuestion(nextRound);
  };

  const checkAnswer = useCallback(() => {
    if (
      correctAnswer === null ||
      userAnswer.trim() === "" ||
      isAnswerLocked
    ) {
      return;
    }

    const numericAnswer = Number(userAnswer);
    const nextAnsweredCount = questionsAnswered + 1;
    const nextRound = round + 1;

    setQuestionsAnswered(nextAnsweredCount);
    setIsAnswerLocked(true);

    if (numericAnswer === correctAnswer) {
      setScore((prev) => prev + 10);
      setCoins((prev) => prev + 5);
      setStreak((prev) => prev + 1);
      setAnswerStatus("correct");
      setFeedback("Correct! +10 score and +5 coins 🎉");

      window.setTimeout(() => {
        void moveToNextQuestion(nextRound);
      }, 900);
      return;
    }

    setStreak(0);
    setCoins((prev) => Math.max(0, prev - 2));
    setAnswerStatus("wrong");
    setFeedback(`Oops! The right answer is ${correctAnswer}. -2 coins ✨`);

    window.setTimeout(() => {
      void moveToNextQuestion(nextRound);
    }, 900);
  }, [
    correctAnswer,
    isAnswerLocked,
    moveToNextQuestion,
    questionsAnswered,
    round,
    userAnswer,
  ]);

  const handleSkipQuestion = () => {
    const nextAnsweredCount = questionsAnswered + 1;
    const nextRound = round + 1;

    setQuestionsAnswered(nextAnsweredCount);
    setStreak(0);
    finishOrAdvance(nextAnsweredCount, nextRound);
  };

  useEffect(() => {
    const restoreSessionId = window.setTimeout(() => {
      const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

      if (!rawSession) {
        setHasLoadedSession(true);
        return;
      }

      try {
        const parsedSession = JSON.parse(rawSession) as SessionState;
        setStudentName(parsedSession.studentName ?? "");
        setSelectedAvatar(parsedSession.selectedAvatar ?? "");
        setSelectedMode(parsedSession.selectedMode ?? "");
      } catch {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        setHasLoadedSession(true);
      }
    }, 0);

    return () => window.clearTimeout(restoreSessionId);
  }, []);

  useEffect(() => {
    if (!hasLoadedSession) {
      return;
    }

    const sessionToPersist: SessionState = {
      studentName,
      selectedAvatar,
      selectedMode,
    };

    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(sessionToPersist),
    );
  }, [hasLoadedSession, studentName, selectedAvatar, selectedMode]);

  useEffect(() => {
    if (screen !== "game" || selectedMode !== "Garage" || isAnswerLocked) {
      return;
    }

    if (timeLeft <= 0) {
      const timeoutId = window.setTimeout(() => {
        setIsAnswerLocked(true);
        setAnswerStatus("timeout");
        setFeedback("Time’s up! Garage round complete ⏰");

        window.setTimeout(() => {
          finishGame("Time round complete! Great speed practice 🚀");
        }, 900);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [
    screen,
    selectedMode,
    isAnswerLocked,
    timeLeft,
  ]);

  const handleNumpadPress = (key: NumpadKey) => {
    if (isAnswerLocked) {
      return;
    }

    if (key === "next") {
      handleSkipQuestion();
      return;
    }

    setUserAnswer((prev) => {
      if (key === "clear") {
        return "";
      }

      return `${prev}${key}`;
    });
  };

  useEffect(() => {
    if (
      screen !== "game" ||
      correctAnswer === null ||
      isAnswerLocked ||
      userAnswer.trim() === ""
    ) {
      return;
    }

    if (userAnswer.trim().length < String(correctAnswer).length) {
      return;
    }

    checkAnswer();
  }, [screen, correctAnswer, isAnswerLocked, userAnswer, checkAnswer]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-yellow-200 to-pink-200 px-6 py-8">
      {screen === "home" && (
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-2xl">
          <h1 className="mb-4 text-5xl font-extrabold text-purple-700">
            MultiplyX 🎯
          </h1>
          <p className="mb-8 text-lg text-gray-700">
            Learn tables with speed, fun, and cool rewards.
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                setComingSoonMessage("");
                setScreen("login");
              }}
              className="rounded-2xl bg-purple-600 px-6 py-4 text-lg font-bold text-white hover:bg-purple-700"
            >
              I’m a Student
            </button>

            <button
              onClick={() => showComingSoon("Teacher")}
              className="rounded-2xl bg-blue-500 px-6 py-4 text-lg font-bold text-white hover:bg-blue-600"
            >
              I’m a Teacher
            </button>

            <button
              onClick={() => showComingSoon("Parent")}
              className="rounded-2xl bg-green-500 px-6 py-4 text-lg font-bold text-white hover:bg-green-600"
            >
              I’m a Parent
            </button>
          </div>

          {comingSoonMessage && (
            <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">
              {comingSoonMessage}
            </div>
          )}

          {(studentName || selectedAvatar) && (
            <button
              onClick={() => {
                setComingSoonMessage("");
                if (!studentName) {
                  setScreen("login");
                  return;
                }
                if (!selectedAvatar) {
                  setScreen("avatar");
                  return;
                }
                setScreen("mode");
              }}
              className="mt-6 rounded-2xl border-2 border-purple-300 px-6 py-3 text-sm font-bold text-purple-700 hover:bg-purple-50"
            >
              Continue previous session ↗
            </button>
          )}
        </div>
      )}

      {screen === "login" && (
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 shadow-2xl">
          <h2 className="mb-6 text-center text-4xl font-extrabold text-purple-700">
            Student Login
          </h2>

          <label className="mb-2 block text-lg font-semibold text-gray-700">
            Pick your speed name
          </label>
          <select
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="mb-6 w-full rounded-xl border border-gray-300 p-4 text-lg"
          >
            <option value="">Select a cool name</option>
            {speedNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setScreen("avatar")}
            disabled={!studentName}
            className="w-full rounded-2xl bg-purple-600 px-6 py-4 text-lg font-bold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {screen === "avatar" && (
        <div className="w-full max-w-2xl rounded-3xl bg-white p-10 shadow-2xl">
          <h2 className="mb-6 text-center text-4xl font-extrabold text-purple-700">
            Choose Your Avatar
          </h2>

          <div className="mb-8 grid grid-cols-3 gap-4">
            {avatars.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setSelectedAvatar(avatar)}
                className={`rounded-2xl p-6 text-5xl shadow ${
                  selectedAvatar === avatar
                    ? "bg-purple-200 ring-4 ring-purple-500"
                    : "bg-yellow-100"
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>

          <button
            onClick={() => setScreen("mode")}
            disabled={!selectedAvatar}
            className="w-full rounded-2xl bg-purple-600 px-6 py-4 text-lg font-bold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {screen === "mode" && (
        <div className="w-full max-w-2xl rounded-3xl bg-white p-10 text-center shadow-2xl">
          <h2 className="mb-3 text-4xl font-extrabold text-purple-700">
            Hi {studentName} {selectedAvatar}
          </h2>
          <p className="mb-8 text-lg text-gray-700">Choose your play mode</p>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => {
                resetGameStats();
                setSelectedMode("Garage");
                void getQuestion();
              }}
              className="rounded-2xl bg-orange-400 px-6 py-8 text-2xl font-extrabold text-white hover:bg-orange-500"
            >
              Garage ⚡
              <div className="mt-2 text-sm font-medium">
                Timed quick-fire practice
              </div>
            </button>

            <button
              onClick={() => {
                resetGameStats();
                setSelectedMode("Jamming");
                void getQuestion();
              }}
              className="rounded-2xl bg-blue-500 px-6 py-8 text-2xl font-extrabold text-white hover:bg-blue-600"
            >
              Jamming 🎵
              <div className="mt-2 text-sm font-medium">
                Relaxed untimed practice
              </div>
            </button>
          </div>
        </div>
      )}

      {screen === "game" && (
        <div className="w-full max-w-2xl rounded-3xl bg-white p-10 text-center shadow-2xl">
          <div className="mb-3 text-xl font-bold text-gray-700">
            {studentName} {selectedAvatar}
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-sm font-bold">
            <div className="rounded-full bg-purple-100 px-4 py-2 text-purple-700">
              Mode: {selectedMode}
            </div>
            <div className="rounded-full bg-blue-100 px-4 py-2 text-blue-700">
              Question: {round}
            </div>
            <div className="rounded-full bg-green-100 px-4 py-2 text-green-700">
              Score: {score}
            </div>
            <div className="rounded-full bg-yellow-100 px-4 py-2 text-yellow-700">
              Coins: {coins}
            </div>
            <div className="rounded-full bg-orange-100 px-4 py-2 text-orange-700">
              Streak: {streak}
            </div>
            {selectedMode === "Garage" && (
              <div className="rounded-full bg-red-100 px-4 py-2 text-red-700">
                Time Left: {timeLeft}s
              </div>
            )}
          </div>

          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-indigo-50 px-5 py-4 text-left">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
                Questions Played
              </div>
              <div className="mt-2 text-3xl font-extrabold text-indigo-700">
                {questionsAnswered}
              </div>
            </div>
            <div className="rounded-2xl bg-pink-50 px-5 py-4 text-left">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-pink-500">
                Current Question
              </div>
              <div className="mt-2 text-3xl font-extrabold text-pink-700">
                {round}
              </div>
            </div>
          </div>

          <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
            Next up: {nextQuestion?.question ?? "Loading..."}
          </div>

          <h2
            className={`mb-8 text-5xl font-extrabold ${getQuestionColorClass(answerStatus)}`}
          >
            {question}
          </h2>

          <input
            type="number"
            disabled={isAnswerLocked}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer"
            className="mb-4 w-full rounded-2xl border border-gray-300 p-4 text-center text-2xl font-bold outline-none focus:border-purple-500"
          />

          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Number Pad
          </div>

          <div className="mb-6 grid grid-cols-3 gap-3">
            {NUMPAD_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                disabled={isAnswerLocked}
                onClick={() => handleNumpadPress(key)}
                className={`rounded-2xl px-4 py-4 text-xl font-extrabold shadow-sm transition hover:scale-[1.01] disabled:opacity-50 ${
                  key === "clear" || key === "next"
                    ? "bg-gray-200 text-gray-700"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {key === "clear" ? "Clear" : key === "next" ? "Next" : key}
              </button>
            ))}
          </div>

          <div
            className={`min-h-[64px] rounded-2xl p-4 text-lg font-semibold ${getFeedbackPanelClass(answerStatus)}`}
          >
            {feedback || "Give it your best shot! 🌟"}
          </div>
        </div>
      )}

      {screen === "results" && (
        <div className="w-full max-w-2xl rounded-3xl bg-white p-10 text-center shadow-2xl">
          <h2 className="mb-3 text-4xl font-extrabold text-purple-700">
            Great Job, {studentName} {selectedAvatar}!
          </h2>
          <p className="mb-8 text-lg text-gray-700">{feedback}</p>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-green-100 p-6">
              <div className="text-sm font-bold text-green-700">Final Score</div>
              <div className="mt-2 text-3xl font-extrabold text-green-800">{score}</div>
            </div>
            <div className="rounded-2xl bg-yellow-100 p-6">
              <div className="text-sm font-bold text-yellow-700">Coins Earned</div>
              <div className="mt-2 text-3xl font-extrabold text-yellow-800">{coins}</div>
            </div>
            <div className="rounded-2xl bg-orange-100 p-6">
              <div className="text-sm font-bold text-orange-700">
                Questions Played
              </div>
              <div className="mt-2 text-3xl font-extrabold text-orange-800">
                {questionsAnswered}
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-2xl bg-purple-100 p-5 text-purple-700">
            <div className="text-sm font-bold uppercase tracking-wide">
              Mode Summary
            </div>
            <div className="mt-2 text-xl font-extrabold">{selectedMode}</div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => {
                resetGameStats();
                setScreen("mode");
              }}
              className="rounded-2xl bg-purple-600 px-6 py-4 text-lg font-bold text-white hover:bg-purple-700"
            >
              Play Again 🔁
            </button>

            <button
              onClick={resetPlayerSession}
              className="rounded-2xl bg-blue-500 px-6 py-4 text-lg font-bold text-white hover:bg-blue-600"
            >
              Back to Home 🏠
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
