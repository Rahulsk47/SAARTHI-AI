import { CORE_STATE_META, type CoreState } from '@/types/core';

interface BadgeProps {
  state: CoreState;
}

export default function StateBadge({ state }: BadgeProps) {
  const meta = CORE_STATE_META[state];
  return (
    <span
      className="chip border"
      style={{
        color: meta.color,
        borderColor: `${meta.color}55`,
        backgroundColor: `${meta.color}11`,
      }}
    >
      <span
        className="h-2 w-2 rounded-full animate-pulse-soft"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
}
