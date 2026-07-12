export default function ScoreSparkline({ history = [] }) {
  if (history.length < 2) return null;

  const width = 160;
  const height = 36;
  const padding = 4;
  const scores = history.map((point) => point.score);
  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);
  const range = max - min || 1;

  const coords = scores.map((score, index) => ({
    x: padding + (index / (scores.length - 1)) * (width - padding * 2),
    y: height - padding - ((score - min) / range) * (height - padding * 2)
  }));

  const pointsAttr = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const isUp = scores[scores.length - 1] >= scores[0];
  const toneClass = isUp ? "text-invest-600" : "text-pass-600";

  return (
    <div className={`mt-1.5 ${toneClass}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label="Score history across past searches"
      >
        <polyline
          points={pointsAttr}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={index === coords.length - 1 ? 3 : 1.75}
            fill="currentColor"
            opacity={index === coords.length - 1 ? 1 : 0.55}
          />
        ))}
      </svg>
    </div>
  );
}