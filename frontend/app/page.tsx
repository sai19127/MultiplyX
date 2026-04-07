"use client";
import { useCallback, useEffect, useState } from "react";
import AvatarScreen from "@/components/AvatarScreen";
import HomeScreen from "@/components/HomeScreen";
import LoginScreen from "@/components/LoginScreen";
import {
  avatars,
  GARAGE_TIME_LIMIT,
  getFeedbackAnimationClass,
  getFeedbackPanelClass,
  getQuestionAnimationClass,
  getQuestionColorClass,
  NUMPAD_KEYS,
  QUESTION_API_URL,
  SESSION_STORAGE_KEY,
  speedNames,
} from "@/lib/gameHelpers";
import type {
  AnswerStatus,
  NumpadKey,
  QuestionResponse,
  Screen,
  SessionState,
} from "@/types/game";

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
  const [bestStreak, setBestStreak] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
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
    setBestStreak(0);
    setCorrectAnswersCount(0);
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
      setCorrectAnswersCount((prev) => prev + 1);
      setStreak((prev) => {
        const nextStreak = prev + 1;
        setBestStreak((best) => Math.max(best, nextStreak));
        return nextStreak;
      });
      setAnswerStatus("correct");
      setFeedback("Correct! +10 score and +5 coins 🎉");
      void moveToNextQuestion(nextRound);
      return;
    }

    setStreak(0);
    setCoins((prev) => Math.max(0, prev - 2));
    setAnswerStatus("wrong");
    setFeedback(`Oops! The right answer is ${correctAnswer}. -2 coins ✨`);
    void moveToNextQuestion(nextRound);
  }, [
    correctAnswer,
    isAnswerLocked,
    moveToNextQuestion,
    questionsAnswered,
    round,
    userAnswer,
  ]);

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
        finishGame("Time round complete! Great speed practice 🚀");
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

  const handleNumpadPress = useCallback(
    (key: NumpadKey) => {
      if (isAnswerLocked) {
        return;
      }

      if (key === "submit") {
        checkAnswer();
        return;
      }

      setUserAnswer((prev) => {
      if (key === "clear") {
        return "";
      }

      return `${prev}${key}`;
    });
  },
  [checkAnswer, isAnswerLocked],
  );

  const speedMetric = (correctAnswersCount / 60).toFixed(2);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-yellow-200 to-pink-200 px-6 py-8">
      {screen === "home" && (
        <HomeScreen
          comingSoonMessage={comingSoonMessage}
          hasSavedSession={Boolean(studentName || selectedAvatar)}
          onStudentClick={() => {
            setComingSoonMessage("");
            setScreen("login");
          }}
          onTeacherClick={() => showComingSoon("Teacher")}
          onParentClick={() => showComingSoon("Parent")}
          onContinueSession={() => {
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
        />
      )}

      {screen === "login" && (
        <LoginScreen
          studentName={studentName}
          speedNames={speedNames}
          onStudentNameChange={setStudentName}
          onContinue={() => setScreen("avatar")}
        />
      )}

      {screen === "avatar" && (
        <AvatarScreen
          avatars={avatars}
          selectedAvatar={selectedAvatar}
          onAvatarSelect={setSelectedAvatar}
          onContinue={() => setScreen("mode")}
        />
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
        <div className="w-full max-w-sm rounded-[1.75rem] bg-white/95 p-4 text-center shadow-2xl ring-1 ring-white/70 backdrop-blur sm:max-w-2xl sm:p-6 md:max-w-3xl md:rounded-[2rem] md:p-8 xl:max-w-5xl xl:p-10">
          <div className="mb-4 text-xl font-bold text-gray-700 sm:mb-5 sm:text-2xl md:text-3xl">
            {studentName} {selectedAvatar}
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 text-xs font-bold sm:mb-6 sm:gap-3 sm:text-sm lg:grid-cols-3">
            <div className="rounded-2xl bg-purple-100 px-3 py-3 text-purple-700 shadow-sm sm:px-5 sm:py-4">
              Mode: {selectedMode}
            </div>
            <div className="rounded-2xl bg-blue-100 px-3 py-3 text-blue-700 shadow-sm sm:px-5 sm:py-4">
              Question: {round}
            </div>
            <div className="rounded-2xl bg-green-100 px-3 py-3 text-green-700 shadow-sm sm:px-5 sm:py-4">
              Score: {score}
            </div>
            <div className="rounded-2xl bg-yellow-100 px-3 py-3 text-yellow-700 shadow-sm sm:px-5 sm:py-4">
              Coins: {coins}
            </div>
            <div className="rounded-2xl bg-orange-100 px-3 py-3 text-orange-700 shadow-sm sm:px-5 sm:py-4">
              Streak: {streak}
            </div>
            {selectedMode === "Garage" && (
              <div className="col-span-2 rounded-2xl bg-red-100 px-3 py-3 text-red-700 shadow-sm sm:col-span-1 sm:px-5 sm:py-4">
                Time Left: {timeLeft}s
              </div>
            )}
          </div>

          <div className="mb-6 grid gap-3 sm:mb-8 sm:gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-indigo-50 px-4 py-4 text-left shadow-sm sm:px-5 sm:py-5 md:px-6">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
                Questions Played
              </div>
              <div className="mt-2 text-3xl font-extrabold text-indigo-700 sm:mt-3 sm:text-4xl">
                {questionsAnswered}
              </div>
            </div>
            <div className="rounded-3xl bg-pink-50 px-4 py-4 text-left shadow-sm sm:px-5 sm:py-5 md:px-6">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-pink-500">
                Current Question
              </div>
              <div className="mt-2 text-3xl font-extrabold text-pink-700 sm:mt-3 sm:text-4xl">
                {round}
              </div>
            </div>
          </div>

          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400 sm:mb-4 sm:text-xs md:text-sm">
            Next up: {nextQuestion?.question ?? "Loading..."}
          </div>

          <div className="mb-6 rounded-[1.75rem] bg-gradient-to-br from-sky-50 via-white to-fuchsia-50 px-3 py-4 shadow-inner sm:mb-8 sm:px-6 sm:py-6 md:rounded-[2rem] md:px-8 md:py-8 lg:px-10">
            <h2
              className={`mb-4 text-4xl font-extrabold leading-none sm:mb-5 sm:text-6xl md:mb-6 md:text-7xl lg:text-8xl ${getQuestionColorClass(answerStatus)} ${getQuestionAnimationClass(answerStatus)}`}
            >
              {question}
            </h2>

            <input
              type="number"
              disabled={isAnswerLocked}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                checkAnswer();
              }
            }}
            placeholder="Type your answer"
              className="mb-4 w-full rounded-3xl border-2 border-white bg-white/90 px-4 py-4 text-center text-2xl font-extrabold text-slate-800 shadow-sm outline-none focus:border-purple-400 sm:mb-5 sm:px-5 sm:py-5 sm:text-3xl md:px-6 md:py-6 md:text-4xl"
            />

            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400 sm:text-xs md:text-sm">
              Number Pad
            </div>

            <div className="mb-1 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              {NUMPAD_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={isAnswerLocked}
                  onClick={() => handleNumpadPress(key)}
                  className={`min-h-16 rounded-2xl px-2 py-3 text-xl font-extrabold shadow-md transition hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 sm:min-h-20 sm:rounded-3xl sm:px-4 sm:py-4 sm:text-2xl md:min-h-24 md:px-5 md:py-5 md:text-3xl ${
                    key === "submit"
                      ? "bg-green-500 text-white shadow-green-200"
                      : key === "clear"
                        ? "bg-amber-400 text-amber-950 shadow-amber-200"
                        : "bg-slate-100 text-slate-800 shadow-slate-200"
                  }`}
                >
                  {key === "clear"
                    ? "C"
                    : key === "submit"
                      ? "✓ Submit"
                      : key}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`min-h-[84px] rounded-3xl p-4 text-base font-semibold shadow-sm sm:min-h-[92px] sm:p-5 sm:text-lg md:p-6 md:text-xl ${getFeedbackPanelClass(answerStatus)} ${getFeedbackAnimationClass(answerStatus)}`}
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

          <div className="mb-5 rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 p-8 text-white shadow-lg">
            <div className="text-sm font-bold uppercase tracking-[0.25em] text-green-50">
              Speed
            </div>
            <div className="mt-3 text-6xl font-extrabold leading-none">
              {speedMetric}
            </div>
            <div className="mt-3 text-sm font-semibold text-green-50">
              correct answers per second
            </div>
          </div>

          <div className="mb-8 rounded-3xl bg-blue-50 p-6 text-blue-900 shadow-sm">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500">
              Correct Answers
            </div>
            <div className="mt-2 text-4xl font-extrabold">
              {correctAnswersCount}
            </div>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-yellow-100 p-5">
              <div className="text-sm font-bold text-yellow-700">Coins Earned</div>
              <div className="mt-2 text-3xl font-extrabold text-yellow-800">{coins}</div>
            </div>
            <div className="rounded-2xl bg-orange-100 p-5">
              <div className="text-sm font-bold text-orange-700">
                Questions Played
              </div>
              <div className="mt-2 text-3xl font-extrabold text-orange-800">
                {questionsAnswered}
              </div>
            </div>
            <div className="rounded-2xl bg-purple-100 p-5">
              <div className="text-sm font-bold text-purple-700">Best Streak</div>
              <div className="mt-2 text-3xl font-extrabold text-purple-800">
                {bestStreak}
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-2xl bg-purple-100 p-5 text-purple-700">
            <div className="text-sm font-bold uppercase tracking-wide">
              Mode Summary
              </div>
            <div className="mt-2 text-xl font-extrabold">{selectedMode}</div>
            <div className="mt-3 text-sm font-semibold text-purple-600">
              Score stays active during gameplay and finished at {score}.
            </div>
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
