/**
 * ════════════════════════════════════════════════════════════════════════
 * UserProfile — Avatar + name + bio card (for "Add user profiles" demo).
 * ════════════════════════════════════════════════════════════════════════
 */
export interface UserProfileProps {
  name: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  role?: string;
  accentColor?: string;
}

export default function UserProfile({
  name,
  email,
  avatarUrl,
  bio,
  role,
  accentColor = "#6366f1",
}: UserProfileProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6 flex items-start gap-4 max-w-md">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-14 h-14 rounded-full object-cover shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          {initials}
        </div>
      )}
      <div>
        <h3 className="font-semibold text-white">{name}</h3>
        {role && (
          <p className="text-xs font-medium mt-0.5" style={{ color: accentColor }}>
            {role}
          </p>
        )}
        {email && <p className="text-xs text-gray-400 mt-0.5">{email}</p>}
        {bio && (
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">{bio}</p>
        )}
      </div>
    </div>
  );
}
