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

function safe(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    return safe(o.label ?? o.title ?? o.text ?? o.name ?? "");
  }
  return String(val);
}

export default function UserProfile({
  name,
  email,
  avatarUrl,
  bio,
  role,
  accentColor = "#6366f1",
}: UserProfileProps) {
  const safeName = safe(name) || "User";
  const safeEmail = safe(email);
  const safeBio = safe(bio);
  const safeRole = safe(role);
  const safeAvatar = safe(avatarUrl);
  const initials = safeName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6 flex items-start gap-4 max-w-md">
      {safeAvatar ? (
        <img
          src={safeAvatar}
          alt={safeName}
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
        <h3 className="font-semibold text-white">{safeName}</h3>
        {safeRole && (
          <p className="text-xs font-medium mt-0.5" style={{ color: accentColor }}>
            {safeRole}
          </p>
        )}
        {safeEmail && <p className="text-xs text-gray-400 mt-0.5">{safeEmail}</p>}
        {safeBio && (
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">{safeBio}</p>
        )}
      </div>
    </div>
  );
}
