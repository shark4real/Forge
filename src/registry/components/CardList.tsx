/**
 * ════════════════════════════════════════════════════════════════════════
 * CardList — A vertical or horizontal list of content cards.
 * ════════════════════════════════════════════════════════════════════════
 */
export interface CardItem {
  title: string;
  description?: string;
  badge?: string;
  imageUrl?: string;
  metadata?: string;
}

export interface CardListProps {
  heading?: string;
  cards: CardItem[];
  layout?: "vertical" | "horizontal" | "grid";
  accentColor?: string;
}

export default function CardList({
  heading,
  cards,
  layout = "vertical",
  accentColor = "#6366f1",
}: CardListProps) {
  const containerClass =
    layout === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      : layout === "horizontal"
        ? "flex gap-4 overflow-x-auto pb-2"
        : "flex flex-col gap-3";

  return (
    <section className="py-4">
      {heading && (
        <h2 className="text-xl font-bold text-white mb-4">{heading}</h2>
      )}
      <div className={containerClass}>
        {cards.map((card, i) => (
          <div
            key={i}
            className={`rounded-xl border border-gray-700/50 bg-gray-800/50 p-4 hover:border-gray-600 transition-colors ${
              layout === "horizontal" ? "min-w-[240px] shrink-0" : ""
            }`}
          >
            {card.imageUrl && (
              <div className="w-full h-32 rounded-lg bg-gray-700/50 mb-3 flex items-center justify-center text-gray-500 text-xs overflow-hidden">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-white text-sm">{card.title}</h3>
              {card.badge && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                  style={{
                    backgroundColor: `${accentColor}22`,
                    color: accentColor,
                  }}
                >
                  {card.badge}
                </span>
              )}
            </div>
            {card.description && (
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {card.description}
              </p>
            )}
            {card.metadata && (
              <p className="text-xs text-gray-500 mt-2">{card.metadata}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
