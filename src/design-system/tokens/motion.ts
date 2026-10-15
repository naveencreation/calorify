export interface SpringConfig {
  damping: number;
  stiffness: number;
  mass: number;
}

export const springs = {
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },
  gentle: {
    damping: 28,
    stiffness: 180,
    mass: 1,
  },
  bouncy: {
    damping: 12,
    stiffness: 200,
    mass: 1,
  },
} as const satisfies Record<string, SpringConfig>;

export const durations = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

export const motion = {
  springs,
  durations,
} as const;

export type SpringPreset = keyof typeof springs;
export type DurationPreset = keyof typeof durations;
export type Motion = typeof motion;
