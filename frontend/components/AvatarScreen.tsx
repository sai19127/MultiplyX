type AvatarScreenProps = {
  avatars: string[];
  selectedAvatar: string;
  onAvatarSelect: (avatar: string) => void;
  onContinue: () => void;
};

export default function AvatarScreen({
  avatars,
  selectedAvatar,
  onAvatarSelect,
  onContinue,
}: AvatarScreenProps) {
  return (
    <div className="w-full max-w-2xl rounded-3xl bg-white p-10 shadow-2xl">
      <h2 className="mb-6 text-center text-4xl font-extrabold text-purple-700">
        Choose Your Avatar
      </h2>

      <div className="mb-8 grid grid-cols-3 gap-4">
        {avatars.map((avatar) => (
          <button
            key={avatar}
            onClick={() => onAvatarSelect(avatar)}
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
        onClick={onContinue}
        disabled={!selectedAvatar}
        className="w-full rounded-2xl bg-purple-600 px-6 py-4 text-lg font-bold text-white hover:bg-purple-700 disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
