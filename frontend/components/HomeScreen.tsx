type HomeScreenProps = {
  comingSoonMessage: string;
  hasSavedSession: boolean;
  onStudentClick: () => void;
  onTeacherClick: () => void;
  onParentClick: () => void;
  onContinueSession: () => void;
};

export default function HomeScreen({
  comingSoonMessage,
  hasSavedSession,
  onStudentClick,
  onTeacherClick,
  onParentClick,
  onContinueSession,
}: HomeScreenProps) {
  return (
    <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-2xl">
      <h1 className="mb-4 text-5xl font-extrabold text-purple-700">
        MultiplyX 🎯
      </h1>
      <p className="mb-8 text-lg text-gray-700">
        Learn tables with speed, fun, and cool rewards.
      </p>

      <div className="flex flex-col gap-4">
        <button
          onClick={onStudentClick}
          className="rounded-2xl bg-purple-600 px-6 py-4 text-lg font-bold text-white hover:bg-purple-700"
        >
          I’m a Student
        </button>

        <button
          onClick={onTeacherClick}
          className="rounded-2xl bg-blue-500 px-6 py-4 text-lg font-bold text-white hover:bg-blue-600"
        >
          I’m a Teacher
        </button>

        <button
          onClick={onParentClick}
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

      {hasSavedSession && (
        <button
          onClick={onContinueSession}
          className="mt-6 rounded-2xl border-2 border-purple-300 px-6 py-3 text-sm font-bold text-purple-700 hover:bg-purple-50"
        >
          Continue previous session ↗
        </button>
      )}
    </div>
  );
}
