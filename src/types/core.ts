export type CoreState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'analyzing'
  | 'processing'
  | 'success'
  | 'error';

export const CORE_STATES: CoreState[] = [
  'idle',
  'listening',
  'thinking',
  'analyzing',
  'processing',
  'success',
  'error',
];

export const CORE_STATE_META: Record<
  CoreState,
  { label: string; color: string; glow: string; description: string }
> = {
  idle: { label: 'Idle', color: '#22d3ee', glow: '#22d3ee', description: 'Standing by' },
  listening: { label: 'Listening', color: '#67e8f9', glow: '#67e8f9', description: 'Capturing audio' },
  thinking: { label: 'Thinking', color: '#a78bfa', glow: '#a78bfa', description: 'Reasoning' },
  analyzing: { label: 'Analyzing', color: '#fbbf24', glow: '#fbbf24', description: 'Inspecting content' },
  processing: { label: 'Processing', color: '#f59e0b', glow: '#f59e0b', description: 'Transforming' },
  success: { label: 'Success', color: '#4ade80', glow: '#4ade80', description: 'Complete' },
  error: { label: 'Error', color: '#f87171', glow: '#f87171', description: 'Something went wrong' },
};
