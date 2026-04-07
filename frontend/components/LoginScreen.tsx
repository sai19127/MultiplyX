type LoginScreenProps = {
  studentName: string;
  speedNames: string[];
  onStudentNameChange: (value: string) => void;
  onContinue: () => void;
};

export default function LoginScreen({
  studentName,
  speedNames,
  onStudentNameChange,
  onContinue,
}: LoginScreenProps) {
  return (
    <div className="w-full max-w-xl rounded-3xl bg-white p-10 shadow-2xl">
      <h2 className="mb-6 text-center text-4xl font-extrabold text-purple-700">
        Student Login
      </h2>

      <label className="mb-2 block text-lg font-semibold text-gray-700">
        Pick your speed name
      </label>
      <select
        value={studentName}
        onChange={(e) => onStudentNameChange(e.target.value)}
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
        onClick={onContinue}
        disabled={!studentName}
        className="w-full rounded-2xl bg-purple-600 px-6 py-4 text-lg font-bold text-white hover:bg-purple-700 disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
